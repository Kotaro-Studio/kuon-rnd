// オーナー専用 マイク注文一覧取得 API
//
// 用途: /admin/ship ページで未発送・発送済みのマイク購入を一覧表示するため
//
// 認証: ログイン済み + email === 369@kotaroasahina.com のみ
//
// レスポンス:
//   {
//     orders: [
//       {
//         id: string,                  // Stripe Session ID
//         createdAt: number,           // Unix timestamp
//         amount: number,              // JPY amount
//         product: 'p-86s' | 'x-86s',
//         productName: string,
//         customer: { name, email, phone },
//         shippingAddress: { country, postal_code, state, city, line1, line2 },
//         shipped: boolean,
//         trackingNumber: string | null,
//         shippedAt: string | null,
//       }
//     ]
//   }

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

const OWNER_EMAIL = '369@kotaroasahina.com';
const AUTH_WORKER = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

function getCookie(request: NextRequest, name: string): string | null {
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

interface StripeAddress {
  country?: string | null;
  postal_code?: string | null;
  state?: string | null;
  city?: string | null;
  line1?: string | null;
  line2?: string | null;
}

interface StripeSession {
  id: string;
  status: string;
  mode: string;
  created: number;
  amount_total: number | null;
  metadata?: Record<string, string>;
  customer_details?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: StripeAddress | null;
  } | null;
  shipping_details?: {
    name?: string | null;
    phone?: string | null;
    address?: StripeAddress | null;
  } | null;
}

interface StripeListResponse {
  data: StripeSession[];
  has_more: boolean;
}

const PRODUCT_KEY_FROM_AMOUNT: Record<number, string> = {
  13900: 'p-86s',
  39600: 'x-86s',
};
const PRODUCT_FULL_NAME: Record<string, string> = {
  'p-86s': 'P-86S ステレオマイクロフォン',
  'x-86s': 'X-86S プロフェッショナルステレオマイクロフォン',
};

export async function GET(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY not configured' }, { status: 500 });
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

  // ─── Stripe Checkout Session 一覧を取得 ───
  // 直近 100 件取得 → 30 日以内のマイク注文だけにフィルタ
  const params = new URLSearchParams();
  params.set('limit', '100');
  params.append('expand[]', 'data.customer_details');
  params.append('expand[]', 'data.shipping_details');

  const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions?${params}`, {
    headers: { Authorization: `Bearer ${stripeKey}` },
  });

  if (!stripeRes.ok) {
    const err = await stripeRes.text();
    return NextResponse.json({ error: 'Stripe API failed', detail: err }, { status: 500 });
  }

  const data = (await stripeRes.json()) as StripeListResponse;

  // ─── マイク注文だけを抽出 ───
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 3600;

  const orders = data.data
    .filter((s) => {
      if (s.status !== 'complete') return false;
      if (s.mode !== 'payment') return false;
      if (s.created < thirtyDaysAgo) return false;
      // マイク注文の判定: metadata.product または amount_total
      if (s.metadata?.product === 'p-86s' || s.metadata?.product === 'x-86s') return true;
      if (s.amount_total === 13900 || s.amount_total === 39600) return true;
      return false;
    })
    .map((s) => {
      const productKey =
        s.metadata?.product || (s.amount_total ? PRODUCT_KEY_FROM_AMOUNT[s.amount_total] : 'p-86s') || 'p-86s';
      const shipping = s.shipping_details ?? s.customer_details ?? {};
      const customer = s.customer_details ?? {};
      const address = shipping.address ?? customer.address ?? {};

      return {
        id: s.id,
        createdAt: s.created,
        amount: s.amount_total ?? 0,
        product: productKey,
        productName: PRODUCT_FULL_NAME[productKey] || productKey,
        customer: {
          name: shipping.name || customer.name || '',
          email: customer.email || '',
          phone: shipping.phone || customer.phone || '',
        },
        shippingAddress: {
          country: address.country || '',
          postal_code: address.postal_code || '',
          state: address.state || '',
          city: address.city || '',
          line1: address.line1 || '',
          line2: address.line2 || '',
        },
        shipped: s.metadata?.shipped === 'true',
        trackingNumber: s.metadata?.tracking || null,
        shippedAt: s.metadata?.shippedAt || null,
      };
    })
    .sort((a, b) => {
      // 未発送を上に、発送日が新しい順
      if (a.shipped !== b.shipped) return a.shipped ? 1 : -1;
      return b.createdAt - a.createdAt;
    });

  return NextResponse.json({ orders });
}
