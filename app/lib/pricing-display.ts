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
// プラン名サブタイトル (Pattern A: Standard / Pro / Premium / Max)
// Apple ナミング (MacBook Standard/Pro/Max) と整合・階層が瞬時に伝わる
// ============================================================

export type PlanSubtitle = { ja: string; en: string; es: string; ko: string; pt: string; de: string };

export const PLAN_SUBTITLES: Record<PlanTier | 'free', PlanSubtitle> = {
  free: {
    ja: 'はじめに触れる',
    en: 'Try the basics',
    es: 'Comenzar',
    ko: '시작하기',
    pt: 'Começar',
    de: 'Erste Schritte',
  },
  prelude: {
    ja: 'Standard / 個人スタンダード',
    en: 'Standard',
    es: 'Standard / Estándar Individual',
    ko: 'Standard / 개인 스탠다드',
    pt: 'Standard / Padrão Individual',
    de: 'Standard / Einzelperson',
  },
  concerto: {
    ja: 'Pro / 個人プロ',
    en: 'Pro',
    es: 'Pro / Profesional Individual',
    ko: 'Pro / 개인 프로',
    pt: 'Pro / Profissional Individual',
    de: 'Pro / Profi-Einzelperson',
  },
  symphony: {
    ja: 'Premium / 個人プレミアム',
    en: 'Premium',
    es: 'Premium / Premium Individual',
    ko: 'Premium / 개인 프리미엄',
    pt: 'Premium / Premium Individual',
    de: 'Premium / Premium-Einzelperson',
  },
  opus: {
    ja: 'Max / 業務・教室',
    en: 'Max / Business · Schools',
    es: 'Max / Negocios · Escuelas',
    ko: 'Max / 업무·교실',
    pt: 'Max / Negócios · Escolas',
    de: 'Max / Geschäft · Schulen',
  },
};

// ============================================================
// クォータ仕様 (選択肢 C ハイブリッド・2026-04-26 確定)
// ============================================================
// 設計思想:
//   - Free: サーバーアプリは「使えない」(¥0 で集客装置に徹する・GCP コスト 0)
//   - Prelude: 最悪粗利 75% を厳守 (大量加入時の損失防止)
//   - Concerto/Symphony: 最悪 50%+、平均 80%+ (競合比 圧倒的 + 収益安全)
//   - Opus: 最悪 30% 弱 (商用大口想定・コスト変動を許容)
//
// コスト前提 (CLAUDE.md §38.3):
//   AI音源分離: ¥6/回 / 譜起こし: ¥5/回 / ピッチ分析: ¥1/回
//
// 「ほぼ無制限」表記は実上限を内蔵 (顧客には可視化しない・コスト保護のみ)
// ============================================================

export type QuotaLabels = {
  separator: { ja: string; en: string; es: string; ko: string; pt: string; de: string };
  transcriber: { ja: string; en: string; es: string; ko: string; pt: string; de: string };
  intonation: { ja: string; en: string; es: string; ko: string; pt: string; de: string };
};

