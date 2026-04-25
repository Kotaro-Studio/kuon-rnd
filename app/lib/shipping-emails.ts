// 発送通知メール テンプレート
// 用途: マイク発送後に顧客に追跡番号を伝える
// 現状は日本国内のみ販売 (CLAUDE.md §41.4-bis 参照) のため日本語版のみ提供
// 国際発送対応時に英語版を追加予定

export interface ShippingEmailParams {
  customerEmail: string;
  customerName: string;
  productShort: string; // 'P-86S' | 'X-86S'
  trackingNumber: string; // 12 桁数字 (ハイフンなし)
}

const YAMATO_TRACKING_URL_BASE = 'https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?init=yes&number01=';

/**
 * ヤマト追跡番号を 4-4-4 でハイフン区切り表示用に整形
 * 例: "123456789012" → "1234-5678-9012"
 */
export function formatTrackingNumber(num: string): string {
  const digits = num.replace(/[^\d]/g, '');
  if (digits.length !== 12) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
}

/**
 * 追跡番号バリデーション (12 桁数字必須)
 */
export function validateTrackingNumber(input: string): { valid: boolean; normalized: string } {
  const digits = input.replace(/[^\d]/g, '');
  return { valid: /^\d{12}$/.test(digits), normalized: digits };
}

export function buildShippingEmailJa(params: ShippingEmailParams) {
  const { customerEmail, customerName, productShort, trackingNumber } = params;
  const formattedTracking = formatTrackingNumber(trackingNumber);
  const trackingUrl = `${YAMATO_TRACKING_URL_BASE}${trackingNumber}`;

  return {
    from: '空音開発 Kuon R&D <noreply@kotaroasahina.com>',
    to: customerEmail,
    subject: `【空音開発】${productShort} 発送完了のお知らせ`,
    reply_to: '369@kotaroasahina.com',
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 22px; color: #0c4a6e; margin-bottom: 16px;">
          ${productShort} を発送いたしました
        </h1>

        <p style="color: #475569; font-size: 15px; line-height: 1.8;">
          ${customerName} 様<br><br>
          このたびは空音開発の ${productShort} をお買い上げいただき、誠にありがとうございます。<br>
          本日、商品を発送いたしましたのでお知らせいたします。
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

        <h2 style="font-size: 16px; color: #0c4a6e; margin-bottom: 8px;">
          配送情報
        </h2>

        <table style="width: 100%; font-size: 14px; color: #0f172a; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 12px 8px 0; color: #64748b; width: 100px;">配送業者</td>
            <td>ヤマト運輸</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px 8px 0; color: #64748b;">お届け予定</td>
            <td>2〜4 営業日以内</td>
          </tr>
        </table>

        <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <div style="color: rgba(255,255,255,0.85); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">
            お問い合わせ伝票番号
          </div>
          <div style="color: #fff; font-size: 28px; font-weight: 700; letter-spacing: 4px; font-family: 'SF Mono', 'Consolas', monospace;">
            ${formattedTracking}
          </div>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${trackingUrl}"
             style="display: inline-block; background: #16a34a; color: #fff; padding: 14px 36px; border-radius: 50px; text-decoration: none; font-size: 15px; font-weight: 600;">
            配送状況を確認する
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <p style="color: #475569; font-size: 13px; line-height: 1.7; margin: 0;">
            <strong>お受け取り時のご注意</strong><br>
            ・ご不在の場合、ヤマト運輸の不在票が投函されます<br>
            ・配達日時の変更はヤマト運輸の追跡ページから可能です<br>
            ・到着後、商品に万一の不具合がございましたら 3 日以内にご連絡ください
          </p>
        </div>

        <p style="color: #475569; font-size: 14px; line-height: 1.8;">
          ${productShort} で素晴らしい録音体験を楽しんでいただけますように。<br>
          ご録音いただいた音源を「オーナーズ・ギャラリー」にぜひお送りください。
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">

        <p style="color: #94a3b8; font-size: 12px; line-height: 1.7; text-align: center;">
          空音開発 / Kuon R&D<br>
          <a href="https://kuon-rnd.com" style="color: #0284c7;">kuon-rnd.com</a><br>
          ご不明な点がございましたら <a href="mailto:369@kotaroasahina.com" style="color: #0284c7;">369@kotaroasahina.com</a> まで
        </p>
      </div>
    `,
  };
}
