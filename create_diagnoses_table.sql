-- 診断データテーブルの作成
CREATE TABLE IF NOT EXISTS diagnoses (
    id TEXT PRIMARY KEY, -- 診断ID (例: diag_xxxxx)
    user_id TEXT NOT NULL, -- LINEユーザーID
    user_name TEXT, -- ユーザー名（ニックネーム）
    birth_date DATE NOT NULL, -- 生年月日
    diagnosis_type TEXT NOT NULL DEFAULT 'otsukisama', -- 診断タイプ
    
    -- おつきさま診断の基本データ
    moon_pattern_id INTEGER, -- 月相パターンID (0-63)
    moon_phase TEXT, -- 表月相（新月、三日月など）
    hidden_moon_phase TEXT, -- 裏月相
    
    -- 4つの軸データ
    emotional_expression TEXT, -- 感情表現タイプ
    distance_style TEXT, -- 距離感スタイル
    love_values TEXT, -- 価値観
    love_energy TEXT, -- エネルギータイプ
    
    -- 3つの月の力
    moon_power_1 TEXT, -- 月の力1
    moon_power_2 TEXT, -- 月の力2
    moon_power_3 TEXT, -- 月の力3
    
    -- 支払い状態
    is_paid BOOLEAN DEFAULT false, -- 支払い済みフラグ
    
    -- メタデータ
    metadata JSONB, -- その他の診断データ
    
    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON diagnoses(user_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id_type ON diagnoses(user_id, diagnosis_type);
CREATE INDEX IF NOT EXISTS idx_diagnoses_birth_date ON diagnoses(birth_date);
CREATE INDEX IF NOT EXISTS idx_diagnoses_created_at ON diagnoses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnoses_is_paid ON diagnoses(is_paid);
CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id_paid ON diagnoses(user_id, is_paid);

-- 更新時刻を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_diagnoses_updated_at ON diagnoses;
CREATE TRIGGER update_diagnoses_updated_at
    BEFORE UPDATE ON diagnoses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();