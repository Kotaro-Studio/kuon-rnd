'use client';

/**
 * MyMusicSection — 「私の音楽」（CLAUDE.md §48）
 * =========================================================
 * 余白の知性に従う「自己表現の場」。
 *
 * 構成:
 *   1. 足跡 — 在籍日数、アプリ利用数、バッジ数（数値は控えめに）
 *   2. 達成 — バッジ陳列（現状: 空状態の静かな表現）
 *   3. ポートフォリオプレビュー — 公開プロフィールの縮小版
 *   4. CTA — [編集] → /mypage/portfolio、[公開プロフィール] (将来)
 *
 * 設計原則:
 *   - キャラクター・マスコット禁止
 *   - 「凄い！」のような感嘆詞禁止
 *   - 数値は和紙の上の墨字のように静かに
 *   - 在籍が短くても、長くても、同じ敬意で扱う
 */

import Link from 'next/link';
import type { Lang } from '@/context/LangContext';

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';

const INK = '#1a1a1a';
const INK_SOFT = '#475569';
const INK_FAINT = '#94a3b8';
const STAFF_LINE = '#d4d0c4';
const PAPER = '#fafaf7';
const ACCENT_INDIGO = '#3a3a5e';
const ACCENT_GOLD = '#9c7c3a';

type L6 = { ja?: string; en: string; es?: string; ko?: string; pt?: string; de?: string };
const t = (m: L6, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

// 安全な日数計算（createdAt が無効値でも 0 を返す）
function daysSince(iso: string | undefined): number {
  if (!iso) return 0;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 0;
  const diffMs = Date.now() - d.getTime();
  return Math.max(0, Math.floor(diffMs / 86400000));
}

interface UserShape {
  email: string;
  name: string;
  role: string;
  bio: string;
  basedIn: string;
  createdAt: string;
  badges: string[];
  appUsage: Record<string, number>;
  customRoleName: string;
}

export interface MyMusicSectionProps {
  user: UserShape;
  lang: Lang;
  avatarUrl: string;
}

export function MyMusicSection({ user, lang, avatarUrl }: MyMusicSectionProps) {
  const memberDays = daysSince(user.createdAt);
  const totalAppUses = Object.values(user.appUsage || {}).reduce((sum, n) => sum + (n || 0), 0);
  const badgeCount = (user.badges || []).length;

  const displayName = user.name || (user.email ? user.email.split('@')[0] : '—');
  const displayRole = user.customRoleName || user.role || '';
  const displayBio = user.bio || '';
  const displayLocation = user.basedIn || '';

  const hasPortfolioContent = !!(displayRole || displayBio || displayLocation);

  return (
    <section
      id="my-music"
      style={{
        scrollMarginTop: 80,
        background: '#fff',
        border: `1px solid ${STAFF_LINE}`,
        borderRadius: 4,
        padding: 'clamp(1.6rem, 3.5vw, 2.4rem)',
        marginBottom: '1.5rem',
      }}
    >
      {/* ─── セクション見出し ─── */}
      <div style={{ marginBottom: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
        <div style={{
          fontFamily: sans,
          fontSize: '0.7rem',
          color: INK_FAINT,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: '0.5rem',
        }}>
          {t({ ja: 'マイミュージック', en: 'My Music', es: 'Mi música', ko: '나의 음악', pt: 'Minha música', de: 'Meine Musik' }, lang)}
        </div>
        <h2 style={{
          fontFamily: serif,
          fontSize: 'clamp(1.4rem, 3vw, 1.85rem)',
          fontWeight: 400,
          color: INK,
          letterSpacing: '0.04em',
          margin: 0,
          lineHeight: 1.4,
        }}>
          {t({
            ja: '私の音楽',
            en: 'My Music',
            es: 'Mi música',
            ko: '나의 음악',
            pt: 'Minha música',
            de: 'Meine Musik',
          }, lang)}
        </h2>
        <p style={{
          fontFamily: serif,
          fontSize: '0.9rem',
          color: INK_SOFT,
          fontStyle: 'italic',
          marginTop: '0.5rem',
          marginBottom: 0,
          lineHeight: 1.7,
        }}>
          {t({
            ja: '日々の積み重ねが、ここに集まります。',
            en: 'Every quiet day finds its place here.',
            es: 'Cada día callado encuentra su lugar aquí.',
            ko: '매일의 고요한 시간이 여기 모입니다.',
            pt: 'Cada dia silencioso encontra seu lugar aqui.',
            de: 'Jeder stille Tag findet hier seinen Ort.',
          }, lang)}
        </p>
      </div>

      {/* ─── 足跡（3 つの数値・控えめに） ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'clamp(0.6rem, 1.5vw, 1rem)',
        padding: 'clamp(1rem, 2vw, 1.4rem) 0',
        borderTop: `1px solid ${STAFF_LINE}`,
        borderBottom: `1px solid ${STAFF_LINE}`,
        marginBottom: 'clamp(1.6rem, 3vw, 2.2rem)',
      }}>
        <Stat
          label={t({ ja: '在籍', en: 'Member for', es: 'Miembro hace', ko: '재적', pt: 'Membro há', de: 'Mitglied seit' }, lang)}
          value={memberDays}
          unit={t({ ja: '日', en: 'days', es: 'días', ko: '일', pt: 'dias', de: 'Tagen' }, lang)}
          accent={ACCENT_INDIGO}
        />
        <Stat
          label={t({ ja: 'アプリ利用', en: 'Tools used', es: 'Apps usadas', ko: '앱 이용', pt: 'Apps usados', de: 'Tools genutzt' }, lang)}
          value={totalAppUses}
          unit={t({ ja: '回', en: 'times', es: 'veces', ko: '회', pt: 'vezes', de: 'Mal' }, lang)}
          accent={ACCENT_GOLD}
        />
        <Stat
          label={t({ ja: '達成', en: 'Achievements', es: 'Logros', ko: '성취', pt: 'Conquistas', de: 'Errungenschaften' }, lang)}
          value={badgeCount}
          unit={t({ ja: '件', en: 'items', es: 'items', ko: '개', pt: 'itens', de: 'Stück' }, lang)}
          accent={INK}
        />
      </div>

      {/* ─── 達成バッジ（陳列・現状は空状態） ─── */}
      <div style={{ marginBottom: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
        <div style={{
          fontFamily: sans,
          fontSize: '0.7rem',
          color: INK_FAINT,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: '0.8rem',
        }}>
          {t({ ja: '達成', en: 'Achievements', es: 'Logros', ko: '성취', pt: 'Conquistas', de: 'Errungenschaften' }, lang)}
        </div>
        {badgeCount > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {user.badges.map((b, i) => (
              <span key={i} style={{
                display: 'inline-block',
                padding: '0.4rem 0.9rem',
                background: PAPER,
                border: `1px solid ${STAFF_LINE}`,
                borderRadius: 999,
                fontFamily: sans,
                fontSize: '0.75rem',
                color: INK_SOFT,
                letterSpacing: '0.04em',
              }}>
                {b}
              </span>
            ))}
          </div>
        ) : (
          <p style={{
            fontFamily: serif,
            fontSize: '0.85rem',
            color: INK_FAINT,
            fontStyle: 'italic',
            margin: 0,
            lineHeight: 1.7,
          }}>
            {t({
              ja: 'これから少しずつ。慌てる必要はありません。',
              en: 'In time. There is no need to hurry.',
              es: 'Con el tiempo. No hay prisa.',
              ko: '시간이 지나면 자연히. 서두를 필요는 없습니다.',
              pt: 'Com o tempo. Sem pressa.',
              de: 'Mit der Zeit. Es eilt nicht.',
            }, lang)}
          </p>
        )}
      </div>

      {/* ─── ポートフォリオプレビュー ─── */}
      <div style={{ marginBottom: 'clamp(1.4rem, 2.5vw, 1.8rem)' }}>
        <div style={{
          fontFamily: sans,
          fontSize: '0.7rem',
          color: INK_FAINT,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          marginBottom: '0.8rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}>
          <span>
            {t({ ja: 'ポートフォリオ', en: 'Portfolio', es: 'Portafolio', ko: '포트폴리오', pt: 'Portfólio', de: 'Portfolio' }, lang)}
          </span>
          <span style={{ fontSize: '0.65rem', textTransform: 'none', letterSpacing: '0.02em', color: INK_FAINT, fontStyle: 'italic' }}>
            {t({ ja: 'プレビュー', en: 'Preview', es: 'Vista previa', ko: '미리보기', pt: 'Visualização', de: 'Vorschau' }, lang)}
          </span>
        </div>

        <div style={{
          background: PAPER,
          border: `1px solid ${STAFF_LINE}`,
          borderRadius: 4,
          padding: 'clamp(1.2rem, 2.5vw, 1.6rem)',
          display: 'flex',
          gap: 'clamp(1rem, 2vw, 1.4rem)',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}>
          {/* Avatar */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            overflow: 'hidden', flexShrink: 0,
            background: '#f1f5f9',
            border: `1px solid ${STAFF_LINE}`,
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{
              fontFamily: serif,
              fontSize: 'clamp(1.05rem, 2vw, 1.2rem)',
              fontWeight: 400,
              color: INK,
              letterSpacing: '0.02em',
              marginBottom: '0.3rem',
            }}>
              {displayName}
            </div>
            {displayRole && (
              <div style={{
                fontFamily: sans,
                fontSize: '0.78rem',
                color: INK_SOFT,
                letterSpacing: '0.04em',
                marginBottom: '0.3rem',
              }}>
                {displayRole}
                {displayLocation && (
                  <>
                    <span style={{ margin: '0 0.5rem', color: INK_FAINT }}>·</span>
                    <span style={{ color: INK_SOFT }}>{displayLocation}</span>
                  </>
                )}
              </div>
            )}
            {displayBio ? (
              <p style={{
                fontFamily: serif,
                fontSize: '0.85rem',
                color: INK_SOFT,
                lineHeight: 1.7,
                margin: 0,
                wordBreak: 'keep-all' as const,
                // 2 行で打ち切り（プレビュー）
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              }}>
                {displayBio}
              </p>
            ) : (
              <p style={{
                fontFamily: serif,
                fontSize: '0.85rem',
                color: INK_FAINT,
                lineHeight: 1.7,
                fontStyle: 'italic',
                margin: 0,
              }}>
                {t({
                  ja: 'まだ自己紹介が空です。あなたの音楽を、言葉にしてみませんか。',
                  en: 'Your bio awaits. Share your music in your own words.',
                  es: 'Tu biografía espera. Comparte tu música con tus palabras.',
                  ko: '아직 자기 소개가 비어 있습니다. 당신의 음악을 글로 담아 보세요.',
                  pt: 'Sua bio aguarda. Compartilhe sua música em suas palavras.',
                  de: 'Ihre Bio wartet. Erzählen Sie Ihre Musik mit eigenen Worten.',
                }, lang)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ─── CTA: 編集 + 公開プロフィール ─── */}
      <div style={{
        display: 'flex',
        gap: '0.8rem',
        flexWrap: 'wrap',
      }}>
        <Link
          href="/mypage/portfolio"
          style={{
            fontFamily: sans,
            fontSize: '0.8rem',
            color: INK,
            background: 'transparent',
            border: `1px solid ${INK}`,
            borderRadius: 999,
            padding: '0.55rem 1.2rem',
            textDecoration: 'none',
            letterSpacing: '0.06em',
            transition: 'all 0.2s ease',
            display: 'inline-block',
          }}
        >
          {t({
            ja: 'ポートフォリオを編集',
            en: 'Edit portfolio',
            es: 'Editar portafolio',
            ko: '포트폴리오 편집',
            pt: 'Editar portfólio',
            de: 'Portfolio bearbeiten',
          }, lang)}
        </Link>

        {/* 公開プロフィール — 将来実装。現状は coming soon の disabled 表示 */}
        <span
          style={{
            fontFamily: sans,
            fontSize: '0.8rem',
            color: INK_FAINT,
            background: 'transparent',
            border: `1px dashed ${STAFF_LINE}`,
            borderRadius: 999,
            padding: '0.55rem 1.2rem',
            letterSpacing: '0.06em',
            display: 'inline-block',
            cursor: 'default',
          }}
          title={t({
            ja: '公開プロフィールは近日対応予定です',
            en: 'Public profile coming soon',
            es: 'Perfil público próximamente',
            ko: '공개 프로필 곧 지원 예정',
            pt: 'Perfil público em breve',
            de: 'Öffentliches Profil bald verfügbar',
          }, lang)}
        >
          {t({
            ja: '公開プロフィール（準備中）',
            en: 'Public profile (coming soon)',
            es: 'Perfil público (próximamente)',
            ko: '공개 프로필 (준비 중)',
            pt: 'Perfil público (em breve)',
            de: 'Öffentliches Profil (bald)',
          }, lang)}
        </span>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────
// Stat — 「私の音楽」セクション内の 1 数値
// ─────────────────────────────────────────
function Stat({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: number;
  unit: string;
  accent: string;
}) {
  return (
    <div style={{ textAlign: 'center' as const }}>
      <div style={{
        fontFamily: sans,
        fontSize: '0.66rem',
        color: INK_FAINT,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '0.4rem',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
        <span style={{
          fontFamily: serif,
          fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
          fontWeight: 400,
          color: accent,
          lineHeight: 1,
        }}>
          {value}
        </span>
        <span style={{
          fontFamily: sans,
          fontSize: '0.72rem',
          color: INK_FAINT,
          letterSpacing: '0.04em',
        }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

export default MyMusicSection;
