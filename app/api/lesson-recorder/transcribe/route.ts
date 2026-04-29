export const runtime = 'edge';

import { authenticate, callRecorderWorker, getCookie, trackQuota } from '../_helpers';

export async function POST(request: Request) {
  const user = await authenticate(request);
  if (!user) {
    return Response.json({ error: 'Login required' }, { status: 401 });
  }

  // クォータ track (1 書き起こし = 1 回)
  const token = getCookie(request, 'kuon_token');
  if (!token) return Response.json({ error: 'No token' }, { status: 401 });

  const tracked = await trackQuota(user, 'lesson-recorder', token);
  if (!tracked.ok) {
    return Response.json(tracked.body, { status: tracked.status });
  }

  // FormData をそのまま転送
  const formData = await request.formData();

  const upstream = await callRecorderWorker(user, '/api/recorder/transcribe', {
    method: 'POST',
    body: formData,
  });

  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
