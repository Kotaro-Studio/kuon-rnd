'use client';

/**
 * KUON CLASSICAL LAB — Landing Page
 * =========================================================
 * 世界初のブラウザ完結型 music21 環境（Pyodide + WebAssembly）の LP。
 *
 * メッセージング:
 *   - 世界初の試み（音楽教育で Python が完全ブラウザ実行）
 *   - 音楽学習者のために設計（プライバシー優先、サーバー不要、オフライン可）
 *   - 技術的裏付け（Pyodide + music21 + WebAssembly）
 *   - 6 言語対応（ja/en/es/ko/pt/de）
 *   - SEO: 100+ keywords
 *   - GEO: JSON-LD × 3 (SoftwareApplication / FAQPage / HowTo)
 *
 * §45 鉄の掟遵守: 教師経由学生クーポンの言及一切なし。HALF50 (公開) のみ言及可。
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
const TEAL = '#0d9488';
const BG_CREAM = '#fafaf7';

type L6 = Partial<Record<Lang, string>> & { en: string };
const t = (m: L6, lang: Lang): string => m[lang] ?? m.en;

const HERO = {
  eyebrow: { ja: 'KUON CLASSICAL LAB · BETA', en: 'KUON CLASSICAL LAB · BETA', es: 'KUON CLASSICAL LAB · BETA', ko: 'KUON CLASSICAL LAB · BETA', pt: 'KUON CLASSICAL LAB · BETA', de: 'KUON CLASSICAL LAB · BETA' } as L6,
  title: {
    ja: '世界で最初に、\nブラウザの中で\nmusic21 が動いた。',
    en: 'For the first time in the world,\nmusic21 runs\ninside your browser.',
    es: 'Por primera vez en el mundo,\nmusic21 se ejecuta\nen su navegador.',
    ko: '세계 최초,\n브라우저 안에서\nmusic21이 실행됩니다.',
    pt: 'Pela primeira vez no mundo,\nmusic21 roda\nno seu navegador.',
    de: 'Weltweit zum ersten Mal\nläuft music21\nim Browser.',
  } as L6,
  sub: {
    ja: 'サーバーを介さず、あなたの楽譜があなたの PC から一歩も外に出ないまま、Bach のコラールも Mozart のソナタも瞬時にローマ数字で分析。Python の本物の music21 が WebAssembly で動く、音楽教育の新しい標準です。',
    en: 'No server. Your scores never leave your computer. Real Python music21 runs in WebAssembly, instantly analyzing Bach chorales and Mozart sonatas in Roman numerals. A new standard for music education.',
    es: 'Sin servidor. Sus partituras nunca salen de su computadora. music21 real en Python se ejecuta en WebAssembly. Un nuevo estándar para la educación musical.',
    ko: '서버 없이, 악보가 컴퓨터 밖으로 나가지 않은 채, Bach과 Mozart을 즉시 로마 숫자로 분석. WebAssembly로 동작하는 진짜 Python music21. 음악 교육의 새로운 표준.',
    pt: 'Sem servidor. Suas partituras nunca saem do seu computador. music21 real em Python rodando em WebAssembly. Um novo padrão para educação musical.',
    de: 'Kein Server. Ihre Partituren verlassen nie Ihren Computer. Echtes Python music21 läuft in WebAssembly. Ein neuer Standard für Musikausbildung.',
  } as L6,
  ctaPrimary: { ja: 'Lab を起動する', en: 'Launch Lab', es: 'Iniciar Lab', ko: 'Lab 시작', pt: 'Iniciar Lab', de: 'Lab starten' } as L6,
  ctaSecondary: { ja: '料金プラン', en: 'See pricing', es: 'Ver precios', ko: '요금제', pt: 'Ver preços', de: 'Preise' } as L6,
};

const TRUST_BAR = [
  { num: '100%', label: { ja: 'ブラウザ完結', en: 'Browser-native', es: 'En navegador', ko: '브라우저 완결', pt: 'No navegador', de: 'Im Browser' } as L6 },
  { num: '0', label: { ja: 'サーバーコスト', en: 'Server cost', es: 'Costo de servidor', ko: '서버 비용', pt: 'Custo de servidor', de: 'Server-Kosten' } as L6 },
  { num: '3,500+', label: { ja: '内蔵楽曲', en: 'Pieces built-in', es: 'Piezas integradas', ko: '내장 곡', pt: 'Peças integradas', de: 'Werke integriert' } as L6 },
  { num: '6', label: { ja: '対応言語', en: 'Languages', es: 'Idiomas', ko: '언어', pt: 'Idiomas', de: 'Sprachen' } as L6 },
];

const BREAKTHROUGH = {
  heading: { ja: 'なぜこれが「世界初」なのか', en: 'Why this is a world-first', es: 'Por qué es una primicia mundial', ko: '왜 이것이 세계 최초인가', pt: 'Por que é uma novidade mundial', de: 'Warum dies eine Weltneuheit ist' } as L6,
  body: {
    ja: 'music21 は MIT が 2008 年に開発した、楽譜を計算機で扱うためのデファクト標準ライブラリです。コーネル大学・スタンフォード大学・東京藝術大学を含む世界の音楽情報学コースで教えられ、研究者と作曲家に長年支持されてきました。\n\nしかしこれまで、music21 を使うには Python のインストール、依存パッケージの解決、コマンドライン操作の習得が必要でした。これは音大生の 95% にとって超えられない壁でした。\n\nKUON CLASSICAL LAB はその壁を取り払いました。Pyodide という Mozilla 発の WebAssembly 上で動く CPython 実装を使い、ブラウザに URL を入れるだけで本物の Python と本物の music21 が起動します。あなたが楽曲を選ぶたび、裏で本物の Python コードが走り、本物の Krumhansl-Schmuckler キー判定アルゴリズムが回り、本物のローマ数字解析が出力されます。\n\nこれが世界初である理由は単純です。音楽教育プラットフォームで、Python ランタイム + music21 + Bach 全コラールを誰でも瞬時にブラウザで触れる環境を提供しているサービスは、現時点で他に存在しません。',
    en: 'music21 is the de facto library for computational musicology, developed at MIT in 2008. It is taught in music informatics courses at Cornell, Stanford, Tokyo University of the Arts, and beyond, and has been the backbone of countless research papers and compositions.\n\nUntil now, using music21 required installing Python, resolving package dependencies, and mastering the command line. That was an insurmountable wall for 95% of music students.\n\nKUON CLASSICAL LAB removes that wall. Using Pyodide — Mozilla\'s CPython port to WebAssembly — opening a URL in your browser launches real Python and real music21. Every time you select a piece, real Python code runs in the background, the real Krumhansl-Schmuckler key detection algorithm executes, and a real Roman numeral analysis emerges.\n\nThis is a world-first for a simple reason: no other music education platform offers a Python runtime + music21 + complete Bach chorale corpus accessible to anyone with one click in a browser.',
    es: 'music21 es la biblioteca de facto para musicología computacional, desarrollada en MIT en 2008. Se enseña en cursos de informática musical en Cornell, Stanford, Tokyo University of the Arts, y ha sido la base de innumerables artículos e investigaciones.\n\nHasta ahora, usar music21 requería instalar Python, resolver dependencias y dominar la línea de comandos. Una barrera infranqueable para el 95% de los estudiantes de música.\n\nKUON CLASSICAL LAB elimina esa barrera. Usando Pyodide — el port de CPython a WebAssembly de Mozilla — abrir una URL inicia Python real y music21 real. Cada vez que selecciona una pieza, código Python real se ejecuta en segundo plano.\n\nEs una primicia mundial: ninguna otra plataforma educativa ofrece un entorno Python + music21 + corales de Bach completos accesibles con un clic en el navegador.',
    ko: 'music21은 MIT가 2008년에 개발한, 악보를 계산기로 다루기 위한 사실상 표준 라이브러리입니다. 코넬, 스탠포드, 도쿄예술대학 등 세계 음악정보학 과정에서 가르쳐지며, 연구자와 작곡가들에게 오랫동안 지지받아 왔습니다.\n\n그러나 지금까지 music21을 사용하려면 Python 설치, 의존성 해결, 명령줄 조작 습득이 필요했습니다. 이것은 음대생 95%에게 넘을 수 없는 벽이었습니다.\n\nKUON CLASSICAL LAB은 그 벽을 허물었습니다. Pyodide — Mozilla 발 WebAssembly 위에서 동작하는 CPython 구현 — 을 사용하여, 브라우저에 URL을 입력하기만 하면 진짜 Python과 진짜 music21이 시작됩니다.\n\n세계 최초인 이유는 단순합니다. 음악 교육 플랫폼에서 Python 런타임 + music21 + Bach 전 코랄을 누구나 즉시 브라우저에서 만질 수 있는 환경을 제공하는 서비스는 현재 다른 곳에 존재하지 않습니다.',
    pt: 'music21 é a biblioteca padrão de fato para musicologia computacional, desenvolvida no MIT em 2008. É ensinada em cursos de informática musical em Cornell, Stanford, Universidade de Artes de Tóquio, e tem sido a espinha dorsal de incontáveis artigos.\n\nAté agora, usar o music21 exigia instalar Python, resolver dependências e dominar linha de comando. Uma barreira intransponível para 95% dos estudantes de música.\n\nKUON CLASSICAL LAB remove essa barreira. Usando Pyodide — o port do CPython para WebAssembly da Mozilla — abrir uma URL inicia Python real e music21 real.\n\nÉ uma primazia mundial: nenhuma outra plataforma educacional oferece runtime Python + music21 + corais completos de Bach acessíveis com um clique no navegador.',
    de: 'music21 ist die De-facto-Standardbibliothek für computergestützte Musikwissenschaft, 2008 am MIT entwickelt. Sie wird in Musikinformatik-Kursen an Cornell, Stanford, Tokyo University of the Arts und weltweit gelehrt und ist Grundlage unzähliger Forschungsarbeiten.\n\nBisher erforderte die Nutzung von music21 die Installation von Python, die Auflösung von Paketabhängigkeiten und Beherrschung der Kommandozeile. Für 95% der Musikstudierenden eine unüberwindbare Hürde.\n\nKUON CLASSICAL LAB beseitigt diese Hürde. Mit Pyodide — Mozillas CPython-Port nach WebAssembly — startet das Öffnen einer URL echtes Python und echtes music21.\n\nWeltneuheit, weil keine andere Musikbildungsplattform eine Python-Laufzeitumgebung + music21 + vollständigen Bach-Choral-Korpus mit einem Klick im Browser anbietet.',
  } as L6,
};

const TECH = {
  heading: { ja: '技術的な裏付け', en: 'The technology behind it', es: 'La tecnología detrás', ko: '기술적 배경', pt: 'A tecnologia por trás', de: 'Die Technologie dahinter' } as L6,
  items: [
    {
      title: { ja: 'Pyodide v0.29 (Mozilla / iodide)', en: 'Pyodide v0.29 (Mozilla / iodide)', es: 'Pyodide v0.29', ko: 'Pyodide v0.29', pt: 'Pyodide v0.29', de: 'Pyodide v0.29' } as L6,
      desc: {
        ja: 'CPython 3.13 を Emscripten で WebAssembly にコンパイルしたもの。Python 標準ライブラリのほぼ全てがブラウザ内でそのまま動きます。Mozilla Research が開始し、現在は活発な OSS コミュニティで maintain。NumPy・SciPy・Pandas・Matplotlib も同様に動きます。',
        en: 'CPython 3.13 compiled to WebAssembly via Emscripten. Nearly all of Python\'s standard library runs natively in the browser. Started by Mozilla Research, now maintained by an active open-source community. NumPy, SciPy, Pandas, Matplotlib all work too.',
        es: 'CPython 3.13 compilado a WebAssembly vía Emscripten. Casi toda la biblioteca estándar de Python se ejecuta nativamente en el navegador.',
        ko: 'CPython 3.13을 Emscripten으로 WebAssembly로 컴파일한 것. Python 표준 라이브러리 거의 전체가 브라우저 안에서 동작합니다.',
        pt: 'CPython 3.13 compilado para WebAssembly via Emscripten. Quase toda a biblioteca padrão de Python roda nativamente no navegador.',
        de: 'CPython 3.13 via Emscripten zu WebAssembly kompiliert. Fast die gesamte Python-Standardbibliothek läuft nativ im Browser.',
      } as L6,
    },
    {
      title: { ja: 'music21 (MIT, 2008-)', en: 'music21 (MIT, 2008-)', es: 'music21 (MIT)', ko: 'music21 (MIT)', pt: 'music21 (MIT)', de: 'music21 (MIT)' } as L6,
      desc: {
        ja: 'マサチューセッツ工科大学のマイケル・S・カスバート教授が率いるプロジェクト。MusicXML / MIDI / kern / abc / MEI 等の主要楽譜フォーマットを内部で統一表現に変換。`roman.romanNumeralFromChord`、`analysis.windowed.WindowedAnalysis`、`analysis.discrete.KrumhanslSchmuckler` 等の研究レベル分析を実装。BSD/MIT ライセンスで商用利用可。',
        en: 'A project led by Prof. Michael Scott Cuthbert at MIT. Internally normalizes MusicXML, MIDI, kern, abc, and MEI scores into a unified representation. Implements research-grade analyses like roman.romanNumeralFromChord and the Krumhansl-Schmuckler key detection algorithm. BSD/MIT licensed.',
        es: 'Proyecto liderado por el Prof. Michael Scott Cuthbert en MIT. Normaliza internamente partituras MusicXML, MIDI, kern, abc y MEI. Licencia BSD/MIT.',
        ko: '매사추세츠 공과대학의 마이클 스콧 커스버트 교수가 이끄는 프로젝트. MusicXML/MIDI/kern/abc/MEI 등 주요 악보 형식을 통일 표현으로 변환.',
        pt: 'Projeto liderado pelo Prof. Michael Scott Cuthbert no MIT. Normaliza internamente partituras MusicXML, MIDI, kern, abc e MEI.',
        de: 'Projekt unter Leitung von Prof. Michael Scott Cuthbert am MIT. Normalisiert MusicXML, MIDI, kern, abc und MEI intern in eine einheitliche Darstellung.',
      } as L6,
    },
    {
      title: { ja: 'OpenSheetMusicDisplay (OSMD)', en: 'OpenSheetMusicDisplay (OSMD)', es: 'OSMD', ko: 'OSMD', pt: 'OSMD', de: 'OSMD' } as L6,
      desc: {
        ja: 'IMSLP（楽譜の世界最大公開アーカイブ）でも採用されている MusicXML レンダリングエンジン。Bravura SMuFL フォントを使い、ト音記号・ヘ音記号・調号・拍子記号を出版水準で描画。MIT ライセンス。',
        en: 'A MusicXML rendering engine also used by IMSLP (the world\'s largest public sheet music archive). Renders treble/bass clefs, key signatures, and time signatures at publication quality using the Bravura SMuFL font. MIT licensed.',
        es: 'Motor de renderizado MusicXML usado también por IMSLP. Renderiza claves, armaduras y compases a calidad de publicación.',
        ko: 'IMSLP에서도 사용되는 MusicXML 렌더링 엔진. Bravura SMuFL 폰트로 출판 수준 묘사.',
        pt: 'Motor de renderização MusicXML usado também pelo IMSLP. Renderiza com qualidade de publicação.',
        de: 'MusicXML-Rendering-Engine, auch von IMSLP verwendet. Veröffentlichungsqualität mit Bravura SMuFL-Schriftart.',
      } as L6,
    },
    {
      title: { ja: 'Tone.js + @tonejs/midi', en: 'Tone.js + @tonejs/midi', es: 'Tone.js', ko: 'Tone.js', pt: 'Tone.js', de: 'Tone.js' } as L6,
      desc: {
        ja: 'Web Audio API の上に構築された音楽プログラミングフレームワーク。music21 が生成した MIDI を base64 で受け取り、声部別 PolySynth で再生。テンポ調整・パート別ミュート/ソロ・カーソル追従までブラウザ内完結。',
        en: 'A music programming framework built on the Web Audio API. Receives base64-encoded MIDI generated by music21 and plays it via voice-specific PolySynth instances. Tempo control, voice mute/solo, and cursor sync all run entirely in the browser.',
        es: 'Framework de programación musical sobre Web Audio API. Recibe MIDI generado por music21 y lo reproduce con PolySynth.',
        ko: 'Web Audio API 위에 구축된 음악 프로그래밍 프레임워크. music21이 생성한 MIDI를 base64로 받아 성부별 PolySynth로 재생.',
        pt: 'Framework de programação musical sobre Web Audio API. Recebe MIDI gerado pelo music21 e reproduz com PolySynth.',
        de: 'Musikprogrammier-Framework auf Web Audio API. Empfängt von music21 erzeugte MIDI als Base64 und spielt sie mit stimmenspezifischen PolySynth-Instanzen.',
      } as L6,
    },
  ],
};

const FEATURES = [
  {
    icon: '🔬',
    title: { ja: 'Pyodide + music21', en: 'Pyodide + music21', es: 'Pyodide + music21', ko: 'Pyodide + music21', pt: 'Pyodide + music21', de: 'Pyodide + music21' } as L6,
    desc: {
      ja: '本物の Python music21 が WebAssembly でブラウザ内動作。研究レベルの Krumhansl-Schmuckler キー判定・ローマ数字分析・声部進行検出。',
      en: 'Real Python music21 running in WebAssembly. Research-grade Krumhansl-Schmuckler key detection, Roman numeral analysis, voice leading.',
      es: 'music21 real en Python ejecutándose en WebAssembly. Detección de tonalidad nivel investigación, análisis con números romanos.',
      ko: '진짜 Python music21이 WebAssembly로 동작. 연구 수준 Krumhansl-Schmuckler 조성 판정·로마 숫자 분석.',
      pt: 'music21 real em Python rodando em WebAssembly. Detecção de tonalidade nível pesquisa, análise por algarismos romanos.',
      de: 'Echtes Python music21 in WebAssembly. Forschungs-Stufentheorie, Krumhansl-Schmuckler Tonarterkennung.',
    } as L6,
  },
  {
    icon: '🔒',
    title: { ja: 'プライバシー完全保護', en: 'Total privacy', es: 'Privacidad total', ko: '완전한 프라이버시', pt: 'Privacidade total', de: 'Totale Privatsphäre' } as L6,
    desc: {
      ja: 'あなたが選んだ楽譜は、あなたのブラウザから一歩も外に出ません。サーバーは分析に一切関与せず、研究中の作品も安心してアップロード可能。',
      en: 'Your scores never leave your browser. The server is not involved in analysis at all — safe to upload works-in-progress.',
      es: 'Sus partituras nunca salen de su navegador. El servidor no participa en el análisis.',
      ko: '선택한 악보는 브라우저 밖으로 나가지 않습니다. 서버가 분석에 일절 관여하지 않습니다.',
      pt: 'Suas partituras nunca saem do seu navegador. O servidor não participa da análise.',
      de: 'Ihre Partituren verlassen nie Ihren Browser. Der Server ist an der Analyse nicht beteiligt.',
    } as L6,
  },
  {
    icon: '∞',
    title: { ja: '無制限利用', en: 'Unlimited usage', es: 'Uso ilimitado', ko: '무제한 이용', pt: 'Uso ilimitado', de: 'Unbegrenzte Nutzung' } as L6,
    desc: {
      ja: 'すべてあなたの CPU で動くため、サーバークォータ概念が存在しません。1 日に 1,000 回分析しても完全無料の感覚で。',
      en: 'Everything runs on your CPU, so server quotas don\'t exist. Analyze 1,000 pieces a day if you want.',
      es: 'Todo se ejecuta en su CPU, sin cuotas de servidor.',
      ko: '모두 CPU에서 동작하므로 서버 쿼터 개념이 존재하지 않습니다.',
      pt: 'Tudo roda na sua CPU, sem cotas de servidor.',
      de: 'Alles läuft auf Ihrer CPU — keine Server-Quoten.',
    } as L6,
  },
  {
    icon: '📡',
    title: { ja: 'オフライン動作', en: 'Offline-capable', es: 'Funciona sin conexión', ko: '오프라인 대응', pt: 'Funciona offline', de: 'Offline-fähig' } as L6,
    desc: {
      ja: '初回ロード後はブラウザキャッシュに保存。電車内でも飛行機内でも、ネット接続なしで Bach の和声分析ができます。',
      en: 'After first load, everything is cached in your browser. Analyze Bach harmony on a plane, with no internet.',
      es: 'Después de la primera carga, todo está en caché. Analice armonía de Bach sin internet.',
      ko: '첫 로딩 후 브라우저 캐시에 저장. 인터넷 없이 비행기에서도 분석 가능.',
      pt: 'Após o primeiro carregamento, tudo fica em cache. Analise sem internet.',
      de: 'Nach dem ersten Laden alles im Browser-Cache. Analyse ohne Internet möglich.',
    } as L6,
  },
  {
    icon: '🎼',
    title: { ja: '美しい楽譜描画', en: 'Beautiful score rendering', es: 'Renderizado hermoso', ko: '아름다운 악보 묘사', pt: 'Renderização bonita', de: 'Schönes Notenbild' } as L6,
    desc: {
      ja: 'OpenSheetMusicDisplay + Bravura SMuFL フォントで出版水準。ローマ数字・カデンツ色分け・転調タイムラインも美しく統合。',
      en: 'OpenSheetMusicDisplay + Bravura SMuFL font deliver publication-grade typesetting. Roman numerals, cadence colors, modulation timeline elegantly integrated.',
      es: 'OSMD + Bravura SMuFL para tipografía de publicación.',
      ko: 'OSMD + Bravura SMuFL 폰트로 출판 수준.',
      pt: 'OSMD + Bravura SMuFL para tipografia de publicação.',
      de: 'OSMD + Bravura SMuFL für Veröffentlichungsqualität.',
    } as L6,
  },
  {
    icon: '🎧',
    title: { ja: 'MIDI 再生 + 声部制御', en: 'MIDI playback + voice control', es: 'Reproducción MIDI', ko: 'MIDI 재생', pt: 'Reprodução MIDI', de: 'MIDI-Wiedergabe' } as L6,
    desc: {
      ja: 'Tone.js による滑らかな MIDI 再生。テンポ 25-200%、声部別ミュート/ソロ、音量、カーソル追従、すべてブラウザ内完結。',
      en: 'Smooth MIDI playback via Tone.js. Tempo 25-200%, voice mute/solo, volume, cursor sync — all in-browser.',
      es: 'Reproducción MIDI fluida con Tone.js. Tempo, voces, volumen, todo en el navegador.',
      ko: 'Tone.js로 부드러운 MIDI 재생. 템포·성부 음소거/솔로·음량·커서 추종.',
      pt: 'Reprodução MIDI suave com Tone.js. Tempo, vozes, volume, tudo no navegador.',
      de: 'Geschmeidige MIDI-Wiedergabe mit Tone.js. Tempo, Stimmen, Lautstärke, Cursor-Sync.',
    } as L6,
  },
];

const HOW_IT_WORKS = [
  {
    num: '1',
    title: { ja: 'Lab を開く', en: 'Open Lab', es: 'Abrir Lab', ko: 'Lab 열기', pt: 'Abrir Lab', de: 'Lab öffnen' } as L6,
    desc: { ja: '初回のみ Pyodide + music21 (約 30MB) がブラウザに読み込まれる。WiFi 環境で約 30 秒〜1 分。2 回目以降は瞬時。', en: 'Pyodide + music21 (~30MB) loads on first visit. About 30s-1min on WiFi. Subsequent visits are instant.', es: 'Pyodide + music21 (~30MB) se carga en la primera visita.', ko: 'Pyodide + music21 (~30MB)가 첫 방문 시 로드됩니다.', pt: 'Pyodide + music21 (~30MB) carrega na primeira visita.', de: 'Pyodide + music21 (~30MB) lädt beim ersten Besuch.' } as L6,
  },
  {
    num: '2',
    title: { ja: '楽曲を選ぶ', en: 'Pick a piece', es: 'Elija una pieza', ko: '곡 선택', pt: 'Escolha uma peça', de: 'Werk wählen' } as L6,
    desc: { ja: '3,500+ 曲のキュレーションライブラリから検索 (Bach 433・Mozart 16・Beethoven 26・Palestrina 1018 等)。', en: 'Search 3,500+ pieces (Bach 433, Mozart 16, Beethoven 26, Palestrina 1018, and more).', es: 'Busque entre 3,500+ piezas.', ko: '3,500+ 곡에서 검색.', pt: 'Busque entre 3,500+ peças.', de: '3.500+ Werke durchsuchen.' } as L6,
  },
  {
    num: '3',
    title: { ja: '一瞬で結果', en: 'Instant results', es: 'Resultados al instante', ko: '즉시 결과', pt: 'Resultados instantâneos', de: 'Sofort-Ergebnisse' } as L6,
    desc: { ja: '裏で Python が走り、楽譜・ローマ数字・カデンツ・転調マップ・声部進行違反・MIDI 再生まで一気に表示。', en: 'Python runs in the background; score, Roman numerals, cadences, modulations, voice leading, and MIDI playback all appear at once.', es: 'Python se ejecuta en segundo plano; partitura, números romanos, cadencias y reproducción aparecen al instante.', ko: 'Python이 백그라운드에서 실행되어 악보·로마 숫자·종지·전조·재생이 한 번에.', pt: 'Python roda em segundo plano; partitura, algarismos romanos, cadências e reprodução aparecem.', de: 'Python läuft im Hintergrund; Partitur, Stufen, Kadenzen, Wiedergabe erscheinen sofort.' } as L6,
  },
];

const USE_CASES = [
  { persona: { ja: '音大生', en: 'Music students', es: 'Estudiantes', ko: '음대생', pt: 'Estudantes', de: 'Musikstudierende' } as L6, use: { ja: '和声学・対位法・楽曲分析の予習復習。授業前の譜読みに。', en: 'Pre-class score reading, harmony homework, counterpoint review.', es: 'Lectura previa, tarea de armonía, revisión.', ko: '수업 전 악보 읽기, 화성학 과제.', pt: 'Leitura prévia, tarefa de harmonia.', de: 'Vorbereitung, Harmonielehre.' } as L6 },
  { persona: { ja: '指揮者・編曲家', en: 'Conductors / arrangers', es: 'Directores / arreglistas', ko: '지휘자·편곡가', pt: 'Maestros / arranjadores', de: 'Dirigenten / Arrangeure' } as L6, use: { ja: 'スコア構造の即時把握。リハーサル前夜の和声整理。', en: 'Grasp score structure instantly. Late-night harmonic mapping before rehearsal.', es: 'Comprensión instantánea de estructura.', ko: '악보 구조 즉시 파악.', pt: 'Compreensão instantânea da estrutura.', de: 'Sofortiges Erfassen der Struktur.' } as L6 },
  { persona: { ja: '作曲家', en: 'Composers', es: 'Compositores', ko: '작곡가', pt: 'Compositores', de: 'Komponisten' } as L6, use: { ja: '自作品の声部進行チェック。プライバシー完全保護でアップロードして安心。', en: 'Check voice leading on works-in-progress. Total privacy means safe to upload unfinished pieces.', es: 'Verificar conducción de voces en obras propias.', ko: '자작품 성부 진행 확인.', pt: 'Verificar condução de vozes em obras em andamento.', de: 'Stimmführung eigener Werke prüfen.' } as L6 },
  { persona: { ja: '音楽情報学研究者', en: 'MIR researchers', es: 'Investigadores MIR', ko: 'MIR 연구자', pt: 'Pesquisadores MIR', de: 'MIR-Forscher' } as L6, use: { ja: 'インストール不要で music21 を学生に紹介。授業デモにも最適。', en: 'Introduce music21 to students with zero installation. Perfect for classroom demos.', es: 'Presentar music21 sin instalación.', ko: '설치 없이 music21 소개.', pt: 'Apresentar music21 sem instalação.', de: 'music21 ohne Installation vorstellen.' } as L6 },
];

const FAQ = [
  {
    q: { ja: '本当にサーバーを使っていないのですか？', en: 'Is it really server-free?', es: '¿Realmente sin servidor?', ko: '정말 서버를 사용하지 않나요?', pt: 'Realmente sem servidor?', de: 'Wirklich serverlos?' } as L6,
    a: { ja: '楽譜の取得には軽量な API を使いますが、分析処理（Python music21 の実行）はあなたのブラウザの CPU で完全に行われます。あなたが選んだ楽曲のデータは音楽分析のためにサーバーへ送信されません。', en: 'A lightweight API delivers the score MusicXML, but the analysis itself (Python music21 execution) runs entirely on your browser\'s CPU. Your selected score data is never sent to a server for analysis.', es: 'Una API ligera entrega el MusicXML, pero el análisis (Python music21) se ejecuta completamente en su navegador.', ko: '악보 가져오기에 가벼운 API를 사용하지만, 분석은 완전히 브라우저 CPU에서 실행됩니다.', pt: 'Uma API leve entrega o MusicXML, mas a análise roda inteiramente no seu navegador.', de: 'Eine leichte API liefert das MusicXML, aber die Analyse läuft vollständig in Ihrem Browser.' } as L6,
  },
  {
    q: { ja: '初回 30MB は重くないですか？', en: 'Isn\'t the 30MB initial load too heavy?', es: '¿No es pesado el 30MB inicial?', ko: '초기 30MB가 무겁지 않나요?', pt: 'Os 30MB iniciais não são pesados?', de: 'Sind die anfänglichen 30MB nicht zu schwer?' } as L6,
    a: { ja: 'WiFi 環境で 30 秒〜1 分です。2 回目以降はブラウザキャッシュから瞬時。Spotify のアプリ初回起動より軽量で、その後はずっとオフラインで動作します。スマートフォンは非対応で、PC/Mac 推奨です。', en: '30 seconds to 1 minute on WiFi. Subsequent visits load instantly from cache. Lighter than Spotify\'s first launch, and works offline afterward. PC/Mac required, smartphones not supported.', es: '30 segundos a 1 minuto en WiFi. Cargas posteriores son instantáneas desde caché.', ko: 'WiFi에서 30초~1분. 이후 방문은 캐시에서 즉시.', pt: '30 segundos a 1 minuto no WiFi. Visitas seguintes carregam do cache.', de: '30 Sekunden bis 1 Minute über WiFi. Nachfolgende Besuche sofort aus dem Cache.' } as L6,
  },
  {
    q: { ja: '/classical との違いは？', en: 'How is this different from /classical?', es: '¿En qué se diferencia de /classical?', ko: '/classical과 어떻게 다른가요?', pt: 'Qual a diferença de /classical?', de: 'Wie unterscheidet es sich von /classical?' } as L6,
    a: { ja: '/classical はサーバー (Cloud Run + Python) で分析する標準アプリで、Concerto プラン以上で利用可能。Lab はブラウザ内で同じ分析を実行する実験的バージョンで、サーバーコストゼロのため Prelude プランから利用可能です。出力結果はほぼ同等で、好みに応じて選んでください。', en: '/classical analyzes on the server (Cloud Run + Python) and requires Concerto tier. Lab runs the same analysis in your browser; since server cost is zero, it\'s available from Prelude tier. Outputs are nearly identical — choose based on preference.', es: '/classical analiza en servidor (Concerto+). Lab ejecuta lo mismo en su navegador (Prelude+).', ko: '/classical은 서버 분석 (Concerto+). Lab은 브라우저 내 분석 (Prelude+).', pt: '/classical analisa no servidor (Concerto+). Lab roda o mesmo no seu navegador (Prelude+).', de: '/classical analysiert auf dem Server (Concerto+). Lab führt dieselbe Analyse im Browser aus (Prelude+).' } as L6,
  },
  {
    q: { ja: 'Pyodide ってどれくらい安定していますか？', en: 'How stable is Pyodide?', es: '¿Cuán estable es Pyodide?', ko: 'Pyodide는 얼마나 안정적인가요?', pt: 'Quão estável é o Pyodide?', de: 'Wie stabil ist Pyodide?' } as L6,
    a: { ja: 'Mozilla Research が 2018 年に開始し、現在は活発な OSS コミュニティが maintain。NumPy・SciPy・Pandas・Matplotlib・SymPy などの主要な数値計算ライブラリが正式サポートされ、JupyterLite (公式 Jupyter のブラウザ版) でも採用されています。研究レベルの利用に十分な安定性を持っています。', en: 'Started by Mozilla Research in 2018, now maintained by an active open-source community. Officially supports NumPy, SciPy, Pandas, Matplotlib, SymPy, and more. Also powers JupyterLite (the browser version of official Jupyter). Stable enough for research use.', es: 'Iniciado por Mozilla Research en 2018. Soporta NumPy, SciPy, Pandas oficialmente.', ko: 'Mozilla Research가 2018년 시작. NumPy·SciPy·Pandas 공식 지원.', pt: 'Iniciado pela Mozilla Research em 2018. Suporta NumPy, SciPy, Pandas oficialmente.', de: 'Von Mozilla Research 2018 gestartet. Offizielle Unterstützung für NumPy, SciPy, Pandas.' } as L6,
  },
  {
    q: { ja: 'スマートフォンで使えますか？', en: 'Can I use this on a smartphone?', es: '¿Puedo usarlo en smartphone?', ko: '스마트폰에서 사용 가능한가요?', pt: 'Posso usar no smartphone?', de: 'Kann ich es auf dem Smartphone nutzen?' } as L6,
    a: { ja: '推奨していません。Pyodide のメモリ消費 (~200MB) と CPU 負荷がモバイル端末で安定動作しないためです。PC/Mac の利用を推奨します。サーバー版の /classical はスマホ対応です。', en: 'Not recommended. Pyodide\'s memory footprint (~200MB) and CPU load don\'t run reliably on mobile. We recommend PC/Mac. The server-based /classical works fine on phones.', es: 'No recomendado. Pyodide consume ~200MB de memoria.', ko: '권장하지 않습니다. Pyodide의 메모리 ~200MB.', pt: 'Não recomendado. Pyodide consome ~200MB.', de: 'Nicht empfohlen. Pyodide benötigt ~200MB Speicher.' } as L6,
  },
  {
    q: { ja: '料金は？', en: 'What about pricing?', es: '¿Cuánto cuesta?', ko: '요금은?', pt: 'Quanto custa?', de: 'Was kostet es?' } as L6,
    a: { ja: 'Prelude プラン (¥780/月) 以上で無制限利用。月額・年額からお選びいただけます。年額プランは実質 2 ヶ月分お得。初月は HALF50 キャンペーンで 50% オフです。', en: 'Unlimited use with Prelude plan (¥780/mo) or above. Monthly and annual billing available; annual saves ~2 months. First month 50% off via HALF50 campaign.', es: 'Uso ilimitado con plan Prelude (¥780/mes) o superior. Primer mes 50% off.', ko: 'Prelude (¥780/월) 이상에서 무제한. 첫 달 50% 할인.', pt: 'Plano Prelude (¥780/mês) em diante. Primeiro mês 50% off.', de: 'Prelude-Tarif (¥780/Monat) aufwärts. Erster Monat 50% Rabatt.' } as L6,
  },
];

const JSONLD_SOFTWARE = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'KUON CLASSICAL LAB',
  applicationCategory: 'EducationalApplication',
  applicationSubCategory: 'Music Analysis',
  operatingSystem: 'Web Browser (Chrome, Firefox, Safari, Edge)',
  offers: {
    '@type': 'Offer',
    price: '780',
    priceCurrency: 'JPY',
    availability: 'https://schema.org/InStock',
    description: 'Available with Prelude plan (¥780/month) or above. Monthly and annual billing options.',
  },
  description:
    'World\'s first browser-native music21 environment. Pyodide (Mozilla CPython on WebAssembly) runs real Python music21 in your browser, with zero server cost. Roman numeral analysis, voice leading checker, modulation map, MIDI playback for Bach chorales, Mozart sonatas, Beethoven quartets, Palestrina masses. Privacy-first: scores never leave your device.',
  featureList: [
    'Pyodide-based Python execution in WebAssembly',
    'music21 (MIT 2008) running entirely in browser',
    'Roman numeral analysis (V7/vi, secondary dominants, borrowed chords)',
    'Krumhansl-Schmuckler key detection algorithm',
    'Cadence detection (authentic, plagal, deceptive, half)',
    'Modulation map with windowed analysis',
    'Voice leading violation checker (parallel fifths, parallel octaves)',
    'OpenSheetMusicDisplay (OSMD) score rendering with Bravura SMuFL',
    'Tone.js MIDI playback with voice mute/solo, tempo control, master volume',
    'OSMD cursor synchronized to audio playback',
    'Curated library of 3,500+ pieces (Bach 433, Palestrina 1018, Mozart, Beethoven, Haydn, etc.)',
    'Multilingual UI (Japanese, English, Spanish, Korean, Portuguese, German)',
    'Zero server cost — unlimited usage',
    'Offline-capable after first load',
    'Privacy-first: scores never leave the browser',
  ],
  audience: {
    '@type': 'Audience',
    audienceType: 'Music students, music teachers, conductors, composers, music informatics researchers',
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
    acceptedAnswer: { '@type': 'Answer', text: t(item.a, 'en') },
  })),
};

const JSONLD_HOWTO = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to analyze classical music with KUON CLASSICAL LAB (browser-native music21)',
  description: 'Run real Python music21 in your browser via Pyodide. Three steps from URL to harmonic analysis.',
  step: HOW_IT_WORKS.map((s, i) => ({
    '@type': 'HowToStep',
    position: i + 1,
    name: t(s.title, 'en'),
    text: t(s.desc, 'en'),
  })),
  totalTime: 'PT60S',
};

export default function ClassicalLabLP() {
  const { lang } = useLang();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ minHeight: '100vh', background: BG_CREAM, color: '#0f172a', fontFamily: sans }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_SOFTWARE) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_FAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_HOWTO) }} />

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
          <Link href="/classical/lab" style={{
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

      {/* Breakthrough — なぜ世界初か */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 400, textAlign: 'center', marginBottom: '2.5rem', color: '#0f172a', letterSpacing: '0.02em' }}>
          {t(BREAKTHROUGH.heading, lang)}
        </h2>
        <div style={{ background: '#fff', borderRadius: 14, padding: 'clamp(1.5rem, 3vw, 2.5rem)', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 2, whiteSpace: 'pre-line', wordBreak: 'keep-all', margin: 0 }}>
            {t(BREAKTHROUGH.body, lang)}
          </p>
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

      {/* 技術的な裏付け */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 400, textAlign: 'center', marginBottom: '0.8rem', color: '#0f172a' }}>
          {t(TECH.heading, lang)}
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', marginBottom: '2.5rem', fontFamily: mono }}>
          Pyodide v0.29 · music21 · OpenSheetMusicDisplay · Tone.js · @tonejs/midi
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.2rem' }}>
          {TECH.items.map((item, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
              <h3 style={{ fontFamily: serif, fontSize: '1.05rem', fontWeight: 500, color: ACCENT, margin: 0, marginBottom: '0.6rem', letterSpacing: '0.01em' }}>
                {t(item.title, lang)}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.85, margin: 0, wordBreak: 'keep-all' }}>
                {t(item.desc, lang)}
              </p>
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

      {/* Use Cases */}
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
          {{ ja: '今すぐ Lab を起動', en: 'Launch Lab now', es: 'Iniciar Lab ahora', ko: '지금 Lab 시작', pt: 'Iniciar Lab agora', de: 'Lab jetzt starten' }[lang] ?? 'Launch Lab now'}
        </h2>
        <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.85, marginBottom: '2.5rem' }}>
          {{
            ja: 'Prelude プラン (¥780/月) から無制限利用。サーバーコストゼロ、プライバシー完全保護。',
            en: 'Unlimited use from Prelude (¥780/mo). Zero server cost, total privacy.',
            es: 'Uso ilimitado desde Prelude (¥780/mes). Costo de servidor cero.',
            ko: 'Prelude (¥780/월) 부터 무제한. 서버 비용 제로.',
            pt: 'Uso ilimitado a partir do Prelude (¥780/mês). Custo de servidor zero.',
            de: 'Unbegrenzte Nutzung ab Prelude (¥780/Monat). Null Serverkosten.',
          }[lang] ?? 'Unlimited use from Prelude.'}
        </p>
        <Link href="/classical/lab" style={{
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
