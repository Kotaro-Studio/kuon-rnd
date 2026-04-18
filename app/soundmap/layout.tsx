import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '地球の音マップ — 世界中のフィールド録音を地図で聴く | Sounds of the Earth',
  description:
    '世界中のフィールド録音スポットを地図上で探索・試聴。滝、海、鳥、森 — 地球のあらゆる音を、あなたの耳に。ブラウザだけで聴ける無料サウンドマップ。投稿して世界と共有しよう。Explore field recordings from around the world on an interactive map. Free, no install.',
  keywords: [
    // Japanese
    'フィールド録音 マップ',
    'フィールドレコーディング マップ',
    '世界の音 地図',
    '環境音 聴く',
    '自然音 地図',
    'サウンドマップ 無料',
    'フィールドレコーディング スポット',
    '自然の音 世界',
    '滝の音 録音',
    '海の音 録音',
    '鳥の声 録音 マップ',
    'ASMR 自然音 マップ',
    // English
    'field recording map',
    'sound map world',
    'sounds of the earth',
    'nature sounds map',
    'ambient sound map free',
    'field recording spots',
    'world soundscape map',
    'nature recording locations',
    'environmental sounds map',
    'listen to nature sounds map',
    'free sound map online',
    'waterfall sounds recording',
    'ocean sounds recording map',
    'bird sounds world map',
    // Spanish
    'mapa grabaciones campo',
    'mapa sonidos mundo',
    'sonidos naturaleza mapa',
    'mapa sonidos ambientales gratis',
    'grabaciones campo mundo',
    'mapa paisajes sonoros',
    'sonidos tierra mapa',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/soundmap',
    languages: {
      ja: 'https://kuon-rnd.com/soundmap',
      en: 'https://kuon-rnd.com/soundmap',
      es: 'https://kuon-rnd.com/soundmap',
    },
  },
  openGraph: {
    title: 'Sounds of the Earth — 地球の音マップ | 空音開発',
    description:
      '世界中のフィールド録音を地図上で探索・試聴。GPS × Audio — 空音開発が贈る新しい音の体験。投稿してあなたの録音を世界と共有しよう。',
    url: 'https://kuon-rnd.com/soundmap',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sounds of the Earth — Listen to Field Recordings on a World Map',
    description:
      'Explore field recordings from around the world on an interactive map. Waterfalls, oceans, birds, forests — hear the Earth. Free, no install. Share your own recordings.',
  },
  robots: { index: true, follow: true },
  other: { google: 'notranslate' },
};

export default function SoundMapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
