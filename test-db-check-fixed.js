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
    
    // 1. 診断データを確認（idカラムを使用）
    console.log('1. 診断データの確認 (id):');
    const { data: diagnoses, error: diagError } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('id', diagnosisId);
    
    if (diagError) {
        console.log('  ❌ エラー:', diagError.message);
    } else if (!diagnoses || diagnoses.length === 0) {
        console.log('  ❌ 診断データが見つかりません');
    } else {
        console.log('  ✅ 診断データ found:');
        diagnoses.forEach(d => {
            console.log('    - id:', d.id);
            console.log('    - user_id:', d.user_id);
            console.log('    - user_name:', d.user_name);
            console.log('    - diagnosis_type_id:', d.diagnosis_type_id);
            console.log('    - created_at:', d.created_at);
        });
    }
    
    // 2. このユーザーの最新の診断を確認
    console.log('\n2. ユーザーの最新診断:');
    const { data: userDiagnoses, error: userError } = await supabase
        .from('diagnoses')
        .select('id, user_name, diagnosis_type_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (userError) {
        console.log('  ❌ エラー:', userError.message);
    } else if (!userDiagnoses || userDiagnoses.length === 0) {
        console.log('  ❌ このユーザーの診断データなし');
    } else {
        console.log('  ✅ 最新の診断データ:');
        userDiagnoses.forEach((d, i) => {
            console.log(`    ${i+1}. ${d.id} - ${d.user_name} - ${d.created_at}`);
        });
        
        // 正しい診断IDを取得
        if (userDiagnoses.length > 0) {
            const latestDiagnosisId = userDiagnoses[0].id;
            console.log(`\n  ℹ️ 最新の診断ID: ${latestDiagnosisId}`);
            console.log(`  ℹ️ テスト中のID: ${diagnosisId}`);
            
            if (latestDiagnosisId !== diagnosisId) {
                console.log('  ⚠️ IDが一致しません！正しいIDは上記の最新診断IDかもしれません。');
            }
        }
    }
    
    // 3. アクセス権限を確認
    console.log('\n3. アクセス権限の確認:');
    const { data: accessRights, error: accessError } = await supabase
        .from('access_rights')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_type', 'diagnosis');
    
    if (accessError) {
        console.log('  ❌ エラー:', accessError.message);
    } else if (!accessRights || accessRights.length === 0) {
        console.log('  ❌ アクセス権限なし');
    } else {
        console.log('  ✅ アクセス権限found:');
        accessRights.forEach(a => {
            console.log(`    - resource_id: ${a.resource_id}`);
            console.log(`      access_level: ${a.access_level}`);
            console.log(`      valid_until: ${a.valid_until}`);
            console.log(`      created_at: ${a.created_at}`);
            console.log('    ---');
        });
    }
    
    // 4. 購入履歴を確認
    console.log('\n4. 購入履歴の確認:');
    const { data: purchases } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (purchases && purchases.length > 0) {
        console.log('  ✅ 購入履歴found:');
        purchases.forEach(p => {
            console.log('    - purchase_id:', p.purchase_id);
            console.log('    - diagnosis_id:', p.diagnosis_id);
            console.log('    - amount:', p.amount);
            console.log('    - status:', p.status);
            console.log('    - created_at:', p.created_at);
            console.log('    ---');
        });
    } else {
        console.log('  ❌ 購入履歴なし');
    }
    
    // 5. 最終確認：正しいIDでアクセス権限を再確認
    if (userDiagnoses && userDiagnoses.length > 0) {
        const correctId = userDiagnoses[0].id;
        console.log(`\n5. 正しいIDでアクセス権限を再確認 (${correctId}):`);
        
        const { data: correctAccess } = await supabase
            .from('access_rights')
            .select('*')
            .eq('user_id', userId)
            .eq('resource_type', 'diagnosis')
            .eq('resource_id', correctId)
            .single();
        
        if (correctAccess) {
            console.log('  ✅ アクセス権限found:');
            console.log('    - access_level:', correctAccess.access_level);
            console.log('    - valid_until:', correctAccess.valid_until);
            
            if (correctAccess.access_level === 'full') {
                console.log('\n  💡 解決策:');
                console.log(`    履歴のURLを以下に変更してください:`);
                console.log(`    https://line-love-edu.vercel.app/lp-otsukisama-unified.html?id=${correctId}&userId=${userId}`);
            }
        } else {
            console.log('  ❌ このIDでもアクセス権限なし');
        }
    }
}

checkDiagnosisData().catch(console.error);