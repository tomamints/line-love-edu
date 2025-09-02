const { chromium } = require('playwright');

async function testBannerPreview() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();
    
    console.log('📱 プレビューモードでバナー画像の表示を確認中...');
    
    // 正しい本番URLでアクセス（履歴からのアクセス）
    const testDiagnosisId = 'a4527187-2f0a-42fa-8fca-9a8c43aa6a04';
    const testUserId = 'Ub2fcdc91798f5e56e0f9c759c4b7b55f';
    await page.goto(`https://line-love-edu.vercel.app/lp-otsukisama-unified.html?id=${testDiagnosisId}&userId=${testUserId}`);
    
    // ページが完全に読み込まれるまで待機
    await page.waitForTimeout(5000);
    
    // プレビューモードであることを確認
    const bodyClass = await page.getAttribute('body', 'class');
    console.log('Body class:', bodyClass);
    
    // content-lockedセクションが存在するか確認
    const hasContentLocked = await page.$('.content-locked') !== null;
    console.log('content-lockedセクション存在:', hasContentLocked);
    
    if (hasContentLocked) {
        // content-lockedセクション内のバナー画像を探す
        const bannerImages = await page.$$eval('.content-locked img[src*="/images/banner/"]', images => {
            return images.map(img => {
                const computedStyle = window.getComputedStyle(img);
                return {
                    src: img.src,
                    filter: computedStyle.filter,
                    opacity: computedStyle.opacity,
                    parentFilter: window.getComputedStyle(img.parentElement).filter
                };
            });
        });
        
        console.log('\n🖼️ content-locked内のバナー画像の状態:');
        bannerImages.forEach((img, index) => {
            console.log(`\nバナー${index + 1}:`);
            console.log(`  URL: ${img.src.split('/').pop()}`);
            console.log(`  フィルター: ${img.filter}`);
            console.log(`  不透明度: ${img.opacity}`);
            console.log(`  親要素のフィルター: ${img.parentFilter}`);
        });
        
        // 通常のコンテンツがぼかされているか確認
        const lockedContent = await page.$eval('.content-locked', el => {
            const style = window.getComputedStyle(el);
            return {
                filter: style.filter,
                opacity: style.opacity
            };
        });
        
        console.log('\n🔒 ロックされたコンテンツの状態:');
        console.log(`  フィルター: ${lockedContent.filter}`);
        console.log(`  不透明度: ${lockedContent.opacity}`);
    }
    
    // 全体のバナー画像を確認
    const allBannerImages = await page.$$eval('img[src*="/images/banner/"]', images => {
        return images.map(img => {
            const computedStyle = window.getComputedStyle(img);
            const parent = img.closest('.content-locked');
            return {
                src: img.src,
                filter: computedStyle.filter,
                opacity: computedStyle.opacity,
                display: computedStyle.display,
                inContentLocked: parent !== null
            };
        });
    });
    
    console.log('\n🖼️ ページ内の全バナー画像:');
    allBannerImages.forEach((img, index) => {
        console.log(`\nバナー${index + 1}:`);
        console.log(`  URL: ${img.src.split('/').pop()}`);
        console.log(`  フィルター: ${img.filter}`);
        console.log(`  不透明度: ${img.opacity}`);
        console.log(`  表示: ${img.display}`);
        console.log(`  content-locked内: ${img.inContentLocked}`);
    });
    
    // スクリーンショットを撮る
    await page.screenshot({ 
        path: 'preview-banner-test.png',
        fullPage: false 
    });
    console.log('\n📸 スクリーンショット保存: preview-banner-test.png');
    
    // 下にスクロールしてバナー画像を確認
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(2000);
    
    // バナー画像のスクリーンショット
    await page.screenshot({ 
        path: 'preview-banner-focused.png',
        fullPage: false 
    });
    console.log('📸 バナー画像のスクリーンショット保存: preview-banner-focused.png');
    
    console.log('\n✅ テスト完了');
    console.log('スクリーンショットを確認して、バナー画像がクリアに表示されているか確認してください。');
    
    await page.waitForTimeout(5000);
    await browser.close();
}

testBannerPreview().catch(console.error);