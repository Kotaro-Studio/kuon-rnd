import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, checkQuota, trackUsage, callLibrettoWorker } from '../_helpers';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const authHeader = req.headers.get('Authorization') || '';

  // クォータチェック
  const quota = await checkQuota(authHeader, 'libretto');
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error: 'QUOTA_EXCEEDED',
        used: quota.used,
        quota: quota.quota,
        remaining: quota.remaining,
        message: quota.message || '今月のクォータを使い切りました',
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

  const workerRes = await callLibrettoWorker(
    '/api/libretto/translate',
    { method: 'POST', body },
    auth.email,
    auth.planTier,
  );

  if (workerRes.ok) {
    // 成功時のみクォータをカウントアップ
    await trackUsage(authHeader, 'libretto');
  }

  const data = await workerRes.json();
  return NextResponse.json(data, { status: workerRes.status });
}
