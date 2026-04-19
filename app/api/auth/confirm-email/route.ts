export const runtime = 'edge';

const WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

export async function POST(request: Request) {
  const body = await request.json();

  const res = await fetch(`${WORKER_BASE}/api/auth/confirm-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (res.ok && data.jwt) {
    // Set new JWT cookie with updated email
    const cookie = `kuon_token=${data.jwt}; Path=/; Max-Age=${30 * 24 * 3600}; HttpOnly; Secure; SameSite=Lax`;
    return Response.json(data, {
      status: 200,
      headers: { 'Set-Cookie': cookie },
    });
  }

  return Response.json(data, { status: res.status });
}
