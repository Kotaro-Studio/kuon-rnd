import { redirect } from 'next/navigation';

/**
 * /for-schools — 廃止 (2026-04-29)
 * 機能していなかったため、ホームへリダイレクトに変更。
 * フッターからのリンクも削除済み。
 * 教育機関営業の機能を再開する場合はオーナー判断で復活させること。
 */
export default function ForSchoolsRedirect() {
  redirect('/');
}
