import type { Metadata } from 'next';

/**
 * 教師向け説明 LP のメタデータ
 *
 * 重要: 本番サイトには一切リンクされていない隠しページ。
 * - 検索エンジンに非掲載 (robots noindex/nofollow/noarchive)
 * - sitemap.ts に追加しない
 * - ヘッダー/フッター/トップページからリンクしない
 * - パスワード "kuon" でゲート
 *
 * 唯一のアクセス経路: /admin/coupons (オーナー専用ダッシュボード) からのリンク
 *
 * 用途: オーナーが知り合いのミュージシャン/教師に Kuon の学生クーポン制度を
 * 説明する際に、ミーティング前後に共有する LP。コードは別途 /admin/coupons から発行する。
 */
export const metadata: Metadata = {
  // メタデータは検索エンジン非掲載 (noindex) なので主要言語の英語版で十分
  title: 'For Teachers (Private) — Kuon R&D',
  description: 'Private invitation page for music educators. Symphony plan and student-discount codes.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    notranslate: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-snippet': -1,
      'max-image-preview': 'none',
      'max-video-preview': -1,
    },
  },
};

export default function ForTeachersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
