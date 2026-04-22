'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─── Design tokens ───
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const DEEP = '#0b1220';
const INK = '#1a1f2e';
const MUTED = '#475569';
const LINE = '#e5e7eb';
const BG = '#fafaf7';
const ACCENT = '#8b5cf6';

// Tier colors
const BRONZE = '#b45309';
const SILVER = '#64748b';
const GOLD = '#d4a017';
const PLATINUM = '#0f172a';

type L6 = Partial<Record<Lang, string>> & { en: string };
const t = (m: L6, lang: Lang) => m[lang] ?? m.en;

// ─── Reveal on scroll ───
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('visible'); io.disconnect(); } },
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
function Section({ children, style, id }: { children: React.ReactNode; style?: React.CSSProperties; id?: string }) {
  const ref = useReveal();
  return <section ref={ref} className="reveal" id={id} style={{ marginBottom: 'clamp(72px, 11vw, 128px)', ...style }}>{children}</section>;
}

// ──────────────────────────────────────────────────────────────────────
// Tier data
// ──────────────────────────────────────────────────────────────────────
interface Tier {
  key: 'bronze' | 'silver' | 'gold' | 'platinum';
  symbol: string;
  color: string;
  name: L6;
  tagline: L6;
  examFee: string;
  monthlyFee: string;
  scope: L6[];
  benefits: L6[];
  validity: L6;
  launch: L6;
}

