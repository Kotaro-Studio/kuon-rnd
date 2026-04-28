import type { Metadata } from 'next';

const description =
  'Western art music を、科学的に読み解く。バッハ・モーツァルト・ベートーベンの楽譜 600+ 曲を内蔵。ローマ数字分析・転調マップ・声部進行違反検出を瞬時に。music21 ベースの音楽理論分析プラットフォーム。Common Practice Period (1600-1900) 全般。和声学の宿題・楽曲分析・作曲学習に。月 ¥1,480 から。';

export const metadata: Metadata = {
  title: 'KUON CLASSICAL ANALYSIS — クラシック音楽 ローマ数字分析・転調マップ・声部進行チェック | 空音開発',
  description,
  keywords: [
    // 日本語
    'クラシック音楽分析', 'ローマ数字分析', '和声分析', 'ハーモニー分析',
    'バッハ コラール 分析', 'モーツァルト ソナタ 分析', 'ベートーベン 四重奏 分析',
    '楽譜分析', '楽曲分析', '音楽分析ツール', 'クラシック分析オンライン',
    '和声学', '芸大和声', '島岡 和声', '和声 理論と実習',
    '音大 和声学', '音大 宿題', '和声 課題', 'ローマ数字 振り方',
    '副属和音', '借用和音', 'V7 副属', '転調 検出',
    'カデンツ 判定', '完全終止', '変格終止', '偽終止',
    '声部進行 チェック', '連続5度', '連続8度',
    'music21', 'MusicXML 分析', 'MIDI 分析',
    '楽曲 ライブラリ', 'IMSLP', 'Mutopia', 'Bach chorales',
    // English
    'classical music analysis', 'Roman numeral analysis', 'harmonic analysis',
    'Bach chorale analysis', 'Mozart sonata analysis', 'Beethoven analysis',
    'music theory tool', 'sheet music analysis', 'score analysis online',
    'common practice harmony', 'chord identification', 'cadence detection',
    'modulation detection', 'voice leading checker', 'parallel fifths',
    'parallel octaves', 'four part harmony', 'SATB analysis',
    'music21 web', 'MusicXML analyzer', 'figured bass',
    'tonal harmony', 'functional harmony', 'voice leading rules',
    'music school harmony', 'conservatory harmony', 'music theory homework',
    // Spanish
    'análisis musical clásico', 'análisis con números romanos',
    'análisis armónico', 'análisis de partituras', 'cifrado romano',
    'análisis de Bach', 'análisis de Mozart', 'cadencias musicales',
    'modulación tonal', 'conducción de voces', 'quintas paralelas',
    'armonía funcional', 'armonía tonal', 'estudios de música',
    // German
    'klassische Musikanalyse', 'Stufenanalyse', 'Funktionsanalyse',
    'Bach Choralanalyse', 'Harmonieanalyse', 'Modulationsanalyse',
    'Stimmführung', 'Quintparallelen', 'Kadenzanalyse',
    'Tonartbestimmung', 'Notenanalyse online', 'Musiktheorie online',
    'Hochschule Musiktheorie', 'Werkanalyse',
    // Korean
    '클래식 음악 분석', '로마 숫자 분석', '화성 분석',
    '바흐 코랄 분석', '모차르트 분석', '베토벤 분석',
    '음대 화성학', '화성학 과제', '음악 분석 도구',
    '병행 5도', '성부 진행', '전조 검출', '종지형 분석',
    // Portuguese
    'análise musical clássica', 'análise com algarismos romanos',
    'análise harmônica', 'análise de partituras', 'cifrado romano',
    'análise de Bach', 'cadências musicais', 'modulação tonal',
    'condução de vozes', 'quintas paralelas', 'harmonia funcional',
  ],
  openGraph: {
    title: 'KUON CLASSICAL ANALYSIS — Read classical music with scientific clarity',
    description: 'Bach, Mozart, Beethoven, Schumann — 600+ pieces built-in. Roman numeral analysis, modulation map, voice leading checker. Powered by music21.',
    url: 'https://kuon-rnd.com/classical-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    images: [
      {
        url: 'https://kuon-rnd.com/og-classical.png',
        width: 1200,
        height: 630,
        alt: 'KUON CLASSICAL ANALYSIS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON CLASSICAL ANALYSIS — Roman numerals, cadences, modulations',
    description: '600+ Bach/Mozart/Beethoven pieces ready. One click harmonic analysis. Music21-powered.',
  },
  alternates: {
    canonical: 'https://kuon-rnd.com/classical-lp',
    languages: {
      ja: 'https://kuon-rnd.com/classical-lp',
      en: 'https://kuon-rnd.com/classical-lp',
      es: 'https://kuon-rnd.com/classical-lp',
      ko: 'https://kuon-rnd.com/classical-lp',
      pt: 'https://kuon-rnd.com/classical-lp',
      de: 'https://kuon-rnd.com/classical-lp',
    },
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
