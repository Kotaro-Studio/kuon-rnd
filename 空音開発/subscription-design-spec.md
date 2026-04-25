# 空音開発 サブスクリプション設計書（2026-04-24 確定版）

> このドキュメントは空音開発のサブスクリプション設計に関する**確定した最上位仕様**です。
> 今後のすべての実装判断はこの文書を基準とし、矛盾する記述は新しい合意があるまで無効です。
> 実装ガイド（Stripe Dashboard 設定手順等）は別ドキュメント `stripe-setup-guide-v2.md` で提供します。

---

## 1. プラン構成（確定）

### 4 階層プラン

| プラン名 | 位置づけ | 月額（JPY） | 年額（JPY） | 対象 |
|---------|---------|-----------|-----------|------|
| **PRELUDE** | 前奏曲・始まり | ¥780 | ¥7,800 | 音大生・音楽学習者・プロ志向個人の入口 |
| **CONCERTO** | 協奏曲・独奏と伴奏の対話 | ¥1,480 | ¥14,800 | プロ志向個人の標準。楽器奏者・作曲家・アレンジャー |
| **SYMPHONY** | 交響曲・全楽器の融合 | ¥2,480 | ¥24,800 | ヘビーユーザー、スタジオ個人事業主、兼業音楽家 |
| **OPUS** | 作品集・全てを包括 | ¥5,980 | ¥59,800 | 教室・スタジオ・研究機関・本業連続利用 |

### 命名哲学

- 世界中の音楽家が即座に理解する楽曲形式用語
- 階層が直感的（前奏曲 < 協奏曲 < 交響曲 < 作品集）
- **Kuon でしか使えない固有名詞** → SEO・GEO で独占を狙える
- 競合（Moises、LALAL.AI 等）の Starter/Pro 的命名との明確な差別化

### Free プラン（無料会員）

- ブラウザ完結系全 19 アプリ：**無制限**（§29 課金戦略準拠）
- サーバー処理系：初月無制限 → 月 3 回
- KUON PLAYER：月 10 回、24 時間保持
- 成長ダッシュボード：直近 30 日のみ

---

## 2. 価格表（8 通貨圏）

### PPP 調整済み月額

| 通貨圏 | PRELUDE | CONCERTO | SYMPHONY | OPUS |
|-------|---------|----------|----------|------|
| JPY（日本） | ¥780 | ¥1,480 | ¥2,480 | ¥5,980 |
| USD（米・カナダ・アルゼンチン他） | $7.99 | $14.99 | $24.99 | $59.99 |
| EUR（EU 全域） | €7.49 | €13.99 | €22.99 | €54.99 |
| GBP（英国） | £6.49 | £11.99 | £19.99 | £49.99 |
| CAD（カナダ優先） | $9.99 | $18.99 | $31.99 | $79.99 |
| AUD（豪州） | $10.99 | $20.99 | $34.99 | $84.99 |
| CHF（スイス） | 8.99 | 16.99 | 27.99 | 64.99 |
| LatAm USD（Mexico/Chile/Colombia/Peru/Uruguay） | $3.99 | $7.99 | $12.99 | — |

### 年額価格（月額 × 10 = 2 ヶ月分ボーナス）

| 通貨圏 | PRELUDE | CONCERTO | SYMPHONY | OPUS |
|-------|---------|----------|----------|------|
| JPY | ¥7,800 | ¥14,800 | ¥24,800 | ¥59,800 |
| USD | $79.99 | $149.99 | $249.99 | $599.99 |
| EUR | €74.99 | €139.99 | €229.99 | €549.99 |
| GBP | £64.99 | £119.99 | £199.99 | £499.99 |
| CAD | $99.99 | $189.99 | $319.99 | $799.99 |
| AUD | $109.99 | $209.99 | $349.99 | $849.99 |
| CHF | 89.99 | 169.99 | 279.99 | 649.99 |
| LatAm USD | $39.99 | $79.99 | $129.99 | — |

### 地域判定ルール

- **Billing Country**（決済時の請求先住所）で通貨決定
- **アルゼンチン**：US 価格（USD $7.99/$14.99/$24.99）を適用。オーナーのネットワーク経由で Tier A 提携割引クーポン配布
- **Mexico / Chile / Colombia / Peru / Uruguay**：LatAm USD 価格適用
- **OPUS プランは LatAm 対象外**（B2B/Enterprise 層のため PPP 調整対象外）
- VPN・IP スプーフィング対策：Stripe Radar で Billing Country と IP 国の不一致を検知

