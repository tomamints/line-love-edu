const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        devtools: true 
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // コンソールログを表示
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
    
    try {
        console.log('\n=== 決済フローテスト開始 ===\n');
        
        // 1. 診断結果ページを開く（プレビューモード）
        console.log('1. 診断結果ページを開く...');
        const diagnosisUrl = 'https://line-love-edu.vercel.app/pages/lp-otsukisama-unified.html?id=test123&userId=testuser';
        await page.goto(diagnosisUrl);
        await page.waitForLoadState('networkidle');
        
        // 購入ボタンを確認
        console.log('2. 購入ボタンを探す...');
        await page.waitForTimeout(3000); // setTimeout待機
        
        const purchaseButton = await page.$('#purchaseButton');
        if (purchaseButton) {
            console.log('✅ 購入ボタンが見つかりました');
            await purchaseButton.click();
            console.log('✅ 購入ボタンをクリックしました');
        } else {
            console.error('❌ 購入ボタンが見つかりません');
            return;
        }
        
        // 2. 決済選択ページ
        console.log('\n3. 決済選択ページを待機...');
        await page.waitForURL('**/payment-selection.html*');
        console.log('✅ 決済選択ページに遷移しました');
        
        // クレジットカードボタンをクリック
        console.log('4. クレジットカード決済を選択...');
        await page.waitForTimeout(2000);
        
        const creditCardMethod = await page.$('#creditCardMethod');
        if (creditCardMethod) {
            console.log('✅ クレジットカード決済ボタンが見つかりました');
            await creditCardMethod.click();
            console.log('✅ クレジットカード決済をクリックしました');
        } else {
            console.error('❌ クレジットカード決済ボタンが見つかりません');
            return;
        }
        
        // 3. PAY.JP Checkoutモーダル
        console.log('\n5. PAY.JP Checkoutモーダルを待機...');
        await page.waitForTimeout(2000);
        
        // Checkoutボタンを確認
        const checkoutButton = await page.$('.payjp-button-inner');
        if (checkoutButton) {
            console.log('✅ PAY.JP Checkoutボタンが見つかりました');
            
            // iframeが開くか確認
            const frames = page.frames();
            console.log(`現在のフレーム数: ${frames.length}`);
            
            // モーダルフレームを探す
            const modalFrame = frames.find(f => f.url().includes('checkout.pay.jp'));
            if (modalFrame) {
                console.log('✅ PAY.JP Checkoutモーダルが開きました');
                console.log('モーダルURL:', modalFrame.url());
            } else {
                console.log('⚠️ モーダルフレームは見つかりませんでした（自動クリックのテスト）');
            }
        } else {
            console.error('❌ PAY.JP Checkoutボタンが見つかりません');
        }
        
        // 4. 決済完了後のリダイレクトをテスト（模擬）
        console.log('\n6. 決済完了後のリダイレクトをテスト...');
        const paidUrl = 'https://line-love-edu.vercel.app/pages/lp-otsukisama-unified.html?id=test123&userId=testuser&paid=true';
        await page.goto(paidUrl);
        await page.waitForLoadState('networkidle');
        
        // paid=trueで完全版が表示されるか確認
        console.log('7. 完全版コンテンツを確認...');
        await page.waitForTimeout(2000);
        
        // ロックオーバーレイが表示されていないか確認
        const lockOverlay = await page.$('.lock-overlay');
        const purchaseButtonAfter = await page.$('#purchaseButton');
        
        if (!lockOverlay && !purchaseButtonAfter) {
            console.log('✅ 完全版が正しく表示されています（ロックなし、購入ボタンなし）');
        } else {
            if (lockOverlay) console.error('❌ ロックオーバーレイが表示されています');
            if (purchaseButtonAfter) console.error('❌ 購入ボタンが残っています');
        }
        
        // コンテンツが表示されているか確認
        const contentSections = await page.$$('.result-section');
        console.log(`✅ ${contentSections.length}個のコンテンツセクションが表示されています`);
        
        console.log('\n=== テスト完了 ===\n');
        
    } catch (error) {
        console.error('❌ エラーが発生しました:', error);
    } finally {
        // ブラウザを開いたままにする
        console.log('\nブラウザは開いたままです。手動で確認してください。');
        console.log('終了するには Ctrl+C を押してください。');
    }
})();