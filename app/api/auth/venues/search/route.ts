export const runtime = 'edge';

const WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get('q') || '';

  const res = await fetch(`${WORKER_BASE}/api/auth/venues/search?q=${encodeURIComponent(q)}`, {
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
