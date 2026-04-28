'use client';

/**
 * KUON CLASSICAL ANALYSIS — Landing Page
 * =========================================================
 * 完全多言語対応 (ja/en/es/ko/pt/de)・SEO + GEO 最適化
 *
 * GEO (Generative Engine Optimization) 対策:
 *   - 明確な FAQ 構造化データ (AI クローラーが引用しやすい)
 *   - HowTo 構造化データ (使い方を AI が理解できる形式)
 *   - SoftwareApplication 構造化データ (ChatGPT 等が紹介できる)
 *   - 具体的な数字 (600+ 曲、月 ¥1,480 等)
 *   - 用語の正規化 (Roman numeral analysis = ローマ数字分析)
 */

import { useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", Consolas, monospace';

const ACCENT = '#5b21b6';
const GOLD = '#b45309';
const BG_CREAM = '#fafaf7';

type L6 = Partial<Record<Lang, string>> & { en: string };
const t = (m: L6, lang: Lang): string => m[lang] ?? m.en;

// ────────────────────────────────────────────────────────────
// 翻訳辞書（全 6 言語完全対応）
// ────────────────────────────────────────────────────────────

const HERO = {
  eyebrow: { ja: 'KUON CLASSICAL ANALYSIS', en: 'KUON CLASSICAL ANALYSIS', es: 'KUON CLASSICAL ANALYSIS', ko: 'KUON CLASSICAL ANALYSIS', pt: 'KUON CLASSICAL ANALYSIS', de: 'KUON CLASSICAL ANALYSIS' } as L6,
  title: {
    ja: 'Western art music を、\n科学的に読み解く。',
    en: 'Read Western art music\nwith scientific clarity.',
    es: 'Lea la música clásica\ncon claridad científica.',
    ko: '서양 클래식 음악을\n과학적으로 분석합니다.',
    pt: 'Leia música clássica\ncom clareza científica.',
    de: 'Klassische Musik wissenschaftlich\nverstehen — sofort.',
  } as L6,
  sub: {
    ja: 'バッハのコラール、モーツァルトのソナタ、ベートーベンの四重奏曲を、瞬時にローマ数字で分析。600+ 曲のキュレーションライブラリ内蔵。和声学の宿題が 5 秒で。',
    en: 'Instantly analyze Bach chorales, Mozart sonatas, and Beethoven quartets with Roman numerals. 600+ curated pieces built in. Harmony homework in 5 seconds.',
    es: 'Analiza al instante las corales de Bach, sonatas de Mozart y cuartetos de Beethoven con números romanos. 600+ piezas seleccionadas integradas. Tarea de armonía en 5 segundos.',
    ko: '바흐의 코랄, 모차르트의 소나타, 베토벤의 사중주를 즉시 로마 숫자로 분석합니다. 600+ 큐레이션 작품 내장. 화성학 과제를 5초 안에.',
    pt: 'Analise instantaneamente corais de Bach, sonatas de Mozart e quartetos de Beethoven com algarismos romanos. 600+ peças selecionadas integradas. Tarefa de harmonia em 5 segundos.',
    de: 'Bach-Choräle, Mozart-Sonaten, Beethoven-Quartette sofort mit Stufentheorie analysieren. 600+ kuratierte Werke integriert. Harmonielehre-Hausaufgabe in 5 Sekunden.',
  } as L6,
  ctaPrimary: { ja: '使ってみる', en: 'Try it now', es: 'Pruébelo ahora', ko: '지금 시작', pt: 'Experimentar agora', de: 'Jetzt ausprobieren' } as L6,
  ctaSecondary: { ja: '料金プラン', en: 'See pricing', es: 'Ver precios', ko: '요금제', pt: 'Ver preços', de: 'Preise ansehen' } as L6,
};

const TRUST_BAR = [
  { num: '600+', label: { ja: '内蔵楽曲', en: 'Built-in pieces', es: 'Piezas integradas', ko: '내장 곡', pt: 'Peças integradas', de: 'Integrierte Werke' } as L6 },
  { num: '1600-1900', label: { ja: 'Common Practice', en: 'Common Practice', es: 'Práctica Común', ko: 'Common Practice', pt: 'Common Practice', de: 'Common Practice' } as L6 },
  { num: '5sec', label: { ja: '平均分析時間', en: 'Avg. analysis time', es: 'Tiempo medio', ko: '평균 분석 시간', pt: 'Tempo médio', de: 'Ø Analysezeit' } as L6 },
  { num: '6', label: { ja: '対応言語', en: 'Languages', es: 'Idiomas', ko: '지원 언어', pt: 'Idiomas', de: 'Sprachen' } as L6 },
];

const FEATURES = [
  {
    icon: '📜',
    title: { ja: 'ローマ数字自動分析', en: 'Roman numeral analysis', es: 'Análisis con números romanos', ko: '로마 숫자 분석', pt: 'Análise com algarismos romanos', de: 'Stufenanalyse (Roman numerals)' } as L6,
    desc: {
      ja: 'I-IV-V7-I のような機能和声分析を全和音に自動付与。副属和音 (V7/vi)・借用和音・代理和音すべて検出。',
      en: 'Functional harmony analysis (I-IV-V7-I) auto-applied to every chord. Secondary dominants (V7/vi), borrowed chords, substitute chords all detected.',
      es: 'Análisis funcional aplicado automáticamente a cada acorde. Dominantes secundarias, acordes prestados, sustituciones detectados.',
      ko: 'I-IV-V7-I 같은 기능 화성 분석을 모든 화음에 자동 적용. 부속 화음, 차용 화음, 대리 화음 모두 검출.',
      pt: 'Análise funcional aplicada automaticamente a cada acorde. Dominantes secundárias, acordes emprestados, substituições detectados.',
      de: 'Funktionale Harmonik-Analyse auf jeden Akkord angewendet. Zwischendominanten, Modulationen, Tonart-Wechsel werden erkannt.',
    } as L6,
  },
  {
    icon: '🔀',
    title: { ja: '転調マップ可視化', en: 'Modulation map', es: 'Mapa de modulaciones', ko: '전조 맵', pt: 'Mapa de modulações', de: 'Modulationskarte' } as L6,
    desc: {
      ja: '楽曲のどこでどの調へ転調したかを時系列で可視化。アナリーゼ授業の予習・復習に。',
      en: 'See exactly where and how the piece modulates, on a timeline. Perfect for music analysis class prep.',
      es: 'Vea exactamente dónde y cómo modula la pieza, en una línea de tiempo. Perfecto para preparar clases de análisis musical.',
      ko: '곡의 어디서 어떤 조로 전조하는지 시간순으로 시각화. 분석 수업 예습·복습에 최적.',
      pt: 'Veja exatamente onde e como a peça modula em uma linha do tempo. Perfeito para preparar aulas de análise musical.',
      de: 'Zeitliche Visualisierung aller Modulationen im Werk. Ideal für die Vorbereitung der Werkanalyse.',
    } as L6,
  },
  {
    icon: '⚠️',
    title: { ja: '声部進行違反検出', en: 'Voice leading checker', es: 'Verificador de conducción de voces', ko: '성부 진행 검사', pt: 'Verificador de condução de vozes', de: 'Stimmführungsprüfung' } as L6,
    desc: {
      ja: '連続 5 度・連続 8 度・隠伏 5 度・限定進行音の誤った解決を全自動で検出。和声学の禁則違反が一目で。',
      en: 'Parallel fifths, parallel octaves, hidden fifths, leading tone resolution issues — all detected automatically. See every violation at a glance.',
      es: 'Quintas paralelas, octavas paralelas, quintas ocultas, resoluciones de la sensible — todo detectado automáticamente.',
      ko: '병행 5도·8도·은복 5도·이끔음 해결 오류를 자동 검출. 화성학 금칙 위반이 한눈에.',
      pt: 'Quintas paralelas, oitavas paralelas, quintas ocultas, resoluções da sensível — tudo detectado automaticamente.',
      de: 'Quintparallelen, Oktavparallelen, verdeckte Quinten, Leitton-Auflösungen — alles automatisch erkannt.',
    } as L6,
  },
  {
    icon: '🎯',
    title: { ja: 'カデンツ自動判定', en: 'Cadence detection', es: 'Detección de cadencias', ko: '종지형 검출', pt: 'Detecção de cadências', de: 'Kadenz-Erkennung' } as L6,
    desc: {
      ja: '完全終止・変格終止・偽終止・半終止を全て自動判定。終止位置を楽曲全体で抽出。',
      en: 'Authentic, plagal, deceptive, half — all four cadence types auto-classified. Locate every cadence across the piece.',
      es: 'Auténtica, plagal, de engaño, semicadencia — los cuatro tipos clasificados automáticamente.',
      ko: '완전·변격·거짓·반종지 4 종류를 자동 분류. 곡 전체의 종지 위치 추출.',
      pt: 'Autêntica, plagal, decetiva, suspensiva — quatro tipos classificados automaticamente.',
      de: 'Authentische, plagale, Trugschluss-, Halbschlussformeln — alle vier Kadenztypen automatisch klassifiziert.',
    } as L6,
  },
  {
    icon: '📚',
    title: { ja: 'キュレーションライブラリ', en: 'Curated library', es: 'Biblioteca seleccionada', ko: '큐레이션 라이브러리', pt: 'Biblioteca selecionada', de: 'Kuratierte Bibliothek' } as L6,
    desc: {
      ja: 'バッハ コラール 371 曲全集、モーツァルト・ハイドン・ベートーベンの主要作品を内蔵。ファイル探しの手間ゼロ。',
      en: '371 Bach chorales, plus key works by Mozart, Haydn, Beethoven, Palestrina. No need to find MusicXML files yourself.',
      es: '371 corales de Bach, más obras clave de Mozart, Haydn, Beethoven, Palestrina. No necesita buscar archivos MusicXML.',
      ko: '바흐 코랄 371곡 전집, 모차르트·하이든·베토벤 주요 작품 내장. MusicXML 파일 검색 불필요.',
      pt: '371 corais de Bach, mais obras-chave de Mozart, Haydn, Beethoven, Palestrina. Sem necessidade de buscar arquivos MusicXML.',
      de: '371 Bach-Choräle plus Schlüsselwerke von Mozart, Haydn, Beethoven, Palestrina. Keine MusicXML-Dateien selbst suchen.',
    } as L6,
  },
  {
    icon: '🌐',
    title: { ja: 'Common Practice 全般対応', en: 'Common Practice coverage', es: 'Cobertura de la Práctica Común', ko: 'Common Practice 전반 대응', pt: 'Cobertura da Prática Comum', de: 'Common Practice abgedeckt' } as L6,
    desc: {
      ja: 'バロック・古典派・ロマン派 (1600-1900) 全般。芸大和声・Piston・Aldwell-Schachter 等の主要教科書と整合。',
      en: 'Baroque, Classical, Romantic (1600-1900). Aligned with major textbooks: Piston, Aldwell-Schachter, Caplin.',
      es: 'Barroco, clásico, romántico (1600-1900). Alineado con los principales libros de texto: Piston, Aldwell-Schachter.',
      ko: '바로크·고전파·낭만파 (1600-1900) 전반. Piston·Aldwell-Schachter 등 주요 교과서와 정합.',
      pt: 'Barroco, clássico, romântico (1600-1900). Alinhado com livros principais: Piston, Aldwell-Schachter.',
      de: 'Barock, Klassik, Romantik (1600-1900). Kompatibel mit Standardlehrbüchern: Piston, Aldwell-Schachter, Caplin.',
    } as L6,
  },
];

const HOW_IT_WORKS = [
  {
    num: '1',
    title: { ja: '楽曲を選ぶ', en: 'Pick a piece', es: 'Elija una pieza', ko: '곡 선택', pt: 'Escolha uma peça', de: 'Werk auswählen' } as L6,
    desc: { ja: '600+ 曲のライブラリから検索 (作曲家・時代・キーワード)。または MusicXML / MIDI を直接アップロード。', en: 'Search 600+ pieces (by composer, era, keyword). Or upload your own MusicXML / MIDI.', es: 'Busque entre 600+ piezas. O suba su propio MusicXML / MIDI.', ko: '600+ 작품 라이브러리에서 검색. 또는 직접 MusicXML / MIDI 업로드.', pt: 'Busque entre 600+ peças. Ou faça upload do próprio MusicXML / MIDI.', de: 'Aus 600+ Werken suchen. Oder eigene MusicXML/MIDI hochladen.' } as L6,
  },
  {
    num: '2',
    title: { ja: '分析ボタンを押す', en: 'Click analyze', es: 'Haga clic en analizar', ko: '분석 버튼 클릭', pt: 'Clique em analisar', de: 'Auf Analysieren klicken' } as L6,
    desc: { ja: 'クリックして 3-5 秒待つだけ。music21 がスコア全体を読み解きます。', en: 'Click and wait 3-5 seconds. music21 reads the full score for you.', es: 'Haga clic y espere 3-5 segundos. music21 lee toda la partitura.', ko: '클릭 후 3-5 초 대기. music21이 전체 악보를 분석합니다.', pt: 'Clique e aguarde 3-5 segundos. music21 lê a partitura inteira.', de: 'Klicken und 3-5 Sekunden warten. music21 liest die Partitur.' } as L6,
  },
  {
    num: '3',
    title: { ja: '結果を学ぶ', en: 'Learn from results', es: 'Aprenda de los resultados', ko: '결과로부터 배우기', pt: 'Aprenda com os resultados', de: 'Aus Ergebnissen lernen' } as L6,
    desc: { ja: 'ローマ数字・カデンツ・転調マップ・声部進行違反 — すべて視覚化。「なぜそう判定したか」も表示。', en: 'Roman numerals, cadences, modulation map, voice leading violations — all visualized. Plus "why this was classified that way" reasoning.', es: 'Números romanos, cadencias, mapa de modulaciones, violaciones de conducción de voces — todo visualizado.', ko: '로마 숫자·종지·전조 맵·성부 진행 위반 — 모두 시각화. "왜 그렇게 판정되었는가"도 표시.', pt: 'Algarismos romanos, cadências, mapa de modulações, violações de condução de vozes — tudo visualizado.', de: 'Stufen, Kadenzen, Modulationen, Stimmführungs-Verstöße — alles visualisiert.' } as L6,
  },
];

const USE_CASES = [
  {
    persona: { ja: '音大 1-2 年生', en: 'Music college freshmen/sophomores', es: 'Estudiantes de 1°-2° año de música', ko: '음대 1-2학년', pt: 'Estudantes de 1°-2° ano de música', de: 'Studienanfänger der Musikhochschule' } as L6,
    use: { ja: '和声学の宿題チェック・予習・復習', en: 'Verify harmony homework, prepare, review', es: 'Verificar tarea de armonía, preparar, revisar', ko: '화성학 과제 확인·예습·복습', pt: 'Verificar tarefa de harmonia, preparar, rever', de: 'Harmonielehre-Hausaufgaben prüfen' } as L6,
  },
  {
    persona: { ja: '作曲科の学生', en: 'Composition students', es: 'Estudiantes de composición', ko: '작곡과 학생', pt: 'Estudantes de composição', de: 'Kompositionsstudierende' } as L6,
    use: { ja: '自作品の声部進行チェック・連続 5 度の自動検出', en: 'Self-check voice leading, auto-detect parallel fifths', es: 'Auto-comprobación de conducción de voces, detección automática', ko: '자작품 성부 진행 확인, 병행 5도 자동 검출', pt: 'Auto-verificação, detecção automática', de: 'Eigene Werke prüfen, Quintparallelen finden' } as L6,
  },
  {
    persona: { ja: '指揮者・編曲家', en: 'Conductors & arrangers', es: 'Directores y arreglistas', ko: '지휘자·편곡가', pt: 'Maestros e arranjadores', de: 'Dirigenten und Arrangeure' } as L6,
    use: { ja: 'スコアの和声構造を秒で把握、リハーサル準備の時短', en: 'Grasp harmonic structure in seconds, save rehearsal prep time', es: 'Entender estructura armónica en segundos', ko: '악보 화성 구조를 초 단위로 파악', pt: 'Entender estrutura harmônica em segundos', de: 'Harmonische Struktur in Sekunden erfassen' } as L6,
  },
  {
    persona: { ja: '音大受験生', en: 'Music school applicants', es: 'Aspirantes a escuela de música', ko: '음대 입시생', pt: 'Candidatos à escola de música', de: 'Aufnahmeprüfungs-Kandidaten' } as L6,
    use: { ja: '和声学過去問を解いて自動採点・添削', en: 'Solve past harmony exams with auto-grading', es: 'Resolver exámenes pasados con calificación automática', ko: '화성학 기출문제 풀고 자동 채점', pt: 'Resolver provas passadas com correção automática', de: 'Vergangene Aufnahmeprüfungen automatisch korrigieren' } as L6,
  },
];

const FAQ = [
  {
    q: { ja: '音源（mp3）から分析できますか？', en: 'Can I analyze audio files (mp3)?', es: '¿Puedo analizar archivos de audio (mp3)?', ko: '음원 (mp3) 으로 분석 가능합니까?', pt: 'Posso analisar arquivos de áudio (mp3)?', de: 'Kann ich Audiodateien (mp3) analysieren?' } as L6,
    a: { ja: '現在は楽譜データ (MusicXML / MIDI) のみ対応です。音源は別アプリ KUON SCORE GENERATOR で楽譜化してから本ツールに渡す予定です。', en: 'Currently scores only (MusicXML/MIDI). Audio support comes via the upcoming KUON SCORE GENERATOR (basic-pitch) which converts audio to scores first.', es: 'Actualmente solo partituras (MusicXML/MIDI). Soporte de audio próximamente vía KUON SCORE GENERATOR.', ko: '현재는 악보 데이터(MusicXML/MIDI)만 지원합니다. 음원은 추후 KUON SCORE GENERATOR로 악보 변환 후 사용 예정.', pt: 'Atualmente apenas partituras (MusicXML/MIDI). Suporte a áudio em breve via KUON SCORE GENERATOR.', de: 'Aktuell nur Partituren (MusicXML/MIDI). Audio-Unterstützung folgt über KUON SCORE GENERATOR (basic-pitch).' } as L6,
  },
  {
    q: { ja: 'ライブラリの楽曲はどこから来ていますか？', en: 'Where does the library come from?', es: '¿De dónde viene la biblioteca?', ko: '라이브러리 작품은 어디에서 오나요?', pt: 'De onde vem a biblioteca?', de: 'Woher stammen die Werke?' } as L6,
    a: { ja: 'music21 (MIT 開発) のオープンソースコーパス + Mutopia Project + OpenScore Lieder Corpus。すべて Public Domain / CC0 で安全に再配布可能。', en: 'music21 (MIT) open source corpus + Mutopia Project + OpenScore Lieder Corpus. All Public Domain / CC0, safely redistributable.', es: 'Corpus de music21 (MIT) + Mutopia + OpenScore. Todo Public Domain / CC0.', ko: 'MIT 개발 music21 오픈소스 코퍼스 + Mutopia Project + OpenScore Lieder Corpus. 모두 Public Domain / CC0.', pt: 'Corpus open source music21 (MIT) + Mutopia + OpenScore. Tudo Public Domain / CC0.', de: 'music21 Open-Source-Korpus (MIT) + Mutopia + OpenScore. Alles gemeinfrei.' } as L6,
  },
  {
    q: { ja: '日本の和声学（芸大和声）と表記が違う？', en: 'Different from Japanese harmony notation (Geidai)?', es: '¿Diferente de la notación japonesa de armonía?', ko: '일본 화성학(예대 화성)과 표기가 다른가요?', pt: 'Diferente da notação japonesa?', de: 'Anders als die japanische Harmonienotation?' } as L6,
    a: { ja: 'Common Practice 標準（V7/vi 等）で出力されますが、日本式（V7→vi）への変換オプションも実装予定です。基本的な和声機能は両方共通。', en: 'Output is in Common Practice notation (V7/vi). Japanese-style (V7→vi) conversion option is on the roadmap. Core harmonic functions are universal.', es: 'Salida en notación de Práctica Común. Conversión a notación japonesa en hoja de ruta.', ko: 'Common Practice 표준(V7/vi)으로 출력되며, 일본식 변환 옵션은 로드맵에 있습니다.', pt: 'Saída em notação Common Practice. Opção de conversão para notação japonesa em planejamento.', de: 'Ausgabe erfolgt in Common-Practice-Notation. Konvertierung in japanische Notation ist geplant.' } as L6,
  },
  {
    q: { ja: '料金プランは？', en: 'What are the pricing plans?', es: '¿Cuáles son los planes?', ko: '요금제는 어떻게 되나요?', pt: 'Quais são os planos?', de: 'Welche Tarife gibt es?' } as L6,
    a: { ja: 'Concerto プラン (¥1,480/月) 以上で無制限利用。月額・年額からお選びいただけます。年額プランは実質 2 ヶ月分お得です。', en: 'Unlimited use with Concerto plan (¥1,480/mo) or above. Monthly and annual billing available; annual saves the equivalent of 2 months.', es: 'Uso ilimitado con plan Concerto (¥1,480/mes) o superior. Facturación mensual o anual disponible; el plan anual ahorra el equivalente a 2 meses.', ko: 'Concerto 플랜(¥1,480/월) 이상에서 무제한 이용 가능합니다. 월간·연간 결제를 선택할 수 있으며, 연간은 약 2개월 할인.', pt: 'Uso ilimitado com plano Concerto (¥1.480/mês) ou superior. Faturamento mensal ou anual disponível; o anual economiza o equivalente a 2 meses.', de: 'Unbegrenzte Nutzung mit Concerto-Tarif (¥1.480/Monat) oder höher. Monats- oder Jahresabrechnung verfügbar; Jahrestarif spart etwa zwei Monate.' } as L6,
  },
  {
    q: { ja: '楽譜ファイル（MusicXML）を持っていません。どうすれば？', en: "I don't have MusicXML files. What do I do?", es: 'No tengo archivos MusicXML. ¿Qué hago?', ko: 'MusicXML 파일이 없습니다. 어떻게 하나요?', pt: 'Não tenho arquivos MusicXML. O que faço?', de: 'Ich habe keine MusicXML-Dateien. Was tun?' } as L6,
    a: { ja: '内蔵ライブラリ 600+ 曲から選ぶだけで OK。バッハ全コラール・モーツァルト・ベートーベン主要作品が即利用可能です。', en: 'Just pick from the 600+ built-in pieces. All Bach chorales, key works of Mozart and Beethoven are ready to use.', es: 'Solo elija de las 600+ piezas integradas. Todos los corales de Bach, obras clave de Mozart y Beethoven listos.', ko: '내장된 600+ 작품에서 선택하시면 됩니다. 바흐 전 코랄, 모차르트·베토벤 주요 작품 즉시 이용 가능.', pt: 'Apenas escolha entre as 600+ peças integradas.', de: 'Wählen Sie einfach aus 600+ integrierten Werken.' } as L6,
  },
  {
    q: { ja: '声部進行チェッカーは既存の /harmony と何が違う？', en: 'How is voice leading checker different from /harmony?', es: '¿En qué se diferencia de /harmony?', ko: '/harmony와 어떻게 다른가요?', pt: 'Qual a diferença de /harmony?', de: 'Wie unterscheidet sich von /harmony?' } as L6,
    a: { ja: '/harmony は 4 音の手入力で即時チェック。/classical は楽曲全体（数百小節）を一括スキャンして全違反を抽出します。両方併用が学習効果最大。', en: '/harmony is for real-time 4-chord checking by hand. /classical scans entire pieces (hundreds of measures) and finds all violations. Best to use both.', es: '/harmony para entrada manual de 4 acordes. /classical escanea piezas enteras.', ko: '/harmony는 4음 수동 입력 즉시 검사. /classical은 곡 전체를 일괄 검사. 병용이 최적.', pt: '/harmony é para entrada manual de 4 acordes. /classical varre peças inteiras.', de: '/harmony für manuelle 4-Stimmen-Prüfung. /classical scannt ganze Werke.' } as L6,
  },
];

// JSON-LD 構造化データ（GEO 最適化の核）
const JSONLD_SOFTWARE = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KUON CLASSICAL ANALYSIS',
  applicationCategory: 'EducationalApplication',
  applicationSubCategory: 'Music Analysis',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '1480',
    priceCurrency: 'JPY',
    availability: 'https://schema.org/InStock',
    description: 'Concerto plan and above provides unlimited use. Monthly and annual billing available.',
  },
  description:
    'Roman numeral analysis tool for Western classical music. Built-in library of 600+ pieces (Bach chorales, Mozart sonatas, Beethoven quartets). Powered by music21 (MIT). Cadence detection, modulation map, voice leading checker. Common Practice Period (1600-1900).',
  featureList: [
    'Roman numeral analysis',
    'Cadence detection (authentic, plagal, deceptive, half)',
    'Modulation map visualization',
    'Voice leading violation detector (parallel fifths, parallel octaves, hidden fifths)',
    'Curated library of 600+ classical pieces',
    'MusicXML / MIDI input',
    'Multilingual UI (Japanese, English, Spanish, Korean, Portuguese, German)',
  ],
  audience: {
    '@type': 'Audience',
    audienceType: 'Music students, music teachers, conductors, composers, music theorists',
  },
  author: {
    '@type': 'Organization',
    name: '空音開発 Kuon R&D',
    url: 'https://kuon-rnd.com',
  },
  inLanguage: ['ja', 'en', 'es', 'ko', 'pt', 'de'],
};

