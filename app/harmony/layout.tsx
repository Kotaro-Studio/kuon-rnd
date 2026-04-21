import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON HARMONY — 四声体和声リアルタイムチェッカー | 並達5度・声部進行チェック | 空音開発',
  description:
    '四声体（SATB）の和声課題をリアルタイムでチェック。並達5度・並達8度・隠伏5度・声部交差・声部超越・音域逸脱・導音重複・増2度・限定進行を即座に検出。全調対応。芸大和声・Piston準拠。ブラウザ完結・完全無料。音大受験・和声学の授業に。',
  keywords: [
    '和声チェッカー', '和声課題チェック', '並達5度検出', '並達8度検出',
    '四声体和声', 'SATB チェック', '声部進行チェック', 'ボイスリーディング',
    '和声法', '和声学', '芸大和声', '和声 理論と実習', '島岡 和声',
    '対位法', '声部交差', '声部超越', '限定進行', '導音解決',
    '増2度', '隠伏5度', '隠伏8度', '導音重複',
    '和音分析', 'ローマ数字分析', '和声分析',
    '音大受験', '音大 和声', '和声 練習', '和声 オンライン',
    '禁則', '和声 禁則', '連続5度', '連続8度',
    '開離配置', '密集配置', '四声体配置',
    'harmony checker', 'voice leading checker', 'parallel fifths checker',
    'parallel octaves checker', 'SATB checker', 'four-part harmony checker',
    'part writing checker', 'voice leading rules', 'voice crossing',
    'spacing violation', 'hidden fifths', 'direct fifths',
    'doubled leading tone', 'chord identification', 'Roman numeral analysis',
    'music theory checker', 'harmony homework', 'harmony exercise',
    'free harmony checker', 'online harmony checker', 'browser harmony checker',
    '화성학 체커', '병행 5도', '병행 8도', '성부 진행',
    '4성부 화성', '화성 과제', '음대 입시 화성', '화성 연습',
    '성부교차', '성부초월', '은복5도', '이끔음',
    'verificador de armonía', 'quintas paralelas', 'octavas paralelas',
    'conducción de voces', 'armonía a cuatro voces', 'ejercicios de armonía',
    'verificador de harmonia', 'quintas paralelas', 'oitavas paralelas',
    'condução de vozes', 'harmonia a quatro vozes', 'exercícios de harmonia',
  ],
  openGraph: {
    title: 'KUON HARMONY — Real-time SATB Voice Leading Checker',
    description: 'Parallel 5ths/8ths, voice crossing, spacing, range, hidden 5ths, doubled leading tone. 10 rules. All keys. Free.',
    url: 'https://kuon-rnd.com/harmony',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON HARMONY — SATB Voice Leading Checker',
    description: 'Parallel 5ths, voice crossing, hidden octaves, doubled leading tone. 10 real-time checks. Free.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/harmony',
  },
};

export default function HarmonyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
