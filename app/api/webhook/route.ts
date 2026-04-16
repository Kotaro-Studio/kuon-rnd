// Stripe Webhook — checkout.session.completed で購入者にパスワードメールを送信
// 環境変数（Cloudflare Pages に設定）:
//   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
//   RESEND_API_KEY=re_xxxxx

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

// ─────────────────────────────────────────────
// Stripe signature verification (Edge-compatible, no Node crypto)
// ─────────────────────────────────────────────
async function verifyStripeSignature(
  payload: string,
  sigHeader: string,
  secret: string
): Promise<boolean> {
  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    if (k === 't') acc.timestamp = v;
    if (k === 'v1') acc.signatures.push(v);
    return acc;
  }, { timestamp: '', signatures: [] as string[] });

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
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
  const expected = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return parts.signatures.includes(expected);
}

// ─────────────────────────────────────────────
// Email template
// ─────────────────────────────────────────────
function buildEmail(customerEmail: string) {
  return {
    from: '空音開発 Kuon R&D <noreply@kotaroasahina.com>',
    to: customerEmail,
    subject: '【空音開発】P-86S ご購入ありがとうございます — KUON NORMALIZE パスワード',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 22px; color: #0c4a6e; margin-bottom: 8px;">
          P-86S ステレオマイクロフォン<br>ご購入ありがとうございます
        </h1>
        <p style="color: #475569; font-size: 15px; line-height: 1.8;">
          このたびは空音開発の P-86S をお選びいただき、誠にありがとうございます。<br>
          決済確認後、1〜3 営業日以内に発送いたします。
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

        <h2 style="font-size: 18px; color: #0c4a6e; margin-bottom: 8px;">
          購入者限定特典: KUON NORMALIZE
        </h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.8;">
          P-86S オーナー限定で、オーディオアプリ「KUON NORMALIZE」を無料でお使いいただけます。
        </p>

        <div style="background: linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 20px 0;">
          <div style="color: rgba(255,255,255,0.8); font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">
            アプリのパスワード
          </div>
          <div style="color: #fff; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'SF Mono', 'Consolas', monospace; margin: 8px 0;">
            kuon
          </div>
        </div>

        <p style="color: #94a3b8; font-size: 13px; font-style: italic; text-align: center;">
          このパスワードはすべての P-86S オーナーが共有しています。仲間の証です。
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="https://kuon-rnd.com/normalize"
             style="display: inline-block; background: #0284c7; color: #fff; padding: 14px 36px; border-radius: 50px; text-decoration: none; font-size: 15px; letter-spacing: 1px;">
            KUON NORMALIZE を開く
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

        <p style="color: #94a3b8; font-size: 12px; line-height: 1.7; text-align: center;">
          空音開発 / Kuon R&D<br>
          <a href="https://kuon-rnd.com" style="color: #0284c7;">kuon-rnd.com</a><br>
          ご不明な点がございましたら 369@kotaroasahina.com までお気軽にどうぞ。
        </p>
      </div>
    `,
  };
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
    data: {
      object: {
        customer_details?: { email?: string };
        customer_email?: string;
        metadata?: Record<string, string>;
      };
    };
  };

  // Only handle checkout.session.completed
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object;
  const email = session.customer_details?.email || session.customer_email;

  if (!email) {
    console.log('No customer email found in session');
    return NextResponse.json({ received: true });
  }

  // Send password email via Resend
  try {
    const emailData = buildEmail(email);
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
    }
  } catch (e) {
    console.error('Email send failed:', e);
  }

  return NextResponse.json({ received: true });
}
