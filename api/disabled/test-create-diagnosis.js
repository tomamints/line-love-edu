import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, userName, patternId, paymentStatus = 'pending' } = req.body;

  if (!userId || !userName || !patternId) {
    return res.status(400).json({ 
      error: 'userId, userName, and patternId are required' 
    });
  }

  try {
    // 診断データを作成
    const { data: diagnosis, error } = await supabase
      .from('diagnoses')
      .insert({
        line_user_id: userId,
        user_name: userName,
        pattern_id: patternId,
        payment_status: paymentStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating diagnosis:', error);
      return res.status(500).json({ error: 'Failed to create diagnosis' });
    }

    console.log('Created test diagnosis:', diagnosis);

    return res.status(200).json({
      success: true,
      diagnosis: {
        id: diagnosis.id,
        userId: diagnosis.line_user_id,
        userName: diagnosis.user_name,
        patternId: diagnosis.pattern_id,
        paymentStatus: diagnosis.payment_status,
        createdAt: diagnosis.created_at
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}