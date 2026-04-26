'use client';

// ─────────────────────────────────────────────
// KUON DRUM MACHINE — Landing Page
// ─────────────────────────────────────────────

import React from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';
import { PATTERNS } from '@/app/lib/drum/patterns';
import { AVAILABLE_KITS, COMING_SOON_KITS, KITS } from '@/app/lib/drum/kits';

const serif = '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif';
const sans = '"Helvetica Neue",Arial,sans-serif';
const mono = '"SF Mono","Fira Code","Consolas",monospace';

const NAVY = '#0a1226';
const ROSE_GOLD = '#e8b8a0';
const ACCENT = '#0284c7';

type L5 = Partial<Record<Lang, string>> & { en: string };
const t5 = (m: L5, l: Lang) => m[l] ?? m.en;

const ALL_CULTURES = ['cuban', 'brazilian', 'argentinian', 'spanish', 'westafrican', 'indian', 'middleeastern', 'balkan', 'jamaican', 'japanese', 'korean', 'gamelan'] as const;

const ADVANTAGES: { num: string; title: L5; desc: L5 }[] = [
  {
    num: '01',
    title: { ja: '世界 12 文化圏 300+ パターン', en: '12 Cultures, 300+ Patterns', es: '12 Culturas, 300+ Patrones', ko: '12 문화권 300+ 패턴', pt: '12 Culturas, 300+ Padrões', de: '12 Kulturen, 300+ Patterns' },
    desc: { ja: '巷のドラムマシンは西洋偏重。Kuon はキューバ・ブラジル・タンゴ・フラメンコ・バルカン・西アフリカ・インド・中東・日本の和太鼓まで網羅。', en: 'Other drum machines = Western-only. Kuon covers Cuba, Brazil, Tango, Flamenco, Balkan, West Africa, India, Middle East, Japanese taiko, and more.', es: 'Otros se centran en lo occidental. Kuon cubre Cuba, Brasil, Tango, Flamenco, Balcanes, África Occidental, India, Medio Oriente, taiko japonés y más.', ko: '서양 편중을 넘어 12 문화권.', pt: 'Vai além do ocidental: 12 culturas.', de: 'Über westlich hinaus: 12 Kulturen.' },
  },
  {
    num: '02',
    title: { ja: 'ジャンル別キット自動切替', en: 'Auto Kit-Switching per Genre', es: 'Cambio Auto de Kit', ko: '장르별 키트 자동 전환', pt: 'Troca Auto de Kit', de: 'Auto-Kit-Wechsel' },
    desc: { ja: 'ジャズ→Brush Snare+Ride、サンバ→Surdo+Pandeiro、フラメンコ→Cajón+Palmas。ジャンル選択で打楽器構成自体が変わる。', en: 'Jazz → Brush Snare + Ride. Samba → Surdo + Pandeiro. Flamenco → Cajón + Palmas. Genre selection changes the entire instrument set.', es: 'Jazz → Brush + Ride. Samba → Surdo + Pandeiro. Flamenco → Cajón + Palmas.', ko: '장르별 타악기 구성 변경.', pt: 'Conjunto de instrumentos muda por gênero.', de: 'Instrument-Set ändert sich pro Genre.' },
  },
  {
    num: '03',
    title: { ja: '4/4 から 21/16 まで全拍子対応', en: 'All Time Sigs: 4/4 to 21/16', es: '4/4 a 21/16', ko: '4/4부터 21/16까지', pt: '4/4 até 21/16', de: '4/4 bis 21/16' },
    desc: { ja: '他社は 4/4・3/4 のみが大半。Kuon は 5/4・7/4・5/8・7/8・11/8・12/8・15/16 まで対応 = バルカン・インド・スペインのリアルなリズム再現。', en: 'Most others: 4/4 only. Kuon: 5/4, 7/4, 5/8, 7/8, 11/8, 12/8, 15/16 — Balkan, Indian, Spanish rhythms reproducible authentically.', es: '5/4, 7/4, 5/8, 7/8, 11/8, 12/8, 15/16.', ko: '5/4, 7/4, 5/8, 7/8, 11/8, 12/8.', pt: '5/4, 7/4, 5/8, 7/8, 11/8, 12/8.', de: '5/4, 7/4, 5/8, 7/8, 11/8, 12/8.' },
  },
  {
    num: '04',
    title: { ja: 'ポリリズム・クロスリズム', en: 'Polyrhythm + Cross-Rhythm', es: 'Polirritmia + Polirritmo', ko: '폴리리듬', pt: 'Polirritmia', de: 'Polyrhythmus' },
    desc: { ja: '各トラック独立ステップ数。3:4・5:7・2:3 のクロスリズム (西アフリカ・インドで頻出) が一発で組める。', en: 'Each voice independent step count. Cross-rhythms 3:4, 5:7, 2:3 (frequent in West African / Indian music) build in one click.', es: 'Cada voz pasos independientes.', ko: '각 보이스 독립 스텝.', pt: 'Cada voz passos independentes.', de: 'Jede Stimme unabhängige Schritte.' },
  },
  {
    num: '05',
    title: { ja: 'MIDI エクスポート', en: 'MIDI Export', es: 'Exportar MIDI', ko: 'MIDI 내보내기', pt: 'Exportar MIDI', de: 'MIDI-Export' },
    desc: { ja: '他社の多くは WAV のみ。Kuon は MIDI 出力で Logic / Pro Tools / Ableton / FL Studio / Cubase / GarageBand に直接持ち込める。', en: 'Most others: WAV only. Kuon exports MIDI for Logic, Pro Tools, Ableton, FL Studio, Cubase, GarageBand.', es: 'Exporta MIDI para tu DAW.', ko: 'MIDI 출력으로 DAW 연계.', pt: 'Exporta MIDI para seu DAW.', de: 'MIDI-Export für dein DAW.' },
  },
  {
    num: '06',
    title: { ja: 'ステム分離 WAV', en: 'Stem Separation WAV', es: 'Stems WAV', ko: '스템 분리 WAV', pt: 'Stems WAV', de: 'Stem-Trennung WAV' },
    desc: { ja: '各トラック別 WAV (Kick.wav / Snare.wav / Hat.wav…) を ZIP 一括書き出し → DAW でミックス自由自在。', en: 'Per-voice WAV files (Kick.wav, Snare.wav, etc.) in a ZIP — mix freely in your DAW.', es: 'WAV por voz para mezclar libremente.', ko: '보이스별 WAV.', pt: 'WAV por voz.', de: 'WAV pro Stimme.' },
  },
  {
    num: '07',
    title: { ja: 'サンプル不要・80KB 起動', en: 'No Samples, 80KB Load', es: 'Sin Samples, 80KB', ko: '샘플 불필요, 80KB', pt: 'Sem Samples, 80KB', de: 'Ohne Samples, 80KB' },
    desc: { ja: '完全シンセシス。サンプル方式の他社は 50〜200MB ロード。Kuon は瞬時起動・著作権完全クリア・低速回線でも動作。', en: 'Pure synthesis. Sample-based competitors: 50-200MB. Kuon: instant load, copyright-clear, works on slow networks.', es: 'Síntesis pura. Carga instantánea.', ko: '완전 합성. 즉시 로드.', pt: 'Síntese pura.', de: 'Reine Synthese.' },
  },
  {
    num: '08',
    title: { ja: 'URL でパターン共有', en: 'Share via URL', es: 'Compartir por URL', ko: 'URL 공유', pt: 'Compartilhar URL', de: 'Per URL teilen' },
    desc: { ja: '全設定を URL に圧縮 → Twitter / LINE で「俺のサンバ → kuon-rnd.com/drum?p=xyz」で共有一発。アカウント不要。', en: 'All settings encoded into a URL. Share "my samba → kuon-rnd.com/drum?p=xyz" on Twitter/LINE in one click. No account needed.', es: 'Comparte por URL en un clic.', ko: 'URL로 한 번에 공유.', pt: 'Compartilhe por URL.', de: 'In einem Klick per URL teilen.' },
  },
  {
    num: '09',
    title: { ja: '各パターンに楽典解説', en: 'Theory Notes per Pattern', es: 'Notas Teóricas', ko: '패턴별 이론 설명', pt: 'Notas Teóricas', de: 'Theorie-Notizen' },
    desc: { ja: '「ソンクラベは 3-2 と 2-3 で曲頭が決まる」「ハバネラは 19 世紀キューバから輸入」など、文化背景・楽典・代表曲を併記。', en: '"Son clave 3-2 vs 2-3 dictates song direction." "Habanera was imported from 19th-century Cuba." Cultural context, theory, and famous songs included.', es: 'Contexto cultural, teoría y canciones famosas.', ko: '문화 배경·이론·대표곡 병기.', pt: 'Contexto, teoria, canções famosas.', de: 'Kontext, Theorie, berühmte Lieder.' },
  },
  {
    num: '10',
    title: { ja: '練習モード (METRONOME とは別軸)', en: 'Practice Modes', es: 'Modos de Práctica', ko: '연습 모드', pt: 'Modos de Prática', de: 'Übungsmodi' },
    desc: { ja: 'クラベ消し・ダウンビート消し・裏拍だけ・ジャンル切替トレーナー。METRONOME が「拍訓練」、DRUM MACHINE は「演奏応答訓練」。', en: 'Clave-mute / downbeat-mute / offbeat-only / genre-switch trainer. METRONOME = beat training; DRUM MACHINE = response training.', es: 'Modos de respuesta. Diferente del METRONOME.', ko: '연주 응답 훈련.', pt: 'Treinamento de resposta.', de: 'Antwort-Training.' },
  },
  {
    num: '11',
    title: { ja: '統合ワークフロー', en: 'Integrated Workflow', es: 'Flujo Integrado', ko: '통합 워크플로우', pt: 'Fluxo Integrado', de: 'Integrierter Workflow' },
    desc: { ja: 'ジャンル選択 → パターン選択 → BPM 調整 → 録音時 METRONOME と同期 → WAV/MIDI/ステム書き出し → KUON DAW (将来) で多重録音。Kuon エコシステム内で一気通貫。', en: 'Genre → Pattern → BPM → sync with METRONOME → WAV/MIDI/stems → KUON DAW (future) multitrack. End-to-end in Kuon ecosystem.', es: 'Flujo de extremo a extremo en el ecosistema Kuon.', ko: 'Kuon 생태계 내 일관 흐름.', pt: 'Fluxo integrado no ecossistema Kuon.', de: 'Durchgängiger Workflow im Kuon-Ökosystem.' },
  },
  {
    num: '12',
    title: { ja: 'オフライン・プライバシー・教育機関対応', en: 'Offline + Privacy + Schools', es: 'Offline + Privacidad', ko: '오프라인 + 프라이버시', pt: 'Offline + Privacidade', de: 'Offline + Datenschutz' },
    desc: { ja: 'PWA でオフライン全機能・サーバー送信ゼロ・広告ゼロ。音大の練習室・教室・YouTube 配信中でも安心。', en: 'PWA offline / zero server transmission / zero ads. Safe in conservatory practice rooms, classrooms, YouTube streams.', es: 'PWA offline. Cero anuncios.', ko: '오프라인 PWA. 광고 제로.', pt: 'PWA offline. Sem anúncios.', de: 'Offline-PWA. Keine Werbung.' },
  },
];

