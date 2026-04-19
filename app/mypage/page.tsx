'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L3 = Partial<Record<Lang, string>> & { en: string };
const t3 = (m: L3, lang: Lang) => m[lang] ?? m.en;

// ─────────────────────────────────────────────
// Role / Instrument data
// ─────────────────────────────────────────────
interface RoleOption { id: string; label: L3 }
interface RoleCategory { id: string; label: L3; roles: RoleOption[] }

const ROLE_CATEGORIES: RoleCategory[] = [
  {
    id: 'strings', label: { ja: '弦楽器', en: 'Strings', ko: '현악기', es: 'Cuerdas' },
    roles: [
      { id: 'violin', label: { ja: 'ヴァイオリン', en: 'Violin', ko: '바이올린', es: 'Violín' } },
      { id: 'viola', label: { ja: 'ヴィオラ', en: 'Viola', ko: '비올라', es: 'Viola' } },
      { id: 'cello', label: { ja: 'チェロ', en: 'Cello', ko: '첼로', es: 'Violonchelo' } },
      { id: 'double-bass', label: { ja: 'コントラバス', en: 'Double Bass', ko: '더블베이스', es: 'Contrabajo' } },
      { id: 'harp', label: { ja: 'ハープ', en: 'Harp', ko: '하프', es: 'Arpa' } },
    ],
  },
  {
    id: 'woodwinds', label: { ja: '木管楽器', en: 'Woodwinds', ko: '목관악기', es: 'Viento madera' },
    roles: [
      { id: 'flute', label: { ja: 'フルート', en: 'Flute', ko: '플루트', es: 'Flauta' } },
      { id: 'piccolo', label: { ja: 'ピッコロ', en: 'Piccolo', ko: '피콜로', es: 'Flautín' } },
      { id: 'oboe', label: { ja: 'オーボエ', en: 'Oboe', ko: '오보에', es: 'Oboe' } },
      { id: 'clarinet', label: { ja: 'クラリネット', en: 'Clarinet', ko: '클라리넷', es: 'Clarinete' } },
      { id: 'bassoon', label: { ja: 'ファゴット', en: 'Bassoon', ko: '바순', es: 'Fagot' } },
      { id: 'saxophone', label: { ja: 'サクソフォン', en: 'Saxophone', ko: '색소폰', es: 'Saxofón' } },
      { id: 'recorder', label: { ja: 'リコーダー', en: 'Recorder', ko: '리코더', es: 'Flauta dulce' } },
    ],
  },
  {
    id: 'brass', label: { ja: '金管楽器', en: 'Brass', ko: '금관악기', es: 'Viento metal' },
    roles: [
      { id: 'trumpet', label: { ja: 'トランペット', en: 'Trumpet', ko: '트럼펫', es: 'Trompeta' } },
      { id: 'horn', label: { ja: 'ホルン', en: 'Horn', ko: '호른', es: 'Trompa' } },
      { id: 'trombone', label: { ja: 'トロンボーン', en: 'Trombone', ko: '트롬본', es: 'Trombón' } },
      { id: 'tuba', label: { ja: 'テューバ', en: 'Tuba', ko: '튜바', es: 'Tuba' } },
      { id: 'euphonium', label: { ja: 'ユーフォニアム', en: 'Euphonium', ko: '유포니움', es: 'Bombardino' } },
      { id: 'cornet', label: { ja: 'コルネット', en: 'Cornet', ko: '코넷', es: 'Corneta' } },
    ],
  },
  {
    id: 'percussion', label: { ja: '打楽器', en: 'Percussion', ko: '타악기', es: 'Percusión' },
    roles: [
      { id: 'timpani', label: { ja: 'ティンパニ', en: 'Timpani', ko: '팀파니', es: 'Timbales' } },
      { id: 'marimba', label: { ja: 'マリンバ', en: 'Marimba', ko: '마림바', es: 'Marimba' } },
      { id: 'vibraphone', label: { ja: 'ヴィブラフォン', en: 'Vibraphone', ko: '비브라폰', es: 'Vibráfono' } },
      { id: 'snare-drum', label: { ja: 'スネアドラム', en: 'Snare Drum', ko: '스네어드럼', es: 'Caja' } },
      { id: 'percussion-general', label: { ja: 'パーカッション', en: 'Percussion (General)', ko: '퍼커션', es: 'Percusión general' } },
      { id: 'drums', label: { ja: 'ドラムス', en: 'Drums', ko: '드럼', es: 'Batería' } },
    ],
  },
  {
    id: 'keyboard', label: { ja: '鍵盤楽器', en: 'Keyboard', ko: '건반악기', es: 'Teclas' },
    roles: [
      { id: 'piano', label: { ja: 'ピアノ', en: 'Piano', ko: '피아노', es: 'Piano' } },
      { id: 'organ', label: { ja: 'オルガン', en: 'Organ', ko: '오르간', es: 'Órgano' } },
      { id: 'harpsichord', label: { ja: 'チェンバロ', en: 'Harpsichord', ko: '하프시코드', es: 'Clavecín' } },
      { id: 'accordion', label: { ja: 'アコーディオン', en: 'Accordion', ko: '아코디언', es: 'Acordeón' } },
      { id: 'celesta', label: { ja: 'チェレスタ', en: 'Celesta', ko: '첼레스타', es: 'Celesta' } },
    ],
  },
  {
    id: 'guitar', label: { ja: 'ギター系', en: 'Guitar', ko: '기타', es: 'Guitarra' },
    roles: [
      { id: 'classical-guitar', label: { ja: 'クラシックギター', en: 'Classical Guitar', ko: '클래식 기타', es: 'Guitarra clásica' } },
      { id: 'acoustic-guitar', label: { ja: 'アコースティックギター', en: 'Acoustic Guitar', ko: '어쿠스틱 기타', es: 'Guitarra acústica' } },
      { id: 'electric-guitar', label: { ja: 'エレキギター', en: 'Electric Guitar', ko: '일렉트릭 기타', es: 'Guitarra eléctrica' } },
      { id: 'electric-bass', label: { ja: 'エレキベース', en: 'Electric Bass', ko: '일렉트릭 베이스', es: 'Bajo eléctrico' } },
      { id: 'ukulele', label: { ja: 'ウクレレ', en: 'Ukulele', ko: '우쿨렐레', es: 'Ukelele' } },
    ],
  },
  {
    id: 'voice', label: { ja: '声楽', en: 'Voice', ko: '성악', es: 'Voz' },
    roles: [
      { id: 'soprano', label: { ja: 'ソプラノ', en: 'Soprano', ko: '소프라노', es: 'Soprano' } },
      { id: 'mezzo-soprano', label: { ja: 'メゾソプラノ', en: 'Mezzo-Soprano', ko: '메조소프라노', es: 'Mezzosoprano' } },
      { id: 'alto', label: { ja: 'アルト', en: 'Alto / Contralto', ko: '알토', es: 'Contralto' } },
      { id: 'tenor', label: { ja: 'テノール', en: 'Tenor', ko: '테너', es: 'Tenor' } },
      { id: 'baritone', label: { ja: 'バリトン', en: 'Baritone', ko: '바리톤', es: 'Barítono' } },
      { id: 'bass-voice', label: { ja: 'バス', en: 'Bass', ko: '베이스', es: 'Bajo' } },
    ],
  },
  {
    id: 'conducting', label: { ja: '指揮', en: 'Conducting', ko: '지휘', es: 'Dirección' },
    roles: [
      { id: 'conductor', label: { ja: '指揮者', en: 'Conductor', ko: '지휘자', es: 'Director/a' } },
      { id: 'chorus-master', label: { ja: '合唱指揮者', en: 'Chorus Master', ko: '합창 지휘자', es: 'Director/a de coro' } },
    ],
  },
  {
    id: 'composition', label: { ja: '作編曲', en: 'Composition', ko: '작곡', es: 'Composición' },
    roles: [
      { id: 'composer', label: { ja: '作曲家', en: 'Composer', ko: '작곡가', es: 'Compositor/a' } },
      { id: 'arranger', label: { ja: '編曲家', en: 'Arranger', ko: '편곡가', es: 'Arreglista' } },
      { id: 'songwriter', label: { ja: 'ソングライター', en: 'Songwriter', ko: '싱어송라이터', es: 'Compositor/a' } },
    ],
  },
  {
    id: 'production', label: { ja: '制作・技術', en: 'Production & Technical', ko: '제작/기술', es: 'Producción' },
    roles: [
      { id: 'recording-engineer', label: { ja: '録音エンジニア', en: 'Recording Engineer', ko: '레코딩 엔지니어', es: 'Ingeniero de grabación' } },
      { id: 'sound-designer', label: { ja: 'サウンドデザイナー', en: 'Sound Designer', ko: '사운드 디자이너', es: 'Diseñador de sonido' } },
      { id: 'music-producer', label: { ja: '音楽プロデューサー', en: 'Music Producer', ko: '음악 프로듀서', es: 'Productor musical' } },
      { id: 'videographer', label: { ja: 'ビデオグラファー', en: 'Videographer', ko: '비디오그래퍼', es: 'Videógrafo/a' } },
      { id: 'photographer', label: { ja: 'フォトグラファー', en: 'Photographer', ko: '포토그래퍼', es: 'Fotógrafo/a' } },
      { id: 'lighting-designer', label: { ja: '照明デザイナー', en: 'Lighting Designer', ko: '조명 디자이너', es: 'Diseñador de iluminación' } },
    ],
  },
  {
    id: 'performing-arts', label: { ja: '舞台芸術', en: 'Performing Arts', ko: '무대 예술', es: 'Artes escénicas' },
    roles: [
      { id: 'dancer', label: { ja: 'ダンサー', en: 'Dancer', ko: '댄서', es: 'Bailarín/a' } },
      { id: 'actor', label: { ja: '役者', en: 'Actor / Actress', ko: '배우', es: 'Actor / Actriz' } },
      { id: 'makeup-artist', label: { ja: 'メイクアーティスト', en: 'Makeup Artist', ko: '메이크업 아티스트', es: 'Maquillador/a' } },
      { id: 'stage-director', label: { ja: '演出家', en: 'Stage Director', ko: '연출가', es: 'Director/a de escena' } },
      { id: 'choreographer', label: { ja: '振付師', en: 'Choreographer', ko: '안무가', es: 'Coreógrafo/a' } },
    ],
  },
  {
    id: 'folk-eastern', label: { ja: '東洋民族楽器', en: 'Eastern Folk Instruments', ko: '동양 민속악기', es: 'Instrumentos orientales' },
    roles: [
      { id: 'other-eastern', label: { ja: 'その他（入力）', en: 'Other (specify)', ko: '기타 (입력)', es: 'Otro (especificar)' } },
    ],
  },
  {
    id: 'folk-western', label: { ja: '西洋民族楽器', en: 'Western Folk Instruments', ko: '서양 민속악기', es: 'Instrumentos folclóricos occidentales' },
    roles: [
      { id: 'other-western', label: { ja: 'その他（入力）', en: 'Other (specify)', ko: '기타 (입력)', es: 'Otro (especificar)' } },
    ],
  },
];

