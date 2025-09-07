# PayPay Webhook設定ガイド

## 重要な注意事項
**PayPayのWebhook設定は、PayPayのビジネスアカウント管理者から直接設定してもらう必要があります。**
開発者が自由に設定できるものではありません。

## 現在の実装

### 1. 高速ポーリング（実装済み）
- 0.5秒間隔で決済状態をチェック
- これにより、ほぼリアルタイムで決済完了を検知
- Webhookが使えない場合でも問題なく動作

### 2. Webhookエンドポイント（準備済み）
- エンドポイント: `https://line-love-edu.vercel.app/api/paypay-webhook`
- PayPayから通知を受け取る準備は完了
- ただし、PayPay側での設定が必要

## PayPay側での設定（PayPayビジネスアカウント管理者が行う）

### 1. PayPayビジネスアカウント管理者に依頼
以下の情報を伝えて設定を依頼：
- Webhook URL: `https://line-love-edu.vercel.app/api/paypay-webhook`
- 通知タイプ: Transaction（決済完了通知）

### 2. IPアドレスのホワイトリスト設定
セキュリティのため、PayPayのIPアドレスからのみ受信するよう設定することを推奨

### 3. Webhook Secretの共有
PayPay側で生成されるWebhook Secretを取得し、環境変数に設定：
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