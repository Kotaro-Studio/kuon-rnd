'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import {
  currencyForLang,
  getPrice,
  formatPrice,
  formatMonthlyEquivalent,
  formatHalfPrice,
  PLAN_QUOTAS,
  PLAN_SUBTITLES,
} from '@/app/lib/pricing-display';
import { CATEGORIES, APP_CATALOG, totalAppCount, isAppNew } from '@/app/lib/app-catalog';

const serif = '"Shippori Mincho", "Noto Serif JP", "Yu Mincho", "YuMincho", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L5 = Partial<Record<Lang, string>> & { en: string };
const t5 = (m: L5, lang: Lang): string => m[lang] ?? m.en;

const HomePage: React.FC = () => {
  const { lang } = useLang();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [yearly, setYearly] = useState(false);
  const [subscribeLoading, setSubscribeLoading] = useState<string | null>(null);
  // 教師経由学生クーポン (CLAUDE.md §44.4): URL ?coupon=XXX または localStorage に保存済み
  // ハイドレーション安全のため初期値は null。useEffect 内でクライアント側のみ取得。
  const [activeCouponCode, setActiveCouponCode] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('kuon_pending_coupon');
      if (stored) {
        const parsed = JSON.parse(stored) as { code?: string; capturedAt?: number };
        const age = Date.now() - (parsed.capturedAt ?? 0);
        if (parsed.code && age < 30 * 24 * 60 * 60 * 1000) {
          setActiveCouponCode(parsed.code);
        }
      }
    } catch { /* silent */ }
  }, []);

  // 多通貨対応: 言語に応じて表示通貨が切替わる (Stripe Phase 4 currency_options と整合)
  // ja → JPY / en → USD / es → USD (LatAm) / de → EUR / ko & pt → USD
  // 実際の課金は Stripe Checkout 側で CF-IPCountry に応じて決まる。
  const currency = currencyForLang(lang);
  const preludeMonthlyAmount  = getPrice('prelude',  'monthly', currency);
  const preludeYearlyAmount   = getPrice('prelude',  'annual',  currency);
  const concertoMonthlyAmount = getPrice('concerto', 'monthly', currency);
  const concertoYearlyAmount  = getPrice('concerto', 'annual',  currency);
  const symphonyMonthlyAmount = getPrice('symphony', 'monthly', currency);
  const symphonyYearlyAmount  = getPrice('symphony', 'annual',  currency);
  const opusMonthlyAmount     = getPrice('opus',     'monthly', currency);
  const opusYearlyAmount      = getPrice('opus',     'annual',  currency);

  // 表示用の整形済み文字列 (¥780 / $7.99 / €7.49 等)
  const preludeMonthlyDisp  = formatPrice(preludeMonthlyAmount,  currency);
  const preludeYearlyDisp   = formatPrice(preludeYearlyAmount,   currency);
  const concertoMonthlyDisp = formatPrice(concertoMonthlyAmount, currency);
  const concertoYearlyDisp  = formatPrice(concertoYearlyAmount,  currency);
  const symphonyMonthlyDisp = formatPrice(symphonyMonthlyAmount, currency);
  const symphonyYearlyDisp  = formatPrice(symphonyYearlyAmount,  currency);
  const opusMonthlyDisp     = formatPrice(opusMonthlyAmount,     currency);
  const opusYearlyDisp      = formatPrice(opusYearlyAmount,      currency);

  // Stripe Checkout 起動: 認証チェック → 未ログインなら /auth/login へ → ログイン済みなら Stripe へ
  // 離脱率削減: 未ログイン時は購入意図を localStorage に保存し、ログイン後に自動で Checkout 継続
  async function handleSubscribe(plan: 'prelude' | 'concerto' | 'symphony' | 'opus', cycle: 'monthly' | 'annual') {
    setSubscribeLoading(plan);
    try {
      const meRes = await fetch('/api/auth/me');
      if (!meRes.ok) {
        // 未ログイン: 購入意図を保存して /auth/login へ
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'kuon_pending_subscribe',
            JSON.stringify({ plan, cycle, ts: Date.now() }),
          );
        }
        window.location.href = '/auth/login';
        return;
      }
      // 教師経由学生クーポン: localStorage に保存された ?coupon=XXX を Checkout に同梱
      // (CLAUDE.md §44.4) Worker 側で Promotion Code を解決して STUDENT_30_12MO を attach
      let couponCode: string | undefined;
      try {
        const stored = localStorage.getItem('kuon_pending_coupon');
        if (stored) {
          const parsed = JSON.parse(stored) as { code?: string; capturedAt?: number };
          // 30 日 TTL: 古い情報は無視
          const age = Date.now() - (parsed.capturedAt ?? 0);
          if (parsed.code && age < 30 * 24 * 60 * 60 * 1000) {
            couponCode = parsed.code;
          } else {
            localStorage.removeItem('kuon_pending_coupon');
          }
        }
      } catch { /* silent */ }

      const checkoutRes = await fetch('/api/auth/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, cycle, couponCode }),
      });
      if (!checkoutRes.ok) {
        const err = (await checkoutRes.json().catch(() => ({}))) as { error?: string; message?: string };
        alert(err.message || err.error || `購入処理に失敗しました (${checkoutRes.status})`);
        return;
      }
      const data = (await checkoutRes.json()) as { url?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Checkout URL が取得できませんでした');
      }
    } catch (err) {
      alert('ネットワークエラー: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setSubscribeLoading(null);
    }
  }

  // ログイン後にホームページに戻った際、保存された購入意図があれば自動的に Checkout 継続
  // 30 分以内の意図のみ有効 (古いものはクリア)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('kuon_pending_subscribe');
    if (!saved) return;
    try {
      const intent = JSON.parse(saved) as { plan?: string; cycle?: string; ts?: number };
      const validPlans = ['prelude', 'concerto', 'symphony', 'opus'];
      const validCycles = ['monthly', 'annual'];
      const stale = !intent.ts || Date.now() - intent.ts > 30 * 60 * 1000;
      if (stale || !intent.plan || !validPlans.includes(intent.plan) || !intent.cycle || !validCycles.includes(intent.cycle)) {
        localStorage.removeItem('kuon_pending_subscribe');
        return;
      }
      // 認証チェック → ログイン済みなら自動 Checkout
      fetch('/api/auth/me').then((r) => {
        if (!r.ok) return; // まだ未ログイン: 意図はそのまま保持
        localStorage.removeItem('kuon_pending_subscribe');
        handleSubscribe(intent.plan as 'prelude' | 'concerto' | 'symphony' | 'opus', intent.cycle as 'monthly' | 'annual');
      });
    } catch {
      localStorage.removeItem('kuon_pending_subscribe');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const faqs = [
    {
      q: {
        ja: '無料で使えるアプリはありますか？',
        en: 'Are there free apps?',
        es: '¿Hay aplicaciones gratuitas?',
        ko: '무료로 사용할 수 있는 앱이 있나요?',
        pt: 'Existem aplicativos gratuitos?',
        de: 'Gibt es kostenlose Apps?',
      },
      a: {
        ja: 'はい。多くのブラウザアプリは無料で使用回数の制限なくお使いいただけます。一部のプレミアム機能やサーバー処理が必要なアプリにはサブスクリプションが必要です。',
        en: 'Yes. Many browser-based apps are free with no usage limits. Some premium features and server-powered apps require a subscription.',
        es: 'Sí. Muchas aplicaciones basadas en navegador son gratuitas sin límites de uso. Algunas funciones premium y aplicaciones de servidor requieren suscripción.',
        ko: '네. 많은 브라우저 기반 앱은 사용 제한 없이 무료입니다. 일부 프리미엄 기능과 서버 앱은 구독이 필요합니다.',
        pt: 'Sim. Muitos aplicativos baseados em navegador são gratuitos sem limites de uso. Algumas funcionalidades premium e aplicativos de servidor requerem assinatura.',
        de: 'Ja. Viele browserbasierte Apps sind kostenlos und ohne Nutzungslimit. Einige Premium-Funktionen und serverbasierte Apps erfordern ein Abonnement.',
      },
    },
    {
      q: {
        ja: 'アカウント登録は必要ですか？',
        en: 'Do I need an account?',
        es: '¿Necesito una cuenta?',
        ko: '계정 등록이 필요한가요?',
        pt: 'Preciso de uma conta?',
        de: 'Brauche ich ein Konto?',
      },
      a: {
        ja: 'アプリを使うだけなら不要です。設定の保存や処理履歴の確認にはアカウントが便利です。',
        en: 'Not to use the apps. An account lets you save settings and view history.',
        es: 'No para usar las aplicaciones. Una cuenta te permite guardar configuraciones y ver el historial.',
        ko: '앱을 사용하는 데는 필요하지 않습니다. 계정은 설정 저장 및 기록 보기에 유용합니다.',
        pt: 'Não para usar os aplicativos. Uma conta permite que você salve as configurações e visualize o histórico.',
        de: 'Zum Verwenden der Apps nicht. Mit einem Konto können Sie Einstellungen speichern und Verläufe einsehen.',
      },
    },
    // 2026-04-26 削除: マイク発送先 FAQ
    //   理由: マイクは公開 LP から動線を遮断するため (国際公平性)。
    //   /microphone ページ自体には残存・Kotaro Studio 経由で流入。
    {
      q: {
        ja: 'サブスクリプションはいつでも解約できますか？',
        en: 'Can I cancel my subscription anytime?',
        es: '¿Puedo cancelar mi suscripción en cualquier momento?',
        ko: '언제든지 구독을 취소할 수 있나요?',
        pt: 'Posso cancelar minha assinatura a qualquer momento?',
        de: 'Kann ich mein Abonnement jederzeit kündigen?',
      },
      a: {
        ja: 'はい、いつでも解約できます。解約後も無料プランの機能は引き続き使えます。',
        en: 'Yes, cancel anytime. Free plan features remain available after cancellation.',
        es: 'Sí, cancela en cualquier momento. Las características del plan gratuito permanecen disponibles después de la cancelación.',
        ko: '네, 언제든지 취소할 수 있습니다. 취소 후에도 무료 플랜 기능을 계속 사용할 수 있습니다.',
        pt: 'Sim, cancele a qualquer momento. Os recursos do plano gratuito permanecem disponíveis após o cancelamento.',
        de: 'Ja, jederzeit kündbar. Die Funktionen des kostenlosen Plans bleiben auch nach der Kündigung verfügbar.',
      },
    },
    {
      q: {
        ja: 'プランの変更や月額・年額の切替はできますか？',
        en: 'Can I switch between plans or monthly/yearly billing?',
        es: '¿Puedo cambiar entre planes o facturación mensual/anual?',
        ko: '플랜 변경 또는 월간/연간 청구 전환이 가능한가요?',
        pt: 'Posso alternar entre planos ou cobrança mensal/anual?',
        de: 'Kann ich zwischen Plänen oder monatlicher/jährlicher Abrechnung wechseln?',
      },
      a: {
        ja: 'はい、自由に変更可能です。たとえば「初月は Symphony を半額で試して、翌月から Prelude 年額に切替」も可能。Stripe の日割り計算で公平に切替されます。マイページの「プラン管理」からいつでも操作できます。',
        en: 'Yes, switch freely. For example: try Symphony at 50% off for month 1, then switch to Prelude annual for month 2 onward. Stripe handles fair pro-rated billing. Manage from "Plan Settings" in My Page.',
        es: 'Sí, cambia libremente. Por ejemplo: prueba Symphony con 50% de descuento el mes 1, luego cambia a Prelude anual desde el mes 2. Stripe maneja la facturación prorrateada justa. Gestiona desde "Configuración de Plan" en Mi Página.',
        ko: '네, 자유롭게 변경 가능합니다. 예: 1개월차에 Symphony를 50% 할인으로 체험 후 2개월차부터 Prelude 연간으로 전환. Stripe가 공정한 일할 계산으로 청구합니다.',
        pt: 'Sim, troque livremente. Exemplo: experimente Symphony com 50% de desconto no mês 1 e mude para Prelude anual a partir do mês 2. Stripe lida com faturamento proporcional justo.',
        de: 'Ja, jederzeit wechselbar. Beispiel: Symphony im 1. Monat zum halben Preis testen, dann ab Monat 2 zu Prelude jährlich wechseln. Stripe übernimmt die faire anteilige Abrechnung.',
      },
    },
    {
      q: {
        ja: '対応ファイル形式は？',
        en: 'What file formats are supported?',
        es: '¿Qué formatos de archivo son compatibles?',
        ko: '지원되는 파일 형식은?',
        pt: 'Quais formatos de arquivo são suportados?',
        de: 'Welche Dateiformate werden unterstützt?',
      },
      a: {
        ja: 'WAV、MP3、FLAC、DSD（DSF/DFF）、DDPなど幅広いフォーマットに対応しています。',
        en: 'WAV, MP3, FLAC, DSD (DSF/DFF), DDP, and many more.',
        es: 'WAV, MP3, FLAC, DSD (DSF/DFF), DDP y muchos más.',
        ko: 'WAV, MP3, FLAC, DSD (DSF/DFF), DDP 등 다양한 형식을 지원합니다.',
        pt: 'WAV, MP3, FLAC, DSD (DSF/DFF), DDP e muito mais.',
        de: 'WAV, MP3, FLAC, DSD (DSF/DFF), DDP und viele mehr.',
      },
    },
    {
      q: {
        ja: '日本語以外にも対応していますか？',
        en: 'Is it available in other languages?',
        es: '¿Está disponible en otros idiomas?',
        ko: '다른 언어로도 사용 가능한가요?',
        pt: 'Está disponível em outros idiomas?',
        de: 'Ist es in anderen Sprachen verfügbar?',
      },
      a: {
        ja: 'はい。日本語、英語、ドイツ語、スペイン語、韓国語、ポルトガル語の6言語に対応しています。',
        en: 'Yes. Available in Japanese, English, German, Spanish, Korean, and Portuguese.',
        es: 'Sí. Disponible en japonés, inglés, alemán, español, coreano y portugués.',
        ko: '네. 일본어, 영어, 독일어, 스페인어, 한국어, 포르투갈어 6가지 언어로 제공됩니다.',
        pt: 'Sim. Disponível em japonês, inglês, alemão, espanhol, coreano e português.',
        de: 'Ja. Verfügbar in Japanisch, Englisch, Deutsch, Spanisch, Koreanisch und Portugiesisch.',
      },
    },
  ];

  const apps: { emoji: string; name: string; desc: L5; href: string; badge?: L5 }[] = [
    // 2026-04-27 公開停止: SEPARATOR
    // Cloud Run 単体運用が不安定なため、Replicate API 乗せ替え完了まで非公開。
    // /separator-lp と /separator の URL は残存するが、ホームのカードからは外す。
    // {
    //   emoji: '🎛️',
    //   name: 'SEPARATOR',
    //   desc: { ja: 'AI音源分離 — ボーカル/ドラム/ベース抽出', en: 'AI stem separation — vocals, drums, bass', es: 'Separación de pistas IA — voz, batería, bajo', ko: 'AI 스템 분리 — 보컬/드럼/베이스 추출', pt: 'Separação de stems com IA — voz, bateria, baixo', de: 'KI-Stem-Separation — Vocals, Drums, Bass' },
    //   href: '/separator-lp',
    //   badge: { ja: 'NEW Meta Demucs v4', en: 'NEW Meta Demucs v4', es: 'NUEVO Meta Demucs v4', ko: 'NEW Meta Demucs v4', pt: 'NOVO Meta Demucs v4', de: 'NEU Meta Demucs v4' },
    // },
    {
      emoji: '🐢',
      name: 'SLOWDOWN',
      desc: { ja: 'ピッチ維持スロー再生 — 耳コピ・練習に', en: 'Pitch-preserving slowdown for transcription', es: 'Reproducción lenta sin cambio de tono', ko: '피치 유지 슬로우 재생', pt: 'Reprodução lenta preservando o tom', de: 'Tonhöhen-erhaltende Verlangsamung' },
      href: '/slowdown-lp',
      badge: { ja: 'NEW Transcribe! 代替', en: 'NEW Transcribe! Alternative', es: 'NUEVO Alternativa a Transcribe!', ko: 'NEW Transcribe! 대체', pt: 'NOVO Alternativa ao Transcribe!', de: 'NEU Transcribe!-Alternative' },
    },
    {
      emoji: '🎚️',
      name: 'MASTER CHECK',
      desc: { ja: 'ラウドネス測定 + 自動調整', en: 'Loudness measurement + auto-adjust', es: 'Medición de volumen + ajuste automático', ko: '라우드니스 측정 + 자동 조정', pt: 'Medição de volume + ajuste automático', de: 'Lautheitsmessung + Auto-Anpassung' },
      href: '/master-check-lp',
    },
    {
      emoji: '🎼',
      name: 'DSD CONVERTER',
      desc: { ja: '世界初ブラウザDSD再生', en: 'World\'s first browser DSD player', es: 'Primer reproductor DSD de navegador del mundo', ko: '세계 최초 브라우저 DSD 플레이어', pt: 'Primeiro reprodutor DSD do navegador do mundo', de: 'Der weltweit erste DSD-Player im Browser' },
      href: '/dsd-lp',
    },
    {
      emoji: '💿',
      name: 'DDP CHECKER',
      desc: { ja: 'DDPイメージ検証', en: 'DDP image verification', es: 'Verificación de imágenes DDP', ko: 'DDP 이미지 검증', pt: 'Verificação de imagem DDP', de: 'DDP-Image-Prüfung' },
      href: '/ddp-checker-lp',
    },
    {
      emoji: '🎵',
      name: 'NORMALIZE',
      desc: { ja: 'ピーク・ラウドネス正規化', en: 'Peak & loudness normalization', es: 'Normalización de pico y volumen', ko: '피크 & 라우드니스 정규화', pt: 'Normalização de pico e volume', de: 'Peak- & Lautheits-Normalisierung' },
      href: '/normalize-lp',
      badge: { ja: 'マイク購入者限定', en: 'Mic Owners Only', es: 'Solo compradores', ko: '마이크 구매자 전용', pt: 'Apenas compradores', de: 'Nur für Mikrofonkäufer' },
    },
    {
      emoji: '🔇',
      name: 'NOISE REDUCTION',
      desc: { ja: 'スペクトルノイズ除去', en: 'Spectral noise reduction', es: 'Reducción de ruido espectral', ko: '스펙트럼 노이즈 제거', pt: 'Redução de ruído espectral', de: 'Spektrale Rauschunterdrückung' },
      href: '/noise-reduction',
    },
    {
      emoji: '🎹',
      name: 'EAR TRAINING',
      desc: { ja: '音感トレーニング', en: 'Ear training exercises', es: 'Ejercicios de entrenamiento auditivo', ko: '귀 훈련', pt: 'Exercícios de treinamento auditivo', de: 'Gehörbildung' },
      href: '/ear-training-lp',
    },
    {
      emoji: '🥁',
      name: 'METRONOME',
      desc: { ja: 'プロ仕様メトロノーム', en: 'Professional metronome', es: 'Metrónomo profesional', ko: '프로 메트로놈', pt: 'Metrônomo profissional', de: 'Profi-Metronom' },
      href: '/metronome-lp',
    },
    {
      emoji: '🎸',
      name: 'CHORD QUIZ',
      desc: { ja: 'コード聴き取りクイズ', en: 'Chord recognition quiz', es: 'Quiz de reconocimiento de acordes', ko: '코드 인식 퀴즈', pt: 'Quiz de reconhecimento de acordes', de: 'Akkord-Erkennungs-Quiz' },
      href: '/chord-quiz-lp',
    },
  ];

  // 2026-04-26 IQ190 personas: 5 personas with specific outcomes + numbers
  // Each persona has: PAIN POINT recognition + SPECIFIC numerical benefit + identity activation
  const personas = [
    {
      emoji: '🎵',
      title: { ja: '演奏家', en: 'Musicians', es: 'Músicos', ko: '연주자', pt: 'Músicos', de: 'Musiker' },
      desc: { ja: '練習録音のコンピング、LUFS マスタリング、AI 音源分離。Pro Tools $300/年・Logic ¥30,000 の機能が、ブラウザで完全無料。', en: 'Comping, LUFS mastering, AI stem separation. Pro Tools $300/yr, Logic ¥30,000 — all free in your browser.', es: 'Comping, masterización LUFS, separación IA. Pro Tools $300/año, Logic ¥30,000 — gratis en tu navegador.', ko: '컴핑, LUFS 마스터링, AI 음원 분리. Pro Tools와 Logic의 기능이 브라우저에서 무료.', pt: 'Comping, masterização LUFS, separação IA. Pro Tools e Logic — gratuitos no navegador.', de: 'Comping, LUFS-Mastering, KI-Stem-Trennung. Pro Tools und Logic — kostenlos im Browser.' },
    },
    {
      emoji: '🎓',
      title: { ja: '音大生', en: 'Music Students', es: 'Estudiantes de Música', ko: '음악학생', pt: 'Estudantes de Música', de: 'Musikstudierende' },
      desc: { ja: '和声・対位法・聴音・本番準備。Prelude ¥780/月で、音大 4 年間の練習履歴を成長グラフに。', en: 'Harmony, counterpoint, ear training, performance prep. Prelude ¥780/mo turns 4 years of practice into a growth chart.', es: 'Armonía, contrapunto, entrenamiento auditivo. Prelude ¥780/mes registra 4 años de crecimiento.', ko: '화성, 대위법, 청음, 본 무대 준비. Prelude로 4년간의 연습 기록을 그래프로.', pt: 'Harmonia, contraponto, treino auditivo. Prelude registra 4 anos de crescimento.', de: 'Harmonie, Kontrapunkt, Gehörtraining. Prelude dokumentiert 4 Jahre Wachstum.' },
    },
    {
      emoji: '🎤',
      title: { ja: '歌い手・配信者', en: 'Singers & Streamers', es: 'Cantantes y Streamers', ko: '가수·스트리머', pt: 'Cantores e Streamers', de: 'Sänger & Streamer' },
      desc: { ja: 'カラオケ → ボーカル録音 → ミックス → LUFS マスタリング → 配信書き出し。歌ってみた制作が、ブラウザだけで完結。', en: 'Karaoke → vocal recording → mix → LUFS mastering → release. Cover song production, end-to-end in your browser.', es: 'Karaoke → grabación vocal → mezcla → masterización LUFS → lanzamiento.', ko: '가라오케 → 보컬 녹음 → 믹스 → LUFS 마스터링 → 배포까지 브라우저 안에서.', pt: 'Karaokê → gravação vocal → mix → masterização LUFS → lançamento.', de: 'Karaoke → Aufnahme → Mix → LUFS-Mastering → Veröffentlichung — alles im Browser.' },
    },
    {
      emoji: '🎛️',
      title: { ja: '録音エンジニア', en: 'Recording Engineers', es: 'Ingenieros de Grabación', ko: '녹음 엔지니어', pt: 'Engenheiros de Gravação', de: 'Tonmeister' },
      desc: { ja: 'DSD 変換、DDP 検証、マスターチェック、ステム分離。世界初のブラウザ完結プロツール群が、あなたの仕事を加速。', en: 'DSD conversion, DDP verification, master check, stem separation. World-first browser pro tools accelerate your work.', es: 'Conversión DSD, verificación DDP, verificación máster, separación de stems. Herramientas pro únicas en el navegador.', ko: 'DSD 변환, DDP 검증, 마스터 체크, 스템 분리. 세계 최초 브라우저 프로 도구.', pt: 'Conversão DSD, verificação DDP, master check, separação de stems. Ferramentas pro únicas no navegador.', de: 'DSD-Konvertierung, DDP-Prüfung, Master-Check, Stem-Separation. Erstmals als Browser-Profi-Tools.' },
    },
    {
      emoji: '🎧',
      title: { ja: '音楽ファン', en: 'Music Fans', es: 'Aficionados a la Música', ko: '음악 팬', pt: 'Fãs de Música', de: 'Musikliebhaber' },
      desc: { ja: '地球音マップ、世界のライブ情報、新しいアーティスト発見。あなたと音楽の関係が、もう一段階深まります。', en: 'Sound map, live events worldwide, artist discovery. Deepen your relationship with music, one step further.', es: 'Mapa de sonidos, eventos en vivo mundiales, descubrimiento de artistas. Profundiza tu relación con la música.', ko: '지구 음향 맵, 세계 라이브, 아티스트 발견. 음악과의 관계가 한 단계 깊어집니다.', pt: 'Mapa de sons, eventos ao vivo mundiais, descoberta de artistas. Aprofunde sua relação com a música.', de: 'Klangkarte, Konzerte weltweit, Künstler entdecken. Vertiefen Sie Ihre Beziehung zur Musik.' },
    },
  ];

  return (
    <div style={{ fontFamily: sans, color: '#1f2937' }}>
      {/* 1. HERO — IQ190 persona-targeted conversion copy (2026-04-26) */}
      <section style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: 'clamp(2rem, 5%, 6rem) clamp(1rem, 3%, 4rem)', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#64748b', marginBottom: '1.5rem' }}>THE PLATFORM FOR MUSICIANS</div>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 400, lineHeight: 1.2, margin: '0 0 2rem 0', maxWidth: '1000px', whiteSpace: 'pre-line', wordBreak: 'keep-all', color: '#0f172a' }}>
          {t5({
            ja: '音楽家のための、\nひとつの場所。',
            en: 'One place,\nfor every musician.',
            es: 'Un lugar,\npara cada músico.',
            ko: '모든 음악가를 위한,\n하나의 장소.',
            pt: 'Um lugar,\npara cada músico.',
            de: 'Ein Ort,\nfür jeden Musiker.',
          }, lang)}
        </h1>
        <p style={{ fontFamily: sans, fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', color: '#64748b', maxWidth: '800px', lineHeight: 1.6, margin: '0 0 3rem 0', whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
          {t5({
            ja: '30 以上のプロツール、世界中の音楽家コミュニティ、成長を可視化するダッシュボード。\n練習も、録音も、配信も、ブラウザひとつで完結します。',
            en: '30+ professional tools, a global musician community, a dashboard that visualizes your growth.\nPractice, record, master, release — all in one browser.',
            es: '30+ herramientas profesionales, comunidad global de músicos, un panel que visualiza tu crecimiento.\nPractica, graba, masteriza, publica — todo en un navegador.',
            ko: '30+ 프로 도구, 글로벌 음악가 커뮤니티, 성장을 시각화하는 대시보드.\n연습, 녹음, 마스터링, 배포 — 브라우저 하나로.',
            pt: '30+ ferramentas profissionais, comunidade global de músicos, painel que visualiza seu crescimento.\nPratique, grave, masterize, publique — tudo em um navegador.',
            de: '30+ Profi-Tools, weltweite Musiker-Community, ein Dashboard für deine Entwicklung.\nÜben, Aufnehmen, Mastern, Veröffentlichen — alles in einem Browser.',
          }, lang)}
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/auth/login" style={{ display: 'inline-block', padding: '0.875rem 2rem', background: '#0f172a', color: 'white', borderRadius: '9999px', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {t5({ ja: '無料ではじめる →', en: 'Start Free →', es: 'Comenzar Gratis →', ko: '무료로 시작 →', pt: 'Comece Grátis →', de: 'Kostenlos starten →' }, lang)}
          </Link>
          <Link href="/audio-apps" style={{ display: 'inline-block', padding: '0.875rem 2rem', border: `2px solid ${ACCENT}`, color: ACCENT, borderRadius: '9999px', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', background: 'white', transition: 'all 0.3s ease', cursor: 'pointer' }} onMouseEnter={(e) => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {t5({ ja: '30 のツールを覗く', en: 'Explore 30+ tools', es: 'Explorar 30+ herramientas', ko: '30+ 도구 보기', pt: 'Explorar 30+ ferramentas', de: '30+ Tools entdecken' }, lang)}
          </Link>
        </div>
        <div style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: '#94a3b8', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <span>✓ {t5({ ja: 'メールアドレスだけ', en: 'Email only', es: 'Solo email', ko: '이메일만', pt: 'Só email', de: 'Nur E-Mail' }, lang)}</span>
          <span>✓ {t5({ ja: '30 秒で完了', en: '30 seconds', es: '30 segundos', ko: '30초', pt: '30 segundos', de: '30 Sekunden' }, lang)}</span>
          <span>✓ {t5({ ja: 'クラウド送信ゼロ', en: 'Zero cloud upload', es: 'Cero subida', ko: '클라우드 업로드 제로', pt: 'Sem upload', de: 'Kein Cloud-Upload' }, lang)}</span>
        </div>
      </section>

      {/* 2. TRUST BAR — 2026-04-26 IQ190 update: numbers reflect current state (30+ apps, 8 categories) */}
      <section style={{ borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', padding: '2rem clamp(1rem, 3%, 4rem)', background: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div><div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT }}>{totalAppCount()}+</div><div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>{t5({ ja: 'プロツール', en: 'Pro Tools', es: 'Herramientas Pro', ko: '프로 도구', pt: 'Ferramentas Pro', de: 'Profi-Tools' }, lang)}</div></div>
          <div><div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT }}>{CATEGORIES.length}</div><div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>{t5({ ja: 'カテゴリ', en: 'Categories', es: 'Categorías', ko: '카테고리', pt: 'Categorias', de: 'Kategorien' }, lang)}</div></div>
          <div><div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT }}>6</div><div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>{t5({ ja: '言語対応', en: 'Languages', es: 'Idiomas', ko: '언어', pt: 'Idiomas', de: 'Sprachen' }, lang)}</div></div>
          <div><div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT }}>100%</div><div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>{t5({ ja: 'ブラウザ完結', en: 'Browser-Based', es: 'Basado en Navegador', ko: '브라우저 기반', pt: 'Baseado em Navegador', de: 'Browserbasiert' }, lang)}</div></div>
          <div><div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT }}>¥0</div><div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' }}>{t5({ ja: '完全無料 (Free プラン)', en: 'Free plan', es: 'Plan gratis', ko: '완전 무료', pt: 'Totalmente grátis', de: 'Kostenloser Plan' }, lang)}</div></div>
        </div>
      </section>

      {/* 3. WHO IS THIS FOR */}
      <section style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1rem, 3%, 4rem)', background: 'white', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, textAlign: 'center', marginBottom: '0.5rem', color: '#0f172a' }}>
          {t5({ ja: 'あなたのための場所', en: 'Built for you', es: 'Hecho para ti', ko: '당신을 위해 만들어졌습니다', pt: 'Feito para você', de: 'Für dich gemacht' }, lang)}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '3rem', fontSize: '1rem' }}>
          {t5({ ja: '音楽に関わるすべての人が、自分のステージを持つことができます。', en: 'Everyone involved in music can have their own stage.', es: 'Todos los involucrados en la música pueden tener su propio escenario.', ko: '음악에 관련된 모든 사람이 자신의 무대를 가질 수 있습니다.', pt: 'Todos os envolvidos na música podem ter seu próprio palco.', de: 'Jeder, der mit Musik zu tun hat, kann seine eigene Bühne haben.' }, lang)}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {personas.map((p, idx) => (
            <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', transition: 'all 0.3s ease', cursor: 'pointer', minWidth: 0, overflow: 'hidden', boxSizing: 'border-box' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{p.emoji}</div>
              <h3 style={{ fontFamily: serif, fontSize: '1.5rem', fontWeight: 400, marginBottom: '1rem', color: '#0f172a', overflowWrap: 'anywhere' }}>{t5(p.title, lang)}</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, overflowWrap: 'anywhere', wordBreak: 'normal' }}>{t5(p.desc, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. APP SHOWCASE — IQ190 redesign 2026-04-26: category-based + featured NEW apps */}
      <section style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1rem, 3%, 4rem)', background: '#f8fafc', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, textAlign: 'center', marginBottom: '0.5rem', color: '#0f172a' }}>
          {t5({
            ja: 'あなたの目的が、すぐ見つかる。',
            en: 'Find what you need, instantly.',
            es: 'Encuentra lo que necesitas, al instante.',
            ko: '필요한 것을 즉시 찾으세요.',
            pt: 'Encontre o que precisa, instantaneamente.',
            de: 'Finde sofort, was du brauchst.',
          }, lang)}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '3rem', fontSize: '1rem', maxWidth: '700px', margin: '0 auto 3rem', wordBreak: 'keep-all' }}>
          {t5({
            ja: '8 つのカテゴリに、合計 30 以上のプロツール。すべてブラウザだけで完結します。',
            en: '8 categories, 30+ pro tools — all running in your browser.',
            es: '8 categorías, 30+ herramientas pro — todo en tu navegador.',
            ko: '8개 카테고리, 30+ 프로 도구. 모두 브라우저에서.',
            pt: '8 categorias, 30+ ferramentas pro — tudo no navegador.',
            de: '8 Kategorien, 30+ Profi-Tools — alle im Browser.',
          }, lang)}
        </p>

        {/* Category grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '4rem' }}>
          {CATEGORIES.map((cat) => {
            const count = APP_CATALOG.filter((a) => a.category === cat.id).length;
            return (
              <Link
                key={cat.id}
                href="/audio-apps#apps"
                style={{
                  display: 'block', background: 'white', border: '1px solid #e2e8f0',
                  borderRadius: '12px', padding: '1.5rem',
                  textDecoration: 'none', color: 'inherit', transition: 'all 0.25s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(2,132,199,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{cat.emoji}</div>
                <h3 style={{ fontFamily: sans, fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem', color: '#0f172a' }}>{t5(cat.label, lang)}</h3>
                <p style={{ color: '#64748b', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: '0.75rem', minHeight: '2.4em' }}>{t5(cat.desc, lang)}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', color: ACCENT, fontWeight: 600 }}>{count} {t5({ ja: 'アプリ', en: 'apps', es: 'apps', ko: '앱', pt: 'apps', de: 'Apps' }, lang)}</span>
                  <span style={{ color: ACCENT, fontSize: '0.85rem', fontWeight: 500 }}>→</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Featured NEW apps */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: serif, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 400, textAlign: 'center', marginBottom: '0.5rem', color: '#0f172a' }}>
            {t5({ ja: '✨ 最近リリースされたアプリ', en: '✨ Recently Released', es: '✨ Lanzamientos recientes' }, lang)}
          </h3>
          <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '2rem', fontSize: '0.9rem' }}>
            {t5({ ja: '今、空音開発が最もおすすめする 4 つ', en: 'Our 4 most recommended apps right now', es: 'Nuestras 4 apps más recomendadas' }, lang)}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {APP_CATALOG
              .filter((a) => isAppNew(a)) // releasedAt 必須・30 日以内のみ
              .sort((a, b) => (b.releasedAt || '').localeCompare(a.releasedAt || ''))
              .slice(0, 4)
              .map((a) => {
                const tag = (a.tagline as Record<string, string>)[lang] ?? a.tagline.en;
                const name = (a.name as Record<string, string>)[lang] ?? a.name.en;
                return (
                  <Link key={a.id} href={a.href} style={{
                    display: 'block', background: 'linear-gradient(135deg, #fff 0%, #f0f9ff 100%)',
                    border: `1px solid ${ACCENT}33`, borderRadius: '12px', padding: '1.25rem',
                    textDecoration: 'none', color: 'inherit', transition: 'all 0.25s ease', position: 'relative',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(2,132,199,0.15)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${ACCENT}33`; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <span style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', fontSize: '0.6rem', fontWeight: 600, padding: '2px 7px', borderRadius: '999px' }}>NEW</span>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{a.emoji}</div>
                    <h4 style={{ fontFamily: sans, fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.3rem', color: '#0f172a' }}>{name}</h4>
                    <p style={{ color: '#64748b', fontSize: '0.75rem', lineHeight: 1.5 }}>{tag}</p>
                  </Link>
                );
              })}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/audio-apps" style={{ color: ACCENT, textDecoration: 'none', fontSize: '1rem', fontWeight: 500 }} onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }} onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}>
            {t5({ ja: '全 30+ アプリを見る →', en: 'See all 30+ apps →', es: 'Ver todas las 30+ apps →', ko: '30+ 앱 모두 보기 →', pt: 'Ver todas as 30+ apps →', de: 'Alle 30+ Apps ansehen →' }, lang)}
          </Link>
        </div>
      </section>

      {/* 4.5 PSYCHOLOGICAL HOOK SECTION — "30秒で得られるもの" (free signup nudge) */}
      <section style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1rem, 3%, 4rem)', background: 'white', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: ACCENT, marginBottom: '0.85rem', fontWeight: 600 }}>
            ⏱ {t5({ ja: '30 秒で完了', en: '30 SECONDS', es: '30 SEGUNDOS', ko: '30초', pt: '30 SEGUNDOS', de: '30 SEKUNDEN' }, lang)}
          </div>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.75rem, 4.5vw, 2.75rem)', fontWeight: 400, marginBottom: '1rem', color: '#0f172a' }}>
            {t5({
              ja: '無料登録で、何ができるようになるか?',
              en: 'What you get with a free account.',
              es: '¿Qué obtienes con una cuenta gratis?',
              ko: '무료 계정으로 무엇을 얻을 수 있나요?',
              pt: 'O que você ganha com uma conta gratuita?',
              de: 'Was du mit einem kostenlosen Konto erhältst.',
            }, lang)}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            {t5({
              ja: 'メールアドレスだけで登録完了。コミットメントゼロ。やめる時はワンクリック。',
              en: 'Just an email. Zero commitment. Quit with one click anytime.',
              es: 'Solo email. Sin compromiso. Sal con un click cuando quieras.',
              ko: '이메일만. 약속 없음. 언제든 한 번의 클릭으로 종료.',
              pt: 'Só email. Sem compromisso. Saia com um clique.',
              de: 'Nur E-Mail. Keine Verpflichtung. Mit einem Klick kündbar.',
            }, lang)}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { ic: '🎚', t: { ja: '30+ アプリすべて使い放題', en: '30+ apps unlocked', es: '30+ apps desbloqueadas' } },
            { ic: '📊', t: { ja: '練習履歴・成長グラフ', en: 'Practice logs & growth chart', es: 'Registros y gráficos' } },
            { ic: '⭐', t: { ja: 'お気に入りアプリの保存', en: 'Save favorite apps', es: 'Guardar favoritos' } },
            { ic: '🎁', t: { ja: '初月 50% オフキャンペーン', en: '50% off first month deal', es: '50% de descuento primer mes' } },
            { ic: '💌', t: { ja: '新機能の優先案内', en: 'Early feature access', es: 'Acceso anticipado' } },
            { ic: '🔒', t: { ja: 'クラウド送信ゼロ・プライバシー保護', en: 'Zero cloud upload · privacy protected', es: 'Sin upload · privacidad' } },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.1rem', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.ic}</span>
              <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 500 }}>{t5(item.t, lang)}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link href="/auth/login" style={{
            display: 'inline-block', padding: '1rem 2.5rem', background: ACCENT, color: 'white',
            borderRadius: '9999px', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem',
            transition: 'all 0.3s ease', boxShadow: '0 6px 20px rgba(2,132,199,0.3)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(2,132,199,0.4)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(2,132,199,0.3)'; }}
          >
            {t5({ ja: '今すぐ無料登録 (30 秒) →', en: 'Sign up free (30 sec) →', es: 'Regístrate gratis (30s) →', ko: '무료 가입 (30초) →', pt: 'Cadastre-se grátis (30s) →', de: 'Kostenlos anmelden (30s) →' }, lang)}
          </Link>
        </div>
      </section>

      {/* 5. MICROPHONE — 2026-04-26 削除
           理由: マイクは日本国内限定販売。国際公平性のため Kuon ブランド内の
           全 LP から動線を遮断。/microphone ページ自体は維持し、Kotaro Studio
           外部リンクからのみ流入する純度設計。詳細は CLAUDE.md §42 参照。 */}

      {/* 6. DISCOVER (スカウト) — 2026-04-26 削除 (LP 簡素化のため。地球音マップ・ライブ情報はフッターに移動) */}

      {/* 7. PRICING */}
      <section id="pricing" style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1rem, 3%, 4rem)', background: 'white', maxWidth: '1400px', margin: '0 auto', width: '100%', scrollMarginTop: '80px' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, textAlign: 'center', marginBottom: '0.5rem', color: '#0f172a' }}>
          {t5({ ja: 'はじめ方', en: 'Choose your plan', es: 'Elige tu plan', ko: '계획 선택', pt: 'Escolha seu plano', de: 'Wähle deinen Plan' }, lang)}
        </h2>
        <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '0.4rem', fontSize: '1rem', wordBreak: 'keep-all' }}>
          {t5({ ja: 'まずは無料で。もっと使いたくなったらプランを選べます。', en: 'Start free. Upgrade when you want more.', es: 'Empieza gratis. Actualiza cuando quieras más.', ko: '무료로 시작하세요. 더 필요하면 업그레이드하세요.', pt: 'Comece grátis. Atualize quando quiser mais.', de: 'Kostenlos starten. Upgrade, wenn du mehr willst.' }, lang)}
        </p>
        {/* 2026-04-27: 90/10 framing (honest version) — ブラウザアプリは Free から大部分使える、
            サーバー処理が必要な AI 系のみ Prelude から。Free が「サブセット」ではなく「主要部分」と
            知覚されるための重要な 1 行。 */}
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem', fontSize: '0.85rem', wordBreak: 'keep-all', fontStyle: 'italic' }}>
          {t5({
            ja: 'ブラウザで動くアプリは Free から大半が使えます。AI 処理の本格ツールは Prelude から。',
            en: 'Most browser apps are accessible from Free. AI-powered tools start at Prelude.',
            es: 'La mayoría de las apps del navegador están disponibles desde Free. Las herramientas con IA desde Prelude.',
            ko: '대부분의 브라우저 앱은 Free 부터 사용 가능. AI 기반 도구는 Prelude 부터.',
            pt: 'A maioria das apps do navegador acessível desde Free. Ferramentas com IA a partir do Prelude.',
            de: 'Die meisten Browser-Apps sind ab Free zugänglich. KI-Tools ab Prelude.',
          }, lang)}
        </p>
        {/* 教師経由学生クーポン適用中バナー (CLAUDE.md §44.4) */}
        {activeCouponCode && (
          <div style={{
            maxWidth: 720, margin: '0 auto 2rem',
            padding: '1rem 1.4rem',
            background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(56,189,248,0.06))',
            border: '1px solid #34d399',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '0.75rem', flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#059669', letterSpacing: '0.08em', marginBottom: 4 }}>
                🎁 {t5({ ja: 'クーポン適用中', en: 'Coupon active', es: 'Cupón activo', ko: '쿠폰 적용 중', pt: 'Cupom ativo', de: 'Gutschein aktiv' }, lang)}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#0f172a' }}>
                <code style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: 4, fontFamily: '"SF Mono", monospace', fontSize: '0.85rem', fontWeight: 700 }}>
                  {activeCouponCode}
                </code>
                <span style={{ marginLeft: 8, color: '#64748b' }}>
                  {t5({
                    ja: '— 決済画面で適用後の価格をご確認ください',
                    en: '— See your final price at checkout',
                    es: '— Vea su precio final en el checkout',
                    ko: '— 결제 화면에서 최종 가격을 확인하세요',
                    pt: '— Veja o preço final no checkout',
                    de: '— Endpreis im Checkout einsehen',
                  }, lang)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') localStorage.removeItem('kuon_pending_coupon');
                setActiveCouponCode(null);
              }}
              style={{ padding: '4px 10px', background: 'transparent', border: '1px solid #94a3b8', borderRadius: 6, color: '#64748b', fontSize: '0.7rem', cursor: 'pointer', fontFamily: sans }}
              aria-label="Remove coupon"
            >
              {t5({ ja: '使わない', en: 'Remove', es: 'Quitar', ko: '제거', pt: 'Remover', de: 'Entfernen' }, lang)}
            </button>
          </div>
        )}

        {/* Billing toggle — 2ヶ月無料 */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem', color: yearly ? '#94a3b8' : '#0f172a', fontWeight: yearly ? 400 : 600, transition: 'color 0.2s ease' }}>
            {t5({ ja: '月払い', en: 'Monthly', es: 'Mensual', ko: '월간', pt: 'Mensal', de: 'Monatlich' }, lang)}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={yearly}
            onClick={() => setYearly(!yearly)}
            style={{
              width: 56,
              height: 30,
              borderRadius: 999,
              border: 'none',
              background: yearly ? ACCENT : '#cbd5e1',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
              padding: 0,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 3,
                left: yearly ? 29 : 3,
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: 'white',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'left 0.2s ease',
              }}
            />
          </button>
          <span style={{ fontSize: '0.9rem', color: yearly ? '#0f172a' : '#94a3b8', fontWeight: yearly ? 600 : 400, transition: 'color 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            {t5({ ja: '年払い', en: 'Yearly', es: 'Anual', ko: '연간', pt: 'Anual', de: 'Jährlich' }, lang)}
            <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999, fontWeight: 600, letterSpacing: '0.02em' }}>
              {t5({ ja: '2ヶ月無料', en: '2 months free', es: '2 meses gratis', ko: '2개월 무료', pt: '2 meses grátis', de: '2 Monate gratis' }, lang)}
            </span>
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2.5rem 2rem', textAlign: 'center' }}>
            <h3 style={{ fontFamily: sans, fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.15rem', color: '#0f172a' }}>{t5({ ja: 'Free', en: 'Free', es: 'Gratis', ko: '무료', pt: 'Gratuito', de: 'Kostenlos' }, lang)}</h3>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '0.85rem', textTransform: 'uppercase', fontWeight: 500 }}>{t5(PLAN_SUBTITLES.free, lang)}</div>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT, marginBottom: '1.5rem' }}>{formatPrice(0, currency)}</div>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left', color: '#64748b', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5({ ja: '13 アプリが利用可能', en: '13 apps included', es: '13 apps incluidas', ko: '13개 앱 이용 가능', pt: '13 apps incluídos', de: '13 Apps inklusive' }, lang)}</li>
              <li>✓ {t5({ ja: 'メールアドレス登録のみ・カード不要', en: 'Email signup only · no card', es: 'Solo email · sin tarjeta', ko: '이메일 가입만 · 카드 불필요', pt: 'Apenas email · sem cartão', de: 'Nur E-Mail · keine Karte' }, lang)}</li>
            </ul>
            <Link href="/auth/login" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: ACCENT, color: 'white', borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#0369a1'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; }}>
              {t5({ ja: '登録して今すぐ使う', en: 'Sign Up & Start Now', es: 'Registrarse y Empezar', ko: '가입하고 지금 시작', pt: 'Cadastrar-se e Começar', de: 'Registrieren & Starten' }, lang)}
            </Link>
          </div>
          <div style={{ background: 'white', border: `2px solid ${ACCENT}`, borderRadius: '12px', padding: '2.5rem 2rem', textAlign: 'center', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: ACCENT, color: 'white', padding: '0.375rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
              {t5({ ja: 'おすすめ', en: 'POPULAR', es: 'POPULAR', ko: '인기', pt: 'POPULAR', de: 'BELIEBT' }, lang)}
            </div>
            <h3 style={{ fontFamily: sans, fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.15rem', color: '#0f172a' }}>{t5({ ja: 'Prelude', en: 'Prelude', es: 'Prelude', ko: 'Prelude', pt: 'Prelude', de: 'Prelude' }, lang)}</h3>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '0.85rem', textTransform: 'uppercase', fontWeight: 500 }}>{t5(PLAN_SUBTITLES.prelude, lang)}</div>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT, marginBottom: '0.25rem' }}>
              {yearly ? preludeYearlyDisp : preludeMonthlyDisp}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: yearly ? '0.25rem' : '0.75rem' }}>
              {yearly
                ? t5({ ja: '/年', en: '/year', es: '/año', ko: '/년', pt: '/ano', de: '/Jahr' }, lang)
                : t5({ ja: '/月', en: '/month', es: '/mes', ko: '/월', pt: '/mês', de: '/Monat' }, lang)}
            </div>
            {!yearly && (
              <div style={{ background: '#fef3c7', color: '#92400e', borderRadius: '6px', padding: '0.45rem 0.7rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.25rem', display: 'inline-block' }}>
                {t5({
                  ja: `🎁 初月 ${formatHalfPrice(preludeMonthlyAmount, currency)} (50% OFF)`,
                  en: `🎁 First month ${formatHalfPrice(preludeMonthlyAmount, currency)} (50% OFF)`,
                  es: `🎁 Primer mes ${formatHalfPrice(preludeMonthlyAmount, currency)} (50% OFF)`,
                  ko: `🎁 첫달 ${formatHalfPrice(preludeMonthlyAmount, currency)} (50% OFF)`,
                  pt: `🎁 Primeiro mês ${formatHalfPrice(preludeMonthlyAmount, currency)} (50% OFF)`,
                  de: `🎁 Erster Monat ${formatHalfPrice(preludeMonthlyAmount, currency)} (50% OFF)`,
                }, lang)}
              </div>
            )}
            {yearly && (
              <div style={{ background: '#fef3c7', color: '#92400e', borderRadius: '6px', padding: '0.45rem 0.7rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', display: 'inline-block' }}>
                {t5({
                  ja: '🎁 2ヶ月分お得',
                  en: '🎁 2 months free',
                  es: '🎁 2 meses gratis',
                  ko: '🎁 2개월 무료',
                  pt: '🎁 2 meses grátis',
                  de: '🎁 2 Monate gratis',
                }, lang)}
              </div>
            )}
            {yearly && (
              <div style={{ fontSize: '0.75rem', color: ACCENT, marginBottom: '1.25rem', fontWeight: 500 }}>
                {t5({
                  ja: `月換算 ${formatMonthlyEquivalent(preludeYearlyAmount, currency)}`,
                  en: `${formatMonthlyEquivalent(preludeYearlyAmount, currency)} / mo equivalent`,
                  es: `${formatMonthlyEquivalent(preludeYearlyAmount, currency)} / mes`,
                  ko: `월 환산 ${formatMonthlyEquivalent(preludeYearlyAmount, currency)}`,
                  pt: `equivalente a ${formatMonthlyEquivalent(preludeYearlyAmount, currency)} / mês`,
                  de: `entspricht ${formatMonthlyEquivalent(preludeYearlyAmount, currency)} / Monat`,
                }, lang)}
              </div>
            )}
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left', color: '#64748b', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5({ ja: '29 アプリが無制限 (Free から +16 アプリ解禁)', en: '29 apps unlimited (+16 from Free)', es: '29 apps ilimitadas (+16 de Free)', ko: '29개 앱 무제한 (Free + 16)', pt: '29 apps ilimitados (+16 do Free)', de: '29 Apps unbegrenzt (+16 von Free)' }, lang)}</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ {t5(PLAN_QUOTAS.prelude.separator, lang)}</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ {t5(PLAN_QUOTAS.prelude.transcriber, lang)}</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5(PLAN_QUOTAS.prelude.intonation, lang)}</li>
              <li>✓ {t5({ ja: '練習ログ記録', en: 'Practice logs', es: 'Registros de práctica', ko: '연습 기록', pt: 'Registros de prática', de: 'Übungsprotokolle' }, lang)}</li>
            </ul>
            <button
              type="button"
              disabled={subscribeLoading !== null}
              onClick={() => handleSubscribe('prelude', yearly ? 'annual' : 'monthly')}
              style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: ACCENT, color: 'white', borderRadius: '6px', border: 'none', fontSize: '0.9rem', fontWeight: 500, cursor: subscribeLoading ? 'wait' : 'pointer', opacity: subscribeLoading === 'prelude' ? 0.6 : 1, transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => { if (!subscribeLoading) { e.currentTarget.style.background = '#0369a1'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {subscribeLoading === 'prelude'
                ? t5({ ja: '処理中...', en: 'Processing...', es: 'Procesando...', ko: '처리 중...', pt: 'Processando...', de: 'Verarbeitung...' }, lang)
                : t5({ ja: '購入する', en: 'Subscribe', es: 'Suscribirse', ko: '구독', pt: 'Assinar', de: 'Abonnieren' }, lang)}
            </button>
          </div>
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2.5rem 2rem', textAlign: 'center' }}>
            <h3 style={{ fontFamily: sans, fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.15rem', color: '#0f172a' }}>{t5({ ja: 'Concerto', en: 'Concerto', es: 'Concerto', ko: 'Concerto', pt: 'Concerto', de: 'Concerto' }, lang)}</h3>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '0.85rem', textTransform: 'uppercase', fontWeight: 500 }}>{t5(PLAN_SUBTITLES.concerto, lang)}</div>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT, marginBottom: '0.25rem' }}>
              {yearly ? concertoYearlyDisp : concertoMonthlyDisp}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: yearly ? '0.25rem' : '0.75rem' }}>
              {yearly
                ? t5({ ja: '/年', en: '/year', es: '/año', ko: '/년', pt: '/ano', de: '/Jahr' }, lang)
                : t5({ ja: '/月', en: '/month', es: '/mes', ko: '/월', pt: '/mês', de: '/Monat' }, lang)}
            </div>
            {!yearly && (
              <div style={{ background: '#fef3c7', color: '#92400e', borderRadius: '6px', padding: '0.45rem 0.7rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.25rem', display: 'inline-block' }}>
                {t5({
                  ja: `🎁 初月 ${formatHalfPrice(concertoMonthlyAmount, currency)} (50% OFF)`,
                  en: `🎁 First month ${formatHalfPrice(concertoMonthlyAmount, currency)} (50% OFF)`,
                  es: `🎁 Primer mes ${formatHalfPrice(concertoMonthlyAmount, currency)} (50% OFF)`,
                  ko: `🎁 첫달 ${formatHalfPrice(concertoMonthlyAmount, currency)} (50% OFF)`,
                  pt: `🎁 Primeiro mês ${formatHalfPrice(concertoMonthlyAmount, currency)} (50% OFF)`,
                  de: `🎁 Erster Monat ${formatHalfPrice(concertoMonthlyAmount, currency)} (50% OFF)`,
                }, lang)}
              </div>
            )}
            {yearly && (
              <div style={{ background: '#fef3c7', color: '#92400e', borderRadius: '6px', padding: '0.45rem 0.7rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', display: 'inline-block' }}>
                {t5({
                  ja: '🎁 2ヶ月分お得',
                  en: '🎁 2 months free',
                  es: '🎁 2 meses gratis',
                  ko: '🎁 2개월 무료',
                  pt: '🎁 2 meses grátis',
                  de: '🎁 2 Monate gratis',
                }, lang)}
              </div>
            )}
            {yearly && (
              <div style={{ fontSize: '0.75rem', color: ACCENT, marginBottom: '1.25rem', fontWeight: 500 }}>
                {t5({
                  ja: `月換算 ${formatMonthlyEquivalent(concertoYearlyAmount, currency)}`,
                  en: `${formatMonthlyEquivalent(concertoYearlyAmount, currency)} / mo equivalent`,
                  es: `${formatMonthlyEquivalent(concertoYearlyAmount, currency)} / mes`,
                  ko: `월 환산 ${formatMonthlyEquivalent(concertoYearlyAmount, currency)}`,
                  pt: `equivalente a ${formatMonthlyEquivalent(concertoYearlyAmount, currency)} / mês`,
                  de: `entspricht ${formatMonthlyEquivalent(concertoYearlyAmount, currency)} / Monat`,
                }, lang)}
              </div>
            )}
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left', color: '#64748b', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5({ ja: '全 33 アプリが無制限 (業務エンジニア向け 4 アプリ追加)', en: 'All 33 apps unlimited (+4 pro-engineer apps)', es: 'Las 33 apps ilimitadas (+4 pro)', ko: '전체 33개 앱 무제한 (+4 프로)', pt: 'Todos os 33 apps ilimitados (+4 pro)', de: 'Alle 33 Apps unbegrenzt (+4 Pro)' }, lang)}</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ {t5(PLAN_QUOTAS.concerto.separator, lang)}</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ {t5(PLAN_QUOTAS.concerto.transcriber, lang)}</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5(PLAN_QUOTAS.concerto.intonation, lang)}</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5({ ja: 'ライブ投稿', en: 'Post live events', es: 'Publicar eventos en vivo', ko: '라이브 포스팅', pt: 'Postar eventos ao vivo', de: 'Live-Events posten' }, lang)}</li>
              <li>✓ {t5({ ja: '優先サポート', en: 'Priority support', es: 'Soporte prioritario', ko: '우선 지원', pt: 'Suporte prioritário', de: 'Prioritäts-Support' }, lang)}</li>
            </ul>
            <button
              type="button"
              disabled={subscribeLoading !== null}
              onClick={() => handleSubscribe('concerto', yearly ? 'annual' : 'monthly')}
              style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: ACCENT, color: 'white', borderRadius: '6px', border: 'none', fontSize: '0.9rem', fontWeight: 500, cursor: subscribeLoading ? 'wait' : 'pointer', opacity: subscribeLoading === 'concerto' ? 0.6 : 1, transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => { if (!subscribeLoading) { e.currentTarget.style.background = '#0369a1'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {subscribeLoading === 'concerto'
                ? t5({ ja: '処理中...', en: 'Processing...', es: 'Procesando...', ko: '처리 중...', pt: 'Processando...', de: 'Verarbeitung...' }, lang)
                : t5({ ja: '購入する', en: 'Subscribe', es: 'Suscribirse', ko: '구독', pt: 'Assinar', de: 'Abonnieren' }, lang)}
            </button>
          </div>

          {/* Symphony — Advanced */}
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2.5rem 2rem', textAlign: 'center' }}>
            <h3 style={{ fontFamily: sans, fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.15rem', color: '#0f172a' }}>Symphony</h3>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '0.85rem', textTransform: 'uppercase', fontWeight: 500 }}>{t5(PLAN_SUBTITLES.symphony, lang)}</div>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT, marginBottom: '0.25rem' }}>
              {yearly ? symphonyYearlyDisp : symphonyMonthlyDisp}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: yearly ? '0.25rem' : '0.75rem' }}>
              {yearly
                ? t5({ ja: '/年', en: '/year', es: '/año', ko: '/년', pt: '/ano', de: '/Jahr' }, lang)
                : t5({ ja: '/月', en: '/month', es: '/mes', ko: '/월', pt: '/mês', de: '/Monat' }, lang)}
            </div>
            {!yearly && (
              <div style={{ background: '#fef3c7', color: '#92400e', borderRadius: '6px', padding: '0.45rem 0.7rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.25rem', display: 'inline-block' }}>
                {t5({
                  ja: `🎁 初月 ${formatHalfPrice(symphonyMonthlyAmount, currency)} (50% OFF)`,
                  en: `🎁 First month ${formatHalfPrice(symphonyMonthlyAmount, currency)} (50% OFF)`,
                  es: `🎁 Primer mes ${formatHalfPrice(symphonyMonthlyAmount, currency)} (50% OFF)`,
                  ko: `🎁 첫달 ${formatHalfPrice(symphonyMonthlyAmount, currency)} (50% OFF)`,
                  pt: `🎁 Primeiro mês ${formatHalfPrice(symphonyMonthlyAmount, currency)} (50% OFF)`,
                  de: `🎁 Erster Monat ${formatHalfPrice(symphonyMonthlyAmount, currency)} (50% OFF)`,
                }, lang)}
              </div>
            )}
            {yearly && (
              <div style={{ background: '#fef3c7', color: '#92400e', borderRadius: '6px', padding: '0.45rem 0.7rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', display: 'inline-block' }}>
                {t5({
                  ja: '🎁 2ヶ月分お得',
                  en: '🎁 2 months free',
                  es: '🎁 2 meses gratis',
                  ko: '🎁 2개월 무료',
                  pt: '🎁 2 meses grátis',
                  de: '🎁 2 Monate gratis',
                }, lang)}
              </div>
            )}
            {yearly && (
              <div style={{ fontSize: '0.75rem', color: ACCENT, marginBottom: '1.25rem', fontWeight: 500 }}>
                {t5({
                  ja: `月換算 ${formatMonthlyEquivalent(symphonyYearlyAmount, currency)}`,
                  en: `${formatMonthlyEquivalent(symphonyYearlyAmount, currency)} / mo equivalent`,
                  es: `${formatMonthlyEquivalent(symphonyYearlyAmount, currency)} / mes`,
                  ko: `월 환산 ${formatMonthlyEquivalent(symphonyYearlyAmount, currency)}`,
                  pt: `equivalente a ${formatMonthlyEquivalent(symphonyYearlyAmount, currency)} / mês`,
                  de: `entspricht ${formatMonthlyEquivalent(symphonyYearlyAmount, currency)} / Monat`,
                }, lang)}
              </div>
            )}
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left', color: '#64748b', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5({ ja: '全 33 アプリが無制限・最上位プラン', en: 'All 33 apps unlimited · top tier', es: 'Las 33 apps ilimitadas · plan superior', ko: '전체 33개 앱 무제한 · 최상위 플랜', pt: 'Todos 33 apps ilimitados · top tier', de: 'Alle 33 Apps unbegrenzt · höchste Stufe' }, lang)}</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ {t5(PLAN_QUOTAS.symphony.separator, lang)}</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ {t5(PLAN_QUOTAS.symphony.transcriber, lang)}</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5(PLAN_QUOTAS.symphony.intonation, lang)}</li>
              <li>✓ {t5({ ja: '優先処理キュー', en: 'Priority processing queue', es: 'Cola prioritaria', ko: '우선 처리 대기열', pt: 'Fila prioritária', de: 'Prioritätswarteschlange' }, lang)}</li>
            </ul>
            <button
              type="button"
              disabled={subscribeLoading !== null}
              onClick={() => handleSubscribe('symphony', yearly ? 'annual' : 'monthly')}
              style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: ACCENT, color: 'white', borderRadius: '6px', border: 'none', fontSize: '0.9rem', fontWeight: 500, cursor: subscribeLoading ? 'wait' : 'pointer', opacity: subscribeLoading === 'symphony' ? 0.6 : 1, transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => { if (!subscribeLoading) { e.currentTarget.style.background = '#0369a1'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {subscribeLoading === 'symphony'
                ? t5({ ja: '処理中...', en: 'Processing...', es: 'Procesando...', ko: '처리 중...', pt: 'Processando...', de: 'Verarbeitung...' }, lang)
                : t5({ ja: '購入する', en: 'Subscribe', es: 'Suscribirse', ko: '구독', pt: 'Assinar', de: 'Abonnieren' }, lang)}
            </button>
          </div>

          {/* 2026-04-27 暫定廃止: Opus
              理由: 業務スタジオ向け市場はレッドオーシャン (ProTools/iZotope 等老舗)
              空音開発は音楽家プラットフォームとして Symphony 最上位の方が自然
              Symphony クォータを底上げして最上位プランに昇格済み
              Stripe 既存サブスクとの互換性のため型・価格は残存・新規表示しない */}
          {false && (
          <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2.5rem 2rem', textAlign: 'center' }}>
            <h3 style={{ fontFamily: sans, fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.15rem', color: '#0f172a' }}>Opus</h3>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: '0.85rem', textTransform: 'uppercase', fontWeight: 500 }}>{t5(PLAN_SUBTITLES.opus, lang)}</div>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: ACCENT, marginBottom: '0.25rem' }}>
              {yearly ? opusYearlyDisp : opusMonthlyDisp}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: yearly ? '0.25rem' : '0.75rem' }}>
              {yearly
                ? t5({ ja: '/年', en: '/year', es: '/año', ko: '/년', pt: '/ano', de: '/Jahr' }, lang)
                : t5({ ja: '/月', en: '/month', es: '/mes', ko: '/월', pt: '/mês', de: '/Monat' }, lang)}
            </div>
            {!yearly && (
              <div style={{ background: '#fef3c7', color: '#92400e', borderRadius: '6px', padding: '0.45rem 0.7rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.25rem', display: 'inline-block' }}>
                {t5({
                  ja: `🎁 初月 ${formatHalfPrice(opusMonthlyAmount, currency)} (50% OFF)`,
                  en: `🎁 First month ${formatHalfPrice(opusMonthlyAmount, currency)} (50% OFF)`,
                  es: `🎁 Primer mes ${formatHalfPrice(opusMonthlyAmount, currency)} (50% OFF)`,
                  ko: `🎁 첫달 ${formatHalfPrice(opusMonthlyAmount, currency)} (50% OFF)`,
                  pt: `🎁 Primeiro mês ${formatHalfPrice(opusMonthlyAmount, currency)} (50% OFF)`,
                  de: `🎁 Erster Monat ${formatHalfPrice(opusMonthlyAmount, currency)} (50% OFF)`,
                }, lang)}
              </div>
            )}
            {yearly && (
              <div style={{ background: '#fef3c7', color: '#92400e', borderRadius: '6px', padding: '0.45rem 0.7rem', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', display: 'inline-block' }}>
                {t5({
                  ja: '🎁 2ヶ月分お得',
                  en: '🎁 2 months free',
                  es: '🎁 2 meses gratis',
                  ko: '🎁 2개월 무료',
                  pt: '🎁 2 meses grátis',
                  de: '🎁 2 Monate gratis',
                }, lang)}
              </div>
            )}
            {yearly && (
              <div style={{ fontSize: '0.75rem', color: ACCENT, marginBottom: '1.25rem', fontWeight: 500 }}>
                {t5({
                  ja: `月換算 ${formatMonthlyEquivalent(opusYearlyAmount, currency)}`,
                  en: `${formatMonthlyEquivalent(opusYearlyAmount, currency)} / mo equivalent`,
                  es: `${formatMonthlyEquivalent(opusYearlyAmount, currency)} / mes`,
                  ko: `월 환산 ${formatMonthlyEquivalent(opusYearlyAmount, currency)}`,
                  pt: `equivalente a ${formatMonthlyEquivalent(opusYearlyAmount, currency)} / mês`,
                  de: `entspricht ${formatMonthlyEquivalent(opusYearlyAmount, currency)} / Monat`,
                }, lang)}
              </div>
            )}
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem', textAlign: 'left', color: '#64748b', fontSize: '0.9rem' }}>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5({ ja: '全 33 アプリが無制限・業務利用可', en: 'All 33 apps unlimited · commercial use', es: 'Las 33 apps ilimitadas · uso comercial', ko: '전체 33개 앱 무제한 · 상업적 이용', pt: 'Todos 33 apps ilimitados · uso comercial', de: 'Alle 33 Apps unbegrenzt · kommerziell' }, lang)}</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5({ ja: '教室・スタジオ・大規模利用向け', en: 'For schools, studios, large-scale use', es: 'Para escuelas, estudios, uso a gran escala', ko: '교실·스튜디오·대규모 이용', pt: 'Para escolas, estúdios, uso em larga escala', de: 'Für Schulen, Studios, Großnutzung' }, lang)}</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ {t5(PLAN_QUOTAS.opus.separator, lang)}</li>
              <li style={{ marginBottom: '0.5rem' }}>✓ {t5(PLAN_QUOTAS.opus.transcriber, lang)}</li>
              <li style={{ marginBottom: '0.75rem' }}>✓ {t5(PLAN_QUOTAS.opus.intonation, lang)}</li>
              <li>✓ {t5({ ja: '専用サポート', en: 'Dedicated support', es: 'Soporte dedicado', ko: '전용 지원', pt: 'Suporte dedicado', de: 'Dedizierter Support' }, lang)}</li>
            </ul>
            <button
              type="button"
              disabled={subscribeLoading !== null}
              onClick={() => handleSubscribe('opus', yearly ? 'annual' : 'monthly')}
              style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: ACCENT, color: 'white', borderRadius: '6px', border: 'none', fontSize: '0.9rem', fontWeight: 500, cursor: subscribeLoading ? 'wait' : 'pointer', opacity: subscribeLoading === 'opus' ? 0.6 : 1, transition: 'all 0.3s ease' }}
              onMouseEnter={(e) => { if (!subscribeLoading) { e.currentTarget.style.background = '#0369a1'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {subscribeLoading === 'opus'
                ? t5({ ja: '処理中...', en: 'Processing...', es: 'Procesando...', ko: '처리 중...', pt: 'Processando...', de: 'Verarbeitung...' }, lang)
                : t5({ ja: '購入する', en: 'Subscribe', es: 'Suscribirse', ko: '구독', pt: 'Assinar', de: 'Abonnieren' }, lang)}
            </button>
          </div>
          )}
        </div>

        {/* HALF50 初月キャンペーン告知 (月払いの時のみ・全プラン対応) */}
        {!yearly && (
          <div style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#92400e', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
              🎁 {t5({ ja: '初月キャンペーン', en: 'First Month Deal', es: 'Promoción del Primer Mes' }, lang)}
            </div>
            <div style={{ fontFamily: serif, fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', color: '#7c2d12', fontWeight: 400, marginBottom: '0.5rem' }}>
              {t5({
                ja: '全プラン 初月 50% オフ',
                en: '50% off the first month — all plans',
                es: '50% de descuento el primer mes — todos los planes',
              }, lang)}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#9a3412' }}>
              {t5({
                ja: `Prelude ${formatHalfPrice(preludeMonthlyAmount, currency)} / Concerto ${formatHalfPrice(concertoMonthlyAmount, currency)} / Symphony ${formatHalfPrice(symphonyMonthlyAmount, currency)} / Opus ${formatHalfPrice(opusMonthlyAmount, currency)}。いつでも解約可能。`,
                en: `Prelude ${formatHalfPrice(preludeMonthlyAmount, currency)} / Concerto ${formatHalfPrice(concertoMonthlyAmount, currency)} / Symphony ${formatHalfPrice(symphonyMonthlyAmount, currency)} / Opus ${formatHalfPrice(opusMonthlyAmount, currency)}. Cancel anytime.`,
                es: `Prelude ${formatHalfPrice(preludeMonthlyAmount, currency)} / Concerto ${formatHalfPrice(concertoMonthlyAmount, currency)} / Symphony ${formatHalfPrice(symphonyMonthlyAmount, currency)} / Opus ${formatHalfPrice(opusMonthlyAmount, currency)}. Cancela en cualquier momento.`,
                ko: `Prelude ${formatHalfPrice(preludeMonthlyAmount, currency)} / Concerto ${formatHalfPrice(concertoMonthlyAmount, currency)} / Symphony ${formatHalfPrice(symphonyMonthlyAmount, currency)} / Opus ${formatHalfPrice(opusMonthlyAmount, currency)}. 언제든지 해지 가능.`,
                pt: `Prelude ${formatHalfPrice(preludeMonthlyAmount, currency)} / Concerto ${formatHalfPrice(concertoMonthlyAmount, currency)} / Symphony ${formatHalfPrice(symphonyMonthlyAmount, currency)} / Opus ${formatHalfPrice(opusMonthlyAmount, currency)}. Cancele a qualquer momento.`,
                de: `Prelude ${formatHalfPrice(preludeMonthlyAmount, currency)} / Concerto ${formatHalfPrice(concertoMonthlyAmount, currency)} / Symphony ${formatHalfPrice(symphonyMonthlyAmount, currency)} / Opus ${formatHalfPrice(opusMonthlyAmount, currency)}. Jederzeit kündbar.`,
              }, lang)}
            </div>
          </div>
        )}

        {/* プラン乗換自由バナー (顧客のリアル声から実装) */}
        <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, #ecfeff 0%, #f0f9ff 100%)', border: '1px solid #bae6fd', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#0369a1', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>
            🔄 {t5({ ja: 'プランは月単位で自由変更', en: 'Switch Plans Anytime', es: 'Cambia de Plan Cuando Quieras' }, lang)}
          </div>
          <div style={{ fontFamily: serif, fontSize: 'clamp(1rem, 2.5vw, 1.35rem)', color: '#0f172a', fontWeight: 400, marginBottom: '0.5rem' }}>
            {t5({
              ja: 'まず Symphony を半額で試して、お気に入りなら Prelude 年額へ。',
              en: 'Try Symphony at 50% off, then switch to Prelude annual when ready.',
              es: 'Prueba Symphony con 50% de descuento, luego cambia a Prelude anual.',
            }, lang)}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
            {t5({
              ja: '日割り計算で公平に切替。月額・年額・プラン上下、いつでも変更可能です。',
              en: 'Fair pro-rated switching. Change between monthly, yearly, or any tier — anytime.',
              es: 'Cambio prorrateado y justo. Cambia entre mensual, anual o cualquier nivel — en cualquier momento.',
            }, lang)}
          </div>
        </div>

        {/* マイク購入者特典バナー — 2026-04-26 削除
             理由: マイクは日本国内限定販売 → 海外ユーザーへの不公平を排除。
             マイク特典 (Concerto 1ヶ月無料) も実装しない方針に確定。
             詳細は CLAUDE.md §42 参照。 */}
      </section>

      {/* 7.5 CERTIFICATION — REMOVED 2026-04-25 (認定制度を採用しない決定 / CLAUDE.md §37.5) */}

      {/* 8. FAQ */}
      <section style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1rem, 3%, 4rem)', background: '#f8fafc', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, textAlign: 'center', marginBottom: '3rem', color: '#0f172a' }}>
          {t5({ ja: 'よくある質問', en: 'FAQ', es: 'Preguntas Frecuentes', ko: '자주 묻는 질문', pt: 'Perguntas Frequentes', de: 'Häufige Fragen' }, lang)}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <button onClick={() => setFaqOpen(faqOpen === idx ? null : idx)} style={{ width: '100%', padding: '1.5rem', background: 'white', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}>
                <span style={{ fontWeight: 500, color: '#0f172a', fontSize: '1rem' }}>{t5(faq.q, lang)}</span>
                <span style={{ color: ACCENT, fontSize: '1.2rem', transition: 'all 0.3s ease', transform: faqOpen === idx ? 'rotate(180deg)' : 'rotate(0)' }}>▼</span>
              </button>
              {faqOpen === idx && (
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, borderTop: '1px solid #e2e8f0', wordBreak: 'keep-all' }}>
                  {t5(faq.a, lang)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. VISION (旧: FOUNDER)
            2026-04-27 IQ180 リファクタ:
            「創業者の想い」+ 朝比奈幸太郎の名前と顔写真を前面に出す設計を撤去。
            音楽家ユーザーが課金時に「誰かの実績を積み上げる」と無意識に感じる
            心理的負担を排除し、ブランド主導のビジョンに変更。創業者プロフィールは
            /profile に格納し、興味ある人だけが辿る導線に。 */}
      <section style={{ padding: 'clamp(5rem, 10%, 8rem) clamp(1rem, 3%, 4rem)', background: 'white', maxWidth: '900px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase' }}>Our Vision</p>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 400, marginBottom: '2rem', color: '#0f172a' }}>
          {t5({ ja: '空音開発の想い', en: 'What We Believe', es: 'Nuestra visión', ko: '공음개발의 비전', pt: 'Nossa visão', de: 'Unsere Vision' }, lang)}
        </h2>
        <blockquote style={{ fontFamily: serif, fontSize: 'clamp(1rem, 2vw, 1.15rem)', lineHeight: 2.0, color: '#334155', maxWidth: '700px', margin: '0 auto 2rem', padding: 'clamp(1rem, 3vw, 1.5rem) clamp(1.25rem, 4vw, 2rem)', background: '#f8fafc', borderRadius: '12px', borderLeft: `4px solid ${ACCENT}`, textAlign: 'left', overflowWrap: 'break-word', fontStyle: 'normal', boxSizing: 'border-box' }}>
          {t5({
            ja: '音楽文化が世界中で発展していく未来を信じています。音楽家が創造性に、エンジニアが表現に、それぞれが本来やるべきことに集中できる環境を。国境を越えた繋がりの中で、文化と表現、そして何より芸術がいたるところで芽を出す世界を。空音開発は、その未来のための道具をつくります。',
            en: 'We believe in a future where musical culture thrives worldwide. Where musicians focus on creativity, where engineers focus on expression — each on what they were meant to do. Where connections across borders let culture, expression, and above all art take root everywhere. Kuon R&D builds the tools for that future.',
            es: 'Creemos en un futuro donde la cultura musical prospere en todo el mundo. Donde los músicos se concentren en la creatividad y los ingenieros en la expresión — cada uno en lo que les corresponde. Donde las conexiones más allá de las fronteras permitan que la cultura, la expresión y, sobre todo, el arte echen raíces en todas partes. Kuon R&D construye las herramientas para ese futuro.',
            ko: '음악 문화가 전 세계에서 발전하는 미래를 믿습니다. 음악가는 창의성에, 엔지니어는 표현에 — 각자 본래 해야 할 일에 집중할 수 있는 환경을. 국경을 넘어선 연결 속에서 문화와 표현, 그리고 무엇보다 예술이 전 세계에 뿌리내리는 세상을. 공음개발은 그 미래를 위한 도구를 만듭니다.',
            pt: 'Acreditamos em um futuro onde a cultura musical prospere em todo o mundo. Onde os músicos foquem na criatividade e os engenheiros na expressão — cada um no que foram destinados a fazer. Onde conexões através das fronteiras permitam que a cultura, a expressão e, acima de tudo, a arte criem raízes em todos os lugares. A Kuon R&D constrói as ferramentas para esse futuro.',
            de: 'Wir glauben an eine Zukunft, in der die Musikkultur weltweit gedeiht. In der sich Musiker auf Kreativität und Tontechniker auf Ausdruck konzentrieren — jeder auf das, wofür er bestimmt ist. In der Verbindungen über Grenzen hinweg dafür sorgen, dass Kultur, Ausdruck und vor allem Kunst überall Wurzeln schlagen. Kuon R&D baut die Werkzeuge für diese Zukunft.',
          }, lang)}
        </blockquote>
        <p style={{ color: '#94a3b8', fontSize: '0.78rem', letterSpacing: '0.05em', marginTop: '1.5rem', marginBottom: '2rem' }}>
          {t5({ ja: '— 空音開発', en: '— Kuon R&D', es: '— Kuon R&D', ko: '— 공음개발', pt: '— Kuon R&D', de: '— Kuon R&D' }, lang)}
        </p>
        <Link href="/profile" style={{ display: 'inline-block', fontSize: '0.85rem', color: '#64748b', textDecoration: 'underline', textUnderlineOffset: '4px', transition: 'color 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}>
          {t5({ ja: '創業者について', en: 'About the founder', es: 'Sobre el fundador', ko: '창립자에 대하여', pt: 'Sobre o fundador', de: 'Über den Gründer' }, lang)}
        </Link>
      </section>

      {/* 10. FINAL CTA */}
      <section style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1rem, 3%, 4rem)', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', textAlign: 'center', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, marginBottom: '2rem', color: '#0f172a', wordBreak: 'keep-all' }}>
          {t5({ ja: '音楽の、いちばん近くに。', en: 'Closer to music than ever.', es: 'Más cerca de la música que nunca.', ko: '음악과 더 가깝게.', pt: 'Mais perto da música do que nunca.', de: 'Näher an der Musik als je zuvor.' }, lang)}
        </h2>
        <Link href="/auth/login" style={{ display: 'inline-block', padding: '0.875rem 2rem', background: '#0f172a', color: 'white', borderRadius: '9999px', textDecoration: 'none', fontWeight: 500, fontSize: '0.95rem', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.transform = 'translateY(0)'; }}>
          {t5({ ja: '無料ではじめる', en: 'Start Free', es: 'Comenzar Gratis', ko: '무료로 시작', pt: 'Comece Grátis', de: 'Kostenlos starten' }, lang)}
        </Link>
      </section>

      {/* 11. CONTACT */}
      <section style={{ padding: 'clamp(4rem, 8%, 6rem) clamp(1rem, 3%, 4rem)', background: 'white', maxWidth: '900px', margin: '0 auto', width: '100%' }} id="contact">
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 400, textAlign: 'center', marginBottom: '2rem', color: '#0f172a' }}>
          {t5({ ja: 'お問い合わせ', en: 'Contact', es: 'Contacto', ko: '문의', pt: 'Contato', de: 'Kontakt' }, lang)}
        </h2>
        <form action="https://formspree.io/f/xyknanzy" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#0f172a', fontWeight: 500, fontSize: '0.95rem' }}>
              {t5({ ja: 'お名前', en: 'Name', es: 'Nombre', ko: '이름', pt: 'Nome', de: 'Name' }, lang)}
            </label>
            <input type="text" name="name" required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#0f172a', fontWeight: 500, fontSize: '0.95rem' }}>
              {t5({ ja: 'メールアドレス', en: 'Email', es: 'Correo Electrónico', ko: '이메일', pt: 'E-mail', de: 'E-Mail' }, lang)}
            </label>
            <input type="email" name="email" required style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#0f172a', fontWeight: 500, fontSize: '0.95rem' }}>
              {t5({ ja: 'メッセージ', en: 'Message', es: 'Mensaje', ko: '메시지', pt: 'Mensagem', de: 'Nachricht' }, lang)}
            </label>
            <textarea name="message" required rows={5} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box', fontFamily: sans }} />
          </div>
          <button type="submit" style={{ padding: '0.875rem 2rem', background: ACCENT, color: 'white', borderRadius: '6px', border: 'none', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#0369a1'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {t5({ ja: '送信', en: 'Send', es: 'Enviar', ko: '전송', pt: 'Enviar', de: 'Senden' }, lang)}
          </button>
        </form>
      </section>

      <div style={{ height: '2rem' }} />
    </div>
  );
};

export default HomePage;
