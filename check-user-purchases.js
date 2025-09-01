const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserPurchases() {
    const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
    const diagnosisId = 'diag_1756715414668_3p6heltzc';
    
    console.log('ユーザーの購入状況確認');
    console.log('='.repeat(60));
    console.log('User ID:', userId);
    console.log('Diagnosis ID:', diagnosisId);
    console.log('');
    
    // 1. Check purchases
    console.log('1. 購入履歴:');
    const { data: purchases, error: purchaseError } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('diagnosis_id', diagnosisId)
        .order('created_at', { ascending: false });
    
    if (purchaseError) {
        console.error('Error:', purchaseError);
    } else if (purchases && purchases.length > 0) {
        purchases.forEach(p => {
            console.log(`  - ${p.purchase_id}`);
            console.log(`    Amount: ${p.amount}円`);
            console.log(`    Status: ${p.status}`);
            console.log(`    Created: ${p.created_at}`);
        });
    } else {
        console.log('  購入履歴なし');
    }
    
    // 2. Check access rights
    console.log('\n2. アクセス権限:');
    const { data: access, error: accessError } = await supabase
        .from('access_rights')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_id', diagnosisId)
        .single();
    
    if (accessError) {
        if (accessError.code === 'PGRST116') {
            console.log('  アクセス権限なし');
        } else {
            console.error('Error:', accessError);
        }
    } else if (access) {
        console.log(`  - Access Level: ${access.access_level}`);
        console.log(`  - Purchase ID: ${access.purchase_id}`);
        console.log(`  - Valid From: ${access.valid_from}`);
    }
    
    // 3. Check diagnosis
    console.log('\n3. 診断データ:');
    const { data: diagnosis, error: diagError } = await supabase
        .from('diagnoses')
        .select('id, user_id, created_at, diagnosis_type_id')
        .eq('id', diagnosisId)
        .single();
    
    if (diagError) {
        console.error('Error:', diagError);
    } else if (diagnosis) {
        console.log(`  - Created: ${diagnosis.created_at}`);
        console.log(`  - Type: ${diagnosis.diagnosis_type_id}`);
    }
}

checkUserPurchases();