// 動的ルート ([predictionId]) は Cloudflare Pages ビルドのために
// 必ず Edge Runtime を明示する必要がある (CLAUDE.md §15 失敗③参照)。
export const runtime = 'edge';

export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
