import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    // 購入済みの診断履歴を取得
    const { data: diagnoses, error } = await supabase
      .from('diagnoses')
      .select('*')
      .eq('line_user_id', userId)
      .eq('payment_status', 'completed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching diagnoses:', error);
      return res.status(500).json({ error: 'Failed to fetch diagnoses' });
    }

    // 診断データを整形
    const formattedDiagnoses = diagnoses.map(diagnosis => ({
      id: diagnosis.id,
      patternId: diagnosis.pattern_id,
      userName: diagnosis.user_name,
      createdAt: diagnosis.created_at,
      viewUrl: `/lp-otsukisama-unified.html?id=${diagnosis.pattern_id}&userId=${userId}&diagnosisId=${diagnosis.id}`
    }));

    return res.status(200).json({
      success: true,
      diagnoses: formattedDiagnoses,
      count: formattedDiagnoses.length
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}