const EXPERIENCE_LEVELS = [
  { id: 'student', label: { ja: '学生', en: 'Student', ko: '학생', es: 'Estudiante' } },
  { id: 'amateur', label: { ja: 'アマチュア', en: 'Amateur', ko: '아마추어', es: 'Amateur' } },
  { id: 'semi-pro', label: { ja: 'セミプロ', en: 'Semi-Pro', ko: '세미프로', es: 'Semi-profesional' } },
  { id: 'professional', label: { ja: 'プロフェッショナル', en: 'Professional', ko: '프로페셔널', es: 'Profesional' } },
];

const MOBILITY_OPTIONS = [
  { id: 'local', label: { ja: '拠点周辺のみ', en: 'Local only', ko: '거점 주변만', es: 'Solo local' } },
  { id: 'domestic', label: { ja: '国内移動可', en: 'Domestic', ko: '국내 이동 가능', es: 'Nacional' } },
  { id: 'international', label: { ja: '国外も可', en: 'International', ko: '해외도 가능', es: 'Internacional' } },
];

const LANGUAGES = [
  { id: 'ja', label: '日本語' }, { id: 'en', label: 'English' }, { id: 'ko', label: '한국어' },
  { id: 'zh', label: '中文' }, { id: 'es', label: 'Español' }, { id: 'pt', label: 'Português' },
  { id: 'de', label: 'Deutsch' }, { id: 'fr', label: 'Français' }, { id: 'it', label: 'Italiano' },
  { id: 'ru', label: 'Русский' }, { id: 'ar', label: 'العربية' }, { id: 'th', label: 'ภาษาไทย' },
];

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface UserData {
  email: string; name: string; instrument: string; region: string; bio: string;
  plan: string; badges: string[]; createdAt: string;
  appUsage: Record<string, number>; appUsageMonth: string;
  role: string; roleCategory: string; customRoleName: string;
  birthDate: string; showBirthDate: boolean;
  basedIn: string; mobility: string; avatarKey: string;
  snsYoutube: string; snsInstagram: string; snsX: string;
  snsSoundcloud: string; snsWebsite: string;
  availableForWork: boolean; experienceLevel: string; spokenLanguages: string;
}

