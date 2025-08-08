-- profilesテーブルにprofile_dataカラムを追加
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT '{}';

-- 既存データを移行（必要に応じて）
UPDATE profiles 
SET profile_data = jsonb_build_object(
  'userName', user_name,
  'birthDate', birth_date,
  'gender', gender,
  'partnerName', partner_name,
  'partnerBirthDate', partner_birth_date,
  'partnerGender', partner_gender
)
WHERE profile_data IS NULL OR profile_data = '{}';
