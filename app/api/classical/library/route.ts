// KUON CLASSICAL ANALYSIS — library proxy
// Cloudflare Pages Function: forwards to Cloud Run service via CLASSICAL_URL
// CLAUDE.md §44.11 🟢 safe zone (music21 is mature, deterministic)

export const runtime = 'edge';

interface Env {
  CLASSICAL_URL?: string;
  CLASSICAL_SECRET?: string;
}

export async function GET(request: Request) {
  const env = (process.env as unknown) as Env;
  if (!env.CLASSICAL_URL) {
    // Service not yet deployed — return mock library for development
    return Response.json({
      total: 0,
      filtered: 0,
      pieces: [],
      _stub: 'Cloud Run service not configured. Set CLASSICAL_URL env var.',
    }, { status: 200 });
  }

  const url = new URL(request.url);
  const upstream = `${env.CLASSICAL_URL}/api/library${url.search}`;

  try {
    const res = await fetch(upstream, {
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
