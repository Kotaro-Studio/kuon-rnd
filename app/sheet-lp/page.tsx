'use client';

/**
 * KUON SHEET — Landing Page
 *
 * 設計方針:
 *   - 「エディタは無料、画像スキャンは Concerto+」のフリーミアムを明示
 *   - シンガーソングライター・ジャズ奏者・ポップス作曲家への訴求
 *   - 4 言語歌詞対応 (ja/en/es/de)
 *   - LP 自体は 6 言語 (ja/en/es/de/ko/pt)
 *   - JSON-LD x 3 (SoftwareApplication / FAQPage / HowTo)
 *   - §48 余白の知性 + §49 単一正解を押し付けない
 */

import Link from 'next/link';
import { useLang } from '@/context/LangContext';

const PAPER = '#fbfaf6';
const PAPER_DEEP = '#f0ece1';
const INK = '#1a1a1a';
const INK_SOFT = '#3a3a3a';
const INK_FAINT = '#7a7575';
const ACCENT = '#3a5f7a';
const RULE = '#d8d2c2';

const serif = '"Shippori Mincho", "Noto Serif JP", "Times New Roman", serif';
const sans = '"Helvetica Neue", "Inter", "Hiragino Sans", system-ui, sans-serif';

type LangMap = Partial<Record<string, string>> & { en: string };
const t = (m: LangMap, lang: string): string =>
  (m[lang as keyof typeof m] as string) || (m.ja as string) || m.en;

