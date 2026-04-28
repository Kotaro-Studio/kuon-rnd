// DEPRECATED: moved to /api/classical/analyze-from-library
export const runtime = 'edge';

export async function POST() {
  return Response.json(
    { error: 'Endpoint moved', newPath: '/api/classical/analyze-from-library' },
    { status: 410 },
  );
}
