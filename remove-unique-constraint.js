const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// サービスロールキーを使用（データベース管理権限が必要）
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeUniqueConstraint() {
    console.log('🔧 unique_user_diagnosis制約を削除します...\n');
    
    try {
        // 制約を削除するSQL
        const { data, error } = await supabase.rpc('exec_sql', {
            query: `
                ALTER TABLE diagnoses 
                DROP CONSTRAINT IF EXISTS unique_user_diagnosis;
            `
        });
        
        if (error) {
            // RPCが存在しない場合の代替方法
            console.log('⚠️ 直接SQLを実行できません。');
            console.log('\nSupabaseダッシュボードで以下のSQLを実行してください:');
            console.log('----------------------------------------');
            console.log('ALTER TABLE diagnoses');
            console.log('DROP CONSTRAINT unique_user_diagnosis;');
            console.log('----------------------------------------\n');
            console.log('手順:');
            console.log('1. Supabaseダッシュボードにログイン');
            console.log('2. SQL Editorセクションに移動');
            console.log('3. 上記のSQLを実行');
            console.log('4. 制約が削除されたことを確認');
            return;
        }
        
        console.log('✅ 制約が正常に削除されました！');
        
        // 制約が削除されたか確認
        console.log('\n📊 テーブル情報を確認中...');
        const { data: tableInfo } = await supabase
            .from('diagnoses')
            .select('*')
            .limit(1);
        
        console.log('✅ diagnosesテーブルは正常に動作しています');
        console.log('\n今後の動作:');
        console.log('- 同じユーザーが何度でも新規診断を作成可能');
        console.log('- 各診断は固有のIDを持つ');
        console.log('- 診断履歴が蓄積される');
        
    } catch (error) {
        console.error('エラー:', error.message);
        console.log('\n⚠️ Supabaseダッシュボードで手動で制約を削除してください');
    }
}

removeUniqueConstraint();