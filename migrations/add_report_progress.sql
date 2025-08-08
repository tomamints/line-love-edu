-- Supabaseのordersテーブルにreport_progressカラムを追加
-- このSQLをSupabaseのSQL Editorで実行してください

-- report_progressカラムを追加（JSONB型で進捗データを保存）
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS report_progress JSONB;

-- インデックスを追加（高速化）
CREATE INDEX IF NOT EXISTS idx_orders_report_progress 
ON orders((report_progress IS NOT NULL));

-- コメントを追加
COMMENT ON COLUMN orders.report_progress IS 'レポート生成の進捗データ（ステップ、中間データなど）';

-- 確認用：テーブル構造を表示
-- \d orders