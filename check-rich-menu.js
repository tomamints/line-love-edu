/**
 * リッチメニューの状態を確認するスクリプト
 */

require('dotenv').config();
const axios = require('axios');

const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

async function checkRichMenu() {
  try {
    // 1. 現在のリッチメニューリストを取得
    console.log('📋 リッチメニューリストを取得中...');
    const listResponse = await axios.get(
      'https://api.line.me/v2/bot/richmenu/list',
      {
        headers: {
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );
    
    const richmenus = listResponse.data.richmenus;
    console.log(`\n✅ ${richmenus.length}個のリッチメニューが見つかりました\n`);
    
    for (const menu of richmenus) {
      console.log('========================================');
      console.log(`📱 メニュー名: ${menu.name}`);
      console.log(`🆔 ID: ${menu.richMenuId}`);
      console.log(`📐 サイズ: ${menu.size.width}x${menu.size.height}`);
      console.log(`✅ 選択状態: ${menu.selected}`);
      console.log(`💬 チャットバーテキスト: ${menu.chatBarText}`);
      
      console.log('\n📍 エリア設定:');
      menu.areas.forEach((area, index) => {
        console.log(`  エリア${index + 1}:`);
        console.log(`    位置: x=${area.bounds.x}, y=${area.bounds.y}`);
        console.log(`    サイズ: ${area.bounds.width}x${area.bounds.height}`);
        console.log(`    アクション: ${area.action.type}`);
        if (area.action.type === 'message') {
          console.log(`    メッセージ: "${area.action.text}"`);
        } else if (area.action.type === 'postback') {
          console.log(`    データ: ${area.action.data}`);
          if (area.action.displayText) {
            console.log(`    表示テキスト: "${area.action.displayText}"`);
          }
        }
      });
    }
    
    // 2. デフォルトリッチメニューを確認
    console.log('\n========================================');
    console.log('🔍 デフォルトリッチメニューを確認中...');
    
    try {
      const defaultResponse = await axios.get(
        'https://api.line.me/v2/bot/user/all/richmenu',
        {
          headers: {
            'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
          }
        }
      );
      
      console.log(`✅ デフォルトリッチメニューID: ${defaultResponse.data.richMenuId}`);
      
      // どのメニューがデフォルトか表示
      const defaultMenu = richmenus.find(m => m.richMenuId === defaultResponse.data.richMenuId);
      if (defaultMenu) {
        console.log(`   → "${defaultMenu.name}" がデフォルトに設定されています`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ デフォルトリッチメニューが設定されていません');
      } else {
        console.error('エラー:', error.response?.data || error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.response?.data || error.message);
  }
}

checkRichMenu();