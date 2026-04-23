'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UtmGenerator from './UtmGenerator';
import { aggregateByCanonical, rankReferrers } from '@/lib/referrer';

const sans = '"Helvetica Neue", Arial, sans-serif';
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const mono = '"SF Mono", "Fira Code", Consolas, monospace';

const OWNER_EMAIL = '369@kotaroasahina.com';

// ISO country code → flag emoji (e.g. "JP" → "🇯🇵")
function countryFlag(code: string): string {
  if (!code || code.length !== 2 || code === 'XX') return '';
  const offset = 0x1F1E6 - 65;
  return String.fromCodePoint(
    code.charCodeAt(0) + offset,
    code.charCodeAt(1) + offset
  );
}

const COUNTRY_NAMES: Record<string, string> = {
  JP: 'Japan', US: 'United States', GB: 'United Kingdom', DE: 'Germany',
  FR: 'France', ES: 'Spain', IT: 'Italy', BR: 'Brazil', AR: 'Argentina',
  KR: 'South Korea', CN: 'China', TW: 'Taiwan', AU: 'Australia',
  CA: 'Canada', MX: 'Mexico', PT: 'Portugal', NL: 'Netherlands',
  SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland',
  AT: 'Austria', CH: 'Switzerland', BE: 'Belgium', PL: 'Poland',
  RU: 'Russia', IN: 'India', TH: 'Thailand', SG: 'Singapore',
  MY: 'Malaysia', PH: 'Philippines', ID: 'Indonesia', VN: 'Vietnam',
  NZ: 'New Zealand', IE: 'Ireland', CZ: 'Czech Republic', HU: 'Hungary',
  CL: 'Chile', CO: 'Colombia', PE: 'Peru', XX: 'Unknown',
};

