import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "オーナーズ・ギャラリー — P-86S / X-86S 録音作品集",
  description:
    'P-86S / X-86S ステレオマイクロフォンのオーナーが録音した作品をご紹介。ハンドメイドマイクの実際の録音クオリティをお聴きください。',
  alternates: {
    canonical: 'https://kuon-rnd.com/gallery',
  },
  openGraph: {
    title: "オーナーズ・ギャラリー — 録音作品集",
    description: 'P-86S / X-86S オーナーの録音作品集。ハンドメイドマイクの実力をお聴きください。',
    url: 'https://kuon-rnd.com/gallery',
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
