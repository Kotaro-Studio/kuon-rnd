export const runtime = 'edge';

/**
 * KUON SEPARATOR — 非同期ジョブ投入プロキシ
 *
 * フロー:
 *   1. JWT 検証 + クォータ消費 (Auth Worker 経由)
 *   2. Cloud Run /jobs に POST (即座に jobId 返却)
 *   3. Cloud Run はバックグラウンドで処理 → R2 に結果書き込み
 *   4. クライアントは /api/separator/jobs/{jobId} で進捗確認
 *
 * これにより Cloudflare Edge Runtime のタイムアウト制約を完全回避。
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

function extractEmailFromJWT(token: string): string {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return '';
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(payload + '==='.slice((payload.length + 3) % 4))) as { email?: unknown };
    return typeof decoded.email === 'string' ? decoded.email : '';
  } catch {
    return '';
  }
}

function hashEmail(email: string): string {
  if (!email) return 'anon';
  let h = 0;
  for (let i = 0; i < email.length; i++) {
    h = ((h << 5) - h) + email.charCodeAt(i);
    h |= 0;
  }
  return `u${Math.abs(h).toString(16)}`;
}

async function refundQuota(token: string): Promise<void> {
  await fetch(`${AUTH_WORKER_BASE}/api/auth/quota/refund`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ app: APP_NAME }),
  });
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

  // ── Step 1: クォータ消費 (原子的) ──
  const consumeRes = await fetch(`${AUTH_WORKER_BASE}/api/auth/quota/consume`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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
    plan: string; used: number; limit: number; remaining: number;
  };

  // ── Step 2: Cloud Run /jobs にファイル送信 (即座に jobId 返却) ──
  const jobId = randomJobId();
  const formData = await request.formData();
  const audio = formData.get('audio');
  if (!audio || !(audio instanceof File)) {
    await refundQuota(token).catch(() => void 0);
    return Response.json({ error: 'missing_audio' }, { status: 400 });
  }

  const forwardForm = new FormData();
  forwardForm.append('audio', audio);
  forwardForm.append('user_id', hashEmail(extractEmailFromJWT(token)));
  forwardForm.append('job_id', jobId);

  let runRes: Response;
  try {
    runRes = await fetch(`${separatorUrl}/jobs`, {
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
    await refundQuota(token).catch(() => void 0);
    const errBody = await runRes.json().catch(() => ({ error: 'submit_failed' }));
    return Response.json(errBody, { status: runRes.status });
  }

  const submitResult = await runRes.json() as Record<string, unknown>;

  return Response.json({
    ...submitResult,
    quota,
  });
}
