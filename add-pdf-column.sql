-- Supabaseのordersテーブルにpdf_dataカラムを追加
-- Supabase SQL Editorで実行してください

-- pdf_dataカラムがまだ存在しない場合のみ追加
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS pdf_data TEXT;

-- カラムにコメントを追加
COMMENT ON COLUMN orders.pdf_data IS 'Base64エンコードされたPDFデータ';