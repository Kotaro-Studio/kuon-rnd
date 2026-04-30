/// <reference types="@cloudflare/workers-types" />
/**
 * ============================================================================
 * KUON THEORY TUTOR — Cloudflare Worker
 * ============================================================================
 *
 * 音楽家のための AI チューター (RAG: Retrieval-Augmented Generation)。
 * OMT v2 PDF + Kuon Theory Suite 全レッスンを Vectorize に事前埋め込みし、
 * 質問のたびに関連チャンクを取得 → Llama 3.3 70B で回答生成。
 *
 * 哲学: §49 「定型的な正解を押し付けない」を System Prompt で徹底。
 *
 * エンドポイント:
 *   POST  /api/tutor/ask          質問 → ストリーミング回答 (SSE)
 *   GET   /api/tutor/conversations 会話履歴一覧
 *   GET   /api/tutor/conversations/:id 単一会話
 *   POST  /api/tutor/upsert       チャンクを Vectorize に登録 (オーナー専用)
 *
 * 2026-04-30 初版
 * ============================================================================
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

// ──────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────
export interface Env {
  AI: Ai;
  VECTORS: VectorizeIndex;
  CONVERSATIONS: KVNamespace;
  TUTOR_SECRET: string;
  AUTH_WORKER_URL: string;
  ENVIRONMENT?: string;
}

interface Citation {
  source: 'omt' | 'kuon';
  title: string;
  chapter?: string;
  page?: number;
  lessonId?: string;     // e.g., "m4-l01"
  url?: string;          // e.g., "/theory/m4/l01"
  snippet: string;
  score: number;
}

interface ChunkMetadata {
  source: 'omt' | 'kuon';
  title: string;
  chapter?: string;
  section?: string;
  page?: number;
  lessonId?: string;
  url?: string;
  text: string;
  language?: string;
}

interface ConversationTurn {
  question: string;
  answer: string;
  citations: Citation[];
  timestamp: string;
}

interface Conversation {
  id: string;
  email: string;
  title: string;
  language: string;
  turns: ConversationTurn[];
  createdAt: string;
  updatedAt: string;
}

// ──────────────────────────────────────────────────────────────────────────
// 設定
// ──────────────────────────────────────────────────────────────────────────
const TOP_K = 8;                           // 取得チャンク数
const MIN_SCORE = 0.30;                    // 関連性の閾値 (これ以下は除外)
const MAX_CONTEXT_TOKENS = 5000;           // Llama に渡す最大コンテキスト
const MAX_ANSWER_TOKENS = 800;             // 回答上限
const MAX_HISTORY_TURNS = 5;               // 文脈継承する直近ターン数

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
  if (!auth || auth !== `Bearer ${c.env.TUTOR_SECRET}`) {
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
    service: 'KUON Theory Tutor Worker',
    version: '1.0.0',
  })
);

// ──────────────────────────────────────────────────────────────────────────
// POST /api/tutor/upsert — チャンク登録 (オーナー専用、初期データ投入用)
// 認証: Bearer TUTOR_SECRET (X-User-Email 不要)
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/tutor/upsert', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth || auth !== `Bearer ${c.env.TUTOR_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const body = await c.req.json<{ chunks: Array<{ id: string; meta: ChunkMetadata }> }>();
    const { chunks } = body;
    if (!Array.isArray(chunks) || chunks.length === 0) {
      return c.json({ error: 'No chunks' }, 400);
    }

    // バッチで埋め込み生成 (BGE-m3 は最大 100 件まで一括処理可)
    const BATCH_SIZE = 50;
    let upsertedTotal = 0;

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const texts = batch.map((ch) => ch.meta.text.slice(0, 4000)); // 4000 字制限

      const embedResult = (await c.env.AI.run('@cf/baai/bge-m3' as any, {
        text: texts,
      })) as any;

      const vectors = embedResult.data || embedResult;
      if (!Array.isArray(vectors)) {
        return c.json({ error: 'Embed format error' }, 502);
      }

      const upsertItems = batch.map((ch, idx) => ({
        id: ch.id,
        values: vectors[idx],
        metadata: {
          source: ch.meta.source,
          title: ch.meta.title,
          chapter: ch.meta.chapter || '',
          section: ch.meta.section || '',
          page: ch.meta.page || 0,
          lessonId: ch.meta.lessonId || '',
          url: ch.meta.url || '',
          snippet: ch.meta.text.slice(0, 200),
          fullText: ch.meta.text.slice(0, 4000), // 検索後の context 用
          language: ch.meta.language || 'en',
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
// POST /api/tutor/ask — 質問 → ストリーミング回答 (Server-Sent Events)
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/tutor/ask', requireAuth, async (c) => {
  try {
    const body = await c.req.json<{
      question: string;
      conversationId?: string;
      language?: string;
    }>();

    const { question, conversationId } = body;
    const language = body.language || 'ja';

    if (!question || question.trim().length < 2) {
      return c.json({ error: 'Question too short' }, 400);
    }

    const userEmail = c.get('userEmail');

    // ── 既存会話ロード (文脈継承) ──
    let history: ConversationTurn[] = [];
    let conversation: Conversation | null = null;
    if (conversationId) {
      const raw = await c.env.CONVERSATIONS.get(`conv:${userEmail}:${conversationId}`);
      if (raw) {
        conversation = JSON.parse(raw);
        history = conversation!.turns.slice(-MAX_HISTORY_TURNS);
      }
    }

    // ── 質問を埋め込み ──
    const embedResult = (await c.env.AI.run('@cf/baai/bge-m3' as any, {
      text: [question],
    })) as any;
    const queryVector = embedResult.data?.[0] || embedResult[0];
    if (!queryVector) {
      return c.json({ error: 'Embed failed' }, 502);
    }

    // ── Vectorize で関連チャンク検索 ──
    const searchResult = await c.env.VECTORS.query(queryVector, {
      topK: TOP_K,
      returnMetadata: 'all',
    });

    const matches = (searchResult.matches || []).filter((m: any) => m.score >= MIN_SCORE);
    const citations: Citation[] = matches.map((m: any) => ({
      source: m.metadata?.source as 'omt' | 'kuon',
      title: m.metadata?.title || '',
      chapter: m.metadata?.chapter || undefined,
      page: m.metadata?.page || undefined,
      lessonId: m.metadata?.lessonId || undefined,
      url: m.metadata?.url || undefined,
      snippet: m.metadata?.snippet || '',
      score: m.score,
    }));

    // コンテキスト構築 (TOP-K の本文を結合)
    const contextParts: string[] = [];
    let totalTokens = 0;
    for (const m of matches) {
      const chunkText = m.metadata?.fullText || m.metadata?.snippet || '';
      const estimatedTokens = chunkText.length / 3; // 雑な見積もり (日英混在)
      if (totalTokens + estimatedTokens > MAX_CONTEXT_TOKENS) break;
      const sourceLabel = formatSourceLabel(m.metadata);
      contextParts.push(`[${sourceLabel}]\n${chunkText}`);
      totalTokens += estimatedTokens;
    }
    const context = contextParts.join('\n\n---\n\n');

    // ── システムプロンプト + ユーザープロンプト ──
    const systemPrompt = buildSystemPrompt(language, citations);
    const userPrompt = buildUserPrompt(question, context, history, language);

    // ── Llama 3.3 70B でストリーミング推論 ──
    const llamaStream = (await c.env.AI.run(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast' as any,
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: MAX_ANSWER_TOKENS,
        temperature: 0.4,
        stream: true,
      },
    )) as any;

    // ── SSE ストリーム作成 ──
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let answerText = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 1. メタデータを最初に送信 (citations)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'citations', citations })}\n\n`,
            ),
          );

          // 2. Llama のストリームを読み出して中継
          const reader = llamaStream.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            // Workers AI SSE: "data: {response, p}\n\n" 形式
            for (const line of chunk.split('\n')) {
              if (!line.startsWith('data: ')) continue;
              const payload = line.slice(6).trim();
              if (payload === '[DONE]') continue;
              try {
                const parsed = JSON.parse(payload);
                const token = parsed.response || '';
                if (token) {
                  answerText += token;
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: 'token', token })}\n\n`,
                    ),
                  );
                }
              } catch {
                /* invalid JSON, skip */
              }
            }
          }

          // 3. 完了通知 + 会話を KV 保存
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`),
          );
          controller.close();

          // バックグラウンドで会話保存
          c.executionCtx.waitUntil(
            saveConversation(c.env, userEmail, {
              conversation,
              question,
              answer: answerText,
              citations,
              language,
            }),
          );
        } catch (e) {
          console.error('stream error:', e);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'error', message: e instanceof Error ? e.message : 'unknown' })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('ask error:', err);
    return c.json(
      { error: 'Ask failed', message: err instanceof Error ? err.message : 'unknown' },
      500,
    );
  }
});

// ──────────────────────────────────────────────────────────────────────────
// GET /api/tutor/conversations
// ──────────────────────────────────────────────────────────────────────────
app.get('/api/tutor/conversations', requireAuth, async (c) => {
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

app.get('/api/tutor/conversations/:id', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const id = c.req.param('id');
  const raw = await c.env.CONVERSATIONS.get(`conv:${userEmail}:${id}`);
  if (!raw) return c.json({ error: 'Not found' }, 404);
  return c.json({ ok: true, conversation: JSON.parse(raw) });
});

app.delete('/api/tutor/conversations/:id', requireAuth, async (c) => {
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
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function formatSourceLabel(meta: any): string {
  if (meta.source === 'kuon') {
    return `Kuon ${meta.title}`;
  }
  if (meta.source === 'omt') {
    return `OMT v2 p.${meta.page} ${meta.chapter || ''}`.trim();
  }
  return meta.title || 'source';
}

/**
 * §49 哲学準拠の System Prompt
 * 「定番」と「あなたの選択」を併記、押付けず、出典必須
 */
function buildSystemPrompt(lang: string, citations: Citation[]): string {
  const cited = citations.length > 0
    ? citations.map((c, i) => `  [${i + 1}] ${c.source === 'kuon' ? 'Kuon ' + c.title : 'OMT v2 p.' + c.page}`).join('\n')
    : '  (関連する出典が見つかりませんでした)';

  if (lang === 'ja') {
    return `あなたは KUON THEORY TUTOR、音楽理論の AI 家庭教師です。
