import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, callTuttiAuth } from '../_helpers';

export const runtime = 'edge';

// 新規イベント (リハ/本番候補日) 作成
export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  const r = await callTuttiAuth('/api/tutti/events', { method: 'POST', body }, auth.email, auth.planTier, auth.name);
  return NextResponse.json(await r.json(), { status: r.status });
}
