'use client';

// ─────────────────────────────────────────────
// /halo-lp は廃止 (HALO はオーナー専用化のため公開 LP 不要)
// ホームへリダイレクト
// ─────────────────────────────────────────────

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HaloLpRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);
  return null;
}
