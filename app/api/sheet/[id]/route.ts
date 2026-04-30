import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, callSheetWorker } from '../_helpers';

export const runtime = 'edge';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }
  const { id } = await ctx.params;
  const workerRes = await callSheetWorker(
    `/api/sheet/${id}`,
    { method: 'GET' },
    auth.email,
    auth.planTier,
  );
  const data = await workerRes.json();
  return NextResponse.json(data, { status: workerRes.status });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }
  const { id } = await ctx.params;
  const workerRes = await callSheetWorker(
    `/api/sheet/${id}`,
    { method: 'DELETE' },
    auth.email,
    auth.planTier,
  );
  const data = await workerRes.json();
  return NextResponse.json(data, { status: workerRes.status });
}