### 通貨戦略の根拠

- **JPY**：本拠地市場、基準通貨
- **USD**：グローバル基軸。アルゼンチンを含む英語圏全般
- **EUR**：EU 全 27 カ国、Portugal 含む（音大生は PPP 代表ではないため域内一律）
- **GBP**：英国音楽教育聖地（Royal Academy、RCM、Guildhall 等）、Brexit 後の GBP 表記が信頼のシグナル
- **CAD**：Royal Conservatory of Toronto、McGill Schulich School 他、英語圏第 2 市場
- **AUD**：Sydney Conservatorium、Melbourne Conservatorium、オセアニア音楽教育中心地
- **CHF**：Zürcher Hochschule der Künste、Haute école de musique de Genève、高 PPP プレミアム市場
- **LatAm USD**：Spanish-speaking Latin America（Argentina 除く）、Pro PPP 50% ディスカウント

### 除外通貨

- **BRL**（ブラジル）：チャージバック率 1.5-3%、Pix/Boleto 設定負荷、代替として LatAm USD でカバー可能
- **KRW**：Stripe 韓国サポート限定的、LemonSqueezy 経由の方が効率的
- **CNY**：Alipay/WeChat Pay の別系統、参入慎重に
- **INR**：価格感覚が極端に異なる、専用戦略が必要（後日検討）

---

## 3. クォータ設計（サーバー処理系）

| アプリ | Free | PRELUDE | CONCERTO | SYMPHONY | OPUS |
|-------|------|---------|----------|----------|------|
| KUON SEPARATOR（音源分離） | 月 3 回 | 月 20 回 | 月 150 回 | 月 250 回 | 月 800 回 |
| KUON TRANSCRIBER（音源→楽譜） | 月 3 回 | 月 20 回 | 月 100 回 | 月 200 回 | 月 600 回 |
| KUON INTONATION（ピッチ分析） | 月 3 回 | 月 30 回 | 使い放題 | 使い放題 | 使い放題 |
| KUON LESSON RECORDER | — | 月 3 時間 | 月 20 時間 | 月 40 時間 | 月 150 時間 |
| KUON SCORE FOLLOWER | — | — | 使い放題 | 使い放題 | 使い放題 |
| KUON CHORD ANALYZER | — | — | 使い放題 | 使い放題 | 使い放題 |
| KUON PERFORMANCE COMPARATOR | — | — | 月 50 回 | 月 150 回 | 月 500 回 |
| 6-stem 分離（上位版） | — | — | — | 有効 | 有効 |
| 成長ダッシュボード履歴 | 30 日 | 全期間 | 全期間 + 優先処理 | 全期間 + 優先 + 先行機能 | 全期間 + 全機能 + サポート |
| イベント投稿 | — | — | 無制限 | 無制限 | 無制限 |
| ギャラリー優先掲載 | — | — | 有効 | 有効 | 有効 |
| 月 1 回クリニック | — | — | 1 枠 | 2 枠（ゲスト招待可） | 全回参加可 |

### ブラウザ完結系（19 アプリ）

NORMALIZE、DECLIPPER、MASTER CHECK、DSD CONVERTER、RESAMPLER、NOISE REDUCTION、DUAL MONO、PIANO DECLIPPER、KUON PLAYER、CONVERTER、ANALYZER、DDP CHECKER、EAR TRAINING、METRONOME、CHORD QUIZ、TRANSPOSER、SLOWDOWN、SIGHT READING、MASTER CHECK 等：

- **全プラン・全ユーザー無制限**（Free 含む）
- コストゼロのものに使用制限をかけない（§29 絶対原則）
- 登録ナッジは「設定保存・処理履歴・成長記録」の付加価値訴求のみ

### クォータ到達 UX

1. 使用量 80% 到達：ダッシュボードで「今月あと N 回」警告（橙色）
2. 100% 到達時のモーダル：
   - 来月まで待つ（Free 会員はこれのみ）
   - プランをアップグレード（Customer Portal へ）
   - 追加クレジットパック購入（将来実装：¥980 で +50 回）
3. **処理を途中で中断しない**（体験を破壊しない UX 設計）

