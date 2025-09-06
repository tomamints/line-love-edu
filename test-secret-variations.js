
const crypto = require("crypto");

// テスト: 環境変数の値が正しいか確認
const API_KEY = "a_7Nh7OQU4LD_sgIG";
const API_SECRET = "WAMx1E1jkd+cEVBFVfdMgJXhlZCSxITSn3YrqGZTz9o=";

// Vercelで読み込まれる可能性のある異なる形式をテスト
const variations = [
    API_SECRET,                                          // そのまま
    API_SECRET.replace(/=/g, ""),                       // = を削除
    API_SECRET + "=",                                   // = を追加
    API_SECRET.trim(),                                  // トリム
    Buffer.from(API_SECRET, "base64").toString("base64") // 再エンコード
];

console.log("=== API Secret Variations Test ===\n");

variations.forEach((secret, index) => {
    const testData = "test";
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(testData);
    const result = hmac.digest("base64");
    
    console.log(`Variation ${index + 1}:`);
    console.log("  Secret:", secret);
    console.log("  Length:", secret.length);
    console.log("  Result:", result);
    console.log("");
});

console.log("正しい結果は Variation 1 のはずです。");
console.log("もしVercelで異なる結果が出ている場合、");
console.log("環境変数の設定方法に問題がある可能性があります。");

