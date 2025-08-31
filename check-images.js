const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('=== 画像読み込み状況確認 ===\n');

  // プレビューページを開く
  await page.goto('http://localhost:3000/lp-otsukisama-preview-v2.html?id=diag_test&userId=test');
  await page.waitForLoadState('networkidle');

  // すべての画像の読み込み状況を確認
  const images = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    return Array.from(imgs).map(img => ({
      src: img.src,
      alt: img.alt,
      loaded: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      displayWidth: img.width,
      displayHeight: img.height,
      visible: img.offsetParent !== null
    }));
  });

  console.log(`📸 画像数: ${images.length}個\n`);

  images.forEach((img, index) => {
    const status = img.loaded && img.naturalWidth > 0 ? '✅' : '❌';
    const visibility = img.visible ? '表示' : '非表示';
    console.log(`[${index + 1}] ${status} ${img.alt || '(alt なし)'}`);
    console.log(`    URL: ${img.src}`);
    console.log(`    サイズ: ${img.naturalWidth}x${img.naturalHeight} (表示: ${img.displayWidth}x${img.displayHeight})`);
    console.log(`    状態: ${visibility}`);
    console.log('');
  });

  // 画像読み込みエラーをチェック
  const failedImages = images.filter(img => !img.loaded || img.naturalWidth === 0);
  if (failedImages.length > 0) {
    console.log('❌ 読み込み失敗した画像:');
    failedImages.forEach(img => {
      console.log(`  - ${img.src}`);
    });
  } else {
    console.log('✅ すべての画像が正常に読み込まれました');
  }

  // スクリーンショット
  await page.screenshot({ path: '/tmp/image-check.png', fullPage: true });
  console.log('\n📸 スクリーンショット保存: /tmp/image-check.png');

  await browser.close();
})();