# 🔧 トラブルシューティングガイド

## よくある問題と解決方法

### 🤖 LINE Bot関連

#### Bot が応答しない
```bash
# 1. Webhook URLを確認
curl https://your-app.vercel.app/webhook

# 2. LINE Developersコンソールで確認
# - Webhook URLが正しいか
# - Webhook利用がONか
# - チャネルアクセストークンが有効か

# 3. Vercelログを確認
vercel logs --since 10m
```

**解決策:**
- Webhook URLの末尾に`/webhook`を追加
- チャネルシークレット/トークンを再発行
- Vercelに環境変数を設定

#### 「Invalid signature」エラー
```javascript
// 署名検証に失敗
Error: LINE signature validation failed
```

**解決策:**
```bash
# 環境変数を確認
echo $CHANNEL_SECRET

# Vercelで設定
vercel env add CHANNEL_SECRET
```

### 💳 Stripe決済関連

#### Webhookが受信されない
```bash
# 1. エンドポイントを確認
curl -X POST https://your-app.vercel.app/api/stripe-webhook-simple

# 2. Stripeダッシュボードで確認
# Developers > Webhooks > 該当のエンドポイント
# - StatusがEnabledか
# - Recent attemptsでエラーがないか
```

**解決策:**
- エンドポイントURLを`/api/stripe-webhook-simple`に設定
- Webhook署名シークレットを更新
- `checkout.session.completed`イベントを選択

#### 「No signatures found」エラー
```javascript
// Webhook署名検証に失敗
Error: No signatures found matching the expected signature
```

**解決策:**
```javascript
// rawBodyを正しく取得
const getRawBody = require('raw-body');
const rawBody = await getRawBody(req);
```

### 📊 レポート生成関連

#### 「pdfBufferが既に宣言されています」エラー
```javascript
SyntaxError: Identifier 'pdfBuffer' has already been declared
```

**原因:**
- Step 4とStep 5で同じ変数名を使用
- スコープが同じため重複エラー

**解決策:**
```javascript
// Step 4で別の変数名を使用
const generatedPdfBuffer = await pdfGenerator.generatePDF(reportData);
progress.data.pdfBuffer = generatedPdfBuffer.toString('base64');

// Step 5ではpdfBufferを使用可能
let pdfBuffer = progress.data.pdfBuffer;
```

#### レポート生成がタイムアウトする
```
⏱️ Execution time: 50001ms
⚠️ Timeout - continuing in background
```

**正常な動作:**
- これは正常な動作です
- チャンク処理で自動継続されます
- 3秒後に自動的に次の処理が開始されます
- 完了後にユーザーに通知されます

**確認方法:**
```sql
-- Supabaseで進捗確認
SELECT id, status, report_progress->>'currentStep' as step
FROM orders
WHERE user_id = 'USER_ID'
ORDER BY created_at DESC;
```

#### レポート生成が止まる
```bash
# 1. ログを確認
vercel logs --since 30m | grep "ORDER_ID"

# 2. 手動で再実行
curl -X POST https://your-app.vercel.app/api/generate-report-chunked \
  -H "Content-Type: application/json" \
  -d '{"orderId": "ORDER_ID"}'
```

**解決策:**
- 進捗データをクリアして再実行
- `process-queue`を手動実行

#### PDFが表示されない
```
Error: Cannot read PDF data
```

**確認事項:**
```sql
-- PDFデータの存在確認
SELECT id, 
       length(pdf_data) as pdf_size,
       left(pdf_data, 100) as pdf_preview
FROM orders
WHERE id = 'ORDER_ID';
```

**解決策:**
- HTMLとして表示される場合は正常（PDF風HTML）
- Base64エンコーディングを確認
- Content-Typeヘッダーを確認

### 💾 データベース関連

#### Supabaseに接続できない
```javascript
Error: Invalid API key
```

**確認方法:**
```javascript
// 接続テスト
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const { error } = await supabase.from('orders').select('count');
console.log(error || 'Connected successfully');
```

**解決策:**
- URLとANON_KEYを再確認
- Row Level Securityを一時的に無効化
- `FORCE_FILE_STORAGE=true`でファイル使用

#### 「multiple (or no) rows returned」エラー
```sql
-- 重複データの確認
SELECT id, count(*) 
FROM orders 
GROUP BY id 
HAVING count(*) > 1;
```

**解決策:**
```javascript
// .single()の代わりに.limit(1)を使用
const { data } = await supabase
  .from('orders')
  .select('*')
  .eq('id', orderId)
  .limit(1);
```

### 🤖 AI分析関連

#### OpenAI APIエラー
```
Error: Rate limit exceeded
```

**解決策:**
- APIキーの使用量を確認
- タイムアウトを5秒に設定（自動フォールバック）
- 環境変数を削除してデフォルト分析を使用

