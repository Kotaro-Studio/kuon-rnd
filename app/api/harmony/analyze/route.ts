// DEPRECATED: moved to /api/classical/analyze
export const runtime = 'edge';

export async function POST() {
  return Response.json(
    { error: 'Endpoint moved', newPath: '/api/classical/analyze' },
    { status: 410 },
  );
}
