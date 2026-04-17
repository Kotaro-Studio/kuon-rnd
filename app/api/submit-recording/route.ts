// 録音投稿 API — フォームからファイルを受け取り、Worker 経由で R2 に保存、Resend でオーナーに通知
// 環境変数:
//   UPLOAD_SECRET — Worker のアップロード認証トークン
//   RESEND_API_KEY — Resend メール送信用

export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

const WORKER_BASE = 'https://kuon-rnd-audio-worker.369-1d5.workers.dev';
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(request: NextRequest) {
  const uploadSecret = process.env.UPLOAD_SECRET;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!uploadSecret || !resendApiKey) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  // Extract fields
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const instrument = (formData.get('instrument') as string)?.trim();
  const title = (formData.get('title') as string)?.trim();
  const comment = (formData.get('comment') as string)?.trim() || '';
  const mastering = formData.get('mastering') === 'true';
  const password = (formData.get('password') as string)?.trim();
  const file = formData.get('file') as File | null;

  // Password validation (purchase-only access)
  if (password !== 'kuon041755') {
    return NextResponse.json({ error: 'パスワードが正しくありません。ご購入時にお届けしたパスワードをご確認ください。' }, { status: 403 });
  }

  // Validation
  if (!name || !email || !instrument || !title) {
    return NextResponse.json({ error: '必須項目が入力されていません' }, { status: 400 });
  }
  if (!file) {
    return NextResponse.json({ error: '音声ファイルを選択してください' }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith('.mp3')) {
    return NextResponse.json({ error: 'MP3 ファイルのみ受け付けています' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'ファイルサイズは 20MB 以下にしてください' }, { status: 413 });
  }

  // Generate safe filename: submissions/YYYYMMDD-name-title.mp3
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const safeName = name.replace(/[^a-zA-Z0-9\u3040-\u9fff]/g, '-').slice(0, 30);
  const safeTitle = title.replace(/[^a-zA-Z0-9\u3040-\u9fff]/g, '-').slice(0, 40);
  const fileKey = `submissions/${date}-${safeName}-${safeTitle}.mp3`;

  // Upload to R2 via Worker
  const fileBuffer = await file.arrayBuffer();
  const uploadRes = await fetch(`${WORKER_BASE}/api/upload/${fileKey}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${uploadSecret}`,
      'Content-Type': 'application/octet-stream',
    },
    body: fileBuffer,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    console.error('Worker upload error:', err);
    return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 });
  }

  // Send notification email to owner via Resend
  try {
    const sizeMB = (file.size / 1024 / 1024).toFixed(1);
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: '空音開発 Kuon R&D <noreply@kotaroasahina.com>',
        to: '369@kotaroasahina.com',
        subject: `【録音投稿】${name} 様 — ${title}（${instrument}）`,
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px 20px;">
            <h2 style="color: #0c4a6e; margin-bottom: 16px;">録音投稿がありました</h2>
            <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 120px;">投稿者名</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${name}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">メール</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${email}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">楽器</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${instrument}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">曲名</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${title}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">コメント</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${comment || '（なし）'}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">マスタリング希望</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${mastering ? 'はい' : 'いいえ'}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">ファイルサイズ</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${sizeMB} MB</td></tr>
              <tr><td style="padding: 8px; color: #64748b;">R2 パス</td><td style="padding: 8px;">${fileKey}</td></tr>
            </table>
            <p style="margin-top: 20px; font-size: 13px; color: #64748b;">
              試聴: <a href="${WORKER_BASE}/api/audio/${fileKey}" style="color: #0284c7;">${WORKER_BASE}/api/audio/${fileKey}</a>
            </p>
          </div>
        `,
      }),
    });
  } catch (e) {
    console.error('Notification email failed:', e);
  }

  return NextResponse.json({ ok: true, message: '投稿を受け付けました。ありがとうございます。' });
}