export default function SheetLP() {
  const { lang } = useLang();
  return (
    <>
      <JsonLD />
      <main style={{ background: PAPER, color: INK, fontFamily: serif, minHeight: '100vh' }}>
        {/* HERO */}
        <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 3rem) clamp(3rem, 6vw, 5rem)', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontFamily: sans, fontSize: '0.78rem', letterSpacing: '0.18em', color: ACCENT, textTransform: 'uppercase', marginBottom: '1.2rem' }}>
            KUON SHEET · {t({ ja: 'エディタは無料', en: 'Editor free', de: 'Editor kostenlos', es: 'Editor gratis', ko: '에디터 무료', pt: 'Editor grátis' }, lang)}
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 400, lineHeight: 1.3, margin: 0, letterSpacing: '0.02em' }}>
            {t(
              {
                ja: 'リードシート、思いついたままに。',
                en: 'Lead sheets, as they come to you.',
                de: 'Lead Sheets, wie sie dir einfallen.',
                es: 'Lead sheets, tal como llegan a ti.',
                ko: '리드시트, 떠오른 그대로.',
                pt: 'Lead sheets, como vêm até você.',
              },
              lang,
            )}
          </h1>
          <p style={{ fontFamily: sans, fontSize: 'clamp(1rem, 1.6vw, 1.15rem)', color: INK_SOFT, lineHeight: 1.95, marginTop: '1.5rem', maxWidth: 720 }}>
            {t(
              {
                ja: 'メロディ・コードネーム・歌詞 ── シンガーソングライターやジャズ奏者が必要な 3 要素を 1 画面で。手書きの楽譜は画像スキャンで自動的に編集可能な譜面に。日本語・英語・スペイン語・ドイツ語の歌詞に対応。PDF と MIDI で書き出せます。',
                en: 'Melody, chord symbols, lyrics — the three things singer-songwriters and jazz players actually need, on one page. Scan handwritten sheets and watch them turn into editable scores. Lyrics in Japanese, English, Spanish, and German. Export as PDF or MIDI.',
                de: 'Melodie, Akkordsymbole, Songtexte — die drei Dinge, die Singer-Songwriter wirklich brauchen, auf einer Seite.',
                es: 'Melodía, acordes, letra — las tres cosas que los cantautores realmente necesitan, en una sola página.',
                ko: '멜로디·코드 네임·가사 — 싱어송라이터에게 필요한 세 가지를 한 화면에.',
                pt: 'Melodia, acordes, letra — as três coisas que cantautores realmente precisam, em uma única página.',
              },
              lang,
            )}
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '2.2rem', flexWrap: 'wrap' }}>
            <Link
              href="/sheet"
              style={{
                padding: '1rem 2.4rem', background: INK, color: PAPER, textDecoration: 'none',
                fontFamily: serif, fontSize: '1rem', letterSpacing: '0.1em',
                borderRadius: 2, display: 'inline-block',
              }}
            >
              {t({ ja: '無料で書き始める →', en: 'Start writing — free →', de: 'Kostenlos beginnen →', es: 'Empezar gratis →', ko: '무료로 시작 →', pt: 'Começar grátis →' }, lang)}
            </Link>
            <Link
              href="#features"
              style={{
                padding: '1rem 1.8rem', background: 'transparent', color: INK, textDecoration: 'none',
                fontFamily: serif, fontSize: '1rem', letterSpacing: '0.1em',
                border: `1px solid ${RULE}`, borderRadius: 2, display: 'inline-block',
              }}
            >
              {t({ ja: '機能を見る ↓', en: 'See features ↓', de: 'Funktionen ↓', es: 'Ver funciones ↓', ko: '기능 ↓', pt: 'Ver recursos ↓' }, lang)}
            </Link>
          </div>
        </section>

        {/* TRUST BAR */}
        <section style={{ background: PAPER_DEEP, padding: '2rem clamp(1.5rem, 4vw, 3rem)', borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', textAlign: 'center' }}>
            <TrustItem mark="¥0" label={t({ ja: 'エディタ無料', en: 'editor free', de: 'Editor frei', es: 'editor gratis', ko: '에디터 무료', pt: 'editor grátis' }, lang)} />
            <TrustItem mark="4" label={t({ ja: '言語の歌詞対応', en: 'lyric languages', de: 'Sprachen', es: 'idiomas', ko: '언어 지원', pt: 'idiomas' }, lang)} />
            <TrustItem mark="📷" label={t({ ja: '手書きスキャン', en: 'handwriting scan', de: 'Handschrift-Scan', es: 'escaneo manuscrito', ko: '손글씨 스캔', pt: 'escanear manuscrito' }, lang)} />
            <TrustItem mark="PDF" label={t({ ja: '+ MIDI 出力', en: '+ MIDI export', de: '+ MIDI Export', es: '+ MIDI export', ko: '+ MIDI 내보내기', pt: '+ MIDI export' }, lang)} />
            <TrustItem mark="∞" label={t({ ja: 'エディタ無制限', en: 'unlimited editing', de: 'unbegrenzte Bearbeitung', es: 'edición ilimitada', ko: '무제한 편집', pt: 'edição ilimitada' }, lang)} />
          </div>
        </section>

        {/* WHO IS THIS FOR */}
        <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)', maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={sectionHeading()}>
            {t({ ja: 'こんな人のために', en: 'Who is this for', de: 'Für wen', es: 'Para quién', ko: '대상', pt: 'Para quem' }, lang)}
          </h2>
          <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            <Persona emoji="🎸" title={t({ ja: 'シンガーソングライター', en: 'Singer-songwriters' }, lang)} desc={t({ ja: '思いついたメロディとコードと歌詞を、ノートに書く感覚で。', en: 'Capture melodies, chords, and lyrics as casually as a notebook.' }, lang)} />
            <Persona emoji="🎷" title={t({ ja: 'ジャズ奏者', en: 'Jazz players' }, lang)} desc={t({ ja: 'スタンダードのメモ書き、自作曲のリードシート、ガイドトーン。', en: 'Standards memos, original lead sheets, guide tones.' }, lang)} />
            <Persona emoji="🎹" title={t({ ja: 'バンド・編曲家', en: 'Bands & arrangers' }, lang)} desc={t({ ja: 'コード進行を共演者にすばやく共有。', en: 'Share chord progressions with bandmates in seconds.' }, lang)} />
            <Persona emoji="🎓" title={t({ ja: '音楽教師・生徒', en: 'Teachers & students' }, lang)} desc={t({ ja: '手書きの教材を、編集できる譜面に。', en: 'Turn handwritten exercises into editable scores.' }, lang)} />
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" style={{ background: PAPER_DEEP, padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={sectionHeading()}>
              {t({ ja: '機能', en: 'Features', de: 'Funktionen', es: 'Funciones', ko: '기능', pt: 'Recursos' }, lang)}
            </h2>
            <div style={{ marginTop: '2.5rem', display: 'grid', gap: '1rem' }}>
              <Feature
                num="1"
                title={t({ ja: '画像スキャン (手書き対応)', en: 'Image scan (handwriting supported)' }, lang)}
                desc={t(
                  {
                    ja: '手書きの楽譜・コードノートを撮影・アップロード → AI が自動的にメロディ・コード・歌詞を読み取って編集可能な譜面に変換。70-90% の精度で 1 次認識し、エディタで校正できます。',
                    en: 'Photograph or upload handwritten sheet music or chord charts. AI reads melody, chords, and lyrics, converts to an editable score. 70-90% first-pass accuracy; refine in the editor.',
                  },
                  lang,
                )}
                badge="Concerto+"
              />
              <Feature
                num="2"
                title={t({ ja: 'ライブプレビュー楽譜エディタ', en: 'Live-preview score editor' }, lang)}
                desc={t(
                  {
                    ja: '左側で ABC notation を編集、右側で美しい譜面が即座に表示。世界標準の ABC 形式なので学習コストも将来性も◎。',
                    en: 'Edit ABC notation on the left, see beautifully rendered score on the right — instantly. ABC is the world standard, learnable and future-proof.',
                  },
                  lang,
                )}
                badge="Free"
              />
              <Feature
                num="3"
                title={t({ ja: 'コード + 歌詞 + メロディの 3 要素', en: 'Chords + lyrics + melody together' }, lang)}
                desc={t(
                  {
                    ja: 'メロディの上にコードネーム、下に歌詞 ── プロのリードシートそのまま。ジャズ・ポップス・フォーク・ボサノヴァ、どんなジャンルでも書ける。',
                    en: 'Chord names above the staff, lyrics below — exactly like professional lead sheets. Works for jazz, pop, folk, bossa, anything.',
                  },
                  lang,
                )}
                badge="Free"
              />
              <Feature
                num="4"
                title={t({ ja: '4 言語歌詞対応', en: '4-language lyrics support' }, lang)}
                desc={t(
                  {
                    ja: '日本語 (ひらがな・カタカナ・漢字)・英語・スペイン語 (アクセント付き)・ドイツ語 (ウムラウト付き) ── 母国語で歌詞を書ける。',
                    en: 'Japanese (hiragana/katakana/kanji), English, Spanish (with accents), German (with umlauts) — write lyrics in your native language.',
                  },
                  lang,
                )}
                badge="Free"
              />
              <Feature
                num="5"
                title={t({ ja: 'クラウド保存 + どこからでも編集', en: 'Cloud save — edit anywhere' }, lang)}
                desc={t(
                  {
                    ja: 'Free プランで 10 譜面、Concerto 以上で無制限。ログインすればどの端末からも続きを書けます。',
                    en: 'Free: 10 sheets. Concerto+: unlimited. Log in from any device and continue where you left off.',
                  },
                  lang,
                )}
                badge="Free / Concerto+"
              />
              <Feature
                num="6"
                title={t({ ja: 'PDF + MIDI + ABC ダウンロード', en: 'PDF + MIDI + ABC download' }, lang)}
                desc={t(
                  {
                    ja: 'バンドメンバーには PDF、DAW で確認するなら MIDI、別の譜面ソフトで開くなら ABC。すべて 1 クリック。',
                    en: 'PDF for bandmates, MIDI for DAW playback, ABC for other notation software. All one click.',
                  },
                  lang,
                )}
                badge="Free"
              />
              <Feature
                num="7"
                title={t({ ja: 'ブラウザ完結・インストール不要', en: 'Browser-native, no install' }, lang)}
                desc={t(
                  {
                    ja: 'スマホ・タブレット・PC、どこからでもブラウザを開けば動きます。Sibelius / Finale / Dorico を持っていなくても OK。',
                    en: 'Works on phone, tablet, or computer — anywhere a browser opens. No need for Sibelius, Finale, or Dorico.',
                  },
                  lang,
                )}
                badge="Free"
              />
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)', maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={sectionHeading()}>
            {t({ ja: '料金', en: 'Pricing', de: 'Preise', es: 'Precios', ko: '요금', pt: 'Preços' }, lang)}
          </h2>
          <p style={{ fontFamily: sans, fontSize: '0.95rem', color: INK_SOFT, lineHeight: 1.95, marginTop: '1rem', maxWidth: 720 }}>
            {t(
              {
                ja: 'エディタ・PDF / MIDI 出力・10 譜面までのクラウド保存は完全無料。画像スキャンと無制限保存は Concerto プラン以上で利用できます。',
                en: 'Editor, PDF/MIDI export, and cloud save up to 10 sheets are completely free. Image scanning and unlimited save are available on Concerto and above.',
              },
              lang,
            )}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
            <Tier name="Free" price="¥0" lines={[
              t({ ja: 'エディタ無制限', en: 'Editor unlimited' }, lang),
              t({ ja: '10 譜面までクラウド保存', en: 'Save up to 10 sheets' }, lang),
              t({ ja: 'PDF / MIDI / ABC 出力', en: 'PDF / MIDI / ABC export' }, lang),
              t({ ja: '画像スキャンなし', en: 'No image scan' }, lang),
            ]} />
            <Tier name="Concerto" price="¥1,480" highlight lines={[
              t({ ja: 'エディタ無制限', en: 'Editor unlimited' }, lang),
              t({ ja: 'クラウド保存無制限', en: 'Unlimited cloud save' }, lang),
              t({ ja: '画像スキャン 月 10 回', en: 'Image scan 10/month' }, lang),
              t({ ja: '+ 30+ アプリ全部', en: '+ all 30+ apps' }, lang),
            ]} />
            <Tier name="Symphony" price="¥2,480" lines={[
              t({ ja: 'エディタ無制限', en: 'Editor unlimited' }, lang),
              t({ ja: 'クラウド保存無制限', en: 'Unlimited cloud save' }, lang),
              t({ ja: '画像スキャン 月 30 回', en: 'Image scan 30/month' }, lang),
              t({ ja: '+ 全アプリ + 優先処理', en: '+ all apps + priority' }, lang),
            ]} />
          </div>
          <p style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, marginTop: '1.4rem', textAlign: 'center', lineHeight: 1.85 }}>
            {t({ ja: '年払いで 2 ヶ月無料。', en: 'Annual: 2 months free.', de: 'Jährlich: 2 Monate frei.', es: 'Anual: 2 meses gratis.', ko: '연간 결제 2 개월 무료.', pt: 'Anual: 2 meses grátis.' }, lang)}
          </p>
        </section>

        {/* FAQ */}
        <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)', background: PAPER_DEEP }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={sectionHeading()}>
              {t({ ja: 'よくある質問', en: 'FAQ', de: 'FAQ', es: 'Preguntas', ko: '자주 묻는 질문', pt: 'Perguntas' }, lang)}
            </h2>
            <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
              <FaqItem
                q={t({ ja: 'クラシック音楽の楽譜にも使えますか?', en: 'Does it work for classical music?' }, lang)}
                a={t(
                  {
                    ja: 'KUON SHEET はリードシート (メロディ + コード + 歌詞) に特化しています。複雑なクラシック楽譜 (4 声フーガ・連符・複雑な強弱記号) には対応していません。クラシック分析は KUON CLASSICAL ANALYSIS、和声学習は Theory Suite をご利用ください。',
                    en: 'KUON SHEET specializes in lead sheets (melody + chords + lyrics). It does not handle complex classical scores (4-voice fugues, tuplets, intricate dynamics). For classical analysis use KUON CLASSICAL ANALYSIS, for theory use Theory Suite.',
                  },
                  lang,
                )}
              />
              <FaqItem
                q={t({ ja: '画像スキャンの精度は?', en: 'How accurate is image scanning?' }, lang)}
                a={t(
                  {
                    ja: '印刷された楽譜は 90-95%、手書きは 70-90% の精度で 1 次認識します。手書きはペンの太さや傾きで変動します。エディタで校正できる前提で、5-10 分の編集で実用レベルになります。',
                    en: 'Printed scores: 90-95% first-pass accuracy. Handwritten: 70-90% (varies with pen thickness and angle). Designed for AI draft + user refinement; 5-10 minutes of editing yields production quality.',
                  },
                  lang,
                )}
              />
              <FaqItem
                q={t({ ja: '対応言語は?', en: 'Which languages are supported?' }, lang)}
                a={t(
                  {
                    ja: '歌詞: 日本語・英語・スペイン語・ドイツ語。UI は 6 言語 (日・英・西・独・韓・葡)。歌詞言語は他にも多数試せますが品質保証は 4 言語に限定。',
                    en: 'Lyrics: Japanese, English, Spanish, German. UI: 6 languages (ja/en/es/de/ko/pt). Other lyric languages may work but quality is guaranteed only for the 4 listed.',
                  },
                  lang,
                )}
              />
              <FaqItem
                q={t({ ja: 'Sibelius / Finale で開けますか?', en: 'Can I open in Sibelius / Finale?' }, lang)}
                a={t(
                  {
                    ja: 'ABC ファイルとしてダウンロードできます。Sibelius / Finale / Dorico は ABC import を備えているか、変換ツール (abc2xml など) で MusicXML に変換できます。',
                    en: 'Download as ABC file. Sibelius / Finale / Dorico either support ABC import directly or you can convert to MusicXML via tools like abc2xml.',
                  },
                  lang,
                )}
              />
              <FaqItem
                q={t({ ja: 'なぜリードシート専用なのか?', en: 'Why only lead sheets?' }, lang)}
                a={t(
                  {
                    ja: '汎用記譜ソフト (Sibelius / Dorico) は数十人の開発チームで作られています。私たちは「シンガーソングライター・ジャズ奏者・ポップス作曲家のための最高のツール」に集中することで、その層が必要とする機能を最良の形で提供します。クラシック作曲家には KUON CLASSICAL ANALYSIS と Theory Suite を用意しています。',
                    en: 'General notation software (Sibelius/Dorico) is built by teams of dozens. By focusing on "the best tool for singer-songwriters, jazz players, and pop composers" we can deliver exactly what they need at the highest quality. For classical composers we offer KUON CLASSICAL ANALYSIS and Theory Suite.',
                  },
                  lang,
                )}
              />
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ background: INK, color: PAPER, padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 400, margin: 0, letterSpacing: '0.04em', lineHeight: 1.5 }}>
            {t(
              {
                ja: 'その思いついた曲、譜面にしませんか。',
                en: 'That song in your head — let\'s put it on paper.',
                de: 'Das Lied im Kopf — bring es zu Papier.',
                es: 'Esa canción en tu cabeza — llévala al papel.',
                ko: '머릿속의 그 노래, 종이에 옮겨보자.',
                pt: 'Aquela canção na cabeça — vamos colocar no papel.',
              },
              lang,
            )}
          </h2>
          <div style={{ marginTop: '2rem' }}>
            <Link
              href="/sheet"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                background: PAPER, color: INK,
                padding: '1.1rem 2.6rem', borderRadius: 3,
                fontFamily: serif, fontSize: '1.05rem', textDecoration: 'none', letterSpacing: '0.12em',
              }}
            >
              {t({ ja: '無料で書き始める', en: 'Start writing — free', de: 'Kostenlos beginnen', es: 'Empezar gratis', ko: '무료로 시작', pt: 'Começar grátis' }, lang)} →
            </Link>
          </div>
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: '0.85rem', color: '#cbcab9', marginTop: '1.4rem', letterSpacing: '0.03em' }}>
            {t(
              {
                ja: '空音開発 / KUON R&D — 朝比奈幸太郎が音楽家のために開発・運営',
                en: 'KUON R&D — Built by Kotaro Asahina, for musicians',
                de: 'KUON R&D — Von Kotaro Asahina, für Musiker',
                es: 'KUON R&D — Por Kotaro Asahina, para músicos',
                ko: 'KUON R&D — Kotaro Asahina 가 음악가를 위해',
                pt: 'KUON R&D — Por Kotaro Asahina, para músicos',
              },
              lang,
            )}
          </p>
        </section>
      </main>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function sectionHeading(): React.CSSProperties {
  return {
    fontFamily: serif,
    fontSize: 'clamp(1.5rem, 3vw, 2.1rem)',
    fontWeight: 400,
    margin: 0,
    letterSpacing: '0.04em',
    borderBottom: `2px solid ${ACCENT}`,
    paddingBottom: '0.6rem',
    display: 'inline-block',
  };
}

