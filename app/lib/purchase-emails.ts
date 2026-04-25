// Email templates for microphone purchase Webhook flow.
// 共有モジュール — 以下から import:
//   - /api/webhook/route.ts (本番購入時の通知)
//   - /api/admin/test-purchase-email/route.ts (オーナー用テスト送信)

export interface SessionLike {
  id?: string;
  amount_total?: number;
  customer_details?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: {
      country?: string | null;
      postal_code?: string | null;
      state?: string | null;
      city?: string | null;
      line1?: string | null;
      line2?: string | null;
    } | null;
  } | null;
  shipping_details?: {
    name?: string | null;
    phone?: string | null;
    address?: {
      country?: string | null;
      postal_code?: string | null;
      state?: string | null;
      city?: string | null;
      line1?: string | null;
      line2?: string | null;
    } | null;
  } | null;
  customer_email?: string | null;
  metadata?: Record<string, string> | null;
  line_items?: { data?: { price?: { id?: string } }[] };
}

// ─────────────────────────────────────────────
// 商品判定
// ─────────────────────────────────────────────

const PRODUCT_KEY_NAMES: Record<string, string> = {
  'p-86s': 'P-86S ステレオマイクロフォン',
  'x-86s': 'X-86S プロフェッショナルステレオマイクロフォン',
};
const PRICE_ID_NAMES: Record<string, string> = {
  'price_1SuT6IGbZ5gwwaLkc7rjciqU': 'P-86S ステレオマイクロフォン',
  'price_1SuTKHGbZ5gwwaLkR6ew580Z': 'X-86S プロフェッショナルステレオマイクロフォン',
};
// JPY は小数点なし通貨: amount_total は 13900 (P-86S) / 39600 (X-86S)
const AMOUNT_NAMES: Record<number, string> = {
  13900: 'P-86S ステレオマイクロフォン',
  39600: 'X-86S プロフェッショナルステレオマイクロフォン',
};

export function detectProductName(session: SessionLike): string {
  const metaProduct = session.metadata?.product;
  if (metaProduct && PRODUCT_KEY_NAMES[metaProduct]) return PRODUCT_KEY_NAMES[metaProduct];
  const priceId = session.line_items?.data?.[0]?.price?.id;
  if (priceId && PRICE_ID_NAMES[priceId]) return PRICE_ID_NAMES[priceId];
  if (session.amount_total && AMOUNT_NAMES[session.amount_total]) {
    return AMOUNT_NAMES[session.amount_total];
  }
  return 'P-86S ステレオマイクロフォン';
}

export function detectProductShortName(session: SessionLike): string {
  const fullName = detectProductName(session);
  if (fullName.startsWith('P-86S')) return 'P-86S';
  if (fullName.startsWith('X-86S')) return 'X-86S';
  return 'P-86S';
}

// ─────────────────────────────────────────────
// 顧客向け購入完了メール (日本語)
// ─────────────────────────────────────────────

