'use client';

/**
 * /theory-tutor-lp — KUON THEORY TUTOR LP
 *
 * 音楽家のための AI 家庭教師の LP。
 * SEO+GEO 完全対応 · 6 言語 · JSON-LD × 3 · 100+ keywords
 * バックエンド技術 (Llama / RAG / Vectorize 等) は一切露出しない。
 */

import Link from 'next/link';
import { useLang } from '@/context/LangContext';
import type { Lang } from '@/context/LangContext';

const serif = '"Shippori Mincho", "Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const sans = '"Helvetica Neue", "Hiragino Kaku Gothic ProN", Arial, sans-serif';
const mono = '"SF Mono", Monaco, "Cascadia Code", monospace';

const INK = '#1a1a1a';
const INK_SOFT = '#475569';
const INK_FAINT = '#94a3b8';
const PAPER = '#fafaf7';
const PAPER_DEEP = '#f5f4ed';
const STAFF_LINE = '#d4d0c4';
const ACCENT = '#9c7c3a';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

export default function TheoryTutorLP() {
  const { lang } = useLang();

  return (
    <div style={{ background: PAPER, minHeight: '100vh', color: INK }}>
      <JsonLd />

      {/* HERO */}
      <section
        style={{
          padding: 'clamp(4rem, 10vw, 8rem) clamp(1.5rem, 4vw, 3rem) clamp(3rem, 6vw, 5rem)',
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            fontFamily: mono,
            fontSize: '0.7rem',
            color: INK_FAINT,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            marginBottom: '1.4rem',
          }}
        >
          KUON · Theory Tutor
        </div>
        <h1
          style={{
            fontFamily: serif,
            fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
            fontWeight: 400,
            letterSpacing: '0.04em',
            lineHeight: 1.35,
            margin: 0,
            color: INK,
            wordBreak: 'keep-all',
          }}
        >
          {t(
            {
              ja: '音楽理論を、いつでも、誰よりも詳しく。',
              en: 'Your music theory tutor, available always.',
              es: 'Tu tutor de teoría musical, siempre disponible.',
              ko: '언제든 옆에 있는 음악 이론 튜터.',
              pt: 'Seu tutor de teoria musical, sempre disponível.',
              de: 'Ihr Musiktheorielehrer, jederzeit verfügbar.',
            },
            lang,
          )}
        </h1>
        <p
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
            color: INK_SOFT,
            lineHeight: 2,
            marginTop: '1.6rem',
            maxWidth: 760,
            letterSpacing: '0.02em',
          }}
        >
          {t(
            {
              ja: '「ナポリの六について教えて」「対位法の第 1 種から第 5 種までの違いは?」── 深夜 2 時の自習でも、海外留学先のホテルでも、出典つきで即座に答えます。教科書の定番と、Bach がどう選んだかと、あなた自身の選択肢を並べて。単一正解の押し付けはしません。',
              en: '"Tell me about the Neapolitan sixth." "Difference between species 1-5?" — at 2 am during late-night study, or in a hotel abroad. Instant answers, always with citations. The textbook standard, Bach\'s choice, and your alternatives — side by side. Never imposing a single right answer.',
              es: '"Hábleme de la sexta napolitana." "¿Diferencia entre las especies 1-5?" — a las 2 am estudiando, o en un hotel en el extranjero. Respuestas instantáneas con fuentes. La ortodoxia, la elección de Bach, y tus alternativas — lado a lado.',
              ko: '"나폴리탄 6도에 대해 알려줘" "대위법 1-5종의 차이는?" — 새벽 2시 자습에도, 해외 호텔에서도. 즉시 답변, 출전 포함.',
              pt: '"Fale-me sobre a sexta napolitana." "Diferenças entre as espécies 1-5?" — às 2 da manhã, ou no hotel estrangeiro. Respostas instantâneas com fontes.',
              de: '"Erklären Sie den neapolitanischen Sextakkord." "Unterschiede zwischen den Spezies 1-5?" — um 2 Uhr morgens, oder im Hotel im Ausland. Sofortige Antworten mit Quellen.',
            },
            lang,
          )}
        </p>

        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href="/theory-tutor"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: INK,
              color: PAPER,
              padding: '1rem 2.2rem',
              borderRadius: 3,
              fontFamily: serif,
              fontSize: '1rem',
              textDecoration: 'none',
              letterSpacing: '0.1em',
              transition: 'all 0.25s ease',
            }}
          >
            {t({ ja: '今すぐ質問する', en: 'Ask now', es: 'Pregunta ahora', ko: '지금 질문', pt: 'Pergunte agora', de: 'Jetzt fragen' }, lang)} →
          </Link>
          <Link
            href="/theory"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'transparent',
              color: INK,
              padding: '1rem 1.6rem',
              borderRadius: 3,
              fontFamily: sans,
              fontSize: '0.9rem',
              textDecoration: 'none',
              border: `1px solid ${STAFF_LINE}`,
              letterSpacing: '0.04em',
            }}
          >
            {t({ ja: '楽典コースを見る', en: 'See Theory Suite', es: 'Ver suite' }, lang)}
          </Link>
        </div>
      </section>

      {/* TRUST BAR */}
      <section
        style={{
          background: PAPER_DEEP,
          borderTop: `1px solid ${STAFF_LINE}`,
          borderBottom: `1px solid ${STAFF_LINE}`,
          padding: 'clamp(1.6rem, 3vw, 2.2rem) 0',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '0 clamp(1.5rem, 4vw, 3rem)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 'clamp(1rem, 2vw, 2rem)',
          }}
        >
          <TrustItem
            mark="24/7"
            label={t({ ja: 'いつでも質問', en: 'Always available', es: 'Siempre disponible' }, lang)}
          />
          <TrustItem
            mark="100%"
            label={t({ ja: '出典付きで回答', en: 'Always cited', es: 'Con fuentes' }, lang)}
          />
          <TrustItem
            mark="6+"
            label={t({ ja: '対応言語', en: 'Languages', es: 'Idiomas' }, lang)}
          />
          <TrustItem
            mark="¥1,480"
            label={t({ ja: 'Concerto から / 月 200 質問', en: 'From Concerto / 200 q/mo', es: 'Desde Concerto / 200 preguntas' }, lang)}
          />
        </div>
      </section>

      {/* SAMPLE Q&A */}
      <section style={{ maxWidth: 980, margin: '0 auto', padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)' }}>
        <h2 style={sectionHeading()}>
          {t({ ja: '実際の質問・回答例', en: 'Sample questions & answers' }, lang)}
        </h2>
        <div style={{ display: 'grid', gap: '1.5rem', marginTop: '2rem' }}>
          <SampleQA
            q={t({ ja: 'ナポリの六って何ですか?', en: 'What is the Neapolitan sixth?' }, lang)}
            a={t(
              {
                ja: '「ナポリの六」は ♭II の 6 度の和音 (♭II6) です。短調で哀愁を強める和音として 17-18 世紀ナポリ楽派が好んで使ったことが名前の由来です。教科書の定番では V または V7 へ進行しますが、Bach は BWV 543 のフーガで意外な解決を見せています。あなたの曲では、半音的な下行を強調したい場面で効果的です。[1] [2]',
                en: 'The "Neapolitan sixth" is the first inversion of the ♭II chord (♭II6). It originated with the 17-18th century Neapolitan school for its melancholic intensity. Standard textbook progression is to V or V7. Bach\'s BWV 543 fugue shows an unexpected resolution. In your own writing, it works powerfully for emphasizing chromatic descent. [1] [2]',
              },
              lang,
            )}
            sources={[
              { label: 'Open Music Theory v2 · p.892', kuon: false },
              { label: 'M5-05 ナポリの 6', kuon: true },
            ]}
            lang={lang}
          />
          <SampleQA
            q={t({ ja: '対位法の第 1 種と第 2 種の違いは?', en: 'First vs second species counterpoint?' }, lang)}
            a={t(
              {
                ja: '第 1 種は「1 対 1」── カントゥス・フィルムスの各音に対して 1 つの音を置く、最も厳格な様式です。第 2 種は「1 対 2」── 1 つの C.F. 音に 2 つの音を置き、強拍は協和音、弱拍は協和音 or パッシング・トーンになります。Fux の Gradus ad Parnassum (1725) が両方の標準です。あなた自身が書く時は、第 1 種で「線の独立」を体に染み込ませてから第 2 種に進むのが伝統的です。[1] [2]',
                en: 'First species is "one note against one" — the strictest style, placing a single note against each cantus firmus note. Second species is "one against two" — strong beat consonance, weak beat consonance or passing tone. Fux\'s Gradus ad Parnassum (1725) is the standard for both. Traditionally, work through first species until line independence is internalized before moving on. [1] [2]',
              },
              lang,
            )}
            sources={[
              { label: 'Open Music Theory v2 · p.348', kuon: false },
              { label: 'M2-06 第 1 種対位法 — 線の独立', kuon: true },
            ]}
            lang={lang}
          />
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: PAPER_DEEP, padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(1.5rem, 4vw, 3rem)' }}>
          <h2 style={sectionHeading()}>
            {t({ ja: '5 つのこだわり', en: 'Five core principles' }, lang)}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
              marginTop: '2rem',
            }}
          >
            <Feature
              title={t({ ja: '出典が必ず付く', en: 'Citations always' }, lang)}
              body={t(
                {
                  ja: 'すべての回答に教科書ページ番号と Kuon 楽典スイートの該当レッスンへのリンク。「鵜呑みにする」のではなく、必ず原典で確認できる学術的な信頼性。',
                  en: 'Every answer links to textbook page numbers and the relevant KUON Music Theory Suite lesson. Never blind trust — always verify in the original source.',
                },
                lang,
              )}
            />
            <Feature
              title={t({ ja: '正解を押し付けない', en: 'No single right answer' }, lang)}
              body={t(
                {
                  ja: '「教科書の定番」「Bach の選択」「あなたの代替案」を並列で提示。単一正解主義の押し付けは音楽の本質に反するからです。',
                  en: 'Textbook orthodoxy, Bach\'s choice, and your alternatives — presented in parallel. Imposing a single right answer betrays the nature of music itself.',
                },
                lang,
              )}
            />
            <Feature
              title={t({ ja: '楽典スイートと連動', en: 'Linked to Theory Suite' }, lang)}
              body={t(
                {
                  ja: '回答中の用語をクリックすると、Kuon 楽典スイートの該当レッスンに飛べます。質問から学習へ、シームレスにつながります。',
                  en: 'Click any term in the answer to jump to the relevant Theory Suite lesson. From question to deep learning, seamlessly.',
                },
                lang,
              )}
            />
            <Feature
              title={t({ ja: '会話の文脈を覚える', en: 'Remembers context' }, lang)}
              body={t(
                {
                  ja: '「さっきの和声、もっと詳しく」── 直前の会話を踏まえて答えます。一問一答で終わらない、本当の対話。',
                  en: '"That harmony, in more detail" — context-aware follow-ups. Real dialogue, not isolated Q&A.',
                },
                lang,
              )}
            />
            <Feature
              title={t({ ja: '世界の言葉に対応', en: 'Multilingual' }, lang)}
              body={t(
                {
                  ja: '日本語・英語・スペイン語・ドイツ語・フランス語・イタリア語など主要言語で質問可能。海外マスタークラスや留学先で出会った概念も母語で深掘りできます。',
                  en: 'Ask in Japanese, English, Spanish, German, French, Italian. Dive deeper into concepts encountered abroad in your native language.',
                },
                lang,
              )}
            />
            <Feature
              title={t({ ja: 'タイピングのように回答', en: 'Streaming responses' }, lang)}
              body={t(
                {
                  ja: '回答は文字単位でストリーム配信。長い回答も読み始められるし、AI が考えてくれている時間が体感できます。',
                  en: 'Answers stream character-by-character. Start reading long responses immediately, and feel the AI thinking with you.',
                },
                lang,
              )}
            />
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)' }}>
        <h2 style={sectionHeading()}>{t({ ja: '料金プラン', en: 'Pricing' }, lang)}</h2>
        <p
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: '0.95rem',
            color: INK_SOFT,
            lineHeight: 1.95,
            maxWidth: 600,
            marginTop: '1rem',
          }}
        >
          {t(
            {
              ja: 'KUON THEORY TUTOR は Concerto プラン以上で利用可能です。プロ音楽家・音大生・指導者向けの本格的な学習環境です。',
              en: 'KUON THEORY TUTOR is available on Concerto and above — for serious musicians, conservatory students, and teachers.',
            },
            lang,
          )}
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
          }}
        >
          <Tier
            name="Concerto"
            price="¥1,480"
            quota="200 質問 / 月"
            desc={t({ ja: '音大生・プロ音楽家', en: 'Music students & pros' }, lang)}
            highlight
          />
          <Tier
            name="Symphony"
            price="¥2,480"
            quota="500 質問 / 月"
            desc={t({ ja: '教師・スタジオ・複数指導', en: 'Teachers & studios' }, lang)}
          />
        </div>
        <p
          style={{
            fontFamily: sans,
            fontSize: '0.78rem',
            color: INK_FAINT,
            lineHeight: 1.85,
            marginTop: '1.4rem',
            textAlign: 'center',
          }}
        >
          {t(
            {
              ja: '1 質問 = 1 つの問いと 1 つの回答 (会話の続きも 1 質問とカウント)。年払いで 2 ヶ月無料。',
              en: '1 question = one query + one answer. Annual saves 2 months.',
            },
            lang,
          )}
        </p>
      </section>

      {/* FAQ */}
      <section
        style={{
          background: PAPER_DEEP,
          padding: 'clamp(4rem, 8vw, 6rem) 0',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 clamp(1.5rem, 4vw, 3rem)' }}>
          <h2 style={sectionHeading()}>{t({ ja: 'よくある質問', en: 'FAQ' }, lang)}</h2>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
            <FaqItem
              q={t({ ja: 'ChatGPT と何が違うんですか?', en: 'How is this different from ChatGPT?' }, lang)}
              a={t(
                {
                  ja: '空音開発が音楽家のために作った専用 AI です。Open Music Theory v2 (北米音楽学部の標準教科書) と Kuon Music Theory Suite (空音開発オリジナル 583 レッスン) を参照源にして、必ず出典つきで答えます。汎用 AI と違い、音楽専門用語に強く、確認できない情報は「分かりません」と正直に答えます。',
                  en: 'A dedicated AI built for musicians by KUON R&D. References Open Music Theory v2 (North American conservatory standard) and KUON Music Theory Suite (583 original lessons), always with citations. Unlike general AI, it understands music terminology deeply and admits when something isn\'t in the source material.',
                },
                lang,
              )}
            />
            <FaqItem
              q={t({ ja: '回答はどれぐらい正確ですか?', en: 'How accurate are the answers?' }, lang)}
              a={t(
                {
                  ja: '参照源に書かれていることは正確に答えます。書かれていないこと・推測になることは「これは私の推察ですが」と明示します。出典が必ず提示されるので、疑問があればその場で原典を確認できます。',
                  en: 'For information in the source material, accuracy is high. For inferences, the answer explicitly states "this is my inference." Citations let you verify in the original immediately.',
                },
                lang,
              )}
            />
            <FaqItem
              q={t({ ja: '何カ国語に対応していますか?', en: 'How many languages?' }, lang)}
              a={t(
                {
                  ja: '日本語・英語・スペイン語・ドイツ語・フランス語・イタリア語・韓国語・中国語など主要言語に対応。質問はあなたの好きな言語で、回答もその言語で返ります。出典 (英語の OMT v2) は原文のまま提示されます。',
                  en: 'Japanese, English, Spanish, German, French, Italian, Korean, Chinese, and more. Ask in your preferred language; answer comes back in the same. Sources (English OMT v2) remain in original.',
                },
                lang,
              )}
            />
            <FaqItem
              q={t({ ja: '会話履歴は保存されますか?', en: 'Are conversations saved?' }, lang)}
              a={t(
                {
                  ja: 'はい、あなたのアカウント内に保存されます (1 年保持)。後から「あの和声についての質問はいつだった?」と検索しなおしたり、続きを再開できます。削除はワンクリック。',
                  en: 'Yes, saved in your account (kept 1 year). Resume past conversations or search "when did we discuss that?" — delete anytime with one click.',
                },
                lang,
              )}
            />
            <FaqItem
              q={t({ ja: 'いつから使えますか?', en: 'When can I start?' }, lang)}
              a={t(
                {
                  ja: 'Concerto プラン (¥1,480/月) 以上で月 200 質問利用可能です。プロ音楽家・音大生・指導者を主な対象とした本格的なツールです。',
                  en: 'Available on Concerto (¥1,480/mo) and up — 200 questions/month. Built for serious musicians, conservatory students, and teachers.',
                },
                lang,
              )}
            />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        style={{
          background: INK,
          color: PAPER,
          padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontFamily: serif,
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
            fontWeight: 400,
            margin: 0,
            letterSpacing: '0.04em',
            lineHeight: 1.5,
          }}
        >
          {t({ ja: '最初の質問を、今すぐ。', en: 'Ask your first question, now.' }, lang)}
        </h2>
        <div style={{ marginTop: '2rem' }}>
          <Link
            href="/theory-tutor"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              background: PAPER,
              color: INK,
              padding: '1.1rem 2.6rem',
              borderRadius: 3,
              fontFamily: serif,
              fontSize: '1.05rem',
              textDecoration: 'none',
              letterSpacing: '0.12em',
            }}
          >
            {t({ ja: 'Concerto プランで始める', en: 'Start with Concerto' }, lang)} →
          </Link>
        </div>
        <p
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: '0.85rem',
            color: '#cbcab9',
            marginTop: '1.4rem',
            letterSpacing: '0.03em',
          }}
        >
          {t(
            {
              ja: '空音開発 / KUON R&D — 朝比奈幸太郎が音楽家のために開発・運営',
              en: 'KUON R&D / 空音開発 — Built by Kotaro Asahina, for musicians',
            },
            lang,
          )}
        </p>
      </section>
    </div>
  );
}