function TrustItem({ mark, label }: { mark: string; label: string }) {
  return (
    <div>
      <div style={{ fontFamily: serif, fontSize: '1.6rem', color: ACCENT, fontWeight: 400 }}>{mark}</div>
      <div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, letterSpacing: '0.05em', marginTop: '0.2rem' }}>{label}</div>
    </div>
  );
}

function Persona({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <article style={{ padding: '1.2rem', background: PAPER_DEEP, borderRadius: 3, border: `1px solid ${RULE}` }}>
      <div style={{ fontSize: '2rem' }}>{emoji}</div>
      <h3 style={{ fontFamily: serif, fontSize: '1.05rem', fontWeight: 400, margin: '0.5rem 0', color: INK }}>{title}</h3>
      <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_SOFT, lineHeight: 1.85, margin: 0 }}>{desc}</p>
    </article>
  );
}

function Feature({ num, title, desc, badge }: { num: string; title: string; desc: string; badge?: string }) {
  return (
    <article style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '1rem', padding: '1.2rem', background: PAPER, borderLeft: `3px solid ${ACCENT}`, borderRadius: 2 }}>
      <div style={{ fontFamily: serif, fontSize: '2rem', color: ACCENT, fontWeight: 400, textAlign: 'right', lineHeight: 1 }}>{num}</div>
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', flexWrap: 'wrap' }}>
          <h3 style={{ fontFamily: serif, fontSize: '1.05rem', fontWeight: 400, margin: 0, color: INK }}>{title}</h3>
          {badge && (
            <span style={{ fontFamily: sans, fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: PAPER, background: ACCENT, padding: '0.15rem 0.5rem', borderRadius: 2 }}>
              {badge}
            </span>
          )}
        </div>
        <p style={{ fontFamily: sans, fontSize: '0.88rem', color: INK_SOFT, lineHeight: 1.85, margin: '0.4rem 0 0' }}>{desc}</p>
      </div>
    </article>
  );
}

