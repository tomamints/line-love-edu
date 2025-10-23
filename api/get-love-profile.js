const { createClient } = require('@supabase/supabase-js');

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;

// 環境変数チェック
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  try {
    if (!supabaseUrl || !supabaseKey) {
      console.error('Environment variables missing');
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Required environment variables are not configured'
      });
    }

    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, checkOnly } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // checkOnly=trueの場合は存在確認のみ
    if (checkOnly === 'true') {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('user_id', userId)
          .single();

        const exists = !error && !!profile;

        return res.status(200).json({
          success: true,
          exists,
          hasProfile: exists
        });
      } catch (checkError) {
        console.warn('Profile check error:', checkError.message);
        return res.status(200).json({
          success: true,
          exists: false,
          hasProfile: false
        });
      }
    }

    // フルプロファイル取得
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('user_name, birth_date, user_id')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      console.warn('Profile not found:', error?.message);
      return res.status(404).json({
        error: 'Profile not found',
        message: 'Please complete the questionnaire first'
      });
    }

    // レスポンス用データ整形
    const responseProfile = {
      userName: profile.user_name,
      name: profile.user_name,
      birthDate: profile.birth_date,
      birthdate: profile.birth_date,
      partnerBirthDate: profile.partner_birth_date
    };

    return res.status(200).json({
      success: true,
      profile: responseProfile,
      userId: profile.user_id
    });

  } catch (error) {
    console.error('Error fetching love profile:', error);
    return res.status(500).json({
      error: 'Failed to fetch profile',
      message: error.message
    });
  }
};
