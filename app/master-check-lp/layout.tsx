import type { Metadata } from 'next';

export const metadata: Metadata = {
  title:
    '無料ラウドネスチェッカー＆自動調整 KUON MASTER CHECK — LUFS・True Peak・クリッピング一括検証＋ワンクリック修正 | Free Loudness Checker & Auto-Adjust',
  description:
    '配信・CDプレス前の最終チェックをブラウザだけで。LUFS、True Peak、クリッピング検出、ステレオ相関を一画面で確認。Spotify / Apple Music / YouTube / TikTok 各基準との比較＋ワンクリックでラウドネス自動調整＆リミッター付きWAVダウンロード。インストール不要・サーバー送信なし。Free loudness meter & one-click auto-adjust — check LUFS, True Peak, clipping, stereo, then fix loudness instantly. No install, no upload.',
  keywords: [
    // Japanese
    'ラウドネスチェッカー',
    'LUFS 測定',
    'LUFS メーター',
    'ラウドネス 測定 無料',
    'ラウドネスメーター オンライン',
    'True Peak 確認',
    'クリッピング 検出',
    'マスタリング チェック',
    '配信前 チェック',
    'Spotify ラウドネス',
    'Apple Music ラウドネス',
    'YouTube ラウドネス基準',
    'EBU R128',
    'ステレオ 位相 確認',
    'オンライン マスタリングツール',
    'ラウドネス 自動調整',
    'LUFS 調整 無料',
    'ラウドネスノーマライズ オンライン',
    // English
    'loudness checker',
    'LUFS meter online',
    'LUFS meter free',
    'loudness meter free',
    'true peak meter',
    'clipping detector',
    'mastering checker',
    'pre-release audio check',
    'Spotify loudness check',
    'Apple Music loudness',
    'YouTube loudness standard',
    'EBU R128 meter',
    'stereo correlation meter',
    'online mastering tool',
    'loudness penalty checker',
    'loudness normalizer online',
    'auto loudness adjust free',
    'LUFS adjust download',
    // Spanish
    'medidor de sonoridad',
    'medidor LUFS gratis',
    'verificador de loudness',
    'detector de clipping',
    'verificación masterización',
    'Spotify nivel sonoridad',
    'ajuste sonoridad automático',
    'normalizador LUFS gratis',
  ],
  alternates: {
    canonical: 'https://kuon-rnd.com/master-check-lp',
    languages: {
      'ja': 'https://kuon-rnd.com/master-check-lp',
      'en': 'https://kuon-rnd.com/master-check-lp',
      'es': 'https://kuon-rnd.com/master-check-lp',
    },
  },
  openGraph: {
    title: 'Free Loudness Checker & Auto-Adjust — LUFS・True Peak・クリッピング一括検証＋ワンクリック修正',
    description:
      '配信前の最終チェック＋ワンクリックで自動ラウドネス調整。LUFS、True Peak、クリッピング、ステレオ相関。リミッター付きWAVダウンロード。無料・インストール不要。Check & auto-fix loudness for Spotify, Apple Music, YouTube — free, no install.',
    url: 'https://kuon-rnd.com/master-check-lp',
    siteName: '空音開発 Kuon R&D',
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US', 'es_ES'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Loudness Checker & Auto-Adjust — LUFS, True Peak, Clipping + One-Click Fix',
    description:
      'Check LUFS, True Peak, clipping, stereo — then auto-adjust loudness for Spotify, Apple Music, YouTube with one click. Free, no install. By Kuon R&D.',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'google': 'notranslate',
  },
};

export default function MasterCheckLpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
