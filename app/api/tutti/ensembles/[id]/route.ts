import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, callTuttiAuth } from '../../_helpers';

export const runtime = 'edge';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await ctx.params;
  const r = await callTuttiAuth(`/api/tutti/ensembles/${id}`, { method: 'GET' }, auth.email, auth.planTier, auth.name);
  return NextResponse.json(await r.json(), { status: r.status });
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  const r = await callTuttiAuth(`/api/tutti/ensembles/${id}`, { method: 'PUT', body }, auth.email, auth.planTier, auth.name);
  return NextResponse.json(await r.json(), { status: r.status });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await ctx.params;
  const r = await callTuttiAuth(`/api/tutti/ensembles/${id}`, { method: 'DELETE' }, auth.email, auth.planTier, auth.name);
  return NextResponse.json(await r.json(), { status: r.status });
}
