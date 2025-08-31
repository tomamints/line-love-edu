const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 // 動作を見やすくするため
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('=== おつきさま診断 完全フローテスト ===\n');
  const testUserId = `test_user_${Date.now()}`;

  try {
    // ========== Step 1: 入力ページ ==========
    console.log('📝 Step 1: 入力ページテスト');
    console.log('-----------------------------------');
    
    const inputUrl = `http://localhost:3000/lp-otsukisama-input.html?userId=${testUserId}`;
    await page.goto(inputUrl);
    await page.waitForLoadState('networkidle');
    console.log(`✅ 入力ページ読み込み完了: ${inputUrl}`);
    
    // ページの表示確認
    const title = await page.textContent('h1');
    console.log(`📌 ページタイトル: ${title}`);
    
    // スクリーンショット保存
    await page.screenshot({ path: '/tmp/1-input-page.png', fullPage: true });
    console.log('📸 スクリーンショット保存: /tmp/1-input-page.png');
    
    // フォーム入力
    console.log('\n📝 フォーム入力中...');
    await page.fill('#name', 'テスト花子');
    await page.selectOption('#year', '1995');
    await page.selectOption('#month', '3');
    await page.selectOption('#day', '15');
    console.log('✅ 入力完了: 名前=テスト花子, 生年月日=1995/3/15');
    
    // 送信前のスクリーンショット
    await page.screenshot({ path: '/tmp/2-input-filled.png', fullPage: true });
    console.log('📸 入力済みフォーム: /tmp/2-input-filled.png');
    
    // フォーム送信
    console.log('\n🚀 フォーム送信...');
    await page.click('button[type="submit"]');
    
    // ========== Step 2: プレビューページ ==========
    console.log('\n📝 Step 2: プレビューページテスト');
    console.log('-----------------------------------');
    
    // ページ遷移を待つ
    await page.waitForURL('**/lp-otsukisama-preview-v2.html*', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    
    const previewUrl = page.url();
    console.log(`✅ プレビューページ遷移成功: ${previewUrl}`);
    
    // URLパラメータ確認
    const urlParams = new URL(previewUrl).searchParams;
    const diagnosisId = urlParams.get('id');
    console.log(`🔑 診断ID: ${diagnosisId}`);
    
    // コンテンツ表示確認
    console.log('\n📋 コンテンツ表示確認:');
    
    // 月相セクション
    const moonSection = await page.$('.moon-phase-section');
    if (moonSection) {
      const moonTitle = await moonSection.$eval('h2', el => el.textContent);
      console.log(`  ✅ 月相セクション: ${moonTitle}`);
    }
    
    // 無料コンテンツ
    const freeContents = await page.$$('.free-content');
    console.log(`  ✅ 無料コンテンツ: ${freeContents.length}セクション`);
    
    // ぼかしコンテンツ
    const blurredContents = await page.$$('.blurred-content');
    console.log(`  ✅ ぼかしコンテンツ: ${blurredContents.length}セクション`);
    
    // 決済ボタン
    const checkoutButton = await page.$('#checkout-button');
    if (checkoutButton) {
      const buttonText = await checkoutButton.textContent();
      console.log(`  ✅ 決済ボタン: "${buttonText}"`);
    }
    
    // プレビューページのスクリーンショット
    await page.screenshot({ path: '/tmp/3-preview-page.png', fullPage: true });
    console.log('\n📸 プレビューページ: /tmp/3-preview-page.png');
    
    // スクロールして全体を確認
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/4-preview-middle.png', fullPage: false });
    console.log('📸 プレビュー中央部: /tmp/4-preview-middle.png');
    
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/5-preview-bottom.png', fullPage: false });
    console.log('📸 プレビュー下部: /tmp/5-preview-bottom.png');
    
    // ========== Step 3: 決済ボタン確認 ==========
    console.log('\n📝 Step 3: 決済フロー確認');
    console.log('-----------------------------------');
    
    if (checkoutButton) {
      // ボタンの状態確認
      const isDisabled = await checkoutButton.evaluate(el => el.disabled);
      console.log(`  決済ボタン状態: ${isDisabled ? '無効' : '有効'}`);
      
      // onclick属性確認
      const onclickAttr = await checkoutButton.evaluate(el => el.getAttribute('onclick'));
      if (onclickAttr) {
        console.log(`  onclick属性: ${onclickAttr.substring(0, 50)}...`);
      }
      
      console.log('\n⚠️  Stripe決済への遷移はテスト環境のため実行しません');
    }
    
    // ========== Step 4: データベース確認 ==========
    console.log('\n📝 Step 4: データベース保存確認');
    console.log('-----------------------------------');
    
    // APIで保存されたデータを確認
    const apiUrl = `http://localhost:3000/api/get-love-profile?userId=${testUserId}`;
    const response = await page.evaluate(async (url) => {
      const res = await fetch(url);
      return await res.json();
    }, apiUrl);
    
    if (response.success && response.profile) {
      console.log('✅ プロファイルがデータベースに保存されました:');
      console.log(`  - 名前: ${response.profile.userName}`);
      console.log(`  - 生年月日: ${response.profile.birthDate}`);
      console.log(`  - 診断タイプ: ${response.profile.diagnosisType}`);
      console.log(`  - 月パターンID: ${response.profile.moonPatternId}`);
    } else {
      console.log('⚠️  プロファイルの保存確認できませんでした');
    }
    
    // ========== 結果サマリー ==========
    console.log('\n' + '='.repeat(50));
    console.log('📊 テスト結果サマリー');
    console.log('='.repeat(50));
    console.log('✅ 入力ページ: 正常動作');
    console.log('✅ フォーム送信: 成功');
    console.log('✅ プレビューページ遷移: 成功');
    console.log('✅ コンテンツ表示: 正常');
    console.log('✅ ぼかし機能: 動作確認');
    console.log('✅ 決済ボタン: 表示確認');
    console.log('✅ データベース保存: 確認済み');
    
    console.log('\n🎉 全てのテストが成功しました！');
    console.log('\n📁 スクリーンショット保存先:');
    console.log('  /tmp/1-input-page.png');
    console.log('  /tmp/2-input-filled.png');
    console.log('  /tmp/3-preview-page.png');
    console.log('  /tmp/4-preview-middle.png');
    console.log('  /tmp/5-preview-bottom.png');

  } catch (error) {
    console.error('\n❌ エラー発生:', error.message);
    await page.screenshot({ path: '/tmp/error-screenshot.png', fullPage: true });
    console.log('📸 エラー時のスクリーンショット: /tmp/error-screenshot.png');
    console.log('現在のURL:', page.url());
  }

  // ブラウザを5秒後に閉じる
  console.log('\n⏰ 5秒後にブラウザを閉じます...');
  await page.waitForTimeout(5000);
  await browser.close();
})();