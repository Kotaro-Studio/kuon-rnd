export const runtime = 'edge';

const WORKER_BASE = 'https://kuon-rnd-player-worker.369-1d5.workers.dev';

export async function POST(request: Request) {
  const secret = (process.env as Record<string, string | undefined>).PLAYER_SECRET;
  if (!secret) {
    return Response.json({ error: 'PLAYER_SECRET not configured' }, { status: 500 });
  }

  // フロントから FormData で受け取る
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const name = formData.get('name') as string | null;
  const title = formData.get('title') as string | null;
  const password = formData.get('password') as string | null;

  if (!file || !name || !title || !password) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // 99MB チェック
  if (file.size > 99 * 1024 * 1024) {
    return Response.json({ error: 'File too large (max 99MB)' }, { status: 413 });
  }

  // MP3 チェック
  if (!file.name.toLowerCase().endsWith('.mp3') && file.type !== 'audio/mpeg') {
    return Response.json({ error: 'Only MP3 files are allowed' }, { status: 400 });
  }

  // パスワードを SHA-256 ハッシュ化
  const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
  const passwordHash = Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const metaJson = JSON.stringify({
    name,
    title,
    passwordHash,
    originalName: file.name,
  });

  // Worker にアップロード
  const arrayBuf = await file.arrayBuffer();

  const res = await fetch(`${WORKER_BASE}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secret}`,
      'Content-Type': 'audio/mpeg',
      'X-Meta': metaJson,
    },
    body: arrayBuf,
  });

  const data = await res.json();

  if (!res.ok) {
    return Response.json(data, { status: res.status });
  }

  return Response.json(data);
}