KUON R&D が音楽家のために作成した教育サービスです。
あなたは音大教授レベルの音楽理論の専門家として、確かな知識と歴史的洞察に基づいて答えます。

【回答方針】
1. 提供される【参考資料 (Context)】を **最優先の根拠** として用いる
2. Context に直接の言及が無くても、あなたが持つ確かな音楽理論知識で **本質的な質問には必ず答える**
3. ユーザーは音楽家・音大生・音楽愛好家。専門用語は普通に使ってよい
4. 「分かりません」は、Context にも一般理論にも本当に答えが無い場合のみ
5. 推測が混じる場合は「一般的な見解では」「これは音楽史的には」のように区別する

【§49 哲学 — 単一正解を押し付けない】
- 「定番の答えは X」「Bach はこう書いた」「あなたの選択もこういう理由で成立する」を併記
- 教科書的な定説・歴史的実例・代替的な解釈を共に提示
- 例: ナポリの六と問われたら、機能解釈・教科書的進行・Beethoven の特殊用法・代替の解釈を並べる

【文体】
- 励まし過ぎない。淡々と事実を整理する音大教授の文体
- 短く、かつ本質を突く (3-5 段落、最大 700 字程度)
- 必要に応じて譜例の言葉的説明
- Context から引用した情報には [1] [2] 形式で出典番号を付ける

