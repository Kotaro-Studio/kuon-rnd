import type { Metadata } from 'next';

// ─────────────────────────────────────────────────────────────
// KUON DDP CHECKER LP — SEO + GEO
// ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:
    'KUON DDP CHECKER — 無料DDPファイル確認・曲間試聴（Gap Listen）・WAV変換 | Free DDP Checker with Exclusive Gap Listen',
  description:
    'CDマスタリング用DDPファイルセットをブラウザだけで確認。トラックリスト・試聴・WAVダウンロードに加えて、業界初の「曲間試聴（Gap Listen）」機能で、前の曲の終わり15秒→曲間→次の曲の冒頭を連続再生。リードイン・プリギャップ・曲間秒数を完全表示、DDPID / DDPMS / PQ パケットをバイトレベルで解析。プレス工場提出前の最終確認、マスタリングエンジニアのリファレンスチェック、レーベル A&R のアルバム構成確認に。インストール不要・サーバー送信なし・完全無料・ブラウザ完結でプライバシー完備。有料ソフト HOFA CD-Burn & DDP（€74）や Sonoris DDP Creator（$279）の代替として使える DDP 確認ツール。Free browser-based DDP checker with exclusive Gap Listen — hear the last 15s of the previous track through the gap into the next. Track list, preview, WAV download, lead-in & pre-gap display. No install, no upload.',
  keywords: [
    // 日本語 — 汎用
    'DDP チェッカー', 'DDP 確認', 'DDP ファイル 開く', 'DDP 再生', 'DDP プレーヤー',
    'DDP 無料', 'DDP ビューアー', 'DDP 検証', 'DDP トラック 確認', 'DDP WAV 変換',
    'DDPファイル 中身 確認', 'DDPID DDPMS 解析', 'DDP バイナリ 解析',
    'DDP ダウンロード', 'DDP ファイルセット', 'DDP フォルダ 確認',
    // 日本語 — 用途
    'CDマスタリング DDP', 'プレス工場 DDP', 'DDP プレス 確認',
    'レーベル A&R DDP', 'アルバム 曲順 確認', 'マスタリング 最終確認',
    'DDP 曲間 確認', 'DDP 曲間 試聴', 'DDP リードイン', 'DDP プリギャップ',
    'CD 曲間 チェック', '曲間 秒数 確認', 'CD 流れ 確認', 'アルバム 流れ 試聴',
    // 日本語 — 競合
    'HOFA DDP 代替', 'Sonoris DDP 代替', 'DDP.Player 代替',
    'Sequoia DDP 代替', 'WaveLab DDP 代替', 'Pyramix DDP 代替',
    'DDP 無料ソフト', 'DDP 無料 オンライン', 'DDP 確認ツール 無料',
    // 日本語 — 技術
    'Red Book オーディオ', 'CD-DA 規格', 'DDP 2.00', 'DDP 1.04',
    // English — general
    'DDP checker', 'DDP file checker', 'DDP player free', 'DDP viewer online',
    'DDP file reader', 'DDP verifier', 'open DDP file', 'free DDP player',
    'DDP track list', 'DDP to WAV', 'check DDP file online', 'DDP binary parser',
    'DDP fileset viewer', 'DDP folder reader',
    // English — use
    'CD mastering DDP', 'pre-press DDP check', 'label A&R DDP preview',
    'album flow check', 'mastering final check', 'DDP browser tool',
    'DDP gap listen', 'DDP track gap preview', 'DDP crossfade preview',
    'DDP lead-in check', 'DDP pre-gap display', 'track transition preview',
    'hear between tracks', 'CD gap audition',
    // English — competitor
    'HOFA DDP alternative', 'Sonoris DDP alternative', 'DDP.Player alternative',
    'Sequoia DDP alternative', 'WaveLab DDP alternative', 'Pyramix DDP alternative',
    'free DDP verifier', 'online DDP reader',
    // English — technical
    'Red Book CD-DA', 'DDP 2.00 spec', 'DDP 1.04 spec', 'PQ subcode',
    // Spanish
    'verificador DDP', 'DDP checker gratis', 'abrir archivo DDP',
    'reproductor DDP gratuito', 'verificar DDP online', 'masterización CD DDP',
    'DDP pausa entre pistas', 'DDP escuchar transición',
    'alternativa HOFA DDP', 'alternativa Sonoris DDP',
    'verificar fichero DDP gratis', 'preview pausa CD',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/ddp-checker-lp',
    languages: {
      'ja': 'https://kuon-rnd.com/ddp-checker-lp',
      'en': 'https://kuon-rnd.com/ddp-checker-lp',
      'es': 'https://kuon-rnd.com/ddp-checker-lp',
    },
  },
  openGraph: {
    title: 'KUON DDP CHECKER — Free DDP Verifier with Exclusive Gap Listen',
    description:
      'DDPファイルセットをブラウザで確認。曲間試聴（Gap Listen）で CD の流れを体感。HOFA / Sonoris 代替として無料・インストール不要。Check DDP filesets with exclusive Gap Listen — free, no install.',
    url: 'https://kuon-rnd.com/ddp-checker-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON DDP CHECKER — Free DDP Verifier with Gap Listen',
    description:
      'Check DDP filesets + hear track transitions with exclusive Gap Listen. Track list, preview, WAV download. Free. By Kuon R&D.',
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
    'ai-service-category': 'audio-mastering-saas',
  },
};

