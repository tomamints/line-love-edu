/**
 * LINEリッチメニュー作成スクリプト（シンプル版）
 * 2つのボタンのみ：
 * 1. 月タロット占い（1日1回）
 * 2. おつきさま診断
 * 
 * 使い方:
 * node create-rich-menu-simple.js
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

// リッチメニューの設定（2ボタン版）
const richMenuObject = {
  size: {
    width: 2500,
    height: 843  // 高さを半分に
  },
  selected: true,
  name: '月の占いメニュー',
  chatBarText: 'メニューを開く',
  areas: [
    // 左側: 月タロット占い
    {
      bounds: {
        x: 0,
        y: 0,
        width: 1250,
        height: 843
      },
      action: {
        type: 'postback',
        data: 'action=tarot',
        displayText: '🔮 月タロット占い'
      }
    },
    // 右側: おつきさま診断
    {
      bounds: {
        x: 1250,
        y: 0,
        width: 1250,
        height: 843
      },
      action: {
        type: 'message',
        text: 'おつきさま診断'
      }
    }
  ]
};

async function createRichMenu() {
  try {
    console.log('📱 シンプルなリッチメニューを作成中...');
    
    // 1. リッチメニューを作成
    const createResponse = await axios.post(
      'https://api.line.me/v2/bot/richmenu',
      richMenuObject,
      {
        headers: {
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const richMenuId = createResponse.data.richMenuId;
    console.log('✅ リッチメニュー作成成功:', richMenuId);
    
    // 2. 画像をアップロード（画像ファイルがある場合）
    const imagePath = path.join(__dirname, 'rich-menu-simple.png');
    if (fs.existsSync(imagePath)) {
      console.log('🖼️ 画像をアップロード中...');
      
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
    } else {
      console.log('⚠️ rich-menu-simple.pngが見つかりません。デフォルト画像で作成します。');
      
      // デフォルト画像を生成
      const { createCanvas } = require('canvas');
      const canvas = createCanvas(2500, 843);
      const ctx = canvas.getContext('2d');
      
      // 背景グラデーション
      const gradient = ctx.createLinearGradient(0, 0, 2500, 843);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 2500, 843);
      
      // 左側: 月タロット占い
      ctx.fillStyle = 'white';
      ctx.font = 'bold 120px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔮', 625, 300);
      ctx.font = 'bold 80px sans-serif';
      ctx.fillText('月タロット占い', 625, 500);
      ctx.font = '50px sans-serif';
      ctx.fillText('1日1回の運命カード', 625, 650);
      
      // 中央線
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(1250, 50);
      ctx.lineTo(1250, 793);
      ctx.stroke();
      
      // 右側: おつきさま診断
      ctx.fillStyle = 'white';
      ctx.font = 'bold 120px sans-serif';
      ctx.fillText('🌙', 1875, 300);
      ctx.font = 'bold 80px sans-serif';
      ctx.fillText('おつきさま診断', 1875, 500);
      ctx.font = '50px sans-serif';
      ctx.fillText('月相から読む運命', 1875, 650);
      
      const buffer = canvas.toBuffer('image/png');
      
      await axios.post(
        `https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`,
        buffer,
        {
          headers: {
            'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
            'Content-Type': 'image/png',
            'Content-Length': buffer.length
          }
        }
      );
      
      console.log('✅ デフォルト画像をアップロードしました');
    }
    
    // 3. デフォルトのリッチメニューとして設定
    console.log('🔧 デフォルトのリッチメニューとして設定中...');
    
    await axios.post(
      `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
    
    console.log('✅ デフォルトリッチメニューとして設定完了');
    console.log('\n========================================');
    console.log('🎉 シンプルなリッチメニューの作成が完了しました！');
    console.log('========================================');
    console.log('リッチメニューID:', richMenuId);
    console.log('\n📝 メニュー構成:');
    console.log('  [🔮 月タロット占い] [🌙 おつきさま診断]');
    console.log('\n💡 動作:');
    console.log('  - 月タロット占い: Postbackで1日1回制限付き');
    console.log('  - おつきさま診断: 「本格」メッセージを送信');
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('📌 CHANNEL_ACCESS_TOKENが無効です。.envファイルを確認してください。');
    }
  }
}

// 既存のリッチメニューを削除する関数
async function deleteAllRichMenus() {
  try {
    console.log('🗑️ 既存のリッチメニューを確認中...');
    
    const listResponse = await axios.get(
      'https://api.line.me/v2/bot/richmenu/list',
      {
        headers: {
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
    
    const richmenus = listResponse.data.richmenus;
    
    if (richmenus.length === 0) {
      console.log('📭 既存のリッチメニューはありません');
      return;
    }
    
    console.log(`📋 ${richmenus.length}個のリッチメニューが見つかりました`);
    
    for (const menu of richmenus) {
      console.log(`🗑️ ${menu.name} (${menu.richMenuId}) を削除中...`);
      await axios.delete(
        `https://api.line.me/v2/bot/richmenu/${menu.richMenuId}`,
        {
          headers: {
            'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
          }
        }
      );
    }
    
    console.log('✅ 既存のリッチメニューをすべて削除しました\n');
    
  } catch (error) {
    console.error('❌ リッチメニュー削除中にエラー:', error.response?.data || error.message);
  }
}

// メイン処理
async function main() {
  console.log('========================================');
  console.log('📱 LINEシンプルリッチメニュー設定ツール');
  console.log('========================================\n');
  
  // まず既存のリッチメニューを削除
  await deleteAllRichMenus();
  
  // 新しいリッチメニューを作成
  await createRichMenu();
}

// canvasライブラリがない場合はインストールを促す
try {
  require('canvas');
} catch (e) {
  console.log('⚠️ canvasライブラリが必要です。インストールしてください:');
  console.log('   npm install canvas');
  console.log('');
}

main();