'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { LangProvider } from '@/context/LangContext';

/** Lightweight page-view tracker — fires once per navigation, no auth required */
function PageviewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    // Fire-and-forget: don't block rendering
    fetch('/api/auth/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => { /* silent */ });
  }, [pathname]);
  return null;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider>
      <PageviewTracker />
      {children}
    </LangProvider>
  );
}
