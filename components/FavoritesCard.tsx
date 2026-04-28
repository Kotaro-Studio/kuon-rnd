'use client';

/**
 * FavoritesCard — マイページのお気に入りアプリセクション
 *
 * 機能:
 *   - サーバー (Auth Worker) にお気に入り順序付きリストを保存
 *   - ドラッグ&ドロップで並び替え
 *   - "+ 追加" でアプリピッカーモーダルを開く
 *   - "×" で個別削除
 *   - クリックでアプリ起動
 *   - 空状態の優しい誘導 UI
 *
 * 設計思想 (IQ180):
 *   - これは「自分の道具箱」を作る体験。所有感を生む。
 *   - ユーザーが Free でも使える。リテンション機能は全プラン共通。
 *   - 上限 20 個 (バックエンドで強制)
 */

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import {
  APP_CATALOG,
  appsForPlan,
  type CatalogApp,
} from '@/app/lib/app-catalog';
import type { PlanTier } from '@/app/lib/pricing-display';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L3 = Partial<Record<Lang, string>> & { en: string };
const t3 = (m: L3, lang: Lang) => m[lang] ?? m.en;

const LABELS = {
  title: { ja: '⭐ お気に入り', en: '⭐ Favorites', es: '⭐ Favoritos' } as L3,
  subtitle: {
    ja: 'よく使うアプリをここに置けば、いつでも一発で開けます。',
    en: 'Pin your most-used apps for one-click access.',
    es: 'Fija tus apps más usadas para acceso de un clic.',
  } as L3,
  emptyTitle: {
    ja: 'まだお気に入りはありません',
    en: 'No favorites yet',
    es: 'Aún no tienes favoritos',
  } as L3,
  emptyDesc: {
    ja: '練習・録音・本番準備で毎日使うアプリを登録すると、ここから一発で開けます。',
    en: 'Add the apps you use daily — practice, recording, performance — to launch them instantly.',
    es: 'Agrega las apps que usas diariamente para abrirlas al instante.',
  } as L3,
  addBtn: { ja: '+ お気に入りを追加', en: '+ Add favorite', es: '+ Agregar favorito' } as L3,
  pickerTitle: {
    ja: 'お気に入りに追加するアプリを選ぶ',
    en: 'Select an app to favorite',
    es: 'Selecciona una app para favorita',
  } as L3,
  pickerEmpty: {
    ja: '追加できるアプリがありません',
    en: 'No more apps available',
    es: 'No hay más apps disponibles',
  } as L3,
  closePicker: { ja: '閉じる', en: 'Close', es: 'Cerrar' } as L3,
  remove: { ja: 'お気に入りから外す', en: 'Remove from favorites', es: 'Eliminar de favoritos' } as L3,
  saving: { ja: '保存中...', en: 'Saving...', es: 'Guardando...' } as L3,
  loadError: {
    ja: 'お気に入りの読み込みに失敗しました',
    en: 'Failed to load favorites',
    es: 'No se pudieron cargar los favoritos',
  } as L3,
  hint: {
    ja: 'カードをドラッグして並び替え',
    en: 'Drag cards to reorder',
    es: 'Arrastra para reordenar',
  } as L3,
  upTo: {
    ja: '最大 20 個まで',
    en: 'Up to 20',
    es: 'Hasta 20',
  } as L3,
  // 2026-04-27 IQ180 機能 A: 使用回数から自動おすすめ
  suggestedTitle: {
    ja: 'よく使うアプリ',
    en: 'You use these often',
    es: 'Las usas mucho',
  } as L3,
  suggestedHint: {
    ja: 'お気に入りに登録すると、いつでも一発で開けます',
    en: 'Pin them for one-click access',
    es: 'Fíjalas para acceso de un clic',
  } as L3,
};

// 月内に N 回以上使ったらお気に入り候補として表示
const SUGGESTED_USAGE_THRESHOLD = 3;
// 最大何件のおすすめを表示するか
const MAX_SUGGESTIONS = 4;

interface Props {
  userPlan: PlanTier | 'free' | undefined;
  appUsage?: Record<string, number>;
}

