# Stripe Webhook セットアップガイド

## 概要
このガイドは、Stripe決済完了後に自動的にレポートを生成するためのWebhook設定方法を説明します。

## セットアップ手順

### 1. Stripe ダッシュボードでWebhookを設定

1. [Stripe Dashboard](https://dashboard.stripe.com) にログイン
2. 左メニューから「開発者」→「Webhook」を選択
3. 「エンドポイントを追加」をクリック

### 2. Webhook エンドポイントの設定

**エンドポイントURL:**
```
https://your-app.vercel.app/api/stripe/webhook
```

**リッスンするイベント:**
- `checkout.session.completed` を選択

### 3. Webhook シークレットの取得

1. 作成したWebhookエンドポイントをクリック
2. 「署名シークレット」セクションで「表示」をクリック
3. `whsec_` で始まるシークレットをコピー

### 4. 環境変数の設定

Vercelダッシュボードで以下の環境変数を設定:

```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
```

## テスト方法

### ローカルテスト（Stripe CLI使用）

1. Stripe CLIをインストール
```bash
brew install stripe/stripe-cli/stripe
```

2. ログイン
```bash
stripe login
```

3. Webhookをローカルに転送
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

4. テストイベントを送信
```bash
stripe trigger checkout.session.completed
```

### 本番環境テスト

1. Stripeテストモードでカード番号 `4242 4242 4242 4242` を使用
2. 決済完了後、以下を確認:
   - Stripe Dashboard → Webhook → ログで成功を確認
   - LINEでレポートが送信されることを確認

## トラブルシューティング

### よくある問題

1. **署名検証エラー**
   - `STRIPE_WEBHOOK_SECRET` が正しく設定されているか確認
   - エンドポイントURLが正しいか確認

2. **レポートが生成されない**
   - Vercelのログを確認
   - Stripe Webhookログでエラーがないか確認

3. **400エラー**
   - リクエストボディが正しく受信されているか確認
   - express.raw() ミドルウェアが適用されているか確認

## 重要な注意事項

- Webhookは決済完了後、数秒以内に呼ばれます
- ユーザーがブラウザを閉じても、Webhookは確実に実行されます
- テストモードと本番モードで異なるWebhookシークレットを使用してください