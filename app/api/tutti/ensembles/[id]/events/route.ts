import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, callTuttiAuth } from '../../../_helpers';

export const runtime = 'edge';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const { id } = await ctx.params;
  const r = await callTuttiAuth(`/api/tutti/ensembles/${id}/events`, { method: 'GET' }, auth.email, auth.planTier, auth.name);
  return NextResponse.json(await r.json(), { status: r.status });
}
