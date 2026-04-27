// 動的ルート ([jobId]) は Cloudflare Pages ビルド要件として
// layout.tsx に runtime = 'edge' が必要
export const runtime = 'edge';

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