---

## 4. 提携制度（2 Tier 構造 — 手動運用）

### Tier A：Manual Partnership（オーナー手動運用）

**適用対象：**
- 音大・音楽大学（国内：東京藝大、武蔵野音大、桐朋学園、国立音大、京都市芸、愛知県芸 等）
- 海外音大（Royal Academy UK、Conservatorio de Buenos Aires、Hochschule Leipzig 他）
- **個人音楽教室**（オーナーの個人ネットワーク経由で提携）
- **個人レッスン講師**（音楽家コミュニティの知人経由）

**割引内容：**
- 初年度 50% OFF（PRELUDE ¥390、CONCERTO ¥740、SYMPHONY ¥1,240）
- 2 年目以降 25% OFF（PRELUDE ¥580、CONCERTO ¥1,110、SYMPHONY ¥1,860）
- 年次更新（提携先で在籍・レッスン継続確認）

**運用プロセス：**
1. オーナーが提携先と直接交渉（MoU または口頭合意）
2. Stripe で提携先ごとに固有 Promotion Code 発行（例：`TOKYOGEIDAI-2026`、`KOTARO-HATTORI-ACADEMY-2026`）
3. 提携先が学生・生徒にコードを配布
4. 学生がサインアップ時にコード入力 → 自動割引
5. 翌年度に新コード発行、旧コードは失効

**MoU（または口頭合意）に含める内容：**
- 音大/教室側：コード配布権、在籍者リスト（メアドのみ、半期更新）
- Kuon 側：50% 初年度割引、**朝比奈によるオンラインマスタークラス（年 1 回・提携先特典）**、パートナーロゴ使用許諾、授業内ツール使用ライセンス
- 相互：双方 Web サイトに提携表示
- 期間：2 年更新、無償（金銭取引なし）

**提携先にとってのメリット（営業文句の核心）：**
- **コストゼロの学生福利厚生**
- 授業内で Kuon ツールを教材として使える
- 卒業生が Concerto/Symphony へ進めば、提携先名が「**プロを輩出した機関**」として Kuon サイトに掲載される → 受験生・生徒獲得の間接効果
- 朝比奈のマスタークラスが提携先の授業補完になる

### Tier C：Graduate Bridge（自動適用）

**対象：** Tier A を 1 年以上利用して卒業または脱会したユーザー

**割引内容：** 卒業後 6 ヶ月間、25% OFF

**自動適用フロー：**
1. Tier A コードが失効したタイミングを Auth Worker が検知
2. 自動で 6 ヶ月有効の `GRADUATE_BRIDGE_2026Q2` 相当のクーポンを適用
3. 6 ヶ月経過で通常価格へ自動復帰
4. 通常価格復帰時に「Welcome to full Kuon — 特典のお知らせ」メール送信

**戦略的意義：**
卒業直後の収入不安定期（通常 70% が解約するタイミング）を緩衝。4 年間のユーザーをプロ層へソフトランディング。このコホートが将来の Concerto/Symphony の中核。

### Tier B は廃止

当初検討した「アカデミックドメインメール認証による自動 25% 割引」は**採用しない**。すべての教育機関割引はオーナー手動運用（Tier A）に統一。

理由：
- 不正利用リスク（詐称メール）のゼロ化
- オーナーの営業活動を割引と直結させることでネットワーク効果を最大化
- 「朝比奈と提携している教室」というブランディングが効く

---

## 5. 課金装置（採用 5 つ）

### ① 14 日間無料トライアル

**全プラン（PRELUDE / CONCERTO / SYMPHONY）に適用。OPUS は対象外（B2B 個別交渉）。**

- サインアップ時にカード登録必須
- 14 日目 23:59 までいつでもキャンセル可、課金なし
- Day 10：残 4 日リマインダー
- Day 13：翌日課金最終確認
- Day 15 00:00：自動課金開始
- 期待コンバージョン率：55-70%（業界中央値）

### ② 年額プラン（2 ヶ月ボーナス月）

月額 × 10 ヶ月分の価格で 12 ヶ月利用可能。実質 16.67% 相当の価値向上。
これは「割引」ではなく「**長期利用者への期間延長ボーナス**」としてフレーミング。

### ③ Founding Member 制度

**最初の 500 名の有料会員に限り、契約時の価格を永久ロック。**

- PRELUDE 契約者：¥780 永久固定
- CONCERTO 契約者：¥1,480 永久固定
- SYMPHONY 契約者：¥2,480 永久固定
- 解約すると権利失効、復帰時は通常価格
- バッジ表示：マイページ + コミュニティで「Founding Member #042」等表示

**位置づけ：** 割引ではなく「**初期支援者への感謝の特権**」。
将来の値上げ（¥980/¥1,780/¥2,980 等）時にも固定価格が維持される。

### ④ リファラルプログラム

**発動条件：** 紹介された新規ユーザーが有料プラン（PRELUDE 以上）に 30 日以上継続

**報酬：** 紹介者に対して次月のサブスク 1 ヶ月無料（Stripe Coupon 一回適用）

**上限：** 年 3 ヶ月まで

**流れ：**
1. マイページで固有リファラル URL 生成（例：`kuon-rnd.com/?ref=KOTARO123`）
2. 紹介先がアクセス時、クッキー/localStorage で ref 保存
3. Checkout 作成時に `metadata.referredBy` 付与
4. 30 日継続を Webhook で検知 → 紹介者の次月請求に Coupon 適用

### ⑤ サブスク一時停止機能

Customer Portal 経由で最大 3 ヶ月まで停止可能。停止期間中は課金停止、再開時に自動復帰。

**想定ユースケース：**
- 海外留学中
- 試験期間中の集中
- 学期間の休暇
- 産休育休

**戦略的意義：** 「完全退会」ではなく「一時停止」という選択肢を提供することで、年間解約率を 30-40% 低減可能（SaaS 業界データ）。

### 採用しなかった装置

- **初月 ¥100 フック**：¥100 → 通常価格の「5 倍ショック」で月 2 解約率 50% 超え → 14 日トライアルに切り替え
- **マイク × サブスクバンドル**：マイク販売は聖域、混ぜない
- **ブラックフライデー等の季節セール**：値引き禁止方針（§6 参照）
- **Day 0-30 オンボーディングメール自動化**：後日実装可能

---

## 6. 値引き禁止方針（ブランド保護）

### 絶対にやらないこと

- ブラックフライデー「30% OFF」
- 季節セール・アニバーサリーセール
- 「今だけ」「期間限定値下げ」
- 公開型の紹介割引（例：「友達紹介で 20% OFF」）

### 構造的ダメージ（回避する理由）

- 価格アンカーの破壊（一度 ¥1,000 で売ったものは ¥1,480 に戻せない）
- 「待てば安くなる」学習による定価購入者の怒り
- ブランド格の下落（Hermès・Apple・Rolex モデルから逸脱）
- LTV（生涯価値）の構造的低下

### 代替として行うこと（実質的価値提供）

- 14 日無料トライアル（体験提供）
- 年額プラン 2 ヶ月ボーナス（期間延長）
- Founding Member 価格固定（特権）
- Tier A 提携割引（プログラム、価格差別ではない）
- バンドル（Concerto + マスタークラスアクセス）
- アーリーアクセス（Symphony 会員は新機能 30 日先行）

### 核心戦略：Apple モデル

**「価格は動かさない、価値を上げる」**

毎年、同じ ¥780 PRELUDE に新アプリを追加。3 年後に同じ値段で 3 倍の機能を提供。既存顧客は「どんどん良くなる」と感じる。これが IQ180 の値引き禁止戦略。

- 2026 年 PRELUDE：KUON PLAYER + 学習アプリ 5 種
- 2027 年 PRELUDE：同 ¥780 + KUON INTONATION ANALYZER 追加
- 2028 年 PRELUDE：さらに KUON TRANSCRIBER ベータ追加

---

## 7. 税務（Stripe Tax 採用）

### Day 1 から Stripe Tax 有効化

**コスト：** 取引の 0.5%（¥50/件上限）。¥780 Prelude で ¥3.90/件。

**Stripe Tax がやる：**
- 顧客地域から税率自動判定
- Checkout で税込自動表示
- 税内訳付きインボイス発行
- 管轄区域別レポート

**ユーザー責任（Stripe Tax がやらない）：**
- EU OSS 登録、UK VAT 登録等（しきい値超過時）
- 四半期・年次申告
- 税金の実際の納付

### 税務登録しきい値（登録不要ライン）

