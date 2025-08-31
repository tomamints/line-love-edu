-- 支払い履歴テーブルの作成
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payment_id TEXT UNIQUE NOT NULL, -- 一意の支払いID (例: pay_xxxxx)
    diagnosis_id TEXT NOT NULL, -- diagnosesテーブルのIDと紐付け
    user_id TEXT NOT NULL, -- LINEユーザーID
    diagnosis_type TEXT NOT NULL, -- 診断タイプ (otsukisama, aijou等)
    
    -- 支払い情報
    amount INTEGER NOT NULL, -- 金額（円）
    currency TEXT DEFAULT 'JPY', -- 通貨
    payment_method TEXT, -- 支払い方法 (stripe, test等)
    stripe_payment_intent_id TEXT, -- StripeのPaymentIntent ID
    stripe_session_id TEXT, -- StripeのCheckout Session ID
    
    -- ステータス
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
    
    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE, -- 支払い完了時刻
    
    -- メタデータ
    metadata JSONB, -- 追加情報（割引コード、キャンペーン情報等）
    
    -- 外部キー制約
    CONSTRAINT fk_diagnosis FOREIGN KEY (diagnosis_id) 
        REFERENCES diagnoses(id) ON DELETE CASCADE
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_diagnosis_id ON payments(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_session_id);

-- 診断テーブルの支払い状態を更新するトリガー
CREATE OR REPLACE FUNCTION update_diagnosis_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- 支払い完了時に診断テーブルのis_paidフラグを更新
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE diagnoses 
        SET is_paid = true 
        WHERE id = NEW.diagnosis_id;
        
        -- completed_atを設定
        NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- 返金時にフラグを戻す
    IF NEW.status = 'refunded' AND OLD.status = 'completed' THEN
        UPDATE diagnoses 
        SET is_paid = false 
        WHERE id = NEW.diagnosis_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成
DROP TRIGGER IF EXISTS trigger_payment_status_update ON payments;
CREATE TRIGGER trigger_payment_status_update
    BEFORE INSERT OR UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_diagnosis_payment_status();

-- 既存のdiagnosesテーブルにis_paidカラムが無い場合は追加
ALTER TABLE diagnoses 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;

-- is_paidカラムにインデックスを追加（支払い済み診断の検索高速化）
CREATE INDEX IF NOT EXISTS idx_diagnoses_is_paid ON diagnoses(is_paid);
CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id_paid ON diagnoses(user_id, is_paid);

-- サンプルデータ（テスト用）
-- INSERT INTO payments (
--     payment_id, 
--     diagnosis_id, 
--     user_id, 
--     diagnosis_type,
--     amount,
--     status
-- ) VALUES (
--     'pay_test_001',
--     'diag_xxxxx', -- 実際の診断ID
--     'U12345678',
--     'otsukisama',
--     980,
--     'completed'
-- );