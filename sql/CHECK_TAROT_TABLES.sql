-- タロット関連テーブルの存在確認と内容チェック

-- 1. テーブルの存在確認
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ 作成済み'
        ELSE '❌ 未作成'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tarot_usage', 'tarot_permissions');

-- 2. tarot_usage テーブルの構造確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'tarot_usage'
ORDER BY ordinal_position;

-- 3. tarot_permissions テーブルの構造確認
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'tarot_permissions'
ORDER BY ordinal_position;

-- 4. 制約の確認
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_catalog = kcu.constraint_catalog
    AND tc.constraint_schema = kcu.constraint_schema
    AND tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name IN ('tarot_usage', 'tarot_permissions')
ORDER BY tc.table_name, tc.constraint_type;

-- 5. インデックスの確認
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('tarot_usage', 'tarot_permissions');

-- 6. RLSの状態確認
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('tarot_usage', 'tarot_permissions');

-- 7. データ件数確認
SELECT 'tarot_usage' as table_name, COUNT(*) as row_count FROM tarot_usage
UNION ALL
SELECT 'tarot_permissions', COUNT(*) FROM tarot_permissions;