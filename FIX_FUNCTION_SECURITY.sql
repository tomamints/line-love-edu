-- Function search_path セキュリティ修正
-- Supabaseダッシュボードで実行してください

-- grant_access_on_purchase関数のsearch_pathを修正
-- 既存の関数を確認
DROP FUNCTION IF EXISTS public.grant_access_on_purchase(text, text);

-- 関数を再作成（search_pathを設定）
CREATE OR REPLACE FUNCTION public.grant_access_on_purchase(
    p_user_id text,
    p_diagnosis_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- access_rightsテーブルにフルアクセス権限を追加または更新
    INSERT INTO public.access_rights (
        user_id,
        resource_type,
        resource_id,
        access_level,
        purchase_id,
        valid_from,
        valid_until
    ) VALUES (
        p_user_id,
        'diagnosis',
        p_diagnosis_id,
        'full',
        'purchase_' || NOW()::text,
        NOW(),
        NULL  -- 無期限
    )
    ON CONFLICT (user_id, resource_type, resource_id)
    DO UPDATE SET
        access_level = 'full',
        purchase_id = EXCLUDED.purchase_id,
        valid_from = EXCLUDED.valid_from;
END;
$$;

-- 関数の権限を設定
GRANT EXECUTE ON FUNCTION public.grant_access_on_purchase(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.grant_access_on_purchase(text, text) TO authenticated;

-- その他のカスタム関数がある場合も同様に修正
-- 例：
-- ALTER FUNCTION public.your_function_name() SET search_path = public;

-- 注意：
-- search_pathを設定することで、SQL injection攻撃を防ぎ、
-- 関数が予期しないスキーマのオブジェクトにアクセスすることを防ぎます。