interface UserInfo {
  email: string; name: string; instrument: string; region: string;
  plan: 'free' | 'student' | 'pro'; badges: string[];
  createdAt: string; lastLoginAt: string;
  appUsage: Record<string, number>; appUsageMonth: string;
  country: string; city: string;
}
interface Stats { total: number; free: number; student: number; pro: number; filtered: number; }
interface UsersResponse { users: UserInfo[]; stats: Stats; page: number; totalPages: number; limit: number; }
interface PageviewDay { date: string; total: number; countries: Record<string, number>; pages: Record<string, number>; referrers?: Record<string, number>; utm?: Record<string, number>; }
interface PageviewResponse { days: PageviewDay[]; summary: { totalViews: number; countries: Record<string, number>; topPages: [string, number][]; referrers?: Record<string, number>; utm?: Record<string, number>; }; }

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UsersResponse | null>(null);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [page, setPage] = useState(1);
  const [fetchError, setFetchError] = useState('');
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [pvData, setPvData] = useState<PageviewResponse | null>(null);
  const [pvLoading, setPvLoading] = useState(true);

  // ─── Fix scroll on reload ───
  useEffect(() => { window.scrollTo(0, 0); }, []);

  // Auth check
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/auth/login'); return; }
        const me = await res.json();
        if (me.email !== OWNER_EMAIL) { router.push('/'); return; }
        setAuthed(true);
      } catch { router.push('/auth/login'); }
    })();
  }, [router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true); setFetchError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (planFilter) params.set('plan', planFilter);
      params.set('page', String(page));
      params.set('limit', '50');
      const res = await fetch(`/api/auth/admin/users?${params.toString()}`);
      if (!res.ok) { const err = await res.json(); setFetchError(err.error || 'Failed to fetch'); return; }
      setData(await res.json());
    } catch { setFetchError('Network error'); } finally { setLoading(false); }
  }, [search, planFilter, page]);

  // Fetch 30 days for 1d / 7d / 30d
  const fetchPageviews = useCallback(async () => {
    setPvLoading(true);
    try {
      const res = await fetch('/api/auth/admin/pageviews?days=30');
      if (res.ok) setPvData(await res.json());
    } catch { /* silent */ } finally { setPvLoading(false); }
  }, []);

  useEffect(() => { if (authed) { fetchUsers(); fetchPageviews(); } }, [authed, fetchUsers, fetchPageviews]);

  const handlePlanChange = async (email: string, newPlan: string) => {
    if (!confirm(`${email} のプランを ${newPlan} に変更しますか？`)) return;
    setChangingPlan(email);
    try {
      const res = await fetch('/api/auth/admin/plan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, plan: newPlan }) });
      if (res.ok) fetchUsers(); else { const err = await res.json(); alert(err.error || 'Failed'); }
    } catch { alert('Network error'); } finally { setChangingPlan(null); }
  };

  const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchUsers(); };

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #334155', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Computed PV Data ───
  const pvDays = pvData?.days ? [...pvData.days].reverse() : [];
  const pvMax = Math.max(1, ...pvDays.map(d => d.total));

  const todayPv = pvDays.length > 0 ? pvDays[pvDays.length - 1]?.total ?? 0 : 0;
  const pv7d = pvDays.slice(-7).reduce((s, d) => s + d.total, 0);
  const pv30d = pvDays.reduce((s, d) => s + d.total, 0);

  // Compute 30-day country aggregation
  const countries30d: Record<string, number> = {};
  pvDays.forEach(d => { Object.entries(d.countries).forEach(([cc, n]) => { countries30d[cc] = (countries30d[cc] || 0) + n; }); });

  // Compute 30-day top pages
  const pages30d: Record<string, number> = {};
  pvDays.forEach(d => { Object.entries(d.pages).forEach(([p, n]) => { pages30d[p] = (pages30d[p] || 0) + n; }); });
  const topPages30d = Object.entries(pages30d).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // Compute 30-day canonical referrer ranking (read-time normalization)
  const referrersRaw30d: Record<string, number> = {};
  pvDays.forEach(d => { if (d.referrers) Object.entries(d.referrers).forEach(([h, n]) => { referrersRaw30d[h] = (referrersRaw30d[h] || 0) + n; }); });
  const referrerRanking = rankReferrers(aggregateByCanonical(referrersRaw30d)).slice(0, 10);

  // Compute 30-day UTM campaign ranking
  const utmRaw30d: Record<string, number> = {};
  pvDays.forEach(d => { if (d.utm) Object.entries(d.utm).forEach(([k, n]) => { utmRaw30d[k] = (utmRaw30d[k] || 0) + n; }); });
  const utmRanking = Object.entries(utmRaw30d).sort((a, b) => b[1] - a[1]).slice(0, 10);

  // ─── Motivation: Week-over-week growth ───
  const thisWeek = pvDays.slice(-7).reduce((s, d) => s + d.total, 0);
  const lastWeek = pvDays.slice(-14, -7).reduce((s, d) => s + d.total, 0);
  const wowGrowth = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek * 100) : (thisWeek > 0 ? 100 : 0);

  // ─── Motivation: Active days streak ───
  let streak = 0;
  for (let i = pvDays.length - 1; i >= 0; i--) {
    if (pvDays[i].total > 0) streak++; else break;
  }

  // ─── Motivation: Milestones ───
  const totalUsers = data?.stats?.total ?? 0;
  const nextUserMilestone = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000].find(m => m > totalUsers) ?? 10000;
  const userProgress = Math.min(100, (totalUsers / nextUserMilestone) * 100);

  const nextPvMilestone = [100, 250, 500, 1000, 2500, 5000, 10000].find(m => m > pv30d) ?? 25000;
  const pvProgress = Math.min(100, (pv30d / nextPvMilestone) * 100);

  // ─── Motivation: Daily greeting ───
  const hour = new Date().getHours();
  const greeting = hour < 6 ? '深夜の作業、お疲れ様です' : hour < 12 ? 'おはようございます' : hour < 18 ? 'こんにちは' : 'お疲れ様です';

  const motivationalQuotes = [
    '「1%の改善を毎日続ければ、1年後には37倍になる。」— James Clear',
    '「最も危険なのは、何もしないことだ。」— Denis Waitley',
    '「まず動け。完璧は後からついてくる。」',
    '「ユーザー1人の問題を深く解決すれば、1万人が救われる。」',
    '「成功とは、失敗を繰り返しても情熱を失わないことだ。」— Winston Churchill',
    '「世界を変えるプロダクトは、ガレージから生まれた。」',
    '「今日もあなたのコードが、どこかの音楽家を助けている。」',
  ];
  const dailyQuote = motivationalQuotes[Math.floor(Date.now() / 86400000) % motivationalQuotes.length];

  const formatDate = (iso: string) => { if (!iso) return '\u2014'; const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const formatTime = (iso: string) => { if (!iso) return ''; const d = new Date(iso); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };

  const planBadge = (plan: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      free: { bg: '#f1f5f9', text: '#64748b' },
      student: { bg: '#dbeafe', text: '#1d4ed8' },
      pro: { bg: '#fef3c7', text: '#d97706' },
    };
    const c = colors[plan] || colors.free;
    return <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em', background: c.bg, color: c.text, textTransform: 'uppercase' }}>{plan}</span>;
  };

  // ─── Unknown country display helper ───
  const countryDisplay = (code: string) => {
    if (!code || code === 'XX') {
      return (
        <span title="Unknown / VPN" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 16, borderRadius: 3, background: '#e2e8f0', fontSize: '0.65rem', color: '#94a3b8', fontWeight: 700, lineHeight: 1, verticalAlign: 'middle' }}>
          ?
        </span>
      );
    }
    return <span style={{ fontSize: '1.2rem' }}>{countryFlag(code)}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: sans, color: '#e2e8f0' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .6; } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        .admin-card { animation: slideIn .5s cubic-bezier(.16,1,.3,1) both; }
        @media (max-width: 767px) {
          .pv-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ─── Header ─── */}
      <div style={{ background: '#020617', borderBottom: '1px solid #1e293b', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: serif, fontSize: '1.1rem', fontWeight: 300, letterSpacing: '0.15em', color: '#e2e8f0' }}>空音開発</span>
          </Link>
          <span style={{ fontFamily: mono, fontSize: '0.7rem', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Admin Dashboard</span>
        </div>
        <Link href="/mypage" style={{ color: '#64748b', fontSize: '0.8rem', textDecoration: 'none' }}>← マイページ</Link>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>

        {/* ═══════ Motivation Hero ═══════ */}
        <div className="admin-card" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)', borderRadius: 16, padding: 'clamp(20px,3vw,32px)', marginBottom: '1.5rem', border: '1px solid #1e293b', animationDelay: '0s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>{greeting}、幸太郎さん</div>
              <div style={{ fontFamily: serif, fontSize: 'clamp(18px,3.5vw,26px)', fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
                空音開発 コマンドセンター
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', maxWidth: 500, lineHeight: 1.6 }}>
                {dailyQuote}
              </div>
            </div>
            {/* Streak badge */}
            {streak > 0 && (
              <div style={{ background: streak >= 7 ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)', borderRadius: 12, padding: '12px 20px', textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{streak}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)', marginTop: 4, letterSpacing: '0.05em' }}>日連続アクセス</div>
                {streak >= 7 && <div style={{ fontSize: '0.6rem', marginTop: 2 }}>🔥 ON FIRE</div>}
              </div>
            )}
          </div>

          {/* Milestone progress bars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginTop: 20 }}>
            {/* User milestone */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.05em' }}>USERS</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Next: {nextUserMilestone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', fontFamily: mono }}>{totalUsers}</span>
                <div style={{ flex: 1, height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${userProgress}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #38bdf8)', borderRadius: 3, transition: 'width .6s' }} />
                </div>
              </div>
            </div>
            {/* 30-day PV milestone */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.05em' }}>30-DAY PV</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Next: {nextPvMilestone.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a78bfa', fontFamily: mono }}>{pv30d.toLocaleString()}</span>
                <div style={{ flex: 1, height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pvProgress}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: 3, transition: 'width .6s' }} />
                </div>
              </div>
            </div>
            {/* WoW Growth */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: 6 }}>WEEK vs PREV WEEK</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: wowGrowth >= 0 ? '#34d399' : '#f87171', fontFamily: mono }}>
                  {wowGrowth >= 0 ? '+' : ''}{wowGrowth.toFixed(0)}%
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {thisWeek} vs {lastWeek}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ Stats Cards (1d / 7d / 30d) ═══════ */}
        {data?.stats && (
          <div className="admin-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem', animationDelay: '.05s' }}>
            {[
              { label: '全ユーザー', value: data.stats.total, color: '#f8fafc', icon: '👥' },
              { label: 'Free', value: data.stats.free, color: '#94a3b8', icon: '' },
              { label: 'Student', value: data.stats.student, color: '#60a5fa', icon: '' },
              { label: 'Pro', value: data.stats.pro, color: '#fbbf24', icon: '' },
              { label: '今日のPV', value: todayPv, color: '#34d399', icon: '' },
              { label: '7日間PV', value: pv7d, color: '#38bdf8', icon: '' },
              { label: '30日間PV', value: pv30d, color: '#a78bfa', icon: '' },
            ].map(({ label, value, color, icon }) => (
              <div key={label} style={{ background: '#1e293b', borderRadius: 12, padding: '1rem 0.8rem', textAlign: 'center', border: '1px solid #334155' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color, fontFamily: mono, letterSpacing: '-0.02em' }}>
                  {icon}{value.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', letterSpacing: '0.06em' }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════ Chart + Countries (side by side) ═══════ */}
        {!pvLoading && pvData && (
          <div className="admin-card pv-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '0.8rem', marginBottom: '1.5rem', animationDelay: '.1s' }}>
            {/* Bar chart */}
            <div style={{ background: '#1e293b', borderRadius: 12, padding: '1.2rem', border: '1px solid #334155' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                日次アクセス数（30日間）
              </h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 120 }}>
                {pvDays.map((day, idx) => {
                  const h = pvMax > 0 ? Math.max(2, (day.total / pvMax) * 110) : 2;
                  const isToday = idx === pvDays.length - 1;
                  const isThisWeek = idx >= pvDays.length - 7;
                  return (
                    <div key={day.date} title={`${day.date}: ${day.total} PV`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'default' }}>
                      <span style={{ fontSize: '0.55rem', color: '#64748b', fontWeight: day.total > 0 ? 600 : 400, opacity: day.total > 0 ? 1 : 0 }}>
                        {day.total > 0 ? day.total : ''}
                      </span>
                      <div style={{
                        width: '100%', height: h, borderRadius: '3px 3px 0 0',
                        background: isToday ? 'linear-gradient(180deg, #34d399, #059669)' : isThisWeek ? 'linear-gradient(180deg, #38bdf8, #0284c7)' : 'linear-gradient(180deg, #475569, #334155)',
                        transition: 'height 0.3s',
                      }} />
                      {(idx === pvDays.length - 1 || idx === pvDays.length - 8 || idx === pvDays.length - 15 || idx === 0) && (
                        <span style={{ fontSize: '0.5rem', color: '#475569', whiteSpace: 'nowrap' }}>{day.date.slice(5)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, justifyContent: 'flex-end' }}>
                <span style={{ fontSize: '0.6rem', color: '#475569' }}><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#334155', marginRight: 4, verticalAlign: 'middle' }} />過去</span>
                <span style={{ fontSize: '0.6rem', color: '#0284c7' }}><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#0284c7', marginRight: 4, verticalAlign: 'middle' }} />直近7日</span>
                <span style={{ fontSize: '0.6rem', color: '#059669' }}><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#059669', marginRight: 4, verticalAlign: 'middle' }} />今日</span>
              </div>
            </div>

            {/* Country distribution (30d) */}
            <div style={{ background: '#1e293b', borderRadius: 12, padding: '1.2rem', border: '1px solid #334155' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                アクセス国（30日間）
              </h3>
              {(() => {
                const sorted = Object.entries(countries30d).sort((a, b) => b[1] - a[1]).slice(0, 10);
                const total = Object.values(countries30d).reduce((s, n) => s + n, 0) || 1;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                    {sorted.length === 0 ? (
                      <span style={{ color: '#475569', fontSize: '0.85rem' }}>データなし</span>
                    ) : sorted.map(([cc, count]) => (
                      <div key={cc} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: 26, textAlign: 'center', flexShrink: 0 }}>
                          {countryDisplay(cc)}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {cc === 'XX' ? 'Unknown / VPN' : (COUNTRY_NAMES[cc] || cc)}
                        </span>
                        <div style={{ width: 50, height: 5, background: '#334155', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                          <div style={{ width: `${(count / total) * 100}%`, height: '100%', background: cc === 'XX' ? '#475569' : 'linear-gradient(90deg, #0284c7, #38bdf8)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: '0.7rem', color: '#64748b', width: 28, textAlign: 'right', fontFamily: mono }}>{count}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ═══════ Top Pages Ranking ═══════ */}
        {!pvLoading && topPages30d.length > 0 && (
          <div className="admin-card" style={{ background: '#1e293b', borderRadius: 12, padding: '1.2rem', border: '1px solid #334155', marginBottom: '1.5rem', animationDelay: '.15s' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '1rem', letterSpacing: '0.05em' }}>
              人気ページ TOP 10（30日間）
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {topPages30d.map(([path, count], idx) => {
                const maxCount = topPages30d[0]?.[1] ?? 1;
                const barWidth = (count / maxCount) * 100;
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
                return (
                  <div key={path} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: idx < 3 ? 'rgba(56,189,248,0.04)' : 'transparent' }}>
                    <span style={{ width: 24, fontSize: idx < 3 ? '1rem' : '0.75rem', textAlign: 'center', color: '#64748b', fontWeight: 700, fontFamily: mono, flexShrink: 0 }}>
                      {medal || (idx + 1)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: '0.8rem', color: idx < 3 ? '#f8fafc' : '#94a3b8', fontWeight: idx < 3 ? 600 : 400, fontFamily: mono, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          kuon-rnd.com{path === '/' ? '' : path}
                        </span>
                      </div>
                      <div style={{ height: 3, background: '#334155', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${barWidth}%`, height: '100%', background: idx === 0 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : idx === 1 ? 'linear-gradient(90deg, #94a3b8, #cbd5e1)' : idx === 2 ? 'linear-gradient(90deg, #b45309, #d97706)' : 'linear-gradient(90deg, #475569, #64748b)', borderRadius: 2, transition: 'width .4s' }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: idx < 3 ? '#f8fafc' : '#64748b', fontWeight: 700, fontFamily: mono, width: 36, textAlign: 'right', flexShrink: 0 }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════ Referrer Ranking (canonical) ═══════ */}
        {!pvLoading && referrerRanking.length > 0 && (
          <div className="admin-card" style={{ background: '#1e293b', borderRadius: 12, padding: '1.2rem', border: '1px solid #334155', marginBottom: '1.5rem', animationDelay: '.17s' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '1rem', letterSpacing: '0.05em' }}>
              流入元 TOP 10（30日間・正規化済み）
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {referrerRanking.map(({ source, count }, idx) => {
                const maxCount = referrerRanking[0]?.count ?? 1;
                const barWidth = (count / maxCount) * 100;
                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '';
                return (
                  <div key={source} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8, background: idx < 3 ? 'rgba(167,139,250,0.05)' : 'transparent' }}>
                    <span style={{ width: 24, fontSize: idx < 3 ? '1rem' : '0.75rem', textAlign: 'center', color: '#64748b', fontWeight: 700, fontFamily: mono, flexShrink: 0 }}>
                      {medal || (idx + 1)}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: '0.85rem', color: idx < 3 ? '#f8fafc' : '#94a3b8', fontWeight: idx < 3 ? 600 : 400, fontFamily: mono, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {source}
                        </span>
                      </div>
                      <div style={{ height: 3, background: '#334155', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${barWidth}%`, height: '100%', background: idx === 0 ? 'linear-gradient(90deg, #a78bfa, #c4b5fd)' : idx === 1 ? 'linear-gradient(90deg, #94a3b8, #cbd5e1)' : idx === 2 ? 'linear-gradient(90deg, #7c3aed, #a78bfa)' : 'linear-gradient(90deg, #475569, #64748b)', borderRadius: 2, transition: 'width .4s' }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: idx < 3 ? '#f8fafc' : '#64748b', fontWeight: 700, fontFamily: mono, width: 36, textAlign: 'right', flexShrink: 0 }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: 10, fontFamily: sans }}>
              l.instagram.com / lm.facebook.com / t.co などのリダイレクトホストは正規化して集約表示。direct はリファラー無しの直接アクセス。
            </div>
          </div>
        )}

        {/* ═══════ UTM Campaign Ranking ═══════ */}
        {!pvLoading && utmRanking.length > 0 && (
          <div className="admin-card" style={{ background: '#1e293b', borderRadius: 12, padding: '1.2rem', border: '1px solid #334155', marginBottom: '1.5rem', animationDelay: '.19s' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '1rem', letterSpacing: '0.05em' }}>
              UTM キャンペーン TOP 10（30日間）
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {utmRanking.map(([key, count], idx) => {
                const maxCount = utmRanking[0]?.[1] ?? 1;
                const barWidth = (count / maxCount) * 100;
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8 }}>
                    <span style={{ width: 24, fontSize: '0.75rem', textAlign: 'center', color: '#64748b', fontWeight: 700, fontFamily: mono, flexShrink: 0 }}>
                      {idx + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: mono, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}>
                        {key}
                      </div>
                      <div style={{ height: 3, background: '#334155', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${barWidth}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #7dd3fc)', borderRadius: 2, transition: 'width .4s' }} />
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, fontFamily: mono, width: 36, textAlign: 'right', flexShrink: 0 }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════ Search & Filter ═══════ */}
        <div className="admin-card" style={{ background: '#1e293b', borderRadius: 12, padding: '1rem 1.2rem', border: '1px solid #334155', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center', animationDelay: '.2s' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 300px' }}>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="メール、名前、楽器で検索..."
              style={{ flex: 1, padding: '0.6rem 1rem', border: '1px solid #334155', borderRadius: 8, fontSize: '0.85rem', fontFamily: sans, outline: 'none', background: '#0f172a', color: '#e2e8f0' }} />
            <button type="submit" style={{ padding: '0.6rem 1.2rem', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.85rem', cursor: 'pointer', fontFamily: sans }}>検索</button>
          </form>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>プラン:</span>
            {['', 'free', 'student', 'pro'].map((p) => (
              <button key={p} onClick={() => { setPlanFilter(p); setPage(1); }}
                style={{ padding: '0.35rem 0.7rem', border: planFilter === p ? '2px solid #38bdf8' : '1px solid #334155', borderRadius: 6, background: planFilter === p ? 'rgba(56,189,248,0.1)' : '#0f172a', color: planFilter === p ? '#38bdf8' : '#64748b', fontSize: '0.75rem', cursor: 'pointer', fontFamily: sans, fontWeight: planFilter === p ? 600 : 400 }}>
                {p || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════ Error ═══════ */}
        {fetchError && (
          <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '1rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.9rem' }}>{fetchError}</div>
        )}

        {/* ═══════ Loading ═══════ */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #334155', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
          </div>
        )}

        {/* ═══════ User Table ═══════ */}
        {!loading && data && (
          <>
            <div className="admin-card" style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden', animationDelay: '.25s' }}>
              {(search || planFilter) && (
                <div style={{ padding: '0.7rem 1.2rem', borderBottom: '1px solid #334155', fontSize: '0.8rem', color: '#64748b' }}>
                  {data.stats.filtered} 件ヒット / 全 {data.stats.total} ユーザー
                </div>
              )}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #334155' }}>
                      {['国', 'メール', '名前', '楽器', 'プラン', '登録日', '最終ログイン', '今月使用', '操作'].map(h => (
                        <th key={h} style={{ padding: '0.7rem 0.6rem', textAlign: 'left', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.length === 0 ? (
                      <tr><td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: '#475569' }}>ユーザーが見つかりません</td></tr>
                    ) : data.users.map((user) => (
                      <tr key={user.email} style={{ borderBottom: '1px solid #1e293b' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56,189,248,0.03)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <td style={{ padding: '0.7rem 0.6rem', textAlign: 'center' }}>
                          {user.country ? (
                            <span title={`${COUNTRY_NAMES[user.country] || user.country}${user.city ? ` / ${user.city}` : ''}`} style={{ cursor: 'default' }}>
                              {countryDisplay(user.country)}
                            </span>
                          ) : <span style={{ color: '#334155' }}>{'\u2014'}</span>}
                        </td>
                        <td style={{ padding: '0.7rem 0.6rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{user.email}</span>
                        </td>
                        <td style={{ padding: '0.7rem 0.6rem', whiteSpace: 'nowrap', color: '#94a3b8' }}>
                          {user.name || <span style={{ color: '#334155' }}>{'\u2014'}</span>}
                        </td>
                        <td style={{ padding: '0.7rem 0.6rem', whiteSpace: 'nowrap', color: '#94a3b8' }}>
                          {user.instrument || <span style={{ color: '#334155' }}>{'\u2014'}</span>}
                        </td>
                        <td style={{ padding: '0.7rem 0.6rem' }}>{planBadge(user.plan)}</td>
                        <td style={{ padding: '0.7rem 0.6rem', whiteSpace: 'nowrap', color: '#64748b', fontSize: '0.75rem' }}>{formatDate(user.createdAt)}</td>
                        <td style={{ padding: '0.7rem 0.6rem', whiteSpace: 'nowrap', color: '#64748b', fontSize: '0.75rem' }}>
                          {formatDate(user.lastLoginAt)} <span style={{ color: '#475569' }}>{formatTime(user.lastLoginAt)}</span>
                        </td>
                        <td style={{ padding: '0.7rem 0.6rem' }}>
                          {user.appUsage && Object.keys(user.appUsage).length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                              {Object.entries(user.appUsage).map(([app, count]) => (
                                <span key={app} style={{ fontSize: '0.65rem', background: '#0f172a', padding: '1px 6px', borderRadius: 4, color: '#94a3b8', whiteSpace: 'nowrap', border: '1px solid #334155' }}>
                                  {app}: {count}
                                </span>
                              ))}
                            </div>
                          ) : <span style={{ color: '#334155' }}>{'\u2014'}</span>}
                        </td>
                        <td style={{ padding: '0.7rem 0.6rem' }}>
                          <select value={user.plan} onChange={(e) => handlePlanChange(user.email, e.target.value)} disabled={changingPlan === user.email}
                            style={{ padding: '0.3rem 0.4rem', border: '1px solid #334155', borderRadius: 6, fontSize: '0.75rem', fontFamily: sans, cursor: changingPlan === user.email ? 'wait' : 'pointer', background: '#0f172a', color: '#94a3b8' }}>
                            <option value="free">Free</option>
                            <option value="student">Student</option>
                            <option value="pro">Pro</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #334155', borderRadius: 6, background: '#1e293b', color: page <= 1 ? '#334155' : '#94a3b8', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontFamily: sans }}>← 前</button>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{data.page} / {data.totalPages}</span>
                <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages}
                  style={{ padding: '0.5rem 1rem', border: '1px solid #334155', borderRadius: 6, background: '#1e293b', color: page >= data.totalPages ? '#334155' : '#94a3b8', cursor: page >= data.totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontFamily: sans }}>次 →</button>
              </div>
            )}
          </>
        )}

        {/* ═══════ UTM Link Generator ═══════ */}
        <UtmGenerator />
      </div>
    </div>
  );
}
