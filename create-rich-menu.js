/**
 * LINEリッチメニュー作成スクリプト
 * 
 * 使い方:
 * 1. .envファイルにCHANNEL_ACCESS_TOKENが設定されていることを確認
 * 2. node create-rich-menu.js を実行
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

// リッチメニューの設定
const richMenuObject = {
  size: {
    width: 2500,
    height: 1686
  },
  selected: true,
  name: '恋愛占いメニュー',
  chatBarText: 'メニューを開く',
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
    // 中央上: 月タロット占い
    {
      bounds: {
        x: 833,
        y: 0,
        width: 834,
        height: 843
      },
      action: {
        type: 'postback',
        data: 'action=tarot',
        displayText: '月タロット占い'
      }
    },
    // 右上: 今日の運勢
    {
      bounds: {
        x: 1667,
        y: 0,
        width: 833,
        height: 843
      },
      action: {
        type: 'message',
        text: '今日の運勢'
      }
    },
    // 左下: プロフィール設定
    {
      bounds: {
        x: 0,
        y: 843,
        width: 833,
        height: 843
      },
      action: {
        type: 'message',
        text: 'プロフィール'
      }
    },
    // 中央下: ヘルプ
    {
      bounds: {
        x: 833,
        y: 843,
        width: 834,
        height: 843
      },
      action: {
        type: 'message',
        text: 'ヘルプ'
      }
    },
    // 右下: 設定
    {
      bounds: {
        x: 1667,
        y: 843,
        width: 833,
        height: 843
      },
      action: {
        type: 'message',
        text: '設定'
      }
    }
  ]
};

async function createRichMenu() {
  try {
    console.log('📱 リッチメニューを作成中...');
    
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
    const imagePath = path.join(__dirname, 'rich-menu-image.png');
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
      console.log('⚠️ rich-menu-image.pngが見つかりません。画像なしで作成されました。');
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
    console.log('🎉 リッチメニューの作成が完了しました！');
    console.log('========================================');
    console.log('リッチメニューID:', richMenuId);
    console.log('\n📝 メニュー構成:');
    console.log('  [おつきさま診断] [月タロット占い] [今日の運勢]');
    console.log('  [プロフィール]   [ヘルプ]         [設定]');
    console.log('\n💡 月タロット占いはPostbackアクション（action=tarot）で設定されています');
    
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
  console.log('📱 LINEリッチメニュー設定ツール');
  console.log('========================================\n');
  
  // まず既存のリッチメニューを確認
  try {
    const listResponse = await axios.get(
      'https://api.line.me/v2/bot/richmenu/list',
      {
        headers: {
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
    
    const existingMenus = listResponse.data.richmenus;
    if (existingMenus.length > 0) {
      console.log('📋 既存のリッチメニュー:');
      existingMenus.forEach(menu => {
        console.log(`  - ${menu.name} (ID: ${menu.richMenuId})`);
      });
      console.log('');
    }
  } catch (error) {
    console.log('⚠️ 既存メニューの確認をスキップ');
  }
  
  // 既存のリッチメニューを削除（オプション）
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('既存のリッチメニューを削除しますか？ (y/n): ', async (answer) => {
    if (answer.toLowerCase() === 'y') {
      await deleteAllRichMenus();
    }
    
    // 新しいリッチメニューを作成
    await createRichMenu();
    
    readline.close();
  });
}

main();