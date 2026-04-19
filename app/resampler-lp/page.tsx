'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L3 = Partial<Record<Lang, string>> & { en: string };

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#0891B2';

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
  return <section ref={ref} id={id} className="reveal" style={{ marginBottom: 'clamp(48px, 10vw, 80px)', ...style }}>{children}</section>;
}

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.6)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.8)',
  borderRadius: 16,
  padding: 'clamp(20px, 4vw, 32px)',
  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
};

// ─────────────────────────────────────────────
// i18n
// ─────────────────────────────────────────────
const T = {
  // Hero
  heroTitle: {
    ja: 'サンプルレート変換に、\nプロの品質を。',
    en: 'Professional quality\nfor sample rate conversion.',
    es: 'Calidad profesional\npara conversión de frecuencia.',
  } as L3,
  heroSub: {
    ja: 'Sinc 補間 × Kaiser 窓。\n数学的に最適な帯域制限フィルタで、1サンプルも妥協しない。',
    en: 'Sinc interpolation × Kaiser window.\nMathematically optimal bandlimited filter — no sample left behind.',
    es: 'Interpolación sinc × ventana Kaiser.\nFiltro de banda limitada matemáticamente óptimo.',
  } as L3,
  heroCta: {
    ja: '今すぐ変換する（無料）',
    en: 'Convert Now — Free',
    es: 'Convertir Ahora — Gratis',
  } as L3,
  heroFree: {
    ja: '完全無料・インストール不要・サーバー送信なし',
    en: '100% Free — No Install — No Upload',
    es: '100% Gratis — Sin Instalación — Sin Subida',
  } as L3,
  heroStat1: { ja: '¥0', en: '¥0', es: '¥0', ko: '₩0' } as L3,
  heroStat1Label: { ja: '完全無料', en: 'Completely Free', es: 'Totalmente Gratis', ko: '완전 무료' } as L3,
  heroStat2: { ja: 'Sinc', en: 'Sinc', es: 'Sinc', ko: 'Sinc' } as L3,
  heroStat2Label: { ja: '補間アルゴリズム', en: 'Interpolation', es: 'Interpolación', ko: '보간 알고리즘' } as L3,
  heroStat3: { ja: '128', en: '128', es: '128', ko: '128' } as L3,
  heroStat3Label: { ja: 'タップ（Ultra モード）', en: 'Taps (Ultra mode)', es: 'Taps (modo Ultra)', ko: '탭(Ultra 모드)' } as L3,

  // The Big Question
  bigQTitle: {
    ja: '「アップサンプリングすると\n音質は良くなるの？」',
    en: '"Does upsampling\nimprove sound quality?"',
    es: '"¿El sobremuestreo\nmejora la calidad de audio?"',
  } as L3,
  bigQIntro: {
    ja: 'この疑問は、オーディオに携わるすべての人が一度は抱くものです。正直にお答えします。',
    en: 'This is a question everyone in audio asks at some point. Let us give you an honest answer.',
    es: 'Esta es una pregunta que todo profesional de audio se hace. Aquí nuestra respuesta honesta.',
  } as L3,
  bigQAnswer: {
    ja: 'いいえ、アップサンプリングで「失われた高周波成分」が復活することはありません。',
    en: 'No. Upsampling does not restore "lost" high-frequency content.',
    es: 'No. El sobremuestreo no restaura contenido de alta frecuencia "perdido".',
  } as L3,
  bigQExplain: {
    ja: '44.1kHz で録音された音声には、22.05kHz までの情報しか含まれていません（ナイキスト定理）。これを 96kHz にアップサンプリングしても、22.05kHz 以上の帯域には何も存在しません。リサンプラーがやることは、既存のサンプル点の「間」を数学的に正確に補間すること — 新しい情報を生み出すわけではないのです。',
    en: 'Audio recorded at 44.1kHz contains information only up to 22.05kHz (Nyquist theorem). Upsampling to 96kHz does not create content above 22.05kHz. What a resampler does is mathematically interpolate between existing sample points — it does not create new information.',
    es: 'El audio grabado a 44.1kHz contiene información solo hasta 22.05kHz (teorema de Nyquist). El sobremuestreo a 96kHz no crea contenido por encima de 22.05kHz. Lo que hace un remuestreador es interpolar matemáticamente entre los puntos de muestras existentes — no crea información nueva.',
  } as L3,
  bigQThen: {
    ja: 'では、なぜリサンプラーが必要なのか？',
    en: 'So why do you need a resampler?',
    es: 'Entonces, ¿por qué necesitas un remuestreador?',
  } as L3,

  // 3 Use Cases
  useCasesTitle: {
    ja: 'リサンプリングが必要になる\n3つの正しい理由',
    en: 'Three legitimate reasons\nyou need resampling',
    es: 'Tres razones legítimas\npara necesitar remuestreo',
  } as L3,

  useCase1Title: {
    ja: '理由1: フォーマット要件を満たす',
    en: 'Reason 1: Meeting format requirements',
    es: 'Razón 1: Cumplir requisitos de formato',
  } as L3,
  useCase1Text: {
    ja: '映像制作では 48kHz が標準。CD マスタリングでは 44.1kHz が必須。96kHz で録音した素材を納品するには、正確なサンプルレート変換が不可欠です。これが最も一般的なリサンプリングの用途です。',
    en: 'Video production requires 48kHz. CD mastering requires 44.1kHz. If you recorded at 96kHz, you need accurate sample rate conversion for delivery. This is the most common use case for resampling.',
    es: 'La producción de video requiere 48kHz. El masterizado de CD requiere 44.1kHz. Si grabaste a 96kHz, necesitas una conversión precisa para la entrega. Este es el uso más común del remuestreo.',
  } as L3,
  useCase1Example: {
    ja: '例: 96kHz で録音 → CD 用に 44.1kHz へ変換 / 映像用に 48kHz へ変換',
    en: 'Example: Recorded at 96kHz → Convert to 44.1kHz for CD / 48kHz for video',
    es: 'Ejemplo: Grabado a 96kHz → Convertir a 44.1kHz para CD / 48kHz para video',
  } as L3,

  useCase2Title: {
    ja: '理由2: 処理精度の向上',
    en: 'Reason 2: Improving processing precision',
    es: 'Razón 2: Mejorar la precisión del procesamiento',
  } as L3,
  useCase2Text: {
    ja: 'DAW 内で EQ やコンプレッサーなどのプラグインを使う際、より高いサンプルレートで処理すると、ナイキスト周波数が上がり、フィルタのエイリアシングが減少します。これは「内部オーバーサンプリング」と呼ばれ、多くのプロ用プラグインが採用している手法です。',
    en: 'When using EQ, compressors, and other plugins in a DAW, processing at a higher sample rate raises the Nyquist frequency and reduces filter aliasing. This is called "internal oversampling" — a technique used by many professional plugins.',
    es: 'Al usar EQ, compresores y otros plugins en un DAW, procesar a una frecuencia más alta eleva la frecuencia de Nyquist y reduce el aliasing del filtro. Esto se llama "sobremuestreo interno" — técnica usada por muchos plugins profesionales.',
  } as L3,
  useCase2Example: {
    ja: '例: 44.1kHz のセッションを一時的に 88.2kHz にアップサンプリング → プラグイン処理 → 44.1kHz に戻す',
    en: 'Example: Temporarily upsample a 44.1kHz session to 88.2kHz → Process with plugins → Convert back to 44.1kHz',
    es: 'Ejemplo: Sobremuestrear temporalmente una sesión de 44.1kHz a 88.2kHz → Procesar → Volver a 44.1kHz',
  } as L3,

  useCase3Title: {
    ja: '理由3: ダウンサンプリング時の品質保持',
    en: 'Reason 3: Quality preservation during downsampling',
    es: 'Razón 3: Preservar la calidad al submuestrear',
  } as L3,
  useCase3Text: {
    ja: 'ハイレゾ音源（96kHz / 192kHz）を CD 品質（44.1kHz）に変換するとき、低品質のリサンプラーを使うと「折り返しノイズ（エイリアシング）」が発生します。KUON\u00A0RESAMPLER は Kaiser 窓付き Sinc フィルタで -120dB のストップバンド減衰を実現。原音のクオリティを数学的に保証します。',
    en: 'When converting hi-res audio (96kHz / 192kHz) to CD quality (44.1kHz), a low-quality resampler introduces "aliasing" artifacts. KUON\u00A0RESAMPLER uses a Kaiser-windowed sinc filter with -120dB stopband attenuation — mathematically preserving the original quality.',
    es: 'Al convertir audio hi-res (96kHz / 192kHz) a calidad CD (44.1kHz), un remuestreador de baja calidad introduce artefactos de "aliasing". KUON\u00A0RESAMPLER usa un filtro sinc con ventana Kaiser a -120dB de atenuación — preservando matemáticamente la calidad original.',
  } as L3,
  useCase3Example: {
    ja: '例: 192kHz のマスター → 配信用 44.1kHz に変換 — エイリアシングなし、透明な変換',
    en: 'Example: 192kHz master → Convert to 44.1kHz for distribution — no aliasing, transparent conversion',
    es: 'Ejemplo: Master de 192kHz → Convertir a 44.1kHz para distribución — sin aliasing, conversión transparente',
  } as L3,

  // How it works
  howTitle: {
    ja: 'Sinc 補間は\nなぜ「最適」なのか',
    en: 'Why sinc interpolation\nis the "optimal" method',
    es: 'Por qué la interpolación sinc\nes el método "óptimo"',
  } as L3,
  howText1: {
    ja: 'シャノンの標本化定理によれば、帯域制限された信号は、そのサンプル点から sinc 関数を使って完全に復元できます。つまり sinc 補間は単なる近似ではなく、理論的に完全な再構成を行うアルゴリズムです。',
    en: 'According to Shannon\'s sampling theorem, a bandlimited signal can be perfectly reconstructed from its samples using the sinc function. Sinc interpolation is not an approximation — it\'s a theoretically perfect reconstruction algorithm.',
    es: 'Según el teorema de muestreo de Shannon, una señal de banda limitada puede reconstruirse perfectamente usando la función sinc. La interpolación sinc no es una aproximación — es un algoritmo de reconstrucción teóricamente perfecto.',
  } as L3,
  howText2: {
    ja: '実用上、無限長の sinc 関数を有限の「窓」で切り取る必要があります。ここで窓関数の選択が品質を決定します。KUON\u00A0RESAMPLER は Kaiser 窓を採用 — パラメータ β を調整することで、ストップバンド減衰量とメインローブ幅のトレードオフを最適化できます。',
    en: 'In practice, the infinite sinc function must be truncated with a finite "window." The window choice determines quality. KUON\u00A0RESAMPLER uses the Kaiser window — its β parameter lets you optimize the tradeoff between stopband attenuation and main lobe width.',
    es: 'En la práctica, la función sinc infinita debe truncarse con una "ventana" finita. La elección de ventana determina la calidad. KUON\u00A0RESAMPLER usa la ventana Kaiser — su parámetro β optimiza el balance entre atenuación y ancho del lóbulo principal.',
  } as L3,

  // Features
  featuresTitle: {
    ja: 'KUON\u00A0RESAMPLER の特長',
    en: 'Features of KUON\u00A0RESAMPLER',
    es: 'Características de KUON\u00A0RESAMPLER',
  } as L3,
  feat1Title: { ja: 'Sinc 補間 × Kaiser 窓', en: 'Sinc × Kaiser Window', es: 'Sinc × Ventana Kaiser', ko: 'Sinc 보간 × Kaiser 윈도우' } as L3,
  feat1Desc: {
    ja: '理論的に最適な帯域制限フィルタ。線形補間やスプラインでは得られない数学的正確さ。',
    en: 'Theoretically optimal bandlimited filter. Mathematical precision unattainable with linear or spline interpolation.',
    es: 'Filtro de banda limitada teóricamente óptimo. Precisión matemática inalcanzable con interpolación lineal o spline.',
  } as L3,
  feat2Title: { ja: '3段階の品質プリセット', en: '3 Quality Presets', es: '3 Niveles de Calidad', ko: '3단계 품질 프리셋' } as L3,
  feat2Desc: {
    ja: 'Standard（32タップ）/ High（64タップ）/ Ultra（128タップ）。用途に応じて速度と品質のバランスを選択。',
    en: 'Standard (32-tap) / High (64-tap) / Ultra (128-tap). Choose the speed-quality balance for your needs.',
    es: 'Estándar (32 taps) / Alta (64 taps) / Ultra (128 taps). Elige el balance velocidad-calidad según tu necesidad.',
  } as L3,
  feat3Title: { ja: 'アンチエイリアスフィルタ', en: 'Anti-Aliasing Filter', es: 'Filtro Anti-Aliasing', ko: '안티에일리어싱 필터' } as L3,
  feat3Desc: {
    ja: 'ダウンサンプリング時、自動的にカットオフ周波数をスケーリング。折り返しノイズを -120dB まで抑制。',
    en: 'Automatically scales cutoff frequency during downsampling. Suppresses aliasing to -120dB.',
    es: 'Escala automáticamente la frecuencia de corte al submuestrear. Suprime el aliasing a -120dB.',
  } as L3,
  feat4Title: { ja: '完全ブラウザ処理', en: '100% Browser Processing', es: '100% en el Navegador', ko: '완전 브라우저 처리' } as L3,
  feat4Desc: {
    ja: 'すべての計算がブラウザ内で完結。音声データはサーバーに送信されません。プライバシー完全保護。',
    en: 'All computation runs in your browser. Audio data is never sent to a server. Complete privacy.',
    es: 'Todo el cálculo se realiza en tu navegador. Los datos nunca se envían al servidor. Privacidad total.',
  } as L3,
  feat5Title: { ja: 'WAV / FLAC / MP3 入力', en: 'WAV / FLAC / MP3 Input', es: 'Entrada WAV / FLAC / MP3', ko: 'WAV / FLAC / MP3 입력' } as L3,
  feat5Desc: {
    ja: 'ブラウザが対応するすべてのオーディオ形式をデコード。出力は 32-bit float WAV。',
    en: 'Decodes all audio formats supported by your browser. Output is 32-bit float WAV.',
    es: 'Decodifica todos los formatos de audio que soporta tu navegador. Salida en WAV 32-bit float.',
  } as L3,
  feat6Title: { ja: '32-bit Float 出力', en: '32-bit Float Output', es: 'Salida 32-bit Float', ko: '32비트 Float 출력' } as L3,
  feat6Desc: {
    ja: '変換後も最大限のダイナミックレンジを維持。後続の処理で品質劣化なし。',
    en: 'Maintains maximum dynamic range after conversion. No quality loss in subsequent processing.',
    es: 'Mantiene el rango dinámico máximo después de la conversión. Sin pérdida en procesamiento posterior.',
  } as L3,

  // Steps
  stepsTitle: {
    ja: '3ステップで完了',
    en: 'Done in 3 Steps',
    es: 'Listo en 3 Pasos',
  } as L3,
  step1Title: { ja: 'ファイルをドロップ', en: 'Drop Your File', es: 'Suelta tu Archivo', ko: '파일을 드롭하세요' } as L3,
  step1Desc: {
    ja: 'WAV / FLAC / MP3 / AAC / OGG — あらゆる形式に対応',
    en: 'WAV / FLAC / MP3 / AAC / OGG — all formats supported',
    es: 'WAV / FLAC / MP3 / AAC / OGG — todos los formatos',
  } as L3,
  step2Title: { ja: 'サンプルレートと品質を選択', en: 'Choose Rate & Quality', es: 'Elige Frecuencia y Calidad', ko: '샘플링 레이트와 품질 선택' } as L3,
  step2Desc: {
    ja: '44.1k / 48k / 88.2k / 96k / 176.4k / 192kHz + 3段階の品質プリセット',
    en: '44.1k / 48k / 88.2k / 96k / 176.4k / 192kHz + 3 quality presets',
    es: '44.1k / 48k / 88.2k / 96k / 176.4k / 192kHz + 3 niveles de calidad',
  } as L3,
  step3Title: { ja: '変換してダウンロード', en: 'Convert & Download', es: 'Convertir y Descargar', ko: '변환 및 다운로드' } as L3,
  step3Desc: {
    ja: '32-bit float WAV で出力。ダイナミックレンジを完全保持。',
    en: 'Output as 32-bit float WAV. Full dynamic range preserved.',
    es: 'Salida en WAV 32-bit float. Rango dinámico preservado.',
  } as L3,

  // Comparison table
  compTitle: {
    ja: '他ツールとの比較',
    en: 'How We Compare',
    es: 'Comparación con Otros',
  } as L3,
  compFeature: { ja: '機能', en: 'Feature', es: 'Característica', ko: '기능' } as L3,
  compKuon: { ja: 'KUON\u00A0RESAMPLER', en: 'KUON\u00A0RESAMPLER', es: 'KUON\u00A0RESAMPLER', ko: 'KUON RESAMPLER' } as L3,
  compSox: { ja: 'SoX', en: 'SoX', es: 'SoX', ko: 'SoX' } as L3,
  compAudacity: { ja: 'Audacity', en: 'Audacity', es: 'Audacity', ko: 'Audacity' } as L3,
  compOnline: { ja: 'オンラインツール', en: 'Online Tools', es: 'Herramientas Online', ko: '온라인 도구' } as L3,

  compRow1: { ja: 'インストール不要', en: 'No Install', es: 'Sin Instalación', ko: '설치 불필요' } as L3,
  compRow2: { ja: 'サーバー送信なし', en: 'No Server Upload', es: 'Sin Subida', ko: '서버 업로드 없음' } as L3,
  compRow3: { ja: 'Sinc 補間', en: 'Sinc Interpolation', es: 'Interpolación Sinc', ko: 'Sinc 보간' } as L3,
  compRow4: { ja: 'Kaiser 窓', en: 'Kaiser Window', es: 'Ventana Kaiser', ko: 'Kaiser 윈도우' } as L3,
  compRow5: { ja: '品質プリセット', en: 'Quality Presets', es: 'Presets de Calidad', ko: '품질 프리셋' } as L3,
  compRow6: { ja: '32-bit Float 出力', en: '32-bit Float Output', es: 'Salida 32-bit Float', ko: '32비트 Float 출력' } as L3,
  compRow7: { ja: '無料', en: 'Free', es: 'Gratis', ko: '무료' } as L3,

  // Targets
  targetsTitle: {
    ja: 'こんな方に最適',
    en: 'Perfect For',
    es: 'Perfecto Para',
  } as L3,
  target1: {
    ja: '🎬 映像制作者 — 96kHz 録音を 48kHz に変換する必要がある方',
    en: '🎬 Video Producers — Need to convert 96kHz recordings to 48kHz',
    es: '🎬 Productores de Video — Necesitan convertir grabaciones de 96kHz a 48kHz',
  } as L3,
  target2: {
    ja: '💿 マスタリングエンジニア — ハイレゾマスターから CD 品質を作成する方',
    en: '💿 Mastering Engineers — Creating CD quality from hi-res masters',
    es: '💿 Ingenieros de Masterizado — Creando calidad CD desde masters hi-res',
  } as L3,
  target3: {
    ja: '🎵 音楽制作者 — DAW のプロジェクト間でサンプルレートを合わせたい方',
    en: '🎵 Music Producers — Matching sample rates between DAW projects',
    es: '🎵 Productores Musicales — Igualando frecuencias entre proyectos DAW',
  } as L3,
  target4: {
    ja: '🎧 オーディオファイル — フォーマット変換時に品質を妥協したくない方',
    en: '🎧 Audiophiles — Refuse to compromise quality during format conversion',
    es: '🎧 Audiófilos — Sin comprometer calidad en conversiones de formato',
  } as L3,

  // Value
  valueTitle: {
    ja: 'KUON\u00A0RESAMPLER\u00A0は\n正直なツールです。',
    en: 'KUON\u00A0RESAMPLER is\nan honest tool.',
    es: 'KUON\u00A0RESAMPLER es\nuna herramienta honesta.',
  } as L3,
  valueText: {
    ja: '「アップサンプリングで音質が向上する」とは言いません。なぜなら、それは真実ではないからです。しかし、サンプルレートを変換する「正当な理由」がある時 — フォーマット要件、処理精度の向上、ダウンサンプリングの品質保持 — KUON\u00A0RESAMPLER\u00A0は数学的に最適な方法でそれを実行します。',
    en: 'We won\'t tell you "upsampling improves sound quality" — because it doesn\'t. But when you have a legitimate reason to convert sample rates — format requirements, processing precision, or quality preservation during downsampling — KUON\u00A0RESAMPLER does it with mathematical precision.',
    es: 'No te diremos que "el sobremuestreo mejora la calidad" — porque no es cierto. Pero cuando tienes una razón legítima para convertir — requisitos de formato, precisión de procesamiento o preservación de calidad — KUON\u00A0RESAMPLER lo hace con precisión matemática.',
  } as L3,

  // FAQ
  faqTitle: { ja: 'よくある質問', en: 'FAQ', es: 'Preguntas Frecuentes', ko: '자주 묻는 질문' } as L3,

  faq1Q: {
    ja: 'Q. アップサンプリングで本当に音質は良くなりますか？',
    en: 'Q. Does upsampling really improve sound quality?',
    es: 'Q. ¿El sobremuestreo realmente mejora la calidad?',
  } as L3,
  faq1A: {
    ja: 'いいえ。44.1kHz の音声を 96kHz にアップサンプリングしても、22.05kHz 以上の周波数成分が新たに生まれることはありません。ただし、DAW でのプラグイン処理時にオーバーサンプリングとして使用する場合は、エイリアシングの軽減という実質的なメリットがあります。',
    en: 'No. Upsampling 44.1kHz audio to 96kHz does not create frequency content above 22.05kHz. However, when used as oversampling for plugin processing in a DAW, it does provide a real benefit by reducing aliasing.',
    es: 'No. Sobremuestrear audio de 44.1kHz a 96kHz no crea contenido frecuencial por encima de 22.05kHz. Sin embargo, cuando se usa como sobremuestreo para procesamiento de plugins en un DAW, sí proporciona un beneficio real al reducir el aliasing.',
  } as L3,

  faq2Q: {
    ja: 'Q. ダウンサンプリングで音質は劣化しますか？',
    en: 'Q. Does downsampling degrade quality?',
    es: 'Q. ¿El submuestreo degrada la calidad?',
  } as L3,
  faq2A: {
    ja: '正しいアンチエイリアスフィルタを使えば、理論上は劣化しません。ナイキスト定理により、新しいサンプルレートの半分以下の周波数成分はすべて保持されます。KUON RESAMPLER の Ultra モードは -120dB のストップバンド減衰で、人間の聴覚限界を大幅に超える精度で変換します。',
    en: 'With a proper anti-aliasing filter, there is theoretically no degradation. Per the Nyquist theorem, all frequency content below half the new sample rate is preserved. KUON RESAMPLER\'s Ultra mode achieves -120dB stopband attenuation — far beyond human hearing limits.',
    es: 'Con un filtro anti-aliasing adecuado, teóricamente no hay degradación. Según el teorema de Nyquist, todo el contenido frecuencial por debajo de la mitad de la nueva frecuencia se preserva. El modo Ultra logra -120dB de atenuación — muy por encima de los límites de la audición humana.',
  } as L3,

  faq3Q: {
    ja: 'Q. 44.1kHz と 48kHz、どちらが良いですか？',
    en: 'Q. Which is better: 44.1kHz or 48kHz?',
    es: 'Q. ¿Cuál es mejor: 44.1kHz o 48kHz?',
  } as L3,
  faq3A: {
    ja: '音質に差はありません。どちらも人間の可聴域（20Hz〜20kHz）を十分にカバーしています。選択は用途で決まります。音楽制作・CD なら 44.1kHz、映像・放送なら 48kHz が業界標準です。',
    en: 'There is no audible difference. Both fully cover the human hearing range (20Hz–20kHz). The choice depends on your use case: 44.1kHz for music/CD, 48kHz for video/broadcast — these are industry standards.',
    es: 'No hay diferencia audible. Ambas cubren completamente el rango auditivo humano (20Hz–20kHz). La elección depende del uso: 44.1kHz para música/CD, 48kHz para video/transmisión.',
  } as L3,

  faq4Q: {
    ja: 'Q. Standard / High / Ultra の違いは何ですか？',
    en: 'Q. What\'s the difference between Standard / High / Ultra?',
    es: 'Q. ¿Cuál es la diferencia entre Estándar / Alta / Ultra?',
  } as L3,
  faq4A: {
    ja: 'フィルタの長さ（タップ数）が異なります。タップ数が多いほど遮断特性が急峻になり、エイリアシングの抑制が向上します。Standard（32タップ, -80dB）は高速で十分な品質、High（64タップ, -100dB）はプロ品質、Ultra（128タップ, -120dB）はリファレンスグレードです。通常は High で十分です。',
    en: 'The filter length (number of taps) differs. More taps means sharper cutoff and better aliasing suppression. Standard (32-tap, -80dB) is fast and good quality, High (64-tap, -100dB) is professional, Ultra (128-tap, -120dB) is reference-grade. High is sufficient for most use cases.',
    es: 'Difiere la longitud del filtro (número de taps). Más taps significa un corte más abrupto y mejor supresión del aliasing. Estándar (32 taps, -80dB) es rápido y bueno, Alta (64 taps, -100dB) es profesional, Ultra (128 taps, -120dB) es grado de referencia. Alta es suficiente para la mayoría.',
  } as L3,

  faq5Q: {
    ja: 'Q. 音声データはサーバーに送信されますか？',
    en: 'Q. Is my audio data sent to a server?',
    es: 'Q. ¿Se envían mis datos de audio a un servidor?',
  } as L3,
  faq5A: {
    ja: 'いいえ。すべての処理はあなたのブラウザ内で完結します。音声データがインターネットを通じて外部に送信されることは一切ありません。',
    en: 'No. All processing happens entirely in your browser. Your audio data is never transmitted over the internet.',
    es: 'No. Todo el procesamiento ocurre completamente en tu navegador. Tus datos de audio nunca se transmiten por internet.',
  } as L3,

  // CTA
  ctaTitle: {
    ja: 'サンプルレート変換を、\n正しく、美しく。',
    en: 'Sample rate conversion.\nDone right.',
    es: 'Conversión de frecuencia.\nHecha correctamente.',
  } as L3,
  ctaBtn: {
    ja: 'KUON\u00A0RESAMPLER を開く（無料）',
    en: 'Open KUON\u00A0RESAMPLER — Free',
    es: 'Abrir KUON\u00A0RESAMPLER — Gratis',
  } as L3,
  ctaSub: {
    ja: 'インストール不要・アカウント不要・完全無料',
    en: 'No install — No account — 100% free',
    es: 'Sin instalación — Sin cuenta — 100% gratis',
  } as L3,
};

