// Edge Runtime 必須 (動的ルート)
export const runtime = 'edge';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
