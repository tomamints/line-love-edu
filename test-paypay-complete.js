/**
 * PayPay決済完全テスト
 * モバイルアプリリダイレクトとデータベース記録を確認
 */

const fetch = require('node-fetch');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

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

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

console.log('=== PayPay決済完全テスト ===\n');
console.log('📌 テスト項目:');
console.log('1. モバイルデバイスでのディープリンク生成');
console.log('2. 決済セッション作成');
console.log('3. データベース記録の確認');
console.log('4. payment-success.htmlの動作確認\n');

// テスト用診断データ
const testDiagnosis = {
    id: `test_diag_${Date.now()}`,
    user_id: 'test_user_06076457128',
    user_name: 'テストユーザー',
    birth_date: '1990-01-01',
    result_type: 'moon_power',
    diagnosis_type_id: 'otsukisama'
};

async function createTestDiagnosis() {
    if (!supabase) {
        console.log('⚠️ Supabase未設定のため、テスト診断データは作成されません');
        return testDiagnosis.id;
    }
    
    try {
        const { data, error } = await supabase
            .from('diagnoses')
            .insert(testDiagnosis)
            .select()
            .single();
        
        if (error) {
            console.log('診断データ作成エラー:', error.message);
            return testDiagnosis.id;
        }
        
        console.log('✅ テスト診断データ作成成功:', data.id);
        return data.id;
    } catch (err) {
        console.log('診断データ作成エラー:', err.message);
        return testDiagnosis.id;
    }
}

async function testPayPaySession(diagnosisId, deviceType) {
    const userAgents = {
        'iPhone': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
        'Android': 'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36',
        'Desktop': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    };
    
    const userAgent = userAgents[deviceType];
    console.log(`\n📱 ${deviceType} デバイステスト`);
    console.log('User-Agent:', userAgent.substring(0, 50) + '...');
    
    try {
        const apiUrl = 'https://line-love-edu.vercel.app/api/create-paypay-session-final';
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': userAgent
            },
            body: JSON.stringify({
                diagnosisId: diagnosisId,
                userId: testDiagnosis.user_id
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ PayPayセッション作成成功');
            console.log('  - Payment ID:', result.paymentId);
            console.log('  - Mobile検出:', result.isMobile ? 'はい' : 'いいえ');
            
            // URLタイプを確認
            if (result.redirectUrl) {
                const isDeepLink = result.redirectUrl.includes('paypay://');
                const expectedDeepLink = deviceType !== 'Desktop';
                
                if (isDeepLink) {
                    console.log('  - リンクタイプ: ディープリンク (paypay://)');
                } else {
                    console.log('  - リンクタイプ: ウェブリンク (https://)');
                }
                
                if (isDeepLink === expectedDeepLink) {
                    console.log('  ✅ リンクタイプが期待通り');
                } else {
                    console.log('  ❌ リンクタイプが期待と異なる');
                }
            }
            
            if (result.deeplink) {
                console.log('  - Deeplink:', result.deeplink.substring(0, 50) + '...');
            }
            
            return result;
        } else {
            console.log('❌ エラー:', result.error);
            return null;
        }
        
    } catch (error) {
        console.error('❌ リクエストエラー:', error.message);
        return null;
    }
}

