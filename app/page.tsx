"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// --- 多言語データ定義 ---
const siteContent = {
  ja: {
    hero: {
      title: "芸術と科学の融合",
      subtitle: "形なきものに意味を与え、「空」の中に在る存在を創造する",
      description: (
        <>
          Revoxのレストア技術、GPSによる精密な時空解析<br />
          そして最新のWebエッジテクノロジー<br />
          音響工学・Web・GPSアルゴリズムが描く、未来の研究開発スタジオ
        </>
      ),
      switchBtn: "Switch to English"
    },
    vision: {
      sectionTitle: "Vision",
      title: "空音開発",
      quote: "芸術は「空」であり、技術は「色」を創る",
      text: (
        <>
          「空音（くおん）」という名は、仏教用語の「久遠（永続）」と「空（形なき存在）」に由来します。<br />
          音は波であり、GPSは空からの情報です。<br />
          それぞれ実体はなくとも、これらは世界を少しだけ美しく、少しだけ生きやすくするためのこの世界の重要なシステムの一部で在ると言えます。<br />
          <br />
          音楽家:朝比奈幸太郎がたくさんの巨匠から受け継いだ技術と哲学を結集し、 空の中、そして意味のないもの（芸術）に意味を生み出すため、『空即是色』の世界を提供する異端の研究開発スタジオです。
        </>
      ),
      profileCta: "朝比奈幸太郎 プロフィール詳細"
    },
    technology: {
      sectionTitle: "Technology",
      title: "芸術と科学の、交差点。",
      cards: [
        {
          image: "/audio.png", 
          title: "Audio Engineering", 
          tag: "純粋アナログと叡智の継承",
          description: (
            <>
              無指向性マイクを厳選されたパーツとハンダ技術で一本一本手作りで制作。<br /><br />
              バーチ材を用いた密閉型スピーカー、選び抜かれたコンデンサーを惜しみなく投入したアンプ設計。<br /><br />
              <strong>Revox Restoring:</strong> また、人類が到達した最高峰のマスターレコーダーRevoxの叡智を、次世代に繋ぐ使命としてレストアを行っています。
            </>
          ),
          links: [
            { url: "/microphone", text: "無指向性マイクの哲学" },
            { url: "/revox", text: "Revox レストアの哲学" }
          ]
        },
        {
          image: "/gps.png", 
          title: "GPS Algorithm", 
          tag: "時空解析と社会実装",
          description: (
            <>
              株式会社ジオセンス・小林一英氏より学んだC言語を駆使し、通常の測位に加え、センチメートル級の精度を誇るRTK測位プログラムを開発。<br /><br />
              善意の基地局も準備中です。<br /><br />
              <strong>ペット探偵業界への提供:</strong> 空間と時間の交差点を解析する技術を、実社会の課題解決（ペット探偵システムの開発）に提供しています。
            </>
          ),
          links: [
            { url: "/gps", text: "GPSテクノロジーの哲学" },
            { url: "/gps#gps-tools", text: "オープンGPSツール群" }
          ]
        },
        {
          image: "/web.png", 
          title: "Program Development", 
          tag: "技術を統合する、知的なアプリ",
          description: (
            <>
              空音開発が設計するEQパラメータの自動添付や、初心者の音声編集を自動化するアプリを開発。<br /><br />
              オーディオとGPSの技術を有機的に統合します。<br /><br />
              <strong>Web Technology:</strong> また、ウェブ開発においては、WordPressを使わない、Headless CMSやエッジコンピューティングといった最新のWeb技術を用いて、超高速でセキュアなWebサイトを提供します。
            </>
          ),
          links: [
            { url: "/web", text: "Web・アプリ開発の哲学" }
          ]
        }
      ],
      detailText: "詳細を見る"
    },
    contact: {
      sectionTitle: "Contact",
      title: "さあ、一緒にプロジェクトを、始めよう",
      desc: (
        <>金田式DC録音コンサルティング、GPSシステムの導入、最新Webエッジインフラの構築など、<br />技術と芸術に関するご相談はこちらから。</>
      ),
      form: {
        name: "お名前",
        email: "メールアドレス",
        message: "お問い合わせ内容",
        submit: "メッセージを送る"
      }
    }
  },
  en: {
    hero: {
      title: "Fusion of Art and Science",
      subtitle: "Giving meaning to the formless, creating existence within 'Emptiness'",
      description: (
        <>
          Revox restoration technology, precise space-time analysis via GPS<br />
          and cutting-edge Web Edge technology.<br />
          A future R&D studio drawn by acoustic engineering, Web, and GPS algorithms.
        </>
      ),
      switchBtn: "日本語表示に切り替え"
    },
    vision: {
      sectionTitle: "Vision",
      title: "Kuon R&D",
      quote: "Art is 'Emptiness', Technology creates 'Form'",
      text: (
        <>
          The name "Kuon" is derived from the Buddhist terms "Kuon" (eternity) and "Ku" (formless existence).<br />
          Sound is a wave, and GPS is information from the sky.<br />
          Although neither has physical substance, they are essential parts of this world's systems that make it a little more beautiful and a little easier to live in.<br />
          <br />
          Bringing together the technology and philosophy inherited from many masters by musician Kotaro Asahina, we are a unique R&D studio providing a world of "Ku-soku-ze-shiki" (Form is Emptiness) to breathe meaning into the emptiness and the meaningless (art).
        </>
      ),
      profileCta: "About Kotaro Asahina"
    },
    technology: {
      sectionTitle: "Technology",
      title: "The Intersection of Art and Science.",
      cards: [
        {
          image: "/audio.png", 
          title: "Audio Engineering", 
          tag: "Pure Analog & Inheritance of Wisdom",
          description: (
            <>
              Omnidirectional microphones handcrafted one by one with carefully selected parts and soldering techniques.<br /><br />
              Amplifier design generously utilizing birch wood sealed speakers and carefully selected capacitors.<br /><br />
              <strong>Revox Restoring:</strong> We also restore Revox, the pinnacle of master recorders reached by humanity, as our mission to pass its wisdom to the next generation.
            </>
          ),
          links: [
            { url: "/microphone", text: "Philosophy of Omnidirectional Mic" },
            { url: "/revox", text: "Philosophy of Revox Restoration" }
          ]
        },
        {
          image: "/gps.png", 
          title: "GPS Algorithm", 
          tag: "Space-Time Analysis & Social Implementation",
          description: (
            <>
              Utilizing C language learned from Mr. Kazuhide Kobayashi of Geosense Inc., we develop RTK positioning programs boasting centimeter-level accuracy.<br /><br />
              Voluntary base stations are also in preparation.<br /><br />
              <strong>Provision to Pet Detectives:</strong> We provide technology that analyzes the intersection of space and time to solve real-world issues (development of pet detective systems).
            </>
          ),
          links: [
            { url: "/gps", text: "Philosophy of GPS Technology" },
            { url: "/gps#gps-tools", text: "Open GPS Tools" }
          ]
        },
        {
          image: "/web.png", 
          title: "Program Development", 
          tag: "Intelligent Apps Integrating Technology",
          description: (
            <>
              Developing apps that automate audio editing for beginners and automatically attach EQ parameters designed by Kuon R&D.<br /><br />
              Organically integrating audio and GPS technologies.<br /><br />
              <strong>Web Technology:</strong> In web development, we provide ultra-fast and secure websites using the latest web technologies such as Headless CMS and edge computing, without using WordPress.
            </>
          ),
          links: [
            { url: "/web", text: "Philosophy of Web/App Development" }
          ]
        }
      ],
      detailText: "View Details"
    },
    contact: {
      sectionTitle: "Contact",
      title: "Let's start a project together",
      desc: (
        <>Kaneda-style DC recording consulting, GPS system introduction, construction of the latest Web edge infrastructure, etc.<br />Please contact us here for consultations regarding technology and art.</>
      ),
      form: {
        name: "Name",
        email: "Email Address",
        message: "Message",
        submit: "Send Message"
      }
    }
  }
};

