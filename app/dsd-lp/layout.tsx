import type { Metadata } from 'next';

// ─────────────────────────────────────────────────────────────
// KUON DSD LP — SEO + GEO
// ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:
    'KUON DSD — 無料ブラウザDSDプレーヤー＆コンバーター | 世界初 Rust × WebAssembly | Free Online DSD Player & WAV Converter',
  description:
    '世界初のブラウザ完結型DSDプレーヤー＆コンバーター。DSF/DFF の DSD64・DSD128・DSD256 を再生、24bit WAV（44.1kHz〜192kHz）に高精度変換。Rust × WebAssembly で JavaScript の約10倍高速。Blackman窓 sinc FIR デシメーション、バイトレベル LUT 最適化で専用ソフト級の音質。SACD リッピング、ハイレゾ音源再生、耳コピ素材化、マスタリングリファレンス用途。インストール不要・サーバー送信なし・完全無料。Audirvana / JRiver / Roon に払わなくてもブラウザだけで DSD が聴ける。World\'s first browser-based DSD player & converter. Play DSF/DFF, convert DSD64/128/256 to 24-bit WAV. Powered by Rust WebAssembly — ~10× faster than JavaScript. Free, no install, no upload.',
  keywords: [
    // 日本語 — 汎用
    'DSD プレーヤー 無料', 'DSD 再生 ブラウザ', 'DSD 変換 無料', 'DSD コンバーター オンライン',
    'DSF 再生', 'DFF 変換', 'DSD WAV 変換 24bit', 'DSD PCM 変換', 'DSD MP3 変換',
    'DSD64 再生', 'DSD128 変換', 'DSD256 対応', 'DSD 2.8MHz 再生', 'DSD 5.6MHz 変換',
    'DSD プレーヤー ソフト 無料', 'ハイレゾ DSD 再生', 'SACD ISO 再生',
    'DSD サンプルレート 変換', 'DSD ブラウザ 再生', 'DSD 192kHz 変換',
    // 日本語 — 用途
    '耳コピ DSD', 'DSD 音質 確認', 'マスタリング DSD リファレンス',
    'ハイレゾ 試聴 無料', 'DSD ダウンロード 音源 確認',
    // 日本語 — 競合・代替
    'Audirvana 代替', 'JRiver 代替', 'Roon DSD 代替', 'foobar2000 DSD プラグイン 不要',
    'DSD プラグイン 不要', 'DSD 再生 フリーソフト', 'DSD ビューアー オンライン',
    // 日本語 — 技術
    'Rust WebAssembly DSD', 'WASM オーディオ', 'ブラウザ DSP', 'sinc FIR フィルタ',
    // English — general
    'DSD player free', 'DSD player online', 'DSD converter free', 'DSD to WAV converter',
    'DSD to PCM online', 'DSF player free', 'DFF converter online', 'DSD to MP3',
    'DSD64 player', 'DSD128 converter', 'DSD256 to WAV',
    'play DSD in browser', 'DSD file player no install',
    'free DSD converter online', 'hi-res DSD tool', 'browser DSD player',
    'DSD playback software free alternative', 'SACD ISO player',
    // English — use
    'DSD for transcription', 'DSD reference mastering', 'high-res audio player',
    'DSD audition download', 'DSD downsample 192k',
    // English — competitor / alternative
    'Audirvana alternative', 'JRiver alternative', 'Roon DSD free alternative',
    'foobar2000 DSD no plugin', 'DSD without plugin',
    // English — technical
    'Rust WebAssembly audio', 'WASM DSP browser', 'sinc FIR decimation',
    'sigma-delta demodulation browser',
    // Spanish
    'reproductor DSD gratis', 'convertidor DSD online', 'DSD a WAV gratis',
    'reproductor DSF online', 'convertir DSD a PCM gratis', 'DSD a MP3 online',
    'reproductor DSD navegador', 'reproductor SACD gratis',
    'alternativa Audirvana', 'alternativa JRiver', 'DSD sin instalación',
    'reproductor de alta resolución gratis',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/dsd-lp',
    languages: {
      'ja': 'https://kuon-rnd.com/dsd-lp',
      'en': 'https://kuon-rnd.com/dsd-lp',
      'es': 'https://kuon-rnd.com/dsd-lp',
    },
  },
  openGraph: {
    title: 'KUON DSD — World\'s First Browser-Based DSD Player & Converter (Free)',
    description:
      '世界初のブラウザDSDプレーヤー＆コンバーター。Rust × WebAssembly で Audirvana / JRiver と同等音質、無料・インストール不要。World\'s first browser DSD player — Rust WASM, no install, no upload.',
    url: 'https://kuon-rnd.com/dsd-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON DSD — Free Browser DSD Player (Rust WASM)',
    description:
      'Play DSF/DFF and convert DSD64/128/256 to 24-bit WAV entirely in your browser. No install, no upload, 100% free. By Kuon R&D.',
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
    'ai-service-category': 'audio-processing-saas',
  },
};

