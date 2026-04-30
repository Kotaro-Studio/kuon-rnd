/// <reference types="@cloudflare/workers-types" />
/**
 * ============================================================================
 * KUON TUTTI カレンダー — Cloudflare Worker
 * ============================================================================
 *
 * 音楽家のためのリハーサル・本番調整プラットフォーム。
 *
 * Phase 1 MVP 機能:
 *   - アンサンブル CRUD (オーナー・マネージャー・メンバー権限)
 *   - イベント (リハ等) 候補日提示
 *   - 認証ユーザー投票 + Guest 投票 (アカウント不要・メールリンク)
 *   - オーナーによる最終確定 → 全員に通知
 *   - iCal (.ics) ダウンロード
 *
 * §49 哲学: 「定型ではなく音楽家の現場」を反映する設計
 * §31 連動: イベント確定後に「公開化」で /events に昇格可能
 *
 * 2026-04-30 初版
 * ============================================================================
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  TUTTI: KVNamespace;
  TUTTI_SECRET: string;
  AUTH_WORKER_URL: string;
  RESEND_API_KEY?: string;
  ENVIRONMENT?: string;
}

// ──────────────────────────────────────────────────────────────────────────
// 型定義
// ──────────────────────────────────────────────────────────────────────────
type EnsembleType = 'orchestra' | 'chamber' | 'choir' | 'band' | 'duo' | 'recital' | 'other';
type MemberRole = 'owner' | 'manager' | 'member';
type EventStatus = 'polling' | 'locked' | 'cancelled';
type VoteResponse = 'yes' | 'maybe' | 'no';

interface EnsembleMember {
  email: string;
  name: string;
  role: MemberRole;
  section?: string;       // e.g., '1st violins', 'soprano', 'rhythm'
  instrument?: string;
  joinedAt: string;
}

interface Ensemble {
  id: string;
  name: string;
  type: EnsembleType;
  description?: string;
  ownerEmail: string;
  members: EnsembleMember[];
  sections: string[];     // e.g., ['1st violins', '2nd violins', 'violas', ...]
  createdAt: string;
  updatedAt: string;
}

interface EventCandidate {
  id: string;
  start: string;          // ISO datetime
  end: string;            // ISO datetime
  location?: string;
  notes?: string;
}

type RepeatPattern = 'weekly' | 'biweekly' | 'monthly';

interface RehearsalEvent {
  id: string;
  ensembleId: string;
  title: string;
  description?: string;
  candidates: EventCandidate[];
  status: EventStatus;
  attendance: 'all-required' | 'sections';   // 全員必須 or セクション指定
  requiredSections?: string[];               // sections モード時のみ意味
  optionalAttendees?: string[];              // 「任意」フラグの個別メンバー
  lockedCandidateId?: string;
  lockedAt?: string;
  cancelledAt?: string;
  pollDeadline?: string;
  publicEventId?: string;                    // §31 へ昇格時の events ID
  // 繰り返しイベント (シリーズ) 用
  seriesId?: string;                         // 同じシリーズに属するイベントを束ねる ID
  seriesIndex?: number;                      // シリーズ内での順番 (1-based)
  seriesTotal?: number;                      // シリーズの総回数
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Vote {
  voterId: string;        // email or guest:token-hash
  voterName: string;
  voterEmail: string;
  isGuest: boolean;
  responses: Record<string, VoteResponse>; // candidateId → yes/maybe/no
  comment?: string;
  votedAt: string;
}

interface GuestToken {
  token: string;
  eventId: string;
  email: string;
  name: string;
  createdAt: string;
  expiresAt: string;      // 投票締切 + 1 日
}

// ──────────────────────────────────────────────────────────────────────────
// 設定
// ──────────────────────────────────────────────────────────────────────────
const FREE_ENSEMBLE_LIMIT = 2;
const FREE_MEMBERS_LIMIT = 10;
const FREE_ACTIVE_POLLS_LIMIT = 5;
const TOKEN_LENGTH_BYTES = 24;
const ENSEMBLE_TTL = 365 * 24 * 60 * 60 * 5;  // 5 年保持

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

// 認証ミドルウェア (Bearer + X-User-Email)
const requireAuth = async (c: any, next: any) => {
  const auth = c.req.header('Authorization');
  if (!auth || auth !== `Bearer ${c.env.TUTTI_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const email = c.req.header('X-User-Email');
  const plan = c.req.header('X-User-Plan') || 'free';
  if (!email) return c.json({ error: 'Missing user email' }, 401);
  c.set('userEmail', email);
  c.set('planTier', plan);
  await next();
};

// オーナー専用 (Bearer のみ・X-User-Email 不要)
const requireBearer = async (c: any, next: any) => {
  const auth = c.req.header('Authorization');
  if (!auth || auth !== `Bearer ${c.env.TUTTI_SECRET}`) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
};

// ──────────────────────────────────────────────────────────────────────────
// Health
// ──────────────────────────────────────────────────────────────────────────
app.get('/', (c) =>
  c.json({ status: 'ok', service: 'KUON TUTTI Worker', version: '1.0.0' }),
);

// ============================================================================
// ENSEMBLES
// ============================================================================

// POST /api/tutti/ensembles — 新規作成
app.post('/api/tutti/ensembles', requireAuth, async (c) => {
  try {
    const body = await c.req.json<{
      name: string;
      type: EnsembleType;
      description?: string;
      sections?: string[];
      members?: Array<{ email: string; name: string; section?: string; instrument?: string }>;
    }>();
    const userEmail = c.get('userEmail');
    const planTier = c.get('planTier');

    if (!body.name || body.name.trim().length < 1) {
      return c.json({ error: 'Ensemble name required' }, 400);
    }

    // Free プラン上限チェック
    const indexRaw = await c.env.TUTTI.get(`ensembles-by-user:${userEmail}`);
    const userEnsembles: string[] = indexRaw ? JSON.parse(indexRaw) : [];
    if (isFreeOrPrelude(planTier) && userEnsembles.length >= FREE_ENSEMBLE_LIMIT) {
      return c.json({
        error: 'FREE_ENSEMBLE_LIMIT_EXCEEDED',
        limit: FREE_ENSEMBLE_LIMIT,
        message: `Free プランは ${FREE_ENSEMBLE_LIMIT} アンサンブルまで作成できます。Concerto プランで無制限です。`,
      }, 403);
    }

    const now = new Date().toISOString();
    const id = generateId();
    const initialMembers: EnsembleMember[] = [
      {
        email: userEmail,
        name: c.req.header('X-User-Name') || userEmail.split('@')[0],
        role: 'owner',
        joinedAt: now,
      },
      ...(body.members || []).map((m) => ({
        email: m.email,
        name: m.name,
        role: 'member' as const,
        section: m.section,
        instrument: m.instrument,
        joinedAt: now,
      })),
    ];

    if (isFreeOrPrelude(planTier) && initialMembers.length > FREE_MEMBERS_LIMIT) {
      return c.json({
        error: 'FREE_MEMBERS_LIMIT_EXCEEDED',
        limit: FREE_MEMBERS_LIMIT,
        message: `Free プランは ${FREE_MEMBERS_LIMIT} 名までです。Concerto プランで 50 名まで利用可能です。`,
      }, 403);
    }

    const ensemble: Ensemble = {
      id,
      name: body.name.slice(0, 200),
      type: body.type || 'other',
      description: body.description?.slice(0, 1000),
      ownerEmail: userEmail,
      members: initialMembers,
      sections: body.sections || [],
      createdAt: now,
      updatedAt: now,
    };

    await c.env.TUTTI.put(`ensembles:${id}`, JSON.stringify(ensemble), {
      expirationTtl: ENSEMBLE_TTL,
    });
    // index 更新 (オーナーと全メンバー全員のリストに追加)
    for (const m of initialMembers) {
      const idxKey = `ensembles-by-user:${m.email}`;
      const idxRaw = await c.env.TUTTI.get(idxKey);
      const ids: string[] = idxRaw ? JSON.parse(idxRaw) : [];
      if (!ids.includes(id)) ids.unshift(id);
      await c.env.TUTTI.put(idxKey, JSON.stringify(ids), { expirationTtl: ENSEMBLE_TTL });
    }

    // 招待メール (Resend)
    if (c.env.RESEND_API_KEY) {
      c.executionCtx.waitUntil(
        sendInviteEmails(c.env, ensemble, initialMembers.filter((m) => m.email !== userEmail)),
      );
    }

    return c.json({ ok: true, ensemble });
  } catch (err) {
    console.error('create ensemble error:', err);
    return c.json({ error: 'Create failed', message: err instanceof Error ? err.message : 'unknown' }, 500);
  }
});

// GET /api/tutti/ensembles/me — 自分が所属するアンサンブル一覧
app.get('/api/tutti/ensembles/me', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const indexRaw = await c.env.TUTTI.get(`ensembles-by-user:${userEmail}`);
  if (!indexRaw) return c.json({ ok: true, ensembles: [] });

  const ids: string[] = JSON.parse(indexRaw);
  const fetched = await Promise.all(
    ids.slice(0, 50).map((id) => c.env.TUTTI.get(`ensembles:${id}`)),
  );
  const ensembles: Ensemble[] = [];
  for (const raw of fetched) {
    if (raw) ensembles.push(JSON.parse(raw));
  }
  return c.json({ ok: true, ensembles });
});

// GET /api/tutti/ensembles/:id
app.get('/api/tutti/ensembles/:id', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const id = c.req.param('id');
  const raw = await c.env.TUTTI.get(`ensembles:${id}`);
  if (!raw) return c.json({ error: 'Not found' }, 404);
  const ensemble: Ensemble = JSON.parse(raw);
  if (!ensemble.members.some((m) => m.email === userEmail)) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  return c.json({ ok: true, ensemble });
});

// PUT /api/tutti/ensembles/:id — 更新 (オーナー or マネージャーのみ)
app.put('/api/tutti/ensembles/:id', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const id = c.req.param('id');
  const raw = await c.env.TUTTI.get(`ensembles:${id}`);
  if (!raw) return c.json({ error: 'Not found' }, 404);
  const ensemble: Ensemble = JSON.parse(raw);
  const me = ensemble.members.find((m) => m.email === userEmail);
  if (!me || (me.role !== 'owner' && me.role !== 'manager')) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  const body = await c.req.json<Partial<Ensemble>>();
  const updated: Ensemble = {
    ...ensemble,
    name: body.name ?? ensemble.name,
    type: body.type ?? ensemble.type,
    description: body.description ?? ensemble.description,
    sections: body.sections ?? ensemble.sections,
    members: body.members ?? ensemble.members,
    updatedAt: new Date().toISOString(),
  };
  await c.env.TUTTI.put(`ensembles:${id}`, JSON.stringify(updated), { expirationTtl: ENSEMBLE_TTL });
  return c.json({ ok: true, ensemble: updated });
});

// DELETE /api/tutti/ensembles/:id (オーナーのみ)
app.delete('/api/tutti/ensembles/:id', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const id = c.req.param('id');
  const raw = await c.env.TUTTI.get(`ensembles:${id}`);
  if (!raw) return c.json({ error: 'Not found' }, 404);
  const ensemble: Ensemble = JSON.parse(raw);
  if (ensemble.ownerEmail !== userEmail) return c.json({ error: 'Forbidden (owner only)' }, 403);
  await c.env.TUTTI.delete(`ensembles:${id}`);
  // index からも除去
  for (const m of ensemble.members) {
    const idxKey = `ensembles-by-user:${m.email}`;
    const idxRaw = await c.env.TUTTI.get(idxKey);
    if (idxRaw) {
      const ids: string[] = JSON.parse(idxRaw);
      await c.env.TUTTI.put(idxKey, JSON.stringify(ids.filter((x) => x !== id)), { expirationTtl: ENSEMBLE_TTL });
    }
  }
  return c.json({ ok: true });
});

// POST /api/tutti/ensembles/:id/invite — メンバー追加 (オーナー/マネージャー)
app.post('/api/tutti/ensembles/:id/invite', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const planTier = c.get('planTier');
  const id = c.req.param('id');
  const body = await c.req.json<{ email: string; name: string; section?: string; instrument?: string; role?: MemberRole }>();
  const raw = await c.env.TUTTI.get(`ensembles:${id}`);
  if (!raw) return c.json({ error: 'Not found' }, 404);
  const ensemble: Ensemble = JSON.parse(raw);
  const me = ensemble.members.find((m) => m.email === userEmail);
  if (!me || (me.role !== 'owner' && me.role !== 'manager')) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  if (ensemble.members.some((m) => m.email === body.email)) {
    return c.json({ error: 'Already member' }, 400);
  }
  if (isFreeOrPrelude(planTier) && ensemble.members.length >= FREE_MEMBERS_LIMIT) {
    return c.json({
      error: 'FREE_MEMBERS_LIMIT_EXCEEDED',
      limit: FREE_MEMBERS_LIMIT,
    }, 403);
  }
  const newMember: EnsembleMember = {
    email: body.email,
    name: body.name,
    role: body.role || 'member',
    section: body.section,
    instrument: body.instrument,
    joinedAt: new Date().toISOString(),
  };
  ensemble.members.push(newMember);
  ensemble.updatedAt = new Date().toISOString();
  await c.env.TUTTI.put(`ensembles:${id}`, JSON.stringify(ensemble), { expirationTtl: ENSEMBLE_TTL });
  // index 更新
  const idxKey = `ensembles-by-user:${body.email}`;
  const idxRaw = await c.env.TUTTI.get(idxKey);
  const ids: string[] = idxRaw ? JSON.parse(idxRaw) : [];
  if (!ids.includes(id)) ids.unshift(id);
  await c.env.TUTTI.put(idxKey, JSON.stringify(ids), { expirationTtl: ENSEMBLE_TTL });

  // 招待メール
  if (c.env.RESEND_API_KEY) {
    c.executionCtx.waitUntil(sendInviteEmails(c.env, ensemble, [newMember]));
  }
  return c.json({ ok: true, ensemble });
});

// ============================================================================
// EVENTS (リハーサル・本番)
// ============================================================================

// POST /api/tutti/events — 新規イベント (単発 or 繰り返し)
app.post('/api/tutti/events', requireAuth, async (c) => {
  try {
    const userEmail = c.get('userEmail');
    const body = await c.req.json<{
      ensembleId: string;
      title: string;
      description?: string;
      candidates: Array<{ start: string; end: string; location?: string; notes?: string }>;
      attendance?: 'all-required' | 'sections';
      requiredSections?: string[];
      optionalAttendees?: string[];
      pollDeadline?: string;
      // 繰り返しイベント
      repeat?: { pattern: RepeatPattern; count: number };
    }>();

    const ensRaw = await c.env.TUTTI.get(`ensembles:${body.ensembleId}`);
    if (!ensRaw) return c.json({ error: 'Ensemble not found' }, 404);
    const ensemble: Ensemble = JSON.parse(ensRaw);
    const me = ensemble.members.find((m) => m.email === userEmail);
    if (!me || (me.role !== 'owner' && me.role !== 'manager')) {
      return c.json({ error: 'Forbidden — only owner/manager can create events' }, 403);
    }

    if (!body.candidates || body.candidates.length === 0) {
      return c.json({ error: 'At least one candidate slot required' }, 400);
    }

    // ─── 繰り返しイベントの分岐 ───
    if (body.repeat && body.repeat.count > 1) {
      // シリーズ生成: 最初の候補をベースに、N 回分のイベントを作成
      // 各イベントは status='locked' で固定時刻のみ提示・メンバーは出席 RSVP のみ
      if (body.candidates.length !== 1) {
        return c.json({ error: 'Repeating events must have exactly 1 candidate' }, 400);
      }
      const seriesId = generateId();
      const total = Math.min(Math.max(body.repeat.count, 2), 52); // 最大 52 回 (1 年分)
      const baseStart = new Date(body.candidates[0].start);
      const baseEnd = new Date(body.candidates[0].end);
      const baseLocation = body.candidates[0].location;
      const baseNotes = body.candidates[0].notes;
      const intervalDays = body.repeat.pattern === 'weekly' ? 7 : body.repeat.pattern === 'biweekly' ? 14 : 30;
      const now = new Date().toISOString();
      const createdEvents: RehearsalEvent[] = [];

      for (let i = 0; i < total; i++) {
        const eventId = generateId();
        const offsetMs = intervalDays * i * 24 * 60 * 60 * 1000;
        const startThis = new Date(baseStart.getTime() + offsetMs);
        const endThis = new Date(baseEnd.getTime() + offsetMs);
        const candidateId = generateShortId();
        const event: RehearsalEvent = {
          id: eventId,
          ensembleId: body.ensembleId,
          title: body.title.slice(0, 200),
          description: body.description?.slice(0, 2000),
          candidates: [{ id: candidateId, start: startThis.toISOString(), end: endThis.toISOString(), location: baseLocation, notes: baseNotes }],
          status: 'locked', // 時刻は固定・出席 RSVP のみ可能
          lockedCandidateId: candidateId,
          lockedAt: now,
          attendance: body.attendance || 'all-required',
          requiredSections: body.requiredSections,
          optionalAttendees: body.optionalAttendees,
          seriesId,
          seriesIndex: i + 1,
          seriesTotal: total,
          createdBy: userEmail,
          createdAt: now,
          updatedAt: now,
        };
        await c.env.TUTTI.put(`events:${eventId}`, JSON.stringify(event), { expirationTtl: ENSEMBLE_TTL });
        createdEvents.push(event);
      }

      // ensemble の event index に新規追加 (新しい順)
      const idxKey = `events-by-ensemble:${body.ensembleId}`;
      const idxRaw = await c.env.TUTTI.get(idxKey);
      const ids: string[] = idxRaw ? JSON.parse(idxRaw) : [];
      // シリーズは時系列順に並ぶよう、reverse で挿入
      const newIds = createdEvents.map((e) => e.id);
      await c.env.TUTTI.put(idxKey, JSON.stringify([...newIds, ...ids]), { expirationTtl: ENSEMBLE_TTL });

      // 通知メール (シリーズの初回イベントだけ送信して負荷軽減)
      if (c.env.RESEND_API_KEY && createdEvents[0]) {
        c.executionCtx.waitUntil(sendSeriesNotifyEmails(c.env, ensemble, createdEvents));
      }

      return c.json({ ok: true, events: createdEvents, seriesId });
    }

    // ─── 単発イベント (従来通り) ───
    const now = new Date().toISOString();
    const eventId = generateId();
    const event: RehearsalEvent = {
      id: eventId,
      ensembleId: body.ensembleId,
      title: body.title.slice(0, 200),
      description: body.description?.slice(0, 2000),
      candidates: body.candidates.map((c) => ({
        id: generateShortId(),
        start: c.start,
        end: c.end,
        location: c.location,
        notes: c.notes,
      })),
      status: 'polling',
      attendance: body.attendance || 'all-required',
      requiredSections: body.requiredSections,
      optionalAttendees: body.optionalAttendees,
      pollDeadline: body.pollDeadline,
      createdBy: userEmail,
      createdAt: now,
      updatedAt: now,
    };
    await c.env.TUTTI.put(`events:${eventId}`, JSON.stringify(event), { expirationTtl: ENSEMBLE_TTL });

    const idxKey = `events-by-ensemble:${body.ensembleId}`;
    const idxRaw = await c.env.TUTTI.get(idxKey);
    const ids: string[] = idxRaw ? JSON.parse(idxRaw) : [];
    ids.unshift(eventId);
    await c.env.TUTTI.put(idxKey, JSON.stringify(ids), { expirationTtl: ENSEMBLE_TTL });

    if (c.env.RESEND_API_KEY) {
      c.executionCtx.waitUntil(sendPollInviteEmails(c.env, ensemble, event));
    }

    return c.json({ ok: true, event });
  } catch (err) {
    console.error('create event error:', err);
    return c.json({ error: 'Create failed', message: err instanceof Error ? err.message : 'unknown' }, 500);
  }
});

// GET /api/tutti/events/:id
app.get('/api/tutti/events/:id', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const id = c.req.param('id');
  const raw = await c.env.TUTTI.get(`events:${id}`);
  if (!raw) return c.json({ error: 'Not found' }, 404);
  const event: RehearsalEvent = JSON.parse(raw);
  // メンバーシップ確認
  const ensRaw = await c.env.TUTTI.get(`ensembles:${event.ensembleId}`);
  if (!ensRaw) return c.json({ error: 'Ensemble missing' }, 404);
  const ensemble: Ensemble = JSON.parse(ensRaw);
  if (!ensemble.members.some((m) => m.email === userEmail)) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  // 投票一覧取得
  const votes = await fetchVotes(c.env, id);
  return c.json({ ok: true, event, ensemble, votes });
});

// GET /api/tutti/ensembles/:id/events — このアンサンブルの全イベント
app.get('/api/tutti/ensembles/:id/events', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const id = c.req.param('id');
  const ensRaw = await c.env.TUTTI.get(`ensembles:${id}`);
  if (!ensRaw) return c.json({ error: 'Not found' }, 404);
  const ensemble: Ensemble = JSON.parse(ensRaw);
  if (!ensemble.members.some((m) => m.email === userEmail)) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  const idxRaw = await c.env.TUTTI.get(`events-by-ensemble:${id}`);
  if (!idxRaw) return c.json({ ok: true, events: [] });
  const ids: string[] = JSON.parse(idxRaw);
  const fetched = await Promise.all(ids.slice(0, 100).map((eid) => c.env.TUTTI.get(`events:${eid}`)));
  const events: RehearsalEvent[] = [];
  for (const raw of fetched) {
    if (raw) events.push(JSON.parse(raw));
  }
  return c.json({ ok: true, events });
});

// POST /api/tutti/events/:id/vote — 認証ユーザーが投票
app.post('/api/tutti/events/:id/vote', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const id = c.req.param('id');
  const body = await c.req.json<{
    voterName?: string;
    responses: Record<string, VoteResponse>;
    comment?: string;
  }>();

  const raw = await c.env.TUTTI.get(`events:${id}`);
  if (!raw) return c.json({ error: 'Not found' }, 404);
  const event: RehearsalEvent = JSON.parse(raw);
  // polling: 候補時刻投票 / locked: 出席 RSVP / cancelled: 不可
  if (event.status === 'cancelled') return c.json({ error: 'Event cancelled' }, 400);

  const ensRaw = await c.env.TUTTI.get(`ensembles:${event.ensembleId}`);
  if (!ensRaw) return c.json({ error: 'Ensemble missing' }, 404);
  const ensemble: Ensemble = JSON.parse(ensRaw);
  const me = ensemble.members.find((m) => m.email === userEmail);
  if (!me) return c.json({ error: 'Not a member' }, 403);

  const vote: Vote = {
    voterId: userEmail,
    voterName: body.voterName || me.name,
    voterEmail: userEmail,
    isGuest: false,
    responses: body.responses,
    comment: body.comment,
    votedAt: new Date().toISOString(),
  };
  await c.env.TUTTI.put(`votes:${id}:${userEmail}`, JSON.stringify(vote), { expirationTtl: ENSEMBLE_TTL });
  // index
  const idxKey = `votes-index:${id}`;
  const idxRaw = await c.env.TUTTI.get(idxKey);
  const voterIds: string[] = idxRaw ? JSON.parse(idxRaw) : [];
  if (!voterIds.includes(userEmail)) voterIds.push(userEmail);
  await c.env.TUTTI.put(idxKey, JSON.stringify(voterIds), { expirationTtl: ENSEMBLE_TTL });

  return c.json({ ok: true });
});

// POST /api/tutti/events/:id/lock — オーナーが最終確定
app.post('/api/tutti/events/:id/lock', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const id = c.req.param('id');
  const body = await c.req.json<{ candidateId: string }>();

  const raw = await c.env.TUTTI.get(`events:${id}`);
  if (!raw) return c.json({ error: 'Not found' }, 404);
  const event: RehearsalEvent = JSON.parse(raw);
  const ensRaw = await c.env.TUTTI.get(`ensembles:${event.ensembleId}`);
  if (!ensRaw) return c.json({ error: 'Ensemble missing' }, 404);
  const ensemble: Ensemble = JSON.parse(ensRaw);
  const me = ensemble.members.find((m) => m.email === userEmail);
  if (!me || (me.role !== 'owner' && me.role !== 'manager')) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  const candidate = event.candidates.find((c) => c.id === body.candidateId);
  if (!candidate) return c.json({ error: 'Candidate not found' }, 404);

  event.status = 'locked';
  event.lockedCandidateId = body.candidateId;
  event.lockedAt = new Date().toISOString();
  event.updatedAt = event.lockedAt;
  await c.env.TUTTI.put(`events:${id}`, JSON.stringify(event), { expirationTtl: ENSEMBLE_TTL });

  // 確定通知メール (全メンバーに iCal 添付)
  if (c.env.RESEND_API_KEY) {
    c.executionCtx.waitUntil(sendLockedNotifyEmails(c.env, ensemble, event, candidate));
  }
  return c.json({ ok: true, event });
});

// POST /api/tutti/events/:id/cancel — キャンセル
app.post('/api/tutti/events/:id/cancel', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const id = c.req.param('id');
  const raw = await c.env.TUTTI.get(`events:${id}`);
  if (!raw) return c.json({ error: 'Not found' }, 404);
  const event: RehearsalEvent = JSON.parse(raw);
  const ensRaw = await c.env.TUTTI.get(`ensembles:${event.ensembleId}`);
  if (!ensRaw) return c.json({ error: 'Ensemble missing' }, 404);
  const ensemble: Ensemble = JSON.parse(ensRaw);
  const me = ensemble.members.find((m) => m.email === userEmail);
  if (!me || (me.role !== 'owner' && me.role !== 'manager')) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  event.status = 'cancelled';
  event.cancelledAt = new Date().toISOString();
  event.updatedAt = event.cancelledAt;
  await c.env.TUTTI.put(`events:${id}`, JSON.stringify(event), { expirationTtl: ENSEMBLE_TTL });
  return c.json({ ok: true });
});

// GET /api/tutti/events/:id/ical — iCal (.ics) ダウンロード
app.get('/api/tutti/events/:id/ical', requireAuth, async (c) => {
  const userEmail = c.get('userEmail');
  const id = c.req.param('id');
  const raw = await c.env.TUTTI.get(`events:${id}`);
  if (!raw) return c.json({ error: 'Not found' }, 404);
  const event: RehearsalEvent = JSON.parse(raw);
  if (event.status !== 'locked' || !event.lockedCandidateId) {
    return c.json({ error: 'Event not yet locked' }, 400);
  }
  const ensRaw = await c.env.TUTTI.get(`ensembles:${event.ensembleId}`);
  if (!ensRaw) return c.json({ error: 'Ensemble missing' }, 404);
  const ensemble: Ensemble = JSON.parse(ensRaw);
  if (!ensemble.members.some((m) => m.email === userEmail)) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  const candidate = event.candidates.find((c) => c.id === event.lockedCandidateId)!;
  const ics = buildICalendar(event, ensemble, candidate);
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slugify(event.title)}.ics"`,
    },
  });
});

// ============================================================================
// GUEST VOTING (アカウント不要・メールリンクから投票)
// ============================================================================

// GET /api/tutti/guest-vote/:token — トークンからイベント情報取得 (公開)
app.get('/api/tutti/guest-vote/:token', requireBearer, async (c) => {
  const token = c.req.param('token');
  const tokenRaw = await c.env.TUTTI.get(`guest-tokens:${token}`);
  if (!tokenRaw) return c.json({ error: 'Token invalid or expired' }, 404);
  const guestToken: GuestToken = JSON.parse(tokenRaw);
  if (new Date(guestToken.expiresAt).getTime() < Date.now()) {
    return c.json({ error: 'Token expired' }, 410);
  }
  const eventRaw = await c.env.TUTTI.get(`events:${guestToken.eventId}`);
  if (!eventRaw) return c.json({ error: 'Event not found' }, 404);
  const event: RehearsalEvent = JSON.parse(eventRaw);
  const ensRaw = await c.env.TUTTI.get(`ensembles:${event.ensembleId}`);
  const ensemble: Ensemble | null = ensRaw ? JSON.parse(ensRaw) : null;
  return c.json({ ok: true, event, ensemble, guestEmail: guestToken.email, guestName: guestToken.name });
});

// POST /api/tutti/guest-vote/:token — Guest 投票
app.post('/api/tutti/guest-vote/:token', requireBearer, async (c) => {
  const token = c.req.param('token');
  const body = await c.req.json<{
    voterName?: string;
    responses: Record<string, VoteResponse>;
    comment?: string;
  }>();

  const tokenRaw = await c.env.TUTTI.get(`guest-tokens:${token}`);
  if (!tokenRaw) return c.json({ error: 'Token invalid' }, 404);
  const guestToken: GuestToken = JSON.parse(tokenRaw);
  if (new Date(guestToken.expiresAt).getTime() < Date.now()) {
    return c.json({ error: 'Token expired' }, 410);
  }
  const eventRaw = await c.env.TUTTI.get(`events:${guestToken.eventId}`);
  if (!eventRaw) return c.json({ error: 'Event not found' }, 404);
  const event: RehearsalEvent = JSON.parse(eventRaw);
  if (event.status === 'cancelled') return c.json({ error: 'Event cancelled' }, 400);

  const voterId = `guest:${guestToken.email}`;
  const vote: Vote = {
    voterId,
    voterName: body.voterName || guestToken.name,
    voterEmail: guestToken.email,
    isGuest: true,
    responses: body.responses,
    comment: body.comment,
    votedAt: new Date().toISOString(),
  };
  await c.env.TUTTI.put(`votes:${guestToken.eventId}:${voterId}`, JSON.stringify(vote), { expirationTtl: ENSEMBLE_TTL });
  const idxKey = `votes-index:${guestToken.eventId}`;
  const idxRaw = await c.env.TUTTI.get(idxKey);
  const voterIds: string[] = idxRaw ? JSON.parse(idxRaw) : [];
  if (!voterIds.includes(voterId)) voterIds.push(voterId);
  await c.env.TUTTI.put(idxKey, JSON.stringify(voterIds), { expirationTtl: ENSEMBLE_TTL });

  return c.json({ ok: true });
});

// ============================================================================
// Helpers
// ============================================================================

async function fetchVotes(env: Env, eventId: string): Promise<Vote[]> {
  const idxRaw = await env.TUTTI.get(`votes-index:${eventId}`);
  if (!idxRaw) return [];
  const voterIds: string[] = JSON.parse(idxRaw);
  const fetched = await Promise.all(
    voterIds.map((vid) => env.TUTTI.get(`votes:${eventId}:${vid}`)),
  );
  const votes: Vote[] = [];
  for (const raw of fetched) {
    if (raw) votes.push(JSON.parse(raw));
  }
  return votes;
}

function isFreeOrPrelude(planTier: string): boolean {
  return planTier === 'free' || planTier === 'prelude';
}

function generateId(): string {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateShortId(): string {
  const arr = new Uint8Array(4);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function generateGuestToken(): string {
  const arr = new Uint8Array(TOKEN_LENGTH_BYTES);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function slugify(s: string): string {
  return s.replace(/[^\w一-龯ぁ-ゟ゠-ヿ\-]/g, '_').slice(0, 80) || 'event';
}

function escapeIcs(s: string): string {
  return (s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function toIcsDate(iso: string): string {
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '').replace('Z', '') + 'Z';
}

function buildICalendar(event: RehearsalEvent, ensemble: Ensemble, candidate: EventCandidate): string {
  const dtstamp = toIcsDate(new Date().toISOString());
  const dtstart = toIcsDate(candidate.start);
  const dtend = toIcsDate(candidate.end);
  const summary = escapeIcs(`${event.title} (${ensemble.name})`);
  const desc = escapeIcs(event.description || '');
  const loc = escapeIcs(candidate.location || '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KUON R&D//KUON TUTTI//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:tutti-${event.id}@kuon-rnd.com`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${desc}`,
    `LOCATION:${loc}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}

// ============================================================================
// Email helpers (Resend)
// ============================================================================

async function sendInviteEmails(env: Env, ensemble: Ensemble, members: EnsembleMember[]): Promise<void> {
  for (const m of members) {
    try {
      await sendEmail(env, {
        to: m.email,
        subject: `${ensemble.name} に招待されました — KUON TUTTI`,
        html: `<p>${m.name} 様</p>
<p>KUON TUTTI のアンサンブル <strong>${ensemble.name}</strong> に招待されました。</p>
<p>リハーサル予定の調整に参加するため、以下のリンクからログインしてください。</p>
<p><a href="https://kuon-rnd.com/tutti">https://kuon-rnd.com/tutti</a></p>
<p>アカウントが無くてもメールリンクから投票できます。</p>
<p>— KUON R&D / 空音開発</p>`,
      });
    } catch (e) {
      console.error('invite mail error:', e);
    }
  }
}

async function sendPollInviteEmails(env: Env, ensemble: Ensemble, event: RehearsalEvent): Promise<void> {
  for (const m of ensemble.members) {
    if (m.email === event.createdBy) continue; // 主催者本人はスキップ
    try {
      // Guest トークンを発行 (アカウント無しメンバー用)
      const token = generateGuestToken();
      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 日後
      const guestToken: GuestToken = {
        token,
        eventId: event.id,
        email: m.email,
        name: m.name,
        createdAt: new Date().toISOString(),
        expiresAt,
      };
      await env.TUTTI.put(`guest-tokens:${token}`, JSON.stringify(guestToken), {
        expirationTtl: 60 * 24 * 60 * 60,
      });

      const candidatesHtml = event.candidates.map((c) => {
        const start = new Date(c.start).toLocaleString('ja-JP');
        const end = new Date(c.end).toLocaleString('ja-JP');
        return `<li>${start} 〜 ${end}${c.location ? ` (${c.location})` : ''}</li>`;
      }).join('');

      await sendEmail(env, {
        to: m.email,
        subject: `[投票依頼] ${event.title} — ${ensemble.name}`,
        html: `<p>${m.name} 様</p>
<p>${ensemble.name} のリハーサル予定の調整です。</p>
<p><strong>${event.title}</strong></p>
${event.description ? `<p>${event.description}</p>` : ''}
<p>候補日時:</p>
<ul>${candidatesHtml}</ul>
<p>あなたが参加可能な日時を以下のリンクから入力してください (アカウント不要):</p>
<p><a href="https://kuon-rnd.com/tutti/vote/${token}">参加可否を入力する</a></p>
<p>もしくは KUON にログインしている方はこちら:<br>
<a href="https://kuon-rnd.com/tutti/events/${event.id}">https://kuon-rnd.com/tutti/events/${event.id}</a></p>
<p>— KUON TUTTI / 空音開発</p>`,
      });
    } catch (e) {
      console.error('poll mail error:', e);
    }
  }
}

async function sendSeriesNotifyEmails(env: Env, ensemble: Ensemble, events: RehearsalEvent[]): Promise<void> {
  if (events.length === 0) return;
  const first = events[0];
  const total = events.length;
  const occurrencesHtml = events.map((e) => {
    const c = e.candidates[0];
    const start = new Date(c.start).toLocaleString('ja-JP');
    return `<li>${start}${c.location ? ` (${c.location})` : ''}</li>`;
  }).join('');
  for (const m of ensemble.members) {
    try {
      await sendEmail(env, {
        to: m.email,
        subject: `[シリーズ予約] ${first.title} (全 ${total} 回) — ${ensemble.name}`,
        html: `<p>${m.name} 様</p>
<p>${ensemble.name} の繰り返しリハーサル予約が登録されました。</p>
<p><strong>${first.title}</strong> (全 ${total} 回)</p>
<p>予定一覧:</p>
<ul>${occurrencesHtml}</ul>
<p>各回の出席可否は KUON TUTTI でご回答ください:<br>
<a href="https://kuon-rnd.com/tutti/ensembles/${ensemble.id}">https://kuon-rnd.com/tutti/ensembles/${ensemble.id}</a></p>
<p>— KUON TUTTI / 空音開発</p>`,
      });
    } catch (e) {
      console.error('series mail error:', e);
    }
  }
}

async function sendLockedNotifyEmails(env: Env, ensemble: Ensemble, event: RehearsalEvent, candidate: EventCandidate): Promise<void> {
  const start = new Date(candidate.start).toLocaleString('ja-JP');
  const end = new Date(candidate.end).toLocaleString('ja-JP');
  for (const m of ensemble.members) {
    try {
      await sendEmail(env, {
        to: m.email,
        subject: `[確定] ${event.title} — ${ensemble.name}`,
        html: `<p>${m.name} 様</p>
<p>${ensemble.name} のリハーサル日時が確定しました。</p>
<p><strong>${event.title}</strong></p>
<p>📅 ${start} 〜 ${end}</p>
${candidate.location ? `<p>📍 ${candidate.location}</p>` : ''}
${event.description ? `<p>${event.description}</p>` : ''}
<p>カレンダーに追加 (.ics):<br>
<a href="https://kuon-rnd.com/api/tutti/events/${event.id}/ical">.ics ダウンロード</a></p>
<p>詳細:<br>
<a href="https://kuon-rnd.com/tutti/events/${event.id}">https://kuon-rnd.com/tutti/events/${event.id}</a></p>
<p>— KUON TUTTI / 空音開発</p>`,
      });
    } catch (e) {
      console.error('locked mail error:', e);
    }
  }
}

async function sendEmail(env: Env, params: { to: string; subject: string; html: string }): Promise<void> {
  if (!env.RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'KUON TUTTI <noreply@kotaroasahina.com>',
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });
}

export default app;
