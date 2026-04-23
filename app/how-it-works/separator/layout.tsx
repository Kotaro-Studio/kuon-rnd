import type { Metadata } from 'next';

// ─────────────────────────────────────────────────────────────
// KUON SEPARATOR How-It-Works — Technical Deep Dive
//
// 目的:
//   - 技術記事として SEO 上位表示
//   - 生成 AI（ChatGPT, Claude, Perplexity, Gemini）からの引用獲得
//   - エンジニア層・音大生層の技術的信頼を獲得
// ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:
    'How KUON SEPARATOR Works — Meta Demucs v4 Hybrid U-Net | AI音源分離の仕組み',
  description:
    'KUON SEPARATOR の技術解説：Meta AI Research の Demucs v4（htdemucs）が、どのようにしてボーカル・ドラム・ベース・楽器を分離するのか。Hybrid U-Net アーキテクチャ、スペクトログラム＋波形の二重ドメイン処理、Cross-domain Transformer、MUSDB18-HQ 学習データ、SI-SDR 評価、Cloud Run CPU デプロイ設計まで。AI音源分離の数学的困難性（blind source separation）とディープラーニングによる解決までを徹底解説。Deep technical dive into Meta Demucs v4 hybrid U-Net architecture — spectrogram + waveform dual-domain processing, cross-domain attention, MUSDB18-HQ training, production deployment on Cloud Run.',
  keywords: [
    // 日本語 - 技術系
    'Demucs 仕組み', 'Demucs v4 解説', '音源分離 AI アルゴリズム', 'ブラインド音源分離',
    'U-Net 音声', 'ハイブリッド U-Net', 'スペクトログラム 波形 二重処理',
    'MUSDB18 データセット', 'SI-SDR 評価', 'STFT 短時間フーリエ変換',
    'Cross-domain Transformer 音声', 'オーディオ ディープラーニング',
    'ステム分離 アーキテクチャ', 'AI 音源分離 論文', 'Meta AI Research オーディオ',
    // 日本語 - 用途技術
    'Cloud Run Demucs デプロイ', 'PyTorch 音声分離', 'htdemucs モデル',
    // English - technical
    'Demucs v4 architecture', 'hybrid U-Net audio', 'blind source separation',
    'spectrogram waveform fusion', 'music demixing explained',
    'MUSDB18-HQ training', 'SI-SDR metric', 'cross-domain transformer audio',
    'Meta AI Research audio', 'htdemucs model', 'torchaudio Demucs',
    'stem separation deep learning', 'audio source separation neural network',
    'Cloud Run GPU audio inference', 'source separation PyTorch',
    // English - deeper
    'why audio separation is hard', 'ICA vs Demucs', 'NMF vs deep learning',
    'spectral masking source separation', 'waveform domain audio model',
    // Spanish
    'cómo funciona Demucs', 'separación de audio IA explicado',
    'arquitectura U-Net audio', 'aprendizaje profundo audio',
    'separación de fuentes ciegas',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/how-it-works/separator',
    languages: {
      'ja': 'https://kuon-rnd.com/how-it-works/separator',
      'en': 'https://kuon-rnd.com/how-it-works/separator',
      'es': 'https://kuon-rnd.com/how-it-works/separator',
    },
  },
  openGraph: {
    title: 'How KUON SEPARATOR Works — Meta Demucs v4 Hybrid U-Net',
    description:
      'Deep dive into Demucs v4 architecture: hybrid spectrogram + waveform U-Net, cross-domain transformer, MUSDB18-HQ training, production deployment. 数式と図で分かる Meta の音源分離モデル。',
    url: 'https://kuon-rnd.com/how-it-works/separator',
    siteName: 'Kuon R&D',
    type: 'article',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
    images: [
      {
        url: 'https://kuon-rnd.com/og-separator-technical.jpeg',
        width: 1200,
        height: 630,
        alt: 'How KUON SEPARATOR Works — Demucs v4 Architecture',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How KUON SEPARATOR Works — Meta Demucs v4 Deep Dive',
    description:
      'The engineering behind KUON SEPARATOR: Meta Demucs v4 hybrid U-Net, dual-domain processing, cross-domain attention, Cloud Run deployment.',
    images: ['https://kuon-rnd.com/og-separator-technical.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
  authors: [
    {
      name: 'Kotaro Asahina',
      url: 'https://kotaroasahina.com',
    },
  ],
  other: {
    'ai-content-declaration': 'original-technical-article',
    'ai-service-category': 'audio-processing-technical-documentation',
  },
};

export default function HowItWorksSeparatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
