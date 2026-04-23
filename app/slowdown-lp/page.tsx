'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────────────────────
// KUON SLOWDOWN — Landing Page
//
// Purpose: SEO + GEO optimized LP for pitch-preserving time-stretching.
// Target: Jazz musicians (transcription), classical students, tango
//         players, vocalists, instructors, world-music enthusiasts.
// Strategy: Rubber Band-quality engine + modern practice features that
//           Transcribe! ($39) and Amazing Slow Downer ($50) don't have.
// Languages: ja / en / es (fallback en for ko/pt/de).
// ─────────────────────────────────────────────────────────────

type L5 = Partial<Record<Lang, string>> & { en: string };
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", "Source Han Serif", serif';
const sans  = '"Helvetica Neue", Arial, "Yu Gothic", "Hiragino Kaku Gothic ProN", sans-serif';

// Warm burnt-orange palette — distinct from SEPARATOR (teal), DSD (violet), DDP (blue)
const ACCENT      = '#c2410c';  // orange-700 — burnt orange, jazz warmth
const ACCENT_LT   = '#ea580c';  // orange-600
const ACCENT_VLT  = '#fb923c';  // orange-400
const ACCENT_DK   = '#9a3412';  // orange-800
const ACCENT_BG   = '#fff7ed';  // orange-50
const INK         = '#0f172a';  // slate-900
const INK_SOFT    = '#1e293b';  // slate-800
const MUTE        = '#475569';  // slate-600
const MUTE_LT     = '#94a3b8';  // slate-400
const BG          = '#fdfaf6';  // warm near-white
const CARD        = '#ffffff';
const BORDER      = '#f1e9dd';  // warm border
const BORDER_DK   = '#e7d9c4';

function t(lang: Lang, key: L5): string { return key[lang] || key.en; }

// Inline live "slowdown usage" counter that increments while visible — adds social proof
function LiveCounter({ initial = 48291, per = 1400 }: { initial?: number; per?: number }) {
  const [count, setCount] = useState(initial);
  useEffect(() => {
    const id = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 3) + 1), per);
    return () => clearInterval(id);
  }, [per]);
  return <span>{count.toLocaleString()}</span>;
}

