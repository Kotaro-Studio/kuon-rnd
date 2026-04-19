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
  ENVIRONMENT: string;
}

interface UserData {
  email: string;
  name: string;
  instrument: string;
  region: string;
  bio: string;
  plan: 'free' | 'student' | 'pro';
  stripeCustomerId: string;
  badges: string[];
  createdAt: string;
  lastLoginAt: string;
  appUsage: Record<string, number>;
  appUsageMonth: string; // "2026-04" format for monthly reset
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

  // Get or create user
  const userKey = `user:${session.email}`;
  let userData: UserData;
  const existing = await c.env.USERS.get(userKey);

  if (existing) {
    userData = JSON.parse(existing);
    userData.lastLoginAt = new Date().toISOString();
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

  const updates = await c.req.json<Partial<Pick<UserData, 'name' | 'instrument' | 'region' | 'bio'>>>();
  const raw = await c.env.USERS.get(`user:${payload.email}`);
  if (!raw) return c.json({ error: 'User not found' }, 404);

  const user: UserData = JSON.parse(raw);
  if (updates.name !== undefined) user.name = updates.name;
  if (updates.instrument !== undefined) user.instrument = updates.instrument;
  if (updates.region !== undefined) user.region = updates.region;
  if (updates.bio !== undefined) user.bio = updates.bio;

  await c.env.USERS.put(`user:${payload.email}`, JSON.stringify(user));
  return c.json({ ok: true, user: { email: user.email, name: user.name, instrument: user.instrument, region: user.region, bio: user.bio, plan: user.plan, badges: user.badges } });
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

export default app;
