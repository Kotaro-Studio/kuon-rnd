import { Hono } from 'hono';
import { cors } from 'hono/cors';
import Stripe from 'stripe';
import {
  PRODUCT_IDS,
  PRICE_IDS,
  COUPON_IDS,
  PORTAL_CONFIG_ID,
  planFromProductId,
  isLatamCountry,
  type PlanTier,
  type SubscriptionStatus,
  type BillingCycle,
  type PricingRegion,
} from './stripe-prices';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Env {
  USERS: KVNamespace;
  SESSIONS: KVNamespace;
  AUTH_SECRET: string;
  RESEND_API_KEY: string;
  GOOGLE_CLIENT_ID: string;
  ENVIRONMENT: string;
  // ── Stripe (Phase 7 — added 2026-04-25) ──
  STRIPE_SECRET_KEY: string;       // rk_live_... (Restricted Key with subscription scopes)
  STRIPE_WEBHOOK_SECRET: string;   // whsec_... (Webhook endpoint signing secret)
}

interface UserData {
  email: string;
  name: string;
  instrument: string;       // legacy — kept for backward compat
  region: string;            // legacy — kept for backward compat
  bio: string;
  plan: 'free' | 'student' | 'pro';
  stripeCustomerId: string;
  badges: string[];
  createdAt: string;
  lastLoginAt: string;
  appUsage: Record<string, number>;
  appUsageMonth: string;
  country: string;
  city: string;
  // ── Extended profile (v2) ──
  role: string;              // e.g. "violin", "recording-engineer"
  roleCategory: string;      // e.g. "strings", "production"
  customRoleName: string;    // free text for "other-eastern" / "other-western"
  birthDate: string;         // "YYYY-MM-DD" or ""
  showBirthDate: boolean;
  basedIn: string;           // free text location
  mobility: string;          // "local" | "domestic" | "international"
  avatarKey: string;         // KV key for avatar image
  snsYoutube: string;
  snsInstagram: string;
  snsX: string;
  snsSoundcloud: string;
  snsWebsite: string;
  availableForWork: boolean;
  experienceLevel: string;   // "student" | "amateur" | "semi-pro" | "professional"
  spokenLanguages: string;   // comma-separated: "ja,en,es"
  // ── Stripe subscription (Phase 7 — added 2026-04-25) ──
  // 旧 plan フィールドは backward compat のため残す。新規ロジックは planTier を参照する。
  planTier: PlanTier;                       // 'free' | 'prelude' | 'concerto' | 'symphony' | 'opus'
  stripeSubscriptionId: string;             // sub_... or '' if no active sub
  subscriptionStatus: SubscriptionStatus;   // 'none' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid' | 'paused'
  subscriptionPriceId: string;              // price_... or ''
  billingCycle: BillingCycle | '';          // 'monthly' | 'annual' | ''
  pricingRegion: PricingRegion | '';        // 'global' | 'latam' | ''
  currentPeriodStart: number;               // unix timestamp (seconds)
  currentPeriodEnd: number;                 // unix timestamp (seconds)
  cancelAtPeriodEnd: boolean;               // true if user requested cancellation at period end
}

interface PageviewData {
  total: number;
  countries: Record<string, number>;
  pages: Record<string, number>;
  // Added 2026-04-23 (non-destructive): optional attribution signals.
  // Older records will not have these fields; readers must treat them as optional.
  referrers?: Record<string, number>;
  utm?: Record<string, number>; // key: `${source}/${medium}/${campaign}`
}

// ─────────────────────────────────────────────
// Event / Live Schedule types
// ─────────────────────────────────────────────
interface EventData {
  id: string;
  creatorEmail: string;
  title: string;
  description: string;
  date: string;            // YYYY-MM-DD
  startTime: string;       // HH:MM
  endTime: string;         // HH:MM or ""
  venueName: string;
  venueAddress: string;
  lat: number;
  lng: number;
  price: string;           // free text: "¥3,000", "Free", "$20" etc.
  eventType: string;       // concert | recital | jam-session | workshop | festival | recital-exam | open-mic | other
  genre: string;           // classical | jazz | pop | folk | world | chamber | orchestra | choir | brass-band | other
  performers: EventPerformer[];
  interestedCount: number;
  interestedEmails: string[];  // emails of users who clicked "interested"
  createdAt: string;
  updatedAt: string;
}

interface EventPerformer {
  name: string;
  role: string;            // instrument / role name
  email: string;           // kuon user email (optional, "" if external)
}

interface VenueData {
  name: string;
  address: string;
  lat: number;
  lng: number;
  usageCount: number;
  lastUsed: string;
}

interface MagicSession {
  email: string;
  expires: number;
}

interface JWTPayload {
  email: string;
  plan: string;
  iat: number;
  exp: number;
}

// ─────────────────────────────────────────────
// Crypto helpers (Edge-compatible, no Node.js)
// ─────────────────────────────────────────────
async function hmacSign(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmacVerify(message: string, signature: string, secret: string): Promise<boolean> {
  const expected = await hmacSign(message, secret);
  return expected === signature;
}

function base64UrlEncode(obj: object): string {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): object {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(padded));
}

async function createJWT(payload: JWTPayload, secret: string): Promise<string> {
  const header = base64UrlEncode({ alg: 'HS256', typ: 'JWT' });
  const body = base64UrlEncode(payload);
  const signature = await hmacSign(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}

async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const valid = await hmacVerify(`${header}.${body}`, signature, secret);
  if (!valid) return null;
  const payload = base64UrlDecode(body) as JWTPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────
// Monthly quota table for server-side apps (SEPARATOR, TRANSCRIBER, etc.)
// Browser-only apps (NORMALIZE, DECLIPPER, etc.) are NOT listed here — they are unlimited.
// See CLAUDE.md §29 for the design rationale.
// ─────────────────────────────────────────────
const APP_QUOTAS: Record<string, Record<'free' | 'student' | 'pro', number>> = {
  separator: { free: 3, student: 10, pro: 50 },
  // transcriber: { free: 1, student: 5, pro: 20 },  // future
  // intonation: { free: 30, student: 300, pro: 1000 }, // future
};

function quotaFor(appName: string, plan: 'free' | 'student' | 'pro'): number {
  return APP_QUOTAS[appName]?.[plan] ?? 0;
}

// ─────────────────────────────────────────────
// Phase 2 (2026-04-26) 新クォータ体系
// CLAUDE.md §38.4 + Option C ハイブリッド準拠
//
// 現状の APP_QUOTAS は legacy plan ('free'|'student'|'pro') ベース。
// こちらは新 planTier ('prelude'|'concerto'|'symphony'|'opus') 対応版。
//
// 「ピッチ分析: ほぼ無制限」表記の内部 cap も内蔵 (顧客には未公開・コスト保護のみ):
//   intonation: Concerto 50 / Symphony 100 / Opus 200
//
// ブラウザアプリ (METRONOME 等) は APP_QUOTAS_TIER に含めない = 無制限
// ─────────────────────────────────────────────

type QuotaPlan = 'free' | 'prelude' | 'concerto' | 'symphony' | 'opus';

// 2026-04-28 サーバーコスト健全化 + 保守的スタート (CLAUDE.md §44.10)
//   旧: Symphony separator 120 / transcribe 80
//   新: Symphony separator 35  / transcribe 60
//   原則: 「後から増やせるが減らせない」のため初期は絞る
// 設計思想: UI 表記 (PLAN_QUOTAS) と完全一致 (隠しバッファ廃止・透明性)
// Concerto 15 / Symphony 35 = 約 2.3 倍比率で「最上位プラン感」を心理的に演出
const APP_QUOTAS_TIER: Record<string, Record<QuotaPlan, number>> = {
  separator:  { free: 0, prelude: 2,  concerto: 15, symphony: 35, opus: 300 },
  transcribe: { free: 0, prelude: 5,  concerto: 30, symphony: 60, opus: 300 },
  intonation: { free: 0, prelude: 30, concerto: 50, symphony: 100, opus: 200 }, // ほぼ無制限の内部 cap
  // 2026-04-30: KUON LESSON RECORDER (Workers AI Whisper) — Prelude から使えるサブスク特典
  // 単位: 月間「書き起こし回数」(1 回 = 1 つのレッスン録音、最大 60 分)
  // Workers AI コストは極めて低いため Prelude でも豊富に提供可能
  'lesson-recorder': { free: 1, prelude: 20, concerto: 80, symphony: 200, opus: 600 },
};

/**
 * legacy plan 名と新 planTier の両方を受け付ける統一クォータ取得関数
 */
function quotaForTier(appName: string, planValue: string): number {
  const map = APP_QUOTAS_TIER[appName];
  if (!map) return -1; // -1 = unlimited (browser apps)

  // legacy plan 名から新 tier 名へマッピング
  const tierMap: Record<string, QuotaPlan> = {
    free: 'free',
    student: 'prelude',
    pro: 'concerto',
    max: 'symphony',
    enterprise: 'opus',
    prelude: 'prelude',
    concerto: 'concerto',
    symphony: 'symphony',
    opus: 'opus',
  };
  const tier = tierMap[planValue] ?? 'free';
  return map[tier] ?? 0;
}

/**
 * このアプリは server app (クォータ管理対象) か?
 */
function isServerApp(appName: string): boolean {
  return APP_QUOTAS_TIER[appName] !== undefined;
}

/**
 * KV usage キーを生成: usage:{email}:{YYYY-MM}:{appId}
 */
function usageKey(email: string, month: string, appName: string): string {
  return `usage:${email}:${month}:${appName}`;
}

/**
 * 当月の月末日 (リセット日) を ISO 形式で返す
 */
function nextResetDate(month: string): string {
  // month = "YYYY-MM"
  const [yStr, mStr] = month.split('-');
  const year = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  // 翌月 1 日
  const nextYear = m === 12 ? year + 1 : year;
  const nextMonth = m === 12 ? 1 : m + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
}

// ─────────────────────────────────────────────
// Stripe helpers (Phase 7 — added 2026-04-25)
// ─────────────────────────────────────────────

/**
 * Stripe SDK インスタンスを生成 (Cloudflare Workers 互換)。
 * apiVersion は Phase 4/5 スクリプトと一致させる。
 */
function getStripe(env: Env): Stripe {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-04-22.dahlia',
    httpClient: Stripe.createFetchHttpClient(),
  });
}

/**
 * KV から取得した user データに Stripe フィールドが無い場合、デフォルト値で補完する。
 * Lazy migration 方式: 既存ユーザーは次回書き込み時に自動的に新フィールドが追加される。
 */
function ensureStripeFields(raw: unknown): UserData {
  const partial = raw as Partial<UserData>;
  return {
    ...(partial as UserData),
    planTier:             partial.planTier             ?? 'free',
    stripeSubscriptionId: partial.stripeSubscriptionId ?? '',
    subscriptionStatus:   partial.subscriptionStatus   ?? 'none',
    subscriptionPriceId:  partial.subscriptionPriceId  ?? '',
    billingCycle:         partial.billingCycle         ?? '',
    pricingRegion:        partial.pricingRegion        ?? '',
    currentPeriodStart:   partial.currentPeriodStart   ?? 0,
    currentPeriodEnd:     partial.currentPeriodEnd     ?? 0,
    cancelAtPeriodEnd:    partial.cancelAtPeriodEnd    ?? false,
  };
}

/**
 * Stripe Customer ID から user (email + UserData) を逆引きする。
 * Webhook イベントは多くの場合 customer ID しか含まないため、この逆引きが必須。
 * KV インデックス: SESSIONS namespace の `stripe-customer:{customerId}` → email
 */
async function getUserByStripeCustomerId(
  env: Env,
  customerId: string,
): Promise<{ email: string; user: UserData } | null> {
  const email = await env.SESSIONS.get(`stripe-customer:${customerId}`);
  if (!email) return null;
  // KV USERS のキーは `user:${email}` 形式 (既存コード規約)
  const raw = await env.USERS.get(`user:${email}`);
  if (!raw) return null;
  const user = ensureStripeFields(JSON.parse(raw));
  return { email, user };
}

/**
 * Stripe Customer ID と email を紐づける逆引きインデックスを KV に保存する。
 * checkout.session.completed イベント等で初回のみ呼ぶ。
 */
async function indexStripeCustomer(env: Env, customerId: string, email: string): Promise<void> {
  await env.SESSIONS.put(`stripe-customer:${customerId}`, email);
}

/**
 * HALF50 (初月 50% オフ) Coupon を既に使用済みかチェックする。
 * 抜け道防止: 「Symphony HALF50 → 解約 → Concerto HALF50 → ...」の無限ループを禁止。
 * 一度でも HALF50 を attach した Checkout が完了したら true を返す。
 */
async function hasUsedHalf50(env: Env, email: string): Promise<boolean> {
  const flag = await env.SESSIONS.get(`half50-used:${email}`);
  return flag === '1';
}

/**
 * HALF50 使用済みフラグを立てる。
 * checkout.session.completed Webhook で discount が含まれていた場合に呼ぶ。
 * KV TTL なし (永続フラグ)。
 */
async function markHalf50Used(env: Env, email: string): Promise<void> {
  await env.SESSIONS.put(`half50-used:${email}`, '1');
}

