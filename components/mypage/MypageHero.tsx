'use client';

/**
 * MypageHero — 空音開発の魂が宿るハブセクション
 * =========================================================
 * CLAUDE.md §48 で確定した「余白の知性」美学を体現するコンポーネント。
 *
 * 設計原則:
 *   - Shippori Mincho を主見出しに、Helvetica Neue をデータに（タイポグラフィの威厳）
 *   - 数値表現は控えめ。"12 日継続"、爆発エフェクト禁止
 *   - キャラクター・マスコット禁止（大人音楽家への敬意）
 *   - 時刻によって挨拶が変わる
 *   - 3 モード適応（Apprentice/Standard/Master）
 *   - 作曲家の言葉が ambient text として静かに浮かぶ
 *
 * ターゲット: 子供から音楽院教授まで全員が「自分の場所だ」と感じる体験
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';

const INK = '#1a1a1a';        // 墨
const INK_SOFT = '#475569';
const INK_FAINT = '#94a3b8';
const PAPER = '#fafaf7';       // 和紙
const PAPER_DEEP = '#f5f4ed';
const ACCENT_INDIGO = '#3a3a5e'; // 藍墨
const ACCENT_GOLD = '#9c7c3a';   // 茶金
const STAFF_LINE = '#d4d0c4';   // 譜表線色

type L6 = Partial<Record<Lang, string>> & { en: string };
const t = (m: L6, lang: Lang): string => m[lang] ?? m.en;

// 表示モード — ユーザーが自分で深さを選ぶ
export type DisplayMode = 'apprentice' | 'standard' | 'master';

// ─────────────────────────────────────────
// 作曲家の言葉（rotating ambient text）
// 公衆ドメインまたは出典明記の真正引用のみ
// ─────────────────────────────────────────
const COMPOSER_WISDOMS: { text: L6; attribution: string }[] = [
  {
    text: {
      ja: '音楽は、言葉では表現できないもの、そして沈黙してはならないものを表現する',
      en: 'Music expresses that which cannot be said and on which it is impossible to be silent.',
      es: 'La música expresa lo que no puede decirse y sobre lo que es imposible callar.',
      ko: '음악은 말로 표현할 수 없으나 침묵할 수도 없는 것을 표현한다.',
      pt: 'A música expressa o que não pode ser dito e sobre o que é impossível silenciar.',
      de: 'Musik drückt aus, was nicht gesagt werden kann und worüber zu schweigen unmöglich ist.',
    },
    attribution: 'Victor Hugo',
  },
  {
    text: {
      ja: '音楽の唯一の目的は、神の栄光と、人間の心の安らぎにある',
      en: 'The aim and final end of all music should be none other than the glory of God and the refreshment of the soul.',
      es: 'El fin último de toda música debe ser la gloria de Dios y el refresco del alma.',
      ko: '모든 음악의 목적은 신의 영광과 영혼의 위로에 있다.',
      pt: 'O objetivo final de toda música deve ser a glória de Deus e o conforto da alma.',
      de: 'Der Endzweck aller Musik ist nichts anderes als die Ehre Gottes und die Erquickung des Gemüts.',
    },
    attribution: 'J.S. Bach',
  },
  {
    text: {
      ja: '言葉が尽きたところに、音楽が始まる',
      en: 'Where words fail, music speaks.',
      es: 'Donde las palabras fallan, la música habla.',
      ko: '말이 다하는 곳에서 음악이 시작된다.',
      pt: 'Onde as palavras falham, a música fala.',
      de: 'Wo Worte nicht reichen, beginnt die Musik.',
    },
    attribution: 'Hans Christian Andersen',
  },
  {
    text: {
      ja: '音と音の間にある沈黙、そこに芸術が宿る',
      en: 'The notes I handle no better than many pianists. But the pauses between the notes — ah, that is where the art resides.',
      es: 'Las notas las toco como muchos pianistas. Pero las pausas entre las notas — ahí reside el arte.',
      ko: '음과 음 사이의 침묵, 그곳에 예술이 깃든다.',
      pt: 'As pausas entre as notas — é ali que reside a arte.',
      de: 'Die Pausen zwischen den Noten — dort wohnt die Kunst.',
    },
    attribution: 'Artur Schnabel',
  },
  {
    text: {
      ja: '音楽は普遍の言葉である',
      en: 'Music is the universal language of mankind.',
      es: 'La música es el lenguaje universal de la humanidad.',
      ko: '음악은 인류 보편의 언어이다.',
      pt: 'A música é a linguagem universal da humanidade.',
      de: 'Musik ist die universale Sprache der Menschheit.',
    },
    attribution: 'H.W. Longfellow',
  },
  {
    text: {
      ja: '練習したからといって完璧にはならない。完璧に練習することで完璧になる',
      en: 'Practice does not make perfect. Only perfect practice makes perfect.',
      es: 'La práctica no perfecciona. Solo la práctica perfecta perfecciona.',
      ko: '연습이 완벽을 만드는 것이 아니라, 완벽한 연습만이 완벽을 만든다.',
      pt: 'A prática não torna perfeito. Apenas a prática perfeita torna perfeito.',
      de: 'Übung allein macht nicht den Meister. Nur perfekte Übung macht den Meister.',
    },
    attribution: 'Vince Lombardi',
  },
  {
    text: {
      ja: '芸術は人を高めるのみならず、その魂を浄化する',
      en: 'Art has the role in education of helping children become like themselves, and not more like everyone else.',
      es: 'El arte ayuda a los niños a ser más ellos mismos, no como los demás.',
      ko: '예술은 사람을 고양시키며 영혼을 정화한다.',
      pt: 'A arte tem o papel de ajudar as pessoas a se tornarem mais elas mesmas.',
      de: 'Die Kunst hilft Menschen, mehr sie selbst zu werden.',
    },
    attribution: 'Sydney Gurewitz Clemens',
  },
];

// ─────────────────────────────────────────
// 時刻に応じた挨拶
// ─────────────────────────────────────────
function getTimeOfDayGreeting(lang: Lang, name: string): string {
  const hour = new Date().getHours();
  const greetings: Record<string, L6> = {
    earlyMorning: {
      ja: 'おはようございます',
      en: 'Good morning',
      es: 'Buenos días',
      ko: '좋은 아침입니다',
      pt: 'Bom dia',
      de: 'Guten Morgen',
    },
    morning: {
      ja: 'おはようございます',
      en: 'Good morning',
      es: 'Buenos días',
      ko: '좋은 아침입니다',
      pt: 'Bom dia',
      de: 'Guten Morgen',
    },
    afternoon: {
      ja: 'こんにちは',
      en: 'Good afternoon',
      es: 'Buenas tardes',
      ko: '안녕하세요',
      pt: 'Boa tarde',
      de: 'Guten Tag',
    },
    evening: {
      ja: 'こんばんは',
      en: 'Good evening',
      es: 'Buenas noches',
      ko: '안녕하세요',
      pt: 'Boa noite',
      de: 'Guten Abend',
    },
    night: {
      ja: '夜遅くまでお疲れさまです',
      en: 'Working late tonight',
      es: 'Trabajando hasta tarde',
      ko: '밤늦게까지 수고하십니다',
      pt: 'Trabalhando até tarde',
      de: 'Spät am Abend',
    },
  };

  const period =
    hour < 5 ? 'night'
    : hour < 11 ? 'morning'
    : hour < 17 ? 'afternoon'
    : hour < 22 ? 'evening'
    : 'night';

  const base = t(greetings[period], lang);
  // 日本語のみ「、〇〇さん」を付ける（他言語ではフレーズ + name で自然）
  if (lang === 'ja' && name) return `${base}、${name}さん`;
  if (name) return `${base}, ${name}`;
  return base;
}

// ─────────────────────────────────────────
// 譜表線装飾（区切り線として使う）
// ─────────────────────────────────────────
function StaffDivider() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '1rem 0', opacity: 0.6 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ height: 1, background: STAFF_LINE }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// メインコンポーネント
// ─────────────────────────────────────────
export interface MypageHeroProps {
  userName: string;
  userEmail: string;
  userPlan: string;
  // 将来 Theory Suite 実装後に渡される
  theoryProgress?: {
    lessonsCompleted: number;
    totalLessons: number;
    currentStreak: number;
    todayLessonsCount: number;
    todayPracticeMinutes: number;
  };
  // Classical Lab の利用統計
  labStats?: {
    weeklyAnalyses: number;
    lastAnalyzedTitle?: string;
    totalAnalyses: number;
  };
}

export function MypageHero({ userName, userPlan, theoryProgress, labStats }: MypageHeroProps) {
  const { lang } = useLang();
  const [displayMode, setDisplayMode] = useState<DisplayMode>('standard');
  const [mounted, setMounted] = useState(false);

  // localStorage から表示モードを復元
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('kuon_display_mode') as DisplayMode | null;
      if (saved && ['apprentice', 'standard', 'master'].includes(saved)) {
        setDisplayMode(saved);
      }
    } catch {}
  }, []);

  const updateDisplayMode = (mode: DisplayMode) => {
    setDisplayMode(mode);
    try {
      localStorage.setItem('kuon_display_mode', mode);
    } catch {}
  };

  // 今日の日付シードで作曲家の言葉を選択（毎日同じ、日が変われば変わる）
  const wisdom = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return COMPOSER_WISDOMS[dayOfYear % COMPOSER_WISDOMS.length];
  }, []);

  const greeting = mounted ? getTimeOfDayGreeting(lang, userName) : '';

  // モード別の表示密度
  const showStreak = displayMode !== 'master' && theoryProgress && theoryProgress.currentStreak > 0;
  const showProgressEncouragement = displayMode === 'apprentice';

  // 値の段階（Master モードは数値のみ、Apprentice モードは励ましあり）
  const lessonsRatio = theoryProgress
    ? `${theoryProgress.lessonsCompleted} / ${theoryProgress.totalLessons}`
    : null;

  return (
    <div style={{ background: PAPER, padding: 'clamp(2.5rem, 5vw, 4rem) clamp(1rem, 3vw, 2rem) clamp(1.5rem, 3vw, 2.5rem)' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>

        {/* ─── 時刻挨拶（明朝・大きく・控えめ） ─── */}
        <div style={{ marginBottom: 'clamp(2rem, 4vw, 3rem)' }}>
          <h1 style={{
            fontFamily: serif,
            fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)',
            fontWeight: 400,
            color: INK,
            letterSpacing: '0.04em',
            margin: 0,
            lineHeight: 1.5,
          }}>
            {greeting || ' '}
          </h1>
          {/* 控えめに、今日の日付と曜日を */}
          <div style={{
            fontFamily: sans,
            fontSize: '0.78rem',
            color: INK_FAINT,
            letterSpacing: '0.08em',
            marginTop: '0.4rem',
          }}>
            {mounted && new Date().toLocaleDateString(lang === 'ja' ? 'ja-JP' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* ─── 表示モード切替（Apprentice / Standard / Master） ─── */}
        {/* 静かに右上に配置。プロモードのとき、これだけが表示密度を変えるスイッチ */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end',
          marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
        }}>
          <div style={{
            display: 'inline-flex',
            background: PAPER_DEEP,
            border: `1px solid ${STAFF_LINE}`,
            borderRadius: 999,
            padding: 3,
            fontSize: '0.72rem',
            fontFamily: sans,
          }}>
            {(['apprentice', 'standard', 'master'] as DisplayMode[]).map((mode) => {
              const labels: Record<DisplayMode, L6> = {
                apprentice: { ja: '学習者', en: 'Apprentice', es: 'Aprendiz', ko: '학습자', pt: 'Aprendiz', de: 'Lernende:r' },
                standard: { ja: '標準', en: 'Standard', es: 'Estándar', ko: '표준', pt: 'Padrão', de: 'Standard' },
                master: { ja: '熟練者', en: 'Master', es: 'Maestro', ko: '마스터', pt: 'Mestre', de: 'Meister:in' },
              };
              const isActive = displayMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => updateDisplayMode(mode)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    background: isActive ? INK : 'transparent',
                    color: isActive ? PAPER : INK_SOFT,
                    border: 'none',
                    borderRadius: 999,
                    cursor: 'pointer',
                    fontFamily: sans,
                    fontSize: '0.72rem',
                    letterSpacing: '0.04em',
                    fontWeight: isActive ? 500 : 400,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {t(labels[mode], lang)}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── デイリーパルス（今日の状況） ─── */}
        {/* Master モードでは数値のみ、Apprentice/Standard では「日々の継続」感を表現 */}
        {(showStreak || theoryProgress) && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
            marginBottom: 'clamp(2rem, 4vw, 3rem)',
            padding: 'clamp(1.2rem, 2.5vw, 1.8rem)',
            background: '#fff',
            border: `1px solid ${STAFF_LINE}`,
            borderRadius: 4,
          }}>
            <PulseStat
              label={t({ ja: '継続日数', en: 'Streak', es: 'Continuidad', ko: '연속 학습', pt: 'Sequência', de: 'Folgetage' }, lang)}
              value={theoryProgress?.currentStreak ?? 0}
              unit={t({ ja: '日', en: 'days', es: 'días', ko: '일', pt: 'dias', de: 'Tage' }, lang)}
              accent={ACCENT_INDIGO}
              showZero={displayMode !== 'master'}
            />
            <PulseStat
              label={t({ ja: '今日の学習', en: 'Today', es: 'Hoy', ko: '오늘', pt: 'Hoje', de: 'Heute' }, lang)}
              value={theoryProgress?.todayLessonsCount ?? 0}
              unit={t({ ja: 'レッスン', en: 'lessons', es: 'lecciones', ko: '레슨', pt: 'lições', de: 'Lektionen' }, lang)}
              accent={ACCENT_GOLD}
              showZero={displayMode !== 'master'}
            />
            <PulseStat
              label={t({ ja: '練習時間', en: 'Practice time', es: 'Tiempo de práctica', ko: '연습 시간', pt: 'Tempo de prática', de: 'Übungszeit' }, lang)}
              value={theoryProgress?.todayPracticeMinutes ?? 0}
              unit={t({ ja: '分', en: 'min', es: 'min', ko: '분', pt: 'min', de: 'Min' }, lang)}
              accent={INK}
              showZero={displayMode !== 'master'}
            />
          </div>
        )}

        {/* ─── サマリーカード群（Theory / Lab / Achievements） ─── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(1rem, 2vw, 1.5rem)',
          marginBottom: 'clamp(2.5rem, 5vw, 4rem)',
        }}>
          {/* Theory Card — 楽典学習 (2026-04-30 開講: 5 レッスン公開・残りは順次追加中) */}
          <SummaryCard
            label={t({ ja: '楽典学習', en: 'Music Theory', es: 'Teoría musical', ko: '음악 이론', pt: 'Teoria musical', de: 'Musiklehre' }, lang)}
            title={
              theoryProgress
                ? lessonsRatio!
                : t({ ja: '受講開始', en: 'Begin Lessons', es: 'Comenzar', ko: '학습 시작', pt: 'Começar', de: 'Beginnen' }, lang)
            }
            sub={
              theoryProgress
                ? t({ ja: 'スキルツリーを進める', en: 'Continue your journey', es: 'Continúe su camino', ko: '여정 계속하기', pt: 'Continue sua jornada', de: 'Weiter auf Ihrem Weg' }, lang)
                : t({ ja: '基礎から音大卒業まで・全 583 レッスン', en: 'Foundations to graduate · 583 lessons', es: 'Desde lo básico · 583 lecciones', ko: '기초부터 · 583 레슨', pt: 'Do básico · 583 lições', de: 'Vom Anfang · 583 Lektionen' }, lang)
            }
            href="/theory"
            mode={displayMode}
          />

          {/* Lab Card — Classical Lab */}
          <SummaryCard
            label={t({ ja: '分析環境', en: 'Analysis Lab', es: 'Laboratorio', ko: '분석 환경', pt: 'Laboratório', de: 'Analyse-Lab' }, lang)}
            title={
              labStats?.lastAnalyzedTitle
                ?? t({ ja: 'Bach・Mozart 全集', en: '3,500+ pieces ready', es: '3,500+ piezas', ko: '3,500+ 곡', pt: '3,500+ peças', de: '3.500+ Werke' }, lang)
            }
            sub={
              labStats
                ? `${t({ ja: '今週', en: 'This week', es: 'Esta semana', ko: '이번 주', pt: 'Esta semana', de: 'Diese Woche' }, lang)}: ${labStats.weeklyAnalyses} ${t({ ja: '曲', en: 'pieces', es: 'piezas', ko: '곡', pt: 'peças', de: 'Werke' }, lang)}`
                : t({ ja: 'ローマ数字・声部進行・転調を瞬時に', en: 'Roman numerals, voice leading, modulations — instantly', es: 'Análisis instantáneo', ko: '즉시 분석', pt: 'Análise instantânea', de: 'Sofortige Analyse' }, lang)
            }
            href="/classical/lab"
            mode={displayMode}
          />

          {/* My Music Card — 私の音楽（実績 + ポートフォリオ + 公開プロフィールへの入口） */}
          {/* 在籍記録、達成、ポートフォリオを集約する「自己表現の場」。in-page anchor #my-music へ */}
          <SummaryCard
            label={t({ ja: '私の音楽', en: 'My Music', es: 'Mi música', ko: '나의 음악', pt: 'Minha música', de: 'Meine Musik' }, lang)}
            title={t({ ja: '足跡と表現', en: 'Journey & Voice', es: 'Trayecto y voz', ko: '여정과 목소리', pt: 'Jornada e voz', de: 'Werdegang & Stimme' }, lang)}
            sub={t({ ja: '記録、達成、ポートフォリオが集う場所', en: 'Records, achievements, and portfolio', es: 'Registros, logros y portfolio', ko: '기록, 성취, 포트폴리오', pt: 'Registros, conquistas e portfólio', de: 'Notizen, Errungenschaften, Portfolio' }, lang)}
            href="#my-music"
            mode={displayMode}
          />
        </div>

        {/* ─── 譜表線で区切る ─── */}
        <StaffDivider />

        {/* ─── 作曲家の言葉（ambient text・控えめに） ─── */}
        {/* Master モードでも残す。これは美意識の核。 */}
        <div style={{
          padding: 'clamp(1.5rem, 3vw, 2rem) 0',
          textAlign: 'center',
          maxWidth: 720,
          margin: '0 auto',
        }}>
          <div style={{
            fontFamily: serif,
            fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)',
            fontStyle: 'italic',
            color: INK_SOFT,
            lineHeight: 1.85,
            letterSpacing: '0.02em',
            wordBreak: 'keep-all',
          }}>
            「{t(wisdom.text, lang)}」
          </div>
          <div style={{
            fontFamily: sans,
            fontSize: '0.75rem',
            color: INK_FAINT,
            letterSpacing: '0.1em',
            marginTop: '0.8rem',
          }}>
            — {wisdom.attribution} —
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PulseStat — デイリーパルスの 1 数字
// ─────────────────────────────────────────
function PulseStat({
  label,
  value,
  unit,
  accent,
  showZero,
}: {
  label: string;
  value: number;
  unit: string;
  accent: string;
  showZero: boolean;
}) {
  if (value === 0 && !showZero) return null;
  return (
    <div>
      <div style={{
        fontFamily: sans,
        fontSize: '0.7rem',
        color: INK_FAINT,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        marginBottom: '0.5rem',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{
          fontFamily: serif,
          fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
          fontWeight: 400,
          color: accent,
          lineHeight: 1,
        }}>
          {value}
        </span>
        <span style={{
          fontFamily: sans,
          fontSize: '0.78rem',
          color: INK_FAINT,
          letterSpacing: '0.05em',
        }}>
          {unit}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// SummaryCard — 各サービスの今日の状況（クリックで深掘り）
// ─────────────────────────────────────────
function SummaryCard({
  label,
  title,
  sub,
  href,
  disabled = false,
  mode,
}: {
  label: string;
  title: string;
  sub: string;
  href: string;
  disabled?: boolean;
  mode: DisplayMode;
}) {
  const content = (
    <div style={{
      background: '#fff',
      border: `1px solid ${STAFF_LINE}`,
      borderRadius: 4,
      padding: 'clamp(1.4rem, 2.5vw, 1.8rem)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'all 0.25s ease',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      minHeight: 160,
    }}
    onMouseEnter={(e) => {
      if (!disabled) {
        e.currentTarget.style.borderColor = INK;
        e.currentTarget.style.transform = 'translateY(-1px)';
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = STAFF_LINE;
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div>
        <div style={{
          fontFamily: sans,
          fontSize: '0.7rem',
          color: INK_FAINT,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '0.7rem',
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: serif,
          fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
          fontWeight: 400,
          color: INK,
          lineHeight: 1.4,
          letterSpacing: '0.02em',
          marginBottom: '0.6rem',
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: sans,
          fontSize: '0.82rem',
          color: INK_SOFT,
          lineHeight: 1.65,
        }}>
          {sub}
        </div>
      </div>
      {!disabled && mode !== 'master' && (
        <div style={{
          marginTop: '1.2rem',
          fontFamily: sans,
          fontSize: '0.75rem',
          color: ACCENT_INDIGO,
          letterSpacing: '0.05em',
        }}>
          →
        </div>
      )}
    </div>
  );

  if (disabled) return content;
  return (
    <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
      {content}
    </Link>
  );
}

export default MypageHero;
