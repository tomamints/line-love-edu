-- Supabaseダッシュボード → SQL Editor で実行してください
-- 恋愛状況に関するカラムを profiles テーブルに追加

-- 1. loveSituation カラムを追加
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS love_situation TEXT;

-- 2. wantToKnow カラムを追加
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS want_to_know TEXT;

-- 3. インデックスを追加（検索性能向上のため）
CREATE INDEX IF NOT EXISTS idx_profiles_love_situation ON profiles(love_situation);
CREATE INDEX IF NOT EXISTS idx_profiles_want_to_know ON profiles(want_to_know);

-- 4. カラムにコメントを追加（ドキュメント用）
COMMENT ON COLUMN profiles.love_situation IS '恋愛状況: beginning(恋の始まり), relationship(交際中), complicated(複雑な恋), ending(復縁・別れ)';
COMMENT ON COLUMN profiles.want_to_know IS '知りたいこと: feelings(相手の気持ち), action(行動指針), past(過去の意味), future(未来予測)';

-- 5. 確認用: テーブル構造を表示
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'profiles' 
-- ORDER BY ordinal_position;

-- 6. 確認用: 実際のデータを確認（最初の5件）
-- SELECT user_id, love_situation, want_to_know 
-- FROM profiles 
-- LIMIT 5;