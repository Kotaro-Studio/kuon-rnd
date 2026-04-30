export const runtime = 'edge';

import { authenticate, callTutorWorker } from '../_helpers';

export async function GET(request: Request) {
  const user = await authenticate(request);
  if (!user) return Response.json({ error: 'Login required' }, { status: 401 });

  const upstream = await callTutorWorker(user, '/api/tutor/conversations', { method: 'GET' });
  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