function Tier({ name, price, lines, highlight }: { name: string; price: string; lines: string[]; highlight?: boolean }) {
  return (
    <div style={{
      padding: '1.4rem',
      background: highlight ? INK : PAPER_DEEP,
      color: highlight ? PAPER : INK,
      border: `1px solid ${highlight ? INK : RULE}`, borderRadius: 3,
    }}>
      <div style={{ fontFamily: sans, fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: highlight ? '#cbcab9' : INK_FAINT }}>{name}</div>
      <div style={{ fontFamily: serif, fontSize: '1.8rem', margin: '0.4rem 0' }}>{price}</div>
      <ul style={{ fontFamily: sans, fontSize: '0.82rem', color: highlight ? PAPER : INK_SOFT, lineHeight: 1.95, margin: '0.6rem 0 0', padding: 0, listStyle: 'none' }}>
        {lines.map((l, i) => (
          <li key={i} style={{ paddingLeft: '0.9rem', position: 'relative', marginBottom: '0.2rem' }}>
            <span style={{ position: 'absolute', left: 0, color: highlight ? '#cbcab9' : INK_FAINT }}>·</span>
            {l}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details style={{ background: PAPER, border: `1px solid ${RULE}`, borderRadius: 2, padding: '1rem 1.2rem' }}>
      <summary style={{ fontFamily: serif, fontSize: '1rem', cursor: 'pointer', color: INK }}>{q}</summary>
      <p style={{ fontFamily: sans, fontSize: '0.88rem', color: INK_SOFT, lineHeight: 1.95, margin: '0.8rem 0 0' }}>{a}</p>
    </details>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function JsonLD() {
  const software = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'KUON SHEET',
    description:
      'Browser-native lead sheet editor with image scanning. Melody, chord symbols, lyrics in one editor. Multi-language lyrics support (Japanese, English, Spanish, German). PDF and MIDI export.',
    url: 'https://kuon-rnd.com/sheet-lp',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '2480',
      priceCurrency: 'JPY',
      offers: [
        { '@type': 'Offer', price: '0', priceCurrency: 'JPY', name: 'Free' },
        { '@type': 'Offer', price: '1480', priceCurrency: 'JPY', name: 'Concerto' },
        { '@type': 'Offer', price: '2480', priceCurrency: 'JPY', name: 'Symphony' },
      ],
    },
    creator: { '@type': 'Person', name: 'Kotaro Asahina (朝比奈幸太郎)', url: 'https://kuon-rnd.com/profile' },
    publisher: { '@type': 'Organization', name: 'KUON R&D / 空音開発', url: 'https://kuon-rnd.com' },
    inLanguage: ['ja', 'en', 'es', 'de', 'ko', 'pt'],
    featureList: [
      'Lead sheet editor (melody + chord symbols + lyrics)',
      'AI image scan (handwritten/printed → editable ABC notation)',
      'Live-preview ABC notation editor',
      'Multi-language lyrics: Japanese, English, Spanish, German',
      'Cloud save (10 free, unlimited Concerto+)',
      'PDF / MIDI / ABC download',
      'Browser-native, no install required',
      '§49 philosophy: AI draft + user refinement',
    ],
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Does it work for classical music?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'KUON SHEET specializes in lead sheets (melody, chords, lyrics). For complex classical scores, use KUON CLASSICAL ANALYSIS or KUON Theory Suite.',
        },
      },
      {
        '@type': 'Question',
        name: 'How accurate is image scanning?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Printed scores: 90-95% first-pass accuracy. Handwritten: 70-90%. Designed for AI draft + user refinement.',
        },
      },
      {
        '@type': 'Question',
        name: 'Which languages are supported for lyrics?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Japanese (hiragana/katakana/kanji), English, Spanish (with accents), German (with umlauts).',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the pricing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Editor and PDF/MIDI export are free. Image scan and unlimited cloud save start at Concerto plan (¥1,480/month).',
        },
      },
    ],
  };

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to use KUON SHEET',
    description: 'Step-by-step guide to creating lead sheets in KUON SHEET.',
    totalTime: 'PT5M',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'JPY', value: '0' },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Open KUON SHEET',
        text: 'Visit https://kuon-rnd.com/sheet and sign in (free account works).',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Write or scan',
        text: 'Either type ABC notation directly (live preview) or upload a handwritten sheet for AI scan.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Refine in editor',
        text: 'Adjust melody notes, chord symbols, and lyrics in the ABC editor. Preview updates in real time.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Export and share',
        text: 'Download as PDF (for bandmates), MIDI (for DAW), or ABC (for other notation tools).',
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }} />
    </>
  );
}
