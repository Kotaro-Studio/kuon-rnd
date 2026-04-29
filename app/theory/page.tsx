'use client';

/**
 * /theory — Music Theory Suite Hub (Norton Critical Edition aesthetic)
 * =========================================================
 * 16 モジュールの総合目次。すべてのレッスンへの入口。
 *
 * 設計原則 (CLAUDE.md §47, §48, §49):
 *   - Norton Critical Edition / Casa BRUTUS / The Gentlewoman 風
 *   - Mincho 主体、Helvetica 補助
 *   - 章番号 (M0-M15) を明朝で控えめに
 *   - キャラクター・マスコット禁止
 *   - 「すごい」「Great」式の励まし禁止
 *   - 全レッスン固定 URL でいつでも復習可能
 *
 * MVP 段階 (2026-04-29 OMT v2 章順準拠に再番号化):
 *   - M0-01「五線と音名」(Kuon オリジナル M0)
 *   - M1-40「三和音の基本形と転回形」(OMT v2 Part I 第 17+19 章)
 *   - M4-01「カデンツの種類」(OMT v2 Part IV 第 1 章)
 *   - 他のレッスンは「準備中」表示
 *   - 診断テストはプレースホルダー (Phase 2)
 */

import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace';

const INK = '#1a1a1a';
const INK_SOFT = '#475569';
const INK_FAINT = '#94a3b8';
const PAPER = '#fafaf7';
const PAPER_DEEP = '#f5f4ed';
const STAFF_LINE = '#d4d0c4';
const ACCENT_INDIGO = '#3a3a5e';
const ACCENT_GOLD = '#9c7c3a';
const ACCENT_VINE = '#475569';

