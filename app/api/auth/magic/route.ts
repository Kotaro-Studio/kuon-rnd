export const runtime = 'edge';

const WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

export async function POST(request: Request) {
  const body = await request.json();
  const origin = new URL(request.url).origin;

  const res = await fetch(`${WORKER_BASE}/api/auth/magic`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Origin': origin,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
