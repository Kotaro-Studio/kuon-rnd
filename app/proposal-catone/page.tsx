"use client";
import React, { useState } from 'react';

export default function CatOnePitchDeck() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const SECRET_PASSWORD = "catone1111";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === SECRET_PASSWORD) {
      setIsAuthenticated(true);
      setErrorMessage("");
    } else {
      setErrorMessage("パスワードが異なります。");
      setPasswordInput("");
    }
  };

  const accentColor = "var(--accent, #0284c7)";
  const textMain = "var(--text-main, #1f2937)";
  const textMuted = "var(--text-muted, #6b7280)";

  const glassCardStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 0, 0, 0.05)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
    borderRadius: '16px',
    padding: '3rem'
  };

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5%' }}>
        <div style={{ ...glassCardStyle, maxWidth: '500px', width: '100%', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: '#e11d48', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: '1rem' }}>Strictly Confidential</h2>
          <h3 style={{ fontSize: '1.6rem', fontWeight: '300', letterSpacing: '0.1em', margin: '0 0 2rem 0', color: textMain }}>CatOne 経営会議資料</h3>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Password" style={{ width: '100%', padding: '1.2rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)', textAlign: 'center', fontSize: '1.2rem', letterSpacing: '0.2em' }} />
            {errorMessage && <p style={{ color: '#e11d48', fontSize: '0.8rem', margin: '0' }}>{errorMessage}</p>}
            <button type="submit" style={{ backgroundColor: '#111827', color: '#fff', padding: '1.2rem', borderRadius: '50px', border: 'none', cursor: 'pointer', letterSpacing: '0.1em', fontWeight: 'bold' }}>資料を展開する</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fafafa', minHeight: '100vh', padding: '0 0 6rem 0', fontFamily: 'sans-serif', animation: 'fadeIn 0.5s ease' }}>
      
      {/* ヒーローセクション */}
      <section style={{ backgroundColor: '#111827', color: '#fff', padding: '6rem 5% 5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ color: '#38bdf8', letterSpacing: '0.2em', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.5rem' }}>BUSINESS INTEGRATION PITCH</p>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: '300', letterSpacing: '0.05em', lineHeight: '1.4', marginBottom: '2rem' }}>
            CatOne × 空音開発<br />
            <strong style={{ fontWeight: '600' }}>デュアル・エンジン収益モデルとFC展開構想</strong>
          </h1>
          <p style={{ fontSize: '1rem', color: '#9ca3af', lineHeight: '2', letterSpacing: '0.05em' }}>
            CatOneの既存の「捜索利益」はそのまま維持し、<br />
            空音開発のインフラによる「GPS捕獲利益」と「サブスク固定費」を新たに上乗せします。
          </p>
        </div>
      </section>

      <div style={{ maxWidth: '1000px', margin: '-3rem auto 0 auto', padding: '0 5%', position: 'relative', zIndex: 10 }}>
        
        {/* セクション1：料金体系と利益の棲み分け */}
        <section style={{ ...glassCardStyle, marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>💎</span>
            <h2 style={{ fontSize: '1.6rem', color: textMain, fontWeight: '300', letterSpacing: '0.1em' }}>CatOneの「新・料金体系」と役割分担</h2>
            <p style={{ color: textMuted, marginTop: '1rem', fontSize: '0.9rem', lineHeight: '1.8' }}>
              CatOneは従来のビジネスで高収益を上げ続けながら、同時にGPSによる「超・高利益率の瞬殺案件」を獲得。<br />
              空音開発は、その裏側でシステムを維持・管理する「固定費（サブスク）」を頂戴するスタイルです。
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            {/* 既存ビジネス */}
            <div style={{ flex: '1 1 300px', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ display: 'inline-block', backgroundColor: '#94a3b8', color: '#fff', fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: '50px', marginBottom: '1rem' }}>既存ビジネス（高単価）</span>
              <h3 style={{ fontSize: '1.2rem', color: textMain, marginBottom: '0.5rem' }}>捜索＋保護プラン</h3>
              <p style={{ fontSize: '2rem', fontWeight: '300', color: '#475569', margin: '0 0 1rem 0' }}>135,800<span style={{ fontSize: '1rem' }}>円〜</span></p>
              <ul style={{ color: textMuted, fontSize: '0.85rem', lineHeight: '1.8', paddingLeft: '1.2rem', margin: 0 }}>
                <li>ゼロからの足を使ったプロの捜索</li>
                <li>CatOneのメイン収益の柱として継続</li>
              </ul>
            </div>

            <div style={{ flex: '1 1 300px', padding: '2rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ display: 'inline-block', backgroundColor: '#94a3b8', color: '#fff', fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: '50px', marginBottom: '1rem' }}>既存ビジネス（条件付き）</span>
              <h3 style={{ fontSize: '1.2rem', color: textMain, marginBottom: '0.5rem' }}>保護のみプラン</h3>
              <p style={{ fontSize: '2rem', fontWeight: '300', color: '#475569', margin: '0 0 1rem 0' }}>73,580<span style={{ fontSize: '1rem' }}>円〜</span></p>
              <ul style={{ color: textMuted, fontSize: '0.85rem', lineHeight: '1.8', paddingLeft: '1.2rem', margin: 0 }}>
                <li>居場所が特定できている場合の捕獲</li>
              </ul>
            </div>

            {/* 新ビジネス（GPS） */}
            <div style={{ flex: '1 1 300px', padding: '2rem', backgroundColor: '#f0f9ff', borderRadius: '12px', border: `2px solid ${accentColor}`, position: 'relative' }}>
              <span style={{ position: 'absolute', top: '-12px', right: '20px', backgroundColor: accentColor, color: '#fff', fontSize: '0.75rem', padding: '0.3rem 1rem', borderRadius: '50px', fontWeight: 'bold' }}>NEW</span>
              <span style={{ display: 'inline-block', backgroundColor: accentColor, color: '#fff', fontSize: '0.75rem', padding: '0.3rem 0.8rem', borderRadius: '50px', marginBottom: '1rem' }}>サブスク会員限定</span>
              <h3 style={{ fontSize: '1.2rem', color: textMain, marginBottom: '0.5rem' }}>GPS緊急保護プラン</h3>
              <p style={{ fontSize: '2rem', fontWeight: '300', color: accentColor, margin: '0 0 1rem 0' }}>39,800<span style={{ fontSize: '1rem' }}>円</span></p>
              <ul style={{ color: textMuted, fontSize: '0.85rem', lineHeight: '1.8', paddingLeft: '1.2rem', margin: 0 }}>
                <li>数時間で完了する超高利益率の捕獲作業</li>
                <li><strong>CatOne：39,800円の利益を総取り</strong></li>
                <li><strong>空音開発：日々のサブスク管理費を獲得</strong></li>
              </ul>
            </div>
          </div>
        </section>

        {/* セクション2：有事のオペレーション */}
        <section style={{ ...glassCardStyle, marginBottom: '4rem', backgroundColor: '#fff' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>📱</span>
            <h2 style={{ fontSize: '1.6rem', color: textMain, fontWeight: '300', letterSpacing: '0.1em' }}>有事のスマート・オペレーション</h2>
            <p style={{ color: textMuted, marginTop: '1rem', fontSize: '0.9rem', lineHeight: '1.8' }}>
              CatOneの現場スタッフに複雑なシステム操作は一切不要です。<br />まるでスパイ映画のように、すべて空音開発が裏でコントロールします。
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
            {/* Step 1 */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', backgroundColor: '#fafafa', padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#e5e7eb', color: textMain, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: textMain }}>SOSの受信</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: textMuted }}>顧客からCatOneへ「逃げました！」と連絡が入る。</p>
              </div>
            </div>
            {/* Step 2 */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', backgroundColor: '#fafafa', padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: accentColor, color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: accentColor }}>空音開発への要請（LINE等）</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: textMuted }}>CatOneスタッフ：「お客様番号【001】から捕獲要請。至急居場所を教えてください」と空音開発にメッセージを送信。</p>
              </div>
            </div>
            {/* Step 3 */}
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', backgroundColor: '#111827', padding: '1.5rem', borderRadius: '12px', border: `1px solid ${accentColor}` }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#38bdf8', color: '#111827', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>3</div>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#38bdf8' }}>緊急レーダーの送信と現場急行</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#9ca3af', lineHeight: '1.6' }}>空音開発が即座に「緊急追跡モード」を遠隔起動。CatOneスタッフのスマホに<strong>『現在地がリアルタイムで点滅する専用のレーダーマップURL』</strong>が届き、それを見ながら現場で瞬時に捕獲完了。</p>
              </div>
            </div>
          </div>
        </section>

        {/* セクション3：FC展開構想 */}
        <section style={{ ...glassCardStyle, marginBottom: '6rem', backgroundColor: '#f8fafc' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>🚀</span>
            <h2 style={{ fontSize: '1.6rem', color: textMain, fontWeight: '300', letterSpacing: '0.1em' }}>全国フランチャイズ（FC）展開の青写真</h2>
          </div>
          <p style={{ color: textMuted, fontSize: '0.95rem', lineHeight: '2', textAlign: 'center', marginBottom: '2rem' }}>
            この「CatOne本部 ＋ 空音開発」の強力な連携インフラは、そのまま全国のFC展開にパッケージ化できます。<br />
            加盟店は高い技術がなくても、このレーダーを使うことで確実にプロとして結果が出せます。
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', textAlign: 'center' }}>
            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h4 style={{ color: textMain, marginBottom: '0.5rem' }}>CatOne本部（CEO）</h4>
              <p style={{ fontSize: '0.8rem', color: textMuted }}>全国のFC店から、高額な「加盟金」と「毎月のロイヤリティ」を獲得。</p>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h4 style={{ color: textMain, marginBottom: '0.5rem' }}>全国のFC加盟店</h4>
              <p style={{ fontSize: '0.8rem', color: textMuted }}>GPS案件をこなすことで、低リスク・短時間で高い利益を獲得。</p>
            </div>
            <div style={{ padding: '1.5rem', backgroundColor: '#fff', border: `1px solid ${accentColor}`, borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <h4 style={{ color: accentColor, marginBottom: '0.5rem' }}>空音開発</h4>
              <p style={{ fontSize: '0.8rem', color: textMuted }}>全国のFC店全体を支えるシステムの「月額保守・ライセンス費用」を獲得。</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}