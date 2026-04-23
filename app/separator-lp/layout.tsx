import type { Metadata } from 'next';

// ─────────────────────────────────────────────────────────────
// KUON SEPARATOR LP — SEO + GEO (Generative Engine Optimization)
//
// 目的:
//   - 検索エンジン（Google）での上位表示
//   - 生成 AI（ChatGPT, Claude, Perplexity, Gemini）の回答での引用
//   - 日英西（ja / en / es）で多言語対応
//
// キーワード戦略:
//   - 高ボリューム汎用語: "AI 音源分離", "stem separation online", "separador de pistas"
//   - 中ボリューム用途別: "マイナスワン 作成", "karaoke creator ai", "pista vocal extraer"
//   - ロングテール音楽特化: "ジャズ 耳コピ", "classical ensemble practice", "tango bandoneón separar"
//   - 競合比較: "Moises 代替", "LALAL alternative", "stem splitter free"
// ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL('https://kuon-rnd.com'),
  title:
    'KUON SEPARATOR — AI音源分離（ボーカル・ドラム・ベース抽出）無料オンライン | Free AI Stem Splitter',
  description:
    '世界最高精度の AI 音源分離をブラウザで。Meta の Demucs v4 採用、ボーカル・ドラム・ベース・その他の 4 ステムを高品質抽出。マイナスワン生成、耳コピ支援、カラオケ制作、音楽練習、室内楽アンサンブル練習に最適。月 ¥480 から（海外 Moises/LALAL 比 1/10）。登録なしで 3 回無料体験。24 時間自動削除でプライバシー完備。ジャズ・タンゴ・クラシック・ポップス全ジャンル対応。World-class AI stem separation powered by Meta Demucs v4. Extract vocals, drums, bass, and instruments for karaoke creation, music practice, transcription. From ¥480/mo — 10× cheaper than LALAL.AI. 3 free trials, no signup.',
  keywords: [
    // 日本語 - 汎用
    'AI 音源分離', '音源分離 無料', 'ステム分離 AI', 'ボーカル抽出 AI', 'ボーカル 分離',
    'ドラム 抽出', 'ベース 抽出', 'カラオケ 作成', 'インスト 作成', 'オフボーカル 作成',
    'マイナスワン 作成', 'マイナスワン 自動', '伴奏 抽出', '楽器 分離',
    // 日本語 - 用途
    '耳コピ ツール', 'ジャズ 耳コピ', 'タンゴ 練習', 'クラシック 練習',
    '室内楽 練習', 'アンサンブル 練習', 'オーケストラ 練習',
    'ギター 耳コピ', 'ピアノ 耳コピ', 'ドラム パート練習', 'ベース パート練習',
    'ボーカル 練習 カラオケ', '音大生 ツール', '作曲 編曲 支援',
    // 日本語 - 競合
    'Moises 代替', 'LALAL 代替', 'Audacity より 高精度', '無料 ステム 分離',
    'ボーカル 除去 高品質', 'カラオケ 作成 AI', 'AI カラオケ 変換',
    // English - general
    'AI stem separation', 'stem splitter online', 'stem separation free',
    'vocal remover AI', 'karaoke generator', 'instrumental creator',
    'Demucs online', 'audio source separation', 'isolate vocals online',
    'extract bass from song', 'extract drums from song', 'minus-one generator',
    // English - use cases
    'jazz transcription tool', 'classical ensemble practice', 'tango practice AI',
    'ear training tool', 'chord transcription AI', 'music practice AI',
    'conservatory tools', 'music school AI', 'karaoke maker free',
    // English - competitor
    'Moises alternative', 'LALAL alternative', 'iZotope RX free',
    'best stem separator 2026', 'free vocal isolator', 'AI audio splitter',
    // Spanish
    'separador de pistas IA', 'extractor de voz gratis', 'karaoke generador IA',
    'pista instrumental crear', 'separación de audio IA', 'quitar voz canción',
    'práctica jazz herramienta', 'práctica tango IA', 'música clásica práctica',
    'Moises alternativa', 'separador stems gratis',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/separator-lp',
    languages: {
      ja: 'https://kuon-rnd.com/separator-lp',
      en: 'https://kuon-rnd.com/separator-lp',
      es: 'https://kuon-rnd.com/separator-lp',
    },
  },
  openGraph: {
    title: 'KUON SEPARATOR — World-Class AI Stem Separation from ¥480/mo | 世界最安の AI 音源分離',
    description:
      'Meta の Demucs v4 で、ボーカル・ドラム・ベース・その他を高精度分離。月 ¥480〜（LALAL 比 1/10）。登録なしで 3 回無料。マイナスワン作成・耳コピ・カラオケ制作・室内楽練習。日本語対応。Extract vocals, drums, bass, and instruments with Meta Demucs v4. Up to 10× cheaper than LALAL.AI. Free trial without signup.',
    url: 'https://kuon-rnd.com/separator-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
    images: [
      {
        url: 'https://kuon-rnd.com/og-separator.png',
        width: 1200,
        height: 630,
        alt: 'KUON SEPARATOR — AI Stem Separation powered by Meta Demucs v4',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KUON SEPARATOR — AI Stem Separation from ¥480/mo (10× cheaper than LALAL)',
    description:
      'Extract vocals, drums, bass, and instruments with Meta Demucs v4. Perfect for jazz minus-one, ear training, karaoke creation, classical ensemble practice. Try 3 separations free — no signup. By Kuon R&D, Japan.',
    site: '@kotaro_asahina',
    creator: '@kotaro_asahina',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  other: {
    'google': 'notranslate',
    // GEO (Generative Engine Optimization) hints
    'ai-content-declaration': 'original-service',
    'ai-service-category': 'audio-processing-saas',
  },
};

export default function SeparatorLpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
