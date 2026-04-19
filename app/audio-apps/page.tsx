'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Design tokens
// ─────────────────────────────────────────────
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const mono  = '"SF Mono", "Fira Code", "Consolas", monospace';

type L5 = Record<Lang, string>;
const t5 = (m: Partial<Record<Lang, string>> & { en: string }, lang: Lang) => m[lang] ?? m.en;

// ─────────────────────────────────────────────
// Tab & Tier definitions
// ─────────────────────────────────────────────
type Tab = 'learn' | 'create' | 'connect';
type Tier = 'open' | 'login' | 'pro';

const TAB_META: Record<Tab, { icon: string; label: L5; accent: string; desc: L5 }> = {
  learn: {
    icon: '🎓',
    label: { ja: 'LEARN', en: 'LEARN', ko: 'LEARN', pt: 'LEARN', es: 'LEARN' },
    accent: '#22c55e',
    desc: {
      ja: '毎日の練習パートナー。あなたの成長を記録し、可視化する。',
      en: 'Your daily practice partner. Record and visualize your growth.',
      ko: '매일의 연습 파트너. 당신의 성장을 기록하고 시각화합니다.',
      pt: 'Seu parceiro de prática diário. Registre e visualize seu crescimento.',
      es: 'Tu compañero de práctica diario. Registra y visualiza tu crecimiento.',
    },
  },
  create: {
    icon: '🎛️',
    label: { ja: 'CREATE', en: 'CREATE', ko: 'CREATE', pt: 'CREATE', es: 'CREATE' },
    accent: '#0284c7',
    desc: {
      ja: 'あなたの音をプロ品質に。録音から配信まで。',
      en: 'Professional quality for your sound. From recording to distribution.',
      ko: '당신의 소리를 프로 품질로. 녹음에서 배포까지.',
      pt: 'Qualidade profissional para seu som. Da gravação à distribuição.',
      es: 'Calidad profesional para tu sonido. De la grabación a la distribución.',
    },
  },
  connect: {
    icon: '🌍',
    label: { ja: 'CONNECT', en: 'CONNECT', ko: 'CONNECT', pt: 'CONNECT', es: 'CONNECT' },
    accent: '#f59e0b',
    desc: {
      ja: '音楽仲間とつながる。共有し、発見する。',
      en: 'Connect with fellow musicians. Share and discover.',
      ko: '음악 동료와 연결하세요. 공유하고 발견하세요.',
      pt: 'Conecte-se com outros músicos. Compartilhe e descubra.',
      es: 'Conéctate con otros músicos. Comparte y descubre.',
    },
  },
};

const TIER_META: Record<Tier, { label: L5; bg: string; color: string; dot: string; desc: L5 }> = {
  open: {
    label: { ja: 'OPEN', en: 'OPEN', ko: 'OPEN', pt: 'OPEN', es: 'OPEN' },
    bg: 'rgba(5,150,105,0.12)', color: '#059669', dot: '#059669',
    desc: {
      ja: 'ログイン不要・無制限',
      en: 'No login · Unlimited',
      ko: '로그인 불필요 · 무제한',
      pt: 'Sem login · Ilimitado',
      es: 'Sin login · Ilimitado',
    },
  },
  login: {
    label: { ja: 'LOGIN', en: 'LOGIN', ko: 'LOGIN', pt: 'LOGIN', es: 'LOGIN' },
    bg: 'rgba(2,132,199,0.12)', color: '#0284c7', dot: '#0284c7',
    desc: {
      ja: '無料登録でデータ蓄積',
      en: 'Free signup · Data saved',
      ko: '무료 가입 · 데이터 저장',
      pt: 'Cadastro grátis · Dados salvos',
      es: 'Registro gratis · Datos guardados',
    },
  },
  pro: {
    label: { ja: 'PRO', en: 'PRO', ko: 'PRO', pt: 'PRO', es: 'PRO' },
    bg: 'rgba(245,158,11,0.12)', color: '#d97706', dot: '#f59e0b',
    desc: {
      ja: 'サーバー処理＋AI分析',
      en: 'Server processing + AI',
      ko: '서버 처리 + AI 분석',
      pt: 'Processamento + IA',
      es: 'Procesamiento + IA',
    },
  },
};

// ─────────────────────────────────────────────
// App data — reorganized by tab + tier
// ─────────────────────────────────────────────
type AppEntry = {
  id: string;
  tab: Tab;
  tier: Tier;
  badge: string;
  name: string;
  tagline: Partial<Record<Lang, string>> & { en: string };
  desc: Partial<Record<Lang, string>> & { en: string };
  href: string;
  accent: string;
  isNew?: boolean;
  isComingSoon?: boolean;
};

