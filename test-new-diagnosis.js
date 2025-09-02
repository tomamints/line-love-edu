const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function testNewDiagnosis() {
    console.log('🔍 新規診断のテスト\n');
    
    const testUserId = 'test_user_' + Date.now();
    const testDate = '1990-01-15';
    
    // 1. 1回目の診断を作成
    console.log('1️⃣ 1回目の診断を作成...');
    const diagnosis1Response = await fetch('https://line-love-edu.vercel.app/api/profile-form-v2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'save-diagnosis',
            userId: testUserId,
            userName: 'テストユーザー',
            birthDate: testDate,
            diagnosisType: 'otsukisama',
            resultData: {
                moon_pattern_id: 1,
                moon_phase: '新月',
                test: 'first_diagnosis'
            }
        })
    });
    
    const diagnosis1 = await diagnosis1Response.json();
    console.log('  診断ID:', diagnosis1.diagnosisId);
    console.log('  新規フラグ:', diagnosis1.isNew);
    
    // 2. 同じユーザー・生年月日で2回目の診断
    console.log('\n2️⃣ 同じユーザーで2回目の診断を作成...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
    
    const diagnosis2Response = await fetch('https://line-love-edu.vercel.app/api/profile-form-v2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'save-diagnosis',
            userId: testUserId,
            userName: 'テストユーザー',
            birthDate: testDate,
            diagnosisType: 'otsukisama',
            resultData: {
                moon_pattern_id: 2,
                moon_phase: '満月',
                test: 'second_diagnosis'
            }
        })
    });
    
    const diagnosis2 = await diagnosis2Response.json();
    
    if (!diagnosis2Response.ok) {
        console.log('  ❌ エラー:', diagnosis2.error);
        console.log('  詳細:', diagnosis2.details);
    } else {
        console.log('  診断ID:', diagnosis2.diagnosisId);
        console.log('  新規フラグ:', diagnosis2.isNew);
    }
    
    // 3. IDが異なることを確認
    console.log('\n✅ 検証結果:');
    console.log('  1回目のID:', diagnosis1.diagnosisId);
    console.log('  2回目のID:', diagnosis2.diagnosisId);
    console.log('  IDが異なる:', diagnosis1.diagnosisId !== diagnosis2.diagnosisId ? '✅ YES' : '❌ NO');
    
    // 4. データベースで両方のレコードが存在するか確認
    console.log('\n📊 データベース確認...');
    const { data: records, error } = await supabase
        .from('diagnoses')
        .select('id, user_id, birth_date, result_data, created_at')
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('  エラー:', error);
    } else {
        console.log('  レコード数:', records.length);
        records.forEach((record, index) => {
            console.log(`\n  レコード${index + 1}:`);
            console.log('    ID:', record.id);
            console.log('    作成日時:', record.created_at);
            console.log('    テストデータ:', record.result_data.test);
        });
    }
    
    // 5. access_rightsテーブルも確認
    console.log('\n🔑 アクセス権限確認...');
    const { data: accessRights } = await supabase
        .from('access_rights')
        .select('resource_id, access_level, created_at')
        .eq('user_id', testUserId)
        .eq('resource_type', 'diagnosis');
    
    if (accessRights) {
        console.log('  アクセス権限数:', accessRights.length);
        accessRights.forEach((right, index) => {
            console.log(`\n  権限${index + 1}:`);
            console.log('    診断ID:', right.resource_id);
            console.log('    アクセスレベル:', right.access_level);
        });
    }
}

testNewDiagnosis().catch(console.error);