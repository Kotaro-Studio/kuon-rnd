'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L3 = Partial<Record<Lang, string>> & { en: string };
const t3 = (m: L3, lang: Lang) => m[lang] ?? m.en;

interface UserData {
  email: string;
  name: string;
  instrument: string;
  region: string;
  bio: string;
  plan: string;
  badges: string[];
  createdAt: string;
  appUsage: Record<string, number>;
  appUsageMonth: string;
}

const PLAN_LABELS: Record<string, L3> = {
  free:    { ja: 'Free',    en: 'Free',    ko: 'Free',    pt: 'Free',    es: 'Gratis'      },
  student: { ja: 'Student', en: 'Student', ko: 'Student', pt: 'Student', es: 'Estudiante'  },
  pro:     { ja: 'Pro',     en: 'Pro',     ko: 'Pro',     pt: 'Pro',     es: 'Pro'         },
};

const PLAN_COLORS: Record<string, string> = {
  free: '#64748b',
  student: '#0284c7',
  pro: '#7c3aed',
};

export default function MyPage() {
  const { lang } = useLang();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', instrument: '', region: '', bio: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/auth/login');
          return;
        }
        const data: UserData = await res.json();
        setUser(data);
        setForm({ name: data.name, instrument: data.instrument, region: data.region, bio: data.bio });
      } catch {
        router.push('/auth/login');
      }
      setLoading(false);
    })();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => prev ? { ...prev, ...data.user } : prev);
        // localStorage も更新
        if (typeof window !== 'undefined') {
          localStorage.setItem('kuon_user', JSON.stringify({
            email: data.user.email,
            name: data.user.name,
            plan: data.user.plan,
          }));
        }
        setEditing(false);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kuon_user');
      localStorage.removeItem('kuon_first_visit');
    }
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid #e2e8f0',
          borderTopColor: ACCENT,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  const planColor = PLAN_COLORS[user.plan] || PLAN_COLORS.free;
  const planLabel = PLAN_LABELS[user.plan] || PLAN_LABELS.free;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      padding: 'clamp(2rem, 5vw, 4rem) 1rem',
    }}>
      <div style={{
        maxWidth: 600,
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
        }}>
          <h1 style={{
            fontFamily: serif,
            fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
            fontWeight: 400,
            color: '#111',
            letterSpacing: '0.1em',
          }}>
            {t3({ ja: 'マイページ', en: 'My Page', es: 'Mi Pagina' }, lang)}
          </h1>
          <button
            onClick={handleLogout}
            style={{
              fontFamily: sans,
              fontSize: '0.8rem',
              color: '#999',
              background: 'none',
              border: '1px solid #ddd',
              borderRadius: 20,
              padding: '0.4rem 1rem',
              cursor: 'pointer',
            }}
          >
            {t3({ ja: 'ログアウト', en: 'Log Out', es: 'Cerrar sesion' }, lang)}
          </button>
        </div>

        {/* Plan Badge */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '1.5rem',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${planColor}, ${planColor}88)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontFamily: sans,
            fontWeight: 700,
            fontSize: '1.2rem',
          }}>
            {(user.name || user.email)[0]?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: sans, fontSize: '1rem', fontWeight: 600, color: '#111' }}>
              {user.name || user.email}
            </div>
            <div style={{ fontFamily: sans, fontSize: '0.8rem', color: '#999', marginTop: 2 }}>
              {user.email}
            </div>
          </div>
          <span style={{
            fontFamily: sans,
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.1em',
            color: '#fff',
            background: planColor,
            padding: '0.3rem 0.8rem',
            borderRadius: 50,
          }}>
            {t3(planLabel, lang)}
          </span>
        </div>

        {/* Profile Card */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '1.5rem',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.2rem',
          }}>
            <h2 style={{
              fontFamily: serif,
              fontSize: '1rem',
              fontWeight: 400,
              color: '#111',
            }}>
              {t3({ ja: 'プロフィール', en: 'Profile', es: 'Perfil' }, lang)}
            </h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  fontFamily: sans,
                  fontSize: '0.75rem',
                  color: ACCENT,
                  background: 'none',
                  border: `1px solid ${ACCENT}`,
                  borderRadius: 20,
                  padding: '0.3rem 0.8rem',
                  cursor: 'pointer',
                }}
              >
                {t3({ ja: '編集', en: 'Edit', es: 'Editar' }, lang)}
              </button>
            )}
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {([
                { key: 'name' as const, label: { ja: '名前', en: 'Name', es: 'Nombre' } },
                { key: 'instrument' as const, label: { ja: '楽器', en: 'Instrument', es: 'Instrumento' } },
                { key: 'region' as const, label: { ja: '地域', en: 'Region', es: 'Region' } },
              ] as const).map(({ key, label }) => (
                <div key={key}>
                  <label style={{
                    display: 'block',
                    fontFamily: sans,
                    fontSize: '0.75rem',
                    color: '#888',
                    marginBottom: 4,
                  }}>
                    {t3(label, lang)}
                  </label>
                  <input
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      border: '1px solid #ddd',
                      borderRadius: 8,
                      fontFamily: sans,
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      outline: 'none',
                    }}
                  />
                </div>
              ))}
              <div>
                <label style={{
                  display: 'block',
                  fontFamily: sans,
                  fontSize: '0.75rem',
                  color: '#888',
                  marginBottom: 4,
                }}>
                  {t3({ ja: '自己紹介', en: 'Bio', es: 'Biografia' }, lang)}
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    fontFamily: sans,
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setForm({ name: user.name, instrument: user.instrument, region: user.region, bio: user.bio });
                    setEditing(false);
                  }}
                  style={{
                    fontFamily: sans,
                    fontSize: '0.8rem',
                    color: '#666',
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: 20,
                    padding: '0.5rem 1.2rem',
                    cursor: 'pointer',
                  }}
                >
                  {t3({ ja: 'キャンセル', en: 'Cancel', es: 'Cancelar' }, lang)}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    fontFamily: sans,
                    fontSize: '0.8rem',
                    color: '#fff',
                    background: saving ? '#94a3b8' : ACCENT,
                    border: 'none',
                    borderRadius: 20,
                    padding: '0.5rem 1.2rem',
                    cursor: saving ? 'wait' : 'pointer',
                  }}
                >
                  {saving
                    ? t3({ ja: '保存中...', en: 'Saving...', es: 'Guardando...' }, lang)
                    : t3({ ja: '保存', en: 'Save', es: 'Guardar' }, lang)
                  }
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {([
                { label: { ja: '名前', en: 'Name', es: 'Nombre' }, value: user.name },
                { label: { ja: '楽器', en: 'Instrument', es: 'Instrumento' }, value: user.instrument },
                { label: { ja: '地域', en: 'Region', es: 'Region' }, value: user.region },
                { label: { ja: '自己紹介', en: 'Bio', es: 'Biografia' }, value: user.bio },
              ]).map(({ label, value }) => (
                <div key={label.en} style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '1rem',
                }}>
                  <span style={{
                    fontFamily: sans,
                    fontSize: '0.75rem',
                    color: '#999',
                    minWidth: 80,
                    flexShrink: 0,
                  }}>
                    {t3(label, lang)}
                  </span>
                  <span style={{
                    fontFamily: sans,
                    fontSize: '0.9rem',
                    color: value ? '#333' : '#ccc',
                  }}>
                    {value || t3({ ja: '未設定', en: 'Not set', es: 'No establecido' }, lang)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usage Stats */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '1.5rem',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          marginBottom: '1.5rem',
        }}>
          <h2 style={{
            fontFamily: serif,
            fontSize: '1rem',
            fontWeight: 400,
            color: '#111',
            marginBottom: '1rem',
          }}>
            {t3({
              ja: `利用状況（${user.appUsageMonth || '-'}）`,
              en: `Usage (${user.appUsageMonth || '-'})`,
              es: `Uso (${user.appUsageMonth || '-'})`,
            }, lang)}
          </h2>

          {Object.keys(user.appUsage || {}).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {Object.entries(user.appUsage).sort((a, b) => b[1] - a[1]).map(([app, count]) => (
                <div key={app} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontFamily: sans, fontSize: '0.85rem', color: '#555' }}>
                    {app}
                  </span>
                  <span style={{
                    fontFamily: sans,
                    fontSize: '0.8rem',
                    color: ACCENT,
                    fontWeight: 600,
                  }}>
                    {count}{t3({ ja: '回', en: 'x', es: 'x' }, lang)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: sans, fontSize: '0.85rem', color: '#ccc' }}>
              {t3({
                ja: 'まだ利用記録がありません',
                en: 'No usage yet',
                es: 'Sin uso todavia',
              }, lang)}
            </p>
          )}
        </div>

        {/* Badges */}
        {user.badges.length > 0 && (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: '1.5rem',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
            marginBottom: '1.5rem',
          }}>
            <h2 style={{
              fontFamily: serif,
              fontSize: '1rem',
              fontWeight: 400,
              color: '#111',
              marginBottom: '1rem',
            }}>
              {t3({ ja: 'バッジ', en: 'Badges', es: 'Insignias' }, lang)}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {user.badges.map((badge) => (
                <span key={badge} style={{
                  fontFamily: sans,
                  fontSize: '0.75rem',
                  color: '#7c3aed',
                  background: '#f5f3ff',
                  border: '1px solid #ede9fe',
                  borderRadius: 50,
                  padding: '0.3rem 0.8rem',
                }}>
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Quick links */}
        <div style={{
          display: 'flex',
          gap: '0.8rem',
          flexWrap: 'wrap',
        }}>
          <Link href="/audio-apps" style={{
            fontFamily: sans,
            fontSize: '0.8rem',
            color: ACCENT,
            textDecoration: 'none',
            border: `1px solid ${ACCENT}`,
            borderRadius: 20,
            padding: '0.5rem 1rem',
          }}>
            {t3({ ja: 'アプリ一覧', en: 'All Apps', es: 'Apps' }, lang)}
          </Link>
          <Link href="/microphone" style={{
            fontFamily: sans,
            fontSize: '0.8rem',
            color: ACCENT,
            textDecoration: 'none',
            border: `1px solid ${ACCENT}`,
            borderRadius: 20,
            padding: '0.5rem 1rem',
          }}>
            {t3({ ja: 'マイクロフォン', en: 'Microphone', es: 'Microfono' }, lang)}
          </Link>
          <Link href="/" style={{
            fontFamily: sans,
            fontSize: '0.8rem',
            color: '#999',
            textDecoration: 'none',
            border: '1px solid #ddd',
            borderRadius: 20,
            padding: '0.5rem 1rem',
          }}>
            {t3({ ja: 'トップへ', en: 'Top', es: 'Inicio' }, lang)}
          </Link>
        </div>

        {/* Member since */}
        <p style={{
          fontFamily: sans,
          fontSize: '0.7rem',
          color: '#ccc',
          textAlign: 'center',
          marginTop: '2rem',
        }}>
          {t3({ ja: '登録日', en: 'Member since', es: 'Miembro desde' }, lang)}: {user.createdAt?.split('T')[0] || '-'}
        </p>
      </div>
    </div>
  );
}
