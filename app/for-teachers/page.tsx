'use client';

/**
 * 教師向け説明 LP — 限定公開ページ
 *
 * 隠し設計 (CLAUDE.md §44.9):
 *   - 本番サイト (header/footer/sitemap/index ページ) からリンクしない
 *   - パスワード "kuon" でゲート
 *   - /admin/coupons からのみ到達可能
 *
 * 内容構成 (IQ 90-105 の音楽教師が完璧に理解できることを目的):
 *   1. ヒーロー: 何のためのページか
 *   2. 教師が手に入れるもの (Symphony 無償 + 学生コード発行権)
 *   3. 学生が受ける割引 (月額 / 年額の 2 シナリオ・図解)
 *   4. 12 ヶ月の節約額 (具体的な金額表)
 *   5. 使い方 (3 ステップ)
 *   6. なぜこの制度を作ったのか (ストーリー)
 *   7. FAQ (8 問)
 *   8. 次のアクション
 *
 * デザイン方針:
 *   - 楽譜のような優雅さ: 明朝体ヘッダー + 余白多め
 *   - 価格は大きく目立つ
 *   - 矢印 / タイムラインで時系列を視覚化
 *   - 専門用語は使わない (subscription, promotion code 等は「月額」「割引コード」と言い換え)
 */

import { useState, useEffect } from 'react';

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", "Fira Code", Consolas, monospace';

const ACCENT = '#0284c7';
const GOLD = '#b45309';
const BG_CREAM = '#fafaf7';

const TEACHER_LP_PASSWORD = 'kuon';
const STORAGE_KEY = 'kuon_teacher_lp_unlocked';

export default function ForTeachersPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // ハイドレーション完了 + localStorage チェック
  useEffect(() => {
    setHydrated(true);
    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') {
        setUnlocked(true);
      }
    } catch { /* silent */ }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwInput.trim().toLowerCase() === TEACHER_LP_PASSWORD) {
      setUnlocked(true);
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* silent */ }
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  // ハイドレーション前は何も出さない (FOUC 防止)
  if (!hydrated) {
    return <div style={{ minHeight: '100vh', background: BG_CREAM }} />;
  }

  // パスワードゲート
  if (!unlocked) {
    return (
      <div style={{
        minHeight: '100vh',
        background: BG_CREAM,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: sans,
      }}>
        <div style={{
          maxWidth: 420,
          width: '100%',
          background: '#fff',
          borderRadius: 16,
          padding: '3rem 2rem',
          boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: serif, fontSize: '1.4rem', fontWeight: 400, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
            教師向け案内
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '2rem' }}>
            限定公開ページです
          </div>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={pwInput}
              onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
              placeholder="パスワード"
              autoFocus
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                fontSize: '1rem',
                border: pwError ? '2px solid #ef4444' : '1px solid #cbd5e1',
                borderRadius: 8,
                outline: 'none',
                fontFamily: sans,
                color: '#0f172a',
                marginBottom: '1rem',
                boxSizing: 'border-box',
                background: '#fff',
              }}
            />
            {pwError && (
              <div style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>
                パスワードが違います
              </div>
            )}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                background: ACCENT,
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: sans,
              }}
            >
              開く
            </button>
          </form>
          <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6 }}>
            このページは関係者限定です。<br />
            URL とパスワードを共有していただいた方のみアクセスください。
          </div>
        </div>
      </div>
    );
  }

  // 本編
  return (
    <div style={{ minHeight: '100vh', background: BG_CREAM, color: '#0f172a', fontFamily: sans }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        .fade-in { animation: fadeIn 0.6s ease-out both; }
      `}</style>

      {/* ヒーロー */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) 1.5rem clamp(2rem, 6vw, 4rem)', maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: GOLD, fontWeight: 700, marginBottom: '1rem' }}>
          KUON R&D · TEACHER PARTNERSHIP
        </div>
        <h1 className="fade-in" style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 400, lineHeight: 1.4, color: '#0f172a', marginBottom: '1.5rem', letterSpacing: '0.02em' }}>
          あなたの学生に、<br />
          最高の学割を。
        </h1>
        <p className="fade-in" style={{ fontSize: 'clamp(0.95rem, 1.6vw, 1.05rem)', color: '#475569', lineHeight: 1.9, maxWidth: 640, margin: '0 auto', wordBreak: 'keep-all' }}>
          音楽教育に携わってくださる先生方へ。<br />
          空音開発（Kuon R&amp;D）から、<br />
          先生と先生の学生さんに専用のご案内です。
        </p>
        <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          このページは限定公開です。読み終わったらブラウザを閉じてください。
        </div>
      </section>

      {/* 区切り */}
      <Divider />

      {/* セクション 1: 空音開発とは */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 760, margin: '0 auto' }}>
        <SectionLabel num="01" />
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 400, color: '#0f172a', marginBottom: '1.5rem', letterSpacing: '0.02em' }}>
          空音開発について、簡単に
        </h2>
        <p style={{ fontSize: '1rem', lineHeight: 1.95, color: '#334155', wordBreak: 'keep-all', marginBottom: '1rem' }}>
          空音開発は、音楽家・録音エンジニア・音大生のためのオンラインツール 33 種類を提供しています。
          ピッチ分析、音源分離、譜起こし、聴音トレーニング、ノーマライズ、リサンプル、DDP チェッカー、
          DSD コンバーターなど、プロの現場で使われるツールが、すべてブラウザだけで動きます。
        </p>
        <p style={{ fontSize: '1rem', lineHeight: 1.95, color: '#334155', wordBreak: 'keep-all', marginBottom: '1rem' }}>
          代表は音大出身のエンジニア・朝比奈幸太郎。「音大時代に、自分が必要だったツールを作る」という
          想いから始まった研究開発プロジェクトです。
        </p>
        <p style={{ fontSize: '1rem', lineHeight: 1.95, color: '#334155', wordBreak: 'keep-all' }}>
          詳しくは <a href="https://kuon-rnd.com" target="_blank" rel="noreferrer" style={{ color: ACCENT, textDecoration: 'underline' }}>kuon-rnd.com</a> をご覧ください。
        </p>
      </section>

      <Divider />

      {/* セクション 2: 教師が手に入れるもの */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 880, margin: '0 auto' }}>
        <SectionLabel num="02" />
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 400, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
          先生が手に入れるもの
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.8 }}>
          教育に関わる先生方には、以下の二つをご提供します。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <BenefitCard
            icon="🎁"
            title="Symphony プラン無償提供"
            price="¥2,480 / 月相当"
            desc="Kuon の最上位プランを無料でお使いいただけます。33 種類のツールすべてが無制限。本来は月額 ¥2,480 のプロ向けプラン。"
          />
          <BenefitCard
            icon="🎓"
            title="先生専用 学生割引コード"
            price="例: ASAHINA-30"
            desc="先生のお名前のついた割引コードを発行します。学生さんに渡せば、Kuon が初月 50% OFF + 12 ヶ月 30% OFF で使えるようになります。"
          />
        </div>

        <div style={{ marginTop: '2rem', padding: '1.2rem 1.5rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, fontSize: '0.9rem', color: '#7c2d12', lineHeight: 1.8 }}>
          ✨ <strong>大切なこと：</strong>これは「お金を稼ぐ仕組み」ではありません。
          先生方への感謝と、先生の学生さんが安価で本格的なツールを使えるようにするための仕組みです。
          紹介報酬や成果報酬はありませんが、その分、先生のお名前を冠したコードを通じて、
          学生さんから「先生のおかげで使えている」という感謝が直接届きます。
        </div>
      </section>

      <Divider />

      {/* セクション 3: 学生が受ける割引 (月額) */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 880, margin: '0 auto' }}>
        <SectionLabel num="03" />
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 400, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
          学生さんが受ける割引（月払いの場合）
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.8 }}>
          学生さんが月払いを選んだ場合、以下の流れで割引が自動的に適用されます。
        </p>

        <Timeline
          phases={[
            {
              label: '最初の 1 ヶ月',
              big: '50% OFF',
              color: '#10b981',
              detail: 'まずは半額でお試し。Concerto なら ¥740（通常 ¥1,480）。',
            },
            {
              label: 'その後 12 ヶ月',
              big: '30% OFF',
              color: '#0284c7',
              detail: '学生割引が 12 ヶ月続きます。Concerto なら ¥1,036/月（通常 ¥1,480）。',
            },
            {
              label: '13 ヶ月目以降',
              big: '通常価格に戻る',
              color: '#64748b',
              detail: '学割期間終了後は自動的に通常価格になります。Concerto ¥1,480/月。',
            },
          ]}
        />

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '1rem', textTransform: 'uppercase' }}>
            12 ヶ月分の支払い試算（月払いの場合）
          </div>
          <PaymentTable rows={[
            { plan: 'Prelude（一番お手頃）', m1: '¥390', m2: '¥546 × 11 ヶ月', total: '¥6,396', save: '¥2,964' },
            { plan: 'Concerto（学生に人気）', m1: '¥740', m2: '¥1,036 × 11 ヶ月', total: '¥12,136', save: '¥5,624' },
          ]} />
        </div>
      </section>

      {/* セクション 4: 学生が受ける割引 (年額) */}
      <section style={{ padding: 'clamp(2rem, 4vw, 3rem) 1.5rem clamp(3rem, 6vw, 5rem)', maxWidth: 880, margin: '0 auto' }}>
        <SectionLabel num="04" />
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 400, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
          学生さんが受ける割引（年払いの場合）
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.8 }}>
          学生さんが年払いを選んだ場合、最初の 1 年がぐっとお得になります。<br />
          <strong style={{ color: '#7c2d12' }}>※ 実は年払いが最もお得です。</strong>
        </p>

        <Timeline
          phases={[
            {
              label: '最初の 1 年',
              big: '30% OFF',
              color: '#0284c7',
              detail: '年額にも 30% OFF が乗ります。Concerto なら ¥10,360（通常 ¥14,800）で 1 年分一括。',
            },
            {
              label: '2 年目以降',
              big: '通常価格に戻る',
              color: '#64748b',
              detail: 'Concerto ¥14,800/年。1 年使った後の自動更新です。',
            },
          ]}
        />

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '1rem', textTransform: 'uppercase' }}>
            1 年分の支払い試算（年払いの場合）
          </div>
          <PaymentTable rows={[
            { plan: 'Prelude 年額', m1: '¥5,460（1 年一括）', m2: '—', total: '¥5,460', save: '¥3,900' },
            { plan: 'Concerto 年額', m1: '¥10,360（1 年一括）', m2: '—', total: '¥10,360', save: '¥7,400' },
          ]} highlight />
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1.2rem 1.5rem', background: '#ecfeff', border: '1px solid #67e8f9', borderRadius: 10, fontSize: '0.9rem', color: '#0e7490', lineHeight: 1.8 }}>
          💡 <strong>なぜ年払いが最もお得？</strong><br />
          年額プランには元々「2 ヶ月分無料」のサービスが含まれています。
          そこに学生割引 30% OFF が重なるので、合計で約 42% OFF と同じ計算になります。
          学生さんに年払いをお勧めしてあげると、より長く Kuon を使ってもらえます。
        </div>
      </section>

      <Divider />

      {/* セクション 5: 使い方 */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 880, margin: '0 auto' }}>
        <SectionLabel num="05" />
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 400, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
          コードの使い方（とてもシンプルです）
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '2.5rem', lineHeight: 1.8 }}>
          先生が学生さんに渡すのは、URL（リンク）一つだけ。3 ステップで完了します。
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <Step
            num="1"
            title="私から URL を受け取る"
            desc="ミーティング後、先生のお名前を冠した URL を私から個別にお送りします。例えばこんな形です。"
            example="https://kuon-rnd.com/?coupon=ASAHINA-30"
          />
          <Step
            num="2"
            title="その URL を学生さんに送る"
            desc="LINE、メール、Slack、何でも結構です。「これを使ってみて」と一言添えていただければ大丈夫です。"
            example="先生：「Kuon ってツール、こちらから登録すると割引で使えるよ → 上記URL」"
          />
          <Step
            num="3"
            title="学生さんがクリック → 自動で割引適用"
            desc="学生さんが URL をクリックして購入手続きをすると、自動的に学生割引が適用されます。先生も学生さんも、コードを手入力する必要はありません。"
            example="購入画面で「Concerto First Month 50% Off -¥740」と表示されます"
          />
        </div>
      </section>

      <Divider />

      {/* セクション 6: なぜこの制度を作ったか */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 760, margin: '0 auto' }}>
        <SectionLabel num="06" />
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 400, color: '#0f172a', marginBottom: '1.5rem', letterSpacing: '0.02em' }}>
          なぜこの制度を作ったのか
        </h2>
        <div style={{ fontSize: '1rem', lineHeight: 2, color: '#334155', wordBreak: 'keep-all' }}>
          <p style={{ marginBottom: '1.2rem' }}>
            私自身、音大時代に「市販のプロ用録音機材は数十万円。学生にはとても買えない」という現実に直面しました。
            空音開発を立ち上げたのは、「音大生でも届く価格で、プロ品質のツールを」という想いからです。
          </p>
          <p style={{ marginBottom: '1.2rem' }}>
            ですが、ツールがあっても、それを「使ってみよう」と最初に教えてくれるのは、いつも先生方です。
            先生のひとことが、学生の音楽人生を変える。私自身もそうでした。
          </p>
          <p style={{ marginBottom: '1.2rem' }}>
            だからこの制度は、先生方への感謝の形です。先生に Symphony プランを無償でお使いいただき、
            先生のお名前のコードを学生さんに渡せるようにする。学生さんは「○○先生のおかげで安く使えてる」と
            感謝の気持ちが先生に向かう。先生は学生に最高の道具を紹介できる。
          </p>
          <p style={{ marginBottom: 0 }}>
            紹介報酬も、ノルマも、契約書もありません。先生のご判断で、伝えたい学生さんにだけ伝えてください。
          </p>
        </div>
      </section>

      <Divider />

      {/* セクション 7: FAQ */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem', maxWidth: 760, margin: '0 auto' }}>
        <SectionLabel num="07" />
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 400, color: '#0f172a', marginBottom: '2.5rem', letterSpacing: '0.02em' }}>
          よくあるご質問
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            {
              q: '本当に先生は無料で Symphony プランを使えるのですか？',
              a: 'はい。先生のアカウントを Symphony 権限に手動で切り替えます。月額のお支払いは一切発生しません。',
            },
            {
              q: '学生は本当に 30% オフで 1 年間使えるのですか？',
              a: 'はい。最初に学生割引が適用されてから 12 ヶ月間、自動的に 30% オフが続きます。学生さん側で何か手続きをする必要はありません。',
            },
            {
              q: '1 年経ったら学生はどうなりますか？',
              a: '自動的に通常価格に戻ります。Concerto なら ¥1,480/月、Prelude なら ¥780/月です。学生さんは事前にメールでお知らせを受け取れる設計です。',
            },
            {
              q: 'すでに Kuon に登録している学生はこのコードを使えますか？',
              a: '残念ながら使えません。学生割引は「初めて Kuon を購入する方」専用です。これは制度の悪用を防ぐためです。',
            },
            {
              q: '学生がコードを使った後にすぐ解約したらどうなりますか？',
              a: '通常通り解約できます。残期間まで利用できて、次回更新分から請求が止まります。学生さんに不利益はありません。',
            },
            {
              q: '何人の学生にコードを使ってもらえますか？',
              a: '人数制限はありません。先生のご判断で、好きなだけ学生さんに共有してください。',
            },
            {
              q: '私（教師）が学生のために代理で購入できますか？',
              a: '申し訳ありませんが、ご本人のクレジットカードで決済していただく必要があります（Stripe の規約上）。',
            },
            {
              q: '紹介の報酬はありますか？',
              a: '金銭的な紹介報酬はありません。代わりに、先生のお名前のコードで学生さんが Kuon に登録するたび、ダッシュボードに「○○先生からの招待」として記録され、先生の影響力が可視化されます。',
            },
          ].map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </section>

      <Divider />

      {/* セクション 8: 次のアクション */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) 1.5rem clamp(5rem, 8vw, 8rem)', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <SectionLabel num="08" />
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 3.5vw, 2rem)', fontWeight: 400, color: '#0f172a', marginBottom: '1.5rem', letterSpacing: '0.02em' }}>
          次にすること
        </h2>
        <div style={{ fontSize: '1rem', lineHeight: 2, color: '#334155', marginBottom: '2.5rem' }}>
          このページをお読みいただいて、「興味がある」と感じてくださった先生は、<br />
          私にご連絡ください。先生のお名前を冠したコードを発行して、<br />
          先生の Kuon アカウントを Symphony プランに切り替えます。
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '1rem', textTransform: 'uppercase' }}>
            お問い合わせ
          </div>
          <div style={{ fontFamily: serif, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem' }}>
            朝比奈幸太郎（Kuon R&amp;D 代表）
          </div>
          <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.9 }}>
            メール：<a href="mailto:369@kotaroasahina.com" style={{ color: ACCENT, textDecoration: 'none', fontFamily: mono }}>369@kotaroasahina.com</a><br />
            ウェブサイト：<a href="https://kuon-rnd.com" target="_blank" rel="noreferrer" style={{ color: ACCENT, textDecoration: 'none' }}>kuon-rnd.com</a>
          </div>
        </div>

        <div style={{ marginTop: '3rem', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.8 }}>
          このページは限定公開です。<br />
          内容にご質問があればお気軽にメールしてください。
        </div>
      </section>

      {/* フッター */}
      <footer style={{ padding: '2rem 1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'center', background: '#fff', fontSize: '0.75rem', color: '#94a3b8' }}>
        © 2026 空音開発（Kuon R&amp;D） · 教師向け案内（限定公開）
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// サブコンポーネント
// ─────────────────────────────────────────────

function Divider() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 1.5rem' }}>
      <div style={{ height: 1, background: 'linear-gradient(to right, transparent, #cbd5e1, transparent)' }} />
    </div>
  );
}

function SectionLabel({ num }: { num: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
      <span style={{ fontSize: '0.7rem', letterSpacing: '0.2em', color: GOLD, fontFamily: mono, fontWeight: 700 }}>{num}</span>
      <div style={{ flex: 1, height: 1, background: '#e2e8f0', maxWidth: 120 }} />
    </div>
  );
}

function BenefitCard({ icon, title, price, desc }: { icon: string; title: string; price: string; desc: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', textAlign: 'left' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontFamily: serif, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ fontSize: '0.8rem', color: GOLD, fontWeight: 600, marginBottom: '0.8rem', fontFamily: mono }}>{price}</div>
      <div style={{ fontSize: '0.88rem', lineHeight: 1.8, color: '#475569' }}>{desc}</div>
    </div>
  );
}

interface Phase { label: string; big: string; color: string; detail: string }

function Timeline({ phases }: { phases: Phase[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${phases.length}, 1fr)`, gap: '0.8rem' }} className="timeline-grid">
      <style>{`
        @media (max-width: 720px) {
          .timeline-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      {phases.map((p, i) => (
        <div key={i} style={{ background: '#fff', border: `2px solid ${p.color}33`, borderRadius: 12, padding: '1.2rem', position: 'relative' }}>
          <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{p.label}</div>
          <div style={{ fontFamily: serif, fontSize: '1.6rem', fontWeight: 600, color: p.color, marginBottom: '0.6rem', letterSpacing: '0.01em' }}>{p.big}</div>
          <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.7 }}>{p.detail}</div>
          {i < phases.length - 1 && (
            <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', fontSize: '1.2rem', color: '#cbd5e1', zIndex: 1 }} className="timeline-arrow">
              →
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface Row { plan: string; m1: string; m2: string; total: string; save: string }

function PaymentTable({ rows, highlight = false }: { rows: Row[]; highlight?: boolean }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
            <th style={{ padding: '0.6rem 0.5rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em' }}>プラン</th>
            <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em' }}>初月 / 1 年</th>
            <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em' }}>その後</th>
            <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em' }}>合計</th>
            <th style={{ padding: '0.6rem 0.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.04em', color: highlight ? '#7c2d12' : '#64748b' }}>節約額</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.plan} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '0.7rem 0.5rem', color: '#0f172a', fontWeight: 500 }}>{r.plan}</td>
              <td style={{ padding: '0.7rem 0.5rem', textAlign: 'right', color: '#10b981', fontFamily: mono, fontWeight: 600 }}>{r.m1}</td>
              <td style={{ padding: '0.7rem 0.5rem', textAlign: 'right', color: '#0284c7', fontFamily: mono }}>{r.m2}</td>
              <td style={{ padding: '0.7rem 0.5rem', textAlign: 'right', color: '#0f172a', fontWeight: 700, fontFamily: mono }}>{r.total}</td>
              <td style={{ padding: '0.7rem 0.5rem', textAlign: 'right', color: GOLD, fontWeight: 700, fontFamily: mono }}>{r.save}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Step({ num, title, desc, example }: { num: string; title: string; desc: string; example: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem', display: 'flex', gap: '1.2rem', alignItems: 'flex-start' }}>
      <div style={{
        flexShrink: 0,
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: ACCENT,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: serif,
        fontSize: '1.2rem',
        fontWeight: 700,
      }}>
        {num}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: serif, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.5rem' }}>{title}</div>
        <div style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.8, marginBottom: '0.8rem' }}>{desc}</div>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, padding: '0.6rem 0.8rem', fontSize: '0.8rem', color: '#64748b', fontFamily: mono, wordBreak: 'break-all' }}>
          {example}
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '1rem 1.25rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          textAlign: 'left',
          fontFamily: sans,
        }}
      >
        <span style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: 500, lineHeight: 1.6 }}>Q. {q}</span>
        <span style={{ fontSize: '1.1rem', color: '#94a3b8', flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
      </button>
      {open && (
        <div style={{ padding: '0 1.25rem 1.1rem', fontSize: '0.9rem', color: '#475569', lineHeight: 1.9, borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
          A. {a}
        </div>
      )}
    </div>
  );
}
