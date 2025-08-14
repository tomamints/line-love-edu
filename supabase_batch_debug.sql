-- Supabaseのordersテーブルにbatch_debugカラムを追加
-- このSQLをSupabaseのSQL Editorで実行してください

-- batch_debugカラムを追加（JSONB型）
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS batch_debug JSONB;

-- インデックスを追加（検索性能向上のため）
CREATE INDEX IF NOT EXISTS idx_orders_batch_debug 
ON orders USING gin(batch_debug);

-- コメントを追加
COMMENT ON COLUMN orders.batch_debug IS 'Batch APIのデバッグ情報（一時的）';

-- 確認用：テーブル構造を表示
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'orders'
-- ORDER BY ordinal_position;