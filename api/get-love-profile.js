import { createClient } from '@supabase/supabase-js';

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数チェック
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
    keyValue: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'undefined'
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    // 環境変数の早期チェック
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
    if (checkOnly === 'true') {
      const isValidLineUserId = /^U[0-9a-f]{32}$/i.test(userId);

      if (isValidLineUserId) {
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('userId', userId)
            .single();

          if (!existingProfile) {
            await supabase
              .from('profiles')
              .insert({
                userId,
                createdAt: new Date().toISOString(),
                source: 'line_tarot',
                isMinimalProfile: true
              });
          }
        } catch (profileError) {
          console.warn('Profile creation error (non-critical):', profileError.message);
        }

        return res.status(200).json({
          success: true,
          exists: true,
          hasProfile: true
        });
      }

      let profile = null;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('userId', userId)
          .single();
        profile = data;
      } catch (dbError) {
        console.warn('profiles check error:', dbError.message);
      }

      const exists = !!profile;

      return res.status(200).json({
        success: true,
        exists,
        hasProfile: exists
      });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        error: 'Profile not found or incomplete',
        message: 'Please complete the questionnaire first'
      });
    }

    const normalizedName = profile.userName || profile.name || profile.personalInfo?.userName || null;
    const normalizedBirthDate = profile.birthDate || profile.birthdate || profile.personalInfo?.userBirthdate || null;

    const responseProfile = {
      userName: normalizedName,
      name: normalizedName,
      birthDate: normalizedBirthDate,
      birthdate: normalizedBirthDate,
      moonPatternId: profile.moonPatternId,
      diagnosisType: profile.diagnosisType,
      emotionalExpression: profile.emotionalExpression || profile.personalInfo?.emotionalExpression,
      distanceStyle: profile.distanceStyle || profile.personalInfo?.distanceStyle,
      loveValues: profile.loveValues || profile.personalInfo?.loveValues,
      loveEnergy: profile.loveEnergy || profile.personalInfo?.loveEnergy
    };

    if (profile.diagnosisType === 'otsukisama') {
      responseProfile.diagnosisType = 'otsukisama';
    }

    return res.status(200).json({
      success: true,
      profile: responseProfile,
      userId
    });
    } catch (error) {
      console.error('Error fetching love profile:', error);
      return res.status(500).json({
        error: 'Failed to fetch profile',
        message: error.message
      });
    }
  } catch (topLevelError) {
    console.error('Top-level error in handler:', topLevelError);
    return res.status(500).json({
      error: 'Internal server error',
      message: topLevelError.message || 'Unknown error occurred'
    });
  }
}