export const runtime = 'edge';

/**
 * KUON SEPARATOR — Next.js プロキシ
 *
 * フロー:
 *   1. Cookie から JWT を取り出し Auth Worker で検証
 *   2. Auth Worker の /api/auth/quota/consume で原子的にクォータ消費
 *   3. 成功したら Cloud Run にオーディオファイルを転送
 *   4. Cloud Run が失敗したら Auth Worker の /api/auth/quota/refund で復元
 *   5. 結果（4 ステムの署名付き URL）をクライアントに返す
 *
 * 必要な環境変数（Cloudflare Pages secrets）:
 *   - SEPARATOR_URL     : Cloud Run サービスの URL
 *                          例: https://kuon-separator-xxxxx-an.a.run.app
 *   - SEPARATOR_SECRET  : Cloud Run との共有 Bearer シークレット
 */

const AUTH_WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';
const APP_NAME = 'separator';

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
  const token = getCookie(request, 'kuon_token');
  if (!token) {
    return Response.json({ error: 'auth_required' }, { status: 401 });
  }

  const env = (request as unknown as { env?: Record<string, string> }).env
    || (globalThis as unknown as { process?: { env: Record<string, string> } }).process?.env
    || {};
  const separatorUrl = env.SEPARATOR_URL || process.env.SEPARATOR_URL;
  const separatorSecret = env.SEPARATOR_SECRET || process.env.SEPARATOR_SECRET;

  if (!separatorUrl || !separatorSecret) {
    return Response.json(
      { error: 'service_unavailable', detail: 'SEPARATOR not configured' },
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

  // ── Step 2: Cloud Run にファイルを転送 ──
  const jobId = randomJobId();
  const formData = await request.formData();
  const audio = formData.get('audio');
  if (!audio || !(audio instanceof File)) {
    // クォータを返金
    await refundQuota(token).catch(() => void 0);
    return Response.json({ error: 'missing_audio' }, { status: 400 });
  }

  const forwardForm = new FormData();
  forwardForm.append('audio', audio);
  forwardForm.append('user_id', hashEmail(extractEmailFromJWT(token)));
  forwardForm.append('job_id', jobId);

  let runRes: Response;
  try {
    runRes = await fetch(`${separatorUrl}/separate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${separatorSecret}` },
      body: forwardForm,
    });
  } catch (e) {
    await refundQuota(token).catch(() => void 0);
    return Response.json(
      { error: 'service_unreachable', detail: String(e) },
      { status: 502 }
    );
  }

  if (!runRes.ok) {
    // Cloud Run が失敗 — クォータを返金
    await refundQuota(token).catch(() => void 0);
    const errBody = await runRes.json().catch(() => ({ error: 'separation_failed' }));
    return Response.json(errBody, { status: runRes.status });
  }

  const result = await runRes.json() as Record<string, unknown>;

  // ── Step 3: 結果 + クォータ残量を返す ──
  return Response.json({
    ...result,
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

/** JWT のペイロード部から email を抽出（検証は Auth Worker 側で済んでいる前提） */
function extractEmailFromJWT(token: string): string {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return '';
    // base64url → base64
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(payload + '==='.slice((payload.length + 3) % 4)));
    return typeof decoded.email === 'string' ? decoded.email : '';
  } catch {
    return '';
  }
}

/** ログ分析用のメールハッシュ（平文をログに残さない） */
function hashEmail(email: string): string {
  if (!email) return 'anon';
  // Cloudflare Workers / Edge Runtime 互換の簡易ハッシュ
  let h = 0;
  for (let i = 0; i < email.length; i++) {
    h = ((h << 5) - h) + email.charCodeAt(i);
    h |= 0;
  }
  return `u${Math.abs(h).toString(16)}`;
}
