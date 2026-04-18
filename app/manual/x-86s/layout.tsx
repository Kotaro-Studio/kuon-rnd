import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'X-86S セットアップガイド — Mini-XLR プロフェッショナルマイク取扱説明書 | X-86S Pro Setup Guide — Kuon R&D',
  description:
    'X-86Sプロフェッショナルステレオマイクロフォンの取扱説明書。Mini-XLR端子のファンタム電源変換アダプター（AKG MPA VL / CLASSIC PRO CEMPW100）選定ガイド、無指向性AB方式ステレオ録音セッティング、逆相（Reverse Phase）技術情報、推奨アクセサリー、応用テクニック。無指向性マイクのおすすめプロ構成。Pro setup guide for the X-86S: Mini-XLR phantom power adapters, AB stereo recording, phase characteristics, recommended accessories.',
  keywords: [
    // Japanese — primary
    'X-86S 取扱説明書',
    'X-86S セットアップ',
    'X-86S マニュアル',
    'Mini-XLR マイク ファンタム電源',
    'ミニXLR 変換アダプター おすすめ',
    'AKG MPA VL レビュー',
    '無指向性マイク おすすめ',
    '無指向性マイク プロ おすすめ',
    'AB方式 ステレオ録音 プロ',
    'ステレオマイク プロ セッティング',
    'プロ用ラベリアマイク おすすめ',
    'フィールド録音 プロ マイク',
    'ステレオペア マイク おすすめ',
    '空音開発 X-86S',
    'クラフトマイク プロ仕様',
    'マイク 逆相 位相 修正',
    'ファンタム電源 変換 アダプター',
    'オーケストラ録音 マイク おすすめ',
    // English
    'X-86S setup guide',
    'X-86S manual',
    'Mini-XLR phantom power adapter',
    'best omnidirectional microphone',
    'omnidirectional microphone recommended',
    'professional stereo microphone setup',
    'AB stereo recording professional',
    'AKG MPA VL review',
    'best microphone for orchestra recording',
    'field recording professional microphone',
    'stereo pair microphone recommended',
    'lavalier microphone professional',
    'reverse phase microphone fix',
    // Spanish
    'X-86S guía de configuración',
    'mejor micrófono omnidireccional',
    'micrófono omnidireccional recomendado',
    'grabación estéreo AB profesional',
    'adaptador alimentación fantasma Mini-XLR',
    'micrófono profesional grabación orquesta',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/manual/x-86s',
  },
  openGraph: {
    title: 'X-86S Pro セットアップガイド | 空音開発 Kuon R&D',
    description:
      'X-86Sプロフェッショナルマイクの取扱説明書。Mini-XLRファンタム電源アダプター選定、AB方式セッティング、逆相情報、推奨アクセサリーを詳しく解説。',
    url: 'https://kuon-rnd.com/manual/x-86s',
    siteName: '空音開発 Kuon R&D',
    type: 'article',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'X-86S Pro Setup Guide — Mini-XLR Professional Microphone | Kuon R&D',
    description:
      'Complete setup guide for the X-86S professional stereo microphone. Phantom power adapters, AB method, phase info, recommended gear.',
  },
  robots: { index: true, follow: true },
};

export default function ManualX86SLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
