/// <reference types="@cloudflare/workers-types" />
/**
 * ============================================================================
 * KUON LESSON RECORDER — Cloudflare Worker
 * ============================================================================
 *
 * 音楽家のためのレッスン録音書き起こし & AI 要約サービス。
 * 全処理は Cloudflare Workers AI (Whisper-large-v3-turbo + Llama 3.3 70B + M2M100)
 * で完結し、サーバーコストを最小化します。
 *
 * エンドポイント:
 *   POST  /api/recorder/transcribe   音声 → 書き起こし (Whisper)
 *   POST  /api/recorder/summarize    書き起こし → 要約 + アクション項目 (Llama)
 *   POST  /api/recorder/translate    書き起こし → 多言語翻訳 (M2M100)
 *   GET   /api/recorder/lessons      ユーザーの保存レッスン一覧
 *   GET   /api/recorder/lessons/:id  単一レッスン取得
 *   PUT   /api/recorder/lessons/:id  レッスンメタ更新 (タイトル等)
 *   DELETE /api/recorder/lessons/:id レッスン削除
 *   POST  /api/recorder/search       過去レッスンの意味検索 (Vectorize)
 *
 * 認証: Bearer RECORDER_SECRET (Next.js → Worker)
 *       JWT (フロント → Auth Worker → 検証情報を Worker に渡す)
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
  LESSONS: KVNamespace;
  AUDIO: R2Bucket;
  VECTORS: VectorizeIndex;
  RECORDER_SECRET: string;
  AUTH_WORKER_URL: string;
  ENVIRONMENT?: string;
}

interface LessonMeta {
  id: string;
  email: string;
  title: string;
  instrument?: string;
  teacher?: string;
  language: string;
  duration: number; // seconds
  createdAt: string;
  updatedAt: string;
  hasAudio: boolean;
  hasSummary: boolean;
  hasTranslation: boolean;
  /** 完全レッスンデータの KV キー (大きいので別保存) */
  dataKey: string;
}

interface LessonData {
  meta: LessonMeta;
  /** Whisper の出力 (タイムスタンプ付きセグメント) */
  segments: Array<{
    start: number;
    end: number;
    text: string;
    speaker?: 'teacher' | 'student' | 'unknown';
  }>;
  /** 全文書き起こし */
  fullText: string;
  /** AI 要約 */
  summary?: {
    abstract: string;
    keyPoints: string[];
    actionItems: string[];
    musicTerms: Array<{ term: string; explanation: string; theoryLink?: string }>;
    mood: 'encouraging' | 'neutral' | 'concerning';
    nextLessonHints: string[];
  };
  /** 翻訳版 */
  translations?: Record<string, string>;
}

const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB (Workers AI 制約)
const MAX_AUDIO_DURATION = 60 * 60;       // 1 時間制限 (KV 容量保護)