/**
 * 既存の UserData レコードに部分更新を適用して KV に保存する。
 * Stripe Webhook ハンドラから plan/status などを更新する際に使用。
 */
async function updateUserStripe(
  env: Env,
  email: string,
  updates: Partial<UserData>,
): Promise<UserData | null> {
  // KV USERS のキーは `user:${email}` 形式 (既存コード規約)
  const userKey = `user:${email}`;
  const raw = await env.USERS.get(userKey);
  if (!raw) return null;
  const current = ensureStripeFields(JSON.parse(raw));
  const merged: UserData = { ...current, ...updates };
  await env.USERS.put(userKey, JSON.stringify(merged));
  return merged;
}

/**
 * Price ID から地域 (Global / LatAm) を逆引きする。
 * stripe-prices.ts の PRICE_IDS マップに対して全件検索。
 * 見つからない場合は '' (未確定) を返す。
 */
function inferRegionFromPriceId(priceId: string): PricingRegion | '' {
  for (const planKey of Object.keys(PRICE_IDS) as Array<keyof typeof PRICE_IDS>) {
    const prices = PRICE_IDS[planKey];
    for (const [key, value] of Object.entries(prices)) {
      if (value === priceId) {
        return key.endsWith('_latam') ? 'latam' : 'global';
      }
    }
  }
  return '';
}

/**
 * 新 PlanTier ('prelude' 等) を旧 plan フィールド ('free' | 'student' | 'pro') にマッピング。
 * legacy quotaFor() / JWT plan / admin/plan エンドポイントとの後方互換のため。
 */
function legacyPlanFromTier(tier: PlanTier): 'free' | 'student' | 'pro' {
  switch (tier) {
    case 'prelude':  return 'free';      // ¥780 entry-level: free quota を維持
    case 'concerto': return 'student';
    case 'symphony': return 'pro';
    case 'opus':     return 'pro';
    case 'free':
    default:         return 'free';
  }
}

/**
 * Stripe オブジェクトの customer フィールド (string | object) から ID 文字列を取り出す。
 */
function extractCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string {
  if (!customer) return '';
  return typeof customer === 'string' ? customer : customer.id;
}

// ─────────────────────────────────────────────
// Stripe Webhook event handlers (Phase 7 — Stage D)
//
// すべて冪等性確保 (同じイベントが二度届いても結果が同じ) + 失敗時 console.error → 200 で握りつぶす。
// これは Stripe webhook のリトライポリシー (24時間で 8 回再送) を抑止するため。
// 重要なエラーは Cloudflare ログから検知する。
// ─────────────────────────────────────────────

/**
 * Checkout 完了時: Stripe Customer ID と Kuon ユーザー (email) を紐付ける。
 * 後続の customer.subscription.created で planTier 等が確定する。
 */
async function handleCheckoutCompleted(env: Env, event: Stripe.Event): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;
  const stripeCustomerId = extractCustomerId(session.customer);

  // ユーザー email の特定: metadata 優先 → customer_email → customer_details.email
  const userEmail =
    session.metadata?.userEmail ||
    session.customer_email ||
    session.customer_details?.email ||
    '';

  if (!userEmail) {
    console.error('[webhook:checkout.completed] no email in session', session.id);
    return;
  }
  if (!stripeCustomerId) {
    console.error('[webhook:checkout.completed] no customer in session', session.id);
    return;
  }

  // 逆引きインデックスを保存 (今後の Webhook で customer ID → email を引けるように)
  await indexStripeCustomer(env, stripeCustomerId, userEmail);

  // ユーザーレコードに stripeCustomerId を設定 (planTier は subscription.created で確定)
  await updateUserStripe(env, userEmail, {
    stripeCustomerId,
  });

  // HALF50 が attach されていた Checkout が完了した場合、使用済みフラグを立てる。
  // 今後この email が再 Checkout しても HALF50 は attach されない。
  if (session.metadata?.half50Applied === '1') {
    await markHalf50Used(env, userEmail);
    console.log('[webhook:checkout.completed] HALF50 used flag set for', userEmail);
  }

  console.log('[webhook:checkout.completed]', userEmail, '→', stripeCustomerId);
}

/**
 * subscription.created / updated / paused / resumed の共通処理。
 * Stripe からは sub.status が現在の正しい値で送られてくるため、
 * paused/resumed も同じハンドラで処理可能。
 */
async function handleSubscriptionEvent(env: Env, event: Stripe.Event): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  const stripeCustomerId = extractCustomerId(sub.customer);

  const lookup = await getUserByStripeCustomerId(env, stripeCustomerId);
  if (!lookup) {
    console.error('[webhook:subscription]', event.type, '— no user for customer', stripeCustomerId);
    return;
  }

  const item = sub.items.data[0];
  if (!item) {
    console.error('[webhook:subscription]', event.type, '— no items', sub.id);
    return;
  }

  const productId =
    typeof item.price.product === 'string' ? item.price.product : item.price.product.id;
  const planTier = planFromProductId(productId);
  const cycle: BillingCycle = item.price.recurring?.interval === 'year' ? 'annual' : 'monthly';
  const region = inferRegionFromPriceId(item.price.id);

  // current_period_start/end は Stripe API でトップレベルにある場合とアイテム側にある場合がある
  const subAny = sub as unknown as Record<string, unknown>;
  const itemAny = item as unknown as Record<string, unknown>;
  const periodStart = (subAny.current_period_start as number | undefined)
    ?? (itemAny.current_period_start as number | undefined)
    ?? 0;
  const periodEnd = (subAny.current_period_end as number | undefined)
    ?? (itemAny.current_period_end as number | undefined)
    ?? 0;

  await updateUserStripe(env, lookup.email, {
    planTier,
    stripeSubscriptionId: sub.id,
    subscriptionStatus: sub.status as SubscriptionStatus,
    subscriptionPriceId: item.price.id,
    billingCycle: cycle,
    pricingRegion: region,
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    plan: legacyPlanFromTier(planTier),
  });

  // 2026-04-27 IQ180 機能 B: アップグレード時に showcase アプリを自動的にお気に入りへ
  // 失敗してもサブスク更新は完了してるのでログだけ残して握りつぶす
  await ensureShowcaseFavorites(env, lookup.email, planTier).catch((err) => {
    console.error('[favorites:showcase] failed for', lookup.email, err);
  });

  console.log(
    '[webhook:subscription]',
    event.type,
    lookup.email,
    'plan=', planTier,
    'cycle=', cycle,
    'region=', region,
    'status=', sub.status,
    'cancelAtEnd=', sub.cancel_at_period_end,
  );
}

/**
 * subscription.deleted: 解約完了 → planTier='free' に戻す。
 */
async function handleSubscriptionDeleted(env: Env, event: Stripe.Event): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  const stripeCustomerId = extractCustomerId(sub.customer);

  const lookup = await getUserByStripeCustomerId(env, stripeCustomerId);
  if (!lookup) {
    console.error('[webhook:subscription.deleted] no user for customer', stripeCustomerId);
    return;
  }

  await updateUserStripe(env, lookup.email, {
    planTier: 'free',
    stripeSubscriptionId: '',
    subscriptionStatus: 'canceled',
    subscriptionPriceId: '',
    billingCycle: '',
    pricingRegion: '',
    cancelAtPeriodEnd: false,
    plan: 'free',
  });

  console.log('[webhook:subscription.deleted]', lookup.email, 'reverted to free');
}

/**
 * invoice.paid: 支払い成功記録 + 教師経由学生クーポンの 2 段階適用
 *
 * 教師経由学生クーポン (CLAUDE.md §44.4 / §44.8):
 *   月 0 Checkout: HALF50 を attach (50% off 月 1)
 *   月 1 ここ: 初回請求支払い完了 → STUDENT_30_12MO に切替 (30% off × 12 months 開始)
 *   月 14: 自動的に通常価格に回復 (Stripe duration_in_months: 12 で実現)
 *
 * 切替条件:
 *   subscription.metadata.pendingStudentSwitch === '1'
 *   AND invoice.billing_reason === 'subscription_create' (初回請求のみ)
 *   AND subscription.status === 'active' (支払い成功で active 状態)
 *
 * 失敗時: log のみ。Stripe 側で自動リトライされる Webhook なので、
 * 後続のイベントで成功する。冪等性は metadata.pendingStudentSwitch を
 * '0' に書き換えることで担保。
 */
