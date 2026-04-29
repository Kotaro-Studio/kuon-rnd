'use client';

/**
 * KUON Music Theory Suite — Landing Page
 * =========================================================
 * 世界最高峰の音楽理論オンライン学習プラットフォーム
 * (CLAUDE.md §46-§48 準拠)
 *
 * 設計原則 (余白の知性):
 *   - Shippori Mincho を主見出し、Helvetica Neue を本文・データ
 *   - キャラクター・マスコット禁止
 *   - 「すごい！」「Awesome!」禁止
 *   - 100 年前の音楽書籍の威厳 + Swiss モダニズムの理性
 *   - プロ志望の大人音楽家への敬意を最優先
 *
 * 構成 (12 セクション):
 *   1. Hero
 *   2. Trust bar (16 modules / 553 lessons / 6 languages / OMT v2)
 *   3. The empty market (problem)
 *   4. Curriculum showcase (16 modules grid)
 *   5. IQ180 features (8 differentiators)
 *   6. OMT v2 academic credibility
 *   7. For whom (6 personas)
 *   8. 余白の知性 aesthetic statement
 *   9. Pricing reference
 *  10. FAQ
 *  11. Founder's note
 *  12. Final CTA (受講する・準備中)
 */

import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", monospace';

// ─── 色彩 (余白の知性パレット) ───
const INK = '#1a1a1a';        // 墨
const INK_SOFT = '#475569';
const INK_FAINT = '#94a3b8';
const PAPER = '#fafaf7';       // 和紙
const PAPER_DEEP = '#f5f4ed';
const STAFF_LINE = '#d4d0c4';
const ACCENT_INDIGO = '#3a3a5e'; // 藍墨
const ACCENT_GOLD = '#9c7c3a';   // 茶金
const ACCENT_VINE = '#475569';