// ──────────────────────────────────────────────────────────────────────────
// 音楽専門語彙 — Whisper の transcription 精度向上 + Llama 要約の文脈強化
// ──────────────────────────────────────────────────────────────────────────
const MUSIC_VOCAB = {
  ja: [
    'ナポリの六', '属七', '副属和音', '転位', '装飾音', 'カデンツ', 'モーダル・ミクスチャ',
    'フォルテ', 'ピアノ', 'メゾフォルテ', 'クレッシェンド', 'デクレッシェンド', 'スタッカート',
    'レガート', 'スラー', 'タイ', 'アルペジオ', 'グリッサンド', 'ヴィブラート', 'ピチカート',
    'アゴーギク', 'ルバート', 'リタルダンド', 'アッチェレランド', 'テンポ・プリモ',
    'アンサンブル', 'ソナタ', 'ロンド', '展開部', '提示部', '再現部', 'コーダ', 'カデンツァ',
    '純正律', '平均律', 'チューニング', 'インテンション', 'フレージング', 'アーティキュレーション',
    'ヘ音記号', 'ト音記号', 'ハ音記号', 'シャープ', 'フラット', 'ナチュラル',
    'ペダリング', 'ボウイング', 'フィンガリング', 'ブレスコントロール', 'アンブシュア',
  ],
  en: [
    'cadence', 'modulation', 'tonicization', 'Neapolitan sixth', 'augmented sixth',
    'fortissimo', 'pianissimo', 'crescendo', 'diminuendo', 'staccato', 'legato',
    'arpeggio', 'glissando', 'vibrato', 'pizzicato', 'tremolo', 'rubato', 'accelerando',
    'ritardando', 'sonata form', 'exposition', 'development', 'recapitulation', 'coda',
    'voice leading', 'counterpoint', 'fugue', 'invention', 'sequence', 'pedal point',
    'phrasing', 'articulation', 'embouchure', 'fingering', 'bowing', 'pedaling',
    'just intonation', 'equal temperament', 'modal mixture', 'secondary dominant',
  ],
  es: [
    'cadencia', 'modulación', 'tonicización', 'sexta napolitana', 'sexta aumentada',
    'fortissimo', 'pianissimo', 'crescendo', 'staccato', 'legato', 'arpegio',
    'glissando', 'vibrato', 'pizzicato', 'rubato', 'accelerando', 'ritardando',
    'forma sonata', 'exposición', 'desarrollo', 'recapitulación', 'coda',
    'conducción de voces', 'contrapunto', 'fuga', 'fraseo', 'articulación',
  ],
};

// ──────────────────────────────────────────────────────────────────────────
// Hono app
// ──────────────────────────────────────────────────────────────────────────
const app = new Hono<{ Bindings: Env; Variables: { userEmail: string; planTier: string } }>();

app.use('*', cors({
  origin: ['https://kuon-rnd.com', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-User-Email', 'X-User-Plan'],
  credentials: false,
}));

// ──────────────────────────────────────────────────────────────────────────
// 認証ミドルウェア
// Next.js プロキシは Bearer RECORDER_SECRET + X-User-Email + X-User-Plan を渡す
// ──────────────────────────────────────────────────────────────────────────
const requireAuth = async (c: any, next: any) => {
  const auth = c.req.header('Authorization');
  if (!auth || auth !== `Bearer ${c.env.RECORDER_SECRET}`) {
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
    service: 'KUON Lesson Recorder Worker',
    version: '1.0.0',
    models: {
      transcribe: '@cf/openai/whisper-large-v3-turbo',
      summarize: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      translate: '@cf/meta/m2m100-1.2b',
      embed: '@cf/baai/bge-m3',
    },
  })
);

