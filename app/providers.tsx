'use client';
import { LangProvider } from '@/context/LangContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <LangProvider>{children}</LangProvider>;
}
