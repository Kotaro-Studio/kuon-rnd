// Edge Runtime 必須 (動的ルート)
export const runtime = 'edge';

import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.replace(/-at-.*/, '')} | KUON R&D 公開プロフィール`,
    description: 'KUON R&D / 空音開発 で活動する音楽家の公開プロフィール',
    alternates: { canonical: `https://kuon-rnd.com/u/${slug}` },
    openGraph: {
      title: `${slug.replace(/-at-.*/, '')} | KUON R&D`,
      description: 'KUON R&D の音楽家プロフィール',
      url: `https://kuon-rnd.com/u/${slug}`,
      type: 'profile',
    },
    robots: { index: true, follow: true },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
