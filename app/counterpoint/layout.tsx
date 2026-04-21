import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON COUNTERPOINT — 対位法リアルタイムチェッカー | 種別対位法 1〜4類 | 空音開発',
  description:
    '種別対位法（Species Counterpoint）をリアルタイムでチェック。1類〜4類対応。並行完全協和音・隠伏5度・声部交差・不協和音処理・経過音・刺繍音・係留音を即座に検出。Fux/Jeppesen準拠。ブラウザ完結・完全無料。音大受験・対位法の授業に。',
  keywords: [
    '対位法チェッカー', '対位法 チェック', '種別対位法', 'species counterpoint',
    '対位法 1類', '対位法 2類', '対位法 3類', '対位法 4類',
    '第一種対位法', '第二種対位法', '第三種対位法', '第四種対位法',
    '定旋律', 'cantus firmus', 'カントゥス・フィルムス',
    '並行5度', '並行8度', '連続完全協和音', '隠伏5度',
    '不協和音処理', '経過音', '刺繍音', '係留音', '掛留音',
    '声部交差', '音程分析', '協和音', '不協和音',
    '完全協和音', '不完全協和音', '反行', '斜行', '並行',
    'Fux 対位法', 'Jeppesen 対位法', 'パレストリーナ様式',
    '音大受験 対位法', '対位法 練習', '対位法 オンライン',
    '対位法 授業', '対位法 課題', '対位法 宿題',
    'counterpoint checker', 'species counterpoint checker',
    'first species counterpoint', 'second species counterpoint',
    'third species counterpoint', 'fourth species counterpoint',
    'counterpoint rules checker', 'counterpoint homework',
    'parallel fifths counterpoint', 'parallel octaves counterpoint',
    'hidden fifths counterpoint', 'voice crossing counterpoint',
    'passing tone checker', 'neighbor tone checker', 'suspension checker',
    'consonance dissonance checker', 'interval analysis',
    'Fux counterpoint', 'Jeppesen counterpoint', 'Palestrina style',
    'music theory counterpoint', 'free counterpoint checker',
    'online counterpoint checker', 'browser counterpoint checker',
    'counterpoint exercise', 'counterpoint practice',
    '대위법 체커', '종별 대위법', '제1종 대위법', '제2종 대위법',
    '제3종 대위법', '제4종 대위법', '정선율', '병행 5도 대위법',
    '대위법 연습', '대위법 과제', '음대 입시 대위법',
    '협화음', '불협화음', '경과음', '보조음', '계류음',
    'verificador de contrapunto', 'contrapunto por especies',
    'primera especie', 'segunda especie', 'tercera especie', 'cuarta especie',
    'cantus firmus', 'quintas paralelas contrapunto',
    'consonancia disonancia', 'nota de paso', 'bordadura', 'retardo',
    'ejercicios de contrapunto', 'contrapunto online',
    'verificador de contraponto', 'contraponto por espécies',
    'primeira espécie', 'segunda espécie', 'terceira espécie', 'quarta espécie',
    'quintas paralelas contraponto', 'exercícios de contraponto',
  ],
  openGraph: {
    title: 'KUON COUNTERPOINT — Real-time Species Counterpoint Checker',
    description: 'Species 1-4. Parallel 5ths/8ths, hidden 5ths, voice crossing, passing tones, suspensions. 12+ rules. Free.',
    url: 'https://kuon-rnd.com/counterpoint',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON COUNTERPOINT — Species Counterpoint Checker',
    description: 'Species 1-4. Parallel perfects, hidden 5ths, dissonance treatment, suspensions. 12+ real-time checks. Free.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/counterpoint',
  },
};

export default function CounterpointLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
