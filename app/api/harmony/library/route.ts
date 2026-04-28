// DEPRECATED: This route was created during the rename to KUON CLASSICAL ANALYSIS.
// The active route is /api/classical/library.
// Kept as 410 Gone to prevent confusion in case of stale caches or bookmarks.

export const runtime = 'edge';

export async function GET() {
  return Response.json(
    { error: 'Endpoint moved', newPath: '/api/classical/library' },
    { status: 410 },
  );
}
