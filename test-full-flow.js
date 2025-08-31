const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== おつきさま診断 フルフローテスト開始 ===\n');

  try {
    // 1. 入力ページのテスト
    console.log('📝 Step 1: 入力ページテスト');
    const inputUrl = 'http://localhost:3000/lp-otsukisama-input.html?userId=test_user_123';
    await page.goto(inputUrl);
    console.log('✅ 入力ページにアクセス: ' + inputUrl);

    // フォームに入力
    await page.fill('#name', 'テスト太郎');
    await page.selectOption('#year', '1990');
    await page.selectOption('#month', '5');
    await page.selectOption('#day', '15');
    console.log('✅ フォーム入力完了: 名前=テスト太郎, 生年月日=1990/5/15');

    // 次へボタンをクリック
    await page.click('#nextButton');
    console.log('✅ 「次へ」ボタンをクリック');

    // プレビューページに遷移を待つ
    await page.waitForURL('**/lp-otsukisama-preview-v2.html*', { timeout: 10000 });
    console.log('✅ プレビューページへ遷移成功\n');

    // 2. プレビューページのテスト
    console.log('📝 Step 2: プレビューページテスト');
    const currentUrl = page.url();
    console.log('現在のURL: ' + currentUrl);

    // コンテンツの確認
    await page.waitForSelector('.moon-phase-section', { timeout: 5000 });
    console.log('✅ 月の満ち欠けセクション表示確認');

    // ぼかしコンテンツの確認
    const blurredContent = await page.$('.blurred-content');
    if (blurredContent) {
      console.log('✅ ぼかしコンテンツ表示確認');
    }

    // 決済ボタンの確認
    const paymentButton = await page.$('#checkout-button');
    if (paymentButton) {
      console.log('✅ 決済ボタン表示確認');
      const buttonText = await paymentButton.textContent();
      console.log('  ボタンテキスト: ' + buttonText);
    }

    // 無料コンテンツの内容確認
    const freeContents = await page.$$eval('.free-content h3', elements => 
      elements.map(el => el.textContent)
    );
    console.log('✅ 無料コンテンツ:');
    freeContents.forEach(content => {
      console.log('  - ' + content);
    });

    // 3. 決済フローのテスト（シミュレーション）
    console.log('\n📝 Step 3: 決済フローテスト');
    
    // 決済ボタンクリックのシミュレーション
    if (paymentButton) {
      console.log('⚠️  決済ボタンが存在します（Stripeチェックアウトへ遷移）');
      console.log('  実際の決済はテスト環境のため省略');
    }

    // 4. 結果ページへの直接アクセステスト
    console.log('\n📝 Step 4: 結果ページ直接アクセステスト');
    const resultUrl = currentUrl.replace('preview-v2', '');
    await page.goto(resultUrl);
    console.log('✅ 結果ページにアクセス: ' + resultUrl);

    // 結果ページのコンテンツ確認
    await page.waitForSelector('.moon-phase-section', { timeout: 5000 });
    console.log('✅ 結果ページの月の満ち欠けセクション表示確認');

    // 全セクションの確認
    const sections = await page.$$eval('section h2, section h3', elements => 
      elements.map(el => el.textContent)
    );
    console.log('✅ 結果ページのセクション一覧:');
    sections.slice(0, 10).forEach(section => {
      console.log('  - ' + section);
    });
    if (sections.length > 10) {
      console.log(`  ... 他${sections.length - 10}セクション`);
    }

    console.log('\n=== ✅ フルフローテスト完了 ===');
    console.log('すべてのページが正常に表示されることを確認しました。');

  } catch (error) {
    console.error('\n❌ エラー発生:', error.message);
    
    // スクリーンショットを保存
    const timestamp = Date.now();
    const screenshotPath = `/tmp/error_${timestamp}.png`;
    await page.screenshot({ path: screenshotPath });
    console.log('📸 エラー時のスクリーンショット保存: ' + screenshotPath);
    
    // 現在のURLを出力
    console.log('現在のURL: ' + page.url());
  }

  // ブラウザを開いたままにする（確認用）
  console.log('\n⏸️  ブラウザは開いたままです。確認後、Ctrl+Cで終了してください。');
  
  // 無限ループで待機（手動で終了するまで）
  await new Promise(() => {});
})();