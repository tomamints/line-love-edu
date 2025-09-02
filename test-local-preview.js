const { chromium } = require('playwright');

async function testLocalPreview() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();
    
    console.log('📱 ローカルでプレビューモードを確認中...');
    
    // ローカルサーバーで確認
    await page.goto('http://localhost:3000/lp-otsukisama-unified.html?id=test&userId=test');
    
    // ページが読み込まれるまで待機
    await page.waitForTimeout(3000);
    
    // 全画面スクリーンショット
    await page.screenshot({ 
        path: 'local-preview-full.png',
        fullPage: true 
    });
    console.log('📸 フルページ: local-preview-full.png');
    
    // 上部のスクリーンショット
    await page.screenshot({ 
        path: 'local-preview-top.png',
        fullPage: false 
    });
    console.log('📸 上部: local-preview-top.png');
    
    // 実際のHTML構造を確認
    const structure = await page.evaluate(() => {
        const result = [];
        
        // body直下の主要な要素を確認
        const body = document.body;
        const children = body.children;
        
        for (let child of children) {
            if (child.classList.contains('container')) {
                // container内の要素を確認
                const containerChildren = child.children;
                for (let cc of containerChildren) {
                    const style = window.getComputedStyle(cc);
                    result.push({
                        tag: cc.tagName,
                        class: cc.className,
                        filter: style.filter,
                        display: style.display,
                        hasContentLocked: cc.querySelector('.content-locked') !== null
                    });
                }
            }
        }
        
        // result-section内の構造も確認
        const resultSection = document.querySelector('.result-section');
        if (resultSection) {
            const rsChildren = resultSection.children;
            for (let rs of rsChildren) {
                const style = window.getComputedStyle(rs);
                result.push({
                    tag: rs.tagName,
                    class: rs.className,
                    filter: style.filter,
                    isInsideContentLocked: rs.closest('.content-locked') !== null
                });
            }
        }
        
        return result;
    });
    
    console.log('\n🔍 HTML構造:');
    structure.forEach(item => {
        console.log(`${item.tag}.${item.class}`);
        console.log(`  filter: ${item.filter}`);
        console.log(`  display: ${item.display}`);
        if (item.hasContentLocked !== undefined) {
            console.log(`  content-locked内: ${item.hasContentLocked}`);
        }
        if (item.isInsideContentLocked !== undefined) {
            console.log(`  content-locked内: ${item.isInsideContentLocked}`);
        }
    });
    
    // 問題の特定
    const diagnosis = await page.evaluate(() => {
        // premium-content-wrapperの前後を確認
        const premiumWrapper = document.querySelector('.premium-content-wrapper');
        const moonPhaseCard = document.querySelector('.moon-phase-card');
        const previewCta = document.querySelector('.preview-cta');
        
        return {
            premiumWrapperExists: premiumWrapper !== null,
            moonPhaseCardExists: moonPhaseCard !== null,
            previewCtaExists: previewCta !== null,
            moonPhaseInContentLocked: moonPhaseCard ? moonPhaseCard.closest('.content-locked') !== null : 'N/A',
            previewCtaInContentLocked: previewCta ? previewCta.closest('.content-locked') !== null : 'N/A'
        };
    });
    
    console.log('\n💡 診断:');
    console.log('  premium-content-wrapper存在:', diagnosis.premiumWrapperExists);
    console.log('  moon-phase-card存在:', diagnosis.moonPhaseCardExists);
    console.log('  preview-cta存在:', diagnosis.previewCtaExists);
    console.log('  moon-phase-cardがcontent-locked内:', diagnosis.moonPhaseInContentLocked);
    console.log('  preview-ctaがcontent-locked内:', diagnosis.previewCtaInContentLocked);
    
    await page.waitForTimeout(10000);
    await browser.close();
}

testLocalPreview().catch(console.error);