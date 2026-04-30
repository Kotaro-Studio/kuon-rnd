'use client';

/**
 * /lesson-recorder-lp — KUON LESSON RECORDER ランディングページ
 *
 * SEO + GEO 完全対応:
 *   - 6 言語 (ja/en/es/ko/pt/de) Hero
 *   - JSON-LD × 3 (SoftwareApplication / FAQPage / HowTo)
 *   - 100+ keywords / lang
 *   - AI クローラー対策 (具体的数字 + FAQ 構造 + 用語正規化)
 *
 * 構成:
 *   1. Hero (Before/After 視覚化)
 *   2. Trust bar
 *   3. Personas
 *   4. How it works (5 steps)
 *   5. Features
 *   6. Privacy
 *   7. Pricing
 *   8. FAQ
 *   9. Final CTA
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
const ACCENT_DEEP = '#7a5e26';
const BLUE = '#3a3a5e';

type L = Partial<Record<Lang, string>> & { en: string };
const t = (m: L, lang: Lang): string => (m as Record<string, string>)[lang] ?? m.en;

export default function LessonRecorderLP() {
  const { lang } = useLang();

  return (
    <div style={{ background: PAPER, minHeight: '100vh', color: INK }}>
      <JsonLd />

      {/* HERO */}
      <section style={{ padding: 'clamp(4rem, 10vw, 8rem) clamp(1.5rem, 4vw, 3rem) clamp(3rem, 6vw, 5rem)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontFamily: mono, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.32em', textTransform: 'uppercase', marginBottom: '1.4rem' }}>
          KUON · Lesson Recorder · 音楽家の知識装置
        </div>
        <h1 style={{ fontFamily: serif, fontSize: 'clamp(2.4rem, 6vw, 4.2rem)', fontWeight: 400, letterSpacing: '0.04em', lineHeight: 1.35, margin: 0, color: INK, wordBreak: 'keep-all' }}>
          {t({
            ja: 'レッスンの 1 時間が、3 行のサマリーになる。',
            en: 'A 1-hour lesson becomes a 3-line summary.',
            es: 'Una clase de 1 hora se convierte en un resumen de 3 líneas.',
            ko: '1시간 레슨이 3줄 요약이 됩니다.',
            pt: 'Uma aula de 1 hora vira um resumo de 3 linhas.',
            de: 'Eine 1-Stunden-Lektion wird zu 3 Zeilen Zusammenfassung.',
          }, lang)}
        </h1>
        <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 'clamp(1rem, 1.8vw, 1.2rem)', color: INK_SOFT, lineHeight: 2, marginTop: '1.6rem', maxWidth: 760, letterSpacing: '0.02em' }}>
          {t({
            ja: '音楽の現場に特化させた専用 AI が、あなたのレッスンを言葉として残し、3 行の本質に磨き上げ、次回までの宿題まで抽出します。書き起こされたあとの音源はそのまま消える設計。あなたの演奏は、あなたの中だけにあります。',
            en: 'A dedicated AI tuned for music captures your lesson in writing, distills it into a 3-line essence, and extracts your homework for next time. Audio is wiped right after processing — your performance stays yours alone.',
            es: 'Una IA dedicada al mundo musical captura tu clase, la destila en 3 líneas y extrae las tareas para la próxima vez. El audio se borra inmediatamente — tu interpretación queda solo contigo.',
            ko: '음악에 특화된 전용 AI가 레슨을 글로 남기고, 3줄의 본질로 정리하며, 다음 레슨까지의 과제를 추출합니다. 음원은 처리 직후 사라지는 설계.',
            pt: 'Uma IA dedicada à música captura sua aula em texto, destila em 3 linhas e extrai as tarefas para a próxima. O áudio é apagado logo após o processamento.',
            de: 'Eine speziell auf Musik abgestimmte KI hält Ihre Stunde fest, destilliert sie in 3 Zeilen und extrahiert Ihre Aufgaben. Das Audio wird unmittelbar danach gelöscht.',
          }, lang)}
        </p>

        <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link href="/lesson-recorder" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            background: INK, color: PAPER, padding: '1rem 2.2rem', borderRadius: 3,
            fontFamily: serif, fontSize: '1rem', textDecoration: 'none',
            letterSpacing: '0.1em', transition: 'all 0.25s ease',
          }}>
            {t({
              ja: '今すぐ試す',
              en: 'Try now',
              es: 'Probar ahora',
              ko: '지금 시도',
              pt: 'Experimentar',
              de: 'Jetzt testen',
            }, lang)} →
          </Link>
          <a href="#how" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'transparent', color: INK, padding: '1rem 1.6rem', borderRadius: 3,
            fontFamily: sans, fontSize: '0.9rem', textDecoration: 'none',
            border: `1px solid ${STAFF_LINE}`, letterSpacing: '0.04em',
          }}>
            {t({ ja: '使い方を見る', en: 'See how it works', es: 'Cómo funciona', ko: '사용 방법', pt: 'Como funciona', de: 'So funktioniert' }, lang)}
          </a>
        </div>
      </section>

      {/* TRUST BAR */}
      <section style={{ background: PAPER_DEEP, borderTop: `1px solid ${STAFF_LINE}`, borderBottom: `1px solid ${STAFF_LINE}`, padding: 'clamp(1.6rem, 3vw, 2.2rem) 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(1.5rem, 4vw, 3rem)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 'clamp(1rem, 2vw, 2rem)' }}>
          <TrustItem mark="99+" label={t({ ja: '対応言語', en: 'Languages', es: 'Idiomas', ko: '언어', pt: 'Idiomas', de: 'Sprachen' }, lang)} />
          <TrustItem mark="¥780" label={t({ ja: '/月 から', en: '/month', es: '/mes', ko: '/월', pt: '/mês', de: '/Monat' }, lang)} />
          <TrustItem mark="0%" label={t({ ja: 'サーバー保存', en: 'Server storage', es: 'Almacenamiento', ko: '서버 저장', pt: 'Armazenamento', de: 'Serverspeicher' }, lang)} />
          <TrustItem mark="~10%" label={t({ ja: '処理時間 / 録音長', en: 'Processing / length', es: 'Procesamiento', ko: '처리 시간', pt: 'Tempo', de: 'Verarbeitung' }, lang)} />
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)' }}>
        <h2 style={sectionHeadingStyle()}>{t({
          ja: 'Before / After',
          en: 'Before / After',
        }, lang)}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', alignItems: 'center', gap: 'clamp(1rem, 3vw, 2rem)', marginTop: '2rem' }}>
          <BeforeAfterCard
            type="before"
            label={t({ ja: 'これまで', en: 'Before' }, lang)}
            title={t({ ja: '60 分のレッスン', en: '60-min lesson' }, lang)}
            items={[
              t({ ja: '何度も聞き返す', en: 'Replay over and over' }, lang),
              t({ ja: 'メモが追いつかない', en: 'Notes never keep up' }, lang),
              t({ ja: '何が重要か曖昧', en: 'Hard to find key points' }, lang),
              t({ ja: '次回の課題が消える', en: 'Action items get lost' }, lang),
            ]}
          />
          <div style={{ textAlign: 'center', fontFamily: serif, fontSize: '2rem', color: ACCENT }}>→</div>
          <BeforeAfterCard
            type="after"
            label={t({ ja: 'これから', en: 'After' }, lang)}
            title={t({ ja: '6 分で読める知識', en: '6-min digestible knowledge' }, lang)}
            items={[
              t({ ja: '3 行サマリー', en: '3-line summary' }, lang),
              t({ ja: '主な指摘 5 点', en: 'Top 5 key points' }, lang),
              t({ ja: 'アクション項目', en: 'Action items list' }, lang),
              t({ ja: '音楽用語の解説付き', en: 'Music terms explained' }, lang),
            ]}
          />
        </div>
      </section>

      {/* PERSONAS */}
      <section style={{ background: PAPER_DEEP, padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(1.5rem, 4vw, 3rem)' }}>
          <h2 style={sectionHeadingStyle()}>{t({
            ja: '誰のためのツール?',
            en: 'Who is this for?',
            es: '¿Para quién es?',
          }, lang)}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
            <PersonaCard
              name={t({ ja: '音大生', en: 'Conservatory students', es: 'Estudiantes de conservatorio' }, lang)}
              body={t({ ja: '個人レッスン・マスタークラスを記録。卒業時には何百時間分の指導記録があなたの資産に。', en: 'Record private lessons and masterclasses. By graduation, hundreds of hours of teaching become your asset.' }, lang)}
            />
            <PersonaCard
              name={t({ ja: '海外留学希望者', en: 'Studying abroad' }, lang)}
              body={t({ ja: 'ドイツ・仏・伊のレッスンを 99 言語で書き起こし → 日本語翻訳。語学が完璧でなくても学びを最大化。', en: 'Transcribe lessons in German, French, Italian and translate to your language. Learn even with imperfect language skills.' }, lang)}
            />
            <PersonaCard
              name={t({ ja: 'プロ音楽家', en: 'Professional musicians' }, lang)}
              body={t({ ja: 'コーチングセッション・指揮者の指示を記録。次回までの解釈変更点を漏れなく管理。', en: 'Record coaching sessions and conductor notes. Track interpretation changes for next rehearsal.' }, lang)}
            />
            <PersonaCard
              name={t({ ja: '音楽教師', en: 'Music teachers' }, lang)}
              body={t({ ja: '生徒のレッスン記録を共有可能。次のレッスンで何を強化すべきか AI が提案。', en: 'Share lesson records with students. AI suggests what to focus on next time.' }, lang)}
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)' }}>
        <h2 style={sectionHeadingStyle()}>{t({
          ja: '5 ステップで、レッスンが財産になる',
          en: '5 steps that turn lessons into assets',
          es: '5 pasos para que tu clase se vuelva patrimonio',
        }, lang)}</h2>
        <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
          <Step
            n="01"
            title={t({ ja: '一瞬で記録開始', en: 'Capture in a tap' }, lang)}
            body={t({ ja: 'ボタン一つでブラウザ録音。レッスン後にスマホの録音ファイルをドラッグしても OK。最大 60 分。', en: 'One-tap recording in your browser. Or drag in a phone recording after the lesson. Up to 60 minutes.' }, lang)}
          />
          <Step
            n="02"
            title={t({ ja: '音楽の言葉を聴き取る', en: 'It listens with musical ears' }, lang)}
            body={t({ ja: '音楽の現場に特化した独自 AI エンジンが、専門用語を取りこぼさず文字に。先生と生徒の発話を自動で見分けます。', en: 'Our music-tuned engine writes down even the most niche terminology. It distinguishes teacher and student automatically.' }, lang)}
          />
          <Step
            n="03"
            title={t({ ja: '本質だけを残す', en: 'Distills the essence' }, lang)}
            body={t({ ja: '60 分を 3 行に。重要な指摘、次回までの宿題、出てきた音楽用語の解説。すべて整理されて、すぐ読める形に。', en: '60 minutes into 3 lines. Key feedback, homework, glossary of terms — all instantly readable.' }, lang)}
          />
          <Step
            n="04"
            title={t({ ja: '世界の言葉に変える', en: 'Speak the world\'s tongue' }, lang)}
            body={t({ ja: '海外マスタークラスや留学先の指導を、瞬時にあなたの言語へ。語学が完璧でなくても、学びを取りこぼさない。', en: 'Foreign masterclasses, instantly in your language. Don\'t let imperfect language skills stand between you and the lesson.' }, lang)}
          />
          <Step
            n="05"
            title={t({ ja: '一生の図書館へ', en: 'Build a lifelong library' }, lang)}
            body={t({ ja: '蓄積されたレッスンは「あの和声についての話、いつだった?」と問いかけるだけで、関連発言が瞬時に呼び出されます。', en: 'Ask in plain words: "When did we talk about that harmony?" — the moment surfaces in an instant.' }, lang)}
          />
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: PAPER_DEEP, padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(1.5rem, 4vw, 3rem)' }}>
          <h2 style={sectionHeadingStyle()}>{t({ ja: 'プロの現場で生きる、6 つの機能', en: 'Six features built for the music room', es: 'Seis funciones diseñadas para el aula musical' }, lang)}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
            <FeatureCard title={t({ ja: '音楽の言葉に強い AI', en: 'Tuned for the music room' }, lang)} body={t({ ja: 'カデンツ・モーダルミクスチャ・ピチカート・アゴーギク。普通の AI が混乱する 100 以上の専門用語を、迷わず正確に書き取ります。', en: '100+ music-specific terms — cadence, modal mixture, pizzicato, agogic — captured without hesitation.' }, lang)} />
            <FeatureCard title={t({ ja: '誰の発言かを見分ける', en: 'Knows who is speaking' }, lang)} body={t({ ja: '先生の指示か、生徒の応答か。会話の流れから自動で識別。レッスンが「読めるドキュメント」に変わります。', en: 'Teacher or student? Detected automatically. Lessons become readable documents.' }, lang)} />
            <FeatureCard title={t({ ja: 'すべての言葉に時刻が刻まれる', en: 'Every word has a moment' }, lang)} body={t({ ja: 'クリック一つでその瞬間に飛べる。後から「ここはどう言われたか」を確認するのが、信じられないほど速くなります。', en: 'Click any line to jump back to that exact moment. Re-checking what was said becomes instant.' }, lang)} />
            <FeatureCard title={t({ ja: '理論への扉が、自動で開く', en: 'Music theory, one tap away' }, lang)} body={t({ ja: 'レッスンで出てきた専門用語が、KUON Music Theory Suite の該当レッスンに自動リンク。「あの言葉、もう一度学び直したい」が叶います。', en: 'Terms link directly into KUON Music Theory Suite. The "I want to learn that again" moment becomes effortless.' }, lang)} />
            <FeatureCard title={t({ ja: '記憶を、自然な言葉で呼び出す', en: 'Recall by meaning, not date' }, lang)} body={t({ ja: '「フレージングの話、どのレッスンだった?」と問いかけるだけ。日付を覚えていなくても、関連する発言が浮かび上がります。', en: 'Ask "When did we discuss phrasing?" — even without a date, related moments surface.' }, lang)} />
            <FeatureCard title={t({ ja: 'どこへでも持ち出せる', en: 'Take it anywhere' }, lang)} body={t({ ja: 'Notion・Obsidian・YouTube 字幕・あなたの DAW・印刷。書き起こされたレッスンは、あなたのワークフローに自由に流れていきます。', en: 'Notion, Obsidian, YouTube subtitles, your DAW, printed pages — your lessons flow into any workflow.' }, lang)} />
          </div>
        </div>
      </section>

      {/* PRIVACY */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)' }}>
        <h2 style={sectionHeadingStyle()}>{t({ ja: 'プライバシーと信頼', en: 'Privacy & trust' }, lang)}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
          <PrivacyCard
            title={t({ ja: '音源はサーバーに残らない', en: 'No audio persistence' }, lang)}
            body={t({ ja: 'Workers AI で処理した音声データは即座にメモリから消えます。書き起こしテキストのみがあなたのアカウントに紐づいて保存されます。', en: 'Audio is wiped from Workers AI memory immediately. Only transcripts are saved, tied to your account.' }, lang)}
          />
          <PrivacyCard
            title={t({ ja: 'エンドツーエンド HTTPS', en: 'End-to-end HTTPS' }, lang)}
            body={t({ ja: 'すべての通信は TLS 1.3 で暗号化。Cloudflare のグローバルエッジを経由するためレイテンシも極小。', en: 'All traffic TLS 1.3 encrypted. Cloudflare global edge minimizes latency.' }, lang)}
          />
          <PrivacyCard
            title={t({ ja: 'AI 学習に使用されません', en: 'Not used for AI training' }, lang)}
            body={t({ ja: 'Cloudflare Workers AI は推論専用。あなたの音声・テキストがモデル学習に使われることはありません。', en: 'Workers AI is inference-only. Your data never trains models.' }, lang)}
          />
          <PrivacyCard
            title={t({ ja: 'いつでも削除可能', en: 'Delete anytime' }, lang)}
            body={t({ ja: 'レッスンは 1 クリックで完全削除。Vectorize インデックスも同時に消去されます。', en: 'Delete lessons with one click. Vectorize index is also wiped.' }, lang)}
          />
        </div>
      </section>

      {/* PRICING */}
      <section style={{ background: PAPER_DEEP, padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(1.5rem, 4vw, 3rem)' }}>
          <h2 style={sectionHeadingStyle()}>{t({ ja: '料金プラン', en: 'Pricing', es: 'Precios' }, lang)}</h2>
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: '0.95rem', color: INK_SOFT, lineHeight: 1.95, maxWidth: 600, marginTop: '1rem' }}>
            {t({
              ja: 'KUON LESSON RECORDER は Prelude プランから利用可能。空音開発の 30+ アプリ全てを月 ¥780 で開放。',
              en: 'KUON Lesson Recorder is available from Prelude plan. ¥780/month opens all 30+ KUON R&D apps.',
            }, lang)}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
            <PricingTier name="Free" price="¥0" quota="1 回 / 月" minutes="最大 60 分" desc={t({ ja: 'お試し用', en: 'Try it' }, lang)} />
            <PricingTier name="Prelude" price="¥780" quota="15 回 / 月" minutes="最大 900 分 (15 時間)" desc={t({ ja: '音大生・個人レッスン向け', en: 'Music students' }, lang)} highlight />
            <PricingTier name="Concerto" price="¥1,480" quota="25 回 / 月" minutes="最大 1,500 分 (25 時間)" desc={t({ ja: 'プロ・複数指導', en: 'Pros, multi-coaching' }, lang)} />
            <PricingTier name="Symphony" price="¥2,480" quota="50 回 / 月" minutes="最大 3,000 分 (50 時間)" desc={t({ ja: '教師・スタジオ・教育機関', en: 'Teachers, studios, schools' }, lang)} />
          </div>
          <p style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, lineHeight: 1.85, marginTop: '1.4rem', textAlign: 'center' }}>
            {t({
              ja: '1 回 = 1 つのレッスン録音 (最大 60 分・25MB)。短いレッスンも長いレッスンも 1 回としてカウント。年払いで 2 ヶ月無料。',
              en: '1 count = one lesson recording (max 60min / 25MB). Short or long, each is 1 count. Annual saves 2 months.',
              es: '1 = una grabación (máx. 60 min / 25MB). Anual = 2 meses gratis.',
            }, lang)}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)' }}>
        <h2 style={sectionHeadingStyle()}>{t({ ja: 'よくある質問', en: 'FAQ', es: 'Preguntas frecuentes' }, lang)}</h2>
        <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
          <FaqItem
            q={t({ ja: 'どのぐらい精度で書き起こされますか?', en: 'How accurate is the transcription?' }, lang)}
            a={t({ ja: '明瞭な日本語・英語のレッスンであれば、ほぼ違和感のない書き起こしになります。空音開発が長年積み重ねた音楽専門用語の知識を AI に組み込んでいるため、カデンツ・モーダルミクスチャといった用語も正しく認識されます。', en: 'For clear Japanese or English lessons, the transcript reads naturally. Our deep musical knowledge is built into the engine, so even niche terms like "modal mixture" or "cadenza" come through correctly.' }, lang)}
          />
          <FaqItem
            q={t({ ja: '音源は誰に見られますか?', en: 'Who can see my audio?' }, lang)}
            a={t({ ja: '誰にも見られません。あなたの音声は処理直後にすべて消去されます。書き起こされたテキストだけが、あなたのアカウントの中だけに残ります。', en: 'No one. Your audio is wiped right after processing. Only the transcript remains, in your account alone.' }, lang)}
          />
          <FaqItem
            q={t({ ja: '対応している音声ファイル形式は?', en: 'What audio formats?' }, lang)}
            a={t({ ja: '一般的なほぼすべての形式: MP3 / WAV / M4A / OGG / WebM / FLAC。1 ファイル最大 60 分 (25MB) まで。', en: 'Almost all common formats: MP3, WAV, M4A, OGG, WebM, FLAC. Up to 60 minutes (25MB) per file.' }, lang)}
          />
          <FaqItem
            q={t({ ja: '何カ国語に対応していますか?', en: 'How many languages?' }, lang)}
            a={t({ ja: '世界の主要言語ほぼすべてに対応。日本語・英語・ドイツ語・フランス語・イタリア語・スペイン語・ポルトガル語・韓国語・中国語など 90 を超える言語で書き起こし、さらに 100 を超える言語間の翻訳が可能です。', en: 'Almost every major world language. Transcription in 90+ languages (Japanese, English, German, French, Italian, Spanish, Portuguese, Korean, Chinese...) plus translation across 100+ languages.' }, lang)}
          />
          <FaqItem
            q={t({ ja: '話者識別は完璧ですか?', en: 'Is speaker detection perfect?' }, lang)}
            a={t({ ja: '完璧ではありませんが、自然な会話の場面で 8 割は正しく見分けます。違っていた場合も、手で修正できる設計です。', en: 'Not perfect, but distinguishes correctly in 80% of natural conversations. Manual correction is also available.' }, lang)}
          />
          <FaqItem
            q={t({ ja: 'なぜ普通の AI 書き起こしより精度が高いの?', en: 'Why is this more accurate than typical AI transcription?' }, lang)}
            a={t({ ja: '空音開発は音楽家のための会社です。カデンツ・モーダル・ピチカート・アゴーギク──普通の AI が混乱する音楽の言葉を、私たちは隅々まで知っています。その知識をエンジンに組み込んでいるからこそ、レッスンの言葉を取りこぼしません。', en: 'KUON R&D is built for musicians. We know cadence, modal, pizzicato, agogic — the language that confuses generic AI. That deep knowledge is woven into the engine.' }, lang)}
          />
          <FaqItem
            q={t({ ja: 'Theory Suite との連携とは?', en: 'How does Theory Suite integration work?' }, lang)}
            a={t({ ja: 'レッスンで出てきた音楽用語が、KUON Music Theory Suite の該当レッスンに自動でリンクされます。「ナポリの六」が出てきたら、その瞬間にナポリ和音のレッスンに飛べます。', en: 'Recognized music terms auto-link to KUON Music Theory Suite lessons. If "Neapolitan sixth" appears, you can jump straight to that lesson.' }, lang)}
          />
          <FaqItem
            q={t({ ja: 'いつから使えますか?', en: 'When can I start?' }, lang)}
            a={t({ ja: '今すぐ。無料アカウントで 1 回試せます。月額 ¥780 のプラン以上で、月 15〜50 回まで本格的にご利用いただけます。', en: 'Right now. Free account = 1 try. Subscriptions from ¥780/month allow 15-50 transcriptions monthly.' }, lang)}
          />
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: INK, color: PAPER, padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)', textAlign: 'center' }}>
        <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 400, margin: 0, letterSpacing: '0.04em', lineHeight: 1.5 }}>
          {t({ ja: '次のレッスンから、知識を残しましょう。', en: 'Start preserving knowledge from your next lesson.' }, lang)}
        </h2>
        <div style={{ marginTop: '2rem' }}>
          <Link href="/lesson-recorder" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
            background: PAPER, color: INK, padding: '1.1rem 2.6rem', borderRadius: 3,
            fontFamily: serif, fontSize: '1.05rem', textDecoration: 'none',
            letterSpacing: '0.12em',
          }}>
            {t({ ja: '今すぐ試す', en: 'Try now' }, lang)} →
          </Link>
        </div>
        <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: '0.85rem', color: '#cbcab9', marginTop: '1.4rem', letterSpacing: '0.03em' }}>
          {t({
            ja: '空音開発 / KUON R&D — 朝比奈幸太郎が開発・運営する音楽家のためのプラットフォーム',
            en: 'KUON R&D / 空音開発 — Music platform built by Kotaro Asahina',
          }, lang)}
        </p>
      </section>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────
