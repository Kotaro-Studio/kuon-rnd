import type { Metadata } from 'next';

const TITLE_JA = 'KUON THEORY TUTOR — 音楽理論を 24 時間質問できる AI 家庭教師 | 空音開発';
const DESC_JA =
  'ナポリの六、対位法、シェンカー分析 ── 音大教授に聞きたい音楽理論の質問が、いつでも返ってくる。空音開発が音楽家のために作った AI チューターは、必ず出典つきで答えます。教科書の正解と、Bach の選択と、あなたの代替案を並べて。深夜の自習でも、海外留学先でも。月 ¥780 から月 50 質問。';

const KEYWORDS_JA = [
  '音楽理論 AI', '楽典 AI チューター', '音楽 質問 AI', 'AI 家庭教師 音楽',
  '音大 自習 サポート', '音大生 アプリ', '楽典 解説', '和声 質問',
  '対位法 学習', 'シェンカー 分析', 'ナポリの六', 'カデンツ 種類',
  'モーダル ミクスチャ', 'OMT v2', 'Open Music Theory', '音楽理論 教科書',
  '音楽留学 サポート', 'コンセルバトワール 自習', '音楽 質問 即答',
  '音楽 RAG', '出典付き 音楽 AI', '音大 受験 サポート',
  '楽典 ドリル', '聴音 補助', '視唱 解説', 'ジャズ理論 質問',
  '対位法 第1種', '声部進行 解説', '声楽 楽典', 'ピアノ 楽典',
  'ヴァイオリン 楽典', '指揮 音楽理論', '作曲 サポート AI',
  'KUON THEORY TUTOR', 'KUON THEORY SUITE', '空音開発', '朝比奈幸太郎',
];

const TITLE_EN = 'KUON THEORY TUTOR — AI Music Theory Tutor 24/7 | KUON R&D';
const DESC_EN =
  'Neapolitan sixth, counterpoint, Schenkerian analysis — get answers to your music theory questions any time, with proper citations. Built for musicians by KUON R&D. Textbook orthodoxy, Bach\'s choice, and your alternatives — side by side. From ¥780/month, 50 questions.';

const KEYWORDS_EN = [
  'AI music theory tutor', 'music theory questions AI', 'music tutor chat',
  'conservatory study tool', 'music theory help', 'harmony question AI',
  'counterpoint learning', 'schenkerian analysis tool', 'OMT v2 RAG',
  'Open Music Theory tutor', 'music theory textbook AI', 'music study abroad',
  'masterclass companion', 'cadence types', 'modal mixture', 'Neapolitan sixth',
  'jazz theory tutor', 'voice leading explained', 'classical music theory chat',
  'KUON THEORY TUTOR', 'KUON R&D', 'kuon-rnd', 'Kotaro Asahina',
];

export const metadata: Metadata = {
  metadataBase: new URL('https://kuon-rnd.com'),
  title: TITLE_JA,
  description: DESC_JA,
  keywords: KEYWORDS_JA.concat(KEYWORDS_EN).join(', '),
  authors: [{ name: '朝比奈幸太郎 (Kotaro Asahina)', url: 'https://kuon-rnd.com/profile' }],
  creator: '朝比奈幸太郎 / KUON R&D',
  publisher: 'KUON R&D / 空音開発',
  applicationName: 'KUON Theory Tutor',
  alternates: {
    canonical: 'https://kuon-rnd.com/theory-tutor-lp',
    languages: {
      'ja': 'https://kuon-rnd.com/theory-tutor-lp',
      'en': 'https://kuon-rnd.com/theory-tutor-lp',
      'es': 'https://kuon-rnd.com/theory-tutor-lp',
      'ko': 'https://kuon-rnd.com/theory-tutor-lp',
      'pt': 'https://kuon-rnd.com/theory-tutor-lp',
      'de': 'https://kuon-rnd.com/theory-tutor-lp',
    },
  },
  openGraph: {
    title: TITLE_JA,
    description: DESC_JA,
    url: 'https://kuon-rnd.com/theory-tutor-lp',
    siteName: 'KUON R&D / 空音開発',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES', 'ko_KR', 'pt_BR', 'de_DE'],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE_EN,
    description: DESC_EN,
  },
  robots: {
    index: true, follow: true,
    googleBot: {
      index: true, follow: true,
      'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1,
    },
  },
  category: 'Music Education / AI Tutor',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
