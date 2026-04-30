/**
 * KUON TUTTI — API Proxy 共通ヘルパー
 */

const TUTTI_URL = process.env.TUTTI_URL || 'https://kuon-rnd-tutti-worker.369-1d5.workers.dev';
const TUTTI_SECRET = process.env.TUTTI_SECRET || '';
const AUTH_WORKER_URL = process.env.AUTH_WORKER_URL || 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

export interface AuthInfo {
  ok: true;
  email: string;
  name?: string;
  planTier: string;
}
export interface AuthError { ok: false; status: number; message: string; }

export async function verifyAuth(req: Request): Promise<AuthInfo | AuthError> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, status: 401, message: 'Missing Bearer token' };
  }
  try {
    const res = await fetch(`${AUTH_WORKER_URL}/api/auth/me`, {
      headers: { Authorization: authHeader },
    });
    if (!res.ok) return { ok: false, status: res.status, message: 'Auth verification failed' };
    const data = (await res.json()) as { ok?: boolean; user?: { email: string; name?: string; planTier?: string; plan?: string } };
    if (!data.user?.email) return { ok: false, status: 401, message: 'No user email' };
    return {
      ok: true,
      email: data.user.email,
      name: data.user.name,
      planTier: data.user.planTier || data.user.plan || 'free',
    };
  } catch {
    return { ok: false, status: 500, message: 'Auth call exception' };
  }
}

export async function callTuttiAuth(
  path: string,
  init: { method?: string; body?: any },
  email: string,
  planTier: string,
  userName?: string,
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TUTTI_SECRET}`,
    'X-User-Email': email,
    'X-User-Plan': planTier,
  };
  if (userName) headers['X-User-Name'] = encodeURIComponent(userName);
  return fetch(`${TUTTI_URL}${path}`, {
    method: init.method || 'GET',
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
}

// Guest 用: Bearer のみで X-User-Email 不要
export async function callTuttiPublic(
  path: string,
  init: { method?: string; body?: any },
): Promise<Response> {
  return fetch(`${TUTTI_URL}${path}`, {
    method: init.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TUTTI_SECRET}`,
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
}
