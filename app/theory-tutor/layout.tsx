import type { Metadata } from 'next';

const TITLE = 'KUON THEORY TUTOR — 音楽理論を 24 時間質問できる AI 家庭教師 | 空音開発';
const DESC =
  '音楽理論の質問が、いつでも、どこでも。OMT v2 と Kuon 楽典スイートを文脈に答え、必ず出典を提示する音楽家のための AI チューター。「ナポリの六」「カデンツの種類」「フリギア旋法の使用例」── 深夜の自習で先生がいない時も、すぐに答えが返ってきます。';

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: 'https://kuon-rnd.com/theory-tutor' },
  openGraph: {
    title: TITLE,
    description: DESC,
    url: 'https://kuon-rnd.com/theory-tutor',
    siteName: 'KUON R&D / 空音開発',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESC,
  },
  robots: {
    index: true, follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
