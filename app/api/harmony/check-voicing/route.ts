// DEPRECATED: moved to /api/classical/check-voicing
export const runtime = 'edge';

export async function POST() {
  return Response.json(
    { error: 'Endpoint moved', newPath: '/api/classical/check-voicing' },
    { status: 410 },
  );
}
