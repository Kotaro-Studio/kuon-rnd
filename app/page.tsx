"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const heroContent = {
  title: "芸術と科学の融合",
  subtitle: "形なきものに意味を与え、「空」の中に在る存在を創造する",
  description: (
    <>
      Revoxのレストア技術、GPSによる精密な時空解析<br />
      そして最新のWebエッジテクノロジー<br />
      音響工学・Web・GPSアルゴリズムが描く、未来の研究開発スタジオ
    </>
  ),
  cta: "Kuon's Technology"
};

const visionContent = {
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
  profileImage: "/kotaro.jpeg",
  profileCta: "About Kotaro Asahina"
};

const featureCards = [
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
      { url: "/microphone", text: "無指向性マイクの哲学へ" },
      { url: "/revox", text: "Revox レストアの哲学へ" }
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
      { url: "/gps", text: "GPSテクノロジーの哲学へ" }
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
      { url: "/web", text: "Web・アプリ開発の哲学へ" }
    ]
  }
];

export default function Home() {
  return (
    <div style={{ padding: '0 5%' }}>
      
      {/* --- ■ 1. ヒーローセクション --- */}
      {/* ★ clamp(最小値, 推奨値, 最大値) という数式で、余白や文字サイズを画面に合わせて自動伸縮させます */}
      <section style={{ padding: 'clamp(6rem, 15vw, 12rem) 0 clamp(5rem, 10vw, 10rem) 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 4.5rem)', fontWeight: '100', letterSpacing: '0.15em', lineHeight: '1.4', margin: '0 0 2rem 0' }}>{heroContent.title}</h2>
        <p style={{ color: 'var(--accent)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontWeight: '300', letterSpacing: '0.15em', marginBottom: '2rem' }}>{heroContent.subtitle}</p>
        <p style={{ maxWidth: '850px', margin: '0 auto 4rem auto', color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '2.2', letterSpacing: '0.05em' }}>{heroContent.description}</p>
        <a href="#technology" className="nav-button" style={{ display: 'inline-block', padding: '1rem 3rem', borderRadius: '50px', fontSize: '0.9rem', letterSpacing: '0.1em', transition: 'all 0.3s' }}>{heroContent.cta}</a>
      </section>

      {/* --- ■ 2. Visionセクション --- */}
      <section id="vision" style={{ padding: 'clamp(5rem, 10vw, 8rem) 0', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>Vision</h3>
          <h4 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '200', letterSpacing: '0.1em', margin: '0' }}>{visionContent.title}</h4>
        </div>

        {/* ★ flexWrap: 'wrap' と flex: '1 1 300px' の組み合わせで、「画面が狭くなったら物理的に下に落ちる（縦並びになる）」仕組みです */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', flex: '0 0 auto' }}>
            <Image 
              src={visionContent.profileImage}
              alt="Kotaro Asahina"
              width={200}
              height={200}
              unoptimized={true}
              style={{ borderRadius: '50%', border: '4px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', objectFit: 'cover', marginBottom: '1.5rem' }}
            />
            <br />
            <Link href="/profile" className="nav-button" style={{ fontSize: '0.8rem', padding: '0.6rem 2rem', letterSpacing: '0.1em' }}>
              {visionContent.profileCta}
            </Link>
          </div>

          <div style={{ flex: '1 1 300px', minWidth: '280px' }}>
            <p style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: '100', letterSpacing: '0.15em', lineHeight: '1.8', margin: '0 0 2rem 0', color: 'var(--text-main)' }}>{visionContent.quote}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '2.2', letterSpacing: '0.05em' }}>{visionContent.text}</p>
          </div>
        </div>
      </section>

      {/* --- ■ 3. Technologyセクション --- */}
      <section id="technology" style={{ padding: 'clamp(5rem, 10vw, 8rem) 0', background: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 6vw, 5rem)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>Technology</h3>
          <h4 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '200', letterSpacing: '0.1em', margin: 0 }}>芸術と科学の、交差点。</h4>
        </div>

        {/* ★カードも同様に、無理やり横に並ばず、幅が足りなくなったら下に落ちて美しい縦並びになります */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', justifyContent: 'center' }}>
          {featureCards.map((card, index) => (
            <div key={index} className="glass-card" style={{ flex: '1 1 300px', minWidth: '280px', maxWidth: '100%', padding: '2.5rem', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(2, 132, 199, 0.08) 0%, rgba(2, 132, 199, 0) 70%)', opacity: 0, transition: 'opacity 0.5s' }} onMouseOver={(e) => { e.currentTarget.style.opacity = "1"; }} onMouseOut={(e) => { e.currentTarget.style.opacity = "0"; }} />

              <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', width: '100%', height: '150px', marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                  <Image src={card.image} alt={card.title} layout="fill" objectFit="cover" style={{ filter: 'contrast(0.9) brightness(1.02)' }} unoptimized={true} />
                </div>
                
                <span style={{ alignSelf: 'flex-start', fontSize: '0.75rem', color: 'var(--accent)', border: '1px solid var(--accent)', padding: '0.4rem 1rem', borderRadius: '50px', marginBottom: '1rem', letterSpacing: '0.05em' }}>{card.tag}</span>

                <h3 style={{ fontSize: '1.6rem', fontWeight: '400', margin: '0 0 1.5rem 0', letterSpacing: '0.1em' }}>{card.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '2', margin: 0, flex: 1 }}>{card.description}</p>
                
                {card.links && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1.5rem' }}>
                    {card.links.map((link, i) => (
                      <Link key={i} href={link.url}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.8rem 1.2rem', 
                          backgroundColor: 'rgba(2, 132, 199, 0.04)', 
                          border: '1px solid rgba(2, 132, 199, 0.3)', 
                          borderRadius: '8px',
                          color: 'var(--accent)', 
                          fontWeight: '500', 
                          fontSize: '0.85rem', letterSpacing: '0.1em', textDecoration: 'none', transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--accent)';
                          e.currentTarget.style.color = '#fff'; 
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(2, 132, 199, 0.2)';
                          e.currentTarget.style.transform = 'translateY(-3px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(2, 132, 199, 0.04)';
                          e.currentTarget.style.color = 'var(--accent)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <span>{link.text}</span>
                        <span style={{ fontSize: '1.2em' }}>→</span>
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
        <h3 style={{ fontSize: '1rem', fontWeight: '300', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1rem' }}>Contact</h3>
        <h4 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '200', letterSpacing: '0.1em', margin: '0 0 2rem 0' }}>さあ、一緒にプロジェクトを、始めよう</h4>
        <p style={{ color: 'var(--text-muted)', marginBottom: '4rem', fontSize: '1rem', letterSpacing: '0.05em' }}>金田式DC録音コンサルティング、GPSシステムの導入、最新Webエッジインフラの構築など、<br />技術と芸術に関するご相談はこちらから。</p>
        
        <form action="https://formspree.io/f/xyknanzy" method="POST" className="glass-card" style={{ maxWidth: '650px', width: '100%', margin: '0 auto', padding: 'clamp(2rem, 5vw, 3.5rem)', display: 'flex', flexDirection: 'column', gap: '1.8rem', textAlign: 'left' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>お名前</label>
            <input type="text" id="name" name="name" required style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.7)', color: 'var(--text-main)', fontSize: '1rem', outlineColor: 'var(--accent)' }} />
          </div>

          <div>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>メールアドレス</label>
            <input type="email" id="email" name="email" required style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.7)', color: 'var(--text-main)', fontSize: '1rem', outlineColor: 'var(--accent)' }} />
          </div>

          <div>
            <label htmlFor="message" style={{ display: 'block', marginBottom: '0.6rem', color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>お問い合わせ内容</label>
            <textarea id="message" name="message" rows={6} required style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: 'rgba(255,255,255,0.7)', color: 'var(--text-main)', fontSize: '1rem', outlineColor: 'var(--accent)', resize: 'vertical', lineHeight: '1.6' }} />
          </div>

          <button type="submit" className="nav-button" style={{ marginTop: '1.5rem', padding: '1rem 3rem', alignSelf: 'center', cursor: 'pointer', background: 'transparent', fontSize: '0.9rem' }}>
            メッセージを送る
          </button>
        </form>
      </section>

    </div>
  );
}