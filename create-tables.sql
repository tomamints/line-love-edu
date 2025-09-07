-- payment_intentsテーブル作成
CREATE TABLE IF NOT EXISTS payment_intents (
    id TEXT PRIMARY KEY,
    diagnosis_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT NOT NULL,
    payment_data JSONB,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- access_rightsテーブル作成
CREATE TABLE IF NOT EXISTS access_rights (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    diagnosis_id TEXT NOT NULL,
    access_type TEXT NOT NULL DEFAULT 'full',
    granted_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    purchase_id TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, diagnosis_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_payment_intents_diagnosis_id ON payment_intents(diagnosis_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_access_rights_user_id ON access_rights(user_id);
CREATE INDEX IF NOT EXISTS idx_access_rights_diagnosis_id ON access_rights(diagnosis_id);