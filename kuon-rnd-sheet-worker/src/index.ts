/// <reference types="@cloudflare/workers-types" />
/**
 * ============================================================================
 * KUON SHEET — Cloudflare Worker
 * ============================================================================
 *
 * シンガーソングライター・ジャズミュージシャン・ポップス作曲家のための
 * リードシート (メロディ + コードネーム + 歌詞) 統合エディタ。
 *
 * 機能:
 *   - 画像スキャン: 手書き/印刷リードシート → ABC notation 自動変換
 *     (Workers AI Llama 3.2 11B Vision で OCR)
 *   - 譜面保存: ユーザーごとに KV にリードシート保存
 *     (Free 10 譜面まで、Concerto+ 無制限)
 *
 * 哲学: §49 「AI 1 次認識 + ユーザー校正 + 美しい清書」
 *
 * エンドポイント:
 *   POST   /api/sheet/scan           画像 (base64) → ABC notation
 *   POST   /api/sheet/save           譜面保存 (id 指定で更新)
 *   GET    /api/sheet/list           ユーザーの譜面一覧
 *   GET    /api/sheet/:id            単一譜面取得
 *   DELETE /api/sheet/:id            譜面削除
 *
 * 2026-04-30 初版
 * ============================================================================
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  AI: Ai;
  SHEETS: KVNamespace;
  SHEET_SECRET: string;
  AUTH_WORKER_URL: string;
  ENVIRONMENT?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// 型定義
// ──────────────────────────────────────────────────────────────────────────
type LyricsLang = 'ja' | 'en' | 'es' | 'de';

interface SheetData {
  id: string;
  email: string;
  title: string;
  abc: string;            // ABC notation (内部標準フォーマット)
  lyricsLang: LyricsLang;
  createdAt: string;
  updatedAt: string;
}

interface ScanResponse {
  abc: string;
  confidence: 'high' | 'medium' | 'low';
  warnings?: string[];
  detectedKey?: string;
  detectedTimeSig?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// 設定
// ──────────────────────────────────────────────────────────────────────────
const FREE_SHEET_LIMIT = 10;            // Free プランの保存譜面数上限
const MAX_SHEETS_PER_USER = 1000;       // Concerto+ でも事故防止のため
const MAX_ABC_LENGTH = 50_000;          // 1 譜面の ABC 文字列最大長

// ──────────────────────────────────────────────────────────────────────────
// Hono app
// ──────────────────────────────────────────────────────────────────────────
const app = new Hono<{ Bindings: Env; Variables: { userEmail: string; planTier: string } }>();

app.use('*', cors({
  origin: ['https://kuon-rnd.com', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-User-Email', 'X-User-Plan'],
  credentials: false,
}));

const requireAuth = async (c: any, next: any) => {
  const auth = c.req.header('Authorization');
  if (!auth || auth !== `Bearer ${c.env.SHEET_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const email = c.req.header('X-User-Email');
  const plan = c.req.header('X-User-Plan') || 'free';
  if (!email) return c.json({ error: 'Missing user email' }, 401);
  c.set('userEmail', email);
  c.set('planTier', plan);
  await next();
};

// ──────────────────────────────────────────────────────────────────────────
// Health
// ──────────────────────────────────────────────────────────────────────────
app.get('/', (c) =>
  c.json({
    status: 'ok',
    service: 'KUON SHEET Worker',
    version: '1.0.0',
  }),
);

// ──────────────────────────────────────────────────────────────────────────
// POST /api/sheet/scan — 画像 → ABC notation
// body: { imageBase64: string, lyricsLang?: 'ja'|'en'|'es'|'de' }
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/sheet/scan', requireAuth, async (c) => {
  try {
    const body = await c.req.json<{
      imageBase64: string;
      lyricsLang?: LyricsLang;
    }>();

    const { imageBase64 } = body;
    const lyricsLang = body.lyricsLang || 'ja';

    if (!imageBase64 || imageBase64.length < 100) {
      return c.json({ error: 'Invalid or missing image' }, 400);
    }

    // base64 から data URL の prefix を除去 (もし含まれていたら)
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');

    // base64 → Uint8Array (Workers AI Vision に渡す形式)
    const binaryString = atob(cleanBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const systemPrompt = buildScanSystemPrompt(lyricsLang);

    // Workers AI Llama 3.2 11B Vision で画像認識
    const aiResult = (await c.env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct' as any, {
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: 'Read this lead sheet image and output ONLY ABC notation as specified. No preamble, no explanation, just the ABC code.',
        },
      ],
      image: Array.from(bytes),
      max_tokens: 2000,
      temperature: 0.2,
    })) as any;

    const rawText: string = aiResult.response || aiResult.description || '';

    // ABC notation を抽出 (LLM が前置き付きで返してくることがある)
    let abc = extractAbcFromResponse(rawText);

    // ABC が空または短すぎる場合のフォールバック
    if (!abc || abc.length < 20) {
      abc = createFallbackAbc(rawText, lyricsLang);
    }

    const response: ScanResponse = {
      abc,
      confidence: estimateConfidence(rawText, abc),
      warnings: validateAbc(abc),
    };

    return c.json({ ok: true, ...response });
  } catch (err) {
    console.error('scan error:', err);
    return c.json(
      { error: 'Scan failed', message: err instanceof Error ? err.message : 'unknown' },
      500,
    );
  }
});

// ──────────────────────────────────────────────────────────────────────────
// POST /api/sheet/save — 譜面保存 / 更新
// body: { id?: string, title: string, abc: string, lyricsLang?: 'ja'|'en'|'es'|'de' }
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/sheet/save', requireAuth, async (c) => {
  try {
    const body = await c.req.json<{
      id?: string;
      title: string;
      abc: string;
      lyricsLang?: LyricsLang;
    }>();

    const { id, title, abc } = body;
    const lyricsLang = body.lyricsLang || 'ja';

    if (!title || title.trim().length < 1) {
      return c.json({ error: 'Title required' }, 400);
    }
    if (!abc || abc.trim().length < 5) {
      return c.json({ error: 'ABC content required' }, 400);
    }
    if (abc.length > MAX_ABC_LENGTH) {
      return c.json({ error: 'ABC content too long' }, 413);
    }

    const userEmail = c.get('userEmail');
    const planTier = c.get('planTier');

    // 既存譜面リスト取得
    const indexKey = `index:${userEmail}`;
    const indexRaw = await c.env.SHEETS.get(indexKey);
    let ids: string[] = indexRaw ? JSON.parse(indexRaw) : [];

    const now = new Date().toISOString();
    const sheetId = id || generateId();

    // 新規作成時の制限チェック
    if (!id) {
      // Free プラン制限
      if (isFreeOrPrelude(planTier) && ids.length >= FREE_SHEET_LIMIT) {
        return c.json(
          {
            error: 'FREE_LIMIT_EXCEEDED',
            limit: FREE_SHEET_LIMIT,
            current: ids.length,
            message: `Free プランは ${FREE_SHEET_LIMIT} 譜面まで保存できます。Concerto プランで無制限にご利用いただけます。`,
          },
          403,
        );
      }
      // 上位プランの安全装置
      if (ids.length >= MAX_SHEETS_PER_USER) {
        return c.json({ error: 'Max sheets per user reached' }, 403);
      }
    }

    // 既存譜面の取得 (更新時は createdAt を保つ)
    let createdAt = now;
    if (id) {
      const existingRaw = await c.env.SHEETS.get(`sheet:${userEmail}:${id}`);
      if (existingRaw) {
        const existing: SheetData = JSON.parse(existingRaw);
        createdAt = existing.createdAt;
      }
    }

    const sheet: SheetData = {
      id: sheetId,
      email: userEmail,
      title: title.slice(0, 200),
      abc,
      lyricsLang,
      createdAt,
      updatedAt: now,
    };

    await c.env.SHEETS.put(`sheet:${userEmail}:${sheetId}`, JSON.stringify(sheet), {
      expirationTtl: 365 * 24 * 60 * 60 * 5, // 5 年保持
    });

    if (!id && !ids.includes(sheetId)) {
      ids.unshift(sheetId);
      await c.env.SHEETS.put(indexKey, JSON.stringify(ids));
    }

    return c.json({ ok: true, id: sheetId, sheet });
  } catch (err) {
    console.error('save error:', err);
    return c.json(
      { error: 'Save failed', message: err instanceof Error ? err.message : 'unknown' },
      500,
    );
  }
});

// ──────────────────────────────────────────────────────────────────────────
// GET /api/sheet/list — ユーザーの譜面一覧
// ──────────────────────────────────────────────────────────────────────────
app.get('/api/sheet/list', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const indexRaw = await c.env.SHEETS.get(`index:${userEmail}`);
  if (!indexRaw) return c.json({ ok: true, sheets: [] });

  const ids: string[] = JSON.parse(indexRaw);
  const sheets: Array<{ id: string; title: string; updatedAt: string; lyricsLang: string }> = [];

  const fetched = await Promise.all(
    ids.slice(0, 100).map((id) => c.env.SHEETS.get(`sheet:${userEmail}:${id}`)),
  );
  for (const raw of fetched) {
    if (!raw) continue;
    const sh: SheetData = JSON.parse(raw);
    sheets.push({ id: sh.id, title: sh.title, updatedAt: sh.updatedAt, lyricsLang: sh.lyricsLang });
  }
  return c.json({ ok: true, sheets });
});

app.get('/api/sheet/:id', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const id = c.req.param('id');
  const raw = await c.env.SHEETS.get(`sheet:${userEmail}:${id}`);
  if (!raw) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true, sheet: JSON.parse(raw) });
});

app.delete('/api/sheet/:id', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const id = c.req.param('id');
  await c.env.SHEETS.delete(`sheet:${userEmail}:${id}`);
  const indexKey = `index:${userEmail}`;
  const indexRaw = await c.env.SHEETS.get(indexKey);
  if (indexRaw) {
    const ids: string[] = JSON.parse(indexRaw);
    await c.env.SHEETS.put(indexKey, JSON.stringify(ids.filter((i) => i !== id)));
  }
  return c.json({ ok: true });
});

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function buildScanSystemPrompt(lyricsLang: LyricsLang): string {
  const langInstr: Record<LyricsLang, string> = {
    ja: 'Japanese (preserve hiragana/katakana/kanji as-is, no romanization)',
    en: 'English',
    es: 'Spanish (preserve accents like á é í ó ú ñ)',
    de: 'German (preserve umlauts like ä ö ü ß)',
  };

  return `You are an OMR (Optical Music Recognition) engine for LEAD SHEETS.
A lead sheet contains: melody (single voice), chord symbols above the staff, and optionally lyrics below.

Output ONLY ABC notation (https://abcnotation.com/wiki/abc:standard:v2.1) following these rules:

ABC HEADER:
  X:1
  T:[song title from image, or "Untitled"]
  M:[time signature, e.g. 4/4, 3/4]
  L:1/4 (default note length)
  K:[detected key, e.g. C, F, Bb, A minor — use minor with "m" suffix]

BODY:
  - Notes: lowercase = octave 4 (c d e f g a b), uppercase = octave 3 (C D E F G A B)
    Higher: c' d' e'... Lower: C, D, E,...
  - Durations: c2 = half, c4 = whole, c/2 = eighth, c/4 = sixteenth
  - Bars: | (regular bar), || (double bar), |] (end)
  - Chords: above the staff, in quotes BEFORE the note: "Cmaj7"c "F7"f
    Use jazz notation: maj7 m7 dim 7sus4 13 etc.
  - Lyrics: w: line BELOW each music line, syllables separated by spaces or hyphens
    e.g. w: When-I- find- my- self- in- times- of- trou-ble

LANGUAGE: lyrics in ${langInstr[lyricsLang]}

OUTPUT RULES:
- Output ONLY ABC code, no markdown fences, no preamble, no explanation
- If unsure about a specific note, make best guess (user will correct in editor)
- If image is unclear, output a minimal valid ABC with the visible parts only
- Always include valid X:, T:, M:, L:, K: headers
- For handwritten scores, expect 70-85% accuracy — that is acceptable; user will correct

Example output:
X:1
T:Yesterday
M:4/4
L:1/4
K:F
"F"f3 e | "Em7"d3 c | "A7"B3 A | "Dm"D6 |
w: Yes-ter-day all my trou-bles seemed so far a-way
"Bb"B3 c | "C7"d3 e | "F"f6 |`;
}

function extractAbcFromResponse(text: string): string {
  if (!text) return '';

  // ```abc ... ``` で囲まれている場合
  const fenced = text.match(/```(?:abc)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();

  // X: で始まる行から末尾までを抽出
  const xLineIndex = text.search(/^X:\s*\d/m);
  if (xLineIndex >= 0) {
    return text.slice(xLineIndex).trim();
  }

  // それ以外はそのまま (もし ABC らしき文字が含まれていれば)
  if (/[A-Ga-g]/.test(text) && /\|/.test(text)) {
    return text.trim();
  }

  return '';
}

function createFallbackAbc(rawText: string, lyricsLang: LyricsLang): string {
  // AI が ABC を返せなかった場合の最小譜面
  const titleHint = rawText.match(/T[i:]?\s*(.+)/i)?.[1]?.slice(0, 50) || 'Untitled';
  return `X:1
T:${titleHint}
M:4/4
L:1/4
K:C
% AI が画像から ABC を抽出できませんでした。手動で入力してください。
"C"c4 | "F"f4 | "G7"g4 | "C"c4 |`;
}

function estimateConfidence(rawText: string, abc: string): 'high' | 'medium' | 'low' {
  if (!abc || abc.length < 30) return 'low';
  // ABC らしさをスコアリング
  const hasHeader = /^X:\s*\d/m.test(abc) && /^K:/m.test(abc);
  const hasBars = (abc.match(/\|/g) || []).length >= 2;
  const hasChords = /"[A-G][^"]*"/.test(abc);
  const hasLyrics = /^w:/m.test(abc);

  let score = 0;
  if (hasHeader) score += 2;
  if (hasBars) score += 1;
  if (hasChords) score += 1;
  if (hasLyrics) score += 1;

  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

function validateAbc(abc: string): string[] {
  const warnings: string[] = [];
  if (!/^X:\s*\d/m.test(abc)) warnings.push('Missing X: header');
  if (!/^K:/m.test(abc)) warnings.push('Missing K: (key) header');
  if (!/^M:/m.test(abc)) warnings.push('Missing M: (time signature) header');
  if (!/\|/.test(abc)) warnings.push('No bar lines detected');
  return warnings;
}

function isFreeOrPrelude(planTier: string): boolean {
  // Free / Prelude は譜面保存数制限あり
  return planTier === 'free' || planTier === 'prelude';
}

function generateId(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default app;
