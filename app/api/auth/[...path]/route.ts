export const runtime = 'edge';

const WORKER_BASE = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

function getCookie(request: Request, name: string): string | null {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

/**
 * Universal auth proxy — replaces 20+ individual API routes with a single catch-all.
 * Forwards requests to kuon-rnd-auth-worker with cookie-based auth.
 * Special handling for: verify, confirm-email, logout, account, magic, change-email,
 * pageview, avatar upload, avatar/[email] binary response.
 */
async function handler(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join('/');
  const url = new URL(request.url);
  const method = request.method;
  const token = getCookie(request, 'kuon_token');

  // ── Special: logout (no Worker call needed) ──
  if (pathStr === 'logout' && method === 'POST') {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': 'kuon_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      },
    });
  }

  // ── Build Worker URL ──
  const workerUrl = `${WORKER_BASE}/api/auth/${pathStr}${url.search}`;

  // ── Build headers ──
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Route-specific headers
  if (pathStr === 'magic') {
    headers['X-Origin'] = url.origin;
  }
  if (pathStr === 'change-email') {
    headers['X-Origin'] = request.headers.get('Origin') || 'https://kuon-rnd.com';
  }
  if (pathStr === 'verify') {
    headers['X-CF-Country'] = request.headers.get('CF-IPCountry') || '';
    headers['X-CF-City'] = request.headers.get('CF-Visitor-City') || request.headers.get('CF-IPCity') || '';
  }

  // ── Build body ──
  let body: BodyInit | null = null;

  if (method !== 'GET' && method !== 'HEAD') {
    if (pathStr === 'avatar' && method === 'POST') {
      // Avatar upload: forward FormData
      const formData = await request.formData();
      const newForm = new FormData();
      const avatar = formData.get('avatar');
      if (avatar) newForm.append('avatar', avatar);
      body = newForm;
    } else if (pathStr === 'pageview' && method === 'POST') {
      // Pageview: inject CF country code into body
      const country = request.headers.get('CF-IPCountry') || 'XX';
      const reqBody = await request.json() as Record<string, unknown>;
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ path: reqBody.path || '/', country });
    } else {
      // Default: forward body as-is
      try {
        const text = await request.text();
        if (text) {
          headers['Content-Type'] = 'application/json';
          body = text;
        }
      } catch { /* empty body is fine */ }
    }
  }

  // ── Fetch from Worker ──
  const res = await fetch(workerUrl, { method, headers, body });

  // ── avatar/[email] GET: return binary (image) response ──
  if (path[0] === 'avatar' && path.length === 2 && method === 'GET') {
    return new Response(res.body, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'image/svg+xml',
        'Cache-Control': res.headers.get('Cache-Control') || 'public, max-age=3600',
      },
    });
  }

  // ── Parse JSON response ──
  const data = await res.json() as Record<string, unknown>;

  // ── Special: verify → set JWT cookie ──
  if (pathStr === 'verify' && method === 'POST' && res.ok && data.jwt) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `kuon_token=${data.jwt}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${30 * 24 * 3600}`,
      },
    });
  }

  // ── Special: confirm-email → update JWT cookie ──
  if (pathStr === 'confirm-email' && method === 'POST' && res.ok && data.jwt) {
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `kuon_token=${data.jwt}; Path=/; Max-Age=${30 * 24 * 3600}; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }

  // ── Special: account DELETE → clear cookie on success ──
  if (pathStr === 'account' && method === 'DELETE' && res.ok) {
    return Response.json(data, {
      status: 200,
      headers: {
        'Set-Cookie': 'kuon_token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
      },
    });
  }

  return Response.json(data, { status: res.status });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };
