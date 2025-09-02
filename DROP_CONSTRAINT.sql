-- Supabaseダッシュボードで実行するSQL
-- 
-- 手順:
-- 1. Supabaseダッシュボード（https://app.supabase.com）にログイン
-- 2. プロジェクトを選択
-- 3. 左側メニューの「SQL Editor」をクリック
-- 4. 新しいクエリを作成
-- 5. 以下のSQLを貼り付けて実行

-- unique_user_diagnosis制約を削除
ALTER TABLE diagnoses 
DROP CONSTRAINT IF EXISTS unique_user_diagnosis;

-- 制約が削除されたか確認
SELECT 
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint 
WHERE conrelid = 'diagnoses'::regclass;

-- これで同じユーザーが同じ生年月日で複数の診断を作成できるようになります