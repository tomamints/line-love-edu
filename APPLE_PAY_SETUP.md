# Apple Pay 設定手順

## 必要な手順

### 1. PAY.JPダッシュボードでの設定

1. [PAY.JP管理画面](https://pay.jp/)にログイン
2. 左メニューから「Apple Pay」を選択
3. 「Apple Pay設定を開始」をクリック
4. CSRファイルをダウンロード（後で使用）

### 2. Apple Developer での設定

1. [Apple Developer](https://developer.apple.com/account/)にログイン
2. 「Certificates, Identifiers & Profiles」へ移動
3. 「Identifiers」→「Merchant IDs」を選択
4. 「+」ボタンで新規作成
   - Description: `Line Love Edu Payment`
   - Identifier: `merchant.com.linelove.edu`（例）
5. 作成したMerchant IDを選択
6. 「Apple Pay Payment Processing Certificate」セクション
7. 「Create Certificate」をクリック
8. 「No」を選択（中国以外）
9. PAY.JPからダウンロードしたCSRファイルをアップロード
10. 証明書（apple_pay.cer）をダウンロード

### 3. ドメイン検証

1. Apple Developerで「Merchant Domains」へ移動
2. ドメインを追加: `line-love-edu.vercel.app`
3. 検証ファイルをダウンロード
4. ファイルを `/public/.well-known/apple-developer-merchantid-domain-association.txt` に配置
5. 「Verify」をクリック

### 4. PAY.JPに証明書をアップロード

1. PAY.JPダッシュボードのApple Payページに戻る
2. Apple Developerでダウンロードした証明書をアップロード
3. 「登録」をクリック

## 実装の注意点

### LINE内ブラウザ対応

LINE内ブラウザではApple PayのAPIが利用できないため：

1. **自動検出と代替表示**
   - LINE内ブラウザを検出
   - 「Safariで開く」ボタンを表示

2. **クレジットカード決済を優先**
   - 全環境で動作
   - ユーザーフレンドリー

### テスト環境

- テスト用Merchant ID: PAY.JPのテスト環境用を使用
- 本番用Merchant ID: 上記手順で作成したものを使用

## トラブルシューティング

### ドメイン検証が失敗する場合

1. Basic認証を一時的に解除
2. Appleからのアクセスを許可
3. ファイルが正しいパスにあることを確認:
   ```
   https://line-love-edu.vercel.app/.well-known/apple-developer-merchantid-domain-association.txt
   ```

### Apple Payボタンが表示されない場合

1. ドメイン検証が完了しているか確認
2. 証明書の有効期限を確認（25ヶ月）
3. SafariでWalletにカードが登録されているか確認

## 参考リンク

- [PAY.JP Apple Pay設定ガイド](https://docs.pay.jp/v1/apple-pay-setup)
- [Apple Pay on the Web統合ガイド](https://docs.pay.jp/v1/apple-pay-integrate-web)
- [Apple Developer - Apple Pay](https://developer.apple.com/apple-pay/)