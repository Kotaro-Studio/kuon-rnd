import { redirect } from 'next/navigation';

/**
 * /theory — KUON Music Theory Suite (準備中)
 * =========================================================
 * MVP 公開後はこのパスが実際の学習アプリ (スキルツリー UI + ダッシュボード) になる。
 * 現状は LP へのリダイレクト。
 */
export default function TheoryRedirect() {
  redirect('/theory-lp');
}
