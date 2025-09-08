/**
 * 購入者専用リッチメニューを作成するスクリプト
 * 診断履歴ボタンを含む
 */

require('dotenv').config();
const { Client } = require('@line/bot-sdk');
const fs = require('fs');
const path = require('path');

const client = new Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
});

async function createPurchaserRichMenu() {
  try {
    // リッチメニューを作成
    const richMenu = {
      size: {
        width: 2500,
        height: 1686
      },
      selected: true,
      name: '購入者専用メニュー',
      chatBarText: 'メニュー',
      areas: [
        // 左上: 診断履歴
        {
          bounds: {
            x: 0,
            y: 0,
            width: 1250,
            height: 843
          },
          action: {
            type: 'uri',
            uri: `${process.env.BASE_URL || 'https://line-love-edu.vercel.app'}/history.html?userId={{LINE_USER_ID}}`
          }
        },
        // 右上: 新しい診断
        {
          bounds: {
            x: 1250,
            y: 0,
            width: 1250,
            height: 843
          },
          action: {
            type: 'message',
            text: 'おつきさま'
          }
        },
        // 左下: お問い合わせ
        {
          bounds: {
            x: 0,
            y: 843,
            width: 1250,
            height: 843
          },
          action: {
            type: 'message',
            text: 'お問い合わせ'
          }
        },
        // 右下: 使い方
        {
          bounds: {
            x: 1250,
            y: 843,
            width: 1250,
            height: 843
          },
          action: {
            type: 'message',
            text: '使い方'
          }
        }
      ]
    };

    // リッチメニューを作成
    console.log('購入者専用リッチメニューを作成中...');
    const richMenuId = await client.createRichMenu(richMenu);
    console.log('リッチメニューID:', richMenuId);

    // リッチメニュー画像をアップロード
    const imagePath = path.join(__dirname, 'assets', 'purchaser-rich-menu.png');
    
    // 画像ファイルが存在しない場合は、デフォルト画像を使用
    let imageBuffer;
    if (fs.existsSync(imagePath)) {
      imageBuffer = fs.readFileSync(imagePath);
      console.log('購入者専用リッチメニュー画像を使用');
    } else {
      // デフォルト画像を探す
      const defaultImagePath = path.join(__dirname, 'assets', 'rich-menu.png');
      if (fs.existsSync(defaultImagePath)) {
        imageBuffer = fs.readFileSync(defaultImagePath);
        console.log('デフォルトリッチメニュー画像を使用');
      } else {
        console.error('リッチメニュー画像が見つかりません');
        console.log('画像を作成してください: assets/purchaser-rich-menu.png (2500x1686px)');
        return;
      }
    }

    await client.setRichMenuImage(richMenuId, imageBuffer);
    console.log('画像をアップロードしました');

    // 環境変数として保存するための指示
    console.log('\n=== 重要 ===');
    console.log('以下の環境変数を設定してください:');
    console.log(`PREMIUM_RICH_MENU_ID=${richMenuId}`);
    console.log('\nVercelの場合:');
    console.log('1. Vercelダッシュボードから Settings > Environment Variables へ');
    console.log('2. PREMIUM_RICH_MENU_ID を追加');
    console.log(`3. 値: ${richMenuId}`);

    return richMenuId;
  } catch (error) {
    console.error('エラー:', error);
    if (error.response) {
      console.error('詳細:', error.response.data);
    }
  }
}

// スクリプトを実行
createPurchaserRichMenu();