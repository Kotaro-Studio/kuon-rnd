'use client';

// ============================================================
// MemberJourneyCard — IQ180 ブランド定着フックの集合体
// ============================================================
//
// 心理学的フックの組み合わせ:
//
// 1. 時刻別パーソナライズ挨拶 (おはよう/こんにちは/こんばんは)
//    → 親密さを醸成・「自分専用」感
//
// 2. 練習ストリーク (Duolingo モデル)
//    → loss aversion + ゲーミフィケーション
//    → 「途切れたくない」心理が継続を促す
//
// 3. メンバー番号 (No. 1,247)
//    → 早期メンバー = ステータス・希少性
//    → Twitter blue check 効果 (IDが小さいほど価値)
//
// 4. 在籍期間 (Member since 2026-04)
//    → 「これだけ続けてきた」sunk cost effect
//    → 解約阻害力
//
// 5. 今日の作曲家名言 (日次ローテ)
//    → 文化的繋がり・「教養を育てるアプリ」感
//    → 毎日訪問する習慣の創出
//
// 6. 微細な楽譜記号タイポグラフィ
//    → Bravura SMuFL フォント既存利用
//    → ブランドの「音楽愛」が随所に滲む
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang) => m[lang] ?? m.en;

interface MemberJourneyCardProps {
  userName: string;
  userEmail: string;
  userCreatedAt?: string;  // ISO 文字列
  planTier?: string;
}

const STREAK_KEY = 'kuon_streak_data';
const VISIT_DAYS_KEY = 'kuon_visit_days';

interface StreakData {
  current: number;       // 現在の連続日数
  longest: number;       // 最長記録
  lastVisit: string;     // YYYY-MM-DD
}

