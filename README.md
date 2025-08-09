# 🔮 おつきさま診断 - LINE恋愛相性診断ボット

LINEのトーク履歴を分析して、恋愛相性を診断するAI搭載LINEボットです。  
無料版の簡易診断と、有料版のプレミアムレポート（PDF形式・約50ページ）を提供します。

## ✨ 主な機能

### 無料機能
- 📊 トーク履歴の自動分析
- 💕 5つの相性カテゴリー評価（時間・バランス・テンポ・会話タイプ・言葉）
- 🐲 干支男子タイプ診断（12タイプ）
- 📈 ビジュアルなレーダーチャート表示
- 💡 改善アドバイスの提供

### プレミアム機能（¥1,980）
- 📚 50ページの詳細PDFレポート
- 🎯 20項目以上の詳細相性分析
- 🤖 AIによる深い洞察と心理分析
- 📅 月別恋愛運勢カレンダー（12ヶ月分）
- 💪 40個のパーソナライズドアクション
- ⚠️ 危険信号とその対策
- 💘 告白成功の最適戦略
- 🗺️ 長期的な関係構築ロードマップ

## 🏗️ システム構成

### 技術スタック
- **Backend**: Node.js + Express
- **LINE Integration**: LINE Bot SDK
- **AI**: OpenAI GPT-4（オプション）
- **Payment**: Stripe
- **Database**: Supabase（PostgreSQL）
- **Hosting**: Vercel（Serverless Functions）
- **PDF Generation**: HTML to PDF
- **Charts**: Chart.js

### プロジェクト構造
```
line-love-edu/
├── api/                           # Vercel Functions
│   ├── main.js                   # メインWebhookエンドポイント
│   ├── stripe-webhook-simple.js  # Stripe決済通知処理
│   ├── generate-report-chunked.js # チャンク処理でレポート生成（5ステップ分割）
│   ├── process-report-loop.js   # レポート生成の自動ループ処理
│   ├── view-report.js            # レポート表示
│   ├── process-queue.js          # キュー処理（手動実行用）
│   └── payment-success/cancel.js # 決済成功/キャンセル
├── core/                          # コアロジック
│   ├── ai-analyzer/              # AI分析エンジン
│   │   ├── advanced-ai.js        # 高度なAI分析
│   │   └── conversation-peaks.js # 会話ピーク分析
│   ├── database/                 # データベース層
│   │   ├── orders-db.js          # 注文管理
│   │   └── supabase.js           # Supabase接続
│   ├── fortune-engine/           # 運勢エンジン
│   │   └── index.js              # メイン分析ロジック
│   ├── premium/                  # プレミアム機能
│   │   ├── payment-handler.js    # 決済処理
│   │   ├── report-generator.js   # レポート生成
│   │   └── pdf-generator.js      # PDF生成
│   ├── metrics/                  # 分析メトリクス
│   │   ├── parser.js             # トーク履歴パーサー
│   │   ├── compatibility.js      # 相性計算
│   │   └── zodiac.js             # 干支タイプ診断
│   └── user-profile.js          # ユーザープロフィール管理
├── migrations/                    # データベースマイグレーション
├── vercel.json                   # Vercel設定
└── package.json                  # プロジェクト設定
```

## 🚀 セットアップ

### 1. 環境変数の設定

`.env`ファイルを作成：

```env
# LINE Bot設定
CHANNEL_SECRET=your_line_channel_secret
CHANNEL_ACCESS_TOKEN=your_line_channel_access_token

# アプリケーション設定
BASE_URL=https://your-domain.vercel.app
NODE_ENV=production

# Stripe設定（プレミアム機能用）
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Supabase設定（オプション）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

# OpenAI設定（オプション）
OPENAI_API_KEY=your_openai_api_key

# ファイルストレージ強制（Supabase未使用時）
FORCE_FILE_STORAGE=false
```

### 2. データベースセットアップ（Supabase使用時）

SQL Editorで実行：

