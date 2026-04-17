import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DDP チェッカー — DDPファイルセット検証・試聴ツール',
  description:
    'CDマスタリング用DDPファイルセットの内容をブラウザで確認。トラックリスト表示、各トラックの試聴、WAVダウンロードが可能。サーバーへの送信なし、完全ローカル処理。',
  alternates: {
    canonical: 'https://kuon-rnd.com/ddp-checker',
  },
  openGraph: {
    title: 'DDP チェッカー — 空音開発',
    description: 'DDPファイルセットの構造検証・トラック試聴・WAVエクスポート。ブラウザ完結型の無料ツール。',
    url: 'https://kuon-rnd.com/ddp-checker',
  },
};

export default function DdpCheckerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