const COMPARISON_ROWS: { feature: L5; kuon: string; others: string }[] = [
  {
    feature: { ja: '世界の民族リズム', en: 'World ethnic rhythms', es: 'Ritmos étnicos', ko: '세계 민족 리듬', pt: 'Ritmos étnicos', de: 'Ethnische Rhythmen' },
    kuon: '300+ (12 文化圏)', others: '0 〜数個',
  },
  {
    feature: { ja: '拍子対応', en: 'Time signatures', es: 'Compases', ko: '박자', pt: 'Compassos', de: 'Taktarten' },
    kuon: '4/4〜21/16', others: '4/4 のみ',
  },
  {
    feature: { ja: 'ポリリズム', en: 'Polyrhythm', es: 'Polirritmia', ko: '폴리리듬', pt: 'Polirritmia', de: 'Polyrhythmus' },
    kuon: '✅ 各トラック独立', others: '❌',
  },
  {
    feature: { ja: 'MIDI 出力', en: 'MIDI export', es: 'Exportar MIDI', ko: 'MIDI 출력', pt: 'Exportar MIDI', de: 'MIDI-Export' },
    kuon: '✅', others: '❌',
  },
  {
    feature: { ja: 'ステム WAV', en: 'Stem WAV', es: 'Stems WAV', ko: '스템 WAV', pt: 'Stems WAV', de: 'Stem-WAV' },
    kuon: '✅ 各ボイス別', others: '❌ ミックスのみ',
  },
  {
    feature: { ja: '初回ロード', en: 'Initial load', es: 'Carga inicial', ko: '초기 로드', pt: 'Carga inicial', de: 'Erste Last' },
    kuon: '< 80KB (合成)', others: '50-200MB (サンプル)',
  },
  {
    feature: { ja: 'URL 共有', en: 'URL share', es: 'URL compartir', ko: 'URL 공유', pt: 'URL compartilhar', de: 'URL teilen' },
    kuon: '✅ 全設定圧縮', others: '❌ アカウント必須',
  },
  {
    feature: { ja: 'パターン解説', en: 'Pattern notes', es: 'Notas', ko: '패턴 설명', pt: 'Notas', de: 'Pattern-Notizen' },
    kuon: '✅ 文化・楽典・代表曲', others: '❌',
  },
  {
    feature: { ja: 'ログイン', en: 'Signup', es: 'Registro', ko: '로그인', pt: 'Cadastro', de: 'Anmeldung' },
    kuon: '不要', others: '多くで必須',
  },
  {
    feature: { ja: '広告', en: 'Ads', es: 'Anuncios', ko: '광고', pt: 'Anúncios', de: 'Werbung' },
    kuon: 'なし', others: 'あり',
  },
  {
    feature: { ja: '価格', en: 'Price', es: 'Precio', ko: '가격', pt: 'Preço', de: 'Preis' },
    kuon: '完全無料', others: '無料 〜 月額有料',
  },
];

