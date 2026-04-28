'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { LangProvider } from '@/context/LangContext';

/** Lightweight page-view tracker — fires once per navigation, no auth required */
function PageviewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    // Capture optional attribution signals (non-blocking, best-effort)
    let referrer = '';
    let utm_source = '';
    let utm_medium = '';
    let utm_campaign = '';
    try {
      if (typeof document !== 'undefined' && document.referrer) {
        const r = new URL(document.referrer);
        // Ignore self-referrals (internal navigation)
        if (typeof window !== 'undefined' && r.host !== window.location.host) {
          referrer = r.host;
        }
      }
      if (typeof window !== 'undefined') {
        const q = new URLSearchParams(window.location.search);
        utm_source = q.get('utm_source') || '';
        utm_medium = q.get('utm_medium') || '';
        utm_campaign = q.get('utm_campaign') || '';
      }
    } catch { /* silent */ }

    // Fire-and-forget: don't block rendering
    fetch('/api/auth/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
      }),
    }).catch(() => { /* silent */ });
  }, [pathname]);
  return null;
}

/**
 * Silent JWT auto-refresh (Notion-style perpetual login).
 *
 * On each page navigation, decode the JWT from the kuon_user localStorage entry
 * and check the token's remaining lifetime by calling /api/auth/me.
 * If the server responds successfully, we know the token is still valid.
 * We refresh proactively once per session (not on every navigation) when the
 * token was issued more than 23 days ago (i.e., less than 7 days remaining).
 *
 * The actual JWT is stored in an HttpOnly cookie (kuon_token), so we can't read
 * its expiry directly. Instead, we call /api/auth/refresh which:
 *   1. Validates the current cookie-based JWT
 *   2. Issues a fresh 30-day JWT
 *   3. Sets a new HttpOnly cookie via the API proxy
 *   4. Returns updated user info for localStorage
 *
 * Result: users who visit the site at least once every 30 days stay logged in
 * forever — just like Notion.
 */
function TokenRefresher() {
  const refreshedRef = useRef(false);

  useEffect(() => {
    // Only attempt once per page-load session
    if (refreshedRef.current) return;
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('kuon_user');
    if (!stored) return; // not logged in

    // Mark as attempted so we don't retry on every navigation
    refreshedRef.current = true;

    // Fire-and-forget: silently refresh the token
    (async () => {
      try {
        const res = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
          // Token expired or invalid — clear stale localStorage
          if (res.status === 401) {
            localStorage.removeItem('kuon_user');
          }
          return;
        }
        const data = await res.json();
        // Update localStorage with latest user info (plan may have changed)
        if (data.user) {
          localStorage.setItem('kuon_user', JSON.stringify(data.user));
        }
      } catch {
        /* Network error — silent, will retry on next visit */
      }
    })();
  }, []);

  return null;
}

/**
 * Capture promotion code from URL (?coupon=XXX) and store in localStorage.
 * Used by 教師経由学生クーポン (CLAUDE.md §44.4): teachers share kuon-rnd.com/?coupon=ASAHINA-30
 * → student lands on the site → coupon stays sticky for 30 days
 * → next subscribe action auto-applies STUDENT_30_12MO via Stripe Checkout.
 *
 * Storage:
 *   localStorage 'kuon_pending_coupon' = JSON { code, capturedAt }
 *   TTL 30 days (sufficient for student to think about it before purchasing)
 */
function CouponCapture() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const q = new URLSearchParams(window.location.search);
      const code = q.get('coupon');
      if (!code) return;

      // Validate format: A-Z, 0-9, hyphen, 3-50 chars
      const norm = code.trim().toUpperCase();
      if (!/^[A-Z0-9-]{3,50}$/.test(norm)) return;

      // Store with timestamp for TTL check at consumption time
      localStorage.setItem(
        'kuon_pending_coupon',
        JSON.stringify({ code: norm, capturedAt: Date.now() }),
      );
    } catch { /* silent */ }
  }, []);
  return null;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <PageviewTracker />
      <TokenRefresher />
      <CouponCapture />
      {children}
    </LangProvider>
  );
}