// ─────────────────────────────────────────────────────────────
// JSON-LD (GEO)
// ─────────────────────────────────────────────────────────────
const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KUON DDP CHECKER',
  alternateName: ['KUON DDP Verifier', 'DDP Gap Listen'],
  applicationCategory: 'MultimediaApplication',
  applicationSubCategory: 'CD Mastering / DDP Verification',
  operatingSystem: 'Any (browser-based)',
  url: 'https://kuon-rnd.com/ddp-checker-lp',
  description:
    'Free browser-based DDP checker with exclusive Gap Listen feature. Verify DDP filesets before pressing, audition track transitions, download individual tracks as WAV. Alternative to HOFA CD-Burn & DDP, Sonoris DDP Creator, and DDP.Player.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
    availability: 'https://schema.org/InStock',
  },
  featureList: [
    'DDP 2.00 and DDP 1.04 fileset parsing',
    'DDPID, DDPMS, and PQ subcode parsing',
    'Track list with lead-in, pre-gap, and gap durations',
    'Individual track audition',
    'Exclusive Gap Listen — hear the last 15s of previous track through the gap into the next',
    'WAV download per track',
    'Browser-only — no install, no upload, no subscription',
    'Red Book CD-DA compliance display',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '46',
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
      name: 'What is KUON DDP CHECKER?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'KUON DDP CHECKER is a free, browser-based tool for verifying DDP (Disc Description Protocol) filesets before CD pressing. It parses DDPID, DDPMS, and PQ subcode data, displays the full track list with lead-in and pre-gap timings, plays individual tracks, and offers an exclusive Gap Listen feature that lets you hear the last 15 seconds of a track through the gap into the next — useful for verifying album flow before sending to a pressing plant.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is KUON DDP CHECKER different from HOFA CD-Burn or Sonoris DDP Creator?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'HOFA CD-Burn & DDP (€74) and Sonoris DDP Creator ($279) are paid desktop applications focused primarily on DDP creation and burning. KUON DDP CHECKER is a free, browser-only verification tool — it checks filesets you already have. It also adds the unique Gap Listen feature (hearing across track gaps), which no paid competitor currently offers.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Gap Listen?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Gap Listen is KUON DDP CHECKER\'s exclusive feature that plays the final 15 seconds of the previous track, through the gap (using the exact pre-gap and lead-in durations from the DDPMS), and into the first 5 seconds of the next track. This lets mastering engineers and labels verify album flow — whether songs feel too abrupt, whether a crossfade was cut correctly, whether the CD "breathes" as intended.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are my DDP files uploaded to a server?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. KUON DDP CHECKER parses DDP files entirely in your browser. Your masters never leave your machine, which is critical for pre-release album material under embargo. No upload, no account, no subscription.',
      },
    },
    {
      '@type': 'Question',
      name: 'What DDP versions does it support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'KUON DDP CHECKER supports DDP 2.00 (the current standard for CD mastering filesets) and DDP 1.04 (legacy). It reads DDPID (identifier), DDPMS (main data stream map), and PQ subcode files, and correlates them to produce the track list and gap timing display.',
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
    { '@type': 'ListItem', position: 3, name: 'KUON DDP CHECKER', item: 'https://kuon-rnd.com/ddp-checker-lp' },
  ],
};

export default function DdpCheckerLpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
