// ============================================================
// Multi-currency pricing display helper
// ============================================================
//
// 言語ごとに適切な通貨で価格を表示するためのユーティリティ。
// Stripe Phase 4 で設定した currency_options と整合させる。
//
// 重要:
//   - 表示は言語ベース (UX のため) だが、実際の課金は Stripe Checkout 側で
//     CF-IPCountry に応じて Global / LatAm を自動判定する。
//   - LP 表示価格と実課金価格は通常一致する (currency_options による自動換算)。
//   - LatAm 専用 USD 価格は es 言語選択時に表示 (主要 Spanish 市場のため)。
//
// 通貨対応マトリクス (Stripe Phase 4 の設定を参照):
//   JPY (base), USD, EUR, GBP, CAD, AUD, CHF
//   + LatAm USD (Prelude/Concerto/Symphony のみ・Opus は対象外)
//
// 言語 → 通貨マッピング:
//   ja → JPY
//   en → USD (Global 価格)
//   es → USD (LatAm 価格・Spanish の主要市場が中南米のため)
//   ko → USD (Global・KRW 未設定のため USD fallback)
//   pt → USD (Global・BRL 未設定のため USD fallback)
//   de → EUR
// ============================================================

import type { Lang } from '../../context/LangContext';

export type CurrencyCode = 'jpy' | 'usd' | 'eur' | 'gbp' | 'cad' | 'aud' | 'chf' | 'usd_latam';

export type PlanTier = 'prelude' | 'concerto' | 'symphony' | 'opus';
export type Cycle = 'monthly' | 'annual';

// ============================================================
// 価格マトリクス (Stripe Phase 4 の設定と完全一致)
// ============================================================
// JPY は整数そのまま、その他通貨は最小単位で記録 (USD $7.99 = 799)
// 表示時に / 100 で換算する。
// ============================================================

const PRICING_MATRIX: Record<PlanTier, Record<Cycle, Partial<Record<CurrencyCode, number>>>> = {
  prelude: {
    monthly: {
      jpy: 780,
      usd: 799, eur: 749, gbp: 649, cad: 999, aud: 1099, chf: 899,
      usd_latam: 399,
    },
    annual: {
      jpy: 7800,
      usd: 7990, eur: 7490, gbp: 6490, cad: 9990, aud: 10990, chf: 8990,
      usd_latam: 3990,
    },
  },
  concerto: {
    monthly: {
      jpy: 1480,
      usd: 1499, eur: 1399, gbp: 1199, cad: 1899, aud: 2099, chf: 1699,
      usd_latam: 799,
    },
    annual: {
      jpy: 14800,
      usd: 14990, eur: 13990, gbp: 11990, cad: 18990, aud: 20990, chf: 16990,
      usd_latam: 7990,
    },
  },
  symphony: {
    monthly: {
      jpy: 2480,
      usd: 2499, eur: 2299, gbp: 1999, cad: 3199, aud: 3499, chf: 2799,
      usd_latam: 1299,
    },
    annual: {
      jpy: 24800,
      usd: 24990, eur: 22990, gbp: 19990, cad: 31990, aud: 34990, chf: 27990,
      usd_latam: 12990,
    },
  },
  opus: {
    monthly: {
      jpy: 5980,
      usd: 5999, eur: 5499, gbp: 4999, cad: 7999, aud: 8499, chf: 6499,
      // Opus は LatAm 対象外
    },
    annual: {
      jpy: 59800,
      usd: 59990, eur: 54990, gbp: 49990, cad: 79990, aud: 84990, chf: 64990,
    },
  },
};

// ============================================================
// 言語 → 通貨マッピング
// ============================================================

export function currencyForLang(lang: Lang): CurrencyCode {
  switch (lang) {
    case 'ja': return 'jpy';
    case 'en': return 'usd';
    case 'es': return 'usd_latam'; // Spanish の主要市場が LatAm のため
    case 'ko': return 'usd';        // KRW 未設定
    case 'pt': return 'usd';        // BRL 未設定
    case 'de': return 'eur';
    default:   return 'usd';
  }
}

