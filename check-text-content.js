const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('=== テキストコンテンツ確認 ===\n');

  // プレビューページを開く
  await page.goto('http://localhost:3000/lp-otsukisama-preview-v2.html?id=diag_test&userId=test');
  await page.waitForLoadState('networkidle');

  // 「...」となっている要素を確認
  const elementsWithDots = await page.evaluate(() => {
    const elements = document.querySelectorAll('.circle-element-label-bottom');
    return Array.from(elements).map(el => ({
      text: el.textContent,
      className: el.className,
      parentDataType: el.parentElement?.getAttribute('data-type'),
      parentDataValue: el.parentElement?.getAttribute('data-value'),
      parentDataMoonPhase: el.parentElement?.getAttribute('data-moon-phase')
    }));
  });

  console.log('📝 円形要素のラベル確認:');
  elementsWithDots.forEach((el, index) => {
    if (el.text === '...' || el.text === '読み込み中...') {
      console.log(`❌ [${index + 1}] ${el.text} - タイプ: ${el.parentDataType || 'moon'}`);
    } else {
      console.log(`✅ [${index + 1}] ${el.text}`);
    }
  });

  // 月相セクションのテキスト確認
  console.log('\n📝 月相セクションの内容:');
  const moonPhaseContent = await page.evaluate(() => {
    const section = document.querySelector('.moon-phase-section');
    if (!section) return null;
    
    return {
      title: section.querySelector('h2')?.textContent,
      subtitle: section.querySelector('h3')?.textContent,
      description: section.querySelector('p')?.textContent?.substring(0, 50) + '...'
    };
  });

  if (moonPhaseContent) {
    console.log(`  タイトル: ${moonPhaseContent.title || '❌ なし'}`);
    console.log(`  サブタイトル: ${moonPhaseContent.subtitle || '❌ なし'}`);
    console.log(`  説明: ${moonPhaseContent.description || '❌ なし'}`);
  }

  // 裏月相セクションの確認
  console.log('\n📝 裏月相セクションの内容:');
  const hiddenMoonContent = await page.evaluate(() => {
    const sections = document.querySelectorAll('.content-section');
    for (const section of sections) {
      const title = section.querySelector('h2')?.textContent;
      if (title && title.includes('裏')) {
        return {
          title: title,
          subtitle: section.querySelector('h3')?.textContent,
          description: section.querySelector('p')?.textContent?.substring(0, 50) + '...'
        };
      }
    }
    return null;
  });

  if (hiddenMoonContent) {
    console.log(`  タイトル: ${hiddenMoonContent.title || '❌ なし'}`);
    console.log(`  サブタイトル: ${hiddenMoonContent.subtitle || '❌ なし'}`);
    console.log(`  説明: ${hiddenMoonContent.description || '❌ なし'}`);
  }

  // データ属性の確認
  console.log('\n📝 データ属性の確認:');
  const dataAttributes = await page.evaluate(() => {
    const items = document.querySelectorAll('.type-item');
    return Array.from(items).map(item => ({
      type: item.getAttribute('data-type') || item.getAttribute('data-moon-type'),
      value: item.getAttribute('data-value'),
      moonPhase: item.getAttribute('data-moon-phase'),
      hasImage: !!item.querySelector('img')?.src
    }));
  });

  dataAttributes.forEach((attr, index) => {
    console.log(`[${index + 1}] タイプ: ${attr.type}, 値: ${attr.value || attr.moonPhase}, 画像: ${attr.hasImage ? '✅' : '❌'}`);
  });

  await browser.close();
})();