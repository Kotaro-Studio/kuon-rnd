/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono'
import { cors } from 'hono/cors'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface Env {
  PLAYER: R2Bucket
  META: KVNamespace
  PLAYER_SECRET: string  // Bearer token for upload/delete from Next.js
}

interface TrackMeta {
  /** アップロード者が設定した表示名 */
  name: string
  /** 曲名 / ファイル説明 */
  title: string
  /** パスワード SHA-256 ハッシュ */
  passwordHash: string
  /** アップロード日時 ISO */
  createdAt: string
  /** 初回再生日時 ISO（null = 未再生） */
  firstPlayedAt: string | null
  /** ファイルサイズ (bytes) */
  size: number
  /** 元のファイル名 */
  originalName: string
}

const MAX_FILE_SIZE = 99 * 1024 * 1024 // 99MB
const EXPIRY_MS = 24 * 60 * 60 * 1000  // 24時間

const app = new Hono<{ Bindings: Env }>()

// ─────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────
app.use('*', cors({
  origin: ['https://kuon-rnd.com', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Range', 'Authorization', 'X-Password-Hash'],
  credentials: false,
}))

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────
app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'Kuon R&D Player Worker v1' })
})

// ─────────────────────────────────────────────
// Helper: verify internal Bearer token
// ─────────────────────────────────────────────
function verifyBearer(c: any): boolean {
  const secret = c.env.PLAYER_SECRET
  if (!secret) return false
  const auth = c.req.header('Authorization')
  return auth === `Bearer ${secret}`
}

// ─────────────────────────────────────────────
// Helper: SHA-256 hash
// ─────────────────────────────────────────────
async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ─────────────────────────────────────────────
// Helper: check if track is expired
// ─────────────────────────────────────────────
function isExpired(meta: TrackMeta): boolean {
  if (!meta.firstPlayedAt) return false
  return Date.now() - new Date(meta.firstPlayedAt).getTime() > EXPIRY_MS
}

// ─────────────────────────────────────────────
// POST /api/upload — ファイルアップロード
// Body: MP3 binary
// Headers: Authorization, X-Meta (JSON stringified TrackMeta partial)
// Returns: { ok, id, url }
// ─────────────────────────────────────────────
app.post('/api/upload', async (c) => {
  if (!verifyBearer(c)) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const metaHeader = c.req.header('X-Meta')
  if (!metaHeader) {
    return c.json({ error: 'Missing X-Meta header' }, 400)
  }

  let metaInput: { name: string; title: string; passwordHash: string; originalName: string }
  try {
    metaInput = JSON.parse(metaHeader)
  } catch {
    return c.json({ error: 'Invalid X-Meta JSON' }, 400)
  }

  if (!metaInput.name || !metaInput.title || !metaInput.passwordHash) {
    return c.json({ error: 'Missing required fields (name, title, passwordHash)' }, 400)
  }

  const body = await c.req.arrayBuffer()

  if (body.byteLength > MAX_FILE_SIZE) {
    return c.json({ error: `File too large (max ${MAX_FILE_SIZE / 1024 / 1024}MB)` }, 413)
  }

  if (body.byteLength === 0) {
    return c.json({ error: 'Empty file' }, 400)
  }

  // ユニークID生成（nanoid風: crypto.randomUUID の先頭12文字）
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
  const fileKey = `${id}.mp3`

  // R2 にアップロード
  await c.env.PLAYER.put(fileKey, body, {
    httpMetadata: { contentType: 'audio/mpeg' },
  })

  // KV にメタデータ保存
  const meta: TrackMeta = {
    name: metaInput.name,
    title: metaInput.title,
    passwordHash: metaInput.passwordHash,
    createdAt: new Date().toISOString(),
    firstPlayedAt: null,
    size: body.byteLength,
    originalName: metaInput.originalName || 'audio.mp3',
  }

  // KV TTL: 最大48時間（24時間 + バッファ。Cron が実際の削除を行う）
  await c.env.META.put(id, JSON.stringify(meta), { expirationTtl: 48 * 60 * 60 })

  return c.json({ ok: true, id })
})

// ─────────────────────────────────────────────
// GET /api/meta/:id — メタデータ取得（パスワード不要、公開情報のみ）
// ─────────────────────────────────────────────
app.get('/api/meta/:id', async (c) => {
  const id = c.req.param('id')
  const raw = await c.env.META.get(id)
  if (!raw) {
    return c.json({ error: 'Not found or expired' }, 404)
  }

  const meta: TrackMeta = JSON.parse(raw)

  if (isExpired(meta)) {
    return c.json({ error: 'Expired' }, 410)
  }

  // パスワードハッシュは返さない
  return c.json({
    name: meta.name,
    title: meta.title,
    createdAt: meta.createdAt,
    firstPlayedAt: meta.firstPlayedAt,
    size: meta.size,
    originalName: meta.originalName,
    expiresAt: meta.firstPlayedAt
      ? new Date(new Date(meta.firstPlayedAt).getTime() + EXPIRY_MS).toISOString()
      : null,
  })
})

