'use client';

// オーナー専用 発送管理ページ
//
// 機能:
//   - 直近 30 日のマイク注文を未発送・発送済みで分類表示
//   - 未発送注文に対し、ヤマト追跡番号を入力して発送通知メールを送信
//   - 誤送信防止の 3 段階確認: 注文選択 → 番号入力 → 確認モーダル → 送信
//   - 発送済み注文の追跡番号と発送日時を表示

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  createdAt: number;
  amount: number;
  product: string;
  productName: string;
  customer: { name: string; email: string; phone: string };
  shippingAddress: {
    country: string;
    postal_code: string;
    state: string;
    city: string;
    line1: string;
    line2: string;
  };
  shipped: boolean;
  trackingNumber: string | null;
  shippedAt: string | null;
}

const sans = '"Helvetica Neue", Arial, sans-serif';
const serif = '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif';
const ACCENT = '#0284c7';

export default function ShipAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'unshipped' | 'shipped' | 'all'>('unshipped');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        setError(err.error || `Failed to fetch orders (${res.status})`);
        return;
      }
      const data = (await res.json()) as { orders: Order[] };
      setOrders(data.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    if (filter === 'unshipped') return !o.shipped;
    if (filter === 'shipped') return o.shipped;
    return true;
  });

  const unshippedCount = orders.filter((o) => !o.shipped).length;
  const shippedCount = orders.filter((o) => o.shipped).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: 'clamp(1rem, 3%, 2rem)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/mypage" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none', fontFamily: sans }}>
            ← マイページ
          </Link>
          <h1 style={{ fontFamily: serif, fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: '#0f172a', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            発送管理
          </h1>
          <p style={{ fontFamily: sans, fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            直近 30 日のマイク注文。発送通知メールはここから送信します。
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {(['unshipped', 'shipped', 'all'] as const).map((f) => {
            const label = { unshipped: `未発送 (${unshippedCount})`, shipped: `発送済み (${shippedCount})`, all: `全て (${orders.length})` }[f];
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: sans,
                  fontSize: '0.85rem',
                  padding: '0.5rem 1rem',
                  borderRadius: 8,
                  border: `1px solid ${isActive ? ACCENT : '#e2e8f0'}`,
                  background: isActive ? ACCENT : 'white',
                  color: isActive ? 'white' : '#475569',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {label}
              </button>
            );
          })}
          <button
            onClick={fetchOrders}
            style={{
              marginLeft: 'auto',
              fontFamily: sans,
              fontSize: '0.85rem',
              padding: '0.5rem 1rem',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            🔄 更新
          </button>
        </div>

        {/* Status / Error */}
        {loading && (
          <div style={{ fontFamily: sans, color: '#64748b', textAlign: 'center', padding: '2rem' }}>
            読み込み中...
          </div>
        )}
        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8, padding: '1rem', fontFamily: sans, fontSize: '0.85rem', color: '#991b1b', marginBottom: '1rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Order list */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ background: 'white', borderRadius: 12, padding: '3rem', textAlign: 'center', fontFamily: sans, color: '#64748b' }}>
            {filter === 'unshipped' ? '未発送の注文はありません 🎉' : filter === 'shipped' ? '発送済みの注文はありません' : '注文はありません'}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} onShipped={fetchOrders} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 個別注文カード (展開で発送フォーム表示)
// ─────────────────────────────────────────────
function OrderCard({ order, onShipped }: { order: Order; onShipped: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const dateStr = new Date(order.createdAt * 1000).toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const fullAddress = [
    `〒${order.shippingAddress.postal_code}`,
    `${order.shippingAddress.state}${order.shippingAddress.city}${order.shippingAddress.line1}`,
    order.shippingAddress.line2,
  ].filter((s) => s.trim()).join(' / ');

  // 追跡番号バリデーション
  const trackingDigits = trackingInput.replace(/[^\d]/g, '');
  const trackingValid = trackingDigits.length === 12;
  const trackingFormatted = trackingValid
    ? `${trackingDigits.slice(0, 4)}-${trackingDigits.slice(4, 8)}-${trackingDigits.slice(8, 12)}`
    : trackingInput;

  const proceedToConfirm = () => {
    setSendError(null);
    if (!trackingValid) {
      setSendError('追跡番号は 12 桁の数字を入力してください');
      return;
    }
    setConfirming(true);
  };

  const sendShippingEmail = async () => {
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch('/api/admin/ship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: order.id, trackingNumber: trackingDigits }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        message?: string;
        previousTracking?: string;
      };
      if (!res.ok) {
        if (res.status === 409) {
          setSendError(`この注文は既に発送済みです (追跡番号: ${data.previousTracking})`);
        } else {
          setSendError(data.message || data.error || `送信失敗 (${res.status})`);
        }
        return;
      }
      // 成功 → 一覧再取得
      setConfirming(false);
      setExpanded(false);
      setTrackingInput('');
      onShipped();
    } catch (e) {
      setSendError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setSending(false);
    }
  };

  const cardBg = order.shipped ? '#f1f5f9' : 'white';
  const cardBorder = order.shipped ? '#cbd5e1' : '#e2e8f0';

  return (
    <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '1.25rem', fontFamily: sans }}>
      {/* Status badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        {order.shipped ? (
          <span style={{ background: '#dcfce7', color: '#166534', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600 }}>
            ✓ 発送済み {order.shippedAt ? `(${new Date(order.shippedAt).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo', month: '2-digit', day: '2-digit' })})` : ''}
          </span>
        ) : (
          <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600 }}>
            📦 未発送
          </span>
        )}
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{dateStr}</span>
      </div>

      {/* Customer + Product info */}
      <div style={{ marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>
          {order.customer.name || '(名前未設定)'} <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 400 }}>/ {order.shippingAddress.state}</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#475569' }}>
          {order.productName} / ¥{order.amount.toLocaleString()}
        </div>
      </div>

      {/* Shipped: show tracking */}
      {order.shipped && order.trackingNumber && (
        <div style={{ background: '#dcfce7', borderRadius: 8, padding: '0.75rem', fontSize: '0.85rem', color: '#166534', marginBottom: '0.5rem' }}>
          追跡番号: <code style={{ fontFamily: 'SF Mono, Consolas, monospace' }}>{order.trackingNumber}</code>
          {' '}
          <a
            href={`https://toi.kuronekoyamato.co.jp/cgi-bin/tneko?init=yes&number01=${order.trackingNumber}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#166534', marginLeft: '0.5rem' }}
          >
            配送状況を確認 →
          </a>
        </div>
      )}

      {/* Address (always visible for verification) */}
      <div style={{ background: '#f8fafc', borderRadius: 8, padding: '0.75rem', fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
        📍 {fullAddress}
      </div>

      {/* Action button (unshipped only) */}
      {!order.shipped && !expanded && (
        <button
          onClick={() => setExpanded(true)}
          style={{ width: '100%', padding: '0.75rem', background: ACCENT, color: 'white', border: 'none', borderRadius: 8, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer' }}
        >
          発送する →
        </button>
      )}

      {/* Expanded form */}
      {expanded && !confirming && (
        <div style={{ background: '#f8fafc', borderRadius: 8, padding: '1rem', marginTop: '0.5rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.75rem' }}>
            ヤマト追跡番号を入力
          </h3>

          {/* Customer email shown for verification */}
          <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>
            送信先: <code style={{ fontFamily: 'SF Mono, Consolas, monospace', background: 'white', padding: '0.15rem 0.4rem', borderRadius: 4 }}>{order.customer.email}</code>
          </div>

          <input
            type="text"
            value={trackingInput}
            onChange={(e) => { setTrackingInput(e.target.value); setSendError(null); }}
            placeholder="例: 123456789012 (ハイフン省略可)"
            inputMode="numeric"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', borderRadius: 6, border: `1px solid ${trackingValid ? '#10b981' : '#cbd5e1'}`, fontFamily: 'SF Mono, Consolas, monospace', letterSpacing: '0.05em', boxSizing: 'border-box' }}
          />
          <div style={{ fontSize: '0.75rem', color: trackingValid ? '#059669' : '#94a3b8', marginTop: '0.25rem' }}>
            {trackingValid ? `✓ ${trackingFormatted}` : `${trackingDigits.length} / 12 桁`}
          </div>

          {sendError && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.5rem', borderRadius: 6, fontSize: '0.85rem', marginTop: '0.5rem' }}>
              ⚠️ {sendError}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              onClick={() => { setExpanded(false); setTrackingInput(''); setSendError(null); }}
              style={{ flex: 1, padding: '0.65rem', background: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.9rem', cursor: 'pointer' }}
            >
              キャンセル
            </button>
            <button
              onClick={proceedToConfirm}
              disabled={!trackingValid}
              style={{ flex: 2, padding: '0.65rem', background: trackingValid ? ACCENT : '#cbd5e1', color: 'white', border: 'none', borderRadius: 6, fontSize: '0.9rem', fontWeight: 600, cursor: trackingValid ? 'pointer' : 'not-allowed' }}
            >
              確認画面へ →
            </button>
          </div>
        </div>
      )}

      {/* Confirmation modal */}
      {confirming && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={() => !sending && setConfirming(false)}
        >
          <div
            style={{ background: 'white', borderRadius: 12, padding: '1.5rem', maxWidth: 500, width: '100%', maxHeight: '90vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontFamily: serif, fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.75rem' }}>
              ⚠️ 発送通知メール送信確認
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              以下の内容で発送通知メールを送信します。情報が正しいことを必ず確認してください。
            </p>

            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#92400e', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.25rem' }}>
                🚨 宛先メールアドレス
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', fontFamily: 'SF Mono, Consolas, monospace' }}>
                {order.customer.email}
              </div>
            </div>

            <table style={{ width: '100%', fontSize: '0.85rem', color: '#0f172a', borderCollapse: 'collapse', marginBottom: '1rem' }}>
              <tbody>
                <tr><td style={{ padding: '0.4rem 0.75rem 0.4rem 0', color: '#64748b', verticalAlign: 'top' }}>顧客名</td><td>{order.customer.name}</td></tr>
                <tr><td style={{ padding: '0.4rem 0.75rem 0.4rem 0', color: '#64748b', verticalAlign: 'top' }}>商品</td><td>{order.productName}</td></tr>
                <tr><td style={{ padding: '0.4rem 0.75rem 0.4rem 0', color: '#64748b', verticalAlign: 'top' }}>配送先</td><td>{fullAddress}</td></tr>
                <tr><td style={{ padding: '0.4rem 0.75rem 0.4rem 0', color: '#64748b', verticalAlign: 'top' }}>追跡番号</td>
                  <td><code style={{ fontFamily: 'SF Mono, Consolas, monospace', background: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: 4, fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.05em' }}>{trackingFormatted}</code></td></tr>
              </tbody>
            </table>

            <div style={{ background: '#fee2e2', borderRadius: 8, padding: '0.75rem', fontSize: '0.8rem', color: '#991b1b', marginBottom: '1rem' }}>
              ※ 一度送信すると取り消せません。
              送信後は同じ注文への再送信はできなくなります。
            </div>

            {sendError && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.5rem', borderRadius: 6, fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                ⚠️ {sendError}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setConfirming(false)}
                disabled={sending}
                style={{ flex: 1, padding: '0.75rem', background: 'white', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: '0.95rem', cursor: sending ? 'wait' : 'pointer' }}
              >
                キャンセル
              </button>
              <button
                onClick={sendShippingEmail}
                disabled={sending}
                style={{ flex: 2, padding: '0.75rem', background: sending ? '#cbd5e1' : '#16a34a', color: 'white', border: 'none', borderRadius: 6, fontSize: '0.95rem', fontWeight: 600, cursor: sending ? 'wait' : 'pointer' }}
              >
                {sending ? '送信中...' : '確認しました、送信する ✓'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
