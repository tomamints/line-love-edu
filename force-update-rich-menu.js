/**
 * リッチメニューを強制的に更新するスクリプト
 * キャッシュ問題を回避するため、既存のメニューを削除して新しく作成
 */

require('dotenv').config();
const axios = require('axios');

const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

// デフォルト（無料ユーザー向け）リッチメニュー
const defaultRichMenuObject = {
  size: {
    width: 2500,
    height: 843
  },
  selected: true,
  name: `月の占いメニュー_${Date.now()}`, // タイムスタンプを追加してユニークにする
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
    // 右側: おつきさま診断（完全版）
    {
      bounds: {
        x: 1250,
        y: 0,
        width: 1250,
        height: 843
      },
      action: {
        type: 'message',
        text: 'おつきさま診断'  // ← 完全版診断用キーワード
      }
    }
  ]
};

// プレミアム（購入者向け）リッチメニュー
const premiumRichMenuObject = {
  size: {
    width: 2500,
    height: 843
  },
  selected: false,
  name: `月の占いプレミアム_${Date.now()}`,
  chatBarText: 'プレミアムメニュー',
  areas: [
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
    {
      bounds: {
        x: 1250,
        y: 0,
        width: 1250,
        height: 843
      },
      action: {
        type: 'message',
        text: '履歴' // 購入履歴表示用キーワード
      }
    }
  ]
};

