/**
 * リッチメニュー画像生成スクリプト
 * Canvas APIを使用して2500x1686pxの画像を生成
 */

const { createCanvas } = require('canvas');
const fs = require('fs');

// キャンバスを作成
const width = 2500;
const height = 1686;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// 背景のグラデーション
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#667eea');
gradient.addColorStop(1, '#764ba2');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// メニュー項目の設定
const menuItems = [
  { icon: '🌙', title: 'おつきさま診断', desc: 'あなたの月タイプ' },
  { icon: '🔮', title: '月タロット占い', desc: '今日の恋愛運', highlight: true },
  { icon: '✨', title: '今日の運勢', desc: '毎日の運勢' },
  { icon: '👤', title: 'プロフィール', desc: '情報を設定' },
  { icon: '❓', title: 'ヘルプ', desc: '使い方' },
  { icon: '⚙️', title: '設定', desc: 'その他' }
];

// 各メニュー項目を描画
const itemWidth = width / 3;
const itemHeight = height / 2;

menuItems.forEach((item, index) => {
  const col = index % 3;
  const row = Math.floor(index / 3);
  const x = col * itemWidth;
  const y = row * itemHeight;
  
  // 枠線
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, itemWidth, itemHeight);
  
  // ハイライト背景（タロット占い）
  if (item.highlight) {
    const highlightGradient = ctx.createLinearGradient(x, y, x + itemWidth, y + itemHeight);
    highlightGradient.addColorStop(0, 'rgba(240, 147, 251, 0.3)');
    highlightGradient.addColorStop(1, 'rgba(245, 87, 108, 0.3)');
    ctx.fillStyle = highlightGradient;
    ctx.fillRect(x, y, itemWidth, itemHeight);
  }
  
  // テキスト設定
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // アイコン（絵文字の代わりにテキストで表現）
  ctx.font = 'bold 120px sans-serif';
  ctx.fillText(item.icon, x + itemWidth / 2, y + itemHeight / 2 - 80);
  
  // タイトル
  ctx.font = 'bold 60px sans-serif';
  ctx.fillText(item.title, x + itemWidth / 2, y + itemHeight / 2 + 40);
  
  // 説明
  ctx.font = '40px sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillText(item.desc, x + itemWidth / 2, y + itemHeight / 2 + 120);
});

// PNG画像として保存
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('rich-menu-image.png', buffer);

console.log('✅ リッチメニュー画像を生成しました: rich-menu-image.png');
console.log('   サイズ: 2500 x 1686 px');
console.log('   ファイルサイズ:', (buffer.length / 1024).toFixed(2), 'KB');