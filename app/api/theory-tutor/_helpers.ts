/**
 * KUON THEORY TUTOR — 共通プロキシヘルパー
 */

const AUTH_WORKER = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

export interface AuthedUser {
  email: string;
  plan: string;
  planTier: string;
}

export function getCookie(req: Request, name: string): string | null {
  const cookies = req.headers.get('cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

export async function authenticate(req: Request): Promise<AuthedUser | null> {
  const cookieToken = getCookie(req, 'kuon_token');
  const authHeader = req.headers.get('authorization');
  const token =
    cookieToken ||
    (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);

  if (!token) return null;

  const meRes = await fetch(`${AUTH_WORKER}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!meRes.ok) return null;

  const me = await meRes.json() as any;
  if (!me?.email) return null;

  return {
    email: me.email,
    plan: me.plan || 'free',
    planTier: me.planTier || me.plan || 'free',
  };
}

export async function trackQuota(
  user: AuthedUser,
  app: string,
  cookieToken: string,
): Promise<{ ok: true } | { ok: false; status: number; body: any }> {
  const trackRes = await fetch(`${AUTH_WORKER}/api/auth/usage/track`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cookieToken}`,
    },
    body: JSON.stringify({ app }),
  });
  if (!trackRes.ok) {
    const body = await trackRes.json();
    return { ok: false, status: trackRes.status, body };
  }
  return { ok: true };
}

export async function callTutorWorker(
  user: AuthedUser,
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = process.env.TUTOR_URL || 'https://kuon-rnd-tutor-worker.369-1d5.workers.dev';
  const secret = process.env.TUTOR_SECRET || '';

  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${secret}`);
  headers.set('X-User-Email', user.email);
  headers.set('X-User-Plan', user.planTier);

  return fetch(`${url}${path}`, { ...init, headers });
}
