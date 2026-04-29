export const runtime = 'edge';

import { authenticate, callRecorderWorker } from '../_helpers';

export async function POST(request: Request) {
  const user = await authenticate(request);
  if (!user) return Response.json({ error: 'Login required' }, { status: 401 });

  const body = await request.text();
  const upstream = await callRecorderWorker(user, '/api/recorder/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
