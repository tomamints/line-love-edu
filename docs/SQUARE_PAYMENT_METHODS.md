# Square決済で利用可能な決済方法（2024年日本）

## 概要
Square決済は日本で幅広い決済方法に対応しています。オンライン決済と店舗決済の両方をサポートしており、翌日入金という他社にない特徴があります。

## 🌐 オンライン決済（Web Payments SDK / Checkout API）

### 1. クレジットカード・デビットカード
| ブランド | 手数料 | 備考 |
|---------|--------|------|
| Visa | 3.6% | 国内・海外カード対応 |
| Mastercard | 3.6% | 国内・海外カード対応 |
| American Express | 3.6% | 国内・海外カード対応 |
| JCB | 3.95% | 国内カードのみ |
| Diners Club | 3.6% | 国内・海外カード対応 |
| Discover | 3.6% | 主に海外カード |

**特徴:**
- 一括払いのみ対応（分割払い・リボ払い非対応）
- PCI-DSS準拠でセキュア
- 翌日入金（日本では唯一）

### 2. デジタルウォレット（制限あり）
**Apple Pay / Google Pay**
- ドキュメント上は対応となっているが、2024年現在、日本のマーチャントアカウントでは初期化エラーが発生
- エラー: "PaymentMethodUnsupportedError: Wallet is not available in this merchant country"
- Square サポートへの確認が必要

## 🏪 店舗決済（Square Terminal / Reader）

### 1. タッチ決済・電子マネー
**交通系ICカード:**
- Suica
- PASMO
- Kitaca
- TOICA
- manaca
- ICOCA
- SUGOCA
- nimoca
- はやかけん

**その他の電子マネー:**
- iD
- QUICPay

**注意事項:**
- 決済上限: 15,000円/回（超える場合はサインが必要）
- 申請から有効化まで: 4〜9日
- JCBの利用申し込みが必要

### 2. QRコード決済
- **PayPay** （Square Terminalで対応）
- 2024年からDGFTのCloud Pay連携により7ブランドのQRコード決済に対応拡大

### 3. モバイルウォレット
**Apple Pay（店舗）:**
- 交通系IC
- iD
- QUICPay

## 🚀 実装方法の選択肢

### 1. Web Payments SDK（推奨）
```javascript
// 基本的な実装例
const payments = Square.payments(applicationId, locationId);
const card = await payments.card();
await card.attach('#card-container');
```

**メリット:**
- 完全なカスタマイズが可能
- PCI準拠の安全な決済フォーム
- 手数料は取引ごとのみ（SDK利用は無料）

### 2. Checkout API
- Squareがホストする決済ページへリダイレクト
- 実装が簡単
- カスタマイズは限定的

### 3. E-commerce プラットフォーム連携
**グローバル:**
- WooCommerce
- Magento
- Weebly
- Ecwid
- Wix

**日本向け:**
- 順次拡大中（要確認）

## 💰 料金体系

| 項目 | 料金 |
|------|------|
| 初期費用 | 無料 |
| 月額費用 | 無料 |
| 通常カード決済手数料 | 3.6% |
| JCBカード決済手数料 | 3.95% |
| 入金手数料 | 無料 |
| 入金サイクル | 翌営業日 |

## ⚠️ 制限事項

1. **分割払い非対応** - 一括払いのみ
2. **Apple Pay/Google Pay** - オンラインでは日本未対応の可能性
3. **電子マネー** - 店舗決済のみ（オンライン非対応）
4. **決済上限** - タッチ決済は15,000円まで

## 📝 実装に必要な情報

### 環境変数
```env
SQUARE_ACCESS_TOKEN=your_access_token
SQUARE_APPLICATION_ID=your_application_id
SQUARE_LOCATION_ID=your_location_id
SQUARE_ENVIRONMENT=sandbox # または production
```

### API エンドポイント
- Sandbox: https://connect.squareupsandbox.com
- Production: https://connect.squareup.com

## 🔄 今後の展開

- 日本のECプラットフォームとの連携拡大
- Apple Pay/Google Payのオンライン対応（時期未定）
- QRコード決済ブランドの追加

## 📞 サポート

- Square Developer Forums
- Square日本語サポート
- API Explorer（テスト環境）

---

最終更新: 2024年12月
※最新情報はSquare公式ドキュメントを確認してください