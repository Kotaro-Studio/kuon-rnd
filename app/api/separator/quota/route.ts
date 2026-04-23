export const runtime = 'edge';

/**
 * GET /api/separator/quota — 読み取り専用でクォータ状態を取得
 *
 * UI で「残り X 回」を表示するために使う。実消費はしない。
 */

const AUTH_WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

export async function GET(request: Request) {
  const token = getCookie(request, 'kuon_token');
  if (!token) {
    return Response.json({ error: 'auth_required' }, { status: 401 });
  }

  const res = await fetch(`${AUTH_WORKER_BASE}/api/auth/quota?app=separator`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const body = await res.json();
  return Response.json(body, { status: res.status });
}