// ============================================================
// 価格取得 (整数の最小単位で返す。表示前に formatPrice で整形)
// ============================================================

export function getPrice(
  plan: PlanTier,
  cycle: Cycle,
  currency: CurrencyCode,
): number {
  const planPrices = PRICING_MATRIX[plan][cycle];
  // Opus + LatAm のフォールバック: USD Global を表示
  if (plan === 'opus' && currency === 'usd_latam') {
    return planPrices.usd ?? 0;
  }
  return planPrices[currency] ?? planPrices.usd ?? 0;
}

// ============================================================
// 表示整形
// ============================================================

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  jpy: '¥',
  usd: '$',
  usd_latam: '$',
  eur: '€',
  gbp: '£',
  cad: 'CA$',
  aud: 'A$',
  chf: 'CHF ',
};

const CURRENCY_DECIMAL_PLACES: Record<CurrencyCode, number> = {
  jpy: 0,
  usd: 2,
  usd_latam: 2,
  eur: 2,
  gbp: 2,
  cad: 2,
  aud: 2,
  chf: 2,
};

/**
 * Stripe 最小単位の整数を、人間が読める価格表示に変換する。
 * JPY: 780 → "¥780"
 * USD: 799 → "$7.99"
 * EUR: 749 → "€7.49"
 */
