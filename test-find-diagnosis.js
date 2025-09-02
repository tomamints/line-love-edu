const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY  
);

async function findDiagnosis() {
    console.log('🔍 診断データを検索中...\n');
    
    // 最新の診断データを取得
    const { data: diagnoses, error } = await supabase
        .from('diagnoses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
    
    if (error) {
        console.log('❌ エラー:', error.message);
        return;
    }
    
    if (!diagnoses || diagnoses.length === 0) {
        console.log('❌ 診断データがありません');
        return;
    }
    
    console.log(`✅ ${diagnoses.length}件の診断データが見つかりました:\n`);
    
    diagnoses.forEach((d, i) => {
        console.log(`${i+1}. 診断ID: ${d.id}`);
        console.log(`   ユーザーID: ${d.user_id}`);
        console.log(`   ユーザー名: ${d.user_name}`);
        console.log(`   診断タイプ: ${d.diagnosis_type_id}`);
        console.log(`   作成日時: ${d.created_at}`);
        console.log('   ---');
    });
    
    // アクセス権限も確認
    console.log('\n📋 アクセス権限の確認:\n');
    
    for (const diagnosis of diagnoses.slice(0, 3)) {
        const { data: access } = await supabase
            .from('access_rights')
            .select('*')
            .eq('resource_id', diagnosis.id)
            .eq('resource_type', 'diagnosis')
            .single();
        
        if (access) {
            console.log(`診断ID ${diagnosis.id}:`);
            console.log(`  - ユーザー: ${access.user_id}`);
            console.log(`  - アクセスレベル: ${access.access_level}`);
            console.log(`  - 有効期限: ${access.valid_until || '無期限'}`);
            
            if (access.access_level === 'full') {
                console.log(`\n💡 テスト用URL:`);
                console.log(`https://line-love-edu.vercel.app/lp-otsukisama-unified.html?id=${diagnosis.id}&userId=${access.user_id}`);
            }
        }
    }
}

findDiagnosis().catch(console.error);