const PLAN_LABELS: Record<string, L3> = {
  free:    { ja: 'Free',    en: 'Free',    es: 'Gratis'      },
  student: { ja: 'Student', en: 'Student', es: 'Estudiante'  },
  pro:     { ja: 'Pro',     en: 'Pro',     es: 'Pro'         },
};
const PLAN_COLORS: Record<string, string> = { free: '#64748b', student: '#0284c7', pro: '#7c3aed' };

// ─────────────────────────────────────────────
// Profile completeness calculation
// ─────────────────────────────────────────────
function calcCompleteness(u: UserData): number {
  const fields = [
    !!u.name, !!u.role, !!u.basedIn, !!u.mobility,
    !!u.bio, !!u.avatarKey, !!u.experienceLevel,
    !!u.spokenLanguages,
    !!(u.snsYoutube || u.snsInstagram || u.snsX || u.snsSoundcloud || u.snsWebsite),
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

function getRoleLabelFromId(roleId: string, lang: Lang): string {
  for (const cat of ROLE_CATEGORIES) {
    for (const r of cat.roles) {
      if (r.id === roleId) return t3(r.label, lang);
    }
  }
  return roleId;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function MyPage() {
  const { lang } = useLang();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  // Form state
  const [form, setForm] = useState({
    name: '', role: '', roleCategory: '', customRoleName: '',
    birthDate: '', showBirthDate: false, basedIn: '', mobility: '',
    bio: '', snsYoutube: '', snsInstagram: '', snsX: '',
    snsSoundcloud: '', snsWebsite: '', availableForWork: false,
    experienceLevel: '', spokenLanguages: '',
  });

  // Account management
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
        if (!res.ok) { router.push('/auth/login'); return; }
        const data: UserData = await res.json();
        setUser(data);
        setForm({
          name: data.name || '', role: data.role || '', roleCategory: data.roleCategory || '',
          customRoleName: data.customRoleName || '', birthDate: data.birthDate || '',
          showBirthDate: data.showBirthDate || false, basedIn: data.basedIn || '',
          mobility: data.mobility || '', bio: data.bio || '',
          snsYoutube: data.snsYoutube || '', snsInstagram: data.snsInstagram || '',
          snsX: data.snsX || '', snsSoundcloud: data.snsSoundcloud || '',
          snsWebsite: data.snsWebsite || '', availableForWork: data.availableForWork || false,
          experienceLevel: data.experienceLevel || '', spokenLanguages: data.spokenLanguages || '',
        });
        setAvatarUrl(`/api/auth/avatar/${encodeURIComponent(data.email)}?t=${Date.now()}`);
      } catch { router.push('/auth/login'); }
      setLoading(false);
    })();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setUser((prev) => prev ? { ...prev, ...data.user } : prev);
        if (typeof window !== 'undefined') {
          localStorage.setItem('kuon_user', JSON.stringify({
            email: data.user.email, name: data.user.name, plan: data.user.plan,
          }));
        }
        setEditing(false);
      }
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert(t3({ ja: 'ファイルサイズは2MB以下にしてください', en: 'File must be under 2MB', es: 'El archivo debe ser menor a 2MB' }, lang));
      return;
    }
    setAvatarUploading(true);
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await fetch('/api/auth/avatar', { method: 'POST', body: fd });
      if (res.ok) {
        setAvatarUrl(`/api/auth/avatar/${encodeURIComponent(user?.email || '')}?t=${Date.now()}`);
        setUser(prev => prev ? { ...prev, avatarKey: 'uploaded' } : prev);
      }
    } catch { /* ignore */ }
    setAvatarUploading(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/auth/account', { method: 'DELETE' });
      if (res.ok) {
        if (typeof window !== 'undefined') { localStorage.removeItem('kuon_user'); localStorage.removeItem('kuon_first_visit'); }
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
    setEmailSending(true); setEmailMsg(null);
    try {
      const res = await fetch('/api/auth/change-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setEmailMsg({ type: 'ok', text: t3({ ja: `${newEmail} に確認メールを送信しました`, en: `Verification email sent to ${newEmail}`, es: `Email de verificacion enviado a ${newEmail}` }, lang) });
        setNewEmail('');
      } else {
        const errMsg = data.error === 'Email already in use' ? t3({ ja: '既に使用されています', en: 'Already in use', es: 'Ya en uso' }, lang) : (data.error || 'Error');
        setEmailMsg({ type: 'err', text: errMsg });
      }
    } catch { setEmailMsg({ type: 'err', text: 'Network error' }); }
    setEmailSending(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    if (typeof window !== 'undefined') { localStorage.removeItem('kuon_user'); localStorage.removeItem('kuon_first_visit'); }
    router.push('/');
  };

  // Role change handler
  const handleRoleChange = (roleId: string) => {
    const cat = ROLE_CATEGORIES.find(c => c.roles.some(r => r.id === roleId));
    setForm({ ...form, role: roleId, roleCategory: cat?.id || '', customRoleName: roleId.startsWith('other-') ? form.customRoleName : '' });
  };

  // Language toggle
  const toggleLang = (langId: string) => {
    const current = form.spokenLanguages.split(',').filter(Boolean);
    const updated = current.includes(langId) ? current.filter(l => l !== langId) : [...current, langId];
    setForm({ ...form, spokenLanguages: updated.join(',') });
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  if (!user) return null;

  const planColor = PLAN_COLORS[user.plan] || PLAN_COLORS.free;
  const planLabel = PLAN_LABELS[user.plan] || PLAN_LABELS.free;
  const completeness = calcCompleteness(user);
  const needsCustomText = form.role === 'other-eastern' || form.role === 'other-western';

  // Helper styles
  const labelStyle = { display: 'block' as const, fontFamily: sans, fontSize: '0.75rem', color: '#888', marginBottom: 4 };
  const inputStyle = {
    width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: 8,
    fontFamily: sans, fontSize: '0.9rem', boxSizing: 'border-box' as const, outline: 'none',
  };
  const cardStyle = {
    background: '#fff', borderRadius: 12, padding: '1.5rem',
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)', marginBottom: '1.5rem',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 'clamp(2rem, 5vw, 4rem) 1rem' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* ─── Header ─── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', fontWeight: 400, color: '#111', letterSpacing: '0.1em' }}>
            {t3({ ja: 'マイページ', en: 'My Page', es: 'Mi Pagina' }, lang)}
          </h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {user.email === '369@kotaroasahina.com' && (
              <Link href="/admin" style={{ fontFamily: sans, fontSize: '0.75rem', color: '#7c3aed', background: 'none', border: '1px solid #7c3aed', borderRadius: 20, padding: '0.4rem 0.8rem', textDecoration: 'none' }}>
                Admin
              </Link>
            )}
            <button onClick={handleLogout} style={{ fontFamily: sans, fontSize: '0.8rem', color: '#999', background: 'none', border: '1px solid #ddd', borderRadius: 20, padding: '0.4rem 1rem', cursor: 'pointer' }}>
              {t3({ ja: 'ログアウト', en: 'Log Out', es: 'Cerrar sesion' }, lang)}
            </button>
          </div>
        </div>

        {/* ─── Avatar + Name Card ─── */}
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1.2rem', position: 'relative' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                width: 80, height: 80, borderRadius: '50%', overflow: 'hidden',
                cursor: 'pointer', border: `3px solid ${planColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#f1f5f9',
              }}
            >
              {avatarUploading ? (
                <div style={{ width: 24, height: 24, border: '2px solid #e2e8f0', borderTopColor: ACCENT, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
            <div style={{
              position: 'absolute', bottom: -2, right: -2, width: 24, height: 24,
              borderRadius: '50%', background: ACCENT, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.7rem', cursor: 'pointer', border: '2px solid #fff',
            }} onClick={() => fileRef.current?.click()}>
              +
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleAvatarUpload} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: sans, fontSize: '1.1rem', fontWeight: 600, color: '#111' }}>
                {user.name || user.email.split('@')[0]}
              </span>
              <span style={{
                fontFamily: sans, fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em',
                color: '#fff', background: planColor, padding: '2px 8px', borderRadius: 50,
              }}>
                {t3(planLabel, lang)}
              </span>
              {user.availableForWork && (
                <span style={{
                  fontFamily: sans, fontSize: '0.6rem', fontWeight: 600,
                  color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 50,
                  border: '1px solid #a7f3d0',
                }}>
                  {t3({ ja: '募集中', en: 'Available', ko: '구인중', es: 'Disponible' }, lang)}
                </span>
              )}
            </div>
            <div style={{ fontFamily: sans, fontSize: '0.8rem', color: '#999', marginTop: 2 }}>{user.email}</div>
            {user.role && (
              <div style={{ fontFamily: sans, fontSize: '0.8rem', color: '#475569', marginTop: 4 }}>
                {user.customRoleName || getRoleLabelFromId(user.role, lang)}
                {user.basedIn && <span style={{ color: '#94a3b8' }}> / {user.basedIn}</span>}
              </div>
            )}
          </div>
        </div>

        {/* ─── Profile Completeness ─── */}
        {completeness < 100 && (
          <div style={{ ...cardStyle, padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: sans, fontSize: '0.8rem', color: '#475569' }}>
                {t3({ ja: 'プロフィール完成度', en: 'Profile completeness', es: 'Perfil completo' }, lang)}
              </span>
              <span style={{ fontFamily: sans, fontSize: '0.85rem', fontWeight: 700, color: completeness >= 80 ? '#059669' : completeness >= 50 ? '#d97706' : '#dc2626' }}>
                {completeness}%
              </span>
            </div>
            <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                width: `${completeness}%`, height: '100%', borderRadius: 3, transition: 'width 0.5s',
                background: completeness >= 80 ? 'linear-gradient(90deg, #059669, #10b981)' : completeness >= 50 ? 'linear-gradient(90deg, #d97706, #fbbf24)' : 'linear-gradient(90deg, #dc2626, #f87171)',
              }} />
            </div>
          </div>
        )}

        {/* ─── Profile Card ─── */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
            <h2 style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 400, color: '#111' }}>
              {t3({ ja: 'プロフィール', en: 'Profile', es: 'Perfil' }, lang)}
            </h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} style={{ fontFamily: sans, fontSize: '0.75rem', color: ACCENT, background: 'none', border: `1px solid ${ACCENT}`, borderRadius: 20, padding: '0.3rem 0.8rem', cursor: 'pointer' }}>
                {t3({ ja: '編集', en: 'Edit', es: 'Editar' }, lang)}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => { setForm({ name: user.name||'', role: user.role||'', roleCategory: user.roleCategory||'', customRoleName: user.customRoleName||'', birthDate: user.birthDate||'', showBirthDate: user.showBirthDate||false, basedIn: user.basedIn||'', mobility: user.mobility||'', bio: user.bio||'', snsYoutube: user.snsYoutube||'', snsInstagram: user.snsInstagram||'', snsX: user.snsX||'', snsSoundcloud: user.snsSoundcloud||'', snsWebsite: user.snsWebsite||'', availableForWork: user.availableForWork||false, experienceLevel: user.experienceLevel||'', spokenLanguages: user.spokenLanguages||'' }); setEditing(false); }}
                  style={{ fontFamily: sans, fontSize: '0.75rem', color: '#666', background: '#f1f5f9', border: 'none', borderRadius: 20, padding: '0.3rem 0.8rem', cursor: 'pointer' }}>
                  {t3({ ja: 'キャンセル', en: 'Cancel', es: 'Cancelar' }, lang)}
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ fontFamily: sans, fontSize: '0.75rem', color: '#fff', background: saving ? '#94a3b8' : ACCENT, border: 'none', borderRadius: 20, padding: '0.3rem 0.8rem', cursor: saving ? 'wait' : 'pointer' }}>
                  {saving ? '...' : t3({ ja: '保存', en: 'Save', es: 'Guardar' }, lang)}
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>{t3({ ja: '名前（活動名OK）', en: 'Name (stage name OK)', es: 'Nombre (artístico OK)' }, lang)}</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
              </div>

              {/* Role / Instrument */}
              <div>
                <label style={labelStyle}>{t3({ ja: '楽器・職種', en: 'Instrument / Role', es: 'Instrumento / Rol' }, lang)}</label>
                <select value={form.role} onChange={e => handleRoleChange(e.target.value)}
                  style={{ ...inputStyle, appearance: 'auto' as const }}>
                  <option value="">{t3({ ja: '選択してください', en: 'Select...', es: 'Seleccionar...' }, lang)}</option>
                  {ROLE_CATEGORIES.map(cat => (
                    <optgroup key={cat.id} label={t3(cat.label, lang)}>
                      {cat.roles.map(r => (
                        <option key={r.id} value={r.id}>{t3(r.label, lang)}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {needsCustomText && (
                  <input value={form.customRoleName} onChange={e => setForm({ ...form, customRoleName: e.target.value })}
                    placeholder={t3({ ja: '楽器名を入力', en: 'Enter instrument name', es: 'Ingrese nombre' }, lang)}
                    style={{ ...inputStyle, marginTop: 8 }} />
                )}
              </div>

              {/* Experience Level */}
              <div>
                <label style={labelStyle}>{t3({ ja: '経験レベル', en: 'Experience Level', es: 'Nivel' }, lang)}</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {EXPERIENCE_LEVELS.map(lv => (
                    <button key={lv.id} type="button" onClick={() => setForm({ ...form, experienceLevel: form.experienceLevel === lv.id ? '' : lv.id })}
                      style={{
                        padding: '0.4rem 0.9rem', borderRadius: 20, fontSize: '0.8rem', fontFamily: sans, cursor: 'pointer',
                        border: form.experienceLevel === lv.id ? `2px solid ${ACCENT}` : '1px solid #ddd',
                        background: form.experienceLevel === lv.id ? '#eff6ff' : '#fff',
                        color: form.experienceLevel === lv.id ? ACCENT : '#666', fontWeight: form.experienceLevel === lv.id ? 600 : 400,
                      }}>
                      {t3(lv.label, lang)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Birth Date */}
              <div>
                <label style={labelStyle}>{t3({ ja: '生年月日（任意）', en: 'Date of Birth (optional)', es: 'Fecha de nacimiento (opcional)' }, lang)}</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#888', fontFamily: sans, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input type="checkbox" checked={form.showBirthDate} onChange={e => setForm({ ...form, showBirthDate: e.target.checked })} />
                    {t3({ ja: '公開', en: 'Public', es: 'Público' }, lang)}
                  </label>
                </div>
              </div>

              {/* Based In + Mobility */}
              <div>
                <label style={labelStyle}>{t3({ ja: '活動拠点', en: 'Based In', es: 'Ubicación' }, lang)}</label>
                <input value={form.basedIn} onChange={e => setForm({ ...form, basedIn: e.target.value })}
                  placeholder={t3({ ja: '例: 東京都, Berlin, New York', en: 'e.g. Tokyo, Berlin, New York', es: 'ej. Madrid, Tokyo' }, lang)}
                  style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t3({ ja: '移動可能エリア', en: 'Mobility', es: 'Movilidad' }, lang)}</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {MOBILITY_OPTIONS.map(opt => (
                    <button key={opt.id} type="button" onClick={() => setForm({ ...form, mobility: form.mobility === opt.id ? '' : opt.id })}
                      style={{
                        padding: '0.4rem 0.9rem', borderRadius: 20, fontSize: '0.8rem', fontFamily: sans, cursor: 'pointer',
                        border: form.mobility === opt.id ? `2px solid ${ACCENT}` : '1px solid #ddd',
                        background: form.mobility === opt.id ? '#eff6ff' : '#fff',
                        color: form.mobility === opt.id ? ACCENT : '#666', fontWeight: form.mobility === opt.id ? 600 : 400,
                      }}>
                      {t3(opt.label, lang)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spoken Languages */}
              <div>
                <label style={labelStyle}>{t3({ ja: '使用言語', en: 'Spoken Languages', es: 'Idiomas' }, lang)}</label>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {LANGUAGES.map(l => {
                    const active = form.spokenLanguages.split(',').includes(l.id);
                    return (
                      <button key={l.id} type="button" onClick={() => toggleLang(l.id)}
                        style={{
                          padding: '0.3rem 0.7rem', borderRadius: 16, fontSize: '0.75rem', fontFamily: sans, cursor: 'pointer',
                          border: active ? `2px solid ${ACCENT}` : '1px solid #e2e8f0',
                          background: active ? '#eff6ff' : '#fff',
                          color: active ? ACCENT : '#888', fontWeight: active ? 600 : 400,
                        }}>
                        {l.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Available for Work */}
              <div>
                <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.85rem', color: form.availableForWork ? '#059669' : '#888' }}>
                  <input type="checkbox" checked={form.availableForWork} onChange={e => setForm({ ...form, availableForWork: e.target.checked })} />
                  {t3({ ja: '仕事・コラボ募集中', en: 'Available for work / collaboration', es: 'Disponible para trabajo / colaboración' }, lang)}
                </label>
              </div>

              {/* Bio */}
              <div>
                <label style={labelStyle}>{t3({ ja: '自己紹介', en: 'Bio', es: 'Biografía' }, lang)}</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3}
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {/* SNS Links */}
              <div>
                <label style={labelStyle}>SNS</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {([
                    { key: 'snsYoutube' as const, icon: 'YouTube', ph: 'https://youtube.com/@...' },
                    { key: 'snsInstagram' as const, icon: 'Instagram', ph: 'https://instagram.com/...' },
                    { key: 'snsX' as const, icon: 'X', ph: 'https://x.com/...' },
                    { key: 'snsSoundcloud' as const, icon: 'SoundCloud', ph: 'https://soundcloud.com/...' },
                    { key: 'snsWebsite' as const, icon: 'Web', ph: 'https://...' },
                  ]).map(({ key, icon, ph }) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: sans, fontSize: '0.7rem', color: '#94a3b8', width: 70, textAlign: 'right', flexShrink: 0 }}>{icon}</span>
                      <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph}
                        style={{ ...inputStyle, fontSize: '0.8rem' }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ─── Display mode ─── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {([
                { label: { ja: '名前', en: 'Name', es: 'Nombre' }, value: user.name },
                { label: { ja: '楽器・職種', en: 'Role', es: 'Rol' }, value: user.customRoleName || (user.role ? getRoleLabelFromId(user.role, lang) : '') },
                { label: { ja: '経験', en: 'Level', es: 'Nivel' }, value: user.experienceLevel ? t3(EXPERIENCE_LEVELS.find(l => l.id === user.experienceLevel)?.label || { en: user.experienceLevel }, lang) : '' },
                { label: { ja: '拠点', en: 'Based In', es: 'Ubicación' }, value: user.basedIn },
                { label: { ja: '移動', en: 'Mobility', es: 'Movilidad' }, value: user.mobility ? t3(MOBILITY_OPTIONS.find(m => m.id === user.mobility)?.label || { en: user.mobility }, lang) : '' },
                { label: { ja: '自己紹介', en: 'Bio', es: 'Bio' }, value: user.bio },
              ]).map(({ label, value }) => (
                <div key={label.en} style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                  <span style={{ fontFamily: sans, fontSize: '0.75rem', color: '#999', minWidth: 80, flexShrink: 0 }}>{t3(label, lang)}</span>
                  <span style={{ fontFamily: sans, fontSize: '0.9rem', color: value ? '#333' : '#ccc' }}>
                    {value || t3({ ja: '未設定', en: 'Not set', es: 'No establecido' }, lang)}
                  </span>
                </div>
              ))}
              {/* Languages */}
              {user.spokenLanguages && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
                  <span style={{ fontFamily: sans, fontSize: '0.75rem', color: '#999', minWidth: 80, flexShrink: 0 }}>
                    {t3({ ja: '言語', en: 'Languages', es: 'Idiomas' }, lang)}
                  </span>
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                    {user.spokenLanguages.split(',').filter(Boolean).map(l => {
                      const langInfo = LANGUAGES.find(la => la.id === l);
                      return <span key={l} style={{ fontFamily: sans, fontSize: '0.75rem', color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: 12 }}>{langInfo?.label || l}</span>;
                    })}
                  </div>
                </div>
              )}
              {/* SNS */}
              {(user.snsYoutube || user.snsInstagram || user.snsX || user.snsSoundcloud || user.snsWebsite) && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                  {user.snsYoutube && <a href={user.snsYoutube} target="_blank" rel="noopener" style={{ fontSize: '0.75rem', color: ACCENT, fontFamily: sans }}>YouTube</a>}
                  {user.snsInstagram && <a href={user.snsInstagram} target="_blank" rel="noopener" style={{ fontSize: '0.75rem', color: ACCENT, fontFamily: sans }}>Instagram</a>}
                  {user.snsX && <a href={user.snsX} target="_blank" rel="noopener" style={{ fontSize: '0.75rem', color: ACCENT, fontFamily: sans }}>X</a>}
                  {user.snsSoundcloud && <a href={user.snsSoundcloud} target="_blank" rel="noopener" style={{ fontSize: '0.75rem', color: ACCENT, fontFamily: sans }}>SoundCloud</a>}
                  {user.snsWebsite && <a href={user.snsWebsite} target="_blank" rel="noopener" style={{ fontSize: '0.75rem', color: ACCENT, fontFamily: sans }}>Website</a>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Usage Stats ─── */}
        <div style={cardStyle}>
          <h2 style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 400, color: '#111', marginBottom: '1rem' }}>
            {t3({ ja: `利用状況（${user.appUsageMonth || '-'}）`, en: `Usage (${user.appUsageMonth || '-'})`, es: `Uso (${user.appUsageMonth || '-'})` }, lang)}
          </h2>
          {Object.keys(user.appUsage || {}).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {Object.entries(user.appUsage).sort((a, b) => b[1] - a[1]).map(([app, count]) => (
                <div key={app} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: sans, fontSize: '0.85rem', color: '#555' }}>{app}</span>
                  <span style={{ fontFamily: sans, fontSize: '0.8rem', color: ACCENT, fontWeight: 600 }}>
                    {count}{t3({ ja: '回', en: 'x', es: 'x' }, lang)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontFamily: sans, fontSize: '0.85rem', color: '#ccc' }}>
              {t3({ ja: 'まだ利用記録がありません', en: 'No usage yet', es: 'Sin uso todavia' }, lang)}
            </p>
          )}
        </div>

        {/* ─── Quick Links ─── */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          {[
            { href: '/audio-apps', label: { ja: 'アプリ一覧', en: 'All Apps', es: 'Apps' }, accent: true },
            { href: '/microphone', label: { ja: 'マイクロフォン', en: 'Microphone', es: 'Microfono' }, accent: true },
            { href: '/', label: { ja: 'トップへ', en: 'Top', es: 'Inicio' }, accent: false },
          ].map(({ href, label, accent }) => (
            <Link key={href} href={href} style={{
              fontFamily: sans, fontSize: '0.8rem', textDecoration: 'none', borderRadius: 20, padding: '0.5rem 1rem',
              color: accent ? ACCENT : '#999', border: `1px solid ${accent ? ACCENT : '#ddd'}`,
            }}>
              {t3(label, lang)}
            </Link>
          ))}
        </div>

        {/* ─── Email Change ─── */}
        <div style={{ ...cardStyle, marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showEmailChange ? '1rem' : 0 }}>
            <h2 style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 400, color: '#111' }}>
              {t3({ ja: 'メールアドレス変更', en: 'Change Email', es: 'Cambiar Email' }, lang)}
            </h2>
            {!showEmailChange && (
              <button onClick={() => { setShowEmailChange(true); setEmailMsg(null); }}
                style={{ fontFamily: sans, fontSize: '0.75rem', color: ACCENT, background: 'none', border: `1px solid ${ACCENT}`, borderRadius: 20, padding: '0.3rem 0.8rem', cursor: 'pointer' }}>
                {t3({ ja: '変更', en: 'Change', es: 'Cambiar' }, lang)}
              </button>
            )}
          </div>
          {showEmailChange && (
            <div>
              <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.8rem' }}>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  placeholder={t3({ ja: '新しいメールアドレス', en: 'New email address', es: 'Nuevo email' }, lang)}
                  style={{ ...inputStyle, flex: 1 }} />
                <button onClick={handleEmailChange} disabled={emailSending}
                  style={{ fontFamily: sans, fontSize: '0.8rem', color: '#fff', background: emailSending ? '#94a3b8' : ACCENT, border: 'none', borderRadius: 8, padding: '0.6rem 1rem', cursor: emailSending ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}>
                  {emailSending ? '...' : t3({ ja: '送信', en: 'Send', es: 'Enviar' }, lang)}
                </button>
              </div>
              {emailMsg && <p style={{ fontFamily: sans, fontSize: '0.8rem', color: emailMsg.type === 'ok' ? '#10b981' : '#ef4444', marginBottom: '0.5rem' }}>{emailMsg.text}</p>}
              <button onClick={() => { setShowEmailChange(false); setEmailMsg(null); setNewEmail(''); }}
                style={{ fontFamily: sans, fontSize: '0.75rem', color: '#999', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                {t3({ ja: 'キャンセル', en: 'Cancel', es: 'Cancelar' }, lang)}
              </button>
            </div>
          )}
        </div>

        {/* ─── Account Deletion ─── */}
        <div style={{ ...cardStyle, border: '1px solid #fecaca' }}>
          <h2 style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 400, color: '#dc2626', marginBottom: '0.8rem' }}>
            {t3({ ja: 'アカウントの削除', en: 'Delete Account', es: 'Eliminar Cuenta' }, lang)}
          </h2>
          <p style={{ fontFamily: sans, fontSize: '0.8rem', color: '#888', lineHeight: 1.7, marginBottom: '1rem' }}>
            {t3({ ja: 'すべてのデータが完全に削除されます。この操作は取り消せません。', en: 'All data will be permanently deleted. This cannot be undone.', es: 'Todos los datos se eliminaran permanentemente.' }, lang)}
          </p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)}
              style={{ fontFamily: sans, fontSize: '0.85rem', color: '#dc2626', background: '#fff', border: '2px solid #dc2626', borderRadius: 8, padding: '0.7rem 1.5rem', cursor: 'pointer', fontWeight: 600, width: '100%' }}>
              {t3({ ja: 'アカウントを削除する', en: 'Delete My Account', es: 'Eliminar Mi Cuenta' }, lang)}
            </button>
          ) : (
            <div style={{ background: '#fef2f2', borderRadius: 8, padding: '1.2rem', border: '1px solid #fecaca' }}>
              <p style={{ fontFamily: sans, fontSize: '0.85rem', color: '#991b1b', fontWeight: 600, marginBottom: '1rem' }}>
                {t3({ ja: '本当に削除しますか？', en: 'Are you sure?', es: 'Esta seguro?' }, lang)}
              </p>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <button onClick={() => setShowDeleteConfirm(false)}
                  style={{ flex: 1, fontFamily: sans, fontSize: '0.8rem', color: '#666', background: '#fff', border: '1px solid #ddd', borderRadius: 8, padding: '0.6rem', cursor: 'pointer' }}>
                  {t3({ ja: 'キャンセル', en: 'Cancel', es: 'Cancelar' }, lang)}
                </button>
                <button onClick={handleDeleteAccount} disabled={deleting}
                  style={{ flex: 1, fontFamily: sans, fontSize: '0.8rem', color: '#fff', background: deleting ? '#94a3b8' : '#dc2626', border: 'none', borderRadius: 8, padding: '0.6rem', cursor: deleting ? 'wait' : 'pointer', fontWeight: 600 }}>
                  {deleting ? '...' : t3({ ja: '完全に削除', en: 'Delete', es: 'Eliminar' }, lang)}
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ fontFamily: sans, fontSize: '0.7rem', color: '#ccc', textAlign: 'center', marginTop: '2rem' }}>
          {t3({ ja: '登録日', en: 'Member since', es: 'Miembro desde' }, lang)}: {user.createdAt?.split('T')[0] || '-'}
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
