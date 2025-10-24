# 環境変数設定ガイド

## 必要な環境変数

### Vercelで設定が必要な環境変数

以下の環境変数をVercelのダッシュボードで設定してください：

1. **SUPABASE_URL** (必須 - 現在未設定)
   - Supabaseプロジェクトの URL
   - 例: `https://xxxxx.supabase.co`
   - SupabaseダッシュボードのProject Settings → APIから取得

2. **既に設定済みの環境変数** (確認のみ)
   - SUPABASE_ANON_KEY ✅
   - STRIPE_SECRET_KEY ✅
   - STRIPE_WEBHOOK_SECRET ✅
   - NEXT_PUBLIC_BASE_URL ✅
   - LINE_CHANNEL_ACCESS_TOKEN ✅ (LINE通知用、オプション)

## Vercelでの環境変数設定方法

1. Vercelダッシュボードにログイン
2. プロジェクトを選択
3. Settings → Environment Variables
4. 以下を追加：
   ```
   Name: SUPABASE_URL
   Value: [SupabaseプロジェクトのURL]
   Environment: Production, Preview, Development
   ```
5. 「Save」をクリック

## Stripeの設定

### Webhook設定
1. Stripeダッシュボードでwebhookエンドポイントを追加
2. エンドポイントURL: `https://[your-domain]/api/stripe/webhook`
3. リッスンするイベント:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

## データベースセットアップ

Supabaseで以下のSQLを実行してテーブルを作成：

```bash
# Supabaseダッシュボード → SQL Editor
# create_tables_v2.sql の内容を実行
```

## API構成の変更点

### 新しいAPI構成 (V2)
- `/api/profile-form-v2.js` - 診断データ管理
- `/api/payment-webhook-v2.js` - Stripe Webhook処理
- `/api/create-checkout-session.js` - 決済セッション作成

### 削除されたAPI (api-backupに移動)
- `/api/profile-form.js` (→ profile-form-v2.js に置き換え)
- `/api/payment-webhook.js` (→ payment-webhook-v2.js に置き換え)
- `/api/stripe-webhook-simple.js` (→ payment-webhook-v2.js に統合)

## テスト方法

1. 環境変数設定後、Vercelを再デプロイ
2. 診断ページ (`/lp-otsukisama-input.html`) で診断を作成
3. 診断結果ページで購入フローをテスト
4. Stripeダッシュボードで決済を確認

## トラブルシューティング

### "Database configuration error" エラー
- SUPABASE_URL が設定されているか確認
- SUPABASE_ANON_KEY が正しく設定されているか確認

### Stripe決済が動作しない
- STRIPE_SECRET_KEY が設定されているか確認
- STRIPE_WEBHOOK_SECRET が正しく設定されているか確認
- Webhook URLが正しく設定されているか確認

### テーブルが見つからないエラー
- Supabaseで `create_tables_v2.sql` を実行したか確認
- テーブル名が小文字になっているか確認 (diagnoses, purchases等)