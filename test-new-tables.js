/**
 * 新しいテーブル構造の動作確認スクリプト
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

async function testTables() {
    console.log('=== 新テーブル構造の動作確認 ===\n');
    
    try {
        // 1. diagnosis_typesテーブルの確認
        console.log('1. diagnosis_typesテーブルの確認:');
        const { data: types, error: typesError } = await supabase
            .from('diagnosis_types')
            .select('*');
        
        if (typesError) {
            console.log('❌ diagnosis_typesテーブル:', typesError.message);
        } else {
            console.log('✅ diagnosis_typesテーブル: 存在します');
            console.log('   診断タイプ数:', types.length);
            types.forEach(t => {
                console.log(`   - ${t.id}: ${t.name} (¥${t.price})`);
            });
        }
        
        // 2. diagnosesテーブルの確認
        console.log('\n2. diagnosesテーブルの確認:');
        const { data: diagnoses, error: diagError } = await supabase
            .from('diagnoses')
            .select('*')
            .limit(5);
        
        if (diagError) {
            console.log('❌ diagnosesテーブル:', diagError.message);
        } else {
            console.log('✅ diagnosesテーブル: 存在します');
            const { count } = await supabase
                .from('diagnoses')
                .select('*', { count: 'exact', head: true });
            console.log('   診断数:', count || 0);
        }
        
        // 3. purchasesテーブルの確認
        console.log('\n3. purchasesテーブルの確認:');
        const { data: purchases, error: purchError } = await supabase
            .from('purchases')
            .select('*')
            .limit(5);
        
        if (purchError) {
            console.log('❌ purchasesテーブル:', purchError.message);
        } else {
            console.log('✅ purchasesテーブル: 存在します');
            const { count } = await supabase
                .from('purchases')
                .select('*', { count: 'exact', head: true });
            console.log('   購入履歴数:', count || 0);
        }
        
        // 4. access_rightsテーブルの確認
        console.log('\n4. access_rightsテーブルの確認:');
        const { data: rights, error: rightsError } = await supabase
            .from('access_rights')
            .select('*')
            .limit(5);
        
        if (rightsError) {
            console.log('❌ access_rightsテーブル:', rightsError.message);
        } else {
            console.log('✅ access_rightsテーブル: 存在します');
            const { count } = await supabase
                .from('access_rights')
                .select('*', { count: 'exact', head: true });
            console.log('   アクセス権限数:', count || 0);
        }
        
        // 5. テスト診断データの作成
        console.log('\n5. テスト診断データの作成:');
        const testDiagnosisId = `diag_test_${Date.now()}`;
        const testUserId = 'test_user_' + Math.random().toString(36).substr(2, 9);
        
        const { data: newDiagnosis, error: createError } = await supabase
            .from('diagnoses')
            .insert({
                id: testDiagnosisId,
                user_id: testUserId,
                diagnosis_type_id: 'otsukisama',
                user_name: 'テストユーザー',
                birth_date: '1990-05-15',
                result_data: {
                    moon_pattern_id: 43,
                    moon_phase: '十六夜',
                    hidden_moon_phase: '十三夜',
                    emotional_expression: 'straight',
                    distance_style: 'independent',
                    love_values: 'romantic',
                    love_energy: 'intense'
                }
            })
            .select()
            .single();
        
        if (createError) {
            console.log('❌ 診断作成エラー:', createError.message);
        } else {
            console.log('✅ テスト診断を作成しました');
            console.log('   診断ID:', newDiagnosis.id);
            console.log('   ユーザーID:', newDiagnosis.user_id);
            
            // 6. アクセス権限の付与
            console.log('\n6. アクセス権限の付与:');
            const { data: accessRight, error: accessError } = await supabase
                .from('access_rights')
                .insert({
                    user_id: testUserId,
                    resource_type: 'diagnosis',
                    resource_id: testDiagnosisId,
                    access_level: 'preview'
                })
                .select()
                .single();
            
            if (accessError) {
                console.log('❌ アクセス権限付与エラー:', accessError.message);
            } else {
                console.log('✅ アクセス権限を付与しました');
                console.log('   アクセスレベル:', accessRight.access_level);
            }
            
            // 7. データの取得テスト
            console.log('\n7. データ取得テスト:');
            const { data: fetchedDiagnosis, error: fetchError } = await supabase
                .from('diagnoses')
                .select(`
                    *,
                    diagnosis_types (
                        name,
                        price
                    )
                `)
                .eq('id', testDiagnosisId)
                .single();
            
            if (fetchError) {
                console.log('❌ データ取得エラー:', fetchError.message);
            } else {
                console.log('✅ 診断データを取得しました');
                console.log('   診断タイプ:', fetchedDiagnosis.diagnosis_types?.name);
                console.log('   価格:', fetchedDiagnosis.diagnosis_types?.price);
                console.log('   月相:', fetchedDiagnosis.result_data?.moon_phase);
            }
            
            // クリーンアップ（テストデータの削除）
            console.log('\n8. テストデータのクリーンアップ:');
            await supabase.from('access_rights')
                .delete()
                .eq('resource_id', testDiagnosisId);
            
            await supabase.from('diagnoses')
                .delete()
                .eq('id', testDiagnosisId);
            
            console.log('✅ テストデータを削除しました');
        }
        
    } catch (error) {
        console.error('\n❌ エラーが発生しました:', error);
    }
    
    console.log('\n=== テスト完了 ===');
}

// 実行
testTables();