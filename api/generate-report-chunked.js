// api/generate-report-chunked.js
// レポート生成を分割実行（50秒タイムアウト対策）

const ordersDB = require('../core/database/orders-db');
const PaymentHandler = require('../core/premium/payment-handler');
const profileManager = require('../core/database/profiles-db');
const line = require('@line/bot-sdk');

// OpenAIモジュールのロード
const { OpenAI } = require('openai');
// fsモジュールは2つ必要
const fs = require('fs').promises;
const fsSync = require('fs');

const paymentHandler = new PaymentHandler();

// 各ステップの処理時間目安（ミリ秒）
const STEP_TIMEOUTS = {
  1: 5000,   // メッセージ取得
  2: 15000,  // 基本分析
  3: 35000,  // AI分析（最も時間がかかる - 実際は20秒程度だが余裕を持つ）
  4: 10000,  // HTML生成
  5: 5000,   // 保存と通知
};

module.exports = async (req, res) => {
  const { orderId, continueFrom } = req.body || req.query;
  
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID required' });
  }
  
  console.log('\n========== CHUNKED REPORT GENERATION ==========');
  console.log('📍 Time:', new Date().toISOString());
  console.log('📍 Order ID:', orderId);
  console.log('📍 Continue From:', continueFrom || 'start');
  console.log('📍 Request Type:', continueFrom ? 'CONTINUATION' : 'NEW REQUEST');
  
  const startTime = Date.now();
  const TIME_LIMIT = 50000; // 50秒でタイムアウト（Vercelの60秒制限に対して余裕を持つ）
  
  try {
    // 注文情報を取得
    const order = await ordersDB.getOrder(orderId);
    if (!order) {
      console.error('❌ Order not found:', orderId);
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // 既に完了している場合
    if (order.status === 'completed') {
      console.log('✅ Already completed');
      return res.json({ 
        status: 'completed',
        message: 'Report already generated',
        reportUrl: order.reportUrl
      });
    }
    
    // 進捗を取得または初期化
    let progress = await ordersDB.getReportProgress(orderId);
    if (!progress) {
      console.log('🆕 Starting new report generation');
      console.log('📊 Progress: Step 0/5 [□□□□□] 0%');
      progress = {
        currentStep: 1,
        totalSteps: 5,
        data: {},
        attempts: 0,
        startedAt: new Date().toISOString()
      };
      await ordersDB.saveReportProgress(orderId, progress);
      
      // ステータスを更新
      await ordersDB.updateOrder(orderId, {
        status: 'generating'
      });
    } else {
      const progressBar = '■'.repeat(progress.currentStep - 1) + '□'.repeat(6 - progress.currentStep);
      const percentage = Math.round((progress.currentStep - 1) / 5 * 100);
      console.log('♻️ Resuming from step', progress.currentStep);
      console.log(`📊 Progress: Step ${progress.currentStep - 1}/5 [${progressBar}] ${percentage}%`);
      progress.attempts = (progress.attempts || 0) + 1;
      
      // データが失われている場合は、Step 1-2 を再実行してデータを取得
      if (progress.currentStep >= 3 && (!progress.data || !progress.data.messages)) {
        console.log('⚠️ データが失われているため、Step 1-2を再実行');
        progress.currentStep = 1;
        progress.data = {};
      }
    }
    
    // 最大試行回数チェック
    if (progress.attempts > 10) {
      console.error('❌ Too many attempts:', progress.attempts);
      await ordersDB.updateOrder(orderId, {
        status: 'error',
        error_message: 'Too many retry attempts'
      });
      await ordersDB.clearReportProgress(orderId);
      return res.status(500).json({ error: 'Too many retry attempts' });
    }
    
    // LINEクライアントを初期化
    const lineClient = new line.Client({
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
      channelSecret: process.env.CHANNEL_SECRET
    });
    
    // 各ステップを実行
    let completed = false;
    let lastCompletedStep = progress.currentStep - 1;
    let shouldContinue = false; // 継続が必要かどうか
    
    // Step 3でAI分析が進行中の場合のチェック
    if (progress.currentStep === 3 && progress.data?.aiAnalysisInProgress) {
      console.log('🔍 Checking AI analysis status...');
      
      // AI分析が完了しているか確認
      if (progress.data.aiInsights !== undefined) {
        console.log('✅ AI analysis completed, moving to next step');
        progress.data.aiAnalysisInProgress = false;
        progress.currentStep++;
        await ordersDB.saveReportProgress(orderId, progress);
      } else {
        // まだ完了していない場合は待機
        const waitTime = Date.now() - new Date(progress.data.aiAnalysisStartTime).getTime();
        const waitMinutes = Math.floor(waitTime / 60000);
        const waitSeconds = Math.floor((waitTime % 60000) / 1000);
        console.log(`⏳ AI analysis still in progress (${waitMinutes}m ${waitSeconds}s elapsed)`);
        console.log(`🔄 Status: WAITING for AI completion (max 5 minutes)`);
        
        // 5分（300秒）以上待っても完了しない場合はnullで続行
        if (waitTime > 300000) { // 300秒 = 5分
          console.log('⚠️ AI analysis timeout after 5 minutes, continuing without insights');
          console.log('📊 Status: TIMEOUT - Moving to next step');
          progress.data.aiInsights = null;
          progress.data.aiAnalysisInProgress = false;
          progress.currentStep++;
          await ordersDB.saveReportProgress(orderId, progress);
        } else {
          // まだ待つ - 次の処理を自動トリガー
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://line-love-edu.vercel.app';
          
          // 待機時間に応じてリトライ間隔を調整
          let retryDelay = 5000; // デフォルト 5秒
          if (waitTime > 60000) {
            retryDelay = 10000; // 1分経過後は10秒ごと
          }
          if (waitTime > 180000) {
            retryDelay = 15000; // 3分経過後は15秒ごと
          }
          
          console.log(`🔄 Will check again in ${retryDelay/1000} seconds`);
          
          // 次のチェックをスケジュール
          setTimeout(() => {
            fetch(`${baseUrl}/api/generate-report-chunked`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: orderId })
            }).then(() => {
              console.log(`✅ Retry triggered after ${retryDelay/1000}s`);
            }).catch(err => {
              console.error('⚠️ Retry trigger failed:', err);
            });
          }, retryDelay);
          
          return res.json({
            status: 'continuing',
            message: `AI analysis in progress (${waitMinutes}m ${waitSeconds}s), checking every ${retryDelay/1000}s`,
            nextStep: progress.currentStep,
            totalSteps: progress.totalSteps,
            elapsed: Date.now() - startTime,
            aiAnalysisInProgress: true,
            aiWaitTime: waitTime,
            retryDelay: retryDelay
          });
        }
      }
    }
    
    // タイムアウトまで可能な限りステップを実行
    while (progress.currentStep <= progress.totalSteps) {
      const elapsed = Date.now() - startTime;
      const stepTimeout = STEP_TIMEOUTS[progress.currentStep] || 10000;
      
      // 時間チェック（全ステップ共通）
      if (elapsed + stepTimeout > TIME_LIMIT) {
        console.log('⏸️ Pausing before step', progress.currentStep);
        console.log('⏱️ Elapsed:', elapsed, 'ms');
        console.log('⏱️ Next step needs:', stepTimeout, 'ms');
        console.log('⏰ Will continue in next invocation to avoid timeout');
        break;
      }
      
      const stepNames = {
        1: 'Loading Data',
        2: 'Basic Analysis', 
        3: 'AI Analysis',
        4: 'PDF Generation',
        5: 'Save & Notify'
      };
      console.log(`\n📍 Step ${progress.currentStep}/${progress.totalSteps}: ${stepNames[progress.currentStep]}`);
      console.log(`⏱️ Step started at: ${new Date().toISOString()}`);
      const stepStart = Date.now();
      
      try {
        switch (progress.currentStep) {
          case 1:
            console.log('📊 Step 1: Loading messages and user profile...');
            
            // ユーザープロフィールを取得
            if (!progress.data.userProfile) {
              try {
                progress.data.userProfile = await lineClient.getProfile(order.userId);
                console.log('👤 User:', progress.data.userProfile.displayName);
              } catch (err) {
                console.log('⚠️ Using default profile');
                progress.data.userProfile = { displayName: 'ユーザー' };
              }
            }
            
            // メッセージを取得
            if (!progress.data.messages) {
              const messagesDB = require('../core/database/messages-db');
              const savedMessages = await messagesDB.getMessages(order.userId);
              
              if (savedMessages && savedMessages.length > 0) {
                console.log(`📊 Using ${savedMessages.length} saved messages from database`);
                progress.data.messages = savedMessages;
              } else {
                console.log('⚠️ No saved messages found, using default for demo');
                progress.data.messages = generateDefaultMessages();
              }
              console.log('💬 Messages prepared:', progress.data.messages.length);
            }
            break;
            
          case 2:
            console.log('🔍 Step 2: Basic analysis...');
            // 基本分析は高速なのでここで実行
            const FortuneEngine = require('../core/fortune-engine/index');
            const engine = new FortuneEngine();
            progress.data.fortune = await engine.generateFortune(
              progress.data.messages,
              order.userId,
              progress.data.userProfile.displayName
            );
            console.log('✅ Basic analysis complete');
            break;
            
          case 3: {
            console.log('🤖 Step 3: AI insights (using Batch API)...');
            console.log('⏱️ Current elapsed time:', Date.now() - startTime, 'ms');
            console.log('📦 Module check - fs:', typeof fs, 'fsSync:', typeof fsSync);
            
            // Batch APIを使用したAI分析
            console.log('🔧 Initializing OpenAI client...');
            
            // OpenAIクライアントの初期化（エラーハンドリング付き）
            let openai;
            try {
              if (!process.env.OPENAI_API_KEY) {
                console.log('⚠️ OPENAI_API_KEY not set, skipping AI analysis');
                progress.data.aiInsights = null;
                progress.currentStep++;
                break;
              }
              
              openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
              });
              console.log('✅ OpenAI client initialized');
            } catch (initError) {
              console.error('❌ OpenAI initialization error:', initError.message);
              console.error('   - Error stack:', initError.stack);
              progress.data.aiInsights = null;
              progress.currentStep++;
              break;
            }
            
            // バッチIDが既に存在する場合は結果を確認
            if (progress.data.aiBatchId) {
              console.log('🔍 Checking batch status...');
              console.log('📦 Batch ID:', progress.data.aiBatchId);
              
              try {
                const batch = await openai.batches.retrieve(progress.data.aiBatchId);
                console.log(`📊 Batch status: ${batch.status}`);
                
                if (batch.status === 'completed') {
                  console.log('✅ Batch completed! Retrieving results...');
                  
                  // 結果ファイルを取得
                  const outputFile = await openai.files.content(batch.output_file_id);
                  console.log('📦 Output file type:', typeof outputFile);
                  console.log('📦 Output file constructor:', outputFile?.constructor?.name);
                  
                  // ストリームをテキストに変換
                  let content;
                  try {
                    // Response オブジェクトの場合
                    if (outputFile && typeof outputFile.text === 'function') {
                      console.log('📄 Using .text() method to read content');
                      content = await outputFile.text();
                    } else if (typeof outputFile === 'string') {
                      console.log('📄 Output is already a string');
                      content = outputFile;
                    } else if (Buffer.isBuffer(outputFile)) {
                      console.log('📄 Output is a Buffer');
                      content = outputFile.toString('utf-8');
                    } else {
                      console.log('❌ Unknown output type, trying JSON stringify');
                      console.log('📄 Output sample:', JSON.stringify(outputFile).substring(0, 200));
                      throw new Error(`Unknown output type: ${typeof outputFile}`);
                    }
                  } catch (readError) {
                    console.error('❌ Error reading output file:', readError.message);
                    throw readError;
                  }
                  
                  // 結果をパース
                  console.log('📄 Content length:', content.length);
                  console.log('📄 First 500 chars:', content.substring(0, 500));
                  
                  const lines = content.split('\n').filter(line => line.trim());
                  console.log(`📄 Found ${lines.length} lines in output`);
                  
                  for (const line of lines) {
                    try {
                      const result = JSON.parse(line);
                      console.log('📄 Parsed result custom_id:', result.custom_id);
                      
                      if (result.custom_id === `order_${orderId}`) {
                        if (result.response && result.response.body) {
                          console.log('📄 Found matching result with response');
                          const aiContent = result.response.body.choices[0].message.content;
                          console.log('📄 AI content type:', typeof aiContent);
                          console.log('📄 AI content preview:', aiContent.substring(0, 200));
                          progress.data.aiInsights = JSON.parse(aiContent);
                          console.log('✅ AI insights extracted successfully');
                        } else if (result.error) {
                          console.error('❌ Batch request failed:', result.error);
                          console.error('📄 Error details:', JSON.stringify(result.error));
                          progress.data.aiInsights = null;
                        }
                      }
                    } catch (parseError) {
                      console.error('❌ Error parsing line:', parseError.message);
                      console.error('📄 Problematic line:', line.substring(0, 200));
                    }
                  }
                  
                  // Step 4へ進む
                  progress.currentStep++;
                  console.log('🔄 Breaking from Step 3 to proceed to Step 4');
                  break; // switch文を抜ける（重要：これがないとStep 4がスキップされる）
                  
                } else if (batch.status === 'failed' || batch.status === 'expired') {
                  console.log(`❌ Batch ${batch.status}`);
                  progress.data.aiInsights = null;
                  progress.currentStep++;
                  console.log('🔄 Breaking from Step 3 (batch failed/expired)');
                  break; // switch文を抜ける
                  
                } else {
                  // まだ処理中 (validating, in_progress, finalizing)
                  const waitTime = Date.now() - new Date(progress.data.aiBatchStartTime).getTime();
                  const waitMinutes = Math.floor(waitTime / 60000);
                  const waitSeconds = Math.floor((waitTime % 60000) / 1000);
                  
                  console.log(`⏳ Batch ${batch.status} (${waitMinutes}m ${waitSeconds}s elapsed)`);
                  
                  // 20分（1200秒）まで待つ
                  if (waitTime > 1200000) { // 20分
                    console.log('⏰ Timeout after 20 minutes - skipping AI analysis');
                    progress.data.aiInsights = null;
                    progress.currentStep++;
                    console.log('🔄 Breaking from Step 3 (timeout)');
                    break; // switch文を抜ける
                  } else {
                    // まだBatch処理中なので、Step 3のまま継続
                    await ordersDB.saveReportProgress(orderId, progress);
                    shouldContinue = true; // 続行フラグをセット
                    // Step 3のままでwhileループを抜ける（currentStepは増やさない）
                    // 次回もStep 3から始まってBatch状態を再確認する
                    return res.json({
                      status: 'waiting_batch',
                      message: `AI batch ${batch.status} (${waitMinutes}m ${waitSeconds}s)`,
                      nextStep: progress.currentStep,
                      totalSteps: progress.totalSteps,
                      batchId: progress.data.aiBatchId,
                      elapsed: Date.now() - startTime
                    });
                  }
                }
                
              } catch (error) {
                console.error('❌ Error checking batch:', error.message);
                // エラーの場合はAIなしで続行
                progress.data.aiInsights = null;
                progress.currentStep++;
                console.log('🔄 Breaking from Step 3 (error)');
                break; // switch文を抜ける
              }
              
            } else {
              // 初回: バッチジョブを作成
              console.log('🚀 Creating AI batch job...');
              
              try {
                const ReportGenerator = require('../core/premium/report-generator');
                const reportGenerator = new ReportGenerator();
                
                // メッセージサンプルを作成（最新15件）
                const recentMessages = progress.data.messages.slice(-15);
                const conversationSample = recentMessages.map(m => 
                  `${m.isUser ? 'ユーザー' : '相手'}: ${m.text}`
                ).join('\n');
                
                // プロンプトを作成（report-generatorから流用）
                const prompt = reportGenerator.createAIPrompt(conversationSample, progress.data.fortune);
                
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
                        content: "あなたは経験豊富な恋愛カウンセラーで、心理学の専門知識を持ち、日本の恋愛文化に精通しています。非常に詳細で具体的なアドバイスを提供してください。"
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
                
                // OpenAIにアップロード（fsStreamを使用）
                const file = await openai.files.create({
                  file: fsSync.createReadStream(tempPath),
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
                
                // 一時ファイルを削除
                await fs.unlink(tempPath).catch(() => {});
                
                // 継続を返す
                await ordersDB.saveReportProgress(orderId, progress);
                return res.json({
                  status: 'continuing',
                  message: 'AI batch job created',
                  nextStep: progress.currentStep,
                  totalSteps: progress.totalSteps,
                  batchId: batch.id,
                  elapsed: Date.now() - startTime
                });
                
              } catch (error) {
                console.error('❌ Error creating batch:', error.message);
                // バッチ作成に失敗した場合はAIなしで続行
                progress.data.aiInsights = null;
                // Step 4に進まず、ループを続行してStep 4を実行
              }
            }
          }
            break;
            
          case 4:
            console.log('📝 Step 4: Generating report...');
            
            // AI分析結果がまだない場合はStep 3に戻る
            if (progress.data.aiBatchId && progress.data.aiInsights === undefined) {
              console.log('⚠️ AI insights not ready yet, going back to Step 3');
              progress.currentStep = 3;
              await ordersDB.saveReportProgress(orderId, progress);
              // 8秒後に再実行
              setTimeout(() => {
                fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://line-love-edu.vercel.app'}/api/generate-report-chunked`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ orderId: orderId })
                }).catch(err => console.error('⚠️ Retry failed:', err));
              }, 8000);
              return res.json({
                status: 'continuing',
                message: 'AI not ready, going back to Step 3',
                nextStep: 3,
                totalSteps: progress.totalSteps
              });
            }
            
            // レポート生成
            const ReportGenerator = require('../core/premium/report-generator');
            const fullReportGenerator = new ReportGenerator();
            progress.data.reportData = await fullReportGenerator.generatePremiumReport(
              progress.data.messages,
              order.userId,
              progress.data.userProfile.displayName
            );
            
            // HTML/PDF生成
            const PDFGenerator = require('../core/premium/pdf-generator');
            const pdfGenerator = new PDFGenerator();
            const generatedPdfBuffer = await pdfGenerator.generatePDF(progress.data.reportData);
            // BufferをBase64として保存（JSONシリアライズ可能）
            progress.data.pdfBuffer = generatedPdfBuffer.toString('base64');
            console.log('✅ Report generated, PDF size:', Math.round(generatedPdfBuffer.length / 1024), 'KB');
            break;
            
          case 5:
            console.log('💾 Step 5: Saving and notifying...');
            
            // PDFを保存
            const path = require('path');
            const ordersDir = process.env.VERCEL ? '/tmp/orders' : path.join(process.cwd(), 'orders');
            
            await fs.mkdir(ordersDir, { recursive: true });
            const pdfPath = path.join(ordersDir, `${orderId}.pdf`);
            
            // pdfBufferがBufferオブジェクトか確認し、必要に応じて変換
            let pdfBuffer = progress.data.pdfBuffer;
            if (pdfBuffer && typeof pdfBuffer === 'object' && pdfBuffer.type === 'Buffer' && pdfBuffer.data) {
              // JSONから復元されたBufferオブジェクトの場合
              pdfBuffer = Buffer.from(pdfBuffer.data);
            } else if (typeof pdfBuffer === 'string') {
              // Base64文字列の場合
              pdfBuffer = Buffer.from(pdfBuffer, 'base64');
            }
            
            await fs.writeFile(pdfPath, pdfBuffer);
            
            // Base64エンコード
            const pdfBase64 = pdfBuffer.toString('base64');
            
            // URL生成
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://line-love-edu.vercel.app';
            const reportUrl = `${baseUrl}/api/view-report?orderId=${orderId}`;
            
            // 注文を完了状態に更新
            await ordersDB.updateOrder(orderId, {
              status: 'completed',
              reportUrl: reportUrl,
              pdf_data: pdfBase64
            });
            
            // pushMessageは使用しない（ユーザーは「レポート」で確認）
            console.log('✅ Report completed - user can check with "レポート" command');
            
            // 進捗をクリア
            await ordersDB.clearReportProgress(orderId);
            completed = true;
            console.log('✅ All steps completed!');
            break;
        }
        
        const stepTime = Date.now() - stepStart;
        const progressBar = '■'.repeat(progress.currentStep) + '□'.repeat(5 - progress.currentStep);
        const percentage = Math.round(progress.currentStep / 5 * 100);
        console.log(`✅ Step ${progress.currentStep} completed in ${stepTime}ms`);
        console.log(`📊 Progress: Step ${progress.currentStep}/5 [${progressBar}] ${percentage}%`);
        
        lastCompletedStep = progress.currentStep;
        progress.currentStep++;
        
        // 進捗を保存
        await ordersDB.saveReportProgress(orderId, progress);
        
      } catch (stepError) {
        console.error(`❌ Error in step ${progress.currentStep}:`, stepError.message);
        
        // エラーの場合もリトライする
        progress.lastError = stepError.message;
        progress.errorCount = (progress.errorCount || 0) + 1;
        
        // 3回までリトライ
        if (progress.errorCount < 3) {
          console.log(`🔄 Will retry step ${progress.currentStep} (attempt ${progress.errorCount}/3)`);
          await ordersDB.saveReportProgress(orderId, progress);
          
          // 10秒後にリトライ（無限ループ検出を回避）
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://line-love-edu.vercel.app';
          setTimeout(() => {
            fetch(`${baseUrl}/api/generate-report-chunked`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: orderId })
            }).catch(err => console.error('⚠️ Retry failed:', err));
          }, 10000); // 10秒後
          
          return res.json({
            status: 'continuing',
            message: `Error in step ${progress.currentStep}, will retry`,
            error: stepError.message,
            retryCount: progress.errorCount
          });
        }
        
        // 3回失敗したら次のステップに進む
        console.log(`⚠️ Step ${progress.currentStep} failed 3 times, moving to next step`);
        progress.currentStep++;
        progress.errorCount = 0; // リセット
        await ordersDB.saveReportProgress(orderId, progress);
      }
    }
    
    // 完了チェック
    if (completed) {
      const finalProgressBar = '■■■■■';
      console.log('🎉 Report generation completed successfully!');
      console.log(`📊 Progress: Step 5/5 [${finalProgressBar}] 100%`);
      console.log('🎆 Status: COMPLETED - Report ready!');
      return res.json({
        status: 'completed',
        message: 'Report generated successfully',
        reportUrl: progress.data.reportUrl,
        totalTime: Date.now() - startTime,
        steps: lastCompletedStep
      });
    }
    
    // まだステップが残っている場合
    if (progress.currentStep <= progress.totalSteps) {
      console.log('🔄 Need to continue from step', progress.currentStep);
      console.log('⏱️ Total elapsed:', Date.now() - startTime, 'ms');
      shouldContinue = true;
      
      // 8秒後に次の処理をトリガー（無限ループ検出を回避）
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://line-love-edu.vercel.app';
      setTimeout(() => {
        fetch(`${baseUrl}/api/generate-report-chunked`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orderId })
        }).then(() => {
          console.log('✅ Next process triggered after 8 seconds');
        }).catch(err => {
          console.error('⚠️ Failed to trigger next process:', err.message);
        });
      }, 8000); // 8秒後
      
      return res.json({
        status: 'continuing',
        message: `Completed steps 1-${lastCompletedStep}, continuing from step ${progress.currentStep}`,
        nextStep: progress.currentStep,
        totalSteps: progress.totalSteps,
        elapsed: Date.now() - startTime,
        autoTriggered: true
      });
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error('❌ Stack:', error.stack);
    
    // エラーステータスに更新
    await ordersDB.updateOrder(orderId, {
      status: 'error',
      error_message: error.message
    });
    
    return res.status(500).json({
      error: 'Report generation failed',
      message: error.message
    });
  }
};

// デフォルトメッセージ生成
function generateDefaultMessages() {
  const messages = [];
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    messages.push({
      text: 'こんにちは！今日も元気です',
      timestamp: new Date(date.getTime() + Math.random() * 8 * 60 * 60 * 1000).toISOString(),
      isUser: true
    });
    messages.push({
      text: 'こちらこそ！良い一日を',
      timestamp: new Date(date.getTime() + Math.random() * 8 * 60 * 60 * 1000 + 1000).toISOString(),
      isUser: false
    });
  }
  
  return messages;
}