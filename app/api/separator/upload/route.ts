export const runtime = 'edge';

/**
 * KUON SEPARATOR — R2 直接アップロードエンドポイント (Replicate 版)
 *
 * 役割:
 *   ブラウザから来たファイル本体を、Pages Function でバッファせず
 *   R2 binding 経由でそのままストリームアップロードする。
 *
 * なぜストリーム:
 *   - await request.formData() / arrayBuffer() はファイル全体をメモリに展開する
 *   - Cloudflare Workers のメモリ上限 128MB に簡単に当たる
 *   - request.body (ReadableStream) を bucket.put() に渡すと、内部でストリーム転送
 *   - メモリ消費は数 KB のみ
 *
 * リクエスト形式:
 *   POST /api/separator/upload
 *   Content-Type: audio/mpeg | audio/wav | ... (ファイル MIME)
 *   Body: ファイル本体 (FormData ではなく raw body)
 *
 * レスポンス:
 *   { fileKey: "incoming/abc123.mp3", success: true }
 */

// R2 binding の最小型定義 (Cloudflare の R2Bucket 型)
interface R2Bucket {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | string | null,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<unknown>;
}

function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

function randomKey(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function guessExtension(contentType: string): string {
  const lc = contentType.toLowerCase();
  if (lc.startsWith('audio/mpeg') || lc.startsWith('audio/mp3')) return '.mp3';
  if (lc.startsWith('audio/wav') || lc.startsWith('audio/wave') || lc.startsWith('audio/x-wav')) return '.wav';
  if (lc.startsWith('audio/flac') || lc.startsWith('audio/x-flac')) return '.flac';
  if (lc.startsWith('audio/mp4') || lc.startsWith('audio/x-m4a') || lc.startsWith('audio/aac')) return '.m4a';
  if (lc.startsWith('audio/ogg')) return '.ogg';
  return '.bin';
}

export async function POST(request: Request) {
  try {
    return await handleUpload(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    // eslint-disable-next-line no-console
    console.error('[separator/upload] uncaught', message, stack);
    return Response.json(
      {
        error: 'internal_error',
        detail: `内部エラー: ${message}`,
        debug_stack: stack ? stack.slice(0, 500) : undefined,
      },
      { status: 500 }
    );
  }
}

async function handleUpload(request: Request): Promise<Response> {
  // ── 認証 ──
  const token = getCookie(request, 'kuon_token');
  if (!token) {
    return Response.json({ error: 'auth_required' }, { status: 401 });
  }

  // ── R2 binding 取得（Object.keys 不使用・Proxy 安全） ──
  // 直接プロパティアクセスのみ。Object.keys は次世代 Proxy で例外を投げる可能性あり。
  let bucket: R2Bucket | undefined;
  let foundIn = 'none';

  // 1. request.env
  try {
    const reqEnv = (request as unknown as { env?: { SEPARATOR_BUCKET?: R2Bucket } }).env;
    if (reqEnv?.SEPARATOR_BUCKET) {
      bucket = reqEnv.SEPARATOR_BUCKET;
      foundIn = 'request.env';
    }
  } catch { /* ignore */ }

  // 2. globalThis.env
  if (!bucket) {
    try {
      const globalEnv = (globalThis as unknown as { env?: { SEPARATOR_BUCKET?: R2Bucket } }).env;
      if (globalEnv?.SEPARATOR_BUCKET) {
        bucket = globalEnv.SEPARATOR_BUCKET;
        foundIn = 'globalThis.env';
      }
    } catch { /* ignore */ }
  }

  // 3. process.env (next-on-pages backward compat)
  if (!bucket) {
    try {
      const procBucket = (process.env as unknown as { SEPARATOR_BUCKET?: R2Bucket }).SEPARATOR_BUCKET;
      if (procBucket) {
        bucket = procBucket;
        foundIn = 'process.env';
      }
    } catch { /* ignore */ }
  }

  // 4. globalThis 直接
  if (!bucket) {
    try {
      const directBucket = (globalThis as unknown as { SEPARATOR_BUCKET?: R2Bucket }).SEPARATOR_BUCKET;
      if (directBucket) {
        bucket = directBucket;
        foundIn = 'globalThis.SEPARATOR_BUCKET';
      }
    } catch { /* ignore */ }
  }

  if (!bucket) {
    return Response.json(
      {
        error: 'r2_not_bound',
        detail: `SEPARATOR_BUCKET binding が見つかりません。試した場所: request.env / globalThis.env / process.env / globalThis 全部 undefined。foundIn=${foundIn}`,
      },
      { status: 503 }
    );
  }

  // ── 早期サイズチェック (Content-Length ヘッダ) ──
  const contentType = request.headers.get('content-type') || 'application/octet-stream';
  const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
  const MAX_BYTES = 100 * 1024 * 1024;
  if (contentLength > MAX_BYTES) {
    return Response.json(
      {
        error: 'file_too_large',
        detail: `ファイルサイズが大きすぎます (${(contentLength / 1024 / 1024).toFixed(1)} MB > 100 MB)`,
      },
      { status: 413 }
    );
  }

  if (!request.body) {
    return Response.json({ error: 'missing_body' }, { status: 400 });
  }

  // ── R2 に直接ストリームアップロード ──
  const fileKey = randomKey();
  const ext = guessExtension(contentType);
  const r2Key = `incoming/${fileKey}${ext}`;

  try {
    await bucket.put(r2Key, request.body, {
      httpMetadata: { contentType },
    });
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    // eslint-disable-next-line no-console
    console.error('[separator/upload] R2 put failed', detail);
    return Response.json(
      {
        error: 'r2_upload_failed',
        detail: `R2 アップロード失敗: ${detail.slice(0, 200)}`,
      },
      { status: 502 }
    );
  }

  return Response.json({
    fileKey: r2Key,
    success: true,
  });
}
