export const runtime = 'edge';

const WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

export async function POST(request: Request) {
  const token = getCookie(request, 'kuon_token');
  if (!token) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Forward the multipart form data as-is
  const formData = await request.formData();
  const newForm = new FormData();
  const avatar = formData.get('avatar');
  if (avatar) newForm.append('avatar', avatar);

  const res = await fetch(`${WORKER_BASE}/api/auth/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: newForm,
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
