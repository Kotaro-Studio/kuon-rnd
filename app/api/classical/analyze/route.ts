export const runtime = 'edge';

interface Env {
  CLASSICAL_URL?: string;
  CLASSICAL_SECRET?: string;
}

export async function POST(request: Request) {
  const env = (process.env as unknown) as Env;
  if (!env.CLASSICAL_URL) {
    return Response.json({ error: 'Service not configured' }, { status: 503 });
  }

  try {
    const body = await request.text();
    const res = await fetch(`${env.CLASSICAL_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(env.CLASSICAL_SECRET ? { Authorization: `Bearer ${env.CLASSICAL_SECRET}` } : {}),
      },
      body,
    });
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (err) {
    return Response.json(
      { error: 'Upstream error', message: err instanceof Error ? err.message : 'unknown' },
      { status: 502 },
    );
  }
}
