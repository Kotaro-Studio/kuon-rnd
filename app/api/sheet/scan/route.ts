import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, checkQuota, trackUsage, callSheetWorker } from '../_helpers';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const authHeader = req.headers.get('Authorization') || '';

  // スキャンはクォータ消費 (エディタ・保存はクォータ消費しない)
  const quota = await checkQuota(authHeader, 'sheet');
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: 'QUOTA_EXCEEDED',
        used: quota.used,
        quota: quota.quota,
        remaining: quota.remaining,
        message: quota.message || '今月のスキャンクォータを使い切りました。Concerto プラン以上でご利用ください。',
      },
      { status: 429 },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const workerRes = await callSheetWorker(
    '/api/sheet/scan',
    { method: 'POST', body },
    auth.email,
    auth.planTier,
  );

  if (workerRes.ok) {
    await trackUsage(authHeader, 'sheet');
  }

  const data = await workerRes.json();
  return NextResponse.json(data, { status: workerRes.status });
}