const JSONLD_FAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((item) => ({
    '@type': 'Question',
    name: t(item.q, 'en'),
    acceptedAnswer: {
      '@type': 'Answer',
      text: t(item.a, 'en'),
    },
  })),
};

const JSONLD_HOWTO = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to analyze classical music with KUON CLASSICAL ANALYSIS',
  description: 'Roman numeral analysis of Bach, Mozart, Beethoven and other Common Practice composers in 3 steps.',
  step: HOW_IT_WORKS.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: t(s.title, 'en'),
    text: t(s.desc, 'en'),
  })),
  totalTime: 'PT10S',
};

export default function ClassicalLPPage() {
  const { lang } = useLang();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ minHeight: '100vh', background: BG_CREAM, color: '#0f172a', fontFamily: sans }}>
      {/* JSON-LD 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_SOFTWARE) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_FAQ) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_HOWTO) }}
      />

      {/* Hero */}
      <section style={{ padding: 'clamp(4rem, 10vw, 7rem) 1.5rem clamp(2rem, 5vw, 3rem)', maxWidth: 960, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: ACCENT, fontWeight: 700, marginBottom: '1.5rem', textTransform: 'uppercase' }}>
          {t(HERO.eyebrow, lang)}
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 400, lineHeight: 1.4, color: '#0f172a', marginBottom: '1.5rem', whiteSpace: 'pre-line', letterSpacing: '0.02em' }}>
          {t(HERO.title, lang)}
        </h1>
        <p style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)', color: '#475569', lineHeight: 1.95, maxWidth: 720, margin: '0 auto 2.5rem', wordBreak: 'keep-all' }}>
          {t(HERO.sub, lang)}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/classical" style={{
            background: ACCENT, color: '#fff', padding: '0.85rem 2.2rem', borderRadius: 999,
            textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, fontFamily: sans,
            boxShadow: '0 4px 14px rgba(91,33,182,0.25)',
          }}>
            {t(HERO.ctaPrimary, lang)} →
          </Link>
          <Link href="/#pricing" style={{
            background: 'transparent', color: ACCENT, padding: '0.85rem 2rem', borderRadius: 999,
            textDecoration: 'none', fontSize: '0.95rem', fontWeight: 500, border: `1px solid ${ACCENT}`,
            fontFamily: sans,
          }}>
            {t(HERO.ctaSecondary, lang)}
          </Link>
        </div>
      </section>

      {/* Trust Bar */}
      <section style={{ padding: '0 1.5rem 4rem', maxWidth: 960, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {TRUST_BAR.map((item, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '1.2rem', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <div style={{ fontFamily: serif, fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 600, color: ACCENT, marginBottom: 4 }}>{item.num}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{t(item.label, lang)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 400, textAlign: 'center', marginBottom: '3rem', color: '#0f172a' }}>
          {{ ja: '6 つの核心機能', en: 'Six Core Features', es: 'Seis funciones principales', ko: '6 가지 핵심 기능', pt: 'Seis recursos principais', de: 'Sechs Kernfunktionen' }[lang] ?? 'Six Core Features'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.8rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{f.icon}</div>
              <h3 style={{ fontFamily: serif, fontSize: '1.15rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.7rem' }}>{t(f.title, lang)}</h3>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.85 }}>{t(f.desc, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 1000, margin: '0 auto', background: '#fff', borderRadius: 16, marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 400, textAlign: 'center', marginBottom: '3rem', color: '#0f172a' }}>
          {{ ja: '3 ステップで完了', en: 'Three Simple Steps', es: 'Tres pasos simples', ko: '3 단계로 완료', pt: 'Três passos simples', de: 'Drei einfache Schritte' }[lang] ?? 'Three Simple Steps'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.2rem', padding: '0 1.5rem' }}>
          {HOW_IT_WORKS.map((step) => (
            <div key={step.num} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: ACCENT,
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: serif, fontSize: '1.4rem', fontWeight: 600,
              }}>{step.num}</div>
              <h3 style={{ fontFamily: serif, fontSize: '1.1rem', fontWeight: 500, color: '#0f172a', margin: 0 }}>{t(step.title, lang)}</h3>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.85, margin: 0 }}>{t(step.desc, lang)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 400, textAlign: 'center', marginBottom: '3rem', color: '#0f172a' }}>
          {{ ja: 'こんな方に', en: 'Who is this for', es: 'Para quién es', ko: '이런 분께', pt: 'Para quem é', de: 'Für wen ist das' }[lang] ?? 'Who is this for'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {USE_CASES.map((u, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
              <div style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 500, color: ACCENT, marginBottom: '0.5rem' }}>{t(u.persona, lang)}</div>
              <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.8 }}>{t(u.use, lang)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 800, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 400, textAlign: 'center', marginBottom: '3rem', color: '#0f172a' }}>
          FAQ
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {FAQ.map((item, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                width: '100%', padding: '1.1rem 1.3rem', background: 'transparent', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '1rem', textAlign: 'left', fontFamily: sans,
              }}>
                <span style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, lineHeight: 1.6 }}>{t(item.q, lang)}</span>
                <span style={{ fontSize: '1.1rem', color: '#94a3b8', flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 1.3rem 1.3rem', fontSize: '0.9rem', color: '#475569', lineHeight: 1.95, borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                  {t(item.a, lang)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem clamp(5rem, 8vw, 8rem)', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 400, marginBottom: '1.5rem', color: '#0f172a' }}>
          {{ ja: '今すぐ始める', en: 'Start now', es: 'Empezar ahora', ko: '지금 시작', pt: 'Começar agora', de: 'Jetzt starten' }[lang] ?? 'Start now'}
        </h2>
        <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.85, marginBottom: '2.5rem' }}>
          {{
            ja: '600+ 曲を内蔵。Concerto プラン以上で無制限。',
            en: '600+ pieces built-in. Unlimited use with Concerto plan or above.',
            es: '600+ piezas integradas. Uso ilimitado con plan Concerto.',
            ko: '600+ 곡 내장. Concerto 플랜 이상에서 무제한.',
            pt: '600+ peças integradas. Uso ilimitado com plano Concerto.',
            de: '600+ integrierte Werke. Unbegrenzte Nutzung mit Concerto-Tarif.',
          }[lang] ?? '600+ pieces built-in. Unlimited use with Concerto plan or above.'}
        </p>
        <Link href="/classical" style={{
          background: ACCENT, color: '#fff', padding: '1rem 2.5rem', borderRadius: 999,
          textDecoration: 'none', fontSize: '1rem', fontWeight: 600, fontFamily: sans,
          boxShadow: '0 6px 20px rgba(91,33,182,0.3)', display: 'inline-block',
        }}>
          {t(HERO.ctaPrimary, lang)} →
        </Link>
      </section>
    </div>
  );
}
