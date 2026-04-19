'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const sans = '"Helvetica Neue", Arial, sans-serif';
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';

const OWNER_EMAIL = '369@kotaroasahina.com';

// ISO country code → flag emoji (e.g. "JP" → "🇯🇵")
function countryFlag(code: string): string {
  if (!code || code.length !== 2) return '';
  const offset = 0x1F1E6 - 65; // 'A' = 65
  return String.fromCodePoint(
    code.charCodeAt(0) + offset,
    code.charCodeAt(1) + offset
  );
}

// Country code → name (common ones)
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
  email: string;
  name: string;
  instrument: string;
  region: string;
  plan: 'free' | 'student' | 'pro';
  badges: string[];
  createdAt: string;
  lastLoginAt: string;
  appUsage: Record<string, number>;
  appUsageMonth: string;
  country: string;
  city: string;
}

interface Stats {
  total: number;
  free: number;
  student: number;
  pro: number;
  filtered: number;
}

interface UsersResponse {
  users: UserInfo[];
  stats: Stats;
  page: number;
  totalPages: number;
  limit: number;
}

interface PageviewDay {
  date: string;
  total: number;
  countries: Record<string, number>;
  pages: Record<string, number>;
}

interface PageviewResponse {
  days: PageviewDay[];
  summary: {
    totalViews: number;
    countries: Record<string, number>;
    topPages: [string, number][];
  };
}

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

  // Auth check
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/auth/login'); return; }
        const me = await res.json();
        if (me.email !== OWNER_EMAIL) { router.push('/'); return; }
        setAuthed(true);
      } catch {
        router.push('/auth/login');
      }
    })();
  }, [router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (planFilter) params.set('plan', planFilter);
      params.set('page', String(page));
      params.set('limit', '50');

      const res = await fetch(`/api/auth/admin/users?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json();
        setFetchError(err.error || 'Failed to fetch');
        return;
      }
      const result: UsersResponse = await res.json();
      setData(result);
    } catch {
      setFetchError('Network error');
    } finally {
      setLoading(false);
    }
  }, [search, planFilter, page]);

  const fetchPageviews = useCallback(async () => {
    setPvLoading(true);
    try {
      const res = await fetch('/api/auth/admin/pageviews?days=14');
      if (res.ok) {
        const result: PageviewResponse = await res.json();
        setPvData(result);
      }
    } catch { /* silent */ } finally {
      setPvLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authed) {
      fetchUsers();
      fetchPageviews();
    }
  }, [authed, fetchUsers, fetchPageviews]);

  const handlePlanChange = async (email: string, newPlan: string) => {
    if (!confirm(`${email} のプランを ${newPlan} に変更しますか？`)) return;
    setChangingPlan(email);
    try {
      const res = await fetch('/api/auth/admin/plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan: newPlan }),
      });
      if (res.ok) {
        fetchUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to change plan');
      }
    } catch {
      alert('Network error');
    } finally {
      setChangingPlan(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const planBadge = (plan: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      free: { bg: '#f1f5f9', text: '#64748b' },
      student: { bg: '#dbeafe', text: '#1d4ed8' },
      pro: { bg: '#fef3c7', text: '#d97706' },
    };
    const c = colors[plan] || colors.free;
    return (
      <span style={{
        display: 'inline-block', padding: '2px 10px', borderRadius: 20,
        fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em',
        background: c.bg, color: c.text, textTransform: 'uppercase',
      }}>
        {plan}
      </span>
    );
  };

  const formatDate = (iso: string) => {
    if (!iso) return '\u2014';
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const formatTime = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // PV chart: find max for scaling
  const pvDays = pvData?.days ? [...pvData.days].reverse() : []; // oldest first for chart
  const pvMax = Math.max(1, ...pvDays.map(d => d.total));

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: sans }}>
      {/* Header */}
      <div style={{
        background: '#0f172a', color: '#fff', padding: '1.2rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: serif, fontSize: '1.2rem', fontWeight: 300, letterSpacing: '0.15em', color: '#fff' }}>
              空音開発
            </span>
          </Link>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', letterSpacing: '0.08em' }}>
            ADMIN DASHBOARD
          </span>
        </div>
        <Link href="/mypage" style={{ color: '#94a3b8', fontSize: '0.8rem', textDecoration: 'none' }}>
          ← マイページに戻る
        </Link>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1rem' }}>

        {/* ───── Stats Cards ───── */}
        {data?.stats && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem', marginBottom: '2rem',
          }}>
            {[
              { label: '全ユーザー', value: data.stats.total, color: '#0f172a' },
              { label: 'Free', value: data.stats.free, color: '#64748b' },
              { label: 'Student', value: data.stats.student, color: '#1d4ed8' },
              { label: 'Pro', value: data.stats.pro, color: '#d97706' },
              { label: '今日のPV', value: pvData?.days?.[0]?.total ?? 0, color: '#059669' },
              { label: '14日間PV', value: pvData?.summary?.totalViews ?? 0, color: '#7c3aed' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: '#fff', borderRadius: 12, padding: '1.2rem 1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', textAlign: 'center',
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color, letterSpacing: '-0.02em' }}>
                  {value.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem', letterSpacing: '0.05em' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ───── Pageview Chart ───── */}
        {!pvLoading && pvData && (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem',
            marginBottom: '2rem',
          }}>
            {/* Bar chart */}
            <div style={{
              background: '#fff', borderRadius: 12, padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '1rem', letterSpacing: '0.03em' }}>
                日次アクセス数（14日間）
              </h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120 }}>
                {pvDays.map((day) => {
                  const h = pvMax > 0 ? Math.max(2, (day.total / pvMax) * 110) : 2;
                  const isToday = day.date === pvDays[pvDays.length - 1]?.date;
                  return (
                    <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: day.total > 0 ? 600 : 400 }}>
                        {day.total > 0 ? day.total : ''}
                      </span>
                      <div style={{
                        width: '100%', height: h, borderRadius: '4px 4px 0 0',
                        background: isToday ? 'linear-gradient(180deg, #059669, #10b981)' : 'linear-gradient(180deg, #0284c7, #38bdf8)',
                        transition: 'height 0.3s',
                      }} />
                      <span style={{ fontSize: '0.6rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                        {day.date.slice(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Country distribution */}
            <div style={{
              background: '#fff', borderRadius: 12, padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '1rem', letterSpacing: '0.03em' }}>
                アクセス国（14日間）
              </h3>
              {(() => {
                const countries = pvData.summary.countries;
                const sorted = Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 10);
                const total = Object.values(countries).reduce((s, n) => s + n, 0) || 1;
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {sorted.length === 0 ? (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>データなし</span>
                    ) : sorted.map(([cc, count]) => (
                      <div key={cc} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.2rem', width: 28 }}>{countryFlag(cc)}</span>
                        <span style={{ fontSize: '0.8rem', color: '#475569', flex: 1 }}>
                          {COUNTRY_NAMES[cc] || cc}
                        </span>
                        <div style={{
                          width: 60, height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${(count / total) * 100}%`, height: '100%',
                            background: 'linear-gradient(90deg, #0284c7, #38bdf8)', borderRadius: 3,
                          }} />
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', width: 32, textAlign: 'right' }}>
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* ───── Top Pages ───── */}
        {!pvLoading && pvData && pvData.summary.topPages.length > 0 && (
          <div style={{
            background: '#fff', borderRadius: 12, padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '2rem',
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '1rem', letterSpacing: '0.03em' }}>
              人気ページ TOP 10（14日間）
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {pvData.summary.topPages.slice(0, 10).map(([path, count]) => (
                <span key={path} style={{
                  padding: '4px 12px', background: '#f8fafc', borderRadius: 6,
                  fontSize: '0.8rem', color: '#475569', border: '1px solid #e2e8f0',
                }}>
                  <strong>{path}</strong>
                  <span style={{ marginLeft: 6, color: '#94a3b8' }}>{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ───── Search & Filter ───── */}
        <div style={{
          background: '#fff', borderRadius: 12, padding: '1.2rem 1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '1.5rem',
          display: 'flex', flexWrap: 'wrap', gap: '0.8rem', alignItems: 'center',
        }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 300px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="メール、名前、楽器で検索..."
              style={{
                flex: 1, padding: '0.6rem 1rem', border: '1px solid #e2e8f0',
                borderRadius: 8, fontSize: '0.9rem', fontFamily: sans, outline: 'none',
              }}
            />
            <button type="submit" style={{
              padding: '0.6rem 1.2rem', background: '#0284c7', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: '0.85rem', cursor: 'pointer', fontFamily: sans,
            }}>
              検索
            </button>
          </form>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>プラン:</span>
            {['', 'free', 'student', 'pro'].map((p) => (
              <button
                key={p}
                onClick={() => { setPlanFilter(p); setPage(1); }}
                style={{
                  padding: '0.4rem 0.8rem',
                  border: planFilter === p ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  borderRadius: 6, background: planFilter === p ? '#eff6ff' : '#fff',
                  color: planFilter === p ? '#0284c7' : '#64748b',
                  fontSize: '0.8rem', cursor: 'pointer', fontFamily: sans,
                  fontWeight: planFilter === p ? 600 : 400,
                }}
              >
                {p || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* ───── Error ───── */}
        {fetchError && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8,
            padding: '1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.9rem',
          }}>
            {fetchError}
          </div>
        )}

        {/* ───── Loading ───── */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#0284c7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ───── User Table ───── */}
        {!loading && data && (
          <>
            <div style={{
              background: '#fff', borderRadius: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden',
            }}>
              {(search || planFilter) && (
                <div style={{ padding: '0.8rem 1.5rem', borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem', color: '#64748b' }}>
                  {data.stats.filtered} 件ヒット / 全 {data.stats.total} ユーザー
                </div>
              )}

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      {['国', 'メール', '名前', '楽器', 'プラン', '登録日', '最終ログイン', '今月使用', '操作'].map(h => (
                        <th key={h} style={{
                          padding: '0.8rem 0.7rem', textAlign: 'left', fontWeight: 600,
                          color: '#475569', whiteSpace: 'nowrap', fontSize: '0.8rem', letterSpacing: '0.03em',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                          ユーザーが見つかりません
                        </td>
                      </tr>
                    ) : (
                      data.users.map((user) => (
                        <tr key={user.email} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          {/* Country flag */}
                          <td style={{ padding: '0.8rem 0.7rem', textAlign: 'center' }}>
                            {user.country ? (
                              <span title={`${COUNTRY_NAMES[user.country] || user.country}${user.city ? ` / ${user.city}` : ''}`} style={{ fontSize: '1.3rem', cursor: 'default' }}>
                                {countryFlag(user.country)}
                              </span>
                            ) : (
                              <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{'\u2014'}</span>
                            )}
                          </td>
                          <td style={{ padding: '0.8rem 0.7rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            <span style={{ fontWeight: 500 }}>{user.email}</span>
                          </td>
                          <td style={{ padding: '0.8rem 0.7rem', whiteSpace: 'nowrap' }}>
                            {user.name || <span style={{ color: '#cbd5e1' }}>{'\u2014'}</span>}
                          </td>
                          <td style={{ padding: '0.8rem 0.7rem', whiteSpace: 'nowrap' }}>
                            {user.instrument || <span style={{ color: '#cbd5e1' }}>{'\u2014'}</span>}
                          </td>
                          <td style={{ padding: '0.8rem 0.7rem' }}>
                            {planBadge(user.plan)}
                          </td>
                          <td style={{ padding: '0.8rem 0.7rem', whiteSpace: 'nowrap', color: '#64748b' }}>
                            {formatDate(user.createdAt)}
                          </td>
                          <td style={{ padding: '0.8rem 0.7rem', whiteSpace: 'nowrap', color: '#64748b' }}>
                            {formatDate(user.lastLoginAt)}
                            <span style={{ marginLeft: 4, fontSize: '0.75rem', color: '#94a3b8' }}>
                              {formatTime(user.lastLoginAt)}
                            </span>
                          </td>
                          <td style={{ padding: '0.8rem 0.7rem' }}>
                            {user.appUsage && Object.keys(user.appUsage).length > 0 ? (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                                {Object.entries(user.appUsage).map(([app, count]) => (
                                  <span key={app} style={{
                                    fontSize: '0.7rem', background: '#f1f5f9', padding: '1px 6px',
                                    borderRadius: 4, color: '#475569', whiteSpace: 'nowrap',
                                  }}>
                                    {app}: {count}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>{'\u2014'}</span>
                            )}
                          </td>
                          <td style={{ padding: '0.8rem 0.7rem' }}>
                            <select
                              value={user.plan}
                              onChange={(e) => handlePlanChange(user.email, e.target.value)}
                              disabled={changingPlan === user.email}
                              style={{
                                padding: '0.3rem 0.5rem', border: '1px solid #e2e8f0',
                                borderRadius: 6, fontSize: '0.8rem', fontFamily: sans,
                                cursor: changingPlan === user.email ? 'wait' : 'pointer',
                                background: changingPlan === user.email ? '#f1f5f9' : '#fff',
                              }}
                            >
                              <option value="free">Free</option>
                              <option value="student">Student</option>
                              <option value="pro">Pro</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                gap: '0.5rem', marginTop: '1.5rem',
              }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  style={{
                    padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: 6,
                    background: '#fff', color: page <= 1 ? '#cbd5e1' : '#475569',
                    cursor: page <= 1 ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontFamily: sans,
                  }}
                >
                  ← 前
                </button>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {data.page} / {data.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                  disabled={page >= data.totalPages}
                  style={{
                    padding: '0.5rem 1rem', border: '1px solid #e2e8f0', borderRadius: 6,
                    background: '#fff', color: page >= data.totalPages ? '#cbd5e1' : '#475569',
                    cursor: page >= data.totalPages ? 'not-allowed' : 'pointer', fontSize: '0.85rem', fontFamily: sans,
                  }}
                >
                  次 →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Responsive: stack PV chart on mobile */}
      <style>{`
        @media (max-width: 767px) {
          div[style*="grid-template-columns: 1fr 280px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
