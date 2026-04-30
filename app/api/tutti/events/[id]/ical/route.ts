import { NextRequest } from 'next/server';
import { verifyAuth, callTuttiAuth } from '../../../_helpers';

export const runtime = 'edge';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(req);
  if (!auth.ok) return new Response(auth.message, { status: auth.status });
  const { id } = await ctx.params;
  const r = await callTuttiAuth(`/api/tutti/events/${id}/ical`, { method: 'GET' }, auth.email, auth.planTier, auth.name);
  // text/calendar をそのままパススルー
  const text = await r.text();
  return new Response(text, {
    status: r.status,
    headers: {
      'Content-Type': r.headers.get('Content-Type') || 'text/calendar',
      'Content-Disposition': r.headers.get('Content-Disposition') || `attachment; filename="event.ics"`,
    },
  });
}
