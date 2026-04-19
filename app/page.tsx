"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/context/LangContext';

// ─────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────
const serif = '"Shippori Mincho", "Noto Serif JP", "Yu Mincho", "YuMincho", serif';
const sans  = '"Helvetica Neue", Arial, sans-serif';
const ACCENT = '#0284c7';

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────
export default function Home() {
  const { lang } = useLang();
  const t = <T,>(ja: T, en: T, es: T, ko?: T): T =>
    lang === 'ja' ? ja : lang === 'en' ? en : lang === 'es' ? es : ko ?? es;

  return (
    <div style={{
      fontFamily: serif,
      color: '#1a1a1a',
      backgroundColor: '#fafafa',
      overflowX: 'hidden',
    }}>

      {/* ══════════════════════════════════════════
          1. HERO — 欲望に直接語りかける
      ══════════════════════════════════════════ */}
      <section style={{
        minHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(6rem, 16vw, 12rem) clamp(1.5rem, 5vw, 3rem)',
        position: 'relative',
      }}>
        <div
          aria-hidden
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'radial-gradient(ellipse at center 20%, rgba(2,132,199,0.03) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px' }}>
          <p style={{
            fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
            fontWeight: 500, color: '#999',
            letterSpacing: '0.4em', textTransform: 'uppercase',
            marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)', fontFamily: sans,
          }}>
            The Platform for Musicians
          </p>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 5.5vw, 3.6rem)',
            fontWeight: 300,
            letterSpacing: 'clamp(0.06em, 0.15em, 0.2em)',
            lineHeight: 1.5,
            margin: '0 0 clamp(1.5rem, 3vw, 2.5rem) 0',
            color: '#0c0c0c',
            wordBreak: 'keep-all',
          }}>
            {t('誰かが、あなたの音楽を\n探している。',
               'Someone is looking\nfor your music.',
               'Alguien está buscando\ntu música.',
               '누군가가 당신의 음악을\n찾고 있습니다.')}
          </h1>

          <p style={{
            color: '#777',
            fontSize: 'clamp(0.88rem, 1.4vw, 1.05rem)',
            lineHeight: 2.0,
            letterSpacing: '0.03em',
            fontFamily: sans,
            margin: '0 0 clamp(2.5rem, 5vw, 4rem) 0',
            maxWidth: '620px', marginLeft: 'auto', marginRight: 'auto',
          }}>
            {t('録音し、成長を記録し、世界に発信する。\n空音開発は、音楽家が音楽家であり続けるためのプラットフォームです。',
               'Record. Track your growth. Reach the world.\nKuon R&D is the platform where musicians stay musicians.',
               'Graba. Registra tu crecimiento. Llega al mundo.\nKuon R&D es la plataforma donde los músicos siguen siendo músicos.',
               '녹음하세요. 성장을 기록하세요. 세계에 도달하세요.\n공음 R&D는 음악가가 음악가로 남을 수 있는 플랫폼입니다.')}
          </p>

          <div style={{
            display: 'flex', gap: 'clamp(0.8rem, 2vw, 1.2rem)',
            justifyContent: 'center', flexWrap: 'wrap',
          }}>
            <Link href="/audio-apps" style={{
              padding: 'clamp(1rem, 1.6vw, 1.2rem) clamp(2.4rem, 4.5vw, 3.2rem)',
              backgroundColor: '#0c0c0c', color: '#fff',
              fontSize: 'clamp(0.82rem, 1.1vw, 0.9rem)',
              letterSpacing: '0.1em', textDecoration: 'none',
              borderRadius: '50px', fontFamily: sans,
              transition: 'all 0.4s ease', border: 'none',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ACCENT; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(2,132,199,0.35)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0c0c0c'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {t('\u7121\u6599\u3067\u306f\u3058\u3081\u308b', 'Start Free', 'Empieza Gratis')}
            </Link>
            <Link href="/microphone" style={{
              padding: 'clamp(1rem, 1.6vw, 1.2rem) clamp(2.4rem, 4.5vw, 3.2rem)',
              backgroundColor: 'transparent', color: '#444',
              fontSize: 'clamp(0.82rem, 1.1vw, 0.9rem)',
              letterSpacing: '0.1em', textDecoration: 'none',
              borderRadius: '50px', fontFamily: sans,
              border: '1px solid #ccc', transition: 'all 0.4s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.color = ACCENT; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#ccc'; e.currentTarget.style.color = '#444'; }}
            >
              {t('\u30de\u30a4\u30af\u3092\u898b\u308b', 'View Microphones', 'Ver Micr\u00f3fonos')}
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2. NUMBERS — 信頼の裏付け
      ══════════════════════════════════════════ */}
      <section style={{
        borderTop: '1px solid rgba(0,0,0,0.04)',
        borderBottom: '1px solid rgba(0,0,0,0.04)',
        padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 5vw, 3rem)',
      }}>
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'center', gap: 'clamp(2rem, 5vw, 4rem)',
          maxWidth: '900px', margin: '0 auto',
        }}>
          {([
            { num: '15+',  label: t('\u30aa\u30fc\u30c7\u30a3\u30aa\u30c4\u30fc\u30eb', 'Audio Tools', 'Herramientas') },
            { num: '35',   label: t('\u30ab\u56fd\u306b\u767a\u9001', 'Countries', 'Pa\u00edses') },
            { num: '3',    label: t('\u8a00\u8a9e\u5bfe\u5fdc', 'Languages', 'Idiomas') },
            { num: '100%', label: t('\u30d6\u30e9\u30a6\u30b6\u5b8c\u7d50', 'Browser-based', 'En navegador') },
          ] as const).map((item) => (
            <div key={item.num} style={{ textAlign: 'center', minWidth: '100px' }}>
              <p style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 200,
                color: '#111', margin: '0 0 0.2rem', fontFamily: sans,
                letterSpacing: '0.02em',
              }}>{item.num}</p>
              <p style={{
                fontSize: 'clamp(0.7rem, 0.9vw, 0.78rem)', color: '#aaa',
                fontFamily: sans, letterSpacing: '0.08em', margin: 0,
              }}>{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3. TENSION — 音楽家が直面する現実
      ══════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(6rem, 14vw, 10rem) clamp(1.5rem, 5vw, 3rem)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 'clamp(1.1rem, 3vw, 2rem)',
          fontWeight: 300,
          lineHeight: 2.0,
          letterSpacing: '0.06em',
          color: '#444',
          maxWidth: '700px', margin: '0 auto',
          wordBreak: 'keep-all',
        }}>
          {t('\u300c\u826f\u3044\u30de\u30a4\u30af\u304c\u8cb7\u3048\u306a\u3044\u3002\u300d\n\u300c\u7df4\u7fd2\u306e\u8a18\u9332\u304c\u6b8b\u3089\u306a\u3044\u3002\u300d\n\u300c\u624d\u80fd\u304c\u3042\u3063\u3066\u3082\u3001\u898b\u3064\u3051\u3066\u3082\u3089\u3048\u306a\u3044\u3002\u300d',
             '"I can\'t afford a good microphone."\n"My practice goes undocumented."\n"Even with talent, nobody finds me."',
             '"No puedo comprar un buen micr\u00f3fono."\n"Mi pr\u00e1ctica no queda registrada."\n"Aunque tenga talento, nadie me encuentra."')}
        </p>
        <p style={{
          marginTop: 'clamp(2.5rem, 5vw, 3.5rem)',
          color: '#bbb',
          fontSize: 'clamp(0.88rem, 1.2vw, 0.95rem)',
          letterSpacing: '0.06em',
          fontFamily: sans,
        }}>
          {t('\u2014\u2014 \u97f3\u697d\u5bb6\u3092\u53d6\u308a\u5dfb\u304f\u74b0\u5883\u306f\u3001\u4f55\u3082\u5909\u308f\u3063\u3066\u3044\u306a\u304b\u3063\u305f\u3002',
             '\u2014 The world hasn\'t changed for musicians. Until now.',
             '\u2014 El mundo no hab\u00eda cambiado para los m\u00fasicos. Hasta ahora.')}
        </p>
      </section>

      {/* ══════════════════════════════════════════
          4. FOUNDER STORY — 原点
      ══════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(5rem, 12vw, 9rem) clamp(1.5rem, 5vw, 3rem)',
        borderTop: '1px solid rgba(0,0,0,0.04)',
      }}>
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          gap: 'clamp(3rem, 6vw, 6rem)',
          alignItems: 'center', justifyContent: 'center',
          maxWidth: '950px', margin: '0 auto',
        }}>
          <div style={{ flex: '0 0 auto', textAlign: 'center' }}>
            <div style={{
              padding: '6px', border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '50%', display: 'inline-block',
            }}>
              <Image
                src="/kotaro.jpeg" alt="Kotaro Asahina"
                width={200} height={200} unoptimized
                style={{
                  borderRadius: '50%', objectFit: 'cover',
                  width: 'clamp(140px, 18vw, 190px)',
                  height: 'clamp(140px, 18vw, 190px)',
                  display: 'block',
                  filter: 'grayscale(15%) contrast(1.05)',
                }}
              />
            </div>
          </div>

          <div style={{ flex: '1 1 350px', minWidth: 'min(100%, 300px)' }}>
            <p style={{
              fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
              fontWeight: 500, color: ACCENT,
              letterSpacing: '0.3em', textTransform: 'uppercase',
              marginBottom: '1rem', fontFamily: sans,
            }}>
              Origin Story
            </p>
            <h2 style={{
              fontSize: 'clamp(1.3rem, 3vw, 2rem)',
              fontWeight: 300, letterSpacing: '0.1em',
              lineHeight: 1.7, margin: '0 0 clamp(1.5rem, 3vw, 2rem) 0',
              color: '#111',
            }}>
              {t('\u8cb7\u3048\u306a\u304b\u3063\u305f\u304b\u3089\u3001\u4f5c\u3063\u305f\u3002',
                 'I couldn\'t afford one.\nSo I built it.',
                 'No pod\u00eda comprarlo.\nAs\u00ed que lo constru\u00ed.')}
            </h2>
            <div style={{
              color: '#555', fontSize: 'clamp(0.88rem, 1.2vw, 0.95rem)',
              lineHeight: 2.2, fontFamily: sans,
            }}>
              {t(<>音大生だった頃、自分の演奏を録音したかった。<br />でも、良いマイクは数十万円。学生には手が届かない。<br /><br />だったら自分で作ろう。<br /><br />そうして生まれたのが P-86S。&yen;16,900。<br />数十万円のマイクと同等以上の音質を、手はんだで一本一本。<br /><br />でも、マイクだけでは足りなかった。<br />練習を記録するツール、レッスンを書き起こすAI、<br />和声を解析するエンジン、才能を発見する場所——<br /><br />音楽家に必要なものを、全部作ることにした。</>,
                 <>When I was a music student, I wanted to record my performances.<br />But a good microphone cost thousands. Far beyond a student&apos;s reach.<br /><br />So I built my own.<br /><br />That&apos;s the P-86S. $99. Hand-soldered, one at a time.<br />Sound rivaling microphones ten times the price.<br /><br />But a microphone wasn&apos;t enough.<br />Tools for practice, AI for lesson transcription,<br />harmony analysis engines, a place to be discovered&mdash;<br /><br />I decided to build everything a musician needs.</>,
                 <>Cuando era estudiante de m&uacute;sica, quer&iacute;a grabar mis interpretaciones.<br />Pero un buen micr&oacute;fono costaba miles. Imposible para un estudiante.<br /><br />As&iacute; que constru&iacute; el m&iacute;o.<br /><br />As&iacute; naci&oacute; el P-86S. &euro;92. Soldado a mano, uno por uno.<br />Calidad comparable a micr&oacute;fonos diez veces m&aacute;s caros.<br /><br />Pero un micr&oacute;fono no era suficiente.<br />Herramientas para la pr&aacute;ctica, IA para transcripciones,<br />motores de an&aacute;lisis arm&oacute;nico, un lugar para ser descubierto&mdash;<br /><br />Decid&iacute; construir todo lo que un m&uacute;sico necesita.</>
              )}
            </div>
            <p style={{
              marginTop: 'clamp(1.5rem, 3vw, 2rem)',
              color: '#888', fontSize: 'clamp(0.82rem, 1.05vw, 0.88rem)',
              fontFamily: sans, letterSpacing: '0.05em',
            }}>
              &mdash; {t('\u671d\u6bd4\u5948 \u5e78\u592a\u90ce / \u7a7a\u97f3\u958b\u767a \u4ee3\u8868', 'Kotaro Asahina / Founder, Kuon R&D', 'Kotaro Asahina / Fundador, Kuon R&D')}
            </p>
            <Link href="/profile" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              marginTop: '1.2rem',
              color: ACCENT, fontSize: 'clamp(0.8rem, 1.05vw, 0.88rem)',
              letterSpacing: '0.08em', textDecoration: 'none', fontFamily: sans,
            }}>
              {t('\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u8a73\u7d30', 'Full Profile', 'Perfil Completo')} &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5. THREE PILLARS — Record / Grow / Be Discovered
      ══════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(5rem, 12vw, 9rem) clamp(1.5rem, 5vw, 3rem)',
        borderTop: '1px solid rgba(0,0,0,0.04)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
          fontWeight: 500, color: '#999',
          letterSpacing: '0.4em', textTransform: 'uppercase',
          marginBottom: 'clamp(1rem, 2vw, 1.5rem)', fontFamily: sans,
        }}>
          Platform
        </p>
        <h2 style={{
          fontSize: 'clamp(1.4rem, 3.8vw, 2.4rem)',
          fontWeight: 300, letterSpacing: '0.1em',
          lineHeight: 1.6, margin: '0 0 clamp(4rem, 8vw, 6rem)', color: '#111',
          wordBreak: 'keep-all',
        }}>
          {t('\u9332\u97f3\u3059\u308b\u3002\u6210\u9577\u3059\u308b\u3002\u898b\u3064\u304b\u308b\u3002',
             'Record. Grow. Be discovered.',
             'Graba. Crece. S\u00e9 descubierto.')}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: 'clamp(2rem, 4vw, 3rem)',
          maxWidth: '1050px', margin: '0 auto', textAlign: 'left',
        }}>
          {([
            {
              num: '01',
              title: t('\u9332\u97f3\u3059\u308b', 'Record', 'Graba'),
              body: t(
                '\u624b\u306f\u3093\u3060\u306e\u30de\u30a4\u30af\u304b\u3089\u3001\u30d6\u30e9\u30a6\u30b6\u5b8c\u7d50\u306e\u97f3\u58f0\u51e6\u7406\u307e\u3067\u300215\u672c\u4ee5\u4e0a\u306e\u30d7\u30ed\u30d5\u30a7\u30c3\u30b7\u30e7\u30ca\u30eb\u30c4\u30fc\u30eb\u3002\u97f3\u6e90\u5206\u96e2\u3001\u30e9\u30a6\u30c9\u30cd\u30b9\u89e3\u6790\u3001\u30ce\u30a4\u30ba\u9664\u53bb\u3002\u3059\u3079\u3066\u304c\u3001\u3042\u306a\u305f\u306e\u97f3\u697d\u306e\u51fa\u767a\u70b9\u3002',
                'From hand-soldered microphones to browser-based audio processing. 15+ professional tools: source separation, loudness analysis, noise reduction. Everything starts with capturing your sound.',
                'Desde micr\u00f3fonos soldados a mano hasta procesamiento de audio en el navegador. 15+ herramientas profesionales: separaci\u00f3n de fuentes, an\u00e1lisis de volumen, reducci\u00f3n de ruido. Todo empieza capturando tu sonido.'
              ),
            },
            {
              num: '02',
              title: t('\u6210\u9577\u3059\u308b', 'Grow', 'Crece'),
              body: t(
                '\u30ec\u30c3\u30b9\u30f3\u306e\u66f8\u304d\u8d77\u3053\u3057\u3001\u548c\u58f0\u89e3\u6790\u3001\u30d4\u30c3\u30c1\u7cbe\u5ea6\u306e\u8ffd\u8de1\u3001\u7df4\u7fd2\u30ed\u30b0\u3002\u3042\u306a\u305f\u306e\u6210\u9577\u306f\u3001\u3059\u3079\u3066\u30c7\u30fc\u30bf\u306b\u306a\u308b\u3002\u53bb\u5e74\u306e\u81ea\u5206\u3068\u4eca\u306e\u81ea\u5206\u3092\u3001\u5ba2\u89b3\u7684\u306b\u6bd4\u3079\u3089\u308c\u308b\u3002',
                'Lesson transcription, harmony analysis, pitch tracking, practice logs. Your growth becomes data. Compare yourself today with yourself a year ago \u2014 objectively.',
                'Transcripci\u00f3n de lecciones, an\u00e1lisis arm\u00f3nico, seguimiento de afinaci\u00f3n, registros de pr\u00e1ctica. Tu crecimiento se convierte en datos. Comp\u00e1rate hoy con hace un a\u00f1o \u2014 objetivamente.'
              ),
            },
            {
              num: '03',
              title: t('\u898b\u3064\u304b\u308b', 'Be Discovered', 'S\u00e9 Descubierto'),
              body: t(
                '\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u3092\u516c\u958b\u3057\u3001\u6f14\u594f\u3092\u5171\u6709\u3057\u3001\u4e16\u754c\u4e2d\u306e\u97f3\u697d\u5bb6\u3068\u3064\u306a\u304c\u308b\u3002\u5171\u6f14\u76f8\u624b\u306e\u767a\u898b\u3001\u30b9\u30ab\u30a6\u30c8\u6a5f\u80fd\u3001\u591a\u8a00\u8a9e\u5bfe\u5fdc\u3002\u624d\u80fd\u304c\u6b63\u5f53\u306b\u8a55\u4fa1\u3055\u308c\u308b\u5834\u6240\u3092\u3002',
                'Publish your profile, share performances, connect with musicians worldwide. Find collaborators, get scouted, communicate across languages. A place where talent gets the recognition it deserves.',
                'Publica tu perfil, comparte actuaciones, con\u00e9ctate con m\u00fasicos de todo el mundo. Encuentra colaboradores, s\u00e9 descubierto, comun\u00edcate en varios idiomas. Un lugar donde el talento recibe el reconocimiento que merece.'
              ),
            },
          ] as const).map((pillar) => (
            <div key={pillar.num} style={{
              padding: 'clamp(2rem, 4vw, 3rem)',
              backgroundColor: '#fff',
              border: '1px solid rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.4s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 30px -8px rgba(0,0,0,0.06)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 200,
                color: 'rgba(2,132,199,0.12)', display: 'block',
                marginBottom: '0.3rem', fontFamily: sans, lineHeight: 1,
              }}>
                {pillar.num}
              </span>
              <h3 style={{
                fontSize: 'clamp(1.1rem, 1.8vw, 1.3rem)', fontWeight: 400,
                letterSpacing: '0.1em', margin: '0 0 1.2rem', color: '#111',
              }}>
                {pillar.title}
              </h3>
              <p style={{
                color: '#666', fontSize: 'clamp(0.83rem, 1.1vw, 0.9rem)',
                lineHeight: 2.1, fontFamily: sans, margin: 0,
              }}>
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6. APPS — Membership + Free
      ══════════════════════════════════════════ */}
      <section id="technology" style={{
        padding: 'clamp(5rem, 12vw, 9rem) clamp(1.5rem, 5vw, 3rem)',
        borderTop: '1px solid rgba(0,0,0,0.04)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)' }}>
          <p style={{
            fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)', fontWeight: 500, color: '#999',
            letterSpacing: '0.4em', textTransform: 'uppercase',
            marginBottom: 'clamp(1rem, 2vw, 1.5rem)', fontFamily: sans,
          }}>Apps</p>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 3.8vw, 2.4rem)', fontWeight: 300,
            letterSpacing: '0.1em', lineHeight: 1.5, margin: 0, color: '#111',
          }}>
            {t('\u3042\u306a\u305f\u306e\u6b66\u5668\u5eab\u3002',
               'Your arsenal.',
               'Tu arsenal.')}
          </h2>
        </div>

        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {/* Pro tier */}
          <div style={{
            marginBottom: 'clamp(2rem, 4vw, 3rem)',
            padding: 'clamp(2rem, 4vw, 3rem)',
            background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #0c4a6e 100%)',
            color: '#fff', borderRadius: '6px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 0, width: '40%', height: '100%',
              background: 'radial-gradient(circle at 80% 20%, rgba(2,132,199,0.15) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: 'clamp(1rem, 2vw, 1.5rem)', flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 700,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  padding: '0.3rem 1rem', borderRadius: '50px',
                  letterSpacing: '0.15em', fontFamily: sans,
                }}>PRO MEMBERSHIP</span>
                <span style={{
                  fontSize: '0.62rem', fontWeight: 700,
                  background: 'linear-gradient(135deg, #f59e0b, #f97316)',
                  color: '#000', padding: '0.3rem 1rem', borderRadius: '50px',
                  letterSpacing: '0.12em', fontFamily: sans,
                }}>COMING SOON</span>
              </div>
              <p style={{
                fontSize: 'clamp(0.88rem, 1.2vw, 0.95rem)',
                color: 'rgba(255,255,255,0.6)', fontFamily: sans,
                lineHeight: 1.8, margin: '0 0 clamp(1.5rem, 3vw, 2rem)',
                maxWidth: '600px',
              }}>
                {t('AI\u99c6\u52d5\u306e\u30b5\u30fc\u30d0\u30fc\u51e6\u7406\u30a2\u30d7\u30ea\u3002\u97f3\u6e90\u5206\u96e2\u3001\u66f8\u304d\u8d77\u3053\u3057\u3001\u548c\u58f0\u89e3\u6790\u3002\u30d7\u30ed\u30e1\u30f3\u30d0\u30fc\u306f\u7121\u5236\u9650\u3002',
                   'AI-powered server apps. Source separation, transcription, harmony analysis. Unlimited for Pro members.',
                   'Apps de servidor impulsadas por IA. Separaci\u00f3n de fuentes, transcripci\u00f3n, an\u00e1lisis arm\u00f3nico. Ilimitado para miembros Pro.')}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: 'clamp(1rem, 2vw, 1.5rem)',
              }}>
                {([
                  { name: 'KUON SEPARATOR',  desc: t('\u697d\u66f2\u3092\u30dc\u30fc\u30ab\u30eb\u30fb\u30c9\u30e9\u30e0\u30fb\u30d9\u30fc\u30b9\u30fb\u305d\u306e\u4ed6\u306b\u81ea\u52d5\u5206\u96e2', 'Auto-separate songs into vocals, drums, bass & more', 'Separa canciones en voces, bater\u00eda, bajo y m\u00e1s') },
                  { name: 'KUON SUBTITLE',   desc: t('\u6f14\u594f\u52d5\u753b\u306b\u591a\u8a00\u8a9e\u5b57\u5e55\u3092\u81ea\u52d5\u751f\u6210', 'Auto-generate multilingual subtitles for videos', 'Genera subt\u00edtulos multiling\u00fces autom\u00e1ticamente') },
                  { name: 'KUON HARMONY',    desc: t('\u30b3\u30fc\u30c9\u9032\u884c\u3092\u30ed\u30fc\u30de\u6570\u5b57\u3067\u81ea\u52d5\u89e3\u6790', 'Automatic chord analysis in Roman numerals', 'An\u00e1lisis arm\u00f3nico autom\u00e1tico en n\u00fameros romanos') },
                  { name: 'KUON TRANSCRIPT', desc: t('\u30ec\u30c3\u30b9\u30f3\u306e\u9332\u97f3\u3092AI\u304c\u66f8\u304d\u8d77\u3053\u3057', 'AI-powered lesson transcription', 'Transcripci\u00f3n de lecciones con IA') },
                  { name: 'KUON KARAOKE',    desc: t('\u30dc\u30fc\u30ab\u30eb\u9664\u53bb\u3067\u4f34\u594f\u30c8\u30e9\u30c3\u30af\u3092\u751f\u6210', 'Remove vocals to create accompaniment tracks', 'Elimina voces para crear pistas de acompa\u00f1amiento') },
                  { name: 'KUON EXERCISE',   desc: t('\u548c\u58f0\u8ab2\u984c\u3092\u81ea\u52d5\u751f\u6210\u30fb\u81ea\u52d5\u63a1\u70b9', 'Auto-generate & auto-grade harmony exercises', 'Genera y califica ejercicios de armon\u00eda') },
                ] as const).map((app) => (
                  <div key={app.name} style={{
                    padding: 'clamp(1rem, 2vw, 1.5rem)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <h4 style={{
                      fontSize: 'clamp(0.8rem, 1vw, 0.88rem)',
                      fontWeight: 600, letterSpacing: '0.06em',
                      margin: '0 0 0.4rem', fontFamily: sans,
                    }}>
                      {app.name}
                    </h4>
                    <p style={{
                      margin: 0, color: 'rgba(255,255,255,0.5)',
                      fontSize: 'clamp(0.75rem, 0.95vw, 0.82rem)',
                      lineHeight: 1.7, fontFamily: sans,
                    }}>
                      {app.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Free tools */}
          <p style={{
            fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)', fontWeight: 500, color: '#999',
            letterSpacing: '0.3em', textTransform: 'uppercase',
            marginBottom: '1rem', fontFamily: sans,
          }}>
            {t('\u7121\u6599\u30c4\u30fc\u30eb \u2014 \u30d6\u30e9\u30a6\u30b6\u3067\u3001\u3059\u3050\u306b\u3002', 'Free Tools \u2014 In your browser, instantly.', 'Herramientas Gratuitas \u2014 En tu navegador.')}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: '1px', backgroundColor: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.04)',
          }}>
            {([
              { name: 'NORMALIZE',    desc: t('\u30e9\u30a6\u30c9\u30cd\u30b9\u6b63\u898f\u5316', 'Loudness normalization', 'Normalizaci\u00f3n'), href: '/normalize-lp' },
              { name: 'MASTER CHECK', desc: t('\u30e9\u30a6\u30c9\u30cd\u30b9\u89e3\u6790', 'Loudness analysis', 'An\u00e1lisis'), href: '/master-check-lp' },
              { name: 'DSD PLAYER',   desc: t('DSD\u518d\u751f\u30fb\u5909\u63db', 'DSD playback', 'Reproductor DSD'), href: '/dsd-lp' },
              { name: 'PLAYER',       desc: t('24h MP3\u5171\u6709', '24h MP3 sharing', 'Compartir MP3'), href: '/player-lp' },
              { name: 'DECLIPPER',    desc: t('\u30af\u30ea\u30c3\u30d4\u30f3\u30b0\u4fee\u5fa9', 'Clipping repair', 'Reparaci\u00f3n'), href: '/declipper' },
              { name: 'CONVERTER',    desc: t('WAV\u2192MP3', 'WAV to MP3', 'WAV a MP3'), href: '/converter' },
              { name: 'RESAMPLER',    desc: t('\u30b5\u30f3\u30d7\u30eb\u30ec\u30fc\u30c8\u5909\u63db', 'Sample rate', 'Remuestreo'), href: '/resampler' },
              { name: 'NOISE REDUCE', desc: t('\u30ce\u30a4\u30ba\u9664\u53bb', 'Noise reduction', 'Reducci\u00f3n'), href: '/noise-reduction' },
            ] as const).map((tool) => (
              <Link key={tool.name} href={tool.href} style={{
                padding: 'clamp(0.9rem, 1.8vw, 1.3rem) clamp(1rem, 2vw, 1.5rem)',
                backgroundColor: '#fff', textDecoration: 'none', display: 'block',
                transition: 'background-color 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f9ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fff'; }}
              >
                <span style={{ fontSize: 'clamp(0.78rem, 1vw, 0.85rem)', fontWeight: 600, color: '#222', fontFamily: sans, letterSpacing: '0.04em' }}>
                  {tool.name}
                </span>
                <span style={{ display: 'block', fontSize: 'clamp(0.72rem, 0.9vw, 0.78rem)', color: '#aaa', fontFamily: sans, marginTop: '0.2rem' }}>
                  {tool.desc}
                </span>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'clamp(2rem, 4vw, 3rem)' }}>
            <Link href="/audio-apps" style={{
              color: ACCENT, fontSize: 'clamp(0.82rem, 1.05vw, 0.88rem)',
              letterSpacing: '0.08em', textDecoration: 'none', fontFamily: sans,
            }}>
              {t('\u3059\u3079\u3066\u306e\u30a2\u30d7\u30ea\u3092\u898b\u308b', 'View All Apps', 'Ver Todas las Apps')} &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7. MICROPHONE — 物理プロダクト
      ══════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(5rem, 12vw, 9rem) clamp(1.5rem, 5vw, 3rem)',
        borderTop: '1px solid rgba(0,0,0,0.04)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)', fontWeight: 500, color: '#999',
          letterSpacing: '0.4em', textTransform: 'uppercase',
          marginBottom: 'clamp(1rem, 2vw, 1.5rem)', fontFamily: sans,
        }}>Microphone</p>
        <h2 style={{
          fontSize: 'clamp(1.4rem, 3.8vw, 2.4rem)', fontWeight: 300,
          letterSpacing: '0.1em', lineHeight: 1.6, margin: '0 0 1rem', color: '#111',
        }}>
          {t('\u3042\u306a\u305f\u306e\u97f3\u3092\u3001\u4e16\u754c\u306b\u3002',
             'Your sound, to the world.',
             'Tu sonido, al mundo.')}
        </h2>
        <p style={{
          color: '#888', fontSize: 'clamp(0.85rem, 1.2vw, 0.95rem)',
          fontFamily: sans, lineHeight: 1.8, maxWidth: '480px', margin: '0 auto clamp(3rem, 6vw, 5rem)',
        }}>
          {t('\u4e00\u672c\u4e00\u672c\u3001\u624b\u306f\u3093\u3060\u3067\u3002\u6570\u5341\u4e07\u5186\u306e\u30de\u30a4\u30af\u3068\u540c\u7b49\u4ee5\u4e0a\u306e\u97f3\u8cea\u3092\u3001\u624b\u306e\u5c4a\u304f\u4fa1\u683c\u3067\u3002',
             'Hand-soldered, one by one. Sound rivaling microphones costing thousands, at a price you can reach.',
             'Soldados a mano, uno por uno. Sonido comparable a micr\u00f3fonos de miles, a un precio accesible.')}
        </p>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 'clamp(2rem, 4vw, 3rem)',
          justifyContent: 'center', maxWidth: '900px', margin: '0 auto',
        }}>
          {([
            {
              name: 'P-86S', badge: 'BESTSELLER', badgeColor: '#f59e0b',
              sub: t('\u30b9\u30c6\u30ec\u30aa\u30de\u30a4\u30af\u30ed\u30d5\u30a9\u30f3', 'Stereo Microphone', 'Micr\u00f3fono Est\u00e9reo'),
              price: t('\u00a516,900', '$99', '\u20ac92'),
              currency: t('\u7a0e\u8fbc', 'USD', 'EUR'),
              image: '/IMG_20260211_080312.png',
              desc: t('\u30d7\u30e9\u30b0\u30a4\u30f3\u30d1\u30ef\u30fc\u5bfe\u5fdc\u3002\u30b9\u30de\u30db\u306b\u633f\u3059\u3060\u3051\u3067\u3001\u30d7\u30ed\u306e\u9332\u97f3\u3092\u3002', 'Plug-in power. Just plug into your phone for pro recording.', 'Alimentaci\u00f3n plug-in. Solo con\u00e9ctalo a tu tel\u00e9fono.'),
            },
            {
              name: 'X-86S', badge: 'PRO', badgeColor: '#111',
              sub: t('\u30d7\u30ed\u30d5\u30a7\u30c3\u30b7\u30e7\u30ca\u30eb\u30b9\u30c6\u30ec\u30aa\u30de\u30a4\u30af\u30ed\u30d5\u30a9\u30f3', 'Professional Stereo Microphone', 'Micr\u00f3fono Est\u00e9reo Profesional'),
              price: t('\u00a539,600', '$279', '\u20ac259'),
              currency: t('\u7a0e\u8fbc', 'USD', 'EUR'),
              image: '/mic02.jpeg',
              desc: t('48V\u30d5\u30a1\u30f3\u30bf\u30e0\u96fb\u6e90\u3002\u30b9\u30bf\u30b8\u30aa\u54c1\u8cea\u3092\u30d5\u30a3\u30fc\u30eb\u30c9\u3067\u3002', '48V phantom power. Studio quality in the field.', 'Phantom 48V. Calidad de estudio en el campo.'),
            },
          ] as const).map((mic) => (
            <div key={mic.name} style={{
              flex: '1 1 340px', maxWidth: '420px',
              backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.05)',
              padding: 'clamp(2.5rem, 5vw, 3.5rem) clamp(2rem, 4vw, 3rem)',
              textAlign: 'center',
              transition: 'transform 0.4s ease, box-shadow 0.4s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{
                display: 'inline-block', fontSize: '0.6rem', fontWeight: 700, color: '#fff',
                backgroundColor: mic.badgeColor, padding: '0.2rem 0.8rem',
                borderRadius: '50px', letterSpacing: '0.12em', fontFamily: sans,
                marginBottom: '1.5rem',
              }}>{mic.badge}</span>
              <div style={{ position: 'relative', width: '100%', height: 'clamp(180px, 28vw, 260px)', marginBottom: '1.5rem' }}>
                <Image src={mic.image} alt={mic.name} fill style={{ objectFit: 'contain' }} unoptimized sizes="400px" />
              </div>
              <h3 style={{ fontSize: 'clamp(1.3rem, 2.2vw, 1.6rem)', fontWeight: 300, letterSpacing: '0.15em', margin: '0 0 0.3rem', color: '#111' }}>
                {mic.name}
              </h3>
              <p style={{ color: '#999', fontSize: 'clamp(0.72rem, 0.9vw, 0.78rem)', fontFamily: sans, margin: '0 0 1rem' }}>
                {mic.sub}
              </p>
              <p style={{ color: '#666', fontSize: 'clamp(0.82rem, 1.05vw, 0.88rem)', fontFamily: sans, lineHeight: 1.7, margin: '0 0 1.5rem' }}>
                {mic.desc}
              </p>
              <p style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 300, color: '#111', letterSpacing: '0.06em', margin: '0 0 0.2rem' }}>
                {mic.price}
              </p>
              <p style={{ color: '#bbb', fontSize: '0.72rem', fontFamily: sans, margin: '0 0 1.5rem' }}>
                {mic.currency}
              </p>
              <Link href="/microphone" style={{
                display: 'inline-block', padding: '0.85rem 2.2rem',
                border: '1px solid #222', color: '#222', fontSize: '0.8rem',
                letterSpacing: '0.1em', textDecoration: 'none', fontFamily: sans,
                borderRadius: '50px', transition: 'all 0.3s ease',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#222'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#222'; }}
              >
                {t('\u8a66\u8074\u3059\u308b', 'Listen', 'Escuchar')}
              </Link>
            </div>
          ))}
        </div>

        <p style={{
          marginTop: 'clamp(2.5rem, 5vw, 3.5rem)',
          color: '#bbb', fontSize: 'clamp(0.78rem, 1vw, 0.85rem)',
          fontFamily: sans, letterSpacing: '0.04em',
        }}>
          {t('\u30de\u30a4\u30af\u8cfc\u5165\u8005\u306f\u30e1\u30f3\u30d0\u30fc\u30b7\u30c3\u30d73\u30f6\u6708\u7121\u6599\u3002',
             'Microphone buyers get 3 months free membership.',
             'Compradores de micr\u00f3fonos: 3 meses de membres\u00eda gratis.')}
        </p>
      </section>

      {/* ══════════════════════════════════════════
          8. DISCOVER — スカウト・バッジ・承認
      ══════════════════════════════════════════ */}
      <section id="discover" style={{
        padding: 'clamp(6rem, 14vw, 10rem) clamp(1.5rem, 5vw, 3rem)',
        background: 'linear-gradient(180deg, #0c0c0c 0%, #111827 100%)',
        color: '#fff', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(2,132,199,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '750px', margin: '0 auto' }}>
          <p style={{
            fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)',
            fontWeight: 500, color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.4em', textTransform: 'uppercase',
            marginBottom: 'clamp(1.5rem, 3vw, 2rem)', fontFamily: sans,
          }}>
            Discover
          </p>
          <h2 style={{
            fontSize: 'clamp(1.4rem, 4vw, 2.6rem)',
            fontWeight: 300, letterSpacing: '0.12em',
            lineHeight: 1.6, margin: '0 0 clamp(1.5rem, 3vw, 2rem)',
          }}>
            {t('\u805e\u304b\u308c\u308b\u5834\u6240\u304c\u3001\n\u3042\u306a\u305f\u3092\u5909\u3048\u308b\u3002',
               'Being heard\nchanges everything.',
               'Ser escuchado\nlo cambia todo.')}
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: 'clamp(0.88rem, 1.3vw, 1rem)',
            fontFamily: sans, lineHeight: 2.0,
            margin: '0 0 clamp(3rem, 6vw, 5rem)',
          }}>
            {t('\u7a7a\u97f3\u958b\u767a\u306e\u30d7\u30ed\u30e1\u30f3\u30d0\u30fc\u306f\u3001\u305f\u3060\u30c4\u30fc\u30eb\u3092\u4f7f\u3046\u3060\u3051\u3067\u306f\u306a\u3044\u3002\n\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u3092\u516c\u958b\u3057\u3001\u6f14\u594f\u3092\u5171\u6709\u3057\u3001\u30b9\u30ab\u30a6\u30c8\u306e\u76ee\u306b\u7559\u307e\u308b\u3002\n\u624d\u80fd\u3092\u6301\u3063\u305f\u97f3\u697d\u5bb6\u304c\u3001\u6b63\u5f53\u306b\u8a55\u4fa1\u3055\u308c\u308b\u4ed5\u7d44\u307f\u3002',
               'Pro members don\u2019t just use tools.\nPublish your profile, share performances, and catch the eye of scouts.\nA system where talented musicians get the recognition they deserve.',
               'Los miembros Pro no solo usan herramientas.\nPublica tu perfil, comparte actuaciones y capta la atenci\u00f3n de scouts.\nUn sistema donde los m\u00fasicos talentosos reciben el reconocimiento que merecen.')}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2rem)',
            textAlign: 'center',
          }}>
            {([
              {
                icon: '\u2605',
                title: t('\u30d7\u30ed\u30d0\u30c3\u30b8', 'Pro Badge', 'Insignia Pro'),
                desc: t('\u30d7\u30ed\u30d5\u30a3\u30fc\u30eb\u306b\u8a8d\u5b9a\u30d0\u30c3\u30b8\u3002\n\u300c\u3053\u306e\u4eba\u306f\u672c\u6c17\u3060\u300d\u3068\u3044\u3046\u8a3c\u660e\u3002', 'A verified badge on your profile.\nProof that you\u2019re serious.', 'Una insignia verificada en tu perfil.\nPrueba de que vas en serio.'),
              },
              {
                icon: '\u{1F50D}',
                title: t('\u30b9\u30ab\u30a6\u30c8\u6a5f\u80fd', 'Scout Search', 'B\u00fasqueda Scout'),
                desc: t('\u697d\u5668\u30fb\u5730\u57df\u30fb\u30b9\u30bf\u30a4\u30eb\u3067\u691c\u7d22\u3002\n\u5171\u6f14\u76f8\u624b\u3082\u3001\u30c1\u30e3\u30f3\u30b9\u3082\u898b\u3064\u304b\u308b\u3002', 'Search by instrument, region, style.\nFind collaborators and opportunities.', 'Busca por instrumento, regi\u00f3n, estilo.\nEncuentra colaboradores y oportunidades.'),
              },
              {
                icon: '\u{1F310}',
                title: t('\u30b0\u30ed\u30fc\u30d0\u30eb\u5bfe\u5fdc', 'Global Reach', 'Alcance Global'),
                desc: t('\u591a\u8a00\u8a9e\u5b57\u5e55\u3001\u81ea\u52d5\u7ffb\u8a33\u3002\n\u8a00\u8449\u306e\u58c1\u3092\u8d8a\u3048\u3066\u3001\u97f3\u697d\u3067\u3064\u306a\u304c\u308b\u3002', 'Multilingual subtitles, auto-translation.\nConnect through music, beyond language.', 'Subt\u00edtulos multiling\u00fces, traducci\u00f3n autom\u00e1tica.\nCon\u00e9ctate a trav\u00e9s de la m\u00fasica.'),
              },
            ] as const).map((item) => (
              <div key={item.title} style={{ padding: 'clamp(1.5rem, 3vw, 2rem)' }}>
                <div style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', marginBottom: '0.8rem' }}>
                  {item.icon}
                </div>
                <h4 style={{
                  fontSize: 'clamp(0.88rem, 1.1vw, 0.95rem)',
                  fontWeight: 500, letterSpacing: '0.08em',
                  margin: '0 0 0.6rem', fontFamily: sans,
                }}>
                  {item.title}
                </h4>
                <p style={{
                  color: 'rgba(255,255,255,0.45)',
                  fontSize: 'clamp(0.78rem, 1vw, 0.85rem)',
                  lineHeight: 1.8, fontFamily: sans, margin: 0,
                }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          9. PRICING — 3 tiers
      ══════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(5rem, 12vw, 9rem) clamp(1.5rem, 5vw, 3rem)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)', fontWeight: 500, color: '#999',
          letterSpacing: '0.4em', textTransform: 'uppercase',
          marginBottom: 'clamp(1rem, 2vw, 1.5rem)', fontFamily: sans,
        }}>Membership</p>
        <h2 style={{
          fontSize: 'clamp(1.4rem, 3.8vw, 2.4rem)', fontWeight: 300,
          letterSpacing: '0.1em', lineHeight: 1.6, margin: '0 0 clamp(3.5rem, 7vw, 5rem)', color: '#111',
        }}>
          {t('\u7121\u6599\u3067\u59cb\u3081\u3066\u3001\n\u672c\u6c17\u306b\u306a\u3063\u305f\u3089\u4e0a\u3092\u76ee\u6307\u305d\u3046\u3002',
             'Start free.\nLevel up when you\u2019re ready.',
             'Empieza gratis.\nSube de nivel cuando est\u00e9s listo.')}
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          gap: 'clamp(1rem, 2.5vw, 1.5rem)',
          maxWidth: '1050px', margin: '0 auto',
          alignItems: 'start',
        }}>
          {/* Free */}
          <div style={{
            padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2rem)',
            border: '1px solid rgba(0,0,0,0.08)', backgroundColor: '#fff', textAlign: 'left',
          }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.15em', margin: '0 0 0.3rem', color: '#111', fontFamily: sans }}>FREE</h4>
            <p style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 200, color: '#111', margin: '0.5rem 0 1.8rem', fontFamily: sans }}>&yen;0</p>
            {([
              t('\u30d6\u30e9\u30a6\u30b6\u30c4\u30fc\u30eb\u5168\u3066\u7121\u5236\u9650', 'All browser tools \u2014 unlimited', 'Herramientas navegador \u2014 ilimitado'),
              t('\u30b5\u30fc\u30d0\u30fc\u30a2\u30d7\u30ea \u6708\u00d73', 'Server apps \u2014 3/month', 'Apps servidor \u2014 3/mes'),
              t('\u30ae\u30e3\u30e9\u30ea\u30fc\u95b2\u89a7', 'Gallery access', 'Acceso a galer\u00eda'),
            ] as const).map((item, i) => (
              <p key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', margin: '0 0 0.7rem', fontSize: 'clamp(0.8rem, 1vw, 0.86rem)', color: '#666', fontFamily: sans, lineHeight: 1.6 }}>
                <span style={{ color: '#ddd', flexShrink: 0 }}>&mdash;</span> {item}
              </p>
            ))}
          </div>

          {/* Student */}
          <div style={{
            padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2rem)',
            border: '2px solid ' + ACCENT, backgroundColor: '#fff', textAlign: 'left',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 'clamp(1rem, 2vw, 1.5rem)',
              backgroundColor: ACCENT, color: '#fff',
              padding: '0.3rem 0.9rem', fontSize: '0.58rem',
              fontWeight: 700, letterSpacing: '0.12em', fontFamily: sans,
            }}>
              {t('\u304a\u3059\u3059\u3081', 'POPULAR', 'POPULAR')}
            </div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.15em', margin: '0 0 0.3rem', color: '#111', fontFamily: sans }}>STUDENT</h4>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.5rem 0 0.3rem' }}>
              <span style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 200, color: '#111', fontFamily: sans }}>{t('\u00a5480', '$4', '\u20ac4')}</span>
              <span style={{ fontSize: '0.85rem', color: '#888', fontFamily: sans }}>{t('/\u6708', '/mo', '/mes')}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: ACCENT, fontFamily: sans, margin: '0 0 1.8rem' }}>
              {t('\u5e74\u6255\u3044\u00a54,800\uff082\u30f6\u6708\u7121\u6599\uff09', 'Annual \u00a54,800 (2 months free)', 'Anual \u00a54,800 (2 meses gratis)')}
            </p>
            {([
              { text: t('Free\u306e\u5168\u6a5f\u80fd', 'Everything in Free', 'Todo lo de Free'), bold: false },
              { text: t('\u30b5\u30fc\u30d0\u30fc\u30a2\u30d7\u30ea \u7121\u5236\u9650', 'Server apps \u2014 unlimited', 'Apps servidor \u2014 ilimitado'), bold: true },
              { text: t('\u7df4\u7fd2\u30ed\u30b0\u30fb\u6210\u9577\u30c7\u30fc\u30bf', 'Practice log & growth data', 'Registro y datos de crecimiento'), bold: true },
              { text: t('\u30ec\u30c3\u30b9\u30f3\u30ce\u30fc\u30c8\u4fdd\u5b58', 'Lesson note archive', 'Archivo de notas'), bold: true },
              { text: t('\u30b3\u30df\u30e5\u30cb\u30c6\u30a3\u30fbSNS\u6a5f\u80fd', 'Community & social features', 'Comunidad y funciones sociales'), bold: true },
              { text: t('\u6708\u00d71 \u30aa\u30f3\u30e9\u30a4\u30f3\u30af\u30ea\u30cb\u30c3\u30af', 'Monthly online clinic', 'Cl\u00ednica mensual'), bold: true },
            ] as const).map((item, i) => (
              <p key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.6rem', margin: '0 0 0.7rem',
                fontSize: 'clamp(0.8rem, 1vw, 0.86rem)',
                color: item.bold ? '#222' : '#999',
                fontWeight: item.bold ? 500 : 400,
                fontFamily: sans, lineHeight: 1.6,
              }}>
                <span style={{ color: ACCENT, flexShrink: 0 }}>+</span> {item.text}
              </p>
            ))}
          </div>

          {/* Pro */}
          <div style={{
            padding: 'clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2rem)',
            background: 'linear-gradient(180deg, #0c0c0c 0%, #1a1a2e 100%)',
            color: '#fff', textAlign: 'left',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: 0, right: 'clamp(1rem, 2vw, 1.5rem)',
              background: 'linear-gradient(135deg, #f59e0b, #f97316)',
              color: '#000', padding: '0.3rem 0.9rem', fontSize: '0.58rem',
              fontWeight: 700, letterSpacing: '0.12em', fontFamily: sans,
            }}>PRO</div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, letterSpacing: '0.15em', margin: '0 0 0.3rem', fontFamily: sans }}>PRO</h4>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.5rem 0 0.3rem' }}>
              <span style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', fontWeight: 200, fontFamily: sans }}>{t('\u00a52,980', '$22', '\u20ac20')}</span>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontFamily: sans }}>{t('/\u6708', '/mo', '/mes')}</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#f59e0b', fontFamily: sans, margin: '0 0 1.8rem' }}>
              {t('\u5e74\u6255\u3044\u00a529,800\uff082\u30f6\u6708\u7121\u6599\uff09', 'Annual \u00a529,800 (2 months free)', 'Anual \u00a529,800 (2 meses gratis)')}
            </p>
            {([
              { text: t('Student\u306e\u5168\u6a5f\u80fd', 'Everything in Student', 'Todo lo de Student'), bold: false },
              { text: t('\u30d7\u30ed\u30d0\u30c3\u30b8\uff08\u8a8d\u5b9a\u30de\u30fc\u30af\uff09', 'Pro Badge (verified mark)', 'Insignia Pro (marca verificada)'), bold: true },
              { text: t('\u30b9\u30ab\u30a6\u30c8\u691c\u7d22\u3067\u512a\u5148\u8868\u793a', 'Priority in scout search', 'Prioridad en b\u00fasqueda scout'), bold: true },
              { text: t('\u30ae\u30e3\u30e9\u30ea\u30fc\u512a\u5148\u63b2\u8f09', 'Priority gallery listing', 'Listado prioritario en galer\u00eda'), bold: true },
              { text: t('\u30b9\u30b1\u30b8\u30e5\u30fc\u30eb\u7ba1\u7406', 'Schedule management', 'Gesti\u00f3n de agenda'), bold: true },
              { text: t('\u6f14\u594f\u30d5\u30a3\u30fc\u30c9\u30d0\u30c3\u30af\u512a\u5148\u5bfe\u5fdc', 'Priority performance feedback', 'Retroalimentaci\u00f3n prioritaria'), bold: true },
              { text: t('\u300c\u7a7a\u97f3\u958b\u767a\u8a8d\u5b9a\u30a2\u30fc\u30c6\u30a3\u30b9\u30c8\u300d\u30ed\u30b4\u4f7f\u7528\u6a29', '"Kuon Certified Artist" logo usage', 'Uso del logo "Artista Certificado Kuon"'), bold: true },
            ] as const).map((item, i) => (
              <p key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.6rem', margin: '0 0 0.7rem',
                fontSize: 'clamp(0.8rem, 1vw, 0.86rem)',
                color: item.bold ? '#fff' : 'rgba(255,255,255,0.45)',
                fontWeight: item.bold ? 500 : 400,
                fontFamily: sans, lineHeight: 1.6,
              }}>
                <span style={{ color: '#f59e0b', flexShrink: 0 }}>+</span> {item.text}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          10. JOURNEY — ライフサイクル（タイムライン風）
      ══════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(5rem, 12vw, 9rem) clamp(1.5rem, 5vw, 3rem)',
        borderTop: '1px solid rgba(0,0,0,0.04)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)', fontWeight: 500, color: '#999',
          letterSpacing: '0.4em', textTransform: 'uppercase',
          marginBottom: 'clamp(1rem, 2vw, 1.5rem)', fontFamily: sans,
        }}>
          Your Journey
        </p>
        <h2 style={{
          fontSize: 'clamp(1.3rem, 3.5vw, 2.2rem)', fontWeight: 300,
          letterSpacing: '0.1em', lineHeight: 1.6, margin: '0 0 clamp(3.5rem, 7vw, 5rem)', color: '#111',
          wordBreak: 'keep-all',
        }}>
          {t('\u97f3\u697d\u5bb6\u306e\u4eba\u751f\u3001\u3059\u3079\u3066\u306e\u30d5\u30a7\u30fc\u30ba\u3067\u3002',
             'For every phase of a musician\u2019s life.',
             'Para cada fase de la vida de un m\u00fasico.')}
        </h2>

        <div style={{
          maxWidth: '700px', margin: '0 auto', textAlign: 'left',
        }}>
          {([
            {
              phase: t('\u97f3\u697d\u3092\u5fd7\u3059', 'Aspiring', 'Aspirante'),
              who: t('\u97f3\u697d\u9ad8\u6821\u751f\u30fb\u97f3\u5927\u53d7\u9a13\u751f\u30fb\u5439\u594f\u697d\u90e8\u54e1', 'Music high schoolers, conservatory applicants, wind ensemble members', 'Estudiantes de secundaria, aspirantes al conservatorio'),
              desc: t('\u548c\u58f0\u8ab2\u984c\u306e\u81ea\u52d5\u751f\u6210\u3067\u7121\u9650\u306b\u7df4\u7fd2\u3002\u5408\u594f\u304b\u3089\u81ea\u5206\u306e\u30d1\u30fc\u30c8\u3060\u3051\u62bd\u51fa\u3002',
                     'Practice harmony endlessly with auto-generated exercises. Extract your part from ensemble recordings.',
                     'Practica armon\u00eda sin fin con ejercicios autogenerados. Extrae tu parte de grabaciones de conjunto.'),
            },
            {
              phase: t('\u97f3\u697d\u3092\u5b66\u3076', 'Studying', 'Estudiando'),
              who: t('\u97f3\u5927\u751f\u30fb\u97f3\u697d\u5b66\u90e8\u751f', 'University music students', 'Estudiantes universitarios de m\u00fasica'),
              desc: t('\u30ec\u30c3\u30b9\u30f3\u3092\u66f8\u304d\u8d77\u3053\u3057\u3001\u30d4\u30c3\u30c1\u7cbe\u5ea6\u3092\u8ffd\u8de1\u3057\u3001\u6210\u9577\u3092\u30c7\u30fc\u30bf\u3067\u8a3c\u660e\u3059\u308b\u3002',
                     'Transcribe lessons, track pitch accuracy, prove your growth with data.',
                     'Transcribe lecciones, sigue la afinaci\u00f3n, demuestra tu crecimiento con datos.'),
            },
            {
              phase: t('\u97f3\u697d\u3067\u751f\u304d\u308b', 'Performing', 'Interpretando'),
              who: t('\u82e5\u624b\u6f14\u594f\u5bb6\u30fb\u30d5\u30ea\u30fc\u30e9\u30f3\u30b9\u97f3\u697d\u5bb6', 'Young professionals, freelance musicians', 'J\u00f3venes profesionales, m\u00fasicos freelance'),
              desc: t('\u30d7\u30ed\u30d0\u30c3\u30b8\u3067\u4fe1\u983c\u3092\u7372\u5f97\u3002\u30b9\u30b1\u30b8\u30e5\u30fc\u30eb\u7ba1\u7406\u3001\u5171\u6f14\u8005\u691c\u7d22\u3001\u591a\u8a00\u8a9e\u3067\u306e\u56fd\u969b\u4ea4\u6d41\u3002',
                     'Earn trust with a Pro badge. Manage schedules, find collaborators, connect globally.',
                     'Gana confianza con la insignia Pro. Gestiona horarios, encuentra colaboradores, con\u00e9ctate globalmente.'),
            },
            {
              phase: t('\u97f3\u697d\u3092\u4f1d\u3048\u308b', 'Teaching', 'Ense\u00f1ando'),
              who: t('\u8b1b\u5e2b\u30fb\u6559\u6388\u30fb\u97f3\u697d\u6559\u5ba4\u4e3b\u5bb0', 'Professors, private instructors, studio owners', 'Profesores, instructores privados'),
              desc: t('\u751f\u5f92\u306e\u6210\u9577\u30c7\u30fc\u30bf\u3092\u78ba\u8a8d\u3002\u548c\u58f0\u8ab2\u984c\u3092\u81ea\u52d5\u751f\u6210\u3057\u3066\u5bbf\u984c\u306b\u3002\u30ec\u30c3\u30b9\u30f3\u3092\u66f8\u304d\u8d77\u3053\u3057\u3066\u5171\u6709\u3002',
                     'Track student growth. Auto-generate harmony homework. Share lesson transcripts.',
                     'Sigue el crecimiento de estudiantes. Genera tareas de armon\u00eda. Comparte transcripciones de lecciones.'),
            },
          ] as const).map((stage, i) => (
            <div key={i} style={{
              display: 'flex', gap: 'clamp(1.5rem, 3vw, 2.5rem)',
              padding: 'clamp(1.5rem, 3vw, 2.5rem) 0',
              borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.06)' : 'none',
              alignItems: 'flex-start',
            }}>
              <div style={{ flexShrink: 0, width: 'clamp(90px, 14vw, 130px)', textAlign: 'right' }}>
                <p style={{
                  fontSize: 'clamp(0.9rem, 1.4vw, 1.1rem)', fontWeight: 400,
                  color: '#111', margin: '0 0 0.3rem', letterSpacing: '0.06em',
                }}>
                  {stage.phase}
                </p>
                <p style={{
                  fontSize: 'clamp(0.68rem, 0.85vw, 0.75rem)',
                  color: '#bbb', fontFamily: sans, margin: 0, lineHeight: 1.5,
                }}>
                  {stage.who}
                </p>
              </div>
              <p style={{
                flex: 1,
                fontSize: 'clamp(0.85rem, 1.1vw, 0.92rem)',
                color: '#555', fontFamily: sans, lineHeight: 2.0, margin: 0,
              }}>
                {stage.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          11. R&D — GPS
      ══════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 5vw, 3rem)',
        borderTop: '1px solid rgba(0,0,0,0.04)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)', fontWeight: 500, color: '#bbb',
          letterSpacing: '0.4em', textTransform: 'uppercase',
          marginBottom: '1rem', fontFamily: sans,
        }}>R&amp;D</p>
        <p style={{
          fontSize: 'clamp(0.88rem, 1.3vw, 0.98rem)', color: '#777', fontFamily: sans,
          lineHeight: 2.0, maxWidth: '580px', margin: '0 auto 1.5rem',
        }}>
          {t('\u7a7a\u97f3\u958b\u767a\u306f\u97f3\u97ff\u6280\u8853\u306b\u52a0\u3048\u3001GPS/RTK\u6e2c\u4f4d\u30a2\u30eb\u30b4\u30ea\u30ba\u30e0\u306e\u7814\u7a76\u958b\u767a\u3082\u884c\u3063\u3066\u3044\u307e\u3059\u3002\n\u300c\u7a7a\u300d\u3068\u300c\u97f3\u300d\u2014\u2014 \u7a7a\u304b\u3089\u306e\u4fe1\u53f7\u3068\u3001\u97f3\u306e\u6ce2\u3002\u4e8c\u3064\u306e\u898b\u3048\u306a\u3044\u529b\u3092\u3001\u6280\u8853\u3067\u6355\u3089\u3048\u308b\u3002',
             'Beyond audio, Kuon R&D develops GPS/RTK positioning algorithms.\n"Ku" (sky) and "On" (sound) \u2014 capturing two invisible forces through technology.',
             'Adem\u00e1s del audio, Kuon R&D desarrolla algoritmos GPS/RTK.\n"Ku" (cielo) y "On" (sonido) \u2014 capturando dos fuerzas invisibles.')}
        </p>
        <Link href="/gps" style={{
          color: ACCENT, fontSize: 'clamp(0.8rem, 1vw, 0.85rem)',
          letterSpacing: '0.08em', textDecoration: 'none', fontFamily: sans,
        }}>
          {t('GPS\u30c6\u30af\u30ce\u30ed\u30b8\u30fc', 'GPS Technology', 'Tecnolog\u00eda GPS')} &rarr;
        </Link>
      </section>

      {/* ══════════════════════════════════════════
          12. FAQ
      ══════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(5rem, 12vw, 9rem) clamp(1.5rem, 5vw, 3rem)',
        borderTop: '1px solid rgba(0,0,0,0.04)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)' }}>
          <h2 style={{
            fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontWeight: 300,
            letterSpacing: '0.15em', color: '#111',
          }}>FAQ</h2>
        </div>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {([
            {
              q: t('\u672c\u5f53\u306b\u7121\u6599\u3067\u4f7f\u3048\u307e\u3059\u304b\uff1f', 'Is it really free?', '\u00bfEs realmente gratis?'),
              a: t('\u306f\u3044\u3002\u30d6\u30e9\u30a6\u30b6\u5b8c\u7d50\u30c4\u30fc\u30eb\uff08NORMALIZE\u3001DECLIPPER\u3001DSD PLAYER\u306a\u3069\uff09\u306f\u3059\u3079\u3066\u7121\u6599\u30fb\u7121\u5236\u9650\u3067\u3059\u3002AI\u99c6\u52d5\u306e\u30b5\u30fc\u30d0\u30fc\u51e6\u7406\u30a2\u30d7\u30ea\u3082\u6708\u00d73\u307e\u3067\u7121\u6599\u3067\u304a\u4f7f\u3044\u3044\u305f\u3060\u3051\u307e\u3059\u3002', 'Yes. All browser tools (NORMALIZE, DECLIPPER, DSD PLAYER, etc.) are free and unlimited. AI-powered server apps are free up to 3 times per month.', 'S\u00ed. Todas las herramientas del navegador son gratuitas e ilimitadas. Las apps con IA son gratuitas hasta 3 veces al mes.'),
            },
            {
              q: t('\u30de\u30a4\u30af\u306f\u3069\u306e\u697d\u5668\u306b\u5411\u3044\u3066\u3044\u307e\u3059\u304b\uff1f', 'What instruments are the microphones for?', '\u00bfPara qu\u00e9 instrumentos son los micr\u00f3fonos?'),
              a: t('\u30a2\u30b3\u30fc\u30b9\u30c6\u30a3\u30c3\u30af\u697d\u5668\u5168\u822c\u306b\u5bfe\u5fdc\u3002\u30d4\u30a2\u30ce\u3001\u30d0\u30a4\u30aa\u30ea\u30f3\u3001\u30c1\u30a7\u30ed\u3001\u30d5\u30eb\u30fc\u30c8\u3001\u30ae\u30bf\u30fc\u306a\u3069\u3002AB\u65b9\u5f0f\u30b9\u30c6\u30ec\u30aa\u9332\u97f3\u3067\u7a7a\u9593\u306e\u97ff\u304d\u3092\u7f8e\u3057\u304f\u53ce\u9332\u3057\u307e\u3059\u3002', 'All acoustic instruments \u2014 piano, violin, cello, flute, guitar, etc. AB stereo recording captures beautiful spatial acoustics.', 'Todos los instrumentos ac\u00fasticos \u2014 piano, viol\u00edn, flauta, guitarra, etc. La grabaci\u00f3n est\u00e9reo AB captura la ac\u00fastica espacial.'),
            },
            {
              q: t('Student\u3068Pro\u306e\u9055\u3044\u306f\uff1f', 'What\u2019s the difference between Student and Pro?', '\u00bfCu\u00e1l es la diferencia entre Student y Pro?'),
              a: t('Student\u306f\u300c\u4f7f\u3048\u308b\u300d\u3002Pro\u306f\u300c\u898b\u3064\u304b\u308b\u300d\u3002Pro\u30e1\u30f3\u30d0\u30fc\u306f\u8a8d\u5b9a\u30d0\u30c3\u30b8\u3001\u30b9\u30ab\u30a6\u30c8\u691c\u7d22\u3067\u306e\u512a\u5148\u8868\u793a\u3001\u30b9\u30b1\u30b8\u30e5\u30fc\u30eb\u7ba1\u7406\u3001\u300c\u7a7a\u97f3\u958b\u767a\u8a8d\u5b9a\u30a2\u30fc\u30c6\u30a3\u30b9\u30c8\u300d\u30ed\u30b4\u306e\u4f7f\u7528\u6a29\u304c\u4ed8\u304d\u307e\u3059\u3002\u300c\u805e\u304b\u308c\u308b\u300d\u74b0\u5883\u3092\u624b\u306b\u5165\u308c\u305f\u3044\u65b9\u306b\u3002', 'Student means "use tools." Pro means "be discovered." Pro members get a verified badge, priority in scout search, schedule management, and the right to use the "Kuon Certified Artist" logo. For those who want to be heard.', 'Student significa "usar herramientas". Pro significa "ser descubierto". Los miembros Pro obtienen insignia verificada, prioridad en b\u00fasqueda scout, gesti\u00f3n de agenda y el logo "Artista Certificado Kuon".'),
            },
            {
              q: t('\u6d77\u5916\u304b\u3089\u3082\u8cfc\u5165\u30fb\u5229\u7528\u3067\u304d\u307e\u3059\u304b\uff1f', 'Can I buy/use from outside Japan?', '\u00bfPuedo comprar desde fuera de Jap\u00f3n?'),
              a: t('\u306f\u3044\u3002\u30b5\u30a4\u30c8\u306f\u65e5\u672c\u8a9e\u30fb\u82f1\u8a9e\u30fb\u30b9\u30da\u30a4\u30f3\u8a9e\u306b\u5bfe\u5fdc\u3002\u30de\u30a4\u30af\u306f35\u30ab\u56fd\u3078\u767a\u9001\u53ef\u80fd\uff08USD/EUR/GBP\u5bfe\u5fdc\uff09\u3002\u30a2\u30d7\u30ea\u306f\u30d6\u30e9\u30a6\u30b6\u304c\u3042\u308c\u3070\u4e16\u754c\u4e2d\u3069\u3053\u304b\u3089\u3067\u3082\u3002', 'Yes. The site supports Japanese, English, and Spanish. Microphones ship to 35 countries (USD/EUR/GBP). Apps work from anywhere with a browser.', 'S\u00ed. El sitio est\u00e1 en japon\u00e9s, ingl\u00e9s y espa\u00f1ol. Micr\u00f3fonos a 35 pa\u00edses (USD/EUR/GBP). Las apps funcionan desde cualquier lugar.'),
            },
          ] as const).map((faq, i) => (
            <div key={i} style={{
              padding: 'clamp(1.5rem, 3vw, 2rem) 0',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}>
              <h4 style={{
                fontSize: 'clamp(0.9rem, 1.2vw, 1rem)', fontWeight: 400,
                color: '#222', margin: '0 0 0.8rem', letterSpacing: '0.04em',
              }}>
                {faq.q}
              </h4>
              <p style={{
                color: '#777', fontSize: 'clamp(0.83rem, 1.08vw, 0.9rem)',
                fontFamily: sans, lineHeight: 2.0, margin: 0,
              }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          13. FINAL CTA
      ══════════════════════════════════════════ */}
      <section style={{
        padding: 'clamp(6rem, 14vw, 10rem) clamp(1.5rem, 5vw, 3rem)',
        borderTop: '1px solid rgba(0,0,0,0.04)',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: 'clamp(1.4rem, 4.5vw, 2.8rem)', fontWeight: 300,
          letterSpacing: '0.1em', lineHeight: 1.6, margin: '0 0 clamp(1rem, 2vw, 1.5rem)', color: '#111',
          wordBreak: 'keep-all',
        }}>
          {t('\u3042\u306a\u305f\u306e\u97f3\u697d\u306f\u3001\n\u3082\u3063\u3068\u9060\u304f\u307e\u3067\u5c4a\u304f\u3002',
             'Your music can reach\nfarther than you think.',
             'Tu m\u00fasica puede llegar\nm\u00e1s lejos de lo que crees.')}
        </h2>
        <p style={{
          color: '#999', fontSize: 'clamp(0.88rem, 1.2vw, 0.95rem)',
          fontFamily: sans, margin: '0 0 clamp(2.5rem, 5vw, 3.5rem)',
        }}>
          {t('\u30a2\u30ab\u30a6\u30f3\u30c8\u4e0d\u8981\u3002\u4eca\u3059\u3050\u7121\u6599\u3067\u4f7f\u3048\u307e\u3059\u3002',
             'No account needed. Start free, right now.',
             'Sin cuenta. Empieza gratis, ahora.')}
        </p>
        <Link href="/audio-apps" style={{
          padding: 'clamp(1.1rem, 1.8vw, 1.3rem) clamp(3rem, 6vw, 4rem)',
          backgroundColor: '#0c0c0c', color: '#fff',
          fontSize: 'clamp(0.85rem, 1.1vw, 0.92rem)',
          letterSpacing: '0.12em', textDecoration: 'none',
          borderRadius: '50px', fontFamily: sans,
          transition: 'all 0.4s ease', display: 'inline-block',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ACCENT; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 28px -6px rgba(2,132,199,0.35)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0c0c0c'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          {t('\u7121\u6599\u3067\u306f\u3058\u3081\u308b', 'Start Free', 'Empieza Gratis')}
        </Link>
      </section>

      {/* ══════════════════════════════════════════
          14. CONTACT
      ══════════════════════════════════════════ */}
      <section id="contact" style={{
        padding: 'clamp(5rem, 12vw, 9rem) clamp(1.5rem, 5vw, 3rem)',
        borderTop: '1px solid rgba(0,0,0,0.04)',
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 'clamp(0.65rem, 0.9vw, 0.72rem)', fontWeight: 500, color: '#999',
          letterSpacing: '0.4em', textTransform: 'uppercase',
          marginBottom: '1.2rem', fontFamily: sans,
        }}>Contact</p>
        <h2 style={{
          fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)', fontWeight: 300,
          letterSpacing: '0.15em', margin: '0 0 1.5rem', color: '#222',
        }}>
          {t('\u304a\u6c17\u8efd\u306b\u3069\u3046\u305e', 'Get in Touch', 'Cont\u00e1ctanos')}
        </h2>
        <p style={{
          color: '#888', fontSize: 'clamp(0.85rem, 1.2vw, 0.95rem)',
          fontFamily: sans, margin: '0 auto clamp(3rem, 6vw, 4rem)', maxWidth: '500px',
        }}>
          {t('\u30de\u30a4\u30af\u306e\u3053\u3068\u3001\u30a2\u30d7\u30ea\u306e\u3053\u3068\u3001\u9332\u97f3\u306e\u3053\u3068\u3002\u4f55\u3067\u3082\u304a\u6c17\u8efd\u306b\u3054\u9023\u7d61\u304f\u3060\u3055\u3044\u3002',
             'Questions about microphones, apps, or recording \u2014 feel free to reach out.',
             'Preguntas sobre micr\u00f3fonos, apps o grabaci\u00f3n \u2014 cont\u00e1ctanos.')}
        </p>

        <form action="https://formspree.io/f/xyknanzy" method="POST" style={{
          maxWidth: '500px', width: '100%', margin: '0 auto',
          display: 'flex', flexDirection: 'column',
          gap: 'clamp(1.5rem, 3vw, 2rem)', textAlign: 'left', fontFamily: sans,
        }}>
          {([
            { id: 'name', label: t('\u304a\u540d\u524d', 'Name', 'Nombre'), type: 'text' as const },
            { id: 'email', label: t('\u30e1\u30fc\u30eb\u30a2\u30c9\u30ec\u30b9', 'Email', 'Correo'), type: 'email' as const },
            { id: 'message', label: t('\u30e1\u30c3\u30bb\u30fc\u30b8', 'Message', 'Mensaje'), type: 'textarea' as const },
          ]).map((field) => (
            <div key={field.id}>
              <label htmlFor={field.id} style={{
                display: 'block', marginBottom: '0.5rem', color: '#999',
                fontSize: '0.68rem', letterSpacing: '0.14em', textTransform: 'uppercase',
              }}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea id={field.id} name={field.id} rows={4} required style={{
                  width: '100%', padding: '0.8rem 0', border: 'none',
                  borderBottom: '1px solid #ddd', background: 'transparent',
                  color: '#222', fontSize: '0.95rem', outline: 'none',
                  resize: 'vertical', lineHeight: 1.7, transition: 'border-color 0.3s', fontFamily: 'inherit',
                }}
                  onFocus={(e) => (e.target.style.borderBottomColor = ACCENT)}
                  onBlur={(e) => (e.target.style.borderBottomColor = '#ddd')}
                />
              ) : (
                <input type={field.type} id={field.id} name={field.id} required style={{
                  width: '100%', padding: '0.8rem 0', border: 'none',
                  borderBottom: '1px solid #ddd', background: 'transparent',
                  color: '#222', fontSize: '0.95rem', outline: 'none',
                  transition: 'border-color 0.3s', fontFamily: 'inherit',
                }}
                  onFocus={(e) => (e.target.style.borderBottomColor = ACCENT)}
                  onBlur={(e) => (e.target.style.borderBottomColor = '#ddd')}
                />
              )}
            </div>
          ))}
          <button type="submit" style={{
            marginTop: '1rem', padding: 'clamp(0.9rem, 1.5vw, 1.1rem) clamp(2.5rem, 5vw, 3.5rem)',
            alignSelf: 'center', cursor: 'pointer', background: 'transparent',
            color: ACCENT, border: '1px solid ' + ACCENT,
            fontSize: 'clamp(0.78rem, 1vw, 0.85rem)', letterSpacing: '0.12em',
            textTransform: 'uppercase', transition: 'all 0.3s ease', borderRadius: '50px',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ACCENT; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = ACCENT; }}
          >
            {t('\u9001\u4fe1\u3059\u308b', 'Send', 'Enviar')}
          </button>
        </form>
      </section>
    </div>
  );
}
