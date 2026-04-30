/**
 * KUON LIBRETTO TRANSLATOR — API Proxy 共通ヘルパー
 *
 * Cloudflare Pages のサーバー側で動く Next.js API Route 用。
 * Auth Worker で認証 → Libretto Worker へ転送。
 */

const LIBRETTO_URL = process.env.LIBRETTO_URL || 'https://kuon-rnd-libretto-worker.369-1d5.workers.dev';
const LIBRETTO_SECRET = process.env.LIBRETTO_SECRET || '';
const AUTH_WORKER_URL = process.env.AUTH_WORKER_URL || 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

export interface AuthInfo {
  email: string;
  planTier: string;
  ok: true;
}

export interface AuthError {
  ok: false;
  status: number;
  message: string;
}

/**
 * Auth Worker で JWT を検証し、ユーザーの email + planTier を取得
 */
export async function verifyAuth(req: Request): Promise<AuthInfo | AuthError> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, status: 401, message: 'Missing Bearer token' };
  }

  try {
    const res = await fetch(`${AUTH_WORKER_URL}/api/auth/me`, {
      headers: { Authorization: authHeader },
    });
    if (!res.ok) {
      return { ok: false, status: res.status, message: 'Auth verification failed' };
    }
    const data = (await res.json()) as { ok?: boolean; user?: { email: string; planTier?: string; plan?: string } };
    if (!data.user?.email) {
      return { ok: false, status: 401, message: 'No user email in auth response' };
    }
    return {
      ok: true,
      email: data.user.email,
      planTier: data.user.planTier || data.user.plan || 'free',
    };
  } catch {
    return { ok: false, status: 500, message: 'Auth call exception' };
  }
}

/**
 * 月別 usage を Auth Worker でカウントアップ (track エンドポイント呼び出し)
 */
export async function trackUsage(authHeader: string, app: 'libretto'): Promise<void> {
  try {
    await fetch(`${AUTH_WORKER_URL}/api/auth/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ app }),
    });
  } catch {
    /* fire and forget */
  }
}

/**
 * クォータチェック (Auth Worker /api/auth/usage/check)
 */
export async function checkQuota(authHeader: string, app: 'libretto'): Promise<{
  allowed: boolean;
  used: number;
  quota: number;
  remaining: number;
  warning: boolean;
  message?: string;
}> {
  try {
    const res = await fetch(`${AUTH_WORKER_URL}/api/auth/usage/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({ app }),
    });
    if (!res.ok) {
      return { allowed: false, used: 0, quota: 0, remaining: 0, warning: false, message: 'Quota check failed' };
    }
    const data = (await res.json()) as any;
    return {
      allowed: data.allowed ?? false,
      used: data.used ?? 0,
      quota: data.quota ?? 0,
      remaining: data.remaining ?? 0,
      warning: data.warning ?? false,
      message: data.message,
    };
  } catch {
    return { allowed: false, used: 0, quota: 0, remaining: 0, warning: false, message: 'Quota check exception' };
  }
}

/**
 * Libretto Worker への転送 (Bearer + X-User-Email + X-User-Plan ヘッダ)
 */
export async function callLibrettoWorker(
  path: string,
  init: { method?: string; body?: any },
  email: string,
  planTier: string,
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${LIBRETTO_SECRET}`,
    'X-User-Email': email,
    'X-User-Plan': planTier,
  };

  const body = init.body ? JSON.stringify(init.body) : undefined;

  return fetch(`${LIBRETTO_URL}${path}`, {
    method: init.method || 'GET',
    headers,
    body,
  });
}
