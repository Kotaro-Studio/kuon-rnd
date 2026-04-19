export const runtime = 'edge';

const WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

export async function DELETE(request: Request) {
  const token = getCookie(request, 'kuon_token');
  if (!token) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const res = await fetch(`${WORKER_BASE}/api/auth/account`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await res.json();

  if (res.ok) {
    // Clear auth cookie
    return Response.json(data, {
      status: 200,
      headers: {
        'Set-Cookie': 'kuon_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
      },
    });
  }

  return Response.json(data, { status: res.status });
}
