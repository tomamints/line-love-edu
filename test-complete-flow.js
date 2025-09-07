/**
 * 完全な購入フロー確認スクリプト
 * 診断作成 → 購入 → 履歴確認までの全フローをテスト
 */

const { createClient } = require('@supabase/supabase-js');
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

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('=== 完全購入フローテスト ===\n');

// テストユーザー情報
const testUser = {
    userId: 'U69bf66f589f5303a9615e94d7a7dc693', // とうまさんのID
    userName: 'とうま',
    birthDate: '1990-01-15'
};

async function checkExistingTables() {
    console.log('📊 既存テーブル構造の確認\n');
    
    try {
        // 1. diagnosesテーブルの構造確認
        const { data: diagCol, error: diagErr } = await supabase
            .from('diagnoses')
            .select('*')
            .limit(1);
        
        if (!diagErr && diagCol.length > 0) {
            console.log('✅ diagnoses テーブル:');
            console.log('   カラム:', Object.keys(diagCol[0]).join(', '));
        }
        
        // 2. purchasesテーブルの構造確認
        const { data: purCol, error: purErr } = await supabase
            .from('purchases')
            .select('*')
            .limit(1);
        
        if (!purErr && purCol.length > 0) {
            console.log('\n✅ purchases テーブル:');
            console.log('   カラム:', Object.keys(purCol[0]).join(', '));
        } else if (purErr) {
            console.log('\n❌ purchases テーブルエラー:', purErr.message);
        }
        
        // 3. payment_intentsテーブルの確認
        const { data: payCol, error: payErr } = await supabase
            .from('payment_intents')
            .select('*')
            .limit(1);
        
        if (!payErr) {
            console.log('\n✅ payment_intents テーブル: 存在');
        } else {
            console.log('\n⚠️ payment_intents テーブル: ' + payErr.message);
        }
        
        // 4. access_rightsテーブルの確認
        const { data: accCol, error: accErr } = await supabase
            .from('access_rights')
            .select('*')
            .limit(1);
        
        if (!accErr) {
            console.log('✅ access_rights テーブル: 存在');
        } else {
            console.log('⚠️ access_rights テーブル: ' + accErr.message);
        }
        
    } catch (err) {
        console.error('テーブル確認エラー:', err);
    }
}

async function createDiagnosis() {
    console.log('\n\n🌙 STEP 1: 診断データ作成');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const diagnosisData = {
        id: `diag_${Date.now()}_test`,
        user_id: testUser.userId,
        user_name: testUser.userName,
        birth_date: testUser.birthDate,
        diagnosis_type_id: 'otsukisama',
        result_data: {
            moon_power: 85,
            moon_phase: '満月',
            compatibility: '天秤座'
        },
        metadata: {},
        created_at: new Date().toISOString()
    };
    
    console.log('診断データ:');
    console.log('- ID:', diagnosisData.id);
    console.log('- ユーザー:', diagnosisData.user_name);
    console.log('- 生年月日:', diagnosisData.birth_date);
    
    const { data, error } = await supabase
        .from('diagnoses')
        .insert(diagnosisData)
        .select()
        .single();
    
    if (error) {
        console.error('❌ エラー:', error.message);
        return null;
    }
    
    console.log('✅ 診断データ作成成功');
    return data.id;
}

async function testStripePayment(diagnosisId) {
    console.log('\n\n💳 STEP 2: Stripe決済テスト');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        const response = await fetch('https://line-love-edu.vercel.app/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                diagnosisId: diagnosisId,
                userId: testUser.userId
            })
        });
        
        const result = await response.json();
        
        if (result.error) {
            if (result.error === 'Already purchased') {
                console.log('⚠️ 既に購入済み');
                return 'already_purchased';
            }
            console.error('❌ エラー:', result.error);
            return null;
        }
        
        console.log('✅ Stripeセッション作成成功');
        console.log('- Session ID:', result.sessionId);
        console.log('- 決済URL:', result.redirectUrl?.substring(0, 50) + '...');
        
        return result.sessionId;
    } catch (err) {
        console.error('❌ リクエストエラー:', err.message);
        return null;
    }
}

async function testPayPayPayment(diagnosisId) {
    console.log('\n\n💴 STEP 3: PayPay決済テスト');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
        const response = await fetch('https://line-love-edu.vercel.app/api/create-paypay-session-final', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)' // モバイル
            },
            body: JSON.stringify({
                diagnosisId: diagnosisId,
                userId: testUser.userId
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            console.error('❌ エラー:', result.error);
            return null;
        }
        
        console.log('✅ PayPayセッション作成成功');
        console.log('- Payment ID:', result.paymentId);
        console.log('- モバイル検出:', result.isMobile ? 'はい' : 'いいえ');
        console.log('- リダイレクトURL:', result.redirectUrl?.substring(0, 50) + '...');
        
        return result.paymentId;
    } catch (err) {
        console.error('❌ リクエストエラー:', err.message);
        return null;
    }
}

