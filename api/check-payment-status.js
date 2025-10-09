/**
 * 決済ステータス確認API
 * 診断IDから決済が完了しているかを確認
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

module.exports = async function handler(req, res) {
    // CORSヘッダーを設定
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { diagnosisId } = req.query;
    
    if (!diagnosisId) {
        return res.status(400).json({ error: 'Diagnosis ID is required' });
    }
    
    try {
        // Supabaseが利用可能な場合
        if (supabase) {
            // purchasesテーブルから決済情報を確認
            const { data: purchase, error } = await supabase
                .from('purchases')
                .select('*')
                .eq('diagnosis_id', diagnosisId)
                .or('status.eq.completed,payment_status.eq.completed')
                .single();
            
            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('Database error:', error);
            }
            
            // 決済が存在し、完了している場合
            if (purchase) {
                console.log(`Payment found for diagnosis ${diagnosisId}:`, purchase.id);
                return res.json({
                    isPaid: true,
                    purchaseId: purchase.id,
                    paymentMethod: purchase.payment_method,
                    completedAt: purchase.completed_at
                });
            }
        }
        
        // 決済が見つからない場合
        return res.json({
            isPaid: false,
            diagnosisId: diagnosisId
        });
        
    } catch (error) {
        console.error('Error checking payment status:', error);
        return res.status(500).json({
            error: 'Failed to check payment status',
            details: error.message
        });
    }
}