type L6 = { ja?: string; en: string; es?: string; ko?: string; pt?: string; de?: string };
const t = (m: L6, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

interface ModuleDef {
  id: string;
  num: string;
  title: L6;
  desc: L6;
  lessonCount: number;
  level: 'foundation' | 'intermediate' | 'advanced' | 'graduate';
  // MVP 段階で実際に入れるレッスン。
  // 2026-04-29 改修: 単純な string[] から { id, title } の配列にして、
  //                  ハブに各レッスンのタイトルを直接表示できるようにした。
  availableLessons?: { id: string; title: L6 }[];
}

const MODULES: ModuleDef[] = [
  {
    id: 'm0', num: 'M0',
    title: { ja: '音楽との最初の出会い', en: 'First Encounter with Music', es: 'Primer encuentro con la música', ko: '음악과의 첫 만남', pt: 'Primeiro encontro com a música', de: 'Erste Begegnung mit Musik' },
    desc: { ja: '譜面を読まずに音楽そのものに触れる入門。音とは何か・リズム・声・楽器・世界の音楽システム。', en: 'A pre-notational introduction. What sound is, rhythm, voice, instruments, world music systems — touch music itself before reading any staff.', es: 'Introducción pre-notacional. Qué es el sonido, ritmo, voz, instrumentos, sistemas musicales del mundo.', ko: '기보를 읽지 않고 음악 자체에 닿는 입문. 소리란 무엇인가·리듬·목소리·악기·세계 음악.', pt: 'Introdução pré-notacional. O que é o som, ritmo, voz, instrumentos, sistemas musicais do mundo.', de: 'Vornotationale Einführung. Was Klang ist, Rhythmus, Stimme, Instrumente, Weltmusiksysteme.' },
    lessonCount: 15, level: 'foundation',
    availableLessons: [
      { id: 'l01', title: { ja: '音とは何か', en: 'What is Sound?', es: '¿Qué es el sonido?', ko: '소리란 무엇인가', pt: 'O que é o som?', de: 'Was ist Klang?' } },
    ],
  },
  {
    id: 'm1', num: 'M1',
    title: { ja: '楽典基礎', en: 'Fundamentals', es: 'Fundamentos', ko: '악전 기초', pt: 'Fundamentos', de: 'Grundlagen' },
    desc: { ja: '記譜法・音程・音階・三和音・七の和音・ローマ数字・SATB・テクスチャ', en: 'Notation, intervals, scales, triads, seventh chords, Roman numerals, SATB, texture.', es: 'Notación, intervalos, escalas, tríadas, séptimas, cifrado romano, SATB.', ko: '기보법·음정·음계·삼화음·칠화음·로마숫자·SATB.', pt: 'Notação, intervalos, escalas, tríades, sétimas, cifras romanas, SATB.', de: 'Notation, Intervalle, Skalen, Dreiklänge, Septakkorde, Stufenanalyse, Vierstimmigkeit.' },
    lessonCount: 60, level: 'foundation',
    availableLessons: [
      { id: 'l01', title: { ja: '西洋音楽記譜法の導入', en: 'Introduction to Western Notation', es: 'Introducción a la notación', ko: '서양 기보법의 도입', pt: 'Introdução à notação', de: 'Einführung in die Notation' } },
      { id: 'l02', title: { ja: '音符の記譜と五線', en: 'Notation of Notes and the Staff', es: 'Notación de las notas y el pentagrama', ko: '음표의 기보와 오선', pt: 'Notação das notas e a pauta', de: 'Notenschrift und das System' } },
      { id: 'l40', title: { ja: '三和音の基本形と転回形', en: 'Triads in Root Position and Inversions', es: 'La tríada y sus inversiones', ko: '삼화음의 기본형과 전회', pt: 'A tríade e suas inversões', de: 'Dreiklänge in Grundstellung und Umkehrungen' } },
    ],
  },
  {
    id: 'm2', num: 'M2',
    title: { ja: '対位法とガラント様式', en: 'Counterpoint & Galant Schemas', es: 'Contrapunto y esquemas galantes', ko: '대위법과 갈란트 양식', pt: 'Contraponto e esquemas galantes', de: 'Kontrapunkt & Galante Schemata' },
    desc: { ja: '1-5 種対位法・16 世紀様式・フーガ・グランドベース', en: 'Species 1-5, 16th-century style, fugue, ground bass.', es: 'Especies 1-5, estilo del s. XVI, fuga, bajo continuo.', ko: '1-5종 대위법·16세기 양식·푸가.', pt: 'Espécies 1-5, estilo do séc. XVI, fuga.', de: 'Spezies 1-5, 16.-Jh.-Stil, Fuge, Grundbass.' },
    lessonCount: 35, level: 'intermediate',
  },
  {
    id: 'm3', num: 'M3',
    title: { ja: '楽式論', en: 'Form', es: 'Forma musical', ko: '악곡 형식', pt: 'Forma musical', de: 'Formenlehre' },
    desc: { ja: '楽句・ピリオド・二部・三部・ソナタ・ロンド形式', en: 'Phrases, periods, binary, ternary, sonata, rondo.', es: 'Frases, períodos, binaria, ternaria, sonata, rondó.', ko: '악구·이부·삼부·소나타·론도.', pt: 'Frases, períodos, binária, ternária, sonata, rondó.', de: 'Phrasen, Perioden, Sonate, Rondo.' },
    lessonCount: 25, level: 'intermediate',
  },
  {
    id: 'm4', num: 'M4',
    title: { ja: '機能和声', en: 'Diatonic Harmony', es: 'Armonía diatónica', ko: '기능 화성', pt: 'Harmonia diatônica', de: 'Diatonische Harmonik' },
    desc: { ja: 'カデンツ・V7・属前和音・装飾音・トニカイゼーション・転調', en: 'Cadences, V7, predominants, embellishing tones, tonicization, modulation.', es: 'Cadencias, V7, predominantes, ornamentos, tonicización, modulación.', ko: '카덴츠·V7·속전화음·장식음·전조.', pt: 'Cadências, V7, predominantes, ornamentos, tonicização.', de: 'Kadenzen, V7, Subdominanten, Verzierungen, Modulation.' },
    lessonCount: 55, level: 'intermediate',
    availableLessons: [
      { id: 'l01', title: { ja: 'カデンツの種類', en: 'Types of Cadence', es: 'Tipos de cadencia', ko: '카덴츠의 종류', pt: 'Tipos de cadência', de: 'Arten der Kadenz' } },
    ], // OMT v2 Part IV 第 1 章 (Cadences intro)
  },
  {
    id: 'm5', num: 'M5',
    title: { ja: '半音階法', en: 'Chromaticism', es: 'Cromatismo', ko: '반음계법', pt: 'Cromatismo', de: 'Chromatik' },
    desc: { ja: 'モーダルミクスチャ・ナポリ・増六・共通音・ネオ・リーマン', en: 'Modal mixture, Neapolitan, augmented sixths, common-tone, neo-Riemannian.', es: 'Mezcla modal, napolitana, sextas aumentadas, neo-riemanniano.', ko: '모달 믹스처·나폴리탄·신리만.', pt: 'Mistura modal, napolitana, sextas aumentadas.', de: 'Modale Mischung, Neapolitaner, neoriemannianisch.' },
    lessonCount: 35, level: 'advanced',
  },
  {
    id: 'm6', num: 'M6',
    title: { ja: 'ジャズ理論', en: 'Jazz', es: 'Jazz', ko: '재즈 이론', pt: 'Jazz', de: 'Jazz' },
    desc: { ja: 'スウィング・ヴォイシング・ii-V-I・コード・スケール・ブルース', en: 'Swing, voicings, ii-V-I, chord-scales, blues.', es: 'Swing, voicings, ii-V-I, escalas-acorde, blues.', ko: '스윙·보이싱·ii-V-I·블루스.', pt: 'Swing, voicings, ii-V-I, blues.', de: 'Swing, Voicings, ii-V-I, Bluestonleiter.' },
    lessonCount: 35, level: 'advanced',
  },
  {
    id: 'm7', num: 'M7',
    title: { ja: 'ポピュラー音楽理論', en: 'Popular Music', es: 'Música popular', ko: '팝 음악 이론', pt: 'Música popular', de: 'Popmusik' },
    desc: { ja: 'ポップ和声スキーマ・Doo-wop・AABA・Verse-Chorus', en: 'Pop schemas, doo-wop, AABA, verse-chorus, modal.', es: 'Esquemas pop, doo-wop, AABA, modal.', ko: '팝 화성·두왑·AABA.', pt: 'Esquemas pop, doo-wop, AABA, modal.', de: 'Pop-Harmonik, Doo-Wop, AABA, modal.' },
    lessonCount: 30, level: 'advanced',
  },
  {
    id: 'm8', num: 'M8',
    title: { ja: '20-21 世紀の技法', en: '20th/21st Century', es: 'Técnicas s. XX-XXI', ko: '20-21세기 기법', pt: 'Técnicas séc. XX-XXI', de: 'Techniken 20./21. Jh.' },
    desc: { ja: 'ピッチクラス集合論・整数表記・Forte 番号・教会旋法', en: 'Pitch-class set theory, integer notation, Forte numbers, church modes.', es: 'Teoría de conjuntos, notación entera, modos eclesiásticos.', ko: '피치 클래스 집합론·교회 선법.', pt: 'Teoria de conjuntos, modos eclesiásticos.', de: 'Tonklassenmengen, Forte-Nummern, Kirchentonarten.' },
    lessonCount: 25, level: 'graduate',
  },
  {
    id: 'm9', num: 'M9',
    title: { ja: '12 音音楽', en: 'Twelve-Tone', es: 'Dodecafonía', ko: '12음 기법', pt: 'Dodecafonia', de: 'Zwölftonmusik' },
    desc: { ja: '12 音技法・行操作・マトリックス・ヴェーベルン分析', en: 'Twelve-tone, row operations, matrices, Webern analysis.', es: 'Dodecafonismo, operaciones de serie, Webern.', ko: '12음·매트릭스·베베른.', pt: 'Dodecafonia, matrizes, Webern.', de: 'Zwölftontechnik, Matrizen, Webern.' },
    lessonCount: 18, level: 'graduate',
  },
  {
    id: 'm10', num: 'M10',
    title: { ja: 'オーケストレーション', en: 'Orchestration', es: 'Orquestación', ko: '오케스트레이션', pt: 'Orquestração', de: 'Orchestration' },
    desc: { ja: 'オーケストレーションの核心原則・音色変化・ピアノからの編曲', en: 'Core orchestration principles, timbral change, arranging from piano.', es: 'Principios de orquestación, arreglo desde piano.', ko: '오케스트레이션 핵심·피아노 편곡.', pt: 'Princípios de orquestração, arranjo do piano.', de: 'Orchestrierung Kernprinzipien, Klavierübertragung.' },
    lessonCount: 15, level: 'advanced',
  },
  {
    id: 'm11', num: 'M11',
    title: { ja: 'コールユーブンゲンと聴音', en: 'Coleübungen & Ear Training', es: 'Coleübungen y entrenamiento auditivo', ko: '콜러뷔붕겐과 청음', pt: 'Coleübungen e percepção', de: 'Coleübungen & Gehörbildung' },
    desc: { ja: 'コールユーブンゲン全 87 番完全インタラクティブ化・聴音・内的聴覚訓練', en: 'All 87 Coleübungen interactively. Dictation, inner hearing.', es: 'Las 87 Coleübungen interactivas, dictado, audición interna.', ko: '콜러뷔붕겐 전 87번·청음·내적 청각.', pt: 'As 87 Coleübungen interativas, ditado, audição interna.', de: 'Alle 87 Coleübungen interaktiv, Diktat.' },
    lessonCount: 90, level: 'foundation',
  },
  {
    id: 'm12', num: 'M12',
    title: { ja: 'ソルフェージュと視唱', en: 'Solfège & Sight Singing', es: 'Solfeo y lectura cantada', ko: '솔페지오와 시창', pt: 'Solfejo e leitura cantada', de: 'Solfège & Blattsingen' },
    desc: { ja: '階名唱法 (移動ド・固定ド両対応)・Pozzoli・Bona・コダーイ', en: 'Solfège (movable & fixed do). Pozzoli, Bona, Hindemith, Kodály.', es: 'Solfeo (do móvil y fijo). Pozzoli, Kodály.', ko: '솔페지오 (이동도·고정도). 포졸리·코다이.', pt: 'Solfejo (dó móvel e fixo). Pozzoli, Kodály.', de: 'Solmisation (bewegliches/festes do). Pozzoli, Kodály.' },
    lessonCount: 70, level: 'intermediate',
  },
  {
    id: 'm13', num: 'M13',
    title: { ja: '音楽史と様式', en: 'Music History', es: 'Historia musical', ko: '음악사', pt: 'História musical', de: 'Musikgeschichte' },
    desc: { ja: 'スタイル時代・主要作曲家・演奏実践・楽器史・記譜法進化', en: 'Style periods, composers, historical performance practice.', es: 'Períodos estilísticos, compositores, práctica histórica.', ko: '시대 양식·주요 작곡가·역사적 연주.', pt: 'Períodos, compositores, prática histórica.', de: 'Stilepochen, Komponisten, historische Aufführungspraxis.' },
    lessonCount: 20, level: 'advanced',
  },
  {
    id: 'm14', num: 'M14',
    title: { ja: '上級理論', en: 'Advanced Theory', es: 'Teoría avanzada', ko: '고급 이론', pt: 'Teoria avançada', de: 'Vertiefte Theorie' },
    desc: { ja: 'シェンカー分析・Caplin 形式機能・Riemann 機能和声・微分音', en: 'Schenkerian analysis, Caplin formal functions, Riemannian, microtonality.', es: 'Schenker, Caplin, Riemann, microtonalidad.', ko: '쉔커·카플린·미분음.', pt: 'Schenker, Caplin, Riemann, microtonalidade.', de: 'Schenker, Caplin, Riemann, Mikrotonalität.' },
    lessonCount: 30, level: 'graduate',
  },
  {
    id: 'm15', num: 'M15',
    title: { ja: '作曲実技', en: 'Composition Practice', es: 'Composición', ko: '작곡 실기', pt: 'Composição', de: 'Kompositorische Praxis' },
    desc: { ja: '4 声体コラール・弦楽四重奏・リート・ピアノ小品・編曲', en: '4-part chorale, string quartet, art song, piano miniature.', es: 'Coral a 4 voces, cuarteto, lied, miniatura.', ko: '4성부 코랄·현악 사중주·리트·소품.', pt: 'Coral a 4 vozes, quarteto, lied, miniatura.', de: 'Vierstimmiger Choral, Streichquartett, Lied.' },
    lessonCount: 25, level: 'graduate',
  },
];

const TOTAL_LESSONS = MODULES.reduce((sum, m) => sum + m.lessonCount, 0);
const AVAILABLE_LESSONS = MODULES.reduce((sum, m) => sum + (m.availableLessons?.length ?? 0), 0);

// ─────────────────────────────────────────
// メインページ
// ─────────────────────────────────────────
export default function TheoryHubPage() {
  const { lang } = useLang();

  return (
    <div style={{ background: PAPER, minHeight: '100vh', color: INK }}>

      {/* ═══════ HUB HEADER ═══════ */}
      <header style={{
        padding: 'clamp(3rem, 7vw, 5.5rem) clamp(1.5rem, 4vw, 3rem) clamp(2rem, 4vw, 3rem)',
        maxWidth: 1100,
        margin: '0 auto',
      }}>
        <div style={{
          fontFamily: mono,
          fontSize: '0.7rem',
          color: INK_FAINT,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          marginBottom: '1rem',
        }}>
          KUON · Music Theory Suite
        </div>
        <h1 style={{
          fontFamily: serif,
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 400,
          letterSpacing: '0.04em',
          lineHeight: 1.4,
          margin: 0,
          color: INK,
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: '音楽理論の、目次。',
            en: 'A table of contents for music theory.',
            es: 'Un índice de la teoría musical.',
            ko: '음악 이론의 목차.',
            pt: 'Um índice da teoria musical.',
            de: 'Ein Inhaltsverzeichnis der Musiktheorie.',
          }, lang)}
        </h1>
        <p style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)',
          color: INK_SOFT,
          lineHeight: 2,
          marginTop: '1.4rem',
          maxWidth: 720,
          letterSpacing: '0.02em',
        }}>
          {t({
            ja: '16 のモジュール、553 のレッスン。譜表の最初の一線から、シェンカー分析まで。あなたが今いる場所から、自由に始め、自由に進めます。',
            en: '16 modules, 553 lessons. From the first line of the staff to Schenkerian analysis. Begin where you are. Move at your own pace.',
            es: '16 módulos, 553 lecciones. Desde la primera línea del pentagrama hasta Schenker. Comienza donde estés.',
            ko: '16 모듈, 553 레슨. 오선의 첫 줄부터 쉔커 분석까지. 지금 있는 곳에서 자유롭게 시작하세요.',
            pt: '16 módulos, 553 lições. Da primeira linha da pauta à análise Schenker. Comece de onde está.',
            de: '16 Module, 553 Lektionen. Von der ersten Notenlinie bis zur Schenker-Analyse. Beginnen Sie, wo Sie stehen.',
          }, lang)}
        </p>
      </header>

      {/* ═══════ STATUS BAR (MVP 進捗) ═══════ */}
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 clamp(1.5rem, 4vw, 3rem)',
        marginBottom: 'clamp(2rem, 5vw, 4rem)',
      }}>
        <div style={{
          background: '#fff',
          border: `1px solid ${STAFF_LINE}`,
          borderRadius: 4,
          padding: 'clamp(1.4rem, 3vw, 2rem)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'clamp(1.2rem, 2.5vw, 2rem)',
        }}>
          <StatusItem
            label={t({ ja: '本日のおすすめ', en: 'Today', es: 'Hoy', ko: '오늘', pt: 'Hoje', de: 'Heute' }, lang)}
            value={t({
              ja: 'M0-01 五線と音名',
              en: 'M0-01 Staff and Pitch Names',
              es: 'M0-01 Pentagrama y notas',
              ko: 'M0-01 오선과 음이름',
              pt: 'M0-01 Pauta e notas',
              de: 'M0-01 Notensystem & Tonnamen',
            }, lang)}
            href="/theory/m0/l01"
            cta
          />
          <StatusItem
            label={t({ ja: '診断テスト', en: 'Diagnostic test', es: 'Diagnóstico', ko: '진단 테스트', pt: 'Diagnóstico', de: 'Einstufungstest' }, lang)}
            value={t({ ja: '準備中', en: 'Coming soon', es: 'Próximamente', ko: '준비 중', pt: 'Em breve', de: 'Bald verfügbar' }, lang)}
            disabled
          />
          <StatusItem
            label={t({ ja: '復習待ち (SRS)', en: 'Review due (SRS)', es: 'Repaso pendiente', ko: '복습 대기', pt: 'Revisão pendente', de: 'Wiederholung' }, lang)}
            value="0"
            unit={t({ ja: '枚', en: 'cards', es: 'tarjetas', ko: '장', pt: 'cartões', de: 'Karten' }, lang)}
          />
          <StatusItem
            label={t({ ja: '公開済みレッスン', en: 'Lessons available', es: 'Lecciones disponibles', ko: '공개 레슨', pt: 'Lições disponíveis', de: 'Verfügbare Lektionen' }, lang)}
            value={`${AVAILABLE_LESSONS} / ${TOTAL_LESSONS}`}
          />
        </div>
      </div>

      {/* ═══════ TABLE OF CONTENTS — 16 MODULES ═══════ */}
      <main style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: 'clamp(1rem, 3vw, 2rem) clamp(1.5rem, 4vw, 3rem) clamp(4rem, 8vw, 6rem)',
      }}>
        {/* Foundation */}
        <ModuleGroup
          label={t({ ja: '基礎', en: 'Foundation', es: 'Fundamento', ko: '기초', pt: 'Fundamento', de: 'Grundlage' }, lang)}
          color={ACCENT_INDIGO}
        >
          {MODULES.filter(m => m.level === 'foundation').map(m => (
            <ModuleCard key={m.id} module={m} lang={lang} />
          ))}
        </ModuleGroup>

        {/* Intermediate */}
        <ModuleGroup
          label={t({ ja: '中級', en: 'Intermediate', es: 'Intermedio', ko: '중급', pt: 'Intermediário', de: 'Mittelstufe' }, lang)}
          color={ACCENT_VINE}
        >
          {MODULES.filter(m => m.level === 'intermediate').map(m => (
            <ModuleCard key={m.id} module={m} lang={lang} />
          ))}
        </ModuleGroup>

        {/* Advanced */}
        <ModuleGroup
          label={t({ ja: '上級', en: 'Advanced', es: 'Avanzado', ko: '고급', pt: 'Avançado', de: 'Fortgeschritten' }, lang)}
          color={ACCENT_GOLD}
        >
          {MODULES.filter(m => m.level === 'advanced').map(m => (
            <ModuleCard key={m.id} module={m} lang={lang} />
          ))}
        </ModuleGroup>

        {/* Graduate */}
        <ModuleGroup
          label={t({ ja: '大学院', en: 'Graduate', es: 'Posgrado', ko: '대학원', pt: 'Pós-graduação', de: 'Hochschulstufe' }, lang)}
          color={INK}
        >
          {MODULES.filter(m => m.level === 'graduate').map(m => (
            <ModuleCard key={m.id} module={m} lang={lang} />
          ))}
        </ModuleGroup>

        {/* Footer note */}
        <div style={{
          marginTop: 'clamp(4rem, 8vw, 6rem)',
          paddingTop: 'clamp(2rem, 4vw, 3rem)',
          borderTop: `1px solid ${STAFF_LINE}`,
          textAlign: 'center' as const,
        }}>
          <p style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: '0.9rem',
            color: INK_FAINT,
            lineHeight: 1.85,
            margin: 0,
            maxWidth: 600,
            marginLeft: 'auto',
            marginRight: 'auto',
            letterSpacing: '0.02em',
            wordBreak: 'keep-all' as const,
          }}>
            {t({
              ja: 'Open Music Theory v2 (Cambridge / GMU 等 7 名共著・CC BY-SA 4.0) を骨格とし、空音開発が独自の M0・M11・M12・M13・M15 を加えて完成させた構成です。',
              en: 'Built on Open Music Theory v2 (CC BY-SA 4.0, by faculty at Cambridge, GMU, and 5 others), with proprietary modules M0, M11, M12, M13, M15 added by Kuon R&D.',
              es: 'Sobre Open Music Theory v2 (CC BY-SA 4.0), con módulos M0, M11, M12, M13, M15 añadidos por Kuon R&D.',
              ko: 'Open Music Theory v2 (CC BY-SA 4.0) 를 기반으로, 공음개발이 M0·M11·M12·M13·M15 를 추가.',
              pt: 'Baseado em Open Music Theory v2 (CC BY-SA 4.0), com módulos M0, M11, M12, M13, M15 acrescentados pela Kuon R&D.',
              de: 'Auf Basis von Open Music Theory v2 (CC BY-SA 4.0), mit Modulen M0, M11, M12, M13, M15 von Kuon R&D ergänzt.',
            }, lang)}
          </p>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────
