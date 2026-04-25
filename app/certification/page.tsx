// 認定制度を採用しない決定により、このページはホームページへリダイレクトする
// 決定日: 2026-04-25 / 根拠: CLAUDE.md §37.5
// ページ削除ではなくリダイレクト化することで既存リンク (Google検索結果・SNS等) からの 404 を回避

import { redirect } from 'next/navigation';

export default function CertificationRedirect(): never {
  redirect('/');
}