export function formatPrice(
  amountMinor: number,
  currency: CurrencyCode,
): string {
  const decimals = CURRENCY_DECIMAL_PLACES[currency];
  const symbol = CURRENCY_SYMBOLS[currency];
  const amount = decimals === 0 ? amountMinor : amountMinor / 100;
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${symbol}${formatted}`;
}

/**
 * 月換算価格を計算 (年額 / 12)
 */
export function formatMonthlyEquivalent(
  annualAmountMinor: number,
  currency: CurrencyCode,
): string {
  const decimals = CURRENCY_DECIMAL_PLACES[currency];
  const monthlyMinor = decimals === 0
    ? Math.round(annualAmountMinor / 12)
    : Math.round(annualAmountMinor / 12);
  return formatPrice(monthlyMinor, currency);
}

/**
 * HALF50 半額表示
 */
export function formatHalfPrice(
  monthlyAmountMinor: number,
  currency: CurrencyCode,
): string {
  const halfMinor = Math.round(monthlyAmountMinor / 2);
  return formatPrice(halfMinor, currency);
}

// ============================================================
// CLAUDE.md §38.4 のクォータ仕様
// ============================================================
// LP 表示用のサーバーアプリ制限値。
// 学習系 (ブラウザ完結) は無制限のままで OK。
// サーバー処理系は明確な制限を設ける必要がある (収益保護の根幹)。
// ============================================================

export type QuotaLabels = {
  separator: { ja: string; en: string; es: string; ko: string; pt: string; de: string };
  transcriber: { ja: string; en: string; es: string; ko: string; pt: string; de: string };
  intonation: { ja: string; en: string; es: string; ko: string; pt: string; de: string };
};

export const PLAN_QUOTAS: Record<PlanTier | 'free', QuotaLabels> = {
  free: {
    separator: {
      ja: 'AI音源分離: 月3回',
      en: 'AI separation: 3/mo',
      es: 'Separación IA: 3/mes',
      ko: 'AI 분리: 월 3회',
      pt: 'Separação IA: 3/mês',
      de: 'KI-Trennung: 3/Mo',
    },
    transcriber: {
      ja: '譜起こし: 月3回',
      en: 'Transcription: 3/mo',
      es: 'Transcripción: 3/mes',
      ko: '채보: 월 3회',
      pt: 'Transcrição: 3/mês',
      de: 'Notation: 3/Mo',
    },
    intonation: {
      ja: 'ピッチ分析: 月3回',
      en: 'Pitch analysis: 3/mo',
      es: 'Análisis tonal: 3/mes',
      ko: '피치 분석: 월 3회',
      pt: 'Análise tonal: 3/mês',
      de: 'Tonhöhenanalyse: 3/Mo',
    },
  },
  prelude: {
    separator: {
      ja: 'AI音源分離: 月20回',
      en: 'AI separation: 20/mo',
      es: 'Separación IA: 20/mes',
      ko: 'AI 분리: 월 20회',
      pt: 'Separação IA: 20/mês',
      de: 'KI-Trennung: 20/Mo',
    },
    transcriber: {
      ja: '譜起こし: 月20回',
      en: 'Transcription: 20/mo',
      es: 'Transcripción: 20/mes',
      ko: '채보: 월 20회',
      pt: 'Transcrição: 20/mês',
      de: 'Notation: 20/Mo',
    },
    intonation: {
      ja: 'ピッチ分析: 月30回',
      en: 'Pitch analysis: 30/mo',
      es: 'Análisis tonal: 30/mes',
      ko: '피치 분석: 월 30회',
      pt: 'Análise tonal: 30/mês',
      de: 'Tonhöhenanalyse: 30/Mo',
    },
  },
  concerto: {
    separator: {
      ja: 'AI音源分離: 月150回',
      en: 'AI separation: 150/mo',
      es: 'Separación IA: 150/mes',
      ko: 'AI 분리: 월 150회',
      pt: 'Separação IA: 150/mês',
      de: 'KI-Trennung: 150/Mo',
    },
    transcriber: {
      ja: '譜起こし: 月100回',
      en: 'Transcription: 100/mo',
      es: 'Transcripción: 100/mes',
      ko: '채보: 월 100회',
      pt: 'Transcrição: 100/mês',
      de: 'Notation: 100/Mo',
    },
    intonation: {
      ja: 'ピッチ分析: ほぼ無制限',
      en: 'Pitch analysis: virtually unlimited',
      es: 'Análisis tonal: casi ilimitado',
      ko: '피치 분석: 거의 무제한',
      pt: 'Análise tonal: quase ilimitado',
      de: 'Tonhöhenanalyse: nahezu unbegrenzt',
    },
  },
  symphony: {
    separator: {
      ja: 'AI音源分離: 月250回',
      en: 'AI separation: 250/mo',
      es: 'Separación IA: 250/mes',
      ko: 'AI 분리: 월 250회',
      pt: 'Separação IA: 250/mês',
      de: 'KI-Trennung: 250/Mo',
    },
    transcriber: {
      ja: '譜起こし: 月200回',
      en: 'Transcription: 200/mo',
      es: 'Transcripción: 200/mes',
      ko: '채보: 월 200회',
      pt: 'Transcrição: 200/mês',
      de: 'Notation: 200/Mo',
    },
    intonation: {
      ja: 'ピッチ分析: 無制限 + 優先処理',
      en: 'Pitch analysis: unlimited + priority',
      es: 'Análisis tonal: ilimitado + prioridad',
      ko: '피치 분석: 무제한 + 우선 처리',
      pt: 'Análise tonal: ilimitado + prioridade',
      de: 'Tonhöhenanalyse: unbegrenzt + Prio',
    },
  },
  opus: {
    separator: {
      ja: 'AI音源分離: 月800回',
      en: 'AI separation: 800/mo',
      es: 'Separación IA: 800/mes',
      ko: 'AI 분리: 월 800회',
      pt: 'Separação IA: 800/mês',
      de: 'KI-Trennung: 800/Mo',
    },
    transcriber: {
      ja: '譜起こし: 月500回',
      en: 'Transcription: 500/mo',
      es: 'Transcripción: 500/mes',
      ko: '채보: 월 500회',
      pt: 'Transcrição: 500/mês',
      de: 'Notation: 500/Mo',
    },
    intonation: {
      ja: 'ピッチ分析: 無制限 + 商用利用可',
      en: 'Pitch analysis: unlimited + commercial use',
      es: 'Análisis tonal: ilimitado + uso comercial',
      ko: '피치 분석: 무제한 + 상업적 사용',
      pt: 'Análise tonal: ilimitado + uso comercial',
      de: 'Tonhöhenanalyse: unbegrenzt + kommerziell',
    },
  },
};