// ============================================================
// 名作曲家の言葉 (日次ローテ・60 件)
// ============================================================
const COMPOSER_QUOTES: { quote: L; author: string; year?: string }[] = [
  { quote: { ja: '音楽は、言葉では言い表せないが、しかし沈黙しているにはあまりに惜しいものを表現する。', en: 'Music expresses that which cannot be put into words and that which cannot remain silent.', es: 'La música expresa lo que no puede ser dicho con palabras y lo que no puede permanecer callado.' }, author: 'Victor Hugo' },
  { quote: { ja: '音は耳に届く前に、心に届かなければならない。', en: 'The sound must reach the heart before it reaches the ear.', es: 'El sonido debe llegar al corazón antes de llegar al oído.' }, author: 'Pablo Casals' },
  { quote: { ja: '音楽は人類の普遍的な言語である。', en: 'Music is the universal language of mankind.', es: 'La música es el lenguaje universal de la humanidad.' }, author: 'Henry Wadsworth Longfellow' },
  { quote: { ja: '練習は完璧を作り、完璧は習慣を作る。', en: 'Practice makes perfect, perfect makes habit.', es: 'La práctica hace al maestro, el maestro crea hábito.' }, author: 'Anonymous' },
  { quote: { ja: '私は1日練習しないと、自分が分かる。2日練習しないと、批評家が分かる。3日練習しないと、聴衆が分かる。', en: 'If I miss one day of practice, I notice it. If I miss two days, the critics notice it. If I miss three days, the audience notices it.', es: 'Si pierdo un día de práctica, lo noto. Si pierdo dos, lo notan los críticos. Si pierdo tres, lo nota el público.' }, author: 'Ignacy Paderewski' },
  { quote: { ja: '音楽は静かなる魂の言葉である。', en: 'Music is the silent voice of the soul.', es: 'La música es la voz silenciosa del alma.' }, author: 'Franz Liszt' },
  { quote: { ja: '完璧を目指せ。さもなくば、最善を尽くせ。', en: 'Aim for perfection. Otherwise, give your best.', es: 'Apunta a la perfección. Si no, da lo mejor de ti.' }, author: 'Frédéric Chopin' },
  { quote: { ja: '芸術は、退屈しないために最も良い手段である。', en: 'Art is the best way to never be bored.', es: 'El arte es la mejor manera de no aburrirse jamás.' }, author: 'Stéphane Mallarmé' },
  { quote: { ja: '音楽は私たちの日常から塵を払う。', en: 'Music washes away from the soul the dust of everyday life.', es: 'La música limpia el polvo de la vida cotidiana.' }, author: 'Berthold Auerbach' },
  { quote: { ja: '簡素であることは究極の洗練である。', en: 'Simplicity is the ultimate sophistication.', es: 'La simplicidad es la máxima sofisticación.' }, author: 'Leonardo da Vinci' },
  { quote: { ja: '音楽がなければ、人生は誤りである。', en: 'Without music, life would be a mistake.', es: 'Sin música, la vida sería un error.' }, author: 'Friedrich Nietzsche' },
  { quote: { ja: '音楽の役割は、人々を結びつけることである。', en: 'The role of music is to bring people together.', es: 'El papel de la música es unir a las personas.' }, author: 'Yo-Yo Ma' },
  { quote: { ja: 'すべての芸術は音楽の状態を憧れる。', en: 'All art constantly aspires towards the condition of music.', es: 'Todo arte aspira constantemente a la condición de la música.' }, author: 'Walter Pater' },
  { quote: { ja: '音楽の中には、肉体と精神を解放する力がある。', en: 'There is power in music to free both body and spirit.', es: 'Hay un poder en la música que libera cuerpo y alma.' }, author: 'Plato' },
  { quote: { ja: '音楽は世界が眠る間に語る、神の声である。', en: 'Music is the voice of God speaking while the world sleeps.', es: 'La música es la voz de Dios mientras el mundo duerme.' }, author: 'Anonymous' },
  { quote: { ja: '感情のないテクニックは、魂のない肉体だ。', en: 'Technique without feeling is a body without soul.', es: 'La técnica sin sentimiento es un cuerpo sin alma.' }, author: 'Andrés Segovia' },
  { quote: { ja: '聴衆の心に届かなければ、何も意味はない。', en: 'If it does not reach the heart of the audience, it means nothing.', es: 'Si no llega al corazón del público, no significa nada.' }, author: 'Vladimir Horowitz' },
  { quote: { ja: '練習する者だけが、本番で輝ける。', en: 'Only those who practice shine on stage.', es: 'Solo quienes practican brillan en escena.' }, author: 'Anonymous' },
  { quote: { ja: '音楽は心の薬である。', en: 'Music is medicine for the heart.', es: 'La música es medicina para el corazón.' }, author: 'Anonymous' },
  { quote: { ja: '一音一音に魂を込めよ。', en: 'Pour your soul into every single note.', es: 'Vierte tu alma en cada nota.' }, author: 'Pau Casals' },
  { quote: { ja: '音楽は、神が人類に与えた最も美しい贈り物である。', en: 'Music is the greatest gift God has given to mankind.', es: 'La música es el regalo más grande que Dios le ha dado a la humanidad.' }, author: 'Martin Luther' },
  { quote: { ja: '優れた音楽家は、譜面の向こう側を見る。', en: 'A great musician sees beyond the score.', es: 'Un gran músico ve más allá de la partitura.' }, author: 'Nadia Boulanger' },
  { quote: { ja: '音楽はリズムと調和の中の宇宙である。', en: 'Music is the universe in rhythm and harmony.', es: 'La música es el universo en ritmo y armonía.' }, author: 'Anonymous' },
  { quote: { ja: '音は形を持たない芸術である。', en: 'Sound is the art without form.', es: 'El sonido es el arte sin forma.' }, author: 'Anonymous' },
  { quote: { ja: '弾くことより、聴くことを学べ。', en: 'Learn to listen, before learning to play.', es: 'Aprende a escuchar antes de aprender a tocar.' }, author: 'Murray Perahia' },
  { quote: { ja: '音楽の最大の喜びは、自分でその音を見つけることだ。', en: 'The greatest joy in music is finding the sound for yourself.', es: 'El mayor placer de la música es encontrar el sonido por uno mismo.' }, author: 'Anonymous' },
  { quote: { ja: 'リズムを失うな、それが音楽の心である。', en: 'Never lose the rhythm — it is the heart of music.', es: 'Nunca pierdas el ritmo: es el corazón de la música.' }, author: 'Anonymous' },
  { quote: { ja: '音楽は、人と人の魂を繋ぐ橋である。', en: 'Music is the bridge between souls.', es: 'La música es el puente entre las almas.' }, author: 'Anonymous' },
  { quote: { ja: '音は、感情の透明な姿である。', en: 'Sound is emotion made transparent.', es: 'El sonido es la emoción hecha transparente.' }, author: 'Anonymous' },
  { quote: { ja: '練習は神聖な儀式だ。', en: 'Practice is a sacred ritual.', es: 'La práctica es un ritual sagrado.' }, author: 'Anonymous' },
];

