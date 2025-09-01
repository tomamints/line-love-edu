const fetch = require('node-fetch');

async function testStripeCheckout() {
    console.log('Stripe決済フローテスト');
    console.log('='.repeat(60));
    
    // テスト用のデータ
    const diagnosisId = 'diag_1756715414668_3p6heltzc';
    const userId = 'U69bf66f589f5303a9615e94d7a7dc693';
    
    console.log('診断ID:', diagnosisId);
    console.log('ユーザーID:', userId);
    console.log('');
    
    console.log('1. 決済セッション作成をテスト...');
    
    try {
        const response = await fetch('http://localhost:3000/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                diagnosisId: diagnosisId,
                userId: userId,
                successUrl: `http://localhost:3000/lp-otsukisama-unified.html?id=${diagnosisId}&payment=success`,
                cancelUrl: `http://localhost:3000/lp-otsukisama-unified.html?id=${diagnosisId}&payment=cancelled`
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.checkoutUrl) {
            console.log('✅ 決済セッション作成成功！');
            console.log('');
            console.log('セッションID:', data.sessionId);
            console.log('');
            console.log('🌐 Stripe決済ページURL:');
            console.log(data.checkoutUrl);
            console.log('');
            console.log('このURLを開くとStripeの決済ページに移動します。');
            console.log('');
            console.log('【テスト用クレジットカード情報】');
            console.log('カード番号: 4242 4242 4242 4242');
            console.log('有効期限: 任意の将来の日付（例: 12/34）');
            console.log('CVC: 任意の3桁（例: 123）');
            console.log('');
            console.log('決済成功後のリダイレクト先:');
            console.log(`http://localhost:3000/lp-otsukisama-unified.html?id=${diagnosisId}&payment=success`);
        } else {
            console.error('❌ エラー:', data);
            
            if (data.error === 'Already purchased') {
                console.log('');
                console.log('この診断は既に購入済みです。');
            }
        }
    } catch (error) {
        console.error('❌ リクエストエラー:', error.message);
    }
}

testStripeCheckout();