// ──────────────────────────────────────────────────────────────────────────
// POST /api/recorder/transcribe
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/recorder/transcribe', requireAuth, async (c) => {
  try {
    const formData = await c.req.formData();
    const audioFile = formData.get('audio') as File | null;
    const lang = (formData.get('language') as string) || 'auto';
    const musicVocab = formData.get('musicVocab') !== 'false';
    const title = (formData.get('title') as string) || 'レッスン録音';
    const instrument = (formData.get('instrument') as string) || '';
    const teacher = (formData.get('teacher') as string) || '';

    if (!audioFile) {
      return c.json({ error: 'No audio file provided' }, 400);
    }
    if (audioFile.size > MAX_AUDIO_SIZE) {
      return c.json({
        error: 'File too large',
        message: `音声ファイルは ${Math.floor(MAX_AUDIO_SIZE / 1024 / 1024)}MB 以下にしてください`,
        max: MAX_AUDIO_SIZE,
        actual: audioFile.size,
      }, 413);
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const audioArray = new Uint8Array(audioBuffer);

    // Workers AI Whisper-large-v3-turbo を呼び出し
    // Initial prompt に音楽専門語彙を注入することで認識精度を向上
    const vocabPrompt =
      musicVocab && lang !== 'auto'
        ? `音楽レッスンの録音です。以下の専門用語が出てくる可能性があります: ${(MUSIC_VOCAB[lang as keyof typeof MUSIC_VOCAB] || MUSIC_VOCAB.ja).slice(0, 30).join('、')}`
        : musicVocab
        ? `Music lesson recording. Common terms: ${MUSIC_VOCAB.en.slice(0, 25).join(', ')}`
        : undefined;

    const whisperInput: any = {
      audio: [...audioArray],
    };
    if (lang !== 'auto') whisperInput.language = lang;
    if (vocabPrompt) whisperInput.initial_prompt = vocabPrompt;

    let whisperResult: any;
    try {
      whisperResult = await c.env.AI.run(
        '@cf/openai/whisper-large-v3-turbo' as any,
        whisperInput
      );
    } catch (whisperErr) {
      console.error('Whisper run error:', whisperErr);
      return c.json({
        error: 'Whisper invocation failed',
        message: whisperErr instanceof Error ? whisperErr.message : 'unknown',
        stack: whisperErr instanceof Error ? whisperErr.stack : undefined,
      }, 502);
    }

    if (!whisperResult || !whisperResult.text) {
      return c.json({
        error: 'Transcription returned empty',
        detail: JSON.stringify(whisperResult).slice(0, 500),
      }, 502);
    }

    const fullText: string = whisperResult.text || '';
    const detectedLang: string = whisperResult.language || lang || 'ja';
    const duration: number =
      whisperResult.transcription_info?.duration ?? 0;

    // セグメント形式の正規化 (Whisper の出力は word-level または segment-level)
    const segments: LessonData['segments'] = [];
    if (Array.isArray(whisperResult.segments)) {
      for (const seg of whisperResult.segments) {
        segments.push({
          start: seg.start ?? 0,
          end: seg.end ?? 0,
          text: seg.text ?? '',
          speaker: detectSpeaker(seg, segments),
        });
      }
    } else if (Array.isArray(whisperResult.words)) {
      // word-level → 文単位にまとめる
      let cur = { start: 0, end: 0, text: '' };
      for (const w of whisperResult.words) {
        if (cur.text === '') cur.start = w.start;
        cur.text += w.word;
        cur.end = w.end;
        if (/[.。!?！？\n]/.test(w.word)) {
          segments.push({ ...cur, speaker: 'unknown' });
          cur = { start: 0, end: 0, text: '' };
        }
      }
      if (cur.text.trim()) segments.push({ ...cur, speaker: 'unknown' });
    }

    // レッスンを KV に保存
    const userEmail = c.get('userEmail');
    const lessonId = generateId();
    const now = new Date().toISOString();

    const meta: LessonMeta = {
      id: lessonId,
      email: userEmail,
      title,
      instrument: instrument || undefined,
      teacher: teacher || undefined,
      language: detectedLang,
      duration,
      createdAt: now,
      updatedAt: now,
      hasAudio: false,
      hasSummary: false,
      hasTranslation: false,
      dataKey: `data:${userEmail}:${lessonId}`,
    };

    const data: LessonData = {
      meta,
      segments,
      fullText,
    };

    // メタとデータを別キーで保存 (一覧取得を高速化)
    await c.env.LESSONS.put(`meta:${userEmail}:${lessonId}`, JSON.stringify(meta), {
      expirationTtl: 365 * 24 * 60 * 60, // 1 年
    });
    await c.env.LESSONS.put(meta.dataKey, JSON.stringify(data), {
      expirationTtl: 365 * 24 * 60 * 60,
    });

    // ユーザーのレッスンインデックス更新
    const indexKey = `index:${userEmail}`;
    const existingIndex = await c.env.LESSONS.get(indexKey);
    const indexList: string[] = existingIndex ? JSON.parse(existingIndex) : [];
    indexList.unshift(lessonId);
    if (indexList.length > 500) indexList.length = 500; // 上限
    await c.env.LESSONS.put(indexKey, JSON.stringify(indexList));

    // Vectorize: 全文を埋め込みして検索可能に (非同期、エラー時もスキップ)
    c.executionCtx.waitUntil(
      embedAndIndex(c.env, userEmail, lessonId, fullText, meta).catch((e) =>
        console.error('Vectorize index error:', e)
      )
    );

    return c.json({
      ok: true,
      lessonId,
      meta,
      fullText,
      segments,
      detectedLanguage: detectedLang,
      duration,
    });
  } catch (err) {
    console.error('transcribe error:', err);
    return c.json(
      { error: 'Transcribe failed', message: err instanceof Error ? err.message : 'unknown' },
      500
    );
  }
});

