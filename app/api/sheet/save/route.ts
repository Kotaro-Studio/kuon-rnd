import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, callSheetWorker } from '../_helpers';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // 保存はクォータ消費しない (エディタは Free でも使えるため)
  // Worker 側で Free プラン譜面数制限 (10 譜面) をチェック
  const workerRes = await callSheetWorker(
    '/api/sheet/save',
    { method: 'POST', body },
    auth.email,
    auth.planTier,
  );
  const data = await workerRes.json();
  return NextResponse.json(data, { status: workerRes.status });
}