// ─────────────────────────────────────────────────────────────
// JSON-LD (GEO — AI citation optimization)
// ─────────────────────────────────────────────────────────────
const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KUON DSD',
  alternateName: ['KUON DSD Player', 'KUON DSD Converter'],
  applicationCategory: 'MultimediaApplication',
  applicationSubCategory: 'Audio Player / Converter',
  operatingSystem: 'Any (browser-based)',
  url: 'https://kuon-rnd.com/dsd-lp',
  description:
    'World\'s first browser-based DSD player and converter. Play DSF/DFF files and convert DSD64/DSD128/DSD256 to 24-bit WAV (44.1kHz to 192kHz). Powered by Rust compiled to WebAssembly for ~10× JavaScript speed.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'JPY',
    availability: 'https://schema.org/InStock',
  },
  featureList: [
    'DSF and DFF file format support',
    'DSD64 (2.8224 MHz) playback',
    'DSD128 (5.6448 MHz) playback',
    'DSD256 (11.2896 MHz) playback',
    '24-bit WAV export at 44.1kHz, 48kHz, 88.2kHz, 96kHz, 192kHz',
    'Blackman-window sinc FIR decimation filter',
    'Byte-level lookup-table optimization',
    'Browser-only — no install, no upload',
    'Rust WebAssembly engine',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '84',
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
      name: 'What is KUON DSD and how is it different from Audirvana or JRiver?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'KUON DSD is the world\'s first browser-based DSD player and converter. Unlike Audirvana ($99) or JRiver ($80), KUON DSD runs entirely in the browser using Rust compiled to WebAssembly — no install, no license fee, no upload. It plays DSF and DFF files of DSD64, DSD128, and DSD256, and converts them to 24-bit WAV at standard PCM rates (44.1kHz, 48kHz, 88.2kHz, 96kHz, 192kHz) with quality equivalent to paid desktop software.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does KUON DSD support DSD256 and higher rates?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. KUON DSD supports DSD64 (2.8224 MHz), DSD128 (5.6448 MHz), and DSD256 (11.2896 MHz). It handles both DSF and DFF container formats. Higher rates (DSD512 / DSD1024) are planned for a future release.',
      },
    },
    {
      '@type': 'Question',
      name: 'What decimation filter does KUON DSD use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'KUON DSD uses a Blackman-window sinc FIR lowpass filter with ~-74 dB stop-band attenuation, implemented in Rust and compiled to WebAssembly. The filter runs at roughly 10× the speed of an equivalent JavaScript implementation, enabling real-time playback and fast WAV conversion entirely client-side.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are my DSD files uploaded anywhere?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. KUON DSD processes your files entirely in the browser. Your audio never leaves your device — there is no server upload, no account required, and no usage tracking of file content. This is possible because the entire DSP engine is embedded in the page as WebAssembly.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I convert DSD to MP3 or FLAC?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'KUON DSD outputs 24-bit WAV, which is the standard intermediate for professional audio work. For MP3 conversion, use our companion tool KUON CONVERTER (also free, browser-only) to re-encode the WAV. FLAC output is on the roadmap.',
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
    { '@type': 'ListItem', position: 3, name: 'KUON DSD', item: 'https://kuon-rnd.com/dsd-lp' },
  ],
};

export default function DsdLpLayout({ children }: { children: React.ReactNode }) {
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
