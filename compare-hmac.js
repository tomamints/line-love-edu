
const crypto = require("crypto");

// テスト用の固定値
const API_SECRET = "WAMx1E1jkd+cEVBFVfdMgJXhlZCSxITSn3YrqGZTz9o=";
const testBody = JSON.stringify({ test: "data" });

console.log("=== Comparing HMAC Methods ===\n");

// 方法1: 文字列として扱う（動作する方法）
const hmac1 = crypto.createHmac("sha256", API_SECRET);
hmac1.update("test data");
const result1 = hmac1.digest("base64");
console.log("Method 1 (String):", result1);

// 方法2: crypto-jsスタイル（SDKが使用）
try {
    const CryptoJS = require("crypto-js");
    const hashed = CryptoJS.HmacSHA256("test data", API_SECRET);
    const result2 = CryptoJS.enc.Base64.stringify(hashed);
    console.log("Method 2 (crypto-js):", result2);
} catch (e) {
    console.log("Method 2: crypto-js not available");
}

// API Secretの形式確認
console.log("\nAPI Secret Analysis:");
console.log("- Length:", API_SECRET.length);
console.log("- Is Base64:", /^[A-Za-z0-9+/=]+$/.test(API_SECRET));
console.log("- Contains = at end:", API_SECRET.endsWith("="));

// Base64デコードして使う場合
const decodedSecret = Buffer.from(API_SECRET, "base64");
const hmac3 = crypto.createHmac("sha256", decodedSecret);
hmac3.update("test data");
const result3 = hmac3.digest("base64");
console.log("\nMethod 3 (Decoded Secret):", result3);

console.log("\nConclusion:");
console.log("SDKとスタンドアロンスクリプトで異なる可能性:");
console.log("1. crypto-js vs node:crypto の違い");
console.log("2. API Secretの処理方法の違い");
console.log("3. タイムスタンプの生成タイミングの違い");

