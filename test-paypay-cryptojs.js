/**
 * PayPay公式SDKと同じ実装でテスト
 */

const { HmacSHA256, enc, algo } = require("crypto-js");
const crypto = require("crypto");
const uuidv4 = () => crypto.randomUUID();
const https = require("https");

// PayPay認証情報
const auth = {
    clientId: "a_7Nh7OQU4LD_sgIG",
    clientSecret: "WAMx1E1jkd+cEVBFVfdMgJXhlZCSxITSn3YrqGZTz9o=",
    merchantId: "958667152543465472"
};

// 公式SDKと同じ認証ヘッダー生成
function createAuthHeader(method, resourceUrl, body) {
    const epoch = Math.floor(Date.now() / 1000);
    const nonce = uuidv4();

    const jsonified = JSON.stringify(body);
    const isempty = [undefined, null, "", "undefined", "null"];

    let contentType;
    let payloadDigest;
    if (isempty.includes(jsonified)) {
        contentType = "empty";
        payloadDigest = "empty";
    } else {
        contentType = "application/json";
        payloadDigest = algo.MD5.create()
            .update(contentType)
            .update(jsonified)
            .finalize()
            .toString(enc.Base64);
    }
    
    const signatureRawList = [resourceUrl, method, nonce, epoch, contentType, payloadDigest];
    const signatureRawData = signatureRawList.join("\n");
    const hashed = HmacSHA256(signatureRawData, auth.clientSecret);
    const hashed64 = enc.Base64.stringify(hashed);
    const headList = [auth.clientId, hashed64, nonce, epoch, payloadDigest];
    const header = headList.join(":");
    
    console.log("Epoch:", epoch);
    console.log("Nonce:", nonce);
    console.log("PayloadDigest:", payloadDigest);
    console.log("Signature:", hashed64);
    
    return `hmac OPA-Auth:${header}`;
}

// PayPay API呼び出し
async function createPayment() {
    const payload = {
        merchantPaymentId: `test_${Date.now()}`,
        amount: {
            amount: 100,
            currency: "JPY"
        },
        codeType: "ORDER_QR",
        orderDescription: "テスト注文",
        redirectUrl: "https://example.com/success",
        redirectType: "WEB_LINK",
        orderItems: [{
            name: "テスト商品",
            category: "DIGITAL_CONTENT",
            quantity: 1,
            productId: "test_product",
            unitPrice: {
                amount: 100,
                currency: "JPY"
            }
        }]
    };
    
    const path = "/v2/codes";
    const authHeader = createAuthHeader("POST", path, payload);
    
    console.log("\n=== PayPay API Request ===");
    console.log("URL: https://stg-api.paypay.ne.jp" + path);
    console.log("Auth Header:", authHeader.substring(0, 100) + "...");
    
    return new Promise((resolve, reject) => {
        const bodyStr = JSON.stringify(payload);
        
        const options = {
            hostname: "stg-api.paypay.ne.jp",
            port: 443,
            path: path,
            method: "POST",
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(bodyStr),
                "X-ASSUME-MERCHANT": auth.merchantId
            }
        };
        
        const req = https.request(options, (res) => {
            let data = "";
            
            res.on("data", (chunk) => {
                data += chunk;
            });
            
            res.on("end", () => {
                console.log("\n=== Response ===");
                console.log("Status:", res.statusCode);
                
                try {
                    const parsed = JSON.parse(data);
                    console.log("Body:", JSON.stringify(parsed, null, 2));
                    
                    if (res.statusCode === 201 && parsed.data) {
                        console.log("\n✅ SUCCESS!");
                        console.log("QR Code URL:", parsed.data.url);
                    } else {
                        console.log("\n❌ FAILED");
                    }
                    resolve(parsed);
                } catch (e) {
                    console.log("Response:", data);
                    reject(e);
                }
            });
        });
        
        req.on("error", (e) => {
            console.error("Request error:", e);
            reject(e);
        });
        
        req.write(bodyStr);
        req.end();
    });
}

// 実行
console.log("PayPay公式SDKと同じ実装でテスト\n");
createPayment().catch(console.error);