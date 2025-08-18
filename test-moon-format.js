// おつきさま診断フォーマットテスト
const { formatMoonReportV2 } = require('./utils/moon-formatter-v2');
const MoonFortuneEngineV2 = require('./core/moon-fortune-v2');

// テスト用のプロフィール
const userBirthDate = '1998-04-30';   // 三日月タイプ
const partnerBirthDate = '1995-08-15'; // 十六夜タイプ

// 月占いエンジンでレポート生成
const engine = new MoonFortuneEngineV2();
const moonReport = engine.generateCompleteReading(userBirthDate, partnerBirthDate);

console.log('📊 生成されたレポート概要:');
console.log('  ユーザー月相:', moonReport.user.moonType);
console.log('  相手月相:', moonReport.partner.moonType);
console.log('  相性スコア:', moonReport.compatibility.score);
console.log('');

// フォーマッターでFlexメッセージ生成
const flexMessage = formatMoonReportV2(moonReport);

// カード1の内容を確認
const card1 = flexMessage.contents[0];
console.log('🎴 カード1（相性診断）の内容:');

// ヘッダー部分
const headerTexts = card1.header.contents.map(c => c.text);
console.log('  ヘッダー:', headerTexts);

// ボディ部分のテキストを抽出
const bodyContents = card1.body.contents;
bodyContents.forEach(content => {
  if (content.type === 'text') {
    console.log('  ', content.text);
  }
});
