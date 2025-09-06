
const crypto = require("crypto");
const https = require("https");
const { v4: uuidv4 } = require("uuid");

const API_KEY = "a_7Nh7OQU4LD_sgIG";
const API_SECRET = "WAMx1E1jkd+cEVBFVfdMgJXhlZCSxITSn3YrqGZTz9o=";
const MERCHANT_ID = "958667152543465472";

console.log("=== PayPay with Corrected Timestamp ===\n");

// 2025年から2024年に調整（約365日分を引く）
const currentUnix = Math.floor(Date.now() / 1000);
const YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
const correctedUnix = currentUnix - YEAR_IN_SECONDS;

console.log("System Time (2025):", new Date().toISOString());
console.log("System Unix:", currentUnix);
console.log("Corrected Time (2024):", new Date(correctedUnix * 1000).toISOString());
console.log("Corrected Unix:", correctedUnix);
console.log("");

function createAuthHeader(method, path, body) {
    const epoch = correctedUnix; // 2024年に調整したタイムスタンプを使用
    const nonce = uuidv4().substring(0, 8);
    
    let contentType = "empty";
    let payloadDigest = "empty";
    
    if (body) {
        contentType = "application/json";
        const bodyStr = JSON.stringify(body);
        
        const md5 = crypto.createHash("md5");
        md5.update(contentType);
        md5.update(bodyStr);
        payloadDigest = md5.digest("base64");
    }
    
    const signatureData = [
        path,
        method,
        nonce,
        epoch,
        contentType,
        payloadDigest
    ].join("\n");
    
    const hmac = crypto.createHmac("sha256", API_SECRET);
    hmac.update(signatureData);
    const signature = hmac.digest("base64");
    
    console.log("Auth Details:");
    console.log("- Epoch used:", epoch, "(", new Date(epoch * 1000).toISOString(), ")");
    console.log("- Nonce:", nonce);
    console.log("");
    
    return `hmac OPA-Auth:${API_KEY}:${signature}:${nonce}:${epoch}:${payloadDigest}`;
}

// QRコード作成
async function testWithCorrectedTime() {
    const payload = {
        merchantPaymentId: `corrected_${Date.now()}`,
        amount: {
            amount: 100,
            currency: "JPY"
        },
        codeType: "ORDER_QR",
        orderDescription: "Test with 2024 timestamp"
    };
    
    const bodyStr = JSON.stringify(payload);
    const authHeader = createAuthHeader("POST", "/v2/codes", payload);
    
    const options = {
        hostname: "stg-api.paypay.ne.jp",
        port: 443,
        path: "/v2/codes",
        method: "POST",
        headers: {
            "Authorization": authHeader,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(bodyStr),
            "X-ASSUME-MERCHANT": MERCHANT_ID
        }
    };
    
    return new Promise((resolve) => {
        const req = https.request(options, (res) => {
            let data = "";
            
            res.on("data", (chunk) => {
                data += chunk;
            });
            
            res.on("end", () => {
                console.log("Status:", res.statusCode);
                
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode === 201) {
                        console.log("✅ SUCCESS with 2024 timestamp!");
                        console.log("Payment URL:", parsed.data?.url);
                    } else {
                        console.log("❌ Failed with corrected timestamp");
                        console.log("Error:", parsed.resultInfo?.message);
                        console.log("\nThis suggests PayPay is validating against actual current time,");
                        console.log("not just checking timestamp format.");
                    }
                } catch (e) {
                    console.log("Response:", data);
                }
                resolve();
            });
        });
        
        req.on("error", (e) => {
            console.error("Error:", e);
            resolve();
        });
        
        req.write(bodyStr);
        req.end();
    });
}

testWithCorrectedTime();