const TIERS: Tier[] = [
  {
    key: 'bronze',
    symbol: 'I',
    color: BRONZE,
    name: { ja: 'Bronze', en: 'Bronze', ko: 'Bronze', pt: 'Bronze', es: 'Bronze', de: 'Bronze' },
    tagline: {
      ja: '基礎を確実に。プロへの第一歩。',
      en: 'Fundamentals mastered. The first step toward professional work.',
      ko: '기초를 확실하게. 프로로의 첫걸음.',
      pt: 'Fundamentos dominados. O primeiro passo rumo ao trabalho profissional.',
      es: 'Fundamentos dominados. El primer paso hacia el trabajo profesional.',
      de: 'Grundlagen gemeistert. Der erste Schritt zur professionellen Arbeit.',
    },
    examFee: '¥9,800',
    monthlyFee: '¥980',
    scope: [
      { ja: '楽典・視唱・聴音の基礎試験', en: 'Theory, sight-singing, and ear-training fundamentals', de: 'Grundlagen in Musiktheorie, Blattsingen und Gehörbildung' },
      { ja: '演奏課題 3曲（録音提出・自動解析）', en: 'Three performance pieces (recorded submission, automated analysis)', de: 'Drei Vortragsstücke (aufgenommene Abgabe, automatische Analyse)' },
      { ja: 'ピッチ精度 / リズム精度 / ダイナミクス評価', en: 'Pitch accuracy, rhythm accuracy, and dynamics evaluation', de: 'Tonhöhengenauigkeit, Rhythmusgenauigkeit und Dynamikbewertung' },
      { ja: 'オンライン受験（24時間ウィンドウ内）', en: 'Online examination within a 24-hour window', de: 'Online-Prüfung innerhalb eines 24-Stunden-Fensters' },
    ],
    benefits: [
      { ja: 'Kuon 認定バッジ（Bronze）', en: 'Kuon Bronze certification badge', de: 'Kuon-Bronze-Zertifizierungsabzeichen' },
      { ja: '認定アーティストページ掲載', en: 'Listing on the certified-artists directory', de: 'Eintrag im Verzeichnis der zertifizierten Künstler' },
      { ja: '月次練習レポート（詳細版）', en: 'Detailed monthly practice report', de: 'Detaillierter monatlicher Übungsbericht' },
      { ja: 'ギャラリー投稿の優先掲載', en: 'Priority placement in the Owners Gallery', de: 'Vorrangige Platzierung in der Owners Gallery' },
    ],
    validity: {
      ja: '有効期間 2年（更新時は簡易審査のみ）',
      en: 'Valid for 2 years (renewal requires only a brief review)',
      de: '2 Jahre gültig (zur Verlängerung nur eine Kurzprüfung erforderlich)',
    },
    launch: { ja: '2026 夏', en: 'Summer 2026', de: 'Sommer 2026' },
  },
  {
    key: 'silver',
    symbol: 'II',
    color: SILVER,
    name: { ja: 'Silver', en: 'Silver', de: 'Silver' },
    tagline: {
      ja: '実践力の証明。仕事につながる水準へ。',
      en: 'Proven practical skill. A level that leads to paid work.',
      de: 'Nachgewiesenes praktisches Können. Ein Niveau, das zu bezahlter Arbeit führt.',
    },
    examFee: '¥14,800',
    monthlyFee: '¥1,480',
    scope: [
      { ja: '中級楽典・和声・対位法', en: 'Intermediate theory, harmony, and counterpoint', de: 'Mittlere Musiktheorie, Harmonielehre und Kontrapunkt' },
      { ja: '自由曲＋規定曲（計5曲）', en: 'Own-choice repertoire and required pieces (five total)', de: 'Wahlrepertoire und Pflichtstücke (insgesamt fünf)' },
      { ja: '基本的な録音・編集の実技', en: 'Basic recording and editing skills', de: 'Grundlegende Aufnahme- und Bearbeitungsfähigkeiten' },
      { ja: '朝比奈幸太郎＋外部審査員による評価', en: 'Evaluation by Kotaro Asahina plus an external panel', de: 'Bewertung durch Kotaro Asahina und ein externes Gremium' },
    ],
    benefits: [
      { ja: 'Bronze の全特典', en: 'All Bronze benefits', de: 'Alle Bronze-Vorteile' },
      { ja: '月1回のクリニック参加権（少人数制）', en: 'Monthly clinic access (small-group format)', de: 'Monatlicher Clinic-Zugang (Kleingruppe)' },
      { ja: '録音の無償マスタリング 年2回', en: 'Two free mastering passes per year', de: 'Zweimal jährlich kostenloses Mastering' },
      { ja: 'Kuon 音楽祭オーディション優先枠', en: 'Priority audition slot for the Kuon Music Festival', de: 'Vorrangiger Audition-Slot für das Kuon-Musikfestival' },
    ],
    validity: {
      ja: '有効期間 2年（更新時に演奏提出）',
      en: 'Valid for 2 years (renewal requires a new performance submission)',
      de: '2 Jahre gültig (zur Verlängerung neue Vortragseinreichung erforderlich)',
    },
    launch: { ja: '2026 秋', en: 'Fall 2026', de: 'Herbst 2026' },
  },
  {
    key: 'gold',
    symbol: 'III',
    color: GOLD,
    name: { ja: 'Gold', en: 'Gold', de: 'Gold' },
    tagline: {
      ja: '表現の深さと独自性。プロフェッショナルの領域。',
      en: 'Depth and originality of expression. The professional tier.',
      de: 'Ausdruckstiefe und Originalität. Die professionelle Stufe.',
    },
    examFee: '¥19,800',
    monthlyFee: '¥1,980',
    scope: [
      { ja: '高度演奏技術・独自解釈の提示', en: 'Advanced performance technique and demonstration of original interpretation', de: 'Fortgeschrittene Spieltechnik und eigenständige Interpretation' },
      { ja: '自作編曲または作曲 1曲', en: 'One original arrangement or composition', de: 'Ein eigenes Arrangement oder eine eigene Komposition' },
      { ja: '録音・ミキシング・マスタリングの作品提出', en: 'Full recording/mixing/mastering submission', de: 'Vollständige Einreichung zu Aufnahme, Mischung und Mastering' },
      { ja: '1対1のインタビュー審査', en: 'One-on-one interview assessment', de: 'Persönliches Einzelinterview' },
    ],
    benefits: [
      { ja: 'Silver の全特典', en: 'All Silver benefits', de: 'Alle Silver-Vorteile' },
      { ja: 'Kuon 音楽祭 出演枠の保証', en: 'Guaranteed Kuon Music Festival performance slot', de: 'Garantierter Auftrittsslot beim Kuon-Musikfestival' },
      { ja: 'マスタークラス年4回 無料受講', en: 'Four free master-class sessions per year', de: 'Vier kostenlose Meisterklassen pro Jahr' },
      { ja: '楽曲マーケットでの優先掲載', en: 'Priority listing on the Kuon music marketplace', de: 'Vorrangige Platzierung auf dem Kuon-Musikmarktplatz' },
      { ja: '録音サービスへの紹介（タイムマシンレコード経由）', en: 'Referral to professional recording services (via Time Machine Record)', de: 'Empfehlung an professionelle Aufnahmedienste (über Time Machine Record)' },
    ],
    validity: {
      ja: '有効期間 3年（更新時に新作提出）',
      en: 'Valid for 3 years (renewal requires submission of new work)',
      de: '3 Jahre gültig (zur Verlängerung Einreichung einer neuen Arbeit erforderlich)',
    },
    launch: { ja: '2027 春', en: 'Spring 2027', de: 'Frühjahr 2027' },
  },
  {
    key: 'platinum',
    symbol: 'IV',
    color: PLATINUM,
    name: { ja: 'Platinum', en: 'Platinum', de: 'Platinum' },
    tagline: {
      ja: 'Kuon を代表する演奏家として。招待制。',
      en: 'As an artist representing Kuon. Invitation only.',
      de: 'Als Künstler, der Kuon repräsentiert. Nur auf Einladung.',
    },
    examFee: '¥39,800',
    monthlyFee: '¥3,980',
    scope: [
      { ja: '書類審査＋推薦状 2通', en: 'Document review plus two letters of recommendation', de: 'Dokumentenprüfung plus zwei Empfehlungsschreiben' },
      { ja: '公開リサイタル相当のプログラム', en: 'Program equivalent to a public recital', de: 'Programm auf dem Niveau eines öffentlichen Konzerts' },
      { ja: '朝比奈幸太郎＋ゲスト審査員 3名による公開審査', en: 'Public evaluation by Kotaro Asahina and three invited judges', de: 'Öffentliche Bewertung durch Kotaro Asahina und drei eingeladene Juroren' },
      { ja: 'Kuon 事業全体に関するインタビュー', en: 'Interview covering your artistic practice and contribution to the Kuon ecosystem', de: 'Interview zur künstlerischen Praxis und zum Beitrag im Kuon-Ökosystem' },
    ],
    benefits: [
      { ja: 'Gold の全特典', en: 'All Gold benefits', de: 'Alle Gold-Vorteile' },
      { ja: '公式代表アーティストとしての紹介', en: 'Featured as a Kuon Official Artist', de: 'Vorgestellt als Kuon-Offizieller-Künstler' },
      { ja: 'Kuon 音楽祭ヘッドライン出演', en: 'Headline performance at the Kuon Music Festival', de: 'Headline-Auftritt beim Kuon-Musikfestival' },
      { ja: '収益機会の直接紹介（録音・出演・教育）', en: 'Direct introductions to paid opportunities (recording, performance, teaching)', de: 'Direkte Vermittlung bezahlter Gelegenheiten (Aufnahme, Auftritt, Lehre)' },
      { ja: '年間2回の個別メンタリング（朝比奈幸太郎）', en: 'Two annual one-on-one mentoring sessions with Kotaro Asahina', de: 'Zwei jährliche Einzel-Mentoring-Sitzungen mit Kotaro Asahina' },
      { ja: 'Kuon 製品・ブランドコラボレーション優先権', en: 'Priority access to Kuon product and brand collaborations', de: 'Vorrangiger Zugang zu Kuon-Produkt- und Markenkooperationen' },
    ],
    validity: {
      ja: '終身（年次レビューあり）',
      en: 'Lifetime (with annual review)',
      de: 'Lebenslang (mit jährlicher Überprüfung)',
    },
    launch: { ja: '2027 秋（招待制）', en: 'Fall 2027 (by invitation)', de: 'Herbst 2027 (nur auf Einladung)' },
  },
];