export default function Home() {
  // 言語ステート (デフォルトは 'ja')
  const [lang, setLang] = useState<'ja' | 'en'>('ja');
  const t = siteContent[lang];

  return (
    <div style={{ padding: '0 5%', fontFamily: '"Shippori Mincho", "Noto Serif JP", "Yu Mincho", "YuMincho", serif', color: '#1a1a1a', backgroundColor: '#fafafa' }}>
      
      {/* --- ■ 1. ヒーローセクション --- */}
      <section style={{ padding: 'clamp(8rem, 20vw, 15rem) 0 clamp(6rem, 15vw, 12rem) 0', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100vw', height: '100%', background: 'radial-gradient(circle at center top, rgba(189, 166, 120, 0.03) 0%, rgba(250, 250, 250, 0) 70%)', zIndex: -1, pointerEvents: 'none' }} />

        <h2 style={{ 
          fontSize: 'clamp(1.6rem, 3.5vw, 2.8rem)', 
          fontWeight: '300', 
          letterSpacing: '0.4em', 
          lineHeight: '1.6', 
          margin: '0 0 2.5rem 0',
          color: '#111'
        }}>
          {t.hero.title}
        </h2>
        
        <p style={{ 
          color: 'var(--accent, #bda678)', 
          fontSize: 'clamp(0.95rem, 1.5vw, 1.1rem)', 
          fontWeight: '400', 
          letterSpacing: '0.2em', 
          marginBottom: '3rem' 
        }}>
          {t.hero.subtitle}
        </p>
        
        <p style={{ 
          maxWidth: '750px', 
          margin: '0 auto 5rem auto', 
          color: '#555', 
          fontSize: '0.95rem', 
          lineHeight: '2.4', 
          letterSpacing: '0.1em',
          fontFamily: '"Helvetica Neue", Arial, sans-serif'
        }}>
          {t.hero.description}
        </p>

        {/* 🌐 言語切り替えボタン */}
        <button 
          onClick={() => setLang(lang === 'ja' ? 'en' : 'ja')}
          style={{ 
            display: 'inline-block', 
            padding: '1.2rem 3.5rem', 
            border: '1px solid var(--accent, #bda678)',
            color: 'var(--accent, #bda678)',
            fontSize: '0.85rem', 
            letterSpacing: '0.15em', 
            textTransform: 'uppercase',
            textDecoration: 'none',
            transition: 'all 0.4s ease',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontFamily: '"Helvetica Neue", Arial, sans-serif'
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.backgroundColor = 'var(--accent, #bda678)'; 
            e.currentTarget.style.color = '#fff'; 
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.backgroundColor = 'transparent'; 
            e.currentTarget.style.color = 'var(--accent, #bda678)'; 
          }}
        >
          {t.hero.switchBtn}
        </button>
      </section>

      {/* --- ■ 2. Visionセクション --- */}
      <section id="vision" style={{ padding: 'clamp(6rem, 12vw, 10rem) 0', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(4rem, 8vw, 6rem)' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: '400', color: '#888', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>{t.vision.sectionTitle}</h3>
          <h4 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: '300', letterSpacing: '0.2em', margin: '0', color: '#222' }}>{t.vision.title}</h4>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5rem', alignItems: 'flex-start', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', flex: '0 0 auto' }}>
            <div style={{ padding: '10px', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '50%', display: 'inline-block' }}>
              <Image 
                src="/kotaro.jpeg"
                alt="Kotaro Asahina"
                width={180}
                height={180}
                unoptimized={true}
                style={{ borderRadius: '50%', objectFit: 'cover', filter: 'grayscale(20%) contrast(1.1)' }}
              />
            </div>
          </div>

          <div style={{ flex: '1 1 300px', minWidth: '280px' }}>
            <p style={{ fontSize: 'clamp(1.3rem, 2.5vw, 1.6rem)', fontWeight: '300', letterSpacing: '0.15em', lineHeight: '2', margin: '0 0 2.5rem 0', color: '#222' }}>{t.vision.quote}</p>
            <div style={{ color: '#555', fontSize: '0.95rem', lineHeight: '2.4', letterSpacing: '0.08em', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
              {t.vision.text}
            </div>
            
            <div style={{ marginTop: '3rem' }}>
              <Link href="/profile" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '1rem',
                padding: '1rem 2.5rem', 
                backgroundColor: '#111', 
                color: '#fff',
                fontSize: '0.85rem', 
                letterSpacing: '0.15em',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                fontFamily: '"Helvetica Neue", Arial, sans-serif'
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.backgroundColor = 'var(--accent, #bda678)'; 
                e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(189, 166, 120, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.backgroundColor = '#111'; 
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <span>{t.vision.profileCta}</span>
                <span style={{ fontSize: '1.2em' }}>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- ■ 3. Technologyセクション --- */}
      <section id="technology" style={{ padding: 'clamp(6rem, 12vw, 10rem) 0', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(4rem, 8vw, 6rem)' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: '400', color: '#888', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>{t.technology.sectionTitle}</h3>
          <h4 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: '300', letterSpacing: '0.2em', margin: 0, color: '#222' }}>{t.technology.title}</h4>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'center' }}>
          {t.technology.cards.map((card, index) => (
            <div key={index} style={{ 
              flex: '1 1 300px', minWidth: '280px', maxWidth: '100%', 
              padding: '3rem', 
              backgroundColor: '#fff',
              border: '1px solid rgba(0,0,0,0.03)',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.02)',
              display: 'flex', flexDirection: 'column',
              transition: 'transform 0.4s ease, box-shadow 0.4s ease'
            }}
            >
              <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', width: '100%', height: '180px', marginBottom: '2rem', overflow: 'hidden' }}>
                  <Image src={card.image} alt={card.title} layout="fill" objectFit="cover" style={{ filter: 'grayscale(30%) contrast(0.95)' }} unoptimized={true} />
                </div>
                
                <span style={{ alignSelf: 'flex-start', fontSize: '0.7rem', color: 'var(--accent, #bda678)', borderBottom: '1px solid var(--accent, #bda678)', paddingBottom: '0.3rem', marginBottom: '1.5rem', letterSpacing: '0.1em', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>{card.tag}</span>

                <h3 style={{ fontSize: '1.4rem', fontWeight: '400', margin: '0 0 1.5rem 0', letterSpacing: '0.15em', color: '#111' }}>{card.title}</h3>
                <div style={{ color: '#666', fontSize: '0.9rem', lineHeight: '2.2', margin: 0, flex: 1, fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>{card.description}</div>
                
                {card.links && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '2rem' }}>
                    {card.links.map((link, i) => (
                      <Link key={i} href={link.url}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '1rem 1.5rem',
                          backgroundColor: '#fafafa', 
                          border: '1px solid #eaeaea',
                          color: '#222', 
                          fontWeight: '500', 
                          fontSize: '0.85rem', 
                          letterSpacing: '0.05em', 
                          textDecoration: 'none', 
                          transition: 'all 0.3s ease',
                          fontFamily: '"Helvetica Neue", Arial, sans-serif'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#fff';
                          e.currentTarget.style.borderColor = 'var(--accent, #bda678)';
                          e.currentTarget.style.boxShadow = '0 8px 15px -5px rgba(189, 166, 120, 0.2)';
                          e.currentTarget.style.color = 'var(--accent, #bda678)'; 
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#fafafa';
                          e.currentTarget.style.borderColor = '#eaeaea';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.color = '#222';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <span>{link.text}</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'inherit', letterSpacing: '0.1em' }}>
                          {t.technology.detailText} <span style={{ fontSize: '1.2em', verticalAlign: 'middle' }}>→</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- ■ 4. Contactセクション --- */}
      <section id="contact" style={{ padding: 'clamp(6rem, 12vw, 10rem) 0', textAlign: 'center' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: '400', color: '#888', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1.5rem', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>{t.contact.sectionTitle}</h3>
        <h4 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: '300', letterSpacing: '0.2em', margin: '0 0 2.5rem 0', color: '#222' }}>{t.contact.title}</h4>
        <p style={{ color: '#666', marginBottom: '5rem', fontSize: '0.95rem', letterSpacing: '0.1em', lineHeight: '2.2', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>{t.contact.desc}</p>
        
        <form action="https://formspree.io/f/xyknanzy" method="POST" style={{ maxWidth: '600px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem', textAlign: 'left', fontFamily: '"Helvetica Neue", Arial, sans-serif' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.8rem', color: '#888', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t.contact.form.name}</label>
            <input type="text" id="name" name="name" required style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '1px solid #ccc', background: 'transparent', color: '#222', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent, #bda678)'} onBlur={(e) => e.target.style.borderBottomColor = '#ccc'} />
          </div>

          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.8rem', color: '#888', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t.contact.form.email}</label>
            <input type="email" id="email" name="email" required style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '1px solid #ccc', background: 'transparent', color: '#222', fontSize: '1rem', outline: 'none', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent, #bda678)'} onBlur={(e) => e.target.style.borderBottomColor = '#ccc'} />
          </div>

          <div>
            <label htmlFor="message" style={{ display: 'block', marginBottom: '0.8rem', color: '#888', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t.contact.form.message}</label>
            <textarea id="message" name="message" rows={4} required style={{ width: '100%', padding: '1rem 0', border: 'none', borderBottom: '1px solid #ccc', background: 'transparent', color: '#222', fontSize: '1rem', outline: 'none', resize: 'vertical', lineHeight: '1.8', transition: 'border-color 0.3s' }} onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent, #bda678)'} onBlur={(e) => e.target.style.borderBottomColor = '#ccc'} />
          </div>

          <button type="submit" style={{ 
            marginTop: '2rem', 
            padding: '1.2rem 4rem', 
            alignSelf: 'center', 
            cursor: 'pointer', 
            background: 'transparent',
            color: 'var(--accent, #bda678)',
            border: '1px solid var(--accent, #bda678)',
            fontSize: '0.85rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            transition: 'all 0.4s ease'
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.backgroundColor = 'var(--accent, #bda678)'; 
            e.currentTarget.style.color = '#fff'; 
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.backgroundColor = 'transparent'; 
            e.currentTarget.style.color = 'var(--accent, #bda678)'; 
          }}
          >
            {t.contact.form.submit}
          </button>
        </form>
      </section>

    </div>
  );
}