// オーナー専用 テスト送信エンドポイント
//
// 用途: マイク購入時に送信される「顧客メール」と「オーナー通知メール」を
//      実際の Stripe 決済を伴わずにテスト送信する。
//
// 認証: ログイン済み + email === 369@kotaroasahina.com のみ実行可能。
//
// 使い方:
//   ① ブラウザで kuon-rnd.com にログイン (オーナー アカウント)
//   ② ターミナルで:
//        curl -X POST https://kuon-rnd.com/api/admin/test-purchase-email \
//          -H "Cookie: kuon_token=$(cat /tmp/kuon_token)" \
//          -d '{}'
//   ③ または、ブラウザの開発者コンソールで:
//        await fetch('/api/admin/test-purchase-email', { method: 'POST' })
//
// パラメータ (任意):
//   ?type=customer   顧客メールのみ送信
//   ?type=owner      オーナー通知のみ送信
//   ?type=both       両方送信 (デフォルト)
//   ?country=US      国際発送を模擬 (オーナー通知のみ表示が変わる)

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import {
  buildCustomerEmail,
  buildOwnerNotificationEmail,
  sendViaResend,
  type SessionLike,
} from '@/app/lib/purchase-emails';

const OWNER_EMAIL = '369@kotaroasahina.com';
const AUTH_WORKER = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

function getCookie(request: NextRequest, name: string): string | null {
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 });
  }

  // ─── 認証: オーナー (369@kotaroasahina.com) のみ実行可能 ───
  const token = getCookie(request, 'kuon_token');
  if (!token) {
    return NextResponse.json(
      { error: 'Not logged in. Please log in as owner first at /auth/login.' },
      { status: 401 },
    );
  }

  const meRes = await fetch(`${AUTH_WORKER}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!meRes.ok) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  const me = (await meRes.json()) as { email?: string };
  if (me.email !== OWNER_EMAIL) {
    return NextResponse.json({ error: 'Owner only (admin endpoint)' }, { status: 403 });
  }

  // ─── パラメータ ───
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'both'; // 'customer' | 'owner' | 'both'
  const country = url.searchParams.get('country') || 'JP';

  // ─── テスト用 fake session データ ───
  const isInternational = country !== 'JP';
  const fakeSession: SessionLike = {
    id: 'cs_test_demo_' + Date.now(),
    amount_total: 13900,
    metadata: { product: 'p-86s' },
    customer_details: {
      name: isInternational ? 'John Smith' : '山田 太郎',
      email: OWNER_EMAIL, // テスト用にオーナー宛に送信
      phone: isInternational ? '+1-555-1234-5678' : '+81 90-1234-5678',
      address: isInternational
        ? {
            country: 'US',
            postal_code: '94102',
            state: 'CA',
            city: 'San Francisco',
            line1: '123 Main Street',
            line2: 'Apt 4B',
          }
        : {
            country: 'JP',
            postal_code: '060-0001',
            state: '北海道',
            city: '札幌市中央区',
            line1: '北1条西1丁目1-1',
            line2: 'テストビル 101号室',
          },
    },
    shipping_details: {
      name: isInternational ? 'John Smith' : '山田 太郎',
      phone: isInternational ? '+1-555-1234-5678' : '+81 90-1234-5678',
      address: isInternational
        ? {
            country: 'US',
            postal_code: '94102',
            state: 'CA',
            city: 'San Francisco',
            line1: '123 Main Street',
            line2: 'Apt 4B',
          }
        : {
            country: 'JP',
            postal_code: '060-0001',
            state: '北海道',
            city: '札幌市中央区',
            line1: '北1条西1丁目1-1',
            line2: 'テストビル 101号室',
          },
    },
  };

  const tasks: Promise<{ ok: boolean; error?: string; label: string }>[] = [];

  if (type === 'customer' || type === 'both') {
    // session の country で自動的に言語切替 (JP→日本語、それ以外→英語)
    const mail = buildCustomerEmail(OWNER_EMAIL, fakeSession);
    tasks.push(
      sendViaResend(resendApiKey, mail).then((r) => ({ ...r, label: 'customer' })),
    );
  }
  if (type === 'owner' || type === 'both') {
    const mail = buildOwnerNotificationEmail(fakeSession);
    tasks.push(
      sendViaResend(resendApiKey, mail).then((r) => ({ ...r, label: 'owner' })),
    );
  }

  const results = await Promise.all(tasks);

  return NextResponse.json({
    sent: results.map((r) => ({ label: r.label, ok: r.ok, error: r.error })),
    note: `Test emails sent to ${OWNER_EMAIL}. Country mode: ${isInternational ? 'International (' + country + ')' : 'Japan (JP)'}`,
  });
}
