const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function simulatePaymentCompletion() {
    console.log('支払い完了シミュレーション');
    console.log('='.repeat(60));
    
    const diagnosisId = 'diag_1756715414668_3p6heltzc';
    const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
    const diagnosisType = 'otsukisama';
    
    // 1. Get diagnosis type info
    const { data: diagType } = await supabase
        .from('diagnosis_types')
        .select('name')
        .eq('id', diagnosisType)
        .single();
    
    const productName = diagType?.name || 'おつきさま診断';
    
    // 2. Create purchase record
    const purchaseId = `pur_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const amountInYen = 980; // 980円（整数）
    
    console.log('購入記録を作成:');
    console.log('  - purchase_id:', purchaseId);
    console.log('  - amount:', amountInYen, '円 (type:', typeof amountInYen, ')');
    console.log('  - user_id:', userId);
    console.log('  - diagnosis_id:', diagnosisId);
    
    const purchaseData = {
        purchase_id: purchaseId,
        user_id: userId,
        diagnosis_id: diagnosisId,
        product_type: 'diagnosis',
        product_id: diagnosisType,
        product_name: productName,
        amount: amountInYen, // 整数の980
        currency: 'JPY',
        payment_method: 'stripe',
        stripe_session_id: `cs_test_${Date.now()}`,
        stripe_payment_intent_id: `pi_test_${Date.now()}`,
        status: 'completed',
        completed_at: new Date().toISOString(),
        metadata: {
            test: true,
            simulated: true
        }
    };
    
    const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert([purchaseData])
        .select()
        .single();
    
    if (purchaseError) {
        console.error('❌ 購入記録作成エラー:', purchaseError);
        return;
    }
    
    console.log('✅ 購入記録作成成功:', purchase.purchase_id);
    
    // 3. Grant access rights
    console.log('\nアクセス権限を付与...');
    
    const { data: accessRight, error: accessError } = await supabase
        .from('access_rights')
        .upsert({
            user_id: userId,
            resource_type: 'diagnosis',
            resource_id: diagnosisId,
            access_level: 'full',
            purchase_id: purchaseId,
            valid_from: new Date().toISOString(),
            valid_until: null
        }, {
            onConflict: 'user_id,resource_type,resource_id'
        })
        .select()
        .single();
    
    if (accessError) {
        console.error('❌ アクセス権限付与エラー:', accessError);
    } else {
        console.log('✅ アクセス権限付与成功');
        console.log('  - access_level:', accessRight.access_level);
    }
    
    // 4. Verify the diagnosis can be accessed
    console.log('\n診断結果の確認...');
    
    const { data: diagnosis, error: diagError } = await supabase
        .from('diagnoses')
        .select('*, access_rights!inner(*)')
        .eq('id', diagnosisId)
        .eq('access_rights.user_id', userId)
        .single();
    
    if (diagError) {
        console.error('❌ 診断取得エラー:', diagError);
    } else {
        console.log('✅ 診断取得成功');
        console.log('  - diagnosis_id:', diagnosis.id);
        console.log('  - access_level:', diagnosis.access_rights[0].access_level);
        console.log('  - purchase_id:', diagnosis.access_rights[0].purchase_id);
    }
    
    console.log('\n✨ 支払い処理完了！');
    console.log('診断結果ページで確認してください:');
    console.log(`http://localhost:3000/lp-otsukisama-unified.html?id=${diagnosisId}`);
}

simulatePaymentCompletion();