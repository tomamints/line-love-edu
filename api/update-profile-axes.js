const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    // CORS設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { userId, emotionalExpression, distanceStyle, loveValues, loveEnergy } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        console.log('Updating profile axes for user:', userId);
        console.log('Data:', { emotionalExpression, distanceStyle, loveValues, loveEnergy });
        
        // profilesテーブルを更新
        const { data, error } = await supabase
            .from('profiles')
            .update({
                emotional_expression: emotionalExpression,
                distance_style: distanceStyle,
                love_values: loveValues,
                love_energy: loveEnergy,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .select();
        
        if (error) {
            console.error('Supabase error:', error);
            
            // レコードが存在しない場合は作成
            if (error.code === 'PGRST116') {
                const { data: insertData, error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        user_id: userId,
                        emotional_expression: emotionalExpression,
                        distance_style: distanceStyle,
                        love_values: loveValues,
                        love_energy: loveEnergy,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select();
                
                if (insertError) {
                    console.error('Insert error:', insertError);
                    return res.status(500).json({ error: 'Failed to create profile', details: insertError });
                }
                
                console.log('Profile created:', insertData);
                return res.status(200).json({ 
                    success: true, 
                    message: 'Profile created successfully',
                    data: insertData
                });
            }
            
            return res.status(500).json({ error: 'Failed to update profile', details: error });
        }
        
        console.log('Profile updated:', data);
        
        return res.status(200).json({ 
            success: true, 
            message: 'Profile updated successfully',
            data: data
        });
        
    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: 'Internal server error', message: error.message });
    }
};