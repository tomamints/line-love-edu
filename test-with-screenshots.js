const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  console.log('=== おつきさま診断 画面確認テスト ===\n');
  const testUserId = `screenshot_test_${Date.now()}`;

  try {
    // 1. 入力ページ
    console.log('📝 1. 入力ページ');
    await page.goto(`http://localhost:3000/lp-otsukisama-input.html?userId=${testUserId}`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/01_input_empty.png', fullPage: true });
    console.log('  ✅ 空の入力ページ: /tmp/01_input_empty.png');
    
    // フォーム入力
    await page.fill('#name', 'スクリーンショット花子');
    await page.selectOption('#year', '1990');
    await page.selectOption('#month', '7');
    await page.selectOption('#day', '7');
    await page.screenshot({ path: '/tmp/02_input_filled.png', fullPage: true });
    console.log('  ✅ 入力済みページ: /tmp/02_input_filled.png');
    
    // 送信
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]')
    ]);
    
    // 2. プレビューページ
    console.log('\n📝 2. プレビューページ');
    await page.waitForLoadState('networkidle');
    
    // 上部
    await page.screenshot({ path: '/tmp/03_preview_top.png', fullPage: false });
    console.log('  ✅ プレビュー上部: /tmp/03_preview_top.png');
    
    // 中央（ぼかし部分）
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/04_preview_blur.png', fullPage: false });
    console.log('  ✅ ぼかしコンテンツ: /tmp/04_preview_blur.png');
    
    // 決済ボタン
    await page.evaluate(() => {
      const button = document.getElementById('checkout-button');
      if (button) button.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/05_preview_payment.png', fullPage: false });
    console.log('  ✅ 決済ボタン: /tmp/05_preview_payment.png');
    
    // 全体
    await page.screenshot({ path: '/tmp/06_preview_full.png', fullPage: true });
    console.log('  ✅ プレビュー全体: /tmp/06_preview_full.png');
    
    console.log('\n✅ すべてのスクリーンショットを保存しました');
    console.log('\n📁 保存先:');
    console.log('  /tmp/01_input_empty.png   - 空の入力ページ');
    console.log('  /tmp/02_input_filled.png  - 入力済みページ');
    console.log('  /tmp/03_preview_top.png   - プレビュー上部');
    console.log('  /tmp/04_preview_blur.png  - ぼかしコンテンツ');
    console.log('  /tmp/05_preview_payment.png - 決済ボタン');
    console.log('  /tmp/06_preview_full.png  - プレビュー全体');

  } catch (error) {
    console.error('❌ エラー:', error.message);
  }

  await browser.close();
})();