const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // コンソールメッセージを収集
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  // ページエラーを収集
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.toString());
  });

  console.log('=== コンソールエラー確認 ===\n');

  // 実際の診断IDでプレビューページを開く
  const url = 'http://localhost:3000/lp-otsukisama-preview-v2.html?id=diag_1756653887932_2wwr282bs&userId=final_test_1756653887';
  console.log('URL:', url);
  
  await page.goto(url);
  await page.waitForTimeout(2000); // JSの実行を待つ

  // エラーを表示
  console.log('\n📝 ページエラー:');
  if (pageErrors.length > 0) {
    pageErrors.forEach(error => console.log('❌', error));
  } else {
    console.log('✅ エラーなし');
  }

  // コンソールメッセージを表示
  console.log('\n📝 コンソールメッセージ:');
  consoleMessages.forEach(msg => {
    const icon = msg.type === 'error' ? '❌' : msg.type === 'warning' ? '⚠️' : '📍';
    console.log(icon, msg.type.toUpperCase() + ':', msg.text);
  });

  // 関数の存在確認
  console.log('\n📝 関数の存在確認:');
  const functionChecks = await page.evaluate(() => {
    return {
      updateMoonPhaseContent: typeof updateMoonPhaseContent,
      updateSixElements: typeof updateSixElements,
      initPreview: typeof initPreview,
      initPaymentButton: typeof initPaymentButton
    };
  });
  
  Object.entries(functionChecks).forEach(([name, type]) => {
    console.log(`  ${name}: ${type === 'function' ? '✅' : '❌'} (${type})`);
  });

  // データの確認
  console.log('\n📝 診断データの確認:');
  const apiResponse = await page.evaluate(async (diagnosisId) => {
    const response = await fetch(`/api/profile-form?action=get-diagnosis&id=${diagnosisId}`);
    return await response.json();
  }, 'diag_1756653887932_2wwr282bs');
  
  console.log('APIレスポンス:', JSON.stringify(apiResponse, null, 2));

  await browser.close();
})();