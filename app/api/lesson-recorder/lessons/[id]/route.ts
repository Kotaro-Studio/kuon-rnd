export const runtime = 'edge';

import { authenticate, callRecorderWorker } from '../../_helpers';

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await authenticate(request);
  if (!user) return Response.json({ error: 'Login required' }, { status: 401 });
  const { id } = await ctx.params;
  const upstream = await callRecorderWorker(user, `/api/recorder/lessons/${id}`, { method: 'GET' });
  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}

export async function PUT(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await authenticate(request);
  if (!user) return Response.json({ error: 'Login required' }, { status: 401 });
  const { id } = await ctx.params;
  const body = await request.text();
  const upstream = await callRecorderWorker(user, `/api/recorder/lessons/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await authenticate(request);
  if (!user) return Response.json({ error: 'Login required' }, { status: 401 });
  const { id } = await ctx.params;
  const upstream = await callRecorderWorker(user, `/api/recorder/lessons/${id}`, {
    method: 'DELETE',
  });
  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
