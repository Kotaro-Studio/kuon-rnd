'use client';

/**
 * KUON LIBRETTO TRANSLATOR — Landing Page
 *
 * 設計方針:
 *   - Concerto 以上限定として明示的に打ち出す (¥1,480/月)
 *   - ChatGPT との差別化を 7 つのポイントで具体化
 *   - サンプル翻訳を実際に表示して証明
 *   - 6 言語 SEO/GEO + JSON-LD x 3
 *   - §48 余白の知性 + §49 単一正解を押し付けない
 */

import Link from 'next/link';
import { useLang } from '@/context/LangContext';

const PAPER = '#fbf8f1';
const PAPER_DEEP = '#f3eee0';
const INK = '#1a1a1a';
const INK_SOFT = '#3a3a3a';
const INK_FAINT = '#7a7575';
const ACCENT = '#7a4d2c';
const ACCENT_SOFT = '#a86b3e';
const RULE = '#d8d2c2';

const serif = '"Shippori Mincho", "Noto Serif JP", "Times New Roman", serif';
const sans = '"Helvetica Neue", "Inter", "Hiragino Sans", system-ui, sans-serif';

type LangMap = Partial<Record<string, string>> & { en: string };
const t = (m: LangMap, lang: string): string =>
  (m[lang as keyof typeof m] as string) || (m.ja as string) || m.en;