function sectionHeading(): React.CSSProperties {
  return {
    fontFamily: serif,
    fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
    fontWeight: 400,
    letterSpacing: '0.04em',
    color: INK,
    margin: 0,
    lineHeight: 1.5,
  };
}

function TrustItem({ mark, label }: { mark: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          fontFamily: serif,
          fontSize: 'clamp(1.4rem, 3vw, 2rem)',
          color: INK,
          letterSpacing: '0.02em',
        }}
      >
        {mark}
      </div>
      <div
        style={{
          fontFamily: mono,
          fontSize: '0.65rem',
          color: INK_FAINT,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginTop: '0.4rem',
        }}
      >
        {label}
      </div>
    </div>
  );
}

function SampleQA({
  q,
  a,
  sources,
  lang,
}: {
  q: string;
  a: string;
  sources: Array<{ label: string; kuon: boolean }>;
  lang: Lang;
}) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4, padding: 'clamp(1.4rem, 2.5vw, 2rem)' }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: '0.65rem',
          color: ACCENT,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: '0.7rem',
        }}
      >
        Q
      </div>
      <p
        style={{
          fontFamily: serif,
          fontSize: 'clamp(1.05rem, 2vw, 1.2rem)',
          color: INK,
          margin: '0 0 1.6rem 0',
          letterSpacing: '0.02em',
          lineHeight: 1.7,
        }}
      >
        {q}
      </p>
      <div
        style={{
          fontFamily: mono,
          fontSize: '0.65rem',
          color: ACCENT,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginBottom: '0.7rem',
        }}
      >
        A
      </div>
      <p
        style={{
          fontFamily: serif,
          fontSize: '0.95rem',
          color: INK_SOFT,
          lineHeight: 2,
          margin: 0,
          letterSpacing: '0.01em',
        }}
      >
        {a}
      </p>
      <div
        style={{
          marginTop: '1.4rem',
          paddingTop: '1rem',
          borderTop: `1px solid ${STAFF_LINE}`,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        {sources.map((s, i) => (
          <span
            key={i}
            style={{
              fontFamily: mono,
              fontSize: '0.7rem',
              color: s.kuon ? ACCENT : INK_FAINT,
              background: PAPER_DEEP,
              padding: '4px 10px',
              borderRadius: 3,
            }}
          >
            [{i + 1}] {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4, padding: '1.4rem 1.5rem' }}>
      <h3
        style={{
          fontFamily: serif,
          fontSize: '1rem',
          color: INK,
          fontWeight: 500,
          margin: '0 0 0.6rem 0',
          letterSpacing: '0.03em',
        }}
      >
        {title}
      </h3>
      <p style={{ fontFamily: sans, fontSize: '0.82rem', color: INK_SOFT, lineHeight: 1.9, margin: 0 }}>
        {body}
      </p>
    </div>
  );
}

function Tier({ name, price, quota, desc, highlight }: any) {
  return (
    <div
      style={{
        background: highlight ? INK : '#fff',
        color: highlight ? PAPER : INK,
        border: `1px solid ${highlight ? INK : STAFF_LINE}`,
        borderRadius: 4,
        padding: '1.6rem 1.4rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: '0.7rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: highlight ? '#cbcab9' : INK_FAINT,
          marginBottom: '0.6rem',
        }}
      >
        {name}
      </div>
      <div style={{ fontFamily: serif, fontSize: '2rem', fontWeight: 400, marginBottom: '0.3rem' }}>
        {price}
        <span style={{ fontSize: '0.55em', opacity: 0.6 }}> /月</span>
      </div>
      <div style={{ fontFamily: serif, fontSize: '1rem', color: ACCENT, marginBottom: '0.5rem' }}>{quota}</div>
      <div style={{ fontFamily: sans, fontSize: '0.78rem', opacity: 0.7, lineHeight: 1.7 }}>{desc}</div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details style={{ background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4, padding: '1.2rem 1.4rem' }}>
      <summary style={{ fontFamily: serif, fontSize: '1rem', color: INK, cursor: 'pointer', fontWeight: 500, letterSpacing: '0.02em' }}>{q}</summary>
      <p
        style={{
          fontFamily: sans,
          fontSize: '0.88rem',
          color: INK_SOFT,
          lineHeight: 1.95,
          margin: '0.8rem 0 0 0',
          paddingTop: '0.7rem',
          borderTop: `1px solid ${STAFF_LINE}`,
        }}
      >
        {a}
      </p>
    </details>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// JSON-LD × 3 (SoftwareApplication / FAQPage / HowTo)
// ──────────────────────────────────────────────────────────────────────────
function JsonLd() {
  const softwareApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'KUON THEORY TUTOR',
    applicationCategory: 'EducationalApplication',
    applicationSubCategory: 'Music Theory AI Tutor',
    operatingSystem: 'Web Browser',
    description:
      'AI music theory tutor with citations from Open Music Theory v2 and KUON Music Theory Suite. Multilingual, context-aware, with a philosophy of presenting alternatives instead of imposing a single right answer.',
    url: 'https://kuon-rnd.com/theory-tutor',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '1480',
      highPrice: '2480',
      priceCurrency: 'JPY',
      offers: [
        { '@type': 'Offer', price: '1480', priceCurrency: 'JPY', name: 'Concerto' },
        { '@type': 'Offer', price: '2480', priceCurrency: 'JPY', name: 'Symphony' },
      ],
    },
    creator: {
      '@type': 'Person',
      name: 'Kotaro Asahina (朝比奈幸太郎)',
      url: 'https://kuon-rnd.com/profile',
    },
    publisher: {
      '@type': 'Organization',
      name: 'KUON R&D / 空音開発',
      url: 'https://kuon-rnd.com',
    },
    inLanguage: ['ja', 'en', 'es', 'ko', 'pt', 'de'],
    featureList: [
      'AI music theory Q&A with citations',
      'References Open Music Theory v2 (CC BY-SA 4.0) and KUON Music Theory Suite',
      'Multilingual (90+ languages)',
      'Streaming response display',
      'Context-aware follow-up questions',
      'Conversation history (1 year retention)',
      'Direct links to KUON Music Theory Suite lessons',
      '§49 philosophy: alternatives presented, no single right answer imposed',
    ],
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How is this different from ChatGPT?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'A dedicated music-tuned AI by KUON R&D. References Open Music Theory v2 and KUON Music Theory Suite (583 lessons), always with citations. Understands music terminology deeply and admits "I don\'t know" when info isn\'t in the source.',
        },
      },
      {
        '@type': 'Question',
        name: 'How accurate are the answers?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'High for source-backed information. Inferences are explicitly marked. Citations let you verify in the original source immediately.',
        },
      },
      {
        '@type': 'Question',
        name: 'How many languages are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Japanese, English, Spanish, German, French, Italian, Korean, Chinese, and more. Sources kept in original language.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are conversations saved?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, in your account for 1 year. Search past conversations or resume them. Delete with one click.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the pricing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Available on Concerto plan and above. Concerto (¥1,480/mo): 200 questions/month. Symphony (¥2,480/mo): 500 questions/month.',
        },
      },
    ],
  };

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to use KUON THEORY TUTOR',
    description: 'Step-by-step guide to asking music theory questions with cited answers.',
    totalTime: 'PT2M',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'JPY', value: '0' },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Open KUON THEORY TUTOR',
        text: 'Visit https://kuon-rnd.com/theory-tutor and sign in (free account works).',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Ask your question',
        text: 'Type any music theory question — "What is the Neapolitan sixth?", "Difference between species 1-5?", "Why does V7 resolve down?"',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Read the streaming answer',
        text: 'The answer appears character-by-character. Citations to OMT v2 pages and KUON Music Theory Suite lessons are listed.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Verify in the source',
        text: 'Click any citation to jump to the original lesson or page. Trust, but verify.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Continue the conversation',
        text: 'Follow-up questions retain context. "Tell me more about that harmony" works naturally.',
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }} />
    </>
  );
}
