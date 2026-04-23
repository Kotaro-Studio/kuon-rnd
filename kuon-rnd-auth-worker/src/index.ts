import { Hono } from 'hono';
import { cors } from 'hono/cors';

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
  return c.json({
    email: user.email,
    name: user.name,
    instrument: user.instrument,
    region: user.region,
    bio: user.bio,
    plan: user.plan,
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
    if (updates[f] !== undefined) (user as Record<string, unknown>)[f] = updates[f];
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

  if (planFilter && ['free', 'student', 'pro'].includes(planFilter)) {
    filtered = filtered.filter(u => u.plan === planFilter);
  }

  // Sort by createdAt descending (newest first)
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Stats
  const stats = {
    total: allUsers.length,
    free: allUsers.filter(u => u.plan === 'free').length,
    student: allUsers.filter(u => u.plan === 'student').length,
    pro: allUsers.filter(u => u.plan === 'pro').length,
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
      plan: u.plan,
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

  const { email, plan } = await c.req.json<{ email: string; plan: string }>();
  if (!email || !['free', 'student', 'pro'].includes(plan)) {
    return c.json({ error: 'Invalid email or plan' }, 400);
  }

  const userKey = `user:${email.toLowerCase().trim()}`;
  const raw = await c.env.USERS.get(userKey);
  if (!raw) return c.json({ error: 'User not found' }, 404);

  const user: UserData = JSON.parse(raw);
  const oldPlan = user.plan;
  user.plan = plan as 'free' | 'student' | 'pro';
  await c.env.USERS.put(userKey, JSON.stringify(user));

  return c.json({ ok: true, email: user.email, oldPlan, newPlan: user.plan });
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
      (event as Record<string, unknown>)[field] = updates[field];
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

export default app;
