require('dotenv').config({ path: '.env.local' });
const PaymentHandler = require('./api/common/payment-handler');

async function testPaymentHandler() {
    console.log('🧪 共通決済ハンドラーのテスト開始\n');
    
    const handler = new PaymentHandler();
    const testDiagnosisId = 'diag_1757218182779_hy8o9e75h';
    const testUserId = 'anonymous';
    
    console.log('1️⃣ 購入レコード作成テスト');
    console.log('============================');
    
    try {
        const result = await handler.createPurchaseRecord({
            diagnosisId: testDiagnosisId,
            userId: testUserId,
            amount: 980,
            paymentMethod: 'test',
            metadata: {
                test_id: 'test_' + Date.now(),
                description: 'テスト購入'
            }
        });
        
        if (result.success) {
            console.log('✅ 購入レコード作成成功');
            console.log('   Purchase ID:', result.purchaseId);
            
            // 作成したレコードを検索
            console.log('\n2️⃣ メタデータ検索テスト');
            console.log('============================');
            const findResult = await handler.findPurchaseByMetadata('test_id', result.metadata?.test_id);
            
            if (findResult.success) {
                console.log('✅ 購入レコード検索成功');
                console.log('   Status:', findResult.purchase?.status);
            } else {
                console.log('❌ 検索失敗:', findResult.error);
            }
            
            // 決済完了処理
            console.log('\n3️⃣ 決済完了処理テスト');
            console.log('============================');
            const completeResult = await handler.completePurchase({
                purchaseId: result.purchaseId,
                transactionData: {
                    payment_status: 'COMPLETED',
                    transaction_id: 'test_tx_' + Date.now(),
                    completed_at: new Date().toISOString()
                }
            });
            
            if (completeResult.success) {
                console.log('✅ 決済完了処理成功');
                console.log('   Status:', completeResult.purchase?.status);
                
                // アクセス権限付与
                console.log('\n4️⃣ アクセス権限付与テスト');
                console.log('============================');
                const accessResult = await handler.grantFullAccess({
                    diagnosisId: testDiagnosisId,
                    userId: testUserId,
                    purchaseId: result.purchaseId
                });
                
                if (accessResult.success) {
                    console.log('✅ アクセス権限付与成功');
                } else {
                    console.log('❌ アクセス権限付与失敗:', accessResult.error);
                }
            } else {
                console.log('❌ 決済完了処理失敗:', completeResult.error);
            }
            
            // テストデータをクリーンアップ
            console.log('\n5️⃣ テストデータクリーンアップ');
            console.log('============================');
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(
                process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );
            
            await supabase
                .from('purchases')
                .delete()
                .eq('purchase_id', result.purchaseId);
            
            console.log('✅ テストデータを削除しました');
            
        } else {
            console.log('❌ 購入レコード作成失敗:', result.error);
        }
        
    } catch (error) {
        console.error('❌ テスト実行エラー:', error);
    }
    
    console.log('\n✨ テスト完了');
}

testPaymentHandler();