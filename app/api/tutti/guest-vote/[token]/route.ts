import { NextRequest, NextResponse } from 'next/server';
import { callTuttiPublic } from '../../_helpers';

export const runtime = 'edge';

// Guest がトークンからイベント情報を取得 (アカウント不要)
export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const r = await callTuttiPublic(`/api/tutti/guest-vote/${token}`, { method: 'GET' });
  return NextResponse.json(await r.json(), { status: r.status });
}

// Guest が投票
export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  const r = await callTuttiPublic(`/api/tutti/guest-vote/${token}`, { method: 'POST', body });
  return NextResponse.json(await r.json(), { status: r.status });
}
