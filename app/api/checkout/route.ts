// Stripe Checkout Session 作成 API
// Cloudflare Pages の環境変数に以下を設定してください:
//   STRIPE_SECRET_KEY=rk_live_xxxxx   （Restricted Key 推奨）
// baseUrl はリクエストから自動検出するので NEXT_PUBLIC_BASE_URL は不要。

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

const PRICE_IDS: Record<string, string> = {
  'p-86s': 'price_1SuT6IGbZ5gwwaLkc7rjciqU',
  'x-86s': 'price_1SuTKHGbZ5gwwaLkR6ew580Z',
};

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const body = await request.json() as { product?: string };
  const priceId = body.product ? PRICE_IDS[body.product] : null;
  if (!priceId) {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
  }

  // リクエスト元のオリジンを自動検出（localhost / preview / 本番どこでも動く）
  const baseUrl = new URL(request.url).origin;

  const params = new URLSearchParams({
    mode: 'payment',
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    success_url: `${baseUrl}/shop/thanks?product=${body.product}`,
    cancel_url:  `${baseUrl}/microphone`,
    'payment_method_types[0]': 'card',
    'metadata[product]': body.product ?? 'p-86s',
    // 配送先住所収集 (現状は日本のみ。Step 3 で国際展開時に拡張)
    'shipping_address_collection[allowed_countries][0]': 'JP',
    // 請求先住所も完全収集
    'billing_address_collection': 'required',
    // 電話番号収集 (ヤマト集荷依頼に必須)
    'phone_number_collection[enabled]': 'true',
  });

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await res.json() as { url?: string; error?: { message: string } };

  if (!res.ok || !data.url) {
    return NextResponse.json({ error: data.error?.message ?? 'Checkout creation failed' }, { status: 500 });
  }

  return NextResponse.json({ url: data.url });
}
