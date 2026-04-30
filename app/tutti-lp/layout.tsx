import type { Metadata } from 'next';

const TITLE = 'KUON TUTTI カレンダー — 音楽家のためのリハーサル予約 (Calendly for Musicians) | 空音開発';
const DESC = 'オーケストラ・室内楽・カルテット・バンド・合唱団の音楽家のためのリハーサル予約自動化サービス。グループの空き時間を集めて自動マッチング。アカウント不要のメールリンク投票。iCal 出力で Google/Apple Calendar と統合。Free から始められます。';

export const metadata: Metadata = {
  metadataBase: new URL('https://kuon-rnd.com'),
  title: TITLE,
  description: DESC,
  keywords: 'リハーサル 予約, 音楽家 スケジュール, アンサンブル 調整, オーケストラ 練習日, カルテット 予定, 合唱団 練習, Calendly 音楽, バンド 集合, グループ 空き時間, KUON TUTTI, 空音開発',
  alternates: { canonical: 'https://kuon-rnd.com/tutti-lp' },
  openGraph: {
    title: TITLE, description: DESC, url: 'https://kuon-rnd.com/tutti-lp',
    siteName: 'KUON R&D / 空音開発', type: 'website', locale: 'ja_JP',
  },
  robots: { index: true, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
