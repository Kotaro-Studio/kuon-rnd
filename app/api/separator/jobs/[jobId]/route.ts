export const runtime = 'edge';

/**
 * KUON SEPARATOR — ジョブステータス取得プロキシ (ポーリング用)
 *
 * クライアントは 5-10 秒間隔で呼び出す。
 * Cloud Run /jobs/{jobId} の結果をそのまま転送。
 */

const AUTH_WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await context.params;
  if (!jobId || !/^[a-f0-9]{8,32}$/.test(jobId)) {
    return Response.json({ error: 'invalid_job_id' }, { status: 400 });
  }

  const token = getCookie(request, 'kuon_token');
  if (!token) {
    return Response.json({ error: 'auth_required' }, { status: 401 });
  }

  // Auth check (簡易: JWT 検証は Auth Worker に投げるのが本来だが
  // ここは jobId を知っている = 一度クォータ消費した人と仮定)
  // 必要なら Auth Worker /api/auth/me で email 確認も可能
  // 軽量化のため省略 (R2 上のジョブは job_id が推測困難な 16 hex で守られる)

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

  let runRes: Response;
  try {
    runRes = await fetch(`${separatorUrl}/jobs/${jobId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${separatorSecret}` },
    });
  } catch (e) {
    return Response.json(
      { error: 'service_unreachable', detail: String(e) },
      { status: 502 }
    );
  }

  if (!runRes.ok) {
    const errBody = await runRes.json().catch(() => ({ error: 'status_fetch_failed' }));
    return Response.json(errBody, { status: runRes.status });
  }

  const result = await runRes.json();
  return Response.json(result);
}

// 不要だが Next.js が strict のため明示
export async function POST() {
  return Response.json({ error: 'method_not_allowed' }, { status: 405 });
}