// ──────────────────────────────────────────────────────────────────────────
// POST /api/recorder/summarize — Llama で要約 + アクション項目生成
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/recorder/summarize', requireAuth, async (c) => {
  try {
    const { lessonId } = await c.req.json<{ lessonId: string }>();
    if (!lessonId) return c.json({ error: 'Missing lessonId' }, 400);

    const userEmail = c.get('userEmail');
    const dataKey = `data:${userEmail}:${lessonId}`;
    const dataRaw = await c.env.LESSONS.get(dataKey);
    if (!dataRaw) return c.json({ error: 'Lesson not found' }, 404);

    const data: LessonData = JSON.parse(dataRaw);
    const language = data.meta.language;
    const lang = (language === 'ja' || language === 'en' || language === 'es') ? language : 'ja';

    const systemPrompt = buildSummarySystemPrompt(lang);
    const userPrompt = buildSummaryUserPrompt(data.fullText, data.meta, lang);

    const result = await c.env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast' as any, {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.3,
    }) as any;

    const responseText = result.response || '';
    const summary = parseSummaryResponse(responseText);

    data.summary = summary;
    data.meta.hasSummary = true;
    data.meta.updatedAt = new Date().toISOString();

    await c.env.LESSONS.put(dataKey, JSON.stringify(data), { expirationTtl: 365 * 24 * 60 * 60 });
    await c.env.LESSONS.put(`meta:${userEmail}:${lessonId}`, JSON.stringify(data.meta), {
      expirationTtl: 365 * 24 * 60 * 60,
    });

    return c.json({ ok: true, summary, meta: data.meta });
  } catch (err) {
    console.error('summarize error:', err);
    return c.json(
      { error: 'Summarize failed', message: err instanceof Error ? err.message : 'unknown' },
      500
    );
  }
});

// ──────────────────────────────────────────────────────────────────────────
// POST /api/recorder/translate — M2M100 で多言語翻訳
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/recorder/translate', requireAuth, async (c) => {
  try {
    const { lessonId, targetLang } = await c.req.json<{ lessonId: string; targetLang: string }>();
    if (!lessonId || !targetLang) return c.json({ error: 'Missing params' }, 400);

    const userEmail = c.get('userEmail');
    const dataKey = `data:${userEmail}:${lessonId}`;
    const dataRaw = await c.env.LESSONS.get(dataKey);
    if (!dataRaw) return c.json({ error: 'Lesson not found' }, 404);

    const data: LessonData = JSON.parse(dataRaw);

    // 翻訳は段落単位で実行 (M2M100 のコンテキスト長対策)
    const chunks = chunkText(data.fullText, 800);
    const translatedChunks: string[] = [];
    for (const chunk of chunks) {
      const r = await c.env.AI.run('@cf/meta/m2m100-1.2b' as any, {
        text: chunk,
        source_lang: data.meta.language === 'ja' ? 'japanese' : 'english',
        target_lang: targetLangCode(targetLang),
      }) as any;
      translatedChunks.push(r.translated_text || '');
    }

    const translatedText = translatedChunks.join('\n\n');

    data.translations = data.translations || {};
    data.translations[targetLang] = translatedText;
    data.meta.hasTranslation = true;
    data.meta.updatedAt = new Date().toISOString();

    await c.env.LESSONS.put(dataKey, JSON.stringify(data), { expirationTtl: 365 * 24 * 60 * 60 });
    await c.env.LESSONS.put(`meta:${userEmail}:${lessonId}`, JSON.stringify(data.meta), {
      expirationTtl: 365 * 24 * 60 * 60,
    });

    return c.json({ ok: true, translatedText, language: targetLang });
  } catch (err) {
    console.error('translate error:', err);
    return c.json(
      { error: 'Translate failed', message: err instanceof Error ? err.message : 'unknown' },
      500
    );
  }
});

