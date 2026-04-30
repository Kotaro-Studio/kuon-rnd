import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://kuon-rnd.com'),
  title: 'KUON TUTTI カレンダー — 音楽家のためのリハーサル予約 | 空音開発',
  description: 'オーケストラ・室内楽・バンド・合唱団・カルテットのリハーサル予約を音楽家のために設計。グループの空き時間を集めて自動マッチング。アカウント不要のメールリンク投票対応。iCal 出力で Google/Apple カレンダーと統合。',
  alternates: { canonical: 'https://kuon-rnd.com/tutti' },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
