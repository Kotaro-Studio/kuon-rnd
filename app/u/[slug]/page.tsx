'use client';

/**
 * /u/[slug] — 公開ポートフォリオページ
 *
 * 認証不要。Auth Worker の GET /api/auth/public/:slug から
 * 公開セーフなフィールドのみを取得して表示。
 *
 * slug 形式: "369-at-kotaroasahina-com" (email の @ → -at-, . → - 変換)
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", Monaco, monospace';

const INK = '#1a1a1a';
const INK_SOFT = '#475569';
const INK_FAINT = '#94a3b8';
const PAPER = '#fafaf7';
const PAPER_DEEP = '#f5f4ed';
const STAFF_LINE = '#d4d0c4';
const ACCENT = '#9c7c3a';
const ACCENT_DEEP = '#7a5e26';
const GREEN = '#15803d';

const AUTH_WORKER = 'https://kuon-rnd-auth-worker.369-1d5.workers.dev';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

interface PublicProfile {
  slug: string;
  name: string;
  role: string;
  roleCategory: string;
  customRoleName: string;
  basedIn: string;
  mobility: string;
  bio: string;
  experienceLevel: string;
  spokenLanguages: string;
  availableForWork: boolean;
  avatarKey: string;
  snsYoutube: string;
  snsInstagram: string;
  snsX: string;
  snsSoundcloud: string;
  snsWebsite: string;
  isPro: boolean;
}

const ROLE_LABELS: Record<string, L> = {
  violin: { ja: 'ヴァイオリン', en: 'Violin' },
  viola: { ja: 'ヴィオラ', en: 'Viola' },
  cello: { ja: 'チェロ', en: 'Cello' },
  piano: { ja: 'ピアノ', en: 'Piano' },
  voice: { ja: '声楽', en: 'Voice' },
  flute: { ja: 'フルート', en: 'Flute' },
  guitar: { ja: 'ギター', en: 'Guitar' },
  conductor: { ja: '指揮', en: 'Conducting' },
  composer: { ja: '作曲', en: 'Composition' },
  arranger: { ja: '編曲', en: 'Arrangement' },
  'recording-engineer': { ja: '録音エンジニア', en: 'Recording Engineer' },
  'mastering-engineer': { ja: 'マスタリングエンジニア', en: 'Mastering Engineer' },
  'mixing-engineer': { ja: 'ミックスエンジニア', en: 'Mixing Engineer' },
  producer: { ja: 'プロデューサー', en: 'Producer' },
};

const EXPERIENCE_LABELS: Record<string, L> = {
  student: { ja: '学生', en: 'Student' },
  amateur: { ja: 'アマチュア', en: 'Amateur' },
  'semi-pro': { ja: 'セミプロ', en: 'Semi-pro' },
  professional: { ja: 'プロフェッショナル', en: 'Professional' },
};

const MOBILITY_LABELS: Record<string, L> = {
  local: { ja: '近隣のみ', en: 'Local only' },
  domestic: { ja: '国内', en: 'Domestic' },
  international: { ja: '国際', en: 'International' },
};

export default function PublicProfilePage() {
  const { lang } = useLang();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${AUTH_WORKER}/api/auth/public/${slug}`);
        if (!res.ok) {
          if (!cancelled) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setProfile(data.profile);
          // avatar endpoint expects email (URL-encoded), not avatarKey
          if (data.profile.avatarKey) {
            const email = slug.replace(/-at-/, '@').replace(/-/g, '.');
            setAvatarUrl(`${AUTH_WORKER}/api/auth/avatar/${encodeURIComponent(email)}`);
          }
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setNotFound(true);
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div style={{ background: PAPER, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: serif, color: INK_FAINT, fontStyle: 'italic' }}>...</div>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div style={{ background: PAPER, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <h1 style={{ fontFamily: serif, fontSize: '1.6rem', fontWeight: 400, color: INK, margin: '0 0 1rem 0' }}>
            {t({ ja: 'プロフィールが見つかりません', en: 'Profile not found' }, lang)}
          </h1>
          <p style={{ fontFamily: sans, fontSize: '0.9rem', color: INK_SOFT, lineHeight: 1.85 }}>
            {t({
              ja: 'このユーザーは公開プロフィールを設定していません。',
              en: 'This user has not made their profile public yet.',
            }, lang)}
          </p>
          <Link href="/" style={{ marginTop: '2rem', display: 'inline-block', fontFamily: sans, fontSize: '0.85rem', color: ACCENT, textDecoration: 'none' }}>
            ← {t({ ja: 'KUON R&D に戻る', en: 'Back to KUON R&D' }, lang)}
          </Link>
        </div>
      </div>
    );
  }

  const roleLabel = ROLE_LABELS[profile.role]
    ? t(ROLE_LABELS[profile.role], lang)
    : profile.customRoleName || profile.role;
  const experienceLabel = EXPERIENCE_LABELS[profile.experienceLevel]
    ? t(EXPERIENCE_LABELS[profile.experienceLevel], lang)
    : profile.experienceLevel;
  const mobilityLabel = MOBILITY_LABELS[profile.mobility]
    ? t(MOBILITY_LABELS[profile.mobility], lang)
    : profile.mobility;

  return (
    <div style={{ background: PAPER, minHeight: '100vh', color: INK }}>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: 'clamp(3rem, 6vw, 5rem) clamp(1.5rem, 4vw, 3rem)' }}>
        {/* Eyebrow */}
        <div style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.32em', textTransform: 'uppercase', marginBottom: '1.4rem' }}>
          KUON R&D · 公開プロフィール
        </div>

        {/* Header */}
        <header style={{ display: 'flex', alignItems: 'center', gap: 'clamp(1rem, 3vw, 2rem)', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ width: 110, height: 110, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: PAPER_DEEP, border: `2px solid ${STAFF_LINE}` }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif, fontSize: '2.5rem', color: INK_FAINT }}>
                {(profile.name?.[0] || '?').toUpperCase()}
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4.5vw, 2.6rem)', fontWeight: 400, color: INK, margin: 0, letterSpacing: '0.03em', lineHeight: 1.4 }}>
              {profile.name || profile.slug}
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center', marginTop: '0.7rem' }}>
              {roleLabel && (
                <span style={{ fontFamily: sans, fontSize: '0.8rem', color: INK_SOFT, letterSpacing: '0.04em' }}>
                  {roleLabel}
                </span>
              )}
              {profile.basedIn && (
                <span style={{ fontFamily: sans, fontSize: '0.8rem', color: INK_FAINT }}>
                  · {profile.basedIn}
                </span>
              )}
              {profile.availableForWork && (
                <span style={{ fontFamily: sans, fontSize: '0.7rem', fontWeight: 600, color: GREEN, background: '#ecfdf5', border: `1px solid #a7f3d0`, padding: '3px 10px', borderRadius: 50 }}>
                  {t({ ja: '募集中', en: 'Available for work', es: 'Disponible' }, lang)}
                </span>
              )}
              {profile.isPro && (
                <span style={{ fontFamily: sans, fontSize: '0.7rem', fontWeight: 600, color: ACCENT_DEEP, background: '#fef3c7', border: `1px solid ${ACCENT}55`, padding: '3px 10px', borderRadius: 50 }}>
                  Pro
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Bio */}
        {profile.bio && (
          <section style={{ marginBottom: '2.5rem' }}>
            <p style={{ fontFamily: serif, fontSize: 'clamp(1rem, 1.7vw, 1.1rem)', color: INK, lineHeight: 2, letterSpacing: '0.02em', whiteSpace: 'pre-wrap' as const, margin: 0 }}>
              {profile.bio}
            </p>
          </section>
        )}

        {/* Meta grid */}
        <section style={{ background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4, padding: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: '2rem' }}>
          <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem 2rem', margin: 0 }}>
            {experienceLabel && (
              <MetaRow label={t({ ja: '経験レベル', en: 'Experience' }, lang)} value={experienceLabel} />
            )}
            {mobilityLabel && (
              <MetaRow label={t({ ja: '活動範囲', en: 'Mobility' }, lang)} value={mobilityLabel} />
            )}
            {profile.spokenLanguages && (
              <MetaRow label={t({ ja: '対応言語', en: 'Languages' }, lang)} value={profile.spokenLanguages.split(',').map(s => s.trim().toUpperCase()).join(' · ')} />
            )}
            {profile.basedIn && (
              <MetaRow label={t({ ja: '拠点', en: 'Based in' }, lang)} value={profile.basedIn} />
            )}
          </dl>
        </section>

        {/* Links */}
        {(profile.snsYoutube || profile.snsInstagram || profile.snsX || profile.snsSoundcloud || profile.snsWebsite) && (
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              {t({ ja: 'リンク', en: 'Links' }, lang)}
            </h2>
            <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap' }}>
              {profile.snsWebsite && <SocialLink href={profile.snsWebsite} label="Website" />}
              {profile.snsYoutube && <SocialLink href={profile.snsYoutube} label="YouTube" />}
              {profile.snsInstagram && <SocialLink href={profile.snsInstagram} label="Instagram" />}
              {profile.snsX && <SocialLink href={profile.snsX} label="X" />}
              {profile.snsSoundcloud && <SocialLink href={profile.snsSoundcloud} label="SoundCloud" />}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: `1px solid ${STAFF_LINE}`, textAlign: 'center' }}>
          <Link href="/" style={{ fontFamily: serif, fontSize: '0.85rem', color: ACCENT, textDecoration: 'none', letterSpacing: '0.04em' }}>
            KUON R&D · 空音開発 →
          </Link>
        </footer>
      </main>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt style={{ fontFamily: mono, fontSize: '0.65rem', color: INK_FAINT, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
        {label}
      </dt>
      <dd style={{ fontFamily: serif, fontSize: '0.95rem', color: INK, margin: 0, lineHeight: 1.7 }}>
        {value}
      </dd>
    </div>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  const url = href.startsWith('http') ? href : `https://${href}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontFamily: sans, fontSize: '0.82rem', color: INK,
        textDecoration: 'none',
        padding: '0.55rem 1rem',
        background: '#fff',
        border: `1px solid ${STAFF_LINE}`,
        borderRadius: 3,
        letterSpacing: '0.04em',
        transition: 'border-color 0.2s ease',
      }}
    >
      {label} ↗
    </a>
  );
}
