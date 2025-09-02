const { chromium } = require('playwright');

async function testMosaicLayers() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();
    
    console.log('📱 モザイクの重なりを確認中...');
    
    // テスト用のURLでアクセス
    const testDiagnosisId = 'diag_1756723057473_zbxzkmtt0';
    const testUserId = 'U69bf66f589f5303a9615e94d7a7dc693';
    await page.goto(`https://line-love-edu.vercel.app/lp-otsukisama-unified.html?id=${testDiagnosisId}&userId=${testUserId}`);
    
    // ページが完全に読み込まれるまで待機
    await page.waitForTimeout(5000);
    
    // モザイク要素の構造を確認
    const mosaicStructure = await page.evaluate(() => {
        const wrapper = document.querySelector('.premium-content-wrapper');
        const contentLocked = document.querySelectorAll('.content-locked');
        const lockOverlays = document.querySelectorAll('.lock-overlay');
        
        const wrapperStyle = wrapper ? window.getComputedStyle(wrapper) : null;
        
        return {
            wrapperExists: wrapper !== null,
            wrapperStyle: wrapperStyle ? {
                filter: wrapperStyle.filter,
                opacity: wrapperStyle.opacity,
                position: wrapperStyle.position
            } : null,
            contentLockedCount: contentLocked.length,
            lockOverlayCount: lockOverlays.length,
            contentLockedStyles: Array.from(contentLocked).slice(0, 3).map(el => {
                const style = window.getComputedStyle(el);
                return {
                    filter: style.filter,
                    opacity: style.opacity,
                    pointerEvents: style.pointerEvents
                };
            })
        };
    });
    
    console.log('\n🔍 モザイク構造の分析:');
    console.log('  premium-content-wrapper存在:', mosaicStructure.wrapperExists);
    if (mosaicStructure.wrapperStyle) {
        console.log('  wrapperスタイル:');
        console.log('    - filter:', mosaicStructure.wrapperStyle.filter);
        console.log('    - opacity:', mosaicStructure.wrapperStyle.opacity);
        console.log('    - position:', mosaicStructure.wrapperStyle.position);
    }
    console.log('  content-locked要素数:', mosaicStructure.contentLockedCount);
    console.log('  lock-overlay要素数:', mosaicStructure.lockOverlayCount);
    
    console.log('\n  最初の3つのcontent-lockedスタイル:');
    mosaicStructure.contentLockedStyles.forEach((style, i) => {
        console.log(`    ${i+1}. filter: ${style.filter}, opacity: ${style.opacity}, pointer: ${style.pointerEvents}`);
    });
    
    // ネストの深さを確認
    const nestingDepth = await page.evaluate(() => {
        const findMaxDepth = (element, currentDepth = 0) => {
            const locked = element.querySelectorAll('.content-locked');
            if (locked.length === 0) return currentDepth;
            
            let maxDepth = currentDepth;
            locked.forEach(el => {
                const depth = findMaxDepth(el, currentDepth + 1);
                if (depth > maxDepth) maxDepth = depth;
            });
            return maxDepth;
        };
        
        return findMaxDepth(document.body);
    });
    
    console.log('\n📊 ネストの深さ:', nestingDepth);
    
    if (nestingDepth > 1) {
        console.log('  ⚠️ content-lockedが入れ子になっています！');
        console.log('  これが二重のモザイクの原因です。');
    }
    
    // スクリーンショットを撮る
    await page.screenshot({ 
        path: 'mosaic-layers-test.png',
        fullPage: false 
    });
    console.log('\n📸 スクリーンショット保存: mosaic-layers-test.png');
    
    // 下にスクロールして確認
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
        path: 'mosaic-layers-scrolled.png',
        fullPage: false 
    });
    console.log('📸 スクロール後: mosaic-layers-scrolled.png');
    
    console.log('\n✅ テスト完了');
    
    await page.waitForTimeout(5000);
    await browser.close();
}

testMosaicLayers().catch(console.error);