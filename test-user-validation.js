/**
 * ユーザーID検証機能のテストスクリプト
 */

const fetch = require('node-fetch');

// テスト環境のベースURL
const BASE_URL = 'http://localhost:3000';

// テストケース
async function runTests() {
    console.log('🧪 ユーザーID検証機能のテスト開始...\n');
    
    const testCases = [
        {
            name: '存在しないユーザーID',
            userId: 'fake_user_12345',
            expectedExists: false
        },
        {
            name: '空のユーザーID',
            userId: '',
            expectedExists: false,
            expectError: true
        },
        {
            name: 'デバッグユーザー',
            userId: 'debug_user',
            expectedExists: false
        }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const testCase of testCases) {
        console.log(`📝 テスト: ${testCase.name}`);
        console.log(`   userId: "${testCase.userId}"`);
        
        try {
            const url = `${BASE_URL}/api/get-love-profile?userId=${testCase.userId}&checkOnly=true`;
            const response = await fetch(url);
            const result = await response.json();
            
            if (testCase.expectError) {
                if (!response.ok) {
                    console.log(`   ✅ 期待通りエラーが返されました`);
                    passed++;
                } else {
                    console.log(`   ❌ エラーが期待されましたが成功しました`);
                    failed++;
                }
            } else {
                if (result.exists === testCase.expectedExists) {
                    console.log(`   ✅ 期待通り: exists = ${result.exists}`);
                    passed++;
                } else {
                    console.log(`   ❌ 期待値と異なる: exists = ${result.exists}, 期待値 = ${testCase.expectedExists}`);
                    failed++;
                }
            }
            
            console.log(`   レスポンス:`, JSON.stringify(result, null, 2));
        } catch (error) {
            console.log(`   ❌ エラー: ${error.message}`);
            failed++;
        }
        
        console.log('');
    }
    
    // テスト結果サマリー
    console.log('========================================');
    console.log('📊 テスト結果サマリー');
    console.log('========================================');
    console.log(`✅ 成功: ${passed}`);
    console.log(`❌ 失敗: ${failed}`);
    console.log(`📈 合計: ${passed + failed}`);
    
    if (failed === 0) {
        console.log('\n🎉 すべてのテストが成功しました！');
    } else {
        console.log('\n⚠️ 一部のテストが失敗しました。修正が必要です。');
        process.exit(1);
    }
}

// 実行
runTests().catch(error => {
    console.error('テスト実行エラー:', error);
    process.exit(1);
});