export const runtime = 'edge';

const WORKER_BASE = 'https://kuon-rnd-player-worker.369-1d5.workers.dev';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const res = await fetch(`${WORKER_BASE}/api/play/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return Response.json(data, { status: res.status });
}