async function handleInvoicePaid(env: Env, event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const stripeCustomerId = extractCustomerId(invoice.customer ?? null);

  console.log(
    '[webhook:invoice.paid]',
    stripeCustomerId,
    'amount=', invoice.amount_paid,
    'currency=', invoice.currency,
    'reason=', invoice.billing_reason,
  );

  // 初回請求のみ処理 (subscription_create = 新規サブスク作成時の最初の請求)
  if (invoice.billing_reason !== 'subscription_create') return;

  // Subscription ID を取得 (新しい Stripe API では parent.subscription_details に格納)
  type InvoiceWithLegacySub = Stripe.Invoice & { subscription?: string | { id: string } | null };
  const inv = invoice as InvoiceWithLegacySub;
  const subFromParent = invoice.parent?.subscription_details?.subscription;
  const subscriptionId =
    typeof subFromParent === 'string'
      ? subFromParent
      : subFromParent?.id ||
        (typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id) ||
        '';
  if (!subscriptionId) return;

  const stripe = getStripe(env);

  let sub: Stripe.Subscription;
  try {
    sub = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (err) {
    console.error('[webhook:invoice.paid] retrieve sub failed:', err);
    return;
  }

  // 教師経由スイッチが pending か確認
  const pending = sub.metadata?.pendingStudentSwitch;
  if (pending !== '1') return;

  const teacherEmail = sub.metadata?.teacherEmail || '';
  console.log('[webhook:invoice.paid] applying STUDENT_30_12MO to', subscriptionId, 'teacher=', teacherEmail);

  // Subscription に STUDENT_30_12MO を attach + フラグをクリア (冪等性確保)
  // Stripe SDK v22+: 単一 coupon の場合は discounts: [{ coupon }] または直接 coupon フィールド使用可
  try {
    await stripe.subscriptions.update(subscriptionId, {
      discounts: [{ coupon: COUPON_IDS.student_30_12mo }],
      metadata: {
        ...sub.metadata,
        pendingStudentSwitch: '0',
        studentSwitchedAt: new Date().toISOString(),
      },
    });
    console.log('[webhook:invoice.paid] STUDENT_30_12MO attached, subscription=', subscriptionId);
  } catch (err) {
    console.error('[webhook:invoice.paid] STUDENT_30_12MO attach failed:', err);
    // 失敗時はフラグを '0' に書き換えない → 次の機会に再試行
  }
}

/**
 * invoice.payment_failed: 支払い失敗 → ログ記録。
 * 将来は dunning email 送信や status='past_due' フラグを付与。
 */
async function handleInvoicePaymentFailed(env: Env, event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const stripeCustomerId = extractCustomerId(invoice.customer ?? null);
  console.error(
    '[webhook:invoice.payment_failed]',
    stripeCustomerId,
    'amount_due=', invoice.amount_due,
    'currency=', invoice.currency,
  );
}

/**
 * subscription_schedule.* の 4 種を一括処理。
 * Phase 6 で「請求期間の終了時まで待ってから更新する」を選択したことにより、
 * ダウングレード時に Stripe が Schedule を生成する。
 * 実際のプラン変更は customer.subscription.updated で処理されるため、ここは log のみ。
 */
async function handleSubscriptionSchedule(env: Env, event: Stripe.Event): Promise<void> {
  const schedule = event.data.object as Stripe.SubscriptionSchedule;
  const stripeCustomerId = extractCustomerId(schedule.customer);
  console.log(
    '[webhook:schedule]',
    event.type,
    'customer=', stripeCustomerId,
    'schedule_id=', schedule.id,
    'status=', schedule.status,
  );
}

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────
const app = new Hono<{ Bindings: Env }>();

app.use('*', cors({
  origin: ['https://kuon-rnd.com', 'http://localhost:3000'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'kuon-rnd-auth-worker' }));

// ─────────────────────────────────────────────
// POST /api/auth/magic — Send magic link
// ─────────────────────────────────────────────
app.post('/api/auth/magic', async (c) => {
  const { email } = await c.req.json<{ email: string }>();
  if (!email || !email.includes('@')) {
    return c.json({ error: 'Invalid email' }, 400);
  }

  const normalizedEmail = email.toLowerCase().trim();
  const token = generateToken();
  const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

  // Store magic token
  await c.env.SESSIONS.put(
    `magic:${token}`,
    JSON.stringify({ email: normalizedEmail, expires } as MagicSession),
    { expirationTtl: 900 }
  );

  // Determine base URL from request origin
  const origin = c.req.header('X-Origin') || 'https://kuon-rnd.com';
  const magicUrl = `${origin}/auth/verify?token=${token}`;

  // Send email via Resend
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@kotaroasahina.com',
      to: [normalizedEmail],
      subject: '空音開発にログイン / Login to Kuon R&D',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
          <h2 style="font-weight: 300; letter-spacing: 0.1em; color: #111;">空音開発 Kuon R&D</h2>
          <p style="color: #555; line-height: 1.8;">
            以下のボタンをクリックしてログインしてください。<br/>
            Click the button below to log in.
          </p>
          <a href="${magicUrl}" style="
            display: inline-block; margin: 1.5rem 0;
            padding: 0.9rem 2.5rem;
            background-color: #0284c7; color: #fff;
            text-decoration: none; border-radius: 50px;
            font-size: 0.9rem; letter-spacing: 0.08em;
          ">ログイン / Log In</a>
          <p style="color: #999; font-size: 0.8rem; line-height: 1.6;">
            このリンクは15分間有効です。心当たりがない場合はこのメールを無視してください。<br/>
            This link expires in 15 minutes. Ignore this email if you didn't request it.
          </p>
        </div>
      `,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    return c.json({ error: 'Failed to send email', detail: err }, 500);
  }

  return c.json({ ok: true });
});

// ─────────────────────────────────────────────
// POST /api/auth/verify — Verify magic token, issue JWT
// ─────────────────────────────────────────────
app.post('/api/auth/verify', async (c) => {
  const { token } = await c.req.json<{ token: string }>();
  if (!token) return c.json({ error: 'Missing token' }, 400);

  // Retrieve and delete (one-time use)
  const raw = await c.env.SESSIONS.get(`magic:${token}`);
  if (!raw) return c.json({ error: 'Invalid or expired token' }, 401);
  await c.env.SESSIONS.delete(`magic:${token}`);

  const session: MagicSession = JSON.parse(raw);
  if (session.expires < Date.now()) {
    return c.json({ error: 'Token expired' }, 401);
  }

  // Capture country from Cloudflare (passed by Pages proxy as X-CF-Country)
  const cfCountry = c.req.header('X-CF-Country') || '';
  const cfCity = c.req.header('X-CF-City') || '';

  // Get or create user
  const userKey = `user:${session.email}`;
  let userData: UserData;
  const existing = await c.env.USERS.get(userKey);

  if (existing) {
    userData = JSON.parse(existing);
    userData.lastLoginAt = new Date().toISOString();
    // Update geo on each login (user may travel)
    if (cfCountry) userData.country = cfCountry;
    if (cfCity) userData.city = cfCity;
  } else {
    userData = {
      email: session.email,
      name: '',
      instrument: '',
      region: '',
      bio: '',
      plan: 'free',
      stripeCustomerId: '',
      badges: [],
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      appUsage: {},
      appUsageMonth: currentMonth(),
      country: cfCountry,
      city: cfCity,
      role: '',
      roleCategory: '',
      customRoleName: '',
      birthDate: '',
      showBirthDate: false,
      basedIn: '',
      mobility: '',
      avatarKey: '',
      snsYoutube: '',
      snsInstagram: '',
      snsX: '',
      snsSoundcloud: '',
      snsWebsite: '',
      availableForWork: false,
      experienceLevel: '',
      spokenLanguages: '',
      // Stripe subscription defaults (Phase 7)
      planTier: 'free',
      stripeSubscriptionId: '',
      subscriptionStatus: 'none',
      subscriptionPriceId: '',
      billingCycle: '',
      pricingRegion: '',
      currentPeriodStart: 0,
      currentPeriodEnd: 0,
      cancelAtPeriodEnd: false,
    };
  }

  await c.env.USERS.put(userKey, JSON.stringify(userData));

  // Issue JWT (30-day expiry)
  const now = Math.floor(Date.now() / 1000);
  const jwt = await createJWT(
    { email: session.email, plan: userData.plan, iat: now, exp: now + 30 * 24 * 3600 },
    c.env.AUTH_SECRET
  );

  return c.json({ ok: true, jwt, user: { email: userData.email, name: userData.name, plan: userData.plan, instrument: userData.instrument, badges: userData.badges } });
});

// ─────────────────────────────────────────────
// POST /api/auth/google — Google OAuth login
// Receives Google ID token (credential), verifies
// with Google's public keys, creates/updates user,
// returns JWT (same as magic link flow).
// ─────────────────────────────────────────────
app.post('/api/auth/google', async (c) => {
  const { credential } = await c.req.json<{ credential: string }>();
  if (!credential) return c.json({ error: 'Missing credential' }, 400);

  // Verify Google ID token via Google's tokeninfo endpoint
  // This is the simplest Edge-compatible approach (no jsonwebtoken library needed)
  const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
  if (!googleRes.ok) {
    return c.json({ error: 'Invalid Google token' }, 401);
  }

  const googlePayload = await googleRes.json<{
    email: string;
    email_verified: string;
    name: string;
    picture: string;
    aud: string;
  }>();

  // Verify the token was issued for our app (check audience = our client ID)
  const expectedClientId = c.env.GOOGLE_CLIENT_ID || '';
  if (expectedClientId && googlePayload.aud !== expectedClientId) {
    return c.json({ error: 'Token audience mismatch' }, 401);
  }

  if (googlePayload.email_verified !== 'true') {
    return c.json({ error: 'Email not verified by Google' }, 401);
  }

  const normalizedEmail = googlePayload.email.toLowerCase().trim();
  const cfCountry = c.req.header('X-CF-Country') || '';
  const cfCity = c.req.header('X-CF-City') || '';

  // Get or create user (identical logic to magic link verify)
  const userKey = `user:${normalizedEmail}`;
  let userData: UserData;
  const existing = await c.env.USERS.get(userKey);

  if (existing) {
    userData = JSON.parse(existing);
    userData.lastLoginAt = new Date().toISOString();
    if (cfCountry) userData.country = cfCountry;
    if (cfCity) userData.city = cfCity;
    // Fill in name from Google if user hasn't set one
    if (!userData.name && googlePayload.name) {
      userData.name = googlePayload.name;
    }
  } else {
    userData = {
      email: normalizedEmail,
      name: googlePayload.name || '',
      instrument: '',
      region: '',
      bio: '',
      plan: 'free',
      stripeCustomerId: '',
      badges: [],
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      appUsage: {},
      appUsageMonth: currentMonth(),
      country: cfCountry,
      city: cfCity,
      role: '',
      roleCategory: '',
      customRoleName: '',
      birthDate: '',
      showBirthDate: false,
      basedIn: '',
      mobility: '',
      avatarKey: '',
      snsYoutube: '',
      snsInstagram: '',
      snsX: '',
      snsSoundcloud: '',
      snsWebsite: '',
      availableForWork: false,
      experienceLevel: '',
      spokenLanguages: '',
      // Stripe subscription defaults (Phase 7)
      planTier: 'free',
      stripeSubscriptionId: '',
      subscriptionStatus: 'none',
      subscriptionPriceId: '',
      billingCycle: '',
      pricingRegion: '',
      currentPeriodStart: 0,
      currentPeriodEnd: 0,
      cancelAtPeriodEnd: false,
    };
  }

  await c.env.USERS.put(userKey, JSON.stringify(userData));

  // Issue JWT (30-day expiry)
  const now = Math.floor(Date.now() / 1000);
  const jwt = await createJWT(
    { email: normalizedEmail, plan: userData.plan, iat: now, exp: now + 30 * 24 * 3600 },
    c.env.AUTH_SECRET
  );

  return c.json({ ok: true, jwt, user: { email: userData.email, name: userData.name, plan: userData.plan, instrument: userData.instrument, badges: userData.badges } });
});

// ─────────────────────────────────────────────
// POST /api/auth/refresh — Silent token refresh (Notion-style perpetual login)
// If the current JWT is valid, issue a fresh 30-day JWT.
// Called automatically by the frontend when token is nearing expiry.
// ─────────────────────────────────────────────
app.post('/api/auth/refresh', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid or expired token' }, 401);

  // Fetch latest user data (plan may have changed)
  const raw = await c.env.USERS.get(`user:${payload.email}`);
  if (!raw) return c.json({ error: 'User not found' }, 404);

  const user: UserData = JSON.parse(raw);
  const now = Math.floor(Date.now() / 1000);
  const jwt = await createJWT(
    { email: user.email, plan: user.plan, iat: now, exp: now + 30 * 24 * 3600 },
    c.env.AUTH_SECRET
  );

  return c.json({ ok: true, jwt, user: { email: user.email, name: user.name, plan: user.plan } });
});

// ─────────────────────────────────────────────
// GET /api/auth/me — Verify JWT, return user info
// ─────────────────────────────────────────────
app.get('/api/auth/me', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const raw = await c.env.USERS.get(`user:${payload.email}`);
  if (!raw) return c.json({ error: 'User not found' }, 404);

  const user: UserData = JSON.parse(raw);

  // ── Owner override (2026-04-28) ──
  // 空音開発オーナー (369@kotaroasahina.com) は自動的に最上位 Symphony 扱い。
  // 自分のサービスを使うのに自分が課金する必要はない。canUseApp() / quota 判定すべてに反映される。
  const isOwner = user.email === '369@kotaroasahina.com';
  const effectivePlanTier = isOwner ? 'symphony' : (user.planTier || 'free');

  return c.json({
    email: user.email,
    name: user.name,
    instrument: user.instrument,
    region: user.region,
    bio: user.bio,
    plan: user.plan,                            // legacy backward compat
    planTier: effectivePlanTier,                // 新形式 (フロントが参照)
    isOwner,
    subscriptionStatus: user.subscriptionStatus || 'none',
    cancelAtPeriodEnd: user.cancelAtPeriodEnd || false,
    badges: user.badges,
    createdAt: user.createdAt,
    appUsage: user.appUsage,
    appUsageMonth: user.appUsageMonth,
    // v2 fields
    role: user.role || '',
    roleCategory: user.roleCategory || '',
    customRoleName: user.customRoleName || '',
    birthDate: user.birthDate || '',
    showBirthDate: user.showBirthDate || false,
    basedIn: user.basedIn || '',
    mobility: user.mobility || '',
    avatarKey: user.avatarKey || '',
    snsYoutube: user.snsYoutube || '',
    snsInstagram: user.snsInstagram || '',
    snsX: user.snsX || '',
    snsSoundcloud: user.snsSoundcloud || '',
    snsWebsite: user.snsWebsite || '',
    availableForWork: user.availableForWork || false,
    experienceLevel: user.experienceLevel || '',
    spokenLanguages: user.spokenLanguages || '',
  });
});

// ─────────────────────────────────────────────
// PUT /api/auth/profile — Update user profile
// ─────────────────────────────────────────────
app.put('/api/auth/profile', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  type ProfileFields = 'name' | 'instrument' | 'region' | 'bio' | 'role' | 'roleCategory'
    | 'customRoleName' | 'birthDate' | 'showBirthDate' | 'basedIn' | 'mobility'
    | 'snsYoutube' | 'snsInstagram' | 'snsX' | 'snsSoundcloud' | 'snsWebsite'
    | 'availableForWork' | 'experienceLevel' | 'spokenLanguages';
  const updates = await c.req.json<Partial<Pick<UserData, ProfileFields>>>();
  const raw = await c.env.USERS.get(`user:${payload.email}`);
  if (!raw) return c.json({ error: 'User not found' }, 404);

  const user: UserData = JSON.parse(raw);
  const strFields: ProfileFields[] = [
    'name', 'instrument', 'region', 'bio', 'role', 'roleCategory',
    'customRoleName', 'birthDate', 'basedIn', 'mobility',
    'snsYoutube', 'snsInstagram', 'snsX', 'snsSoundcloud', 'snsWebsite',
    'experienceLevel', 'spokenLanguages',
  ];
  for (const f of strFields) {
    if (updates[f] !== undefined) (user as unknown as Record<string, unknown>)[f] = updates[f];
  }
  if (updates.showBirthDate !== undefined) user.showBirthDate = updates.showBirthDate;
  if (updates.availableForWork !== undefined) user.availableForWork = updates.availableForWork;
  // Keep legacy instrument/region in sync
  if (updates.role) user.instrument = updates.customRoleName || updates.role;
  if (updates.basedIn !== undefined) user.region = updates.basedIn;

  await c.env.USERS.put(`user:${payload.email}`, JSON.stringify(user));
  return c.json({
    ok: true,
    user: {
      email: user.email, name: user.name, plan: user.plan, badges: user.badges,
      role: user.role, roleCategory: user.roleCategory, customRoleName: user.customRoleName,
      basedIn: user.basedIn, mobility: user.mobility, bio: user.bio,
      birthDate: user.birthDate, showBirthDate: user.showBirthDate,
      snsYoutube: user.snsYoutube, snsInstagram: user.snsInstagram,
      snsX: user.snsX, snsSoundcloud: user.snsSoundcloud, snsWebsite: user.snsWebsite,
      availableForWork: user.availableForWork, experienceLevel: user.experienceLevel,
      spokenLanguages: user.spokenLanguages, avatarKey: user.avatarKey,
    },
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/track — Track app usage (for free tier limits)
// ─────────────────────────────────────────────
app.post('/api/auth/track', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const { app: appName } = await c.req.json<{ app: string }>();
  if (!appName) return c.json({ error: 'Missing app name' }, 400);

  const raw = await c.env.USERS.get(`user:${payload.email}`);
  if (!raw) return c.json({ error: 'User not found' }, 404);

  const user: UserData = JSON.parse(raw);
  const month = currentMonth();

  // Reset counters on new month
  if (user.appUsageMonth !== month) {
    user.appUsage = {};
    user.appUsageMonth = month;
  }

  user.appUsage[appName] = (user.appUsage[appName] || 0) + 1;
  await c.env.USERS.put(`user:${payload.email}`, JSON.stringify(user));

  return c.json({ ok: true, usage: user.appUsage, month });
});

// ─────────────────────────────────────────────
// FAVORITES (お気に入りアプリ) — Phase 2 機能
//
// 設計:
//   - KV キー: favorites:{email} → JSON: { ids: string[], updatedAt: string }
//   - GET: 自分のお気に入りリスト取得 (順序付き)
//   - PUT: リスト全体を置き換え (並び替え・追加・削除を 1 リクエストで)
//   - 全プランで利用可能 (Free 含む) — リテンション機能なので有料に閉じない
//   - アプリ ID は APP_CATALOG の id と一致 (型保証はしないがフロントが管理)
//   - 上限: 20 個 (リスト肥大化を防ぐ)
// ─────────────────────────────────────────────

interface FavoritesData {
  ids: string[];           // app id (catalog) を順序付きで保持
  updatedAt: string;       // ISO timestamp
}

const MAX_FAVORITES = 20;

// 2026-04-27 IQ180 機能 B: プラン階層別の showcase デフォルトお気に入り
// アップグレード時に自動的にお気に入りへ追加 → ユーザーは「アップグレード即体感」できる
// Free は空のまま (ユーザー仕様)
const SHOWCASE_FAVORITES_BY_TIER: Record<string, string[]> = {
  // Prelude で 16 アプリ解禁。その中の象徴的な 4 つを箱に入れる。
  prelude: ['slowdown', 'daw', 'comping', 'checklist'],
  // Concerto で +4 アプリ解禁。その全 4 つを箱に入れる。
  concerto: ['ddp-checker', 'piano-declipper', 'dual-mono', 'itadaki'],
};

/**
 * 指定ユーザーのお気に入りに、プラン階層別 showcase アプリを自動追加。
 * - 既存お気に入りは保持（上書きしない）
 * - 階層 X の showcase アプリが既に 1 つでも入っていれば、その階層は skip
 *   （ユーザーが手動で外した場合の意思を尊重）
 * - Free 階層では何もしない
 */
async function ensureShowcaseFavorites(env: Env, email: string, planTier: PlanTier): Promise<void> {
  if (planTier === 'free') return;

  // 適用すべき階層 (Concerto+ なら prelude+concerto 両方)
  const tiersToApply: string[] = [];
  if (['prelude', 'concerto', 'symphony', 'opus'].includes(planTier)) {
    tiersToApply.push('prelude');
  }
  if (['concerto', 'symphony', 'opus'].includes(planTier)) {
    tiersToApply.push('concerto');
  }

  // 現在のお気に入り取得
  const raw = await env.USERS.get(`favorites:${email}`);
  let current: string[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { ids?: string[] };
      current = Array.isArray(parsed.ids) ? parsed.ids : [];
    } catch {
      current = [];
    }
  }

  const next = [...current];
  let added = 0;

  for (const tier of tiersToApply) {
    const ids = SHOWCASE_FAVORITES_BY_TIER[tier];
    if (!ids) continue;
    // この階層の showcase が既に 1 つでも入っていれば user の意思を尊重して skip
    const hasAny = ids.some((id) => next.includes(id));
    if (hasAny) continue;

    for (const id of ids) {
      if (next.length >= MAX_FAVORITES) break;
      if (!next.includes(id)) {
        next.push(id);
        added += 1;
      }
    }
  }

  if (added > 0) {
    await env.USERS.put(
      `favorites:${email}`,
      JSON.stringify({ ids: next, updatedAt: new Date().toISOString() }),
    );
    console.log('[favorites:showcase] added', added, 'apps for', email, 'tier=', planTier);
  }
}

app.get('/api/auth/favorites', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const raw = await c.env.USERS.get(`favorites:${payload.email}`);
  if (!raw) {
    // 初期状態: 空リスト
    return c.json({ ids: [], updatedAt: '' });
  }
  try {
    const data = JSON.parse(raw) as FavoritesData;
    return c.json({
      ids: Array.isArray(data.ids) ? data.ids : [],
      updatedAt: data.updatedAt || '',
    });
  } catch {
    return c.json({ ids: [], updatedAt: '' });
  }
});

app.put('/api/auth/favorites', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  let body: { ids?: unknown };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  // バリデーション: 配列・全要素 string・上限内・重複排除
  if (!Array.isArray(body.ids)) {
    return c.json({ error: 'ids must be an array' }, 400);
  }
  const cleaned: string[] = [];
  for (const v of body.ids) {
    if (typeof v !== 'string') continue;
    if (v.length === 0 || v.length > 64) continue;
    // セキュリティ: app id は英数小文字とハイフンのみ許可
    if (!/^[a-z0-9-]+$/.test(v)) continue;
    if (cleaned.includes(v)) continue;
    cleaned.push(v);
    if (cleaned.length >= MAX_FAVORITES) break;
  }

  const data: FavoritesData = {
    ids: cleaned,
    updatedAt: new Date().toISOString(),
  };
  await c.env.USERS.put(`favorites:${payload.email}`, JSON.stringify(data));

  return c.json({ ok: true, ids: cleaned, updatedAt: data.updatedAt });
});

// ─────────────────────────────────────────────
// GET /api/auth/quota?app=separator — Read-only quota status
// Used by UI to show "あと X 回" before user initiates a job.
// Does NOT consume the quota.
// ─────────────────────────────────────────────
app.get('/api/auth/quota', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const appName = c.req.query('app');
  if (!appName) return c.json({ error: 'Missing app parameter' }, 400);

  if (!APP_QUOTAS[appName]) {
    return c.json({ error: `App "${appName}" has no quota (may be a browser-only app)` }, 400);
  }

  const raw = await c.env.USERS.get(`user:${payload.email}`);
  if (!raw) return c.json({ error: 'User not found' }, 404);

  const user: UserData = JSON.parse(raw);
  const month = currentMonth();

  // Auto-reset for new month (don't persist here — just report reset state)
  const effectiveUsage = user.appUsageMonth === month ? (user.appUsage[appName] || 0) : 0;
  const limit = quotaFor(appName, user.plan);
  const remaining = Math.max(0, limit - effectiveUsage);

  return c.json({
    app: appName,
    plan: user.plan,
    used: effectiveUsage,
    limit,
    remaining,
    month,
    canUse: remaining > 0,
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/quota/consume — Atomic check + consume
// Called by the Next.js proxy RIGHT BEFORE forwarding to Cloud Run.
// Returns 429 with upgrade info if quota exceeded.
// Returns { ok: true, remaining: N } on success (quota already decremented).
// ─────────────────────────────────────────────
app.post('/api/auth/quota/consume', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const { app: appName } = await c.req.json<{ app: string }>();
  if (!appName) return c.json({ error: 'Missing app name' }, 400);

  if (!APP_QUOTAS[appName]) {
    return c.json({ error: `App "${appName}" has no quota` }, 400);
  }

  const raw = await c.env.USERS.get(`user:${payload.email}`);
  if (!raw) return c.json({ error: 'User not found' }, 404);

  const user: UserData = JSON.parse(raw);
  const month = currentMonth();

  // Reset counters on new month
  if (user.appUsageMonth !== month) {
    user.appUsage = {};
    user.appUsageMonth = month;
  }

  const currentUsage = user.appUsage[appName] || 0;
  const limit = quotaFor(appName, user.plan);

  if (currentUsage >= limit) {
    // Quota exceeded — return 429 with upgrade guidance
    return c.json({
      error: 'quota_exceeded',
      app: appName,
      plan: user.plan,
      used: currentUsage,
      limit,
      remaining: 0,
      month,
      upgradeOptions: user.plan === 'free'
        ? [
            { plan: 'student', price: 480, limit: APP_QUOTAS[appName].student },
            { plan: 'pro', price: 980, limit: APP_QUOTAS[appName].pro },
          ]
        : user.plan === 'student'
          ? [{ plan: 'pro', price: 980, limit: APP_QUOTAS[appName].pro }]
          : [],
    }, 429);
  }

  // Atomic consume
  user.appUsage[appName] = currentUsage + 1;
  await c.env.USERS.put(`user:${payload.email}`, JSON.stringify(user));

  return c.json({
    ok: true,
    app: appName,
    plan: user.plan,
    used: user.appUsage[appName],
    limit,
    remaining: limit - user.appUsage[appName],
    month,
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/quota/refund — Refund a consumed quota (on job failure)
// Called by Next.js proxy if Cloud Run fails AFTER consume was committed.
// This prevents users from losing quota when our service errors out.
// ─────────────────────────────────────────────
app.post('/api/auth/quota/refund', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const { app: appName } = await c.req.json<{ app: string }>();
  if (!appName) return c.json({ error: 'Missing app name' }, 400);

  const raw = await c.env.USERS.get(`user:${payload.email}`);
  if (!raw) return c.json({ error: 'User not found' }, 404);

  const user: UserData = JSON.parse(raw);
  const month = currentMonth();

  // Only refund if still within the same month
  if (user.appUsageMonth === month && (user.appUsage[appName] || 0) > 0) {
    user.appUsage[appName] = Math.max(0, user.appUsage[appName] - 1);
    await c.env.USERS.put(`user:${payload.email}`, JSON.stringify(user));
  }

  return c.json({
    ok: true,
    app: appName,
    used: user.appUsage[appName] || 0,
    month,
  });
});

// ============================================================
// Phase 2 (2026-04-26) 新クォータ API 群
// ============================================================
//
// KV 構造: SESSIONS namespace に保存
//   key:   usage:{email}:{YYYY-MM}:{appId}
//   value: 数値文字列 (回数)
//   TTL:   62 日 (今月 + 先月で自動消滅)
//
// 設計思想:
//   - ブラウザアプリも追跡対象 (recently used / 使用履歴用)
//   - サーバーアプリ (separator/transcribe/intonation) は強制クォータあり
//   - 完全ブロックモード (上限到達 = 即停止)
//   - 月跨ぎは KV キー構造で自動切替 (Cron 不要)
// ============================================================

// ─────────────────────────────────────────────
// POST /api/auth/usage/track — 使用回数 +1
// 全アプリ (ブラウザ + サーバー) で呼ぶ。クォータ超過チェックも含む。
// ─────────────────────────────────────────────
app.post('/api/auth/usage/track', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const { app: appName } = await c.req.json<{ app: string }>();
  if (!appName) return c.json({ error: 'Missing app name' }, 400);

  const raw = await c.env.USERS.get(`user:${payload.email}`);
  if (!raw) return c.json({ error: 'User not found' }, 404);
  const user = ensureStripeFields(JSON.parse(raw));

  const month = currentMonth();
  const key = usageKey(payload.email, month, appName);

  // 現在値を取得して +1
  const currentValue = await c.env.SESSIONS.get(key);
  const current = currentValue ? parseInt(currentValue, 10) : 0;
  const next = current + 1;

  // クォータ取得 (server app のみ強制チェック)
  // Owner override: 369@kotaroasahina.com は Symphony 相当 (2026-04-28)
  const isOwner = user.email === '369@kotaroasahina.com';
  const planValue = isOwner ? 'symphony' : (user.planTier || user.plan || 'free');
  const limit = quotaForTier(appName, planValue);
  const isServer = isServerApp(appName);

  // server app かつ既に上限到達 → ブロック (track 失敗扱い)
  if (isServer && limit === 0) {
    return c.json({
      error: 'Plan does not include this app',
      code: 'NOT_INCLUDED',
      app: appName, plan: planValue,
      upgrade: { suggestedPlan: 'prelude' },
    }, 403);
  }
  if (isServer && current >= limit) {
    return c.json({
      error: 'Quota exceeded',
      code: 'QUOTA_EXCEEDED',
      app: appName, plan: planValue,
      used: current, limit,
      resetDate: nextResetDate(month),
    }, 429);
  }

  // KV 書き込み (TTL 62 日 = 今月 + 先月)
  await c.env.SESSIONS.put(key, String(next), { expirationTtl: 62 * 24 * 60 * 60 });

  return c.json({
    ok: true,
    app: appName,
    used: next,
    limit: isServer ? limit : null,
    remaining: isServer ? Math.max(0, limit - next) : null,
    month,
    isServer,
  });
});

// ─────────────────────────────────────────────
// GET /api/auth/usage/me — 当月の全アプリ使用状況をまとめて取得
// マイページの「今月の使用状況」表示用
// ─────────────────────────────────────────────
app.get('/api/auth/usage/me', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const raw = await c.env.USERS.get(`user:${payload.email}`);
  if (!raw) return c.json({ error: 'User not found' }, 404);
  const user = ensureStripeFields(JSON.parse(raw));

  const month = currentMonth();
  // Owner override: 369@kotaroasahina.com は Symphony 相当 (2026-04-28)
  const isOwner = user.email === '369@kotaroasahina.com';
  const planValue = isOwner ? 'symphony' : (user.planTier || user.plan || 'free');
  const prefix = `usage:${payload.email}:${month}:`;

  // KV scan で当月使用したアプリを全部取得
  const list = await c.env.SESSIONS.list({ prefix });
  const usage: Record<string, { used: number; limit: number | null; remaining: number | null; isServer: boolean }> = {};

  for (const k of list.keys) {
    const appName = k.name.slice(prefix.length);
    const valueStr = await c.env.SESSIONS.get(k.name);
    const used = valueStr ? parseInt(valueStr, 10) : 0;
    const limit = quotaForTier(appName, planValue);
    const isServer = isServerApp(appName);
    usage[appName] = {
      used,
      limit: isServer ? limit : null,
      remaining: isServer ? Math.max(0, limit - used) : null,
      isServer,
    };
  }

  // server app で「使ったことはないが上限はある」ものも 0/limit で含める
  for (const appName of Object.keys(APP_QUOTAS_TIER)) {
    if (!usage[appName]) {
      const limit = quotaForTier(appName, planValue);
      usage[appName] = {
        used: 0,
        limit,
        remaining: limit,
        isServer: true,
      };
    }
  }

  return c.json({
    plan: user.plan,
    planTier: user.planTier,
    month,
    resetDate: nextResetDate(month),
    usage,
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/usage/check — 使用可否の事前チェック (消費しない)
// サーバーアプリ起動前にフロントから呼ぶ。
// ─────────────────────────────────────────────
app.post('/api/auth/usage/check', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const { app: appName } = await c.req.json<{ app: string }>();
  if (!appName) return c.json({ error: 'Missing app name' }, 400);

  const raw = await c.env.USERS.get(`user:${payload.email}`);
  if (!raw) return c.json({ error: 'User not found' }, 404);
  const user = ensureStripeFields(JSON.parse(raw));

  const month = currentMonth();
  const key = usageKey(payload.email, month, appName);
  const valueStr = await c.env.SESSIONS.get(key);
  const used = valueStr ? parseInt(valueStr, 10) : 0;
  // Owner override: 369@kotaroasahina.com は Symphony 相当として扱う (2026-04-28)
  const isOwner = user.email === '369@kotaroasahina.com';
  const planValue = isOwner ? 'symphony' : (user.planTier || user.plan || 'free');
  const limit = quotaForTier(appName, planValue);
  const isServer = isServerApp(appName);

  // ブラウザアプリは常に許可
  if (!isServer) {
    return c.json({
      allowed: true,
      app: appName, used, limit: null, remaining: null,
      isServer: false,
    });
  }

  // プランに含まれない
  if (limit === 0) {
    return c.json({
      allowed: false,
      reason: 'NOT_INCLUDED',
      app: appName, plan: planValue, used: 0, limit: 0, remaining: 0,
      isServer: true,
      resetDate: nextResetDate(month),
    });
  }

  const remaining = Math.max(0, limit - used);
  return c.json({
    allowed: remaining > 0,
    reason: remaining === 0 ? 'QUOTA_EXCEEDED' : 'OK',
    app: appName, plan: planValue, used, limit, remaining,
    isServer: true,
    resetDate: nextResetDate(month),
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/change-email — Initiate email change (sends verification to new email)
// ─────────────────────────────────────────────
app.post('/api/auth/change-email', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const { newEmail } = await c.req.json<{ newEmail: string }>();
  if (!newEmail || !newEmail.includes('@')) {
    return c.json({ error: 'Invalid email' }, 400);
  }

  const normalizedNew = newEmail.toLowerCase().trim();

  // Check if new email is same as current
  if (normalizedNew === payload.email) {
    return c.json({ error: 'Same email' }, 400);
  }

  // Check if new email already has an account
  const existing = await c.env.USERS.get(`user:${normalizedNew}`);
  if (existing) {
    return c.json({ error: 'Email already in use' }, 409);
  }

  // Generate confirmation token
  const token = generateToken();
  await c.env.SESSIONS.put(
    `email-change:${token}`,
    JSON.stringify({ oldEmail: payload.email, newEmail: normalizedNew, expires: Date.now() + 30 * 60 * 1000 }),
    { expirationTtl: 1800 }
  );

  const origin = c.req.header('X-Origin') || 'https://kuon-rnd.com';
  const confirmUrl = `${origin}/auth/confirm-email?token=${token}`;

  // Send verification email to NEW address
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@kotaroasahina.com',
      to: [normalizedNew],
      subject: 'メールアドレス変更の確認 / Confirm Email Change — 空音開発',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
          <h2 style="font-weight: 300; letter-spacing: 0.1em; color: #111;">空音開発 Kuon R&D</h2>
          <p style="color: #555; line-height: 1.8;">
            以下のボタンをクリックして、メールアドレスの変更を完了してください。<br/>
            Click the button below to confirm your email change.
          </p>
          <p style="color: #888; font-size: 0.85rem;">
            変更前 / From: <strong>${payload.email}</strong><br/>
            変更後 / To: <strong>${normalizedNew}</strong>
          </p>
          <a href="${confirmUrl}" style="
            display: inline-block; margin: 1.5rem 0;
            padding: 0.9rem 2.5rem;
            background-color: #0284c7; color: #fff;
            text-decoration: none; border-radius: 50px;
            font-size: 0.9rem; letter-spacing: 0.08em;
          ">変更を確認 / Confirm Change</a>
          <p style="color: #999; font-size: 0.8rem; line-height: 1.6;">
            このリンクは30分間有効です。心当たりがない場合はこのメールを無視してください。<br/>
            This link expires in 30 minutes. Ignore this email if you didn't request it.
          </p>
        </div>
      `,
    }),
  });

  if (!resendRes.ok) {
    return c.json({ error: 'Failed to send verification email' }, 500);
  }

  return c.json({ ok: true });
});

