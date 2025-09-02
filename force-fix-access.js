const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function forceFixAccess() {
    console.log('🔧 アクセス権限を強制的に修正中...\n');
    
    // 特定のユーザーと診断IDで直接更新
    const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
    const diagnosisId = 'diag_1756715414668_3p6heltzc';
    
    // まず既存のレコードを削除
    console.log('1. 既存のレコードを削除...');
    const { error: deleteError } = await supabase
        .from('access_rights')
        .delete()
        .eq('user_id', userId)
        .eq('resource_type', 'diagnosis')
        .eq('resource_id', diagnosisId);
    
    if (deleteError) {
        console.log('  削除エラー（無視可）:', deleteError.message);
    } else {
        console.log('  ✅ 既存レコード削除完了');
    }
    
    // 新しくfullアクセス権限を作成
    console.log('\n2. 新しいfullアクセス権限を作成...');
    const { data: newAccess, error: insertError } = await supabase
        .from('access_rights')
        .insert({
            user_id: userId,
            resource_type: 'diagnosis',
            resource_id: diagnosisId,
            access_level: 'full',
            purchase_id: 'pur_1756798780785_trqmy7650',
            valid_from: new Date().toISOString(),
            valid_until: null
        })
        .select()
        .single();
    
    if (insertError) {
        console.error('  ❌ 作成エラー:', insertError.message);
        return;
    }
    
    console.log('  ✅ 新しいアクセス権限作成完了');
    console.log('    - access_level:', newAccess.access_level);
    console.log('    - user_id:', newAccess.user_id);
    console.log('    - resource_id:', newAccess.resource_id);
    
    // 確認
    console.log('\n3. 確認中...');
    const { data: checkAccess } = await supabase
        .from('access_rights')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_type', 'diagnosis')
        .eq('resource_id', diagnosisId)
        .single();
    
    if (checkAccess && checkAccess.access_level === 'full') {
        console.log('  ✅ 確認OK: access_level = full');
        
        // APIレスポンスも確認
        console.log('\n4. APIレスポンスを確認...');
        const apiUrl = `https://line-love-edu.vercel.app/api/profile-form-v2?action=get-diagnosis&id=${diagnosisId}&userId=${userId}`;
        
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            
            if (data.accessLevel === 'full') {
                console.log('  ✅ API確認OK: accessLevel = full');
                console.log('\n🎉 修正完了！');
                console.log('\n📱 履歴からアクセスするURL:');
                console.log(`https://line-love-edu.vercel.app/lp-otsukisama-unified.html?id=${diagnosisId}&userId=${userId}`);
                console.log('\nこのURLで完全版が表示されるはずです。');
            } else {
                console.log('  ⚠️ API確認NG: accessLevel =', data.accessLevel);
                console.log('  キャッシュの可能性があります。少し待ってから再度お試しください。');
            }
        } catch (err) {
            console.log('  API確認エラー:', err.message);
        }
    } else {
        console.log('  ❌ 確認NG: access_level =', checkAccess?.access_level);
    }
}

forceFixAccess().catch(console.error);