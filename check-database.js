/**
 * データベース状態確認スクリプト
 */

const { createClient } = require('@supabase/supabase-js');
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

console.log('=== データベース状態確認 ===\n');

async function checkDatabase() {
    try {
        // 1. 最新の診断データを確認
        console.log('📊 診断データ (diagnoses) - 最新10件:');
        const { data: diagnoses, error: diagError } = await supabase
            .from('diagnoses')
            .select('id, user_id, user_name, created_at, diagnosis_type_id')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (diagError) {
            console.error('エラー:', diagError.message);
        } else if (diagnoses && diagnoses.length > 0) {
            diagnoses.forEach((d, i) => {
                console.log(`${i+1}. ID: ${d.id}`);
                console.log(`   User: ${d.user_name} (${d.user_id})`);
                console.log(`   Type: ${d.diagnosis_type_id}`);
                console.log(`   Created: ${new Date(d.created_at).toLocaleString('ja-JP')}`);
            });
        } else {
            console.log('診断データがありません');
        }
        
        // 2. 購入履歴を確認
        console.log('\n📦 購入履歴 (purchases) - 最新10件:');
        const { data: purchases, error: purError } = await supabase
            .from('purchases')
            .select('purchase_id, diagnosis_id, amount, payment_method, status, created_at')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (purError) {
            console.error('エラー:', purError.message);
        } else if (purchases && purchases.length > 0) {
            purchases.forEach((p, i) => {
                console.log(`${i+1}. Purchase: ${p.purchase_id}`);
                console.log(`   Diagnosis: ${p.diagnosis_id}`);
                console.log(`   Amount: ¥${p.amount}`);
                console.log(`   Method: ${p.payment_method}`);
                console.log(`   Status: ${p.status}`);
                console.log(`   Date: ${new Date(p.created_at).toLocaleString('ja-JP')}`);
            });
        } else {
            console.log('購入履歴がありません');
        }
        
        // 3. PayPay決済の状態を確認
        console.log('\n💳 PayPay決済 (payment_intents) - 最新10件:');
        const { data: payments, error: payError } = await supabase
            .from('payment_intents')
            .select('id, diagnosis_id, amount, status, payment_method, created_at')
            .eq('payment_method', 'paypay')
            .order('created_at', { ascending: false })
            .limit(10);
        
        if (payError) {
            console.error('エラー:', payError.message);
        } else if (payments && payments.length > 0) {
            payments.forEach((p, i) => {
                console.log(`${i+1}. Payment: ${p.id.substring(0, 20)}...`);
                console.log(`   Diagnosis: ${p.diagnosis_id}`);
                console.log(`   Amount: ¥${p.amount}`);
                console.log(`   Status: ${p.status}`);
                console.log(`   Date: ${new Date(p.created_at).toLocaleString('ja-JP')}`);
            });
        } else {
            console.log('PayPay決済履歴がありません');
        }
        
        // 4. アクセス権を確認
        console.log('\n🔑 アクセス権 (access_rights) - 最新10件:');
        const { data: access, error: accError } = await supabase
            .from('access_rights')
            .select('user_id, diagnosis_id, access_type, granted_at')
            .order('granted_at', { ascending: false })
            .limit(10);
        
        if (accError) {
            console.error('エラー:', accError.message);
        } else if (access && access.length > 0) {
            access.forEach((a, i) => {
                console.log(`${i+1}. User: ${a.user_id}`);
                console.log(`   Diagnosis: ${a.diagnosis_id}`);
                console.log(`   Type: ${a.access_type}`);
                console.log(`   Granted: ${new Date(a.granted_at).toLocaleString('ja-JP')}`);
            });
        } else {
            console.log('アクセス権がありません');
        }
        
        // 5. 統計情報
        console.log('\n📈 統計情報:');
        
        // 診断数
        const { count: diagCount } = await supabase
            .from('diagnoses')
            .select('*', { count: 'exact', head: true });
        console.log(`- 総診断数: ${diagCount || 0}`);
        
        // 購入数
        const { count: purCount } = await supabase
            .from('purchases')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'completed');
        console.log(`- 完了購入数: ${purCount || 0}`);
        
        // PayPay決済数
        const { count: payPayCount } = await supabase
            .from('purchases')
            .select('*', { count: 'exact', head: true })
            .eq('payment_method', 'paypay')
            .eq('status', 'completed');
        console.log(`- PayPay決済数: ${payPayCount || 0}`);
        
        // Stripe決済数
        const { count: stripeCount } = await supabase
            .from('purchases')
            .select('*', { count: 'exact', head: true })
            .eq('payment_method', 'stripe')
            .eq('status', 'completed');
        console.log(`- Stripe決済数: ${stripeCount || 0}`);
        
    } catch (error) {
        console.error('エラー:', error);
    }
}

checkDatabase();