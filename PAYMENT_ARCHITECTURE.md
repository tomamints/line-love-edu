# 決済アーキテクチャ設計書

## 現在の設計評価

### ✅ 良い点
1. **データベース設計が決済プロバイダーに依存しない**
   - purchasesテーブル: 統一された購入履歴
   - access_rightsテーブル: 決済方法に関係ないアクセス管理
   - payment_methodフィールドで決済方法を識別

2. **決済フローが標準化されている**
   ```
   決済開始 → pending → 決済完了 → completed → アクセス権限付与
   ```

3. **メタデータで拡張性を確保**
   - metadataフィールドに決済プロバイダー固有の情報を保存
   - PayPay: merchant_payment_id, transaction_id
   - Square: payment_id, receipt_url（など）

### ⚠️ 改善推奨事項

#### 1. 共通処理の抽出

```javascript
// api/common/payment-handler.js (新規作成推奨)

class PaymentHandler {
  // 購入レコード作成（共通）
  async createPurchaseRecord(diagnosisId, userId, amount, paymentMethod) {
    const purchaseId = `pur_${Date.now()}_${generateRandomId()}`;
    await supabase.from('purchases').insert({
      purchase_id: purchaseId,
      diagnosis_id: diagnosisId,
      user_id: userId,
      amount: amount,
      payment_method: paymentMethod,
      status: 'pending',
      created_at: getJSTDateTime()
    });
    return purchaseId;
  }

  // アクセス権限更新（共通）
  async grantFullAccess(diagnosisId, userId, purchaseId) {
    await supabase.from('access_rights').update({
      access_level: 'full',
      purchase_id: purchaseId,
      valid_from: getJSTDateTime()
    })
    .eq('resource_id', diagnosisId)
    .eq('user_id', userId);
  }

  // 購入完了処理（共通）
  async completePurchase(purchaseId, transactionData) {
    await supabase.from('purchases').update({
      status: 'completed',
      completed_at: getJSTDateTime(),
      metadata: transactionData
    })
    .eq('purchase_id', purchaseId);
  }
}
```

#### 2. 決済プロバイダーインターフェース

```javascript
// api/providers/payment-provider.interface.js

class PaymentProvider {
  // 決済セッション作成
  async createSession(amount, description, metadata) {
    throw new Error('Not implemented');
  }

  // 決済状態確認
  async checkStatus(paymentId) {
    throw new Error('Not implemented');
  }

  // Webhook検証
  async verifyWebhook(payload, signature) {
    throw new Error('Not implemented');
  }
}

// api/providers/paypay-provider.js
class PayPayProvider extends PaymentProvider {
  async createSession(amount, description, metadata) {
    // PayPay固有の実装
  }
}

// api/providers/square-provider.js
class SquareProvider extends PaymentProvider {
  async createSession(amount, description, metadata) {
    // Square固有の実装
  }
}
```

## Square導入手順

### Phase 1: 最小限の実装（現在の構造を活かす）

1. **api/create-square-session.js** を作成
   - create-paypay-session-final.jsをコピーして修正
   - Square SDKに置き換え
   - purchasesテーブルへの保存は同じ

2. **api/update-square-payment.js** を作成
   - update-paypay-payment.jsをコピーして修正
   - Square APIで決済確認
   - access_rights更新は同じ

3. **payment-select.html** を修正
   - コメントアウトを解除
   - '/api/create-square-session'を呼ぶように変更

### Phase 2: リファクタリング（推奨）

1. **共通処理を抽出**
   - api/common/payment-handler.js作成
   - 購入レコード作成、アクセス権限更新を共通化

2. **各APIを簡潔に**
   - PayPay/Square固有の処理のみ残す
   - 共通処理はpayment-handlerを呼ぶ

## 評価

### 現在の設計: B+
- ✅ 基本的な分離はできている
- ✅ データベース設計は優秀
- ⚠️ コードの重複がある
- ⚠️ 決済プロバイダーの抽象化が不完全

### 推奨される改善後: A
- ✅ 完全な決済プロバイダーの抽象化
- ✅ DRY原則の遵守
- ✅ 新しい決済方法の追加が容易
- ✅ テストしやすい構造

## まとめ

現在の設計でも**Square導入は可能**です。
ただし、将来的により多くの決済方法を追加する予定があれば、共通処理の抽出をお勧めします。

**必要な作業時間の見積もり**:
- Phase 1（最小限）: 2-3時間
- Phase 2（リファクタリング込み）: 4-6時間