const { chromium } = require('playwright');

(async () => {
    // LINE内ブラウザのUser-Agentをシミュレート
    const lineUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Line/11.19.0';
    
    const browser = await chromium.launch({ 
        headless: false,
        devtools: true 
    });
    
    const context = await browser.newContext({
        userAgent: lineUserAgent,
        viewport: { width: 390, height: 844 }, // iPhone 13サイズ
        isMobile: true
    });
    
    const page = await context.newPage();
    
    // コンソールログを表示
    page.on('console', msg => {
        const type = msg.type();
        if (type === 'error') {
            console.error('❌ BROWSER ERROR:', msg.text());
        } else if (type === 'warning') {
            console.warn('⚠️  BROWSER WARNING:', msg.text());
        } else {
            console.log('📱 BROWSER LOG:', msg.text());
        }
    });
    
    page.on('pageerror', error => console.error('❌ PAGE ERROR:', error.message));
    
    try {
        console.log('\n=== LINE内ブラウザ Apple Payテスト ===\n');
        console.log('User Agent:', lineUserAgent);
        
        // 1. 決済選択ページを直接開く
        console.log('\n1. 決済選択ページを開く...');
        const paymentUrl = 'https://line-love-edu.vercel.app/pages/payment-selection.html?id=test123&userId=lineuser';
        await page.goto(paymentUrl);
        await page.waitForLoadState('networkidle');
        
        // 2. Apple Payの状態を確認
        console.log('\n2. Apple Pay可用性を確認...');
        await page.waitForTimeout(3000); // 初期化を待つ
        
        // Apple Payボタンの表示状態を確認
        const applePayButton = await page.$('#applePayButton');
        const applePayMethod = await page.$('#applePayMethod');
        const applePayNotAvailable = await page.$('#applePayNotAvailable');
        
        const applePayMethodVisible = applePayMethod ? await applePayMethod.isVisible() : false;
        const applePayNotAvailableVisible = applePayNotAvailable ? await applePayNotAvailable.isVisible() : false;
        
        console.log('\n=== Apple Pay状態 ===');
        console.log('Apple Payボタン表示:', applePayMethodVisible ? '✅ 表示' : '❌ 非表示');
        console.log('Apple Pay利用不可メッセージ:', applePayNotAvailableVisible ? '⚠️  表示' : '✅ 非表示');
        
        // 3. クレジットカード決済も確認
        console.log('\n3. クレジットカード決済を確認...');
        const creditCardMethod = await page.$('#creditCardMethod');
        if (creditCardMethod) {
            const isVisible = await creditCardMethod.isVisible();
            console.log('クレジットカード決済:', isVisible ? '✅ 利用可能' : '❌ 利用不可');
            
            if (isVisible) {
                console.log('\n4. クレジットカード決済をクリック...');
                await creditCardMethod.click();
                await page.waitForTimeout(2000);
                
                // PAY.JP Checkoutボタンを確認
                const checkoutButton = await page.$('.payjp-button-inner');
                console.log('PAY.JP Checkoutボタン:', checkoutButton ? '✅ 生成された' : '❌ 生成されていない');
            }
        }
        
        // 4. ブラウザAPIの状態を確認
        console.log('\n=== ブラウザAPI確認 ===');
        const apiCheck = await page.evaluate(() => {
            return {
                hasApplePaySession: typeof window.ApplePaySession !== 'undefined',
                hasPaymentRequest: typeof window.PaymentRequest !== 'undefined',
                userAgent: navigator.userAgent,
                isLineInApp: /Line/i.test(navigator.userAgent)
            };
        });
        
        console.log('ApplePaySession API:', apiCheck.hasApplePaySession ? '✅ 存在' : '❌ 存在しない');
        console.log('PaymentRequest API:', apiCheck.hasPaymentRequest ? '✅ 存在' : '❌ 存在しない');
        console.log('LINE内ブラウザ検出:', apiCheck.isLineInApp ? '✅ 検出' : '❌ 非検出');
        
        console.log('\n=== テスト完了 ===\n');
        
    } catch (error) {
        console.error('❌ エラーが発生しました:', error);
    } finally {
        console.log('\n注意: これはLINE内ブラウザのシミュレーションです。');
        console.log('実際のLINEアプリでも動作確認してください。');
        console.log('\nブラウザは開いたままです。終了するには Ctrl+C を押してください。');
    }
})();