// KUON CLASSICAL ANALYSIS — composers proxy
// Returns list of available composers from music21 corpus

export const runtime = 'edge';

interface Env {
  CLASSICAL_URL?: string;
  CLASSICAL_SECRET?: string;
}

export async function GET() {
  const env = (process.env as unknown) as Env;
  if (!env.CLASSICAL_URL) {
    return Response.json({ composers: [], _stub: 'Cloud Run service not configured.' }, { status: 200 });
  }
  try {
    const res = await fetch(`${env.CLASSICAL_URL}/api/composers`, {
      headers: {
        ...(env.CLASSICAL_SECRET ? { Authorization: `Bearer ${env.CLASSICAL_SECRET}` } : {}),
      },
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
