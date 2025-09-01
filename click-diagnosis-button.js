const puppeteer = require('puppeteer');

async function clickDiagnosisButton() {
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null 
    });
    const page = await browser.newPage();
    
    console.log('1. 診断入力ページを開く...');
    await page.goto('http://localhost:3000/lp-otsukisama-input.html?userId=U69bf66f589f5303a9615e94d7a7dc693', { waitUntil: 'networkidle0' });
    
    // ページ読み込み完了を待つ
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('2. スクリーンショット撮影（入力前）...');
    await page.screenshot({ path: '/tmp/before_input.png' });
    console.log('   保存: /tmp/before_input.png');
    
    console.log('3. フォームに入力...');
    // 名前を入力（正しいセレクタを使用）
    const nameInput = await page.$('input[type="text"]');
    await nameInput.type('テスト診断');
    
    // 生年月日を選択（セレクトボックスの正しいセレクタ）
    const selects = await page.$$('select');
    await selects[0].select('2000');  // 年
    await selects[1].select('5');     // 月
    await selects[2].select('15');    // 日
    
    console.log('4. スクリーンショット撮影（入力後）...');
    await page.screenshot({ path: '/tmp/after_input.png' });
    console.log('   保存: /tmp/after_input.png');
    
    console.log('5. 診断するボタンをクリック...');
    // ボタンを探してクリック
    const button = await page.$('button');
    await button.click();
    
    // ページ遷移を待つ
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    console.log('6. 遷移後のページのスクリーンショット撮影...');
    await page.screenshot({ path: '/tmp/preview_page.png', fullPage: true });
    console.log('   保存: /tmp/preview_page.png');
    
    // 現在のURLを取得
    const currentUrl = page.url();
    console.log('');
    console.log('遷移後のURL:', currentUrl);
    
    // ページのタイトルやコンテンツを確認
    const pageTitle = await page.title();
    console.log('ページタイトル:', pageTitle);
    
    // 4つの軸データが表示されているか確認
    const hasAxesData = await page.evaluate(() => {
        const text = document.body.innerText;
        return {
            hasEmotional: text.includes('ストレート告白型') || text.includes('スキンシップ型'),
            hasDistance: text.includes('ベッタリ依存型') || text.includes('安心セーフ型'),
            hasValues: text.includes('ロマンチスト型') || text.includes('リアリスト型'),
            hasEnergy: text.includes('燃え上がり型') || text.includes('波あり型')
        };
    });
    
    console.log('');
    console.log('4つの軸データの表示確認:');
    console.log('  感情表現:', hasAxesData.hasEmotional ? '✅' : '❌');
    console.log('  距離感:', hasAxesData.hasDistance ? '✅' : '❌');
    console.log('  価値観:', hasAxesData.hasValues ? '✅' : '❌');
    console.log('  エネルギー:', hasAxesData.hasEnergy ? '✅' : '❌');
    
    console.log('');
    console.log('ブラウザは開いたままにします。手動で確認してください。');
    
    // ブラウザは閉じない（手動確認のため）
    // await browser.close();
}

clickDiagnosisButton().catch(console.error);