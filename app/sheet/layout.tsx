import type { Metadata } from 'next';

const TITLE_JA = 'KUON SHEET — ブラウザで動くリードシートエディタ + 画像スキャン | 空音開発';
const DESC_JA =
  'シンガーソングライター・ジャズ奏者・ポップス作曲家のためのブラウザ完結リードシートエディタ。メロディ + コードネーム + 歌詞を 1 画面で編集。手書きの楽譜も画像スキャンで自動 ABC 化。日本語・英語・スペイン語・ドイツ語の歌詞対応。PDF・MIDI ダウンロード。エディタは無料、画像スキャンは Concerto プラン以上。';

export const metadata: Metadata = {
  metadataBase: new URL('https://kuon-rnd.com'),
  title: TITLE_JA,
  description: DESC_JA,
  alternates: { canonical: 'https://kuon-rnd.com/sheet' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
