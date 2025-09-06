
const PAYPAY = require("@paypayopa/paypayopa-sdk-node");
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

console.log("=== PayPay SDK Test (Correct Configuration) ===\n");

// 正しい設定方法（公式ドキュメントに基づく）
PAYPAY.Configure({
    clientId: process.env.PAYPAY_API_KEY,
    clientSecret: process.env.PAYPAY_API_SECRET,
    env: "STAGING" // STAGINGまたはPROD
});

console.log("Configuration:");
console.log("- Client ID:", process.env.PAYPAY_API_KEY);
console.log("- Environment: STAGING");
console.log("");

async function testQRCode() {
    const payload = {
        merchantPaymentId: `test_${Date.now()}`,
        amount: {
            amount: 100,
            currency: "JPY"
        },
        codeType: "ORDER_QR",
        orderDescription: "Test Order",
        redirectUrl: "https://example.com/success",
        redirectType: "WEB_LINK"
    };
    
    console.log("Request Payload:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("\nSending request...\n");
    
    try {
        const response = await PAYPAY.QRCodeCreate(payload);
        
        console.log("Response Status:", response.STATUS);
        
        if (response.STATUS === 201 && response.BODY) {
            console.log("✅ SUCCESS!");
            console.log("Response:", JSON.stringify(response.BODY, null, 2));
            if (response.BODY.data) {
                console.log("\nPayment URL:", response.BODY.data.url);
                console.log("QR Code ID:", response.BODY.data.codeId);
            }
        } else {
            console.log("❌ Error");
            if (response.BODY) {
                console.log("Response:", JSON.stringify(response.BODY, null, 2));
            }
            if (response.ERROR) {
                console.log("Error:", response.ERROR);
            }
        }
    } catch (error) {
        console.error("Exception:", error);
    }
}

testQRCode();