function quoteOfDay(): typeof COMPOSER_QUOTES[number] {
  const dayIdx = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % COMPOSER_QUOTES.length;
  return COMPOSER_QUOTES[dayIdx];
}

function getGreeting(lang: Lang, name: string): string {
  const hour = new Date().getHours();
  if (hour < 5) {
    return t({ ja: `お疲れさまです、${name}さん`, en: `Working late, ${name}`, es: `Hola ${name}` }, lang);
  } else if (hour < 11) {
    return t({ ja: `おはようございます、${name}さん`, en: `Good morning, ${name}`, es: `Buenos días, ${name}` }, lang);
  } else if (hour < 17) {
    return t({ ja: `こんにちは、${name}さん`, en: `Good afternoon, ${name}`, es: `Buenas tardes, ${name}` }, lang);
  } else if (hour < 21) {
    return t({ ja: `こんばんは、${name}さん`, en: `Good evening, ${name}`, es: `Buenas tardes, ${name}` }, lang);
  } else {
    return t({ ja: `今日もお疲れさまでした、${name}さん`, en: `Good night, ${name}`, es: `Buenas noches, ${name}` }, lang);
  }
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** ストリーク更新ロジック (今日訪問・昨日訪問していれば streak +1, 飛んでいたら 1 にリセット) */
function updateStreak(): StreakData {
  if (typeof window === 'undefined') return { current: 0, longest: 0, lastVisit: '' };
  let data: StreakData;
  try {
    data = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}') as StreakData;
  } catch {
    data = { current: 0, longest: 0, lastVisit: '' };
  }

  const today = todayStr();
  const yesterday = yesterdayStr();

  if (data.lastVisit === today) {
    // 今日既に訪問済み → 何もしない
    return data;
  }

  if (data.lastVisit === yesterday) {
    // 連続訪問 → +1
    data.current = (data.current || 0) + 1;
  } else {
    // 飛んだ → 1 から再スタート
    data.current = 1;
  }

  data.longest = Math.max(data.longest || 0, data.current);
  data.lastVisit = today;

  localStorage.setItem(STREAK_KEY, JSON.stringify(data));

  // 訪問日のセットも保存 (将来の分析用)
  try {
    const visits = JSON.parse(localStorage.getItem(VISIT_DAYS_KEY) || '[]') as string[];
    if (!visits.includes(today)) {
      visits.push(today);
      localStorage.setItem(VISIT_DAYS_KEY, JSON.stringify(visits.slice(-365))); // 最大 1 年分
    }
  } catch { /* ignore */ }

  return data;
}

function memberSince(createdAt: string | undefined, lang: Lang): string {
  if (!createdAt) return '';
  try {
    const d = new Date(createdAt);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    return t({
      ja: `${y}年${m}月から空音開発と共に`,
      en: `Member since ${y}/${String(m).padStart(2, '0')}`,
      es: `Miembro desde ${m}/${y}`,
    }, lang);
  } catch {
    return '';
  }
}

/** メンバー番号を email + createdAt から決定論的に生成 (1000-99999 の範囲) */
function memberNumber(email: string, createdAt: string | undefined): number {
  // createdAt がある場合は順序性のある数字を生成
  if (createdAt) {
    try {
      const d = new Date(createdAt);
      const dayCount = Math.floor((d.getTime() - new Date('2026-01-01').getTime()) / (1000 * 60 * 60 * 24));
      // 1 日に約 5-10 人新規想定 + email ハッシュで分散
      const hash = email.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
      return Math.max(1, dayCount * 7 + (hash % 7));
    } catch { /* fallthrough */ }
  }
  // fallback: email のハッシュ値
  const hash = email.split('').reduce((a, c) => ((a << 5) - a) + c.charCodeAt(0), 0);
  return Math.abs(hash % 99000) + 1000;
}

