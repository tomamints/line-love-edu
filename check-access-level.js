const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAccessLevel() {
    const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
    
    console.log('最新の診断とアクセス権限を確認');
    console.log('='.repeat(60));
    
    // 最新の診断を取得
    const { data: diagnoses, error } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
    
    if (error || !diagnoses || diagnoses.length === 0) {
        console.error('診断が見つかりません');
        return;
    }
    
    const diagnosis = diagnoses[0];
    console.log('診断ID:', diagnosis.id);
    console.log('作成日時:', new Date(diagnosis.created_at).toLocaleString('ja-JP'));
    console.log('');
    
    // アクセス権限を確認
    const { data: accessRights, error: accessError } = await supabase
        .from('access_rights')
        .select('*')
        .eq('user_id', userId)
        .eq('resource_type', 'diagnosis')
        .eq('resource_id', diagnosis.id);
    
    if (accessError) {
        console.error('アクセス権限取得エラー:', accessError);
        return;
    }
    
    console.log('アクセス権限レコード数:', accessRights ? accessRights.length : 0);
    
    if (accessRights && accessRights.length > 0) {
        for (const access of accessRights) {
            console.log('-'.repeat(40));
            console.log('アクセス権限ID:', access.id);
            console.log('アクセスレベル:', access.access_level);
            console.log('購入ID:', access.purchase_id || 'なし');
            console.log('作成日時:', new Date(access.created_at).toLocaleString('ja-JP'));
            
            if (access.access_level === 'full') {
                console.log('⚠️ フルアクセス権限が付与されています！');
                if (!access.purchase_id) {
                    console.log('❌ 購入IDがないのにフルアクセスです！');
                }
            } else if (access.access_level === 'preview') {
                console.log('✅ プレビュー権限（モザイク表示）');
            }
        }
    } else {
        console.log('❌ アクセス権限が設定されていません');
    }
    
    console.log('');
    console.log('診断URL:');
    console.log(`http://localhost:3000/lp-otsukisama-unified.html?id=${diagnosis.id}&userId=${userId}`);
    
    // APIから取得して確認
    console.log('');
    console.log('APIレスポンス確認:');
    const fetch = require('node-fetch');
    const apiResponse = await fetch(`http://localhost:3000/api/profile-form-v2?action=get-diagnosis&id=${diagnosis.id}&userId=${userId}`);
    const apiData = await apiResponse.json();
    
    console.log('APIから返されたアクセスレベル:', apiData.accessLevel);
}

checkAccessLevel();