type L6 = { ja?: string; en: string; es?: string; ko?: string; pt?: string; de?: string };
const t = (m: L6, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

// ─────────────────────────────────────────
// 16 モジュール定義 (CLAUDE.md §47.2)
// ─────────────────────────────────────────
interface ModuleDef {
  id: string;
  num: string;
  title: L6;
  desc: L6;
  lessonCount: number;
  level: 'foundation' | 'intermediate' | 'advanced' | 'graduate';
}

const MODULES: ModuleDef[] = [
  {
    id: 'm0', num: 'M0',
    title: { ja: '音楽との最初の出会い', en: 'First Encounter with Music', es: 'Primer encuentro con la música', ko: '음악과의 첫 만남', pt: 'Primeiro encontro com a música', de: 'Erste Begegnung mit Musik' },
    desc: { ja: '完全初心者向け導入。譜表・音名・拍子記号・基本リズムまで。', en: 'For absolute beginners. Staff, pitch names, time signatures, basic rhythm.', es: 'Para principiantes absolutos. Pentagrama, notas, compases, ritmo básico.', ko: '완전 초급자용. 오선·음이름·박자기호·기본 리듬.', pt: 'Para iniciantes absolutos. Pauta, notas, compassos, ritmo básico.', de: 'Für absolute Anfänger. Notensystem, Tonnamen, Taktarten, Grundrhythmen.' },
    lessonCount: 15, level: 'foundation',
  },
  {
    id: 'm1', num: 'M1',
    title: { ja: '楽典基礎', en: 'Fundamentals', es: 'Fundamentos', ko: '악전 기초', pt: 'Fundamentos', de: 'Grundlagen' },
    desc: { ja: '記譜法・音程・音階・三和音・七の和音・ローマ数字・SATB・テクスチャ', en: 'Notation, intervals, scales, triads, seventh chords, Roman numerals, SATB, texture.', es: 'Notación, intervalos, escalas, tríadas, séptimas, cifrado romano, SATB.', ko: '기보법·음정·음계·삼화음·칠화음·로마숫자·SATB.', pt: 'Notação, intervalos, escalas, tríades, sétimas, cifras romanas, SATB.', de: 'Notation, Intervalle, Skalen, Dreiklänge, Septakkorde, Stufenanalyse, Vierstimmigkeit.' },
    lessonCount: 60, level: 'foundation',
  },
  {
    id: 'm2', num: 'M2',
    title: { ja: '対位法とガラント様式', en: 'Counterpoint & Galant Schemas', es: 'Contrapunto y esquemas galantes', ko: '대위법과 갈란트 양식', pt: 'Contraponto e esquemas galantes', de: 'Kontrapunkt & Galante Schemata' },
    desc: { ja: '1-5 種対位法・16 世紀様式・フーガ・グランドベース・ガラント様式', en: 'Species 1-5, 16th-century style, fugue, ground bass, galant schemata.', es: 'Especies 1-5, estilo del s. XVI, fuga, bajo continuo, galante.', ko: '1-5종 대위법·16세기 양식·푸가·그라운드 베이스.', pt: 'Espécies 1-5, estilo do séc. XVI, fuga, baixo contínuo, galante.', de: 'Spezies 1-5, 16.-Jh.-Stil, Fuge, Grundbass, galante Schemata.' },
    lessonCount: 35, level: 'intermediate',
  },
  {
    id: 'm3', num: 'M3',
    title: { ja: '楽式論', en: 'Form', es: 'Forma musical', ko: '악곡 형식', pt: 'Forma musical', de: 'Formenlehre' },
    desc: { ja: '楽句・ピリオド・二部・三部・ソナタ・ロンド形式', en: 'Phrases, periods, binary, ternary, sonata, rondo.', es: 'Frases, períodos, binaria, ternaria, sonata, rondó.', ko: '악구·피리어드·이부·삼부·소나타·론도.', pt: 'Frases, períodos, binária, ternária, sonata, rondó.', de: 'Phrasen, Perioden, zweiteilig, dreiteilig, Sonate, Rondo.' },
    lessonCount: 25, level: 'intermediate',
  },
  {
    id: 'm4', num: 'M4',
    title: { ja: '機能和声', en: 'Diatonic Harmony', es: 'Armonía diatónica', ko: '기능 화성', pt: 'Harmonia diatônica', de: 'Diatonische Harmonik' },
    desc: { ja: 'カデンツ・V7・属前和音・装飾音・トニカイゼーション・転調', en: 'Cadences, V7, predominants, embellishing tones, tonicization, modulation.', es: 'Cadencias, V7, predominantes, notas de adorno, tonicización, modulación.', ko: '카덴츠·V7·속전화음·장식음·토니카이제이션·전조.', pt: 'Cadências, V7, predominantes, ornamentos, tonicização, modulação.', de: 'Kadenzen, V7, Subdominanten, Verzierungen, Tonikalisierung, Modulation.' },
    lessonCount: 55, level: 'intermediate',
  },
  {
    id: 'm5', num: 'M5',
    title: { ja: '半音階法', en: 'Chromaticism', es: 'Cromatismo', ko: '반음계법', pt: 'Cromatismo', de: 'Chromatik' },
    desc: { ja: 'モーダルミクスチャ・ナポリ・増六・共通音・半音的シーケンス・ネオ・リーマン', en: 'Modal mixture, Neapolitan, augmented sixths, common-tone, neo-Riemannian.', es: 'Mezcla modal, napolitana, sextas aumentadas, neo-riemanniano.', ko: '모달 믹스처·나폴리탄·증6·공통음·신리만.', pt: 'Mistura modal, napolitana, sextas aumentadas, neo-riemanniana.', de: 'Modale Mischung, Neapolitaner, übermäßige Sextakkorde, neoriemannianisch.' },
    lessonCount: 35, level: 'advanced',
  },
  {
    id: 'm6', num: 'M6',
    title: { ja: 'ジャズ理論', en: 'Jazz', es: 'Jazz', ko: '재즈 이론', pt: 'Jazz', de: 'Jazz' },
    desc: { ja: 'スウィング・コードシンボル・ヴォイシング・ii-V-I・コード・スケール・ブルース', en: 'Swing, chord symbols, voicings, ii-V-I, chord-scales, blues.', es: 'Swing, cifrado, voicings, ii-V-I, escalas-acorde, blues.', ko: '스윙·코드 심볼·보이싱·ii-V-I·블루스.', pt: 'Swing, cifras, voicings, ii-V-I, escalas, blues.', de: 'Swing, Akkordsymbole, Voicings, ii-V-I, Bluestonleiter.' },
    lessonCount: 35, level: 'advanced',
  },
  {
    id: 'm7', num: 'M7',
    title: { ja: 'ポピュラー音楽理論', en: 'Popular Music', es: 'Música popular', ko: '팝 음악 이론', pt: 'Música popular', de: 'Popmusik' },
    desc: { ja: 'ポップ和声スキーマ・Doo-wop・AABA・Verse-Chorus・モーダル', en: 'Pop harmonic schemas, doo-wop, AABA, verse-chorus, modal.', es: 'Esquemas pop, doo-wop, AABA, estribillo, modal.', ko: '팝 화성 스키마·두왑·AABA·버스-코러스.', pt: 'Esquemas pop, doo-wop, AABA, verso-refrão, modal.', de: 'Pop-Harmonik, Doo-Wop, AABA, Strophe-Refrain, modal.' },
    lessonCount: 30, level: 'advanced',
  },
  {
    id: 'm8', num: 'M8',
    title: { ja: '20-21 世紀の技法', en: '20th/21st Century Techniques', es: 'Técnicas del s. XX-XXI', ko: '20-21세기 기법', pt: 'Técnicas do séc. XX-XXI', de: 'Techniken des 20./21. Jh.' },
    desc: { ja: 'ピッチクラス集合論・整数表記・Forte 番号・教会旋法', en: 'Pitch-class set theory, integer notation, Forte numbers, church modes.', es: 'Teoría de conjuntos de clases de altura, notación entera, modos eclesiásticos.', ko: '피치 클래스 집합론·포르테 번호·교회 선법.', pt: 'Teoria de conjuntos, notação inteira, modos eclesiásticos.', de: 'Tonklassenmengen, Forte-Nummern, Kirchentonarten.' },
    lessonCount: 25, level: 'graduate',
  },
  {
    id: 'm9', num: 'M9',
    title: { ja: '12 音音楽', en: 'Twelve-Tone Music', es: 'Música dodecafónica', ko: '12음 기법', pt: 'Música dodecafônica', de: 'Zwölftonmusik' },
    desc: { ja: '12 音技法・行操作・マトリックス・ヴェーベルン分析', en: 'Twelve-tone, row operations, matrices, Webern analysis.', es: 'Dodecafonismo, operaciones de serie, matrices, análisis de Webern.', ko: '12음·행 조작·매트릭스·베베른 분석.', pt: 'Dodecafonia, operações seriais, matrizes, análise de Webern.', de: 'Zwölftontechnik, Reihenoperationen, Matrizen, Webern-Analyse.' },
    lessonCount: 18, level: 'graduate',
  },
  {
    id: 'm10', num: 'M10',
    title: { ja: 'オーケストレーション', en: 'Orchestration', es: 'Orquestación', ko: '오케스트레이션', pt: 'Orquestração', de: 'Orchestration' },
    desc: { ja: 'オーケストレーションの核心原則・音色変化・ピアノからの編曲', en: 'Core orchestration principles, timbral change, arranging from piano.', es: 'Principios de orquestación, cambio tímbrico, arreglo desde piano.', ko: '오케스트레이션 핵심·음색 변화·피아노 편곡.', pt: 'Princípios de orquestração, mudança tímbrica, arranjo do piano.', de: 'Orchestrierung Kernprinzipien, Klangfarbenwechsel, Klavierübertragung.' },
    lessonCount: 15, level: 'advanced',
  },
  {
    id: 'm11', num: 'M11',
    title: { ja: 'コールユーブンゲンと聴音', en: 'Coleübungen & Ear Training', es: 'Coleübungen y entrenamiento auditivo', ko: '콜러뷔붕겐과 청음', pt: 'Coleübungen e percepção', de: 'Coleübungen & Gehörbildung' },
    desc: { ja: 'コールユーブンゲン全 87 番完全インタラクティブ化・聴音・内的聴覚訓練', en: 'All 87 Coleübungen interactively. Melodic, harmonic, polyphonic dictation. Inner hearing.', es: 'Las 87 Coleübungen interactivas. Dictado melódico, armónico, audición interna.', ko: '콜러뷔붕겐 전 87번 인터랙티브·청음·내적 청각.', pt: 'As 87 Coleübungen interativas. Ditados melódicos, harmônicos, audição interna.', de: 'Alle 87 Coleübungen interaktiv. Melodie-, Harmonie-, Polyphonie-Diktat.' },
    lessonCount: 90, level: 'foundation',
  },
  {
    id: 'm12', num: 'M12',
    title: { ja: 'ソルフェージュと視唱', en: 'Solfège & Sight Singing', es: 'Solfeo y lectura cantada', ko: '솔페지오와 시창', pt: 'Solfejo e leitura cantada', de: 'Solfège & Blattsingen' },
    desc: { ja: '階名唱法 (移動ド・固定ド両対応)・Pozzoli・Bona・ヒンデミット・コダーイ', en: 'Solfège (movable & fixed do). Pozzoli, Bona, Hindemith, Kodály.', es: 'Solfeo (do móvil y fijo). Pozzoli, Bona, Hindemith, Kodály.', ko: '솔페지오 (이동도·고정도). 포졸리·보나·힌데미트·코다이.', pt: 'Solfejo (dó móvel e fixo). Pozzoli, Bona, Hindemith, Kodály.', de: 'Solmisation (bewegliches und festes do). Pozzoli, Bona, Hindemith, Kodály.' },
    lessonCount: 70, level: 'intermediate',
  },
  {
    id: 'm13', num: 'M13',
    title: { ja: '音楽史と様式', en: 'Music History & Style', es: 'Historia y estilo musical', ko: '음악사와 양식', pt: 'História e estilo musical', de: 'Musikgeschichte & Stil' },
    desc: { ja: 'スタイル時代・主要作曲家・演奏実践 (HIP) ・楽器史・記譜法進化', en: 'Style periods, major composers, historical performance practice, notation evolution.', es: 'Períodos estilísticos, compositores, práctica histórica, evolución notacional.', ko: '시대 양식·주요 작곡가·역사적 연주·기보법 진화.', pt: 'Períodos, compositores, prática histórica, evolução da notação.', de: 'Stilepochen, Hauptkomponisten, historische Aufführungspraxis.' },
    lessonCount: 20, level: 'advanced',
  },
  {
    id: 'm14', num: 'M14',
    title: { ja: '上級理論', en: 'Advanced Theory', es: 'Teoría avanzada', ko: '고급 이론', pt: 'Teoria avançada', de: 'Vertiefte Theorie' },
    desc: { ja: 'シェンカー分析・Caplin 形式機能・Riemann 機能和声・微分音・スペクトル分析', en: 'Schenkerian analysis, Caplin formal functions, Riemannian, microtonality, spectralism.', es: 'Análisis Schenker, funciones formales de Caplin, microtonalidad, espectralismo.', ko: '쉔커 분석·카플린 형식 기능·미분음·스펙트럴.', pt: 'Análise Schenker, funções formais de Caplin, microtonalidade.', de: 'Schenker-Analyse, Caplin Formfunktionen, Mikrotonalität, Spektralmusik.' },
    lessonCount: 30, level: 'graduate',
  },
  {
    id: 'm15', num: 'M15',
    title: { ja: '作曲実技', en: 'Composition Practice', es: 'Composición práctica', ko: '작곡 실기', pt: 'Composição prática', de: 'Kompositorische Praxis' },
    desc: { ja: '4 声体コラール・弦楽四重奏・リート・ピアノ小品・編曲', en: '4-part chorale, string quartet, art song, piano miniature, arrangement.', es: 'Coral a 4 voces, cuarteto, lied, miniatura para piano, arreglo.', ko: '4성부 코랄·현악 사중주·리트·피아노 소품·편곡.', pt: 'Coral a 4 vozes, quarteto, lied, miniatura para piano, arranjo.', de: 'Vierstimmiger Choral, Streichquartett, Lied, Klaviersatz, Bearbeitung.' },
    lessonCount: 25, level: 'graduate',
  },
];

const TOTAL_LESSONS = MODULES.reduce((sum, m) => sum + m.lessonCount, 0); // = 553

// ─────────────────────────────────────────
// 6 ペルソナ (CLAUDE.md §37.3)
// ─────────────────────────────────────────
const PERSONAS: { id: string; title: L6; desc: L6 }[] = [
  {
    id: 'aspiring',
    title: { ja: '音大に行く道を、自分で開く', en: 'Forge your own path to a music career', es: 'Forja tu propio camino musical', ko: '음악의 길을 스스로 개척', pt: 'Trace seu próprio caminho musical', de: 'Den eigenen Weg in die Musik finden' },
    desc: { ja: '学費は限られている。でも本気でプロを目指している。', en: 'Limited budget. Serious about going pro.', es: 'Presupuesto limitado, ambición profesional.', ko: '예산은 제한적이지만 프로를 목표로.', pt: 'Orçamento limitado, ambição profissional.', de: 'Begrenztes Budget, professioneller Anspruch.' },
  },
  {
    id: 'student',
    title: { ja: '音大カリキュラムを補う', en: 'Supplement your conservatory curriculum', es: 'Complementa tu currículo del conservatorio', ko: '음대 커리큘럼 보완', pt: 'Complemente seu currículo de conservatório', de: 'Hochschul-Lehrplan ergänzen' },
    desc: { ja: '学内授業だけでは足りない。もっと深く学びたい。', en: 'Classes alone aren\'t enough. You want to go deeper.', es: 'Las clases no bastan. Quieres profundizar.', ko: '강의만으론 부족합니다. 더 깊이.', pt: 'As aulas não bastam. Quer aprofundar.', de: 'Vorlesungen reichen nicht. Tiefer eintauchen.' },
  },
  {
    id: 'professional',
    title: { ja: 'フリーランス音楽家の知識アップデート', en: 'Refresh your craft as a working musician', es: 'Actualiza tu oficio como músico profesional', ko: '프리랜서 음악가의 지식 갱신', pt: 'Renove seu ofício como músico profissional', de: 'Wissen als freischaffende:r Musiker:in auffrischen' },
    desc: { ja: '日々の演奏で錆びる理論を、休まず磨き続ける。', en: 'Keep your theory sharp between gigs.', es: 'Mantén tu teoría afilada entre conciertos.', ko: '연주 사이에 이론을 갈고닦기.', pt: 'Mantenha sua teoria afiada entre apresentações.', de: 'Theorie zwischen Auftritten lebendig halten.' },
  },
  {
    id: 'returning',
    title: { ja: '社会人がもう一度本気で', en: 'Reconnect with music as an adult', es: 'Reencuentra la música como adulto', ko: '성인이 되어 다시 진지하게', pt: 'Reconecte-se à música como adulto', de: 'Als Erwachsene:r ernsthaft zur Musik zurück' },
    desc: { ja: '可処分所得と教養がある。子供向けアプリでは満足できない。', en: 'You have means and taste. Children\'s apps won\'t do.', es: 'Tienes recursos y criterio. Las apps infantiles no bastan.', ko: '여유와 안목이 있습니다. 어린이용으론 부족.', pt: 'Tem recursos e critério. Apps infantis não servem.', de: 'Mit Mitteln und Geschmack. Kinder-Apps reichen nicht.' },
  },
  {
    id: 'parent',
    title: { ja: '子供に本物の選択肢を', en: 'Give your child a real path', es: 'Dale a tu hijo una opción real', ko: '아이에게 진짜 선택지를', pt: 'Dê ao seu filho um caminho real', de: 'Dem Kind einen echten Weg ermöglichen' },
    desc: { ja: '教育意識が高く、音大以外の本物の選択肢を探している親。', en: 'Education-focused parents seeking real alternatives to conservatory.', es: 'Padres exigentes que buscan alternativas reales al conservatorio.', ko: '음대 외 진정한 대안을 찾는 학부모.', pt: 'Pais exigentes em busca de alternativas reais ao conservatório.', de: 'Eltern, die echte Alternativen zur Hochschule suchen.' },
  },
  {
    id: 'institution',
    title: { ja: '音楽教室・指導者向け', en: 'For studios and educators', es: 'Para escuelas y profesores', ko: '음악 교실·지도자', pt: 'Para escolas e educadores', de: 'Für Studios und Lehrkräfte' },
    desc: { ja: '生徒の進捗を見守り、課題を割り当てる教師ダッシュボード (将来公開予定)。', en: 'Teacher dashboards to track progress and assign work (coming soon).', es: 'Paneles para profesores con seguimiento y tareas (próximamente).', ko: '학생 진도 관리·과제 할당 교사 대시보드 (예정).', pt: 'Painéis para professores com acompanhamento e tarefas (em breve).', de: 'Lehrer-Dashboard mit Fortschrittsverfolgung (geplant).' },
  },
];

// ─────────────────────────────────────────
// IQ180 機能 (8 つの差別化要素)
// ─────────────────────────────────────────
const FEATURES: { num: string; title: L6; desc: L6 }[] = [
  {
    num: '01',
    title: { ja: '診断テストで最適な開始地点を', en: 'Diagnostic test for the right starting point', es: 'Examen diagnóstico para tu punto de partida', ko: '진단 테스트로 최적 시작점', pt: 'Teste diagnóstico para o ponto certo de início', de: 'Einstufungstest für den passenden Einstieg' },
    desc: { ja: '15 分のプレースメントテストで、M0 から M14 までのうち最適な開始モジュールを判定。あなたの実力を尊重した出発点を提示します。', en: 'A 15-minute placement test maps you to the optimal starting module from M0 to M14. We respect what you already know.', es: 'Un examen de 15 minutos te asigna al módulo óptimo entre M0 y M14. Respetamos lo que ya sabes.', ko: '15분 진단으로 M0-M14 중 최적 시작 모듈 판정. 이미 가진 실력을 존중합니다.', pt: 'Teste de 15 minutos define seu módulo inicial entre M0 e M14. Respeitamos o que você já sabe.', de: 'Ein 15-Minuten-Test ermittelt das optimale Startmodul von M0 bis M14. Wir respektieren Ihr Vorwissen.' },
  },
  {
    num: '02',
    title: { ja: 'コールユーブンゲン全 87 番のインタラクティブ化', en: 'All 87 Coleübungen, interactive', es: 'Las 87 Coleübungen, interactivas', ko: '콜러뷔붕겐 전 87번 인터랙티브', pt: 'As 87 Coleübungen, interativas', de: 'Alle 87 Coleübungen, interaktiv' },
    desc: { ja: '世界に存在しなかったコールユーブンゲン完全インタラクティブ実装。マイクで歌うとピッチを採点。決定的な差別化要素です。', en: 'The world\'s first complete interactive Coleübungen. Sing into your mic; we score your pitch in real time. Singularly distinctive.', es: 'Primera implementación interactiva completa de las Coleübungen. Canta y evaluamos tu afinación en tiempo real.', ko: '세계 최초 콜러뷔붕겐 완전 인터랙티브 구현. 마이크로 노래하면 실시간 피치 채점.', pt: 'Primeira implementação interativa completa das Coleübungen do mundo. Cante ao microfone, avaliamos sua afinação.', de: 'Weltweit erste vollständige interaktive Coleübungen. Singen Sie ins Mikrofon, wir bewerten Ihre Tonhöhe in Echtzeit.' },
  },
  {
    num: '03',
    title: { ja: '科学的復習 (FSRS)', en: 'Scientific spaced repetition (FSRS)', es: 'Repetición espaciada científica (FSRS)', ko: '과학적 간격 반복 (FSRS)', pt: 'Repetição espaçada científica (FSRS)', de: 'Wissenschaftliches Wiederholen (FSRS)' },
    desc: { ja: 'Free Spaced Repetition Scheduler によって、フラッシュカードが最適タイミングで再出題されます。短期記憶を長期記憶へ。', en: 'The Free Spaced Repetition Scheduler (FSRS) algorithm presents cards at optimal intervals — short-term recall becomes long-term mastery.', es: 'El algoritmo FSRS presenta las tarjetas en el intervalo óptimo. La memoria corto-plazo se vuelve dominio.', ko: 'FSRS 알고리즘이 최적 간격으로 카드 출제. 단기 기억이 장기 숙달로.', pt: 'O algoritmo FSRS apresenta os cartões no intervalo ideal. Memória curta vira domínio duradouro.', de: 'Der FSRS-Algorithmus präsentiert Karten im optimalen Intervall. Kurzzeitwissen wird Können.' },
  },
  {
    num: '04',
    title: { ja: '模擬入試試験', en: 'Mock entrance exams', es: 'Simulacros de admisión', ko: '모의 입시 시험', pt: 'Simulados de admissão', de: 'Probeaufnahmeprüfungen' },
    desc: { ja: '東京藝大・桐朋・国立・ABRSM・AP Music Theory・Juilliard・Berklee・Conservatoire de Paris・Berlin Hochschule・韓国芸術総合学校・中央音楽学院 (北京) など 12 試験対応 (フェーズ 2 以降順次)。', en: 'Coverage planned for 12 exams: Tokyo Geidai, Toho, ABRSM, AP Music Theory, Juilliard, Berklee, Paris Conservatoire, Berlin Hochschule, Korea National University of Arts, Beijing Central Conservatory and more.', es: 'Cobertura prevista para 12 exámenes: Tokio Geidai, ABRSM, AP, Juilliard, Berklee, París, Berlín, Corea, Pekín y más.', ko: '도쿄예대·토호·ABRSM·AP·줄리아드·벅리·파리·베를린·한예종·중앙음악원 등 12 시험 대응 예정.', pt: 'Cobertura prevista de 12 exames: Tokyo Geidai, ABRSM, AP, Juilliard, Berklee, Paris, Berlim, Coreia, Pequim e mais.', de: 'Geplant: 12 Prüfungen — Tokio Geidai, ABRSM, AP, Juilliard, Berklee, Paris, Berlin, Korea, Peking und weitere.' },
  },
  {
    num: '05',
    title: { ja: '声で答える視唱・聴音', en: 'Sing your way through sight-singing & dictation', es: 'Canta para responder solfeo y dictado', ko: '음성으로 답하는 시창·청음', pt: 'Cante para responder o solfejo e ditado', de: 'Sprich-/Sing-Eingabe für Singen & Diktat' },
    desc: { ja: 'マイク + ピッチ検出 (Pyodide on WebAssembly) で、視唱の正答性を客観評価。打ち込みでは届かない領域に到達します。', en: 'Microphone + pitch detection (Pyodide / WebAssembly) objectively evaluates your sight singing — beyond what typed input can reach.', es: 'Micrófono + detección de tono (Pyodide / WebAssembly) evalúa tu lectura cantada de forma objetiva.', ko: '마이크와 피치 검출 (Pyodide/WebAssembly) 로 시창을 객관 평가.', pt: 'Microfone + detecção de tom (Pyodide / WebAssembly) avalia seu solfejo com objetividade.', de: 'Mikrofon plus Tonhöhenerkennung (Pyodide / WebAssembly) bewerten Ihr Blattsingen objektiv.' },
  },
  {
    num: '06',
    title: { ja: '埋め込みウィジェット', en: 'Embeddable widgets', es: 'Widgets incrustables', ko: '임베드 위젯', pt: 'Widgets para incorporar', de: 'Einbettbare Widgets' },
    desc: { ja: '練習問題を iframe で外部サイト・ブログ・YouTube 説明欄に貼って配信できます。動画の片隅に "Made with Kuon" が映る — それが拡散のエンジン。', en: 'Embed practice problems via iframe in blogs, YouTube descriptions, lesson sites. "Made with Kuon" travels with every clip.', es: 'Incrusta ejercicios mediante iframe en blogs, descripciones de YouTube, sitios de clase. "Made with Kuon" viaja con cada vídeo.', ko: '연습 문제를 iframe 으로 블로그·유튜브 설명·레슨 사이트에 임베드. "Made with Kuon" 이 함께 전파됩니다.', pt: 'Incorpore exercícios via iframe em blogs, descrições de YouTube, sites. "Made with Kuon" viaja com cada vídeo.', de: 'Übungen per iframe in Blogs, YouTube-Beschreibungen, Unterrichtsseiten einbetten. "Made with Kuon" reist mit.' },
  },
  {
    num: '07',
    title: { ja: 'PWA + プッシュ通知', en: 'PWA + push notifications', es: 'PWA + notificaciones push', ko: 'PWA + 푸시 알림', pt: 'PWA + notificações push', de: 'PWA + Push-Benachrichtigungen' },
    desc: { ja: 'モバイルのホーム画面に追加可能。Service Worker でオフライン継続。日次ストリーク維持の優しいプッシュ通知 (オフ可能)。', en: 'Install to your phone home screen. Continues offline via Service Worker. Gentle daily streak reminders, opt-in.', es: 'Instala en la pantalla de inicio del móvil. Funciona offline. Recordatorios suaves opcionales.', ko: '모바일 홈 화면 설치 가능. 오프라인 동작. 부드러운 일일 알림 (선택).', pt: 'Instale na tela inicial do celular. Funciona offline. Lembretes diários gentis (opcionais).', de: 'Auf den Startbildschirm installierbar, offline nutzbar, sanfte tägliche Erinnerungen (optional).' },
  },
  {
    num: '08',
    title: { ja: '6 言語対応', en: 'Six-language interface', es: 'Interfaz en seis idiomas', ko: '6 언어 지원', pt: 'Interface em seis idiomas', de: 'Sechs Sprachen' },
    desc: { ja: '日本語・英語・スペイン語・ドイツ語・韓国語・ポルトガル語に対応 (フェーズ別段階展開)。各言語の音楽教育文化に合わせた敬意の表現。', en: 'Japanese, English, Spanish, German, Korean, Portuguese — rolled out in phases. Each language tuned to its musical-pedagogy culture.', es: 'Japonés, inglés, español, alemán, coreano, portugués — despliegue por fases. Adaptado a cada cultura pedagógica.', ko: '일본어·영어·스페인어·독일어·한국어·포르투갈어 단계 배포. 각 언어의 교육 문화에 맞춘 존중.', pt: 'Japonês, inglês, espanhol, alemão, coreano, português — implantação por fases.', de: 'Japanisch, Englisch, Spanisch, Deutsch, Koreanisch, Portugiesisch — phasenweise Einführung.' },
  },
];

// ─────────────────────────────────────────
// FAQ (10 件)
// ─────────────────────────────────────────
const FAQS: { q: L6; a: L6 }[] = [
  {
    q: { ja: '今すぐ受講できますか？', en: 'Can I start right now?', es: '¿Puedo empezar ya?', ko: '지금 바로 수강할 수 있습니까?', pt: 'Posso começar agora?', de: 'Kann ich jetzt beginnen?' },
    a: { ja: 'はい、開講中です。MVP として M0-01「五線と音名」、M1-40「三和音の基本形と転回形」、M4-01「カデンツの種類」が利用可能で、目次から自由に入れます。残り 550 レッスンは Open Music Theory v2 の章順に従って順次公開していきます。早期受講者は完成後の体系すべてを最初から享受できます。', en: 'Yes — enrollment is open. As an MVP, M0-01 "Staff and Pitch Names," M1-40 "Triads and Inversions," and M4-01 "Cadences" are live and accessible from the table of contents. The remaining 550 lessons roll out following the Open Music Theory v2 chapter order. Early subscribers gain the full curriculum as it grows.', es: 'Sí — ya puedes empezar. M0-01, M1-40 y M4-01 están disponibles. El resto de las 550 lecciones se lanzará siguiendo el orden de capítulos de OMT v2.', ko: '네 — 지금 수강 가능. M0-01·M1-40·M4-01 이 공개되어 목차에서 자유롭게 입장. 나머지 550 레슨은 OMT v2 의 장 순서로 순차 공개.', pt: 'Sim — já está aberto. M0-01, M1-40 e M4-01 disponíveis. As 550 lições restantes virão seguindo a ordem dos capítulos do OMT v2.', de: 'Ja — die Anmeldung ist offen. M0-01, M1-40 und M4-01 sind verfügbar. Die restlichen 550 Lektionen folgen der Kapitelreihenfolge von OMT v2.' },
  },
  {
    q: { ja: '料金はいくらですか？', en: 'What does it cost?', es: '¿Cuánto cuesta?', ko: '요금은 얼마입니까?', pt: 'Quanto custa?', de: 'Was kostet es?' },
    a: { ja: 'Theory Suite は Prelude プラン (¥780/月) 以上でご利用いただけます。年額プランなら 2 ヶ月分お得です。Prelude では Theory に加え、ブラウザで動く 30 以上のアプリも使えます。', en: 'Theory Suite is included in the Prelude plan (¥780/month) and above. The yearly plan saves you two months. Prelude also unlocks 30+ browser-native tools beyond Theory.', es: 'Theory Suite está incluido desde el plan Prelude (¥780/mes). El plan anual ahorra dos meses. Prelude también desbloquea más de 30 herramientas en el navegador.', ko: 'Theory Suite 는 Prelude 플랜 (¥780/월) 이상에서 이용 가능. 연간 플랜은 2 개월 무료. Prelude 는 Theory 외에 브라우저 도구 30+ 개도 포함.', pt: 'O Theory Suite está incluído no plano Prelude (¥780/mês) e acima. O plano anual economiza dois meses.', de: 'Theory Suite ist ab dem Prelude-Plan (¥780/Monat) enthalten. Der Jahresplan spart zwei Monate. Prelude bietet zusätzlich über 30 browserbasierte Tools.' },
  },
  {
    q: { ja: '完全初心者でも大丈夫ですか？', en: 'Will it work for absolute beginners?', es: '¿Sirve para principiantes absolutos?', ko: '완전 초급자도 괜찮나요?', pt: 'Funciona para iniciantes absolutos?', de: 'Ist es für absolute Anfänger geeignet?' },
    a: { ja: 'はい。M0「音楽との最初の出会い」は譜表・音名・拍子記号からゆっくり始まります。診断テストで最適な開始地点を判定するため、知らないところで急に難しくなることはありません。', en: 'Yes. M0 ("First Encounter with Music") begins gently with the staff, pitch names, and time signatures. The diagnostic test ensures we never start above your level.', es: 'Sí. M0 ("Primer encuentro con la música") empieza con el pentagrama, los nombres de las notas y los compases. El diagnóstico evita arrancar por encima de tu nivel.', ko: '네. M0 (음악과의 첫 만남) 은 오선·음이름·박자기호부터 천천히. 진단 테스트로 적절 출발점.', pt: 'Sim. M0 ("Primeiro encontro com a música") começa com pauta, notas e compassos. O diagnóstico garante o ponto certo.', de: 'Ja. M0 („Erste Begegnung mit Musik") beginnt sanft mit Notensystem, Tonnamen und Taktarten. Der Einstufungstest setzt den passenden Start.' },
  },
  {
    q: { ja: '上級者にとっても価値はありますか？', en: 'Is there value for advanced students?', es: '¿Hay valor para estudiantes avanzados?', ko: '상급자에게도 가치가 있습니까?', pt: 'Há valor para estudantes avançados?', de: 'Gibt es Mehrwert für Fortgeschrittene?' },
    a: { ja: 'はい。M14「上級理論」はシェンカー分析・Caplin 形式機能理論・Riemann 機能和声論・微分音・スペクトル分析まで踏み込みます。M9「12 音音楽」では行操作・マトリックス・ヴェーベルン分析、M2「対位法」ではフーガまで。', en: 'Yes. M14 (Advanced Theory) covers Schenkerian analysis, Caplin\'s formal functions, Riemannian harmony, microtonality, and spectralism. M9 reaches twelve-tone matrices and Webern; M2 reaches fugue.', es: 'Sí. M14 cubre análisis Schenker, funciones formales de Caplin, Riemann, microtonalidad y espectralismo. M9 llega al dodecafonismo y Webern; M2 a la fuga.', ko: '네. M14 (고급 이론) 은 쉔커·카플린·리만·미분음·스펙트럴까지. M9 는 12 음 매트릭스·베베른, M2 는 푸가.', pt: 'Sim. M14 cobre análise Schenker, funções de Caplin, Riemann, microtonalidade e espectralismo. M9 vai até dodecafonia e Webern.', de: 'Ja. M14 (Vertiefte Theorie) reicht von Schenker über Caplin, Riemann bis Mikrotonalität und Spektralmusik. M9 erreicht Webern, M2 die Fuge.' },
  },
  {
    q: { ja: 'ソルフェージュは移動ドですか、固定ドですか？', en: 'Movable do or fixed do?', es: '¿Do móvil o do fijo?', ko: '이동도? 고정도?', pt: 'Dó móvel ou dó fixo?', de: 'Bewegliches oder festes do?' },
    a: { ja: '両方に対応します。デフォルトは言語設定で選択 (日本語: 固定ド・欧州語: 移動ド)。設定でいつでも切替可能です。両方の流派が同じ屋根の下で共存できる、稀有な環境を目指します。', en: 'Both. Default by language (Japanese: fixed do; European languages: movable do). Toggle anytime in settings. Few environments respect both traditions equally — we do.', es: 'Ambos. Por defecto según el idioma (japonés: fijo; europeos: móvil). Cambia cuando quieras. Pocas plataformas respetan ambas tradiciones por igual.', ko: '둘 다 지원. 기본은 언어 설정 (일본어: 고정도·유럽어: 이동도). 설정에서 언제든 전환. 두 전통을 동등 존중.', pt: 'Ambos. Por padrão segundo idioma (japonês: fixo; europeus: móvel). Alterne quando quiser. Respeitamos ambas tradições.', de: 'Beides. Standard je Sprache (Japanisch: fest, europäische Sprachen: beweglich). Jederzeit umschaltbar.' },
  },
  {
    q: { ja: '言語は何が選べますか？', en: 'Which languages are available?', es: '¿Qué idiomas están disponibles?', ko: '어떤 언어를 선택할 수 있습니까?', pt: 'Quais idiomas estão disponíveis?', de: 'Welche Sprachen sind verfügbar?' },
    a: { ja: 'MVP で日本語と英語に対応。フェーズ 2 でドイツ語とスペイン語、フェーズ 3 で韓国語とポルトガル語に拡張します。各言語の音楽教育文化を尊重し、機械翻訳直訳ではない自然な表現を心がけます。', en: 'Japanese and English at MVP. Phase 2 adds German and Spanish; Phase 3 adds Korean and Portuguese. Each language is tuned to its educational culture, not machine-translated.', es: 'Japonés e inglés en MVP. Fase 2 añade alemán y español; fase 3, coreano y portugués. Adaptado, no traducido automáticamente.', ko: 'MVP 는 일본어·영어. 페이즈 2 에서 독일어·스페인어, 페이즈 3 에서 한국어·포르투갈어. 기계 번역이 아닌 문화 적응 번역.', pt: 'Japonês e inglês no MVP. Fase 2: alemão e espanhol. Fase 3: coreano e português. Adaptado culturalmente.', de: 'MVP: Japanisch und Englisch. Phase 2: Deutsch und Spanisch. Phase 3: Koreanisch und Portugiesisch. Kulturell angepasst, nicht maschinell.' },
  },
  {
    q: { ja: 'カリキュラムは誰が監修していますか？', en: 'Who designed the curriculum?', es: '¿Quién diseñó el currículo?', ko: '커리큘럼은 누가 감수합니까?', pt: 'Quem projetou o currículo?', de: 'Wer hat den Lehrplan gestaltet?' },
    a: { ja: 'Open Music Theory v2 (Mark Gotham (ケンブリッジ大), Megan Lavengood (ジョージ・メイソン大) ほか北米音楽学部 7 名) を骨格として、空音開発が独自の M0・M11・M12・M13・M15 を追加。北米音楽学部で標準教科書として採用されている権威ある内容を基盤としています。', en: 'Built on Open Music Theory v2 (Mark Gotham of Cambridge, Megan Lavengood of George Mason, and 5 other North American faculty), the standard textbook in many North American music schools. Kuon adds proprietary modules M0, M11, M12, M13, M15 to complete the curriculum.', es: 'Sobre la base de Open Music Theory v2 (Mark Gotham de Cambridge, Megan Lavengood de GMU y 5 catedráticos más), libro estándar en muchas universidades norteamericanas. Kuon añade los módulos M0, M11, M12, M13, M15.', ko: 'Open Music Theory v2 (케임브리지 대 마크 고섬, 조지 메이슨 대 메간 라벤구드 외 7 인 북미 교수진) 를 골격으로, 공음개발이 독자 모듈 M0·M11·M12·M13·M15 추가.', pt: 'Baseado no Open Music Theory v2 (Mark Gotham, Cambridge; Megan Lavengood, GMU e mais 5 docentes norte-americanos), livro padrão em escolas de música. Kuon adiciona M0, M11, M12, M13, M15.', de: 'Basis: Open Music Theory v2 (Mark Gotham, Cambridge; Megan Lavengood, GMU; und fünf weitere nordamerikanische Hochschullehrer:innen) — Standardlehrbuch vieler Musikhochschulen. Kuon ergänzt M0, M11, M12, M13, M15.' },
  },
  {
    q: { ja: 'モバイルで使えますか？', en: 'Does it work on mobile?', es: '¿Funciona en móvil?', ko: '모바일에서 사용 가능합니까?', pt: 'Funciona em celular?', de: 'Funktioniert es auf dem Smartphone?' },
    a: { ja: 'はい。PWA (Progressive Web App) 対応。ホーム画面に追加可能、Service Worker でオフライン継続、プッシュ通知でストリークを維持できます。インストールは不要、ブラウザだけで動きます。', en: 'Yes. As a Progressive Web App, you can install it to your home screen, continue offline via Service Worker, and receive optional push notifications. No app store; just the browser.', es: 'Sí. Es una PWA: la instalas en la pantalla de inicio, funciona offline y notificaciones opcionales. Sin tienda de apps.', ko: '네. PWA 로 홈 화면 설치 가능. 오프라인 동작, 선택적 푸시 알림. 앱 스토어 불필요.', pt: 'Sim. PWA: instala na tela inicial, funciona offline, notificações opcionais. Sem loja de apps.', de: 'Ja. Als PWA auf den Startbildschirm installierbar, offline-fähig, optionale Push-Benachrichtigungen. Keine App-Store-Installation nötig.' },
  },
  {
    q: { ja: '修了証や認定はありますか？', en: 'Are there certificates or credentials?', es: '¿Hay certificados o credenciales?', ko: '수료증이나 인증이 있나요?', pt: 'Há certificados ou credenciais?', de: 'Gibt es Zertifikate?' },
    a: { ja: 'Kuon 独自の認定制度は採用しません。代わりに、長期的な実践記録 (練習ログ・聴音正答率・カデンツ正答率の推移) を成長ダッシュボードで可視化し、それ自体があなたの "証跡" になります。模擬入試・国際試験対策モードはご用意します。', en: 'We don\'t issue Kuon-branded credentials. Instead, your long-term practice record — dictation accuracy, cadence-recognition over time — is visualized in your growth dashboard, becoming your record itself. Mock-exam modes target real conservatory and international tests.', es: 'No emitimos credenciales propias. Tu registro a largo plazo (precisión, cadencias) se visualiza en el panel y eso es tu evidencia. Hay simulacros para exámenes reales.', ko: '쿠온 자체 인증은 없습니다. 대신 장기 실천 기록 (정답률 추이) 이 성장 대시보드로 가시화되어 그 자체가 증거. 실제 시험 대비 모의 모드 제공.', pt: 'Sem credenciais próprias. Seu histórico (precisão, reconhecimento) é visualizado no painel e serve como prova. Simulados para provas reais.', de: 'Keine Kuon-eigenen Zertifikate. Stattdessen wird Ihre Langzeit-Übungshistorie als Wachstums-Dashboard sichtbar — das ist Ihr Nachweis. Simulationsmodi für reale Prüfungen.' },
  },
  {
    q: { ja: '「子供向け」の演出はありませんか？', en: 'Will I be talked down to like in beginner apps?', es: '¿Me hablarán como a un niño?', ko: '어린이용 같은 연출은 없나요?', pt: 'Vou ser tratado como criança?', de: 'Werde ich wie in Anfänger-Apps bevormundet?' },
    a: { ja: 'ありません。マスコット・キャラクターは一切登場せず、感嘆符・派手な祝賀演出も使いません。表示モード「熟練者」を選べば、ストリーク・バッジは小さく、データだけが大きく表示されます。プロが毎日開いても煩わしくない静寂を設計しています。', en: 'No. There are no mascots or characters, no exclamation points, no celebratory animations. In "Master" display mode, streaks and badges shrink and the data grows. We design for the silence a professional needs.', es: 'No. Sin mascotas, sin signos de exclamación, sin animaciones de celebración. En modo "Maestro" los datos predominan. Diseñado para el silencio que necesita un profesional.', ko: '없습니다. 마스코트·캐릭터 없음, 감탄부호·축하 연출 없음. "마스터" 모드에선 데이터가 크고 배지가 작게. 프로의 정적을 위한 디자인.', pt: 'Não. Sem mascotes, sem exclamações, sem animações exageradas. No modo "Mestre", dados grandes, distintivos pequenos. Silêncio profissional.', de: 'Nein. Keine Maskottchen, keine Ausrufezeichen, keine grellen Animationen. Im Modus „Meister:in" stehen Daten im Vordergrund — Stille für Professionelle.' },
  },
];

// ─────────────────────────────────────────
// JSON-LD 構造化データ
// ─────────────────────────────────────────
function buildJsonLd(lang: Lang) {
  const courseLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'KUON Music Theory Suite',
    description: t({
      ja: 'バッハ・モーツァルトを読み解く本格カリキュラム。Open Music Theory v2 を骨格に、楽典基礎から音大卒業レベルまで 16 モジュール 553 レッスンで完全網羅。',
      en: 'Master classical music from Bach to Brahms. Built on Open Music Theory v2, covering everything from fundamentals to graduate-level analysis across 16 modules and 553 lessons.',
    }, lang),
    provider: {
      '@type': 'Organization',
      name: 'Kuon R&D',
      url: 'https://kuon-rnd.com',
      sameAs: ['https://kuon-rnd.com/profile'],
    },
    educationalLevel: 'Beginner to Graduate',
    teaches: [
      'Music Theory', 'Harmony', 'Counterpoint', 'Solfège', 'Ear Training',
      'Sight Singing', 'Roman Numeral Analysis', 'Form', 'Jazz Theory',
      'Twelve-Tone Music', 'Schenkerian Analysis', 'Orchestration',
    ],
    inLanguage: ['ja', 'en', 'es', 'de', 'ko', 'pt'],
    isAccessibleForFree: false,
    offers: {
      '@type': 'Offer',
      category: 'Subscription',
      priceCurrency: 'JPY',
      price: 780,
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT553H',
    },
    coursePrerequisites: 'No prerequisites — diagnostic test determines starting point.',
    numberOfCredits: TOTAL_LESSONS,
  };

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(f => ({
      '@type': 'Question',
      name: t(f.q, lang),
      acceptedAnswer: {
        '@type': 'Answer',
        text: t(f.a, lang),
      },
    })),
  };

  const eduOrgLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Kuon R&D / 空音開発',
    url: 'https://kuon-rnd.com',
    description: t({
      ja: 'プロを目指す個人のための音楽教育プラットフォーム。',
      en: 'A music education platform for serious individuals on a professional path.',
    }, lang),
    sameAs: ['https://kuon-rnd.com/profile', 'https://kotaroasahina.com'],
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'Kotaro Asahina (朝比奈幸太郎)',
      jobTitle: t({
        ja: '音響エンジニア・マイク設計者・音楽家',
        en: 'Audio Engineer, Microphone Designer, Musician',
      }, lang),
      sameAs: 'https://kuon-rnd.com/profile',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'JP',
    },
  };

  return [courseLd, faqLd, eduOrgLd];
}

