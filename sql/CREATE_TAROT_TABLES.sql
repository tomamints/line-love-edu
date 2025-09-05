-- タロット使用履歴テーブル
CREATE TABLE IF NOT EXISTS public.tarot_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    tarot_type VARCHAR(50) NOT NULL, -- 'love', 'work', 'money' 
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    card_drawn VARCHAR(100), -- 引いたカードの名前
    card_position VARCHAR(50), -- 'upright', 'reversed'
    result_data JSONB, -- 占い結果の詳細データ
    used_date DATE DEFAULT CURRENT_DATE, -- 使用日
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 1日1回の制限
    CONSTRAINT idx_unique_daily_usage UNIQUE (user_id, tarot_type, used_date)
);

-- タロット使用権限テーブル（1日1回の制限管理）
CREATE TABLE IF NOT EXISTS public.tarot_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    tarot_type VARCHAR(50) NOT NULL, -- 'love', 'work', 'money'
    granted_date DATE NOT NULL, -- 権限が付与された日（日本時間）
    used BOOLEAN DEFAULT FALSE, -- その日に使用したかどうか
    used_at TIMESTAMP WITH TIME ZONE, -- 使用した時刻
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 1ユーザー、1タロットタイプ、1日につき1レコードのみ
    CONSTRAINT idx_unique_permission UNIQUE (user_id, tarot_type, granted_date)
);

-- インデックスを追加（検索パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_tarot_usage_user_date 
ON public.tarot_usage(user_id, used_date);

CREATE INDEX IF NOT EXISTS idx_tarot_permissions_user_date 
ON public.tarot_permissions(user_id, granted_date);

-- RLSを有効化
ALTER TABLE public.tarot_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarot_permissions ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（認証されたユーザーは自分のデータのみアクセス可能）
CREATE POLICY "Users can view own tarot usage" 
ON public.tarot_usage FOR SELECT 
USING (auth.uid()::text = user_id OR user_id LIKE 'line_%');

CREATE POLICY "Users can insert own tarot usage" 
ON public.tarot_usage FOR INSERT 
WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'line_%');

CREATE POLICY "Users can view own tarot permissions" 
ON public.tarot_permissions FOR SELECT 
USING (auth.uid()::text = user_id OR user_id LIKE 'line_%');

CREATE POLICY "Users can manage own tarot permissions" 
ON public.tarot_permissions FOR ALL 
USING (auth.uid()::text = user_id OR user_id LIKE 'line_%')
WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'line_%');

-- コメント追加
COMMENT ON TABLE public.tarot_usage IS '月のタロット占いの使用履歴を記録';
COMMENT ON TABLE public.tarot_permissions IS '月のタロット占いの1日1回制限を管理';
COMMENT ON COLUMN public.tarot_usage.tarot_type IS 'タロットの種類: love（恋愛）, work（仕事）, money（金運）';
COMMENT ON COLUMN public.tarot_permissions.granted_date IS '日本時間での日付（1日1回の制限管理用）';