// ─────────────────────────────────────────────
// POST /api/play/:id — パスワード認証 → 再生開始（初回再生時刻を記録）
// Body: { passwordHash: string }
// ─────────────────────────────────────────────
app.post('/api/play/:id', async (c) => {
  const id = c.req.param('id')
  const raw = await c.env.META.get(id)
  if (!raw) {
    return c.json({ error: 'Not found or expired' }, 404)
  }

  const meta: TrackMeta = JSON.parse(raw)

  if (isExpired(meta)) {
    return c.json({ error: 'Expired' }, 410)
  }

  const { passwordHash } = await c.req.json<{ passwordHash: string }>()
  if (passwordHash !== meta.passwordHash) {
    return c.json({ error: 'Wrong password' }, 403)
  }

  // 初回再生日時を記録
  if (!meta.firstPlayedAt) {
    meta.firstPlayedAt = new Date().toISOString()
    // TTL を更新（初回再生から25時間後に KV 自動削除）
    await c.env.META.put(id, JSON.stringify(meta), { expirationTtl: 25 * 60 * 60 })
  }

  return c.json({
    ok: true,
    firstPlayedAt: meta.firstPlayedAt,
    expiresAt: new Date(new Date(meta.firstPlayedAt).getTime() + EXPIRY_MS).toISOString(),
  })
})

// ─────────────────────────────────────────────
// GET /api/stream/:id — 音声ストリーミング（パスワードハッシュをクエリで検証）
// ?h=<passwordHash>
// ─────────────────────────────────────────────
app.get('/api/stream/:id', async (c) => {
  const id = c.req.param('id')
  const hash = c.req.query('h')

  const raw = await c.env.META.get(id)
  if (!raw) {
    return c.json({ error: 'Not found or expired' }, 404)
  }

  const meta: TrackMeta = JSON.parse(raw)

  if (isExpired(meta)) {
    return c.json({ error: 'Expired' }, 410)
  }

  if (!hash || hash !== meta.passwordHash) {
    return c.json({ error: 'Unauthorized' }, 403)
  }

  const fileKey = `${id}.mp3`
  const range = c.req.header('Range')

  // Range リクエスト対応
  if (range) {
    const head = await c.env.PLAYER.head(fileKey)
    if (!head) return c.json({ error: 'File not found' }, 404)
    const size = head.size

    const spec = range.replace(/^bytes=/, '').trim()
    const [startStr, endStr] = spec.split('-')
    let start: number, end: number

    if (startStr === '' && endStr !== '') {
      const suffix = parseInt(endStr, 10)
      if (!Number.isFinite(suffix) || suffix <= 0) {
        return new Response('Range Not Satisfiable', {
          status: 416, headers: { 'Content-Range': `bytes */${size}` }
        })
      }
      start = Math.max(0, size - suffix)
      end = size - 1
    } else {
      start = parseInt(startStr, 10) || 0
      end = endStr ? parseInt(endStr, 10) : size - 1
    }

    if (start < 0 || start >= size || end >= size || start > end) {
      return new Response('Range Not Satisfiable', {
        status: 416, headers: { 'Content-Range': `bytes */${size}` }
      })
    }

    const chunkSize = end - start + 1
    const ranged = await c.env.PLAYER.get(fileKey, {
      range: { offset: start, length: chunkSize },
    })
    if (!ranged) return c.json({ error: 'File not found' }, 404)

    const headers = new Headers()
    headers.set('Content-Type', 'audio/mpeg')
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`)
    headers.set('Accept-Ranges', 'bytes')
    headers.set('Content-Length', String(chunkSize))
    headers.set('Cache-Control', 'no-store')

    return new Response(ranged.body, { status: 206, headers })
  }

  // 通常リクエスト
  const object = await c.env.PLAYER.get(fileKey)
  if (!object) return c.json({ error: 'File not found' }, 404)

  const headers = new Headers()
  headers.set('Content-Type', 'audio/mpeg')
  headers.set('Accept-Ranges', 'bytes')
  headers.set('Content-Length', String(object.size))
  headers.set('Cache-Control', 'no-store')

  return new Response(object.body, { headers })
})

// ─────────────────────────────────────────────
// DELETE /api/delete/:id — ユーザー自身による削除
// Body: { passwordHash: string }
// ─────────────────────────────────────────────
app.post('/api/delete/:id', async (c) => {
  const id = c.req.param('id')
  const raw = await c.env.META.get(id)
  if (!raw) {
    return c.json({ error: 'Not found or already deleted' }, 404)
  }

  const meta: TrackMeta = JSON.parse(raw)
  const { passwordHash } = await c.req.json<{ passwordHash: string }>()

  if (passwordHash !== meta.passwordHash) {
    return c.json({ error: 'Wrong password' }, 403)
  }

  // R2 + KV 両方削除
  await Promise.all([
    c.env.PLAYER.delete(`${id}.mp3`),
    c.env.META.delete(id),
  ])

  return c.json({ ok: true, message: 'Deleted' })
})

// ─────────────────────────────────────────────
// Cron Trigger: 1時間ごとに期限切れトラックを削除
// ─────────────────────────────────────────────
export default {
  fetch: app.fetch,

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // KV の全キーをリスト
    let cursor: string | undefined
    let deleted = 0

    do {
      const list = await env.META.list({ cursor, limit: 100 })

      for (const key of list.keys) {
        const raw = await env.META.get(key.name)
        if (!raw) continue

        try {
          const meta: TrackMeta = JSON.parse(raw)
          if (isExpired(meta)) {
            await Promise.all([
              env.PLAYER.delete(`${key.name}.mp3`),
              env.META.delete(key.name),
            ])
            deleted++
          }
        } catch {
          // 不正なデータは削除
          await env.META.delete(key.name)
        }
      }

      cursor = list.list_complete ? undefined : list.cursor
    } while (cursor)

    console.log(`[Cron] Cleaned up ${deleted} expired tracks`)
  },
}