| 地域 | しきい値 | 超過時の対応 |
|------|---------|------------|
| EU | 年間 €10,000 以下 | OSS 登録不要（超過時は一括登録） |
| UK | 年間 £85,000 以下 | VAT 登録不要 |
| 日本 | 年間 ¥10M 以下 | 課税事業者にならない |
| US | 州ごとに異なる | Stripe Tax が州ごと判定 |

**運用：**
- ローンチから 1 年目は Stripe Tax 単体で問題なし
- しきい値超過通知が Stripe から届いたら税理士契約（月顧問料 ¥30-50K）

---

## 8. SEO / GEO 戦略

### SEO（検索エンジン最適化）

**プラン名の SEO 独占：**
- "Kuon Prelude"、"Kuon Concerto"、"Kuon Symphony"、"Kuon Opus" は**固有名詞**
- Moises や LALAL.AI の "Starter Plan" 等の一般名と差別化
- 検索クエリで競合ゼロ → Google 検索 1 位を最短で獲得可能

**推奨施策：**
1. `/plans/prelude`、`/plans/concerto`、`/plans/symphony`、`/plans/opus` の各プラン専用ページ作成
2. JSON-LD Product schema を各ページに埋め込む（price / availability / audience / offers）
3. 各プランの「何ができる / 誰向け / 料金」を独立ページ化
4. 多言語対応（ja/en/es/pt/ko）でそれぞれの SEO を個別に最適化

### GEO（Generative Engine Optimization）— AI 検索時代の新戦略

**GEO とは：** ChatGPT、Perplexity、Claude、Gemini 等の AI 検索で引用されやすい構造。従来の SEO の上位概念。

**GEO 最適化の 7 原則：**

1. **エンティティの明確化**
   - 「Kuon Prelude とは何か」を 100 文字以内で要約した独立セクションを用意
   - 例：「Kuon Prelude は、空音開発が音楽学習者向けに提供する月額 ¥780 のサブスクリプションプラン。ブラウザ完結 19 アプリが無制限利用可能」
   - AI が引用時にそのまま使える定義形式

2. **構造化データ（JSON-LD）**
   - Product、Offer、Organization、FAQPage の Schema.org タイプを各ページに埋め込む
   - AI は構造化データを優先的にパース

3. **Q&A 形式コンテンツ**
   - 「Kuon Prelude と Concerto の違いは？」「14 日トライアルはどう使う？」等のよくある質問
   - FAQPage schema 使用

4. **外部参照の引用**
   - 権威ある情報源（OSS ライセンス、音大公式サイト、技術標準）へのリンク
   - AI は「信頼できる情報源を引用している記事」を優先

5. **比較表**
   - 「Kuon vs Moises vs LALAL.AI」等の客観的比較
   - AI は比較表を好んで引用（ユーザー意思決定を支援しやすい）

6. **多言語対応**
   - 英語・日本語・スペイン語・ポルトガル語・韓国語で同等のコンテンツ
   - AI の多言語検索に対応

7. **更新頻度**
   - 価格・機能変更時に `<meta>` の `article:modified_time` を更新
   - AI は新鮮な情報を優先

**優先実装ページ：**
- `/plans`（全プラン一覧）：Q&A + 比較表 + JSON-LD
- `/plans/prelude`、`/plans/concerto`、`/plans/symphony`、`/plans/opus`：各プランの Entity ページ
- `/about/subscription`：サブスクリプション全体の哲学・Founding Member・14 日トライアル説明
- `/compare`：Kuon vs 競合の客観的比較ページ
- `/faq/subscription`：FAQ集（FAQPage schema）

---

## 9. 顧客層ポジショニング（炎上リスク分析）

### Kuon の顧客は Netflix/Spotify とは根本的に違う

| 軸 | Netflix/Spotify 層 | Kuon 層 |
|---|-------------------|---------|
| 目的 | 暇つぶし・消費 | 上達・投資 |
| 価格感覚 | 月 ¥1,000 は「娯楽費」 | 月 ¥2,480 は「良い弦 1 セットと同じ」 |
| SNS 行動 | 不満を即拡散 | 同業者と直接対話 |
| ロイヤリティ | 短期・切り替え容易 | 長期・良いツールは 10 年使う |
| 年齢層 | 全年齢（若年層多め） | 音大生 18-22 歳 + プロ 25-50 代 |

