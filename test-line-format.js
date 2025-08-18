// LINE版フォーマットのテスト
const { formatMoonReportV2 } = require('./utils/moon-formatter-v2');
const MoonFortuneEngineV2 = require('./core/moon-fortune-v2');

// いくつかのパターンをテスト
const testCases = [
  { user: '1998-01-01', partner: '1995-08-15', desc: '新月 × 満月（1位）' },
  { user: '1998-04-30', partner: '1995-08-15', desc: '三日月 × 十六夜（3位）' },
  { user: '1990-05-15', partner: '1992-10-20', desc: '中間順位' }
];

testCases.forEach(test => {
  console.log(`\n=== ${test.desc} ===`);
  
  const engine = new MoonFortuneEngineV2();
  const moonReport = engine.generateCompleteReading(test.user, test.partner);
  
  console.log(`ユーザー: ${moonReport.user.moonType}`);
  console.log(`相手: ${moonReport.partner.moonType}`);
  
  // フォーマッターでFlexメッセージ生成
  const flexMessage = formatMoonReportV2(moonReport);
  
  // カード1のボディ内容を確認
  const card1Body = flexMessage.contents[0].body.contents;
  
  console.log('\nカード1のボディ内容:');
  card1Body.forEach(content => {
    if (content.type === 'text' && content.text) {
      console.log(`  ${content.text}`);
    }
  });
});