// サブコンポーネント
// ─────────────────────────────────────────
function StatusItem({
  label, value, unit, href, cta, disabled,
}: { label: string; value: string; unit?: string; href?: string; cta?: boolean; disabled?: boolean }) {
  const inner = (
    <div style={{ opacity: disabled ? 0.45 : 1 }}>
      <div style={{
        fontFamily: sans,
        fontSize: '0.66rem',
        color: INK_FAINT,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        marginBottom: '0.55rem',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontFamily: serif,
          fontSize: 'clamp(1rem, 1.7vw, 1.15rem)',
          fontWeight: 400,
          color: cta ? ACCENT_INDIGO : INK,
          letterSpacing: '0.02em',
          lineHeight: 1.4,
          wordBreak: 'keep-all' as const,
        }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontFamily: sans, fontSize: '0.72rem', color: INK_FAINT, letterSpacing: '0.04em' }}>
            {unit}
          </span>
        )}
      </div>
      {cta && (
        <div style={{
          fontFamily: sans,
          fontSize: '0.7rem',
          color: ACCENT_INDIGO,
          marginTop: '0.6rem',
          letterSpacing: '0.04em',
        }}>
          →
        </div>
      )}
    </div>
  );
  if (href && !disabled) {
    return (
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
        {inner}
      </Link>
    );
  }
  return inner;
}

