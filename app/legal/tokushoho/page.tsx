'use client';

import Link from 'next/link';
import React from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type TokushohContent = {
  title: string;
  items: Array<{
    label: string;
    value: React.ReactNode;
  }>;
  footer: string;
};

const content: Partial<Record<Lang, TokushohContent>> & { en: TokushohContent } = {
  ja: {
    title: '特定商取引法に基づく表記',
    items: [
      {
        label: '販売業者名',
        value: '屋号 Kuon R&D（決済表記：KUON-RND.COM）',
      },
      {
        label: '運営統括責任者',
        value: '朝比奈 幸太郎（本名：服部 洸太郎）',
      },
      {
        label: '所在地',
        value: '〒080-2476 北海道帯広市自由が丘5丁目16番地35',
      },
      {
        label: 'メールアドレス',
        value: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a>,
      },
      {
        label: '販売商品',
        value: 'P-86S ステレオマイクロフォン、X-86S プロフェッショナルステレオマイクロフォン、Kuon メンバーシップ（PRELUDE / CONCERTO / SYMPHONY / OPUS）、オーディオ処理・音楽学習ツール',
      },
      {
        label: '販売価格',
        value: 'P-86S: ¥16,900（税込）、X-86S: ¥39,600（税込）。Kuon メンバーシップは月額 ¥780〜¥5,980（税込）、年額プランあり。その他の価格は各商品ページをご参照ください。',
      },
      {
        label: 'お支払い方法',
        value: 'クレジットカード、Apple Pay、Google Pay（Stripe 決済）',
      },
      {
        label: 'お支払い時期',
        value: '単発購入：決済確認時に処理されます。サブスクリプション：契約時にお支払いが発生し、契約期間ごと（毎月または毎年）に自動更新されます。',
      },
      {
        label: '配送方法',
        value: 'ハードウェア商品：日本国内郵便（レターパック等）、国際郵便（EMS / 国際小包）。デジタル商品・サブスクリプション：オンライン即時提供（Web ブラウザ）。',
      },
      {
        label: '配送に要する日数',
        value: 'ハードウェア：決済確認後 1〜3 営業日以内に発送（受注生産品は製作完了後に発送）。デジタル商品：決済確認後即時利用可能。',
      },
      {
        label: '返品・交換について',
        value: 'ハードウェア商品：初期不良のみ 3 日以内にご連絡いただければ良品交換または返金で対応いたします。顧客過失による破損・不具合は返品対象外です。デジタル商品・サブスクリプション：その性質上、返品・返金はお受けできません。',
      },
      {
        label: '購入制限',
        value: 'マイクロフォン：お一人様 3 点まで（ハンドメイド製造のため）。サブスクリプション：制限なし。',
      },
      {
        label: '特定商品の引き渡し時期',
        value: 'ハードウェア：決済確認後、発送日は個別にご案内いたします。サブスクリプション：決済確認直後にアカウントへ機能が解放されます。',
      },
      {
        label: '不良品・障害への対応',
        value: 'ハードウェア不良品到着の場合は 5 日以内に 369@kotaroasahina.com までご連絡ください。交換または返金で対応いたします。サブスクリプションサービスに障害が生じた場合は同アドレスまでご連絡ください。',
      },
      {
        label: 'キャンセル・解約',
        value: 'ハードウェア：ご注文後のキャンセルはお受けできません（重大な問題がある場合はご相談ください）。サブスクリプション：マイページからいつでも解約手続きが可能です。解約後も次回更新日までサービスをご利用いただけます。日割り返金は行いません。',
      },
      {
        label: 'プライバシーポリシー',
        value: <Link href="/legal/privacy" style={{ color: '#0066cc' }}>こちらをご参照ください</Link>,
      },
      {
        label: '利用規約',
        value: <Link href="/legal/terms" style={{ color: '#0066cc' }}>こちらをご参照ください</Link>,
      },
    ],
    footer: 'このページは特定商取引法第11条に基づく表記です。',
  },
  en: {
    title: 'Specified Commercial Transaction Act Disclosure',
    items: [
      {
        label: 'Business Name',
        value: 'Kuon R&D (Payment Description: KUON-RND.COM)',
      },
      {
        label: 'Representative',
        value: 'Kotaro Asahina',
      },
      {
        label: 'Address',
        value: '5-16-35 Jiyugaoka, Obihiro, Hokkaido 080-2476, Japan',
      },
      {
        label: 'Email',
        value: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a>,
      },
      {
        label: 'Products Sold',
        value: 'P-86S Stereo Microphone, X-86S Professional Stereo Microphone, Kuon Membership (PRELUDE / CONCERTO / SYMPHONY / OPUS), Audio Processing & Music Learning Tools',
      },
      {
        label: 'Sales Price',
        value: 'P-86S: ¥16,900 (tax included), X-86S: ¥39,600 (tax included). Kuon Membership: ¥780–¥5,980 per month (tax included), annual plans available. See each product page for other prices.',
      },
      {
        label: 'Payment Methods',
        value: 'Credit Card, Apple Pay, Google Pay (via Stripe)',
      },
      {
        label: 'Payment Timing',
        value: 'One-time purchase: charged upon confirmation. Subscription: charged at signup and auto-renewed each billing cycle (monthly or annually).',
      },
      {
        label: 'Shipping Method',
        value: 'Hardware: Japan Post (Letter Pack, etc.) and international mail (EMS / international parcel). Digital products & subscriptions: instant online delivery via web browser.',
      },
      {
        label: 'Delivery Time',
        value: 'Hardware: shipped within 1–3 business days after payment confirmation (handmade items shipped after production). Digital products: available immediately upon payment confirmation.',
      },
      {
        label: 'Returns & Exchanges',
        value: 'Hardware: returns accepted for defects only, if reported within 3 days of receipt (replacement or refund). Damage due to customer negligence is not eligible. Digital products & subscriptions: due to their nature, returns and refunds are not accepted.',
      },
      {
        label: 'Purchase Limit',
        value: 'Microphones: maximum 3 items per customer (due to handmade manufacturing). Subscriptions: no limit.',
      },
      {
        label: 'Delivery Date',
        value: 'Hardware: delivery date will be notified individually after payment confirmation. Subscriptions: features are unlocked on the account immediately upon payment confirmation.',
      },
      {
        label: 'Defective Product / Service Issues',
        value: 'For defective hardware, please contact 369@kotaroasahina.com within 5 days of receipt. We will respond with replacement or refund. For subscription service issues, please contact the same address.',
      },
      {
        label: 'Cancellation & Termination',
        value: 'Hardware: orders cannot be cancelled after placement (please contact us for exceptional circumstances). Subscriptions: cancel anytime from your account page. Service remains available until the next renewal date. Pro-rated refunds are not provided.',
      },
      {
        label: 'Privacy Policy',
        value: <Link href="/legal/privacy" style={{ color: '#0066cc' }}>See here</Link>,
      },
      {
        label: 'Terms of Service',
        value: <Link href="/legal/terms" style={{ color: '#0066cc' }}>See here</Link>,
      },
    ],
    footer: 'This page is disclosed pursuant to Article 11 of the Specified Commercial Transaction Act (Japan).',
  },
  ko: {
    title: '특정 상거래법에 기반한 표기',
    items: [
      {
        label: '판매 사업자명',
        value: 'Kuon R&D (결제 표기: KUON-RND.COM)',
      },
      {
        label: '대표자',
        value: '아사히나 고타로 (본명: 하토리 고타로)',
      },
      {
        label: '소재지',
        value: '〒080-2476 북해도 오비히로시 지유가오카 5초메 16반지 35',
      },
      {
        label: '이메일',
        value: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a>,
      },
      {
        label: '판매 상품',
        value: 'P-86S 스테레오 마이크로폰, X-86S 프로페셔널 스테레오 마이크로폰, Kuon 멤버십 (PRELUDE / CONCERTO / SYMPHONY / OPUS), 오디오 처리 및 음악 학습 도구',
      },
      {
        label: '판매 가격',
        value: 'P-86S: ¥16,900 (세금 포함), X-86S: ¥39,600 (세금 포함). Kuon 멤버십: 월 ¥780–¥5,980 (세금 포함), 연간 요금제 제공. 기타 가격은 각 상품 페이지를 참조하세요.',
      },
      {
        label: '결제 방법',
        value: '신용카드, Apple Pay, Google Pay (Stripe 결제)',
      },
      {
        label: '결제 시기',
        value: '단발 구매: 결제 확인 시 처리됩니다. 구독: 가입 시 결제되며 결제 주기마다 (월간 또는 연간) 자동 갱신됩니다.',
      },
      {
        label: '배송 방법',
        value: '하드웨어: 일본 우편 (레터팩 등), 국제 우편 (EMS / 국제 소포). 디지털 상품 및 구독: 웹 브라우저를 통해 즉시 온라인 제공.',
      },
      {
        label: '배송 소요 시간',
        value: '하드웨어: 결제 확인 후 1-3 영업일 이내 발송 (수제 상품은 제작 완료 후 발송). 디지털 상품: 결제 확인 후 즉시 이용 가능.',
      },
      {
        label: '반품 및 교환',
        value: '하드웨어: 결함만 수령 후 3일 이내 신고 시 교환 또는 환불 대응. 고객 과실로 인한 손상은 반품 대상이 아닙니다. 디지털 상품 및 구독: 그 성격상 반품 및 환불을 받지 않습니다.',
      },
      {
        label: '구매 제한',
        value: '마이크로폰: 수제 생산으로 인해 고객당 최대 3개까지. 구독: 제한 없음.',
      },
      {
        label: '배송 날짜',
        value: '하드웨어: 배송 날짜는 결제 확인 후 개별적으로 안내됩니다. 구독: 결제 확인 직후 계정에 기능이 활성화됩니다.',
      },
      {
        label: '불량품 / 서비스 장애 대응',
        value: '하드웨어 불량품 수령 시 5일 이내에 369@kotaroasahina.com으로 연락하세요. 교환 또는 환불로 대응합니다. 구독 서비스 장애 시에도 동일한 주소로 문의하세요.',
      },
      {
        label: '취소 및 해지',
        value: '하드웨어: 주문 후 취소는 받지 않습니다 (특별한 경우 문의 바랍니다). 구독: 마이페이지에서 언제든지 해지할 수 있으며 다음 갱신일까지 서비스를 이용할 수 있습니다. 일할 환불은 제공되지 않습니다.',
      },
      {
        label: '개인정보보호정책',
        value: <Link href="/legal/privacy" style={{ color: '#0066cc' }}>여기를 참조하세요</Link>,
      },
      {
        label: '이용약관',
        value: <Link href="/legal/terms" style={{ color: '#0066cc' }}>여기를 참조하세요</Link>,
      },
    ],
    footer: '본 페이지는 일본 특정 상거래법 제11조에 따라 표기됩니다.',
  },
  pt: {
    title: 'Specified Commercial Transaction Act Disclosure',
    items: [
      {
        label: 'Business Name',
        value: 'Kuon R&D (Payment Description: KUON-RND.COM)',
      },
      {
        label: 'Representative',
        value: 'Kotaro Asahina',
      },
      {
        label: 'Address',
        value: '5-16-35 Jiyugaoka, Obihiro, Hokkaido 080-2476, Japan',
      },
      {
        label: 'Email',
        value: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a>,
      },
      {
        label: 'Products Sold',
        value: 'P-86S Stereo Microphone, X-86S Professional Stereo Microphone, Kuon Membership (PRELUDE / CONCERTO / SYMPHONY / OPUS), Audio Processing & Music Learning Tools',
      },
      {
        label: 'Sales Price',
        value: 'P-86S: ¥16,900 (tax included), X-86S: ¥39,600 (tax included). Kuon Membership: ¥780–¥5,980 per month (tax included), annual plans available. See each product page for other prices.',
      },
      {
        label: 'Payment Methods',
        value: 'Credit Card, Apple Pay, Google Pay (via Stripe)',
      },
      {
        label: 'Payment Timing',
        value: 'One-time purchase: charged upon confirmation. Subscription: charged at signup and auto-renewed each billing cycle (monthly or annually).',
      },
      {
        label: 'Shipping Method',
        value: 'Hardware: Japan Post (Letter Pack, etc.) and international mail (EMS / international parcel). Digital products & subscriptions: instant online delivery via web browser.',
      },
      {
        label: 'Delivery Time',
        value: 'Hardware: shipped within 1–3 business days after payment confirmation (handmade items shipped after production). Digital products: available immediately upon payment confirmation.',
      },
      {
        label: 'Returns & Exchanges',
        value: 'Hardware: returns accepted for defects only, if reported within 3 days of receipt (replacement or refund). Damage due to customer negligence is not eligible. Digital products & subscriptions: due to their nature, returns and refunds are not accepted.',
      },
      {
        label: 'Purchase Limit',
        value: 'Microphones: maximum 3 items per customer (due to handmade manufacturing). Subscriptions: no limit.',
      },
      {
        label: 'Delivery Date',
        value: 'Hardware: delivery date will be notified individually after payment confirmation. Subscriptions: features are unlocked on the account immediately upon payment confirmation.',
      },
      {
        label: 'Defective Product / Service Issues',
        value: 'For defective hardware, please contact 369@kotaroasahina.com within 5 days of receipt. We will respond with replacement or refund. For subscription service issues, please contact the same address.',
      },
      {
        label: 'Cancellation & Termination',
        value: 'Hardware: orders cannot be cancelled after placement (please contact us for exceptional circumstances). Subscriptions: cancel anytime from your account page. Service remains available until the next renewal date. Pro-rated refunds are not provided.',
      },
      {
        label: 'Privacy Policy',
        value: <Link href="/legal/privacy" style={{ color: '#0066cc' }}>See here</Link>,
      },
      {
        label: 'Terms of Service',
        value: <Link href="/legal/terms" style={{ color: '#0066cc' }}>See here</Link>,
      },
    ],
    footer: 'This page is disclosed pursuant to Article 11 of the Specified Commercial Transaction Act (Japan).',
  },
  es: {
    title: 'Specified Commercial Transaction Act Disclosure',
    items: [
      {
        label: 'Business Name',
        value: 'Kuon R&D (Payment Description: KUON-RND.COM)',
      },
      {
        label: 'Representative',
        value: 'Kotaro Asahina',
      },
      {
        label: 'Address',
        value: '5-16-35 Jiyugaoka, Obihiro, Hokkaido 080-2476, Japan',
      },
      {
        label: 'Email',
        value: <a href="mailto:369@kotaroasahina.com" style={{ color: '#0066cc' }}>369@kotaroasahina.com</a>,
      },
      {
        label: 'Products Sold',
        value: 'P-86S Stereo Microphone, X-86S Professional Stereo Microphone, Kuon Membership (PRELUDE / CONCERTO / SYMPHONY / OPUS), Audio Processing & Music Learning Tools',
      },
      {
        label: 'Sales Price',
        value: 'P-86S: ¥16,900 (tax included), X-86S: ¥39,600 (tax included). Kuon Membership: ¥780–¥5,980 per month (tax included), annual plans available. See each product page for other prices.',
      },
      {
        label: 'Payment Methods',
        value: 'Credit Card, Apple Pay, Google Pay (via Stripe)',
      },
      {
        label: 'Payment Timing',
        value: 'One-time purchase: charged upon confirmation. Subscription: charged at signup and auto-renewed each billing cycle (monthly or annually).',
      },
      {
        label: 'Shipping Method',
        value: 'Hardware: Japan Post (Letter Pack, etc.) and international mail (EMS / international parcel). Digital products & subscriptions: instant online delivery via web browser.',
      },
      {
        label: 'Delivery Time',
        value: 'Hardware: shipped within 1–3 business days after payment confirmation (handmade items shipped after production). Digital products: available immediately upon payment confirmation.',
      },
      {
        label: 'Returns & Exchanges',
        value: 'Hardware: returns accepted for defects only, if reported within 3 days of receipt (replacement or refund). Damage due to customer negligence is not eligible. Digital products & subscriptions: due to their nature, returns and refunds are not accepted.',
      },
      {
        label: 'Purchase Limit',
        value: 'Microphones: maximum 3 items per customer (due to handmade manufacturing). Subscriptions: no limit.',
      },
      {
        label: 'Delivery Date',
        value: 'Hardware: delivery date will be notified individually after payment confirmation. Subscriptions: features are unlocked on the account immediately upon payment confirmation.',
      },
      {
        label: 'Defective Product / Service Issues',
        value: 'For defective hardware, please contact 369@kotaroasahina.com within 5 days of receipt. We will respond with replacement or refund. For subscription service issues, please contact the same address.',
      },
      {
        label: 'Cancellation & Termination',
        value: 'Hardware: orders cannot be cancelled after placement (please contact us for exceptional circumstances). Subscriptions: cancel anytime from your account page. Service remains available until the next renewal date. Pro-rated refunds are not provided.',
      },
      {
        label: 'Privacy Policy',
        value: <Link href="/legal/privacy" style={{ color: '#0066cc' }}>See here</Link>,
      },
      {
        label: 'Terms of Service',
        value: <Link href="/legal/terms" style={{ color: '#0066cc' }}>See here</Link>,
      },
    ],
    footer: 'This page is disclosed pursuant to Article 11 of the Specified Commercial Transaction Act (Japan).',
  },
};

