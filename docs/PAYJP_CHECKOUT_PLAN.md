# PAY.JP Checkout 実装計画

## 現状の課題
- 現在はカスタム決済画面を使用（PAY.JP Elements）
- セキュリティやUXの観点から、PAY.JPの公式Checkout画面を使用したい
- PayPayは実装が複雑なため、一旦非表示にする

## PAY.JP Checkoutとは
PAY.JPが提供する公式の決済画面。以下のメリットがある：
- **セキュリティ**: PCI DSS準拠の安全な決済環境
- **UI/UX**: 最適化された決済フォーム
- **メンテナンス不要**: PAY.JP側で自動アップデート
- **モバイル対応**: レスポンシブデザイン

## 実装方法の選択肢

### 方法1: PAY.JP Checkout（推奨）
```javascript
// 実装イメージ
const handler = Payjp.checkout({
  publicKey: 'pk_test_xxx',
  tenant: 'your-tenant-id', // オプション
  lang: 'ja',
  amount: 2980,
  currency: 'jpy',
  text: '診断結果を購入',
  submitText: '支払う',
  onCreated: (token) => {
    // トークン取得後の処理
    submitPayment(token);
  }
});
```

**メリット**：
- 実装が簡単
- 公式UIで信頼性が高い
- カード情報を扱わないので安全

**デメリット**：
- カスタマイズの自由度が低い

### 方法2: PAY.JP Elements（現在の実装）
現在使用中のカスタム実装。カード番号入力フィールドを自前で用意。

**メリット**：
- デザインの自由度が高い

**デメリット**：
- セキュリティリスクが高い
- 実装が複雑

## 実装手順

### Step 1: PayPayを非表示にする ✅
payment-select.htmlでPayPayオプションをコメントアウト

### Step 2: PAY.JP Checkoutの導入
1. PAY.JP Checkout用のJavaScriptライブラリを読み込む
2. 決済ボタンクリック時にCheckoutを起動
3. トークン取得後、サーバーに送信

### Step 3: サーバー側の処理
1. `/api/payjp-create-charge.js`でトークンを受け取る
2. 決済を実行
3. purchasesテーブルに記録

### Step 4: 決済完了後の処理
1. 成功: 診断結果ページにリダイレクト（フルアクセス権限付き）
2. 失敗: エラーメッセージを表示

## 必要な環境変数
```
PAYJP_PUBLIC_KEY=pk_test_xxx  # 公開鍵
PAYJP_SECRET_KEY=sk_test_xxx  # 秘密鍵（サーバー側のみ）
```

## セキュリティ考慮事項
- クライアント側では公開鍵のみを使用
- カード情報は直接扱わない（PAY.JPのトークン化を利用）
- HTTPS必須

## 実装スケジュール
1. **Phase 1**: PayPayを非表示（完了）
2. **Phase 2**: PAY.JP Checkoutのテスト実装
3. **Phase 3**: 本番環境への適用
4. **Phase 4**: 動作確認とバグ修正

## 参考資料
- [PAY.JP Checkout ドキュメント](https://pay.jp/docs/checkout)
- [PAY.JP API リファレンス](https://pay.jp/docs/api)

## 次のアクション
1. PAY.JP Checkoutを使った新しい決済画面の作成
2. 既存のElements実装からの移行
3. テスト環境での動作確認