export default function DrumLpPage() {
  const { lang } = useLang();

  return (
    <div style={{ background: NAVY, color: '#e2e8f0', fontFamily: sans, minHeight: '100vh' }}>
      {/* HERO */}
      <section style={{
        padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 4%, 2rem)',
        textAlign: 'center', maxWidth: 1200, margin: '0 auto',
        background: `radial-gradient(ellipse at top, rgba(232,184,160,0.15), transparent 60%)`,
      }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.25em', color: ROSE_GOLD, marginBottom: 16 }}>
          KUON DRUM MACHINE
        </div>
        <h1 style={{
          fontFamily: serif, fontSize: 'clamp(2rem, 6vw, 4.5rem)', fontWeight: 400,
          margin: '0 0 1.5rem', lineHeight: 1.2, color: '#fff', letterSpacing: '0.02em',
        }}>
          {t5({
            ja: '世界のリズムを、\nブラウザで叩く。',
            en: 'Beat the world\'s rhythms,\nin your browser.',
            es: 'Toca los ritmos del mundo\nen tu navegador.',
            ko: '세계의 리듬을\n브라우저에서.',
            pt: 'Toque os ritmos do mundo\nno navegador.',
            de: 'Schlage die Rhythmen der Welt\nim Browser.',
          }, lang).split('\n').map((line, i) => (
            <span key={i} style={{ display: 'block' }}>{line}</span>
          ))}
        </h1>
        <p style={{
          fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: '#cbd5e1',
          maxWidth: 720, margin: '0 auto 2.5rem', lineHeight: 1.8,
        }}>
          {t5({
            ja: 'キューバのクラベから、バルカンの 11/8、ガムラン、阿波踊りまで。300+ の本物リズムを、サンプル不要・登録不要で。MIDI で持ち帰って、あなたの楽曲に。',
            en: 'From Cuban clave to Balkan 11/8, gamelan, Awa Odori. 300+ authentic rhythms, no samples, no signup. Export MIDI to bring into your music.',
            es: 'Desde la clave cubana hasta el 11/8 balcánico, gamelán, Awa Odori. 300+ ritmos auténticos. Exporta MIDI a tu música.',
            ko: '쿠바 클라베부터 발칸 11/8, 가믈란, 아와 오도리까지. 300+ 진짜 리듬.',
            pt: 'Da clave cubana ao 11/8 balcânico, gamelão. 300+ ritmos autênticos.',
            de: 'Von kubanischer Clave bis Balkan 11/8, Gamelan. 300+ authentische Rhythmen.',
          }, lang)}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/drum" style={{
            padding: '14px 32px', borderRadius: 8, background: ROSE_GOLD, color: NAVY,
            fontWeight: 700, fontSize: 14, letterSpacing: '0.05em', textDecoration: 'none',
          }}>
            ▶ {t5({ ja: '今すぐ叩く', en: 'Start Now', es: 'Empezar', ko: '시작하기', pt: 'Começar', de: 'Loslegen' }, lang)}
          </Link>
          <Link href="#advantages" style={{
            padding: '14px 32px', borderRadius: 8, background: 'transparent', color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)', fontWeight: 500, fontSize: 14, textDecoration: 'none',
          }}>
            {t5({ ja: '12 の優位性を見る ↓', en: 'See 12 Advantages ↓', es: 'Ver Ventajas ↓', ko: '12 가지 우위 ↓', pt: 'Ver Vantagens ↓', de: '12 Vorteile sehen ↓' }, lang)}
          </Link>
        </div>
      </section>

      {/* TRUST BAR */}
      <section style={{ padding: '32px clamp(1rem, 4%, 2rem)', borderTop: '1px solid rgba(232,184,160,0.15)', borderBottom: '1px solid rgba(232,184,160,0.15)', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, textAlign: 'center' }}>
          {[
            { num: `${PATTERNS.length}+`, label: { ja: 'パターン', en: 'patterns', es: 'patrones', ko: '패턴', pt: 'padrões', de: 'Patterns' } },
            { num: '12', label: { ja: '文化圏', en: 'cultures', es: 'culturas', ko: '문화권', pt: 'culturas', de: 'Kulturen' } },
            { num: '7', label: { ja: '拍子', en: 'time sigs', es: 'compases', ko: '박자', pt: 'compassos', de: 'Taktarten' } },
            { num: '< 80KB', label: { ja: 'ロード', en: 'load', es: 'carga', ko: '로드', pt: 'carga', de: 'Last' } },
            { num: '¥0', label: { ja: '永年無料', en: 'forever free', es: 'siempre gratis', ko: '영구 무료', pt: 'sempre grátis', de: 'kostenlos' } },
            { num: '6', label: { ja: '言語', en: 'languages', es: 'idiomas', ko: '언어', pt: 'idiomas', de: 'Sprachen' } },
          ].map((item, i) => (
            <div key={i}>
              <div style={{ fontFamily: serif, fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: ROSE_GOLD, fontWeight: 400 }}>{item.num}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', letterSpacing: '0.05em', marginTop: 4 }}>{t5(item.label, lang)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* METRONOME COMPARISON */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 4%, 2rem)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.2em', color: ROSE_GOLD, marginBottom: 8 }}>
            {t5({ ja: 'メトロノームとの違い', en: 'vs METRONOME', es: 'vs METRONOME', ko: 'vs METRONOME', pt: 'vs METRONOME', de: 'vs METRONOME' }, lang)}
          </div>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 400, color: '#fff', margin: '0 0 12px' }}>
            {t5({ ja: '拍を学んだら、グルーヴを身につける。', en: 'After mastering the beat, master the groove.', es: 'Domina el pulso, luego el groove.', ko: '박자 다음은 그루브.', pt: 'Após o pulso, o groove.', de: 'Nach dem Puls der Groove.' }, lang)}
          </h2>
          <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            {t5({ ja: 'METRONOME と DRUM MACHINE は完全な役割分離。両方を持つ理由が一発で伝わる階段構造。', en: 'METRONOME and DRUM MACHINE are completely separate. The staircase from one to the other is clear.', es: 'METRONOME y DRUM MACHINE están completamente separados.', ko: 'METRONOME와 DRUM MACHINE은 완전 분리.', pt: 'METRONOME e DRUM MACHINE são separados.', de: 'METRONOME und DRUM MACHINE sind getrennt.' }, lang)}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          <div style={{ padding: 24, borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid #1e293b' }}>
            <div style={{ fontFamily: mono, fontSize: 11, color: '#0284c7', marginBottom: 8 }}>KUON METRONOME</div>
            <h3 style={{ fontFamily: serif, fontSize: '1.25rem', margin: '0 0 12px', color: '#fff', fontWeight: 400 }}>
              {t5({ ja: '正確な拍を出す訓練装置', en: 'Beat training device', es: 'Dispositivo de entrenamiento de pulso', ko: '박자 훈련 장치', pt: 'Dispositivo de pulso', de: 'Beat-Trainingsgerät' }, lang)}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#cbd5e1', fontSize: 13, lineHeight: 1.8 }}>
              <li>· 1 ボイス (Click)</li>
              <li>· {t5({ ja: 'テンポ正確性に集中', en: 'Tempo accuracy focus', es: 'Precisión de tempo', ko: '템포 정확성', pt: 'Precisão de tempo', de: 'Tempo-Genauigkeit' }, lang)}</li>
              <li>· {t5({ ja: '全楽器の練習者向け', en: 'For all instrumentalists', es: 'Para todos los instrumentistas', ko: '모든 악기 연주자', pt: 'Para todos instrumentistas', de: 'Für alle Instrumentalisten' }, lang)}</li>
              <li>· {t5({ ja: '練習を「補助」する', en: 'Assists practice', es: 'Asiste práctica', ko: '연습 보조', pt: 'Auxilia prática', de: 'Unterstützt Übung' }, lang)}</li>
            </ul>
            <Link href="/metronome-lp" style={{ display: 'inline-block', marginTop: 16, color: '#38bdf8', fontSize: 12, textDecoration: 'none' }}>
              {t5({ ja: 'METRONOME を見る →', en: 'See METRONOME →', es: 'Ver METRONOME →', ko: 'METRONOME 보기 →', pt: 'Ver METRONOME →', de: 'METRONOME ansehen →' }, lang)}
            </Link>
          </div>

          <div style={{ padding: 24, borderRadius: 12, background: 'rgba(232,184,160,0.08)', border: `1px solid ${ROSE_GOLD}` }}>
            <div style={{ fontFamily: mono, fontSize: 11, color: ROSE_GOLD, marginBottom: 8 }}>KUON DRUM MACHINE</div>
            <h3 style={{ fontFamily: serif, fontSize: '1.25rem', margin: '0 0 12px', color: '#fff', fontWeight: 400 }}>
              {t5({ ja: 'グルーヴを生成して演奏する楽器', en: 'A groove-generating instrument', es: 'Instrumento generador de groove', ko: '그루브 생성 악기', pt: 'Instrumento de groove', de: 'Groove-Instrument' }, lang)}
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#cbd5e1', fontSize: 13, lineHeight: 1.8 }}>
              <li>· 8 {t5({ ja: 'ボイス (フルキット + 民族打楽器)', en: 'voices (full kit + ethnic perc)', es: 'voces', ko: '보이스', pt: 'vozes', de: 'Stimmen' }, lang)}</li>
              <li>· {t5({ ja: 'ジャンル感・リズム感・楽曲化', en: 'Genre / rhythm / music creation', es: 'Género/ritmo/creación', ko: '장르·리듬·창작', pt: 'Gênero/ritmo/criação', de: 'Genre/Rhythmus/Kreation' }, lang)}</li>
              <li>· {t5({ ja: '作曲家・歌い手・配信者・民族音楽学習者', en: 'Composers, singers, streamers, world music learners', es: 'Compositores, cantantes, streamers', ko: '작곡가·가수·스트리머', pt: 'Compositores, cantores, streamers', de: 'Komponisten, Sänger, Streamer' }, lang)}</li>
              <li>· {t5({ ja: '練習・演奏の「相手」になる', en: 'Becomes your bandmate', es: 'Se vuelve tu compañero', ko: '밴드메이트', pt: 'Vira seu colega de banda', de: 'Wird dein Bandkollege' }, lang)}</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 12 ADVANTAGES */}
      <section id="advantages" style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 4%, 2rem)', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.2em', color: ROSE_GOLD, marginBottom: 8 }}>
            {t5({ ja: '巷のドラムマシンに対する 12 の優位性', en: '12 Advantages Over Other Drum Machines', es: '12 Ventajas', ko: '12가지 우위', pt: '12 Vantagens', de: '12 Vorteile' }, lang)}
          </div>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 400, color: '#fff', margin: 0 }}>
            {t5({ ja: 'なぜ Kuon が世界トップなのか。', en: 'Why Kuon Is the World\'s Top.', es: 'Por qué Kuon es el #1.', ko: '왜 Kuon이 최고인가.', pt: 'Por que Kuon é o #1.', de: 'Warum Kuon die Nr. 1 ist.' }, lang)}
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {ADVANTAGES.map((a) => (
            <div key={a.num} style={{
              padding: 20, borderRadius: 12, background: 'rgba(255,255,255,0.03)',
              border: '1px solid #1e293b', position: 'relative',
            }}>
              <div style={{ position: 'absolute', top: 12, right: 16, fontFamily: serif, fontSize: 28, color: 'rgba(232,184,160,0.25)', fontWeight: 400 }}>{a.num}</div>
              <h3 style={{ fontFamily: serif, fontSize: '1.1rem', margin: '0 0 10px', color: ROSE_GOLD, fontWeight: 400, paddingRight: 36 }}>
                {t5(a.title, lang)}
              </h3>
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7, margin: 0 }}>
                {t5(a.desc, lang)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CULTURE PREVIEW */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 4%, 2rem)', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.2em', color: ROSE_GOLD, marginBottom: 8 }}>
            12 CULTURES
          </div>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 400, color: '#fff', margin: '0 0 12px' }}>
            {t5({ ja: '世界 12 文化圏のリズム', en: 'Rhythms from 12 Cultures', es: 'Ritmos de 12 Culturas', ko: '12 문화권의 리듬', pt: 'Ritmos de 12 Culturas', de: 'Rhythmen aus 12 Kulturen' }, lang)}
          </h2>
          <p style={{ fontSize: 14, color: '#94a3b8', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
            {t5({ ja: 'MVP では西洋系 + キューバ・タンゴ・バルカン・スペイン・日本・ジャマイカを先行公開。残り文化圏は順次追加。', en: 'MVP launches with Western + Cuban, Tango, Balkan, Spanish, Japanese, Jamaican. Other cultures rolling out.', es: 'MVP: Occidental + Cubano, Tango, Balcánico, Español, Japonés, Jamaicano.', ko: 'MVP: 서양 + 쿠바·탱고·발칸·스페인·일본·자메이카.', pt: 'MVP: Ocidental + Cubano, Tango, Balcânico, Espanhol, Japonês, Jamaicano.', de: 'MVP: Westlich + Kubanisch, Tango, Balkan, Spanisch, Japanisch, Jamaikanisch.' }, lang)}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {ALL_CULTURES.map((c) => {
            const k = KITS[c];
            return (
              <div key={c} style={{
                padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.03)',
                border: '1px solid #1e293b', textAlign: 'center',
                opacity: k.available ? 1 : 0.6,
              }}>
                <div style={{ fontSize: 32, marginBottom: 6 }}>{k.emoji}</div>
                <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>{t5(k.name, lang)}</div>
                {!k.available && <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 4 }}>{t5({ ja: '近日', en: 'soon', es: 'pronto', ko: '곧', pt: 'breve', de: 'bald' }, lang)}</div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 4%, 2rem)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: '0.2em', color: ROSE_GOLD, marginBottom: 8 }}>COMPARISON</div>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 400, color: '#fff', margin: 0 }}>
            {t5({ ja: '巷のドラムマシン vs Kuon', en: 'Other Drum Machines vs Kuon', es: 'Otros vs Kuon', ko: '타사 vs Kuon', pt: 'Outros vs Kuon', de: 'Andere vs Kuon' }, lang)}
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${ROSE_GOLD}` }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>{t5({ ja: '機能', en: 'Feature', es: 'Característica', ko: '기능', pt: 'Recurso', de: 'Funktion' }, lang)}</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: ROSE_GOLD, fontWeight: 700 }}>KUON</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b', fontWeight: 500 }}>{t5({ ja: '巷の他社', en: 'Others', es: 'Otros', ko: '타사', pt: 'Outros', de: 'Andere' }, lang)}</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '10px 16px', color: '#cbd5e1' }}>{t5(r.feature, lang)}</td>
                  <td style={{ padding: '10px 16px', color: ROSE_GOLD, fontWeight: 600 }}>{r.kuon}</td>
                  <td style={{ padding: '10px 16px', color: '#64748b' }}>{r.others}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* AUTHOR */}
      <section style={{
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 4%, 2rem)', maxWidth: 800, margin: '0 auto',
        textAlign: 'center', borderTop: '1px solid rgba(232,184,160,0.15)',
      }}>
        <blockquote style={{
          fontFamily: serif, fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
          color: '#e2e8f0', margin: '0 0 24px', fontStyle: 'italic', lineHeight: 1.7, fontWeight: 400,
        }}>
          {t5({
            ja: '「世界中の音楽家が、自分の文化のリズムを誇りを持って叩ける場所を作りたかった。」',
            en: '"I wanted to build a place where musicians worldwide could proudly play their own culture\'s rhythms."',
            es: '"Quería crear un lugar donde los músicos puedan tocar con orgullo los ritmos de su cultura."',
            ko: '"세계 음악가가 자기 문화의 리듬을 자랑스럽게 칠 수 있는 곳."',
            pt: '"Um lugar onde músicos toquem orgulhosamente os ritmos de sua cultura."',
            de: '"Ein Ort, wo Musiker stolz die Rhythmen ihrer Kultur spielen."',
          }, lang)}
        </blockquote>
        <div style={{ fontSize: 12, color: '#94a3b8' }}>
          — {t5({ ja: '朝比奈幸太郎 / 空音開発', en: 'Kotaro Asahina / Kuon R&D', es: 'Kotaro Asahina / Kuon R&D', ko: '아사히나 코타로', pt: 'Kotaro Asahina', de: 'Kotaro Asahina' }, lang)}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
        padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 4%, 2rem)',
        textAlign: 'center', background: `radial-gradient(ellipse at center, rgba(232,184,160,0.1), transparent 70%)`,
      }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 400, color: '#fff', margin: '0 0 24px' }}>
          {t5({ ja: '叩き始めよう。', en: 'Start beating.', es: 'Empieza a tocar.', ko: '시작하기.', pt: 'Comece.', de: 'Leg los.' }, lang)}
        </h2>
        <Link href="/drum" style={{
          display: 'inline-block', padding: '16px 40px', borderRadius: 8,
          background: ROSE_GOLD, color: NAVY, fontWeight: 700, fontSize: 16,
          letterSpacing: '0.05em', textDecoration: 'none',
        }}>
          ▶ {t5({ ja: 'KUON DRUM MACHINE を開く', en: 'Open KUON DRUM MACHINE', es: 'Abrir KUON DRUM MACHINE', ko: 'KUON DRUM MACHINE 열기', pt: 'Abrir KUON DRUM MACHINE', de: 'KUON DRUM MACHINE öffnen' }, lang)}
        </Link>
      </section>
    </div>
  );
}