function ModuleGroup({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '1rem',
        marginBottom: 'clamp(1.2rem, 2.5vw, 1.8rem)',
        paddingBottom: '0.7rem',
        borderBottom: `1px solid ${STAFF_LINE}`,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color, display: 'inline-block', flexShrink: 0,
        }} />
        <h2 style={{
          fontFamily: sans,
          fontSize: '0.78rem',
          fontWeight: 600,
          color: INK_SOFT,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          margin: 0,
        }}>
          {label}
        </h2>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: 'clamp(1rem, 2vw, 1.4rem)',
      }}>
        {children}
      </div>
    </section>
  );
}

function ModuleCard({ module: m, lang }: { module: ModuleDef; lang: Lang }) {
  // 2026-04-29 改修: ハブで個別レッスンへ直接アクセスできるようリスト表示。
  // ネストしたリンクは無効なので、外側の article は <article> に保ち、
  // 内側の各レッスンを <Link> にする。
  const lessons = m.availableLessons ?? [];
  const isAvailable = lessons.length > 0;

  return (
    <article style={{
      background: '#fff',
      border: `1px solid ${STAFF_LINE}`,
      borderRadius: 4,
      padding: 'clamp(1.4rem, 2.5vw, 1.8rem)',
      transition: 'border-color 0.3s ease',
      opacity: isAvailable ? 1 : 0.78,
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.9rem' }}>
        <span style={{
          fontFamily: serif,
          fontSize: 'clamp(1.6rem, 3vw, 2rem)',
          fontWeight: 400,
          color: INK,
          letterSpacing: '0.05em',
          lineHeight: 1,
        }}>
          {m.num}
        </span>
        <span style={{
          fontFamily: sans,
          fontSize: '0.66rem',
          color: INK_FAINT,
          letterSpacing: '0.1em',
        }}>
          {m.lessonCount} {t({ ja: 'レッスン', en: 'lessons', es: 'lecciones', ko: '레슨', pt: 'lições', de: 'Lektionen' }, lang)}
        </span>
      </div>
      <h3 style={{
        fontFamily: serif,
        fontSize: 'clamp(1.05rem, 1.8vw, 1.2rem)',
        fontWeight: 500,
        color: INK,
        margin: '0 0 0.7rem 0',
        letterSpacing: '0.03em',
        lineHeight: 1.4,
        wordBreak: 'keep-all' as const,
      }}>
        {t(m.title, lang)}
      </h3>
      <p style={{
        fontFamily: sans,
        fontSize: '0.85rem',
        color: INK_SOFT,
        lineHeight: 1.7,
        margin: 0,
        flex: 1,
        letterSpacing: '0.01em',
      }}>
        {t(m.desc, lang)}
      </p>

      {/* 公開済みレッスンリスト (各々独立した Link) */}
      <div style={{
        marginTop: 'clamp(1rem, 2vw, 1.4rem)',
        paddingTop: '0.85rem',
        borderTop: `1px solid ${STAFF_LINE}`,
      }}>
        {isAvailable ? (
          <>
            <div style={{
              fontFamily: sans,
              fontSize: '0.65rem',
              color: INK_FAINT,
              letterSpacing: '0.14em',
              textTransform: 'uppercase' as const,
              marginBottom: '0.6rem',
            }}>
              {t({
                ja: `公開済み (${lessons.length})`,
                en: `Available (${lessons.length})`,
                es: `Disponibles (${lessons.length})`,
                ko: `공개 (${lessons.length})`,
                pt: `Disponíveis (${lessons.length})`,
                de: `Verfügbar (${lessons.length})`,
              }, lang)}
            </div>
            <ul style={{
              listStyle: 'none' as const,
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column' as const,
              gap: '0.35rem',
            }}>
              {lessons.map(lesson => (
                <li key={lesson.id}>
                  <Link
                    href={`/theory/${m.id}/${lesson.id}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center' as const,
                      textDecoration: 'none',
                      color: INK,
                      padding: '0.45rem 0.6rem',
                      borderRadius: 3,
                      fontFamily: serif,
                      fontSize: 'clamp(0.85rem, 1.4vw, 0.95rem)',
                      letterSpacing: '0.02em',
                      lineHeight: 1.45,
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = STAFF_LINE; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <span style={{
                      display: 'flex',
                      alignItems: 'baseline' as const,
                      gap: '0.6rem',
                      flex: 1,
                      minWidth: 0,
                      wordBreak: 'keep-all' as const,
                    }}>
                      <span style={{
                        fontFamily: mono,
                        fontSize: '0.7rem',
                        color: ACCENT_GOLD,
                        letterSpacing: '0.06em',
                        flexShrink: 0,
                        textTransform: 'uppercase' as const,
                      }}>
                        {lesson.id}
                      </span>
                      <span>{t(lesson.title, lang)}</span>
                    </span>
                    <span style={{ color: INK_FAINT, fontSize: '0.85em', marginLeft: '0.5rem', flexShrink: 0 }}>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <span style={{
            fontFamily: sans,
            fontSize: '0.72rem',
            color: INK_FAINT,
            fontStyle: 'italic' as const,
            letterSpacing: '0.05em',
          }}>
            {t({
              ja: '準備中',
              en: 'In preparation',
              es: 'En preparación',
              ko: '준비 중',
              pt: 'Em preparação',
              de: 'In Vorbereitung',
            }, lang)}
          </span>
        )}
      </div>
    </article>
  );
}
