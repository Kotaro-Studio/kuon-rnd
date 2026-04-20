'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

type L5 = Record<Lang, string>;

const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
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
  return <section ref={ref} className="reveal" style={{ marginBottom: 'clamp(48px, 10vw, 72px)', ...style }}>{children}</section>;
}

const glass: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  padding: 'clamp(18px, 4vw, 28px)',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
};

const T: Record<string, L5> = {
  heroTitle: {
    ja: '和音が「聴こえる」ようになる。\n14種類の和音を、ゲーム感覚で。',
    en: 'Hear the chords.\n14 chord types, gamified.',
    ko: '화음이 "들리게" 됩니다.\n14종류의 화음을, 게임 감각으로.',
    pt: 'Ouça os acordes.\n14 tipos de acordes, gamificados.',
    es: 'Escucha los acordes.\n14 tipos de acordes, gamificados.',
  },
  heroSub: {
    ja: '和音判定・転回形・コード進行の3モード。ピアノ音色と鍵盤ビジュアルで直感的に学ぶ。ブラウザ完結・無料。',
    en: 'Three modes: identification, inversions, and progressions. Piano timbre with keyboard visualization. Browser-based, free.',
    ko: '화음 판별·전위·코드 진행의 3모드. 피아노 음색과 건반 시각화로 직관적 학습. 브라우저 완결·무료.',
    pt: 'Três modos: identificação, inversões e progressões. Timbre de piano com visualização de teclado. No navegador, grátis.',
    es: 'Tres modos: identificación, inversiones y progresiones. Timbre de piano con visualización de teclado. En el navegador, gratis.',
  },
  heroCta: { ja: '今すぐ始める（無料）', en: 'Start Training — Free', ko: '지금 시작하기 — 무료', pt: 'Começar — Grátis', es: 'Comenzar — Gratis' },
  heroMore: { ja: '詳しく見る', en: 'Learn More', ko: '더 알아보기', pt: 'Saiba mais', es: 'Más información' },

  modesTitle: { ja: '3つのトレーニングモード', en: '3 Training Modes', ko: '3가지 훈련 모드', pt: '3 Modos de Treino', es: '3 Modos de Entrenamiento' },
  mode1Title: { ja: '和音判定', en: 'Chord Identification', ko: '화음 판별', pt: 'Identificação', es: 'Identificación' },
  mode1Desc: {
    ja: 'メジャー/マイナーの基本から、dim, aug, 7th, sus2/4, add9, 9thまで14種類を段階解禁。レベルが上がるたびに新しい和音が登場。',
    en: 'From major/minor to dim, aug, 7th, sus2/4, add9, 9th — 14 chord types unlocked progressively. New chords appear as you level up.',
    ko: '장/단 기본부터 dim, aug, 7th, sus2/4, add9, 9th까지 14종류를 단계 해금. 레벨이 올라갈 때마다 새 화음 등장.',
    pt: 'De maior/menor a dim, aug, 7ª, sus2/4, add9, 9ª — 14 tipos desbloqueados progressivamente.',
    es: 'De mayor/menor a dim, aug, 7ª, sus2/4, add9, 9ª — 14 tipos desbloqueados progresivamente.',
  },
  mode2Title: { ja: '転回形', en: 'Inversions', ko: '전위', pt: 'Inversões', es: 'Inversiones' },
  mode2Desc: {
    ja: '基本位置・第1転回・第2転回・第3転回を聴き分ける。和声課題の基礎であり、音大受験の必須スキル。',
    en: 'Distinguish root position, 1st, 2nd, and 3rd inversions. The foundation of harmony exercises — essential for music school entrance exams.',
    ko: '기본 위치, 제1전위, 제2전위, 제3전위를 구별. 화성 과제의 기초이자 음대 입시 필수 스킬.',
    pt: 'Distinga posição fundamental, 1ª, 2ª e 3ª inversão. Base dos exercícios de harmonia — essencial para provas.',
    es: 'Distingue posición fundamental, 1ª, 2ª y 3ª inversión. Base de ejercicios de armonía — esencial para exámenes.',
  },
  mode3Title: { ja: 'コード進行', en: 'Progressions', ko: '코드 진행', pt: 'Progressões', es: 'Progresiones' },
  mode3Desc: {
    ja: 'I-IV-V-I、I-V-vi-IV（ポップ進行）、ii-V-I（ジャズ）など6つの基本進行を聴き取る。作曲・アレンジの基礎。',
    en: 'I-IV-V-I, I-V-vi-IV (Pop), ii-V-I (Jazz) — 6 fundamental progressions. Foundation of composition and arranging.',
    ko: 'I-IV-V-I, I-V-vi-IV (팝), ii-V-I (재즈) 등 6가지 기본 진행을 청취. 작곡·편곡의 기초.',
    pt: 'I-IV-V-I, I-V-vi-IV (Pop), ii-V-I (Jazz) — 6 progressões fundamentais. Base de composição e arranjo.',
    es: 'I-IV-V-I, I-V-vi-IV (Pop), ii-V-I (Jazz) — 6 progresiones fundamentales. Base de composición y arreglo.',
  },

  pianoTitle: { ja: 'ピアノ音色 + 鍵盤ビジュアル', en: 'Piano Timbre + Keyboard Visual', ko: '피아노 음색 + 건반 시각화', pt: 'Timbre de Piano + Visual', es: 'Timbre de Piano + Visual' },
  pianoDesc: {
    ja: '倍音を含んだリアルなピアノ音色で出題。正解後は鍵盤上で構成音をハイライト表示。「聴く」と「見る」の両方で和音を理解する。',
    en: 'Questions use realistic piano timbre with harmonics. After answering, chord tones are highlighted on a mini keyboard. Understand chords by both hearing and seeing.',
    ko: '배음이 포함된 리얼한 피아노 음색으로 출제. 정답 후 건반에서 구성음을 하이라이트. "듣기"와 "보기" 모두로 화음 이해.',
    pt: 'Questões usam timbre de piano realista com harmônicos. Após responder, as notas são destacadas no teclado.',
    es: 'Preguntas con timbre de piano realista con armónicos. Tras responder, las notas se destacan en el teclado.',
  },

  whoTitle: { ja: 'こんな人におすすめ', en: 'Who Is This For?', ko: '이런 분에게 추천', pt: 'Para Quem É?', es: '¿Para Quién Es?' },
  who1: { ja: '🎓 和声の授業が始まった音大生', en: '🎓 Music students starting harmony classes', ko: '🎓 화성 수업이 시작된 음대생', pt: '🎓 Estudantes iniciando aulas de harmonia', es: '🎓 Estudiantes empezando clases de armonía' },
  who2: { ja: '🎹 コード進行を耳で捉えたいDTMer', en: '🎹 Music producers wanting to identify progressions by ear', ko: '🎹 코드 진행을 귀로 잡고 싶은 DTM 유저', pt: '🎹 Produtores querendo identificar progressões de ouvido', es: '🎹 Productores que quieren identificar progresiones de oído' },
  who3: { ja: '🎸 ジャズのコード感を鍛えたい楽器奏者', en: '🎸 Instrumentalists building jazz chord sense', ko: '🎸 재즈 코드 감각을 키우고 싶은 악기 연주자', pt: '🎸 Instrumentistas desenvolvendo senso de acordes jazz', es: '🎸 Instrumentistas desarrollando sentido de acordes jazz' },
  who4: { ja: '📝 音大受験の和声聴音で高得点を狙う受験生', en: '📝 Exam candidates aiming for high marks in harmony dictation', ko: '📝 음대 입시 화성 청음에서 고득점을 노리는 수험생', pt: '📝 Candidatos visando notas altas em ditado harmônico', es: '📝 Candidatos buscando altas notas en dictado armónico' },

  ctaTitle: { ja: '和音を、「わかる」ではなく「聴こえる」へ。', en: 'From "knowing" chords to truly hearing them.', ko: '화음을, "아는 것"에서 "들리는 것"으로.', pt: 'De "conhecer" acordes a realmente ouvi-los.', es: 'De "conocer" acordes a realmente escucharlos.' },
  ctaSub: { ja: '登録不要・ブラウザ完結・完全無料', en: 'No signup. Browser only. Free.', ko: '가입 불필요 · 브라우저만으로 · 완전 무료', pt: 'Sem cadastro. Apenas navegador. Grátis.', es: 'Sin registro. Solo navegador. Gratis.' },
  ctaBtn: { ja: 'KUON CHORD QUIZ を開く', en: 'Open KUON CHORD QUIZ', ko: 'KUON CHORD QUIZ 열기', pt: 'Abrir KUON CHORD QUIZ', es: 'Abrir KUON CHORD QUIZ' },
  ctaApps: { ja: '他のアプリも見る', en: 'Explore Other Apps', ko: '다른 앱도 보기', pt: 'Outros Apps', es: 'Otras Apps' },
};

