import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON MASTER CHECK — 配信前ラウドネス・品質チェッカー',
  description:
    '音源の配信・プレス前に、ラウドネス（LUFS）、True Peak、クリッピング、ステレオ相関をブラウザだけで一括チェック。Spotify / Apple Music / YouTube / TikTok 各プラットフォーム基準との比較。インストール不要、サーバー送信なし、完全ローカル処理。',
  alternates: {
    canonical: 'https://kuon-rnd.com/master-check',
  },
  openGraph: {
    title: 'KUON MASTER CHECK — 空音開発',
    description:
      '配信・プレス前の最終チェックをブラウザだけで。LUFS・True Peak・クリッピング・ステレオ相関を一画面で確認。無料ツール。',
    url: 'https://kuon-rnd.com/master-check',
  },
};

export default function MasterCheckLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
