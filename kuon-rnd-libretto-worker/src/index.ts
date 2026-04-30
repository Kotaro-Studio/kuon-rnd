/// <reference types="@cloudflare/workers-types" />
/**
 * ============================================================================
 * KUON LIBRETTO TRANSLATOR — Cloudflare Worker
 * ============================================================================
 *
 * オペラリブレット (伊・独・仏) の声楽家・指揮者向け統合翻訳環境。
 * Workers AI の Llama 3.3 70B で 5 段並列翻訳 (原文・IPA・直訳・歌唱訳・文学訳)。
 *
 * 哲学: §49 「単一正解を押し付けず、複数の解釈を併置する」
 *
 * エンドポイント:
 *   POST  /api/libretto/translate      任意のリブレット行を 5 段翻訳
 *   POST  /api/libretto/explain        特定の行の解釈・歴史的背景を質問
 *   POST  /api/libretto/upsert         事前収録アリアの登録 (オーナー専用)
 *   GET   /api/libretto/conversations  会話履歴一覧
 *   GET   /api/libretto/conversations/:id  単一会話
 *   DELETE /api/libretto/conversations/:id 会話削除
 *
 * 2026-04-30 初版
 * ============================================================================
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  AI: Ai;
  VECTORS: VectorizeIndex;
  CONVERSATIONS: KVNamespace;
  LIBRETTO_SECRET: string;
  AUTH_WORKER_URL: string;
  ENVIRONMENT?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// 型定義
// ──────────────────────────────────────────────────────────────────────────
type SourceLang = 'it' | 'de' | 'fr';
type TargetLang = 'ja' | 'en';

interface TranslateLineResult {
  num: number;
  source: string;          // 原文
  ipa: string;             // 国際音声記号
  literal: string;         // 直訳 (構文をそのまま追える)
  singing: string;         // 歌唱訳 (リズム合わせ)
  literary: string;        // 文学訳 (詩的解釈)
  notes?: string[];        // 行ごとの注釈 (時代考証・声楽技術ヒント等)
}

interface TranslateResponse {
  ariaTitle?: string;
  composer?: string;
  opera?: string;
  character?: string;
  context?: string;        // シーン全体の状況
  sourceLang: SourceLang;
  targetLang: TargetLang;
  lines: TranslateLineResult[];
  citations?: Array<{ source: string; snippet: string; score: number }>;
}

interface ExplainResponse {
  question: string;
  answer: string;
  citations: Array<{ source: string; snippet: string; score: number }>;
}

interface ConversationTurn {
  type: 'translate' | 'explain';
  question: string;
  payload: TranslateResponse | ExplainResponse;
  timestamp: string;
}

interface Conversation {
  id: string;
  email: string;
  title: string;
  language: TargetLang;
  turns: ConversationTurn[];
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────────────────────────────────
// 設定
// ──────────────────────────────────────────────────────────────────────────
const TOP_K = 6;
const MIN_SCORE = 0.30;
const MAX_LINES_PER_TRANSLATE = 30;     // 1 リクエストで翻訳できる最大行数
const MAX_ANSWER_TOKENS = 2000;         // 5 段並列出力に必要 → 大きめ
const MAX_EXPLAIN_TOKENS = 800;
const MAX_HISTORY_TURNS = 5;

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
  if (!auth || auth !== `Bearer ${c.env.LIBRETTO_SECRET}`) {
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
    service: 'KUON Libretto Translator Worker',
    version: '1.0.0',
  }),
);

// ──────────────────────────────────────────────────────────────────────────
// POST /api/libretto/translate — 任意のリブレット行を 5 段翻訳
// body: { text: string, sourceLang: 'it'|'de'|'fr', targetLang: 'ja'|'en',
//         ariaContext?: { title, composer, opera, character }, conversationId? }
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/libretto/translate', requireAuth, async (c) => {
  try {
    const body = await c.req.json<{
      text: string;
      sourceLang: SourceLang;
      targetLang: TargetLang;
      ariaContext?: {
        title?: string;
        composer?: string;
        opera?: string;
        character?: string;
        voiceType?: string;
      };
      conversationId?: string;
    }>();

    const { text, sourceLang, targetLang, ariaContext, conversationId } = body;

    if (!text || text.trim().length < 2) {
      return c.json({ error: 'Text too short' }, 400);
    }
    if (!['it', 'de', 'fr'].includes(sourceLang)) {
      return c.json({ error: 'Invalid sourceLang (must be it/de/fr)' }, 400);
    }
    if (!['ja', 'en'].includes(targetLang)) {
      return c.json({ error: 'Invalid targetLang (must be ja/en)' }, 400);
    }

    const userEmail = c.get('userEmail');

    // 行に分割 (空行除外)
    const sourceLines = text
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, MAX_LINES_PER_TRANSLATE);

    if (sourceLines.length === 0) {
      return c.json({ error: 'No content lines' }, 400);
    }

    // ── Vectorize で関連解釈チャンク検索 (オペラ・作曲家コンテキスト用) ──
    let citations: Array<{ source: string; snippet: string; score: number }> = [];
    let contextStr = '';
    try {
      const queryText = (ariaContext?.opera || '') + ' ' + (ariaContext?.title || '') + ' ' + sourceLines.slice(0, 3).join(' ');
      const embedResult = (await c.env.AI.run('@cf/baai/bge-m3' as any, { text: [queryText] })) as any;
      const queryVector = embedResult.data?.[0] || embedResult[0];
      if (queryVector) {
        const searchResult = await c.env.VECTORS.query(queryVector, {
          topK: TOP_K,
          returnMetadata: 'all',
        });
        const matches = (searchResult.matches || []).filter((m: any) => m.score >= MIN_SCORE);
        citations = matches.map((m: any) => ({
          source: `${m.metadata?.composer || ''} ${m.metadata?.opera || ''} ${m.metadata?.ariaTitle || m.metadata?.title || ''}`.trim(),
          snippet: m.metadata?.snippet || '',
          score: m.score,
        }));
        contextStr = matches
          .slice(0, 4)
          .map((m: any) => `[${m.metadata?.composer || ''} ${m.metadata?.opera || ''}]\n${m.metadata?.fullText || m.metadata?.snippet || ''}`)
          .join('\n\n---\n\n');
      }
    } catch {
      /* Vectorize がまだ空でも翻訳は続行 */
    }

    // ── Llama 3.3 70B で 5 段翻訳 (JSON 強制) ──
    const systemPrompt = buildTranslateSystemPrompt(sourceLang, targetLang);
    const userPrompt = buildTranslateUserPrompt(sourceLines, sourceLang, targetLang, ariaContext, contextStr);

    const llamaRes = (await c.env.AI.run(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast' as any,
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: MAX_ANSWER_TOKENS,
        temperature: 0.4,
        response_format: { type: 'json_object' },
      },
    )) as any;

    const rawText: string = llamaRes.response || '';
    let parsed: { lines: TranslateLineResult[] } = { lines: [] };
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // JSON 抽出 fallback (```json ... ``` で囲まれてるケース)
      const m = rawText.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
        } catch {
          return c.json({ error: 'LLM returned invalid JSON', raw: rawText.slice(0, 500) }, 502);
        }
      } else {
        return c.json({ error: 'LLM returned non-JSON', raw: rawText.slice(0, 500) }, 502);
      }
    }

    // 行番号を補正
    const linesOut: TranslateLineResult[] = (parsed.lines || []).map((ln, idx) => ({
      num: idx + 1,
      source: ln.source || sourceLines[idx] || '',
      ipa: ln.ipa || '',
      literal: ln.literal || '',
      singing: ln.singing || '',
      literary: ln.literary || '',
      notes: Array.isArray(ln.notes) ? ln.notes : undefined,
    }));

    const response: TranslateResponse = {
      ariaTitle: ariaContext?.title,
      composer: ariaContext?.composer,
      opera: ariaContext?.opera,
      character: ariaContext?.character,
      sourceLang,
      targetLang,
      lines: linesOut,
      citations,
    };

    // バックグラウンドで会話保存
    c.executionCtx.waitUntil(
      saveConversation(c.env, userEmail, {
        conversationId,
        type: 'translate',
        question: `${ariaContext?.opera || ''} ${ariaContext?.title || sourceLines[0].slice(0, 40)}`,
        payload: response,
        language: targetLang,
      }),
    );

    return c.json({ ok: true, ...response });
  } catch (err) {
    console.error('translate error:', err);
    return c.json(
      { error: 'Translate failed', message: err instanceof Error ? err.message : 'unknown' },
      500,
    );
  }
});