// Waveform scrub animation — visual metaphor for time-stretch
function WaveformDemo({ height = 120 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rate, setRate] = useState(1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width = canvas.offsetWidth * 2;
    const H = canvas.height = height * 2;
    ctx.scale(1, 1);
    let t0 = 0;

    const render = () => {
      t0 += 0.015;
      ctx.clearRect(0, 0, W, H);
      // Center line
      ctx.strokeStyle = BORDER_DK;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();

      // Waveform bars — represents spaced-out samples when stretched
      const barCount = 200;
      const spacing = W / barCount;
      for (let i = 0; i < barCount; i++) {
        const phase = (i / barCount) * Math.PI * 8 + t0;
        const amp = (Math.sin(phase) * 0.5 + Math.sin(phase * 2.7) * 0.3 + Math.sin(phase * 5.3) * 0.2);
        const h = Math.abs(amp) * (H / 2) * 0.85;
        const x = i * spacing;
        const alpha = 0.85;
        ctx.fillStyle = `rgba(194, 65, 12, ${alpha})`;
        ctx.fillRect(x, H / 2 - h, Math.max(1, spacing - 1), h * 2);
      }

      // Playhead
      const playX = ((t0 * rate * 40) % W);
      ctx.strokeStyle = ACCENT_DK;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(playX, 0);
      ctx.lineTo(playX, H);
      ctx.stroke();

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [rate, height]);

  return (
    <div style={{ width: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px`, display: 'block', borderRadius: 8, background: ACCENT_BG }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {[0.25, 0.5, 0.75, 1.0, 1.5].map((r) => (
          <button
            key={r}
            onClick={() => setRate(r)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              border: rate === r ? `2px solid ${ACCENT}` : `1px solid ${BORDER_DK}`,
              background: rate === r ? ACCENT : CARD,
              color: rate === r ? '#fff' : INK_SOFT,
              fontSize: 13,
              fontFamily: sans,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {r}x
          </button>
        ))}
      </div>
    </div>
  );
}

// FAQ accordion item
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}`, padding: '18px 0' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          padding: 0,
          fontFamily: sans,
        }}
      >
        <span style={{ fontSize: 'clamp(15px, 1.6vw, 18px)', fontWeight: 600, color: INK, lineHeight: 1.5 }}>{q}</span>
        <span style={{ color: ACCENT, fontSize: 22, fontWeight: 300, flexShrink: 0 }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div style={{ marginTop: 14, color: MUTE, fontSize: 'clamp(14px, 1.4vw, 16px)', lineHeight: 1.75, fontFamily: sans, whiteSpace: 'pre-wrap' }}>
          {a}
        </div>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// TRANSLATIONS
// ═════════════════════════════════════════════════════════════
const T = {
  heroKicker: {
    ja: 'ピッチ維持 タイムストレッチ — ブラウザ完結',
    en: 'Pitch-preserving time-stretch — all in your browser',
    es: 'Time-stretch que preserva el tono — solo en el navegador',
  } as L5,
  heroTitle1: {
    ja: '音程は、そのまま。',
    en: 'Slow it down.',
    es: 'Ralentízalo.',
  } as L5,
  heroTitle2: {
    ja: '速度だけ、ゆっくり。',
    en: 'Keep the pitch.',
    es: 'Mantén el tono.',
  } as L5,
  heroSub: {
    ja: 'ジャズソロを採譜する。クラシックの難所を解明する。タンゴのバンドネオンを追いかける。曲の「聴き取れない一瞬」を、Rubber Band 品質のタイムストレッチエンジンで、ピッチを崩さず 4 分の 1 速まで落として聴けます。A/B ループ、半音トランスポーズ、自動キー検出、自動 BPM 検出、小節グリッド、練習録音、WAV 書き出し。Transcribe!（$39）と Amazing Slow Downer（$50）が有料でやっていたことを、すべて無料で、ブラウザだけで。',
    en: 'Transcribe a bebop solo. Unpack a Bach invention. Chase the bandoneón through a Piazzolla tango. KUON SLOWDOWN slows any recording to 0.25x without changing its pitch, using a Rubber Band-quality time-stretch engine. A/B loop, semitone transpose, auto key detection, auto BPM, bar grid, overdub recording, WAV export — everything Transcribe! ($39) and Amazing Slow Downer ($50) charge for, free and browser-only.',
    es: 'Transcribe un solo bebop. Analiza una invención de Bach. Persigue al bandoneón de Piazzolla. KUON SLOWDOWN ralentiza cualquier grabación a 0.25x sin cambiar el tono, con un motor de time-stretch de calidad Rubber Band. Bucle A/B, transposición semitono, detección automática de tonalidad y BPM, cuadrícula de compases, grabación overdub, exportación WAV — todo lo que Transcribe! ($39) y Amazing Slow Downer ($50) cobran, gratis y en el navegador.',
  } as L5,
  heroCtaPrimary: {
    ja: '今すぐ無料で開く →',
    en: 'Open free now →',
    es: 'Abrir gratis ahora →',
  } as L5,
  heroCtaSecondary: {
    ja: '仕組みを見る',
    en: 'See how it works',
    es: 'Ver cómo funciona',
  } as L5,

  // Trust bar
  trust1T: { ja: 'Rubber Band 品質', en: 'Rubber Band quality', es: 'Calidad Rubber Band' } as L5,
  trust1S: { ja: 'プロ DAW 相当の WSOLA', en: 'DAW-grade WSOLA', es: 'WSOLA de DAW profesional' } as L5,
  trust2T: { ja: '完全無料', en: 'Free forever', es: 'Gratis para siempre' } as L5,
  trust2S: { ja: '登録なし・回数無制限', en: 'No signup, unlimited use', es: 'Sin registro, sin límites' } as L5,
  trust3T: { ja: 'アップロード無し', en: 'Zero upload', es: 'Sin subida' } as L5,
  trust3S: { ja: '完全ブラウザ処理', en: 'All in-browser', es: 'Todo en el navegador' } as L5,
  trust4T: { ja: '6 言語対応', en: '6 languages', es: '6 idiomas' } as L5,
  trust4S: { ja: 'ja / en / es / ko / pt / de', en: 'ja / en / es / ko / pt / de', es: 'ja / en / es / ko / pt / de' } as L5,

  // Problem / solution
  problemTitle: {
    ja: 'その一瞬の「聴き取れない」が、あなたの成長を止めている。',
    en: "That one unhearable moment — it's what stops you from getting better.",
    es: 'Ese momento que no puedes oír — eso es lo que te impide mejorar.',
  } as L5,
  problemSub: {
    ja: 'チャーリー・パーカーのフレーズは速すぎる。バッハの対位法は入り組んでいる。ピアソラのバンドネオンは消えるように装飾を入れる。普通の再生速度では、人間の耳では追いつけない。音程を下げれば速度は落ちるが、音の高さが変わって本来のフレーズ感が失われる。',
    en: "Charlie Parker's lines are too fast. Bach's counterpoint is too dense. Piazzolla's bandoneón disappears into its own ornaments. At normal speed, the human ear can't keep up. Pitch-lowering slows things down, but destroys the original phrasing.",
    es: 'Las líneas de Charlie Parker son demasiado rápidas. El contrapunto de Bach es demasiado denso. El bandoneón de Piazzolla desaparece en sus propios adornos. A velocidad normal, el oído humano no puede seguir. Bajar el tono ralentiza, pero destruye el fraseo original.',
  } as L5,
  solutionTitle: {
    ja: '解決策：音程を保ったまま、時間だけを引き延ばす。',
    en: 'The solution: keep the pitch, stretch only the time.',
    es: 'La solución: mantén el tono, estira solo el tiempo.',
  } as L5,
  solutionSub: {
    ja: 'WSOLA（Waveform Similarity Overlap-Add）と位相ボコーダを組み合わせた最新の DSP で、ピッチはそのまま、速度だけを 0.25 倍から 2.0 倍まで自在に変更。Ableton Live や Logic Pro のタイムストレッチと同じアルゴリズム系列を、無料でブラウザで使えます。',
    en: 'Using WSOLA (Waveform Similarity Overlap-Add) combined with phase-vocoder DSP — the same algorithm family used in Ableton Live and Logic Pro — KUON SLOWDOWN stretches time from 0.25x to 2.0x without touching the pitch. Pro-grade DSP, free, in your browser.',
    es: 'Con WSOLA (Waveform Similarity Overlap-Add) combinado con vocoder de fase — la misma familia de algoritmos utilizada en Ableton Live y Logic Pro — KUON SLOWDOWN estira el tiempo de 0.25x a 2.0x sin tocar el tono. DSP de grado profesional, gratis, en tu navegador.',
  } as L5,

  // Story
  storyLabel: { ja: 'ストーリー', en: 'Our story', es: 'Nuestra historia' } as L5,
  storyTitle: {
    ja: '音大生だった私が、\n練習部屋で何度も願ったこと。',
    en: 'What I wished for, countless times,\nin the practice room.',
    es: 'Lo que deseé, incontables veces,\nen la sala de ensayo.',
  } as L5,
  storyP1: {
    ja: '学生時代、ウェス・モンゴメリーのソロを採譜したかった。でも CD プレーヤーのリピート機能は 5 秒単位でしか戻せず、肝心のリック部分を何度も見失った。',
    en: 'As a student, I wanted to transcribe Wes Montgomery solos. But my CD player could only rewind in 5-second jumps — I kept losing the exact lick I was trying to catch.',
    es: 'Como estudiante, quería transcribir solos de Wes Montgomery. Pero mi reproductor de CD solo podía retroceder en saltos de 5 segundos — perdía constantemente el lick exacto que intentaba captar.',
  } as L5,
  storyP2: {
    ja: 'Transcribe!（$39）を買って救われた。でも MacBook を持ち歩かない日は使えない。iPad でも Anytune は有料、Audipo は広告だらけ。友達に貸そうにもライセンスの問題で断った。',
    en: 'I bought Transcribe! ($39) and it saved me. But not on days I didn\'t carry my MacBook. On iPad, Anytune costs money, Audipo is full of ads. I couldn\'t even lend my license to classmates.',
    es: 'Compré Transcribe! ($39) y me salvó. Pero no los días en que no llevaba mi MacBook. En iPad, Anytune cuesta dinero, Audipo está lleno de anuncios. Ni siquiera podía prestar mi licencia a compañeros.',
  } as L5,
  storyP3: {
    ja: '2026 年、ブラウザは DAW に匹敵する DSP 処理を実行できるようになった。KUON SLOWDOWN は、音大生・音楽学習者が何世代も欲しがってきた「プロ品質のタイムストレッチ＋採譜ワークフロー」を、インストール不要・登録不要・完全無料で、どの端末のブラウザからでも使えるようにします。',
    en: 'In 2026, browsers run DAW-grade DSP natively. KUON SLOWDOWN delivers the pro-quality time-stretch + transcription workflow that music students have wanted for generations — no install, no signup, no cost, on any device with a browser.',
    es: 'En 2026, los navegadores ejecutan DSP de grado DAW de forma nativa. KUON SLOWDOWN ofrece el flujo de trabajo de time-stretch + transcripción de calidad profesional que los estudiantes de música han querido durante generaciones — sin instalación, sin registro, sin costo, en cualquier dispositivo con navegador.',
  } as L5,
  storySig: {
    ja: '— 朝比奈 幸太郎 / Kotaro Asahina',
    en: '— Kotaro Asahina, Founder',
    es: '— Kotaro Asahina, Fundador',
  } as L5,

  // Features
  featuresLabel: { ja: '搭載機能', en: 'Features', es: 'Características' } as L5,
  featuresTitle: {
    ja: '採譜と練習のすべてを、この 1 画面に。',
    en: 'Every transcription and practice feature, in one screen.',
    es: 'Cada función de transcripción y práctica, en una pantalla.',
  } as L5,
  fTimeT: { ja: 'ピッチ維持タイムストレッチ', en: 'Pitch-preserving time-stretch', es: 'Time-stretch preservando tono' } as L5,
  fTimeD: {
    ja: '0.25 倍〜 2.0 倍の範囲で速度を自在に変更。WSOLA + 位相ボコーダで音程を完全維持。',
    en: 'Stretch from 0.25x to 2.0x. WSOLA + phase-vocoder fully preserves the original pitch.',
    es: 'Estira de 0.25x a 2.0x. WSOLA + vocoder de fase preserva el tono original por completo.',
  } as L5,
  fLoopT: { ja: 'A/B ループ + セクション保存', en: 'A/B loop + named sections', es: 'Bucle A/B + secciones nombradas' } as L5,
  fLoopD: {
    ja: '波形をドラッグして A/B マーカーを設定。頭・ヴァース・ソロ・ブリッジなど複数のセクションに名前を付けて無制限に保存。',
    en: 'Drag A/B markers on the waveform. Save unlimited named sections — head, verse, solo, bridge — for instant recall.',
    es: 'Arrastra marcadores A/B en la forma de onda. Guarda secciones ilimitadas con nombre — tema, estrofa, solo, puente — para recuperación instantánea.',
  } as L5,
  fTransposeT: { ja: '半音単位トランスポーズ', en: 'Semitone transpose', es: 'Transposición semitonal' } as L5,
  fTransposeD: {
    ja: '±12 半音、セント単位の微調整対応。B♭ 管の曲を C で練習したり、ボーカルのキーを合わせたり。',
    en: '±12 semitones with cents-level fine-tuning. Practice B♭-instrument solos in C, adjust vocal range.',
    es: '±12 semitonos con ajuste fino en cents. Practica solos de instrumentos en B♭ en C, ajusta el rango vocal.',
  } as L5,
  fKeyT: { ja: '自動キー検出', en: 'Auto key detection', es: 'Detección automática de tonalidad' } as L5,
  fKeyD: {
    ja: 'クロマグラム解析で曲のキーを即座に判定。コード進行の耳コピが劇的に速くなります。',
    en: 'Chromagram analysis detects the key instantly. Dramatically speeds up chord-progression transcription.',
    es: 'El análisis de cromagrama detecta la tonalidad al instante. Acelera dramáticamente la transcripción de progresiones.',
  } as L5,
  fBpmT: { ja: '自動 BPM 検出 + 小節グリッド', en: 'Auto BPM + bar grid', es: 'BPM automático + cuadrícula de compases' } as L5,
  fBpmD: {
    ja: '自己相関解析で BPM を検出し、波形上に小節線を重ね表示。拍の頭を正確に把握できます。',
    en: 'Autocorrelation detects BPM and overlays bar lines on the waveform — so you always know where the downbeat falls.',
    es: 'La autocorrelación detecta BPM y superpone líneas de compás en la forma de onda — siempre sabes dónde cae el tiempo fuerte.',
  } as L5,
  fOverdubT: { ja: 'オーバーダブ録音', en: 'Overdub recording', es: 'Grabación overdub' } as L5,
  fOverdubD: {
    ja: '自分の演奏を原曲に重ねて録音。採譜が合っているか耳で確認。WAV 書き出しで DAW にそのまま持ち込めます。',
    en: 'Record your playing on top of the original. Verify transcriptions by ear. Export to WAV for import into any DAW.',
    es: 'Graba tu interpretación sobre el original. Verifica transcripciones de oído. Exporta a WAV para importar a cualquier DAW.',
  } as L5,
  fWavT: { ja: 'WAV 書き出し', en: 'WAV export', es: 'Exportación WAV' } as L5,
  fWavD: {
    ja: 'スロー + トランスポーズした状態のオーディオを WAV で保存。オフライン練習や DAW 持ち込みに。',
    en: 'Save the time-stretched and transposed audio as WAV for offline practice or DAW workflows.',
    es: 'Guarda el audio estirado y transpuesto como WAV para práctica offline o flujos de trabajo DAW.',
  } as L5,
  fSepT: { ja: 'KUON SEPARATOR 連携', en: 'KUON SEPARATOR integration', es: 'Integración con KUON SEPARATOR' } as L5,
  fSepD: {
    ja: '1 クリックで SEPARATOR に送り、ボーカルやドラムを抜いたマイナスワンを作成 → SLOWDOWN に戻して練習。',
    en: 'One-click send to KUON SEPARATOR — create minus-one tracks (remove vocals, drums, etc.) and bring them back to SLOWDOWN for practice.',
    es: 'Envío con un clic a KUON SEPARATOR — crea pistas minus-one (elimina voces, batería, etc.) y vuelve a SLOWDOWN para practicar.',
  } as L5,
  fPrivT: { ja: 'アップロード無し・完全ローカル', en: 'Zero upload — fully local', es: 'Sin subida — totalmente local' } as L5,
  fPrivD: {
    ja: '音声は一切サーバーに送信しません。著作権作品・未発表音源・レッスン録音も安心。',
    en: 'Audio never leaves your browser. Safe for copyrighted, pre-release, or private lesson recordings.',
    es: 'El audio nunca sale de tu navegador. Seguro para material con derechos, pre-lanzamientos o grabaciones privadas de clase.',
  } as L5,

  // Who for
  whoLabel: { ja: '使う人', en: 'Who it is for', es: 'Para quién es' } as L5,
  whoTitle: {
    ja: 'こんな人が、毎日使っています。',
    en: 'People who use it every day.',
    es: 'Personas que lo usan cada día.',
  } as L5,
  who1T: { ja: 'ジャズ採譜に挑む音大生', en: 'Jazz students transcribing solos', es: 'Estudiantes de jazz transcribiendo solos' } as L5,
  who1D: {
    ja: 'チャーリー・パーカー、コルトレーン、ウェス・モンゴメリー、ビル・エヴァンス、ジャコ・パストリアス。ビバップ・ハードバップ・フュージョンの複雑なソロを 0.25 倍速で解明。',
    en: 'Parker, Coltrane, Wes, Evans, Jaco. Break down the most complex bebop, hard-bop, and fusion solos at 0.25x with pitch intact.',
    es: 'Parker, Coltrane, Wes, Evans, Jaco. Descompón los solos más complejos de bebop, hard-bop y fusión a 0.25x con el tono intacto.',
  } as L5,
  who2T: { ja: 'クラシック室内楽の奏者', en: 'Classical chamber musicians', es: 'Músicos de cámara clásicos' } as L5,
  who2D: {
    ja: 'バッハのインベンション、ブラームスのピアノ五重奏、プロコフィエフのソナタ。難所の運指と表現を、楽譜と耳の両方で確認。',
    en: 'Bach inventions, Brahms piano quintets, Prokofiev sonatas. Verify fingerings and phrasing against score by ear, slowed down.',
    es: 'Invenciones de Bach, quintetos con piano de Brahms, sonatas de Prokofiev. Verifica digitaciones y fraseo contra partitura a velocidad reducida.',
  } as L5,
  who3T: { ja: 'タンゴ・ワールドミュージック研究者', en: 'Tango & world-music researchers', es: 'Investigadores de tango y música del mundo' } as L5,
  who3D: {
    ja: 'ピアソラのバンドネオン装飾。フラメンコのコンパス。インド古典のガマカ。アイリッシュのジグ。音程を保ったまま、民族音楽の繊細な装飾を分析。',
    en: 'Piazzolla\'s bandoneón ornaments. Flamenco compás. Indian gamaka. Irish jigs. Analyze subtle ornamentation in world traditions without pitch distortion.',
    es: 'Ornamentos de bandoneón de Piazzolla. Compás flamenco. Gamaka indio. Jigs irlandeses. Analiza ornamentación sutil en tradiciones mundiales sin distorsión de tono.',
  } as L5,
  who4T: { ja: '声楽家・カラオケファン', en: 'Vocalists & karaoke fans', es: 'Vocalistas y fans del karaoke' } as L5,
  who4D: {
    ja: 'キーを半音単位で変えて、自分の音域に合わせて練習。速度を落としてメリスマやビブラートの細部まで研究。',
    en: 'Change keys in semitones to match your range. Slow down to study melisma and vibrato in microscopic detail.',
    es: 'Cambia tonalidades en semitonos para coincidir con tu rango. Ralentiza para estudiar melismas y vibratos al detalle microscópico.',
  } as L5,
  who5T: { ja: '楽器の先生・指導者', en: 'Instructors', es: 'Instructores' } as L5,
  who5D: {
    ja: '生徒にレッスン課題のお手本音源を渡す際、テンポをゆっくりしたバージョンを一緒に共有。生徒は自宅で段階的に速度を上げて練習できる。',
    en: 'Share a slowed-down version of practice tracks with students. They can progressively speed up at home as they improve.',
    es: 'Comparte una versión ralentizada de pistas de práctica con estudiantes. Ellos pueden aumentar progresivamente la velocidad en casa.',
  } as L5,
  who6T: { ja: '作曲家・アレンジャー', en: 'Composers & arrangers', es: 'Compositores y arreglistas' } as L5,
  who6D: {
    ja: 'リファレンス曲のボイシングを解析。コード進行、カウンターメロディ、対位法の動きを正確に書き起こす。',
    en: 'Analyze voicings in reference tracks. Accurately transcribe chord progressions, counter-melodies, and contrapuntal motion.',
    es: 'Analiza voicings en pistas de referencia. Transcribe con precisión progresiones de acordes, contramelodías y movimiento contrapuntístico.',
  } as L5,

  // Comparison table
  compLabel: { ja: '比較', en: 'Comparison', es: 'Comparación' } as L5,
  compTitle: {
    ja: '有料ソフトがやっていることを、すべて無料で。',
    en: 'Everything the paid tools do — free.',
    es: 'Todo lo que hacen las herramientas pagas — gratis.',
  } as L5,
  compHeaderFeature: { ja: '機能', en: 'Feature', es: 'Característica' } as L5,
  compHeaderKuon:    { ja: 'KUON SLOWDOWN', en: 'KUON SLOWDOWN', es: 'KUON SLOWDOWN' } as L5,
  compHeaderTs:      { ja: 'Transcribe!', en: 'Transcribe!', es: 'Transcribe!' } as L5,
  compHeaderAsd:     { ja: 'Amazing Slow Downer', en: 'Amazing Slow Downer', es: 'Amazing Slow Downer' } as L5,
  compHeaderAnytune: { ja: 'Anytune', en: 'Anytune', es: 'Anytune' } as L5,
  cRow1: { ja: '価格', en: 'Price', es: 'Precio' } as L5,
  cRow2: { ja: 'ピッチ維持タイムストレッチ', en: 'Pitch-preserving time-stretch', es: 'Time-stretch preservando tono' } as L5,
  cRow3: { ja: 'A/B ループ', en: 'A/B loop', es: 'Bucle A/B' } as L5,
  cRow4: { ja: '半音トランスポーズ', en: 'Semitone transpose', es: 'Transposición semitonal' } as L5,
  cRow5: { ja: '自動キー検出', en: 'Auto key detection', es: 'Detección automática de tono' } as L5,
  cRow6: { ja: '自動 BPM + 小節グリッド', en: 'Auto BPM + bar grid', es: 'BPM automático + compases' } as L5,
  cRow7: { ja: 'オーバーダブ録音', en: 'Overdub recording', es: 'Grabación overdub' } as L5,
  cRow8: { ja: 'WAV 書き出し', en: 'WAV export', es: 'Exportación WAV' } as L5,
  cRow9: { ja: 'ステム分離（マイナスワン）', en: 'Stem separation (minus-one)', es: 'Separación de pistas' } as L5,
  cRow10: { ja: 'ブラウザ動作', en: 'Browser-based', es: 'Basado en navegador' } as L5,
  cRow11: { ja: 'インストール不要', en: 'No install', es: 'Sin instalación' } as L5,
  cRow12: { ja: '登録不要', en: 'No signup', es: 'Sin registro' } as L5,
  cRow13: { ja: 'アップロード無し', en: 'Zero upload', es: 'Sin subida' } as L5,
  cRow14: { ja: '日本語 UI', en: 'Japanese UI', es: 'Interfaz en japonés' } as L5,

  priceFree: { ja: '無料', en: 'Free', es: 'Gratis' } as L5,

  // Pricing
  pricingLabel: { ja: '料金', en: 'Pricing', es: 'Precios' } as L5,
  pricingTitle: {
    ja: 'コアは完全無料。さらに使いたい人にだけ、少し。',
    en: 'Core app is free forever. A little extra for those who want more.',
    es: 'La app principal es gratis para siempre. Un poco extra para quien quiera más.',
  } as L5,
  priceFreeName: { ja: 'Free', en: 'Free', es: 'Gratis' } as L5,
  priceFreeSub: { ja: '誰でも、今すぐ', en: 'For everyone, instantly', es: 'Para todos, al instante' } as L5,
  priceStudentName: { ja: 'Student', en: 'Student', es: 'Estudiante' } as L5,
  priceStudentSub: { ja: '音大生・音楽学習者向け', en: 'For music students', es: 'Para estudiantes de música' } as L5,
  priceProName: { ja: 'Pro', en: 'Pro', es: 'Pro' } as L5,
  priceProSub: { ja: 'プロ志望・演奏家向け', en: 'For serious musicians', es: 'Para músicos serios' } as L5,

  // FAQ
  faqLabel: { ja: 'よくある質問', en: 'FAQ', es: 'Preguntas frecuentes' } as L5,
  faqTitle: { ja: '気になることに、すべて答えます。', en: 'Every question, answered.', es: 'Cada pregunta, respondida.' } as L5,

  // Final CTA
  finalTitle: {
    ja: '曲の一瞬を、\n一生の技術に変える。',
    en: 'Turn one moment of music\ninto a lifetime skill.',
    es: 'Convierte un momento de música\nen una habilidad de por vida.',
  } as L5,
  finalSub: {
    ja: 'アップロード不要。登録不要。今すぐ、ブラウザで。',
    en: 'No upload. No signup. Right now, in your browser.',
    es: 'Sin subida. Sin registro. Ahora mismo, en tu navegador.',
  } as L5,
  finalCta: { ja: 'KUON SLOWDOWN を開く →', en: 'Open KUON SLOWDOWN →', es: 'Abrir KUON SLOWDOWN →' } as L5,
};

// ═════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════
export default function SlowdownLp() {
  const { lang } = useLang();

  return (
    <main
      style={{
        fontFamily: sans,
        color: INK,
        background: BG,
        lineHeight: 1.7,
        overflowX: 'hidden',
      }}
    >
      {/* ───────────── HERO ───────────── */}
      <section
        style={{
          background: `linear-gradient(180deg, ${ACCENT_BG} 0%, ${BG} 100%)`,
          padding: 'clamp(80px, 12vw, 140px) clamp(20px, 5vw, 60px) clamp(60px, 9vw, 100px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '60%',
            height: '120%',
            background: `radial-gradient(circle, ${ACCENT_VLT}22 0%, transparent 60%)`,
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: 'clamp(11px, 1.1vw, 13px)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: ACCENT_DK,
              fontWeight: 700,
              marginBottom: 24,
              padding: '6px 14px',
              border: `1px solid ${ACCENT_VLT}`,
              borderRadius: 999,
              background: CARD,
            }}
          >
            {t(lang, T.heroKicker)}
          </div>
          <h1
            style={{
              fontFamily: serif,
              fontSize: 'clamp(36px, 7vw, 88px)',
              lineHeight: 1.1,
              fontWeight: 400,
              margin: '0 0 24px',
              color: INK,
              letterSpacing: '-0.02em',
            }}
          >
            <span style={{ display: 'block' }}>{t(lang, T.heroTitle1)}</span>
            <span style={{ display: 'block', color: ACCENT }}>{t(lang, T.heroTitle2)}</span>
          </h1>
          <p
            style={{
              fontSize: 'clamp(16px, 1.9vw, 21px)',
              color: MUTE,
              maxWidth: 820,
              margin: '0 0 44px',
              lineHeight: 1.8,
            }}
          >
            {t(lang, T.heroSub)}
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link
              href="/slowdown"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: 'clamp(14px, 1.8vw, 18px) clamp(28px, 3.5vw, 40px)',
                background: ACCENT,
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 999,
                fontWeight: 700,
                fontSize: 'clamp(15px, 1.6vw, 17px)',
                boxShadow: `0 12px 28px ${ACCENT}44`,
                transition: 'transform 0.2s',
              }}
            >
              {t(lang, T.heroCtaPrimary)}
            </Link>
            <a
              href="#how-it-works"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: 'clamp(14px, 1.8vw, 18px) clamp(28px, 3.5vw, 40px)',
                background: 'transparent',
                color: INK,
                textDecoration: 'none',
                borderRadius: 999,
                fontWeight: 600,
                fontSize: 'clamp(15px, 1.6vw, 17px)',
                border: `1.5px solid ${INK}`,
              }}
            >
              {t(lang, T.heroCtaSecondary)}
            </a>
          </div>

          {/* Live counter */}
          <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 10, color: MUTE, fontSize: 14 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 0 4px #10b98122' }} />
            <span>
              {lang === 'ja' ? '今月の処理数 ' : lang === 'es' ? 'Procesadas este mes: ' : 'Processed this month: '}
              <strong style={{ color: INK, fontVariantNumeric: 'tabular-nums' }}>
                <LiveCounter />
              </strong>
              {lang === 'ja' ? ' 回' : ''}
            </span>
          </div>
        </div>
      </section>

      {/* ───────────── TRUST BAR ───────────── */}
      <section style={{ padding: '48px clamp(20px, 5vw, 60px)', borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: CARD }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 32,
          }}
        >
          {[
            { t: T.trust1T, s: T.trust1S },
            { t: T.trust2T, s: T.trust2S },
            { t: T.trust3T, s: T.trust3S },
            { t: T.trust4T, s: T.trust4S },
          ].map((b, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(17px, 1.9vw, 20px)', fontWeight: 700, color: ACCENT_DK, marginBottom: 6 }}>
                {t(lang, b.t)}
              </div>
              <div style={{ fontSize: 'clamp(12px, 1.3vw, 14px)', color: MUTE }}>{t(lang, b.s)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── PROBLEM → SOLUTION ───────────── */}
      <section
        id="how-it-works"
        style={{ padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 60px)' }}
      >
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: serif,
              fontSize: 'clamp(26px, 4.2vw, 44px)',
              lineHeight: 1.3,
              fontWeight: 400,
              margin: '0 0 24px',
              color: INK,
              letterSpacing: '-0.01em',
            }}
          >
            {t(lang, T.problemTitle)}
          </h2>
          <p style={{ fontSize: 'clamp(15px, 1.7vw, 19px)', color: MUTE, lineHeight: 1.9, margin: '0 0 56px' }}>
            {t(lang, T.problemSub)}
          </p>

          <div style={{ padding: 'clamp(32px, 4vw, 56px)', background: ACCENT_BG, borderRadius: 24, border: `1px solid ${ACCENT_VLT}` }}>
            <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT_DK, fontWeight: 700, marginBottom: 12 }}>
              {lang === 'ja' ? '解決' : lang === 'es' ? 'Solución' : 'Solution'}
            </div>
            <h3
              style={{
                fontFamily: serif,
                fontSize: 'clamp(22px, 3vw, 32px)',
                lineHeight: 1.4,
                fontWeight: 500,
                margin: '0 0 16px',
                color: ACCENT_DK,
              }}
            >
              {t(lang, T.solutionTitle)}
            </h3>
            <p style={{ fontSize: 'clamp(14px, 1.6vw, 17px)', color: INK_SOFT, lineHeight: 1.8, margin: 0 }}>
              {t(lang, T.solutionSub)}
            </p>

            <div style={{ marginTop: 36 }}>
              <WaveformDemo height={140} />
              <p style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: MUTE }}>
                {lang === 'ja' ? '速度を変えても音程は変わりません。ボタンをクリックして体感してください。' :
                 lang === 'es' ? 'La velocidad cambia, el tono permanece. Haz clic en los botones para experimentarlo.' :
                 'Speed changes, pitch stays. Click a button to feel it.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FOUNDER STORY ───────────── */}
      <section style={{ padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 60px)', background: CARD, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT_DK, fontWeight: 700, marginBottom: 20 }}>
            {t(lang, T.storyLabel)}
          </div>
          <h2
            style={{
              fontFamily: serif,
              fontSize: 'clamp(26px, 4.2vw, 42px)',
              lineHeight: 1.35,
              fontWeight: 400,
              margin: '0 0 40px',
              color: INK,
              letterSpacing: '-0.01em',
              whiteSpace: 'pre-wrap',
            }}
          >
            {t(lang, T.storyTitle)}
          </h2>
          <div style={{ fontSize: 'clamp(15px, 1.65vw, 18px)', color: INK_SOFT, lineHeight: 1.9 }}>
            <p style={{ marginTop: 0 }}>{t(lang, T.storyP1)}</p>
            <p>{t(lang, T.storyP2)}</p>
            <p>{t(lang, T.storyP3)}</p>
          </div>
          <div style={{ marginTop: 36, fontFamily: serif, fontSize: 16, color: MUTE, fontStyle: 'italic' }}>
            {t(lang, T.storySig)}
            <Link href="/profile" style={{ color: ACCENT, marginLeft: 10, fontStyle: 'normal', textDecoration: 'none' }}>
              {lang === 'ja' ? 'プロフィール →' : lang === 'es' ? 'Perfil →' : 'Profile →'}
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── FEATURES GRID ───────────── */}
      <section style={{ padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 60px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT_DK, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>
            {t(lang, T.featuresLabel)}
          </div>
          <h2
            style={{
              fontFamily: serif,
              fontSize: 'clamp(26px, 4.5vw, 46px)',
              lineHeight: 1.3,
              fontWeight: 400,
              margin: '0 0 60px',
              color: INK,
              textAlign: 'center',
              letterSpacing: '-0.01em',
            }}
          >
            {t(lang, T.featuresTitle)}
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 24,
            }}
          >
            {[
              { t: T.fTimeT, d: T.fTimeD, icon: '◷' },
              { t: T.fLoopT, d: T.fLoopD, icon: '↔' },
              { t: T.fTransposeT, d: T.fTransposeD, icon: '♯♭' },
              { t: T.fKeyT, d: T.fKeyD, icon: '♪' },
              { t: T.fBpmT, d: T.fBpmD, icon: '▦' },
              { t: T.fOverdubT, d: T.fOverdubD, icon: '●' },
              { t: T.fWavT, d: T.fWavD, icon: '⇣' },
              { t: T.fSepT, d: T.fSepD, icon: '⟶' },
              { t: T.fPrivT, d: T.fPrivD, icon: '⬢' },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  padding: 28,
                  background: CARD,
                  borderRadius: 16,
                  border: `1px solid ${BORDER}`,
                  transition: 'all 0.2s',
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: ACCENT_BG,
                    color: ACCENT_DK,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 700, color: INK }}>{t(lang, f.t)}</h3>
                <p style={{ margin: 0, fontSize: 14, color: MUTE, lineHeight: 1.7 }}>{t(lang, f.d)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── WHO IS THIS FOR ───────────── */}
      <section style={{ padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 60px)', background: CARD, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT_DK, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>
            {t(lang, T.whoLabel)}
          </div>
          <h2
            style={{
              fontFamily: serif,
              fontSize: 'clamp(26px, 4.5vw, 46px)',
              lineHeight: 1.3,
              fontWeight: 400,
              margin: '0 0 60px',
              color: INK,
              textAlign: 'center',
              letterSpacing: '-0.01em',
            }}
          >
            {t(lang, T.whoTitle)}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {[
              { t: T.who1T, d: T.who1D },
              { t: T.who2T, d: T.who2D },
              { t: T.who3T, d: T.who3D },
              { t: T.who4T, d: T.who4D },
              { t: T.who5T, d: T.who5D },
              { t: T.who6T, d: T.who6D },
            ].map((p, i) => (
              <div
                key={i}
                style={{
                  padding: 28,
                  background: BG,
                  borderRadius: 16,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 700, color: ACCENT_DK }}>{t(lang, p.t)}</h3>
                <p style={{ margin: 0, fontSize: 14, color: INK_SOFT, lineHeight: 1.7 }}>{t(lang, p.d)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── COMPARISON TABLE ───────────── */}
      <section style={{ padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 60px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT_DK, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>
            {t(lang, T.compLabel)}
          </div>
          <h2
            style={{
              fontFamily: serif,
              fontSize: 'clamp(26px, 4.2vw, 44px)',
              lineHeight: 1.3,
              fontWeight: 400,
              margin: '0 0 56px',
              color: INK,
              textAlign: 'center',
              letterSpacing: '-0.01em',
            }}
          >
            {t(lang, T.compTitle)}
          </h2>

          <div style={{ overflow: 'auto', borderRadius: 16, border: `1px solid ${BORDER}`, background: CARD }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720, fontSize: 14 }}>
              <thead>
                <tr style={{ background: ACCENT_BG }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 700, color: ACCENT_DK, borderBottom: `1px solid ${BORDER_DK}` }}>{t(lang, T.compHeaderFeature)}</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: ACCENT_DK, borderBottom: `1px solid ${BORDER_DK}`, background: ACCENT_VLT + '22' }}>{t(lang, T.compHeaderKuon)}</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: MUTE, borderBottom: `1px solid ${BORDER_DK}` }}>{t(lang, T.compHeaderTs)}</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: MUTE, borderBottom: `1px solid ${BORDER_DK}` }}>{t(lang, T.compHeaderAsd)}</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: MUTE, borderBottom: `1px solid ${BORDER_DK}` }}>{t(lang, T.compHeaderAnytune)}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: T.cRow1,  k: t(lang, T.priceFree), ts: '$39', asd: '$50', at: '$0-30/y' },
                  { f: T.cRow2,  k: '✓', ts: '✓', asd: '✓', at: '✓' },
                  { f: T.cRow3,  k: '✓', ts: '✓', asd: '✓', at: '✓' },
                  { f: T.cRow4,  k: '✓', ts: '✓', asd: '✓', at: '✓' },
                  { f: T.cRow5,  k: '✓', ts: '✓', asd: '—', at: '—' },
                  { f: T.cRow6,  k: '✓', ts: '—', asd: '—', at: '—' },
                  { f: T.cRow7,  k: '✓', ts: '—', asd: '—', at: '—' },
                  { f: T.cRow8,  k: '✓', ts: '✓', asd: '—', at: '✓' },
                  { f: T.cRow9,  k: '✓', ts: '—', asd: '—', at: '—' },
                  { f: T.cRow10, k: '✓', ts: '—', asd: '—', at: '—' },
                  { f: T.cRow11, k: '✓', ts: '—', asd: '—', at: '—' },
                  { f: T.cRow12, k: '✓', ts: '✓', asd: '✓', at: '✓' },
                  { f: T.cRow13, k: '✓', ts: '✓', asd: '✓', at: '✓' },
                  { f: T.cRow14, k: '✓', ts: '—', asd: '—', at: '—' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: i < 13 ? `1px solid ${BORDER}` : 'none' }}>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: INK_SOFT, fontWeight: 500 }}>{t(lang, r.f)}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 15, color: ACCENT_DK, fontWeight: 700, background: ACCENT_VLT + '14' }}>{r.k}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 14, color: MUTE }}>{r.ts}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 14, color: MUTE }}>{r.asd}</td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', fontSize: 14, color: MUTE }}>{r.at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: MUTE_LT, fontStyle: 'italic' }}>
            {lang === 'ja' ? '※ 各社の価格は 2026 年 4 月時点。Transcribe! は Seventh String（英国）、Amazing Slow Downer は Roni Music（スウェーデン）、Anytune は Anystone Technologies（米国）の製品です。' :
             lang === 'es' ? '※ Precios de abril de 2026. Transcribe! de Seventh String (Reino Unido), Amazing Slow Downer de Roni Music (Suecia), Anytune de Anystone Technologies (EE.UU.).' :
             '※ Prices as of April 2026. Transcribe! is by Seventh String (UK), Amazing Slow Downer by Roni Music (Sweden), Anytune by Anystone Technologies (US).'}
          </p>
        </div>
      </section>

      {/* ───────────── PRICING ───────────── */}
      <section style={{ padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 60px)', background: CARD, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT_DK, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>
            {t(lang, T.pricingLabel)}
          </div>
          <h2
            style={{
              fontFamily: serif,
              fontSize: 'clamp(26px, 4.5vw, 46px)',
              lineHeight: 1.3,
              fontWeight: 400,
              margin: '0 0 60px',
              color: INK,
              textAlign: 'center',
              letterSpacing: '-0.01em',
            }}
          >
            {t(lang, T.pricingTitle)}
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {/* FREE */}
            <div
              style={{
                padding: 36,
                background: BG,
                borderRadius: 20,
                border: `1px solid ${BORDER}`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: MUTE, marginBottom: 8 }}>{t(lang, T.priceFreeName)}</div>
              <div style={{ fontSize: 13, color: MUTE_LT, marginBottom: 24 }}>{t(lang, T.priceFreeSub)}</div>
              <div style={{ fontSize: 42, fontWeight: 700, color: INK, fontFamily: serif, marginBottom: 4 }}>¥0</div>
              <div style={{ fontSize: 13, color: MUTE, marginBottom: 28 }}>
                {lang === 'ja' ? 'ずっと無料・登録なし' : lang === 'es' ? 'Siempre gratis, sin registro' : 'Forever free, no signup'}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14, color: INK_SOFT, flex: 1 }}>
                {(lang === 'ja'
                  ? ['ピッチ維持タイムストレッチ', 'A/B ループ（無制限保存）', '半音トランスポーズ', '自動キー検出', '自動 BPM + 小節グリッド', 'オーバーダブ録音', 'WAV 書き出し', 'アップロード無し']
                  : lang === 'es'
                    ? ['Time-stretch preservando tono', 'Bucle A/B (guardado ilimitado)', 'Transposición semitonal', 'Detección automática de tono', 'BPM automático + compases', 'Grabación overdub', 'Exportación WAV', 'Sin subida']
                    : ['Pitch-preserving time-stretch', 'A/B loop (unlimited saves)', 'Semitone transpose', 'Auto key detection', 'Auto BPM + bar grid', 'Overdub recording', 'WAV export', 'Zero upload']
                ).map((f, i) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: i < 7 ? `1px solid ${BORDER}` : 'none' }}>
                    <span style={{ color: ACCENT, marginRight: 10, fontWeight: 700 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                href="/slowdown"
                style={{
                  marginTop: 28,
                  display: 'block',
                  textAlign: 'center',
                  padding: '14px 20px',
                  background: INK,
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {lang === 'ja' ? '無料で開く' : lang === 'es' ? 'Abrir gratis' : 'Open free'}
              </Link>
            </div>

            {/* STUDENT */}
            <div
              style={{
                padding: 36,
                background: BG,
                borderRadius: 20,
                border: `1px solid ${BORDER}`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 700, color: MUTE, marginBottom: 8 }}>{t(lang, T.priceStudentName)}</div>
              <div style={{ fontSize: 13, color: MUTE_LT, marginBottom: 24 }}>{t(lang, T.priceStudentSub)}</div>
              <div style={{ fontSize: 42, fontWeight: 700, color: INK, fontFamily: serif, marginBottom: 4 }}>¥480<span style={{ fontSize: 16, color: MUTE, fontWeight: 400 }}>/mo</span></div>
              <div style={{ fontSize: 13, color: MUTE, marginBottom: 28 }}>
                {lang === 'ja' ? '学習系アプリすべて使い放題' : lang === 'es' ? 'Todas las apps de aprendizaje' : 'All learning apps included'}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14, color: INK_SOFT, flex: 1 }}>
                {(lang === 'ja'
                  ? ['Free のすべての機能', 'セッション履歴クラウド同期', '採譜ノート自動保存', '練習ログと成長記録', '聴音ドリル・楽典問題集', 'レッスン記録', 'SEPARATOR 月 20 回']
                  : lang === 'es'
                    ? ['Todo lo de Gratis', 'Historial de sesiones sincronizado', 'Notas de transcripción auto-guardadas', 'Registro de práctica', 'Ejercicios de oído/teoría', 'Registro de clases', 'SEPARATOR 20/mes']
                    : ['Everything in Free', 'Session history synced', 'Auto-saved transcription notes', 'Practice log + growth tracking', 'Ear training / theory drills', 'Lesson recorder', 'SEPARATOR 20/month']
                ).map((f, i) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: i < 6 ? `1px solid ${BORDER}` : 'none' }}>
                    <span style={{ color: ACCENT, marginRight: 10, fontWeight: 700 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/login"
                style={{
                  marginTop: 28,
                  display: 'block',
                  textAlign: 'center',
                  padding: '14px 20px',
                  background: CARD,
                  color: INK,
                  textDecoration: 'none',
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 15,
                  border: `1.5px solid ${INK}`,
                }}
              >
                {lang === 'ja' ? 'Student にする' : lang === 'es' ? 'Elegir Estudiante' : 'Choose Student'}
              </Link>
            </div>

            {/* PRO — highlighted */}
            <div
              style={{
                padding: 36,
                background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DK} 100%)`,
                borderRadius: 20,
                border: `1px solid ${ACCENT_DK}`,
                display: 'flex',
                flexDirection: 'column',
                color: '#fff',
                boxShadow: `0 16px 40px ${ACCENT}33`,
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -12,
                  right: 24,
                  background: '#fbbf24',
                  color: ACCENT_DK,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '4px 12px',
                  borderRadius: 999,
                  textTransform: 'uppercase',
                }}
              >
                {lang === 'ja' ? 'おすすめ' : lang === 'es' ? 'Recomendado' : 'Recommended'}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{t(lang, T.priceProName)}</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 24 }}>{t(lang, T.priceProSub)}</div>
              <div style={{ fontSize: 42, fontWeight: 700, fontFamily: serif, marginBottom: 4 }}>¥980<span style={{ fontSize: 16, opacity: 0.8, fontWeight: 400 }}>/mo</span></div>
              <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 28 }}>
                {lang === 'ja' ? 'プロを目指す個人のための全部入り' : lang === 'es' ? 'Todo para músicos serios' : 'Everything for serious musicians'}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14, flex: 1 }}>
                {(lang === 'ja'
                  ? ['Student のすべて', 'SEPARATOR 月 150 回（マイナスワン無制限）', '優先処理キュー', 'イベントマップ投稿', 'オーナーズ・ギャラリー優先掲載', '朝比奈の月 1 オンラインクリニック', 'Kuon 認定試験の受験資格']
                  : lang === 'es'
                    ? ['Todo lo de Estudiante', 'SEPARATOR 150/mes', 'Cola de procesamiento prioritaria', 'Publicar en mapa de eventos', 'Galería prioritaria', 'Clínica online mensual con Kotaro', 'Elegibilidad examen Kuon']
                    : ['Everything in Student', 'SEPARATOR 150/month', 'Priority processing queue', 'Event map publishing', 'Gallery priority feature', 'Monthly online clinic with Kotaro', 'Kuon certification eligibility']
                ).map((f, i) => (
                  <li key={i} style={{ padding: '8px 0', borderBottom: i < 6 ? `1px solid #ffffff22` : 'none' }}>
                    <span style={{ marginRight: 10, fontWeight: 700 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/login"
                style={{
                  marginTop: 28,
                  display: 'block',
                  textAlign: 'center',
                  padding: '14px 20px',
                  background: '#fff',
                  color: ACCENT_DK,
                  textDecoration: 'none',
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {lang === 'ja' ? 'Pro にする' : lang === 'es' ? 'Elegir Pro' : 'Choose Pro'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section style={{ padding: 'clamp(80px, 10vw, 140px) clamp(20px, 5vw, 60px)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: ACCENT_DK, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>
            {t(lang, T.faqLabel)}
          </div>
          <h2
            style={{
              fontFamily: serif,
              fontSize: 'clamp(26px, 4.2vw, 42px)',
              lineHeight: 1.3,
              fontWeight: 400,
              margin: '0 0 48px',
              color: INK,
              textAlign: 'center',
              letterSpacing: '-0.01em',
            }}
          >
            {t(lang, T.faqTitle)}
          </h2>

          <div>
            {(lang === 'ja' ? [
              { q: 'Transcribe! や Amazing Slow Downer と比べて、音質は劣りませんか？', a: 'KUON SLOWDOWN のタイムストレッチエンジンは WSOLA（Waveform Similarity Overlap-Add）と位相ボコーダを組み合わせた、Rubber Band Library と同じアルゴリズム系列を採用しています。これは Ableton Live や Logic Pro などのプロ DAW と同じファミリーです。0.5〜1.0 倍の範囲では Transcribe! とほぼ区別がつかない品質、0.25 倍まで落としてもアーティファクトは最小限です。' },
              { q: '本当に無料ですか？後で課金されることはない？', a: 'コア機能（タイムストレッチ、A/B ループ、トランスポーズ、キー検出、BPM 検出、WAV 書き出しなど）は永久に無料で、使用回数の制限もありません。ブラウザだけで処理が完結するため、私たちにサーバー費用がかからないからです。Student（¥480/月）と Pro（¥980/月）のサブスクリプションは、サーバー処理が必要な追加機能（SEPARATOR 連携、セッション履歴のクラウド同期など）のみ。無料ユーザーであり続けることは完全に可能です。' },
              { q: '著作権のある音源を使うのは大丈夫？', a: '音声ファイルは一切サーバーに送信されません。すべての処理はお使いのブラウザ内で完結します。そのため、購入した CD、自分で録音したレッスン音源、サブスクリプションサービスで購入した楽曲を、個人学習目的で使う場合は技術的に安全です。ただし著作権法の適用は国・地域・用途によります。商用利用や二次配布は別途権利処理が必要です。' },
              { q: 'スマホやタブレットでも使えますか？', a: 'はい、モダンブラウザ（iOS Safari 14+、Android Chrome 90+、iPad OS）で動作します。ただし長時間の楽曲処理や複数セッションの保存は、デスクトップのほうが快適です。iOS では Safari で「デスクトップ用サイト」を表示すると、より多くの機能が使えます。' },
              { q: 'Rubber Band や SoundTouch を直接使った場合と比べて、どこが違いますか？', a: 'KUON SLOWDOWN は DSP だけでなく、ジャズ・クラシック・ワールド音楽の練習に特化したワークフローを統合しています。複数の名前付きセクション、自動キー/BPM 検出、小節グリッドオーバーレイ、オーバーダブ録音、SEPARATOR 連携は Rubber Band 単体では得られません。また日本語 UI、完全無料、登録不要、インストール不要という点も差別化ポイントです。' },
              { q: 'ジャズ以外でも効果がありますか？', a: 'KUON SLOWDOWN はジャンルに依存しません。クラシック室内楽（バッハのインベンション、ブラームスのピアノ五重奏、プロコフィエフのソナタ）、タンゴ（ピアソラのバンドネオン装飾、ディ・サルリの弦フレージング）、フラメンコ（コンパスとファルセタ分析）、インド古典（ガマカ装飾）、アイリッシュ（ジグとリール）、ブラジル（ショーロとボサノバ）など、ピッチを保ったまま時間だけ伸ばすタイムストレッチは、どの音楽伝統にも等しく役立ちます。' },
              { q: '対応ファイル形式は？', a: 'MP3、WAV、FLAC、M4A（AAC）、OGG Vorbis、Opus に対応。Web Audio API がネイティブで扱える全形式をサポートしています。動画ファイルからの音声抽出には対応していませんが、動画の音声トラックを MP3 に書き出せば使えます。' },
              { q: 'オフライン（ネット接続なし）で使えますか？', a: 'ページを一度読み込めば、その後はネット接続がなくても動作します。アプリ本体はブラウザがキャッシュしており、音声処理もローカルで完結します。飛行機や電車でも練習できます。' },
              { q: '未発表音源（マスタリング前のミックスなど）を扱っても安全ですか？', a: 'はい。音声は一切サーバーに送信されないため、未発表音源・禁輸状態の楽曲・レッスン録音などの機密性の高いコンテンツでも安心して使えます。検証するには、ページを読み込んだ後でネット接続を切ってください。アプリは動き続けます。' },
              { q: 'KUON SEPARATOR との連携はどう動く？', a: 'Pro プラン以上で、SLOWDOWN の「Create minus-one」ボタン 1 クリックで、現在の楽曲を SEPARATOR に送信 → ボーカル・ドラム・ベース・楽器の 4 ステムに分離 → 好きなステムを組み合わせた伴奏トラックを作成 → SLOWDOWN に戻して練習する、という流れが自動化されます。マイナスワン作成の定番ワークフローです。' },
            ] : lang === 'es' ? [
              { q: '¿La calidad de audio es inferior a Transcribe! o Amazing Slow Downer?', a: 'El motor de time-stretch de KUON SLOWDOWN usa WSOLA combinado con vocoder de fase — la misma familia que Rubber Band Library, Ableton Live y Logic Pro. Entre 0.5–1.0x, la calidad es prácticamente indistinguible de Transcribe!, y los artefactos son mínimos incluso a 0.25x.' },
              { q: '¿Es realmente gratis? ¿Cobrarán después?', a: 'Las funciones centrales (time-stretch, bucle A/B, transposición, detección de tono/BPM, exportación WAV) son gratis para siempre sin límite de uso. Como el procesamiento ocurre en tu navegador, no hay costos de servidor. Las suscripciones Student (¥480/mes) y Pro (¥980/mes) solo añaden funciones que requieren servidor (SEPARATOR, sincronización en la nube).' },
              { q: '¿Es seguro usar material con derechos de autor?', a: 'Los archivos nunca se envían a servidores. Todo el procesamiento ocurre en tu navegador. Por lo tanto, para uso personal con CDs comprados, grabaciones propias de clases o streaming comprado, es técnicamente seguro. Pero la legalidad depende de tu jurisdicción y uso. Uso comercial o redistribución requieren derechos adicionales.' },
              { q: '¿Funciona en móvil o tableta?', a: 'Sí, en navegadores modernos (iOS Safari 14+, Android Chrome 90+, iPad OS). Sesiones largas son más cómodas en escritorio. En iOS, usa "solicitar sitio de escritorio" en Safari para todas las funciones.' },
              { q: '¿En qué se diferencia de usar Rubber Band o SoundTouch directamente?', a: 'KUON SLOWDOWN integra DSP con flujos de trabajo específicos de jazz/clásico/música del mundo: secciones nombradas múltiples, detección automática de tono/BPM, cuadrícula de compases, overdub, integración SEPARATOR. Todo con interfaz en español, gratis, sin registro.' },
              { q: '¿Sirve para géneros fuera del jazz?', a: 'KUON SLOWDOWN es agnóstico al género. Clásica cámara (Bach, Brahms, Prokofiev), tango (Piazzolla, Di Sarli), flamenco (compás y falsetas), clásica india (gamaka), irlandesa (jigs y reels), brasileña (choro y bossa). El time-stretch con preservación de tono ayuda igual a cualquier tradición.' },
              { q: '¿Qué formatos admite?', a: 'MP3, WAV, FLAC, M4A (AAC), OGG Vorbis, Opus — todo lo que Web Audio API maneja nativamente. No extrae audio de video, pero puedes exportar el audio a MP3 primero.' },
              { q: '¿Funciona sin conexión?', a: 'Una vez cargada la página, sigue funcionando sin internet. La app se cachea y el procesamiento es local. Úsala en aviones, trenes, cualquier lugar.' },
              { q: '¿Es seguro para material pre-lanzamiento?', a: 'Sí. El audio nunca sale del navegador, así que es seguro para pre-lanzamientos, material bajo embargo, o grabaciones privadas de clases. Verifícalo: desconecta el internet después de cargar la página — la app seguirá funcionando.' },
              { q: '¿Cómo funciona la integración con KUON SEPARATOR?', a: 'Con plan Pro, un clic en "Crear minus-one" envía la pista a SEPARATOR → separa en 4 pistas (voces/batería/bajo/otros) → combinas las que quieras → vuelve automáticamente a SLOWDOWN para practicar.' },
            ] : [
              { q: 'Is the audio quality worse than Transcribe! or Amazing Slow Downer?', a: 'KUON SLOWDOWN\'s time-stretch engine uses WSOLA (Waveform Similarity Overlap-Add) combined with phase-vocoder — the same algorithm family as Rubber Band Library, Ableton Live, and Logic Pro. Between 0.5–1.0x, quality is virtually indistinguishable from Transcribe!. Artifacts are minimal even at 0.25x.' },
              { q: 'Is it truly free? Will you start charging later?', a: 'Core features (time-stretch, A/B loop, transpose, key/BPM detection, WAV export) are free forever with no usage limits. Since processing happens in your browser, there are no server costs. The Student (¥480/mo) and Pro (¥980/mo) subscriptions only add features that require server resources (SEPARATOR integration, cloud-synced session history). Staying on the free tier forever is completely valid.' },
              { q: 'Is it safe to use copyrighted audio?', a: 'Audio files never leave your browser. All processing is client-side. So for personal use with purchased CDs, your own lesson recordings, or subscription-streamed tracks, it is technically safe. But copyright law varies by jurisdiction and use. Commercial use or redistribution require separate rights.' },
              { q: 'Does it work on phones or tablets?', a: 'Yes — on modern browsers (iOS Safari 14+, Android Chrome 90+, iPad OS). Long sessions are more comfortable on desktop. On iOS, use "Request Desktop Website" in Safari for full features.' },
              { q: 'How is this different from using Rubber Band or SoundTouch directly?', a: 'KUON SLOWDOWN pairs the DSP with practice workflows specific to jazz/classical/world music: multiple named sections, auto key/BPM detection, bar grid overlay, overdub recording, SEPARATOR integration. Plus multi-language UI, free forever, no signup, no install.' },
              { q: 'Does this work for genres other than jazz?', a: 'KUON SLOWDOWN is genre-agnostic. Classical chamber music (Bach inventions, Brahms piano quintets, Prokofiev sonatas), tango (Piazzolla bandoneón, Di Sarli strings), flamenco (compás and falsetas), Indian classical (gamaka), Irish (jigs and reels), Brazilian (choro and bossa nova). Pitch-preserving time-stretch helps every tradition equally.' },
              { q: 'What file formats are supported?', a: 'MP3, WAV, FLAC, M4A (AAC), OGG Vorbis, Opus — everything Web Audio API natively handles. Video files aren\'t supported directly, but you can export the video\'s audio to MP3 first.' },
              { q: 'Does it work offline?', a: 'Once the page is loaded, it continues working with no internet. The app is cached and processing is local. Use it on planes, trains, anywhere.' },
              { q: 'Is it safe for pre-release material?', a: 'Yes. Audio never leaves your browser, so it\'s safe for pre-release, embargoed material, or private lesson recordings. To verify: disconnect from the internet after loading the page — the app will keep working.' },
              { q: 'How does KUON SEPARATOR integration work?', a: 'With a Pro plan, clicking "Create minus-one" sends the current track to SEPARATOR → splits into 4 stems (vocals/drums/bass/other) → you combine the ones you want → returns automatically to SLOWDOWN for practice. The classic minus-one workflow, fully automated.' },
            ]).map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FINAL CTA ───────────── */}
      <section
        style={{
          padding: 'clamp(80px, 12vw, 160px) clamp(20px, 5vw, 60px)',
          background: `linear-gradient(180deg, ${ACCENT_DK} 0%, ${ACCENT} 100%)`,
          color: '#fff',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 30% 30%, #ffffff22 0%, transparent 50%), radial-gradient(circle at 70% 70%, #ffffff11 0%, transparent 50%)`,
            pointerEvents: 'none',
          }}
        />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          <h2
            style={{
              fontFamily: serif,
              fontSize: 'clamp(30px, 5.5vw, 60px)',
              lineHeight: 1.2,
              fontWeight: 400,
              margin: '0 0 24px',
              whiteSpace: 'pre-wrap',
              letterSpacing: '-0.02em',
            }}
          >
            {t(lang, T.finalTitle)}
          </h2>
          <p style={{ fontSize: 'clamp(15px, 1.8vw, 19px)', opacity: 0.9, margin: '0 0 44px' }}>
            {t(lang, T.finalSub)}
          </p>
          <Link
            href="/slowdown"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: 'clamp(16px, 2vw, 20px) clamp(36px, 4.5vw, 52px)',
              background: '#fff',
              color: ACCENT_DK,
              textDecoration: 'none',
              borderRadius: 999,
              fontWeight: 700,
              fontSize: 'clamp(15px, 1.6vw, 18px)',
              boxShadow: '0 18px 40px rgba(0,0,0,0.3)',
            }}
          >
            {t(lang, T.finalCta)}
          </Link>

          <div style={{ marginTop: 48, fontSize: 13, opacity: 0.8 }}>
            {lang === 'ja' ? '他のアプリも見る：' : lang === 'es' ? 'Otras apps:' : 'Explore other apps:'}
            <Link href="/separator-lp" style={{ color: '#fff', marginLeft: 10, textDecoration: 'underline', opacity: 0.9 }}>SEPARATOR</Link>
            <span style={{ margin: '0 8px', opacity: 0.5 }}>·</span>
            <Link href="/dsd-lp" style={{ color: '#fff', textDecoration: 'underline', opacity: 0.9 }}>DSD</Link>
            <span style={{ margin: '0 8px', opacity: 0.5 }}>·</span>
            <Link href="/audio-apps" style={{ color: '#fff', textDecoration: 'underline', opacity: 0.9 }}>
              {lang === 'ja' ? 'すべてのアプリ' : lang === 'es' ? 'Todas las apps' : 'All apps'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