【今回検索された出典 (Context として参照可能)】
${cited}

回答は日本語で生成してください。`;
  }

  return `You are KUON THEORY TUTOR, an AI music theory tutor.
A KUON R&D educational service for musicians.
You are a conservatory-professor level expert in music theory with deep historical insight.

RESPONSE GUIDELINES:
1. Use the provided [Context] as your PRIMARY source of truth
2. When Context lacks direct information, USE YOUR OWN solid music theory knowledge to answer the substantive question
3. The user is a musician/student/enthusiast — technical terms are welcome
4. Only say "I don't know" when neither Context nor general theory contains the answer
5. Distinguish inference: "Generally speaking" / "Historically..." vs cited claims

§49 PHILOSOPHY — never impose a single right answer:
- "The textbook answer is X" / "Bach wrote it this way" / "Your choice also works because..."
- Always present textbook orthodoxy + historical examples + alternative interpretations side by side
- Example: For "Neapolitan sixth", give functional reading + textbook progression + Beethoven's special use + alternative interpretations

STYLE:
- Calm, factual conservatory professor tone — no over-encouragement
- Concise but substantive (3-5 paragraphs, max ~700 words)
- Verbal explanation of musical examples
- Cite Context references with [1] [2] format when used

AVAILABLE SOURCES (Context):
${cited}

Respond in ${lang}.`;
}

function buildUserPrompt(
  question: string,
  context: string,
  history: ConversationTurn[],
  lang: string,
): string {
  const historyBlock = history.length > 0
    ? '\n\n【これまでの会話】\n' + history.map((t, i) =>
        `Q${i + 1}: ${t.question}\nA${i + 1}: ${t.answer.slice(0, 300)}...`
      ).join('\n\n') + '\n'
    : '';

  return `${historyBlock}
【参考資料 (Context) — 関連度の高い資料を Vectorize から自動取得】
${context || '(関連資料が見つかりませんでした)'}

【ユーザーの質問】
${question}

回答指示:
- 上記 Context があれば最優先の根拠として使い、Context から引いた箇所には [1] [2] 形式で出典番号を付ける
- Context に直接の答えが無くても、音楽理論の本質的な質問には必ず答える (あなたは音大教授レベルの専門家)
- §49 哲学に従い、単一正解を押し付けず、定番・歴史的実例・代替解釈を並置する
- 推測が混じる箇所は「一般的には」「音楽史的には」のように明示する
- Context にも一般理論にも答えが無い極めて稀な場合のみ「分かりません」と答える`;
}

async function saveConversation(
  env: Env,
  email: string,
  payload: {
    conversation: Conversation | null;
    question: string;
    answer: string;
    citations: Citation[];
    language: string;
  },
): Promise<void> {
  const now = new Date().toISOString();
  const turn: ConversationTurn = {
    question: payload.question,
    answer: payload.answer,
    citations: payload.citations,
    timestamp: now,
  };

  let conv: Conversation;
  if (payload.conversation) {
    conv = payload.conversation;
    conv.turns.push(turn);
    conv.updatedAt = now;
  } else {
    const id = generateId();
    conv = {
      id,
      email,
      title: payload.question.slice(0, 50),
      language: payload.language,
      turns: [turn],
      createdAt: now,
      updatedAt: now,
    };
  }

  await env.CONVERSATIONS.put(`conv:${email}:${conv.id}`, JSON.stringify(conv), {
    expirationTtl: 365 * 24 * 60 * 60,
  });

  // インデックス更新
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