// ─────────────────────────────────────────────
// POST /api/auth/confirm-email — Complete email change
// ─────────────────────────────────────────────
app.post('/api/auth/confirm-email', async (c) => {
  const { token } = await c.req.json<{ token: string }>();
  if (!token) return c.json({ error: 'Missing token' }, 400);

  const raw = await c.env.SESSIONS.get(`email-change:${token}`);
  if (!raw) return c.json({ error: 'Invalid or expired token' }, 401);
  await c.env.SESSIONS.delete(`email-change:${token}`);

  const { oldEmail, newEmail, expires } = JSON.parse(raw);
  if (expires < Date.now()) {
    return c.json({ error: 'Token expired' }, 401);
  }

  // Migrate user data: old key → new key
  const userData = await c.env.USERS.get(`user:${oldEmail}`);
  if (!userData) return c.json({ error: 'User not found' }, 404);

  const user: UserData = JSON.parse(userData);
  user.email = newEmail;

  // Check again that new email is not taken
  const existing = await c.env.USERS.get(`user:${newEmail}`);
  if (existing) return c.json({ error: 'Email already in use' }, 409);

  // Write new key, delete old key
  await c.env.USERS.put(`user:${newEmail}`, JSON.stringify(user));
  await c.env.USERS.delete(`user:${oldEmail}`);

  // Issue new JWT with new email
  const now = Math.floor(Date.now() / 1000);
  const jwt = await createJWT(
    { email: newEmail, plan: user.plan, iat: now, exp: now + 30 * 24 * 3600 },
    c.env.AUTH_SECRET
  );

  return c.json({ ok: true, jwt, user: { email: newEmail, name: user.name, plan: user.plan } });
});

