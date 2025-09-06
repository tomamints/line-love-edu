-- PayPay決済用のカラムをpurchasesテーブルに追加
-- Stripeと並行して使用できるようにする

-- PayPay用のカラムを追加（存在しない場合のみ）
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS paypay_merchant_payment_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS paypay_transaction_id TEXT;

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_purchases_paypay_merchant_payment_id 
ON purchases(paypay_merchant_payment_id);

CREATE INDEX IF NOT EXISTS idx_purchases_paypay_transaction_id 
ON purchases(paypay_transaction_id);

-- diagnosesテーブルにもPayPay関連のカラムを追加（必要な場合）
ALTER TABLE diagnoses
ADD COLUMN IF NOT EXISTS merchant_payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_completed_at TIMESTAMP WITH TIME ZONE;

-- payment_methodにインデックスを作成
CREATE INDEX IF NOT EXISTS idx_diagnoses_payment_method 
ON diagnoses(payment_method);

-- コメントを追加
COMMENT ON COLUMN purchases.paypay_merchant_payment_id IS 'PayPay決済の一意ID';
COMMENT ON COLUMN purchases.paypay_transaction_id IS 'PayPayトランザクションID';
COMMENT ON COLUMN diagnoses.merchant_payment_id IS 'PayPay決済ID（参照用）';
COMMENT ON COLUMN diagnoses.payment_method IS '決済方法（stripe, paypay等）';
COMMENT ON COLUMN diagnoses.payment_completed_at IS '決済完了日時';