// ──────────────────────────────────────────────────────────────────────
// Why certification pillars
// ──────────────────────────────────────────────────────────────────────
interface WhyPillar { emoji: string; title: L6; body: L6; }
const WHY: WhyPillar[] = [
  {
    emoji: '○',
    title: {
      ja: '自分の現在地がわかる',
      en: 'Know exactly where you stand',
      de: 'Wissen, wo Sie stehen',
    },
    body: {
      ja: 'プロを目指す道のりは、ひとりで進むには長すぎる。Kuon 認定は「あなたが今どの段階にいるか」を客観的な指標で示します。主観や励ましではなく、測れる成長を。',
      en: 'The journey to professional work is too long to walk alone. Kuon certification shows you exactly where you stand, using objective metrics. Not subjective encouragement — measurable growth.',
      de: 'Der Weg zum Profi ist zu lang, um ihn allein zu gehen. Die Kuon-Zertifizierung zeigt Ihnen anhand objektiver Kennzahlen genau, wo Sie stehen. Kein subjektives Lob, sondern messbares Wachstum.',
    },
  },
  {
    emoji: '◇',
    title: {
      ja: '履歴書に書ける実力',
      en: 'Credentials you can put on a résumé',
      de: 'Qualifikationen, die in den Lebenslauf gehören',
    },
    body: {
      ja: '「Kuon Gold 認定」は、あなたの演奏が一定の基準を満たしていることを示す独立した証明です。出演依頼、ティーチング、録音の仕事で交渉材料になります。',
      en: '"Kuon Gold Certified" is an independent proof that your playing meets a defined standard. A negotiation chip for performance requests, teaching, and recording work.',
      de: '"Kuon Gold zertifiziert" ist ein unabhängiger Nachweis, dass Ihr Spiel einen definierten Standard erfüllt. Ein Verhandlungsargument bei Auftritten, Unterricht und Aufnahmeprojekten.',
    },
  },
  {
    emoji: '△',
    title: {
      ja: '到達可能な目標',
      en: 'Reachable milestones',
      de: 'Erreichbare Meilensteine',
    },
    body: {
      ja: '「いつかプロに」という曖昧な目標を、Bronze → Silver → Gold → Platinum という具体的な段差に変換します。毎日の練習が、確実に次の階段を上る手段になります。',
      en: 'Vague goals like "one day become a pro" become concrete steps: Bronze → Silver → Gold → Platinum. Every day of practice becomes a way to climb the next stair.',
      de: 'Vage Ziele wie "eines Tages Profi werden" werden zu konkreten Stufen: Bronze → Silver → Gold → Platinum. Jeder Übungstag wird zu einem Schritt auf der nächsten Stufe.',
    },
  },
  {
    emoji: '※',
    title: {
      ja: '世界に開かれたネットワーク',
      en: 'A global network opens',
      de: 'Ein globales Netzwerk öffnet sich',
    },
    body: {
      ja: 'Kuon 認定者は、日本・ラテンアメリカ・ヨーロッパ・アジアの演奏家と、共通の評価基準でつながります。言語を越えた「仲間」は、一生の財産です。',
      en: 'Kuon-certified artists connect with performers across Japan, Latin America, Europe, and Asia through shared standards. The peer network you build transcends language — and lasts a lifetime.',
      de: 'Kuon-zertifizierte Künstler vernetzen sich mit Interpreten aus Japan, Lateinamerika, Europa und Asien über gemeinsame Standards. Das Peer-Netzwerk, das Sie aufbauen, überwindet Sprachen — und hält ein Leben lang.',
    },
  },
];

