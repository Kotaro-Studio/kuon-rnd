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
        value: '屋号 Curanz Sounds（決済表記：Kotaro Studio Mic）',
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
        value: <a href="mailto:432@kotarohattori.com" style={{ color: '#0066cc' }}>432@kotarohattori.com</a>,
      },
      {
        label: '販売商品',
        value: 'P-86S ステレオマイクロフォン、X-86S プロフェッショナルステレオマイクロフォン、オーディオプロセッシングツール',
      },
      {
        label: '販売価格',
        value: 'P-86S: ¥16,900（税込）、X-86S: ¥39,600（税込）。その他の価格は各ページをご参照ください。',
      },
      {
        label: 'お支払い方法',
        value: 'クレジットカード、Apple Pay、Google Pay（Stripe決済）',
      },
      {
        label: 'お支払い時期',
        value: '決済確認時に処理されます。',
      },
      {
        label: '配送方法',
        value: '日本国内郵便（レターパック等）、国際配送',
      },
      {
        label: '配送に要する日数',
        value: '決済確認後 1〜3 営業日以内（受注生産品は製作完了後に発送）',
      },
      {
        label: '返品・交換について',
        value: '初期不良のみ 3 日以内にご連絡いただければ、良品交換または返金で対応いたします。顧客過失による破損・不具合は返品対象外です。',
      },
      {
        label: '購入制限',
        value: 'お一人様 3 点までのご購入とさせていただきます（ハンドメイド製造のため）',
      },
      {
        label: '特定商品の引き渡し時期',
        value: '決済確認後、発送日は個別にご案内いたします。',
      },
      {
        label: '不良品への対応',
        value: '不良品到着の場合は、5日以内に 432@kotarohattori.com までご連絡ください。交換または返金で対応いたします。',
      },
      {
        label: 'キャンセル・解除',
        value: 'ご注文後のキャンセルはお受けできません。ただし重大な問題がある場合はご相談ください。',
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
        value: 'Curanz Sounds (Payment Description: Kotaro Studio Mic)',
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
        value: <a href="mailto:432@kotarohattori.com" style={{ color: '#0066cc' }}>432@kotarohattori.com</a>,
      },
      {
        label: 'Products Sold',
        value: 'P-86S Stereo Microphone, X-86S Professional Stereo Microphone, Audio Processing Tools',
      },
      {
        label: 'Sales Price',
        value: 'P-86S: ¥16,900 (tax included), X-86S: ¥39,600 (tax included). See each page for other prices.',
      },
      {
        label: 'Payment Methods',
        value: 'Credit Card, Apple Pay, Google Pay (via Stripe)',
      },
      {
        label: 'Payment Timing',
        value: 'Payment is processed upon confirmation.',
      },
      {
        label: 'Shipping Method',
        value: 'Japan Post (Letter Pack, etc.), International Shipping',
      },
      {
        label: 'Delivery Time',
        value: '1–3 business days after payment confirmation (Handmade items shipped after production completion)',
      },
      {
        label: 'Returns & Exchanges',
        value: 'We accept returns for defects only, if reported within 3 days of receipt. Replacement or refund will be provided. Damage due to customer negligence is not eligible for return.',
      },
      {
        label: 'Purchase Limit',
        value: 'Maximum 3 items per customer (due to handmade manufacturing)',
      },
      {
        label: 'Delivery Date',
        value: 'Delivery date will be notified individually after payment confirmation.',
      },
      {
        label: 'Defective Product Response',
        value: 'Please contact 432@kotarohattori.com within 5 days of receiving a defective product. We will respond with replacement or refund.',
      },
      {
        label: 'Cancellation & Termination',
        value: 'Orders cannot be cancelled after placement. Please contact us for exceptional circumstances.',
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
        value: 'Curanz Sounds (결제 표기: Kotaro Studio Mic)',
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
        value: <a href="mailto:432@kotarohattori.com" style={{ color: '#0066cc' }}>432@kotarohattori.com</a>,
      },
      {
        label: '판매 상품',
        value: 'P-86S 스테레오 마이크로폰, X-86S 프로페셔널 스테레오 마이크로폰, 오디오 처리 도구',
      },
      {
        label: '판매 가격',
        value: 'P-86S: ¥16,900 (세금 포함), X-86S: ¥39,600 (세금 포함). 기타 가격은 각 페이지를 참조하세요.',
      },
      {
        label: '결제 방법',
        value: '신용카드, Apple Pay, Google Pay (Stripe을 통한)',
      },
      {
        label: '결제 시기',
        value: '결제 확인 시 처리됩니다.',
      },
      {
        label: '배송 방법',
        value: '일본 우편 (레터팩 등), 국제 배송',
      },
      {
        label: '배송 소요 시간',
        value: '결제 확인 후 1-3 영업일 이내 (수제 상품은 제작 완료 후 발송)',
      },
      {
        label: '반품 및 교환',
        value: '결함만 수령 후 3일 이내에 신고할 경우 반품/교환을 받습니다. 교환 또는 환불로 대응합니다. 고객 과실로 인한 손상은 반품 대상이 아닙니다.',
      },
      {
        label: '구매 제한',
        value: '수제 생산으로 인해 고객당 최대 3개까지',
      },
      {
        label: '배송 날짜',
        value: '배송 날짜는 결제 확인 후 개별적으로 안내됩니다.',
      },
      {
        label: '불량품 대응',
        value: '불량품을 수령한 경우 5일 이내에 432@kotarohattori.com으로 연락하세요. 교환 또는 환불로 대응합니다.',
      },
      {
        label: '취소 및 해제',
        value: '주문 후 취소는 받지 않습니다. 특별한 경우는 문의하세요.',
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
        value: 'Curanz Sounds (Payment Description: Kotaro Studio Mic)',
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
        value: <a href="mailto:432@kotarohattori.com" style={{ color: '#0066cc' }}>432@kotarohattori.com</a>,
      },
      {
        label: 'Products Sold',
        value: 'P-86S Stereo Microphone, X-86S Professional Stereo Microphone, Audio Processing Tools',
      },
      {
        label: 'Sales Price',
        value: 'P-86S: ¥16,900 (tax included), X-86S: ¥39,600 (tax included). See each page for other prices.',
      },
      {
        label: 'Payment Methods',
        value: 'Credit Card, Apple Pay, Google Pay (via Stripe)',
      },
      {
        label: 'Payment Timing',
        value: 'Payment is processed upon confirmation.',
      },
      {
        label: 'Shipping Method',
        value: 'Japan Post (Letter Pack, etc.), International Shipping',
      },
      {
        label: 'Delivery Time',
        value: '1–3 business days after payment confirmation (Handmade items shipped after production completion)',
      },
      {
        label: 'Returns & Exchanges',
        value: 'We accept returns for defects only, if reported within 3 days of receipt. Replacement or refund will be provided. Damage due to customer negligence is not eligible for return.',
      },
      {
        label: 'Purchase Limit',
        value: 'Maximum 3 items per customer (due to handmade manufacturing)',
      },
      {
        label: 'Delivery Date',
        value: 'Delivery date will be notified individually after payment confirmation.',
      },
      {
        label: 'Defective Product Response',
        value: 'Please contact 432@kotarohattori.com within 5 days of receiving a defective product. We will respond with replacement or refund.',
      },
      {
        label: 'Cancellation & Termination',
        value: 'Orders cannot be cancelled after placement. Please contact us for exceptional circumstances.',
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
        value: 'Curanz Sounds (Payment Description: Kotaro Studio Mic)',
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
        value: <a href="mailto:432@kotarohattori.com" style={{ color: '#0066cc' }}>432@kotarohattori.com</a>,
      },
      {
        label: 'Products Sold',
        value: 'P-86S Stereo Microphone, X-86S Professional Stereo Microphone, Audio Processing Tools',
      },
      {
        label: 'Sales Price',
        value: 'P-86S: ¥16,900 (tax included), X-86S: ¥39,600 (tax included). See each page for other prices.',
      },
      {
        label: 'Payment Methods',
        value: 'Credit Card, Apple Pay, Google Pay (via Stripe)',
      },
      {
        label: 'Payment Timing',
        value: 'Payment is processed upon confirmation.',
      },
      {
        label: 'Shipping Method',
        value: 'Japan Post (Letter Pack, etc.), International Shipping',
      },
      {
        label: 'Delivery Time',
        value: '1–3 business days after payment confirmation (Handmade items shipped after production completion)',
      },
      {
        label: 'Returns & Exchanges',
        value: 'We accept returns for defects only, if reported within 3 days of receipt. Replacement or refund will be provided. Damage due to customer negligence is not eligible for return.',
      },
      {
        label: 'Purchase Limit',
        value: 'Maximum 3 items per customer (due to handmade manufacturing)',
      },
      {
        label: 'Delivery Date',
        value: 'Delivery date will be notified individually after payment confirmation.',
      },
      {
        label: 'Defective Product Response',
        value: 'Please contact 432@kotarohattori.com within 5 days of receiving a defective product. We will respond with replacement or refund.',
      },
      {
        label: 'Cancellation & Termination',
        value: 'Orders cannot be cancelled after placement. Please contact us for exceptional circumstances.',
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