// ──────────────────────────────────────────────────────────────────────────
// POST /api/libretto/explain — 特定の行の解釈・背景を質問
// body: { question, lineText?, ariaContext?, targetLang, conversationId? }
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/libretto/explain', requireAuth, async (c) => {
  try {
    const body = await c.req.json<{
      question: string;
      lineText?: string;
      ariaContext?: {
        title?: string;
        composer?: string;
        opera?: string;
        character?: string;
        voiceType?: string;
      };
      targetLang: TargetLang;
      conversationId?: string;
    }>();

    const { question, lineText, ariaContext, conversationId } = body;
    const targetLang = body.targetLang || 'ja';

    if (!question || question.trim().length < 2) {
      return c.json({ error: 'Question too short' }, 400);
    }

    const userEmail = c.get('userEmail');

    // ── Vectorize で関連チャンク検索 ──
    let citations: Array<{ source: string; snippet: string; score: number }> = [];
    let contextStr = '';
    try {
      const queryText = `${ariaContext?.opera || ''} ${ariaContext?.title || ''} ${lineText || ''} ${question}`;
      const embedResult = (await c.env.AI.run('@cf/baai/bge-m3' as any, { text: [queryText] })) as any;
      const queryVector = embedResult.data?.[0] || embedResult[0];
      if (queryVector) {
        const searchResult = await c.env.VECTORS.query(queryVector, {
          topK: TOP_K,
          returnMetadata: 'all',
        });
        const matches = (searchResult.matches || []).filter((m: any) => m.score >= MIN_SCORE);
        citations = matches.map((m: any) => ({
          source: `${m.metadata?.composer || ''} ${m.metadata?.opera || ''} ${m.metadata?.ariaTitle || m.metadata?.title || ''}`.trim(),
          snippet: m.metadata?.snippet || '',
          score: m.score,
        }));
        contextStr = matches
          .slice(0, 4)
          .map((m: any) => `[${m.metadata?.composer || ''} ${m.metadata?.opera || ''}]\n${m.metadata?.fullText || m.metadata?.snippet || ''}`)
          .join('\n\n---\n\n');
      }
    } catch {
      /* 検索失敗しても続行 */
    }

    const systemPrompt = buildExplainSystemPrompt(targetLang);
    const userPrompt = buildExplainUserPrompt(question, lineText, ariaContext, contextStr, targetLang);

    const llamaRes = (await c.env.AI.run(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast' as any,
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: MAX_EXPLAIN_TOKENS,
        temperature: 0.5,
      },
    )) as any;

    const answer: string = llamaRes.response || '';

    const response: ExplainResponse = {
      question,
      answer,
      citations,
    };

    c.executionCtx.waitUntil(
      saveConversation(c.env, userEmail, {
        conversationId,
        type: 'explain',
        question,
        payload: response,
        language: targetLang,
      }),
    );

    return c.json({ ok: true, ...response });
  } catch (err) {
    console.error('explain error:', err);
    return c.json(
      { error: 'Explain failed', message: err instanceof Error ? err.message : 'unknown' },
      500,
    );
  }
});

