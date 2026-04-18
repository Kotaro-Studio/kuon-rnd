// International Checkout — 海外向け Stripe Checkout Session
// 国内向け /api/checkout は一切変更しない。完全に独立した API Route。
//
// 海外専用の商品カタログ（USD / EUR / GBP）を使用。
// 言語に応じて通貨を自動選択:
//   en → USD,  es → EUR,  fallback → USD
//
// Cloudflare Pages 環境変数:
//   STRIPE_SECRET_KEY=rk_live_xxxxx（国内と同じキーを共用）

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

// ─── 海外専用 Price ID（国内の Price ID とは完全に別） ───

type Currency = 'usd' | 'eur' | 'gbp';

const INTL_PRICE_IDS: Record<string, Record<Currency, string>> = {
  'p-86s': {
    usd: 'price_1TNXqJGbZ5gwwaLkirNCJyCB',
    eur: 'price_1TNXsWGbZ5gwwaLk0q9EY6fu',
    gbp: 'price_1TNXtAGbZ5gwwaLkRt9V2LkA',
  },
  'x-86s': {
    usd: 'price_1TNXriGbZ5gwwaLkefc6SuAX',
    eur: 'price_1TNXv3GbZ5gwwaLkE1J9Exr8',
    gbp: 'price_1TNXvlGbZ5gwwaLkiK1q3eZO',
  },
};

// 言語 → 通貨マッピング
function langToCurrency(lang: string): Currency {
  if (lang === 'es') return 'eur';
  // en およびその他 → USD
  return 'usd';
}

// ─── 送料オプション（日本郵便 2026年4月 現行レート基準） ───

function buildShippingOptions(currency: Currency) {
  const rates: Record<Currency, { epacket: number; ems: number }> = {
    usd: { epacket: 15, ems: 25 },
    eur: { epacket: 14, ems: 23 },
    gbp: { epacket: 12, ems: 20 },
  };
  const r = rates[currency];
  // Stripe の fixed_amount は最小通貨単位（USD/EUR/GBP はセント）
  return [
    {
      display_name: 'International ePacket Light (7–14 business days)',
      amount: r.epacket * 100,
      min_days: 7,
      max_days: 14,
    },
    {
      display_name: 'EMS Express Mail Service (3–7 business days)',
      amount: r.ems * 100,
      min_days: 3,
      max_days: 7,
    },
  ];
}

// ─── 発送対象国（日本を除く主要国） ───

const ALLOWED_COUNTRIES = [
  'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'SE',
  'CH', 'AT', 'BE', 'DK', 'FI', 'NO', 'IE', 'PT', 'NZ', 'SG',
  'KR', 'TW', 'HK', 'TH', 'MY', 'PH', 'ID', 'MX', 'BR', 'CL',
  'CO', 'AR', 'PL', 'CZ', 'IN',
];

export async function POST(request: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const body = (await request.json()) as { product?: string; lang?: string };
  const product = body.product;
  if (!product || !INTL_PRICE_IDS[product]) {
    return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
  }

  const lang = body.lang === 'es' ? 'es' : 'en';
  const currency = langToCurrency(lang);
  const priceId = INTL_PRICE_IDS[product][currency];
  const baseUrl = new URL(request.url).origin;
  const shippingOptions = buildShippingOptions(currency);

  // Stripe API を URLSearchParams で呼び出す（SDK 不要・Edge 互換）
  const params = new URLSearchParams();
  params.append('mode', 'payment');
  params.append('line_items[0][price]', priceId);
  params.append('line_items[0][quantity]', '1');
  params.append('success_url', `${baseUrl}/shop/thanks?product=${product}&intl=1`);
  params.append('cancel_url', `${baseUrl}/microphone`);
  params.append('payment_method_types[0]', 'card');
  params.append('locale', lang === 'es' ? 'es' : 'en');

  // 配送先住所の収集
  ALLOWED_COUNTRIES.forEach((code, i) => {
    params.append(`shipping_address_collection[allowed_countries][${i}]`, code);
  });

  // 送料オプション
  shippingOptions.forEach((opt, i) => {
    params.append(`shipping_options[${i}][shipping_rate_data][display_name]`, opt.display_name);
    params.append(`shipping_options[${i}][shipping_rate_data][type]`, 'fixed_amount');
    params.append(`shipping_options[${i}][shipping_rate_data][fixed_amount][amount]`, String(opt.amount));
    params.append(`shipping_options[${i}][shipping_rate_data][fixed_amount][currency]`, currency);
    params.append(`shipping_options[${i}][shipping_rate_data][delivery_estimate][minimum][unit]`, 'business_day');
    params.append(`shipping_options[${i}][shipping_rate_data][delivery_estimate][minimum][value]`, String(opt.min_days));
    params.append(`shipping_options[${i}][shipping_rate_data][delivery_estimate][maximum][unit]`, 'business_day');
    params.append(`shipping_options[${i}][shipping_rate_data][delivery_estimate][maximum][value]`, String(opt.max_days));
  });

  // メタデータ
  params.append('metadata[product]', product);
  params.append('metadata[order_type]', 'international');
  params.append('metadata[currency]', currency);

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${stripeKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = (await res.json()) as { url?: string; error?: { message: string } };

  if (!res.ok || !data.url) {
    return NextResponse.json(
      { error: data.error?.message ?? 'Checkout creation failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: data.url });
}