export function FavoritesCard({ userPlan, appUsage }: Props) {
  const { lang } = useLang();
  const [favIds, setFavIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── 初期ロード ──
  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/favorites')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!mounted) return;
        if (data && Array.isArray(data.ids)) {
          setFavIds(data.ids);
        }
        setLoading(false);
      })
      .catch(() => {
        if (mounted) {
          setError(t3(LABELS.loadError, lang));
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 保存 (デバウンスはせずに即時 PUT) ──
  const persist = useCallback(async (ids: string[]) => {
    setSaving(true);
    try {
      await fetch('/api/auth/favorites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
    } finally {
      setSaving(false);
    }
  }, []);

  // ── 操作 ──
  const handleAdd = (appId: string) => {
    if (favIds.includes(appId)) return;
    if (favIds.length >= 20) return;
    const next = [...favIds, appId];
    setFavIds(next);
    setPickerOpen(false);
    persist(next);
  };

  const handleRemove = (appId: string) => {
    const next = favIds.filter((id) => id !== appId);
    setFavIds(next);
    persist(next);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const next = [...favIds];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    setFavIds(next);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    if (dragIndex !== null) {
      persist(favIds);
    }
    setDragIndex(null);
  };

  // ── データ整形 ──
  const favApps: CatalogApp[] = favIds
    .map((id) => APP_CATALOG.find((a) => a.id === id))
    .filter((a): a is CatalogApp => Boolean(a));

  const availableApps = appsForPlan(userPlan ?? 'free', true).filter(
    (a) => !favIds.includes(a.id),
  );

  // ── おすすめ算出 (使用回数ベース) ──
  // 月内 SUGGESTED_USAGE_THRESHOLD 回以上使った + お気に入り未登録 + 使えるアプリ
  const suggestions: Array<{ app: CatalogApp; count: number }> = [];
  if (appUsage && !loading && favApps.length > 0) {
    const accessibleSet = new Set(availableApps.map((a) => a.id));
    const candidates = Object.entries(appUsage)
      .filter(([id, count]) => count >= SUGGESTED_USAGE_THRESHOLD && accessibleSet.has(id))
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_SUGGESTIONS);

    for (const [id, count] of candidates) {
      const app = availableApps.find((a) => a.id === id);
      if (app) suggestions.push({ app, count });
    }
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}
    >
      {/* ── ヘッダー ── */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontFamily: serif, fontSize: '1.1rem', fontWeight: 400, color: '#0f172a', margin: 0 }}>
          {t3(LABELS.title, lang)}
        </h2>
        {saving && (
          <span style={{ fontFamily: sans, fontSize: '0.7rem', color: '#94a3b8' }}>
            {t3(LABELS.saving, lang)}
          </span>
        )}
      </div>
      <p style={{ fontFamily: sans, fontSize: '0.8rem', color: '#64748b', marginTop: 0, marginBottom: '1rem', lineHeight: 1.55 }}>
        {t3(LABELS.subtitle, lang)}
      </p>

      {error && (
        <p style={{ fontFamily: sans, fontSize: '0.8rem', color: '#dc2626', marginBottom: '0.75rem' }}>
          {error}
        </p>
      )}

      {loading ? (
        <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 20, height: 20, border: '2px solid #e2e8f0', borderTopColor: ACCENT, borderRadius: '50%', animation: 'fav-spin 0.8s linear infinite' }} />
          <style>{`@keyframes fav-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : favApps.length === 0 ? (
        // ── 空状態 ──
        <div
          style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            background: '#f8fafc',
            borderRadius: 8,
            border: '1px dashed #cbd5e1',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.4 }}>⭐</div>
          <p style={{ fontFamily: sans, fontSize: '0.95rem', color: '#475569', margin: 0, marginBottom: '0.4rem', fontWeight: 500 }}>
            {t3(LABELS.emptyTitle, lang)}
          </p>
          <p style={{ fontFamily: sans, fontSize: '0.82rem', color: '#94a3b8', margin: 0, lineHeight: 1.6, maxWidth: 380, marginInline: 'auto' }}>
            {t3(LABELS.emptyDesc, lang)}
          </p>
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            style={{
              marginTop: '1.2rem',
              padding: '0.6rem 1.4rem',
              background: ACCENT,
              color: '#fff',
              border: 'none',
              borderRadius: 999,
              fontFamily: sans,
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            {t3(LABELS.addBtn, lang)}
          </button>
        </div>
      ) : (
        // ── お気に入りカード一覧 ──
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {favApps.map((app, index) => (
              <div
                key={app.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                style={{
                  position: 'relative',
                  background: dragIndex === index ? '#f0f9ff' : '#fff',
                  border: `1px solid ${dragIndex === index ? ACCENT : '#e2e8f0'}`,
                  borderRadius: 10,
                  padding: '1rem 0.7rem',
                  textAlign: 'center',
                  cursor: 'grab',
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                }}
              >
                <button
                  type="button"
                  aria-label={t3(LABELS.remove, lang)}
                  title={t3(LABELS.remove, lang)}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(app.id);
                  }}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    border: 'none',
                    background: 'transparent',
                    color: '#cbd5e1',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    lineHeight: 1,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fef2f2';
                    e.currentTarget.style.color = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#cbd5e1';
                  }}
                >
                  ×
                </button>
                <Link
                  href={app.launchHref}
                  style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>{app.emoji}</div>
                  <div style={{ fontFamily: sans, fontSize: '0.78rem', fontWeight: 500, color: '#0f172a', letterSpacing: '0.02em' }}>
                    {app.name[lang as keyof typeof app.name] || app.name.en}
                  </div>
                </Link>
              </div>
            ))}
            {favIds.length < 20 && (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                style={{
                  background: 'transparent',
                  border: '1px dashed #cbd5e1',
                  borderRadius: 10,
                  padding: '1rem 0.7rem',
                  cursor: 'pointer',
                  fontFamily: sans,
                  fontSize: '0.78rem',
                  color: '#64748b',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 90,
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = ACCENT;
                  e.currentTarget.style.color = ACCENT;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.2rem', opacity: 0.5 }}>+</div>
                <div>{t3(LABELS.addBtn, lang).replace('+ ', '')}</div>
              </button>
            )}
          </div>
          <div style={{ fontFamily: sans, fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.75rem', textAlign: 'right' }}>
            {t3(LABELS.hint, lang)} · {t3(LABELS.upTo, lang)} ({favIds.length}/20)
          </div>
        </>
      )}

      {/* ── 自動おすすめセクション (機能A・2026-04-27) ── */}
      {/* 月内に何度も使っているアプリで未登録のものを優しく提案 */}
      {suggestions.length > 0 && (
        <div
          style={{
            marginTop: '1.25rem',
            padding: '0.95rem 1rem',
            background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            borderRadius: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.95rem' }}>💡</span>
            <span style={{ fontFamily: sans, fontSize: '0.84rem', fontWeight: 600, color: '#713f12' }}>
              {t3(LABELS.suggestedTitle, lang)}
            </span>
            <span style={{ fontFamily: sans, fontSize: '0.74rem', color: '#a16207' }}>
              · {t3(LABELS.suggestedHint, lang)}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {suggestions.map(({ app, count }) => (
              <button
                key={app.id}
                type="button"
                onClick={() => handleAdd(app.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.85rem',
                  background: '#fff',
                  border: '1px solid #fde68a',
                  borderRadius: 999,
                  fontFamily: sans,
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  color: '#0f172a',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fef3c7';
                  e.currentTarget.style.borderColor = '#f59e0b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.borderColor = '#fde68a';
                }}
              >
                <span style={{ fontSize: '1rem' }}>{app.emoji}</span>
                <span>{app.name[lang as keyof typeof app.name] || app.name.en}</span>
                <span style={{ fontSize: '0.7rem', color: '#a16207', fontWeight: 400 }}>
                  ({count})
                </span>
                <span style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 600 }}>+</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── アプリピッカーモーダル ── */}
      {pickerOpen && (
        <div
          onClick={() => setPickerOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 12,
              maxWidth: 600,
              width: '100%',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: serif, fontSize: '1.05rem', fontWeight: 400, color: '#0f172a', margin: 0 }}>
                {t3(LABELS.pickerTitle, lang)}
              </h3>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#94a3b8', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <div style={{ overflow: 'auto', padding: '1rem 1.5rem' }}>
              {availableApps.length === 0 ? (
                <p style={{ fontFamily: sans, fontSize: '0.9rem', color: '#94a3b8', textAlign: 'center', padding: '2rem 0', margin: 0 }}>
                  {t3(LABELS.pickerEmpty, lang)}
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem' }}>
                  {availableApps.map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => handleAdd(app.id)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        padding: '0.75rem 0.5rem',
                        cursor: 'pointer',
                        fontFamily: sans,
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0f9ff';
                        e.currentTarget.style.borderColor = ACCENT;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>{app.emoji}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#0f172a' }}>
                        {app.name[lang as keyof typeof app.name] || app.name.en}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