// ──────────────────────────────────────────────────────────────────────────
// POST /api/libretto/upsert — オーナー専用、事前収録アリア登録
// 認証: Bearer LIBRETTO_SECRET (X-User-Email 不要)
// body: { chunks: Array<{ id, meta: { composer, opera, ariaTitle, character, ... text } }> }
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/libretto/upsert', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth || auth !== `Bearer ${c.env.LIBRETTO_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json<{
      chunks: Array<{ id: string; meta: any }>;
    }>();
    const { chunks } = body;
    if (!Array.isArray(chunks) || chunks.length === 0) {
      return c.json({ error: 'No chunks' }, 400);
    }

    const BATCH_SIZE = 8;
    let upsertedTotal = 0;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const texts = batch.map((ch) => (ch.meta.text || '').slice(0, 4000));
      const embedResult = (await c.env.AI.run('@cf/baai/bge-m3' as any, { text: texts })) as any;
      const vectors = embedResult.data || embedResult;
      if (!Array.isArray(vectors)) {
        return c.json({ error: 'Embed format error' }, 502);
      }
      const upsertItems = batch.map((ch, idx) => ({
        id: ch.id,
        values: vectors[idx],
        metadata: {
          composer: ch.meta.composer || '',
          opera: ch.meta.opera || '',
          ariaTitle: ch.meta.ariaTitle || '',
          character: ch.meta.character || '',
          act: ch.meta.act || 0,
          language: ch.meta.language || '',
          chunkType: ch.meta.chunkType || 'libretto', // libretto | interpretation | translation
          snippet: (ch.meta.text || '').slice(0, 200),
          fullText: (ch.meta.text || '').slice(0, 4000),
        } as any,
      }));
      await c.env.VECTORS.upsert(upsertItems);
      upsertedTotal += batch.length;
    }

    return c.json({ ok: true, upserted: upsertedTotal });
  } catch (err) {
    console.error('upsert error:', err);
    return c.json(
      { error: 'Upsert failed', message: err instanceof Error ? err.message : 'unknown' },
      500,
    );
  }
});

