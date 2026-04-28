'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import {
  APP_CATALOG,
  CATEGORIES,
  appsForPlan,
  appsLockedFor,
  recommendedAppOfDay,
  totalAppCount,
  isAppNew,
  type CatalogApp,
  type AppCategory,
} from '@/app/lib/app-catalog';
import type { PlanTier } from '@/app/lib/pricing-display';
import { QuotaMeter, type UsageData } from '@/components/QuotaMeter';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang) => m[lang] ?? m.en;

interface MyAppsSectionProps {
  userPlan: PlanTier | 'free' | null;
  isLoggedIn: boolean;
}

const RECENT_KEY = 'kuon_recent_apps';
const FAVORITES_KEY = 'kuon_favorite_apps';
const MAX_RECENT = 6;

export function MyAppsSection({ userPlan, isLoggedIn }: MyAppsSectionProps) {
  const { lang } = useLang();
  const [activeCategory, setActiveCategory] = useState<AppCategory | 'all' | 'favorites'>('all');
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [usageLoading, setUsageLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const recent = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') as string[];
      const favs = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]') as string[];
      setRecentIds(recent);
      setFavoriteIds(favs);
    } catch {
      // ignore
    }
  }, []);

  // ── Fetch usage data from Auth Worker (Phase 2) ──
  useEffect(() => {
    if (!isLoggedIn) {
      setUsageLoading(false);
      return;
    }
    let canceled = false;
    fetch('/api/auth/usage/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!canceled && data) setUsageData(data as UsageData);
      })
      .catch(() => { /* silent */ })
      .finally(() => {
        if (!canceled) setUsageLoading(false);
      });
    return () => { canceled = true; };
  }, [isLoggedIn]);

  const availableApps = useMemo(() => appsForPlan(userPlan, isLoggedIn), [userPlan, isLoggedIn]);
  const lockedApps = useMemo(() => appsLockedFor(userPlan, isLoggedIn), [userPlan, isLoggedIn]);
  const recommended = useMemo(
    () => recommendedAppOfDay(userPlan, isLoggedIn, recentIds),
    [userPlan, isLoggedIn, recentIds]
  );

  const recentApps = useMemo(() => {
    return recentIds
      .map((id) => availableApps.find((a) => a.id === id))
      .filter((a): a is CatalogApp => Boolean(a));
  }, [recentIds, availableApps]);

  const favoriteApps = useMemo(() => {
    return favoriteIds
      .map((id) => availableApps.find((a) => a.id === id))
      .filter((a): a is CatalogApp => Boolean(a));
  }, [favoriteIds, availableApps]);

  const filteredApps = useMemo(() => {
    if (activeCategory === 'all') return availableApps;
    if (activeCategory === 'favorites') return favoriteApps;
    return availableApps.filter((a) => a.category === activeCategory);
  }, [activeCategory, availableApps, favoriteApps]);

  function toggleFavorite(id: string) {
    const next = favoriteIds.includes(id)
      ? favoriteIds.filter((x) => x !== id)
      : [...favoriteIds, id];
    setFavoriteIds(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    }
  }

  function recordRecent(id: string) {
    if (typeof window === 'undefined') return;
    const next = [id, ...recentIds.filter((x) => x !== id)].slice(0, MAX_RECENT);
    setRecentIds(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }

  const planLabel = useMemo(() => {
    if (!userPlan || userPlan === 'free') return t({ ja: 'Free', en: 'Free', es: 'Gratis' }, lang);
    const labels: Record<string, L> = {
      prelude: { ja: 'Prelude (Standard)', en: 'Prelude (Standard)', es: 'Prelude (Standard)' },
      concerto: { ja: 'Concerto (Pro)', en: 'Concerto (Pro)', es: 'Concerto (Pro)' },
      symphony: { ja: 'Symphony (Premium)', en: 'Symphony (Premium)', es: 'Symphony (Premium)' },
      opus: { ja: 'Opus (Max)', en: 'Opus (Max)', es: 'Opus (Max)' },
    };
    return t(labels[userPlan] || { en: userPlan }, lang);
  }, [userPlan, lang]);

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* ─── Header banner: "あなたが使えるアプリ" ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #ecfeff 0%, #f0f9ff 100%)',
        border: '1px solid #bae6fd',
        borderRadius: 12,
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ fontSize: '0.7rem', color: '#0369a1', letterSpacing: '0.15em', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          ✨ {t({ ja: 'あなたの音楽工房', en: 'Your Music Workshop', es: 'Tu Taller Musical' }, lang)}
        </div>
        <div style={{ fontFamily: serif, fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: '#0f172a', fontWeight: 400, marginBottom: '0.4rem' }}>
          {t({
            ja: `あなたは ${planLabel} プランです`,
            en: `You're on the ${planLabel} plan`,
            es: `Estás en el plan ${planLabel}`,
          }, lang)}
        </div>
        <div style={{ fontSize: '0.85rem', color: '#475569' }}>
          {t({
            ja: `${availableApps.length} 種類のアプリが使えます (全 ${totalAppCount()} 種類中)`,
            en: `${availableApps.length} apps available (out of ${totalAppCount()} total)`,
            es: `${availableApps.length} apps disponibles (de ${totalAppCount()})`,
          }, lang)}
        </div>
      </div>

      {/* ─── Quota meter (Phase 2: 今月の使用状況) ─── */}
      <QuotaMeter data={usageData} loading={usageLoading} />

      {/* ─── Recommended app of the day ─── */}
      {recommended && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fde68a',
          borderRadius: 12,
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ fontSize: '2rem' }}>{recommended.emoji}</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: '0.7rem', color: '#92400e', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
              🌟 {t({ ja: '今日のおすすめ', en: "Today's Pick", es: 'Recomendación de hoy' }, lang)}
            </div>
            <div style={{ fontFamily: sans, fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
              {t(recommended.name, lang)}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#92400e', marginTop: '0.25rem' }}>
              {t(recommended.tagline, lang)}
            </div>
          </div>
          <Link
            href={recommended.launchHref}
            onClick={() => recordRecent(recommended.id)}
            style={{
              background: '#92400e', color: '#fff', padding: '0.55rem 1.1rem',
              borderRadius: 6, textDecoration: 'none', fontFamily: sans, fontSize: '0.85rem', fontWeight: 500,
            }}
          >
            {t({ ja: '今すぐ試す →', en: 'Try Now →', es: 'Probar →' }, lang)}
          </Link>
        </div>
      )}

      {/* ─── Recently used apps ─── */}
      {recentApps.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, marginBottom: '0.6rem' }}>
            🕐 {t({ ja: '最近使ったアプリ', en: 'Recently Used', es: 'Recientemente usadas' }, lang)}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {recentApps.map((app) => (
              <Link key={app.id} href={app.launchHref} onClick={() => recordRecent(app.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: '#f1f5f9', padding: '0.4rem 0.75rem', borderRadius: 999,
                  textDecoration: 'none', color: '#0f172a', fontSize: '0.8rem', fontFamily: sans,
                }}
              >
                <span>{app.emoji}</span>
                <span>{t(app.name, lang)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ─── Category filter chips ─── */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <CategoryChip
          active={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
          label={t({ ja: `すべて (${availableApps.length})`, en: `All (${availableApps.length})`, es: `Todos (${availableApps.length})` }, lang)}
        />
        {favoriteApps.length > 0 && (
          <CategoryChip
            active={activeCategory === 'favorites'}
            onClick={() => setActiveCategory('favorites')}
            label={t({ ja: `★ お気に入り (${favoriteApps.length})`, en: `★ Favorites (${favoriteApps.length})`, es: `★ Favoritos (${favoriteApps.length})` }, lang)}
          />
        )}
        {CATEGORIES.map((cat) => {
          const count = availableApps.filter((a) => a.category === cat.id).length;
          if (count === 0) return null;
          return (
            <CategoryChip
              key={cat.id}
              active={activeCategory === cat.id}
              onClick={() => setActiveCategory(cat.id)}
              label={`${cat.emoji} ${t(cat.label, lang)} (${count})`}
            />
          );
        })}
      </div>

      {/* ─── Apps grid ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '0.75rem',
        marginBottom: '2rem',
      }}>
        {filteredApps.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            isFavorite={favoriteIds.includes(app.id)}
            onToggleFavorite={() => toggleFavorite(app.id)}
            onLaunch={() => recordRecent(app.id)}
            lang={lang}
            unlocked
          />
        ))}
      </div>

      {/* ─── Locked apps (upsell) ─── */}
      {lockedApps.length > 0 && (
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '0.85rem' }}>
            🔒 {t({
              ja: `上位プランで解放されるアプリ (${lockedApps.length})`,
              en: `Apps unlocked with upgrade (${lockedApps.length})`,
              es: `Apps desbloqueadas con actualización (${lockedApps.length})`,
            }, lang)}
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}>
            {lockedApps.map((app) => (
              <AppCard
                key={app.id}
                app={app}
                isFavorite={false}
                onToggleFavorite={() => {}}
                onLaunch={() => {}}
                lang={lang}
                unlocked={false}
              />
            ))}
          </div>
          <Link href="/#pricing" style={{
            display: 'inline-block', padding: '0.55rem 1.1rem', background: ACCENT, color: '#fff',
            borderRadius: 6, textDecoration: 'none', fontFamily: sans, fontSize: '0.85rem', fontWeight: 500,
          }}>
            {t({ ja: 'プランを見る →', en: 'View Plans →', es: 'Ver Planes →' }, lang)}
          </Link>
        </div>
      )}
    </div>
  );
}

function CategoryChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? ACCENT : '#fff',
        color: active ? '#fff' : '#475569',
        border: `1px solid ${active ? ACCENT : '#cbd5e1'}`,
        padding: '0.4rem 0.85rem', borderRadius: 999, fontSize: '0.75rem',
        fontFamily: sans, cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
      }}
    >
      {label}
    </button>
  );
}

interface AppCardProps {
  app: CatalogApp;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onLaunch: () => void;
  lang: Lang;
  unlocked: boolean;
}

function AppCard({ app, isFavorite, onToggleFavorite, onLaunch, lang, unlocked }: AppCardProps) {
  const isComingSoon = app.badges.includes('COMING_SOON');
  const cardStyle: React.CSSProperties = {
    background: unlocked ? '#fff' : '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    padding: '0.85rem',
    position: 'relative',
    opacity: unlocked ? 1 : 0.7,
    transition: 'all 0.2s ease',
  };

  const content = (
    <>
      {/* Star (favorite) — only on unlocked */}
      {unlocked && !isComingSoon && (
        <button
          onClick={(e) => { e.preventDefault(); onToggleFavorite(); }}
          style={{
            position: 'absolute', top: 6, right: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '0.95rem', padding: 4, lineHeight: 1,
            color: isFavorite ? '#f59e0b' : '#cbd5e1',
          }}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '★' : '☆'}
        </button>
      )}
      <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{app.emoji}</div>
      <div style={{ fontFamily: sans, fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem', lineHeight: 1.3 }}>
        {t(app.name, lang)}
      </div>
      <div style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.4, marginBottom: '0.5rem', minHeight: '2.5em' }}>
        {t(app.tagline, lang)}
      </div>
      {/* Badges row */}
      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', minHeight: 18 }}>
        {!unlocked && (
          <BadgePill text={t({ ja: '上位プラン', en: 'Upgrade', es: 'Mejorar' }, lang)} bg="#e2e8f0" color="#475569" />
        )}
        {isAppNew(app) && unlocked && (
          <BadgePill text="NEW" bg="#0ea5e9" color="#fff" />
        )}
        {app.badges.includes('PRO') && unlocked && (
          <BadgePill text="PRO" bg="#a855f7" color="#fff" />
        )}
        {app.badges.includes('POPULAR') && unlocked && (
          <BadgePill text={t({ ja: '人気', en: 'POPULAR', es: 'POPULAR' }, lang)} bg="#f59e0b" color="#fff" />
        )}
        {app.badges.includes('MIC_OWNER') && unlocked && (
          <BadgePill text={t({ ja: 'マイク特典', en: 'MIC OWNER', es: 'DUEÑO MIC' }, lang)} bg="#fef3c7" color="#92400e" />
        )}
        {isComingSoon && (
          <BadgePill text={t({ ja: '近日公開', en: 'SOON', es: 'PRONTO' }, lang)} bg="#f1f5f9" color="#64748b" />
        )}
      </div>
    </>
  );

  if (!unlocked || isComingSoon) {
    return <div style={cardStyle}>{content}</div>;
  }

  return (
    <Link href={app.launchHref} onClick={onLaunch}
      style={{ ...cardStyle, textDecoration: 'none', color: 'inherit', display: 'block' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(2,132,199,0.1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {content}
    </Link>
  );
}

function BadgePill({ text, bg, color }: { text: string; bg: string; color: string }) {
  return (
    <span style={{
      background: bg, color, padding: '1px 6px', borderRadius: 999,
      fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.05em',
      lineHeight: 1.4,
    }}>
      {text}
    </span>
  );
}