// ─────────────────────────────────────────────
// Comparison data
// ─────────────────────────────────────────────
type CompRow = { label: L3; kuon: string; sox: string; audacity: string; online: string };
const compRows: CompRow[] = [
  { label: T.compRow1, kuon: '✓', sox: '✗', audacity: '✗', online: '✓' },
  { label: T.compRow2, kuon: '✓', sox: '✓', audacity: '✓', online: '✗' },
  { label: T.compRow3, kuon: '✓', sox: '✓', audacity: '✓', online: '?' },
  { label: T.compRow4, kuon: '✓', sox: '✓', audacity: '✗', online: '✗' },
  { label: T.compRow5, kuon: '✓', sox: '✗', audacity: '✗', online: '✗' },
  { label: T.compRow6, kuon: '✓', sox: '✓', audacity: '✓', online: '✗' },
  { label: T.compRow7, kuon: '✓', sox: '✓', audacity: '✓', online: '△' },
];

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function ResamplerLpPage() {
  const { lang } = useLang();

  const sH2: React.CSSProperties = {
    fontFamily: serif,
    fontSize: 'clamp(1.3rem, 3.5vw, 1.9rem)',
    fontWeight: 400,
    color: '#0f172a',
    lineHeight: 1.5,
    whiteSpace: 'pre-line' as const,
    textAlign: 'center' as const,
    marginBottom: 'clamp(16px, 3vw, 28px)',
    wordBreak: 'keep-all' as const,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #f0fdfa 0%, #ecfeff 30%, #f0f9ff 60%, #f8fafc 100%)',
      padding: 'clamp(2rem, 6vw, 5rem) clamp(1rem, 4vw, 2rem)',
    }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>

        {/* ─── Hero ─── */}
        <Section>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: mono, fontSize: '0.68rem', letterSpacing: '0.2em',
              color: ACCENT, textTransform: 'uppercase', marginBottom: '1rem',
            }}>
              KUON RESAMPLER
            </p>
            <h1 style={{
              fontFamily: serif,
              fontSize: 'clamp(1.6rem, 5vw, 2.8rem)',
              fontWeight: 400,
              color: '#0f172a',
              lineHeight: 1.4,
              whiteSpace: 'pre-line',
              margin: '0 0 1.2rem',
              wordBreak: 'keep-all',
            }}>
              {T.heroTitle[lang]}
            </h1>
            <p style={{
              fontFamily: sans,
              fontSize: 'clamp(0.85rem, 1.8vw, 1.05rem)',
              color: '#475569',
              lineHeight: 1.8,
              whiteSpace: 'pre-line',
              marginBottom: '2rem',
              wordBreak: 'keep-all',
            }}>
              {T.heroSub[lang]}
            </p>

            {/* Stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(1rem, 4vw, 3rem)',
              marginBottom: '2rem',
              flexWrap: 'wrap',
            }}>
              {[
                { val: T.heroStat1, label: T.heroStat1Label },
                { val: T.heroStat2, label: T.heroStat2Label },
                { val: T.heroStat3, label: T.heroStat3Label },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: mono, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                    fontWeight: 700, color: ACCENT, letterSpacing: '-0.02em',
                  }}>
                    {s.val[lang]}
                  </div>
                  <div style={{
                    fontFamily: sans, fontSize: '0.68rem',
                    color: '#94a3b8', letterSpacing: '0.1em', marginTop: '0.2rem',
                  }}>
                    {s.label[lang]}
                  </div>
                </div>
              ))}
            </div>

            <Link href="/resampler" style={{
              display: 'inline-block',
              fontFamily: sans, fontSize: 'clamp(0.82rem, 1.6vw, 0.95rem)',
              fontWeight: 600, letterSpacing: '0.08em',
              color: '#fff',
              background: `linear-gradient(135deg, ${ACCENT}, #0e7490)`,
              padding: 'clamp(0.8rem, 2vw, 1rem) clamp(2rem, 5vw, 3rem)',
              borderRadius: 999, textDecoration: 'none',
              boxShadow: `0 12px 32px ${ACCENT}40`,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}>
              {T.heroCta[lang]}
            </Link>
            <p style={{
              fontFamily: sans, fontSize: '0.68rem', color: '#94a3b8',
              letterSpacing: '0.1em', marginTop: '1rem',
            }}>
              {T.heroFree[lang]}
            </p>
          </div>
        </Section>

        {/* ─── The Big Question ─── */}
        <Section>
          <h2 style={{
            ...sH2,
            fontSize: 'clamp(1.2rem, 3vw, 1.7rem)',
            color: '#1e293b',
          }}>
            {T.bigQTitle[lang]}
          </h2>
          <div style={{ ...glass, maxWidth: 640, margin: '0 auto' }}>
            <p style={{
              fontFamily: sans, fontSize: 'clamp(0.82rem, 1.5vw, 0.92rem)',
              color: '#475569', lineHeight: 1.8, marginBottom: '1.2rem',
            }}>
              {T.bigQIntro[lang]}
            </p>

            {/* The honest answer */}
            <div style={{
              padding: 'clamp(1rem, 2vw, 1.5rem)',
              background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
              borderRadius: 12,
              borderLeft: '4px solid #f87171',
              marginBottom: '1.2rem',
            }}>
              <p style={{
                fontFamily: sans, fontSize: 'clamp(0.88rem, 1.6vw, 1rem)',
                fontWeight: 600, color: '#dc2626', margin: 0,
              }}>
                {T.bigQAnswer[lang]}
              </p>
            </div>

            <p style={{
              fontFamily: sans, fontSize: 'clamp(0.8rem, 1.4vw, 0.88rem)',
              color: '#475569', lineHeight: 1.9, marginBottom: '1.5rem',
            }}>
              {T.bigQExplain[lang]}
            </p>

            <p style={{
              fontFamily: serif, fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              color: '#0f172a', textAlign: 'center', fontWeight: 400,
            }}>
              {T.bigQThen[lang]}
            </p>
          </div>
        </Section>

        {/* ─── 3 Use Cases ─── */}
        <Section>
          <h2 style={sH2}>{T.useCasesTitle[lang]}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {[
              { title: T.useCase1Title, text: T.useCase1Text, example: T.useCase1Example, icon: '🎯', num: '01' },
              { title: T.useCase2Title, text: T.useCase2Text, example: T.useCase2Example, icon: '⚙️', num: '02' },
              { title: T.useCase3Title, text: T.useCase3Text, example: T.useCase3Example, icon: '🛡️', num: '03' },
            ].map((uc, i) => (
              <div key={i} style={{ ...glass, position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute', top: 12, right: 16,
                  fontFamily: mono, fontSize: '2.5rem', fontWeight: 700,
                  color: `${ACCENT}08`, lineHeight: 1,
                }}>
                  {uc.num}
                </div>
                <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{uc.icon}</div>
                <h3 style={{
                  fontFamily: sans, fontSize: 'clamp(0.9rem, 1.8vw, 1.05rem)',
                  fontWeight: 600, color: '#0f172a', marginBottom: '0.6rem',
                }}>
                  {uc.title[lang]}
                </h3>
                <p style={{
                  fontFamily: sans, fontSize: 'clamp(0.78rem, 1.4vw, 0.86rem)',
                  color: '#475569', lineHeight: 1.8, marginBottom: '0.8rem',
                }}>
                  {uc.text[lang]}
                </p>
                <div style={{
                  fontFamily: mono, fontSize: '0.7rem', color: ACCENT,
                  padding: '0.5rem 0.8rem', background: `${ACCENT}08`,
                  borderRadius: 8,
                }}>
                  {uc.example[lang]}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── How sinc works ─── */}
        <Section>
          <h2 style={sH2}>{T.howTitle[lang]}</h2>
          <div style={{ ...glass, maxWidth: 640, margin: '0 auto' }}>
            <p style={{
              fontFamily: sans, fontSize: 'clamp(0.8rem, 1.4vw, 0.88rem)',
              color: '#475569', lineHeight: 1.9, marginBottom: '1rem',
            }}>
              {T.howText1[lang]}
            </p>
            <p style={{
              fontFamily: sans, fontSize: 'clamp(0.8rem, 1.4vw, 0.88rem)',
              color: '#475569', lineHeight: 1.9,
            }}>
              {T.howText2[lang]}
            </p>

            {/* Visual formula */}
            <div style={{
              textAlign: 'center', margin: '1.5rem 0 0',
              padding: '1rem', background: '#f8fafc', borderRadius: 8,
            }}>
              <span style={{
                fontFamily: mono, fontSize: '0.78rem', color: '#334155',
                letterSpacing: '0.02em',
              }}>
                y(t) = Σ x[n] · sinc(t − n) · Kaiser(β, t − n)
              </span>
              <br />
              <span style={{ fontFamily: sans, fontSize: '0.62rem', color: '#94a3b8' }}>
                {lang === 'ja' ? '— 帯域制限補間の基本式' : lang === 'en' ? '— Bandlimited interpolation formula' : '— Fórmula de interpolación de banda limitada'}
              </span>
            </div>
          </div>
        </Section>

        {/* ─── Features ─── */}
        <Section>
          <h2 style={sH2}>{T.featuresTitle[lang]}</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
            gap: '1rem',
          }}>
            {[
              { title: T.feat1Title, desc: T.feat1Desc, icon: '∿' },
              { title: T.feat2Title, desc: T.feat2Desc, icon: '◎' },
              { title: T.feat3Title, desc: T.feat3Desc, icon: '🛡' },
              { title: T.feat4Title, desc: T.feat4Desc, icon: '🔒' },
              { title: T.feat5Title, desc: T.feat5Desc, icon: '📂' },
              { title: T.feat6Title, desc: T.feat6Desc, icon: '💎' },
            ].map((f, i) => (
              <div key={i} style={glass}>
                <div style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>{f.icon}</div>
                <h3 style={{
                  fontFamily: sans, fontSize: '0.82rem', fontWeight: 600,
                  color: '#0f172a', marginBottom: '0.4rem',
                }}>
                  {f.title[lang]}
                </h3>
                <p style={{
                  fontFamily: sans, fontSize: '0.74rem',
                  color: '#64748b', lineHeight: 1.7, margin: 0,
                }}>
                  {f.desc[lang]}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── 3 Steps ─── */}
        <Section>
          <h2 style={sH2}>{T.stepsTitle[lang]}</h2>
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {[
              { n: '1', title: T.step1Title, desc: T.step1Desc },
              { n: '2', title: T.step2Title, desc: T.step2Desc },
              { n: '3', title: T.step3Title, desc: T.step3Desc },
            ].map((s, i) => (
              <div key={i} style={{
                ...glass, textAlign: 'center', flex: '1 1 200px', maxWidth: 260,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${ACCENT}, #0e7490)`,
                  color: '#fff', fontFamily: mono, fontSize: '1rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 0.8rem',
                }}>
                  {s.n}
                </div>
                <h3 style={{
                  fontFamily: sans, fontSize: '0.85rem', fontWeight: 600,
                  color: '#0f172a', marginBottom: '0.3rem',
                }}>
                  {s.title[lang]}
                </h3>
                <p style={{
                  fontFamily: sans, fontSize: '0.72rem',
                  color: '#64748b', lineHeight: 1.6, margin: 0,
                }}>
                  {s.desc[lang]}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── Comparison ─── */}
        <Section>
          <h2 style={sH2}>{T.compTitle[lang]}</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse',
              fontFamily: sans, fontSize: '0.76rem',
              background: 'rgba(255,255,255,0.7)',
              borderRadius: 12, overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '0.8rem 1rem', textAlign: 'left', color: '#64748b', fontWeight: 500, borderBottom: '1px solid #e2e8f0' }}>{T.compFeature[lang]}</th>
                  <th style={{ padding: '0.8rem 0.6rem', textAlign: 'center', color: ACCENT, fontWeight: 700, borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{T.compKuon[lang]}</th>
                  <th style={{ padding: '0.8rem 0.6rem', textAlign: 'center', color: '#64748b', fontWeight: 500, borderBottom: '1px solid #e2e8f0' }}>{T.compSox[lang]}</th>
                  <th style={{ padding: '0.8rem 0.6rem', textAlign: 'center', color: '#64748b', fontWeight: 500, borderBottom: '1px solid #e2e8f0' }}>{T.compAudacity[lang]}</th>
                  <th style={{ padding: '0.8rem 0.6rem', textAlign: 'center', color: '#64748b', fontWeight: 500, borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{T.compOnline[lang]}</th>
                </tr>
              </thead>
              <tbody>
                {compRows.map((row, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                    <td style={{ padding: '0.65rem 1rem', color: '#334155', borderBottom: '1px solid #f1f5f9' }}>{row.label[lang]}</td>
                    <td style={{ padding: '0.65rem 0.6rem', textAlign: 'center', color: row.kuon === '✓' ? '#059669' : '#dc2626', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}>{row.kuon}</td>
                    <td style={{ padding: '0.65rem 0.6rem', textAlign: 'center', color: row.sox === '✓' ? '#059669' : '#dc2626', borderBottom: '1px solid #f1f5f9' }}>{row.sox}</td>
                    <td style={{ padding: '0.65rem 0.6rem', textAlign: 'center', color: row.audacity === '✓' ? '#059669' : '#dc2626', borderBottom: '1px solid #f1f5f9' }}>{row.audacity}</td>
                    <td style={{ padding: '0.65rem 0.6rem', textAlign: 'center', color: row.online === '✓' ? '#059669' : row.online === '△' ? '#f59e0b' : row.online === '?' ? '#94a3b8' : '#dc2626', borderBottom: '1px solid #f1f5f9' }}>{row.online}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ─── Targets ─── */}
        <Section>
          <h2 style={sH2}>{T.targetsTitle[lang]}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxWidth: 600, margin: '0 auto' }}>
            {[T.target1, T.target2, T.target3, T.target4].map((t, i) => (
              <div key={i} style={{
                ...glass,
                padding: 'clamp(14px, 3vw, 20px) clamp(16px, 3vw, 24px)',
              }}>
                <p style={{
                  fontFamily: sans, fontSize: 'clamp(0.78rem, 1.4vw, 0.88rem)',
                  color: '#334155', lineHeight: 1.6, margin: 0,
                }}>
                  {t[lang]}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── Value ─── */}
        <Section>
          <div style={{
            ...glass,
            textAlign: 'center',
            padding: 'clamp(2rem, 5vw, 3rem)',
            background: 'linear-gradient(135deg, rgba(8,145,178,0.04), rgba(14,116,144,0.06))',
          }}>
            <h2 style={{
              fontFamily: serif,
              fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
              fontWeight: 400,
              color: '#0f172a',
              lineHeight: 1.5,
              whiteSpace: 'pre-line',
              marginBottom: '1.2rem',
              wordBreak: 'keep-all',
            }}>
              {T.valueTitle[lang]}
            </h2>
            <p style={{
              fontFamily: sans,
              fontSize: 'clamp(0.8rem, 1.4vw, 0.9rem)',
              color: '#475569',
              lineHeight: 1.9,
              maxWidth: 560,
              margin: '0 auto',
            }}>
              {T.valueText[lang]}
            </p>
          </div>
        </Section>

        {/* ─── FAQ ─── */}
        <Section>
          <h2 style={sH2}>{T.faqTitle[lang]}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 640, margin: '0 auto' }}>
            {[
              { q: T.faq1Q, a: T.faq1A },
              { q: T.faq2Q, a: T.faq2A },
              { q: T.faq3Q, a: T.faq3A },
              { q: T.faq4Q, a: T.faq4A },
              { q: T.faq5Q, a: T.faq5A },
            ].map((faq, i) => (
              <div key={i} style={glass}>
                <h3 style={{
                  fontFamily: sans, fontSize: 'clamp(0.82rem, 1.5vw, 0.92rem)',
                  fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem',
                }}>
                  {faq.q[lang]}
                </h3>
                <p style={{
                  fontFamily: sans, fontSize: 'clamp(0.76rem, 1.3vw, 0.84rem)',
                  color: '#475569', lineHeight: 1.8, margin: 0,
                }}>
                  {faq.a[lang]}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── CTA ─── */}
        <Section>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{
              fontFamily: serif,
              fontSize: 'clamp(1.3rem, 3.5vw, 1.9rem)',
              fontWeight: 400,
              color: '#0f172a',
              lineHeight: 1.5,
              whiteSpace: 'pre-line',
              marginBottom: '1.5rem',
              wordBreak: 'keep-all',
            }}>
              {T.ctaTitle[lang]}
            </h2>
            <Link href="/resampler" style={{
              display: 'inline-block',
              fontFamily: sans, fontSize: 'clamp(0.85rem, 1.8vw, 1rem)',
              fontWeight: 600, letterSpacing: '0.08em',
              color: '#fff',
              background: `linear-gradient(135deg, ${ACCENT}, #0e7490)`,
              padding: 'clamp(0.9rem, 2vw, 1.1rem) clamp(2rem, 5vw, 3rem)',
              borderRadius: 999, textDecoration: 'none',
              boxShadow: `0 12px 32px ${ACCENT}40`,
            }}>
              {T.ctaBtn[lang]}
            </Link>
            <p style={{
              fontFamily: sans, fontSize: '0.68rem', color: '#94a3b8',
              letterSpacing: '0.1em', marginTop: '1rem',
            }}>
              {T.ctaSub[lang]}
            </p>
          </div>
        </Section>

        {/* ─── JSON-LD ─── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'SoftwareApplication',
                  name: 'KUON RESAMPLER',
                  applicationCategory: 'MultimediaApplication',
                  operatingSystem: 'Web Browser',
                  offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
                  description: 'High-quality sample rate converter with sinc interpolation and Kaiser window. 44.1kHz↔48kHz↔96kHz↔192kHz. Free, no install, browser-based.',
                  url: 'https://kuon-rnd.com/resampler',
                  author: {
                    '@type': 'Organization',
                    name: '空音開発 Kuon R&D',
                    url: 'https://kuon-rnd.com',
                  },
                },
                {
                  '@type': 'FAQPage',
                  mainEntity: [
                    {
                      '@type': 'Question',
                      name: 'Does upsampling improve sound quality?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'No. Upsampling 44.1kHz audio to 96kHz does not create frequency content above 22.05kHz. However, when used as oversampling for plugin processing in a DAW, it does provide a real benefit by reducing aliasing.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Does downsampling degrade quality?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'With a proper anti-aliasing filter, there is theoretically no degradation. All frequency content below half the new sample rate is preserved.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Which is better: 44.1kHz or 48kHz?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'There is no audible difference. Both fully cover the human hearing range (20Hz–20kHz). 44.1kHz is standard for music/CD, 48kHz for video/broadcast.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Is my audio data sent to a server?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'No. All processing happens entirely in your browser. Audio data is never transmitted over the internet.',
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />
      </div>

      {/* Reveal animations */}
      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.2, 0.8, 0.4, 1),
                      transform 0.7s cubic-bezier(0.2, 0.8, 0.4, 1);
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
