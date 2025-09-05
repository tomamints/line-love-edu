-- タロットテーブルのRLSポリシーを修正
-- 既存のポリシーを削除してから再作成

-- 1. 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view own tarot usage" ON public.tarot_usage;
DROP POLICY IF EXISTS "Users can insert own tarot usage" ON public.tarot_usage;
DROP POLICY IF EXISTS "Users can view own tarot permissions" ON public.tarot_permissions;
DROP POLICY IF EXISTS "Users can manage own tarot permissions" ON public.tarot_permissions;

-- 2. RLSを一旦無効化してから再有効化
ALTER TABLE public.tarot_usage DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarot_permissions DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.tarot_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarot_permissions ENABLE ROW LEVEL SECURITY;

-- 3. 新しいポリシーを作成（より緩い条件）
-- tarot_usage: 全員が読み書き可能（LINEユーザー用）
CREATE POLICY "Allow all for tarot usage"
ON public.tarot_usage
FOR ALL
USING (true)
WITH CHECK (true);

-- tarot_permissions: 全員が読み書き可能（LINEユーザー用）
CREATE POLICY "Allow all for tarot permissions"
ON public.tarot_permissions
FOR ALL
USING (true)
WITH CHECK (true);

-- 4. テーブルの存在と設定を確認
SELECT
    tablename,
    rowsecurity,
    CASE
        WHEN rowsecurity THEN '✅ RLS有効'
        ELSE '❌ RLS無効'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('tarot_usage', 'tarot_permissions');

-- 5. ポリシーの確認
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('tarot_usage', 'tarot_permissions')
ORDER BY tablename, policyname;