export default function TokushohPage() {
  const { lang } = useLang();
  const currentContent = content[lang] || content.en;

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        color: '#333',
        fontFamily:
          '"Helvetica Neue", Arial, sans-serif',
        padding: 'clamp(1.5rem, 5vw, 3rem)',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 2.5rem)',
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: '0.5rem',
              fontFamily:
                '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif',
            }}
          >
            {currentContent.title}
          </h1>
        </div>

        {/* Content Table */}
        <div
          style={{
            marginBottom: '3rem',
            borderCollapse: 'collapse',
            width: '100%',
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
          >
            <tbody>
              {currentContent.items.map((item, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: '1px solid #ddd',
                  }}
                >
                  <td
                    style={{
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      fontWeight: 600,
                      backgroundColor: '#f9f9f9',
                      minWidth: '150px',
                      verticalAlign: 'top',
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.label}
                  </td>
                  <td
                    style={{
                      padding: 'clamp(0.75rem, 2vw, 1rem)',
                      verticalAlign: 'top',
                      lineHeight: 1.6,
                    }}
                  >
                    {item.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: '0.9rem',
            color: '#666',
            lineHeight: 1.6,
            marginBottom: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #ddd',
          }}
        >
          <p>{currentContent.footer}</p>
        </div>

        {/* Back Link */}
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
          <Link href="/" style={{ color: '#0066cc', textDecoration: 'none' }}>
            ← {lang === 'ja' ? 'トップへ戻る' : 'Back to Top'}
          </Link>
        </div>
      </div>
    </main>
  );
}