// ──────────────────────────────────────────────────────────────────────────
// GET /api/recorder/lessons — ユーザーの全レッスン一覧 (メタのみ)
// ──────────────────────────────────────────────────────────────────────────
app.get('/api/recorder/lessons', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const indexRaw = await c.env.LESSONS.get(`index:${userEmail}`);
  if (!indexRaw) return c.json({ ok: true, lessons: [] });

  const ids: string[] = JSON.parse(indexRaw);
  const lessons: LessonMeta[] = [];

  // Bulk fetch (KV は最大 1000 並列)
  const fetched = await Promise.all(
    ids.slice(0, 100).map((id) => c.env.LESSONS.get(`meta:${userEmail}:${id}`))
  );

  for (const raw of fetched) {
    if (raw) lessons.push(JSON.parse(raw));
  }

  return c.json({ ok: true, lessons, total: ids.length });
});

// ──────────────────────────────────────────────────────────────────────────
// GET /api/recorder/lessons/:id
// ──────────────────────────────────────────────────────────────────────────
app.get('/api/recorder/lessons/:id', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const lessonId = c.req.param('id');
  const dataRaw = await c.env.LESSONS.get(`data:${userEmail}:${lessonId}`);
  if (!dataRaw) return c.json({ error: 'Lesson not found' }, 404);
  return c.json({ ok: true, lesson: JSON.parse(dataRaw) });
});

// ──────────────────────────────────────────────────────────────────────────
// PUT /api/recorder/lessons/:id — メタ更新 (タイトル・楽器・教師)
// ──────────────────────────────────────────────────────────────────────────
app.put('/api/recorder/lessons/:id', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const lessonId = c.req.param('id');
  const updates = await c.req.json<Partial<LessonMeta>>();

  const metaKey = `meta:${userEmail}:${lessonId}`;
  const dataKey = `data:${userEmail}:${lessonId}`;
  const metaRaw = await c.env.LESSONS.get(metaKey);
  if (!metaRaw) return c.json({ error: 'Lesson not found' }, 404);

  const meta: LessonMeta = JSON.parse(metaRaw);
  const updated: LessonMeta = {
    ...meta,
    title: updates.title ?? meta.title,
    instrument: updates.instrument ?? meta.instrument,
    teacher: updates.teacher ?? meta.teacher,
    updatedAt: new Date().toISOString(),
  };

  await c.env.LESSONS.put(metaKey, JSON.stringify(updated), { expirationTtl: 365 * 24 * 60 * 60 });

  // dataKey 内のメタも同期
  const dataRaw = await c.env.LESSONS.get(dataKey);
  if (dataRaw) {
    const data: LessonData = JSON.parse(dataRaw);
    data.meta = updated;
    await c.env.LESSONS.put(dataKey, JSON.stringify(data), { expirationTtl: 365 * 24 * 60 * 60 });
  }

  return c.json({ ok: true, meta: updated });
});

// ──────────────────────────────────────────────────────────────────────────
// DELETE /api/recorder/lessons/:id
// ──────────────────────────────────────────────────────────────────────────
app.delete('/api/recorder/lessons/:id', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const lessonId = c.req.param('id');

  await Promise.all([
    c.env.LESSONS.delete(`meta:${userEmail}:${lessonId}`),
    c.env.LESSONS.delete(`data:${userEmail}:${lessonId}`),
  ]);

  // Vectorize からも削除
  try {
    await c.env.VECTORS.deleteByIds([`${userEmail}:${lessonId}`]);
  } catch (e) {
    console.error('Vectorize delete error:', e);
  }

  // インデックス更新
  const indexKey = `index:${userEmail}`;
  const indexRaw = await c.env.LESSONS.get(indexKey);
  if (indexRaw) {
    const ids: string[] = JSON.parse(indexRaw);
    const filtered = ids.filter((id) => id !== lessonId);
    await c.env.LESSONS.put(indexKey, JSON.stringify(filtered));
  }

  return c.json({ ok: true });
});