// ─────────────────────────────────────────
// メインページコンポーネント
// ─────────────────────────────────────────
export default function TheoryLpPage() {
  const { lang } = useLang();
  const jsonLds = buildJsonLd(lang);

  return (
    <div style={{ background: PAPER, color: INK, minHeight: '100vh' }}>
      {/* JSON-LD × 3 */}
      {jsonLds.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      {/* ═══════ 1. HERO ═══════ */}
      <section style={{
        padding: 'clamp(4rem, 10vw, 8rem) clamp(1.5rem, 4vw, 3rem) clamp(3rem, 6vw, 5rem)',
        textAlign: 'center' as const,
        maxWidth: 980,
        margin: '0 auto',
      }}>
        <div style={{
          fontFamily: mono,
          fontSize: '0.72rem',
          color: INK_FAINT,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          marginBottom: '1.4rem',
        }}>
          KUON · Music Theory Suite
        </div>
        <h1 style={{
          fontFamily: serif,
          fontSize: 'clamp(2rem, 6vw, 4.5rem)',
          fontWeight: 400,
          letterSpacing: '0.04em',
          lineHeight: 1.35,
          margin: 0,
          color: INK,
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: '世界最高峰の音楽理論を、\nあなたの掌の中に。',
            en: 'The world\'s most\ncomprehensive music theory,\nin the palm of your hand.',
            es: 'La teoría musical más\ncompleta del mundo, en tu mano.',
            ko: '세계 최고 수준의 음악 이론을,\n당신의 손 안에.',
            pt: 'A teoria musical mais\ncompleta do mundo, em suas mãos.',
            de: 'Die umfassendste Musiktheorie\nder Welt, in Ihrer Hand.',
          }, lang).split('\n').map((line, i) => (
            <span key={i} style={{ display: 'block' }}>{line}</span>
          ))}
        </h1>
        <p style={{
          fontFamily: serif,
          fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
          color: INK_SOFT,
          fontStyle: 'italic',
          lineHeight: 1.85,
          maxWidth: 720,
          margin: 'clamp(2rem, 4vw, 3rem) auto 0',
          letterSpacing: '0.02em',
        }}>
          {t({
            ja: '楽典の最初の一文字から、シェンカー分析まで。バッハ 371 コラールから 12 音音楽まで。あなたの音楽人生 60 年を、ひとつの場所で見守り続けます。',
            en: 'From the first letter of music notation to Schenkerian analysis. From Bach\'s 371 chorales to twelve-tone matrices. A single place that walks with you for the next 60 years of your musical life.',
            es: 'Desde la primera letra de la notación hasta Schenker. De los 371 corales de Bach al dodecafonismo. Un solo lugar que te acompaña 60 años de vida musical.',
            ko: '기보법의 첫 글자부터 쉔커 분석까지. 바흐 371 코랄부터 12음 매트릭스까지. 당신의 음악 인생 60년을 한 곳에서.',
            pt: 'Da primeira letra da notação à análise Schenker. Dos 371 corais de Bach às matrizes dodecafônicas. Um único lugar para 60 anos de vida musical.',
            de: 'Vom ersten Zeichen der Notation bis zur Schenker-Analyse. Von Bachs 371 Chorälen bis zu Zwölftonmatrizen. Ein Ort für 60 Jahre Ihres musikalischen Lebens.',
          }, lang)}
        </p>

        {/* CTA: 受講する (準備中) */}
        <div style={{ marginTop: 'clamp(2.5rem, 5vw, 4rem)', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <DisabledCta lang={lang} primary />
          <Link href="/audio-apps" style={{
            display: 'inline-block',
            fontFamily: sans,
            fontSize: '0.85rem',
            color: INK_SOFT,
            textDecoration: 'none',
            padding: '0.85rem 1.6rem',
            border: `1px solid ${STAFF_LINE}`,
            borderRadius: 999,
            letterSpacing: '0.06em',
            transition: 'all 0.2s ease',
          }}>
            {t({
              ja: 'まずは無料アプリを使う →',
              en: 'Try the free apps first →',
              es: 'Probar primero las apps gratis →',
              ko: '무료 앱부터 사용하기 →',
              pt: 'Experimentar apps gratuitos →',
              de: 'Zuerst kostenlose Tools testen →',
            }, lang)}
          </Link>
        </div>

        {/* SMuFL 装飾 (譜表線として) */}
        <div style={{ marginTop: 'clamp(3rem, 5vw, 4rem)', display: 'flex', flexDirection: 'column', gap: 5, opacity: 0.4, maxWidth: 200, margin: '4rem auto 0' }}>
          {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ height: 1, background: STAFF_LINE }} />)}
        </div>
      </section>

      {/* ═══════ 2. TRUST BAR ═══════ */}
      <section style={{
        padding: 'clamp(2rem, 4vw, 3rem) 1rem',
        background: '#fff',
        borderTop: `1px solid ${STAFF_LINE}`,
        borderBottom: `1px solid ${STAFF_LINE}`,
      }}>
        <div style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'clamp(1.5rem, 3vw, 2.5rem)',
        }}>
          <TrustStat
            value={MODULES.length}
            label={t({ ja: 'モジュール', en: 'Modules', es: 'Módulos', ko: '모듈', pt: 'Módulos', de: 'Module' }, lang)}
          />
          <TrustStat
            value={TOTAL_LESSONS}
            label={t({ ja: 'レッスン', en: 'Lessons', es: 'Lecciones', ko: '레슨', pt: 'Lições', de: 'Lektionen' }, lang)}
          />
          <TrustStat
            value={6}
            label={t({ ja: '言語対応', en: 'Languages', es: 'Idiomas', ko: '언어 지원', pt: 'Idiomas', de: 'Sprachen' }, lang)}
          />
          <TrustStat
            valueText="OMT v2"
            label={t({ ja: '基盤教科書', en: 'Foundation', es: 'Base académica', ko: '기반 교과서', pt: 'Base acadêmica', de: 'Grundlagentext' }, lang)}
          />
        </div>
      </section>

      {/* ═══════ 3. THE EMPTY MARKET ═══════ */}
      <section style={{
        padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 3rem)',
        maxWidth: 900,
        margin: '0 auto',
      }}>
        <SectionLabel>{t({ ja: '埋まっていなかった空白', en: 'The empty market', es: 'El mercado vacío', ko: '비어 있던 공백', pt: 'O mercado vazio', de: 'Die unbesetzte Lücke' }, lang)}</SectionLabel>
        <h2 style={{
          fontFamily: serif,
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          fontWeight: 400,
          letterSpacing: '0.03em',
          lineHeight: 1.5,
          marginTop: 0,
          marginBottom: 'clamp(2rem, 4vw, 3rem)',
          color: INK,
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: '世界には、これまで存在しなかった。',
            en: "The world hasn't seen this before.",
            es: 'El mundo no había visto esto.',
            ko: '세계에 존재하지 않았던 것.',
            pt: 'O mundo nunca viu isto.',
            de: 'Das hat die Welt so noch nicht gesehen.',
          }, lang)}
        </h2>
        <p style={{
          fontFamily: serif,
          fontSize: 'clamp(1rem, 1.7vw, 1.15rem)',
          lineHeight: 2,
          color: INK_SOFT,
          letterSpacing: '0.02em',
          margin: 0,
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: 'Auralia と EarMaster は 1990 年代の設計思想のまま。musictheory.net と teoria.com は無料だが進捗管理がない。Yousician と Tonara は子供向けで、プロを目指す音楽家には届かない。MuseScore と Flat.io は譜面中心で、学習プラットフォームとしては不足している。YouTube は断片的な情報の海で、系統立った成長パスがない。',
            en: 'Auralia and EarMaster carry 1990s design DNA. Musictheory.net and teoria.com are free but lack progress tracking. Yousician and Tonara aim at children. MuseScore and Flat.io center on notation, not pedagogy. YouTube is a fragmented sea without a coherent path.',
            es: 'Auralia y EarMaster tienen ADN de los 90. Musictheory.net y teoria.com son gratuitos pero sin seguimiento. Yousician y Tonara apuntan a niños. YouTube es un mar fragmentado sin trayectoria.',
            ko: 'Auralia·EarMaster 는 1990년대 설계 그대로. musictheory.net·teoria.com 은 무료지만 진도 관리 없음. Yousician·Tonara 는 어린이용. YouTube 는 단편적.',
            pt: 'Auralia e EarMaster têm DNA dos anos 1990. Musictheory.net e teoria.com são gratuitos, mas sem rastreio. Yousician e Tonara são para crianças. YouTube é fragmentado.',
            de: 'Auralia und EarMaster tragen das Design der 1990er. Musictheory.net und teoria.com sind kostenlos, aber ohne Fortschrittsverfolgung. Yousician und Tonara zielen auf Kinder. YouTube bleibt fragmentiert.',
          }, lang)}
        </p>
        <p style={{
          fontFamily: serif,
          fontSize: 'clamp(1.05rem, 1.9vw, 1.3rem)',
          lineHeight: 1.85,
          color: INK,
          fontStyle: 'italic',
          letterSpacing: '0.03em',
          marginTop: 'clamp(2rem, 3vw, 2.5rem)',
          marginBottom: 0,
          paddingLeft: 'clamp(1rem, 2vw, 1.5rem)',
          borderLeft: `2px solid ${ACCENT_GOLD}`,
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: '現代的な UI、ブラウザ完結、多言語対応、月額サブスクリプション、楽典基礎から音大卒業レベルまでの完全カリキュラム、ゲーミフィケーション、SRS、SNS 映え、そしてプロ音楽家への敬意 — これらすべてを、ひとつの製品にまとめたものは、世界に存在しなかった。',
            en: 'Modern UI, browser-native, multilingual, monthly subscription, complete curriculum from fundamentals to graduate level, gamification, SRS, SNS-ready, and respect for professional musicians — no single product had ever brought all this together.',
            es: 'UI moderna, navegador nativo, multilingüe, suscripción mensual, currículo completo, gamificación, SRS, listo para redes y respeto por los profesionales — ningún producto los reunía.',
            ko: '현대적 UI, 브라우저 완결, 다국어, 월간 구독, 기초부터 대학원 수준까지 완전 커리큘럼, 게이미피케이션, SRS, SNS 친화, 그리고 프로 음악가에 대한 존중 — 이 모두를 하나로 묶은 제품은 세계에 없었습니다.',
            pt: 'UI moderna, nativo no navegador, multilíngue, assinatura mensal, currículo completo, gamificação, SRS, pronto para redes e respeito ao profissional — nenhum produto reunia tudo.',
            de: 'Moderne UI, browserbasiert, mehrsprachig, monatliches Abo, vollständiger Lehrplan, Gamification, SRS, social-media-tauglich und Respekt vor Profis — kein Produkt brachte das je zusammen.',
          }, lang)}
        </p>
      </section>

      {/* ═══════ 4. CURRICULUM SHOWCASE (16 modules) ═══════ */}
      <section style={{
        padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 3rem)',
        background: '#fff',
        borderTop: `1px solid ${STAFF_LINE}`,
        borderBottom: `1px solid ${STAFF_LINE}`,
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionLabel>{t({ ja: '完全カリキュラム', en: 'Complete curriculum', es: 'Currículo completo', ko: '완전 커리큘럼', pt: 'Currículo completo', de: 'Vollständiger Lehrplan' }, lang)}</SectionLabel>
          <h2 style={{
            fontFamily: serif,
            fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
            fontWeight: 400,
            letterSpacing: '0.03em',
            lineHeight: 1.4,
            margin: '0 0 clamp(0.6rem, 1.5vw, 1rem) 0',
            color: INK,
            wordBreak: 'keep-all' as const,
          }}>
            {t({
              ja: '16 モジュール・553 レッスン',
              en: '16 modules · 553 lessons',
              es: '16 módulos · 553 lecciones',
              ko: '16 모듈 · 553 레슨',
              pt: '16 módulos · 553 lições',
              de: '16 Module · 553 Lektionen',
            }, lang)}
          </h2>
          <p style={{
            fontFamily: serif,
            fontSize: '1rem',
            fontStyle: 'italic',
            color: INK_SOFT,
            margin: '0 0 clamp(2.5rem, 5vw, 4rem) 0',
            lineHeight: 1.8,
          }}>
            {t({
              ja: '基礎 (M0・M1・M11) → 中級 (M2・M3・M4・M12) → 上級 (M5-M7・M10・M13) → 大学院 (M8・M9・M14・M15)。診断テストがあなたを最適な地点へ運びます。',
              en: 'Foundation (M0, M1, M11) → Intermediate (M2, M3, M4, M12) → Advanced (M5-M7, M10, M13) → Graduate (M8, M9, M14, M15). The diagnostic test takes you to the right starting point.',
              es: 'Fundamentos → Intermedio → Avanzado → Grado. El diagnóstico te lleva al lugar correcto.',
              ko: '기초 → 중급 → 고급 → 대학원. 진단 테스트가 적절한 지점으로 안내.',
              pt: 'Fundamentos → Intermediário → Avançado → Pós-graduação. O diagnóstico encontra seu ponto certo.',
              de: 'Grundlagen → Mittelstufe → Fortgeschritten → Hochschulstufe. Der Einstufungstest führt Sie zum passenden Start.',
            }, lang)}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
          }}>
            {MODULES.map(m => <ModuleCard key={m.id} module={m} lang={lang} />)}
          </div>
        </div>
      </section>

      {/* ═══════ 5. IQ180 FEATURES ═══════ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 3rem)', maxWidth: 1100, margin: '0 auto' }}>
        <SectionLabel>{t({ ja: '8 つの差別化要素', en: 'Eight defining features', es: 'Ocho características distintivas', ko: '8 가지 차별화 요소', pt: 'Oito características distintivas', de: 'Acht prägende Merkmale' }, lang)}</SectionLabel>
        <h2 style={{
          fontFamily: serif,
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          fontWeight: 400,
          letterSpacing: '0.03em',
          lineHeight: 1.4,
          margin: '0 0 clamp(2.5rem, 5vw, 4rem) 0',
          color: INK,
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: 'これがあったから、生まれた。',
            en: 'Built because nothing else had this.',
            es: 'Creado porque nada más lo tenía.',
            ko: '없었기에 만들었습니다.',
            pt: 'Criado porque nada mais tinha isto.',
            de: 'Entstanden, weil es das so nicht gab.',
          }, lang)}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(1.5rem, 3vw, 2.5rem)',
        }}>
          {FEATURES.map(f => <FeatureCard key={f.num} feature={f} lang={lang} />)}
        </div>
      </section>

      {/* ═══════ 6. OMT v2 ACADEMIC CREDIBILITY ═══════ */}
      <section style={{
        padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 3rem)',
        background: PAPER_DEEP,
        borderTop: `1px solid ${STAFF_LINE}`,
        borderBottom: `1px solid ${STAFF_LINE}`,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionLabel>{t({ ja: '学術的基盤', en: 'Academic foundation', es: 'Base académica', ko: '학술적 기반', pt: 'Base acadêmica', de: 'Akademische Grundlage' }, lang)}</SectionLabel>
          <h2 style={{
            fontFamily: serif,
            fontSize: 'clamp(1.65rem, 3.8vw, 2.5rem)',
            fontWeight: 400,
            letterSpacing: '0.03em',
            lineHeight: 1.5,
            margin: '0 0 clamp(2rem, 4vw, 3rem) 0',
            color: INK,
            wordBreak: 'keep-all' as const,
          }}>
            {t({
              ja: 'Open Music Theory v2 を骨格として。',
              en: 'Built upon Open Music Theory v2.',
              es: 'Sobre Open Music Theory v2.',
              ko: 'Open Music Theory v2 를 기반으로.',
              pt: 'Sobre o Open Music Theory v2.',
              de: 'Auf Basis von Open Music Theory v2.',
            }, lang)}
          </h2>
          <p style={{
            fontFamily: serif,
            fontSize: 'clamp(1rem, 1.7vw, 1.15rem)',
            lineHeight: 2,
            color: INK_SOFT,
            margin: '0 0 1.5rem 0',
            letterSpacing: '0.02em',
            wordBreak: 'keep-all' as const,
          }}>
            {t({
              ja: 'Mark Gotham 博士 (ケンブリッジ大)、Megan Lavengood 博士 (ジョージ・メイソン大)、Brian Jarvis 博士、Chelsey Hamm 博士、Bryn Hughes 博士、Kyle Gullings 博士、John Peterson 博士の 7 名による Open Music Theory v2 (CC BY-SA 4.0) は、北米の音楽学部で標準教科書として正式採用されている権威ある内容です。',
              en: 'Open Music Theory v2 (CC BY-SA 4.0), authored by Dr. Mark Gotham (Cambridge), Dr. Megan Lavengood (George Mason), Dr. Brian Jarvis, Dr. Chelsey Hamm, Dr. Bryn Hughes, Dr. Kyle Gullings, and Dr. John Peterson, is officially adopted as a standard textbook across North American music departments.',
              es: 'Open Music Theory v2 (CC BY-SA 4.0), escrito por 7 catedráticos liderados por Mark Gotham (Cambridge) y Megan Lavengood (GMU), es libro estándar en departamentos universitarios.',
              ko: 'Mark Gotham 박사 (케임브리지), Megan Lavengood 박사 (조지 메이슨) 외 7 인 공저 Open Music Theory v2 (CC BY-SA 4.0) 는 북미 음악 학부의 표준 교과서.',
              pt: 'Open Music Theory v2 (CC BY-SA 4.0), por 7 professores liderados por Mark Gotham (Cambridge) e Megan Lavengood (GMU), é livro padrão em departamentos universitários.',
              de: 'Open Music Theory v2 (CC BY-SA 4.0), verfasst von sieben Hochschullehrer:innen unter Leitung von Dr. Mark Gotham (Cambridge) und Dr. Megan Lavengood (GMU), ist Standardlehrbuch nordamerikanischer Musikfakultäten.',
            }, lang)}
          </p>
          <p style={{
            fontFamily: serif,
            fontSize: 'clamp(1rem, 1.7vw, 1.15rem)',
            lineHeight: 2,
            color: INK_SOFT,
            margin: 0,
            letterSpacing: '0.02em',
            wordBreak: 'keep-all' as const,
          }}>
            {t({
              ja: '空音開発はこの権威ある教科書を骨格とし、独自の M0 (音楽との出会い)、M11 (コールユーブンゲン・聴音)、M12 (ソルフェージュ・視唱)、M13 (音楽史)、M15 (作曲実技) を加えて全 16 モジュールに完成させました。CC BY-SA 4.0 のクレジット表記義務を遵守し、改変版レッスンも GitHub (kuon-music-theory-curriculum) で同ライセンスで公開します。学術コミュニティへの還元です。',
              en: 'Kuon R&D extends this authoritative textbook with our own M0 (First Encounter with Music), M11 (Coleübungen & Ear Training), M12 (Solfège & Sight Singing), M13 (Music History), and M15 (Composition Practice) to complete the 16-module curriculum. We honor CC BY-SA 4.0 attribution and publish our derivative lessons on GitHub under the same license — a contribution back to the academic community.',
              es: 'Kuon extiende este texto canónico con módulos propios M0, M11, M12, M13, M15 y publica los derivados bajo CC BY-SA 4.0 en GitHub — devolución a la comunidad académica.',
              ko: 'Kuon 은 권위 교과서에 자체 모듈 M0·M11·M12·M13·M15 를 추가하여 전 16 모듈 완성. CC BY-SA 4.0 준수, GitHub 에 파생본 공개 — 학술 커뮤니티에 환원.',
              pt: 'A Kuon estende este texto canônico com módulos próprios M0, M11, M12, M13, M15. Publicamos derivados sob CC BY-SA 4.0 no GitHub — retorno à comunidade acadêmica.',
              de: 'Kuon ergänzt das maßgebliche Lehrbuch um eigene Module M0, M11, M12, M13, M15 und veröffentlicht abgeleitete Lektionen unter CC BY-SA 4.0 auf GitHub — als Beitrag an die akademische Gemeinschaft.',
            }, lang)}
          </p>
          <div style={{
            marginTop: 'clamp(2rem, 4vw, 3rem)',
            paddingTop: 'clamp(1.5rem, 3vw, 2rem)',
            borderTop: `1px solid ${STAFF_LINE}`,
            display: 'flex',
            justifyContent: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
            fontFamily: sans,
            fontSize: '0.78rem',
            color: INK_FAINT,
            letterSpacing: '0.05em',
          }}>
            <span>Cambridge University</span>
            <span style={{ color: STAFF_LINE }}>·</span>
            <span>George Mason University</span>
            <span style={{ color: STAFF_LINE }}>·</span>
            <span>CC BY-SA 4.0</span>
          </div>
        </div>
      </section>

      {/* ═══════ 7. FOR WHOM ═══════ */}
      <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 3rem)', maxWidth: 1100, margin: '0 auto' }}>
        <SectionLabel>{t({ ja: '誰のためのものか', en: 'Who this is for', es: 'Para quién es', ko: '누구를 위한 것인가', pt: 'Para quem é', de: 'Für wen es gedacht ist' }, lang)}</SectionLabel>
        <h2 style={{
          fontFamily: serif,
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          fontWeight: 400,
          letterSpacing: '0.03em',
          lineHeight: 1.4,
          margin: '0 0 clamp(2.5rem, 5vw, 4rem) 0',
          color: INK,
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: '音楽を、本気で。',
            en: 'For those serious about music.',
            es: 'Para quien va en serio con la música.',
            ko: '진지하게 음악을 하는 이를 위해.',
            pt: 'Para quem leva a música a sério.',
            de: 'Für alle, die es mit Musik ernst meinen.',
          }, lang)}
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(1.2rem, 2.5vw, 1.8rem)',
        }}>
          {PERSONAS.map(p => (
            <div key={p.id} style={{
              background: '#fff',
              border: `1px solid ${STAFF_LINE}`,
              borderRadius: 4,
              padding: 'clamp(1.5rem, 3vw, 2rem)',
            }}>
              <h3 style={{
                fontFamily: serif,
                fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
                fontWeight: 500,
                letterSpacing: '0.03em',
                lineHeight: 1.5,
                margin: '0 0 0.7rem 0',
                color: INK,
                wordBreak: 'keep-all' as const,
              }}>
                {t(p.title, lang)}
              </h3>
              <p style={{
                fontFamily: sans,
                fontSize: '0.88rem',
                color: INK_SOFT,
                lineHeight: 1.75,
                margin: 0,
                letterSpacing: '0.01em',
              }}>
                {t(p.desc, lang)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ 8. 余白の知性 AESTHETIC STATEMENT ═══════ */}
      <section style={{
        padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 4vw, 3rem)',
        background: INK,
        color: PAPER,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' as const }}>
          <div style={{
            fontFamily: mono,
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            marginBottom: '1.4rem',
          }}>
            {t({ ja: '美意識', en: 'Aesthetic', es: 'Estética', ko: '미의식', pt: 'Estética', de: 'Ästhetik' }, lang)}
          </div>
          <h2 style={{
            fontFamily: serif,
            fontSize: 'clamp(1.75rem, 4.5vw, 3rem)',
            fontWeight: 300,
            letterSpacing: '0.04em',
            lineHeight: 1.55,
            margin: '0 0 2rem 0',
            color: PAPER,
            wordBreak: 'keep-all' as const,
          }}>
            {t({
              ja: '余白の、知性。',
              en: 'The intelligence\nof negative space.',
              es: 'La inteligencia\ndel espacio en blanco.',
              ko: '여백의 지성.',
              pt: 'A inteligência\ndo espaço em branco.',
              de: 'Die Intelligenz\ndes leeren Raums.',
            }, lang)}
          </h2>
          <p style={{
            fontFamily: serif,
            fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)',
            color: 'rgba(255,255,255,0.78)',
            lineHeight: 2.05,
            fontStyle: 'italic',
            margin: 0,
            letterSpacing: '0.03em',
            wordBreak: 'keep-all' as const,
          }}>
            {t({
              ja: '能の舞台、水墨画の余白、北欧のミニマリズム、Apple のヒューマンインターフェース。情報を詰め込まないこと、装飾を抑えること、それ自体がユーザーへの敬意になります。マスコットを使わず、感嘆符を打たず、毎日見ても疲れない静寂を — 60 年使っても古びない場所を、目指しています。',
              en: 'Noh theatre, sumi-e ink wash, Scandinavian minimalism, Apple Human Interface. Restraint of information and ornament is itself a form of respect. No mascots, no exclamation marks, only the silence that does not tire after daily use — a place that does not age in 60 years.',
              es: 'Teatro Noh, tinta sumi-e, minimalismo nórdico, Apple HIG. La contención misma es respeto. Sin mascotas, sin exclamaciones, un silencio que no cansa.',
              ko: '노오 연극, 수묵화의 여백, 북유럽 미니멀리즘, Apple 휴먼 인터페이스. 정보를 절제하는 것이 곧 존중. 마스코트도 감탄부호도 없는, 60년이 지나도 낡지 않는 정적.',
              pt: 'Teatro Nô, sumi-ê, minimalismo escandinavo, Apple HIG. A contenção é respeito. Sem mascotes, sem exclamações, um silêncio que não cansa.',
              de: 'Nō-Theater, Sumi-e, skandinavischer Minimalismus, Apple HIG. Zurückhaltung selbst ist Respekt. Keine Maskottchen, keine Ausrufezeichen — eine Stille, die in 60 Jahren nicht ermüdet.',
            }, lang)}
          </p>
        </div>
      </section>

      {/* ═══════ 9. PRICING ═══════ */}
      <section style={{
        padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 3rem)',
        maxWidth: 900,
        margin: '0 auto',
        textAlign: 'center' as const,
      }}>
        <SectionLabel>{t({ ja: '料金', en: 'Pricing', es: 'Precios', ko: '요금', pt: 'Preços', de: 'Preise' }, lang)}</SectionLabel>
        <h2 style={{
          fontFamily: serif,
          fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
          fontWeight: 400,
          letterSpacing: '0.03em',
          lineHeight: 1.4,
          margin: '0 0 clamp(1rem, 2vw, 1.5rem) 0',
          color: INK,
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: 'Prelude プランから、すべて。',
            en: 'Everything from Prelude up.',
            es: 'Todo desde Prelude.',
            ko: 'Prelude 부터 전부.',
            pt: 'Tudo a partir do Prelude.',
            de: 'Alles ab Prelude.',
          }, lang)}
        </h2>
        <p style={{
          fontFamily: serif,
          fontSize: '1rem',
          color: INK_SOFT,
          fontStyle: 'italic',
          margin: '0 0 clamp(2.5rem, 5vw, 3.5rem) 0',
          lineHeight: 1.85,
          maxWidth: 580,
          marginLeft: 'auto',
          marginRight: 'auto',
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: 'Theory Suite の 16 モジュール 553 レッスンに、ブラウザで動く 30 以上のアプリと、成長ダッシュボードが付帯します。年額プランなら 2 ヶ月分お得です。',
            en: 'The 16-module, 553-lesson Theory Suite comes with 30+ browser-native apps and a growth dashboard. The yearly plan saves you two months.',
            es: 'Las 553 lecciones llegan con más de 30 apps en el navegador y un panel de crecimiento. El anual ahorra dos meses.',
            ko: '553 레슨에 브라우저 도구 30+ 개와 성장 대시보드 포함. 연간 플랜은 2 개월 무료.',
            pt: 'As 553 lições vêm com mais de 30 apps no navegador e painel de crescimento. O anual economiza dois meses.',
            de: 'Zu den 553 Lektionen kommen 30+ browserbasierte Tools und ein Wachstums-Dashboard. Jahresplan: zwei Monate gespart.',
          }, lang)}
        </p>
        <div style={{
          background: '#fff',
          border: `1px solid ${STAFF_LINE}`,
          borderRadius: 6,
          padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.5rem)',
          maxWidth: 460,
          margin: '0 auto',
        }}>
          <div style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            Prelude
          </div>
          <div style={{
            fontFamily: serif,
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: 400,
            color: INK,
            lineHeight: 1,
            marginBottom: '0.5rem',
            letterSpacing: '0.02em',
          }}>
            ¥780
            <span style={{ fontSize: '0.4em', color: INK_FAINT, marginLeft: '0.3rem' }}>/ {t({ ja: '月', en: 'month', es: 'mes', ko: '월', pt: 'mês', de: 'Monat' }, lang)}</span>
          </div>
          <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, marginBottom: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '0.04em' }}>
            {t({
              ja: '年額 ¥7,800 (2 ヶ月分お得)',
              en: 'Yearly ¥7,800 (save 2 months)',
              es: 'Anual ¥7,800 (ahorras 2 meses)',
              ko: '연 ¥7,800 (2 개월 무료)',
              pt: 'Anual ¥7,800 (2 meses grátis)',
              de: 'Jährlich ¥7,800 (zwei Monate gespart)',
            }, lang)}
          </div>
          <DisabledCta lang={lang} />
        </div>
      </section>

      {/* ═══════ 10. FAQ ═══════ */}
      <section style={{
        padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 3rem)',
        background: '#fff',
        borderTop: `1px solid ${STAFF_LINE}`,
        borderBottom: `1px solid ${STAFF_LINE}`,
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <SectionLabel>{t({ ja: 'よくある質問', en: 'Questions', es: 'Preguntas', ko: '자주 묻는 질문', pt: 'Perguntas', de: 'Fragen' }, lang)}</SectionLabel>
          <h2 style={{
            fontFamily: serif,
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 400,
            letterSpacing: '0.03em',
            lineHeight: 1.4,
            margin: '0 0 clamp(2.5rem, 5vw, 4rem) 0',
            color: INK,
          }}>
            {t({
              ja: '質問と、答え。',
              en: 'Questions and answers.',
              es: 'Preguntas y respuestas.',
              ko: '질문과 답.',
              pt: 'Perguntas e respostas.',
              de: 'Fragen und Antworten.',
            }, lang)}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.5rem, 3vw, 2rem)' }}>
            {FAQS.map((f, i) => (
              <details key={i} style={{
                borderBottom: `1px solid ${STAFF_LINE}`,
                paddingBottom: 'clamp(1.2rem, 2.5vw, 1.8rem)',
              }}>
                <summary style={{
                  fontFamily: serif,
                  fontSize: 'clamp(1rem, 1.8vw, 1.15rem)',
                  fontWeight: 500,
                  color: INK,
                  cursor: 'pointer',
                  letterSpacing: '0.02em',
                  lineHeight: 1.6,
                  paddingRight: '1rem',
                }}>
                  {t(f.q, lang)}
                </summary>
                <p style={{
                  fontFamily: serif,
                  fontSize: 'clamp(0.92rem, 1.6vw, 1.05rem)',
                  color: INK_SOFT,
                  lineHeight: 2,
                  marginTop: '1rem',
                  marginBottom: 0,
                  letterSpacing: '0.02em',
                  wordBreak: 'keep-all' as const,
                }}>
                  {t(f.a, lang)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ 11. FOUNDER'S NOTE ═══════ */}
      <section style={{
        padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 3rem)',
        maxWidth: 800,
        margin: '0 auto',
      }}>
        <SectionLabel>{t({ ja: '創業者から', en: 'From the founder', es: 'Del fundador', ko: '창업자로부터', pt: 'Do fundador', de: 'Vom Gründer' }, lang)}</SectionLabel>
        <blockquote style={{
          fontFamily: serif,
          fontSize: 'clamp(1.05rem, 2vw, 1.35rem)',
          fontStyle: 'italic',
          color: INK,
          lineHeight: 2,
          margin: '0 0 1.5rem 0',
          padding: 0,
          borderLeft: `2px solid ${ACCENT_GOLD}`,
          paddingLeft: 'clamp(1.5rem, 3vw, 2rem)',
          letterSpacing: '0.03em',
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: '私自身も、音大に進む過程で楽典・和声・聴音と長く付き合ってきました。学生だった私が欲しかったのは、子供向けでもなく、退屈でもなく、けれど真摯にプロを目指す自分を子供扱いしない、長年付き合える場所でした。',
            en: 'I, too, grappled with music theory, harmony, and ear training on my way through music school. What I wanted as a student was a place that was neither childish nor dull — a place that did not condescend to the seriousness of someone seeking a professional path, and could walk with me for years.',
            es: 'Yo mismo lidié con la teoría, la armonía y la audición en el conservatorio. Lo que quería como estudiante era un lugar ni infantil ni aburrido, que no me tratase con condescendencia y que pudiera acompañarme durante años.',
            ko: '저 자신도 음대 진학 과정에서 악전·화성·청음과 오래 씨름했습니다. 학생 시절 제가 원했던 것은 어린이용도 아니고 지루하지도 않은, 프로를 목표로 하는 자신을 어린이 취급하지 않고 오래 동행해줄 수 있는 장소였습니다.',
            pt: 'Eu mesmo enfrentei teoria, harmonia e percepção no caminho do conservatório. Como estudante, queria um lugar nem infantil nem chato, que não me subestimasse e que andasse comigo por anos.',
            de: 'Ich selbst habe auf dem Weg zur Musikhochschule lange mit Musiklehre, Harmonie und Gehörbildung gerungen. Was ich als Student suchte, war ein Ort — weder kindlich noch langweilig —, der den Ernst eines angehenden Profis nicht herabwürdigt und über Jahre mitgehen kann.',
          }, lang)}
        </blockquote>
        <p style={{
          fontFamily: serif,
          fontSize: '1rem',
          color: INK_SOFT,
          lineHeight: 2,
          margin: '0 0 1.5rem 0',
          paddingLeft: 'clamp(1.5rem, 3vw, 2rem)',
          letterSpacing: '0.02em',
          wordBreak: 'keep-all' as const,
        }}>
          {t({
            ja: '空音開発が目指すのは、世界中の音楽を志すすべての個人 — 学費に制約のある若者、音大カリキュラムに物足りなさを感じる学生、フリーランスとして演奏を続ける音楽家、社会人になってから本気で音楽に向き合い直す人、そして子供に本物の選択肢を与えたい親 — その全員が「自分の場所だ」と感じられる、ひとつのプラットフォームです。',
            en: 'Kuon R&D aims to be the single platform that every serious individual on a musical path — the budget-constrained aspirant, the conservatory student who wants more, the freelance performer, the adult returning to music in earnest, the parent seeking a real alternative for their child — can call their own place.',
            es: 'Kuon R&D quiere ser la plataforma donde cada individuo serio en un camino musical pueda decir: este es mi sitio.',
            ko: '공음개발은 음악을 진지하게 추구하는 세계 모든 개인 — 학비에 제약받는 청소년, 음대 커리큘럼이 부족하다 느끼는 학생, 프리랜서로 연주를 이어가는 음악가, 사회인이 되어 다시 진지하게 음악과 마주하는 사람, 아이에게 진짜 선택지를 주고 싶은 부모 — 그 모두가 "나의 장소"라 느낄 수 있는 단일 플랫폼을 지향합니다.',
            pt: 'A Kuon R&D quer ser a plataforma onde cada indivíduo sério no caminho musical possa dizer: este é o meu lugar.',
            de: 'Kuon R&D will die eine Plattform sein, die jede:r ernsthafte musikalische Mensch — von Budgetbegrenzten bis Wiedereinsteigenden — als eigenen Ort empfindet.',
          }, lang)}
        </p>
        <div style={{
          fontFamily: sans,
          fontSize: '0.85rem',
          color: INK_SOFT,
          letterSpacing: '0.05em',
          paddingLeft: 'clamp(1.5rem, 3vw, 2rem)',
        }}>
          —{' '}
          <Link href="/profile" style={{ color: INK, textDecoration: 'none', borderBottom: `1px solid ${STAFF_LINE}` }}>
            {t({
              ja: '朝比奈幸太郎 (Kotaro Asahina)',
              en: 'Kotaro Asahina',
              es: 'Kotaro Asahina',
              ko: 'Kotaro Asahina (아사히나 코타로)',
              pt: 'Kotaro Asahina',
              de: 'Kotaro Asahina',
            }, lang)}
          </Link>
        </div>
      </section>

      {/* ═══════ 12. FINAL CTA ═══════ */}
      <section style={{
        padding: 'clamp(5rem, 10vw, 8rem) clamp(1.5rem, 4vw, 3rem)',
        background: PAPER_DEEP,
        borderTop: `1px solid ${STAFF_LINE}`,
        textAlign: 'center' as const,
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{
            fontFamily: serif,
            fontSize: 'clamp(1.75rem, 4.5vw, 3rem)',
            fontWeight: 400,
            letterSpacing: '0.04em',
            lineHeight: 1.4,
            margin: '0 0 clamp(1.5rem, 3vw, 2rem) 0',
            color: INK,
            wordBreak: 'keep-all' as const,
          }}>
            {t({
              ja: '60 年使えるものを、いま。',
              en: 'Built for the next 60 years.',
              es: 'Hecho para los próximos 60 años.',
              ko: '60년 사용할 것을, 지금.',
              pt: 'Feito para os próximos 60 anos.',
              de: 'Für die nächsten 60 Jahre gebaut.',
            }, lang)}
          </h2>
          <p style={{
            fontFamily: serif,
            fontSize: 'clamp(1rem, 1.7vw, 1.15rem)',
            color: INK_SOFT,
            lineHeight: 1.95,
            fontStyle: 'italic',
            margin: '0 0 clamp(2.5rem, 5vw, 3.5rem) 0',
            wordBreak: 'keep-all' as const,
          }}>
            {t({
              ja: '受講ボタンは現在準備中です。MVP 公開時にあなたが最初に通知を受け取れるよう、無料アカウント作成のみ受付中です。',
              en: 'Enrollment is in preparation. Create a free account today to be the first to know when MVP opens.',
              es: 'La matrícula está en preparación. Crea una cuenta gratuita para recibir aviso al abrir.',
              ko: '수강 신청은 준비 중입니다. 무료 계정을 만들어 두시면 MVP 오픈 시 우선 알림.',
              pt: 'A matrícula está em preparação. Crie uma conta grátis para receber aviso na abertura.',
              de: 'Die Anmeldung ist in Vorbereitung. Legen Sie ein kostenloses Konto an, um zur MVP-Öffnung benachrichtigt zu werden.',
            }, lang)}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <DisabledCta lang={lang} primary />
            <Link href="/auth/login" style={{
              display: 'inline-block',
              fontFamily: sans,
              fontSize: '0.9rem',
              color: INK,
              textDecoration: 'none',
              padding: '0.85rem 1.8rem',
              border: `1px solid ${INK}`,
              borderRadius: 999,
              letterSpacing: '0.06em',
              transition: 'all 0.2s ease',
              fontWeight: 500,
            }}>
              {t({
                ja: '無料アカウントを作成',
                en: 'Create a free account',
                es: 'Crear cuenta gratis',
                ko: '무료 계정 만들기',
                pt: 'Criar conta grátis',
                de: 'Kostenloses Konto anlegen',
              }, lang)}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────
// サブコンポーネント
// ─────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: mono,
      fontSize: '0.7rem',
      color: INK_FAINT,
      letterSpacing: '0.28em',
      textTransform: 'uppercase',
      marginBottom: 'clamp(1rem, 2vw, 1.4rem)',
    }}>
      {children}
    </div>
  );
}

