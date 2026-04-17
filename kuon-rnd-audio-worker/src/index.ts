/// <reference types="@cloudflare/workers-types" />
import { Hono } from 'hono'
import { cors } from 'hono/cors'

export interface Env {
  AUDIO: R2Bucket
  UPLOAD_SECRET?: string
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors({
  origin: ['https://kuon-rnd.com', 'http://localhost:3000'],
  allowMethods: ['GET', 'PUT', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Range', 'Authorization'],
  credentials: false,
}))

app.get('/', (c) => {
  return c.json({ status: 'ok', message: 'Kuon R&D Audio Worker v1' })
})

// 音声ファイルをストリーミング配信（認証不要・無料試聴）
app.get('/api/audio/:fileKey{.+}', async (c) => {
  const fileKey = c.req.param('fileKey')
  const range = c.req.header('Range')

  // .mov / .mp4 は video/mp4 で配信（Chrome が video/quicktime を再生不可のため）
  const ext = fileKey.split('.').pop()?.toLowerCase()
  const overrideType = (ext === 'mov' || ext === 'mp4') ? 'video/mp4' : null

  // ─────────────────────────────────────────────
  // Range リクエスト（シーク・バッファリング）
  // R2 から "当該バイト範囲のみ" を取得することで
  // Content-Length と body の不一致による再生バグを防ぐ
  // ─────────────────────────────────────────────
  if (range) {
    // まずメタデータでファイルサイズを取得
    const head = await c.env.AUDIO.head(fileKey)
    if (!head) {
      return c.json({ error: 'ファイルが見つかりません' }, 404)
    }
    const size = head.size

    // Range ヘッダをパース（bytes=START-END / bytes=START- / bytes=-SUFFIX）
    const spec = range.replace(/^bytes=/, '').trim()
    const [startStr, endStr] = spec.split('-')

    let start: number
    let end: number
    if (startStr === '' && endStr !== '') {
      // suffix-length: 末尾 N バイト
      const suffix = parseInt(endStr, 10)
      if (!Number.isFinite(suffix) || suffix <= 0) {
        return new Response('Range Not Satisfiable', {
          status: 416,
          headers: { 'Content-Range': `bytes */${size}` },
        })
      }
      start = Math.max(0, size - suffix)
      end = size - 1
    } else {
      start = parseInt(startStr, 10) || 0
      end = endStr ? parseInt(endStr, 10) : size - 1
    }

    // 範囲外チェック
    if (start < 0 || start >= size || end >= size || start > end) {
      return new Response('Range Not Satisfiable', {
        status: 416,
        headers: { 'Content-Range': `bytes */${size}` },
      })
    }

    const chunkSize = end - start + 1

    // ★ 重要: R2 に range を渡して "必要なバイトだけ" を取得する
    const ranged = await c.env.AUDIO.get(fileKey, {
      range: { offset: start, length: chunkSize },
    })
    if (!ranged) {
      return c.json({ error: 'ファイルが見つかりません' }, 404)
    }

    const rawType = ranged.httpMetadata?.contentType || 'audio/mpeg'
    const contentType = overrideType || rawType

    const headers = new Headers()
    headers.set('Content-Type', contentType)
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`)
    headers.set('Accept-Ranges', 'bytes')
    headers.set('Content-Length', String(chunkSize))
    headers.set('Cache-Control', 'public, max-age=31536000, immutable')

    return new Response(ranged.body, { status: 206, headers })
  }

  // ─────────────────────────────────────────────
  // 通常リクエスト（Range なし）
  // ─────────────────────────────────────────────
  const object = await c.env.AUDIO.get(fileKey)
  if (!object) {
    return c.json({ error: 'ファイルが見つかりません' }, 404)
  }

  const rawType = object.httpMetadata?.contentType || 'audio/mpeg'
  const contentType = overrideType || rawType

  const headers = new Headers()
  headers.set('Content-Type', contentType)
  headers.set('Accept-Ranges', 'bytes')
  headers.set('Content-Length', String(object.size))
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')

  return new Response(object.body, { headers })
})

// ─────────────────────────────────────────────
// アップロード（投稿音源 → submissions/ に保存）
// 認証: Authorization: Bearer <UPLOAD_SECRET>
// ─────────────────────────────────────────────
app.put('/api/upload/:fileKey{.+}', async (c) => {
  const secret = c.env.UPLOAD_SECRET
  if (!secret) {
    return c.json({ error: 'Upload not configured' }, 500)
  }

  const auth = c.req.header('Authorization')
  if (!auth || auth !== `Bearer ${secret}`) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const fileKey = c.req.param('fileKey')

  // submissions/ プレフィックスを強制（安全のため）
  if (!fileKey.startsWith('submissions/')) {
    return c.json({ error: 'Uploads must go to submissions/' }, 400)
  }

  const body = await c.req.arrayBuffer()

  // 20MB 制限
  if (body.byteLength > 20 * 1024 * 1024) {
    return c.json({ error: 'File too large (max 20MB)' }, 413)
  }

  await c.env.AUDIO.put(fileKey, body, {
    httpMetadata: { contentType: 'audio/mpeg' },
  })

  return c.json({ ok: true, key: fileKey, size: body.byteLength })
})

export default app