// ──────────────────────────────────────────────────────────────────────
// FAQ
// ──────────────────────────────────────────────────────────────────────
const FAQ: { q: L6; a: L6 }[] = [
  {
    q: {
      ja: '音大を卒業していないと受験できませんか？',
      en: 'Do I need a conservatory degree to sit the exam?',
      de: 'Brauche ich einen Konservatoriumsabschluss, um die Prüfung abzulegen?',
    },
    a: {
      ja: 'いいえ。Kuon 認定は学歴を一切問いません。実力のみが評価対象です。独学で学ばれた方、音大に進まれた方、社会人になってから再挑戦される方、年齢も国籍も問いません。',
      en: 'No. Kuon certification does not require any academic qualification. Skill is the only criterion. Self-taught musicians, conservatory graduates, adult-learners returning to music — all are welcome. No age or nationality restriction.',
      de: 'Nein. Die Kuon-Zertifizierung erfordert keine akademische Qualifikation. Ausschließlich Können zählt. Autodidakten, Konservatoriumsabsolventen, Erwachsene, die zur Musik zurückkehren — alle sind willkommen. Keine Alters- oder Nationalitätsbeschränkung.',
    },
  },
  {
    q: {
      ja: '不合格だった場合、受験料は返金されますか？',
      en: 'If I fail, do I get a refund?',
      de: 'Wird bei Nichtbestehen die Prüfungsgebühr erstattet?',
    },
    a: {
      ja: 'いいえ。ただし、詳細な評価レポート（強み・弱点・次に取り組むべき課題）を必ずお返しします。再受験は90日後から可能です。「合格しなかった日」ではなく「次に進む方向がわかった日」として設計しています。',
      en: 'No — but you always receive a detailed evaluation report (strengths, weaknesses, next focus areas). You may retake the exam after 90 days. We design the experience not as "the day you failed," but as "the day you learned where to go next."',
      de: 'Nein — aber Sie erhalten immer einen ausführlichen Bewertungsbericht (Stärken, Schwächen, nächste Schwerpunkte). Die Prüfung kann nach 90 Tagen wiederholt werden. Wir gestalten das Erlebnis nicht als "den Tag, an dem Sie durchgefallen sind", sondern als "den Tag, an dem Sie wussten, wohin es als Nächstes geht."',
    },
  },
  {
    q: {
      ja: '認定維持費は何に使われますか？',
      en: 'What is the monthly maintenance fee used for?',
      de: 'Wofür wird die monatliche Gebühr verwendet?',
    },
    a: {
      ja: '認定者ページの運営、認定アーティストネットワークの維持、Kuon 音楽祭の運営、マスタークラスの企画、収益機会のマッチング運営に使われます。認定は「取って終わり」ではなく「持ち続けることで価値を得る」設計です。',
      en: 'Funds are used to operate the certified-artist directory, maintain the artist network, run the Kuon Music Festival, organize master classes, and operate the paid-opportunity matching service. Certification is designed as an ongoing membership, not a one-off credential.',
      de: 'Die Mittel werden für das Verzeichnis der zertifizierten Künstler, die Pflege des Künstlernetzwerks, die Durchführung des Kuon-Musikfestivals, die Organisation von Meisterklassen und den Matching-Service für bezahlte Gelegenheiten verwendet. Die Zertifizierung ist als fortlaufende Mitgliedschaft konzipiert, nicht als einmaliger Nachweis.',
    },
  },
  {
    q: {
      ja: 'Kuon 認定は国家資格ですか？',
      en: 'Is Kuon certification a government-issued credential?',
      de: 'Ist die Kuon-Zertifizierung ein staatlicher Abschluss?',
    },
    a: {
      ja: 'いいえ。民間の独立した認定制度です。国家資格ではありませんが、国家資格でないからこそ、言語・国境・教育制度の違いを超えて世界中の音楽家に開かれた評価基準を作れると考えています。Bach も Mozart も、国家資格は持っていませんでした。',
      en: 'No. Kuon is an independent private certification — not a government-issued credential. Precisely because it is private, it can operate across languages, borders, and education systems to create a shared standard for musicians worldwide. Bach and Mozart never held state credentials either.',
      de: 'Nein. Kuon ist eine unabhängige private Zertifizierung — kein staatlicher Abschluss. Gerade weil sie privat ist, kann sie über Sprachen, Grenzen und Bildungssysteme hinweg einen gemeinsamen Standard für Musikerinnen und Musiker weltweit schaffen. Auch Bach und Mozart hatten keine staatlichen Titel.',
    },
  },
  {
    q: {
      ja: '試験は日本語のみですか？',
      en: 'Is the exam only available in Japanese?',
      de: 'Wird die Prüfung nur auf Japanisch angeboten?',
    },
    a: {
      ja: 'いいえ。日本語・英語・ドイツ語・スペイン語・ポルトガル語・韓国語の6言語に対応予定です。記譜もドレミ（固定ド）・ドイツ音名・英語音名・日本音名の4体系を切り替え可能です。',
      en: 'No. The exam will be available in six languages: Japanese, English, German, Spanish, Portuguese, and Korean. Notation can also be displayed in four systems — Italian solfège (fixed-do), German, English, and Japanese (Iroha).',
      de: 'Nein. Die Prüfung wird in sechs Sprachen angeboten: Japanisch, Englisch, Deutsch, Spanisch, Portugiesisch und Koreanisch. Die Notation kann zudem in vier Systemen angezeigt werden — italienisches Solfège (feststehendes Do), deutsche, englische und japanische (Iroha) Bezeichnungen.',
    },
  },
  {
    q: {
      ja: 'すでに音大で学んでいます。意味はありますか？',
      en: 'I am already at a conservatory. Does Kuon certification add anything?',
      de: 'Ich studiere bereits an einem Konservatorium. Bringt die Kuon-Zertifizierung etwas?',
    },
    a: {
      ja: 'はい。音大のカリキュラムと Kuon 認定は競合しません。むしろ補完関係です。音大で学んだ理論・演奏技術を、録音・発信・収益化まで一貫した基準で評価し、国際的なネットワークに接続する場が Kuon です。',
      en: 'Yes. Kuon certification does not compete with your conservatory curriculum — it complements it. Kuon provides a unified framework that takes what you learn at your institution (theory, performance) and connects it to recording, distribution, and paid work, with an international peer network.',
      de: 'Ja. Die Kuon-Zertifizierung konkurriert nicht mit Ihrem Konservatoriumsstudium — sie ergänzt es. Kuon bietet einen einheitlichen Rahmen, der das, was Sie an Ihrer Institution lernen (Theorie, Vortrag), mit Aufnahme, Verbreitung und bezahlter Arbeit verbindet — in einem internationalen Peer-Netzwerk.',
    },
  },
];

