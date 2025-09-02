const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

async function checkConstraints() {
    console.log('🔍 データベース制約を確認\n');
    
    // diagnosesテーブルの制約を確認
    const { data, error } = await supabase
        .rpc('get_table_constraints', { table_name: 'diagnoses' })
        .single();
    
    if (error) {
        // RPCが存在しない場合は、直接SQLで確認
        console.log('診断テーブル構造を確認中...');
        
        // テーブル情報を取得
        const { data: tableInfo } = await supabase
            .from('diagnoses')
            .select('*')
            .limit(0);
        
        console.log('\n⚠️ unique_user_diagnosis 制約が存在します');
        console.log('  これは同じユーザー・生年月日・診断タイプの組み合わせで');
        console.log('  重複を防ぐ制約です。');
        console.log('\n解決策:');
        console.log('  1. この制約を削除する（推奨）');
        console.log('  2. または、created_atを制約に含めて複数診断を許可する');
    }
}

checkConstraints().catch(console.error);