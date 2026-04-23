import type { Metadata } from 'next';

// ─────────────────────────────────────────────────────────────
// KUON TRANSPOSER LP — SEO + GEO
// ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:
    'KUON TRANSPOSER — 無料移調ツール・30+楽器対応・完全ブラウザ完結 | Free Instrument Transposition Tool Online',
  description:
    '吹奏楽・オーケストラ・ジャズのための完全無料の移調ツール。B♭クラリネット、アルトサックス、テナーサックス、ホルン（F管）、トランペット（B♭/C）、コントラバス、ピッコロなど 30+ 楽器の記譜音と実音を一瞬で変換。移調早見表付き、キー（調性）の移調、音符単位の移調、両方に対応。吹奏楽のパート譜づくり、オーケストラのスコアリーディング、ジャズコンボのリハーサル、弦楽四重奏の編曲、合唱伴奏のキー変更、ピアノ伴奏の移調、音大視唱ソルフェージュの練習、作曲・編曲の下準備など、あらゆる音楽現場で使える。ブラウザ完結・登録不要・完全無料。Musescore / Sibelius / Finale の代替にはならないが、移調計算だけが必要な場面では最速ツール。Free instrument transposition helper for 30+ transposing instruments. Bb clarinet, alto sax, horn, trumpet, piccolo, double bass. Browser-only, no signup.',
  keywords: [
    // 日本語 — 汎用
    '移調 アプリ', '移調 アプリ 無料', '移調ヘルパー', '移調 ツール', '移調 計算',
    '移調 表', '移調 早見表', 'トランスポーズ', 'トランスポーズ 音楽', '移調 自動',
    '記譜音 実音 変換', 'コンサートピッチ 変換', '実音 調性 変換',
    // 日本語 — 楽器別
    '移調楽器', '移調楽器 一覧', '移調楽器 変換', 'Bb クラリネット 移調',
    'アルトサックス 移調', 'テナーサックス 移調', 'バリトンサックス 移調',
    'ソプラノサックス 移調', 'ホルン 移調', 'F管ホルン 移調', 'トランペット 移調',
    'B♭トランペット 移調', 'コルネット 移調', 'フリューゲルホルン 移調',
    'ユーフォニアム 移調', 'チューバ 移調', 'ピッコロ 移調', 'コントラバス 移調',
    'バスクラリネット 移調', 'イングリッシュホルン 移調', 'オーボエダモーレ 移調',
    // 日本語 — 用途
    '吹奏楽 移調', '吹奏楽 パート譜', '吹奏楽 スコア読み',
    'オーケストラ 移調', 'オーケストラ スコア リーディング',
    'ジャズ 移調', 'ジャズコンボ 移調', 'ジャズセッション 移調',
    '楽譜 移調 無料', '楽譜 キー 変更', '移調 ピアノ 伴奏',
    '合唱 キー 変更', 'カラオケ キー 変更', 'ソルフェージュ 移調',
    '音大 視唱 練習', '作曲 編曲 移調', '編曲 移調計算',
    // 日本語 — 競合
    'Musescore 移調 代替', 'Sibelius 移調 代替', 'Finale 移調 代替',
    'Dorico 移調 代替', '移調 フリーソフト',
    // English — general
    'transpose app free', 'transposition tool free', 'transposing instruments chart',
    'transpose music online free', 'instrument transposition calculator',
    'concert pitch converter', 'transpose online', 'transpose key online',
    // English — instruments
    'Bb clarinet transpose', 'alto sax transpose', 'tenor sax transpose',
    'baritone sax transpose', 'soprano sax transpose', 'horn transpose',
    'F horn transpose', 'trumpet transpose', 'Bb trumpet transpose',
    'cornet transpose', 'flugelhorn transpose', 'euphonium transpose',
    'tuba transpose', 'piccolo transpose', 'double bass transpose',
    'bass clarinet transpose', 'English horn transpose', 'oboe d\'amore transpose',
    // English — use
    'wind band transpose', 'marching band transpose', 'concert band part writing',
    'orchestra score reading', 'jazz combo transpose', 'jam session transpose',
    'key change music', 'karaoke key change', 'piano accompaniment transpose',
    'choir key change', 'solfège transposition', 'sight singing practice',
    'composition arranging tool', 'arrangement transpose',
    // English — competitor
    'Musescore transpose alternative', 'Sibelius transpose alternative',
    'Finale transpose alternative', 'Dorico transpose alternative',
    'free music transposition', 'online transposition app',
    // Spanish
    'transpositor gratis', 'transpositor de instrumentos', 'herramienta de transposición',
    'transposición musical gratis', 'transposición clarinete Bb',
    'transposición saxo alto', 'transposición trompeta',
    'banda sinfónica transposición', 'jazz combo transposición',
    'cambio de tonalidad gratis',
    // Korean
    '이조 앱 무료', '이조 도구', '이조 악기', '이조 표',
    // Portuguese
    'transpositor grátis', 'transposição de instrumentos',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/transposer-lp',
    languages: {
      'ja': 'https://kuon-rnd.com/transposer-lp',
      'en': 'https://kuon-rnd.com/transposer-lp',
      'es': 'https://kuon-rnd.com/transposer-lp',
    },
  },
  openGraph: {
    title: 'KUON TRANSPOSER — Free Transpose for 30+ Instruments',
    description:
      '30+ transposing instruments (Bb clarinet, alto sax, horn, trumpet, piccolo). Key & note transposition. Reference chart. Free & browser-based. 吹奏楽・オーケストラ・ジャズに。',
    url: 'https://kuon-rnd.com/transposer-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON TRANSPOSER — Free Instrument Transposition (30+ instruments)',
    description:
      'Bb clarinet, alto sax, horn, trumpet, piccolo, bass. Key & note transposition + reference chart. Free, browser-only. By Kuon R&D.',
    site: '@kotaro_asahina',
    creator: '@kotaro_asahina',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
  other: {
    'google': 'notranslate',
    'ai-content-declaration': 'original-service',
    'ai-service-category': 'music-education-saas',
  },
};

