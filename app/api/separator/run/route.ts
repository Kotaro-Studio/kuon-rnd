export const runtime = 'edge';

/**
 * KUON SEPARATOR — Replicate prediction 作成 (R2 直アップロード版)
 *
 * フロー:
 *   1. ブラウザは事前に /api/separator/upload で R2 にファイルアップロード済み
 *   2. このエンドポイントは fileKey (R2 内のキー) を JSON で受け取る
 *   3. R2 公開 URL を組み立てて、Replicate Demucs に prediction 作成リクエスト
 *   4. prediction_id を即返却（クライアントは /status/{id} でポーリング）
 *
 * Pages Function はファイル本体に一切触れない (数 KB の JSON 通信のみ)。
 * → メモリ・wall time の制約を完全に回避。
 *
 * 必要な環境変数:
 *   - REPLICATE_API_TOKEN  : Replicate の API トークン (r8_...)
 *   - R2_PUBLIC_BASE_URL   : R2 バケットの公開 URL (https://pub-xxx.r2.dev)
 */

const AUTH_WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';
const APP_NAME = 'separator';
const REPLICATE_API_BASE = 'https://api.replicate.com/v1';

// Demucs モデル: ryan5453/demucs (現在メンテされている Demucs v4 実装・GPU A100・~32秒)
// 2026-04-27 重要発見: /v1/models/{owner}/{name}/predictions は **公式モデル専用** エンドポイント。
// コミュニティモデルでは 404 が返る。代わりに /v1/predictions に version ハッシュを渡す形式を使う。
// version ハッシュは Replicate のモデルページ → "Versions" タブから取得。
// 失効したら更新が必要。
const REPLICATE_MODEL_VERSION = 'b26a4313b4d75983d60657f80dfa93b9beb354f6e4fa29ecd27ffe14d60117f6';

function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

function randomJobId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    return await handleRun(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    // eslint-disable-next-line no-console
    console.error('[separator/run] uncaught', message, stack);
    return Response.json(
      {
        error: 'internal_error',
        detail: `内部エラー: ${message}`,
        debug_stack: stack ? stack.slice(0, 500) : undefined,
      },
      { status: 500 }
    );
  }
}

async function handleRun(request: Request): Promise<Response> {
  // ── 認証 ──
  const token = getCookie(request, 'kuon_token');
  if (!token) {
    return Response.json({ error: 'auth_required' }, { status: 401 });
  }

  // ── 環境変数 ──
  const env = (request as unknown as { env?: Record<string, string> }).env
    || (globalThis as unknown as { process?: { env: Record<string, string> } }).process?.env
    || {};
  const replicateToken = env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN;
  const r2PublicBase = env.R2_PUBLIC_BASE_URL || process.env.R2_PUBLIC_BASE_URL;

  if (!replicateToken) {
    return Response.json(
      { error: 'service_unavailable', detail: 'REPLICATE_API_TOKEN not configured' },
      { status: 503 }
    );
  }
  if (!r2PublicBase) {
    return Response.json(
      { error: 'service_unavailable', detail: 'R2_PUBLIC_BASE_URL not configured' },
      { status: 503 }
    );
  }

  // ── JSON ボディ解析 ──
  let body: { fileKey?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const fileKey = body.fileKey;
  if (!fileKey || typeof fileKey !== 'string') {
    return Response.json({ error: 'missing_file_key' }, { status: 400 });
  }
  // セキュリティ: fileKey は incoming/ プレフィックスのみ許可（任意のキーを参照させない）
  if (!fileKey.startsWith('incoming/')) {
    return Response.json({ error: 'invalid_file_key' }, { status: 400 });
  }

  // R2 公開 URL を組み立て
  const audioUrl = `${r2PublicBase.replace(/\/$/, '')}/${fileKey}`;

  // ── DIAG: ログ ──
  // eslint-disable-next-line no-console
  console.log('[separator/run] step=audio_url_built', { audioUrl, fileKey });

  // ── クォータ消費 (原子的) ──
  const consumeRes = await fetch(`${AUTH_WORKER_BASE}/api/auth/quota/consume`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ app: APP_NAME }),
  });

  if (consumeRes.status === 429) {
    const quotaInfo = await consumeRes.json();
    return Response.json(quotaInfo, { status: 429 });
  }
  if (!consumeRes.ok) {
    const errBody = await consumeRes.json().catch(() => ({ error: 'quota_check_failed' }));
    return Response.json(errBody, { status: consumeRes.status });
  }

  const quota = await consumeRes.json() as {
    plan: string;
    used: number;
    limit: number;
    remaining: number;
  };

  // ── Replicate に prediction 作成リクエスト ──
  const jobId = randomJobId();
  let predictionId: string;
  let predictionStatus: string;

  // ── DIAG: ログ ──
  // eslint-disable-next-line no-console
  console.log('[separator/run] step=before_replicate_fetch', { version: REPLICATE_MODEL_VERSION.slice(0, 12) });

  try {
    // タイムアウト 25 秒 (Cloudflare のリクエスト wall time 30 秒に間に合うように)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    // コミュニティモデル用 endpoint (/v1/predictions + version field)
    // /v1/models/{owner}/{name}/predictions は公式モデル専用なので 404 が返る
    const predRes = await fetch(
      `${REPLICATE_API_BASE}/predictions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${replicateToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: REPLICATE_MODEL_VERSION,
          input: {
            audio: audioUrl,
            // ryan5453/demucs の input schema: stems, model, shifts 等
            // モデルは htdemucs (Demucs v4 hybrid transformer)
            stems: 'vocals_drums_bass_other',
            shifts: 1,
          },
        }),
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    // eslint-disable-next-line no-console
    console.log('[separator/run] step=after_replicate_fetch', { status: predRes.status });

    if (!predRes.ok) {
      const errText = await predRes.text().catch(() => '');
      // eslint-disable-next-line no-console
      console.error('[separator/run] replicate_error', { status: predRes.status, body: errText.slice(0, 500) });
      await refundQuota(token).catch(() => void 0);
      return Response.json(
        {
          error: 'prediction_create_failed',
          detail: `Replicate (${predRes.status}): ${errText.slice(0, 300)}`,
        },
        { status: 502 }
      );
    }

    const predData = await predRes.json() as { id: string; status: string };
    predictionId = predData.id;
    predictionStatus = predData.status;

    // eslint-disable-next-line no-console
    console.log('[separator/run] step=prediction_created', { predictionId, predictionStatus });
  } catch (e) {
    const errStr = String(e);
    // eslint-disable-next-line no-console
    console.error('[separator/run] step=replicate_exception', { error: errStr });
    await refundQuota(token).catch(() => void 0);
    return Response.json(
      {
        error: 'service_unreachable',
        detail: errStr.includes('aborted') || errStr.includes('AbortError')
          ? `Replicate がタイムアウト (25秒) しました。R2 公開URL (${audioUrl.slice(0, 80)}...) を取得できなかった可能性が高い。`
          : `Replicate ネットワークエラー: ${errStr.slice(0, 200)}`,
      },
      { status: 502 }
    );
  }

  return Response.json({
    jobId,
    predictionId,
    status: predictionStatus,
    audioUrl,  // デバッグ用: クライアント側で R2 URL を確認できる
    quota: {
      plan: quota.plan,
      used: quota.used,
      limit: quota.limit,
      remaining: quota.remaining,
    },
  });
}

async function refundQuota(token: string): Promise<void> {
  await fetch(`${AUTH_WORKER_BASE}/api/auth/quota/refund`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ app: APP_NAME }),
  });
}
