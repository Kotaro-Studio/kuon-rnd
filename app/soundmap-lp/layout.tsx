import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    '地球の音マップ — 世界中のフィールド録音を地図で聴く無料サウンドマップ | Sounds of the Earth — Free World Sound Map',
  description:
    '世界中のフィールド録音スポットをインタラクティブな地図で探索・試聴。滝、海、鳥、森 — 地球が奏でる音楽に耳を傾けよう。GPS × Audio テクノロジー。完全無料・アカウント不要。Explore field recordings worldwide on an interactive map. Free, no install, no account.',
  keywords: [
    // Japanese — primary
    'フィールド録音 マップ',
    'フィールドレコーディング マップ 無料',
    '世界の音 地図',
    '環境音 マップ 無料',
    '自然音 地図 無料',
    'サウンドマップ 無料',
    'フィールドレコーディング スポット 地図',
    '自然の音 世界地図',
    '滝の音 録音',
    '海の音 録音 マップ',
    '鳥の声 録音 マップ',
    '音風景 地図',
    'サウンドスケープ マップ',
    'フィールド録音 共有',
    'ASMR 自然音 マップ',
    'フィールドレコーディング おすすめスポット',
    // English
    'field recording map',
    'field recording map free',
    'sound map world free',
    'sounds of the earth',
    'nature sounds map',
    'world sound map',
    'ambient sound map free',
    'field recording spots map',
    'world soundscape map',
    'nature recording locations',
    'environmental sounds map free',
    'listen to nature sounds map',
    'free sound map online',
    'soundscape map interactive',
    'field recording community',
    'nature sounds world map',
    // Spanish
    'mapa grabaciones campo gratis',
    'mapa sonidos mundo gratis',
    'sonidos naturaleza mapa',
    'mapa sonidos ambientales gratis',
    'grabaciones campo mundo mapa',
    'mapa paisajes sonoros gratis',
    'sonidos tierra mapa interactivo',
    'mapa sonidos naturaleza gratis',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/soundmap-lp',
    languages: {
      ja: 'https://kuon-rnd.com/soundmap-lp',
      en: 'https://kuon-rnd.com/soundmap-lp',
      es: 'https://kuon-rnd.com/soundmap-lp',
    },
  },
  openGraph: {
    title: 'Sounds of the Earth — 地球の音マップ | 空音開発 Kuon R&D',
    description:
      '世界中のフィールド録音を地図上で探索・試聴。GPS × Audio テクノロジーが実現する新しい音の体験。完全無料・アカウント不要。投稿してあなたの録音を世界と共有。',
    url: 'https://kuon-rnd.com/soundmap-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sounds of the Earth — Listen to Field Recordings on a World Map',
    description:
      'Explore field recordings from around the world on an interactive globe. Waterfalls, oceans, birds, forests — hear the Earth. GPS × Audio technology. Free, no account needed.',
  },
  robots: { index: true, follow: true },
  other: { google: 'notranslate' },
};

export default function SoundMapLpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
