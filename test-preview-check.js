const { chromium } = require('playwright');

async function testPreviewCheck() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();
    
    console.log('📱 プレビューモードの表示を確認中...');
    
    // テスト用のURLでアクセス
    const testDiagnosisId = 'diag_1756723057473_zbxzkmtt0';
    const testUserId = 'U69bf66f589f5303a9615e94d7a7dc693';
    await page.goto(`https://line-love-edu.vercel.app/lp-otsukisama-unified.html?id=${testDiagnosisId}&userId=${testUserId}`);
    
    // ページが完全に読み込まれるまで待機
    await page.waitForTimeout(5000);
    
    // モザイクがかかっている要素を確認
    const mosaicStatus = await page.evaluate(() => {
        const result = {
            sections: [],
            totalSections: 0,
            blurredSections: 0,
            visibleSections: 0
        };
        
        // 主要なセクションをチェック
        const sectionSelectors = [
            { name: '基本情報（月相）', selector: '.moon-phase-card:first-of-type' },
            { name: 'プレビューCTA', selector: '.preview-cta' },
            { name: '裏月相', selector: '.content-locked:nth-of-type(1)' },
            { name: '3つの力', selector: '.content-locked:nth-of-type(2)' },
            { name: '4つの軸', selector: '.content-locked:nth-of-type(3)' },
            { name: 'カレンダー', selector: '.content-locked:nth-of-type(4)' },
            { name: '恋愛運', selector: '.content-locked:nth-of-type(5)' },
            { name: '人間関係', selector: '.content-locked:nth-of-type(6)' },
            { name: '仕事運', selector: '.content-locked:nth-of-type(7)' },
            { name: '金運', selector: '.content-locked:nth-of-type(8)' },
            { name: '最終メッセージ', selector: '.content-locked:nth-of-type(9)' }
        ];
        
        sectionSelectors.forEach(section => {
            const el = document.querySelector(section.selector);
            if (el) {
                const style = window.getComputedStyle(el);
                const isBlurred = style.filter.includes('blur');
                result.sections.push({
                    name: section.name,
                    exists: true,
                    filter: style.filter,
                    opacity: style.opacity,
                    display: style.display,
                    isBlurred: isBlurred
                });
                result.totalSections++;
                if (isBlurred) result.blurredSections++;
                else result.visibleSections++;
            } else {
                result.sections.push({
                    name: section.name,
                    exists: false
                });
            }
        });
        
        // premium-content-wrapperの状態も確認
        const wrapper = document.querySelector('.premium-content-wrapper');
        if (wrapper) {
            const wrapperStyle = window.getComputedStyle(wrapper);
            result.wrapperStatus = {
                filter: wrapperStyle.filter,
                opacity: wrapperStyle.opacity
            };
        }
        
        return result;
    });
    
    console.log('\n🔍 セクション別の表示状態:');
    console.log('================================');
    mosaicStatus.sections.forEach(section => {
        if (section.exists) {
            const status = section.isBlurred ? '🔒 ぼかし' : '✅ 表示';
            console.log(`${status} ${section.name}`);
            console.log(`     filter: ${section.filter}`);
            console.log(`     opacity: ${section.opacity}`);
        } else {
            console.log(`❌ ${section.name} - 見つかりません`);
        }
    });
    
    console.log('\n📊 サマリー:');
    console.log(`  合計セクション: ${mosaicStatus.totalSections}`);
    console.log(`  ぼかし表示: ${mosaicStatus.blurredSections}`);
    console.log(`  通常表示: ${mosaicStatus.visibleSections}`);
    
    if (mosaicStatus.wrapperStatus) {
        console.log('\n📦 premium-content-wrapper:');
        console.log(`  filter: ${mosaicStatus.wrapperStatus.filter}`);
        console.log(`  opacity: ${mosaicStatus.wrapperStatus.opacity}`);
    }
    
    // 問題の診断
    console.log('\n💡 診断結果:');
    if (mosaicStatus.blurredSections === mosaicStatus.totalSections - 1) {
        console.log('  ⚠️ プレビューCTA以外すべてにモザイクがかかっています');
        console.log('  これは正常なプレビューモードの動作です');
    } else if (mosaicStatus.blurredSections === 0) {
        console.log('  ❌ モザイクが全く機能していません');
    } else {
        console.log('  ✅ 部分的にモザイクが適用されています');
    }
    
    // スクリーンショットを撮る
    await page.screenshot({ 
        path: 'preview-check.png',
        fullPage: false 
    });
    console.log('\n📸 スクリーンショット保存: preview-check.png');
    
    // スクロールして確認
    await page.evaluate(() => window.scrollTo(0, 1500));
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
        path: 'preview-check-scrolled.png',
        fullPage: false 
    });
    console.log('📸 スクロール後: preview-check-scrolled.png');
    
    await page.waitForTimeout(5000);
    await browser.close();
}

testPreviewCheck().catch(console.error);