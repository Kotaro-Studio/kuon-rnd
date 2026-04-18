import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    'P-86S スタートアップガイド — セッティング・AB方式録音マニュアル | P-86S Setup Guide — Kuon R&D',
  description:
    'P-86Sステレオマイクロフォンの取扱説明書。プラグインパワー接続手順、無指向性AB方式ステレオ録音のセッティング方法（推奨間隔30cm〜50cm）、推奨レコーダー・アクセサリー、バウンダリーマイキング・メガネマイクの応用テクニック、屋外録音の注意点を詳しく解説。Setup guide for the P-86S stereo microphone: plug-in power connection, omnidirectional AB stereo recording, recommended recorders & accessories, advanced techniques.',
  keywords: [
    // Japanese
    'P-86S 取扱説明書',
    'P-86S セッティング',
    'P-86S マニュアル',
    'AB方式 録音 マイク',
    'AB方式 ステレオ セッティング',
    '無指向性マイク ステレオ録音',
    'プラグインパワー マイク 使い方',
    'ステレオマイク セッティング方法',
    'マイク AB方式 間隔',
    'フィールド録音 マイク セッティング',
    'バウンダリーマイク やり方',
    'メガネマイク セッティング',
    '空音開発 マイク',
    'クラフトマイク 使い方',
    // English
    'P-86S setup guide',
    'P-86S manual',
    'AB stereo recording setup',
    'omnidirectional microphone stereo recording',
    'plug-in power microphone guide',
    'stereo mic spacing AB method',
    'field recording microphone setup',
    'boundary microphone technique',
    'lavalier stereo recording',
    // Spanish
    'P-86S guía de configuración',
    'grabación estéreo AB omnidireccional',
    'configuración micrófono estéreo',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/manual/p-86s',
  },
  openGraph: {
    title: 'P-86S スタートアップガイド | 空音開発 Kuon R&D',
    description:
      'P-86Sステレオマイクの取扱説明書。AB方式セッティング、推奨レコーダー、応用テクニックを詳しく解説。',
    url: 'https://kuon-rnd.com/manual/p-86s',
    siteName: '空音開発 Kuon R&D',
    type: 'article',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'P-86S Startup Guide — AB Stereo Recording Manual | Kuon R&D',
    description:
      'Complete setup guide for the P-86S stereo microphone. AB method, recommended gear, advanced techniques.',
  },
  robots: { index: true, follow: true },
};

export default function ManualP86SLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