async function forceUpdateRichMenu() {
  try {
    console.log('🔄 リッチメニューを強制更新します...\n');

    // 1. 既存のリッチメニューをすべて削除
    console.log('Step 1: 既存のリッチメニューを削除中...');
    const listResponse = await axios.get(
      'https://api.line.me/v2/bot/richmenu/list',
      {
        headers: {
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );

    const oldMenus = listResponse.data.richmenus;
    for (const menu of oldMenus) {
      console.log(`  削除中: ${menu.name} (${menu.richMenuId})`);
      await axios.delete(
        `https://api.line.me/v2/bot/richmenu/${menu.richMenuId}`,
        {
          headers: {
            'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
          }
        }
      );
    }
    console.log('✅ 既存メニューをすべて削除しました\n');

    // 2. 新しいリッチメニューを作成
    console.log('Step 2: 新しいリッチメニューを作成中...');
    const createResponse = await axios.post(
      'https://api.line.me/v2/bot/richmenu',
      defaultRichMenuObject,
      {
        headers: {
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const defaultMenuId = createResponse.data.richMenuId;
    console.log(`✅ デフォルトメニュー作成完了: ${defaultMenuId}\n`);

    // 3. デフォルト画像を生成してアップロード
    console.log('Step 3: 画像を生成してアップロード中...');
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

    // 右側: おつきさま診断（完全版）
    ctx.fillStyle = 'white';
    ctx.font = 'bold 120px sans-serif';
    ctx.fillText('🌙', 1875, 280);
    ctx.font = 'bold 70px sans-serif';
    ctx.fillText('おつきさま診断', 1875, 460);
    ctx.font = 'bold 60px sans-serif';
    ctx.fillText('完全版はこちら', 1875, 550);
    ctx.font = '45px sans-serif';
    ctx.fillText('本気で占いたい方向け✨', 1875, 660);

    const buffer = canvas.toBuffer('image/png');

    await axios.post(
      `https://api-data.line.me/v2/bot/richmenu/${defaultMenuId}/content`,
      buffer,
      {
        headers: {
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
          'Content-Type': 'image/png',
          'Content-Length': buffer.length
        }
      }
    );

    console.log('✅ 画像アップロード完了\n');

    // 4. デフォルトリッチメニューとして設定
    console.log('Step 4: デフォルトメニューとして設定中...');
    await axios.post(
      `https://api.line.me/v2/bot/user/all/richmenu/${defaultMenuId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`
        }
      }
    );

    console.log('✅ デフォルトメニューとして設定完了\n');

    // 5. プレミアムリッチメニューを作成
    console.log('Step 5: プレミアムリッチメニューを作成中...');
    const premiumResponse = await axios.post(
      'https://api.line.me/v2/bot/richmenu',
      premiumRichMenuObject,
      {
        headers: {
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const premiumMenuId = premiumResponse.data.richMenuId;
    console.log(`✅ プレミアムメニュー作成完了: ${premiumMenuId}\n`);

    // 画像を作成してアップロード（プレミアム用）
    const premiumCanvas = createCanvas(2500, 843);
    const premiumCtx = premiumCanvas.getContext('2d');

    const premiumGradient = premiumCtx.createLinearGradient(0, 0, 2500, 843);
    premiumGradient.addColorStop(0, '#2b5876');
    premiumGradient.addColorStop(1, '#4e4376');
    premiumCtx.fillStyle = premiumGradient;
    premiumCtx.fillRect(0, 0, 2500, 843);

    // 左側: 月タロット占い
    premiumCtx.fillStyle = 'white';
    premiumCtx.font = 'bold 120px sans-serif';
    premiumCtx.textAlign = 'center';
    premiumCtx.textBaseline = 'middle';
    premiumCtx.fillText('🔮', 625, 280);
    premiumCtx.font = 'bold 70px sans-serif';
    premiumCtx.fillText('月タロット占い', 625, 460);
    premiumCtx.font = '48px sans-serif';
    premiumCtx.fillText('今日のメッセージを確認', 625, 600);

    // 中央線
    premiumCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    premiumCtx.lineWidth = 3;
    premiumCtx.beginPath();
    premiumCtx.moveTo(1250, 50);
    premiumCtx.lineTo(1250, 793);
    premiumCtx.stroke();

    // 右側: 購入履歴
    premiumCtx.fillStyle = 'white';
    premiumCtx.font = 'bold 120px sans-serif';
    premiumCtx.fillText('🧾', 1875, 280);
    premiumCtx.font = 'bold 70px sans-serif';
    premiumCtx.fillText('購入履歴', 1875, 460);
    premiumCtx.font = '48px sans-serif';
    premiumCtx.fillText('「履歴」で最新レポート', 1875, 600);

    const premiumBuffer = premiumCanvas.toBuffer('image/png');

    await axios.post(
      `https://api-data.line.me/v2/bot/richmenu/${premiumMenuId}/content`,
      premiumBuffer,
      {
        headers: {
          'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
          'Content-Type': 'image/png',
          'Content-Length': premiumBuffer.length
        }
      }
    );

    console.log('✅ プレミアム用画像アップロード完了\n');

    // 6. 出力
    console.log('========================================');
    console.log('🎉 リッチメニューの強制更新が完了しました！');
    console.log('========================================');
    console.log(`🆔 デフォルトメニューID : ${defaultMenuId}`);
    console.log(`🆔 プレミアムメニューID : ${premiumMenuId}`);
    console.log('\n📱 デフォルトメニュー構成:');
    console.log('  左ボタン: 🔮 月タロット占い (Postback)');
    console.log('  右ボタン: 🌙 おつきさま診断 (メッセージ: "おつきさま診断")');
    console.log('\n💎 プレミアムメニュー構成:');
    console.log('  左ボタン: 🔮 月タロット占い (Postback)');
    console.log('  右ボタン: 🧾 購入履歴 (メッセージ: "履歴")');
    console.log('\n📝 次の手順:');
    console.log('  1. `.env` などに DEFAULT_RICH_MENU_ID と PREMIUM_RICH_MENU_ID を設定');
    console.log('  2. 決済完了Webhookから /api/update-user-rich-menu を呼び出す');
    console.log('  3. プレミアムユーザーには PREMIUM_RICH_MENU_ID をリンク');
    console.log('\n💡 LINEアプリでの確認方法:');
    console.log('  1. LINEアプリを完全に終了（タスクキル）');
    console.log('  2. LINEアプリを再起動');
    console.log('  3. トーク画面でメニューを確認');
    console.log('\n⚠️ 注意: キャッシュが更新されるまで数分かかる場合があります');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.error('📌 CHANNEL_ACCESS_TOKENが無効です。.envファイルを確認してください。');
    }
  }
}

forceUpdateRichMenu();