### Stradivari 心理

プロ音楽家は「ツール = 人生の質を変える投資」を経験的に知っている。¥2,480 の SYMPHONY は「良い弦 1 セット買うのと同じ感覚」。

よって **Netflix/Spotify のような炎上は構造的に起きにくい**。

### 残る 20-30% のリスク（管理可能）

- **リスク 1：TikTok 世代の音大生** → 対策：製品本質で勝負、批判が出ても内容で対話
- **リスク 2：地域格差認識** → 対策：「Regional Access Pricing」等の用語は絶対使わず「Local Market Pricing」として粛々と実装
- **リスク 3：同業者比較炎上（Moises $4 等）** → 対策：Kuon の独自性（日本発、職人気質、世界観、音楽ネイティブ命名）で棲み分け

### ブランドメッセージング

- **「プロを目指す個人のためのプラットフォーム」**（§37.7 沈黙の勝利戦略）
- 音大不要論は一切語らない
- 事実の積み上げで市場に判断させる
- Moises を批判しない、Kuon の世界観を語る

---

## 10. リスク管理

### 通貨 Arbitrage（VPN 裁定取引）

**リスク：** LatAm USD $3.99 と USD $7.99 の 2 倍差で、北米ユーザーが VPN 経由で LatAm 価格を購入

**対策：**
- Stripe Radar ルール：Billing country ≠ IP country をブロック
- カード発行国と課金通貨の一致必須化
- 違反検出時は自動ダウングレード、不正利用で BAN

### FX エクスポージャー

**リスク：** 収益 40% が非 JPY 建て、Cloud Run コストは USD。為替下落で利益圧迫

**対策：**
- Wise / Payoneer で USD/EUR 口座保有
- Cloud Run 支払いを USD 収益から直接（為替往復回避）
- 通貨別価格は年 1 回見直し

### チャージバック

**リスク：** Stripe CB 率 1% 超えでアカウント凍結

**対策：**
- BRL 除外（CB 率 1.5-3% 回避）
- LatAm は USD 建てのみ（国際 VISA/MasterCard 経由、CB 率 0.5%）
- 3D Secure 強制有効化

### サポート負荷

**リスク：** 8 通貨 = 多言語サポート圧迫

**対策：**
- FAQ 多言語（ja/en/es/pt/ko）完備
- Intercom or Crisp で言語自動判定（月 $39〜）
- 初期 6 ヶ月は「英語で対応」を明記

---

## 11. 次セッションのアクションリスト

### Stripe Dashboard 作業（オーナー実行、ガイドは `stripe-setup-guide-v2.md` で提供）

**Products 作成（4 個）：**
- Kuon Prelude（`plan_tier: prelude`）
- Kuon Concerto（`plan_tier: concerto`）
- Kuon Symphony（`plan_tier: symphony`）
- Kuon Opus（`plan_tier: opus`）

**Prices 作成（62 個）：**
- Prelude：月額 8 通貨 + 年額 8 通貨 = 16 Prices（LatAm USD 含む）
- Concerto：同上 16 Prices
- Symphony：同上 16 Prices
- Opus：月額 7 通貨 + 年額 7 通貨 = 14 Prices（LatAm USD 除外）

**Coupons（Promotion Codes）運用：**
- Tier A 提携先ごとに個別発行（例：`TOKYOGEIDAI-2026`、50% 初年度）
- Tier C Graduate Bridge：自動発行（Auth Worker が生成）
- リファラル：動的発行

**Customer Portal 設定：**
- 全プラン間アップグレード/ダウングレード可
- キャンセル（期末）
- 一時停止（最大 3 ヶ月）
- 支払い方法更新

**Webhook：**
- 新 URL `https://kuon-rnd.com/api/auth/stripe/webhook`
- 既存マイク Webhook `/api/webhook` は**絶対に触らない**
- イベント：subscription.created/updated/deleted、invoice.paid/payment_failed

**Restricted Key：**
- Auth Worker 専用キー新規発行（マイク用キーとは別）

**Stripe Tax：**
- Day 1 有効化
- US 州、EU 全域、UK、日本、スイス、オーストラリア、カナダ、ニュージーランド対応

### 画像生成（nano-banana-pro）