// ─────────────────────────────────────────────
// DELETE /api/auth/account — Delete own account
// ─────────────────────────────────────────────
app.delete('/api/auth/account', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  // Delete user data
  await c.env.USERS.delete(`user:${payload.email}`);

  // Clean up any active sessions for this user
  const sessionList = await c.env.SESSIONS.list({ prefix: `jwt:${payload.email}:` });
  for (const key of sessionList.keys) {
    await c.env.SESSIONS.delete(key.name);
  }

  return c.json({ ok: true, message: 'Account deleted' });
});

// ─────────────────────────────────────────────
// GET /api/auth/stats — Admin: total user count
// ─────────────────────────────────────────────
app.get('/api/auth/stats', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  // Simple admin check: only owner email
  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload || payload.email !== '369@kotaroasahina.com') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const list = await c.env.USERS.list({ prefix: 'user:' });
  return c.json({ totalUsers: list.keys.length });
});

// ─────────────────────────────────────────────
// GET /api/auth/admin/users — Admin: paginated user list with search
// ─────────────────────────────────────────────
app.get('/api/auth/admin/users', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload || payload.email !== '369@kotaroasahina.com') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const search = (c.req.query('search') || '').toLowerCase();
  // 旧 plan ('free' | 'student' | 'pro') と 新 planTier ('free' | 'prelude' | 'concerto' | 'symphony') の両対応。
  // 新 planTier フィルタ優先。なければ legacy plan フィルタを使う。
  const planTierFilter = c.req.query('planTier') || '';
  const planFilter = c.req.query('plan') || '';
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 100);

  // Fetch all user keys from KV (KV list is paginated with cursor)
  const allUsers: UserData[] = [];
  let cursor: string | undefined;

  do {
    const listResult = await c.env.USERS.list({
      prefix: 'user:',
      cursor,
      limit: 1000,
    });

    // Fetch user data for each key in this batch
    const batchPromises = listResult.keys.map(async (key) => {
      const raw = await c.env.USERS.get(key.name);
      if (raw) {
        try {
          return JSON.parse(raw) as UserData;
        } catch {
          return null;
        }
      }
      return null;
    });

    const batchResults = await Promise.all(batchPromises);
    for (const user of batchResults) {
      if (user) allUsers.push(user);
    }

    cursor = listResult.list_complete ? undefined : listResult.cursor;
  } while (cursor);

  // Apply filters
  let filtered = allUsers;

  if (search) {
    filtered = filtered.filter(u =>
      u.email.toLowerCase().includes(search) ||
      (u.name && u.name.toLowerCase().includes(search)) ||
      (u.instrument && u.instrument.toLowerCase().includes(search))
    );
  }

  // planTier フィルタを優先 (新形式)
  if (planTierFilter && ['free', 'prelude', 'concerto', 'symphony', 'opus'].includes(planTierFilter)) {
    filtered = filtered.filter(u => (u.planTier || 'free') === planTierFilter);
  } else if (planFilter && ['free', 'student', 'pro'].includes(planFilter)) {
    // 旧 plan フィルタ (backward compat)
    filtered = filtered.filter(u => u.plan === planFilter);
  }

  // Sort by createdAt descending (newest first)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Stats: 旧 plan + 新 planTier の両方を返す
  const tierCount = (tier: string) => allUsers.filter(u => (u.planTier || 'free') === tier).length;
  const stats = {
    total: allUsers.length,
    // legacy fields (backward compat)
    free: allUsers.filter(u => u.plan === 'free').length,
    student: allUsers.filter(u => u.plan === 'student').length,
    pro: allUsers.filter(u => u.plan === 'pro').length,
    // new tier-based fields
    tierFree: tierCount('free'),
    tierPrelude: tierCount('prelude'),
    tierConcerto: tierCount('concerto'),
    tierSymphony: tierCount('symphony'),
    tierOpus: tierCount('opus'), // legacy 互換のため残すが LP からは消えている
    filtered: filtered.length,
  };

  // Paginate
  const totalPages = Math.ceil(filtered.length / limit);
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return c.json({
    users: paged.map(u => ({
      email: u.email,
      name: u.name,
      instrument: u.instrument,
      region: u.region,
      plan: u.plan,                            // legacy plan (backward compat)
      planTier: u.planTier || 'free',          // 新 tier (admin UI で使う)
      subscriptionStatus: u.subscriptionStatus || 'none',
      cancelAtPeriodEnd: u.cancelAtPeriodEnd || false,
      badges: u.badges,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt,
      appUsage: u.appUsage,
      appUsageMonth: u.appUsageMonth,
      country: u.country || '',
      city: u.city || '',
      role: u.role || '',
      roleCategory: u.roleCategory || '',
      customRoleName: u.customRoleName || '',
      basedIn: u.basedIn || '',
      mobility: u.mobility || '',
      availableForWork: u.availableForWork || false,
      experienceLevel: u.experienceLevel || '',
      avatarKey: u.avatarKey || '',
    })),
    stats,
    page,
    totalPages,
    limit,
  });
});

