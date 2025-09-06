
console.log("=== Time Zone Check ===");
console.log("");

// 現在の時刻情報
const now = new Date();
console.log("System Date:", now.toString());
console.log("ISO String:", now.toISOString());
console.log("Locale String (JST):", now.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
console.log("");

// UNIXタイムスタンプ
const unixNow = Math.floor(Date.now() / 1000);
console.log("Unix Timestamp:", unixNow);
console.log("Unix Date:", new Date(unixNow * 1000).toISOString());
console.log("");

// システムのタイムゾーン
console.log("Timezone Offset (minutes):", now.getTimezoneOffset());
console.log("Timezone Offset (hours):", -now.getTimezoneOffset() / 60);
console.log("");

// PayPayが期待する時刻（UTC）
console.log("=== PayPay Expected Time ===");
console.log("PayPay uses UTC timestamps in the signature");
console.log("Current UTC:", now.toUTCString());
console.log("Current JST:", new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().replace("T", " ").split(".")[0] + " JST");
console.log("");

// 実際の2024年の時刻（システムが2025年なので調整）
const actualYear = 2024;
const yearDiff = now.getFullYear() - actualYear;
const adjustedTime = new Date(now.getTime() - yearDiff * 365 * 24 * 60 * 60 * 1000);
console.log("=== Adjusted to 2024 ===");
console.log("Adjusted Date:", adjustedTime.toString());
console.log("Adjusted Unix:", Math.floor(adjustedTime.getTime() / 1000));
console.log("");

// PayPayのタイムスタンプ許容範囲
const twoMinutes = 2 * 60; // 2分（秒）
console.log("=== PayPay Timestamp Requirements ===");
console.log("PayPay accepts timestamps within ±2 minutes of server time");
console.log("Current Unix:", unixNow);
console.log("Valid Range:", unixNow - twoMinutes, "to", unixNow + twoMinutes);
console.log("Problem: System shows 2025, PayPay server expects 2024");

