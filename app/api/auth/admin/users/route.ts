export const runtime = 'edge';

const WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

export async function GET(request: Request) {
  const token = getCookie(request, 'kuon_token');
  if (!token) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const url = new URL(request.url);
  const params = new URLSearchParams();
  if (url.searchParams.get('search')) params.set('search', url.searchParams.get('search')!);
  if (url.searchParams.get('plan')) params.set('plan', url.searchParams.get('plan')!);
  if (url.searchParams.get('page')) params.set('page', url.searchParams.get('page')!);
  if (url.searchParams.get('limit')) params.set('limit', url.searchParams.get('limit')!);

  const res = await fetch(`${WORKER_BASE}/api/auth/admin/users?${params.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