// ─────────────────────────────────────────────
// PUT /api/auth/admin/plan — Admin: change a user's plan
// ─────────────────────────────────────────────
app.put('/api/auth/admin/plan', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload || payload.email !== '369@kotaroasahina.com') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  // 新形式 (planTier) と旧形式 (plan) の両方を受け付ける。
  // planTier 優先。両方なし → 400。
  const body = await c.req.json<{ email: string; plan?: string; planTier?: string }>();
  const { email } = body;
  if (!email) return c.json({ error: 'Invalid email' }, 400);

  const userKey = `user:${email.toLowerCase().trim()}`;
  const raw = await c.env.USERS.get(userKey);
  if (!raw) return c.json({ error: 'User not found' }, 404);

  const user: UserData = JSON.parse(raw);
  const oldTier = user.planTier || 'free';
  const oldPlan = user.plan || 'free';

  // 新 planTier が来たら、それを正として両フィールドを更新
  if (body.planTier && ['free', 'prelude', 'concerto', 'symphony', 'opus'].includes(body.planTier)) {
    const newTier = body.planTier as PlanTier;
    user.planTier = newTier;
    user.plan = legacyPlanFromTier(newTier);
  } else if (body.plan && ['free', 'student', 'pro'].includes(body.plan)) {
    // 旧 plan のみが来た場合は legacy フィールドのみ更新 (backward compat)
    user.plan = body.plan as 'free' | 'student' | 'pro';
  } else {
    return c.json({ error: 'Invalid plan or planTier' }, 400);
  }

  await c.env.USERS.put(userKey, JSON.stringify(user));

  // Showcase favorites を tier 変更に追従させる (Phase 2.5)
  const newTier = user.planTier || 'free';
  if (newTier !== oldTier && newTier !== 'free') {
    await ensureShowcaseFavorites(c.env, user.email, newTier).catch((err) => {
      console.error('[admin:plan] ensureShowcaseFavorites failed', err);
    });
  }

  return c.json({
    ok: true,
    email: user.email,
    oldPlan,
    newPlan: user.plan,
    oldPlanTier: oldTier,
    newPlanTier: user.planTier,
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/avatar — Upload avatar (2MB max, stored in KV)
// ─────────────────────────────────────────────
app.post('/api/auth/avatar', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const contentType = c.req.header('Content-Type') || '';
  if (!contentType.includes('multipart/form-data')) {
    return c.json({ error: 'Must be multipart/form-data' }, 400);
  }

  const formData = await c.req.formData();
  const file = formData.get('avatar');
  if (!file || !(file instanceof File)) {
    return c.json({ error: 'No file uploaded' }, 400);
  }

  // Validate size (2MB)
  if (file.size > 2 * 1024 * 1024) {
    return c.json({ error: 'File too large (max 2MB)' }, 400);
  }

  // Validate type
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    return c.json({ error: 'Invalid file type (JPEG, PNG, WebP only)' }, 400);
  }

  // Store as ArrayBuffer in KV
  const buffer = await file.arrayBuffer();
  const avatarKey = `avatar:${payload.email}`;
  await c.env.USERS.put(avatarKey, buffer, {
    metadata: { contentType: file.type, size: file.size },
  });

  // Update user record
  const userRaw = await c.env.USERS.get(`user:${payload.email}`);
  if (userRaw) {
    const user: UserData = JSON.parse(userRaw);
    user.avatarKey = avatarKey;
    await c.env.USERS.put(`user:${payload.email}`, JSON.stringify(user));
  }

  return c.json({ ok: true, avatarKey });
});

