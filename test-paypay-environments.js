
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

console.log("=== PayPay SDK Test (Production Mode) ===\n");

// Production設定で試す
PAYPAY.Configure({
    clientId: process.env.PAYPAY_API_KEY,
    clientSecret: process.env.PAYPAY_API_SECRET,
    productionMode: true // Production環境
});

console.log("Configuration:");
console.log("- Client ID:", process.env.PAYPAY_API_KEY);
console.log("- Mode: Production");
console.log("");

async function testQRCode() {
    const payload = {
        merchantPaymentId: `test_prod_${Date.now()}`,
        amount: {
            amount: 100,
            currency: "JPY"
        },
        codeType: "ORDER_QR",
        orderDescription: "Test Order Production",
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
    
    console.log("Request Payload:");
    console.log(JSON.stringify(payload, null, 2));
    console.log("\nSending request to Production...\n");
    
    try {
        const response = await PAYPAY.QRCodeCreate(payload);
        
        console.log("Response Status:", response.STATUS);
        
        if (response.STATUS === 201 && response.BODY) {
            console.log("✅ SUCCESS!");
            console.log("Response:", JSON.stringify(response.BODY, null, 2));
        } else {
            console.log("❌ Error");
            if (response.BODY) {
                console.log("Response Body:", JSON.stringify(response.BODY, null, 2));
            }
        }
    } catch (error) {
        console.error("Exception:", error);
    }
}

// 別の環境も試す
async function testAllEnvironments() {
    const environments = [
        { productionMode: false, name: "Staging (default)" },
        { productionMode: true, name: "Production" },
        { env: "PROD", name: "PROD env" },
        { env: "PERF_MODE", name: "Performance Mode" }
    ];
    
    for (const env of environments) {
        console.log(`\n=== Testing ${env.name} ===`);
        
        const config = {
            clientId: process.env.PAYPAY_API_KEY,
            clientSecret: process.env.PAYPAY_API_SECRET,
            ...env
        };
        
        PAYPAY.Configure(config);
        
        const payload = {
            merchantPaymentId: `test_${Date.now()}`,
            amount: { amount: 100, currency: "JPY" },
            codeType: "ORDER_QR",
            orderDescription: `Test ${env.name}`
        };
        
        try {
            const response = await PAYPAY.QRCodeCreate(payload);
            console.log(`Status: ${response.STATUS}`);
            
            if (response.STATUS === 201) {
                console.log("✅ SUCCESS with", env.name);
                break;
            } else if (response.BODY?.resultInfo) {
                console.log(`❌ ${response.BODY.resultInfo.code}: ${response.BODY.resultInfo.message}`);
            }
        } catch (error) {
            console.error("Error:", error.message);
        }
    }
}

testAllEnvironments();