export default function ChordQuizLPPage() {
  const { lang } = useLang();
  const t = (o: L5) => o[lang] ?? o.en;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#1e293b', fontFamily: sans }}>
      <style>{`
        .reveal { opacity: 0; transform: translateY(20px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* ═══ HERO ═══ */}
      <section style={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        padding: 'clamp(60px, 12vw, 100px) clamp(16px, 4vw, 32px) clamp(40px, 8vw, 60px)',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef4fb 50%, #f8fafc 100%)',
      }}>
        {/* Piano keys decorative */}
        <div style={{
          display: 'flex', gap: 2, marginBottom: 24, opacity: 0.15,
        }}>
          {[0,1,0,1,0,0,1,0,1,0,1,0].map((b, i) => (
            <div key={i} style={{
              width: b ? 14 : 20, height: b ? 36 : 52,
              background: b ? '#1e293b' : '#fff',
              borderRadius: b ? '0 0 3px 3px' : '0 0 4px 4px',
              border: '1px solid #cbd5e1',
              marginTop: b ? 0 : 16,
            }} />
          ))}
        </div>

        <h1 style={{
          fontFamily: serif, fontSize: 'clamp(1.5rem, 5vw, 2.8rem)',
          fontWeight: 700, lineHeight: 1.4, whiteSpace: 'pre-line',
          margin: '0 0 16px', color: '#0f172a',
        }}>
          {t(T.heroTitle)}
        </h1>
        <p style={{
          fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)',
          color: '#475569', lineHeight: 1.7, maxWidth: 600, margin: '0 0 28px',
        }}>
          {t(T.heroSub)}
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/chord-quiz" style={{
            padding: '13px 32px', borderRadius: 12,
            background: `linear-gradient(135deg, ${ACCENT}, #0ea5e9)`,
            color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem',
            boxShadow: `0 4px 16px ${ACCENT}25`,
          }}>
            {t(T.heroCta)}
          </Link>
          <a href="#modes" style={{
            padding: '13px 24px', borderRadius: 12,
            border: '1px solid #cbd5e1', color: '#475569',
            textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
          }}>
            {t(T.heroMore)}
          </a>
        </div>
      </section>

      <div style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(24px, 6vw, 48px) clamp(16px, 4vw, 32px)' }}>

        {/* ═══ 3 MODES ═══ */}
        <Section>
          <h2 id="modes" style={{ fontFamily: serif, fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)', textAlign: 'center', marginBottom: 28 }}>
            {t(T.modesTitle)}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 14 }}>
            {[
              { icon: '🎹', title: T.mode1Title, desc: T.mode1Desc, color: ACCENT },
              { icon: '🔄', title: T.mode2Title, desc: T.mode2Desc, color: '#8b5cf6' },
              { icon: '🎼', title: T.mode3Title, desc: T.mode3Desc, color: '#f59e0b' },
            ].map((m, i) => (
              <div key={i} style={glass}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${m.color}08`, border: `1.5px solid ${m.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.3rem', marginBottom: 10,
                }}>{m.icon}</div>
                <h3 style={{ fontSize: '0.9rem', margin: '0 0 8px', color: '#0f172a' }}>{t(m.title)}</h3>
                <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>{t(m.desc)}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ PIANO + KEYBOARD ═══ */}
        <Section>
          <div style={{ ...glass, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', margin: '0 0 12px' }}>
              {t(T.pianoTitle)}
            </h2>
            {/* Mock keyboard */}
            <div style={{ display: 'flex', gap: 1, margin: '16px 0', padding: '0 20px' }}>
              {[0,1,0,1,0,0,1,0,1,0,1,0,0,1,0].map((b, i) => {
                const highlight = [0, 4, 7, 12].includes(i);
                return (
                  <div key={i} style={{
                    width: b ? 16 : 24, height: b ? 44 : 64,
                    background: b ? (highlight ? '#1e3a5f' : '#334155') : (highlight ? `${ACCENT}15` : '#fff'),
                    borderRadius: b ? '0 0 3px 3px' : '0 0 5px 5px',
                    border: highlight ? `1.5px solid ${ACCENT}` : '1px solid #e2e8f0',
                    marginTop: b ? 0 : 20,
                    position: 'relative',
                  }}>
                    {highlight && !b && (
                      <div style={{
                        position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
                        width: 6, height: 6, borderRadius: '50%', background: ACCENT,
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.7, maxWidth: 500, margin: 0 }}>
              {t(T.pianoDesc)}
            </p>
          </div>
        </Section>

        {/* ═══ WHO ═══ */}
        <Section>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)', textAlign: 'center', marginBottom: 20 }}>
            {t(T.whoTitle)}
          </h2>
          <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[T.who1, T.who2, T.who3, T.who4].map((w, i) => (
              <div key={i} style={{ ...glass, padding: '12px 18px', fontSize: '0.85rem', fontWeight: 500 }}>
                {t(w)}
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ CTA ═══ */}
        <Section>
          <div style={{
            background: '#fff', borderRadius: 20, padding: 'clamp(28px, 6vw, 48px)',
            textAlign: 'center', border: '1px solid #e2e8f0',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
          }}>
            <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.2rem, 3.5vw, 1.8rem)', marginBottom: 10 }}>
              {t(T.ctaTitle)}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 24 }}>{t(T.ctaSub)}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/chord-quiz" style={{
                padding: '13px 32px', borderRadius: 12,
                background: `linear-gradient(135deg, ${ACCENT}, #0ea5e9)`,
                color: '#fff', textDecoration: 'none', fontWeight: 700,
                boxShadow: `0 4px 16px ${ACCENT}25`,
              }}>
                {t(T.ctaBtn)}
              </Link>
              <Link href="/audio-apps" style={{
                padding: '13px 24px', borderRadius: 12,
                border: '1px solid #cbd5e1', color: '#475569',
                textDecoration: 'none', fontWeight: 600,
              }}>
                {t(T.ctaApps)}
              </Link>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
