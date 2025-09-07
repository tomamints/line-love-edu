require('dotenv').config({ path: '.env.local' });
const https = require('https');

// 最新の診断IDとmerchantPaymentIdを使用
const diagnosisId = 'diag_1757218182779_hy8o9e75h';
const merchantPaymentId = 'diag_diag_1757218182779_hy8o9e75h_1757218285305';
const userId = 'anonymous';

console.log('🔄 PayPay決済完了をシミュレート...\n');
console.log('診断ID:', diagnosisId);
console.log('Merchant Payment ID:', merchantPaymentId);
console.log('User ID:', userId);
console.log('');

// APIエンドポイントにPOSTリクエストを送信
const postData = JSON.stringify({
  merchantPaymentId,
  diagnosisId,
  userId
});

const options = {
  hostname: 'line-love-edu.vercel.app',
  path: '/api/update-paypay-payment',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📡 API Response Status:', res.statusCode);
    console.log('📦 Response Data:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (jsonData.success) {
        console.log('\n✅ 決済ステータス更新成功！');
        console.log('Purchase ID:', jsonData.purchaseId);
        
        // データベース確認スクリプトを実行
        console.log('\n🔍 データベースの状態を確認中...\n');
        require('child_process').exec('node check-all-tables.js', (error, stdout, stderr) => {
          if (error) {
            console.error('Error:', error);
            return;
          }
          console.log(stdout);
        });
      } else {
        console.log('\n⚠️ 決済ステータス更新に問題があります:', jsonData.message);
      }
    } catch (e) {
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ リクエストエラー:', error);
});

req.write(postData);
req.end();