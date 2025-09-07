# PayPay Webhook設定ガイド

## 概要
PayPay Webhookを設定することで、決済完了を即座に検知できます。

## 設定手順

### 1. PayPay管理画面にログイン
- [PayPay for Developers](https://developer.paypay.ne.jp/) にアクセス
- Sandbox環境の管理画面にログイン

### 2. Webhook URLの設定
管理画面で以下のWebhook URLを設定：
```
https://line-love-edu.vercel.app/api/paypay-webhook
```

### 3. 通知タイプの選択
以下の通知タイプを有効にする：
- Transaction (決済完了通知)
- Refund (返金通知) ※必要に応じて

### 4. Webhook Secretの取得
- 管理画面でWebhook Secretが表示される
- この値を環境変数に設定

### 5. Vercelに環境変数を設定
```bash
vercel env add PAYPAY_WEBHOOK_SECRET
```

## Webhook動作フロー

1. ユーザーがPayPayで決済完了
2. PayPayが即座にWebhookを送信
3. `/api/paypay-webhook`が受信
4. データベースの`purchases`テーブルを即座に更新
5. フロントエンドのポーリングが次の0.5秒で検知
6. 決済完了画面へ自動遷移

## テスト方法

1. PayPay Sandboxで決済を実行
2. Vercelのログで`PayPay Webhook Received`を確認
3. データベースの更新を確認

## トラブルシューティング

- Webhookが届かない場合
  - PayPay管理画面でWebhook URLが正しいか確認
  - Vercelのデプロイが完了しているか確認
  
- 署名検証エラーの場合
  - 環境変数`PAYPAY_WEBHOOK_SECRET`が正しいか確認