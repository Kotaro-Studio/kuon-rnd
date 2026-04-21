'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L5 = Record<Lang, string>;
const serif = '"Hiragino Mincho ProN","Yu Mincho","Noto Serif JP",serif';
const sans  = '"Helvetica Neue",Arial,sans-serif';
const mono  = '"SF Mono","Fira Code","Consolas",monospace';
const ACCENT = '#ea580c';
const ACCENT2 = '#fdba74';
const BG = '#fffbf7';

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
  return <section ref={ref} className="reveal" style={{ marginBottom: 'clamp(56px,12vw,88px)', ...style }}>{children}</section>;
}

const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.85)', borderRadius: 16, padding: 'clamp(20px,4vw,32px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.03)',
};

const t5 = (m: L5, lang: Lang) => m[lang] ?? m.en;

// ─── Text ───
const T: Record<string, L5> = {
  badge:     {ja:'TRANSPOSER',en:'TRANSPOSER',ko:'TRANSPOSER',pt:'TRANSPOSER',es:'TRANSPOSER'},
  h1:        {ja:'もう、移調で悩まない。',en:'Never struggle with transposition again.',ko:'더 이상 이조로 고민하지 마세요.',pt:'Nunca mais sofra com transposição.',es:'Nunca más sufras con la transposición.'},
  sub:       {ja:'30 楽器対応。調号も音符も、一瞬で変換。完全無料。',en:'30+ instruments. Keys & notes, transposed instantly. Completely free.',ko:'30개 이상 악기 지원. 조표와 음표를 즉시 변환. 완전 무료.',pt:'30+ instrumentos. Tonalidades e notas, transpostas instantaneamente. Grátis.',es:'30+ instrumentos. Tonalidades y notas, transpuestas al instante. Gratis.'},
  cta:       {ja:'今すぐ使う',en:'Use Now — Free',ko:'지금 사용하기',pt:'Usar Agora — Grátis',es:'Usar Ahora — Gratis'},
  painTitle: {ja:'この経験、ありませんか？',en:'Sound familiar?',ko:'이런 경험 있으신가요?',pt:'Parece familiar?',es:'¿Te suena familiar?'},
  pain1:     {ja:'B♭クラリネットの楽譜をアルトサックスに渡したいのに、移調の計算が面倒…',en:'"I need to give this B♭ clarinet part to the alto sax, but the transposition math is so tedious..."',ko:'B♭ 클라리넷 악보를 알토 색소폰에게 주고 싶은데 이조 계산이 귀찮아...',pt:'"Preciso dar essa parte do clarinete B♭ para o sax alto, mas a transposição é tão trabalhosa..."',es:'"Necesito dar esta parte del clarinete B♭ al saxo alto, pero la transposición es tan tediosa..."'},
  pain2:     {ja:'ホルンの in F パート、実音に直すといつも間違える…',en:'"I always make mistakes converting the horn part from F to concert pitch..."',ko:'호른 in F 파트를 실음으로 바꾸면 항상 틀려...',pt:'"Sempre erro ao converter a parte da trompa de F para altura real..."',es:'"Siempre me equivoco al convertir la parte de corno de F a altura real..."'},
  pain3:     {ja:'指揮者に「実音で言って」と言われて、頭がフリーズ…',en:'"The conductor said \'say it in concert pitch\' and my brain froze..."',ko:'"지휘자가 \'실음으로 말해봐\'라고 하니 머리가 멈췄어..."',pt:'"O maestro disse \'diga em altura real\' e meu cérebro travou..."',es:'"El director dijo \'dilo en altura real\' y mi cerebro se congeló..."'},
  solTitle:  {ja:'KUON TRANSPOSERが、すべて解決。',en:'KUON TRANSPOSER solves it all.',ko:'KUON TRANSPOSER가 모두 해결합니다.',pt:'KUON TRANSPOSER resolve tudo.',es:'KUON TRANSPOSER lo resuelve todo.'},
  feat1T:    {ja:'楽器間移調',en:'Instrument-to-Instrument',ko:'악기 간 이조',pt:'Instrumento a Instrumento',es:'Instrumento a Instrumento'},
  feat1D:    {ja:'B♭クラリネット → アルトサックスなど、任意の楽器ペアで瞬時に移調。',en:'B♭ Clarinet → Alto Sax, or any instrument pair — transposed instantly.',ko:'B♭ 클라리넷 → 알토 색소폰 등 어떤 악기 조합이든 즉시 이조.',pt:'Clarinete B♭ → Sax Alto, ou qualquer par de instrumentos — transposto instantaneamente.',es:'Clarinete B♭ → Saxo Alto, o cualquier par de instrumentos — transpuesto al instante.'},
  feat2T:    {ja:'調号の自動変換',en:'Automatic Key Conversion',ko:'조표 자동 변환',pt:'Conversão Automática de Armadura',es:'Conversión Automática de Armadura'},
  feat2D:    {ja:'実音の調を選ぶだけで、各楽器が読む調号が一覧表示。全15調対応。',en:'Select the concert key and instantly see what every instrument reads. All 15 keys.',ko:'실음 조를 선택하면 각 악기가 읽는 조표를 즉시 확인. 전 15조 대응.',pt:'Selecione a tonalidade real e veja o que cada instrumento lê. Todas as 15 tonalidades.',es:'Selecciona la tonalidad real y ve lo que lee cada instrumento. Las 15 tonalidades.'},
  feat3T:    {ja:'音符列の一括移調',en:'Batch Note Transposition',ko:'음표열 일괄 이조',pt:'Transposição em Lote',es:'Transposición por Lotes'},
  feat3D:    {ja:'「C4 D4 E4 F4 G4」のように音列を入力すれば、移調結果をリアルタイム表示。',en:'Type "C4 D4 E4 F4 G4" and see the transposed result in real-time.',ko:'"C4 D4 E4 F4 G4"처럼 음렬을 입력하면 이조 결과를 실시간 표시.',pt:'Digite "C4 D4 E4 F4 G4" e veja o resultado transposto em tempo real.',es:'Escribe "C4 D4 E4 F4 G4" y ve el resultado transpuesto en tiempo real.'},
  feat4T:    {ja:'移調早見表',en:'Transposition Reference Chart',ko:'이조 조견표',pt:'Tabela de Referência',es:'Tabla de Referencia'},
  feat4D:    {ja:'in B♭ / in A / in E♭ / in F — 全12音 × 主要4管の完全対応表をアプリ内に内蔵。',en:'in B♭ / in A / in E♭ / in F — complete 12-note × 4 key chart built right into the app.',ko:'in B♭ / in A / in E♭ / in F — 전 12음 × 주요 4관의 완전 대응표를 앱 내에 내장.',pt:'in B♭ / in A / in E♭ / in F — tabela completa de 12 notas × 4 chaves integrada no app.',es:'in B♭ / in A / in E♭ / in F — tabla completa de 12 notas × 4 claves integrada en la app.'},
  feat5T:    {ja:'30+ 楽器プリセット',en:'30+ Instrument Presets',ko:'30개 이상 악기 프리셋',pt:'30+ Presets de Instrumentos',es:'30+ Presets de Instrumentos'},
  feat5D:    {ja:'木管・サックス・金管・打楽器・弦楽器を網羅。ファミリーごとに整理された選択UI。',en:'Woodwinds, saxophones, brass, percussion, strings. Organized by family.',ko:'목관·색소폰·금관·타악기·현악기 망라. 패밀리별로 정리된 선택 UI.',pt:'Madeiras, saxofones, metais, percussão, cordas. Organizados por família.',es:'Maderas, saxofones, metales, percusión, cuerdas. Organizados por familia.'},
  feat6T:    {ja:'完全無料・ブラウザ完結',en:'Completely Free & Browser-Based',ko:'완전 무료 · 브라우저 완결',pt:'Totalmente Grátis · Navegador',es:'Totalmente Gratis · Navegador'},
  feat6D:    {ja:'アカウント登録不要。スマートフォン・タブレット・PC、すべてのデバイスで動作。',en:'No account needed. Works on every device — phone, tablet, desktop.',ko:'계정 등록 불필요. 스마트폰·태블릿·PC 모든 기기에서 작동.',pt:'Sem cadastro. Funciona em qualquer dispositivo — celular, tablet, desktop.',es:'Sin registro. Funciona en cualquier dispositivo — celular, tablet, escritorio.'},
  stepTitle: {ja:'3ステップで移調完了',en:'Transpose in 3 Steps',ko:'3단계로 이조 완료',pt:'Transponha em 3 Passos',es:'Transpón en 3 Pasos'},
  step1:     {ja:'移調元と移調先の楽器を選ぶ',en:'Select source & target instruments',ko:'원래 악기와 목표 악기를 선택',pt:'Selecione instrumentos de origem e destino',es:'Selecciona instrumentos de origen y destino'},
  step2:     {ja:'調号を選ぶか、音符を入力',en:'Choose a key or enter notes',ko:'조표를 선택하거나 음표를 입력',pt:'Escolha uma tonalidade ou digite notas',es:'Elige una tonalidad o introduce notas'},
  step3:     {ja:'移調結果を即座に確認',en:'See the transposed result instantly',ko:'이조 결과를 즉시 확인',pt:'Veja o resultado transposto instantaneamente',es:'Ve el resultado transpuesto al instante'},
  whoTitle:  {ja:'こんな人に最適',en:'Perfect For',ko:'이런 분에게 최적',pt:'Perfeito Para',es:'Perfecto Para'},
  who1:      {ja:'吹奏楽部員（中学・高校・大学）',en:'Wind band members (middle school, high school, university)',ko:'취주악부 부원 (중·고·대)',pt:'Membros de banda (escola, universidade)',es:'Miembros de banda (escuela, universidad)'},
  who2:      {ja:'オーケストラ奏者・指揮者',en:'Orchestra players & conductors',ko:'오케스트라 연주자·지휘자',pt:'Músicos de orquestra & maestros',es:'Músicos de orquesta & directores'},
  who3:      {ja:'音大受験生・音楽理論を学ぶ学生',en:'Music school applicants & theory students',ko:'음대 수험생·음악이론 학생',pt:'Candidatos a escolas de música & estudantes de teoria',es:'Aspirantes a escuelas de música & estudiantes de teoría'},
  who4:      {ja:'アレンジャー・編曲者',en:'Arrangers & composers',ko:'편곡자·작곡가',pt:'Arranjadores & compositores',es:'Arreglistas & compositores'},
  compTitle: {ja:'なぜ KUON TRANSPOSER？',en:'Why KUON TRANSPOSER?',ko:'왜 KUON TRANSPOSER인가?',pt:'Por que KUON TRANSPOSER?',es:'¿Por qué KUON TRANSPOSER?'},
  comp1:     {ja:'有料アプリ（¥1,500〜¥6,000/年）に匹敵する機能が、完全無料',en:'Features matching paid apps (¥1,500–¥6,000/yr), completely free',ko:'유료 앱(¥1,500~¥6,000/년)에 필적하는 기능이 완전 무료',pt:'Recursos equivalentes a apps pagos (¥1.500–¥6.000/ano), totalmente grátis',es:'Funciones equivalentes a apps de pago (¥1.500–¥6.000/año), totalmente gratis'},
  comp2:     {ja:'インストール不要 — ブラウザを開くだけ',en:'No installation — just open your browser',ko:'설치 불필요 — 브라우저만 열면 OK',pt:'Sem instalação — basta abrir o navegador',es:'Sin instalación — solo abre tu navegador'},
  comp3:     {ja:'30+ 楽器を網羅（他の多くの無料ツールは5〜10楽器）',en:'30+ instruments covered (many free tools only have 5–10)',ko:'30개 이상 악기 지원 (많은 무료 도구는 5~10개)',pt:'30+ instrumentos (muitas ferramentas grátis têm apenas 5–10)',es:'30+ instrumentos (muchas herramientas gratis solo tienen 5–10)'},
  comp4:     {ja:'楽器間の直接移調（実音を経由する手間なし）',en:'Direct instrument-to-instrument transposition (no manual concert pitch step)',ko:'악기 간 직접 이조 (실음 경유 수고 없음)',pt:'Transposição direta entre instrumentos (sem etapa manual de altura real)',es:'Transposición directa entre instrumentos (sin paso manual de altura real)'},
  bottomCta: {ja:'KUON TRANSPOSER を開く',en:'Open KUON TRANSPOSER',ko:'KUON TRANSPOSER 열기',pt:'Abrir KUON TRANSPOSER',es:'Abrir KUON TRANSPOSER'},
};

