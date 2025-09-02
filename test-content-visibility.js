const { chromium } = require('playwright');

async function testContentVisibility() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();
    
    console.log('📱 コンテンツの表示状態を確認中...');
    
    // テスト用のURLでアクセス
    const testDiagnosisId = 'diag_1756723057473_zbxzkmtt0';
    const testUserId = 'U69bf66f589f5303a9615e94d7a7dc693';
    await page.goto(`https://line-love-edu.vercel.app/lp-otsukisama-unified.html?id=${testDiagnosisId}&userId=${testUserId}`);
    
    // ページが完全に読み込まれるまで待機
    await page.waitForTimeout(5000);
    
    // 各セクションの詳細を確認
    const contentStatus = await page.evaluate(() => {
        const sections = [];
        
        // 1. ヘッダー部分
        const header = document.querySelector('.header');
        if (header) {
            const style = window.getComputedStyle(header);
            sections.push({
                name: 'ヘッダー',
                visible: style.display !== 'none',
                filter: style.filter,
                content: header.querySelector('h1')?.textContent || 'N/A'
            });
        }
        
        // 2. 月詠の挨拶
        const tsukuyomi = document.querySelector('.tsukuyomi-section');
        if (tsukuyomi) {
            const style = window.getComputedStyle(tsukuyomi);
            sections.push({
                name: '月詠の挨拶',
                visible: style.display !== 'none',
                filter: style.filter,
                content: tsukuyomi.querySelector('.tsukuyomi-bubble p')?.textContent?.substring(0, 50) + '...'
            });
        }
        
        // 3. 基本の月相情報
        const moonPhase = document.querySelector('.moon-phase-card');
        if (moonPhase) {
            const style = window.getComputedStyle(moonPhase);
            sections.push({
                name: '基本月相（表）',
                visible: style.display !== 'none',
                filter: style.filter,
                content: moonPhase.querySelector('h2')?.textContent || 'N/A'
            });
        }
        
        // 4. 購入CTA
        const previewCta = document.querySelector('.preview-cta');
        if (previewCta) {
            const style = window.getComputedStyle(previewCta);
            sections.push({
                name: '購入CTA',
                visible: style.display !== 'none',
                filter: style.filter,
                content: '購入ボタン表示'
            });
        }
        
        // 5. プレミアムコンテンツ全体
        const premiumWrapper = document.querySelector('.premium-content-wrapper');
        if (premiumWrapper) {
            const style = window.getComputedStyle(premiumWrapper);
            sections.push({
                name: 'プレミアムラッパー',
                visible: style.display !== 'none',
                filter: style.filter,
                content: 'プレミアムコンテンツ全体'
            });
        }
        
        // 6. 各content-lockedセクション
        document.querySelectorAll('.content-locked').forEach((el, index) => {
            const style = window.getComputedStyle(el);
            const banner = el.querySelector('img[src*="/images/banner/"]');
            const lockOverlay = el.querySelector('.lock-overlay');
            
            sections.push({
                name: `モザイクセクション${index + 1}`,
                visible: style.display !== 'none',
                filter: style.filter,
                hasBanner: banner !== null,
                hasLockOverlay: lockOverlay !== null,
                lockOverlayVisible: lockOverlay ? window.getComputedStyle(lockOverlay).display !== 'none' : false
            });
        });
        
        return sections;
    });
    
    console.log('\n📊 セクション別詳細:');
    console.log('================================');
    contentStatus.forEach(section => {
        console.log(`\n${section.name}:`);
        console.log(`  表示: ${section.visible ? '✅' : '❌'}`);
        console.log(`  フィルター: ${section.filter}`);
        if (section.content) {
            console.log(`  内容: ${section.content}`);
        }
        if (section.hasBanner !== undefined) {
            console.log(`  バナー: ${section.hasBanner ? '有' : '無'}`);
            console.log(`  ロックオーバーレイ: ${section.hasLockOverlay ? '有' : '無'}`);
            console.log(`  オーバーレイ表示: ${section.lockOverlayVisible ? '✅' : '❌'}`);
        }
    });
    
    // 期待される動作の確認
    console.log('\n✅ 期待される動作:');
    console.log('  1. ヘッダー、月詠挨拶、基本月相 → モザイクなし');
    console.log('  2. 購入CTA → 表示される');
    console.log('  3. プレミアムコンテンツ（9セクション） → モザイクあり');
    console.log('  4. 各モザイクセクションに小さなCTAボタン');
    
    // スクリーンショット
    await page.screenshot({ 
        path: 'content-visibility.png',
        fullPage: false 
    });
    console.log('\n📸 スクリーンショット: content-visibility.png');
    
    await page.waitForTimeout(5000);
    await browser.close();
}

testContentVisibility().catch(console.error);