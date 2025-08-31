-- ========================================
-- 1. ユーザー基本情報テーブル（既存のprofilesを活用）
-- ========================================
-- profilesテーブルは既存のものを使用
-- 診断関連のカラムは追加しない


-- ========================================
-- 2. 診断マスターテーブル（診断の種類を管理）
-- ========================================
CREATE TABLE IF NOT EXISTS diagnosis_types (
    id TEXT PRIMARY KEY, -- 'otsukisama', 'aijou', etc.
    name TEXT NOT NULL, -- 'おつきさま診断', '愛嬢診断', etc.
    description TEXT,
    price INTEGER NOT NULL DEFAULT 980, -- 基本価格
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 初期データ
INSERT INTO diagnosis_types (id, name, description, price) VALUES
    ('otsukisama', 'おつきさま診断', '月相から読み解く運命診断', 980),
    ('aijou', '愛嬢診断', '恋愛タイプ診断', 980)
ON CONFLICT (id) DO NOTHING;


-- ========================================
-- 3. 診断結果テーブル（全診断共通）
-- ========================================
CREATE TABLE IF NOT EXISTS diagnoses (
    id TEXT PRIMARY KEY, -- diag_xxxxx
    user_id TEXT NOT NULL, -- LINEユーザーID
    diagnosis_type_id TEXT NOT NULL REFERENCES diagnosis_types(id),
    
    -- 共通フィールド
    user_name TEXT, -- 診断時の名前
    birth_date DATE, -- 生年月日（診断に使用）
    
    -- 診断結果（JSON形式で柔軟に保存）
    result_data JSONB NOT NULL, -- 診断タイプごとの結果データ
    
    -- メタデータ
    metadata JSONB, -- 追加情報
    
    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 複合ユニーク制約（同じ人が同じ生年月日で同じ診断を2回作らない）
    CONSTRAINT unique_user_diagnosis UNIQUE (user_id, diagnosis_type_id, birth_date)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON diagnoses(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_type ON diagnoses(diagnosis_type_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_created_at ON diagnoses(created_at DESC);


-- ========================================
-- 4. 購入履歴テーブル（支払い管理）
-- ========================================
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    purchase_id TEXT UNIQUE NOT NULL, -- pur_xxxxx
    user_id TEXT NOT NULL,
    diagnosis_id TEXT REFERENCES diagnoses(id) ON DELETE SET NULL,
    
    -- 購入内容
    product_type TEXT NOT NULL, -- 'diagnosis', 'subscription', 'addon'
    product_id TEXT NOT NULL, -- diagnosis_type_id or other product id
    product_name TEXT NOT NULL,
    
    -- 支払い情報
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'JPY',
    payment_method TEXT, -- 'stripe', 'line_pay', 'test'
    
    -- 外部決済情報
    stripe_payment_intent_id TEXT,
    stripe_session_id TEXT,
    line_pay_transaction_id TEXT,
    
    -- ステータス
    status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
    
    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    -- メタデータ
    metadata JSONB
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_diagnosis_id ON purchases(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);


-- ========================================
-- 5. アクセス権限テーブル（誰が何を見れるか）
-- ========================================
CREATE TABLE IF NOT EXISTS access_rights (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- 'diagnosis', 'report', etc.
    resource_id TEXT NOT NULL, -- diagnosis_id, report_id, etc.
    
    -- アクセス権限
    access_level TEXT NOT NULL DEFAULT 'preview', -- preview, full, premium
    
    -- 有効期限（サブスクリプション用）
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE, -- NULL = 永久
    
    -- 購入との紐付け
    purchase_id TEXT REFERENCES purchases(purchase_id),
    
    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- 複合ユニーク制約
    CONSTRAINT unique_user_resource UNIQUE (user_id, resource_type, resource_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_access_rights_user ON access_rights(user_id);
CREATE INDEX IF NOT EXISTS idx_access_rights_resource ON access_rights(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_access_rights_valid ON access_rights(valid_until);


-- ========================================
-- 6. トリガー関数
-- ========================================

-- 購入完了時にアクセス権を付与
CREATE OR REPLACE FUNCTION grant_access_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- 購入が完了したら
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- 診断の購入の場合
        IF NEW.product_type = 'diagnosis' AND NEW.diagnosis_id IS NOT NULL THEN
            INSERT INTO access_rights (
                user_id,
                resource_type,
                resource_id,
                access_level,
                purchase_id
            ) VALUES (
                NEW.user_id,
                'diagnosis',
                NEW.diagnosis_id,
                'full',
                NEW.purchase_id
            )
            ON CONFLICT (user_id, resource_type, resource_id)
            DO UPDATE SET 
                access_level = 'full',
                purchase_id = NEW.purchase_id;
        END IF;
        
        NEW.completed_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- 返金時にアクセス権を取り消し
    IF NEW.status = 'refunded' AND OLD.status = 'completed' THEN
        UPDATE access_rights
        SET access_level = 'preview'
        WHERE purchase_id = NEW.purchase_id;
        
        NEW.refunded_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_grant_access ON purchases;
CREATE TRIGGER trigger_grant_access
    BEFORE UPDATE ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION grant_access_on_purchase();


-- ========================================
-- 使用例
-- ========================================

-- 診断を作成
-- INSERT INTO diagnoses (id, user_id, diagnosis_type_id, user_name, birth_date, result_data)
-- VALUES (
--     'diag_xxxxx',
--     'U12345678',
--     'otsukisama',
--     'テストユーザー',
--     '1990-05-15',
--     '{
--         "moon_pattern_id": 43,
--         "moon_phase": "十六夜",
--         "hidden_moon_phase": "十三夜",
--         "emotional_expression": "straight",
--         "distance_style": "independent",
--         "love_values": "romantic",
--         "love_energy": "intense"
--     }'::jsonb
-- );

-- 購入を記録
-- INSERT INTO purchases (purchase_id, user_id, diagnosis_id, product_type, product_id, product_name, amount, status)
-- VALUES (
--     'pur_xxxxx',
--     'U12345678',
--     'diag_xxxxx',
--     'diagnosis',
--     'otsukisama',
--     'おつきさま診断',
--     980,
--     'completed'
-- );

-- アクセス権限を確認
-- SELECT * FROM access_rights
-- WHERE user_id = 'U12345678'
--   AND resource_type = 'diagnosis'
--   AND resource_id = 'diag_xxxxx';