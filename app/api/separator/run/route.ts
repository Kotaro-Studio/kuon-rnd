export const runtime = 'edge';

/**
 * KUON SEPARATOR — Next.js プロキシ (Replicate API 版)
 *
 * フロー:
 *   1. Cookie から JWT を取り出し Auth Worker で検証
 *   2. Auth Worker の /api/auth/quota/consume で原子的にクォータ消費
 *   3. ユーザーアップロードのオーディオを Replicate Files API にアップロード
 *   4. Replicate の Demucs モデルに prediction 作成リクエスト
 *   5. 即座に prediction_id をクライアントに返す（待たない）
 *   6. クライアント側は /api/separator/status/{id} をポーリングして完了を待つ
 *   7. Cloud Run 自前運用に比べ 10 倍速 + 99%+ 信頼性
 *
 * 必要な環境変数（Cloudflare Pages secrets）:
 *   - REPLICATE_API_TOKEN : `r8_...` で始まる Replicate の API トークン
 *
 * 失敗時はクォータを返金（refund）する。
 */

const AUTH_WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';
const APP_NAME = 'separator';
const REPLICATE_API_BASE = 'https://api.replicate.com/v1';

// Demucs モデル (Replicate 上で最も枯れていて実績のある cjwbw/demucs を採用)
// owner/name 形式で latest version を自動使用 (バージョンハッシュを手書きしなくて良い)
const REPLICATE_MODEL_OWNER = 'cjwbw';
const REPLICATE_MODEL_NAME = 'demucs';

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
  // ── 全体を try/catch で囲み、何が起きても JSON を返す ──
  // これにより「エラー: unknown」(= 非 JSON 応答) を根絶し、
  // 失敗箇所が即座に画面に表示されるようにする。
  try {
    return await handlePOST(request);
  } catch (err) {
    // 任意の同期/非同期エラーをキャッチ
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('[separator/run] uncaught', message, stack);
    return Response.json(
      {
        error: 'internal_error',
        detail: `内部エラー: ${message}`,
        // スタックトレースの先頭 500 文字（デバッグ容易化）
        debug_stack: stack ? stack.slice(0, 500) : undefined,
      },
      { status: 500 }
    );
  }
}

