// オーナー専用 発送通知メール送信 API
//
// 用途: マイク発送後にヤマト追跡番号入力 → 顧客に発送通知メール自動送信
//
// 認証: ログイン済み + email === 369@kotaroasahina.com のみ
//
// リクエスト body:
//   { sessionId: string, trackingNumber: string }
//
// 安全装置:
//   1. JWT 認証 (オーナー以外実行不可)
//   2. Stripe Session の存在確認 (実在する注文のみ処理)
//   3. ヤマト追跡番号バリデーション (12 桁数字)
//   4. 発送済みフラグチェック (二重送信防止)
//   5. 冪等性キー (Resend 側で重複排除)

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { sendViaResend } from '@/app/lib/purchase-emails';
import {
  buildShippingEmailJa,
  validateTrackingNumber,
} from '@/app/lib/shipping-emails';

const OWNER_EMAIL = '369@kotaroasahina.com';
const AUTH_WORKER = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

function getCookie(request: NextRequest, name: string): string | null {
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

interface StripeSession {
  id: string;
  status: string;
  amount_total: number | null;
  metadata?: Record<string, string>;
  customer_details?: {
    name?: string | null;
    email?: string | null;
  } | null;
  shipping_details?: {
    name?: string | null;
    address?: { country?: string | null } | null;
  } | null;
}

const PRODUCT_KEY_FROM_AMOUNT: Record<number, string> = {
  13900: 'p-86s',
  39600: 'x-86s',
};
const PRODUCT_SHORT: Record<string, string> = {
  'p-86s': 'P-86S',
  'x-86s': 'X-86S',
};

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!stripeKey || !resendApiKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  // ─── 認証: オーナーのみ ───
  const token = getCookie(request, 'kuon_token');
  if (!token) {
    return NextResponse.json({ error: 'Not logged in' }, { status: 401 });
  }
  const meRes = await fetch(`${AUTH_WORKER}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!meRes.ok) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  const me = (await meRes.json()) as { email?: string };
  if (me.email !== OWNER_EMAIL) {
    return NextResponse.json({ error: 'Owner only' }, { status: 403 });
  }

  // ─── リクエスト body の検証 ───
  const body = (await request
    .json()
    .catch(() => ({}))) as { sessionId?: string; trackingNumber?: string };

  if (!body.sessionId || typeof body.sessionId !== 'string') {
    return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
  }

  if (!body.trackingNumber || typeof body.trackingNumber !== 'string') {
    return NextResponse.json({ error: 'trackingNumber required' }, { status: 400 });
  }

  // 追跡番号フォーマット検証 (12 桁数字)
  const trackingValid = validateTrackingNumber(body.trackingNumber);
  if (!trackingValid.valid) {
    return NextResponse.json(
      {
        error: 'Invalid tracking number format',
        message: 'ヤマト追跡番号は 12 桁の数字を入力してください',
      },
      { status: 400 },
    );
  }
  const trackingNumber = trackingValid.normalized;

  // ─── Stripe Session を取得 ───
  const sessionRes = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${body.sessionId}?expand[]=customer_details&expand[]=shipping_details`,
    { headers: { Authorization: `Bearer ${stripeKey}` } },
  );

  if (!sessionRes.ok) {
    return NextResponse.json(
      { error: 'Session not found', sessionId: body.sessionId },
      { status: 404 },
    );
  }

  const session = (await sessionRes.json()) as StripeSession;

  // 安全チェック: 完了済みのマイク注文か
  if (session.status !== 'complete') {
    return NextResponse.json(
      { error: 'Session not completed', status: session.status },
      { status: 400 },
    );
  }

  const amount = session.amount_total ?? 0;
  const productKey =
    session.metadata?.product || PRODUCT_KEY_FROM_AMOUNT[amount] || '';
  if (!productKey || !PRODUCT_SHORT[productKey]) {
    return NextResponse.json(
      { error: 'Not a microphone order', amount },
      { status: 400 },
    );
  }
  const productShort = PRODUCT_SHORT[productKey];

  // 安全チェック: 既に発送済みか (二重送信防止)
  if (session.metadata?.shipped === 'true') {
    return NextResponse.json(
      {
        error: 'Already shipped',
        previousTracking: session.metadata?.tracking,
        shippedAt: session.metadata?.shippedAt,
      },
      { status: 409 },
    );
  }

  // 顧客情報取得
  const customerEmail = session.customer_details?.email;
  const customerName =
    session.shipping_details?.name || session.customer_details?.name || '';

  if (!customerEmail) {
    return NextResponse.json(
      { error: 'Customer email not found in session' },
      { status: 400 },
    );
  }

  // ─── 発送通知メール送信 ───
  const mail = buildShippingEmailJa({
    customerEmail,
    customerName,
    productShort,
    trackingNumber,
  });

  const sendResult = await sendViaResend(
    resendApiKey,
    mail,
    `${session.id}:shipping:${trackingNumber}`,
  );

  if (!sendResult.ok) {
    return NextResponse.json(
      { error: 'Failed to send email', detail: sendResult.error },
      { status: 500 },
    );
  }

  // ─── Stripe Session metadata を更新 (発送済みフラグ) ───
  const shippedAt = new Date().toISOString();
  const updateParams = new URLSearchParams();
  updateParams.append('metadata[shipped]', 'true');
  updateParams.append('metadata[tracking]', trackingNumber);
  updateParams.append('metadata[shippedAt]', shippedAt);

  // 既存の metadata.product は維持する必要がある (上書きされないよう個別追加)
  if (session.metadata?.product) {
    updateParams.append('metadata[product]', session.metadata.product);
  }

  const updateRes = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${body.sessionId}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: updateParams.toString(),
    },
  );

  if (!updateRes.ok) {
    // メールは送信済みだが metadata 更新に失敗 → 警告ログ
    const err = await updateRes.text();
    console.error('[ship] Stripe metadata update failed:', err);
    return NextResponse.json({
      ok: true,
      emailSent: true,
      metadataUpdated: false,
      warning: 'Email sent, but Stripe metadata update failed. Manual cleanup may be needed.',
      trackingNumber,
      customerEmail,
      shippedAt,
    });
  }

  return NextResponse.json({
    ok: true,
    emailSent: true,
    metadataUpdated: true,
    trackingNumber,
    customerEmail,
    customerName,
    shippedAt,
  });
}
