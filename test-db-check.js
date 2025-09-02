// Supabaseクライアントをセットアップ
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function checkDiagnosisData() {
    const diagnosisId = 'a4527187-2f0a-42fa-8fca-9a8c43aa6a04';
    const userId = 'Ub2fcdc91798f5e56e0f9c759c4b7b55f';
    
    console.log('🔍 データベースをチェック中...\n');
    
    // 1. 診断データを確認
    console.log('1. 診断データの確認:');
    const { data: diagnosis, error: diagError } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('diagnosis_id', diagnosisId)
        .single();
    
    if (diagError) {
        console.log('  ❌ 診断データが見つかりません:', diagError.message);
    } else {
        console.log('  ✅ 診断データ found:');
        console.log('    - diagnosis_id:', diagnosis.diagnosis_id);
        console.log('    - user_id:', diagnosis.user_id);
        console.log('    - user_name:', diagnosis.user_name);
        console.log('    - created_at:', diagnosis.created_at);
    }
    
    // 2. ID形式を変えて再検索（idカラムを使用）
    console.log('\n2. idカラムでの検索:');
    const { data: diagnosisById, error: diagByIdError } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('id', diagnosisId)
        .single();
    
    if (diagByIdError) {
        console.log('  ❌ idカラムでも見つかりません:', diagByIdError.message);
    } else {
        console.log('  ✅ 診断データ found (by id):');
        console.log('    - id:', diagnosisById.id);
        console.log('    - user_id:', diagnosisById.user_id);
        console.log('    - user_name:', diagnosisById.user_name);
    }
    
    // 3. このユーザーの最新の診断を確認
    console.log('\n3. ユーザーの最新診断:');
    const { data: userDiagnoses, error: userError } = await supabase
        .from('diagnoses')
        .select('id, diagnosis_id, user_name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (userError) {
        console.log('  ❌ エラー:', userError.message);
    } else if (userDiagnoses.length === 0) {
        console.log('  ❌ このユーザーの診断データなし');
    } else {
        console.log('  ✅ 最新の診断データ:');
        userDiagnoses.forEach((d, i) => {
            console.log(`    ${i+1}. ${d.id || d.diagnosis_id} - ${d.user_name} - ${d.created_at}`);
        });
    }
    
    // 4. アクセス権限を確認
    console.log('\n4. アクセス権限の確認:');
    
    // まず診断IDが存在する場合、そのIDでアクセス権限を確認
    const actualDiagnosisId = diagnosisById?.id || diagnosis?.diagnosis_id || diagnosisId;
    
    const { data: accessRights, error: accessError } = await supabase
        .from('access_rights')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_type', 'diagnosis')
        .eq('resource_id', actualDiagnosisId);
    
    if (accessError) {
        console.log('  ❌ エラー:', accessError.message);
    } else if (accessRights.length === 0) {
        console.log('  ❌ アクセス権限なし');
        
        // 他の診断IDでもチェック
        console.log('\n  別の診断IDでのアクセス権限を検索:');
        const { data: allAccess } = await supabase
            .from('access_rights')
            .select('*')
            .eq('user_id', userId)
            .eq('resource_type', 'diagnosis')
            .limit(5);
        
        if (allAccess && allAccess.length > 0) {
            console.log('  このユーザーのアクセス権限:');
            allAccess.forEach(a => {
                console.log(`    - ${a.resource_id}: ${a.access_level}`);
            });
        }
    } else {
        console.log('  ✅ アクセス権限found:');
        accessRights.forEach(a => {
            console.log('    - access_level:', a.access_level);
            console.log('    - valid_until:', a.valid_until);
            console.log('    - created_at:', a.created_at);
        });
    }
    
    // 5. 購入履歴を確認
    console.log('\n5. 購入履歴の確認:');
    const { data: purchases } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .eq('diagnosis_id', actualDiagnosisId)
        .order('created_at', { ascending: false });
    
    if (purchases && purchases.length > 0) {
        console.log('  ✅ 購入履歴found:');
        purchases.forEach(p => {
            console.log('    - purchase_id:', p.purchase_id);
            console.log('    - amount:', p.amount);
            console.log('    - status:', p.status);
            console.log('    - created_at:', p.created_at);
        });
    } else {
        console.log('  ❌ 購入履歴なし');
    }
}

checkDiagnosisData().catch(console.error);