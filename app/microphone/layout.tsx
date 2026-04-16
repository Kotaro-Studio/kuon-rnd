import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'P-86S ステレオマイクロフォン — ハンドメイドステレオマイク ¥13,900',
  description:
    '音大生だった朝比奈幸太郎が自分のために作ったハンドメイドマイク。プラグインパワー対応、1本でABステレオ録音。数十万円の高級マイクと同等以上の録音クオリティを¥13,900で。アコースティック楽器専門。',
  keywords: [
    'ステレオマイク',
    'マイクロフォン',
    'ハンドメイドマイク',
    '録音マイク',
    'アコースティック録音',
    'AB録音',
    'プラグインパワーマイク',
    '音大生',
    'ピアノ録音',
    'バイオリン録音',
    'フルート録音',
    'stereo microphone',
    'handmade microphone',
    'acoustic recording',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/microphone',
  },
  openGraph: {
    title: 'P-86S ステレオマイクロフォン — ¥13,900',
    description:
      '音大生だった朝比奈幸太郎が自分のために作ったハンドメイドマイク。数十万円の高級マイクと同等以上のクオリティ。',
    url: 'https://kuon-rnd.com/microphone',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    images: [
      {
        url: 'https://kuon-rnd.com/mic01.jpeg',
        width: 1200,
        height: 630,
        alt: 'P-86S ステレオマイクロフォン — 空音開発',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'P-86S ステレオマイクロフォン — ¥13,900',
    description:
      '音大生が自分のために作ったハンドメイドマイク。数十万円クラスの録音クオリティを¥13,900で。',
    images: ['https://kuon-rnd.com/mic01.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function MicrophoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