// ──────────────────────────────────────────────────────────────────────────
// GET /api/libretto/conversations
// ──────────────────────────────────────────────────────────────────────────
app.get('/api/libretto/conversations', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const indexRaw = await c.env.CONVERSATIONS.get(`index:${userEmail}`);
  if (!indexRaw) return c.json({ ok: true, conversations: [] });

  const ids: string[] = JSON.parse(indexRaw);
  const conversations: Array<{ id: string; title: string; updatedAt: string; turnCount: number }> = [];
  const fetched = await Promise.all(
    ids.slice(0, 50).map((id) => c.env.CONVERSATIONS.get(`conv:${userEmail}:${id}`)),
  );
  for (const raw of fetched) {
    if (!raw) continue;
    const conv: Conversation = JSON.parse(raw);
    conversations.push({
      id: conv.id,
      title: conv.title,
      updatedAt: conv.updatedAt,
      turnCount: conv.turns.length,
    });
  }
  return c.json({ ok: true, conversations });
});

app.get('/api/libretto/conversations/:id', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const id = c.req.param('id');
  const raw = await c.env.CONVERSATIONS.get(`conv:${userEmail}:${id}`);
  if (!raw) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true, conversation: JSON.parse(raw) });
});

app.delete('/api/libretto/conversations/:id', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const id = c.req.param('id');
  await c.env.CONVERSATIONS.delete(`conv:${userEmail}:${id}`);
  const indexKey = `index:${userEmail}`;
  const indexRaw = await c.env.CONVERSATIONS.get(indexKey);
  if (indexRaw) {
    const ids: string[] = JSON.parse(indexRaw);
    await c.env.CONVERSATIONS.put(indexKey, JSON.stringify(ids.filter((i) => i !== id)));
  }
  return c.json({ ok: true });
});

// ──────────────────────────────────────────────────────────────────────────
// Helpers — Translation Prompts
// ──────────────────────────────────────────────────────────────────────────