// ─────────────────────────────────────────────
// GET /api/auth/avatar/:email — Serve avatar image
// ─────────────────────────────────────────────
app.get('/api/auth/avatar/:email', async (c) => {
  const email = decodeURIComponent(c.req.param('email')).toLowerCase();
  const avatarKey = `avatar:${email}`;

  const { value, metadata } = await c.env.USERS.getWithMetadata<{ contentType: string }>(avatarKey, 'arrayBuffer');
  if (!value) {
    // Return a simple default SVG avatar
    const initial = email[0]?.toUpperCase() || '?';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#e2e8f0"/>
      <text x="100" y="115" text-anchor="middle" font-family="Arial" font-size="80" fill="#94a3b8">${initial}</text>
    </svg>`;
    return new Response(svg, {
      headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' },
    });
  }

  return new Response(value as ArrayBuffer, {
    headers: {
      'Content-Type': metadata?.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
    },
  });
});

// ─────────────────────────────────────────────
// POST /api/auth/pageview — Track page view (no auth required)
// ─────────────────────────────────────────────
app.post('/api/auth/pageview', async (c) => {
  const body = await c.req.json<{
    path: string;
    country: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  }>();
  const page = body.path || '/';
  const cc = (body.country || 'XX').toUpperCase();
  const day = todayStr();
  const key = `pv:${day}`;

  // Read current data
  const raw = await c.env.SESSIONS.get(key);
  let pv: PageviewData;
  if (raw) {
    pv = JSON.parse(raw);
  } else {
    pv = { total: 0, countries: {}, pages: {} };
  }

  // Increment existing fields
  pv.total += 1;
  pv.countries[cc] = (pv.countries[cc] || 0) + 1;
  pv.pages[page] = (pv.pages[page] || 0) + 1;

  // Attribution signals (additive, non-breaking for old records)
  const ref = (body.referrer || '').trim().toLowerCase();
  if (ref) {
    pv.referrers = pv.referrers || {};
    pv.referrers[ref] = (pv.referrers[ref] || 0) + 1;
  }
  const src = (body.utm_source || '').trim();
  if (src) {
    const med = (body.utm_medium || '').trim() || '-';
    const cmp = (body.utm_campaign || '').trim() || '-';
    const utmKey = `${src}/${med}/${cmp}`;
    pv.utm = pv.utm || {};
    pv.utm[utmKey] = (pv.utm[utmKey] || 0) + 1;
  }

  // Store with 90-day TTL
  await c.env.SESSIONS.put(key, JSON.stringify(pv), { expirationTtl: 90 * 24 * 3600 });

  return c.json({ ok: true });
});

// ─────────────────────────────────────────────
// GET /api/auth/admin/pageviews — Admin: pageview stats (last 30 days)
// ─────────────────────────────────────────────
app.get('/api/auth/admin/pageviews', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload || payload.email !== '369@kotaroasahina.com') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const days = parseInt(c.req.query('days') || '30', 10);
  const results: {
    date: string;
    total: number;
    countries: Record<string, number>;
    pages: Record<string, number>;
    referrers?: Record<string, number>;
    utm?: Record<string, number>;
  }[] = [];

  // Fetch each day's data
  const now = new Date();
  const fetchPromises: Promise<void>[] = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    fetchPromises.push(
      c.env.SESSIONS.get(`pv:${dayStr}`).then((raw) => {
        if (raw) {
          const pv: PageviewData = JSON.parse(raw);
          results.push({ date: dayStr, ...pv });
        } else {
          results.push({ date: dayStr, total: 0, countries: {}, pages: {} });
        }
      })
    );
  }

  await Promise.all(fetchPromises);

  // Sort by date descending
  results.sort((a, b) => b.date.localeCompare(a.date));

  // Aggregate totals
  const totalViews = results.reduce((sum, r) => sum + r.total, 0);
  const allCountries: Record<string, number> = {};
  const allPages: Record<string, number> = {};
  const allReferrers: Record<string, number> = {};
  const allUtm: Record<string, number> = {};
  for (const r of results) {
    for (const [cc, n] of Object.entries(r.countries)) {
      allCountries[cc] = (allCountries[cc] || 0) + n;
    }
    for (const [p, n] of Object.entries(r.pages)) {
      allPages[p] = (allPages[p] || 0) + n;
    }
    if (r.referrers) {
      for (const [host, n] of Object.entries(r.referrers)) {
        allReferrers[host] = (allReferrers[host] || 0) + n;
      }
    }
    if (r.utm) {
      for (const [k, n] of Object.entries(r.utm)) {
        allUtm[k] = (allUtm[k] || 0) + n;
      }
    }
  }

  return c.json({
    days: results,
    summary: {
      totalViews,
      countries: allCountries,
      topPages: Object.entries(allPages).sort((a, b) => b[1] - a[1]).slice(0, 20),
      referrers: allReferrers,
      utm: allUtm,
    },
  });
});

// ─────────────────────────────────────────────
// EVENT / LIVE SCHEDULE ENDPOINTS
// ─────────────────────────────────────────────

function generateEventId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── POST /api/auth/events — Create event (Pro only) ──
app.post('/api/auth/events', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  // Check plan
  const userRaw = await c.env.USERS.get(`user:${payload.email}`);
  if (!userRaw) return c.json({ error: 'User not found' }, 404);
  const user: UserData = JSON.parse(userRaw);
  if (user.plan !== 'pro') {
    return c.json({ error: 'Pro plan required' }, 403);
  }

  const body = await c.req.json<Partial<EventData>>();
  if (!body.title || !body.date || !body.venueName || body.lat === undefined || body.lng === undefined) {
    return c.json({ error: 'Missing required fields: title, date, venueName, lat, lng' }, 400);
  }

  const id = generateEventId();
  const now = new Date().toISOString();
  const event: EventData = {
    id,
    creatorEmail: payload.email,
    title: body.title,
    description: body.description || '',
    date: body.date,
    startTime: body.startTime || '',
    endTime: body.endTime || '',
    venueName: body.venueName,
    venueAddress: body.venueAddress || '',
    lat: body.lat,
    lng: body.lng,
    price: body.price || '',
    eventType: body.eventType || 'concert',
    genre: body.genre || 'other',
    performers: body.performers || [],
    interestedCount: 0,
    interestedEmails: [],
    createdAt: now,
    updatedAt: now,
  };

  // Store event
  await c.env.SESSIONS.put(`event:${id}`, JSON.stringify(event), { expirationTtl: 365 * 24 * 3600 });

  // Add to date index
  const dateKey = `events-date:${body.date}`;
  const dateRaw = await c.env.SESSIONS.get(dateKey);
  const dateIds: string[] = dateRaw ? JSON.parse(dateRaw) : [];
  dateIds.push(id);
  await c.env.SESSIONS.put(dateKey, JSON.stringify(dateIds), { expirationTtl: 365 * 24 * 3600 });

  // Add to user index
  const userKey = `events-user:${payload.email}`;
  const userEventsRaw = await c.env.SESSIONS.get(userKey);
  const userEvents: string[] = userEventsRaw ? JSON.parse(userEventsRaw) : [];
  userEvents.push(id);
  await c.env.SESSIONS.put(userKey, JSON.stringify(userEvents), { expirationTtl: 365 * 24 * 3600 });

  // Auto-save venue to venue database
  if (body.venueName && body.lat && body.lng) {
    const venueKey = `venue:${body.venueName.toLowerCase().replace(/\s+/g, '-')}`;
    const existingVenue = await c.env.SESSIONS.get(venueKey);
    const venue: VenueData = existingVenue ? JSON.parse(existingVenue) : {
      name: body.venueName,
      address: body.venueAddress || '',
      lat: body.lat,
      lng: body.lng,
      usageCount: 0,
      lastUsed: '',
    };
    venue.usageCount += 1;
    venue.lastUsed = now;
    // Update address/coords if newer
    venue.address = body.venueAddress || venue.address;
    venue.lat = body.lat;
    venue.lng = body.lng;
    await c.env.SESSIONS.put(venueKey, JSON.stringify(venue));
  }

  return c.json({ ok: true, event });
});

// ── GET /api/auth/events — List events (public, with filters) ──
app.get('/api/auth/events', async (c) => {
  const date = c.req.query('date') || todayStr();
  const range = parseInt(c.req.query('range') || '1', 10); // days to include
  const genre = c.req.query('genre') || '';
  const eventType = c.req.query('eventType') || '';

  const allEvents: EventData[] = [];
  const fetchPromises: Promise<void>[] = [];

  for (let i = 0; i < Math.min(range, 90); i++) {
    const d = new Date(date);
    d.setDate(d.getDate() + i);
    const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    fetchPromises.push(
      c.env.SESSIONS.get(`events-date:${dayStr}`).then(async (raw) => {
        if (!raw) return;
        const ids: string[] = JSON.parse(raw);
        const eventPromises = ids.map(async (id) => {
          const eventRaw = await c.env.SESSIONS.get(`event:${id}`);
          if (eventRaw) {
            const ev: EventData = JSON.parse(eventRaw);
            // Apply filters
            if (genre && ev.genre !== genre) return;
            if (eventType && ev.eventType !== eventType) return;
            allEvents.push(ev);
          }
        });
        await Promise.all(eventPromises);
      })
    );
  }

  await Promise.all(fetchPromises);

  // Sort by date + startTime
  allEvents.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });

  // Strip interestedEmails from public response
  const publicEvents = allEvents.map(({ interestedEmails, ...rest }) => rest);

  return c.json({ events: publicEvents, total: publicEvents.length });
});

// ── GET /api/auth/events/:id — Single event detail (public) ──
app.get('/api/auth/events/:id', async (c) => {
  const id = c.req.param('id');
  const raw = await c.env.SESSIONS.get(`event:${id}`);
  if (!raw) return c.json({ error: 'Event not found' }, 404);

  const event: EventData = JSON.parse(raw);
  // Strip interestedEmails
  const { interestedEmails, ...publicEvent } = event;

  // Enrich performers with avatar info
  const enrichedPerformers = await Promise.all(
    event.performers.map(async (p) => {
      if (p.email) {
        const uRaw = await c.env.USERS.get(`user:${p.email}`);
        if (uRaw) {
          const u: UserData = JSON.parse(uRaw);
          return { ...p, userName: u.name, hasAvatar: !!u.avatarKey };
        }
      }
      return { ...p, userName: '', hasAvatar: false };
    })
  );

  return c.json({ event: { ...publicEvent, performers: enrichedPerformers } });
});

// ── PUT /api/auth/events/:id — Update own event (Pro only) ──
app.put('/api/auth/events/:id', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const id = c.req.param('id');
  const raw = await c.env.SESSIONS.get(`event:${id}`);
  if (!raw) return c.json({ error: 'Event not found' }, 404);

  const event: EventData = JSON.parse(raw);
  if (event.creatorEmail !== payload.email && payload.email !== '369@kotaroasahina.com') {
    return c.json({ error: 'Not your event' }, 403);
  }

  const updates = await c.req.json<Partial<EventData>>();
  const oldDate = event.date;

  // Apply updates
  const updatableFields: (keyof EventData)[] = [
    'title', 'description', 'date', 'startTime', 'endTime',
    'venueName', 'venueAddress', 'lat', 'lng', 'price',
    'eventType', 'genre', 'performers',
  ];
  for (const field of updatableFields) {
    if (updates[field] !== undefined) {
      (event as unknown as Record<string, unknown>)[field] = updates[field];
    }
  }
  event.updatedAt = new Date().toISOString();

  await c.env.SESSIONS.put(`event:${id}`, JSON.stringify(event), { expirationTtl: 365 * 24 * 3600 });

  // If date changed, update date indexes
  if (updates.date && updates.date !== oldDate) {
    // Remove from old date index
    const oldDateKey = `events-date:${oldDate}`;
    const oldDateRaw = await c.env.SESSIONS.get(oldDateKey);
    if (oldDateRaw) {
      const oldIds: string[] = JSON.parse(oldDateRaw);
      await c.env.SESSIONS.put(oldDateKey, JSON.stringify(oldIds.filter(i => i !== id)), { expirationTtl: 365 * 24 * 3600 });
    }
    // Add to new date index
    const newDateKey = `events-date:${updates.date}`;
    const newDateRaw = await c.env.SESSIONS.get(newDateKey);
    const newIds: string[] = newDateRaw ? JSON.parse(newDateRaw) : [];
    newIds.push(id);
    await c.env.SESSIONS.put(newDateKey, JSON.stringify(newIds), { expirationTtl: 365 * 24 * 3600 });
  }

  return c.json({ ok: true, event });
});

// ── DELETE /api/auth/events/:id — Delete own event ──
app.delete('/api/auth/events/:id', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const id = c.req.param('id');
  const raw = await c.env.SESSIONS.get(`event:${id}`);
  if (!raw) return c.json({ error: 'Event not found' }, 404);

  const event: EventData = JSON.parse(raw);
  if (event.creatorEmail !== payload.email && payload.email !== '369@kotaroasahina.com') {
    return c.json({ error: 'Not your event' }, 403);
  }

  // Remove from date index
  const dateKey = `events-date:${event.date}`;
  const dateRaw = await c.env.SESSIONS.get(dateKey);
  if (dateRaw) {
    const ids: string[] = JSON.parse(dateRaw);
    await c.env.SESSIONS.put(dateKey, JSON.stringify(ids.filter(i => i !== id)), { expirationTtl: 365 * 24 * 3600 });
  }

  // Remove from user index
  const userKey = `events-user:${event.creatorEmail}`;
  const userEventsRaw = await c.env.SESSIONS.get(userKey);
  if (userEventsRaw) {
    const userEvents: string[] = JSON.parse(userEventsRaw);
    await c.env.SESSIONS.put(userKey, JSON.stringify(userEvents.filter(i => i !== id)), { expirationTtl: 365 * 24 * 3600 });
  }

  // Delete event
  await c.env.SESSIONS.delete(`event:${id}`);

  return c.json({ ok: true });
});

// ── GET /api/auth/events/user/me — List my events ──
app.get('/api/auth/events/user/me', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const userKey = `events-user:${payload.email}`;
  const userEventsRaw = await c.env.SESSIONS.get(userKey);
  const ids: string[] = userEventsRaw ? JSON.parse(userEventsRaw) : [];

  const events: EventData[] = [];
  const fetchPromises = ids.map(async (id) => {
    const raw = await c.env.SESSIONS.get(`event:${id}`);
    if (raw) events.push(JSON.parse(raw));
  });
  await Promise.all(fetchPromises);

  // Sort by date descending
  events.sort((a, b) => b.date.localeCompare(a.date));

  return c.json({ events });
});

// ── POST /api/auth/events/:id/interested — Toggle "interested" ──
app.post('/api/auth/events/:id/interested', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const id = c.req.param('id');
  const raw = await c.env.SESSIONS.get(`event:${id}`);
  if (!raw) return c.json({ error: 'Event not found' }, 404);

  const event: EventData = JSON.parse(raw);
  const idx = event.interestedEmails.indexOf(payload.email);
  if (idx >= 0) {
    event.interestedEmails.splice(idx, 1);
    event.interestedCount = Math.max(0, event.interestedCount - 1);
  } else {
    event.interestedEmails.push(payload.email);
    event.interestedCount += 1;
  }
  event.updatedAt = new Date().toISOString();
  await c.env.SESSIONS.put(`event:${id}`, JSON.stringify(event), { expirationTtl: 365 * 24 * 3600 });

  return c.json({ ok: true, interested: idx < 0, count: event.interestedCount });
});

// ── GET /api/auth/venues/search — Search venue database ──
app.get('/api/auth/venues/search', async (c) => {
  const query = (c.req.query('q') || '').toLowerCase();
  if (!query || query.length < 2) return c.json({ venues: [] });

  // List all venue keys
  const list = await c.env.SESSIONS.list({ prefix: 'venue:' });
  const venues: VenueData[] = [];

  const fetchPromises = list.keys.map(async (key) => {
    const raw = await c.env.SESSIONS.get(key.name);
    if (raw) {
      const venue: VenueData = JSON.parse(raw);
      if (venue.name.toLowerCase().includes(query) || venue.address.toLowerCase().includes(query)) {
        venues.push(venue);
      }
    }
  });
  await Promise.all(fetchPromises);

  // Sort by usage count descending
  venues.sort((a, b) => b.usageCount - a.usageCount);

  return c.json({ venues: venues.slice(0, 20) });
});

// ─────────────────────────────────────────────
// Stripe Webhook (Phase 7 — Stage C scaffolding)
//
// 受信イベントを署名検証 → ディスパッチする雛形。
// 各 case 内のハンドラ本体は Stage D で実装する。
// 現状は受信ログ出力のみで KV への書き込みは行わない。
//
// Stripe Dashboard で本エンドポイントを登録する手順:
//   1. https://dashboard.stripe.com → 開発者 → Webhook
//   2. + エンドポイントを追加
//   3. URL: https://kuon-rnd-auth-worker.369-1d5.workers.dev/api/auth/stripe/webhook
//   4. イベント選択: 下記 case で扱う 13 種すべて
//   5. 発行された whsec_... を `wrangler secret put STRIPE_WEBHOOK_SECRET` で登録
// ─────────────────────────────────────────────
app.post('/api/auth/stripe/webhook', async (c) => {
  const sig = c.req.header('stripe-signature');
  if (!sig) return c.text('Missing stripe-signature header', 400);

  const rawBody = await c.req.text();
  const stripe = getStripe(c.env);

  let event: Stripe.Event;
  try {
    // Cloudflare Workers requires async version (uses Web Crypto API)
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      sig,
      c.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[stripe-webhook] signature verify failed:', message);
    return c.text(`Webhook Error: ${message}`, 400);
  }

  console.log('[stripe-webhook] received:', event.type, event.id);

  try {
    switch (event.type) {
      // ── Checkout 完了: 顧客と Stripe Customer ID を紐付け ──
      case 'checkout.session.completed':
        await handleCheckoutCompleted(c.env, event);
        break;

      // ── サブスク ライフサイクル (created/updated/paused/resumed は同一ハンドラで処理) ──
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
        await handleSubscriptionEvent(c.env, event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(c.env, event);
        break;

      // ── 請求書ライフサイクル ──
      case 'invoice.paid':
        await handleInvoicePaid(c.env, event);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(c.env, event);
        break;

      // ── Subscription Schedule (Phase 6 ダウングレード対応) ──
      case 'subscription_schedule.created':
      case 'subscription_schedule.updated':
      case 'subscription_schedule.released':
      case 'subscription_schedule.canceled':
        await handleSubscriptionSchedule(c.env, event);
        break;

      default:
        console.log('[stripe-webhook] unhandled event type:', event.type);
    }
  } catch (err) {
    // ハンドラ内で投げられた例外はここでキャッチし、200 で握りつぶす。
    // Stripe にリトライさせると同じ失敗を繰り返すため、ログに残して握り潰す方が安全。
    const message = err instanceof Error ? err.message : 'unknown';
    console.error('[stripe-webhook] handler error:', event.type, message);
  }

  // 200 を返さないと Stripe がリトライし続けるため、内部処理失敗でも 200 を返す。
  // 失敗の検知は console.error で Cloudflare ログから行う。
  return c.json({ received: true });
});

// ─────────────────────────────────────────────
// Stripe Checkout / Portal セッション作成 API (Phase 7 — Stage E)
//
// フロントエンド (kuon-rnd.com) から呼ばれる能動的なエンドポイント。
// Webhook (受動的) とは逆の、購入フロー開始 / マイページから Portal 起動の側。
// ─────────────────────────────────────────────

/**
 * POST /api/auth/stripe/checkout
 *
 * リクエスト body:
 *   { plan: 'prelude'|'concerto'|'symphony'|'opus', cycle: 'monthly'|'annual' }
 *
 * 機能:
 *   1. JWT で認証
 *   2. プラン + cycle を検証
 *   3. CF-IPCountry から地域判定 (LatAm or Global)
 *   4. 該当 Price ID を選択 (LatAm 顧客なら _latam を、それ以外は _global)
 *   5. ユーザーの stripeCustomerId が無ければ Stripe Customer を作成
 *   6. monthly + Opus 以外なら FIRST100 Coupon を attach
 *   7. Checkout Session を作成 (metadata.userEmail を付与: Webhook で email 特定するため)
 *   8. URL を返す
 */
app.post('/api/auth/stripe/checkout', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const email = payload.email;
  const userKey = `user:${email}`;
  const raw = await c.env.USERS.get(userKey);
  if (!raw) return c.json({ error: 'User not found' }, 404);

  const user = ensureStripeFields(JSON.parse(raw));

  // 既存サブスクをチェック (アクティブなら Customer Portal へ誘導)
  if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') {
    return c.json({
      error: 'Already subscribed',
      message: 'プラン変更はマイページの Customer Portal から行ってください',
    }, 409);
  }

  // リクエスト body 検証
  const body = await c.req.json<{ plan?: string; cycle?: string; couponCode?: string }>().catch(() => ({} as { plan?: string; cycle?: string; couponCode?: string }));
  const plan = body.plan;
  const cycle = body.cycle;
  // 教師経由学生クーポン (CLAUDE.md §44.4): URL ?coupon=XXX 経由で運ばれた Promotion Code
  const requestedCouponCode = (body.couponCode || '').trim().toUpperCase();

  if (!plan || !['prelude', 'concerto', 'symphony', 'opus'].includes(plan)) {
    return c.json({ error: 'Invalid plan' }, 400);
  }
  // ── Opus は 2026-04-28 に新規販売停止 (CLAUDE.md §41 / Stripe Product archive 済み) ──
  // フロント LP からは削除済みだが、古いキャッシュ・直接 API 叩き・Bot 等から
  // plan='opus' の Checkout が来るのを物理的に防ぐ。
  // 既存 Opus 加入者は影響を受けない (subscription.created 経由で planTier='opus' は維持)。
  if (plan === 'opus') {
    return c.json({
      error: 'Plan no longer available',
      message: 'Opus プランは新規販売を停止しました。Symphony プランをご検討ください。',
      suggestedPlan: 'symphony',
    }, 410); // 410 Gone: リソースは過去に存在したが廃止された
  }
  if (!cycle || !['monthly', 'annual'].includes(cycle)) {
    return c.json({ error: 'Invalid cycle' }, 400);
  }
  const planTier = plan as Exclude<PlanTier, 'free' | 'opus'>;
  const billingCycle = cycle as BillingCycle;

  // 地域判定: CF-IPCountry が MX/CL/CO/PE/UY なら LatAm、それ以外は Global
  const cfCountry = c.req.header('X-CF-Country') || '';
  const region: PricingRegion = isLatamCountry(cfCountry) ? 'latam' : 'global';

  // Price ID を取得 (Prelude/Concerto/Symphony はすべて LatAm 対応済み)
  // Opus は § 2026-04-28 廃止以降、上の Gone ガードでこの行に到達しない。
  const priceMap = PRICE_IDS[planTier];
  const priceKey = `${billingCycle}_${region}` as keyof typeof priceMap;
  const priceId: string | undefined = (priceMap as Record<string, string>)[priceKey];
  if (!priceId) {
    return c.json({ error: 'Price not found', plan, cycle, region }, 500);
  }

  const stripe = getStripe(c.env);

  // Stripe Customer を取得 or 新規作成
  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email,
      name: user.name || undefined,
      metadata: {
        userEmail: email,
        kuonUserId: email,
      },
    });
    stripeCustomerId = customer.id;
    // 即座に逆引きインデックスを保存 (Webhook より早く来る場合に備える)
    await indexStripeCustomer(c.env, stripeCustomerId, email);
    await updateUserStripe(c.env, email, { stripeCustomerId });
  }

  // ── Discount 戦略 (CLAUDE.md §44.4 + §44.8 教師経由学生クーポンの 2 段階適用) ──
  //
  // Stripe Checkout は単一サブスクに 1 つの discount しか持てないため、
  // 「初月 50% off + 月 2-12 30% off」を実現するには 2 段階適用が必要:
  //
  //   月 0 (Checkout): HALF50 を attach (初月 50% off)
  //   月 1 (invoice.paid Webhook): STUDENT_30_12MO に切替 → 月 2-13 が 30% off
  //   月 14: 自動的に通常価格に回復
  //
  // 教師コードがあるなら subscription.metadata に pendingStudentSwitch='1' と
  // teacherPromoCode / teacherEmail を保存。Webhook がこれを見て切替を実行する。
  //
  // discounts 配列は { coupon } または { promotion_code } のいずれか 1 件のみ。
  const discounts: Array<{ coupon: string } | { promotion_code: string }> = [];
  let appliedTeacherEmail = '';
  let appliedPromoCodeId = '';
  let pendingStudentSwitch = false;
  let half50Applied = false;

  // 1. 教師 Promotion Code 検証 (発見できれば後でスイッチするフラグを立てる)
  if (requestedCouponCode && /^[A-Z0-9-]{3,50}$/.test(requestedCouponCode)) {
    try {
      const found = await stripe.promotionCodes.list({
        code: requestedCouponCode,
        active: true,
        limit: 1,
      });
      if (found.data.length > 0) {
        const promo = found.data[0];
        appliedPromoCodeId = promo.id;
        appliedTeacherEmail = (promo.metadata?.teacherEmail as string) || '';
        pendingStudentSwitch = true;
        console.log('[checkout] teacher code validated:', requestedCouponCode, 'teacher=', appliedTeacherEmail, '→ will switch after first invoice');
      } else {
        console.log('[checkout] teacher code not found or inactive:', requestedCouponCode);
      }
    } catch (err) {
      console.error('[checkout] teacher code lookup failed:', err);
    }
  }

  // 2. HALF50 を attach (初月 50% off・全顧客対象・初回のみ・monthly 限定)
  if (billingCycle === 'monthly') {
    const alreadyUsed = await hasUsedHalf50(c.env, email);
    if (!alreadyUsed) {
      const couponMap = COUPON_IDS.half50 as Record<string, string>;
      const couponId = couponMap[planTier];
      if (couponId) {
        discounts.push({ coupon: couponId });
        half50Applied = true;
      }
    } else {
      console.log('[checkout] HALF50 skipped (already used):', email, planTier);
    }
  }

  // 3. HALF50 が attach できなかった場合 (annual or HALF50 利用済み) で
  //    教師コードがある場合は、Promotion Code を直接 attach (1 段階で済ませる)
  //    この場合 pendingStudentSwitch は不要 (既に attach 済み)
  if (discounts.length === 0 && pendingStudentSwitch && appliedPromoCodeId) {
    discounts.push({ promotion_code: appliedPromoCodeId });
    pendingStudentSwitch = false;
    console.log('[checkout] direct STUDENT_30_12MO attach (no HALF50 eligibility)');
  }

  // Checkout Session 作成
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [{ price: priceId, quantity: 1 }],
    discounts: discounts.length > 0 ? discounts : undefined,
    // success/cancel URL: フロントエンドの Next.js ページに戻す
    success_url: 'https://kuon-rnd.com/mypage?checkout=success',
    cancel_url: 'https://kuon-rnd.com/pricing?canceled=true',
    // metadata で Webhook 側のユーザー特定を確実に
    // half50Applied は checkout.completed Webhook で half50-used フラグを立てる判定用
    // pendingStudentSwitch='1' は invoice.paid Webhook で STUDENT_30_12MO 切替を実行する判定用
    // teacherPromoCode / teacherEmail は教師経由学生クーポンの attribution 追跡用
    metadata: {
      userEmail: email,
      planTier,
      billingCycle,
      pricingRegion: region,
      half50Applied: half50Applied ? '1' : '0',
      pendingStudentSwitch: pendingStudentSwitch ? '1' : '0',
      teacherPromoCode: appliedPromoCodeId,
      teacherEmail: appliedTeacherEmail,
    },
    subscription_data: {
      metadata: {
        userEmail: email,
        planTier,
        billingCycle,
        pricingRegion: region,
        half50Applied: half50Applied ? '1' : '0',
        pendingStudentSwitch: pendingStudentSwitch ? '1' : '0',
        teacherPromoCode: appliedPromoCodeId,
        teacherEmail: appliedTeacherEmail,
      },
    },
    // 顧客ロケール (Stripe が自動で言語を判定)
    locale: 'auto',
    // 利用規約・プライバシー同意 (任意)
    // consent_collection: { terms_of_service: 'required' },
  });

  console.log(
    '[checkout]',
    email, '→', stripeCustomerId,
    'plan=', planTier,
    'cycle=', billingCycle,
    'region=', region,
    'priceId=', priceId,
    'discount=', discounts.length > 0
      ? ('coupon' in discounts[0] ? `coupon:${discounts[0].coupon}` : `promo:${discounts[0].promotion_code}`)
      : 'none',
    'teacherEmail=', appliedTeacherEmail,
  );

  return c.json({
    url: session.url,
    sessionId: session.id,
  });
});

/**
 * POST /api/auth/stripe/portal
 *
 * リクエスト body:
 *   { returnUrl?: string }   // 任意、デフォルトは /mypage
 *
 * 機能:
 *   1. JWT で認証
 *   2. ユーザーの stripeCustomerId を取得
 *   3. 無ければ 404 (まだサブスク未契約)
 *   4. Customer Portal Session を作成 (PORTAL_CONFIG_ID で設定済みポータルを使用)
 *   5. URL を返す
 */
app.post('/api/auth/stripe/portal', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);

  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);

  const email = payload.email;
  const userKey = `user:${email}`;
  const raw = await c.env.USERS.get(userKey);
  if (!raw) return c.json({ error: 'User not found' }, 404);

  const user = ensureStripeFields(JSON.parse(raw));

  if (!user.stripeCustomerId) {
    return c.json({
      error: 'No subscription',
      message: 'サブスクリプションを契約していません。先にプランを購入してください。',
    }, 404);
  }

  const body = await c.req.json<{ returnUrl?: string }>().catch(() => ({} as { returnUrl?: string }));
  const returnUrl = body.returnUrl || 'https://kuon-rnd.com/mypage';

  const stripe = getStripe(c.env);

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl,
    configuration: PORTAL_CONFIG_ID,
  });

  console.log('[portal]', email, '→', user.stripeCustomerId);

  return c.json({
    url: session.url,
  });
});

// ─────────────────────────────────────────────
// 教師経由学生クーポン管理 (2026-04-28 追加)
//
// オーナー (369@kotaroasahina.com) が `/admin/coupons` から呼び出す。
// STUDENT_30_12MO Coupon に紐づく Promotion Code を教師ごとに発行・管理する。
//
// Promotion Code の構造:
//   - code: 'TANAKA-30' (教師の名前を冠した可読コード)
//   - coupon: 'STUDENT_30_12MO' (Coupon 本体・再利用される)
//   - metadata.teacherEmail: 紹介元教師の email (attribution に使用)
//   - metadata.teacherName: 教師の表示名 (UI 表示用)
//   - restrictions.first_time_transaction: true (既存課金者の二重利用防止)
//
// 注意: Stripe Promotion Code は作成後に code を変更できない。間違ったら削除→再作成。
// ─────────────────────────────────────────────

/**
 * POST /api/auth/admin/promo-code
 *
 * Body: { teacherEmail, teacherName, code, maxRedemptions? }
 *
 * Stripe に Promotion Code を作成して、metadata に教師情報を埋め込む。
 * 既に同じ code が存在する場合は 409 を返す (Stripe の API も同様だが念のため事前チェック)。
 */
app.post('/api/auth/admin/promo-code', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);
  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload || payload.email !== '369@kotaroasahina.com') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const body = await c.req.json<{
    teacherEmail: string;
    teacherName: string;
    code: string;
    maxRedemptions?: number;
  }>().catch(() => null);

  if (!body || !body.teacherEmail || !body.teacherName || !body.code) {
    return c.json({ error: 'Missing required fields: teacherEmail, teacherName, code' }, 400);
  }

  // code バリデーション: 英数字 + ハイフンのみ、3〜50 文字
  const codeNorm = body.code.trim().toUpperCase();
  if (!/^[A-Z0-9-]{3,50}$/.test(codeNorm)) {
    return c.json({
      error: 'Invalid code format',
      message: 'コードは英数字とハイフンのみ・3〜50文字（例: TANAKA-30）',
    }, 400);
  }

  // teacherEmail バリデーション
  const teacherEmail = body.teacherEmail.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacherEmail)) {
    return c.json({ error: 'Invalid teacherEmail' }, 400);
  }

  const stripe = getStripe(c.env);

  try {
    // 事前重複チェック: 同 code が既存 active か確認
    const existing = await stripe.promotionCodes.list({ code: codeNorm, limit: 1 });
    if (existing.data.length > 0 && existing.data[0].active) {
      return c.json({
        error: 'Code already exists',
        message: `コード "${codeNorm}" は既に使用されています。別のコードを指定してください。`,
        existingCode: existing.data[0].id,
      }, 409);
    }

    const promoCode = await stripe.promotionCodes.create({
      // Stripe SDK v22+: coupon は promotion wrapper の中に入れる
      promotion: {
        type: 'coupon',
        coupon: COUPON_IDS.student_30_12mo,
      },
      code: codeNorm,
      max_redemptions: body.maxRedemptions && body.maxRedemptions > 0
        ? body.maxRedemptions
        : undefined,
      metadata: {
        teacherEmail,
        teacherName: body.teacherName.trim().slice(0, 100),
        createdBy: 'admin',
        createdAt: new Date().toISOString(),
      },
      restrictions: {
        first_time_transaction: true, // 既存課金者の二重利用防止
      },
    });

    console.log('[promo-code:create]', codeNorm, 'for', teacherEmail);

    return c.json({
      ok: true,
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        active: promoCode.active,
        timesRedeemed: promoCode.times_redeemed,
        maxRedemptions: promoCode.max_redemptions,
        teacherEmail,
        teacherName: body.teacherName,
        shareUrl: `https://kuon-rnd.com/?coupon=${codeNorm}`,
        createdAt: new Date(promoCode.created * 1000).toISOString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    console.error('[promo-code:create] error:', message);
    return c.json({ error: 'Failed to create promo code', message }, 500);
  }
});

