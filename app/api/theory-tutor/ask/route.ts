// Streaming proxy: Next.js Edge Runtime → Tutor Worker (SSE)
export const runtime = 'edge';

import { authenticate, callTutorWorker, getCookie, trackQuota } from '../_helpers';

export async function POST(request: Request) {
  const user = await authenticate(request);
  if (!user) {
    return Response.json({ error: 'Login required' }, { status: 401 });
  }

  const token = getCookie(request, 'kuon_token');
  if (!token) return Response.json({ error: 'No token' }, { status: 401 });

  // クォータ track (1 質問 = 1 回)
  const tracked = await trackQuota(user, 'theory-tutor', token);
  if (!tracked.ok) {
    return Response.json(tracked.body, { status: tracked.status });
  }

  const body = await request.text();
  const upstream = await callTutorWorker(user, '/api/tutor/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  // SSE をそのまま中継 (ストリーミング維持)
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