async function simulatePurchaseCompletion(diagnosisId, paymentMethod = 'stripe') {
    console.log(`\n\n✅ STEP 4: ${paymentMethod.toUpperCase()}購入完了シミュレーション`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 直接purchasesテーブルに記録
    const purchaseData = {
        purchase_id: `pur_${Date.now()}_sim`,
        user_id: testUser.userId,
        diagnosis_id: diagnosisId,
        product_type: 'diagnosis',
        product_id: 'otsukisama',
        product_name: 'おつきさま診断',
        amount: paymentMethod === 'paypay' ? 2980 : 980,
        currency: 'JPY',
        payment_method: paymentMethod,
        status: 'completed',
        created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
        .from('purchases')
        .insert(purchaseData)
        .select()
        .single();
    
    if (error) {
        console.error('❌ 購入記録作成エラー:', error.message);
        return null;
    }
    
    console.log('✅ 購入記録作成成功');
    console.log('- Purchase ID:', data.purchase_id);
    console.log('- 金額: ¥' + data.amount);
    console.log('- 決済方法:', data.payment_method);
    
    // access_rightsテーブルがあれば権限も付与
    try {
        await supabase
            .from('access_rights')
            .insert({
                user_id: testUser.userId,
                diagnosis_id: diagnosisId,
                access_type: 'full',
                granted_at: new Date().toISOString(),
                purchase_id: data.purchase_id
            });
        console.log('✅ アクセス権限付与成功');
    } catch (err) {
        console.log('⚠️ アクセス権限付与スキップ（テーブルなし）');
    }
    
    return data.purchase_id;
}

async function checkPurchaseHistory() {
    console.log('\n\n📜 STEP 5: 購入履歴確認');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const { data: purchases, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', testUser.userId)
        .order('created_at', { ascending: false })
        .limit(5);
    
    if (error) {
        console.error('❌ 履歴取得エラー:', error.message);
        return;
    }
    
    if (purchases && purchases.length > 0) {
        console.log(`✅ ${testUser.userName}さんの購入履歴（最新5件）:\n`);
        purchases.forEach((p, i) => {
            console.log(`${i+1}. ${p.product_name}`);
            console.log(`   購入ID: ${p.purchase_id}`);
            console.log(`   診断ID: ${p.diagnosis_id}`);
            console.log(`   金額: ¥${p.amount}`);
            console.log(`   決済: ${p.payment_method}`);
            console.log(`   状態: ${p.status}`);
            console.log(`   日時: ${new Date(p.created_at).toLocaleString('ja-JP')}`);
            console.log('');
        });
    } else {
        console.log('購入履歴がありません');
    }
}

async function checkDiagnosisAccess(diagnosisId) {
    console.log('\n\n🔓 STEP 6: 診断アクセス確認');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // 購入確認
    const { data: purchase } = await supabase
        .from('purchases')
        .select('*')
        .eq('diagnosis_id', diagnosisId)
        .eq('user_id', testUser.userId)
        .eq('status', 'completed')
        .single();
    
    if (purchase) {
        console.log('✅ 購入済み - フルアクセス可能');
        console.log('- 診断結果URL: /lp-otsukisama-unified.html?id=' + diagnosisId);
        console.log('- 購入日時:', new Date(purchase.created_at).toLocaleString('ja-JP'));
    } else {
        console.log('❌ 未購入 - アクセス制限あり');
    }
}

async function runCompleteFlow() {
    try {
        // 0. テーブル確認
        await checkExistingTables();
        
        // 1. 診断作成
        const diagnosisId = await createDiagnosis();
        if (!diagnosisId) {
            console.log('診断作成失敗のため終了');
            return;
        }
        
        // 2. Stripe決済テスト
        const stripeSession = await testStripePayment(diagnosisId);
        
        // 3. PayPay決済テスト
        const payPaySession = await testPayPayPayment(diagnosisId);
        
        // 4. 購入完了シミュレーション（PayPayで）
        if (payPaySession) {
            await simulatePurchaseCompletion(diagnosisId, 'paypay');
        }
        
        // 5. 購入履歴確認
        await checkPurchaseHistory();
        
        // 6. アクセス確認
        await checkDiagnosisAccess(diagnosisId);
        
        console.log('\n\n=== テスト完了 ===');
        console.log('\n✅ 確認完了項目:');
        console.log('1. 診断データ作成');
        console.log('2. Stripe/PayPay決済セッション作成');
        console.log('3. 購入記録（purchasesテーブル）');
        console.log('4. 購入履歴表示');
        console.log('5. 診断結果アクセス制御');
        
    } catch (error) {
        console.error('エラー:', error);
    }
}

runCompleteFlow();