async function handlePOST(request: Request): Promise<Response> {
  const token = getCookie(request, 'kuon_token');
  if (!token) {
    return Response.json({ error: 'auth_required' }, { status: 401 });
  }

  // Cloudflare Pages の env 取得（Edge runtime 用の二段フォールバック）
  const env = (request as unknown as { env?: Record<string, string> }).env
    || (globalThis as unknown as { process?: { env: Record<string, string> } }).process?.env
    || {};
  const replicateToken = env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN;

  if (!replicateToken) {
    return Response.json(
      { error: 'service_unavailable', detail: 'REPLICATE_API_TOKEN not configured' },
      { status: 503 }
    );
  }

  // ── Step 1: クォータ消費（原子的） ──
  const consumeRes = await fetch(`${AUTH_WORKER_BASE}/api/auth/quota/consume`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ app: APP_NAME }),
  });

  if (consumeRes.status === 429) {
    // クォータ超過 — アップグレード案内を含むペイロードをそのまま返す
    const quotaInfo = await consumeRes.json();
    return Response.json(quotaInfo, { status: 429 });
  }

  if (!consumeRes.ok) {
    const errBody = await consumeRes.json().catch(() => ({ error: 'quota_check_failed' }));
    return Response.json(errBody, { status: consumeRes.status });
  }

  const quota = await consumeRes.json() as {
    ok: boolean;
    plan: string;
    used: number;
    limit: number;
    remaining: number;
  };

  // ── Step 2: Content-Type / Content-Length 検証 ──
  // 大事: request.formData() は本体をメモリに全部バッファするため、Cloudflare Workers の
  // 128MB メモリ上限 + JS ランタイムオーバーヘッドにより 30MB のファイルでも 502 で死ぬ。
  // 代わりに request.body を ReadableStream のまま Replicate に "pass-through" する。
  // ブラウザ側で FormData の field 名は 'content' に統一済み（Replicate が要求する名前）。
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.startsWith('multipart/form-data')) {
    await refundQuota(token).catch(() => void 0);
    return Response.json(
      { error: 'invalid_content_type', detail: `Expected multipart/form-data, got: ${contentType}` },
      { status: 400 }
    );
  }

  // 早期サイズチェック (Content-Length ヘッダで判定)
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  const MAX_BODY_BYTES = 105 * 1024 * 1024;  // 100MB ファイル + multipart オーバーヘッド余裕
  if (contentLength > MAX_BODY_BYTES) {
    await refundQuota(token).catch(() => void 0);
    return Response.json(
      {
        error: 'file_too_large',
        detail: `リクエストサイズが大きすぎます (${(contentLength / 1024 / 1024).toFixed(1)} MB > 100 MB)`,
      },
      { status: 413 }
    );
  }

  if (!request.body) {
    await refundQuota(token).catch(() => void 0);
    return Response.json({ error: 'missing_audio', detail: 'リクエストボディが空です' }, { status: 400 });
  }

  const jobId = randomJobId();

  // ── Step 3: Replicate Files API にストリームでパススルー ──
  // duplex:'half' は Cloudflare Workers で body に ReadableStream を渡すときに必須。
  // これにより 30-100MB のファイルでも Pages Function はメモリを数 KB しか使わない。
  let fileUrl: string;
  try {
    const fileRes = await fetch(`${REPLICATE_API_BASE}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${replicateToken}`,
        // multipart boundary ごと再利用（ブラウザが生成したものをそのまま）
        'Content-Type': contentType,
      },
      body: request.body,
      // @ts-expect-error: Cloudflare Workers requires duplex when body is ReadableStream
      duplex: 'half',
    });

    if (!fileRes.ok) {
      const errText = await fileRes.text().catch(() => '');
      await refundQuota(token).catch(() => void 0);
      return Response.json(
        {
          error: 'upload_failed',
          detail: `Replicate file upload failed (${fileRes.status}): ${errText.slice(0, 200)}`,
        },
        { status: 502 }
      );
    }

    const fileData = await fileRes.json() as {
      id: string;
      name: string;
      urls: { get: string };
    };
    fileUrl = fileData.urls.get;
  } catch (e) {
    await refundQuota(token).catch(() => void 0);
    return Response.json(
      { error: 'service_unreachable', detail: `Replicate upload network error: ${String(e)}` },
      { status: 502 }
    );
  }

  // ── Step 4: Demucs prediction 作成 ──
  // owner/name エンドポイントを使うことでバージョンハッシュ追従が自動化される
  let predictionId: string;
  let predictionStatus: string;
  try {
    const predRes = await fetch(
      `${REPLICATE_API_BASE}/models/${REPLICATE_MODEL_OWNER}/${REPLICATE_MODEL_NAME}/predictions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${replicateToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            audio: fileUrl,
            // htdemucs = Demucs v4 hybrid transformer
            model_name: 'htdemucs',
            // 4 ステム出力 (drums / bass / vocals / other)
            stems: 'vocals_drums_bass_other',
            // shifts は分離精度 vs 速度のトレードオフ。1 で十分高品質
            shifts: 1,
          },
        }),
      }
    );

    if (!predRes.ok) {
      const errText = await predRes.text().catch(() => '');
      await refundQuota(token).catch(() => void 0);
      return Response.json(
        {
          error: 'prediction_create_failed',
          detail: `Replicate prediction failed (${predRes.status}): ${errText.slice(0, 200)}`,
        },
        { status: 502 }
      );
    }

    const predData = await predRes.json() as {
      id: string;
      status: string;
    };
    predictionId = predData.id;
    predictionStatus = predData.status;
  } catch (e) {
    await refundQuota(token).catch(() => void 0);
    return Response.json(
      { error: 'service_unreachable', detail: `Replicate prediction network error: ${String(e)}` },
      { status: 502 }
    );
  }

  // ── Step 5: 即座に prediction_id を返す (クライアントが /status/{id} でポーリング) ──
  return Response.json({
    jobId,
    predictionId,
    status: predictionStatus,  // starting / processing / etc
    quota: {
      plan: quota.plan,
      used: quota.used,
      limit: quota.limit,
      remaining: quota.remaining,
    },
  });
}

// ── Helpers ──

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
