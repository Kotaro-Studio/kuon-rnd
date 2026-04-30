// 動的ルートのため Edge Runtime 必須 (Cloudflare Pages ビルド要件)
export const runtime = 'edge';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