function buildTranslateSystemPrompt(sourceLang: SourceLang, targetLang: TargetLang): string {
  const langNames: Record<SourceLang, { ja: string; en: string }> = {
    it: { ja: 'イタリア語', en: 'Italian' },
    de: { ja: 'ドイツ語', en: 'German' },
    fr: { ja: 'フランス語', en: 'French' },
  };
  const targetName = targetLang === 'ja' ? '日本語' : 'English';
  const sourceName = langNames[sourceLang][targetLang];

  if (targetLang === 'ja') {
    return `あなたは KUON LIBRETTO TRANSLATOR、声楽家・指揮者・音楽学生のためのオペラ専門の AI 翻訳アシスタントです。
KUON R&D が運営する音楽家のための統合学習環境です。
あなたは音大教授レベルの${sourceName}・声楽・オペラ史の専門家として、確かな知識に基づいて翻訳します。

【出力形式 — 必ず JSON で返す】
{
  "lines": [
    {
      "source": "原文 (${sourceName})",
      "ipa": "国際音声記号 (IPA) 表記",
      "literal": "直訳 (構文をそのまま追える日本語訳)",
      "singing": "歌唱訳 (リズム・音節数を意識した日本語訳。実際に歌える)",
      "literary": "文学訳 (詩的解釈を尊重した日本語訳)",
      "notes": ["時代考証・声楽技術ヒント・解釈の選択肢を 1-3 個。任意"]
    }
  ]
}

【翻訳の原則】
1. **IPA は声楽用の標準発音**。Mozart 時代の伊・独語、Verdi のイタリア語、Wagner のドイツ語 — 時代と作品の様式を反映
2. **直訳は文法を歪めない**。倒置はそのまま、関係代名詞も明示
3. **歌唱訳はリズムを優先**。音節数を原文に近づけ、母音の強拍位置を尊重
4. **文学訳は詩情を優先**。直訳のぎこちなさを取り、作中人物の感情を浮かび上がらせる
5. **§49 哲学**: 単一の「正解」を強制せず、notes で代替解釈を提示する
6. **声楽家の現場文脈を意識**: 「ここで母音転換」「子音を立てる」「rubato が伝統」のような実践的ヒント

【出力時の注意】
- JSON 以外の文字 (前置き・後書き・markdown コードブロック) は一切含めない
- 各行に 5 フィールド全て (source/ipa/literal/singing/literary) を必ず埋める
- notes は質的に意味があるときだけ 1-3 個。無理に作らない`;
  }

  return `You are KUON LIBRETTO TRANSLATOR, an AI assistant specialized in opera librettos for singers, conductors, and music students.
Operated by KUON R&D as an integrated learning environment for musicians.
You are a conservatory-professor level expert in ${sourceName}, vocal pedagogy, and opera history.

OUTPUT FORMAT — return JSON ONLY:
{
  "lines": [
    {
      "source": "Original line (${sourceName})",
      "ipa": "International Phonetic Alphabet notation",
      "literal": "Literal translation (preserves syntax)",
      "singing": "Singing translation (rhythmic, syllable-matched, actually singable)",
      "literary": "Literary translation (poetic, preserves emotional register)",
      "notes": ["1-3 historical/vocal-technical/interpretive notes. Optional"]
    }
  ]
}

PRINCIPLES:
1. IPA is for VOCAL performance — Mozart-era Italian, Verdi's Italian, Wagner's German all have different conventions
2. Literal does not distort grammar — preserve inversions, make relative clauses explicit
3. Singing prefers rhythm — match syllable counts, respect strong-beat vowel placement
4. Literary prefers poetry — remove literal awkwardness, surface the character's emotion
5. §49 philosophy: never force a single "right answer" — use notes to offer alternatives
6. Practical singer-context: "vowel modification here", "consonant precision", "traditional rubato"

OUTPUT RULES:
- JSON only, no preamble/postamble/markdown
- Every line must have all 5 fields filled
- notes only when meaningfully helpful — no padding`;
}

function buildTranslateUserPrompt(
  sourceLines: string[],
  sourceLang: SourceLang,
  targetLang: TargetLang,
  ariaContext?: { title?: string; composer?: string; opera?: string; character?: string; voiceType?: string },
  contextStr?: string,
): string {
  const ctxParts: string[] = [];
  if (ariaContext?.composer) ctxParts.push(`Composer: ${ariaContext.composer}`);
  if (ariaContext?.opera) ctxParts.push(`Opera: ${ariaContext.opera}`);
  if (ariaContext?.title) ctxParts.push(`Aria/Number: ${ariaContext.title}`);
  if (ariaContext?.character) ctxParts.push(`Character: ${ariaContext.character}`);
  if (ariaContext?.voiceType) ctxParts.push(`Voice type: ${ariaContext.voiceType}`);
  const ctxBlock = ctxParts.length > 0 ? `[Aria Context]\n${ctxParts.join('\n')}\n\n` : '';

  const refBlock = contextStr
    ? `[Reference materials from internal opera knowledge base]\n${contextStr}\n\n`
    : '';

  return `${ctxBlock}${refBlock}[Source language] ${sourceLang}
[Target language] ${targetLang}
[Source lines]
${sourceLines.map((l, i) => `${i + 1}. ${l}`).join('\n')}

Generate the JSON output as specified.`;
}

