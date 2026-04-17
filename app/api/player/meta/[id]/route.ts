export const runtime = 'edge';

const WORKER_BASE = 'https://kuon-rnd-player-worker.369-1d5.workers.dev';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const res = await fetch(`${WORKER_BASE}/api/meta/${id}`);
  const data = await res.json();

  return Response.json(data, { status: res.status });
}
