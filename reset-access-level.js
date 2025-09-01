const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAccessLevel() {
    const diagnosisId = 'diag_1756713443275_czhq87yzn';
    const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
    
    console.log('アクセス権限をプレビュー（モザイク表示）に設定...');
    
    // アクセス権限をpreviewに更新
    const { data, error } = await supabase
        .from('access_rights')
        .upsert({
            user_id: userId,
            resource_type: 'diagnosis',
            resource_id: diagnosisId,
            access_level: 'preview',
            purchase_id: null
        }, {
            onConflict: 'user_id,resource_type,resource_id'
        })
        .select();
    
    if (error) {
        console.error('エラー:', error);
        return;
    }
    
    console.log('✅ アクセス権限を更新しました:', data);
    
    // 確認
    const { data: checkData } = await supabase
        .from('access_rights')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_type', 'diagnosis')
        .eq('resource_id', diagnosisId)
        .single();
    
    console.log('\n現在のアクセス権限:');
    console.log('- access_level:', checkData.access_level);
    console.log('- purchase_id:', checkData.purchase_id);
    
    console.log('\n🌐 プレビューページ（モザイクあり）:');
    console.log(`http://localhost:3000/lp-otsukisama-unified.html?id=${diagnosisId}&userId=${userId}`);
}

resetAccessLevel();