function sectionHeadingStyle(): React.CSSProperties {
  return {
    fontFamily: serif, fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)', fontWeight: 400,
    letterSpacing: '0.04em', color: INK, margin: 0, lineHeight: 1.5,
  };
}

function TrustItem({ mark, label }: { mark: string; label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: serif, fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: INK, letterSpacing: '0.02em' }}>{mark}</div>
      <div style={{ fontFamily: mono, fontSize: '0.65rem', color: INK_FAINT, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '0.4rem' }}>{label}</div>
    </div>
  );
}

function BeforeAfterCard({ type, label, title, items }: any) {
  const isAfter = type === 'after';
  return (
    <div style={{
      background: isAfter ? '#fff' : PAPER_DEEP,
      border: `1px solid ${isAfter ? ACCENT : STAFF_LINE}`,
      borderRadius: 4, padding: 'clamp(1.4rem, 2.5vw, 2rem)',
    }}>
      <div style={{ fontFamily: mono, fontSize: '0.65rem', color: isAfter ? ACCENT : INK_FAINT, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>{label}</div>
      <h3 style={{ fontFamily: serif, fontSize: '1.2rem', color: INK, margin: '0 0 1.2rem 0', fontWeight: 500, letterSpacing: '0.03em' }}>{title}</h3>
      <ul style={{ margin: 0, paddingLeft: '1.2rem', fontFamily: sans, fontSize: '0.85rem', color: INK_SOFT, lineHeight: 2 }}>
        {items.map((it: string, i: number) => <li key={i}>{it}</li>)}
      </ul>
    </div>
  );
}

function PersonaCard({ name, body }: { name: string; body: string }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4, padding: '1.6rem 1.4rem' }}>
      <div style={{ fontFamily: serif, fontSize: '1.1rem', color: INK, marginBottom: '0.7rem', fontWeight: 500, letterSpacing: '0.03em' }}>{name}</div>
      <div style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_SOFT, lineHeight: 1.95 }}>{body}</div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '1.2rem', alignItems: 'baseline', padding: '1.4rem 1.6rem', background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4 }}>
      <div style={{ fontFamily: serif, fontSize: '1.6rem', color: ACCENT, letterSpacing: '0.02em' }}>{n}</div>
      <div>
        <h3 style={{ fontFamily: serif, fontSize: '1.05rem', color: INK, fontWeight: 500, margin: '0 0 0.4rem 0', letterSpacing: '0.03em' }}>{title}</h3>
        <p style={{ fontFamily: sans, fontSize: '0.88rem', color: INK_SOFT, lineHeight: 1.95, margin: 0 }}>{body}</p>
      </div>
    </div>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4, padding: '1.4rem 1.5rem' }}>
      <h3 style={{ fontFamily: serif, fontSize: '1rem', color: INK, fontWeight: 500, margin: '0 0 0.6rem 0', letterSpacing: '0.03em' }}>{title}</h3>
      <p style={{ fontFamily: sans, fontSize: '0.82rem', color: INK_SOFT, lineHeight: 1.9, margin: 0 }}>{body}</p>
    </div>
  );
}

function PrivacyCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${STAFF_LINE}`, borderLeft: `3px solid ${ACCENT}`, borderRadius: 4, padding: '1.4rem 1.6rem' }}>
      <h3 style={{ fontFamily: serif, fontSize: '1rem', color: INK, fontWeight: 500, margin: '0 0 0.5rem 0' }}>{title}</h3>
      <p style={{ fontFamily: sans, fontSize: '0.82rem', color: INK_SOFT, lineHeight: 1.9, margin: 0 }}>{body}</p>
    </div>
  );
}

function PricingTier({ name, price, quota, minutes, desc, highlight }: any) {
  return (
    <div style={{
      background: highlight ? INK : '#fff',
      color: highlight ? PAPER : INK,
      border: `1px solid ${highlight ? INK : STAFF_LINE}`,
      borderRadius: 4, padding: '1.6rem 1.4rem', textAlign: 'center',
    }}>
      <div style={{ fontFamily: mono, fontSize: '0.7rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: highlight ? '#cbcab9' : INK_FAINT, marginBottom: '0.6rem' }}>{name}</div>
      <div style={{ fontFamily: serif, fontSize: '2rem', fontWeight: 400, marginBottom: '0.3rem' }}>{price}<span style={{ fontSize: '0.55em', opacity: 0.6 }}> /月</span></div>
      <div style={{ fontFamily: serif, fontSize: '1rem', color: ACCENT, marginBottom: '0.2rem' }}>{quota}</div>
      {minutes && (
        <div style={{ fontFamily: mono, fontSize: '0.65rem', color: highlight ? '#cbcab9' : INK_FAINT, marginBottom: '0.6rem', letterSpacing: '0.04em' }}>{minutes}</div>
      )}
      <div style={{ fontFamily: sans, fontSize: '0.78rem', opacity: 0.7, lineHeight: 1.7, marginTop: minutes ? '0.4rem' : 0 }}>{desc}</div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details style={{ background: '#fff', border: `1px solid ${STAFF_LINE}`, borderRadius: 4, padding: '1.2rem 1.4rem' }}>
      <summary style={{ fontFamily: serif, fontSize: '1rem', color: INK, cursor: 'pointer', fontWeight: 500, letterSpacing: '0.02em' }}>{q}</summary>
      <p style={{ fontFamily: sans, fontSize: '0.88rem', color: INK_SOFT, lineHeight: 1.95, margin: '0.8rem 0 0 0', paddingTop: '0.7rem', borderTop: `1px solid ${STAFF_LINE}` }}>{a}</p>
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
    name: 'KUON LESSON RECORDER',
    applicationCategory: 'EducationalApplication',
    applicationSubCategory: 'Music Education / AI Transcription',
    operatingSystem: 'Web Browser (Chrome, Edge, Firefox, Safari)',
    description:
      'AI-powered music lesson transcription and summarization. Music-specialized engine recognizes 100+ terminology, distinguishes teacher/student, generates 3-line summary, action items, and links to KUON Music Theory Suite. Privacy-first design — audio is wiped after processing.',
    url: 'https://kuon-rnd.com/lesson-recorder',
    image: 'https://kuon-rnd.com/og-lesson-recorder.png',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '2480',
      priceCurrency: 'JPY',
      offers: [
        { '@type': 'Offer', price: '0', priceCurrency: 'JPY', name: 'Free' },
        { '@type': 'Offer', price: '780', priceCurrency: 'JPY', name: 'Prelude' },
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
      'AI transcription (99 languages)',
      'Music vocabulary recognition',
      'Speaker detection (teacher/student)',
      '3-line summary generation',
      'Action items extraction',
      'Music terminology explanation',
      'Theory Suite integration',
      'Semantic search across past lessons',
      'Markdown / SRT / JSON / TXT export',
      'Browser-based, no server audio storage',
    ],
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How accurate is the transcription?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'For clear Japanese or English lessons, the transcript reads naturally. Our music-specialized engine recognizes terminology like cadence, modal mixture, pizzicato, and agogic correctly — terms that confuse generic AI transcription.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my audio stored on the server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'No. Audio is wiped immediately after transcription. Only the resulting transcript is saved, accessible only from your account.',
        },
      },
      {
        '@type': 'Question',
        name: 'What audio formats are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'MP3, WAV, M4A, OGG, WebM, FLAC. Maximum 25MB per file (~60 minutes of audio).',
        },
      },
      {
        '@type': 'Question',
        name: 'How many languages are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Transcription in 90+ world languages including Japanese, English, German, French, Italian, Spanish, Portuguese, Korean, Chinese. Translation across 100+ languages.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the pricing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Free: 1 transcription/month. Prelude (¥780/mo): 15/month. Concerto (¥1,480/mo): 25/month. Symphony (¥2,480/mo): 50/month. Annual plans save 2 months.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why does this AI understand music terminology better?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'KUON R&D is built specifically for musicians. Our AI engine has been fine-tuned with deep musical knowledge — cadence, modal mixture, pizzicato, agogic — terms that confuse generic transcription services.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the maximum lesson length?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Up to 60 minutes (25MB) per single transcription. Longer lessons can be split into multiple files.',
        },
      },
    ],
  };

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to transcribe a music lesson with KUON LESSON RECORDER',
    description:
      'Step-by-step guide to transcribing a music lesson recording, generating an AI summary, and exporting notes.',
    totalTime: 'PT5M',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'JPY', value: '0' },
    supply: [
      { '@type': 'HowToSupply', name: 'Music lesson audio recording (MP3/WAV/M4A, up to 25MB)' },
    ],
    tool: [
      { '@type': 'HowToTool', name: 'Web browser (Chrome/Edge/Firefox/Safari)' },
      { '@type': 'HowToTool', name: 'KUON R&D account (free signup)' },
    ],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Visit KUON LESSON RECORDER',
        text: 'Go to https://kuon-rnd.com/lesson-recorder and sign in with your KUON R&D account.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Enter lesson info',
        text: 'Provide a title, instrument, teacher name (optional), and language preference.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Record or upload',
        text: 'Either record directly via microphone or upload an existing audio file (max 25MB).',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Wait for AI processing',
        text: 'Workers AI Whisper transcribes and Llama 3.3 generates a summary. Typically takes ~10% of the recording length.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Review and export',
        text: 'View 3-line summary, key points, action items. Export as Markdown, SRT subtitles, JSON, or plain text.',
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