export default function LibrettoLP() {
  const { lang } = useLang();

  return (
    <>
      <JsonLD />
      <main style={{ background: PAPER, color: INK, fontFamily: serif, minHeight: '100vh' }}>
        {/* HERO */}
        <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 3rem) clamp(3rem, 6vw, 5rem)', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontFamily: sans, fontSize: '0.78rem', letterSpacing: '0.18em', color: ACCENT, textTransform: 'uppercase', marginBottom: '1.2rem' }}>
            KUON LIBRETTO TRANSLATOR · {t({ ja: 'Concerto から', en: 'From Concerto', de: 'Ab Concerto', es: 'Desde Concerto', ko: 'Concerto부터', pt: 'A partir de Concerto' }, lang)}
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 400, lineHeight: 1.3, margin: 0, letterSpacing: '0.02em' }}>
            {t(
              {
                ja: 'オペラリブレットを、声楽家のために 5 段で読む。',
                en: 'Opera libretti, in five layers — for singers.',
                de: 'Opernlibretti, in fünf Schichten — für Sängerinnen und Sänger.',
                es: 'Libretos de ópera, en cinco capas — para cantantes.',
                ko: '오페라 리브레토를 5 단으로 읽는다 — 성악가를 위해.',
                pt: 'Libretos de ópera, em cinco camadas — para cantores.',
              },
              lang,
            )}
          </h1>
          <p style={{ fontFamily: sans, fontSize: 'clamp(1rem, 1.6vw, 1.15rem)', color: INK_SOFT, lineHeight: 1.95, marginTop: '1.5rem', maxWidth: 720 }}>
            {t(
              {
                ja: '原文 (伊・独・仏) / IPA 発音記号 / 直訳 / 歌唱訳 / 文学訳。声楽家・指揮者・音大生が、レッスン前夜に・舞台袖で・オーディション準備で必要なすべて。Mozart の Don Giovanni を、Verdi の Traviata を、Puccini の Bohème を、貼り付けるだけで 5 段で読める。',
                en: 'Source (it/de/fr) / IPA / literal / singing / literary translation — all five at once. Everything a singer, conductor, or conservatory student needs for the night before a lesson, the wings before curtain, the preparation before an audition. Don Giovanni, La Traviata, La Bohème — paste any libretto and read it five ways at once.',
                de: 'Original (it/de/fr) / IPA / wörtliche / singbare / literarische Übersetzung — alle fünf gleichzeitig.',
                es: 'Original (it/de/fr) / IPA / literal / cantable / literaria — los cinco a la vez.',
                ko: '원문 (이/독/불) / IPA / 직역 / 가창역 / 문학역 — 다섯 가지를 동시에.',
                pt: 'Original (it/de/fr) / IPA / literal / cantável / literária — todos cinco ao mesmo tempo.',
              },
              lang,
            )}
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '2.2rem', flexWrap: 'wrap' }}>
            <Link
              href="/libretto"
              style={{
                padding: '1rem 2.4rem', background: INK, color: PAPER, textDecoration: 'none',
                fontFamily: serif, fontSize: '1rem', letterSpacing: '0.1em',
                borderRadius: 2, display: 'inline-block',
              }}
            >
              {t({ ja: 'Concerto で始める →', en: 'Start with Concerto →', de: 'Mit Concerto beginnen →', es: 'Comenzar con Concerto →', ko: 'Concerto로 시작하기 →', pt: 'Começar com Concerto →' }, lang)}
            </Link>
            <Link
              href="#sample"
              style={{
                padding: '1rem 1.8rem', background: 'transparent', color: INK, textDecoration: 'none',
                fontFamily: serif, fontSize: '1rem', letterSpacing: '0.1em',
                border: `1px solid ${RULE}`, borderRadius: 2, display: 'inline-block',
              }}
            >
              {t({ ja: 'サンプルを見る ↓', en: 'See sample ↓', de: 'Beispiel ↓', es: 'Ver muestra ↓', ko: '샘플 보기 ↓', pt: 'Ver exemplo ↓' }, lang)}
            </Link>
          </div>
        </section>

        {/* TRUST BAR */}
        <section style={{ background: PAPER_DEEP, padding: '2rem clamp(1.5rem, 4vw, 3rem)', borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', textAlign: 'center' }}>
            <TrustItem mark="5" label={t({ ja: '段の並列表示', en: 'parallel layers', de: 'parallele Schichten', es: 'capas paralelas', ko: '병렬 레이어', pt: 'camadas paralelas' }, lang)} />
            <TrustItem mark="3" label={t({ ja: '言語対応 (伊独仏)', en: 'languages (it/de/fr)', de: 'Sprachen (it/de/fr)', es: 'idiomas (it/de/fr)', ko: '3 개 언어', pt: '3 idiomas' }, lang)} />
            <TrustItem mark="6" label={t({ ja: 'サンプルアリア収録', en: 'sample arias', de: 'Beispielarien', es: 'arias de muestra', ko: '샘플 아리아', pt: 'árias de amostra' }, lang)} />
            <TrustItem mark="100%" label={t({ ja: 'パブリックドメイン', en: 'public domain', de: 'gemeinfrei', es: 'dominio público', ko: '퍼블릭 도메인', pt: 'domínio público' }, lang)} />
            <TrustItem mark="¥1,480" label={t({ ja: 'Concerto から / 月', en: 'from Concerto / mo', de: 'ab Concerto / Monat', es: 'desde Concerto / mes', ko: 'Concerto부터 / 월', pt: 'a partir de Concerto / mês' }, lang)} />
          </div>
        </section>

        {/* WHY NOT CHATGPT */}
        <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)', maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={sectionHeading()}>
            {t(
              {
                ja: 'ChatGPT があれば良いのでは?',
                en: 'Why not just use ChatGPT?',
                de: 'Warum nicht einfach ChatGPT?',
                es: '¿Por qué no usar ChatGPT?',
                ko: 'ChatGPT 만 있으면 되는 것 아닌가?',
                pt: 'Por que não usar o ChatGPT?',
              },
              lang,
            )}
          </h2>
          <p style={{ fontFamily: sans, fontSize: '0.95rem', color: INK_SOFT, lineHeight: 2, marginTop: '1rem', maxWidth: 720 }}>
            {t(
              {
                ja: '正直に答えます。狭義の「翻訳」だけなら、汎用 AI も訳してくれます。私たちはそこで戦いません。私たちが提供するのは「声楽家・指揮者・音大生のためのオペラ統合学習環境」── 翻訳エンジンではなく、毎日のレッスン・舞台・オーディション準備に密着するツールです。',
                en: 'Honest answer: for raw translation, general AI does the job. We don\'t compete there. What we offer is an "integrated opera learning environment for singers, conductors, and conservatory students" — not a translation engine, but a tool embedded in daily lessons, rehearsals, and auditions.',
                de: 'Ehrliche Antwort: Für reine Übersetzung leistet allgemeine KI gute Arbeit. Wir konkurrieren dort nicht.',
                es: 'Respuesta honesta: para traducción pura, la IA general funciona. No competimos allí.',
                ko: '솔직한 답변: 단순 번역이라면 범용 AI 도 잘 합니다. 거기서 경쟁하지 않습니다.',
                pt: 'Resposta honesta: para tradução pura, a IA geral cumpre. Não competimos ali.',
              },
              lang,
            )}
          </p>

          <div style={{ marginTop: '2.5rem', display: 'grid', gap: '1rem' }}>
            <DiffItem
              num="1"
              title={t({ ja: 'IPA 発音記号の自動生成', en: 'Automatic IPA notation', de: 'Automatische IPA-Notation', es: 'Notación IPA automática', ko: 'IPA 발음 기호 자동 생성', pt: 'Notação IPA automática' }, lang)}
              desc={t(
                {
                  ja: 'Mozart 時代のドイツ語、Verdi のイタリア語、Wagner の母音転換 ── 時代と作曲家ごとに異なる発音規則を、行単位で自動表示。Diction (発音学) の準備が一気に終わる。',
                  en: 'Mozart-era German, Verdi\'s Italian, Wagner\'s vowel shifts — different conventions for each composer/era, displayed line-by-line. Diction prep done at a glance.',
                  de: 'Zeitspezifische Aussprache, Zeile für Zeile.',
                  es: 'Pronunciación específica por época, línea por línea.',
                  ko: '시대별 발음 규칙을 행 단위로 자동 표시.',
                  pt: 'Pronúncia específica de cada época, linha por linha.',
                },
                lang,
              )}
            />
            <DiffItem
              num="2"
              title={t({ ja: '直訳 / 歌唱訳 / 文学訳の 3 段並列', en: 'Three translations in parallel', de: 'Drei Übersetzungen parallel', es: 'Tres traducciones en paralelo', ko: '직역 / 가창역 / 문학역 병렬', pt: 'Três traduções em paralelo' }, lang)}
              desc={t(
                {
                  ja: '直訳で文法を理解し、歌唱訳でリズムを掴み、文学訳で詩情を確認する。3 つを同じ画面で見られる UI は、汎用 AI の対話形式では物理的に作れない。',
                  en: 'Literal for grammar, singing for rhythm, literary for poetry — all three in one view. A UI impossible in chat-format general AI.',
                  de: 'Wörtlich für Grammatik, singbar für Rhythmus, literarisch für Dichtung — alle drei in einer Ansicht.',
                  es: 'Literal para gramática, cantable para ritmo, literaria para poesía — las tres en una vista.',
                  ko: '직역으로 문법, 가창역으로 리듬, 문학역으로 시정 — 한 화면에서 동시 확인.',
                  pt: 'Literal para gramática, cantável para ritmo, literária para poesia — todas em uma vista.',
                },
                lang,
              )}
            />
            <DiffItem
              num="3"
              title={t({ ja: '声楽家の現場文脈に最適化された注釈', en: 'Performer-context notes', de: 'Aufführungsbezogene Anmerkungen', es: 'Notas de contexto interpretativo', ko: '성악가 현장 컨텍스트 주석', pt: 'Notas de contexto interpretativo' }, lang)}
              desc={t(
                {
                  ja: '「ここで母音転換」「子音を立てる」「rubato が伝統」── 行ごとに、声楽家の脳内にしかない実践的知識を体系化。',
                  en: '"Vowel modification here" / "consonant precision" / "traditional rubato" — practical wisdom usually only in singers\' minds, systematized line-by-line.',
                  de: 'Praktische Sängerweisheit, systematisiert.',
                  es: 'Sabiduría práctica del cantante, sistematizada.',
                  ko: '성악가의 머릿속에만 있던 실전 지식을 체계화.',
                  pt: 'Sabedoria prática do cantor, sistematizada.',
                },
                lang,
              )}
            />
            <DiffItem
              num="4"
              title={t({ ja: '行ごとに「Pavarotti はどう歌った?」が聞ける', en: 'Per-line interpretive Q&A', de: 'Interpretation pro Zeile', es: 'Interpretación por línea', ko: '행마다 해석 질문 가능', pt: 'Interpretação por linha' }, lang)}
              desc={t(
                {
                  ja: 'リブレットの 1 行をクリックして「この行の和声的意味は?」「Callas はここでどう歌った?」「指揮者は何を意識する?」── 行に紐付いたコンテキストで質問できる。',
                  en: 'Click any line to ask "What\'s the harmonic meaning?" / "How did Callas sing this?" / "What should the conductor watch?" — context-bound Q&A.',
                  de: 'Auf jede Zeile klicken, kontextbezogen fragen.',
                  es: 'Click en cualquier línea, preguntar en contexto.',
                  ko: '한 행을 클릭하여 컨텍스트에 묶인 질문 가능.',
                  pt: 'Clique em qualquer linha para perguntar em contexto.',
                },
                lang,
              )}
            />
            <DiffItem
              num="5"
              title={t({ ja: '時代考証付き翻訳', en: 'Period-aware translation', de: 'Epochenbewusste Übersetzung', es: 'Traducción consciente de la época', ko: '시대 고증 번역', pt: 'Tradução consciente da época' }, lang)}
              desc={t(
                {
                  ja: 'Mozart 時代のドイツ語と現代ドイツ語の違い、Verdi の作詞家 Piave の韻律規則、Da Ponte のイタリア語の俗語表現 ── 専門知識に基づく解説を内蔵。',
                  en: 'Mozart-era vs modern German, Piave\'s prosody for Verdi, Da Ponte\'s colloquial Italian — built-in scholarly context.',
                  de: 'Wissenschaftlicher Kontext eingebaut.',
                  es: 'Contexto académico integrado.',
                  ko: '학술적 컨텍스트 내장.',
                  pt: 'Contexto acadêmico integrado.',
                },
                lang,
              )}
            />
            <DiffItem
              num="6"
              title={t({ ja: '§49 単一正解を押し付けない', en: 'No "single right answer"', de: 'Keine "einzig richtige Antwort"', es: 'Sin "única respuesta correcta"', ko: '"단 하나의 정답" 강요 없음', pt: 'Sem "única resposta certa"' }, lang)}
              desc={t(
                {
                  ja: '「定番の解釈は X、Bach はこう書いた、Pavarotti はこう歌った、あなたの解釈もこういう理由で成立する」── 複数の解釈を必ず併置する空音開発の哲学。',
                  en: '"Standard reading is X, Bach wrote it this way, Pavarotti sang it that way, your interpretation also works because..." — KUON\'s philosophy of always presenting alternatives.',
                  de: 'KUONs Philosophie: immer Alternativen präsentieren.',
                  es: 'Filosofía KUON: siempre presentar alternativas.',
                  ko: 'KUON 의 철학: 항상 대안을 함께 제시.',
                  pt: 'Filosofia KUON: sempre apresentar alternativas.',
                },
                lang,
              )}
            />
            <DiffItem
              num="7"
              title={t({ ja: '他の Kuon ツールと統合', en: 'Integrated with other KUON tools', de: 'Integriert mit anderen KUON-Tools', es: 'Integrado con otras herramientas KUON', ko: '다른 KUON 도구와 통합', pt: 'Integrado com outras ferramentas KUON' }, lang)}
              desc={t(
                {
                  ja: 'Theory Tutor で和声を質問、Lab で楽譜を分析、Lesson Recorder でレッスン録音 ── すべてが連携する音楽学習プラットフォーム。',
                  en: 'Ask Theory Tutor about harmony, analyze scores in the Lab, record lessons with Lesson Recorder — all integrated.',
                  de: 'Eine integrierte Plattform.',
                  es: 'Una plataforma integrada.',
                  ko: '통합된 플랫폼.',
                  pt: 'Uma plataforma integrada.',
                },
                lang,
              )}
            />
          </div>
        </section>

        {/* SAMPLE */}
        <section id="sample" style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)', background: PAPER_DEEP }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={sectionHeading()}>
              {t(
                {
                  ja: '実例: Mozart「Don Giovanni」 Madamina',
                  en: 'Example: Mozart, Don Giovanni — "Madamina"',
                  de: 'Beispiel: Mozart, Don Giovanni — "Madamina"',
                  es: 'Ejemplo: Mozart, Don Giovanni — "Madamina"',
                  ko: '예: Mozart, Don Giovanni — "Madamina"',
                  pt: 'Exemplo: Mozart, Don Giovanni — "Madamina"',
                },
                lang,
              )}
            </h2>
            <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, marginTop: '0.5rem', maxWidth: 700 }}>
              {t(
                {
                  ja: '実際のアプリ画面で、リブレット 1 行が 5 つの層で表示されます。',
                  en: 'In the actual app, each libretto line is displayed in five parallel layers.',
                  de: 'Jede Zeile in fünf parallelen Schichten.',
                  es: 'Cada línea en cinco capas paralelas.',
                  ko: '각 행이 5 개의 병렬 레이어로 표시됩니다.',
                  pt: 'Cada linha em cinco camadas paralelas.',
                },
                lang,
              )}
            </p>
            <SampleLineCard lang={lang} />
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
                ja: 'KUON LIBRETTO TRANSLATOR は Concerto プラン以上で利用可能です。プロ声楽家・指揮者・音大生・指導者向けの本格的なツールです。1 ジョブ = 1 つの翻訳 OR 1 つの解釈質問。',
                en: 'Available on Concerto and above — for serious singers, conductors, conservatory students, and teachers. 1 job = 1 translation or 1 interpretive question.',
                de: 'Ab Concerto-Plan verfügbar.',
                es: 'Disponible desde Concerto.',
                ko: 'Concerto 플랜 이상에서 이용 가능.',
                pt: 'Disponível a partir do Concerto.',
              },
              lang,
            )}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
            <Tier name="Concerto" price="¥1,480" quota={t({ ja: '60 ジョブ / 月', en: '60 jobs / mo', de: '60 Jobs / Monat', es: '60 trabajos / mes', ko: '월 60 개', pt: '60 trabalhos / mês' }, lang)} desc={t({ ja: '声楽科音大生・プロ', en: 'Voice students & pros', de: 'Gesangsstudenten & Profis', es: 'Estudiantes y profesionales', ko: '성악과 학생·프로', pt: 'Estudantes e profissionais' }, lang)} highlight />
            <Tier name="Symphony" price="¥2,480" quota={t({ ja: '180 ジョブ / 月', en: '180 jobs / mo', de: '180 Jobs / Monat', es: '180 trabajos / mes', ko: '월 180 개', pt: '180 trabalhos / mês' }, lang)} desc={t({ ja: '指揮者・声楽教師・コレペティ', en: 'Conductors, voice teachers, repetiteurs', de: 'Dirigenten, Lehrkräfte', es: 'Directores, profesores', ko: '지휘자·교사·코렙', pt: 'Maestros, professores' }, lang)} />
          </div>
          <p style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, marginTop: '1.4rem', textAlign: 'center', lineHeight: 1.85 }}>
            {t({ ja: '年払いで 2 ヶ月無料。すべてのプランで他の Kuon アプリ (30+) も利用可能。', en: 'Annual saves 2 months. All plans include access to 30+ other KUON apps.', de: 'Jährlich: 2 Monate frei.', es: 'Anual: 2 meses gratis.', ko: '연간 결제시 2 개월 무료.', pt: 'Anual: 2 meses grátis.' }, lang)}
          </p>
        </section>

        {/* FAQ */}
        <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)', background: PAPER_DEEP }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={sectionHeading()}>
              {t({ ja: 'よくある質問', en: 'FAQ', de: 'FAQ', es: 'Preguntas frecuentes', ko: '자주 묻는 질문', pt: 'Perguntas frequentes' }, lang)}
            </h2>
            <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
              <FaqItem
                q={t({ ja: 'どのオペラに対応していますか?', en: 'Which operas are supported?' }, lang)}
                a={t(
                  {
                    ja: 'パブリックドメインのすべてのオペラに対応 (作曲家・台本作家ともに 1923 年以前死去のもの)。サンプル収録は Mozart 3 / Verdi 1 / Puccini 1 / Bizet 1。それ以外の作品は、ご自身でリブレットを貼り付けて翻訳できます。',
                    en: 'All public-domain operas (composers/librettists who died before 1923). Sample arias: Mozart 3 / Verdi 1 / Puccini 1 / Bizet 1. For other works, paste your own libretto.',
                  },
                  lang,
                )}
              />
              <FaqItem
                q={t({ ja: '翻訳の品質は信頼できますか?', en: 'Can I trust the translations?' }, lang)}
                a={t(
                  {
                    ja: 'サンプルアリア (キュレート版) は朝比奈幸太郎が手作業で作成しました。AI 翻訳 (任意リブレット) は Llama 3.3 70B が音楽専門知識を活用して生成し、§49 哲学に従って複数の解釈を提示します。最終的な解釈はあなた自身が決めます。',
                    en: 'Sample arias (curated) are hand-crafted by Kotaro Asahina. AI translations (your own libretto) are generated by Llama 3.3 70B with music-specific knowledge, presenting multiple interpretations per §49 philosophy. The final interpretation is yours.',
                  },
                  lang,
                )}
              />
              <FaqItem
                q={t({ ja: 'ChatGPT と何が違うのですか?', en: 'How is this different from ChatGPT?' }, lang)}
                a={t(
                  {
                    ja: 'IPA・5 段並列・行ごと解釈チャット・声楽家文脈の注釈・時代考証・Kuon 統合 ── ChatGPT はチャット形式なので物理的に作れない UI とワークフローを提供します。詳しくは上記の 7 つの差別化ポイントをご覧ください。',
                    en: 'IPA, 5-layer parallel, per-line Q&A, performer-context notes, period-aware scholarship, Kuon integration — a workflow physically impossible in chat-format AI. See the 7 differentiation points above.',
                  },
                  lang,
                )}
              />
              <FaqItem
                q={t({ ja: 'いつから使えますか?', en: 'When can I start?' }, lang)}
                a={t(
                  {
                    ja: 'Concerto プラン (¥1,480/月) 以上で月 60 翻訳・解釈ジョブが利用可能。今すぐ Concerto に登録してください。',
                    en: 'Available now with Concerto plan (¥1,480/month) and up — 60 jobs/month. Sign up today.',
                  },
                  lang,
                )}
              />
              <FaqItem
                q={t({ ja: '楽譜と連動していますか?', en: 'Is it integrated with scores?' }, lang)}
                a={t(
                  {
                    ja: '現バージョンではリブレットテキストのみ。楽譜 (MusicXML) との同期再生・小節リンクは Phase 2 で Lab Suite と統合予定です。サンプルアリアでは IMSLP の楽譜への直接リンクを提供しています。',
                    en: 'Current version: libretto text only. Score (MusicXML) sync and measure linking are planned for Phase 2 with Lab Suite integration. Sample arias include direct IMSLP score links.',
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
                ja: 'オペラの行間まで、声楽家のために。',
                en: 'Down to the lines of opera — for singers.',
                de: 'Bis auf die Zeilen — für Sängerinnen und Sänger.',
                es: 'Hasta las líneas — para cantantes.',
                ko: '오페라의 행간까지 — 성악가를 위해.',
                pt: 'Até as linhas da ópera — para cantores.',
              },
              lang,
            )}
          </h2>
          <div style={{ marginTop: '2rem' }}>
            <Link
              href="/libretto"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                background: PAPER, color: INK,
                padding: '1.1rem 2.6rem', borderRadius: 3,
                fontFamily: serif, fontSize: '1.05rem', textDecoration: 'none', letterSpacing: '0.12em',
              }}
            >
              {t({ ja: 'Concerto プランで始める', en: 'Start with Concerto', de: 'Mit Concerto starten', es: 'Comenzar con Concerto', ko: 'Concerto로 시작', pt: 'Começar com Concerto' }, lang)} →
            </Link>
          </div>
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: '0.85rem', color: '#cbcab9', marginTop: '1.4rem', letterSpacing: '0.03em' }}>
            {t(
              {
                ja: '空音開発 / KUON R&D — 朝比奈幸太郎が音楽家のために開発・運営',
                en: 'KUON R&D — Built by Kotaro Asahina, for musicians',
                de: 'KUON R&D — Von Kotaro Asahina, für Musiker',
                es: 'KUON R&D — Por Kotaro Asahina, para músicos',
                ko: 'KUON R&D — Kotaro Asahina 가 음악가를 위해 운영',
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
// Sub-components
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

function DiffItem({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <article style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '1rem', padding: '1.2rem', background: PAPER_DEEP, borderLeft: `3px solid ${ACCENT}`, borderRadius: 2 }}>
      <div style={{ fontFamily: serif, fontSize: '2rem', color: ACCENT, fontWeight: 400, textAlign: 'right', lineHeight: 1 }}>{num}</div>
      <div>
        <h3 style={{ fontFamily: serif, fontSize: '1.05rem', fontWeight: 400, margin: 0, color: INK }}>{title}</h3>
        <p style={{ fontFamily: sans, fontSize: '0.88rem', color: INK_SOFT, lineHeight: 1.85, margin: '0.4rem 0 0' }}>{desc}</p>
      </div>
    </article>
  );
}

function SampleLineCard({ lang }: { lang: string }) {
  return (
    <article style={{ marginTop: '2rem', padding: '1.4rem 1.6rem', background: PAPER, borderLeft: `3px solid ${ACCENT_SOFT}`, borderRadius: 2 }}>
      <div style={{ fontFamily: sans, fontSize: '0.7rem', color: INK_FAINT, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.8rem' }}>
        {t({ ja: 'リブレット 1 行 — 8 行目より', en: 'Libretto line 8' }, lang)}
      </div>
      <div style={{ display: 'grid', gap: '0.9rem' }}>
        <SampleLayer label={t({ ja: '原文', en: 'Source' }, lang)} value="Ma in Ispagna son già mille e tre" italic accent />
        <SampleLayer label="IPA" value="[ma in iˈspaɲɲa son d͡ʒa ˈmille e tre]" mono accent />
        <SampleLayer label={t({ ja: '直訳', en: 'Literal' }, lang)} value={t({ ja: 'しかしスペインでは既に千と三', en: 'But in Spain there are already a thousand and three' }, lang)} />
        <SampleLayer label={t({ ja: '歌唱訳', en: 'Singing' }, lang)} value={t({ ja: 'けどスペインじゃ、千と三', en: 'But in Spain it\'s a thousand and three' }, lang)} highlight />
        <SampleLayer label={t({ ja: '文学訳', en: 'Literary' }, lang)} value={t({ ja: 'されどスペインには既に千と三名', en: 'But in Spain — already, a thousand and three' }, lang)} italic />
      </div>
      <div style={{ marginTop: '1rem', padding: '0.7rem 0.9rem', background: PAPER_DEEP, fontFamily: sans, fontSize: '0.78rem', color: INK_SOFT, borderRadius: 2 }}>
        <strong style={{ letterSpacing: '0.1em', textTransform: 'uppercase', color: ACCENT, fontSize: '0.7rem' }}>
          {t({ ja: '注釈', en: 'Notes' }, lang)}
        </strong>
        <ul style={{ margin: '0.4rem 0 0', padding: 0, listStyle: 'none', lineHeight: 1.85 }}>
          <li style={{ paddingLeft: '1rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, color: ACCENT_SOFT }}>·</span>
            {t({ ja: '「mille e tre」(千と三) はオペラ史上最も有名な数字。観客への決め台詞', en: '"mille e tre" (1003) — the most famous number in opera history; the punch line.' }, lang)}
          </li>
          <li style={{ paddingLeft: '1rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0, color: ACCENT_SOFT }}>·</span>
            {t({ ja: 'バス歌手はここで音量を一段下げて謎めかすか、堂々と誇示するか — 解釈の分岐点', en: 'Bass singers either drop the volume mysteriously or proclaim it grandly — interpretive choice point.' }, lang)}
          </li>
        </ul>
      </div>
    </article>
  );
}

function SampleLayer({ label, value, mono, italic, highlight, accent }: {
  label: string; value: string; mono?: boolean; italic?: boolean; highlight?: boolean; accent?: boolean;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '0.8rem', alignItems: 'baseline' }}>
      <span style={{ fontFamily: sans, fontSize: '0.68rem', color: accent ? ACCENT : INK_FAINT, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'right' }}>{label}</span>
      <span style={{
        fontFamily: mono ? 'ui-monospace, "SF Mono", Consolas, monospace' : serif,
        fontSize: mono ? '0.85rem' : '1.02rem',
        fontStyle: italic ? 'italic' : 'normal',
        lineHeight: 1.7,
        color: highlight ? ACCENT : INK,
        background: highlight ? '#fdf6e8' : 'transparent',
        padding: highlight ? '0.2rem 0.5rem' : 0,
        borderRadius: highlight ? 2 : 0,
      }}>{value}</span>
    </div>
  );
}

function Tier({ name, price, quota, desc, highlight }: { name: string; price: string; quota: string; desc: string; highlight?: boolean }) {
  return (
    <div style={{
      padding: '1.4rem', background: highlight ? INK : PAPER_DEEP,
      color: highlight ? PAPER : INK,
      border: `1px solid ${highlight ? INK : RULE}`, borderRadius: 3,
      textAlign: 'center',
    }}>
      <div style={{ fontFamily: sans, fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: highlight ? '#cbcab9' : INK_FAINT }}>{name}</div>
      <div style={{ fontFamily: serif, fontSize: '1.8rem', margin: '0.4rem 0' }}>{price}</div>
      <div style={{ fontFamily: sans, fontSize: '0.85rem', color: highlight ? PAPER : INK_SOFT }}>{quota}</div>
      <div style={{ fontFamily: sans, fontSize: '0.72rem', color: highlight ? '#cbcab9' : INK_FAINT, marginTop: '0.6rem' }}>{desc}</div>
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
// JSON-LD (SoftwareApplication / FAQPage / HowTo)
// ──────────────────────────────────────────────────────────────────────────
function JsonLD() {
  const software = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'KUON LIBRETTO TRANSLATOR',
    description:
      'Integrated opera libretto translation environment for singers, conductors, and conservatory students. 5-layer parallel display: source / IPA / literal / singing / literary.',
    url: 'https://kuon-rnd.com/libretto-lp',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web Browser',
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
    creator: { '@type': 'Person', name: 'Kotaro Asahina (朝比奈幸太郎)', url: 'https://kuon-rnd.com/profile' },
    publisher: { '@type': 'Organization', name: 'KUON R&D / 空音開発', url: 'https://kuon-rnd.com' },
    inLanguage: ['ja', 'en', 'es', 'de', 'ko', 'pt'],
    featureList: [
      '5-layer parallel display: source / IPA / literal / singing / literary',
      'Italian, German, French opera libretto support',
      'Mozart, Verdi, Puccini, Bizet sample arias (curated)',
      'IPA notation auto-generation',
      'Per-line interpretive Q&A (Pavarotti, Callas, Karajan etc.)',
      'Period-aware translation (Mozart-era German, Verdi\'s Italian)',
      'Performer-context notes (vowel modification, rubato)',
      '§49 philosophy: alternatives presented, no single right answer imposed',
    ],
  };

  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Which operas are supported?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'All public-domain operas (composers and librettists who died before 1923). Sample arias included: Mozart 3, Verdi 1, Puccini 1, Bizet 1. Paste any other libretto for AI translation.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is this different from ChatGPT?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'IPA notation, 5-layer parallel display, per-line interpretive Q&A, performer-context notes, period-aware scholarship, and Kuon platform integration — workflows physically impossible in chat-format general AI.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the pricing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            'Available on Concerto plan (¥1,480/month) and above. Concerto: 60 jobs/month. Symphony (¥2,480/month): 180 jobs/month.',
        },
      },
    ],
  };

  const howTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to use KUON LIBRETTO TRANSLATOR',
    description: 'Step-by-step guide to translating opera libretti in 5 parallel layers.',
    totalTime: 'PT3M',
    estimatedCost: { '@type': 'MonetaryAmount', currency: 'JPY', value: '1480' },
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Open KUON LIBRETTO TRANSLATOR',
        text: 'Visit https://kuon-rnd.com/libretto and sign in to your Concerto+ account.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Choose mode',
        text: 'Pick a sample aria (Mozart, Verdi, Puccini, Bizet) for instant 5-layer view, or paste your own libretto.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Read 5 layers',
        text: 'Each line is shown as: original text / IPA pronunciation / literal translation / singing translation / literary translation, with performer-context notes.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Ask interpretive questions',
        text: 'Click "Interpret this line" on any row to ask about historical performance traditions, harmonic meaning, or vocal technique.',
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
