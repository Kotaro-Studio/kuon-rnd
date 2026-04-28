'use client';

/**
 * /admin/coupons — 教師経由学生クーポン管理ダッシュボード
 *
 * オーナー (369@kotaroasahina.com) が知り合いのミュージシャン (教師) ごとに
 * STUDENT_30_12MO Coupon に紐づく Promotion Code を発行・管理する画面。
 *
 * 設計参照: CLAUDE.md §44 (教師経由学生クーポンシステム)
 *
 * 主な機能:
 *   - 教師情報入力 + コード自動提案 (姓+30 形式)
 *   - 共有 URL コピー (kuon-rnd.com/?coupon=XXX)
 *   - 既存コード一覧 + 使用回数 + 有効/無効トグル
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const sans = '"Helvetica Neue", Arial, sans-serif';
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const mono = '"SF Mono", "Fira Code", Consolas, monospace';

const OWNER_EMAIL = '369@kotaroasahina.com';

interface PromoCode {
  id: string;
  code: string;
  active: boolean;
  timesRedeemed: number;
  maxRedemptions: number | null;
  teacherEmail: string;
  teacherName: string;
  shareUrl: string;
  createdAt: string;
}

interface PromoCodeListResponse {
  ok: boolean;
  codes: PromoCode[];
  total: number;
  activeCount: number;
  totalRedemptions: number;
}

export default function AdminCouponsPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState<PromoCodeListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Form state
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [maxRedemptions, setMaxRedemptions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState<PromoCode | null>(null);

  // Auth check (owner only)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) { router.push('/auth/login'); return; }
        const me = await res.json();
        if (me.email !== OWNER_EMAIL) { router.push('/'); return; }
        setAuthed(true);
      } catch { router.push('/auth/login'); }
    })();
  }, [router]);

  const fetchCodes = useCallback(async () => {
    setLoading(true); setFetchError('');
    try {
      const res = await fetch('/api/auth/admin/promo-codes');
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setFetchError(err.error || `Failed to fetch (${res.status})`);
        return;
      }
      setData(await res.json());
    } catch {
      setFetchError('Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (authed) fetchCodes(); }, [authed, fetchCodes]);

  // 教師名から自動コード提案 (例: "田中太郎" → "TANAKA-30")
  const suggestCode = (name: string): string => {
    if (!name) return '';
    // 漢字/かな/カナの場合: 1文字目のローマ字推測は難しいので、英字の入力を促す
    const ascii = name.replace(/[^A-Za-z]/g, '').toUpperCase();
    if (ascii.length >= 3) return `${ascii.slice(0, 12)}-30`;
    return '';
  };

  // teacherName 変更時にコードを自動提案 (ユーザーが手動入力済みなら上書きしない)
  const handleTeacherNameChange = (val: string) => {
    setTeacherName(val);
    if (!codeInput) {
      const suggested = suggestCode(val);
      if (suggested) setCodeInput(suggested);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(''); setFormSuccess(null);

    if (!teacherEmail || !teacherName || !codeInput) {
      setFormError('全ての必須項目を入力してください');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/admin/promo-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherEmail,
          teacherName,
          code: codeInput,
          maxRedemptions: maxRedemptions ? parseInt(maxRedemptions, 10) : undefined,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        setFormError(result.message || result.error || `Failed (${res.status})`);
        return;
      }
      setFormSuccess(result.promoCode);
      // フォームクリア
      setTeacherEmail(''); setTeacherName(''); setCodeInput(''); setMaxRedemptions('');
      // 一覧を再取得
      fetchCodes();
    } catch {
      setFormError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    const action = currentActive ? '無効化' : '有効化';
    if (!confirm(`このコードを${action}しますか？`)) return;
    try {
      const res = await fetch(`/api/auth/admin/promo-code/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });
      if (res.ok) fetchCodes();
      else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || err.error || 'Failed');
      }
    } catch {
      alert('Network error');
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Quick visual feedback via temporary state
      const el = document.createElement('div');
      el.textContent = `${label} をコピーしました`;
      el.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#0284c7;color:#fff;padding:12px 18px;border-radius:8px;font-size:0.85rem;z-index:9999;font-family:' + sans;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1500);
    } catch {
      alert('クリップボードへのコピーに失敗しました');
    }
  };

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #334155', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: sans, color: '#e2e8f0' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        .admin-card { animation: slideIn .5s cubic-bezier(.16,1,.3,1) both; }
      `}</style>

      {/* Header */}
      <div style={{ background: '#020617', borderBottom: '1px solid #1e293b', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: serif, fontSize: '1.1rem', fontWeight: 300, letterSpacing: '0.15em', color: '#e2e8f0' }}>空音開発</span>
          </Link>
          <span style={{ fontFamily: mono, fontSize: '0.7rem', color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Coupon Manager</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/admin" style={{ color: '#64748b', fontSize: '0.8rem', textDecoration: 'none' }}>← Admin</Link>
          <Link href="/mypage" style={{ color: '#64748b', fontSize: '0.8rem', textDecoration: 'none' }}>マイページ</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>

        {/* Hero */}
        <div className="admin-card" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)', borderRadius: 16, padding: 'clamp(20px,3vw,32px)', marginBottom: '1.5rem', border: '1px solid #1e293b' }}>
          <div style={{ fontFamily: serif, fontSize: 'clamp(18px,3.5vw,26px)', fontWeight: 700, color: '#f8fafc', marginBottom: 8 }}>
            🎓 教師経由 学生クーポン管理
          </div>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.7, maxWidth: 720 }}>
            音楽家・教師ごとに <code style={{ background: '#1e293b', padding: '2px 6px', borderRadius: 4, fontFamily: mono, color: '#7dd3fc' }}>STUDENT_30_12MO</code> Coupon
            (Prelude / Concerto に 30% off × 12 ヶ月) のプロモーションコードを発行します。
            学生は教師から共有された URL またはコードを入力するだけで割引が自動適用されます。
          </div>
        </div>

        {/* 教師向け説明 LP リンクカード (隠しページ・営業前送付用) */}
        <div className="admin-card" style={{ background: 'linear-gradient(135deg, rgba(180,83,9,0.12), rgba(251,191,36,0.06))', border: '1px solid rgba(180,83,9,0.4)', borderRadius: 12, padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fbbf24', letterSpacing: '0.08em', marginBottom: 4, textTransform: 'uppercase' }}>
              📋 教師向け説明 LP（隠しページ・営業用）
            </div>
            <div style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.7 }}>
              教師にクーポンを発行する前の事前案内として送付。本番サイトには一切リンクなし。
              パスワード <code style={{ background: '#0f172a', padding: '1px 6px', borderRadius: 4, fontFamily: mono, color: '#fbbf24', fontSize: '0.82rem' }}>kuon</code> でゲート。
              月額 / 年額の両ロジック、12 ヶ月節約額、FAQ 8 問付き。
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <a href="/for-teachers" target="_blank" rel="noreferrer"
              style={{ padding: '0.55rem 1.1rem', background: '#fbbf24', color: '#7c2d12', borderRadius: 8, fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', fontFamily: sans, whiteSpace: 'nowrap' }}>
              LP を開く →
            </a>
            <button
              type="button"
              onClick={() => copyToClipboard('https://kuon-rnd.com/for-teachers', 'LP の URL')}
              style={{ padding: '0.55rem 0.9rem', background: 'transparent', color: '#fbbf24', border: '1px solid #fbbf24', borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer', fontFamily: sans, whiteSpace: 'nowrap' }}>
              URL コピー
            </button>
          </div>
        </div>

        {/* ── 割引ロジック解説 (営業時の参照用) ── */}
        <div className="admin-card" style={{ background: '#1e293b', borderRadius: 12, padding: '1.5rem', border: '1px solid #334155', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: serif, fontSize: '1.1rem', fontWeight: 400, color: '#f8fafc', marginTop: 0, marginBottom: '0.5rem' }}>
            💡 教師に説明する割引ロジック
          </h2>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 0, marginBottom: '1.2rem', lineHeight: 1.6 }}>
            教師が学生にコードを渡すとき、以下の流れで割引が自動適用されます。営業時の説明用に常時このページから参照できます。
          </p>

          {/* 月額タイムライン (3 段階) */}
          <div style={{ fontSize: '0.7rem', color: '#fbbf24', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            🗓️ 月額プランの場合（2 段階適用）
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem', marginBottom: '1.2rem' }}>
            {[
              {
                label: '月 1（初月）',
                title: '50% OFF',
                color: '#34d399',
                desc: 'HALF50 適用。Concerto なら ¥740、Prelude なら ¥390。「ほぼお試し」価格で活性化',
                tag: 'Checkout 時に自動適用',
              },
              {
                label: '月 2 〜 13',
                title: '30% OFF × 12 ヶ月',
                color: '#7dd3fc',
                desc: 'STUDENT_30_12MO に自動切替。Concerto ¥1,036 / Prelude ¥546 が 12 ヶ月続く',
                tag: '初回請求支払い後に Webhook が自動切替',
              },
              {
                label: '月 14 〜',
                title: '通常価格',
                color: '#a78bfa',
                desc: 'Concerto ¥1,480 / Prelude ¥780 に自動回復。学生は習慣化済みなので解約率低め',
                tag: 'Stripe duration_in_months: 12 で自動',
              },
            ].map((s) => (
              <div key={s.label} style={{ background: '#0f172a', borderRadius: 10, padding: '1rem', border: `1px solid ${s.color}33` }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color, marginBottom: 6, fontFamily: mono }}>{s.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: 8 }}>{s.desc}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontStyle: 'italic' }}>⚙ {s.tag}</div>
              </div>
            ))}
          </div>

          {/* 年額タイムライン (2 段階) */}
          <div style={{ fontSize: '0.7rem', color: '#fbbf24', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            📅 年額プランの場合（1 段階で完結）
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.8rem', marginBottom: '1.2rem' }}>
            {[
              {
                label: '年 1（最初の 1 年）',
                title: '30% OFF',
                color: '#7dd3fc',
                desc: 'STUDENT_30_12MO を Promotion Code で直接 attach。Concerto ¥10,360 / Prelude ¥5,460 で 1 年分一括前払い。',
                tag: 'HALF50 は monthly 限定なので skip → 即 STUDENT を適用',
              },
              {
                label: '年 2 〜（自動更新）',
                title: '通常価格',
                color: '#a78bfa',
                desc: 'クーポン失効 → Concerto ¥14,800 / Prelude ¥7,800 に自動回復。Webhook 切替不要 (1 段階で完結)。',
                tag: 'Stripe duration_in_months: 12 が自然失効',
              },
            ].map((s) => (
              <div key={s.label} style={{ background: '#0f172a', borderRadius: 10, padding: '1rem', border: `1px solid ${s.color}33` }}>
                <div style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color, marginBottom: 6, fontFamily: mono }}>{s.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: 8 }}>{s.desc}</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontStyle: 'italic' }}>⚙ {s.tag}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 8, padding: '0.7rem 1rem', marginBottom: '1.2rem' }}>
            💡 <strong style={{ color: '#fbbf24' }}>年額が顧客にとって最もお得：</strong>
            年額には既に「2 ヶ月無料」が組み込まれており、そこに 30% off が重なるため**実質約 42% 割引**になる。
            Kuon にとっても 1 年分のキャッシュ前倒し + 解約リスク激減で長期的に有利。
            営業時に「年払いを選ぶとさらにお得です」と伝えるとアップセルが効く。
          </div>

          {/* 12 ヶ月支払い額の試算表 */}
          <div style={{ background: '#0f172a', borderRadius: 10, padding: '1rem', border: '1px solid #334155', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7dd3fc', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
              12 ヶ月の顧客支払い試算
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse', fontFamily: mono }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#64748b' }}>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600 }}>プラン</th>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 600 }}>月 1</th>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 600 }}>月 2-12</th>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 600 }}>12ヶ月計</th>
                    <th style={{ padding: '0.4rem 0.5rem', textAlign: 'right', fontSize: '0.7rem', fontWeight: 600 }}>節約額</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.5rem', color: '#e2e8f0' }}>Prelude <span style={{ fontSize: '0.65rem', color: '#64748b' }}>月額</span></td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#34d399' }}>¥390</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#7dd3fc' }}>¥546 × 11</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#f8fafc', fontWeight: 700 }}>¥6,396</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#fbbf24' }}>¥2,964</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #1e293b', background: 'rgba(125,211,252,0.04)' }}>
                    <td style={{ padding: '0.5rem', color: '#e2e8f0' }}>Prelude <span style={{ fontSize: '0.65rem', color: '#7dd3fc', fontWeight: 700 }}>年額</span></td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#7dd3fc' }} colSpan={2}>¥5,460 一括</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#f8fafc', fontWeight: 700 }}>¥5,460</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>¥3,900</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.5rem', color: '#e2e8f0' }}>Concerto <span style={{ fontSize: '0.65rem', color: '#64748b' }}>月額</span></td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#34d399' }}>¥740</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#7dd3fc' }}>¥1,036 × 11</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#f8fafc', fontWeight: 700 }}>¥12,136</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#fbbf24' }}>¥5,624</td>
                  </tr>
                  <tr style={{ background: 'rgba(125,211,252,0.04)' }}>
                    <td style={{ padding: '0.5rem', color: '#e2e8f0' }}>Concerto <span style={{ fontSize: '0.65rem', color: '#7dd3fc', fontWeight: 700 }}>年額</span></td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#7dd3fc' }} colSpan={2}>¥10,360 一括</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#f8fafc', fontWeight: 700 }}>¥10,360</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#fbbf24', fontWeight: 700 }}>¥7,400</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.6rem', fontStyle: 'italic' }}>
              ※ 通常 12 ヶ月支払い額: Prelude 月額 ¥9,360 / 年額 ¥7,800、Concerto 月額 ¥17,760 / 年額 ¥14,800。
              年額 + 学割の組み合わせで最大 42% お得
            </div>
          </div>

          {/* 教師への説明スクリプト */}
          <div style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.06), rgba(56,189,248,0.04))', borderRadius: 10, padding: '1rem', border: '1px solid rgba(167,139,250,0.25)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>
              📣 教師への説明テンプレート
            </div>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.7, margin: 0 }}>
              「先生の学生さん専用に発行するコードです。学生さんがこの URL をクリックして購入すると、<br />
              <strong style={{ color: '#34d399' }}>初月は 50% オフ、その後 12 ヶ月間 30% オフ</strong>がずっと続きます。<br />
              先生のお名前のコードなので、学生さんから「○○先生のおかげで安く使えてる」と感じてもらえる仕組みです。<br />
              先生から学生さんへの紹介数は私たちのダッシュボードで把握しているので、何かあれば気軽にお声がけください。」
            </p>
          </div>

          {/* エッジケース */}
          <details style={{ marginTop: '1rem' }}>
            <summary style={{ fontSize: '0.75rem', color: '#64748b', cursor: 'pointer', padding: '0.4rem 0' }}>
              ▼ 技術的詳細・エッジケース
            </summary>
            <ul style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.7, marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
              <li><strong>2 段階適用の仕組み</strong>: Stripe は 1 サブスクに 1 クーポンしか持てないため、初回請求支払い後に Webhook が <code style={{ color: '#7dd3fc' }}>HALF50_*</code> から <code style={{ color: '#7dd3fc' }}>STUDENT_30_12MO</code> へ自動切替</li>
              <li><strong>HALF50 の二重利用防止</strong>: 一度使うと <code style={{ color: '#7dd3fc' }}>half50:&lt;email&gt;</code> フラグが立ち再利用不可。教師コード経由で再加入しようとしても初月割引は付かず、直接 STUDENT_30_12MO が attach される</li>
              <li><strong>年額契約の場合</strong>: HALF50 は monthly のみ。年額 + 教師コードなら STUDENT_30_12MO が直接 attach される（年額に 50% off は深すぎるため）</li>
              <li><strong>初回請求が失敗した場合</strong>: <code style={{ color: '#7dd3fc' }}>pendingStudentSwitch</code> フラグが残るため、後で支払いが成功した時点で再試行される</li>
              <li><strong>教師コードの first_time_transaction 制限</strong>: 既存課金者は教師コードで Checkout できない (Stripe 側で自動ブロック)。これは抜け道塞ぎ</li>
              <li><strong>attribution の保持</strong>: <code style={{ color: '#7dd3fc' }}>subscription.metadata.teacherEmail</code> に教師の email が記録される。将来 <code style={{ color: '#7dd3fc' }}>/teacher</code> ダッシュボードで集計予定</li>
            </ul>
          </details>
        </div>

        {/* Stats */}
        {data && (
          <div className="admin-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.8rem', marginBottom: '1.5rem' }}>
            {[
              { label: '発行済みコード', value: data.total, color: '#f8fafc' },
              { label: '有効コード', value: data.activeCount, color: '#34d399' },
              { label: '累計使用回数', value: data.totalRedemptions, color: '#a78bfa' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#1e293b', borderRadius: 12, padding: '1rem', textAlign: 'center', border: '1px solid #334155' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color, fontFamily: mono }}>{value}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4, letterSpacing: '0.06em' }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* New Code Form */}
        <div className="admin-card" style={{ background: '#1e293b', borderRadius: 12, padding: '1.5rem', border: '1px solid #334155', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: serif, fontSize: '1.1rem', fontWeight: 400, color: '#f8fafc', marginTop: 0, marginBottom: '1rem' }}>
            ＋ 新しいプロモーションコードを発行
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>
                  教師の名前 <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text" value={teacherName} onChange={(e) => handleTeacherNameChange(e.target.value)}
                  placeholder="例: Asahina Kotaro / 朝比奈幸太郎" required
                  style={{ width: '100%', padding: '0.55rem 0.8rem', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: '0.85rem', fontFamily: sans, boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>
                  教師の Email <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="email" value={teacherEmail} onChange={(e) => setTeacherEmail(e.target.value)}
                  placeholder="teacher@example.com" required
                  style={{ width: '100%', padding: '0.55rem 0.8rem', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: '0.85rem', fontFamily: mono, boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: 4 }}>
                  紹介帰属 (attribution) のため記録。Kuon ユーザーの email と同じだと将来の紐付けに便利
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>
                  プロモーションコード <span style={{ color: '#f87171' }}>*</span>
                </label>
                <input
                  type="text" value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder="ASAHINA-30" required
                  pattern="^[A-Z0-9-]{3,50}$"
                  style={{ width: '100%', padding: '0.55rem 0.8rem', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#7dd3fc', fontSize: '0.95rem', fontFamily: mono, fontWeight: 700, boxSizing: 'border-box', letterSpacing: '0.04em' }}
                />
                <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: 4 }}>
                  英大文字・数字・ハイフンのみ。教師の名前を冠するのが推奨 (例: TANAKA-30)
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: 6 }}>
                  使用回数上限 <span style={{ color: '#64748b' }}>(任意)</span>
                </label>
                <input
                  type="number" value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)}
                  placeholder="無制限" min={1}
                  style={{ width: '100%', padding: '0.55rem 0.8rem', background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#e2e8f0', fontSize: '0.85rem', fontFamily: mono, boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: 4 }}>
                  空欄 = 無制限。乱用が懸念される場合のみ設定 (例: 30)
                </div>
              </div>
            </div>

            {formError && (
              <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: 8, padding: '0.7rem 1rem', marginBottom: '1rem', color: '#fca5a5', fontSize: '0.85rem' }}>
                {formError}
              </div>
            )}

            <button type="submit" disabled={submitting}
              style={{ padding: '0.65rem 1.6rem', background: submitting ? '#1e293b' : 'linear-gradient(135deg, #0284c7, #38bdf8)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: submitting ? 'wait' : 'pointer', fontFamily: sans }}>
              {submitting ? '発行中…' : 'プロモーションコードを発行'}
            </button>
          </form>

          {/* Success display */}
          {formSuccess && (
            <div style={{ marginTop: '1.5rem', background: 'linear-gradient(135deg, rgba(52,211,153,0.1), rgba(56,189,248,0.05))', border: '1px solid #34d399', borderRadius: 10, padding: '1.2rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 700, letterSpacing: '0.08em', marginBottom: 8 }}>
                ✓ 発行完了 — 教師にこのまま送ってください
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', minWidth: 70 }}>コード:</span>
                  <code style={{ background: '#0f172a', padding: '6px 12px', borderRadius: 6, fontFamily: mono, color: '#7dd3fc', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                    {formSuccess.code}
                  </code>
                  <button type="button" onClick={() => copyToClipboard(formSuccess.code, 'コード')}
                    style={{ padding: '4px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#94a3b8', fontSize: '0.7rem', cursor: 'pointer', fontFamily: sans }}>
                    コピー
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', minWidth: 70 }}>共有 URL:</span>
                  <code style={{ background: '#0f172a', padding: '6px 12px', borderRadius: 6, fontFamily: mono, color: '#a78bfa', fontSize: '0.8rem', wordBreak: 'break-all', flex: 1, minWidth: 240 }}>
                    {formSuccess.shareUrl}
                  </code>
                  <button type="button" onClick={() => copyToClipboard(formSuccess.shareUrl, 'URL')}
                    style={{ padding: '4px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#94a3b8', fontSize: '0.7rem', cursor: 'pointer', fontFamily: sans }}>
                    コピー
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Code List */}
        <div className="admin-card" style={{ background: '#1e293b', borderRadius: 12, border: '1px solid #334155', overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #334155' }}>
            <h2 style={{ fontFamily: serif, fontSize: '1.05rem', fontWeight: 400, color: '#f8fafc', margin: 0 }}>
              発行済みコード一覧
            </h2>
          </div>

          {loading && (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ width: 32, height: 32, border: '3px solid #334155', borderTopColor: '#38bdf8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          )}

          {fetchError && !loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#fca5a5', fontSize: '0.85rem' }}>{fetchError}</div>
          )}

          {!loading && data && data.codes.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#475569', fontSize: '0.9rem' }}>
              まだプロモーションコードが発行されていません。<br />
              上のフォームから最初のコードを発行してください。
            </div>
          )}

          {!loading && data && data.codes.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #334155' }}>
                    {['状態', 'コード', '教師', '使用 / 上限', '発行日', '操作'].map((h) => (
                      <th key={h} style={{ padding: '0.7rem 0.8rem', textAlign: 'left', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap', fontSize: '0.7rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.codes.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #1e293b', opacity: c.active ? 1 : 0.55 }}>
                      <td style={{ padding: '0.7rem 0.8rem', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', background: c.active ? 'rgba(52,211,153,0.15)' : 'rgba(148,163,184,0.1)', color: c.active ? '#34d399' : '#94a3b8', textTransform: 'uppercase' }}>
                          {c.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ padding: '0.7rem 0.8rem', whiteSpace: 'nowrap' }}>
                        <code style={{ fontFamily: mono, color: '#7dd3fc', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.03em' }}>{c.code}</code>
                      </td>
                      <td style={{ padding: '0.7rem 0.8rem', maxWidth: 240 }}>
                        <div style={{ color: '#e2e8f0' }}>{c.teacherName || '—'}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: mono, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.teacherEmail}</div>
                      </td>
                      <td style={{ padding: '0.7rem 0.8rem', whiteSpace: 'nowrap', fontFamily: mono }}>
                        <span style={{ color: c.timesRedeemed > 0 ? '#34d399' : '#64748b', fontWeight: 600 }}>{c.timesRedeemed}</span>
                        <span style={{ color: '#475569' }}> / {c.maxRedemptions ?? '∞'}</span>
                      </td>
                      <td style={{ padding: '0.7rem 0.8rem', whiteSpace: 'nowrap', color: '#94a3b8', fontSize: '0.78rem' }}>
                        {formatDate(c.createdAt)}
                      </td>
                      <td style={{ padding: '0.7rem 0.8rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => copyToClipboard(c.shareUrl, 'URL')}
                            style={{ padding: '4px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#94a3b8', fontSize: '0.7rem', cursor: 'pointer', fontFamily: sans }}>
                            URL
                          </button>
                          <button onClick={() => copyToClipboard(c.code, 'コード')}
                            style={{ padding: '4px 8px', background: '#0f172a', border: '1px solid #334155', borderRadius: 4, color: '#94a3b8', fontSize: '0.7rem', cursor: 'pointer', fontFamily: sans }}>
                            コード
                          </button>
                          <button onClick={() => handleToggleActive(c.id, c.active)}
                            style={{ padding: '4px 8px', background: c.active ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.1)', border: `1px solid ${c.active ? '#ef4444' : '#34d399'}`, borderRadius: 4, color: c.active ? '#fca5a5' : '#86efac', fontSize: '0.7rem', cursor: 'pointer', fontFamily: sans }}>
                            {c.active ? '無効化' : '有効化'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer help */}
        <div style={{ marginTop: '1.5rem', padding: '1rem 1.2rem', background: '#1e293b', borderRadius: 10, border: '1px solid #334155', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.7 }}>
          <strong style={{ color: '#7dd3fc' }}>運用メモ:</strong>
          <ul style={{ margin: '0.5rem 0 0 1.2rem', padding: 0, color: '#94a3b8' }}>
            <li>教師に共有 URL を渡せば、学生はワンクリックで Checkout に割引が自動適用される</li>
            <li>Stripe の制約上、コードは作成後に変更できない (誤発行時は無効化 → 再発行)</li>
            <li>「使用回数上限」を空欄にすると無制限。乱用懸念がある場合のみ設定</li>
            <li>既存課金者の二重利用は Stripe 側で自動ブロック (first_time_transaction)</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