const apps: AppEntry[] = [
  // ─── LEARN ───
  {
    id: 'tuner', tab: 'learn', tier: 'open',
    badge: 'YIN', name: 'KUON TUNER PRO',
    tagline: {
      ja: 'あなたの耳は、もっと正確さを求めている。',
      en: 'Your ears deserve better precision.',
      ko: '당신의 귀는 더 정확한 튜너를 원합니다.',
      pt: 'Seus ouvidos merecem mais precisão.',
      es: 'Tus oídos merecen más precisión.',
    },
    desc: {
      ja: 'YINアルゴリズム高精度チューナー。移調楽器対応。ストリーク・アチーブメント・セッション統計。',
      en: 'YIN algorithm precision tuner. Transposing instruments. Streaks, achievements, session stats.',
      ko: 'YIN 알고리즘 고정밀 튜너. 이조 악기 지원. 스트릭, 업적, 세션 통계.',
      pt: 'Afinador de precisão YIN. Instrumentos transpositores. Streaks, conquistas, estatísticas.',
      es: 'Afinador de precisión YIN. Instrumentos transpositores. Rachas, logros, estadísticas.',
    },
    href: '/tuner-lp', accent: '#22c55e', isNew: true,
  },
  {
    id: 'ear-training', tab: 'learn', tier: 'login',
    badge: 'EAR', name: 'KUON EAR TRAINING',
    tagline: {
      ja: '聴音力を鍛える。毎日10分で変わる。',
      en: 'Train your ear. 10 minutes a day changes everything.',
      ko: '청음력을 키우세요. 하루 10분이면 달라집니다.',
      pt: 'Treine seu ouvido. 10 minutos por dia mudam tudo.',
      es: 'Entrena tu oído. 10 minutos al día lo cambian todo.',
    },
    desc: {
      ja: '音程・和音・リズム・旋律の4モード聴音トレーニング。正答率推移を記録。音大受験対策に。',
      en: 'Intervals, chords, rhythm, melody — 4-mode ear training. Track accuracy over time. Exam prep.',
      ko: '음정, 화음, 리듬, 선율 — 4가지 모드 청음 훈련. 정답률 추이 기록. 시험 대비.',
      pt: 'Intervalos, acordes, ritmo, melodia — 4 modos. Acompanhe sua precisão. Preparação para provas.',
      es: 'Intervalos, acordes, ritmo, melodía — 4 modos. Registra tu precisión. Preparación para exámenes.',
    },
    href: '/ear-training', accent: '#8b5cf6', isComingSoon: true,
  },
  {
    id: 'harmony', tab: 'learn', tier: 'pro',
    badge: 'HARMONY', name: 'KUON HARMONY',
    tagline: {
      ja: '和声課題を、AIが採点する。',
      en: 'AI grades your harmony exercises.',
      ko: 'AI가 화성 과제를 채점합니다.',
      pt: 'IA corrige seus exercícios de harmonia.',
      es: 'La IA califica tus ejercicios de armonía.',
    },
    desc: {
      ja: 'バス課題・ソプラノ課題を入力→平行5度・8度・禁則進行を自動検出。芸大和声対応。',
      en: 'Input bass/soprano exercises → auto-detect parallel 5ths/octaves and voice-leading errors.',
      ko: '바스/소프라노 과제 입력 → 병행 5도/8도, 금지 진행 자동 검출.',
      pt: 'Insira exercícios de baixo/soprano → detecção automática de quintas/oitavas paralelas.',
      es: 'Ingresa ejercicios de bajo/soprano → detección automática de quintas/octavas paralelas.',
    },
    href: '/harmony', accent: '#ec4899', isComingSoon: true,
  },
  {
    id: 'sight-reading', tab: 'learn', tier: 'login',
    badge: 'SIGHT', name: 'KUON SIGHT READING',
    tagline: {
      ja: '初見力を、数値で測る。',
      en: 'Measure your sight-reading accuracy.',
      ko: '초견력을 수치로 측정하세요.',
      pt: 'Meça sua precisão de leitura à primeira vista.',
      es: 'Mide tu precisión de lectura a primera vista.',
    },
    desc: {
      ja: 'ランダム旋律を初見で演奏。ピッチ・リズムの正確さをリアルタイム採点。段階的に難易度UP。',
      en: 'Sight-read random melodies. Real-time pitch & rhythm scoring. Progressive difficulty.',
      ko: '랜덤 선율을 초견 연주. 피치와 리듬 정확도를 실시간 채점. 점진적 난이도 상승.',
      pt: 'Leia melodias aleatórias à primeira vista. Pontuação em tempo real. Dificuldade progressiva.',
      es: 'Lee melodías aleatorias a primera vista. Puntuación en tiempo real. Dificultad progresiva.',
    },
    href: '/sight-reading', accent: '#06b6d4', isComingSoon: true,
  },
  {
    id: 'drone', tab: 'learn', tier: 'open',
    badge: 'DRONE', name: 'KUON DRONE',
    tagline: {
      ja: '純正律の響きを、体で覚える。',
      en: 'Feel just intonation in your body.',
      ko: '순정률의 울림을 몸으로 기억하세요.',
      pt: 'Sinta a entonação justa no seu corpo.',
      es: 'Siente la entonación justa en tu cuerpo.',
    },
    desc: {
      ja: '任意の音高で持続音を生成。純正律・平均律ドローン。和音ドローン（完全5度・長3度）対応。',
      en: 'Generate sustained tones at any pitch. Just/equal temperament drones. Chord drones (P5, M3).',
      ko: '임의의 음고로 지속음 생성. 순정률/평균률 드론. 화음 드론 (완전5도, 장3도) 대응.',
      pt: 'Gere tons sustentados em qualquer altura. Drones em temperamento justo/igual. Acordes (P5, M3).',
      es: 'Genera tonos sostenidos en cualquier altura. Drones en temperamento justo/igual. Acordes (P5, M3).',
    },
    href: '/drone', accent: '#14b8a6', isComingSoon: true,
  },
  {
    id: 'metronome', tab: 'learn', tier: 'open',
    badge: 'BPM', name: 'KUON METRONOME',
    tagline: {
      ja: 'テンポの揺れを、検出する。',
      en: 'Detect tempo fluctuations.',
      ko: '템포 흔들림을 감지합니다.',
      pt: 'Detecte flutuações de tempo.',
      es: 'Detecta fluctuaciones de tempo.',
    },
    desc: {
      ja: 'インテリジェントメトロノーム。録音しながら練習するとテンポの揺れを%で表示。拍子変更プログラミング。',
      en: 'Intelligent metronome. Practice while recording — shows tempo fluctuations in %. Time signature programming.',
      ko: '인텔리전트 메트로놈. 녹음하며 연습하면 템포 흔들림을 %로 표시. 박자 변경 프로그래밍.',
      pt: 'Metrônomo inteligente. Pratique gravando — mostra flutuações de tempo em %. Programação de compasso.',
      es: 'Metrónomo inteligente. Practica grabando — muestra fluctuaciones de tempo en %. Programación de compás.',
    },
    href: '/metronome', accent: '#f97316', isComingSoon: true,
  },
  {
    id: 'practice-log', tab: 'learn', tier: 'login',
    badge: 'LOG', name: 'KUON PRACTICE LOG',
    tagline: {
      ja: '4年分の成長が、グラフになる。',
      en: "4 years of growth, in one graph.",
      ko: '4년간의 성장이 그래프가 됩니다.',
      pt: '4 anos de crescimento em um gráfico.',
      es: '4 años de crecimiento en un gráfico.',
    },
    desc: {
      ja: '練習時間・ピッチ精度・テンポ安定性の長期推移を記録。他のKUONアプリと自動連携。成長曲線を可視化。',
      en: 'Track practice time, pitch accuracy, tempo stability over months. Auto-syncs with all KUON apps. Visualize your growth curve.',
      ko: '연습 시간, 피치 정확도, 템포 안정성의 장기 추이를 기록. 다른 KUON 앱과 자동 연동. 성장 곡선을 시각화.',
      pt: 'Registre tempo de prática, precisão de afinação, estabilidade de tempo. Sincroniza com todos os apps KUON.',
      es: 'Registra tiempo de práctica, precisión de afinación, estabilidad de tempo. Sincroniza con todas las apps KUON.',
    },
    href: '/practice-log', accent: '#0ea5e9', isComingSoon: true,
  },

  // ─── CREATE ───
  {
    id: 'master-check', tab: 'create', tier: 'open',
    badge: 'LUFS', name: 'KUON MASTER CHECK',
    tagline: {
      ja: '配信前の最終チェックを、ブラウザだけで。',
      en: 'Pre-release quality check in the browser.',
      ko: '배포 전 최종 체크를 브라우저에서.',
      pt: 'Verificação final pré-lançamento no navegador.',
      es: 'Verificación final previa al lanzamiento en el navegador.',
    },
    desc: {
      ja: 'LUFS・True Peak・クリッピング・ステレオ相関を一括チェック。ワンクリック自動調整＆WAVダウンロード。',
      en: 'Check LUFS, True Peak, clipping, stereo correlation. One-click auto-adjust with limiter & WAV download.',
      ko: 'LUFS, 트루 피크, 클리핑, 스테레오 상관을 일괄 체크. 원클릭 자동 조정 및 WAV 다운로드.',
      pt: 'Verifique LUFS, True Peak, clipping, correlação estéreo. Ajuste automático com limitador e download WAV.',
      es: 'Verifica LUFS, True Peak, clipping, correlación estéreo. Ajuste automático con limitador y descarga WAV.',
    },
    href: '/master-check-lp', accent: '#0284c7',
  },
  {
    id: 'analyzer', tab: 'create', tier: 'open',
    badge: 'FFT', name: 'KUON ANALYZER',
    tagline: {
      ja: 'あなたのミックス、プロと何が違う？',
      en: 'What makes your mix different from the pros?',
      ko: '당신의 믹스, 프로와 뭐가 다를까요?',
      pt: 'O que diferencia seu mix dos profissionais?',
      es: '¿Qué diferencia tu mezcla de los profesionales?',
    },
    desc: {
      ja: 'リアルタイムスペクトラムアナライザー × LUFSメーター。リファレンス比較。マイク入力対応。',
      en: 'Real-time spectrum analyzer × LUFS meter. Reference comparison. Mic input support.',
      ko: '실시간 스펙트럼 분석기 × LUFS 미터. 레퍼런스 비교. 마이크 입력 지원.',
      pt: 'Analisador de espectro × medidor LUFS em tempo real. Comparação de referência. Entrada de microfone.',
      es: 'Analizador de espectro × medidor LUFS. Comparación de referencia. Entrada de micrófono.',
    },
    href: '/analyzer-lp', accent: '#4F46E5',
  },
  {
    id: 'normalize', tab: 'create', tier: 'login',
    badge: 'NORMALIZE', name: 'KUON NORMALIZE',
    tagline: {
      ja: 'ブラウザが、スタジオになる。',
      en: 'Your browser becomes a studio.',
      ko: '브라우저가 스튜디오가 됩니다.',
      pt: 'Seu navegador se torna um estúdio.',
      es: 'Tu navegador se convierte en un estudio.',
    },
    desc: {
      ja: 'ピークノーマライズ・ラウドネス最適化・シグネチャーEQ・ホールリバーブ搭載。マイク購入者特典。',
      en: 'Peak normalize, loudness optimization, signature EQ, hall reverb. Mic owner bonus.',
      ko: '피크 노멀라이즈, 라우드니스 최적화, 시그니처 EQ, 홀 리버브. 마이크 구매자 특전.',
      pt: 'Normalização de picos, otimização de loudness, EQ signature, reverb. Bônus para donos de mic.',
      es: 'Normalización de picos, optimización de loudness, EQ signature, reverb. Bonus para dueños de mic.',
    },
    href: '/normalize-lp', accent: '#059669',
  },
  {
    id: 'resampler', tab: 'create', tier: 'open',
    badge: 'SINC', name: 'KUON RESAMPLER',
    tagline: {
      ja: 'サンプルレート変換に、プロの品質を。',
      en: 'Professional quality for sample rate conversion.',
      ko: '샘플 레이트 변환에 프로 품질을.',
      pt: 'Qualidade profissional para conversão de sample rate.',
      es: 'Calidad profesional para conversión de frecuencia.',
    },
    desc: {
      ja: 'Sinc補間×Kaiser窓。44.1k↔48k↔96k↔192kHz。3段階品質。32-bit float WAV出力。',
      en: 'Sinc interpolation × Kaiser window. 44.1k↔48k↔96k↔192kHz. 3 quality presets. 32-bit float WAV.',
      ko: 'Sinc 보간 × Kaiser 윈도우. 44.1k↔48k↔96k↔192kHz. 3단계 품질. 32-bit float WAV.',
      pt: 'Interpolação Sinc × janela Kaiser. 44.1k↔48k↔96k↔192kHz. 3 presets. WAV 32-bit float.',
      es: 'Interpolación Sinc × ventana Kaiser. 44.1k↔48k↔96k↔192kHz. 3 presets. WAV 32-bit float.',
    },
    href: '/resampler-lp', accent: '#0891B2',
  },
  {
    id: 'converter', tab: 'create', tier: 'open',
    badge: 'MP3', name: 'KUON CONVERTER',
    tagline: {
      ja: 'WAV → MP3。ブラウザで一瞬。',
      en: 'WAV → MP3. Instant in browser.',
      ko: 'WAV → MP3. 브라우저에서 순식간에.',
      pt: 'WAV → MP3. Instantâneo no navegador.',
      es: 'WAV → MP3. Instantáneo en el navegador.',
    },
    desc: {
      ja: '320kbps / 160kbps 高品質変換。サーバー送信なし。マスタリング後のMP3作成に。',
      en: '320kbps / 160kbps high-quality conversion. No server upload. For post-mastering MP3.',
      ko: '320kbps / 160kbps 고품질 변환. 서버 전송 없음. 마스터링 후 MP3 제작에.',
      pt: 'Conversão 320kbps / 160kbps. Sem upload. Para MP3 pós-masterização.',
      es: 'Conversión 320kbps / 160kbps. Sin subir al servidor. Para MP3 post-masterización.',
    },
    href: '/converter', accent: '#0284c7',
  },
  {
    id: 'dsd', tab: 'create', tier: 'open',
    badge: 'DSD', name: 'KUON DSD',
    tagline: {
      ja: 'DSD を、ブラウザで再生する。世界初。',
      en: "Play DSD in your browser. World's first.",
      ko: 'DSD를 브라우저에서 재생. 세계 최초.',
      pt: 'Reproduza DSD no navegador. Primeiro do mundo.',
      es: 'Reproduce DSD en el navegador. Primero en el mundo.',
    },
    desc: {
      ja: 'DSF/DFF → 再生＆WAV変換。DSD64/128/256。Rust WebAssembly駆動。',
      en: 'DSF/DFF → play & WAV conversion. DSD64/128/256. Powered by Rust WebAssembly.',
      ko: 'DSF/DFF → 재생 및 WAV 변환. DSD64/128/256. Rust WebAssembly 구동.',
      pt: 'DSF/DFF → reprodução e conversão WAV. DSD64/128/256. Rust WebAssembly.',
      es: 'DSF/DFF → reproducción y conversión WAV. DSD64/128/256. Rust WebAssembly.',
    },
    href: '/dsd-lp', accent: '#7C3AED',
  },
  {
    id: 'ddp-checker', tab: 'create', tier: 'open',
    badge: 'DDP', name: 'DDP CHECKER',
    tagline: {
      ja: 'DDPの中身を、ブラウザで確認。',
      en: 'Verify DDP contents in your browser.',
      ko: 'DDP 내용을 브라우저에서 확인.',
      pt: 'Verifique conteúdo DDP no navegador.',
      es: 'Verifica contenido DDP en el navegador.',
    },
    desc: {
      ja: 'CDマスタリング用DDP構造検証・トラック試聴・曲間試聴・WAVダウンロード。完全ローカル。',
      en: 'CD mastering DDP verification — track preview, gap listen, WAV download. 100% local.',
      ko: 'CD 마스터링 DDP 구조 검증 · 트랙 시청 · 곡간 시청 · WAV 다운로드. 완전 로컬.',
      pt: 'Verificação DDP para CD — preview de faixas, gap listen, download WAV. 100% local.',
      es: 'Verificación DDP para CD — vista previa, gap listen, descarga WAV. 100% local.',
    },
    href: '/ddp-checker-lp', accent: '#0284c7',
  },
  {
    id: 'noise-reduction', tab: 'create', tier: 'open',
    badge: 'DENOISE', name: 'KUON DENOISE',
    tagline: {
      ja: '定常ノイズをスペクトルから消す。',
      en: 'Erase steady noise from the spectrum.',
      ko: '정상 노이즈를 스펙트럼에서 제거.',
      pt: 'Apague ruído constante do espectro.',
      es: 'Borra ruido constante del espectro.',
    },
    desc: {
      ja: 'スペクトル減算法ノイズリダクション。周波数スペクトル可視化。リアルタイム調整。',
      en: 'Spectral subtraction noise reduction. Frequency spectrum visualization. Real-time adjustment.',
      ko: '스펙트럼 감산법 노이즈 리덕션. 주파수 스펙트럼 시각화. 실시간 조정.',
      pt: 'Redução de ruído por subtração espectral. Visualização de espectro. Ajuste em tempo real.',
      es: 'Reducción de ruido por sustracción espectral. Visualización de espectro. Ajuste en tiempo real.',
    },
    href: '/noise-reduction', accent: '#7C3AED',
  },
  {
    id: 'dual-mono', tab: 'create', tier: 'open',
    badge: 'STEREO', name: 'KUON DUAL',
    tagline: {
      ja: 'モノラルに、広がりを与える。',
      en: 'Give mono a sense of space.',
      ko: '모노에 공간감을 부여합니다.',
      pt: 'Dê amplitude ao mono.',
      es: 'Dale amplitud al mono.',
    },
    desc: {
      ja: 'デュアルモノ or Haas効果＋MS処理による擬似ステレオ変換。ステレオ幅コントロール。',
      en: 'Dual mono or pseudo stereo via Haas effect + M/S processing. Stereo width control.',
      ko: '듀얼 모노 또는 Haas 효과 + MS 처리에 의한 의사 스테레오 변환. 스테레오 폭 제어.',
      pt: 'Dual mono ou pseudo estéreo via efeito Haas + processamento M/S. Controle de largura estéreo.',
      es: 'Dual mono o pseudo estéreo vía efecto Haas + procesamiento M/S. Control de ancho estéreo.',
    },
    href: '/dual-mono', accent: '#D97706',
  },
  {
    id: 'itadaki', tab: 'create', tier: 'login',
    badge: 'DECLIP', name: 'KUON ITADAKI',
    tagline: {
      ja: '失われたピークを、数学的に甦らせる。',
      en: 'Mathematically restore lost peaks.',
      ko: '잃어버린 피크를 수학적으로 복원합니다.',
      pt: 'Restaure matematicamente picos perdidos.',
      es: 'Restaura matemáticamente los picos perdidos.',
    },
    desc: {
      ja: 'エルミートスプライン補間による非対称クリッピング修復エンジン。',
      en: 'Declipping engine using Cubic Hermite Spline interpolation for asymmetric analog distortion.',
      ko: '에르미트 스플라인 보간에 의한 비대칭 클리핑 복구 엔진.',
      pt: 'Motor de restauração usando interpolação Hermite cúbica para distorção analógica assimétrica.',
      es: 'Motor de restauración usando interpolación Hermite cúbica para distorsión analógica asimétrica.',
    },
    href: '/itadaki-lp', accent: '#0099BB',
  },
  {
    id: 'separator', tab: 'create', tier: 'pro',
    badge: 'AI', name: 'KUON SEPARATOR',
    tagline: {
      ja: '音源分離。自分のパートだけ消す。',
      en: 'Source separation. Remove your part only.',
      ko: '음원 분리. 자신의 파트만 제거.',
      pt: 'Separação de fontes. Remova apenas sua parte.',
      es: 'Separación de fuentes. Elimina solo tu parte.',
    },
    desc: {
      ja: 'Demucs v4（Meta AI）による音源分離。ボーカル・ドラム・ベース・その他を分離。伴奏練習に最適。',
      en: 'Source separation powered by Demucs v4 (Meta AI). Separate vocals, drums, bass, other. Perfect for accompaniment practice.',
      ko: 'Demucs v4 (Meta AI) 기반 음원 분리. 보컬, 드럼, 베이스, 기타 분리. 반주 연습에 최적.',
      pt: 'Separação de fontes com Demucs v4 (Meta AI). Separe vocais, bateria, baixo, outros.',
      es: 'Separación de fuentes con Demucs v4 (Meta AI). Separa vocales, batería, bajo, otros.',
    },
    href: '/separator', accent: '#dc2626', isComingSoon: true,
  },

  // ─── CONNECT ───
  {
    id: 'player', tab: 'connect', tier: 'open',
    badge: '24H', name: 'KUON PLAYER',
    tagline: {
      ja: '音声を共有する。24時間で、消える。',
      en: 'Share audio. Gone in 24 hours.',
      ko: '오디오를 공유하세요. 24시간 후 삭제.',
      pt: 'Compartilhe áudio. Some em 24 horas.',
      es: 'Comparte audio. Desaparece en 24 horas.',
    },
    desc: {
      ja: 'MP3アップロード → パスワード付き共有リンク → 24時間自動削除。ストリーミングのみ。',
      en: 'Upload MP3 → password-protected link → auto-deleted in 24h. Streaming only, no downloads.',
      ko: 'MP3 업로드 → 비밀번호 보호 링크 → 24시간 자동 삭제. 스트리밍만 가능.',
      pt: 'Upload MP3 → link protegido → excluído em 24h. Apenas streaming, sem download.',
      es: 'Sube MP3 → enlace protegido → eliminado en 24h. Solo streaming, sin descargas.',
    },
    href: '/player-lp', accent: '#059669',
  },
  {
    id: 'events', tab: 'connect', tier: 'open',
    badge: 'LIVE', name: "TODAY'S LIVE",
    tagline: {
      ja: '世界中のライブを、地図で探す。',
      en: 'Find live music worldwide on a map.',
      ko: '전 세계의 라이브를 지도에서 찾으세요.',
      pt: 'Encontre música ao vivo no mapa mundial.',
      es: 'Encuentra música en vivo en el mapa mundial.',
    },
    desc: {
      ja: '音楽ライブ・コンサート・リサイタルを地図上で探せる。アーティストは無料で集客。ジャンル・日付フィルター。',
      en: 'Discover concerts, recitals, jam sessions on a map. Artists promote for free. Genre & date filters.',
      ko: '콘서트, 리사이틀, 잼 세션을 지도에서 발견. 아티스트는 무료 홍보. 장르 및 날짜 필터.',
      pt: 'Descubra concertos, recitais, jam sessions no mapa. Artistas promovem grátis. Filtros de gênero e data.',
      es: 'Descubre conciertos, recitales, jam sessions en el mapa. Artistas promocionan gratis. Filtros de género y fecha.',
    },
    href: '/events-lp', accent: '#e11d48',
  },
  {
    id: 'soundmap', tab: 'connect', tier: 'open',
    badge: 'EARTH', name: 'SOUND MAP',
    tagline: {
      ja: '地球の音を、聴く。',
      en: 'Listen to the sounds of Earth.',
      ko: '지구의 소리를 들어보세요.',
      pt: 'Ouça os sons da Terra.',
      es: 'Escucha los sonidos de la Tierra.',
    },
    desc: {
      ja: '世界中のフィールドレコーディングを地図上で聴ける。あなたの録音も投稿できる。',
      en: 'Listen to field recordings worldwide on a map. Submit your own recordings too.',
      ko: '전 세계의 필드 레코딩을 지도에서 들을 수 있습니다. 당신의 녹음도 투고 가능.',
      pt: 'Ouça gravações de campo do mundo todo no mapa. Envie suas próprias gravações também.',
      es: 'Escucha grabaciones de campo del mundo en el mapa. Envía tus propias grabaciones también.',
    },
    href: '/soundmap-lp', accent: '#16a34a',
  },
  {
    id: 'gallery', tab: 'connect', tier: 'login',
    badge: 'GALLERY', name: "OWNER'S GALLERY",
    tagline: {
      ja: 'あなたの録音を、世界に聴かせる。',
      en: 'Let the world hear your recordings.',
      ko: '당신의 녹음을 세계에 들려주세요.',
      pt: 'Deixe o mundo ouvir suas gravações.',
      es: 'Deja que el mundo escuche tus grabaciones.',
    },
    desc: {
      ja: 'P-86S / X-86S オーナーの録音ギャラリー。朝比奈幸太郎によるマスタリング処理。投稿パスワード制。',
      en: "P-86S / X-86S owner's recording gallery. Mastered by Kotaro Asahina. Password-protected submissions.",
      ko: 'P-86S / X-86S 오너의 녹음 갤러리. 아사히나 코타로의 마스터링 처리. 투고 비밀번호 제.',
      pt: 'Galeria de gravações dos donos de P-86S / X-86S. Masterizado por Kotaro Asahina.',
      es: 'Galería de grabaciones de propietarios de P-86S / X-86S. Masterizado por Kotaro Asahina.',
    },
    href: '/gallery', accent: '#a855f7',
  },
  {
    id: 'portfolio', tab: 'connect', tier: 'login',
    badge: 'FOLIO', name: 'KUON PORTFOLIO',
    tagline: {
      ja: '演奏履歴を、1つのURLに。',
      en: 'Your performance history, in one URL.',
      ko: '연주 이력을 하나의 URL로.',
      pt: 'Seu histórico de apresentações em uma URL.',
      es: 'Tu historial de interpretaciones en una URL.',
    },
    desc: {
      ja: 'ベスト演奏を公開ページとして整理。音大受験・コンクール・留学オーディションの提出資料に。',
      en: 'Organize your best performances as a public page. For auditions, competitions, and college applications.',
      ko: '베스트 연주를 공개 페이지로 정리. 음대 수험, 콩쿠르, 유학 오디션 제출 자료에.',
      pt: 'Organize suas melhores apresentações como página pública. Para audições, concursos e candidaturas.',
      es: 'Organiza tus mejores interpretaciones como página pública. Para audiciones, concursos y solicitudes.',
    },
    href: '/portfolio', accent: '#0369a1', isComingSoon: true,
  },
];