/**
 * GET /api/auth/admin/promo-codes
 *
 * STUDENT_30_12MO に紐づく全 Promotion Code を返す。
 * 教師ごとの一覧表示・統計の元データ。
 */
app.get('/api/auth/admin/promo-codes', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);
  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload || payload.email !== '369@kotaroasahina.com') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const stripe = getStripe(c.env);

  try {
    // STUDENT_30_12MO に紐づく全 Promotion Code を取得 (Stripe は最大 100 件/リクエスト)
    const list = await stripe.promotionCodes.list({
      coupon: COUPON_IDS.student_30_12mo,
      limit: 100,
    });

    const codes = list.data.map((p) => ({
      id: p.id,
      code: p.code,
      active: p.active,
      timesRedeemed: p.times_redeemed,
      maxRedemptions: p.max_redemptions,
      teacherEmail: p.metadata?.teacherEmail || '',
      teacherName: p.metadata?.teacherName || '',
      shareUrl: `https://kuon-rnd.com/?coupon=${p.code}`,
      createdAt: new Date(p.created * 1000).toISOString(),
    }));

    // 新しい順にソート
    codes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({
      ok: true,
      codes,
      total: codes.length,
      activeCount: codes.filter((c) => c.active).length,
      totalRedemptions: codes.reduce((s, c) => s + c.timesRedeemed, 0),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    console.error('[promo-codes:list] error:', message);
    return c.json({ error: 'Failed to list promo codes', message }, 500);
  }
});

/**
 * PATCH /api/auth/admin/promo-code/:id
 *
 * Body: { active: boolean }
 *
 * Promotion Code を有効化・無効化する。
 * 削除はできない (Stripe の仕様)。代わりに active=false で停止する。
 */
app.patch('/api/auth/admin/promo-code/:id', async (c) => {
  const auth = c.req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) return c.json({ error: 'No token' }, 401);
  const payload = await verifyJWT(auth.slice(7), c.env.AUTH_SECRET);
  if (!payload || payload.email !== '369@kotaroasahina.com') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Missing id' }, 400);

  const body = await c.req.json<{ active?: boolean }>().catch(() => null);
  if (!body || typeof body.active !== 'boolean') {
    return c.json({ error: 'Missing active field' }, 400);
  }

  const stripe = getStripe(c.env);

  try {
    const updated = await stripe.promotionCodes.update(id, {
      active: body.active,
    });

    console.log('[promo-code:patch]', id, 'active=', body.active);

    return c.json({
      ok: true,
      promoCode: {
        id: updated.id,
        code: updated.code,
        active: updated.active,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    console.error('[promo-code:patch] error:', message);
    return c.json({ error: 'Failed to update promo code', message }, 500);
  }
});

export default app;
