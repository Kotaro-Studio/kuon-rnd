export const runtime = 'edge';

const WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

export async function POST(request: Request) {
  // Read country from Cloudflare header (automatically added by CF)
  const country = request.headers.get('CF-IPCountry') || 'XX';

  const body = await request.json() as { path?: string };

  const res = await fetch(`${WORKER_BASE}/api/auth/pageview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: body.path || '/', country }),
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