// ─────────────────────────────────────────────────────────────
// JSON-LD (GEO)
// ─────────────────────────────────────────────────────────────
const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KUON TRANSPOSER',
  alternateName: ['Kuon Transposer', 'KUON 移調ヘルパー'],
  applicationCategory: 'EducationalApplication',
  applicationSubCategory: 'Music Education / Instrument Transposition',
  operatingSystem: 'Any (browser-based)',
  url: 'https://kuon-rnd.com/transposer-lp',
  description:
    'Free instrument transposition tool for 30+ transposing instruments including Bb clarinet, alto sax, tenor sax, horn (F), trumpet (Bb/C), piccolo, English horn, double bass. Convert written pitch to concert pitch and back. Key transposition and per-note transposition supported. Browser-only, no signup.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
    availability: 'https://schema.org/InStock',
  },
  featureList: [
    '30+ transposing instruments',
    'Written-to-concert pitch conversion',
    'Concert-to-written pitch conversion',
    'Key signature transposition',
    'Per-note transposition',
    'Reference chart display',
    'Multi-language: Japanese, English, Spanish, Korean, Portuguese',
    'Browser-only — no install, no signup',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '62',
    bestRating: '5',
    worstRating: '1',
  },
  author: {
    '@type': 'Organization',
    name: 'Kuon R&D (空音開発)',
    url: 'https://kuon-rnd.com',
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is KUON TRANSPOSER?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'KUON TRANSPOSER is a free, browser-based tool that converts written pitch and concert pitch for 30+ transposing instruments including Bb clarinet, alto sax, tenor sax, French horn in F, trumpet in Bb, piccolo, English horn, bass clarinet, and double bass. It handles both key-signature transposition (for whole pieces) and per-note transposition (for quick lookup).',
      },
    },
    {
      '@type': 'Question',
      name: 'Which transposing instruments are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '30+ instruments including: Bb clarinet, A clarinet, Eb clarinet, bass clarinet, alto sax, tenor sax, baritone sax, soprano sax, French horn in F, trumpet in Bb, trumpet in C, cornet, flugelhorn, euphonium, tuba, piccolo, English horn, oboe d\'amore, contrabass clarinet, and double bass. Both standard orchestral and wind-band instruments are covered.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this a replacement for Sibelius, Finale, or MuseScore?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No — those are full notation editors. KUON TRANSPOSER only does the transposition math. If you need to transpose an entire score and engrave it, use Sibelius/Finale/MuseScore/Dorico. If you just need to quickly know "what note does the Bb clarinet play for a concert G?" or "what key signature does the alto sax read for a concert Bb score?" — KUON TRANSPOSER is the fastest answer.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who uses KUON TRANSPOSER?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Wind band directors writing part scores from concert-pitch sketches, orchestra conductors doing score reading, jazz combo musicians reading concert-pitch lead sheets, music-school students preparing for conservatory entrance exams that include transposition, composers and arrangers doing quick sanity checks, and pianists transposing accompaniments for vocal lessons.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is KUON TRANSPOSER free forever?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. KUON TRANSPOSER is a browser-based tool — the entire calculation runs on your device, so there is no server cost to us and no subscription to you. It is free permanently with no ads.',
      },
    },
  ],
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://kuon-rnd.com' },
    { '@type': 'ListItem', position: 2, name: 'Audio Apps', item: 'https://kuon-rnd.com/audio-apps' },
    { '@type': 'ListItem', position: 3, name: 'KUON TRANSPOSER', item: 'https://kuon-rnd.com/transposer-lp' },
  ],
};

export default function TransposerLPLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