export const PLAN_QUOTAS: Record<PlanTier | 'free', QuotaLabels> = {
  free: {
    separator: {
      ja: 'AI音源分離: 有料プランで利用可',
      en: 'AI separation: paid plans only',
      es: 'Separación IA: solo planes pagos',
      ko: 'AI 분리: 유료 플랜 전용',
      pt: 'Separação IA: apenas planos pagos',
      de: 'KI-Trennung: nur in Bezahlplänen',
    },
    transcriber: {
      ja: '譜起こし: 有料プランで利用可',
      en: 'Transcription: paid plans only',
      es: 'Transcripción: solo planes pagos',
      ko: '채보: 유료 플랜 전용',
      pt: 'Transcrição: apenas planos pagos',
      de: 'Notation: nur in Bezahlplänen',
    },
    intonation: {
      ja: 'ピッチ分析: 有料プランで利用可',
      en: 'Pitch analysis: paid plans only',
      es: 'Análisis tonal: solo planes pagos',
      ko: '피치 분석: 유료 플랜 전용',
      pt: 'Análise tonal: apenas planos pagos',
      de: 'Tonhöhenanalyse: nur in Bezahlplänen',
    },
  },
  prelude: {
    separator: {
      ja: 'AI音源分離: 月2回 (お試し)',
      en: 'AI separation: 2/mo (trial)',
      es: 'Separación IA: 2/mes (prueba)',
      ko: 'AI 분리: 월 2회 (체험)',
      pt: 'Separação IA: 2/mês (teste)',
      de: 'KI-Trennung: 2/Mo (Test)',
    },
    transcriber: {
      ja: '譜起こし: 月5回 (お試し)',
      en: 'Transcription: 5/mo (trial)',
      es: 'Transcripción: 5/mes (prueba)',
      ko: '채보: 월 5회 (체험)',
      pt: 'Transcrição: 5/mês (teste)',
      de: 'Notation: 5/Mo (Test)',
    },
    intonation: {
      ja: 'ピッチ分析: 月10回 (お試し)',
      en: 'Pitch analysis: 10/mo (trial)',
      es: 'Análisis tonal: 10/mes (prueba)',
      ko: '피치 분석: 월 10회 (체험)',
      pt: 'Análise tonal: 10/mês (teste)',
      de: 'Tonhöhenanalyse: 10/Mo (Test)',
    },
  },
  concerto: {
    separator: {
      ja: 'AI音源分離: 月20回',
      en: 'AI separation: 20/mo',
      es: 'Separación IA: 20/mes',
      ko: 'AI 분리: 월 20회',
      pt: 'Separação IA: 20/mês',
      de: 'KI-Trennung: 20/Mo',
    },
    transcriber: {
      ja: '譜起こし: 月30回',
      en: 'Transcription: 30/mo',
      es: 'Transcripción: 30/mes',
      ko: '채보: 월 30회',
      pt: 'Transcrição: 30/mês',
      de: 'Notation: 30/Mo',
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
      ja: 'AI音源分離: 月80回',
      en: 'AI separation: 80/mo',
      es: 'Separación IA: 80/mes',
      ko: 'AI 분리: 월 80회',
      pt: 'Separação IA: 80/mês',
      de: 'KI-Trennung: 80/Mo',
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
      ja: 'AI音源分離: 月300回',
      en: 'AI separation: 300/mo',
      es: 'Separación IA: 300/mes',
      ko: 'AI 분리: 월 300회',
      pt: 'Separação IA: 300/mês',
      de: 'KI-Trennung: 300/Mo',
    },
    transcriber: {
      ja: '譜起こし: 月300回',
      en: 'Transcription: 300/mo',
      es: 'Transcripción: 300/mes',
      ko: '채보: 월 300회',
      pt: 'Transcrição: 300/mês',
      de: 'Notation: 300/Mo',
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

// ============================================================
// Auth ガード対象アプリの allowlist (登録不要で使えるアプリ群)
// ============================================================
// 「太っ腹に開放」されている無料アプリ群。
// これら以外のブラウザアプリは AuthGate で登録必須化する。
//
// 選定基準: SEO 流入が多い + 学習系 + 集客の入口になるもの
// 将来的にこのリストは縮小・拡大される可能性がある。
// ============================================================

// 2026-04-27 階層再編: Free を SEO 入口に絞り込み (登録なしで使える)
// 旧 Free 多めの設計から、Free=数アプリだけ・Prelude=正規スタートへ移行
//
// 移動: master-check / ddp-checker / slowdown / ear-training / chord-quiz /
//        sight-reading / breath / frequency → Prelude or Concerto
// 残留: dsd / converter / analog-tools 系 (SEO ニッチ集客に必要)
//        normalize (マイク購入者特典の legacy・パスワード kuon で保護)
export const FREE_NO_LOGIN_APPS = [
  // 技術的 SEO 差別化 (世界的にユニーク)
  'dsd',
  'converter',
  'normalize',     // マイク購入者特典 (パスワード kuon で別途保護)
  // ANALOG-TOOLS 系 (専門ニッチ集客)
  'analog-tools',
  'analog-machine-speed',
  'tape-time',
  'tape-remaining',
  'jazz-time',
  'voltage-db',
] as const;

export type FreeNoLoginApp = typeof FREE_NO_LOGIN_APPS[number];

export function isFreeNoLoginApp(appName: string): boolean {
  return (FREE_NO_LOGIN_APPS as readonly string[]).includes(appName);
}