- `plan-prelude.jpg`（月 + 音叉 3 つ）
- `plan-concerto.jpg`（月 + 倍音球 5 つ）
- `plan-symphony.jpg`（月 3 + 無限トーラス）
- `plan-opus.jpg`（作品集イメージ：複数の鍵盤 + 譜面 + 漆塗りの重箱 or 古典書物の集積）

プロンプトは `stripe-student-setup-guide.md` の § 1 に記載済み。OPUS 用プロンプトは次セッションで作成。

### Auth Worker 実装（次セッション）

- `/api/auth/stripe/checkout`（通貨判定 + Price ID マッピング + 14 日トライアル付与）
- `/api/auth/stripe/portal`
- `/api/auth/stripe/webhook`
- `/api/auth/usage/check` `/increment` `/me`
- `/api/auth/referral/generate` `/me`
- `/api/auth/pause` `/resume`

### マイページ GUI 実装（次セッション）

- プラン状態カード（現プラン、次回請求日、アップグレード/ダウングレード/一時停止/解約ボタン）
- 使用状況ダッシュボード（棒グラフ、進捗バー、80% 警告、100% 赤）
- 利用可能アプリ一覧（上位プラン機能はグレーアウト + アップグレード CTA）
- リファラルカード（固有 URL、QR コード、紹介履歴、獲得無料月数）
- Founding Member バッジ（該当者のみ表示）

### LP 刷新

- `/plans`（全プラン一覧）を GEO 対応で全面作成
- 各プラン専用ページ（`/plans/prelude`、`/plans/concerto`、`/plans/symphony`、`/plans/opus`）
- `/compare`（Moises・LALAL.AI 等との比較）
- `/faq/subscription`（FAQ、FAQPage schema 付き）
- フロント LP（`/`）の PRICING セクションを PRELUDE/CONCERTO/SYMPHONY 表記に更新

### 聖域遵守チェック

- マイク購入 Stripe Product / Price / Webhook：**一切触らない**
- 既存 API ルート（`/api/checkout`、`/api/checkout-international`、`/api/webhook`）：**開かない**
- 新規はすべて `/api/auth/stripe/*` の名前空間に分離
- Stripe 側は `plan_tier` メタデータで区別

---

## 12. 決定済み事項のサマリー（Yes/No チェックリスト）

- ✅ 価格表：PPP 調整版（8 通貨圏 + LatAm USD）
- ✅ 通貨追加：CAD、AUD、CHF 採用、BRL 除外
- ✅ アルゼンチン：US 価格適用、Tier A 提携クーポンで個別対応
- ✅ プラン名：PRELUDE / CONCERTO / SYMPHONY / OPUS
- ✅ 提携音大制度：Tier A（手動運用）+ Tier C（Graduate Bridge 自動）
- ✅ Tier B（アカデミックドメイン自動認証）は採用しない
- ✅ Stripe Tax：Day 1 有効化
- ✅ 14 日無料トライアル採用、¥100 初月フック廃止
- ✅ 値引き禁止方針採用（ブラックフライデーなし、Apple モデル）
- ✅ Founding Member：最初の 500 名、永久価格固定
- ✅ リファラル：紹介者 1 ヶ月無料、年 3 ヶ月上限
- ✅ サブスク一時停止：最大 3 ヶ月
- ✅ SEO + GEO 両方に対応
- ✅ マイク購入フロー聖域遵守

---

## 13. 継続して議論が必要な事項（未確定）

1. **Founding Member の「500 名」の数字**：500 名でよいか、1,000 名か、300 名か
2. **OPUS プランの用途詳細**：音楽教室・スタジオ・研究機関のうち、どこを主軸にするか
3. **Tier A 提携先の初期リスト**：最初に接触する 3-5 校/教室をどこにするか
4. **画像生成（OPUS プラン）**：作品集のビジュアル哲学
5. **比較ページ `/compare`**：どの競合と比較するか、フェアな基準をどう設定するか
6. **マルチ言語サポート体制**：ja/en は確実、es/pt/ko の優先順位
7. **Customer Portal のローカライズ**：Stripe が自動翻訳するが、精度チェックが必要

これらは Stripe Dashboard 設定と並行して、次セッションで逐次決めていきます。

---

## 改訂履歴

- 2026-04-24 初版：§37 戦略ピボット後の全面設計
- 2026-04-24 改訂：PPP 調整、プラン命名、提携制度を確定
