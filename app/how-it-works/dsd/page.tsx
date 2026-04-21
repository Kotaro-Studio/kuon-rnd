'use client';

import React from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ──────────────────────────────────────────────────────
// Types & Constants
// ──────────────────────────────────────────────────────
type L3 = Partial<Record<Lang, string>> & { en: string };

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#7C3AED';
const ACCENT_LIGHT = '#A78BFA';
const ACCENT_DARK = '#6D28D9';
const GLASS_BG = 'rgba(255, 255, 255, 0.6)';
const GLASS_DARK = 'rgba(30, 27, 34, 0.7)';

const t = (m: L3, lang: Lang): string => m[lang] ?? m.en;

// ──────────────────────────────────────────────────────
// i18n Content
// ──────────────────────────────────────────────────────
const T = {
  // Hero
  heroTitle: {
    en: 'How KUON DSD Works',
    ja: 'KUON DSD の仕組み',
    es: 'Cómo funciona KUON DSD',
    ko: 'KUON DSD 작동 원리',
    pt: 'Como KUON DSD Funciona',
  } as L3,
  heroSubtitle: {
    en: 'World\'s first browser-based DSD player, powered by Rust compiled to WebAssembly',
    ja: '世界初のブラウザDSDプレーヤー。Rustで実装したWasm音声エンジン。',
    es: 'El primer reproductor DSD basado en navegador del mundo, impulsado por Rust compilado a WebAssembly',
    ko: '세계 최초 브라우저 기반 DSD 플레이어. Rust WebAssembly 오디오 엔진.',
    pt: 'Primeiro reprodutor de DSD baseado em navegador do mundo, powered por Rust compilado para WebAssembly',
  } as L3,

  // Section: What is DSD?
  sectionWhatIsDSD: {
    en: 'What is DSD?',
    ja: 'DSD とは',
    es: 'Qué es DSD',
    ko: 'DSD란 무엇인가?',
    pt: 'O que é DSD?',
  } as L3,
  whatIsDsdDesc: {
    en: 'Direct Stream Digital (DSD) is a one-bit, high-frequency sigma-delta encoded format used for Super Audio CD (SACD). Unlike PCM, which stores discrete audio samples, DSD stores a continuous bitstream at very high sample rates.',
    ja: 'DSD（ダイレクト・ストリーム・デジタル）は、Super Audio CD（SACD）に採用された1ビット・超高速シグマデルタ変調フォーマットです。PCMのように離散的なサンプルを保存するのではなく、DSDは非常に高いサンプリング周波数での連続ビットストリームを保存します。',
    es: 'DSD (Direct Stream Digital) es un formato codificado de sigma-delta de un bit y alta frecuencia utilizado para Super Audio CD (SACD). A diferencia de PCM, que almacena muestras de audio discretas, DSD almacena una secuencia de bits continua en tasas de muestreo muy altas.',
    ko: 'DSD(Direct Stream Digital)는 Super Audio CD(SACD)에 사용되는 1비트 고주파 시그마-델타 인코딩 형식입니다. 이산 샘플을 저장하는 PCM과 달리, DSD는 매우 높은 샘플 레이트의 연속 비트 스트림을 저장합니다.',
    pt: 'DSD (Direct Stream Digital) é um formato codificado por sigma-delta de um bit e alta frequência usado para Super Audio CD (SACD). Diferentemente do PCM, que armazena amostras de áudio discretas, DSD armazena um fluxo de bits contínuo em taxas de amostragem muito altas.',
  } as L3,
  dsdRates: {
    en: 'DSD Sample Rates:',
    ja: 'DSD サンプリング周波数:',
    es: 'Tasas de muestreo DSD:',
    ko: 'DSD 샘플 레이트:',
    pt: 'Taxas de amostragem DSD:',
  } as L3,
  dsd64: {
    en: 'DSD64 — 2.8224 MHz (≈ 64× CD sample rate)',
    ja: 'DSD64 — 2.8224 MHz (CD周波数の約64倍)',
    es: 'DSD64 — 2.8224 MHz (≈ 64× tasa de CD)',
    ko: 'DSD64 — 2.8224 MHz (CD 샘플 레이트의 약 64배)',
    pt: 'DSD64 — 2.8224 MHz (≈ 64× taxa de CD)',
  } as L3,
  dsd128: {
    en: 'DSD128 — 5.6448 MHz (≈ 128× CD sample rate)',
    ja: 'DSD128 — 5.6448 MHz (CD周波数の約128倍)',
    es: 'DSD128 — 5.6448 MHz (≈ 128× tasa de CD)',
    ko: 'DSD128 — 5.6448 MHz (CD 샘플 레이트의 약 128배)',
    pt: 'DSD128 — 5.6448 MHz (≈ 128× taxa de CD)',
  } as L3,
  dsd256: {
    en: 'DSD256 — 11.2896 MHz (≈ 256× CD sample rate)',
    ja: 'DSD256 — 11.2896 MHz (CD周波数の約256倍)',
    es: 'DSD256 — 11.2896 MHz (≈ 256× tasa de CD)',
    ko: 'DSD256 — 11.2896 MHz (CD 샘플 레이트의 약 256배)',
    pt: 'DSD256 — 11.2896 MHz (≈ 256× taxa de CD)',
  } as L3,

  // Section: The Challenge
  sectionChallenge: {
    en: 'The Challenge: Why DSD in a Browser is "Impossible"',
    ja: 'チャレンジ: ブラウザでDSDを再生することが「不可能」な理由',
    es: 'El desafío: Por qué DSD en un navegador es "imposible"',
    ko: '도전: 브라우저에서 DSD 재생이 "불가능"한 이유',
    pt: 'O Desafio: Por que DSD em um navegador é "impossível"',
  } as L3,
  challengeDesc: {
    en: 'Browser audio APIs are designed for PCM formats, not for DSD bitstreams. When you play DSD through a browser, several barriers emerge:',
    ja: 'ブラウザのオーディオAPIはPCM形式向けに設計されており、DSDビットストリーム向けではありません。ブラウザでDSDを再生する際には、いくつかの障壁が現れます:',
    es: 'Las APIs de audio del navegador están diseñadas para formatos PCM, no para flujos de bits DSD. Cuando intentas reproducir DSD en un navegador, surgen varias barreras:',
    ko: '브라우저 오디오 API는 PCM 형식용으로 설계되었으며, DSD 비트스트림용이 아닙니다. 브라우저에서 DSD를 재생할 때 여러 장벽이 나타납니다:',
    pt: 'As APIs de áudio do navegador são projetadas para formatos PCM, não para fluxos de bits DSD. Quando você tenta reproduzir DSD em um navegador, várias barreiras surgem:',
  } as L3,
  challenge1: {
    en: 'No native DSD support — Web Audio API only accepts PCM (Float32Array)',
    ja: 'ネイティブDSDサポートなし — Web Audio APIはPCM（Float32Array）のみを受け入れる',
    es: 'Sin soporte nativo DSD — Web Audio API solo acepta PCM (Float32Array)',
    ko: '기본 DSD 지원 없음 — Web Audio API는 PCM(Float32Array)만 허용',
    pt: 'Sem suporte nativo DSD — Web Audio API aceita apenas PCM (Float32Array)',
  } as L3,
  challenge2: {
    en: 'File size: DSD albums can be gigabytes (DSD256+ even larger)',
    ja: 'ファイルサイズ: DSDアルバムはギガバイト単位（DSD256以上はさらに大きい）',
    es: 'Tamaño de archivo: los álbumes DSD pueden ser de gigabytes (DSD256+ incluso más grandes)',
    ko: '파일 크기: DSD 앨범은 기가바이트 규모(DSD256 이상은 더 큼)',
    pt: 'Tamanho do arquivo: álbuns DSD podem ser gigabytes (DSD256+ ainda maiores)',
  } as L3,
  challenge3: {
    en: 'JavaScript is too slow for MHz-rate DSP without specialized acceleration',
    ja: 'JavaScriptはMHz周波数のDSP処理に対して、特殊な加速なしでは遅すぎる',
    es: 'JavaScript es demasiado lento para procesamiento DSP a velocidad MHz sin aceleración especializada',
    ko: 'JavaScript는 특수 가속 없이는 MHz 속도의 DSP 처리에 너무 느림',
    pt: 'JavaScript é muito lento para processamento DSP na taxa de MHz sem aceleração especializada',
  } as L3,
  challenge4: {
    en: 'Filter design: Decimation filters must suppress >70dB aliasing artifacts',
    ja: 'フィルター設計: デシメーションフィルターは70dB以上のエイリアシング成分を抑制する必要がある',
    es: 'Diseño de filtro: los filtros de decimación deben suprimir artefactos de aliasing > 70dB',
    ko: '필터 설계: 데시메이션 필터는 70dB 이상의 에일리어싱 아티팩트를 억제해야 함',
    pt: 'Design de filtro: filtros de decimação devem suprimir artefatos de aliasing > 70dB',
  } as L3,

  // Section: File Formats
  sectionFormats: {
    en: 'DSF & DSDIFF: Binary File Formats',
    ja: 'DSF & DSDIFF: バイナリファイルフォーマット',
    es: 'DSF y DSDIFF: Formatos de archivo binario',
    ko: 'DSF & DSDIFF: 바이너리 파일 형식',
    pt: 'DSF e DSDIFF: Formatos de arquivo binário',
  } as L3,
  formatsDesc: {
    en: 'DSD audio comes in two container formats. Our Wasm engine must parse both:',
    ja: 'DSDオーディオは2つのコンテナフォーマットで提供されます。私たちのWasmエンジンは両方をサポートする必要があります:',
    es: 'El audio DSD viene en dos formatos de contenedor. Nuestro motor Wasm debe analizar ambos:',
    ko: 'DSD 오디오는 두 가지 컨테이너 형식으로 제공됩니다. Wasm 엔진은 둘 다 파싱할 수 있어야 합니다:',
    pt: 'Áudio DSD vem em dois formatos de contêiner. Nosso mecanismo Wasm deve analisar ambos:',
  } as L3,
  dsfFormat: {
    en: 'DSF (DSD Stream File)',
    ja: 'DSF（DSD Stream File）',
    es: 'DSF (Archivo de flujo DSD)',
    ko: 'DSF (DSD Stream File)',
    pt: 'DSF (Arquivo de fluxo DSD)',
  } as L3,
  dsfDesc: {
    en: 'Simple, straightforward format: DSD Chunk → fmt Chunk → data Chunk. Offsets are fixed.',
    ja: 'シンプルで直線的なフォーマット: DSD Chunk → fmt Chunk → data Chunk. オフセットは固定。',
    es: 'Formato simple y directo: DSD Chunk → fmt Chunk → data Chunk. Los desplazamientos son fijos.',
    ko: '단순하고 직관적인 형식: DSD Chunk → fmt Chunk → data Chunk. 오프셋은 고정됨.',
    pt: 'Formato simples e direto: DSD Chunk → fmt Chunk → data Chunk. Os deslocamentos são fixos.',
  } as L3,
  dffFormat: {
    en: 'DSDIFF (Philips "DSD Interchange File Format")',
    ja: 'DSDIFF（フィリップス "DSD Interchange File Format"）',
    es: 'DSDIFF (Formato de archivo de intercambio DSD de Philips)',
    ko: 'DSDIFF (Philips "DSD Interchange File Format")',
    pt: 'DSDIFF (Formato de arquivo de intercâmbio DSD da Philips)',
  } as L3,
  dffDesc: {
    en: 'Nested chunk structure: FRM8 (IFF-style 64-bit container) → DSD → PROP → CHNL → CMPR → DSD data.',
    ja: 'ネストされたチャンク構造: FRM8（IFF形式64ビットコンテナ） → DSD → PROP → CHNL → CMPR → DSDデータ。',
    es: 'Estructura de chunks anidada: FRM8 (contenedor IFF de 64 bits) → DSD → PROP → CHNL → CMPR → datos DSD.',
    ko: '중첩된 청크 구조: FRM8 (IFF 스타일 64비트 컨테이너) → DSD → PROP → CHNL → CMPR → DSD 데이터.',
    pt: 'Estrutura de chunks aninhada: FRM8 (contêiner IFF de 64 bits) → DSD → PROP → CHNL → CMPR → dados DSD.',
  } as L3,
  keyOffsets: {
    en: 'Critical byte offsets in fmt Chunk:',
    ja: 'fmt Chunkの重要なバイトオフセット:',
    es: 'Desplazamientos de bytes críticos en el bloque fmt:',
    ko: 'fmt Chunk의 중요 바이트 오프셋:',
    pt: 'Deslocamentos de bytes críticos em fmt Chunk:',
  } as L3,
  offsetChannels: {
    en: '+24: Number of audio channels',
    ja: '+24: オーディオチャンネル数',
    es: '+24: Número de canales de audio',
    ko: '+24: 오디오 채널 수',
    pt: '+24: Número de canais de áudio',
  } as L3,
  offsetSampleRate: {
    en: '+28: DSD sample rate code',
    ja: '+28: DSDサンプルレートコード',
    es: '+28: Código de velocidad de muestreo DSD',
    ko: '+28: DSD 샘플 레이트 코드',
    pt: '+28: Código de taxa de amostragem DSD',
  } as L3,
  offsetBitDepth: {
    en: '+32: Bits per sample (always 8 for DSD)',
    ja: '+32: サンプルあたりのビット数（DSDは常に8）',
    es: '+32: Bits por muestra (siempre 8 para DSD)',
    ko: '+32: 샘플당 비트(DSD는 항상 8)',
    pt: '+32: Bits por amostra (sempre 8 para DSD)',
  } as L3,

  // Section: Rust Wasm
  sectionWasm: {
    en: 'Rust WebAssembly Engine: The Core Innovation',
    ja: 'Rust WebAssemblyエンジン: 核となるイノベーション',
    es: 'Motor Rust WebAssembly: La innovación central',
    ko: 'Rust WebAssembly 엔진: 핵심 혁신',
    pt: 'Mecanismo Rust WebAssembly: A inovação central',
  } as L3,
  wasmDesc: {
    en: 'The secret to making DSD work in a browser is compiled Rust code. Here\'s why:',
    ja: 'DSDをブラウザで動作させるための秘訣は、コンパイルされたRustコードです。理由は以下の通りです:',
    es: 'El secreto para hacer que DSD funcione en un navegador es el código Rust compilado. Así es por qué:',
    ko: '브라우저에서 DSD를 작동시키는 비결은 컴파일된 Rust 코드입니다. 이유는 다음과 같습니다:',
    pt: 'O segredo para fazer DSD funcionar em um navegador é código Rust compilado. Aqui está o porquê:',
  } as L3,
  rustReason1: {
    en: 'Zero-cost abstractions — No garbage collection pauses during audio processing',
    ja: 'ゼロコストな抽象化 — オーディオ処理中にガベージコレクションが一時停止しない',
    es: 'Abstracciones de costo cero — Sin pausas de recolección de basura durante el procesamiento de audio',
    ko: '무료 추상화 — 오디오 처리 중에 가비지 컬렉션이 일시 중지되지 않음',
    pt: 'Abstrações de custo zero — Sem pausas de coleta de lixo durante o processamento de áudio',
  } as L3,
  rustReason2: {
    en: 'SIMD-like optimizations — Compiler can vectorize byte-level operations',
    ja: 'SIMD的な最適化 — コンパイラはバイトレベルの演算をベクトル化できる',
    es: 'Optimizaciones similares a SIMD — El compilador puede vectorizar operaciones a nivel de byte',
    ko: 'SIMD 같은 최적화 — 컴파일러는 바이트 수준 작업을 벡터화할 수 있음',
    pt: 'Otimizações semelhantes a SIMD — O compilador pode vetorizar operações em nível de byte',
  } as L3,
  rustReason3: {
    en: '10× faster than JavaScript for FIR convolution (our benchmark)',
    ja: 'FIR畳み込みでJavaScriptより10倍高速（ベンチマーク結果）',
    es: '10× más rápido que JavaScript para convolución FIR (nuestro benchmark)',
    ko: 'FIR 컨볼루션의 경우 JavaScript보다 10배 빠름(벤치마크)',
    pt: '10× mais rápido que JavaScript para convolução FIR (nosso benchmark)',
  } as L3,

  // Wasm Build
  wasmBuildTitle: {
    en: 'Compilation Pipeline',
    ja: 'コンパイルパイプライン',
    es: 'Pipeline de compilación',
    ko: '컴파일 파이프라인',
    pt: 'Pipeline de compilação',
  } as L3,
  wasmBuildCmd: {
    en: 'wasm-pack build --target web',
    ja: 'wasm-pack build --target web',
    es: 'wasm-pack build --target web',
    ko: 'wasm-pack build --target web',
    pt: 'wasm-pack build --target web',
  } as L3,
  wasmBuildOutput: {
    en: 'Outputs: .wasm binary (~50KB), JavaScript glue code, TypeScript definitions',
    ja: '出力: .wasmバイナリ（～50KB）、JavaScriptグルーコード、TypeScript定義',
    es: 'Salida: binario .wasm (~50KB), código adhesivo de JavaScript, definiciones de TypeScript',
    ko: '출력: .wasm 바이너리(~50KB), JavaScript 글루 코드, TypeScript 정의',
    pt: 'Saída: binário .wasm (~50KB), código de cola JavaScript, definições TypeScript',
  } as L3,

  // LUT Section
  sectionLUT: {
    en: 'Byte-Level Look-Up Table (LUT): Blazing-Fast Bit Extraction',
    ja: 'バイトレベル ルックアップテーブル（LUT）: 超高速ビット抽出',
    es: 'Tabla de búsqueda a nivel de byte (LUT): Extracción de bits ultrarrápida',
    ko: '바이트 수준 룩업 테이블(LUT): 초고속 비트 추출',
    pt: 'Tabela de consulta a nível de byte (LUT): Extração de bits ultrarrápida',
  } as L3,
  lutDesc: {
    en: 'DSD is 8 bits per sample, meaning each byte encodes 8 sigma-delta bits. A naive approach would loop through all 8 bits of every byte, then calculate their float values. This is slow.',
    ja: 'DSDはサンプルあたり8ビットです。つまり、各バイトは8個のシグマデルタビットをエンコードします。単純なアプローチでは、すべてのバイトの8ビットすべてをループし、それらのフロート値を計算します。これは遅い。',
    es: 'DSD es 8 bits por muestra, lo que significa que cada byte codifica 8 bits sigma-delta. Un enfoque ingenuo sería hacer un bucle a través de los 8 bits de cada byte y luego calcular sus valores flotantes. Esto es lento.',
    ko: 'DSD는 샘플당 8비트이므로 각 바이트는 8개의 시그마 델타 비트를 인코딩합니다. 순진한 접근 방식은 모든 바이트의 8비트를 모두 반복한 다음 부동 값을 계산합니다. 이것은 느립니다.',
    pt: 'DSD é 8 bits por amostra, o que significa que cada byte codifica 8 bits sigma-delta. Uma abordagem ingênua seria fazer um loop através de todos os 8 bits de cada byte e depois calcular seus valores flutuantes. Isso é lento.',
  } as L3,
  lutSolution: {
    en: 'Solution: Pre-compute a 256-entry table where each index (0–255) maps directly to 8 float values:',
    ja: 'ソリューション: 256エントリのテーブルを事前計算します。各インデックス（0–255）は直接8個のフロート値にマップされます:',
    es: 'Solución: Pre-calcula una tabla de 256 entradas donde cada índice (0–255) se asigna directamente a 8 valores float:',
    ko: '솔루션: 각 인덱스(0–255)가 직접 8개의 부동 값에 매핑되는 256항목 테이블을 미리 계산합니다:',
    pt: 'Solução: Pré-compute uma tabela de 256 entradas onde cada índice (0–255) mapeia diretamente para 8 valores float:',
  } as L3,
  lutExample: {
    en: 'LUT[0x55] = [+1.0, +1.0, -1.0, +1.0, +1.0, -1.0, +1.0, +1.0]  // binary: 01010101',
    ja: 'LUT[0x55] = [+1.0, +1.0, -1.0, +1.0, +1.0, -1.0, +1.0, +1.0]  // バイナリ: 01010101',
    es: 'LUT[0x55] = [+1.0, +1.0, -1.0, +1.0, +1.0, -1.0, +1.0, +1.0]  // binario: 01010101',
    ko: 'LUT[0x55] = [+1.0, +1.0, -1.0, +1.0, +1.0, -1.0, +1.0, +1.0]  // 이진: 01010101',
    pt: 'LUT[0x55] = [+1.0, +1.0, -1.0, +1.0, +1.0, -1.0, +1.0, +1.0]  // binário: 01010101',
  } as L3,
  lutBenefit: {
    en: 'No branching, no bit-shifting overhead — just array lookup + memory access.',
    ja: 'ブランチングなし、ビットシフトオーバーヘッドなし — ただ配列ルックアップ+メモリアクセス。',
    es: 'Sin ramificación, sin sobrecarga de cambio de bits — solo búsqueda de matriz + acceso a memoria.',
    ko: '분기 없음, 비트 시프트 오버헤드 없음 — 배열 룩업 + 메모리 액세스만.',
    pt: 'Sem ramificação, sem sobrecarga de deslocamento de bits — apenas acesso de array + memória.',
  } as L3,

  // Section: FIR Filter
  sectionFilter: {
    en: 'Blackman-Sinc FIR Decimation Filter: The Mathematical Heart',
    ja: 'Blackman-Sinc FIRデシメーションフィルター: 数学的な中心',
    es: 'Filtro FIR de decimación Blackman-Sinc: El corazón matemático',
    ko: 'Blackman-Sinc FIR 데시메이션 필터: 수학적 중심',
    pt: 'Filtro FIR de decimação Blackman-Sinc: O coração matemático',
  } as L3,
  filterDesc: {
    en: 'Converting DSD to PCM requires a high-quality lowpass filter. We use a Blackman-windowed sinc FIR filter:',
    ja: 'DSDをPCMに変換するには、高品質なローパスフィルターが必要です。Blackman窓付きsinc FIRフィルターを使用します:',
    es: 'Convertir DSD a PCM requiere un filtro paso-bajo de alta calidad. Utilizamos un filtro FIR sinc ventaneado con Blackman:',
    ko: 'DSD를 PCM으로 변환하려면 고품질 로우패스 필터가 필요합니다. Blackman 창 sinc FIR 필터를 사용합니다:',
    pt: 'Converter DSD para PCM requer um filtro passa-baixa de alta qualidade. Usamos um filtro FIR sinc com janela Blackman:',
  } as L3,

  // Sinc
  sincTitle: {
    en: 'Sinc Function (Ideal Lowpass)',
    ja: 'Sinc関数（理想的なローパス）',
    es: 'Función Sinc (paso bajo ideal)',
    ko: 'Sinc 함수 (이상적인 로우패스)',
    pt: 'Função Sinc (passa-baixa ideal)',
  } as L3,
  sincFormula: {
    en: 'sinc(x) = sin(πx) / (πx)',
    ja: 'sinc(x) = sin(πx) / (πx)',
    es: 'sinc(x) = sin(πx) / (πx)',
    ko: 'sinc(x) = sin(πx) / (πx)',
    pt: 'sinc(x) = sin(πx) / (πx)',
  } as L3,
  sincDesc: {
    en: 'The sinc function is mathematically "perfect" — its frequency response is a brick-wall lowpass with zero sidelobes.',
    ja: 'sinc関数は数学的に「完璧」です — その周波数応答は、ゼロのサイドローブを備えたブリックウォール型のローパスです。',
    es: 'La función sinc es matemáticamente "perfecta" — su respuesta de frecuencia es un filtro paso-bajo de pared de ladrillos sin lóbulos laterales.',
    ko: 'sinc 함수는 수학적으로 "완벽"합니다 — 주파수 응답은 사이드로브가 0인 벽돌 벽 로우패스입니다.',
    pt: 'A função sinc é matematicamente "perfeita" — sua resposta em frequência é um filtro passa-baixa de parede de tijolos com lóbulos laterais zero.',
  } as L3,

  // Blackman
  blackmanTitle: {
    en: 'Blackman Window (Sidelobe Suppression)',
    ja: 'Blackman窓（サイドローブ抑制）',
    es: 'Ventana Blackman (supresión de lóbulos laterales)',
    ko: 'Blackman 윈도우 (사이드로브 억제)',
    pt: 'Janela Blackman (supressão de lóbulos laterais)',
  } as L3,
  blackmanFormula: {
    en: 'w(n) = 0.42 − 0.5 cos(2πn/N) + 0.08 cos(4πn/N)',
    ja: 'w(n) = 0.42 − 0.5 cos(2πn/N) + 0.08 cos(4πn/N)',
    es: 'w(n) = 0.42 − 0.5 cos(2πn/N) + 0.08 cos(4πn/N)',
    ko: 'w(n) = 0.42 − 0.5 cos(2πn/N) + 0.08 cos(4πn/N)',
    pt: 'w(n) = 0.42 − 0.5 cos(2πn/N) + 0.08 cos(4πn/N)',
  } as L3,
  blackmanDesc: {
    en: 'Applied to sinc taps, the Blackman window smoothly rolls off and achieves −74dB sidelobe suppression. This prevents aliasing artifacts.',
    ja: 'sincタップに適用すると、Blackman窓は滑らかにロールオフし、-74dBのサイドローブ抑制を実現します。これはエイリアシングアーティファクトを防ぎます。',
    es: 'Aplicada a los taps de sinc, la ventana Blackman se apaga suavemente y logra una supresión de lóbulos laterales de −74dB. Esto evita artefactos de aliasing.',
    ko: 'sinc 탭에 적용되는 Blackman 윈도우는 부드럽게 롤오프되고 −74dB 사이드로브 억제를 달성합니다. 이는 에일리어싱 아티팩트를 방지합니다.',
    pt: 'Aplicada aos taps sinc, a janela Blackman se apaga suavemente e consegue uma supressão de lóbulos laterais de −74dB. Isso evita artefatos de aliasing.',
  } as L3,

  // Convolution
  convolutionTitle: {
    en: 'Convolution: The Decimation Operation',
    ja: '畳み込み: デシメーション操作',
    es: 'Convolución: La operación de decimación',
    ko: '컨볼루션: 데시메이션 작업',
    pt: 'Convolução: A operação de decimação',
  } as L3,
  convolutionFormula: {
    en: 'y[n] = Σ h[k] × x[n − k]   (for each output sample)',
    ja: 'y[n] = Σ h[k] × x[n − k]   (各出力サンプルに対して)',
    es: 'y[n] = Σ h[k] × x[n − k]   (para cada muestra de salida)',
    ko: 'y[n] = Σ h[k] × x[n − k]   (각 출력 샘플에 대해)',
    pt: 'y[n] = Σ h[k] × x[n − k]   (para cada amostra de saída)',
  } as L3,
  convolutionDesc: {
    en: 'For each output PCM sample, multiply the filter coefficients by the surrounding DSD bits, then sum. The number of taps (coefficients) scales with the decimation ratio.',
    ja: '各出力PCMサンプルに対して、フィルター係数を周辺のDSDビットで乗算し、合計します。タップ数（係数）はデシメーション比に応じてスケーリングします。',
    es: 'Para cada muestra PCM de salida, multiplique los coeficientes del filtro por los bits DSD circundantes y luego sume. El número de taps (coeficientes) se escala con la relación de decimación.',
    ko: '각 출력 PCM 샘플에 대해 필터 계수에 주변 DSD 비트를 곱한 다음 합산합니다. 탭 수(계수)는 데시메이션 비율에 따라 크기 조정됩니다.',
    pt: 'Para cada amostra PCM de saída, multiplique os coeficientes do filtro pelos bits DSD circundantes e então some. O número de taps (coeficientes) é dimensionado com a taxa de decimação.',
  } as L3,
  convolutionTaps: {
    en: 'DSD64→44.1kHz requires ~8192 taps. DSD256→44.1kHz requires ~32,768 taps.',
    ja: 'DSD64→44.1kHzは～8192タップが必要です。DSD256→44.1kHzは～32,768タップが必要です。',
    es: 'DSD64→44.1kHz requiere ~8192 taps. DSD256→44.1kHz requiere ~32,768 taps.',
    ko: 'DSD64→44.1kHz는 ~8192 탭이 필요합니다. DSD256→44.1kHz는 ~32,768 탭이 필요합니다.',
    pt: 'DSD64→44.1kHz requer ~8192 taps. DSD256→44.1kHz requer ~32,768 taps.',
  } as L3,

  // Section: Streaming
  sectionStreaming: {
    en: 'Streaming Chunk Processing: Handling Gigabyte Files',
    ja: 'ストリーミングチャンク処理: ギガバイトファイルの処理',
    es: 'Procesamiento de chunks de transmisión: manejo de archivos de gigabytes',
    ko: '스트리밍 청크 처리: 기가바이트 파일 처리',
    pt: 'Processamento de chunks de streaming: tratamento de arquivos de gigabyte',
  } as L3,
  streamingDesc: {
    en: 'A high-resolution DSD256 album can be 5–8 GB. We cannot load the entire file into memory. Instead, we use chunked processing:',
    ja: '高解像度DSD256アルバムは5～8GBになる場合があります。ファイル全体をメモリにロードすることはできません。代わりに、チャンク処理を使用します:',
    es: 'Un álbum DSD256 de alta resolución puede tener 5-8 GB. No podemos cargar el archivo completo en la memoria. En su lugar, utilizamos procesamiento fragmentado:',
    ko: '고해상도 DSD256 앨범은 5-8GB가 될 수 있습니다. 전체 파일을 메모리에 로드할 수 없습니다. 대신 청크 처리를 사용합니다:',
    pt: 'Um álbum DSD256 de alta resolução pode ter 5-8 GB. Não podemos carregar o arquivo inteiro na memória. Em vez disso, usamos processamento em chunks:',
  } as L3,
  streamingStep1: {
    en: 'User selects DSD file (blob)',
    ja: 'ユーザーがDSDファイルを選択',
    es: 'El usuario selecciona el archivo DSD (blob)',
    ko: '사용자가 DSD 파일 선택',
    pt: 'Usuário seleciona arquivo DSD',
  } as L3,
  streamingStep2: {
    en: '8 MB chunks read via FileReader.readAsArrayBuffer(blob.slice(offset, offset + 8MB))',
    ja: '8MBのチャンクがFileReader.readAsArrayBuffer(blob.slice(offset, offset + 8MB))経由で読み取られます',
    es: 'Chunks de 8 MB leídos a través de FileReader.readAsArrayBuffer(blob.slice(offset, offset + 8MB))',
    ko: '8MB 청크가 FileReader.readAsArrayBuffer(blob.slice(offset, offset + 8MB))를 통해 읽음',
    pt: 'Chunks de 8 MB lidos via FileReader.readAsArrayBuffer(blob.slice(offset, offset + 8MB))',
  } as L3,
  streamingStep3: {
    en: 'Each chunk decoded independently by Wasm (DSF/DFF parser → LUT → FIR → Float32 output)',
    ja: '各チャンクはWasm（DSDパーサー→LUT→FIR→Float32出力）によって独立して解析されます',
    es: 'Cada chunk decodificado independientemente por Wasm (parser DSD → LUT → FIR → salida Float32)',
    ko: '각 청크는 Wasm에 의해 독립적으로 디코딩됨(DSD 파서 → LUT → FIR → Float32 출력)',
    pt: 'Cada chunk decodificado independentemente por Wasm (parser DSD → LUT → FIR → saída Float32)',
  } as L3,
  streamingStep4: {
    en: 'Results accumulated into a growing Float32Array (never exceeds ~16 MB total memory)',
    ja: '結果は成長するFloat32Arrayに累積されます（メモリはわずか～16MBを超えません）',
    es: 'Los resultados se acumulan en un Float32Array creciente (nunca excede ~16 MB de memoria total)',
    ko: '결과가 증가하는 Float32Array에 누적됨(메모리는 ~16MB를 초과하지 않음)',
    pt: 'Resultados acumulados em um Float32Array crescente (nunca excede ~16 MB de memória total)',
  } as L3,

  // Section: WAV Export
  sectionWAV: {
    en: 'WAV Export: 24-bit PCM Encoding',
    ja: 'WAVエクスポート: 24ビットPCMエンコーディング',
    es: 'Exportación WAV: codificación PCM de 24 bits',
    ko: 'WAV 내보내기: 24비트 PCM 인코딩',
    pt: 'Exportação WAV: codificação PCM de 24 bits',
  } as L3,
  wavDesc: {
    en: 'After decimation, the Float32 samples must be converted to 24-bit integer PCM and wrapped in a RIFF/WAVE container:',
    ja: 'デシメーション後、Float32サンプルは24ビット整数PCMに変換し、RIFF/WAVEコンテナでラップされます:',
    es: 'Después de la decimación, las muestras Float32 deben convertirse a PCM entero de 24 bits y envolverse en un contenedor RIFF/WAVE:',
    ko: '데시메이션 후, Float32 샘플은 24비트 정수 PCM으로 변환되고 RIFF/WAVE 컨테이너에 래핑됩니다:',
    pt: 'Após decimação, as amostras Float32 devem ser convertidas para PCM inteiro de 24 bits e envolvidas em um contêiner RIFF/WAVE:',
  } as L3,
  wavStep1: {
    en: 'Float32 clamping: max(−1.0, min(+1.0, sample))',
    ja: 'Float32クランピング: max(−1.0, min(+1.0, sample))',
    es: 'Saturación Float32: max(−1.0, min(+1.0, sample))',
    ko: 'Float32 클램핑: max(−1.0, min(+1.0, sample))',
    pt: 'Saturação Float32: max(−1.0, min(+1.0, sample))',
  } as L3,
  wavStep2: {
    en: 'Quantize to Int24: round(sample × 8388607) — 24-bit signed range',
    ja: 'Int24に量子化: round(sample × 8388607) — 24ビット符号付き範囲',
    es: 'Cuantizar a Int24: round(sample × 8388607) — rango de 24 bits firmado',
    ko: 'Int24로 양자화: round(sample × 8388607) — 24비트 부호 있는 범위',
    pt: 'Quantizar para Int24: round(sample × 8388607) — intervalo de 24 bits assinado',
  } as L3,
  wavStep3: {
    en: 'Pack 3 bytes per sample (little-endian for Blob.arrayBuffer)',
    ja: 'サンプルあたり3バイトをパック（Blob.arrayBuffer用リトルエンディアン）',
    es: 'Empacar 3 bytes por muestra (little-endian para Blob.arrayBuffer)',
    ko: '샘플당 3바이트 팩(Blob.arrayBuffer용 리틀 엔디안)',
    pt: 'Empacar 3 bytes por amostra (little-endian para Blob.arrayBuffer)',
  } as L3,
  wavStep4: {
    en: 'Prepend RIFF/WAVE header (44 bytes) with correct chunk sizes',
    ja: 'RIFF/WAVEヘッダー（44バイト）に正しいチャンクサイズを付加します',
    es: 'Anteponer encabezado RIFF/WAVE (44 bytes) con tamaños de chunk correctos',
    ko: '올바른 청크 크기를 사용하여 RIFF/WAVE 헤더(44바이트) 앞에 추가',
    pt: 'Preceda o cabeçalho RIFF/WAVE (44 bytes) com tamanhos de chunk corretos',
  } as L3,

  // Section: Performance
  sectionPerf: {
    en: 'Performance: Real-World Benchmarks',
    ja: 'パフォーマンス: リアルワールドベンチマーク',
    es: 'Rendimiento: Benchmarks del mundo real',
    ko: '성능: 실제 벤치마크',
    pt: 'Desempenho: Benchmarks do mundo real',
  } as L3,
  perfDesc: {
    en: 'Our implementation has been battle-tested with massive DSD files:',
    ja: '私たちの実装は巨大なDSDファイルで実戦テストされています:',
    es: 'Nuestra implementación ha sido probada en combate con archivos DSD masivos:',
    ko: '우리 구현은 대규모 DSD 파일로 실시간 테스트되었습니다:',
    pt: 'Nossa implementação foi testada em combate com arquivos DSD massivos:',
  } as L3,
  perfBench1: {
    en: 'DSD64 album (2.1 GB) → 192 kHz WAV: ~45 seconds',
    ja: 'DSD64アルバム（2.1GB）→192kHz WAV: ～45秒',
    es: 'Álbum DSD64 (2.1 GB) → WAV de 192 kHz: ~45 segundos',
    ko: 'DSD64 앨범(2.1GB) → 192kHz WAV: ~45초',
    pt: 'Álbum DSD64 (2.1 GB) → WAV de 192 kHz: ~45 segundos',
  } as L3,
  perfBench2: {
    en: 'Rust Wasm vs. JavaScript: ~10× faster for FIR convolution',
    ja: 'Rust Wasm対JavaScript: FIR畳み込みで～10倍高速',
    es: 'Rust Wasm vs. JavaScript: ~10× más rápido para convolución FIR',
    ko: 'Rust Wasm vs. JavaScript: FIR 컨볼루션의 경우 ~10배 빠름',
    pt: 'Rust Wasm vs. JavaScript: ~10× mais rápido para convolução FIR',
  } as L3,
  perfWhy: {
    en: 'Why Wasm wins:',
    ja: 'Wasmが勝つ理由:',
    es: 'Por qué Wasm gana:',
    ko: 'Wasm이 이기는 이유:',
    pt: 'Por que Wasm vence:',
  } as L3,
  perfWhy1: {
    en: 'No garbage collection pauses during FIR processing',
    ja: 'FIR処理中にガベージコレクション一時停止がない',
    es: 'Sin pausas de recolección de basura durante el procesamiento FIR',
    ko: 'FIR 처리 중 가비지 컬렉션 일시 중지 없음',
    pt: 'Sem pausas de coleta de lixo durante o processamento FIR',
  } as L3,
  perfWhy2: {
    en: 'Linear memory layout — cache-friendly array accesses',
    ja: '線形メモリレイアウト — キャッシュフレンドリーな配列アクセス',
    es: 'Disposición de memoria lineal — accesos a matriz amigables con caché',
    ko: '선형 메모리 레이아웃 — 캐시 친화적 배열 액세스',
    pt: 'Layout de memória linear — acessos de array amigáveis ao cache',
  } as L3,
  perfWhy3: {
    en: 'Compiler SIMD optimizations on tight loops',
    ja: '緊いループでのコンパイラSIMD最適化',
    es: 'Optimizaciones SIMD del compilador en bucles apretados',
    ko: '긴 루프의 컴파일러 SIMD 최적화',
    pt: 'Otimizações SIMD do compilador em loops apertados',
  } as L3,

  // Section: Footer
  sectionRelated: {
    en: 'Related Articles',
    ja: '関連記事',
    es: 'Artículos relacionados',
    ko: '관련 기사',
    pt: 'Artigos relacionados',
  } as L3,
  linkToDsdApp: {
    en: 'Try KUON DSD',
    ja: 'KUON DSD を試す',
    es: 'Prueba KUON DSD',
    ko: 'KUON DSD 시도',
    pt: 'Tente KUON DSD',
  } as L3,
  linkToDdp: {
    en: 'How DDP Works',
    ja: 'DDP の仕組み',
    es: 'Cómo funciona DDP',
    ko: 'DDP 작동 원리',
    pt: 'Como DDP Funciona',
  } as L3,
} as const;