function TrustStat({ value, valueText, label }: { value?: number; valueText?: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' as const }}>
      <div style={{
        fontFamily: serif,
        fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
        fontWeight: 400,
        color: INK,
        lineHeight: 1,
        letterSpacing: '0.02em',
      }}>
        {valueText ?? value}
      </div>
      <div style={{
        fontFamily: sans,
        fontSize: '0.7rem',
        color: INK_FAINT,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        marginTop: '0.6rem',
      }}>
        {label}
      </div>
    </div>
  );
}

function ModuleCard({ module: m, lang }: { module: ModuleDef; lang: Lang }) {
  const levelColors: Record<typeof m.level, string> = {
    foundation: ACCENT_INDIGO,
    intermediate: ACCENT_VINE,
    advanced: ACCENT_GOLD,
    graduate: INK,
  };
  const levelLabels: Record<typeof m.level, L6> = {
    foundation: { ja: '基礎', en: 'Foundation', es: 'Fundamento', ko: '기초', pt: 'Fundamento', de: 'Grundlage' },
    intermediate: { ja: '中級', en: 'Intermediate', es: 'Intermedio', ko: '중급', pt: 'Intermediário', de: 'Mittelstufe' },
    advanced: { ja: '上級', en: 'Advanced', es: 'Avanzado', ko: '고급', pt: 'Avançado', de: 'Fortgeschritten' },
    graduate: { ja: '大学院', en: 'Graduate', es: 'Posgrado', ko: '대학원', pt: 'Pós-graduação', de: 'Hochschulstufe' },
  };
  return (
    <div style={{
      background: PAPER,
      border: `1px solid ${STAFF_LINE}`,
      borderRadius: 4,
      padding: 'clamp(1.4rem, 2.5vw, 1.8rem)',
      transition: 'all 0.25s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.8rem' }}>
        <span style={{
          fontFamily: mono,
          fontSize: '0.72rem',
          color: levelColors[m.level],
          letterSpacing: '0.18em',
          fontWeight: 600,
        }}>
          {m.num}
        </span>
        <span style={{
          fontFamily: sans,
          fontSize: '0.66rem',
          color: INK_FAINT,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          {t(levelLabels[m.level], lang)} · {m.lessonCount} {t({ ja: 'L', en: 'L', es: 'L', ko: 'L', pt: 'L', de: 'L' }, lang)}
        </span>
      </div>
      <h3 style={{
        fontFamily: serif,
        fontSize: 'clamp(1.05rem, 1.8vw, 1.2rem)',
        fontWeight: 500,
        color: INK,
        margin: '0 0 0.6rem 0',
        letterSpacing: '0.03em',
        lineHeight: 1.45,
        wordBreak: 'keep-all' as const,
      }}>
        {t(m.title, lang)}
      </h3>
      <p style={{
        fontFamily: sans,
        fontSize: '0.82rem',
        color: INK_SOFT,
        lineHeight: 1.75,
        margin: 0,
        letterSpacing: '0.01em',
      }}>
        {t(m.desc, lang)}
      </p>
    </div>
  );
}

function FeatureCard({ feature: f, lang }: { feature: { num: string; title: L6; desc: L6 }; lang: Lang }) {
  return (
    <div style={{
      padding: 'clamp(1.5rem, 3vw, 2rem)',
      background: '#fff',
      border: `1px solid ${STAFF_LINE}`,
      borderRadius: 4,
    }}>
      <div style={{
        fontFamily: mono,
        fontSize: '0.72rem',
        color: ACCENT_GOLD,
        letterSpacing: '0.18em',
        marginBottom: '0.8rem',
        fontWeight: 600,
      }}>
        {f.num}
      </div>
      <h3 style={{
        fontFamily: serif,
        fontSize: 'clamp(1.1rem, 2vw, 1.3rem)',
        fontWeight: 500,
        color: INK,
        margin: '0 0 0.8rem 0',
        letterSpacing: '0.03em',
        lineHeight: 1.5,
        wordBreak: 'keep-all' as const,
      }}>
        {t(f.title, lang)}
      </h3>
      <p style={{
        fontFamily: serif,
        fontSize: '0.92rem',
        color: INK_SOFT,
        lineHeight: 1.95,
        margin: 0,
        letterSpacing: '0.02em',
        wordBreak: 'keep-all' as const,
      }}>
        {t(f.desc, lang)}
      </p>
    </div>
  );
}

function DisabledCta({ lang, primary }: { lang: Lang; primary?: boolean }) {
  // 2026-04-29 開講: MVP として M0-01 / M1-40 / M4-01 が公開済み (OMT v2 章順準拠)。
  // §47 の見切り発車戦略に従い、CTA を /theory ハブへの実リンクに切替。
  // 「MVP」バッジで開発初期であることを誠実に伝える。
  const label = t({
    ja: '受講する',
    en: 'Enroll',
    es: 'Matricularse',
    ko: '수강하기',
    pt: 'Matricular-se',
    de: 'Einschreiben',
  }, lang);
  const badgeLabel = t({
    ja: 'MVP',
    en: 'MVP',
    es: 'MVP',
    ko: 'MVP',
    pt: 'MVP',
    de: 'MVP',
  }, lang);
  return (
    <Link
      href="/theory"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.7rem',
        fontFamily: sans,
        fontSize: primary ? '0.95rem' : '0.85rem',
        fontWeight: 500,
        color: primary ? PAPER : INK,
        background: primary ? INK : 'transparent',
        border: primary ? 'none' : `1px solid ${INK}`,
        borderRadius: 999,
        padding: primary ? '1rem 2rem' : '0.85rem 1.6rem',
        letterSpacing: '0.06em',
        textDecoration: 'none',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        if (primary) e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <span>{label}</span>
      <span style={{
        fontFamily: mono,
        fontSize: '0.62rem',
        letterSpacing: '0.18em',
        color: primary ? 'rgba(255,255,255,0.7)' : INK_FAINT,
        padding: '0.18rem 0.55rem',
        border: primary ? '1px solid rgba(255,255,255,0.35)' : `1px solid ${STAFF_LINE}`,
        borderRadius: 999,
      }}>
        {badgeLabel}
      </span>
      <span style={{ fontSize: '0.85em' }}>→</span>
    </Link>
  );
}
