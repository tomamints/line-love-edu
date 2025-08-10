// OpenAI Batch APIのテストコード
// 動作確認用

const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

async function testBatchAPI() {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  console.log('🧪 OpenAI Batch API Test');
  
  try {
    // Step 1: JSONLファイルを作成
    console.log('\n1️⃣ Creating JSONL file...');
    const batchRequest = {
      custom_id: `test_${Date.now()}`,
      method: "POST",
      url: "/v1/chat/completions",
      body: {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user",
            content: "Say hello in Japanese"
          }
        ],
        max_tokens: 100
      }
    };
    
    const jsonlContent = JSON.stringify(batchRequest);
    const tempPath = `/tmp/batch_${Date.now()}.jsonl`;
    await fs.writeFile(tempPath, jsonlContent);
    console.log(`✅ JSONL file created: ${tempPath}`);
    
    // Step 2: ファイルをアップロード
    console.log('\n2️⃣ Uploading file to OpenAI...');
    const file = await openai.files.create({
      file: await fs.readFile(tempPath),
      purpose: "batch"
    });
    console.log(`✅ File uploaded: ${file.id}`);
    
    // Step 3: バッチジョブを作成
    console.log('\n3️⃣ Creating batch job...');
    const batch = await openai.batches.create({
      input_file_id: file.id,
      endpoint: "/v1/chat/completions",
      completion_window: "24h"
    });
    console.log(`✅ Batch created: ${batch.id}`);
    console.log(`   Status: ${batch.status}`);
    
    // Step 4: ステータスをポーリング
    console.log('\n4️⃣ Polling for completion...');
    let completed = false;
    let attempts = 0;
    const maxAttempts = 60; // 5分間（5秒ごと）
    
    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒待機
      
      const batchStatus = await openai.batches.retrieve(batch.id);
      console.log(`   Attempt ${++attempts}: ${batchStatus.status}`);
      
      if (batchStatus.status === 'completed') {
        completed = true;
        console.log('✅ Batch completed!');
        
        // Step 5: 結果を取得
        console.log('\n5️⃣ Retrieving results...');
        const outputFile = await openai.files.content(batchStatus.output_file_id);
        
        // outputFileはReadableStreamまたはBufferの可能性
        let content;
        if (typeof outputFile === 'string') {
          content = outputFile;
        } else if (Buffer.isBuffer(outputFile)) {
          content = outputFile.toString('utf-8');
        } else {
          // ReadableStreamの場合
          const chunks = [];
          for await (const chunk of outputFile) {
            chunks.push(chunk);
          }
          content = Buffer.concat(chunks).toString('utf-8');
        }
        
        console.log('📄 Raw output:', content);
        
        // 結果をパース
        const lines = content.split('\n').filter(line => line.trim());
        for (const line of lines) {
          const result = JSON.parse(line);
          console.log('\n📊 Result:');
          console.log(`   Custom ID: ${result.custom_id}`);
          if (result.response && result.response.body) {
            const message = result.response.body.choices[0].message.content;
            console.log(`   Response: ${message}`);
          } else if (result.error) {
            console.log(`   Error: ${result.error.message}`);
          }
        }
        
      } else if (batchStatus.status === 'failed') {
        console.log('❌ Batch failed!');
        if (batchStatus.errors) {
          console.log('   Errors:', JSON.stringify(batchStatus.errors, null, 2));
        }
        break;
        
      } else if (batchStatus.status === 'expired') {
        console.log('⏰ Batch expired!');
        break;
      }
      
      // validating, in_progress, finalizing は継続
    }
    
    if (!completed && attempts >= maxAttempts) {
      console.log('⏰ Timeout - batch still processing');
      console.log('   Batch will continue processing (up to 24h)');
      console.log(`   Check status with batch ID: ${batch.id}`);
    }
    
    // クリーンアップ
    await fs.unlink(tempPath).catch(() => {});
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

// 実行
if (require.main === module) {
  testBatchAPI().then(() => {
    console.log('\n✅ Test complete');
  }).catch(err => {
    console.error('❌ Test failed:', err);
  });
}

module.exports = { testBatchAPI };