export const runtime = 'edge';

const WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

export async function GET(_request: Request, { params }: { params: Promise<{ email: string }> }) {
  const { email } = await params;

  const res = await fetch(`${WORKER_BASE}/api/auth/avatar/${encodeURIComponent(email)}`);

  return new Response(res.body, {
    status: res.status,
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'image/svg+xml',
      'Cache-Control': res.headers.get('Cache-Control') || 'public, max-age=3600',
    },
  });
}