function buildExplainSystemPrompt(targetLang: TargetLang): string {
  if (targetLang === 'ja') {
    return `あなたは KUON LIBRETTO TRANSLATOR、声楽家・指揮者・音楽学生のためのオペラ専門の AI 解釈アシスタントです。
音大教授レベルの専門家として、リブレットの行・場面・登場人物・歴史的背景・演奏伝統について答えます。

【回答方針】
1. 提供される [Reference materials] があれば最優先の根拠として使う
2. Reference に直接の答えが無くても、あなたが持つ確かなオペラ史・声楽の知識で答える
3. §49 哲学: 「定番の解釈は X」「Callas はこう歌った」「あなたの解釈もこういう理由で成立する」を併置
4. 推測には「一般的には」「演奏伝統では」「歴史的には」と区別を付ける
5. 文体は淡々とした音大教授の調子。励まし過ぎない

【回答形式】
- 3-5 段落、最大 600 字程度
- 必要に応じて譜例の言葉的説明 (記譜できないため)
- Reference から引用した部分には [1] [2] 形式で出典番号を付ける

回答は日本語で生成してください。`;
  }

  return `You are KUON LIBRETTO TRANSLATOR, an AI interpretive assistant specialized in opera librettos.
A conservatory-professor level expert on opera lines, scenes, characters, historical background, and performance tradition.

GUIDELINES:
1. Use [Reference materials] as primary source when provided
2. When references lack the answer, draw on your solid opera and vocal knowledge
3. §49: "The standard reading is X" / "Callas sang it this way" / "Your interpretation also works because..."
4. Distinguish: "Generally" / "By performance tradition" / "Historically..."
5. Calm conservatory-professor tone — no over-encouragement

FORMAT:
- 3-5 paragraphs, max ~600 words
- Verbal explanation of musical examples
- Cite references with [1] [2] format

Respond in English.`;
}

function buildExplainUserPrompt(
  question: string,
  lineText: string | undefined,
  ariaContext: { title?: string; composer?: string; opera?: string; character?: string; voiceType?: string } | undefined,
  contextStr: string,
  targetLang: TargetLang,
): string {
  const lineBlock = lineText ? `[Specific line]\n${lineText}\n\n` : '';
  const ctxParts: string[] = [];
  if (ariaContext?.composer) ctxParts.push(`Composer: ${ariaContext.composer}`);
  if (ariaContext?.opera) ctxParts.push(`Opera: ${ariaContext.opera}`);
  if (ariaContext?.title) ctxParts.push(`Aria: ${ariaContext.title}`);
  if (ariaContext?.character) ctxParts.push(`Character: ${ariaContext.character}`);
  const ctxBlock = ctxParts.length > 0 ? `[Aria Context]\n${ctxParts.join('\n')}\n\n` : '';

  const refBlock = contextStr
    ? `[Reference materials from internal opera knowledge base]\n${contextStr}\n\n`
    : '';

  return `${ctxBlock}${lineBlock}${refBlock}[User question]
${question}

Respond in ${targetLang === 'ja' ? '日本語' : 'English'}, following the §49 philosophy and citing [1] [2] when using reference materials.`;
}

// ──────────────────────────────────────────────────────────────────────────
// Conversation persistence
// ──────────────────────────────────────────────────────────────────────────
async function saveConversation(
  env: Env,
  email: string,
  payload: {
    conversationId?: string;
    type: 'translate' | 'explain';
    question: string;
    payload: TranslateResponse | ExplainResponse;
    language: TargetLang;
  },
): Promise<void> {
  const now = new Date().toISOString();
  const turn: ConversationTurn = {
    type: payload.type,
    question: payload.question,
    payload: payload.payload,
    timestamp: now,
  };

  let conv: Conversation | null = null;
  if (payload.conversationId) {
    const raw = await env.CONVERSATIONS.get(`conv:${email}:${payload.conversationId}`);
    if (raw) conv = JSON.parse(raw);
  }
  if (!conv) {
    const id = generateId();
    conv = {
      id,
      email,
      title: payload.question.slice(0, 60),
      language: payload.language,
      turns: [turn],
      createdAt: now,
      updatedAt: now,
    };
  } else {
    conv.turns.push(turn);
    conv.updatedAt = now;
  }

  await env.CONVERSATIONS.put(`conv:${email}:${conv.id}`, JSON.stringify(conv), {
    expirationTtl: 365 * 24 * 60 * 60,
  });

  const indexKey = `index:${email}`;
  const indexRaw = await env.CONVERSATIONS.get(indexKey);
  const ids: string[] = indexRaw ? JSON.parse(indexRaw) : [];
  if (!ids.includes(conv.id)) {
    ids.unshift(conv.id);
    if (ids.length > 200) ids.length = 200;
  }
  await env.CONVERSATIONS.put(indexKey, JSON.stringify(ids));
}

function generateId(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default app;
