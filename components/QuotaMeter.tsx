'use client';

import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const sans = '"Helvetica Neue", Arial, sans-serif';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang) => m[lang] ?? m.en;

export interface UsageStat {
  used: number;
  limit: number | null;   // null = unlimited (browser app)
  remaining: number | null;
  isServer: boolean;
}

export interface UsageData {
  plan?: string;
  planTier?: string;
  month: string;
  resetDate: string;
  usage: Record<string, UsageStat>;
}

interface QuotaMeterProps {
  data: UsageData | null;
  loading?: boolean;
}

const APP_LABELS: Record<string, L> = {
  separator:  { ja: '🎛 AI 音源分離',   en: '🎛 AI Separation', es: '🎛 Separación IA' },
  transcribe: { ja: '📝 譜起こし',       en: '📝 Transcription', es: '📝 Transcripción' },
  intonation: { ja: '📐 ピッチ分析',     en: '📐 Pitch Analysis', es: '📐 Análisis tonal' },
};

/**
 * 「今月の使用状況」プログレスバー表示
 * サーバーアプリのみ表示 (ブラウザアプリは無制限なので表示しない)
 */
export function QuotaMeter({ data, loading }: QuotaMeterProps) {
  const { lang } = useLang();

  if (loading) {
    return (
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '1rem 0' }}>
          {t({ ja: '使用状況を読み込み中...', en: 'Loading usage...', es: 'Cargando uso...' }, lang)}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const serverApps = Object.entries(data.usage).filter(([, stat]) => stat.isServer);

  if (serverApps.length === 0) {
    // free プランや、server app に未対応の場合
    return null;
  }

  const daysUntilReset = computeDaysUntilReset(data.resetDate);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fafafa 0%, #f8fafc 100%)',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: '1.25rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
          📊 {t({ ja: `今月の使用状況 (${data.month})`, en: `This Month's Usage (${data.month})`, es: `Uso del mes (${data.month})` }, lang)}
        </div>
        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
          ⏰ {t({
            ja: `リセットまで あと ${daysUntilReset} 日`,
            en: `Resets in ${daysUntilReset} days`,
            es: `Restablece en ${daysUntilReset} días`,
          }, lang)}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {serverApps.map(([appName, stat]) => (
          <QuotaRow key={appName} appName={appName} stat={stat} lang={lang} />
        ))}
      </div>

      {/* 80% 以上のアプリがあればアップグレード推奨 */}
      {serverApps.some(([, s]) => s.limit && s.used / s.limit >= 0.8 && s.limit > 0) && (
        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fef3c7', borderRadius: 8, fontSize: '0.8rem', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>
            ⚠️ {t({
              ja: '上限間近のアプリがあります',
              en: 'Some apps are nearing their limit',
              es: 'Algunas apps cerca del límite',
            }, lang)}
          </span>
          <Link href="/#pricing" style={{ background: '#92400e', color: '#fff', padding: '0.35rem 0.85rem', borderRadius: 6, textDecoration: 'none', fontSize: '0.75rem', fontWeight: 500 }}>
            {t({ ja: 'アップグレード →', en: 'Upgrade →', es: 'Mejorar →' }, lang)}
          </Link>
        </div>
      )}
    </div>
  );
}

function QuotaRow({ appName, stat, lang }: { appName: string; stat: UsageStat; lang: Lang }) {
  const label = APP_LABELS[appName] || { en: appName.toUpperCase() };
  const limit = stat.limit ?? 0;
  const pct = limit > 0 ? Math.min(100, (stat.used / limit) * 100) : 0;

  // バー色: 80%+ で橙、100% で赤、それ以外は青
  let barColor = '#0284c7';
  if (limit > 0 && stat.used >= limit) barColor = '#dc2626';
  else if (limit > 0 && stat.used / limit >= 0.8) barColor = '#f59e0b';

  // 「ほぼ無制限」表記の判定: limit が 50 以上で intonation はそう表示
  const isNearUnlimited = appName === 'intonation' && limit >= 50;
  const isNotIncluded = limit === 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem', color: '#0f172a' }}>
        <span style={{ fontWeight: 500 }}>{t(label, lang)}</span>
        {isNotIncluded ? (
          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
            {t({ ja: '上位プランで利用可', en: 'Upgrade plan to use', es: 'Plan superior necesario' }, lang)}
          </span>
        ) : isNearUnlimited ? (
          <span style={{ color: '#0284c7', fontWeight: 500, fontSize: '0.72rem' }}>
            {t({
              ja: `${stat.used} 回 / ほぼ無制限`,
              en: `${stat.used} used / virtually unlimited`,
              es: `${stat.used} usado / casi ilimitado`,
            }, lang)}
          </span>
        ) : (
          <span style={{ color: barColor, fontWeight: 600, fontSize: '0.78rem' }}>
            {stat.used} / {limit} {t({ ja: '回', en: 'times', es: 'veces', ko: '회', pt: 'vezes', de: 'Mal' }, lang)}
            {' '}({Math.round(pct)}%)
          </span>
        )}
      </div>
      {!isNotIncluded && !isNearUnlimited && (
        <div style={{ height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              background: barColor,
              transition: 'width 0.5s ease, background 0.3s ease',
            }}
          />
        </div>
      )}
      {!isNotIncluded && !isNearUnlimited && stat.remaining !== null && stat.remaining > 0 && stat.remaining <= 5 && (
        <div style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '0.25rem' }}>
          {t({
            ja: `あと ${stat.remaining} 回`,
            en: `${stat.remaining} left`,
            es: `Quedan ${stat.remaining}`,
          }, lang)}
        </div>
      )}
    </div>
  );
}

function computeDaysUntilReset(resetDateStr: string): number {
  try {
    const reset = new Date(resetDateStr + 'T00:00:00');
    const now = new Date();
    const diff = reset.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  } catch {
    return 0;
  }
}
