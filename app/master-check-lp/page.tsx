'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L3 = Record<Lang, string>;

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", "Consolas", monospace';
const ACCENT = '#0284c7';

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

function Section({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const ref = useReveal();
  return <section ref={ref} className="reveal" style={{ marginBottom: 'clamp(48px, 10vw, 80px)', ...style }}>{children}</section>;
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
  heroTitle: {
    ja: '配信する前に、\nあなたの音を、確認しましたか？',
    en: 'Before you release —\nhave you checked your sound?',
    es: 'Antes de publicar —\n¿revisaste tu sonido?',
    ko: '배포하기 전에 —\n당신의 음을 확인하셨나요?',
  } as L3,
  heroSub: {
    ja: 'LUFS・True Peak・クリッピング・ステレオ相関を一括チェック。\n問題があれば、ワンクリックで最適な音量に調整してダウンロード。',
    en: 'Check LUFS, True Peak, clipping, stereo correlation at once.\nIf something\'s off, adjust loudness with one click and download.',
    es: 'Verifica LUFS, True Peak, clipping, correlación estéreo de una vez.\nSi algo falla, ajusta la sonoridad con un clic y descarga.',
    ko: 'LUFS, True Peak, 클리핑, 스테레오 상관도를 한 번에 확인합니다.\n문제가 있으면 한 번의 클릭으로 최적의 음압으로 조정하고 다운로드합니다.',
  } as L3,
  heroCta: {
    ja: '今すぐチェックする（無料）',
    en: 'Check Now — Free',
    es: 'Verificar Ahora — Gratis',
    ko: '지금 확인하기 — 무료',
  } as L3,

  // Problem
  problemTitle: {
    ja: 'こんな経験、ありませんか？',
    en: 'Sound familiar?',
    es: '¿Te suena familiar?',
    ko: '이런 경험 있으신가요?',
  } as L3,
  problem1: {
    ja: 'Spotifyにアップしたら、自分の曲だけ音が小さかった',
    en: 'Your track sounds quieter than everything else on Spotify',
    es: 'Tu canción suena más baja que todo lo demás en Spotify',
    ko: 'Spotify에 업로드했는데 자신의 곡만 음이 작았어요',
  } as L3,
  problem2: {
    ja: 'マスタリング後にクリッピングが入っていたことに後から気づいた',
    en: 'You discovered clipping in your mastered file — after release',
    es: 'Descubriste clipping en tu archivo masterizado — después de publicar',
    ko: '마스터링 후 클리핑이 있었다는 것을 나중에 알아챘어요',
  } as L3,
  problem3: {
    ja: 'モノラルのスピーカーで聴いたら音が消えた（位相の問題）',
    en: 'Your mix disappears on mono speakers (phase cancellation)',
    es: 'Tu mezcla desaparece en altavoces mono (cancelación de fase)',
    ko: '모노 스피커에서 들으면 음이 사라졌어요 (위상 상쇄)',
  } as L3,

  // Solution
  solutionTitle: {
    ja: 'KUON MASTER CHECK が、\nすべてを一画面で解決します。',
    en: 'KUON MASTER CHECK solves it all\nin a single screen.',
    es: 'KUON MASTER CHECK lo resuelve todo\nen una sola pantalla.',
    ko: 'KUON MASTER CHECK가\n모든 것을 한 화면에서 해결합니다.',
  } as L3,

  // Features
  featTitle: {
    ja: '分析して、その場で直す。7つの機能',
    en: 'Analyze and Fix — 7 Features',
    es: 'Analiza y Corrige — 7 Funciones',
    ko: '분석하고 바로 수정합니다. 7가지 기능',
  } as L3,
  feat0t: { ja: 'ワンクリック ラウドネス調整', en: 'One-Click Loudness Adjust', es: 'Ajuste de Sonoridad en Un Clic', ko: '한 번의 클릭으로 라우드니스 조정' } as L3,
  feat0d: {
    ja: '各プラットフォームの基準値からのズレを検出し、「調整してダウンロード」ボタンを押すだけで、最適な音量に調整済みのWAVファイルをダウンロード。ソフトクリップ・リミッター搭載で True Peak も安全。他のツールにはない、分析から修正までの一気通貫。',
    en: 'Detects deviation from each platform\'s target, then one button press adjusts loudness and downloads an optimized WAV. Built-in soft-clip limiter keeps True Peak safe. No other tool goes from analysis to fix in one click.',
    es: 'Detecta la desviación del objetivo de cada plataforma. Un botón ajusta la sonoridad y descarga un WAV optimizado. Limitador soft-clip integrado para True Peak seguro. Ninguna otra herramienta va del análisis a la corrección en un clic.',
    ko: '각 플랫폼의 기준값 편차를 감지하고 "조정하고 다운로드" 버튼을 누르면 최적의 음압으로 조정된 WAV 파일을 다운로드합니다. 소프트 클립 리미터가 내장되어 트루 피크도 안전합니다. 분석에서 수정까지 한 번의 클릭으로 처리하는 다른 도구는 없습니다.',
  } as L3,
  feat1t: { ja: 'Integrated LUFS', en: 'Integrated LUFS', es: 'LUFS Integrado', ko: 'Integrated LUFS' } as L3,
  feat1d: {
    ja: 'EBU R128 / ITU-R BS.1770 準拠のゲーテッドラウドネス計測。配信プラットフォームが実際に使う計측方法と同じアルゴリズム。',
    en: 'Gated loudness per EBU R128 / ITU-R BS.1770 — the exact algorithm streaming platforms use.',
    es: 'Sonoridad con compuerta según EBU R128 / ITU-R BS.1770 — el mismo algoritmo que usan las plataformas.',
    ko: 'EBU R128 / ITU-R BS.1770 준수의 게이팅된 라우드니스 측정. 배포 플랫폼이 실제로 사용하는 것과 동일한 알고리즘입니다.',
  } as L3,
  feat2t: { ja: 'True Peak', en: 'True Peak', es: 'True Peak', ko: 'True Peak' } as L3,
  feat2d: {
    ja: 'サンプル間ピークを検出。-1 dBTP 超えはプラットフォーム側でリミッティングされる可能性があります。',
    en: 'Detects inter-sample peaks. Exceeding -1 dBTP may trigger platform-side limiting.',
    es: 'Detecta picos entre muestras. Superar -1 dBTP puede activar limitación en la plataforma.',
    ko: '샘플 간 피크를 감지합니다. -1 dBTP를 초과하면 플랫폼 측 리미팅이 발생할 수 있습니다.',
  } as L3,
  feat3t: { ja: 'プラットフォーム判定', en: 'Platform Verdict', es: 'Veredicto por Plataforma', ko: '플랫폼 판정' } as L3,
  feat3d: {
    ja: 'Spotify / Apple Music / YouTube / TikTok / Amazon Music — 各基準との差をdB単位で表示。適合・注意・不適合を一目で判別。',
    en: 'Spotify / Apple Music / YouTube / TikTok / Amazon Music — shows dB difference from each target. Pass / Warn / Fail at a glance.',
    es: 'Spotify / Apple Music / YouTube / TikTok / Amazon Music — muestra la diferencia en dB. Aprobado / Aviso / Fallo de un vistazo.',
    ko: 'Spotify / Apple Music / YouTube / TikTok / Amazon Music — 각 기준과의 차이를 dB 단위로 표시합니다. 통과/경고/불통 한눈에 판별.',
  } as L3,
  feat4t: { ja: 'クリッピング検出', en: 'Clipping Detection', es: 'Detección de Clipping', ko: '클리핑 감지' } as L3,
  feat4d: {
    ja: '0 dBFS に達したサンプル数と比率を算出。マスタリングの過度なリミッティングを検出します。',
    en: 'Counts samples hitting 0 dBFS and their percentage. Detects over-limiting in mastering.',
    es: 'Cuenta muestras que alcanzan 0 dBFS y su porcentaje. Detecta limitación excesiva.',
    ko: '0 dBFS에 도달한 샘플 수와 비율을 계산합니다. 마스터링의 과도한 리미팅을 감지합니다.',
  } as L3,
  feat5t: { ja: 'ステレオ相関', en: 'Stereo Correlation', es: 'Correlación Estéreo', ko: '스테레오 상관도' } as L3,
  feat5d: {
    ja: '位相相関メーター（-1〜+1）とステレオバランスを表示。モノラル互換性の問題を事前に発見。',
    en: 'Phase correlation meter (-1 to +1) plus stereo balance. Catch mono compatibility issues early.',
    es: 'Medidor de correlación de fase (-1 a +1) y balance estéreo. Detecta problemas de compatibilidad mono.',
    ko: '위상 상관도 미터(-1~+1)와 스테레오 밸런스를 표시합니다. 모노 호환성 문제를 조기에 감지합니다.',
  } as L3,
  feat6t: { ja: 'ファイル情報', en: 'File Info', es: 'Info del Archivo', ko: '파일 정보' } as L3,
  feat6d: {
    ja: 'サンプルレート、ビット深度、チャンネル数、再生時間を表示。配信先の要件と照合できます。',
    en: 'Sample rate, bit depth, channels, duration. Verify against distribution requirements.',
    es: 'Frecuencia de muestreo, profundidad de bits, canales, duración. Verifica los requisitos de distribución.',
    ko: '샘플레이트, 비트 깊이, 채널 수, 재생 시간을 표시합니다. 배포 요구사항과 확인할 수 있습니다.',
  } as L3,

  // How to use
  howTitle: {
    ja: '使い方 — たった4ステップ',
    en: 'How to Use — Just 4 Steps',
    es: 'Cómo Usar — Solo 4 Pasos',
    ko: '사용 방법 — 단 4단계',
  } as L3,
  how1t: { ja: 'ファイルをドロップ', en: 'Drop Your File', es: 'Suelta tu Archivo', ko: '파일 드롭' } as L3,
  how1d: {
    ja: 'マスタリング済みの WAV / FLAC / MP3 をブラウザにドラッグ＆ドロップ。またはファイル選択ボタンから。',
    en: 'Drag & drop your mastered WAV / FLAC / MP3 into the browser. Or use the file picker.',
    es: 'Arrastra y suelta tu WAV / FLAC / MP3 masterizado. O usa el selector de archivos.',
    ko: '마스터링된 WAV / FLAC / MP3을 브라우저로 드래그&드롭합니다. 또는 파일 선택 버튼을 사용합니다.',
  } as L3,
  how2t: { ja: '自動解析', en: 'Auto Analysis', es: 'Análisis Automático', ko: '자동 분석' } as L3,
  how2d: {
    ja: 'EBU R128 準拠のラウドネス計測、True Peak、クリッピング、ステレオ相関をブラウザ内で一括解析。数秒で完了。',
    en: 'EBU R128 loudness, True Peak, clipping, stereo correlation — all analyzed in your browser. Done in seconds.',
    es: 'Sonoridad EBU R128, True Peak, clipping, correlación estéreo — todo analizado en tu navegador. En segundos.',
    ko: 'EBU R128 라우드니스, True Peak, 클리핑, 스테레오 상관도 — 모두 브라우저에서 분석됩니다. 몇 초 안에 완료.',
  } as L3,
  how3t: { ja: '結果を確認', en: 'Review Results', es: 'Revisa los Resultados', ko: '결과 확인' } as L3,
  how3d: {
    ja: '総合判定（PASS / WARN / FAIL）と各プラットフォームとの比較を一画面で。問題があれば具体的な改善ポイントを日本語で表示。',
    en: 'Overall verdict (PASS / WARN / FAIL) with per-platform comparison. Issues are explained with specific guidance.',
    es: 'Veredicto general (PASS / WARN / FAIL) con comparación por plataforma. Los problemas incluyen orientación específica.',
    ko: '총합 판정(PASS / WARN / FAIL)과 각 플랫폼별 비교를 한 화면에서 확인합니다. 문제가 있으면 구체적인 개선 포인트를 표시합니다.',
  } as L3,
  how4t: { ja: '調整してダウンロード', en: 'Adjust & Download', es: 'Ajusta y Descarga', ko: '조정하고 다운로드' } as L3,
  how4d: {
    ja: 'ラウドネスが基準値から外れていたら「調整してダウンロード」ボタンを押すだけ。リミッター処理済みの最適化WAVファイルが即座にダウンロードされます。',
    en: 'If loudness is off-target, just press "Adjust & Download." An optimized WAV with limiter processing downloads instantly.',
    es: 'Si la sonoridad no cumple, presiona "Ajustar y descargar." Un WAV optimizado con limitador se descarga al instante.',
    ko: '라우드니스가 기준값을 벗어났다면 "조정하고 다운로드" 버튼을 누르기만 하면 됩니다. 리미터 처리가 완료된 최적화 WAV 파일이 즉시 다운로드됩니다.',
  } as L3,

  // Comparison
  compTitle: {
    ja: '他のツールとの比較',
    en: 'Compared to Other Tools',
    es: 'Comparado con Otras Herramientas',
    ko: '다른 도구와의 비교',
  } as L3,

  // Who
  whoTitle: {
    ja: 'こんな方に最適',
    en: 'Who Is It For?',
    es: '¿Para Quién Es?',
    ko: '누가 필요한가요?',
  } as L3,
  who1t: { ja: 'インディーズミュージシャン', en: 'Independent Musicians', es: 'Músicos Independientes', ko: '독립 음악가' } as L3,
  who1d: {
    ja: '自分でマスタリングして配信する方。プラットフォームごとのラウドネス基準を一発で確認。',
    en: 'Self-mastering and distributing your own music? Check loudness targets for every platform instantly.',
    es: '¿Masterizas y distribuyes tu propia música? Verifica los objetivos de sonoridad al instante.',
    ko: '자신의 음악을 직접 마스터링하고 배포하는 사람들. 플랫폼별 라우드니스 기준을 즉시 확인합니다.',
  } as L3,
  who2t: { ja: 'マスタリングエンジニア', en: 'Mastering Engineers', es: 'Ingenieros de Masterización', ko: '마스터링 엔지니어' } as L3,
  who2d: {
    ja: 'クライアントに納品前の最終チェック。サーバーに音源を送りたくない方にも安心のローカル処理。',
    en: 'Final check before delivering to clients. 100% local — no audio leaves your machine.',
    es: 'Verificación final antes de entregar al cliente. 100% local — el audio no sale de tu equipo.',
    ko: '클라이언트에게 납품하기 전의 최종 확인. 100% 로컬 — 음성 데이터가 절대 떠나가지 않습니다.',
  } as L3,
  who3t: { ja: 'レーベル / ディストリビューター', en: 'Labels / Distributors', es: 'Sellos / Distribuidores', ko: '레이블 / 배포사' } as L3,
  who3d: {
    ja: '大量の音源を受け取る際のクイックチェック。問題のあるファイルを配信前にキャッチ。',
    en: 'Quick check when receiving masters. Catch problematic files before they reach distribution.',
    es: 'Verificación rápida al recibir masters. Detecta archivos problemáticos antes de la distribución.',
    ko: '마스터를 받을 때 빠른 확인. 배포 전에 문제가 있는 파일을 감지합니다.',
  } as L3,

  // Value proposition
  valueTitle: {
    ja: '分析から修正まで、これが無料であることの意味',
    en: 'From Analysis to Fix — Free',
    es: 'Del Análisis a la Corrección — Gratis',
    ko: '분석에서 수정까지 — 무료',
  } as L3,
  valueBody: {
    ja: 'プロのマスタリングスタジオでは、数十万円のプラグインや専用ハードウェアでラウドネスを計測し、調整しています。KUON MASTER CHECK は、その計測だけでなく「修正」までをブラウザだけで、誰でも、無料で実行できるようにしました。\n\nSpotify に出したら音が小さかった — そんなとき、もう DAW を開き直す必要はありません。ボタンひとつで最適化済み WAV をダウンロード。リミッター処理で True Peak も安全です。\n\n空音開発は「音と向き合うすべての人」のためにツールを作っています。予算がないからチェックできない、修正できない — そんな状況をなくすことが、私たちの使命です。',
    en: 'Professional studios use plugins and hardware costing thousands just to measure and adjust loudness. KUON MASTER CHECK does both — analysis AND correction — in your browser, free.\n\nYour track too quiet for Spotify? No need to reopen your DAW. One click downloads an optimized WAV with safe True Peak limiting.\n\nKuon R&D builds tools for everyone who takes sound seriously. No one should skip quality checks — or corrections — because of budget.',
    es: 'Los estudios profesionales usan plugins y hardware costosos solo para medir y ajustar la sonoridad. KUON MASTER CHECK hace ambas cosas — análisis Y corrección — en tu navegador, gratis.\n\n¿Tu pista suena baja en Spotify? No necesitas reabrir tu DAW. Un clic descarga un WAV optimizado con limitación de True Peak segura.\n\nKuon R&D crea herramientas para todos. Nadie debería omitir controles de calidad ni correcciones por falta de presupuesto.',
    ko: '전문 마스터링 스튜디오는 수천 달러짜리 플러그인과 전용 하드웨어를 사용하여 라우드니스를 측정하고 조정합니다. KUON MASTER CHECK는 분석뿐만 아니라 수정까지 브라우저에서 무료로 실행할 수 있습니다.\n\nSpotify에서 음이 작았나요? DAW를 다시 열 필요가 없습니다. 한 번의 클릭으로 안전한 True Peak 리미팅이 있는 최적화된 WAV를 다운로드합니다.\n\n공음개발은 음에 진지하게 대하는 모든 사람을 위한 도구를 만듭니다. 예산 때문에 품질 확인이나 수정을 건너뛰어야 하는 상황을 없애는 것이 우리의 사명입니다.',
  } as L3,

  // FAQ
  faqTitle: { ja: 'よくある質問', en: 'FAQ', es: 'Preguntas Frecuentes', ko: '자주 묻는 질문' } as L3,
  faq1q: {
    ja: 'LUFS とは何ですか？',
    en: 'What is LUFS?',
    es: '¿Qué es LUFS?',
    ko: 'LUFS란 무엇인가요?',
  } as L3,
  faq1a: {
    ja: 'LUFS (Loudness Units relative to Full Scale) は、人間の聴覚特性を考慮したラウドネス計測単位です。Spotify や Apple Music などの配信プラットフォームは、この値を基準に音量を自動調整します。曲が基準より大きければ音量を下げられ、小さければそのまま再生されます。',
    en: 'LUFS (Loudness Units relative to Full Scale) measures perceived loudness based on human hearing. Streaming platforms like Spotify and Apple Music use this value to automatically adjust playback volume. If your track is louder than the target, it gets turned down.',
    es: 'LUFS (Unidades de Sonoridad relativas a Escala Completa) mide la sonoridad percibida. Las plataformas como Spotify y Apple Music usan este valor para ajustar automáticamente el volumen de reproducción.',
    ko: 'LUFS(전체 스케일에 대한 라우드니스 단위)는 인간의 청각 특성을 고려한 라우드니스 측정 단위입니다. Spotify 및 Apple Music과 같은 배포 플랫폼은 이 값을 기준으로 재생 볼륨을 자동으로 조정합니다.',
  } as L3,
  faq2q: {
    ja: 'True Peak と通常のピークは何が違いますか？',
    en: 'What\'s the difference between True Peak and regular peak?',
    es: '¿Cuál es la diferencia entre True Peak y el pico regular?',
    ko: 'True Peak와 일반 피크의 차이점은 무엇인가요?',
  } as L3,
  faq2a: {
    ja: 'デジタルオーディオでは、サンプルとサンプルの間に実際のピーク値が隠れていることがあります（インターサンプルピーク）。True Peak はオーバーサンプリングでこれを検出します。通常のピークでは 0dBFS 以下でも、True Peak では 0dBTP を超えてクリッピングが発生する場合があります。',
    en: 'Digital audio can have peaks between samples (inter-sample peaks) that regular peak meters miss. True Peak detection uses oversampling to find these hidden peaks. A file that looks fine on a regular meter may actually clip when converted to analog.',
    es: 'El audio digital puede tener picos entre muestras que los medidores regulares no detectan. True Peak usa sobremuestreo para encontrar estos picos ocultos.',
    ko: '디지털 오디오는 샘플 간의 피크(샘플 간 피크)가 있을 수 있으며, 일반 피크 미터는 이를 놓칩니다. True Peak 감지는 오버샘플링을 사용하여 이러한 숨겨진 피크를 찾습니다.',
  } as L3,
  faq3q: {
    ja: 'ステレオ相関が低いとどうなりますか？',
    en: 'What happens if stereo correlation is low?',
    es: '¿Qué pasa si la correlación estéreo es baja?',
    ko: '스테레오 상관도가 낮으면 어떻게 되나요?',
  } as L3,
  faq3a: {
    ja: 'ステレオ相関が 0 に近いと左右の信号が無関係、マイナスだと位相が反転しています。モノラル再生（スマートフォンのスピーカー、店舗のBGMシステムなど）で音量が大幅に下がったり、特定の周波数が消えたりします。',
    en: 'Low correlation (near 0) means the left and right signals are unrelated. Negative values indicate phase inversion. In mono playback (phone speakers, PA systems), this can cause volume drops or frequency cancellation.',
    es: 'Una correlación baja (cerca de 0) significa que las señales izquierda y derecha no están relacionadas. Valores negativos indican inversión de fase. En reproducción mono, esto puede causar caídas de volumen.',
    ko: '낮은 상관도(0에 가까움)는 좌우 신호가 관련이 없음을 의미합니다. 음수 값은 위상 반전을 나타냅니다. 모노 재생(휴대폰 스피커, PA 시스템)에서는 음량 감소 또는 주파수 상쇄를 유발할 수 있습니다.',
  } as L3,
  faq4q: {
    ja: '音声データはサーバーに送信されますか？',
    en: 'Is my audio sent to a server?',
    es: '¿Se envía mi audio a un servidor?',
    ko: '내 음성이 서버로 전송되나요?',
  } as L3,
  faq4a: {
    ja: 'いいえ。すべての解析処理はブラウザ内で完結します。音声データがネットワークに送信されることは一切ありません。未公開の音源も安心してチェックできます。',
    en: 'No. All analysis happens entirely in your browser. No audio data is ever sent over the network. You can safely check unreleased material.',
    es: 'No. Todo el análisis ocurre en tu navegador. Nunca se envían datos de audio por la red. Puedes verificar material inédito con total seguridad.',
    ko: '아니요. 모든 분석은 브라우저에서만 수행됩니다. 음성 데이터가 네트워크를 통해 전송되지 않습니다. 미발표 자료도 안전하게 확인할 수 있습니다.',
  } as L3,
  faq5q: {
    ja: '対応ファイル形式は？',
    en: 'Which file formats are supported?',
    es: '¿Qué formatos son compatibles?',
    ko: '지원되는 파일 형식은 무엇인가요?',
  } as L3,
  faq5a: {
    ja: 'ブラウザがデコード可能なすべての音声形式に対応しています。WAV、FLAC、MP3、AAC、OGG など。最も正確な結果を得るには、マスタリング後の WAV / FLAC をお使いください。',
    en: 'Any format your browser can decode: WAV, FLAC, MP3, AAC, OGG, etc. For the most accurate results, use your mastered WAV or FLAC.',
    es: 'Cualquier formato que tu navegador pueda decodificar: WAV, FLAC, MP3, AAC, OGG, etc. Para resultados más precisos, usa tu WAV o FLAC masterizado.',
    ko: '브라우저가 디코딩할 수 있는 모든 형식: WAV, FLAC, MP3, AAC, OGG 등입니다. 가장 정확한 결과를 위해 마스터링된 WAV 또는 FLAC을 사용하세요.',
  } as L3,

  // CTA
  ctaTitle: {
    ja: 'あなたの音源、配信前に確認しませんか？',
    en: 'Ready to check your master?',
    es: '¿Listo para verificar tu master?',
    ko: '마스터를 확인할 준비가 되셨나요?',
  } as L3,
  ctaBtn: {
    ja: 'KUON MASTER CHECK を開く',
    en: 'Open KUON MASTER CHECK',
    es: 'Abrir KUON MASTER CHECK',
    ko: 'KUON MASTER CHECK 열기',
  } as L3,
  ctaFree: {
    ja: '完全無料・インストール不要・サーバー送信なし',
    en: '100% Free — No Install — No Upload',
    es: '100% Gratis — Sin Instalación — Sin Subida',
    ko: '100% 무료 — 설치 불필요 — 업로드 없음',
  } as L3,
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function MasterCheckLpPage() {
  const { lang } = useLang();
  const t = (l3: L3) => l3[lang] || l3.en;

  const features = [
    { icon: '🚀', t: T.feat0t, d: T.feat0d, highlight: true },
    { icon: '📊', t: T.feat1t, d: T.feat1d },
    { icon: '📈', t: T.feat2t, d: T.feat2d },
    { icon: '🎯', t: T.feat3t, d: T.feat3d },
    { icon: '⚡', t: T.feat4t, d: T.feat4d },
    { icon: '🔊', t: T.feat5t, d: T.feat5d },
    { icon: '📁', t: T.feat6t, d: T.feat6d },
  ];

  const steps = [
    { n: '01', t: T.how1t, d: T.how1d },
    { n: '02', t: T.how2t, d: T.how2d },
    { n: '03', t: T.how3t, d: T.how3d },
    { n: '04', t: T.how4t, d: T.how4d },
  ];

  const personas = [
    { icon: '🎸', t: T.who1t, d: T.who1d },
    { icon: '🎛️', t: T.who2t, d: T.who2d },
    { icon: '🏢', t: T.who3t, d: T.who3d },
  ];

  const faqs = [
    { q: T.faq1q, a: T.faq1a },
    { q: T.faq2q, a: T.faq2a },
    { q: T.faq3q, a: T.faq3a },
    { q: T.faq4q, a: T.faq4a },
    { q: T.faq5q, a: T.faq5a },
  ];

  const ctaButton = (
    <Link href="/master-check" style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '14px 36px', borderRadius: 50, border: 'none',
      fontSize: 'clamp(14px, 2.5vw, 16px)', fontWeight: 700,
      letterSpacing: '0.06em', textDecoration: 'none',
      color: '#fff', background: `linear-gradient(135deg, ${ACCENT}, #0369a1)`,
      boxShadow: `0 8px 24px rgba(2,132,199,0.3)`,
      transition: 'all 0.3s ease',
    }}>
      {t(T.ctaBtn)} →
    </Link>
  );

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'KUON MASTER CHECK',
        description: t(T.heroSub),
        url: 'https://kuon-rnd.com/master-check',
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web Browser',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
        author: { '@type': 'Organization', name: '空音開発 Kuon R&D', url: 'https://kuon-rnd.com' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: t(f.q),
          acceptedAnswer: { '@type': 'Answer', text: t(f.a) },
        })),
      },
    ],
  };

  return (
    <div style={{
      maxWidth: 960, margin: '0 auto',
      padding: 'clamp(24px, 5vw, 60px) clamp(16px, 4vw, 40px)',
      fontFamily: sans,
    }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ══════════ HERO ══════════ */}
      <section className="hero-enter-1" style={{
        textAlign: 'center',
        paddingTop: 'clamp(32px, 8vw, 80px)',
        paddingBottom: 'clamp(48px, 10vw, 80px)',
      }}>
        <h1 style={{
          fontFamily: serif,
          fontSize: 'clamp(28px, 6vw, 52px)',
          fontWeight: 700, lineHeight: 1.3,
          letterSpacing: '0.03em', whiteSpace: 'pre-line',
          marginBottom: 20,
          background: `linear-gradient(135deg, #111827 20%, ${ACCENT} 60%, #7C3AED)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {t(T.heroTitle)}
        </h1>
        <p className="hero-enter-2" style={{
          fontSize: 'clamp(14px, 2.2vw, 17px)',
          color: '#6b7280', lineHeight: 1.8, maxWidth: 600, margin: '0 auto',
          whiteSpace: 'pre-line', marginBottom: 32,
        }}>
          {t(T.heroSub)}
        </p>
        <div className="hero-enter-3">
          {ctaButton}
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 16 }}>{t(T.ctaFree)}</p>
        </div>
      </section>

      {/* ══════════ PROBLEM ══════════ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 600, textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 40px)', letterSpacing: '0.03em', wordBreak: 'keep-all' }}>
          {t(T.problemTitle)}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640, margin: '0 auto' }}>
          {[T.problem1, T.problem2, T.problem3].map((p, i) => (
            <div key={i} style={{
              ...glass, display: 'flex', alignItems: 'flex-start', gap: 14, padding: '20px 24px',
              borderLeft: `3px solid ${['#ef4444', '#f59e0b', '#7C3AED'][i]}`,
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{['😰', '😱', '🔇'][i]}</span>
              <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#374151', lineHeight: 1.7, margin: 0, wordBreak: 'keep-all' }}>{t(p)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════ SOLUTION ══════════ */}
      <Section style={{ textAlign: 'center' }}>
        <h2 style={{
          fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)',
          fontWeight: 600, lineHeight: 1.4, letterSpacing: '0.03em',
          whiteSpace: 'pre-line', marginBottom: 32, wordBreak: 'keep-all',
        }}>
          {t(T.solutionTitle)}
        </h2>
        {/* Mock UI */}
        <div style={{
          ...glass, maxWidth: 560, margin: '0 auto', padding: 0, overflow: 'hidden',
          border: `1px solid rgba(2,132,199,0.2)`,
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.03)', padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
            <span style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#9ca3af', fontFamily: mono }}>kuon-rnd.com/master-check</span>
          </div>
          <div style={{ padding: 'clamp(16px, 3vw, 24px)' }}>
            <div style={{ background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.2)', borderRadius: 10, padding: 14, marginBottom: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#6b7280' }}>OVERALL VERDICT</span>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#059669', margin: '4px 0 0' }}>✅ PASS</p>
            </div>
            {[
              { label: 'Integrated', value: '-13.8 LUFS', color: '#059669' },
              { label: 'True Peak', value: '-1.2 dBTP', color: '#059669' },
              { label: 'Clipping', value: '0%', color: '#059669' },
              { label: 'Correlation', value: '0.912', color: '#059669' },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', padding: '6px 0',
                borderBottom: '1px solid rgba(0,0,0,0.04)',
                fontSize: 13,
              }}>
                <span style={{ color: '#6b7280' }}>{row.label}</span>
                <span style={{ fontFamily: mono, color: row.color, fontWeight: 600 }}>{row.value}</span>
              </div>
            ))}
            {/* Mock adjust button */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0', fontSize: 12,
            }}>
              <span style={{ color: '#6b7280' }}>Spotify</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 12px', borderRadius: 50,
                fontSize: 10, fontWeight: 700, color: '#fff',
                background: `linear-gradient(135deg, ${ACCENT}, #0369a1)`,
              }}>
                ⬇ {lang === 'ja' ? '調整してDL' : lang === 'es' ? 'Ajustar y DL' : 'Adjust & DL'}
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════ FEATURES ══════════ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 600, textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 40px)', letterSpacing: '0.03em' }}>
          {t(T.featTitle)}
        </h2>
        {/* Highlight: One-Click Adjust (full width) */}
        {features.filter(f => f.highlight).map((f, i) => (
          <div key={`hl-${i}`} style={{
            ...glass, padding: 'clamp(24px, 4vw, 36px)', marginBottom: 16,
            borderLeft: `4px solid ${ACCENT}`,
            background: `linear-gradient(135deg, rgba(2,132,199,0.04), rgba(255,255,255,0.7))`,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 36, flexShrink: 0 }}>{f.icon}</span>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: sans, fontSize: 'clamp(16px, 2.5vw, 20px)', fontWeight: 800, color: '#111827', margin: 0 }}>
                    {t(f.t)}
                  </h3>
                  <span style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
                    padding: '3px 10px', borderRadius: 50,
                    color: '#fff', background: `linear-gradient(135deg, ${ACCENT}, #0369a1)`,
                  }}>
                    {lang === 'ja' ? '他ツールにない機能' : lang === 'es' ? 'EXCLUSIVO' : 'EXCLUSIVE'}
                  </span>
                </div>
                <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: '#374151', lineHeight: 1.8, margin: 0 }}>{t(f.d)}</p>
              </div>
            </div>
          </div>
        ))}
        {/* Other features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {features.filter(f => !f.highlight).map((f, i) => (
            <div key={i} style={{ ...glass, padding: '24px' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
              <h3 style={{ fontFamily: sans, fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#111827' }}>{t(f.t)}</h3>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{t(f.d)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════ HOW TO USE ══════════ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 600, textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 40px)', letterSpacing: '0.03em' }}>
          {t(T.howTitle)}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600, margin: '0 auto' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ ...glass, display: 'flex', gap: 20, alignItems: 'flex-start', padding: '24px' }}>
              <span style={{
                fontFamily: mono, fontSize: 32, fontWeight: 800,
                color: `${ACCENT}20`, lineHeight: 1, flexShrink: 0,
              }}>{s.n}</span>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: '#111827' }}>{t(s.t)}</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{t(s.d)}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════ COMPARISON ══════════ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 600, textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 40px)', letterSpacing: '0.03em' }}>
          {t(T.compTitle)}
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(12px, 2vw, 14px)' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.08)' }}>
                {['', 'KUON MASTER CHECK', 'Youlean Loudness Meter', 'loudnesspenalty.com', 'iZotope Insight 2'].map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 12px', textAlign: i === 0 ? 'left' : 'center',
                    fontWeight: i === 1 ? 800 : 600, fontSize: 12,
                    letterSpacing: '0.06em', color: i === 1 ? ACCENT : '#6b7280',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [{ ja: '価格', en: 'Price', es: 'Precio' }, { ja: '無料', en: 'Free', es: 'Gratis' }, '$99 (Free ver. limited)', { ja: '無料', en: 'Free', es: 'Gratis' }, '$199'],
                [{ ja: 'インストール', en: 'Install', es: 'Instalación' }, '—', { ja: '必要（VST/AU）', en: 'Required (VST/AU)', es: 'Necesario (VST/AU)' }, '—', { ja: '必要（VST/AU）', en: 'Required (VST/AU)', es: 'Necesario (VST/AU)' }],
                ['LUFS (EBU R128)', '✅', '✅', '✅', '✅'],
                ['True Peak', '✅', '✅', '—', '✅'],
                [{ ja: 'クリッピング検出', en: 'Clipping Detection', es: 'Detección Clipping' }, '✅', '—', '—', '✅'],
                [{ ja: 'ステレオ相関', en: 'Stereo Correlation', es: 'Correlación Estéreo' }, '✅', '—', '—', '✅'],
                [{ ja: 'PF 比較', en: 'Platform Compare', es: 'Comparar PF' }, '✅', '—', '✅', '—'],
                [{ ja: '自動ラウドネス調整', en: 'Auto Loudness Adjust', es: 'Ajuste Automático' }, '✅', '❌', '❌', '❌'],
                [{ ja: 'リミッター付きWAV出力', en: 'WAV Export w/ Limiter', es: 'Exportar WAV c/ Limitador' }, '✅', '❌', '❌', '❌'],
                [{ ja: 'サーバー送信なし', en: 'No Server Upload', es: 'Sin Subida' }, '✅', '✅', '❌', '✅'],
                [{ ja: 'ブラウザ完結', en: 'Browser Only', es: 'Solo Navegador' }, '✅', '❌', '✅', '❌'],
              ].map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                  {row.map((cell, ci) => {
                    const text = typeof cell === 'object' && cell !== null && 'ja' in cell ? (cell as L3)[lang] : String(cell);
                    return (
                      <td key={ci} style={{
                        padding: '10px 12px',
                        textAlign: ci === 0 ? 'left' : 'center',
                        fontWeight: ci === 0 ? 600 : 400,
                        color: ci === 1 ? '#111827' : '#6b7280',
                        background: ci === 1 ? `rgba(2,132,199,0.03)` : 'transparent',
                        whiteSpace: 'nowrap',
                      }}>{text}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* ══════════ WHO ══════════ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 600, textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 40px)', letterSpacing: '0.03em', wordBreak: 'keep-all' }}>
          {t(T.whoTitle)}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {personas.map((p, i) => (
            <div key={i} style={{ ...glass, padding: '28px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{p.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: '#111827' }}>{t(p.t)}</h3>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, margin: 0 }}>{t(p.d)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ══════════ VALUE ══════════ */}
      <Section>
        <div style={{ ...glass, maxWidth: 640, margin: '0 auto', padding: 'clamp(28px, 5vw, 44px)', borderLeft: `4px solid ${ACCENT}` }}>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px, 3.5vw, 28px)', fontWeight: 600, marginBottom: 20, letterSpacing: '0.03em', wordBreak: 'keep-all' }}>
            {t(T.valueTitle)}
          </h2>
          <p style={{ fontSize: 'clamp(14px, 2vw, 16px)', color: '#374151', lineHeight: 1.9, whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
            {t(T.valueBody)}
          </p>
        </div>
      </Section>

      {/* ══════════ FAQ ══════════ */}
      <Section>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 600, textAlign: 'center', marginBottom: 'clamp(24px, 5vw, 40px)', letterSpacing: '0.03em' }}>
          {t(T.faqTitle)}
        </h2>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((f, i) => (
            <details key={i} style={{ ...glass, padding: 0, cursor: 'pointer' }}>
              <summary style={{
                padding: '18px 24px', fontSize: 'clamp(14px, 2vw, 16px)',
                fontWeight: 600, color: '#111827', listStyle: 'none',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                {t(f.q)}
                <span style={{ fontSize: 18, color: '#9ca3af', flexShrink: 0, marginLeft: 12 }}>＋</span>
              </summary>
              <div style={{ padding: '0 24px 18px', fontSize: 'clamp(13px, 1.8vw, 15px)', color: '#6b7280', lineHeight: 1.8 }}>
                {t(f.a)}
              </div>
            </details>
          ))}
        </div>
      </Section>

      {/* ══════════ FINAL CTA ══════════ */}
      <Section style={{ textAlign: 'center', paddingBottom: 'clamp(40px, 8vw, 80px)' }}>
        <h2 style={{
          fontFamily: serif, fontSize: 'clamp(22px, 4vw, 34px)',
          fontWeight: 600, marginBottom: 24, letterSpacing: '0.03em', wordBreak: 'keep-all',
        }}>
          {t(T.ctaTitle)}
        </h2>
        {ctaButton}
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 16 }}>{t(T.ctaFree)}</p>
      </Section>
    </div>
  );
}
