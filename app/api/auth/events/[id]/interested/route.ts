export const runtime = 'edge';

const WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = getCookie(request, 'kuon_token');
  if (!token) return Response.json({ error: 'Not authenticated' }, { status: 401 });

  const res = await fetch(`${WORKER_BASE}/api/auth/events/${id}/interested`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
