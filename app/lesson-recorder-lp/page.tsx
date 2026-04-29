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
          KUON · Lesson Recorder · Powered by Cloudflare Workers AI
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
            ja: '音楽専門用語を理解する AI が、レッスン録音を書き起こし、3 行の要旨にまとめ、次回までのアクション項目を抽出します。すべてブラウザの中で完結。サーバーに音源は残りません。',
            en: 'AI that understands musical terminology transcribes your lesson recordings, distills them into 3-line summaries, and extracts action items for next time. Browser-completed. Audio never persisted.',
            es: 'IA que entiende terminología musical transcribe tus grabaciones, las resume en 3 líneas y extrae tareas para la próxima clase. Todo en el navegador. El audio no se guarda.',
            ko: '음악 전문 용어를 이해하는 AI가 레슨 녹음을 받아쓰고 3줄로 요약하며 다음 레슨까지의 액션 항목을 추출합니다. 브라우저에서 완결. 음원은 서버에 남지 않습니다.',
            pt: 'IA que entende terminologia musical transcreve gravações, resume em 3 linhas e extrai ações. Tudo no navegador. O áudio não é guardado.',
            de: 'KI, die musikalische Fachbegriffe versteht, transkribiert Aufnahmen, fasst in 3 Zeilen zusammen und extrahiert Aktionspunkte. Im Browser. Audio bleibt nicht gespeichert.',
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
          ja: '5 ステップで知識化',
          en: '5 steps to knowledge',
          es: '5 pasos al conocimiento',
        }, lang)}</h2>
        <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
          <Step
            n="01"
            title={t({ ja: '録音 or アップロード', en: 'Record or upload' }, lang)}
            body={t({ ja: 'マイクで直接録音、または手元の音声ファイル (MP3 / WAV / M4A) をアップロード。最大 25MB。', en: 'Record directly via microphone or upload audio file (MP3/WAV/M4A). Max 25MB.' }, lang)}
          />
          <Step
            n="02"
            title={t({ ja: 'Workers AI Whisper が書き起こし', en: 'Workers AI Whisper transcribes' }, lang)}
            body={t({ ja: '音楽専門用語を事前に学習させた Whisper-large-v3-turbo が、99 言語で精度よく書き起こし。話者を教師/生徒に推定。', en: 'Whisper-large-v3-turbo with music vocabulary priming transcribes in 99 languages and detects teacher/student.' }, lang)}
          />
          <Step
            n="03"
            title={t({ ja: 'Llama 3.3 が要約 + 抽出', en: 'Llama 3.3 summarizes' }, lang)}
            body={t({ ja: '70B パラメータの Llama 3.3 が、3 行サマリー・主な指摘・アクション項目・音楽用語の解説を生成。', en: 'Llama 3.3 70B generates 3-line summary, key points, action items, and music terminology explanations.' }, lang)}
          />
          <Step
            n="04"
            title={t({ ja: '必要なら多言語翻訳', en: 'Translate if needed' }, lang)}
            body={t({ ja: 'M2M100 が 100+ 言語に翻訳。海外マスタークラスを母国語で読み返せる。', en: 'M2M100 translates to 100+ languages. Read foreign masterclasses in your native language.' }, lang)}
          />
          <Step
            n="05"
            title={t({ ja: 'エクスポート + 検索', en: 'Export & search' }, lang)}
            body={t({ ja: 'Markdown / SRT / JSON で出力。過去レッスンを意味検索 (Vectorize) で「あの和声についての質問はいつだった?」も即座に発見。', en: 'Export Markdown/SRT/JSON. Semantic search (Vectorize) finds past lessons by meaning.' }, lang)}
          />
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: PAPER_DEEP, padding: 'clamp(4rem, 8vw, 6rem) 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(1.5rem, 4vw, 3rem)' }}>
          <h2 style={sectionHeadingStyle()}>{t({ ja: 'プロのための機能', en: 'Pro-grade features', es: 'Funciones profesionales' }, lang)}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
            <FeatureCard title={t({ ja: '音楽用語認識', en: 'Music vocabulary' }, lang)} body={t({ ja: 'カデンツ・モーダルミクスチャ・ピチカート・アゴーギク等 100+ の専門用語を Whisper のプロンプトに事前注入。誤認識を激減。', en: '100+ music terms pre-injected into Whisper prompt. Drastically reduces misrecognition.' }, lang)} />
            <FeatureCard title={t({ ja: '話者推定 (教師 / 生徒)', en: 'Speaker detection' }, lang)} body={t({ ja: '言語パターン + ポーズ長から教師と生徒の発話を自動識別。完璧ではないが 8 割の場面で正解。', en: 'Auto-distinguishes teacher and student via language patterns and pause lengths.' }, lang)} />
            <FeatureCard title={t({ ja: 'タイムスタンプ', en: 'Timestamps' }, lang)} body={t({ ja: '全発言に開始/終了時刻付き。SRT 形式で動画字幕としてもそのまま使える。', en: 'Every utterance has start/end times. Use as video subtitles via SRT export.' }, lang)} />
            <FeatureCard title={t({ ja: 'Theory Suite 連携', en: 'Theory Suite integration' }, lang)} body={t({ ja: '出てきた音楽用語を自動で Theory Suite の関連レッスンにリンク。学びが深まる導線。', en: 'Music terms link to Theory Suite lessons. Deeper learning loop.' }, lang)} />
            <FeatureCard title={t({ ja: '意味検索', en: 'Semantic search' }, lang)} body={t({ ja: 'BGE-m3 埋め込み + Vectorize で過去全レッスンを意味検索。「フレーズの作り方は?」で関連発言を即発見。', en: 'BGE-m3 + Vectorize for semantic search across all past lessons.' }, lang)} />
            <FeatureCard title={t({ ja: '多形式エクスポート', en: 'Multi-format export' }, lang)} body={t({ ja: 'Markdown (Notion/Obsidian) · SRT (動画字幕) · JSON (完全データ) · TXT (シンプル)。', en: 'Markdown, SRT, JSON, plain text — works with any tool.' }, lang)} />
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
            <PricingTier name="Concerto" price="¥1,480" quota="35 回 / 月" minutes="最大 2,100 分 (35 時間)" desc={t({ ja: 'プロ・複数指導', en: 'Pros, multi-coaching' }, lang)} />
            <PricingTier name="Symphony" price="¥2,480" quota="80 回 / 月" minutes="最大 4,800 分 (80 時間)" desc={t({ ja: '教師・スタジオ・教育機関', en: 'Teachers, studios, schools' }, lang)} />
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
            q={t({ ja: 'どのぐらいの精度で書き起こされますか?', en: 'How accurate is the transcription?' }, lang)}
            a={t({ ja: 'OpenAI Whisper-large-v3-turbo を使用しているため、明瞭な日本語/英語であれば 95% 以上の精度。音楽専門用語は事前にプロンプト注入しているためカデンツ・モーダルミクスチャ等の認識精度はさらに高くなります。', en: 'OpenAI Whisper-large-v3-turbo achieves 95%+ accuracy on clear speech. Music terms are pre-injected for even higher precision.' }, lang)}
          />
          <FaqItem
            q={t({ ja: '音源は誰に見られますか?', en: 'Who can see my audio?' }, lang)}
            a={t({ ja: '誰にも見られません。Workers AI は推論時のみ音声を扱い、処理後は即座にメモリから消去されます。書き起こしテキストはあなたのアカウントでのみアクセス可能。', en: 'No one. Workers AI processes audio in memory only and wipes immediately. Transcripts are private to your account.' }, lang)}
          />
          <FaqItem
            q={t({ ja: '対応している音声ファイル形式は?', en: 'What audio formats?' }, lang)}
            a={t({ ja: 'MP3 / WAV / M4A / OGG / WebM / FLAC。1 ファイル最大 25MB (約 60 分の音声に相当)。', en: 'MP3, WAV, M4A, OGG, WebM, FLAC. Max 25MB per file (about 60 min audio).' }, lang)}
          />
          <FaqItem
            q={t({ ja: '何カ国語に対応していますか?', en: 'How many languages?' }, lang)}
            a={t({ ja: 'Whisper-large-v3-turbo は 99 言語に対応 (日本語・英語・ドイツ語・フランス語・イタリア語・スペイン語・ポルトガル語・韓国語・中国語等)。M2M100 で 100 言語以上の翻訳も可能。', en: '99 languages via Whisper-large-v3-turbo (ja/en/de/fr/it/es/pt/ko/zh etc.). 100+ language translation via M2M100.' }, lang)}
          />
          <FaqItem
            q={t({ ja: '話者分離は完璧ですか?', en: 'Is speaker detection perfect?' }, lang)}
            a={t({ ja: 'いいえ、ヒューリスティック (語調 + ポーズ長) ベースなので完璧ではありません。8 割の場面で正解しますが、後から手動で修正することも可能です。完全な diarization は今後の拡張予定。', en: 'No — heuristic-based (~80% accuracy). Manual correction is possible. Full diarization is on the roadmap.' }, lang)}
          />
          <FaqItem
            q={t({ ja: 'なぜ Cloudflare Workers AI を使うのですか?', en: 'Why Cloudflare Workers AI?' }, lang)}
            a={t({ ja: 'コスト・速度・プライバシー全てで最適だから。Whisper を Workers AI で実行すると同等処理が他クラウドの 1/30〜1/50 のコスト。エッジ推論なので世界中のユーザーに低レイテンシで応答できます。', en: 'Best in cost, speed, privacy. Whisper on Workers AI is 30-50x cheaper than alternatives. Edge inference means low latency worldwide.' }, lang)}
          />
          <FaqItem
            q={t({ ja: 'Theory Suite との連携とは?', en: 'How does Theory Suite integration work?' }, lang)}
            a={t({ ja: 'AI が認識した音楽用語 (カデンツ等) を Theory Suite の該当レッスンに自動リンク。レッスンで「ナポリの六」が出てきたら、そのまま M5 のナポリ和音レッスンに飛べます。', en: 'Recognized music terms auto-link to Theory Suite lessons. If "Neapolitan sixth" appears, jump straight to the M5 lesson.' }, lang)}
          />
          <FaqItem
            q={t({ ja: 'いつから使えますか?', en: 'When can I start?' }, lang)}
            a={t({ ja: '今すぐ。無料アカウントで 1 回試せます。サブスクリプション (Prelude / Concerto / Symphony) で月 15〜80 回利用可能。', en: 'Right now. Free account = 1 try. Subscriptions allow 15-80/month.' }, lang)}
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
      'AI-powered music lesson transcription and summarization. Cloudflare Workers AI Whisper-large-v3-turbo + Llama 3.3 70B + M2M100. Browser-completed, privacy-first, Prelude plan and up.',
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
            'OpenAI Whisper-large-v3-turbo achieves 95%+ accuracy on clear Japanese/English. Music vocabulary (cadenza, modal mixture, pizzicato etc.) is pre-injected into the Whisper prompt for even higher precision.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my audio stored on the server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'No. Cloudflare Workers AI processes audio in memory only and discards it immediately after transcription. Only the resulting text is saved, tied to your account.',
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
            'Whisper-large-v3-turbo supports 99 languages including Japanese, English, German, French, Italian, Spanish, Portuguese, Korean, Chinese. M2M100 provides translation to 100+ languages.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the pricing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Free: 1 transcription/month. Prelude (¥780/mo): 15/month. Concerto (¥1,480/mo): 35/month. Symphony (¥2,480/mo): 80/month. Annual plans save 2 months.',
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
