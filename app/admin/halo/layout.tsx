import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KUON HALO (Admin) — Curanz Production',
  description: 'Owner-only healing audio synthesizer for Curanz Sounds production.',
  // 完全 noindex (admin 配下・オーナー専用)
  robots: { index: false, follow: false, nocache: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
