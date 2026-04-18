// サウンドマップ投稿 API — フォームからMP3＋座標を受け取り、Worker経由でR2に保存、Resendでオーナーに通知
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
  const location = (formData.get('location') as string)?.trim();
  const lat = (formData.get('lat') as string)?.trim();
  const lng = (formData.get('lng') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || '';
  const mic = (formData.get('mic') as string)?.trim() || '';
  const url = (formData.get('url') as string)?.trim() || '';
  const password = (formData.get('password') as string)?.trim();
  const file = formData.get('file') as File | null;

  // Password validation (purchase-only access)
  if (password !== 'kuon041755') {
    return NextResponse.json(
      { error: 'パスワードが正しくありません。ご購入時にお届けしたパスワードをご確認ください。' },
      { status: 403 },
    );
  }

  // Validation
  if (!name || !email || !location || !lat || !lng) {
    return NextResponse.json({ error: '必須項目が入力されていません' }, { status: 400 });
  }

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return NextResponse.json({ error: '座標が正しくありません' }, { status: 400 });
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

  // Generate safe filename: submissions/soundmap/YYYYMMDD-name-location.mp3
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const safeName = name.replace(/[^a-zA-Z0-9\u3040-\u9fff]/g, '-').slice(0, 30);
  const safeLocation = location.replace(/[^a-zA-Z0-9\u3040-\u9fff]/g, '-').slice(0, 40);
  const fileKey = `submissions/soundmap/${date}-${safeName}-${safeLocation}.mp3`;

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
    const mapsUrl = `https://www.google.com/maps?q=${latNum},${lngNum}`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: '空音開発 Kuon R&D <noreply@kotaroasahina.com>',
        to: '369@kotaroasahina.com',
        subject: `【地球の音マップ投稿】${name} 様 — ${location}`,
        html: `
          <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px 20px;">
            <h2 style="color: #059669; margin-bottom: 16px;">地球の音マップに新しい投稿</h2>
            <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 120px;">投稿者名</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${name}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">メール</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${email}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">録音場所</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${location}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">座標</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;"><a href="${mapsUrl}" style="color: #0284c7;">${latNum}, ${lngNum}</a></td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">説明</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${description || '（なし）'}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">使用マイク</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${mic || '（未記入）'}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">サイト/SNS</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${url || '（なし）'}</td></tr>
              <tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">ファイルサイズ</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${sizeMB} MB</td></tr>
              <tr><td style="padding: 8px; color: #64748b;">R2 パス</td><td style="padding: 8px;">${fileKey}</td></tr>
            </table>
            <p style="margin-top: 20px; font-size: 13px; color: #64748b;">
              試聴: <a href="${WORKER_BASE}/api/audio/${fileKey}" style="color: #0284c7;">${WORKER_BASE}/api/audio/${fileKey}</a>
            </p>
            <p style="margin-top: 10px; font-size: 13px; color: #94a3b8;">
              承認後に data/soundmap.json にエントリを追加してください。
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