export default function TransposerLPPage() {
  const { lang } = useLang();
  const t = (k: string) => T[k]?.[lang] ?? T[k]?.en ?? '';

  const features = [
    { icon: '🎺', t: t('feat1T'), d: t('feat1D') },
    { icon: '🎼', t: t('feat2T'), d: t('feat2D') },
    { icon: '🎵', t: t('feat3T'), d: t('feat3D') },
    { icon: '📊', t: t('feat4T'), d: t('feat4D') },
    { icon: '🎻', t: t('feat5T'), d: t('feat5D') },
    { icon: '🌐', t: t('feat6T'), d: t('feat6D') },
  ];

  const steps = [t('step1'), t('step2'), t('step3')];
  const whos = [t('who1'), t('who2'), t('who3'), t('who4')];
  const comps = [t('comp1'), t('comp2'), t('comp3'), t('comp4')];

  return (
    <main style={{ background: BG, minHeight: '100vh', fontFamily: sans, color: '#1e293b' }}>
      <style>{`
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
        .reveal.visible { opacity: 1; transform: none; }
        .feat-card { transition: transform .2s, box-shadow .2s; }
        .feat-card:hover { transform: translateY(-4px); box-shadow: 0 8px 32px rgba(234,88,12,.1) !important; }
      `}</style>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 clamp(16px,4vw,32px)' }}>

        {/* ─── Hero ─── */}
        <section style={{ textAlign: 'center', padding: 'clamp(56px,12vw,100px) 0 clamp(40px,8vw,64px)' }}>
          <div style={{ display: 'inline-block', background: `linear-gradient(135deg,${ACCENT},#f97316)`, color: '#fff', fontFamily: mono, fontSize: 11, fontWeight: 700, padding: '5px 16px', borderRadius: 20, letterSpacing: '.12em', marginBottom: 20 }}>{t('badge')}</div>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(28px,6vw,48px)', fontWeight: 800, lineHeight: 1.2, margin: '0 0 16px', letterSpacing: '.02em' }}>{t('h1')}</h1>
          <p style={{ fontSize: 'clamp(14px,3vw,18px)', color: '#64748b', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.7 }}>{t('sub')}</p>
          <Link href="/transposer" style={{ display: 'inline-block', background: `linear-gradient(135deg,${ACCENT},#f97316)`, color: '#fff', padding: '16px 40px', borderRadius: 12, fontSize: 16, fontWeight: 700, textDecoration: 'none', letterSpacing: '.04em', boxShadow: `0 4px 20px ${ACCENT}44` }}>
            {t('cta')}
          </Link>
        </section>

        {/* ─── Pain Points ─── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px,4.5vw,32px)', fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>{t('painTitle')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[t('pain1'), t('pain2'), t('pain3')].map((p, i) => (
              <div key={i} style={{ ...glass, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 24, lineHeight: 1.4, flexShrink: 0 }}>{['😩','😵','🥶'][i]}</span>
                <p style={{ margin: 0, fontSize: 'clamp(14px,2.8vw,16px)', lineHeight: 1.7, color: '#475569', fontStyle: 'italic' }}>{p}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── Solution Features ─── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px,4.5vw,32px)', fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>{t('solTitle')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className="feat-card" style={{ ...glass, textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontFamily: serif, fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: ACCENT }}>{f.t}</h3>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: '#64748b' }}>{f.d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── 3 Steps ─── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px,4.5vw,32px)', fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>{t('stepTitle')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg,${ACCENT},#f97316)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: serif, fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <p style={{ margin: 0, fontSize: 'clamp(14px,3vw,17px)', fontWeight: 600, color: '#1e293b' }}>{s}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── Who ─── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px,4.5vw,32px)', fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>{t('whoTitle')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
            {whos.map((w, i) => (
              <div key={i} style={{ ...glass, textAlign: 'center', padding: '18px 20px' }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>{['🎷','🎶','📚','✏️'][i]}</span>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#475569' }}>{w}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── Comparison ─── */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(20px,4.5vw,32px)', fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>{t('compTitle')}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comps.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: ACCENT, fontSize: 20, lineHeight: 1.4, flexShrink: 0 }}>✓</span>
                <p style={{ margin: 0, fontSize: 'clamp(14px,2.8vw,16px)', lineHeight: 1.7, color: '#475569' }}>{c}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ─── Final CTA ─── */}
        <section style={{ textAlign: 'center', padding: '0 0 clamp(56px,12vw,100px)' }}>
          <Link href="/transposer" style={{ display: 'inline-block', background: `linear-gradient(135deg,${ACCENT},#f97316)`, color: '#fff', padding: '18px 48px', borderRadius: 14, fontSize: 17, fontWeight: 700, textDecoration: 'none', letterSpacing: '.04em', boxShadow: `0 4px 24px ${ACCENT}44` }}>
            {t('bottomCta')}
          </Link>
          <p style={{ marginTop: 16, fontSize: 13, color: '#94a3b8' }}>
            {lang === 'ja' ? '登録不要・完全無料・ブラウザ完結' : 'No signup · Free forever · Browser-based'}
          </p>
        </section>

      </div>

      {/* ─── JSON-LD ─── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "KUON TRANSPOSER",
        "url": "https://kuon-rnd.com/transposer",
        "applicationCategory": "MusicApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "JPY" },
        "description": "Free browser-based transposition helper for all instruments. 30+ presets, key & note transposition, reference chart.",
        "creator": { "@type": "Organization", "name": "空音開発 Kuon R&D", "url": "https://kuon-rnd.com" },
      }) }} />
    </main>
  );
}
