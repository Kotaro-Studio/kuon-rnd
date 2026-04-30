import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, callSheetWorker } from '../_helpers';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }
  const workerRes = await callSheetWorker(
    '/api/sheet/list',
    { method: 'GET' },
    auth.email,
    auth.planTier,
  );
  const data = await workerRes.json();
  return NextResponse.json(data, { status: workerRes.status });
}
