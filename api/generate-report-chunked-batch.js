// generate-report-chunked.js の Step 3 部分
// Batch APIを使用したAI分析の実装

const OpenAI = require('openai');
const fs = require('fs').promises;

async function handleStep3WithBatch(progress, orderId, messages, fortune) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  // Batch IDが既に存在する場合は結果を確認
  if (progress.data.aiBatchId) {
    console.log('🔍 Checking batch status...');
    
    try {
      const batch = await openai.batches.retrieve(progress.data.aiBatchId);
      console.log(`📊 Batch status: ${batch.status}`);
      
      if (batch.status === 'completed') {
        console.log('✅ Batch completed! Retrieving results...');
        
        // 結果ファイルを取得
        const outputFile = await openai.files.content(batch.output_file_id);
        
        // ストリームをテキストに変換
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
        
        // 結果をパース
        const lines = content.split('\n').filter(line => line.trim());
        for (const line of lines) {
          const result = JSON.parse(line);
          if (result.custom_id === `order_${orderId}`) {
            if (result.response && result.response.body) {
              const aiContent = result.response.body.choices[0].message.content;
              progress.data.aiInsights = JSON.parse(aiContent);
              progress.currentStep++;
              console.log('✅ AI insights extracted successfully');
              return { completed: true };
            } else if (result.error) {
              console.error('❌ Batch request failed:', result.error);
              progress.data.aiInsights = null;
              progress.currentStep++;
              return { completed: true, error: result.error };
            }
          }
        }
        
      } else if (batch.status === 'failed' || batch.status === 'expired') {
        console.log(`❌ Batch ${batch.status}`);
        progress.data.aiInsights = null;
        progress.currentStep++;
        return { completed: true, error: batch.status };
        
      } else {
        // まだ処理中 (validating, in_progress, finalizing)
        const waitTime = Date.now() - new Date(progress.data.aiBatchStartTime).getTime();
        const waitMinutes = Math.floor(waitTime / 60000);
        const waitSeconds = Math.floor((waitTime % 60000) / 1000);
        
        console.log(`⏳ Batch ${batch.status} (${waitMinutes}m ${waitSeconds}s elapsed)`);
        
        // 5分以上待った場合はスキップ（本番では30分程度まで待っても良い）
        if (waitTime > 300000) { // 5分
          console.log('⏰ Timeout - skipping AI analysis');
          progress.data.aiInsights = null;
          progress.currentStep++;
          return { completed: true, timeout: true };
        }
        
        return { 
          completed: false, 
          status: batch.status,
          waitTime: waitTime 
        };
      }
      
    } catch (error) {
      console.error('❌ Error checking batch:', error);
      // バッチIDが無効な場合は新規作成
      if (error.status === 404) {
        console.log('🔄 Batch not found, creating new one...');
        delete progress.data.aiBatchId;
        return handleStep3WithBatch(progress, orderId, messages, fortune);
      }
      throw error;
    }
    
  } else {
    // 初回: バッチジョブを作成
    console.log('🚀 Creating AI batch job...');
    
    try {
      // メッセージサンプルを作成（最新15件）
      const recentMessages = messages.slice(-15);
      const conversationSample = recentMessages.map(m => 
        `${m.isUser ? 'ユーザー' : '相手'}: ${m.text}`
      ).join('\n');
      
      // プロンプトを作成
      const prompt = `以下のLINEトーク履歴を分析し、恋愛アドバイザーとして非常に詳細なレポートを作成してください。

会話サンプル：
${conversationSample}

基本分析結果：
${JSON.stringify(fortune, null, 2)}

以下のJSON形式で、非常に詳細な分析結果を返してください：
{
  "emotionalState": {
    "user": "ユーザーの感情状態の詳細分析（200文字以上）",
    "partner": "相手の感情状態の詳細分析（200文字以上）",
    "compatibility": "感情的な相性の詳細評価（200文字以上）"
  },
  "communicationStyle": {
    "userPattern": "ユーザーのコミュニケーションパターン詳細（150文字以上）",
    "partnerPattern": "相手のコミュニケーションパターン詳細（150文字以上）",
    "recommendations": ["改善提案1", "改善提案2", "改善提案3"]
  },
  "futureOutlook": [
    {
      "month": "1ヶ月後",
      "prediction": "詳細な予測内容（150文字以上）",
      "keyEvents": ["重要イベント1", "重要イベント2"]
    },
    {
      "month": "3ヶ月後",
      "prediction": "詳細な予測内容（150文字以上）",
      "keyEvents": ["重要イベント1", "重要イベント2"]
    }
  ],
  "uniqueInsights": "この二人特有の非常に詳細な洞察（300文字以上）"
}`;
      
      // バッチリクエストを作成
      const batchRequest = {
        custom_id: `order_${orderId}`,
        method: "POST",
        url: "/v1/chat/completions",
        body: {
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "あなたは経験豊富な恋愛カウンセラーで、心理学の専門知識を持ち、日本の恋愛文化に精通しています。"
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 3000,
          response_format: { type: "json_object" }
        }
      };
      
      // JSONLファイルを作成
      const jsonlContent = JSON.stringify(batchRequest);
      const tempPath = `/tmp/batch_${orderId}_${Date.now()}.jsonl`;
      await fs.writeFile(tempPath, jsonlContent);
      
      // OpenAIにアップロード
      const file = await openai.files.create({
        file: await fs.readFile(tempPath),
        purpose: "batch"
      });
      console.log(`📁 File uploaded: ${file.id}`);
      
      // バッチジョブを作成
      const batch = await openai.batches.create({
        input_file_id: file.id,
        endpoint: "/v1/chat/completions",
        completion_window: "24h"
      });
      
      console.log(`✅ Batch created: ${batch.id}`);
      console.log(`   Initial status: ${batch.status}`);
      
      // 進捗に保存
      progress.data.aiBatchId = batch.id;
      progress.data.aiBatchStartTime = new Date().toISOString();
      progress.data.aiBatchFileId = file.id;
      
      // 一時ファイルを削除
      await fs.unlink(tempPath).catch(() => {});
      
      return { 
        completed: false, 
        batchCreated: true,
        batchId: batch.id 
      };
      
    } catch (error) {
      console.error('❌ Error creating batch:', error);
      // バッチ作成に失敗した場合はAIなしで続行
      progress.data.aiInsights = null;
      progress.currentStep++;
      return { completed: true, error: error.message };
    }
  }
}

module.exports = { handleStep3WithBatch };