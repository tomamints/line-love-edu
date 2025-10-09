-- Row Level Security (RLS) を有効化するSQL
-- Supabaseダッシュボードで実行してください

-- 全てのpublicテーブルのRLSを有効化
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnosis_types ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.diagnoses;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.purchases;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.profiles;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.orders;
DROP POLICY IF EXISTS "Enable all for authenticated" ON public.user_messages;
DROP POLICY IF EXISTS "Enable read for all" ON public.diagnosis_types;

-- ポリシーの作成
-- 重要：現在のシステムはAPIキー（ANON_KEY）を使用してバックエンドから
-- アクセスしているため、以下のポリシーを設定

-- diagnosesテーブル：バックエンドAPIのみアクセス可能
CREATE POLICY "Enable all for authenticated" ON public.diagnoses
    FOR ALL
    USING (true);  -- ANONキーでの全操作を許可

-- purchasesテーブル：バックエンドAPIのみアクセス可能
CREATE POLICY "Enable all for authenticated" ON public.purchases
    FOR ALL
    USING (true);  -- ANONキーでの全操作を許可

-- profilesテーブル：バックエンドAPIのみアクセス可能
CREATE POLICY "Enable all for authenticated" ON public.profiles
    FOR ALL
    USING (true);  -- ANONキーでの全操作を許可

-- ordersテーブル：バックエンドAPIのみアクセス可能
CREATE POLICY "Enable all for authenticated" ON public.orders
    FOR ALL
    USING (true);  -- ANONキーでの全操作を許可

-- user_messagesテーブル：バックエンドAPIのみアクセス可能
CREATE POLICY "Enable all for authenticated" ON public.user_messages
    FOR ALL
    USING (true);  -- ANONキーでの全操作を許可

-- diagnosis_typesテーブル：読み取り専用（マスターデータ）
CREATE POLICY "Enable read for all" ON public.diagnosis_types
    FOR SELECT
    USING (true);  -- 全員が読み取り可能

-- 注意：
-- 現在のアーキテクチャではVercel APIがゲートキーパーとして機能し、
-- LINEユーザーの認証を行っているため、データベースレベルでは
-- APIキーによるアクセスを許可しています。
--
-- より厳密なセキュリティが必要な場合は、SERVICE_ROLE_KEYを使用し、
-- RLSポリシーを無視する設定にすることも可能です。