// ─────────────────────────────────────────────
// Scroll reveal hook
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// App Card component
// ─────────────────────────────────────────────
function AppCard({ app, index, lang }: { app: AppEntry; index: number; lang: Lang }) {
  const ref = useReveal();
  const tm = TIER_META[app.tier];

  const inner = (
    <div
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        background: app.isComingSoon
          ? 'rgba(255,255,255,0.35)'
          : app.isNew
            ? 'rgba(255,255,255,0.75)'
            : 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: app.isNew
          ? `1px solid ${app.accent}40`
          : '1px solid rgba(255,255,255,0.8)',
        boxShadow: app.isNew
          ? `0 4px 20px ${app.accent}15`
          : '0 2px 12px rgba(0,0,0,0.04)',
        padding: 'clamp(20px, 3vw, 28px)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        cursor: app.isComingSoon ? 'default' : 'pointer',
        transition: 'all 0.35s cubic-bezier(0.175,0.885,0.32,1.275)',
        opacity: app.isComingSoon ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        if (!app.isComingSoon) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 16px 40px ${app.accent}20`;
        }
      }}
      onMouseLeave={e => {
        if (!app.isComingSoon) {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = app.isNew
            ? `0 4px 20px ${app.accent}15`
            : '0 2px 12px rgba(0,0,0,0.04)';
        }
      }}
    >
      {/* Top row: badge + tier + NEW/COMING SOON */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 14, flexWrap: 'wrap',
      }}>
        <span style={{
          fontSize: 9, fontWeight: 800, letterSpacing: '0.16em',
          color: app.accent, background: `${app.accent}12`,
          padding: '3px 10px', borderRadius: 50,
          border: `1px solid ${app.accent}25`,
          fontFamily: mono,
        }}>
          {app.badge}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
          color: tm.color, background: tm.bg,
          padding: '3px 10px', borderRadius: 50,
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: '50%',
            background: tm.dot, display: 'inline-block',
          }} />
          {tm.label[lang]}
        </span>
        {app.isNew && (
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.14em',
            color: '#fff',
            background: `linear-gradient(135deg, ${app.accent}, #7C3AED)`,
            padding: '3px 10px', borderRadius: 50,
          }}>
            NEW
          </span>
        )}
        {app.isComingSoon && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
            color: '#94a3b8', background: 'rgba(148,163,184,0.12)',
            padding: '3px 10px', borderRadius: 50,
          }}>
            COMING SOON
          </span>
        )}
      </div>

      {/* Name */}
      <h3 style={{
        fontFamily: sans, fontSize: 'clamp(0.95rem, 2vw, 1.15rem)',
        fontWeight: 700, color: '#111827', margin: '0 0 8px 0',
        letterSpacing: '-0.01em',
      }}>
        {app.name}
      </h3>

      {/* Tagline */}
      <p style={{
        fontFamily: serif,
        fontSize: 'clamp(13px, 1.8vw, 15px)',
        fontWeight: 500, color: '#374151',
        lineHeight: 1.6, margin: '0 0 10px 0',
      }}>
        {t5(app.tagline, lang)}
      </p>

      {/* Description */}
      <p style={{
        fontSize: 'clamp(11px, 1.5vw, 12.5px)',
        color: '#6b7280', lineHeight: 1.7,
        margin: '0 0 16px 0', flex: 1,
      }}>
        {t5(app.desc, lang)}
      </p>

      {/* CTA */}
      {!app.isComingSoon && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{
            fontSize: 12, fontWeight: 600, letterSpacing: '0.06em',
            color: app.accent,
            padding: '6px 16px', borderRadius: 50,
            border: `1px solid ${app.accent}30`,
            background: `${app.accent}08`,
          }}>
            {t5({
              ja: '詳細を見る', en: 'Learn More', ko: '자세히 보기',
              pt: 'Saiba mais', es: 'Ver más',
            }, lang)} →
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={ref}
      className="reveal"
      style={{ transitionDelay: `${index * 0.04}s` }}
    >
      {app.isComingSoon ? (
        <div style={{ height: '100%' }}>{inner}</div>
      ) : (
        <Link href={app.href} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
          {inner}
        </Link>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tier legend component
// ─────────────────────────────────────────────
function TierLegend({ lang }: { lang: Lang }) {
  return (
    <div style={{
      display: 'flex', gap: 'clamp(12px, 3vw, 24px)',
      justifyContent: 'center', flexWrap: 'wrap',
      marginBottom: 'clamp(24px, 5vw, 40px)',
    }}>
      {(['open', 'login', 'pro'] as Tier[]).map(tier => {
        const tm = TIER_META[tier];
        return (
          <div key={tier} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 50,
            background: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.6)',
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
              color: tm.color,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: tm.dot, display: 'inline-block',
              }} />
              {tm.label[lang]}
            </span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>
              {tm.desc[lang]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// Signup CTA Banner
// ─────────────────────────────────────────────
function SignupBanner({ lang }: { lang: Lang }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a, #1e3a5f)',
      borderRadius: 20, padding: 'clamp(32px, 6vw, 48px)',
      textAlign: 'center', marginTop: 'clamp(32px, 6vw, 48px)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(2,132,199,0.15)', filter: 'blur(60px)',
      }} />
      <p style={{
        fontFamily: mono, fontSize: 10, fontWeight: 700,
        letterSpacing: '0.2em', color: '#0284c7',
        marginBottom: 12,
      }}>
        FREE ACCOUNT
      </p>
      <h2 style={{
        fontFamily: serif, fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
        fontWeight: 600, color: '#fff', lineHeight: 1.5,
        marginBottom: 12, letterSpacing: '0.03em',
      }}>
        {t5({
          ja: '無料アカウントで、あなたの成長が記録される。',
          en: 'Free account — your growth gets recorded.',
          ko: '무료 계정으로 당신의 성장이 기록됩니다.',
          pt: 'Conta gratuita — seu crescimento é registrado.',
          es: 'Cuenta gratuita — tu crecimiento queda registrado.',
        }, lang)}
      </h2>
      <p style={{
        fontSize: 'clamp(12px, 2vw, 14px)', color: '#94a3b8',
        lineHeight: 1.7, maxWidth: 480, margin: '0 auto 24px',
      }}>
        {t5({
          ja: '練習記録・聴音スコア・セッション統計——すべてがクラウドに蓄積される。1年後、あなたは自分の成長に驚く。',
          en: 'Practice logs, ear training scores, session stats — everything accumulates in the cloud. In a year, you\'ll be amazed at your own growth.',
          ko: '연습 기록, 청음 점수, 세션 통계 — 모든 것이 클라우드에 축적됩니다. 1년 후, 당신은 자신의 성장에 놀랄 것입니다.',
          pt: 'Registros de prática, pontuações de treinamento auditivo — tudo se acumula na nuvem. Em um ano, você ficará impressionado.',
          es: 'Registros de práctica, puntuaciones de entrenamiento auditivo — todo se acumula en la nube. En un año, te sorprenderás.',
        }, lang)}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/auth/login" style={{
          display: 'inline-block', textDecoration: 'none',
          padding: '12px 32px', borderRadius: 50,
          background: '#0284c7', color: '#fff',
          fontSize: 14, fontWeight: 600, letterSpacing: '0.05em',
          transition: 'all 0.25s',
        }}>
          {t5({
            ja: '無料で始める', en: 'Start Free', ko: '무료로 시작하기',
            pt: 'Começar grátis', es: 'Empezar gratis',
          }, lang)}
        </Link>
        <Link href="/microphone" style={{
          display: 'inline-block', textDecoration: 'none',
          padding: '12px 32px', borderRadius: 50,
          background: 'transparent', color: '#94a3b8',
          fontSize: 14, fontWeight: 500,
          border: '1px solid rgba(148,163,184,0.3)',
          transition: 'all 0.25s',
        }}>
          {t5({
            ja: 'P-86S マイクを見る', en: 'View P-86S Mic', ko: 'P-86S 마이크 보기',
            pt: 'Ver microfone P-86S', es: 'Ver micrófono P-86S',
          }, lang)}
        </Link>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function AudioAppsPage() {
  const { lang } = useLang();
  const [activeTab, setActiveTab] = useState<Tab>('learn');

  const filteredApps = apps.filter(a => a.tab === activeTab);
  const tabMeta = TAB_META[activeTab];

  // Count stats
  const totalApps = apps.length;
  const openApps = apps.filter(a => a.tier === 'open' && !a.isComingSoon).length;
  const comingSoonApps = apps.filter(a => a.isComingSoon).length;

  return (
    <div style={{
      maxWidth: 1100,
      margin: '0 auto',
      padding: 'clamp(24px, 5vw, 60px) clamp(16px, 4vw, 40px)',
    }}>
      {/* ═══════ CSS ═══════ */}
      <style>{`
        .reveal{opacity:0;transform:translateY(24px);transition:opacity .6s ease,transform .6s ease;}
        .reveal.visible{opacity:1;transform:translateY(0);}
        @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .hero-enter-1{animation:fadeIn .7s ease forwards}
        .hero-enter-2{animation:fadeIn .7s .15s ease forwards;opacity:0}
        .hero-enter-3{animation:fadeIn .7s .3s ease forwards;opacity:0}
      `}</style>

      {/* ═══════ HERO ═══════ */}
      <section style={{
        textAlign: 'center',
        paddingTop: 'clamp(32px, 8vw, 80px)',
        paddingBottom: 'clamp(40px, 8vw, 72px)',
      }}>
        {/* Stats pill */}
        <div className="hero-enter-1" style={{
          display: 'inline-flex', gap: 28,
          padding: '12px 28px', borderRadius: 50,
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.8)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          marginBottom: 32,
        }}>
          {[
            { n: totalApps, label: 'TOOLS', color: '#0284c7' },
            { n: openApps, label: t5({ ja: '即使用可', en: 'READY', ko: '즉시 사용', pt: 'PRONTO', es: 'LISTO' }, lang), color: '#059669' },
            { n: comingSoonApps, label: t5({ ja: '開発中', en: 'COMING', ko: '개발 중', pt: 'EM BREVE', es: 'PRÓXIMO' }, lang), color: '#f59e0b' },
          ].map(({ n, label, color }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <div style={{ width: 1, background: 'rgba(0,0,0,0.06)' }} />}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: mono, fontSize: 24, fontWeight: 800, color }}>{n}</div>
                <div style={{ fontSize: 9, color: '#9ca3af', letterSpacing: '0.14em', fontWeight: 600 }}>{label}</div>
              </div>
            </React.Fragment>
          ))}
        </div>

        <h1 className="hero-enter-2" style={{
          fontFamily: serif,
          fontSize: 'clamp(26px, 5.5vw, 48px)',
          fontWeight: 700, lineHeight: 1.3, letterSpacing: '0.03em',
          whiteSpace: 'pre-line', marginBottom: 16,
          background: 'linear-gradient(135deg, #111827 20%, #0284c7 60%, #7C3AED)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {t5({
            ja: '練習する。創る。つながる。',
            en: 'Practice. Create. Connect.',
            ko: '연습하다. 창작하다. 연결하다.',
            pt: 'Praticar. Criar. Conectar.',
            es: 'Practicar. Crear. Conectar.',
          }, lang)}
        </h1>

        <p className="hero-enter-3" style={{
          fontFamily: sans,
          fontSize: 'clamp(13px, 2vw, 16px)', color: '#6b7280',
          lineHeight: 1.8, maxWidth: 520, margin: '0 auto',
        }}>
          {t5({
            ja: '音楽学習者のためのプラットフォーム。\nすべてブラウザで完結。あなたの成長を記録し続ける。',
            en: 'A platform for music learners.\nEverything in your browser. Your growth, continuously recorded.',
            ko: '음악 학습자를 위한 플랫폼.\n모든 것이 브라우저에서 완결. 당신의 성장을 계속 기록합니다.',
            pt: 'Uma plataforma para estudantes de música.\nTudo no navegador. Seu crescimento, continuamente registrado.',
            es: 'Una plataforma para estudiantes de música.\nTodo en el navegador. Tu crecimiento, registrado continuamente.',
          }, lang)}
        </p>
      </section>

      {/* ═══════ TIER LEGEND ═══════ */}
      <TierLegend lang={lang} />

      {/* ═══════ TABS ═══════ */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 0,
        marginBottom: 12,
        background: 'rgba(255,255,255,0.4)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: 16,
        padding: 6,
        border: '1px solid rgba(255,255,255,0.6)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
      }}>
        {(['learn', 'create', 'connect'] as Tab[]).map(tab => {
          const meta = TAB_META[tab];
          const isActive = activeTab === tab;
          const count = apps.filter(a => a.tab === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: 'clamp(12px, 2.5vw, 16px) clamp(16px, 3vw, 24px)',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                fontFamily: sans,
                fontSize: 'clamp(12px, 2vw, 14px)',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.06em',
                color: isActive ? '#fff' : '#6b7280',
                background: isActive
                  ? `linear-gradient(135deg, ${meta.accent}, ${meta.accent}cc)`
                  : 'transparent',
                boxShadow: isActive ? `0 4px 16px ${meta.accent}30` : 'none',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 'clamp(16px, 2.5vw, 20px)' }}>{meta.icon}</span>
              <span>{meta.label[lang]}</span>
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)',
                color: isActive ? '#fff' : '#9ca3af',
                padding: '2px 7px', borderRadius: 50,
                minWidth: 20, textAlign: 'center',
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab description */}
      <p style={{
        textAlign: 'center',
        fontFamily: serif,
        fontSize: 'clamp(13px, 2vw, 15px)',
        color: tabMeta.accent,
        marginBottom: 'clamp(24px, 5vw, 36px)',
        fontWeight: 500,
      }}>
        {tabMeta.desc[lang]}
      </p>

      {/* ═══════ APP GRID ═══════ */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
        gap: 'clamp(12px, 2.5vw, 20px)',
        marginBottom: 'clamp(32px, 6vw, 48px)',
      }}>
        {filteredApps.map((app, i) => (
          <AppCard key={app.id} app={app} index={i} lang={lang} />
        ))}
      </section>

      {/* ═══════ SIGNUP CTA ═══════ */}
      <SignupBanner lang={lang} />

      {/* ═══════ DATA MOAT MESSAGE ═══════ */}
      <div style={{
        textAlign: 'center',
        paddingTop: 'clamp(40px, 8vw, 64px)',
        paddingBottom: 'clamp(24px, 5vw, 40px)',
      }}>
        <p style={{
          fontFamily: serif,
          fontSize: 'clamp(14px, 2.5vw, 18px)',
          color: '#9ca3af',
          lineHeight: 1.8,
          maxWidth: 500,
          margin: '0 auto',
        }}>
          {t5({
            ja: '他のアプリに乗り換えても、\nここに蓄積された練習記録と成長曲線は、\n持っていけない。',
            en: "Even if you switch to another app,\nyou can't take your practice history\nand growth curve with you.",
            ko: '다른 앱으로 바꿔도,\n여기에 축적된 연습 기록과 성장 곡선은\n가져갈 수 없습니다.',
            pt: 'Mesmo se mudar para outro app,\nvocê não pode levar seu histórico de\nprática e curva de crescimento.',
            es: 'Aunque cambies de app,\nno puedes llevarte tu historial de\npráctica y curva de crecimiento.',
          }, lang)}
        </p>
      </div>
    </div>
  );
}
