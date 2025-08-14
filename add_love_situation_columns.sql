-- 恋愛状況に関するカラムを profiles テーブルに追加
-- Supabaseのダッシュボードで実行してください

-- loveSituation カラムを追加
-- beginning: 恋の始まり・相手との距離感
-- relationship: 交際中の相手とのこと
-- complicated: 複雑な事情を抱える恋
-- ending: 復縁・別れ・終わった恋
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS love_situation TEXT;

-- wantToKnow カラムを追加
-- feelings: 相手が今、どんな気持ちなのか
-- action: 今、自分がどうしたらいいか
-- past: 過去（出来事）の意味や理由
-- future: これからどうなっていくのか
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS want_to_know TEXT;

-- インデックスを追加（検索性能向上のため）
CREATE INDEX IF NOT EXISTS idx_profiles_love_situation ON profiles(love_situation);
CREATE INDEX IF NOT EXISTS idx_profiles_want_to_know ON profiles(want_to_know);

-- 既存データに対するデフォルト値の設定（必要に応じて）
-- UPDATE profiles SET love_situation = 'beginning' WHERE love_situation IS NULL;
-- UPDATE profiles SET want_to_know = 'feelings' WHERE want_to_know IS NULL;