#### AI分析がタイムアウト
```
⏳ AI analysis still in progress (2m 45s elapsed)
🔄 Will check again in 15 seconds
```

**正常な動作:**
- 30秒でタイムアウトしてバックグラウンド継続
- 最大5分間待機（段階的にチェック間隔を調整）
  - 0-60秒: 5秒ごと
  - 60-180秒: 10秒ごと
  - 180-300秒: 15秒ごと
- 5分経過でnullとして続行（レポート品質に影響少）

### 🚀 デプロイ関連

#### Vercelデプロイが失敗
```
Error: Functions count exceeds limit (12)
```

**解決策:**
```bash
# 不要なファイルを削除
rm api/unused-*.js

# vercel.jsonで除外
{
  "functions": {
    "api/test-*.js": false
  }
}
```

#### 環境変数が反映されない
```bash
# 1. 環境変数を確認
vercel env ls

# 2. 再デプロイ
vercel --prod --force
```

#### 古いStripe Webhookが届く
```
❌ Order not found: ORDER_U69bf66f_1754752858840_jvwqu2
⚠️ This might be an old order or duplicate webhook
```

**原因:**
- Stripeの再送信メカニズム
- 1時間以上前のイベントが再送信された

**対応:**
- 無視してOK（自動的にスキップされる）
- Stripeダッシュボードで古いイベントをクリア

### 📱 ユーザー報告の問題

#### 「レポートが届かない」
**確認手順:**
1. 注文ステータスを確認
2. LINE通知の送信ログを確認
3. ユーザーIDが正しいか確認

```sql
-- 注文状態確認
SELECT * FROM orders 
WHERE user_id = 'USER_ID' 
ORDER BY created_at DESC;
```

#### 「決済したのに処理されない」
**確認手順:**
1. Stripe Dashboardで決済確認
2. Webhook受信ログ確認
3. 注文ステータス確認

```bash
# Webhookを手動実行
curl -X POST https://your-app.vercel.app/api/stripe-webhook-simple \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: test" \
  -d '{"type": "checkout.session.completed", ...}'
```

## 🔍 デバッグツール

### ログ確認コマンド
```bash
# Vercelログ
vercel logs --since 1h --output raw

# 特定の注文を追跡
vercel logs | grep "ORDER_xxxxx"

# エラーのみ表示
vercel logs | grep "❌\|Error\|error"
```

### 状態確認SQL
```sql
-- 処理待ち注文
SELECT id, status, created_at 
FROM orders 
WHERE status IN ('paid', 'generating')
ORDER BY created_at;

-- エラー注文
SELECT id, error_message, created_at
FROM orders
WHERE status = 'error'
ORDER BY created_at DESC
LIMIT 10;

-- 進捗確認
SELECT id, 
       status,
       report_progress->>'currentStep' as step,
       report_progress->>'attempts' as attempts
FROM orders
WHERE report_progress IS NOT NULL;
```

### 手動実行エンドポイント
```bash
# キュー処理を実行
curl https://your-app.vercel.app/api/process-queue

# 特定の注文を再実行
curl -X POST https://your-app.vercel.app/api/generate-report-chunked \
  -H "Content-Type: application/json" \
  -d '{"orderId": "ORDER_xxxxx"}'

# 環境変数チェック
curl https://your-app.vercel.app/api/check-env
```

## 🚨 緊急対応

### サービス全体が止まった場合
1. Vercel Statusを確認
2. Supabase Statusを確認
3. LINE Platform Statusを確認
4. Stripe Statusを確認

### データ復旧
```sql
-- バックアップから復元
INSERT INTO orders SELECT * FROM orders_backup
WHERE created_at > '2025-01-08';

-- 進捗データをクリア
UPDATE orders SET report_progress = NULL
WHERE status = 'generating';
```

### 一時的な対応
```javascript
// ファイルストレージに切り替え
process.env.FORCE_FILE_STORAGE = 'true';

// AI分析を無効化
delete process.env.OPENAI_API_KEY;

// プレミアム機能を一時停止
if (text === 'プレミアムレポート') {
  return replyText('現在メンテナンス中です。しばらくお待ちください。');
}
```

## 📞 サポート連絡先

### 開発者向け
- GitHub Issues: [line-love-edu/issues](https://github.com/yourusername/line-love-edu/issues)
- Vercel Support: [vercel.com/support](https://vercel.com/support)

### API提供元
- LINE: [developers.line.biz/support](https://developers.line.biz/support)
- Stripe: [support.stripe.com](https://support.stripe.com)
- Supabase: [supabase.com/support](https://supabase.com/support)
- OpenAI: [help.openai.com](https://help.openai.com)