import type { Metadata } from 'next';

// 認定制度を採用しない決定により、このページはリダイレクト化された
// 決定日: 2026-04-25 / 根拠: CLAUDE.md §37.5
// noindex を設定して検索エンジンに登録されないようにする

export const metadata: Metadata = {
  title: 'Kuon R&D',
  robots: { index: false, follow: false },
};

export default function CertificationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