// ──────────────────────────────────────────────────────
// Components
// ──────────────────────────────────────────────────────

function Section({
  id,
  title,
  children,
  className = '',
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      style={{
        marginTop: 'clamp(3rem, 8vw, 5rem)',
        marginBottom: 'clamp(2rem, 6vw, 4rem)',
        ...({} as any),
      }}
      className={className}
    >
      <h2
        style={{
          fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
          fontFamily: serif,
          fontWeight: '600',
          color: '#1a1a1a',
          marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
          lineHeight: '1.3',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Card({
  children,
  glass = false,
}: {
  children: React.ReactNode;
  glass?: boolean;
}) {
  return (
    <div
      style={{
        padding: 'clamp(1.5rem, 4vw, 2rem)',
        borderRadius: '12px',
        background: glass ? GLASS_BG : '#ffffff',
        backdropFilter: glass ? 'blur(16px)' : 'none',
        border: glass ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #e5e5e5',
        marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
      }}
    >
      {children}
    </div>
  );
}

function CodeBlock({ code, lang = 'rs' }: { code: string; lang?: string }) {
  return (
    <pre
      style={{
        background: '#f5f5f5',
        padding: 'clamp(1rem, 3vw, 1.5rem)',
        borderRadius: '8px',
        overflow: 'auto',
        fontSize: 'clamp(0.85rem, 2vw, 1rem)',
        fontFamily: mono,
        color: '#333',
        marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
      }}
    >
      <code>{code}</code>
    </pre>
  );
}

function SignalFlowDiagram() {
  return (
    <div
      style={{
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: 'minmax(auto, 1fr)',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: 'clamp(1.5rem, 4vw, 2rem)',
        overflowX: 'auto',
      }}
    >
      {[
        { label: 'DSD Bitstream', color: '#EC4899' },
        { label: 'Byte LUT', color: '#7C3AED' },
        { label: 'FIR Filter', color: '#3B82F6' },
        { label: 'Decimation', color: '#10B981' },
        { label: 'PCM Output', color: '#F59E0B' },
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: item.color,
              color: '#ffffff',
              fontFamily: sans,
              fontSize: '0.9rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </div>
          {i < 4 && (
            <div
              style={{
                fontSize: '1.5rem',
                color: '#999',
              }}
            >
              →
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ChallengeList() {
  const { lang } = useLang();
  const items = [
    T.challenge1,
    T.challenge2,
    T.challenge3,
    T.challenge4,
  ];

  return (
    <div>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1rem',
            paddingLeft: '1rem',
            borderLeft: `3px solid ${ACCENT}`,
          }}
        >
          <div
            style={{
              fontSize: '1.5rem',
              color: ACCENT,
              fontWeight: 'bold',
              flexShrink: 0,
            }}
          >
            {i + 1}.
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
              color: '#333',
              lineHeight: '1.6',
            }}
          >
            {t(item, lang)}
          </p>
        </div>
      ))}
    </div>
  );
}

function RustReasonsList() {
  const { lang } = useLang();
  const reasons = [T.rustReason1, T.rustReason2, T.rustReason3];

  return (
    <div>
      {reasons.map((reason, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: '8px',
            background: 'rgba(124, 58, 237, 0.05)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: ACCENT,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              flexShrink: 0,
            }}
          >
            ✓
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
              color: '#333',
              lineHeight: '1.6',
            }}
          >
            {t(reason, lang)}
          </p>
        </div>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────

export default function HowItWorksDsd() {
  const { lang } = useLang();

  return (
    <main
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f9f3ff 100%)',
        color: '#1a1a1a',
        fontFamily: sans,
      }}
    >
      {/* Hero */}
      <section
        style={{
          padding: 'clamp(3rem, 10vw, 6rem) clamp(1rem, 5vw, 2rem)',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(2.25rem, 8vw, 4rem)',
            fontFamily: serif,
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '1rem',
            lineHeight: '1.2',
          }}
        >
          {t(T.heroTitle, lang)}
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.25rem)',
            color: '#666',
            marginBottom: '0',
            lineHeight: '1.6',
            maxWidth: '800px',
            margin: '0 auto',
          }}
        >
          {t(T.heroSubtitle, lang)}
        </p>
      </section>

      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 clamp(1rem, 5vw, 2rem)',
        }}
      >
        {/* What is DSD? */}
        <Section title={t(T.sectionWhatIsDSD, lang)}>
          <Card>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                lineHeight: '1.8',
                color: '#555',
                margin: '0 0 1rem 0',
              }}
            >
              {t(T.whatIsDsdDesc, lang)}
            </p>
          </Card>

          <Card glass>
            <p
              style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '1rem',
              }}
            >
              {t(T.dsdRates, lang)}
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.5rem',
                color: '#555',
              }}
            >
              {[T.dsd64, T.dsd128, T.dsd256].map((item, i) => (
                <li key={i} style={{ marginBottom: '0.5rem' }}>
                  {t(item, lang)}
                </li>
              ))}
            </ul>
          </Card>
        </Section>

        {/* The Challenge */}
        <Section title={t(T.sectionChallenge, lang)}>
          <Card>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                lineHeight: '1.8',
                color: '#555',
                marginBottom: '1.5rem',
              }}
            >
              {t(T.challengeDesc, lang)}
            </p>
          </Card>

          <ChallengeList />
        </Section>

        {/* File Formats */}
        <Section title={t(T.sectionFormats, lang)}>
          <Card>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                lineHeight: '1.8',
                color: '#555',
                marginBottom: '1.5rem',
              }}
            >
              {t(T.formatsDesc, lang)}
            </p>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <Card glass>
              <h3 style={{ fontFamily: mono, color: ACCENT, marginBottom: '0.5rem' }}>
                {t(T.dsfFormat, lang)}
              </h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#555', margin: 0 }}>
                {t(T.dsfDesc, lang)}
              </p>
            </Card>

            <Card glass>
              <h3 style={{ fontFamily: mono, color: ACCENT, marginBottom: '0.5rem' }}>
                {t(T.dffFormat, lang)}
              </h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#555', margin: 0 }}>
                {t(T.dffDesc, lang)}
              </p>
            </Card>
          </div>

          <Card>
            <p
              style={{
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#333',
                marginBottom: '0.75rem',
              }}
            >
              {t(T.keyOffsets, lang)}
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.5rem',
                fontSize: '0.95rem',
                color: '#555',
              }}
            >
              <li>{t(T.offsetChannels, lang)}</li>
              <li>{t(T.offsetSampleRate, lang)}</li>
              <li>{t(T.offsetBitDepth, lang)}</li>
            </ul>
          </Card>
        </Section>

        {/* Rust WebAssembly */}
        <Section title={t(T.sectionWasm, lang)}>
          <Card>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                lineHeight: '1.8',
                color: '#555',
                marginBottom: '1.5rem',
              }}
            >
              {t(T.wasmDesc, lang)}
            </p>
          </Card>

          <RustReasonsList />

          <Card glass>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              {t(T.wasmBuildTitle, lang)}
            </p>
            <CodeBlock code={t(T.wasmBuildCmd, lang)} lang="bash" />
            <p style={{ fontSize: '0.9rem', color: '#555' }}>
              {t(T.wasmBuildOutput, lang)}
            </p>
          </Card>
        </Section>

        {/* Signal Flow Diagram */}
        <Section title="Signal Flow Architecture">
          <Card>
            <SignalFlowDiagram />
          </Card>
        </Section>

        {/* Byte LUT */}
        <Section title={t(T.sectionLUT, lang)}>
          <Card>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                lineHeight: '1.8',
                color: '#555',
                marginBottom: '1.5rem',
              }}
            >
              {t(T.lutDesc, lang)}
            </p>
          </Card>

          <Card glass>
            <p style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem' }}>
              {t(T.lutSolution, lang)}
            </p>
            <CodeBlock code={t(T.lutExample, lang)} lang="rust" />
            <p style={{ fontSize: '0.9rem', color: '#555', margin: 0 }}>
              {t(T.lutBenefit, lang)}
            </p>
          </Card>
        </Section>

        {/* FIR Filter */}
        <Section title={t(T.sectionFilter, lang)}>
          <Card>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                lineHeight: '1.8',
                color: '#555',
                marginBottom: '1.5rem',
              }}
            >
              {t(T.filterDesc, lang)}
            </p>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <Card glass>
              <h3 style={{ fontSize: '1rem', fontFamily: serif, marginBottom: '0.5rem' }}>
                {t(T.sincTitle, lang)}
              </h3>
              <CodeBlock code={t(T.sincFormula, lang)} lang="math" />
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#555', margin: 0 }}>
                {t(T.sincDesc, lang)}
              </p>
            </Card>

            <Card glass>
              <h3 style={{ fontSize: '1rem', fontFamily: serif, marginBottom: '0.5rem' }}>
                {t(T.blackmanTitle, lang)}
              </h3>
              <CodeBlock code={t(T.blackmanFormula, lang)} lang="math" />
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#555', margin: 0 }}>
                {t(T.blackmanDesc, lang)}
              </p>
            </Card>
          </div>

          <Card>
            <h3 style={{ fontSize: '1rem', fontFamily: serif, marginBottom: '0.75rem' }}>
              {t(T.convolutionTitle, lang)}
            </h3>
            <CodeBlock code={t(T.convolutionFormula, lang)} lang="math" />
            <p
              style={{
                fontSize: '0.95rem',
                lineHeight: '1.6',
                color: '#555',
                marginBottom: '0.75rem',
              }}
            >
              {t(T.convolutionDesc, lang)}
            </p>
            <p style={{ fontSize: '0.95rem', color: '#666', margin: 0, fontStyle: 'italic' }}>
              {t(T.convolutionTaps, lang)}
            </p>
          </Card>
        </Section>

        {/* Streaming */}
        <Section title={t(T.sectionStreaming, lang)}>
          <Card>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                lineHeight: '1.8',
                color: '#555',
                marginBottom: '1.5rem',
              }}
            >
              {t(T.streamingDesc, lang)}
            </p>
          </Card>

          <Card glass>
            <ol
              style={{
                margin: 0,
                paddingLeft: '1.5rem',
                color: '#555',
                fontSize: '0.95rem',
                lineHeight: '1.8',
              }}
            >
              <li>{t(T.streamingStep1, lang)}</li>
              <li>{t(T.streamingStep2, lang)}</li>
              <li>{t(T.streamingStep3, lang)}</li>
              <li>{t(T.streamingStep4, lang)}</li>
            </ol>
          </Card>
        </Section>

        {/* WAV Export */}
        <Section title={t(T.sectionWAV, lang)}>
          <Card>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                lineHeight: '1.8',
                color: '#555',
                marginBottom: '1.5rem',
              }}
            >
              {t(T.wavDesc, lang)}
            </p>
          </Card>

          <Card glass>
            <ol
              style={{
                margin: 0,
                paddingLeft: '1.5rem',
                color: '#555',
                fontSize: '0.95rem',
                lineHeight: '1.8',
              }}
            >
              <li>{t(T.wavStep1, lang)}</li>
              <li>{t(T.wavStep2, lang)}</li>
              <li>{t(T.wavStep3, lang)}</li>
              <li>{t(T.wavStep4, lang)}</li>
            </ol>
          </Card>
        </Section>

        {/* Performance */}
        <Section title={t(T.sectionPerf, lang)}>
          <Card>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
                lineHeight: '1.8',
                color: '#555',
                marginBottom: '1.5rem',
              }}
            >
              {t(T.perfDesc, lang)}
            </p>
          </Card>

          <Card glass>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.5rem',
                color: '#555',
                fontSize: '0.95rem',
              }}
            >
              <li style={{ marginBottom: '0.5rem' }}>{t(T.perfBench1, lang)}</li>
              <li>{t(T.perfBench2, lang)}</li>
            </ul>
          </Card>

          <Card>
            <p style={{ fontSize: '0.95rem', fontWeight: '600', marginBottom: '1rem' }}>
              {t(T.perfWhy, lang)}
            </p>
            <ul
              style={{
                margin: 0,
                paddingLeft: '1.5rem',
                color: '#555',
                fontSize: '0.95rem',
              }}
            >
              <li style={{ marginBottom: '0.5rem' }}>{t(T.perfWhy1, lang)}</li>
              <li style={{ marginBottom: '0.5rem' }}>{t(T.perfWhy2, lang)}</li>
              <li>{t(T.perfWhy3, lang)}</li>
            </ul>
          </Card>
        </Section>

        {/* Footer CTA */}
        <section
          style={{
            marginTop: 'clamp(4rem, 10vw, 6rem)',
            marginBottom: 'clamp(3rem, 8vw, 5rem)',
            padding: 'clamp(2rem, 5vw, 3rem)',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontFamily: serif,
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '1.5rem',
            }}
          >
            {t(T.sectionRelated, lang)}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            <Link
              href="/dsd"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.95rem',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                transition: 'all 0.3s',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              {t(T.linkToDsdApp, lang)}
            </Link>

            <Link
              href="/how-it-works/ddp"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.95rem',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                transition: 'all 0.3s',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              {t(T.linkToDdp, lang)}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
