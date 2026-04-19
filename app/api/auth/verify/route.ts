export const runtime = 'edge';

const WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

export async function POST(request: Request) {
  const body = await request.json();

  // Forward Cloudflare geo headers to Worker for country detection
  const cfCountry = request.headers.get('CF-IPCountry') || '';
  const cfCity = request.headers.get('CF-Visitor-City') || request.headers.get('CF-IPCity') || '';

  const res = await fetch(`${WORKER_BASE}/api/auth/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CF-Country': cfCountry,
      'X-CF-City': cfCity,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json() as Record<string, unknown>;

  if (!res.ok) {
    return Response.json(data, { status: res.status });
  }

  // JWT をHttpOnly Cookie にセット（30日）
  const jwt = data.jwt as string;
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set(
    'Set-Cookie',
    `kuon_token=${jwt}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 3600}`
  );

  return new Response(JSON.stringify(data), { status: 200, headers });
}
