# PayPay決済の設定方法

## 前提条件
PayPay決済を有効にするには、以下の条件を満たす必要があります：

1. **Stripeアカウントの設定**
   - Stripeダッシュボードで日本のアカウントとして設定されている
   - PayPay決済が有効化されている

2. **PayPayの有効化手順**

### Step 1: Stripeダッシュボードでの設定

1. [Stripeダッシュボード](https://dashboard.stripe.com/)にログイン
2. 「設定」→「支払い方法」に移動
3. 「PayPay」を探して「有効化」をクリック
4. 必要な情報を入力：
   - ビジネス情報
   - 銀行口座情報
   - PayPayとの契約情報

### Step 2: PayPay審査

- PayPayによる審査が必要（通常1-3営業日）
- 審査通過後、自動的に有効化される

### Step 3: Webhookの設定確認

PayPay決済は非同期決済のため、Webhookの設定が重要：

```javascript
// payment-webhook-v2.js で処理される主要なイベント
- checkout.session.completed
- payment_intent.succeeded
- payment_intent.payment_failed
```

## コードの変更点

`api/create-checkout-session.js`:
```javascript
payment_method_types: ['card', 'paypay'], // PayPayを追加
```

## 注意事項

1. **金額制限**
   - PayPayの最小金額: 100円
   - PayPayの最大金額: 2,000,000円

2. **通貨**
   - PayPayは日本円（JPY）のみサポート

3. **リダイレクトフロー**
   - PayPay決済時、ユーザーはPayPayアプリまたはウェブサイトにリダイレクトされる
   - 決済完了後、success_urlに自動的にリダイレクトされる

4. **テスト環境**
   - Stripeテストモードでは、PayPayのテスト決済が可能
   - テスト用PayPayアカウントが必要

## トラブルシューティング

### PayPayオプションが表示されない場合

1. Stripeダッシュボードで有効化を確認
2. 日本のIPアドレスからアクセスしているか確認
3. 金額が100円以上か確認

### エラーメッセージ

```
"payment_method_types" contains invalid value: paypay
```
→ Stripeアカウントでまだ有効化されていない

## 環境変数

追加の環境変数は不要。既存の`STRIPE_SECRET_KEY`で動作します。

## 動作確認方法

1. テストモードでCheckout Sessionを作成
2. 決済ページでPayPayオプションが表示されることを確認
3. テスト決済を実行
4. Webhookが正常に処理されることを確認

## 参考リンク

- [Stripe PayPay Documentation](https://docs.stripe.com/payments/paypay)
- [PayPay Integration Guide](https://docs.stripe.com/payments/paypay/accept-a-payment)
- [Testing PayPay Payments](https://docs.stripe.com/payments/paypay/accept-a-payment#test-your-integration)