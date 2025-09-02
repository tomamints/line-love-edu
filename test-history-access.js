const { chromium } = require('playwright');

async function testHistoryAccess() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500 
    });
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();
    
    // コンソールログを取得
    page.on('console', msg => {
        console.log('PAGE LOG:', msg.text());
    });
    
    console.log('📱 購入済み履歴からのアクセスをテスト中...');
    
    // 履歴からアクセス（購入済みのはずのもの）
    const testDiagnosisId = 'a4527187-2f0a-42fa-8fca-9a8c43aa6a04';
    const testUserId = 'Ub2fcdc91798f5e56e0f9c759c4b7b55f';
    
    console.log('\n診断ID:', testDiagnosisId);
    console.log('ユーザーID:', testUserId);
    
    await page.goto(`https://line-love-edu.vercel.app/lp-otsukisama-unified.html?id=${testDiagnosisId}&userId=${testUserId}`);
    
    // ページが完全に読み込まれるまで待機
    await page.waitForTimeout(5000);
    
    // bodyのクラスを確認
    const bodyClass = await page.getAttribute('body', 'class');
    console.log('\n🔍 Body class:', bodyClass);
    
    // アクセスレベルをJavaScriptコンソールから取得
    const accessInfo = await page.evaluate(() => {
        return {
            currentMode: window.currentMode,
            currentUserId: window.currentUserId,
            bodyClass: document.body.className,
            hasContentLocked: document.querySelector('.content-locked') !== null,
            lockOverlayCount: document.querySelectorAll('.lock-overlay').length,
            purchaseButtonVisible: document.querySelector('#purchaseButton') !== null
        };
    });
    
    console.log('\n📊 アクセス情報:');
    console.log('  現在のモード:', accessInfo.currentMode);
    console.log('  ユーザーID:', accessInfo.currentUserId);
    console.log('  Bodyクラス:', accessInfo.bodyClass);
    console.log('  content-locked存在:', accessInfo.hasContentLocked);
    console.log('  ロックオーバーレイ数:', accessInfo.lockOverlayCount);
    console.log('  購入ボタン表示:', accessInfo.purchaseButtonVisible);
    
    // APIレスポンスを確認するため、Network応答を監視
    const apiResponse = await page.evaluate(async () => {
        const diagnosisId = 'a4527187-2f0a-42fa-8fca-9a8c43aa6a04';
        const userId = 'Ub2fcdc91798f5e56e0f9c759c4b7b55f';
        
        const response = await fetch(`/api/profile-form-v2?action=get-diagnosis&id=${diagnosisId}&userId=${userId}`);
        const data = await response.json();
        return data;
    });
    
    console.log('\n🌐 APIレスポンス:');
    console.log('  success:', apiResponse.success);
    console.log('  accessLevel:', apiResponse.accessLevel);
    console.log('  diagnosis.id:', apiResponse.diagnosis?.id);
    console.log('  diagnosis.user_id:', apiResponse.diagnosis?.user_id);
    
    // 期待される結果
    console.log('\n✅ 期待される結果:');
    console.log('  - Body class: complete-mode （購入済みの場合）');
    console.log('  - accessLevel: full （購入済みの場合）');
    console.log('  - content-locked: false または lock-overlay非表示');
    
    // 現在の結果
    const isPurchased = bodyClass === 'complete-mode' && apiResponse.accessLevel === 'full';
    
    if (isPurchased) {
        console.log('\n✅ 購入済みアクセスが正常に機能しています！');
    } else {
        console.log('\n❌ 問題: 購入済みなのにプレビューモードで表示されています');
        console.log('  確認が必要:');
        console.log('  1. access_rightsテーブルにこのユーザーとdiagnosisのレコードが存在するか');
        console.log('  2. access_levelが"full"になっているか');
        console.log('  3. valid_untilがNULLまたは未来の日付か');
    }
    
    // スクリーンショットを撮る
    await page.screenshot({ 
        path: 'history-access-test.png',
        fullPage: false 
    });
    console.log('\n📸 スクリーンショット保存: history-access-test.png');
    
    await page.waitForTimeout(5000);
    await browser.close();
}

testHistoryAccess().catch(console.error);