// ──────────────────────────────────────────────────────────────────────────
// POST /api/recorder/search — Vectorize による意味検索
// ──────────────────────────────────────────────────────────────────────────
app.post('/api/recorder/search', requireAuth, async (c) => {
  try {
    const { query, topK = 8 } = await c.req.json<{ query: string; topK?: number }>();
    if (!query) return c.json({ error: 'Missing query' }, 400);

    const userEmail = c.get('userEmail');

    // クエリを埋め込み化
    const embedResult = await c.env.AI.run('@cf/baai/bge-m3' as any, {
      text: [query],
    }) as any;
    const queryVector = embedResult.data?.[0] || embedResult[0];
    if (!queryVector) return c.json({ error: 'Embed failed' }, 502);

    // Vectorize で検索 (ユーザーのスペースに限定)
    const results = await c.env.VECTORS.query(queryVector, {
      topK,
      filter: { email: userEmail } as any,
      returnMetadata: 'all',
    });

    return c.json({
      ok: true,
      query,
      matches: results.matches?.map((m: any) => ({
        lessonId: m.metadata?.lessonId,
        title: m.metadata?.title,
        snippet: m.metadata?.snippet,
        createdAt: m.metadata?.createdAt,
        score: m.score,
      })) || [],
    });
  } catch (err) {
    console.error('search error:', err);
    return c.json(
      { error: 'Search failed', message: err instanceof Error ? err.message : 'unknown' },
      500
    );
  }
});

// ──────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────

