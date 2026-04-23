# KUON SEPARATOR — GCP Cloud Run Worker

音源分離（ボーカル / ドラム / ベース / その他）を行う GCP Cloud Run ベースのサーバーアプリケーション。
Meta AI の Demucs v4 (htdemucs) モデルを使用。

## アーキテクチャ

```
Browser
  │ POST /api/separator/run (audio file)
  ▼
Next.js API Proxy (/app/api/separator/run)
  │ ① JWT 検証 (Auth Worker 経由)
  │ ② クォータチェック (Free: 3/月, Student: 10/月, Pro: 50/月)
  │ ③ Bearer SEPARATOR_SECRET を付けて転送
  ▼
GCP Cloud Run (kuon-rnd-separator)
  │ ① 共有シークレット検証
  │ ② Demucs v4 で分離実行（~4-6 分）
  │ ③ 4 ステム (drums/bass/vocals/other) を R2 にアップロード
  │ ④ 24 時間有効な署名付き URL を返却
  ▼
R2 (kuon-rnd-separator) — 24 時間で自動削除
```

## ローカル開発

```bash
# ビルド
docker build -t kuon-rnd-separator:dev .

# 起動
docker run -p 8080:8080 \
  -e SEPARATOR_SECRET=dev-secret \
  -e R2_ACCESS_KEY_ID=... \
  -e R2_SECRET_ACCESS_KEY=... \
  -e R2_ENDPOINT=... \
  -e R2_BUCKET=kuon-rnd-separator \
  kuon-rnd-separator:dev

# テスト
curl -X POST http://localhost:8080/separate \
  -H "Authorization: Bearer dev-secret" \
  -F "audio=@test.mp3"
```

## デプロイ

```bash
# 手動デプロイ
gcloud builds submit --config=cloudbuild.yaml

# または git push で自動（Cloud Build Trigger 設定後）
```

## 環境変数 (Secret Manager)

| 変数 | 用途 |
|------|------|
| SEPARATOR_SECRET | Next.js ↔ Cloud Run 間の共有認証トークン |
| R2_ACCESS_KEY_ID | R2 API アクセスキー |
| R2_SECRET_ACCESS_KEY | R2 API シークレット |
| R2_ENDPOINT | R2 エンドポイント URL |
| R2_BUCKET | kuon-rnd-separator |

## 制限

- 最大ファイルサイズ: 50 MB
- 最大長: 10 分
- サポート形式: MP3, WAV, FLAC, M4A
- 処理時間: 4 分曲で約 4-6 分（CPU 4 vCPU）
