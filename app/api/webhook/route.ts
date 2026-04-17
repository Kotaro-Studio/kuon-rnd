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
// Product info for emails
// ─────────────────────────────────────────────
// 商品名マッピング
const PRODUCT_KEY_NAMES: Record<string, string> = {
  'p-86s': 'P-86S ステレオマイクロフォン',
  'x-86s': 'X-86S プロフェッショナルステレオマイクロフォン',
};

const PRICE_ID_NAMES: Record<string, string> = {
  'price_1SuT6IGbZ5gwwaLkc7rjciqU': 'P-86S ステレオマイクロフォン',
  'price_1SuTKHGbZ5gwwaLkR6ew580Z': 'X-86S プロフェッショナルステレオマイクロフォン',
};

// JPY は小数点なし通貨: amount_total は 13900（P-86S）/ 39600（X-86S）
const AMOUNT_NAMES: Record<number, string> = {
  13900: 'P-86S ステレオマイクロフォン',
  39600: 'X-86S プロフェッショナルステレオマイクロフォン',
};

function detectProductName(session: {
  metadata?: Record<string, string>;
  line_items?: { data?: { price?: { id?: string } }[] };
  amount_total?: number;
}): string {
  // 1. metadata.product（最も確実 — checkout API で埋め込み済み）
  const metaProduct = session.metadata?.product;
  if (metaProduct && PRODUCT_KEY_NAMES[metaProduct]) return PRODUCT_KEY_NAMES[metaProduct];

  // 2. line_items の Price ID（expand されている場合のみ）
  const priceId = session.line_items?.data?.[0]?.price?.id;
  if (priceId && PRICE_ID_NAMES[priceId]) return PRICE_ID_NAMES[priceId];

  // 3. amount_total（JPY: 小数点なし）
  if (session.amount_total && AMOUNT_NAMES[session.amount_total]) {
    return AMOUNT_NAMES[session.amount_total];
  }

  // フォールバック
  return 'P-86S ステレオマイクロフォン';
}

// ─────────────────────────────────────────────
// Email template
// ─────────────────────────────────────────────
function buildEmail(customerEmail: string, productName: string) {
  return {
    from: '空音開発 Kuon R&D <noreply@kotaroasahina.com>',
    to: customerEmail,
    subject: `【空音開発】${productName} ご購入ありがとうございます — KUON NORMALIZE パスワード`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 22px; color: #0c4a6e; margin-bottom: 8px;">
          ${productName}<br>ご購入ありがとうございます
        </h1>
        <p style="color: #475569; font-size: 15px; line-height: 1.8;">
          このたびは空音開発の ${productName} をお選びいただき、誠にありがとうございます。<br>
          決済確認後、1〜3 営業日以内に発送いたします。
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

        <h2 style="font-size: 18px; color: #0c4a6e; margin-bottom: 8px;">
          購入者限定特典: KUON NORMALIZE
        </h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.8;">
          ${productName} オーナー限定で、オーディオアプリ「KUON NORMALIZE」を無料でお使いいただけます。
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
          このパスワードはすべてのマイクロフォンオーナーが共有しています。仲間の証です。
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="https://kuon-rnd.com/normalize"
             style="display: inline-block; background: #0284c7; color: #fff; padding: 14px 36px; border-radius: 50px; text-decoration: none; font-size: 15px; letter-spacing: 1px;">
            KUON NORMALIZE を開く
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

        <h2 style="font-size: 18px; color: #0c4a6e; margin-bottom: 8px;">
          オーナーズ・ギャラリーへのご招待
        </h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.8;">
          ${productName} で録音した自慢の音源を、空音開発のサイトで紹介しませんか？<br>
          ご希望の方には、朝比奈幸太郎によるマスタリング処理も無料で承ります。
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 16px 0;">
          <div style="color: #64748b; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px;">
            録音投稿パスワード
          </div>
          <div style="color: #0c4a6e; font-size: 24px; font-weight: 700; letter-spacing: 4px; font-family: 'SF Mono', 'Consolas', monospace;">
            kuon041755
          </div>
        </div>

        <div style="text-align: center; margin: 16px 0;">
          <a href="https://kuon-rnd.com/microphone#gallery-submit"
             style="display: inline-block; background: transparent; color: #0284c7; padding: 12px 28px; border-radius: 50px; text-decoration: none; font-size: 14px; letter-spacing: 1px; border: 1px solid #0284c7;">
            録音を投稿する
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

        <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #92400e; font-size: 13px; line-height: 1.7; margin: 0;">
            <strong>ソフトバンク（@softbank.ne.jp, @i.softbank.jp 等）のメールアドレスをご利用のお客様へ</strong><br>
            迷惑メールフィルタの設定により、当社からのメールが届かない場合がございます。
            メールが届いていない場合は、お手数ですが別のメールアドレス（Gmail 等）を添えて
            <a href="https://kuon-rnd.com/#contact" style="color: #0284c7;">お問い合わせフォーム</a>
            よりご連絡ください。パスワードを再送いたします。
          </p>
        </div>

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
        line_items?: { data?: { price?: { id?: string } }[] };
        amount_total?: number;
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

  const productName = detectProductName(session);

  // Send password email via Resend
  try {
    const emailData = buildEmail(email, productName);
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