// ──────────────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────────────
export default function CertificationPage() {
  const { lang } = useLang();
  const T6 = (m: L6) => t(m, lang);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ─── Waitlist form ───
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const form = e.currentTarget;
      const data = new FormData(form);
      const res = await fetch('https://formspree.io/f/xyknanzy', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setSubmitted(true);
        form.reset();
      }
    } catch {}
    finally { setSubmitting(false); }
  };

  return (
    <>
      <style jsx global>{`
        .reveal { opacity: 0; transform: translateY(18px); transition: opacity .8s ease, transform .8s ease; }
        .reveal.visible { opacity: 1; transform: none; }
        .tier-card { transition: transform .3s ease, box-shadow .3s ease; }
        .tier-card:hover { transform: translateY(-4px); box-shadow: 0 24px 48px -24px rgba(15,23,42,.25); }
        .faq-item { transition: background .2s ease; }
        .faq-item:hover { background: #f3f2ed; }
      `}</style>

      <main style={{ background: BG, color: INK, fontFamily: sans, minHeight: '100vh', paddingTop: 'clamp(80px, 12vw, 120px)' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 clamp(20px, 4vw, 40px)' }}>

          {/* ═══════════════ HERO ═══════════════ */}
          <Section style={{ textAlign: 'center', paddingTop: 'clamp(32px, 8vw, 72px)' }}>
            <div style={{
              display: 'inline-block',
              padding: '8px 20px',
              border: `1px solid ${LINE}`,
              borderRadius: 999,
              fontSize: 'clamp(12px, 1.4vw, 13px)',
              letterSpacing: '0.15em',
              color: ACCENT,
              marginBottom: 32,
              background: '#fff',
            }}>
              {T6({ ja: '— KUON CERTIFICATION —', en: '— KUON CERTIFICATION —', de: '— KUON CERTIFICATION —' })}
            </div>

            <h1 style={{
              fontFamily: serif,
              fontSize: 'clamp(32px, 6vw, 64px)',
              lineHeight: 1.25,
              fontWeight: 400,
              letterSpacing: '0.02em',
              margin: '0 0 28px',
              color: DEEP,
            }}>
              {T6({
                ja: '実力を、公式に。',
                en: 'Make your skill official.',
                de: 'Machen Sie Ihr Können offiziell.',
              })}
            </h1>

            <p style={{
              fontSize: 'clamp(16px, 2.2vw, 20px)',
              lineHeight: 1.85,
              maxWidth: 720,
              margin: '0 auto 40px',
              color: MUTED,
              whiteSpace: 'pre-line',
            }}>
              {T6({
                ja: 'プロを目指す音楽家のための、\n独立した国際認定制度。',
                en: 'An independent international certification\nfor musicians pursuing professional careers.',
                de: 'Eine unabhängige internationale Zertifizierung\nfür Musiker auf dem Weg zur professionellen Karriere.',
              })}
            </p>

            <div style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginTop: 24,
            }}>
              <a href="#waitlist" style={{
                display: 'inline-block',
                padding: '16px 36px',
                background: DEEP,
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 8,
                fontSize: 'clamp(14px, 1.6vw, 16px)',
                fontWeight: 500,
                letterSpacing: '0.05em',
              }}>
                {T6({ ja: '認定ウェイトリストに登録', en: 'Join the certification waitlist', de: 'Zur Zertifizierungs-Warteliste anmelden' })}
              </a>
              <a href="#tiers" style={{
                display: 'inline-block',
                padding: '16px 36px',
                background: '#fff',
                color: DEEP,
                textDecoration: 'none',
                borderRadius: 8,
                fontSize: 'clamp(14px, 1.6vw, 16px)',
                fontWeight: 500,
                letterSpacing: '0.05em',
                border: `1px solid ${LINE}`,
              }}>
                {T6({ ja: '認定段階を見る', en: 'View certification tiers', de: 'Zertifizierungsstufen ansehen' })}
              </a>
            </div>

            <p style={{
              fontSize: 13,
              color: MUTED,
              marginTop: 32,
              fontStyle: 'italic',
            }}>
              {T6({
                ja: 'Bach も Mozart も、国家資格は持っていませんでした。',
                en: 'Bach and Mozart never held state credentials either.',
                de: 'Auch Bach und Mozart hatten keine staatlichen Titel.',
              })}
            </p>
          </Section>

          {/* ═══════════════ WHY CERTIFICATION ═══════════════ */}
          <Section>
            <h2 style={{
              fontFamily: serif,
              fontSize: 'clamp(26px, 4vw, 40px)',
              lineHeight: 1.35,
              fontWeight: 400,
              textAlign: 'center',
              margin: '0 0 56px',
              color: DEEP,
            }}>
              {T6({
                ja: 'なぜ、認定制度なのか。',
                en: 'Why certification?',
                de: 'Warum Zertifizierung?',
              })}
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: 24,
            }}>
              {WHY.map((w, i) => (
                <div key={i} style={{
                  background: '#fff',
                  border: `1px solid ${LINE}`,
                  borderRadius: 12,
                  padding: 'clamp(24px, 3vw, 32px)',
                }}>
                  <div style={{
                    fontSize: 36,
                    color: ACCENT,
                    marginBottom: 16,
                    fontFamily: serif,
                    lineHeight: 1,
                  }}>{w.emoji}</div>
                  <h3 style={{
                    fontFamily: serif,
                    fontSize: 'clamp(18px, 2.2vw, 22px)',
                    fontWeight: 500,
                    margin: '0 0 12px',
                    color: DEEP,
                  }}>
                    {T6(w.title)}
                  </h3>
                  <p style={{
                    fontSize: 14,
                    lineHeight: 1.8,
                    color: MUTED,
                    margin: 0,
                  }}>
                    {T6(w.body)}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* ═══════════════ TIERS ═══════════════ */}
          <Section id="tiers">
            <h2 style={{
              fontFamily: serif,
              fontSize: 'clamp(26px, 4vw, 40px)',
              lineHeight: 1.35,
              fontWeight: 400,
              textAlign: 'center',
              margin: '0 0 16px',
              color: DEEP,
            }}>
              {T6({
                ja: '4つの認定段階。',
                en: 'Four certification tiers.',
                de: 'Vier Zertifizierungsstufen.',
              })}
            </h2>
            <p style={{
              textAlign: 'center',
              fontSize: 'clamp(14px, 1.6vw, 16px)',
              color: MUTED,
              margin: '0 auto 56px',
              maxWidth: 600,
            }}>
              {T6({
                ja: 'Bronze から始め、自分のペースで階段を上る。飛び級も、挑戦し直しも可能です。',
                en: 'Start at Bronze and climb at your own pace. Skipping tiers and retaking exams are both allowed.',
                de: 'Beginnen Sie bei Bronze und steigen Sie in Ihrem Tempo auf. Das Überspringen von Stufen und das erneute Ablegen sind erlaubt.',
              })}
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 24,
            }}>
              {TIERS.map((tier) => (
                <div key={tier.key} className="tier-card" style={{
                  background: '#fff',
                  border: `2px solid ${tier.color}`,
                  borderRadius: 16,
                  padding: 'clamp(24px, 3vw, 36px)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  {/* Corner stripe */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    borderWidth: '0 56px 56px 0',
                    borderColor: `transparent ${tier.color} transparent transparent`,
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    fontFamily: serif,
                    zIndex: 1,
                  }}>{tier.symbol}</div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 12,
                    marginBottom: 8,
                  }}>
                    <h3 style={{
                      fontFamily: serif,
                      fontSize: 'clamp(24px, 3vw, 30px)',
                      fontWeight: 500,
                      margin: 0,
                      color: tier.color,
                      letterSpacing: '0.03em',
                    }}>
                      {T6(tier.name)}
                    </h3>
                  </div>

                  <p style={{
                    fontSize: 'clamp(14px, 1.6vw, 15px)',
                    lineHeight: 1.6,
                    color: DEEP,
                    margin: '0 0 28px',
                    fontWeight: 500,
                    minHeight: 48,
                  }}>
                    {T6(tier.tagline)}
                  </p>

                  {/* Fees */}
                  <div style={{
                    background: '#fafaf7',
                    border: `1px solid ${LINE}`,
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 24,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: MUTED }}>{T6({ ja: '受験料', en: 'Exam fee', de: 'Prüfungsgebühr' })}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: DEEP }}>{tier.examFee}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: MUTED }}>{T6({ ja: '認定維持費', en: 'Monthly maintenance', de: 'Monatliche Gebühr' })}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: DEEP }}>{tier.monthlyFee}<span style={{ fontSize: 11, color: MUTED, fontWeight: 400 }}> / {T6({ ja: '月', en: 'mo', de: 'Monat' })}</span></span>
                    </div>
                  </div>

                  {/* Scope */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, color: MUTED, letterSpacing: '0.15em', marginBottom: 10, textTransform: 'uppercase' }}>
                      {T6({ ja: '試験範囲', en: 'Exam scope', de: 'Prüfungsinhalte' })}
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {tier.scope.map((s, i) => (
                        <li key={i} style={{
                          fontSize: 13,
                          lineHeight: 1.7,
                          color: INK,
                          paddingLeft: 16,
                          position: 'relative',
                          marginBottom: 4,
                        }}>
                          <span style={{ position: 'absolute', left: 0, color: tier.color }}>·</span>
                          {T6(s)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: MUTED, letterSpacing: '0.15em', marginBottom: 10, textTransform: 'uppercase' }}>
                      {T6({ ja: '認定者特典', en: 'Certified benefits', de: 'Zertifikatsvorteile' })}
                    </div>
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                      {tier.benefits.map((b, i) => (
                        <li key={i} style={{
                          fontSize: 13,
                          lineHeight: 1.7,
                          color: INK,
                          paddingLeft: 16,
                          position: 'relative',
                          marginBottom: 4,
                        }}>
                          <span style={{ position: 'absolute', left: 0, color: tier.color }}>◆</span>
                          {T6(b)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Validity & launch */}
                  <div style={{
                    borderTop: `1px solid ${LINE}`,
                    paddingTop: 16,
                    fontSize: 11,
                    color: MUTED,
                    lineHeight: 1.6,
                  }}>
                    <div>{T6(tier.validity)}</div>
                    <div style={{ marginTop: 4 }}>
                      {T6({ ja: '開始予定', en: 'Expected launch', de: 'Geplanter Start' })}: <strong style={{ color: tier.color }}>{T6(tier.launch)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ═══════════════ HOW IT WORKS ═══════════════ */}
          <Section>
            <h2 style={{
              fontFamily: serif,
              fontSize: 'clamp(26px, 4vw, 40px)',
              lineHeight: 1.35,
              fontWeight: 400,
              textAlign: 'center',
              margin: '0 0 56px',
              color: DEEP,
            }}>
              {T6({
                ja: '受験の流れ',
                en: 'How it works',
                de: 'So läuft die Prüfung ab',
              })}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
              {[
                {
                  n: '1',
                  title: { ja: '申込 & 準備', en: 'Apply & prepare', de: 'Anmeldung & Vorbereitung' } as L6,
                  body: {
                    ja: 'Kuon アカウントから段階を選び、受験料をお支払い。試験範囲と模範例、採点基準をダウンロードして準備に入ります。',
                    en: 'Choose a tier from your Kuon account and pay the exam fee. Download the exam scope, reference examples, and scoring rubric to begin preparation.',
                    de: 'Wählen Sie im Kuon-Konto eine Stufe und zahlen Sie die Prüfungsgebühr. Laden Sie Prüfungsinhalt, Referenzbeispiele und Bewertungsbogen zur Vorbereitung herunter.',
                  } as L6,
                },
                {
                  n: '2',
                  title: { ja: '受験', en: 'Take the exam', de: 'Prüfung ablegen' } as L6,
                  body: {
                    ja: '理論・聴音の自動採点部分は好きな時に受験。演奏提出は24時間以内に録音して送信。Gold 以降はライブ審査もあります。',
                    en: 'Take auto-scored theory and ear-training sections anytime. Performance submissions are recorded and sent within 24 hours. Gold and above include live interview assessment.',
                    de: 'Automatisch bewertete Theorie- und Gehörbildungsteile können jederzeit absolviert werden. Vortragseinreichungen werden innerhalb von 24 Stunden aufgenommen und gesendet. Ab Gold folgt ein Live-Interview.',
                  } as L6,
                },
                {
                  n: '3',
                  title: { ja: '評価 & 結果', en: 'Evaluation & result', de: 'Bewertung & Ergebnis' } as L6,
                  body: {
                    ja: 'Bronze/Silver は2週間、Gold/Platinum は4週間で結果通知。全受験者に詳細フィードバックレポートを提供します。',
                    en: 'Results for Bronze/Silver within 2 weeks; Gold/Platinum within 4 weeks. Every examinee receives a detailed feedback report — pass or fail.',
                    de: 'Ergebnisse für Bronze/Silver binnen 2 Wochen, Gold/Platinum binnen 4 Wochen. Jede Person erhält einen ausführlichen Feedback-Bericht — unabhängig vom Bestehen.',
                  } as L6,
                },
                {
                  n: '4',
                  title: { ja: '認定 & 紹介', en: 'Certified & featured', de: 'Zertifiziert & vorgestellt' } as L6,
                  body: {
                    ja: '合格者は認定アーティストページに掲載、バッジを使用可能。月次の認定者限定イベント、出演機会の優先紹介が始まります。',
                    en: 'Certified artists are listed in the public directory with badge rights. Monthly members-only events and priority access to paid opportunities begin.',
                    de: 'Zertifizierte werden im öffentlichen Verzeichnis gelistet und dürfen das Abzeichen führen. Monatliche Mitglieder-Events und vorrangiger Zugang zu bezahlten Gelegenheiten beginnen.',
                  } as L6,
                },
              ].map((step, i) => (
                <div key={i} style={{
                  background: '#fff',
                  border: `1px solid ${LINE}`,
                  borderRadius: 12,
                  padding: 'clamp(20px, 2.4vw, 28px)',
                  position: 'relative',
                }}>
                  <div style={{
                    fontFamily: serif,
                    fontSize: 42,
                    fontWeight: 300,
                    color: ACCENT,
                    lineHeight: 1,
                    marginBottom: 14,
                    opacity: 0.6,
                  }}>{step.n}</div>
                  <h4 style={{
                    fontFamily: serif,
                    fontSize: 'clamp(16px, 2vw, 18px)',
                    fontWeight: 500,
                    margin: '0 0 10px',
                    color: DEEP,
                  }}>
                    {T6(step.title)}
                  </h4>
                  <p style={{
                    fontSize: 13,
                    lineHeight: 1.75,
                    color: MUTED,
                    margin: 0,
                  }}>
                    {T6(step.body)}
                  </p>
                </div>
              ))}
            </div>
          </Section>

          {/* ═══════════════ FOUNDER ═══════════════ */}
          <Section>
            <div style={{
              background: '#fff',
              border: `1px solid ${LINE}`,
              borderRadius: 16,
              padding: 'clamp(32px, 5vw, 64px)',
              maxWidth: 760,
              margin: '0 auto',
              textAlign: 'center',
            }}>
              <div style={{
                fontFamily: serif,
                fontSize: 48,
                color: ACCENT,
                lineHeight: 0.6,
                marginBottom: 16,
                opacity: 0.5,
              }}>&ldquo;</div>
              <p style={{
                fontFamily: serif,
                fontSize: 'clamp(16px, 2.2vw, 20px)',
                lineHeight: 2,
                color: DEEP,
                margin: '0 0 28px',
                fontStyle: 'italic',
                whiteSpace: 'pre-line',
              }}>
                {T6({
                  ja: '評価されないまま消えていく才能を、もう見たくない。\n言語も国境も履歴書も関係ない、演奏そのものへの独立した認定を。\nそれが Kuon Certification の設計思想です。',
                  en: 'I have seen too much talent disappear without recognition.\nCertification should be independent of language, borders, and résumés — attached only to the playing itself.\nThat is the philosophy behind Kuon Certification.',
                  de: 'Ich habe zu viel Talent verschwinden sehen, ohne dass es Anerkennung fand.\nZertifizierung sollte unabhängig von Sprache, Grenzen und Lebensläufen sein — ausschließlich am Spiel selbst ausgerichtet.\nDas ist der Leitgedanke der Kuon Certification.',
                })}
              </p>
              <div style={{
                fontSize: 14,
                color: MUTED,
                fontFamily: serif,
              }}>
                <Link href="/profile" style={{ color: ACCENT, textDecoration: 'none' }}>
                  {T6({ ja: '朝比奈 幸太郎', en: 'Kotaro Asahina', de: 'Kotaro Asahina' })}
                </Link>
                <div style={{ fontSize: 12, marginTop: 4, color: MUTED, fontFamily: sans }}>
                  {T6({
                    ja: '空音開発 創業者・音響エンジニア・音楽プロデューサー',
                    en: 'Founder, Kuon R&D · Audio engineer · Music producer',
                    de: 'Gründer, Kuon R&D · Tontechniker · Musikproduzent',
                  })}
                </div>
              </div>
            </div>
          </Section>

          {/* ═══════════════ FAQ ═══════════════ */}
          <Section id="faq">
            <h2 style={{
              fontFamily: serif,
              fontSize: 'clamp(26px, 4vw, 40px)',
              lineHeight: 1.35,
              fontWeight: 400,
              textAlign: 'center',
              margin: '0 0 48px',
              color: DEEP,
            }}>
              {T6({
                ja: 'よくあるご質問',
                en: 'Frequently asked questions',
                de: 'Häufig gestellte Fragen',
              })}
            </h2>

            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              {FAQ.map((f, i) => (
                <div key={i} className="faq-item" style={{
                  borderBottom: `1px solid ${LINE}`,
                  cursor: 'pointer',
                }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '24px 8px',
                  }}>
                    <h4 style={{
                      fontFamily: serif,
                      fontSize: 'clamp(15px, 1.9vw, 17px)',
                      fontWeight: 500,
                      margin: 0,
                      color: DEEP,
                      flex: 1,
                      paddingRight: 16,
                    }}>
                      {T6(f.q)}
                    </h4>
                    <span style={{
                      fontSize: 24,
                      color: ACCENT,
                      transition: 'transform .3s ease',
                      transform: openFaq === i ? 'rotate(45deg)' : 'none',
                      display: 'inline-block',
                      width: 24,
                      textAlign: 'center',
                    }}>+</span>
                  </div>
                  {openFaq === i && (
                    <div style={{
                      padding: '0 8px 24px',
                      fontSize: 14,
                      lineHeight: 1.9,
                      color: MUTED,
                    }}>
                      {T6(f.a)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>

          {/* ═══════════════ WAITLIST ═══════════════ */}
          <Section id="waitlist">
            <div style={{
              background: DEEP,
              borderRadius: 20,
              padding: 'clamp(36px, 6vw, 72px)',
              textAlign: 'center',
              color: '#fff',
              maxWidth: 720,
              margin: '0 auto',
            }}>
              <div style={{
                fontSize: 12,
                letterSpacing: '0.2em',
                color: ACCENT,
                marginBottom: 16,
              }}>
                {T6({ ja: '先行登録', en: 'EARLY ACCESS', de: 'FRÜHZUGANG' })}
              </div>
              <h2 style={{
                fontFamily: serif,
                fontSize: 'clamp(24px, 4vw, 36px)',
                lineHeight: 1.35,
                fontWeight: 400,
                margin: '0 0 20px',
                letterSpacing: '0.02em',
              }}>
                {T6({
                  ja: '最初の受験枠をお届けします。',
                  en: 'Reserve one of the first exam slots.',
                  de: 'Sichern Sie sich einen der ersten Prüfungsplätze.',
                })}
              </h2>
              <p style={{
                fontSize: 'clamp(13px, 1.6vw, 15px)',
                lineHeight: 1.85,
                color: '#cbd5e1',
                margin: '0 0 36px',
                maxWidth: 520,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}>
                {T6({
                  ja: 'ウェイトリスト登録者には、受験料の25%割引コードと、試験範囲の早期公開をお送りします。',
                  en: 'Waitlist members receive a 25% discount code for the first exam and early access to the full exam scope.',
                  de: 'Wartelistenmitglieder erhalten einen 25%-Rabattcode für die erste Prüfung sowie frühzeitigen Zugang zum Prüfungsinhalt.',
                })}
              </p>

              {submitted ? (
                <div style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: `1px solid ${ACCENT}`,
                  borderRadius: 12,
                  padding: 24,
                  color: '#fff',
                }}>
                  <div style={{ fontSize: 20, fontFamily: serif, marginBottom: 8 }}>
                    {T6({
                      ja: '登録ありがとうございました。',
                      en: 'Thank you for joining.',
                      de: 'Vielen Dank für Ihre Anmeldung.',
                    })}
                  </div>
                  <div style={{ fontSize: 13, color: '#cbd5e1' }}>
                    {T6({
                      ja: '詳細のご案内をメールでお送りします。',
                      en: 'We will email you with more details soon.',
                      de: 'Wir senden Ihnen in Kürze weitere Informationen per E-Mail.',
                    })}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480, margin: '0 auto' }}>
                  <input
                    type="hidden"
                    name="_subject"
                    value="Kuon Certification — Waitlist Signup"
                  />
                  <input
                    type="hidden"
                    name="source"
                    value="certification-waitlist"
                  />
                  <input
                    name="name"
                    type="text"
                    placeholder={T6({ ja: 'お名前', en: 'Your name', de: 'Ihr Name' })}
                    required
                    style={{
                      padding: '14px 18px',
                      borderRadius: 8,
                      border: `1px solid #334155`,
                      background: '#1e293b',
                      color: '#fff',
                      fontSize: 14,
                      fontFamily: sans,
                      outline: 'none',
                    }}
                  />
                  <input
                    name="email"
                    type="email"
                    placeholder={T6({ ja: 'メールアドレス', en: 'Email address', de: 'E-Mail-Adresse' })}
                    required
                    style={{
                      padding: '14px 18px',
                      borderRadius: 8,
                      border: `1px solid #334155`,
                      background: '#1e293b',
                      color: '#fff',
                      fontSize: 14,
                      fontFamily: sans,
                      outline: 'none',
                    }}
                  />
                  <select
                    name="instrument"
                    required
                    defaultValue=""
                    style={{
                      padding: '14px 18px',
                      borderRadius: 8,
                      border: `1px solid #334155`,
                      background: '#1e293b',
                      color: '#fff',
                      fontSize: 14,
                      fontFamily: sans,
                      outline: 'none',
                    }}
                  >
                    <option value="" disabled>
                      {T6({ ja: '楽器（ご専門）', en: 'Instrument / discipline', de: 'Instrument / Fachgebiet' })}
                    </option>
                    <option value="piano">{T6({ ja: 'ピアノ', en: 'Piano', de: 'Klavier' })}</option>
                    <option value="strings">{T6({ ja: '弦楽器', en: 'Strings', de: 'Streichinstrumente' })}</option>
                    <option value="winds">{T6({ ja: '木管楽器', en: 'Woodwinds', de: 'Holzbläser' })}</option>
                    <option value="brass">{T6({ ja: '金管楽器', en: 'Brass', de: 'Blechbläser' })}</option>
                    <option value="vocal">{T6({ ja: '声楽', en: 'Vocal', de: 'Gesang' })}</option>
                    <option value="composition">{T6({ ja: '作曲・編曲', en: 'Composition / arranging', de: 'Komposition / Arrangement' })}</option>
                    <option value="recording">{T6({ ja: '録音・ミキシング', en: 'Recording / mixing', de: 'Aufnahme / Mischung' })}</option>
                    <option value="other">{T6({ ja: 'その他', en: 'Other', de: 'Sonstiges' })}</option>
                  </select>
                  <select
                    name="targetTier"
                    required
                    defaultValue=""
                    style={{
                      padding: '14px 18px',
                      borderRadius: 8,
                      border: `1px solid #334155`,
                      background: '#1e293b',
                      color: '#fff',
                      fontSize: 14,
                      fontFamily: sans,
                      outline: 'none',
                    }}
                  >
                    <option value="" disabled>
                      {T6({ ja: '目指す段階', en: 'Target tier', de: 'Angestrebte Stufe' })}
                    </option>
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                    <option value="undecided">{T6({ ja: 'まだ決めていない', en: 'Not decided yet', de: 'Noch unentschieden' })}</option>
                  </select>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '16px 32px',
                      background: submitting ? '#475569' : ACCENT,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 15,
                      fontWeight: 600,
                      fontFamily: sans,
                      letterSpacing: '0.05em',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      marginTop: 8,
                    }}
                  >
                    {submitting
                      ? T6({ ja: '送信中...', en: 'Submitting...', de: 'Wird gesendet...' })
                      : T6({ ja: 'ウェイトリストに登録する', en: 'Join the waitlist', de: 'Der Warteliste beitreten' })}
                  </button>
                </form>
              )}
            </div>
          </Section>

          {/* ═══════════════ FOOTER LINK ═══════════════ */}
          <Section style={{ textAlign: 'center', marginBottom: 48 }}>
            <Link href="/" style={{
              fontSize: 13,
              color: MUTED,
              textDecoration: 'none',
              borderBottom: `1px solid ${LINE}`,
              paddingBottom: 2,
            }}>
              {T6({ ja: '← トップに戻る', en: '← Back to home', de: '← Zurück zur Startseite' })}
            </Link>
          </Section>

        </div>
      </main>
    </>
  );
}