```sql
-- ordersテーブル作成
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER DEFAULT 1980,
  status TEXT DEFAULT 'pending',
  stripe_session_id TEXT,
  paid_at TIMESTAMP,
  report_url TEXT,
  pdf_data TEXT,
  report_progress JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_report_progress ON orders((report_progress IS NOT NULL));
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. ローカル開発

```bash
# 開発サーバー起動
npm run dev

# ngrokでトンネリング
ngrok http 3000

# LINE DevelopersでWebhook URLを設定
# https://your-ngrok-id.ngrok.io/webhook
```

### 5. Vercelへのデプロイ

```bash
# Vercel CLIでデプロイ
vercel

# 環境変数をVercelダッシュボードで設定
# Settings > Environment Variables
```

## 📋 処理フロー

### 無料診断フロー
1. ユーザーがトーク履歴をアップロード
2. テキスト解析でメッセージを抽出
3. 5つの指標で相性スコアを計算
4. 干支タイプを判定
5. カルーセル形式で結果を返信

### プレミアムレポートフロー
1. ユーザーが「プレミアムレポート」を要求
2. Stripe決済ページにリダイレクト
3. 決済完了通知（Webhook）を受信
4. **チャンク処理でレポート生成**（NEW）
   - Step 1: データ取得（5秒）
   - Step 2: 基本分析（15秒）
   - Step 3: AI分析（20秒）
   - Step 4: PDF生成（10秒）
   - Step 5: 保存・通知（5秒）
5. 45秒で一時停止→5秒後に自動再開
6. 完成したらユーザーに通知

## 🔧 タイムアウト対策（Vercel 60秒制限）

### チャンク処理システム
- **45秒で自動停止**: 安全マージンを持って処理を中断
- **進捗を保存**: データベースまたはファイルに中間データを保存
- **自動再開**: 5秒後に自分自身を呼び出して続きから処理
- **最大10回リトライ**: 障害に強い設計

### ログで確認できる状態
```
🆕 Starting new report generation   - 新規生成開始
♻️ Resuming from step 3             - ステップ3から再開
⏸️ Pausing before step 4            - ステップ4前で一時停止
🔄 Auto-continuing from step 4      - 自動継続
✅ Step 3 took 18523ms              - 各ステップの処理時間
🎉 Report generation completed!     - 完了
```

## 📊 監視とデバッグ

### Vercelダッシュボード
- Functions > Logsでリアルタイムログ確認
- 各関数の実行時間とエラーを監視

### エラーハンドリング
- タイムアウト時は自動でチャンク処理に切り替え
- エラー時は進捗を保持して再実行可能
- 最悪の場合は手動で`/api/process-queue`を実行

## 🐛 トラブルシューティング

### レポート生成が止まる場合
1. Vercel Logsで状態確認
2. データベースの`report_progress`を確認
3. 手動で再実行：
```bash
curl -X POST https://your-app.vercel.app/api/generate-report-chunked \
  -H "Content-Type: application/json" \
  -d '{"orderId": "ORDER_ID"}'
```

### Stripe Webhookが失敗する場合
1. Webhook署名の確認
2. エンドポイントURLの確認
3. Stripeダッシュボードでイベントログ確認

### PDFが表示されない場合
1. `pdf_data`カラムにデータがあるか確認
2. Content-Typeが正しく設定されているか確認
3. HTMLとPDFの判定ロジックを確認

## 🔒 セキュリティ

- トーク履歴は処理後即座に破棄
- 個人情報は最小限のみ保存（userIdのみ）
- Stripe Webhook署名で検証
- 環境変数で機密情報を管理

## 📝 注意事項

- Vercel Hobbyプランは60秒タイムアウト
- Supabase無料枠は500MB
- OpenAI APIは従量課金
- PDFはHTMLとして生成（実際のPDF変換は重いため）

## 🤝 コントリビューション

イシューやプルリクエストは歓迎です！

## 📄 ライセンス

ISC

## 📞 サポート

問題が発生した場合は、GitHubのIssuesでお知らせください。