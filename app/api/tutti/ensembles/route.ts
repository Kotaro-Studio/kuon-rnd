import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth, callTuttiAuth } from '../_helpers';

export const runtime = 'edge';

// 自分が所属するアンサンブル一覧
export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const r = await callTuttiAuth('/api/tutti/ensembles/me', { method: 'GET' }, auth.email, auth.planTier, auth.name);
  return NextResponse.json(await r.json(), { status: r.status });
}

// 新規アンサンブル作成
export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  const r = await callTuttiAuth('/api/tutti/ensembles', { method: 'POST', body }, auth.email, auth.planTier, auth.name);
  return NextResponse.json(await r.json(), { status: r.status });
}
