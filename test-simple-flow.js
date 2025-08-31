const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== おつきさま診断 シンプルフローテスト ===\n');

  try {
    // 1. 入力ページを開く
    console.log('📝 Step 1: 入力ページにアクセス');
    await page.goto('http://localhost:3000/lp-otsukisama-input.html?userId=test_flow');
    await page.waitForLoadState('networkidle');
    console.log('✅ ページ読み込み完了');

    // スクリーンショット保存
    await page.screenshot({ path: '/tmp/input-page.png' });
    console.log('📸 入力ページのスクリーンショット保存: /tmp/input-page.png');

    // フォーム入力
    console.log('\n📝 フォームに入力');
    await page.fill('#name', 'テスト花子');
    await page.selectOption('#year', '1995');
    await page.selectOption('#month', '3');
    await page.selectOption('#day', '20');
    console.log('✅ 入力完了: 名前=テスト花子, 生年月日=1995/3/20');

    // 次へボタンをクリック
    console.log('\n🚀 「次へ」ボタンをクリック');
    await page.click('#nextButton');
    
    // ナビゲーションを待つ
    console.log('⏳ ページ遷移を待機中...');
    await page.waitForLoadState('networkidle', { timeout: 15000 });
    
    // 現在のURLを確認
    const currentUrl = page.url();
    console.log('📍 現在のURL:', currentUrl);
    
    if (currentUrl.includes('preview')) {
      console.log('✅ プレビューページへの遷移成功');
      
      // プレビューページのスクリーンショット
      await page.screenshot({ path: '/tmp/preview-page.png' });
      console.log('📸 プレビューページのスクリーンショット保存: /tmp/preview-page.png');
      
      // 診断IDの取得
      const urlParams = new URL(currentUrl).searchParams;
      const diagnosisId = urlParams.get('id');
      console.log('🔍 診断ID:', diagnosisId);
      
      // コンテンツの確認
      const hasContent = await page.$('.moon-phase-section');
      if (hasContent) {
        console.log('✅ 月のコンテンツ表示確認');
      }
      
      const hasBlur = await page.$('.blurred-content');
      if (hasBlur) {
        console.log('✅ ぼかしコンテンツ表示確認');
      }
      
      const hasPaymentButton = await page.$('#checkout-button');
      if (hasPaymentButton) {
        console.log('✅ 決済ボタン表示確認');
      }
    } else {
      console.log('❌ プレビューページへの遷移失敗');
      console.log('現在のページタイトル:', await page.title());
    }

    console.log('\n=== ✅ テスト完了 ===');

  } catch (error) {
    console.error('\n❌ エラー発生:', error.message);
    await page.screenshot({ path: '/tmp/error-page.png' });
    console.log('📸 エラー時のスクリーンショット: /tmp/error-page.png');
  }

  // ブラウザを5秒後に閉じる
  console.log('\n⏰ 5秒後にブラウザを閉じます...');
  await page.waitForTimeout(5000);
  await browser.close();
})();