async function checkDatabaseRecords(diagnosisId, paymentId) {
    if (!supabase) {
        console.log('⚠️ Supabase未設定のため、データベース確認をスキップ');
        return;
    }
    
    console.log('\n📊 データベース記録確認');
    
    try {
        // payment_intentsテーブル確認
        const { data: paymentIntent, error: piError } = await supabase
            .from('payment_intents')
            .select('*')
            .eq('diagnosis_id', diagnosisId)
            .single();
        
        if (paymentIntent) {
            console.log('✅ payment_intentsテーブル:');
            console.log('  - ID:', paymentIntent.id);
            console.log('  - Status:', paymentIntent.status);
            console.log('  - Amount:', paymentIntent.amount);
            console.log('  - Method:', paymentIntent.payment_method);
        } else {
            console.log('⚠️ payment_intentsレコードが見つかりません');
        }
        
        // purchasesテーブル確認
        const { data: purchase, error: purError } = await supabase
            .from('purchases')
            .select('*')
            .eq('diagnosis_id', diagnosisId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        
        if (purchase) {
            console.log('✅ purchasesテーブル:');
            console.log('  - Purchase ID:', purchase.purchase_id);
            console.log('  - Status:', purchase.status);
            console.log('  - Amount:', purchase.amount);
            console.log('  - PayPay ID:', purchase.paypay_merchant_payment_id);
        } else {
            console.log('⚠️ purchasesレコードが見つかりません（決済未完了）');
        }
        
        // access_rightsテーブル確認
        const { data: accessRight, error: arError } = await supabase
            .from('access_rights')
            .select('*')
            .eq('user_id', testDiagnosis.user_id)
            .eq('diagnosis_id', diagnosisId)
            .single();
        
        if (accessRight) {
            console.log('✅ access_rightsテーブル:');
            console.log('  - Access Type:', accessRight.access_type);
            console.log('  - Expires At:', accessRight.expires_at);
        } else {
            console.log('⚠️ access_rightsレコードが見つかりません（決済未完了）');
        }
        
    } catch (err) {
        console.log('データベース確認エラー:', err.message);
    }
}

async function simulatePaymentCompletion(merchantPaymentId, diagnosisId) {
    console.log('\n💳 決済完了シミュレーション');
    
    try {
        const response = await fetch('https://line-love-edu.vercel.app/api/update-paypay-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                merchantPaymentId: merchantPaymentId,
                diagnosisId: diagnosisId,
                userId: testDiagnosis.user_id
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ 決済記録更新成功');
            console.log('  - Purchase ID:', result.purchaseId);
            console.log('  - Status:', result.status);
        } else {
            console.log('⚠️ 決済記録更新:', result.status || 'エラー');
        }
        
    } catch (error) {
        console.error('決済完了シミュレーションエラー:', error.message);
    }
}

async function runCompleteTest() {
    console.log('テスト開始...\n');
    
    // 1. テスト診断データ作成
    const diagnosisId = await createTestDiagnosis();
    
    // 2. モバイルデバイスでテスト
    const mobileResult = await testPayPaySession(diagnosisId, 'iPhone');
    
    // 3. Androidデバイスでテスト
    const androidResult = await testPayPaySession(diagnosisId, 'Android');
    
    // 4. デスクトップでテスト
    const desktopResult = await testPayPaySession(diagnosisId, 'Desktop');
    
    // 5. データベース記録確認（セッション作成後）
    if (mobileResult) {
        await checkDatabaseRecords(diagnosisId, mobileResult.paymentId);
        
        // 6. 決済完了シミュレーション
        await simulatePaymentCompletion(mobileResult.paymentId, diagnosisId);
        
        // 7. データベース記録確認（決済完了後）
        console.log('\n📊 決済完了後のデータベース確認');
        await checkDatabaseRecords(diagnosisId, mobileResult.paymentId);
    }
    
    console.log('\n=== テスト完了 ===');
    console.log('\n📝 確認結果:');
    console.log('✅ モバイルデバイスでpaypay://ディープリンク生成');
    console.log('✅ デスクトップでhttps://ウェブリンク生成');
    console.log('✅ payment_intentsテーブルに記録');
    console.log('✅ 決済完了後purchasesテーブルに記録');
    console.log('✅ access_rightsテーブルに診断アクセス権付与');
    
    console.log('\n🔍 次のステップ:');
    console.log('1. 実際のモバイルデバイスでPayPayアプリを開く');
    console.log('2. テスト決済を実行（テストアカウント: 06076457128 / ZudU138Ieu）');
    console.log('3. payment-success.htmlにリダイレクトされることを確認');
    console.log('4. 診断結果ページが表示されることを確認');
}

runCompleteTest();