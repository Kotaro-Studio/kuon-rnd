// Stripe Webhook — checkout.session.completed で
//   ① 顧客にパスワード/特典メール送信
//   ② オーナー (369@kotaroasahina.com) に注文通知 (ヤマト集荷依頼用フォーマット付き)
// 環境変数 (Cloudflare Pages):
//   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
//   RESEND_API_KEY=re_xxxxx

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import {
  buildCustomerEmail,
  buildOwnerNotificationEmail,
  sendViaResend,
  type SessionLike,
} from '@/app/lib/purchase-emails';

// ─────────────────────────────────────────────
// Stripe signature verification (Edge-compatible, no Node crypto)
// ─────────────────────────────────────────────
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = sigHeader.split(',').reduce(
    (acc, part) => {
      const [k, v] = part.split('=');
      if (k === 't') acc.timestamp = v;
      if (k === 'v1') acc.signatures.push(v);
      return acc;
    },
    { timestamp: '', signatures: [] as string[] },
  );

  if (!parts.timestamp || parts.signatures.length === 0) return false;

  // Reject if timestamp is older than 5 minutes
  const age = Math.floor(Date.now() / 1000) - parseInt(parts.timestamp);
  if (age > 300) return false;

  const signedPayload = `${parts.timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return parts.signatures.includes(expected);
}

// ─────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!webhookSecret || !resendApiKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  // Verify Stripe signature
  const valid = await verifyStripeSignature(body, sig, webhookSecret);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body) as {
    type: string;
    data: { object: SessionLike };
  };

  // Only handle checkout.session.completed
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  const customerEmail = session.customer_details?.email || session.customer_email;

  if (!customerEmail) {
    console.log('[webhook] No customer email found in session');
    return NextResponse.json({ received: true });
  }

  // ───────────────────────────────────────────
  // 顧客メール + オーナー通知メール を並行送信
  // 顧客メールは shipping_details.address.country で言語自動切替 (JP→日本語、それ以外→英語)
  // ───────────────────────────────────────────
  const customerMail = buildCustomerEmail(customerEmail, session);
  const ownerMail = buildOwnerNotificationEmail(session);

  const [customerRes, ownerRes] = await Promise.all([
    sendViaResend(resendApiKey, customerMail),
    sendViaResend(resendApiKey, ownerMail),
  ]);

  if (!customerRes.ok) {
    console.error('[webhook] Customer email failed:', customerRes.error);
  }
  if (!ownerRes.ok) {
    console.error('[webhook] Owner notification failed:', ownerRes.error);
  }

  return NextResponse.json({ received: true });
}
