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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

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

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/auth/account', { method: 'DELETE' });
      if (res.ok) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('kuon_user');
          localStorage.removeItem('kuon_first_visit');
        }
        router.push('/');
      }
    } catch { /* ignore */ }
    setDeleting(false);
  };

  const handleEmailChange = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      setEmailMsg({ type: 'err', text: t3({ ja: '有効なメールアドレスを入力してください', en: 'Please enter a valid email', es: 'Ingrese un email valido' }, lang) });
      return;
    }
    setEmailSending(true);
    setEmailMsg(null);
    try {
      const res = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailMsg({ type: 'ok', text: t3({
          ja: `${newEmail} に確認メールを送信しました。メール内のリンクをクリックして変更を完了してください。`,
          en: `Verification email sent to ${newEmail}. Click the link in the email to complete the change.`,
          es: `Email de verificacion enviado a ${newEmail}. Haga clic en el enlace para completar el cambio.`,
        }, lang) });
        setNewEmail('');
      } else {
        const errMsg = data.error === 'Email already in use'
          ? t3({ ja: 'このメールアドレスは既に使用されています', en: 'This email is already in use', es: 'Este email ya esta en uso' }, lang)
          : data.error === 'Same email'
          ? t3({ ja: '現在のメールアドレスと同じです', en: 'Same as current email', es: 'Mismo email actual' }, lang)
          : (data.error || 'Error');
        setEmailMsg({ type: 'err', text: errMsg });
      }
    } catch {
      setEmailMsg({ type: 'err', text: 'Network error' });
    }
    setEmailSending(false);
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

        {/* Email Change */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '1.5rem',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          marginTop: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: showEmailChange ? '1rem' : 0,
          }}>
            <h2 style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 400, color: '#111' }}>
              {t3({ ja: 'メールアドレス変更', en: 'Change Email', ko: '이메일 변경', pt: 'Alterar Email', es: 'Cambiar Email' }, lang)}
            </h2>
            {!showEmailChange && (
              <button
                onClick={() => { setShowEmailChange(true); setEmailMsg(null); }}
                style={{
                  fontFamily: sans, fontSize: '0.75rem', color: ACCENT,
                  background: 'none', border: `1px solid ${ACCENT}`,
                  borderRadius: 20, padding: '0.3rem 0.8rem', cursor: 'pointer',
                }}
              >
                {t3({ ja: '変更', en: 'Change', ko: '변경', pt: 'Alterar', es: 'Cambiar' }, lang)}
              </button>
            )}
          </div>

          {showEmailChange && (
            <div>
              <p style={{ fontFamily: sans, fontSize: '0.8rem', color: '#888', marginBottom: '0.8rem', lineHeight: 1.6 }}>
                {t3({
                  ja: '新しいメールアドレスに確認メールを送信します。メール内のリンクをクリックすると変更が完了します。',
                  en: 'A verification email will be sent to your new address. Click the link in the email to complete the change.',
                  ko: '새 이메일 주소로 확인 메일이 발송됩니다. 메일의 링크를 클릭하면 변경이 완료됩니다.',
                  pt: 'Um email de verificacao sera enviado para o novo endereco. Clique no link para concluir.',
                  es: 'Se enviara un email de verificacion a la nueva direccion. Haga clic en el enlace para completar.',
                }, lang)}
              </p>
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.8rem' }}>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={t3({ ja: '新しいメールアドレス', en: 'New email address', ko: '새 이메일 주소', pt: 'Novo email', es: 'Nuevo email' }, lang)}
                  style={{
                    flex: 1, padding: '0.6rem 0.8rem', border: '1px solid #ddd',
                    borderRadius: 8, fontFamily: sans, fontSize: '0.85rem',
                    boxSizing: 'border-box', outline: 'none',
                  }}
                />
                <button
                  onClick={handleEmailChange}
                  disabled={emailSending}
                  style={{
                    fontFamily: sans, fontSize: '0.8rem', color: '#fff',
                    background: emailSending ? '#94a3b8' : ACCENT,
                    border: 'none', borderRadius: 8, padding: '0.6rem 1rem',
                    cursor: emailSending ? 'wait' : 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {emailSending
                    ? t3({ ja: '送信中...', en: 'Sending...', es: 'Enviando...' }, lang)
                    : t3({ ja: '送信', en: 'Send', ko: '전송', pt: 'Enviar', es: 'Enviar' }, lang)
                  }
                </button>
              </div>
              {emailMsg && (
                <p style={{
                  fontFamily: sans, fontSize: '0.8rem', lineHeight: 1.6,
                  color: emailMsg.type === 'ok' ? '#10b981' : '#ef4444',
                  marginBottom: '0.5rem',
                }}>
                  {emailMsg.text}
                </p>
              )}
              <button
                onClick={() => { setShowEmailChange(false); setEmailMsg(null); setNewEmail(''); }}
                style={{
                  fontFamily: sans, fontSize: '0.75rem', color: '#999',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                {t3({ ja: 'キャンセル', en: 'Cancel', ko: '취소', pt: 'Cancelar', es: 'Cancelar' }, lang)}
              </button>
            </div>
          )}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* Account Deletion — prominent danger zone  */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '1.5rem',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
          marginBottom: '1.5rem',
          border: '1px solid #fecaca',
        }}>
          <h2 style={{
            fontFamily: serif,
            fontSize: '1rem',
            fontWeight: 400,
            color: '#dc2626',
            marginBottom: '0.8rem',
          }}>
            {t3({
              ja: 'アカウントの削除',
              en: 'Delete Account',
              ko: '계정 삭제',
              pt: 'Excluir Conta',
              es: 'Eliminar Cuenta',
            }, lang)}
          </h2>
          <p style={{
            fontFamily: sans,
            fontSize: '0.8rem',
            color: '#888',
            lineHeight: 1.7,
            marginBottom: '1rem',
          }}>
            {t3({
              ja: 'アカウントを削除すると、プロフィール情報・利用履歴を含むすべてのデータが完全に削除されます。この操作は取り消せません。',
              en: 'Deleting your account will permanently remove all your data including profile information and usage history. This action cannot be undone.',
              ko: '계정을 삭제하면 프로필 정보 및 이용 기록을 포함한 모든 데이터가 완전히 삭제됩니다. 이 작업은 되돌릴 수 없습니다.',
              pt: 'Excluir sua conta removera permanentemente todos os seus dados, incluindo perfil e historico de uso. Esta acao nao pode ser desfeita.',
              es: 'Eliminar su cuenta eliminara permanentemente todos sus datos, incluido perfil e historial de uso. Esta accion no se puede deshacer.',
            }, lang)}
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                fontFamily: sans,
                fontSize: '0.85rem',
                color: '#dc2626',
                background: '#fff',
                border: '2px solid #dc2626',
                borderRadius: 8,
                padding: '0.7rem 1.5rem',
                cursor: 'pointer',
                fontWeight: 600,
                letterSpacing: '0.05em',
                width: '100%',
              }}
            >
              {t3({
                ja: 'アカウントを削除する',
                en: 'Delete My Account',
                ko: '계정 삭제하기',
                pt: 'Excluir Minha Conta',
                es: 'Eliminar Mi Cuenta',
              }, lang)}
            </button>
          ) : (
            <div style={{
              background: '#fef2f2',
              borderRadius: 8,
              padding: '1.2rem',
              border: '1px solid #fecaca',
            }}>
              <p style={{
                fontFamily: sans,
                fontSize: '0.85rem',
                color: '#991b1b',
                fontWeight: 600,
                marginBottom: '1rem',
                lineHeight: 1.6,
              }}>
                {t3({
                  ja: '本当に削除しますか？すべてのデータが完全に失われます。',
                  en: 'Are you sure? All your data will be permanently lost.',
                  ko: '정말 삭제하시겠습니까? 모든 데이터가 영구적으로 손실됩니다.',
                  pt: 'Tem certeza? Todos os dados serao perdidos permanentemente.',
                  es: 'Esta seguro? Todos los datos se perderan permanentemente.',
                }, lang)}
              </p>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    flex: 1, fontFamily: sans, fontSize: '0.8rem', color: '#666',
                    background: '#fff', border: '1px solid #ddd', borderRadius: 8,
                    padding: '0.6rem', cursor: 'pointer',
                  }}
                >
                  {t3({ ja: 'キャンセル', en: 'Cancel', ko: '취소', pt: 'Cancelar', es: 'Cancelar' }, lang)}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  style={{
                    flex: 1, fontFamily: sans, fontSize: '0.8rem', color: '#fff',
                    background: deleting ? '#94a3b8' : '#dc2626', border: 'none', borderRadius: 8,
                    padding: '0.6rem', cursor: deleting ? 'wait' : 'pointer', fontWeight: 600,
                  }}
                >
                  {deleting
                    ? t3({ ja: '削除中...', en: 'Deleting...', es: 'Eliminando...' }, lang)
                    : t3({ ja: '完全に削除する', en: 'Delete Permanently', ko: '영구 삭제', pt: 'Excluir Permanentemente', es: 'Eliminar Permanentemente' }, lang)
                  }
                </button>
              </div>
            </div>
          )}
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
