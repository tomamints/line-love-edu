/**
 * 購入者専用LINEリッチメニュー作成スクリプト
 * 
 * 使い方:
 * 1. .envファイルにCHANNEL_ACCESS_TOKENが設定されていることを確認
 * 2. node create-premium-rich-menu.js を実行
 */

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

if (!CHANNEL_ACCESS_TOKEN) {
  console.error('❌ CHANNEL_ACCESS_TOKENが設定されていません');
  process.exit(1);
}

// 購入者専用リッチメニューの設定
const premiumRichMenuObject = {
  size: {
    width: 2500,
    height: 1686
  },
  selected: true,
  name: '購入者専用メニュー',
  chatBarText: 'プレミアムメニュー',
  areas: [
    // 左上: おつきさま診断
    {
      bounds: {
        x: 0,
        y: 0,
        width: 833,
        height: 843
      },
      action: {
        type: 'message',
        text: 'おつきさま診断'
      }
    },
    // 中央上: 購入履歴（NEW!）
    {
      bounds: {
        x: 833,
        y: 0,
        width: 834,
        height: 843
      },
      action: {
        type: 'message',
        text: '購入履歴'
      }
    },
    // 右上: 月タロット占い
    {
      bounds: {
        x: 1667,
        y: 0,
        width: 833,
        height: 843
      },
      action: {
        type: 'message',
        text: '月タロット占い'
      }
    },
    // 左下: 恋愛成就の秘訣
    {
      bounds: {
        x: 0,
        y: 843,
        width: 833,
        height: 843
      },
      action: {
        type: 'message',
        text: '恋愛成就の秘訣'
      }
    },
    // 中央下: 相性診断
    {
      bounds: {
        x: 833,
        y: 843,
        width: 834,
        height: 843
      },
      action: {
        type: 'message',
        text: '相性診断'
      }
    },
    // 右下: ヘルプ
    {
      bounds: {
        x: 1667,
        y: 843,
        width: 833,
        height: 843
      },
      action: {
        type: 'message',
        text: 'ヘルプ'
      }
    }
  ]
};

// リッチメニューを作成
async function createPremiumRichMenu() {
  try {
    console.log('📱 購入者専用リッチメニューを作成中...');
    
    // 1. リッチメニューを作成
    const createResponse = await axios.post(
      'https://api.line.me/v2/bot/richmenu',
      premiumRichMenuObject,
      {
        headers: {
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    const richMenuId = createResponse.data.richMenuId;
    console.log('✅ リッチメニュー作成成功:', richMenuId);
    
    // 2. 画像をアップロード
    const imagePath = path.join(__dirname, 'rich-menu-premium.png');
    
    // 画像ファイルが存在しない場合は、仮の画像を作成
    if (!fs.existsSync(imagePath)) {
      console.log('⚠️ rich-menu-premium.png が見つかりません');
      console.log('📝 仮の画像ファイルを作成します...');
      
      // Canvas を使って仮の画像を生成
      try {
        const { createCanvas } = require('canvas');
        const canvas = createCanvas(2500, 1686);
        const ctx = canvas.getContext('2d');
        
        // 背景を紫のグラデーションに
        const gradient = ctx.createLinearGradient(0, 0, 2500, 1686);
        gradient.addColorStop(0, '#6B46C1');
        gradient.addColorStop(1, '#9333EA');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 2500, 1686);
        
        // グリッドを描画
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        
        // 縦線
        ctx.beginPath();
        ctx.moveTo(833, 0);
        ctx.lineTo(833, 1686);
        ctx.moveTo(1667, 0);
        ctx.lineTo(1667, 1686);
        ctx.stroke();
        
        // 横線
        ctx.beginPath();
        ctx.moveTo(0, 843);
        ctx.lineTo(2500, 843);
        ctx.stroke();
        
        // テキストを追加
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 60px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 各ボタンのテキスト
        const buttons = [
          { text: 'おつきさま診断', x: 416, y: 421 },
          { text: '購入履歴\n(Premium)', x: 1250, y: 421 },
          { text: '月タロット占い', x: 2083, y: 421 },
          { text: '恋愛成就の秘訣', x: 416, y: 1264 },
          { text: '相性診断', x: 1250, y: 1264 },
          { text: 'ヘルプ', x: 2083, y: 1264 }
        ];
        
        buttons.forEach(button => {
          const lines = button.text.split('\n');
          lines.forEach((line, index) => {
            const yOffset = (index - (lines.length - 1) / 2) * 70;
            ctx.fillText(line, button.x, button.y + yOffset);
          });
        });
        
        // プレミアムバッジを追加
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 40px sans-serif';
        ctx.fillText('★ PREMIUM ★', 1250, 100);
        
        // 画像を保存
        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(imagePath, buffer);
        console.log('✅ 仮の画像ファイルを作成しました');
      } catch (canvasError) {
        console.log('⚠️ canvas パッケージがインストールされていません');
        console.log('💡 npm install canvas でインストールするか、rich-menu-premium.png を用意してください');
        
        // canvasがない場合は、通常のリッチメニュー画像を使用
        const defaultImagePath = path.join(__dirname, 'rich-menu.png');
        if (fs.existsSync(defaultImagePath)) {
          console.log('📋 通常のリッチメニュー画像をコピーして使用します');
          fs.copyFileSync(defaultImagePath, imagePath);
        } else {
          console.error('❌ 画像ファイルが見つかりません');
          return;
        }
      }
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    
    await axios.post(
      `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`,
      imageBuffer,
      {
        headers: {
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
          'Content-Type': 'image/png',
          'Content-Length': imageBuffer.length
        }
      }
    );
    
    console.log('✅ 画像アップロード成功');
    
    // 3. 環境変数に保存するための情報を表示
    console.log('\n📝 以下の情報を .env ファイルに追加してください:');
    console.log(`PREMIUM_RICH_MENU_ID=${richMenuId}`);
    
    // 4. 既存のリッチメニューIDも取得して表示
    const menusResponse = await axios.get(
      'https://api.line.me/v2/bot/richmenu/list',
      {
        headers: {
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
    
    const defaultMenu = menusResponse.data.richmenus.find(menu => 
      menu.name === '恋愛占いメニュー' || menu.name === 'Default Menu'
    );
    
    if (defaultMenu) {
      console.log(`DEFAULT_RICH_MENU_ID=${defaultMenu.richMenuId}`);
    }
    
    console.log('\n✅ 購入者専用リッチメニューの作成が完了しました！');
    console.log('📌 購入完了時に自動的に切り替わるようになります');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.response?.data || error.message);
  }
}

// 既存のリッチメニューを確認
async function checkExistingMenus() {
  try {
    const response = await axios.get(
      'https://api.line.me/v2/bot/richmenu/list',
      {
        headers: {
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
    
    const premiumMenu = response.data.richmenus.find(menu => 
      menu.name === '購入者専用メニュー'
    );
    
    if (premiumMenu) {
      console.log('⚠️ 購入者専用メニューが既に存在します');
      console.log('ID:', premiumMenu.richMenuId);
      console.log('\n既存のメニューを削除しますか？ (y/n)');
      
      // ユーザー入力を待つ
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          await axios.delete(
            `https://api.line.me/v2/bot/richmenu/${premiumMenu.richMenuId}`,
            {
              headers: {
                'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
              }
            }
          );
          console.log('✅ 既存のメニューを削除しました');
          await createPremiumRichMenu();
        } else {
          console.log('❌ 作成をキャンセルしました');
        }
        readline.close();
      });
    } else {
      await createPremiumRichMenu();
    }
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

// 実行
checkExistingMenus();