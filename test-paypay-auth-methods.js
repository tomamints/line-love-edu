
const https = require("https");
const fs = require("fs");

// 環境変数を読み込む
try {
    const envContent = fs.readFileSync(".env.local", "utf8");
    envContent.split("\n").forEach(line => {
        if (line && !line.startsWith("#")) {
            const [key, value] = line.split("=");
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        }
    });
} catch (error) {
    console.log("⚠️ .env.localファイルが見つかりません");
}

console.log("=== PayPay Direct API Test ===\n");

// テストコードと同じ形式でリクエスト
const payload = {
    merchantPaymentId: `TEST_${Date.now()}`,
    amount: {
        amount: 100,
        currency: "JPY"
    },
    codeType: "ORDER_QR",
    orderDescription: "Test Order",
    redirectUrl: "https://example.com/success",
    redirectType: "WEB_LINK",
    orderItems: [{
        name: "Test Item",
        category: "DIGITAL_CONTENT",
        quantity: 1,
        productId: "test_001",
        unitPrice: {
            amount: 100,
            currency: "JPY"
        }
    }]
};

const jsonPayload = JSON.stringify(payload);

// 異なる認証方法を試す
const authHeaders = [
    { name: "API Key only", auth: process.env.PAYPAY_API_KEY },
    { name: "Bearer token", auth: `Bearer ${process.env.PAYPAY_API_KEY}` },
    { name: "Simple number", auth: "0123456789" },
    { name: "API Key with prefix", auth: `APIKey ${process.env.PAYPAY_API_KEY}` }
];

async function testAuth(authHeader) {
    return new Promise((resolve) => {
        const options = {
            hostname: "stg-api.paypay.ne.jp",
            port: 443,
            path: "/v2/codes",
            method: "POST",
            headers: {
                "Authorization": authHeader.auth,
                "X-ASSUME-MERCHANT": process.env.PAYPAY_MERCHANT_ID,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(jsonPayload)
            }
        };
        
        console.log(`Testing: ${authHeader.name}`);
        console.log(`Authorization: ${authHeader.auth.substring(0, 30)}...`);
        
        const req = https.request(options, (res) => {
            let data = "";
            
            res.on("data", (chunk) => {
                data += chunk;
            });
            
            res.on("end", () => {
                console.log(`Status: ${res.statusCode}`);
                
                if (res.statusCode === 201) {
                    console.log("✅ SUCCESS!");
                    try {
                        const parsed = JSON.parse(data);
                        console.log("Response:", JSON.stringify(parsed, null, 2));
                    } catch (e) {
                        console.log("Response:", data);
                    }
                } else if (res.statusCode === 401) {
                    console.log("❌ Unauthorized");
                } else {
                    console.log("Response:", data.substring(0, 100));
                }
                console.log("");
                resolve();
            });
        });
        
        req.on("error", (e) => {
            console.error("Error:", e.message);
            console.log("");
            resolve();
        });
        
        req.write(jsonPayload);
        req.end();
    });
}

async function runTests() {
    for (const header of authHeaders) {
        await testAuth(header);
    }
}

runTests();

