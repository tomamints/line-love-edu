
const https = require("https");

// 開発者パネルから取得した実際の認証ヘッダー
const AUTH_HEADER = "hmac OPA-Auth:a_7Nh7OQU4LD_sgIG:wwY0tCrxN5ZB/xAjHXN89XWDrCAp9dKw7k44Nm2CemE=:f4ecb7:1757195126:empty";
const MERCHANT_ID = "958667152543465472";
const MERCHANT_PAYMENT_ID = "DEVELOPER-PANEL-DEMO-53147913-90b1-4617-b3f3-85623b4ba330";

console.log("=== PayPay Developer Panel Auth Test ===\n");

// GETリクエストをテスト
const options = {
    hostname: "stg-api.paypay.ne.jp",
    port: 443,
    path: `/v2/payments/${MERCHANT_PAYMENT_ID}`,
    method: "GET",
    headers: {
        "Authorization": AUTH_HEADER,
        "X-ASSUME-MERCHANT": MERCHANT_ID,
        "Content-Type": "application/json"
    }
};

console.log("Request:");
console.log("- URL:", `https://${options.hostname}${options.path}`);
console.log("- Method:", options.method);
console.log("- Auth Header:", AUTH_HEADER.substring(0, 50) + "...");
console.log("");

const req = https.request(options, (res) => {
    let data = "";
    
    res.on("data", (chunk) => {
        data += chunk;
    });
    
    res.on("end", () => {
        console.log("Status:", res.statusCode);
        
        try {
            const parsed = JSON.parse(data);
            console.log("Response:", JSON.stringify(parsed, null, 2));
            
            if (res.statusCode === 200 && parsed.resultInfo?.code === "SUCCESS") {
                console.log("\n✅ SUCCESS! The authentication header works!");
                console.log("Payment Status:", parsed.data?.status);
                console.log("Amount:", parsed.data?.amount);
            }
        } catch (e) {
            console.log("Response:", data);
        }
    });
});

req.on("error", (e) => {
    console.error("Error:", e);
});

req.end();