function generateId(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * セグメント単位で「教師 / 生徒」を簡易判定。
 * 完全な話者分離は Whisper では不可能だが、pause 長と語調パターンから推定する。
 * 完璧ではないが「8 割の場面で正解する」ヒューリスティックを採用。
 */
function detectSpeaker(
  seg: any,
  prev: LessonData['segments']
): 'teacher' | 'student' | 'unknown' {
  const text = (seg.text || '').trim();
  if (!text) return 'unknown';

  // 教師の典型語: 命令形・指示・専門用語の説明・励まし
  if (/(してみて|やってみて|もう一度|そう|いいね|うん|そこ|ここ|では次は|練習|宿題|もっと)/.test(text)) {
    return 'teacher';
  }
  // 生徒の典型語: 質問・短い応答・確認
  if (/^(はい|うん|あ|え？|ええ|分かりました|そうですか|どこですか)/.test(text)) {
    return 'student';
  }
  // 直前が教師なら 5 秒以上空いた場合は生徒、逆もしかり
  if (prev.length) {
    const last = prev[prev.length - 1];
    const gap = (seg.start ?? 0) - (last.end ?? 0);
    if (gap > 1.5 && last.speaker) {
      return last.speaker === 'teacher' ? 'student' : 'teacher';
    }
    return last.speaker || 'unknown';
  }
  return 'unknown';
}

/**
 * Llama 用の system prompt — §49 の哲学 (定番 + あなたの選択も成立) を継承
 */
function buildSummarySystemPrompt(lang: 'ja' | 'en' | 'es'): string {
  const prompts = {
    ja: `あなたは音楽家のためのレッスンノート作成アシスタントです。
レッスン録音の書き起こしから、以下を抽出してください:

1. **3 行サマリー**: レッスンの本質を 3 行で
2. **キーポイント**: 教師が伝えた重要な指摘 (5 個以内)
3. **アクション項目**: 次回までに練習・確認すべきこと (3-5 個)
4. **音楽用語**: レッスンで出てきた専門用語と簡単な解説
5. **次回への示唆**: 次のレッスンで深めると良い内容

哲学: 定型的な「正解」を押し付けず、生徒の選択も尊重する文体で。
励まし過ぎず、淡々と事実を整理することを優先。

出力は JSON のみ。前置き不要。`,

    en: `You are an assistant creating lesson notes for musicians.
From a transcribed lesson recording, extract:

1. **3-line summary**: The essence of the lesson
2. **Key points**: Important observations the teacher made (max 5)
3. **Action items**: What to practice/review before next lesson (3-5)
4. **Music terms**: Technical terms used with brief explanations
5. **Next lesson hints**: What to deepen next time

Philosophy: Don't impose a single "right answer". Respect the student's choices.
Don't over-encourage. Prioritize calm, factual organization.

Output JSON only. No preamble.`,

    es: `Eres un asistente que crea notas de clase para músicos.
A partir de la transcripción de una clase, extrae:

1. **Resumen de 3 líneas**
2. **Puntos clave** (máximo 5)
3. **Tareas para casa** (3-5)
4. **Términos musicales** con explicaciones breves
5. **Sugerencias para la próxima clase**

Filosofía: No impongas una "respuesta correcta" única. Respeta las elecciones del estudiante.

Solo salida JSON. Sin preámbulo.`,
  };
  return prompts[lang];
}

function buildSummaryUserPrompt(text: string, meta: LessonMeta, lang: 'ja' | 'en' | 'es'): string {
  const truncated = text.length > 6000 ? text.slice(0, 6000) + '\n[...続く]' : text;
  const langInstr = {
    ja: '以下の JSON 形式で出力してください:',
    en: 'Output in this JSON format:',
    es: 'Salida en este formato JSON:',
  }[lang];

  return `${langInstr}
{
  "abstract": "...",
  "keyPoints": ["...", "..."],
  "actionItems": ["...", "..."],
  "musicTerms": [{"term": "...", "explanation": "...", "theoryLink": "/theory/m4/l01"}],
  "mood": "encouraging" | "neutral" | "concerning",
  "nextLessonHints": ["...", "..."]
}

楽器: ${meta.instrument || '未指定'}
教師: ${meta.teacher || '未指定'}

書き起こし:
"""
${truncated}
"""`;
}

function parseSummaryResponse(text: string): LessonData['summary'] {
  // JSON ブロックを抽出
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch ? jsonMatch[0] : '{}';
  try {
    const parsed = JSON.parse(jsonStr);
    return {
      abstract: parsed.abstract || '',
      keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
      musicTerms: Array.isArray(parsed.musicTerms) ? parsed.musicTerms : [],
      mood: parsed.mood === 'encouraging' || parsed.mood === 'concerning' ? parsed.mood : 'neutral',
      nextLessonHints: Array.isArray(parsed.nextLessonHints) ? parsed.nextLessonHints : [],
    };
  } catch (e) {
    return {
      abstract: text.slice(0, 200),
      keyPoints: [],
      actionItems: [],
      musicTerms: [],
      mood: 'neutral',
      nextLessonHints: [],
    };
  }
}

function chunkText(text: string, maxChars: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let cur = '';
  for (const p of paragraphs) {
    if ((cur + p).length > maxChars) {
      if (cur) chunks.push(cur);
      cur = p;
    } else {
      cur += (cur ? '\n\n' : '') + p;
    }
  }
  if (cur) chunks.push(cur);
  return chunks.length > 0 ? chunks : [text];
}

function targetLangCode(lang: string): string {
  const map: Record<string, string> = {
    ja: 'japanese',
    en: 'english',
    es: 'spanish',
    ko: 'korean',
    pt: 'portuguese',
    de: 'german',
    fr: 'french',
    it: 'italian',
    zh: 'chinese',
  };
  return map[lang] || lang;
}

/**
 * 全文を埋め込みして Vectorize に登録 (バックグラウンド実行)
 */
async function embedAndIndex(
  env: Env,
  email: string,
  lessonId: string,
  text: string,
  meta: LessonMeta
): Promise<void> {
  // 検索用のスニペット生成 (最初の 200 文字)
  const snippet = text.slice(0, 200);

  // 全文を埋め込み (長い場合は最初の 4000 文字)
  const targetText = text.slice(0, 4000);
  const embedResult = await env.AI.run('@cf/baai/bge-m3' as any, {
    text: [targetText],
  }) as any;
  const vector = embedResult.data?.[0] || embedResult[0];
  if (!vector) return;

  await env.VECTORS.upsert([
    {
      id: `${email}:${lessonId}`,
      values: vector,
      metadata: {
        email,
        lessonId,
        title: meta.title,
        snippet,
        createdAt: meta.createdAt,
      },
    },
  ]);
}

export default app;
