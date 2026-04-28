// KUON CLASSICAL ANALYSIS — MIDI proxy
// Returns MIDI binary for Tone.js playback in the browser

export const runtime = 'edge';

interface Env {
  CLASSICAL_URL?: string;
  CLASSICAL_SECRET?: string;
}

interface RouteContext {
  params: Promise<{ piece_id: string[] }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const env = (process.env as unknown) as Env;
  if (!env.CLASSICAL_URL) {
    return Response.json({ error: 'Service not configured' }, { status: 503 });
  }
  const { piece_id: parts } = await context.params;
  const pieceId = parts.join('/');
  try {
    const res = await fetch(`${env.CLASSICAL_URL}/api/midi/${pieceId}`, {
      headers: {
        ...(env.CLASSICAL_SECRET ? { Authorization: `Bearer ${env.CLASSICAL_SECRET}` } : {}),
      },
    });
    if (!res.ok) {
      return Response.json({ error: 'Upstream error', status: res.status }, { status: res.status });
    }
    const buffer = await res.arrayBuffer();
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/midi',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    return Response.json(
      { error: 'Upstream error', message: err instanceof Error ? err.message : 'unknown' },
      { status: 502 },
    );
  }
}
