/**
 * PayPay モバイルアプリリダイレクトテスト
 * モバイル特有のエラーを診断して修正を確認
 */

const fetch = require('node-fetch');
const fs = require('fs');

// 環境変数を読み込む
try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    envContent.split('\n').forEach(line => {
        if (line && !line.startsWith('#')) {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        }
    });
} catch (error) {
    console.log('⚠️ .env.localファイルが見つかりません');
}

console.log('=== PayPay モバイルリダイレクトテスト ===\n');

// モバイルユーザーエージェントのリスト
const mobileUserAgents = {
    'iPhone': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
    'Android': 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
    'iPad': 'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1'
};

// デスクトップユーザーエージェント
const desktopUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';

async function testPayPaySession(userAgent, deviceName) {
    console.log(`\n📱 テスト: ${deviceName}`);
    console.log('User-Agent:', userAgent);
    
    const diagnosisId = `test_${Date.now()}`;
    const userId = 'test_user_mobile';
    
    try {
        // ローカルテストサーバーまたは本番環境
        const apiUrl = process.env.USE_LOCAL === 'true' 
            ? 'http://localhost:3001/api/create-paypay-session-final'
            : 'https://line-love-edu.vercel.app/api/create-paypay-session-final';
        
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': userAgent
            },
            body: JSON.stringify({
                diagnosisId: diagnosisId,
                userId: userId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ PayPayセッション作成成功');
            console.log('Payment ID:', result.paymentId);
            console.log('Redirect URL:', result.redirectUrl);
            
            // リダイレクトタイプを確認（モバイルの場合はAPP_DEEP_LINKになるはず）
            if (result.redirectUrl) {
                const isDeepLink = result.redirectUrl.includes('paypay://');
                const expectedDeepLink = deviceName !== 'Desktop';
                
                if (isDeepLink === expectedDeepLink) {
                    console.log(`✅ リダイレクトタイプ正常: ${isDeepLink ? 'APP_DEEP_LINK' : 'WEB_LINK'}`);
                } else {
                    console.log(`❌ リダイレクトタイプ異常: 期待=${expectedDeepLink ? 'APP_DEEP_LINK' : 'WEB_LINK'}, 実際=${isDeepLink ? 'APP_DEEP_LINK' : 'WEB_LINK'}`);
                }
            }
            
            // URLパラメータの確認
            if (result.redirectUrl && result.redirectUrl.includes('?')) {
                const url = new URL(result.redirectUrl);
                console.log('URLパラメータ:');
                url.searchParams.forEach((value, key) => {
                    console.log(`  - ${key}: ${value}`);
                });
            }
            
        } else {
            console.log('❌ エラー:', result.error);
            if (result.details) {
                console.log('詳細:', result.details);
            }
        }
        
    } catch (error) {
        console.error('❌ リクエストエラー:', error.message);
    }
}

async function runTests() {
    console.log('モバイルデバイステストを開始...\n');
    
    // モバイルデバイスをテスト
    for (const [device, userAgent] of Object.entries(mobileUserAgents)) {
        await testPayPaySession(userAgent, device);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1秒待機
    }
    
    // デスクトップもテスト（比較用）
    await testPayPaySession(desktopUserAgent, 'Desktop');
    
    console.log('\n=== テスト完了 ===');
    console.log('\n📝 確認ポイント:');
    console.log('1. モバイルデバイスではAPP_DEEP_LINKが使用されている');
    console.log('2. デスクトップではWEB_LINKが使用されている');
    console.log('3. merchantPaymentIdがURLパラメータに含まれている');
    console.log('4. diagnosisIdとuserIdが正しく含まれている');
}

// PayPay API仕様の確認
console.log('📚 PayPay API仕様:');
console.log('- APP_DEEP_LINK: PayPayアプリに直接リダイレクト（モバイル用）');
console.log('- WEB_LINK: ブラウザでPayPayページを開く（デスクトップ用）');
console.log('- モバイルアプリのエラーは通常、リダイレクトURL形式の問題が原因\n');

// エラー診断
console.log('🔍 モバイルエラー診断:');
console.log('1. redirectTypeがAPP_DEEP_LINKに設定されているか確認');
console.log('2. redirectUrlにすべての必要なパラメータが含まれているか確認');
console.log('3. PayPayアプリがURLスキームを正しく処理できるか確認\n');

runTests();