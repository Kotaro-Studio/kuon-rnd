'use client';

import Link from 'next/link';
import { useLang } from '@/context/LangContext';

const PAPER = '#fbfaf6';
const PAPER_DEEP = '#f0ece1';
const INK = '#1a1a1a';
const INK_FAINT = '#7a7575';
const ACCENT = '#7a3a4f';
const RULE = '#d8d2c2';
const serif = '"Shippori Mincho", "Noto Serif JP", "Times New Roman", serif';
const sans = '"Helvetica Neue", "Inter", "Hiragino Sans", system-ui, sans-serif';

const t = <T extends Record<string, string>>(m: T, lang: string): string => (m[lang as keyof T] as string) || (m['ja'] as string) || (m['en'] as string) || '';

export default function TuttiLP() {
  const { lang } = useLang();
  return (
    <>
      <JsonLD />
      <main style={{ background: PAPER, color: INK, fontFamily: serif, minHeight: '100vh' }}>
        <section style={{ padding: 'clamp(4rem, 8vw, 7rem) clamp(1.5rem, 4vw, 3rem) clamp(3rem, 6vw, 5rem)', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontFamily: sans, fontSize: '0.78rem', letterSpacing: '0.18em', color: ACCENT, textTransform: 'uppercase', marginBottom: '1rem' }}>
            KUON TUTTI カレンダー
          </div>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 400, lineHeight: 1.3, margin: 0, letterSpacing: '0.02em' }}>
            {t({ ja: 'みんなの予定を、ひとつに。', en: 'Everyone\'s schedule, in one place.' }, lang)}
          </h1>
          <p style={{ fontFamily: sans, fontSize: 'clamp(1rem, 1.6vw, 1.15rem)', color: INK_FAINT, lineHeight: 1.95, marginTop: '1.5rem', maxWidth: 720 }}>
            {t({
              ja: 'オーケストラ・カルテット・バンド・合唱団のリハーサル予約を、音楽家のために設計しました。候補日を提示すれば、メンバーがメールから 1 タップで参加可否を回答 ── アカウント不要で。空き時間を一目で把握、最終確定で全員に通知 + iCal 配信。',
              en: 'Rehearsal scheduling designed for orchestras, quartets, bands, and choirs. Propose candidate slots, members vote with one tap from email — no account required. See availability at a glance, lock it in, everyone gets notified with iCal.',
            }, lang)}
          </p>
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <Link href="/tutti" style={{ padding: '1rem 2.4rem', background: INK, color: PAPER, textDecoration: 'none', fontFamily: serif, fontSize: '1rem', letterSpacing: '0.1em', borderRadius: 2 }}>
              {t({ ja: '無料で始める →', en: 'Start free →' }, lang)}
            </Link>
            <a href="#how" style={{ padding: '1rem 1.8rem', background: 'transparent', color: INK, textDecoration: 'none', fontFamily: serif, fontSize: '1rem', letterSpacing: '0.1em', border: `1px solid ${RULE}`, borderRadius: 2 }}>
              {t({ ja: '使い方を見る ↓', en: 'See how it works ↓' }, lang)}
            </a>
          </div>
        </section>

        <section style={{ background: PAPER_DEEP, padding: '2rem clamp(1.5rem, 4vw, 3rem)', borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}` }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', textAlign: 'center' }}>
            <Trust m="¥0" l={t({ ja: 'Free から', en: 'Free start' }, lang)} />
            <Trust m="📧" l={t({ ja: 'アカウント不要投票', en: 'Guest voting' }, lang)} />
            <Trust m="iCal" l={t({ ja: 'カレンダー連携', en: 'Calendar export' }, lang)} />
            <Trust m="∞" l={t({ ja: 'メンバー数無制限 (Concerto)', en: 'Unlimited members' }, lang)} />
            <Trust m="🎻" l={t({ ja: '音楽家のために', en: 'Built for musicians' }, lang)} />
          </div>
        </section>

        <section id="how" style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)', maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={H2}>{t({ ja: '使い方は 4 ステップ', en: 'Four steps' }, lang)}</h2>
          <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem' }}>
            <Step n="1" t={t({ ja: 'アンサンブルを作成', en: 'Create ensemble' }, lang)} d={t({ ja: 'メンバーの名前とメールを登録 (アカウント無くて OK)。', en: 'Register members\' names and emails (no account required for them).' }, lang)} />
            <Step n="2" t={t({ ja: '候補日時を提示', en: 'Propose candidates' }, lang)} d={t({ ja: '「次のリハ、5/3 14時 / 5/4 10時 / 5/4 14時 のどれか」と複数候補を投稿 → 全員に投票依頼メール送信。', en: 'Post multiple candidate slots → email invitations to all members.' }, lang)} />
            <Step n="3" t={t({ ja: '各メンバーが投票', en: 'Members vote' }, lang)} d={t({ ja: 'メール内のリンクから ✓ / △ / ✗ を 1 タップで回答 (アカウント不要)。', en: '1-tap ✓/△/✗ from email link (no account needed).' }, lang)} />
            <Step n="4" t={t({ ja: '集計を見て確定', en: 'Lock final slot' }, lang)} d={t({ ja: 'スコアの高い候補から選んで「確定」 → 全員に確定通知 + iCal 添付。', en: 'Pick the best candidate, lock it, everyone gets iCal-attached notification.' }, lang)} />
          </div>
        </section>

        <section style={{ background: PAPER_DEEP, padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={H2}>{t({ ja: 'こんな人のために', en: 'For these people' }, lang)}</h2>
            <div style={{ marginTop: '2rem', display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <P emoji="🎼" t="指揮者・コンマス" d="毎週のリハ調整に時間を取られていた方へ。LINE グループでの「いつ空いてる?」の応酬から解放されます。" />
              <P emoji="🎻" t="室内楽メンバー" d="カルテット・トリオの 3-4 人で予定を合わせる時の悩みを 30 秒で解決。" />
              <P emoji="🎤" t="バンド・合唱団" d="10-50 人規模でも、メンバーがメールから 1 タップで投票。アカウント無しで OK。" />
              <P emoji="🎹" t="プロデューサー" d="複数バンド・複数公演を一覧管理。リハ・本番・打合せをすべて KUON TUTTI で。" />
            </div>
          </div>
        </section>

        <section style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)', maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={H2}>{t({ ja: 'なぜ Calendly や LINE では足りないのか', en: 'Why Calendly or LINE isn\'t enough' }, lang)}</h2>
          <div style={{ marginTop: '2rem', display: 'grid', gap: '0.8rem' }}>
            <Diff t="グループ調整に最適化" d="Calendly は 1:1 が中心。TUTTI は 5-50 人の調整で真価を発揮。" />
            <Diff t="アカウント不要" d="メンバー全員に「アカウント作って」と頼まなくて良い。1 人の抵抗で団体全体が逃げる事故を防ぎます。" />
            <Diff t="役職階層の理解" d="オーナー / マネージャー / メンバーの権限。指揮者・コンマス・パートリーダー・代奏者の現場に対応。" />
            <Diff t="セクション別招集 (Phase 2)" d="「弦パートのみ分奏」「管打のみ」を一発で。" />
            <Diff t="集計の見やすさ" d="候補日 × メンバーの投票マトリックス。視覚的に「どれが多いか」即判断。" />
            <Diff t="iCal で全カレンダー対応" d="Google / Apple / Outlook すべてに 1 クリック追加。" />
          </div>
        </section>

        <section style={{ background: PAPER_DEEP, padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={H2}>{t({ ja: '料金', en: 'Pricing' }, lang)}</h2>
            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <Tier name="Free" price="¥0" lines={['アンサンブル 2 個', 'メンバー 10 名/組', '有効投票 5 件まで', '履歴 3 ヶ月']} />
              <Tier name="Concerto" price="¥1,480" highlight lines={['アンサンブル無制限', 'メンバー 50 名/組', '繰り返し予定 (Phase 2)', '履歴無制限', '+ 30+ アプリ']} />
              <Tier name="Symphony" price="¥2,480" lines={['すべて無制限', '優先処理', '+ 全アプリ + 優先サポート']} />
              <Tier name="Ensemble" price="¥9,800" lines={['50-100 名団体専用', '複数管理者', '公演会計連動 (将来)']} />
            </div>
            <p style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, textAlign: 'center', marginTop: '1.4rem' }}>
              {t({ ja: '年払いで 2 ヶ月無料。Free でも本機能は十分使えます。', en: 'Annual: 2 months free. Free tier is fully functional.' }, lang)}
            </p>
          </div>
        </section>

        <section style={{ background: INK, color: PAPER, padding: 'clamp(4rem, 8vw, 6rem) clamp(1.5rem, 4vw, 3rem)', textAlign: 'center' }}>
          <h2 style={{ fontFamily: serif, fontSize: 'clamp(1.7rem, 3.5vw, 2.4rem)', fontWeight: 400, margin: 0, letterSpacing: '0.04em', lineHeight: 1.5 }}>
            {t({ ja: 'リハーサル日程の調整に、もう時間を使わない。', en: 'Stop spending time scheduling rehearsals.' }, lang)}
          </h2>
          <Link href="/tutti" style={{ display: 'inline-block', marginTop: '1.8rem', padding: '1.1rem 2.6rem', background: PAPER, color: INK, textDecoration: 'none', fontFamily: serif, fontSize: '1.05rem', letterSpacing: '0.12em', borderRadius: 3 }}>
            {t({ ja: '無料で始める →', en: 'Start free →' }, lang)}
          </Link>
          <p style={{ fontFamily: serif, fontStyle: 'italic', fontSize: '0.85rem', color: '#cbcab9', marginTop: '1.4rem' }}>
            {t({ ja: '空音開発 / KUON R&D — 朝比奈幸太郎が音楽家のために', en: 'KUON R&D — by Kotaro Asahina, for musicians' }, lang)}
          </p>
        </section>
      </main>
    </>
  );
}

const H2: React.CSSProperties = { fontFamily: serif, fontSize: 'clamp(1.5rem, 3vw, 2.1rem)', fontWeight: 400, margin: 0, letterSpacing: '0.04em', borderBottom: `2px solid ${ACCENT}`, paddingBottom: '0.6rem', display: 'inline-block' };

function Trust({ m, l }: { m: string; l: string }) {
  return <div><div style={{ fontFamily: serif, fontSize: '1.6rem', color: ACCENT }}>{m}</div><div style={{ fontFamily: sans, fontSize: '0.78rem', color: INK_FAINT, marginTop: '0.2rem' }}>{l}</div></div>;
}
function Step({ n, t, d }: { n: string; t: string; d: string }) {
  return <article style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '1rem', padding: '1rem 1.2rem', background: PAPER_DEEP, borderLeft: `3px solid ${ACCENT}`, borderRadius: 2 }}>
    <div style={{ fontFamily: serif, fontSize: '2rem', color: ACCENT, textAlign: 'right', lineHeight: 1 }}>{n}</div>
    <div><h3 style={{ fontFamily: serif, fontSize: '1.05rem', fontWeight: 400, margin: 0 }}>{t}</h3>
    <p style={{ fontFamily: sans, fontSize: '0.88rem', color: INK_FAINT, margin: '0.4rem 0 0', lineHeight: 1.85 }}>{d}</p></div>
  </article>;
}
function P({ emoji, t, d }: { emoji: string; t: string; d: string }) {
  return <article style={{ padding: '1.2rem', background: PAPER, borderRadius: 3, border: `1px solid ${RULE}` }}>
    <div style={{ fontSize: '2rem' }}>{emoji}</div>
    <h3 style={{ fontFamily: serif, fontSize: '1.05rem', fontWeight: 400, margin: '0.3rem 0 0.4rem' }}>{t}</h3>
    <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, margin: 0, lineHeight: 1.85 }}>{d}</p>
  </article>;
}
function Diff({ t, d }: { t: string; d: string }) {
  return <article style={{ padding: '0.9rem 1.1rem', background: PAPER, borderLeft: `2px solid ${ACCENT}`, borderRadius: 2 }}>
    <h3 style={{ fontFamily: serif, fontSize: '1rem', fontWeight: 400, margin: 0 }}>{t}</h3>
    <p style={{ fontFamily: sans, fontSize: '0.85rem', color: INK_FAINT, margin: '0.3rem 0 0', lineHeight: 1.7 }}>{d}</p>
  </article>;
}
function Tier({ name, price, lines, highlight }: { name: string; price: string; lines: string[]; highlight?: boolean }) {
  return <div style={{ padding: '1.3rem', background: highlight ? INK : PAPER, color: highlight ? PAPER : INK, border: `1px solid ${highlight ? INK : RULE}`, borderRadius: 3 }}>
    <div style={{ fontFamily: sans, fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: highlight ? '#cbcab9' : INK_FAINT }}>{name}</div>
    <div style={{ fontFamily: serif, fontSize: '1.7rem', margin: '0.4rem 0' }}>{price}</div>
    <ul style={{ fontFamily: sans, fontSize: '0.8rem', color: highlight ? PAPER : INK_FAINT, lineHeight: 1.95, margin: '0.5rem 0 0', padding: 0, listStyle: 'none' }}>
      {lines.map((l, i) => <li key={i} style={{ paddingLeft: '0.9rem', position: 'relative', marginBottom: '0.15rem' }}><span style={{ position: 'absolute', left: 0 }}>·</span>{l}</li>)}
    </ul>
  </div>;
}

function JsonLD() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'KUON TUTTI Calendar',
    description: 'Rehearsal and event scheduling designed for musicians (orchestras, chamber groups, bands, choirs). Group voting via email links, no account required for members.',
    url: 'https://kuon-rnd.com/tutti-lp',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0', highPrice: '9800', priceCurrency: 'JPY',
      offers: [
        { '@type': 'Offer', price: '0', priceCurrency: 'JPY', name: 'Free' },
        { '@type': 'Offer', price: '1480', priceCurrency: 'JPY', name: 'Concerto' },
        { '@type': 'Offer', price: '2480', priceCurrency: 'JPY', name: 'Symphony' },
        { '@type': 'Offer', price: '9800', priceCurrency: 'JPY', name: 'Ensemble' },
      ],
    },
    creator: { '@type': 'Person', name: 'Kotaro Asahina (朝比奈幸太郎)', url: 'https://kuon-rnd.com/profile' },
    publisher: { '@type': 'Organization', name: 'KUON R&D / 空音開発', url: 'https://kuon-rnd.com' },
    inLanguage: ['ja', 'en'],
    featureList: [
      'Rehearsal scheduling with multiple candidate slots',
      'Guest voting via email link (no account required)',
      'Vote tally matrix with members × candidates',
      'iCal (.ics) export for Google/Apple/Outlook calendars',
      'Role-based permissions (owner/manager/member)',
      'Email notifications for invitations and lock-in',
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
