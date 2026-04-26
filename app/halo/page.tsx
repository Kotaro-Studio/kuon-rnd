'use client';

// ─────────────────────────────────────────────
// /halo は /admin/halo に移行 (オーナー専用化)
// このページは旧 URL を直接踏んだ場合のリダイレクト
// ─────────────────────────────────────────────

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HaloRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/halo');
  }, [router]);
  return null;
}