export function buildCustomerEmail(customerEmail: string, productName: string) {
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
          ${productName} で録音した自慢の音源を、空音開発のサイトで紹介しませんか？
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
// オーナー向け注文通知メール
// ─────────────────────────────────────────────

const OWNER_EMAIL = '369@kotaroasahina.com';

export function buildOwnerNotificationEmail(session: SessionLike) {
  const productName = detectProductName(session);
  const productShort = detectProductShortName(session);

  // 配送先 (shipping_details) を優先、なければ顧客請求先 (customer_details) を fallback
  const shipping = session.shipping_details ?? session.customer_details ?? {};
  const customer = session.customer_details ?? {};
  const address = shipping.address ?? customer.address ?? {};

  const name = shipping.name || customer.name || '(名前未設定)';
  const phone = shipping.phone || customer.phone || customer.email || '(電話番号未設定)';
  const email = customer.email || '(メール未設定)';

  const country = address.country || 'JP';
  const isInternational = country !== 'JP';

  // JST タイムスタンプ
  const orderDate = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

  // 金額表示
  const amount = session.amount_total
    ? `¥${session.amount_total.toLocaleString()}`
    : '(金額不明)';

  // Subject: 件名で識別性を最大化
  const region = isInternational ? country : (address.state || '住所確認要');
  const subject = isInternational
    ? `🌐 ${productShort} 国際発送 — ${name} / ${country}`
    : `🎙 ${productShort} 売れました — ${name} / ${region}`;

  // 住所表示 (フルフォーマット)
  const fullAddressHtml = isInternational
    ? [
        address.line1 || '',
        address.line2 || '',
        `${address.city || ''}, ${address.state || ''} ${address.postal_code || ''}`.trim(),
        country,
      ].filter(Boolean).join('<br>')
    : [
        `〒${address.postal_code || '???-????'}`,
        `${address.state || ''}${address.city || ''}${address.line1 || ''}`,
        address.line2 || '',
      ].filter((s) => s.trim()).join('<br>');

  // ヤマト用フォーマット (国内のみ)
  const phoneNoHyphens = phone.replace(/[^\d+]/g, '');
  const postalNoHyphens = (address.postal_code || '').replace(/[^\d]/g, '');
  const yamatoAddress = `${address.state || ''}${address.city || ''}${address.line1 || ''}${address.line2 ? ' ' + address.line2 : ''}`.trim();

  const yamatoBlock = isInternational
    ? `
      <div style="background: #e0f2fe; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h2 style="font-size: 14px; color: #075985; margin: 0 0 8px;">🌐 国際発送について</h2>
        <p style="font-size: 13px; color: #0f172a; margin: 0; line-height: 1.7;">
          EMS (Japan Post International) もしくは DHL での発送を推奨。<br>
          通関書類: 内容物「精密機械（マイクロフォン）/ Stereo microphone」<br>
          HS コード: 8518.10
        </p>
      </div>
    `
    : `
      <div style="background: #ecfdf5; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <h2 style="font-size: 14px; color: #065f46; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">ヤマト運輸 集荷依頼用 (ワンタッチコピー)</h2>
        <pre style="font-family: 'SF Mono', Consolas, monospace; font-size: 13px; color: #0f172a; margin: 0; white-space: pre-wrap; background: white; padding: 12px; border-radius: 6px; line-height: 1.6;">受取人氏名: ${name}
電話: ${phoneNoHyphens}
郵便番号: ${postalNoHyphens}
住所: ${yamatoAddress}
品名: 精密機械（マイクロフォン）</pre>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="https://id.kuronekoyamato.co.jp/auth/login"
           style="display: inline-block; background: #16a34a; color: white; padding: 14px 36px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 600;">
          ヤマト運輸ログインページを開く
        </a>
      </div>
    `;

  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 32px 20px; background: #f8fafc;">
      <div style="background: white; border-radius: 12px; padding: 32px;">
        <h1 style="font-size: 24px; color: #0c4a6e; margin: 0 0 8px;">
          ${isInternational ? '🌐' : '🎙'} ${productShort}が売れました!
        </h1>
        <p style="color: #475569; font-size: 14px; margin-bottom: 24px;">
          ${orderDate} JST
        </p>

        <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <h2 style="font-size: 14px; color: #475569; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">注文情報</h2>
          <table style="width: 100%; font-size: 14px; color: #0f172a; border-collapse: collapse;">
            <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">商品</td><td>${productName}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">金額</td><td>${amount}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">Session ID</td><td style="font-family: monospace; font-size: 11px; color: #475569;">${session.id || '不明'}</td></tr>
          </table>
        </div>

        <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <h2 style="font-size: 14px; color: #475569; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">顧客情報</h2>
          <table style="width: 100%; font-size: 14px; color: #0f172a; border-collapse: collapse;">
            <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">氏名</td><td>${name}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">電話</td><td>${phone}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0; color: #64748b;">メール</td><td><a href="mailto:${email}" style="color: #0284c7;">${email}</a></td></tr>
          </table>
        </div>

        <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
          <h2 style="font-size: 14px; color: #92400e; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">${isInternational ? 'Shipping Address (International)' : '配送先住所'}</h2>
          <div style="font-size: 14px; color: #0f172a; line-height: 1.8;">
            ${fullAddressHtml}
          </div>
        </div>

        ${yamatoBlock}
      </div>
    </div>
  `;

  // プレーンテキスト版
  const plainAddress = isInternational
    ? `${address.line1 || ''}\n${address.line2 || ''}\n${address.city || ''}, ${address.state || ''} ${address.postal_code || ''}\n${country}`.trim()
    : `〒${address.postal_code || '???-????'}\n${address.state || ''}${address.city || ''}${address.line1 || ''}\n${address.line2 || ''}`.trim();

  const text = `${isInternational ? '🌐' : '🎙'} ${productShort}が売れました! (${orderDate} JST)

【注文】
- 商品: ${productName}
- 金額: ${amount}
- Session ID: ${session.id || '不明'}

【顧客】
- 氏名: ${name}
- 電話: ${phone}
- メール: ${email}

【配送先】
${plainAddress}

${isInternational ? `🌐 国際発送 — EMS/DHL 推奨
通関書類: 精密機械（マイクロフォン）, HS 8518.10` : `【ヤマト運輸 集荷依頼用】
受取人氏名: ${name}
電話: ${phoneNoHyphens}
郵便番号: ${postalNoHyphens}
住所: ${yamatoAddress}
品名: 精密機械（マイクロフォン）

ヤマト運輸ログイン: https://id.kuronekoyamato.co.jp/auth/login`}
`;

  return {
    from: `空音開発 Order Bot <noreply@kotaroasahina.com>`,
    to: OWNER_EMAIL,
    subject,
    html,
    text,
  };
}

// ─────────────────────────────────────────────
// Resend 送信ヘルパー
// ─────────────────────────────────────────────

export async function sendViaResend(
  apiKey: string,
  email: { from: string; to: string; subject: string; html: string; text?: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(email),
    });
    if (!res.ok) {
      const err = await res.text();
      return { ok: false, error: err };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'unknown' };
  }
}