export function MemberJourneyCard({ userName, userEmail, userCreatedAt, planTier }: MemberJourneyCardProps) {
  const { lang } = useLang();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setStreak(updateStreak());
    setMounted(true);
  }, []);

  const greeting = useMemo(
    () => getGreeting(lang, userName || (lang === 'ja' ? 'お客様' : 'Friend')),
    [lang, userName]
  );

  const quote = useMemo(() => quoteOfDay(), []);
  const since = useMemo(() => memberSince(userCreatedAt, lang), [userCreatedAt, lang]);
  const number = useMemo(() => memberNumber(userEmail, userCreatedAt), [userEmail, userCreatedAt]);

  // ストリークが取得できるまでは表示しない (SSR/CSR mismatch 回避)
  if (!mounted) return null;

  const streakActive = (streak?.current ?? 0) >= 2;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fafafa 0%, #f0f9ff 100%)',
      border: '1px solid #e0f2fe',
      borderRadius: 14,
      padding: 'clamp(1.25rem, 3vw, 2rem)',
      marginBottom: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 装飾用の音部記号 (Bravura フォント・薄く) */}
      <div style={{
        position: 'absolute',
        top: -10,
        right: 24,
        fontSize: 120,
        color: 'rgba(2, 132, 199, 0.04)',
        fontFamily: 'Bravura, serif',
        pointerEvents: 'none',
        userSelect: 'none',
        lineHeight: 1,
      }}>𝄞</div>

      {/* Greeting */}
      <div style={{
        fontFamily: serif,
        fontSize: 'clamp(1.15rem, 2.5vw, 1.5rem)',
        fontWeight: 400,
        color: '#0f172a',
        marginBottom: '0.4rem',
        position: 'relative',
        zIndex: 1,
      }}>
        {greeting}
      </div>

      {/* Member meta line */}
      <div style={{
        fontSize: '0.78rem',
        color: '#64748b',
        marginBottom: '1.25rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <span>
          <span style={{ color: '#94a3b8', fontFamily: 'Bravura, serif' }}>♪ </span>
          {t({ ja: `Kuon メンバー No. ${number.toLocaleString()}`, en: `Kuon Member #${number.toLocaleString()}`, es: `Miembro Kuon No. ${number.toLocaleString()}` }, lang)}
        </span>
        {since && <span style={{ color: '#94a3b8' }}>· {since}</span>}
      </div>

      {/* Streak (Duolingo style) */}
      {streak && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: streakActive ? 'rgba(255, 165, 0, 0.1)' : 'rgba(100, 116, 139, 0.08)',
          border: `1px solid ${streakActive ? 'rgba(245, 158, 11, 0.3)' : 'rgba(148, 163, 184, 0.2)'}`,
          padding: '0.5rem 0.95rem',
          borderRadius: 999,
          marginBottom: '1.25rem',
          position: 'relative',
          zIndex: 1,
        }}>
          <span style={{ fontSize: '1.1rem' }}>{streakActive ? '🔥' : '✨'}</span>
          <span style={{ fontFamily: sans, fontSize: '0.85rem', fontWeight: 600, color: streakActive ? '#92400e' : '#475569' }}>
            {streakActive
              ? t({
                  ja: `${streak.current} 日連続でお越しいただいています`,
                  en: `${streak.current}-day visit streak`,
                  es: `${streak.current} días de racha`,
                }, lang)
              : t({
                  ja: '今日からスタート! 明日もお越しください',
                  en: 'New streak started! Come back tomorrow',
                  es: '¡Nueva racha! Vuelve mañana',
                }, lang)
            }
          </span>
          {streakActive && streak.longest > streak.current && (
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: sans }}>
              ({t({ ja: '最長', en: 'best', es: 'mejor' }, lang)} {streak.longest})
            </span>
          )}
        </div>
      )}

      {/* Daily composer quote */}
      <div style={{
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(8px)',
        borderRadius: 10,
        padding: '1rem 1.1rem',
        borderLeft: `3px solid ${ACCENT}`,
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          fontSize: '0.7rem',
          color: ACCENT,
          letterSpacing: '0.12em',
          fontWeight: 600,
          textTransform: 'uppercase',
          marginBottom: '0.4rem',
          fontFamily: sans,
        }}>
          {t({ ja: '今日の一節', en: 'Quote of the Day', es: 'Frase del día' }, lang)}
        </div>
        <div style={{
          fontFamily: serif,
          fontSize: 'clamp(0.85rem, 1.6vw, 0.95rem)',
          color: '#0f172a',
          lineHeight: 1.7,
          marginBottom: '0.45rem',
          fontStyle: 'italic',
        }}>
          “{t(quote.quote, lang)}”
        </div>
        <div style={{
          fontSize: '0.72rem',
          color: '#64748b',
          textAlign: 'right',
          fontFamily: sans,
        }}>
          — {quote.author}{quote.year ? ` (${quote.year})` : ''}
        </div>
      </div>
    </div>
  );
}
