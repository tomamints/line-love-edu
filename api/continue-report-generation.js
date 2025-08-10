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
  const { orderId, continueFrom, method, batchId } = req.body || req.query;
  
  if (!orderId) {
    return res.status(400).json({ error: 'Order ID required' });
  }
  
  // GitHub Actionsからの呼び出しを検出
  const isFromGitHubActions = req.headers['x-github-actions'] === 'true' || continueFrom === 'github-actions';
  
  console.log('\n========== CONTINUE REPORT GENERATION ==========');
  console.log('🔄 This is continue-report-generation (NOT generate-report-chunked)');
  console.log('🎯 Purpose: Avoid infinite loop detection');
  console.log('📍 Time:', new Date().toISOString());
  console.log('📍 Order ID:', orderId);
  console.log('📍 Continue From:', continueFrom || 'start');
  console.log('📍 Request Type:', continueFrom ? 'CONTINUATION' : 'NEW REQUEST');
  
  if (isFromGitHubActions) {
    console.log('🤖 Called from GitHub Actions!');
    console.log('🔄 Request chain reset - no infinite loop detection');
    if (batchId) {
      console.log('📦 Batch ID provided:', batchId);
    }
  }
  if (method) {
    console.log('🎯 Method triggered:', method);
    console.log('🕒 Method call timestamp:', Date.now());
    console.log('📊 This call is from Step 3 multiple methods attempt');
  }
  
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
      console.log('✅ Already completed - stopping all processing');
      console.log('📍 Report URL:', order.reportUrl);
      console.log('🛑 This should stop process-report-loop from continuing');
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
      
      // Step 5が完了済み、または currentStep > 5 の場合は完了とみなす
      if (progress.currentStep > 5 || (progress.completedSteps && progress.completedSteps.includes(5))) {
        console.log('⚠️ Report already completed (Step 5 done or currentStep > 5)');
        console.log('🛑 Stopping to prevent re-processing');
        console.log('   Current step:', progress.currentStep);
        console.log('   Completed steps:', progress.completedSteps);
        return res.json({ 
          status: 'completed',
          message: 'Report already generated',
          reportUrl: order.reportUrl || progress.data?.reportUrl
        });
      }
      
      // GitHub ActionsからBatch IDが渡された場合
      if (isFromGitHubActions && batchId && progress.currentStep >= 3) {
        console.log('💉 Injecting Batch ID from GitHub Actions:', batchId);
        if (!progress.data) progress.data = {};
        progress.data.aiBatchId = batchId;
      }
      
      // messagesが欠けている場合のみ再取得（他のデータはDBから復元済み）
      if (progress.currentStep >= 3 && progress.data && !progress.data.messages) {
        if (progress.data.messageCount > 0) {
          console.log('📝 DBから復元されたが、messagesだけ再取得が必要');
          // messagesだけ取得するためStep 1を実行（他のデータは保持）
          const savedData = { ...progress.data };
          progress.currentStep = 1;
          progress.data = savedData;  // 既存データを保持
        } else if (!progress.data.userProfile) {
          // userProfileもない場合は完全に再実行
          console.log('⚠️ データが失われているため、Step 1-2を再実行');
          progress.currentStep = 1;
          progress.data = {};
        }
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
    while (progress.currentStep <= progress.totalSteps && !completed) {
      const elapsed = Date.now() - startTime;
      const stepTimeout = STEP_TIMEOUTS[progress.currentStep] || 10000;
      
      // 時間チェック（Step 3以下のみ。Step 4以降は一気に進める）
      if (progress.currentStep <= 3 && elapsed + stepTimeout > TIME_LIMIT) {
        console.log('⏸️ Pausing before step', progress.currentStep);
        console.log('⏱️ Elapsed:', elapsed, 'ms');
        console.log('⏱️ Next step needs:', stepTimeout, 'ms');
        console.log('⏰ Will continue in next invocation to avoid timeout');
        break;
      }
      
      // Step 4以降は時間制限なしで最後まで進める
      if (progress.currentStep >= 4) {
        console.log('🚀 Step 4+: Running to completion without timeout check');
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
                  
                  // Step 3完了後の処理
                  console.log('🔄 Step 3 completed with AI insights');
                  
                  // 時間チェック（GitHub Actionsから呼ばれた場合は特に重要）
                  const step3EndTime = Date.now() - startTime;
                  console.log(`⏱️ Step 3 completed at ${step3EndTime}ms`);
                  
                  // 30秒以上経過していたら、Step 4は次回に回す
                  if (step3EndTime > 30000 || isFromGitHubActions) {
                    console.log('⏰ Time limit consideration - deferring Step 4 to next iteration');
                    progress.currentStep = 4;
                    await ordersDB.saveReportProgress(orderId, progress);
                    
                    // GitHub Actionsから呼ばれた場合は再トリガー
                    if (isFromGitHubActions) {
                      console.log('🔄 Re-triggering GitHub Actions for Step 4...');
                      try {
                        const githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
                        if (githubToken) {
                          await fetch('https://api.github.com/repos/tomamints/line-love-edu/dispatches', {
                            method: 'POST',
                            headers: {
                              'Accept': 'application/vnd.github.v3+json',
                              'Authorization': `token ${githubToken}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              event_type: 'continue-report',
                              client_payload: {
                                orderId: orderId,
                                batchId: batch.id,
                                retry: true
                              }
                            })
                          });
                          console.log('✅ GitHub Actions re-triggered for Step 4');
                        }
                      } catch (err) {
                        console.error('❌ Error re-triggering:', err.message);
                      }
                    }
                    
                    return res.json({
                      status: 'continuing',
                      message: 'Step 3 completed, will continue with Step 4 next iteration',
                      nextStep: 4,
                      totalSteps: progress.totalSteps,
                      elapsed: step3EndTime
                    });
                  }
                  
                  // 時間に余裕がある場合のみStep 4-5を続行
                  console.log('✨ Time available, continuing to Step 4-5 in same process');
                  console.log('🚫 NOT calling any additional functions to avoid infinite loop detection');
                  
                  // Step 4へインクリメント
                  progress.currentStep = 4;
                  
                  // 進捗を保存
                  await ordersDB.saveReportProgress(orderId, progress);
                  
                  console.log('➡️ Continuing to Step 4 without breaking the while loop...');
                  // breakせずにwhileループを継続してStep 4-5を実行
                  // これによりStep 4のcaseに直接進む
                  
                } else if (batch.status === 'failed' || batch.status === 'expired') {
                  console.log(`❌ Batch ${batch.status}`);
                  progress.data.aiInsights = null;
                  // currentStepのインクリメントはswitch文の後で行われる
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
                    // currentStepのインクリメントはswitch文の後で行われる
                    console.log('🔄 Breaking from Step 3 (timeout)');
                    break; // switch文を抜ける
                  } else {
                    // まだBatch処理中なので、Step 3のまま継続
                    await ordersDB.saveReportProgress(orderId, progress);
                    shouldContinue = true; // 続行フラグをセット
                    
                    // GitHub Actionsから呼ばれた場合は、即座にGitHub Actionsを再トリガー
                    if (isFromGitHubActions) {
                      console.log('🔄 Batch still processing, triggering GitHub Actions for retry...');
                      
                      // GitHub Actionsをトリガー（awaitして確実に実行）
                      try {
                        const githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
                        if (githubToken) {
                          console.log('🔑 GitHub token found, sending trigger request...');
                          const response = await fetch('https://api.github.com/repos/tomamints/line-love-edu/dispatches', {
                            method: 'POST',
                            headers: {
                              'Accept': 'application/vnd.github.v3+json',
                              'Authorization': `token ${githubToken}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              event_type: 'continue-report',
                              client_payload: {
                                orderId: orderId,
                                batchId: batch.id,
                                retry: true  // リトライフラグを追加
                              }
                            })
                          });
                          
                          if (response.ok) {
                            console.log('✅ GitHub Actions re-triggered successfully');
                          } else {
                            const errorText = await response.text();
                            console.error('❌ Failed to re-trigger GitHub Actions:', response.status, errorText);
                          }
                        } else {
                          console.error('❌ GitHub token not found for re-trigger');
                        }
                      } catch (err) {
                        console.error('❌ Error re-triggering GitHub Actions:', err.message);
                        console.error('Stack:', err.stack);
                      }
                    }
                    
                    // Step 3のままでwhileループを抜ける（currentStepは増やさない）
                    // 次回もStep 3から始まってBatch状態を再確認する
                    return res.json({
                      status: 'waiting_batch',
                      message: `AI batch ${batch.status} (${waitMinutes}m ${waitSeconds}s)`,
                      nextStep: progress.currentStep,
                      totalSteps: progress.totalSteps,
                      batchId: progress.data.aiBatchId,
                      elapsed: Date.now() - startTime,
                      githubActionsTriggered: isFromGitHubActions  // デバッグ用
                    });
                  }
                }
                
              } catch (error) {
                console.error('❌ Error checking batch:', error.message);
                // エラーの場合はAIなしで続行
                progress.data.aiInsights = null;
                // currentStepのインクリメントはswitch文の後で行われる
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
                
                // GitHub Actionsをトリガー（10秒後に実行）- ただしGitHub Actionsから呼ばれた場合は除く
                if (!isFromGitHubActions) {
                  console.log('🚀 Triggering GitHub Actions to continue processing...');
                  const triggerGitHubActions = async () => {
                    try {
                    const githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
                    if (githubToken) {
                      const response = await fetch('https://api.github.com/repos/tomamints/line-love-edu/dispatches', {
                        method: 'POST',
                        headers: {
                          'Accept': 'application/vnd.github.v3+json',
                          'Authorization': `token ${githubToken}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                          event_type: 'continue-report',
                          client_payload: {
                            orderId: orderId,
                            batchId: batch.id
                          }
                        })
                      });
                      
                      if (response.ok) {
                        console.log('✅ GitHub Actions triggered successfully');
                      } else {
                        console.error('❌ Failed to trigger GitHub Actions:', response.status);
                      }
                    } else {
                      console.log('⚠️ GITHUB_TOKEN not set, skipping GitHub Actions trigger');
                    }
                  } catch (err) {
                    console.error('❌ Error triggering GitHub Actions:', err.message);
                  }
                };
                
                  // 非同期で実行（レスポンスを待たない）
                  triggerGitHubActions().catch(console.error);
                  
                  // 継続を返す（GitHub Actionsが後で処理を続行）
                  await ordersDB.saveReportProgress(orderId, progress);
                  return res.json({
                    status: 'waiting_github_actions',
                    message: 'AI batch job created, GitHub Actions will continue',
                    nextStep: progress.currentStep,
                    totalSteps: progress.totalSteps,
                    batchId: batch.id,
                    elapsed: Date.now() - startTime
                  });
                } else {
                  // GitHub Actionsから呼ばれた場合は、再トリガーしない
                  console.log('⚠️ Already called from GitHub Actions, not triggering again');
                  
                  // 継続を返す（通常の処理として）
                  await ordersDB.saveReportProgress(orderId, progress);
                  return res.json({
                    status: 'continuing',
                    message: 'AI batch job created (from GitHub Actions)',
                    nextStep: progress.currentStep,
                    totalSteps: progress.totalSteps,
                    batchId: batch.id,
                    elapsed: Date.now() - startTime
                  });
                }
                
              } catch (error) {
                console.error('❌ Error creating batch:', error.message);
                // バッチ作成に失敗した場合はAIなしで続行
                progress.data.aiInsights = null;
                // Step 4に進まず、ループを続行してStep 4を実行
              }
            }
          }
            // AI insightsが取得できていない場合のみbreak
            if (!progress.data.aiInsights) {
              console.log('⏳ Still waiting for AI insights, breaking from Step 3');
              break;
            }
            // AI insightsがある場合はbreakせずにStep 4に続行
            console.log('✅ AI insights available, falling through to Step 4');
            
          case 4:
            console.log('📝 Step 4: Generating report...');
            
            // 時間チェック（Step 4開始時）
            const step4ElapsedTime = Date.now() - startTime;
            console.log(`⏱️ Step 4 started at ${step4ElapsedTime}ms`);
            
            // 40秒以上経過していたら、次回に回す
            if (step4ElapsedTime > 40000) {
              console.log('⏰ Time limit approaching for Step 4, deferring to next iteration');
              await ordersDB.saveReportProgress(orderId, progress);
              
              // GitHub Actionsから呼ばれた場合は再トリガー
              if (isFromGitHubActions) {
                try {
                  const githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
                  if (githubToken) {
                    await fetch('https://api.github.com/repos/tomamints/line-love-edu/dispatches', {
                      method: 'POST',
                      headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `token ${githubToken}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        event_type: 'continue-report',
                        client_payload: {
                          orderId: orderId,
                          batchId: progress.data.aiBatchId,
                          retry: true
                        }
                      })
                    });
                    console.log('✅ GitHub Actions re-triggered for Step 4');
                  }
                } catch (err) {
                  console.error('❌ Error re-triggering:', err.message);
                }
              }
              
              return res.json({
                status: 'continuing',
                message: 'Time limit reached, will continue Step 4 next iteration',
                nextStep: 4,
                totalSteps: progress.totalSteps,
                elapsed: step4ElapsedTime
              });
            }
            
            // AI分析結果がまだない場合の処理を修正
            // 既にStep 5まで進んでいる場合はStep 3に戻さない
            if (progress.data.aiBatchId && progress.data.aiInsights === undefined) {
              console.log('⚠️ AI insights not ready yet');
              
              // 既にPDFが生成されている場合（Step 5完了済み）はStep 3に戻さない
              if (progress.data.pdfBuffer || progress.data.reportUrl) {
                console.log('✅ But PDF/report already exists, continuing without AI insights');
                // AI insightsなしでも続行
              } else {
                console.log('⚠️ Going back to Step 3 to wait for AI insights');
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
            
            // Step 5に進む前に時間チェック
            const step4EndTime = Date.now() - startTime;
            if (step4EndTime > 50000) {
              console.log('⏰ Time limit reached after Step 4, deferring Step 5');
              progress.currentStep = 5;
              await ordersDB.saveReportProgress(orderId, progress);
              
              // GitHub Actionsから呼ばれた場合は再トリガー
              if (isFromGitHubActions) {
                try {
                  const githubToken = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT;
                  if (githubToken) {
                    await fetch('https://api.github.com/repos/tomamints/line-love-edu/dispatches', {
                      method: 'POST',
                      headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `token ${githubToken}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        event_type: 'continue-report',
                        client_payload: {
                          orderId: orderId,
                          batchId: progress.data.aiBatchId,
                          retry: true
                        }
                      })
                    });
                    console.log('✅ GitHub Actions re-triggered for Step 5');
                  }
                } catch (err) {
                  console.error('❌ Error re-triggering:', err.message);
                }
              }
              
              return res.json({
                status: 'continuing',
                message: 'Step 4 completed, will continue with Step 5 next iteration',
                nextStep: 5,
                totalSteps: progress.totalSteps,
                elapsed: step4EndTime
              });
            }
            
            // Step 5に続行
            progress.currentStep = 5;
            await ordersDB.saveReportProgress(orderId, progress);
            console.log('➡️ Continuing to Step 5...');
            break; // breakを追加してStep 5を独立させる
            
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
            
            // 完了フラグを設定
            completed = true;
            console.log('✅ Step 5 completed - Report generation finished!');
            
            // 進捗をクリア（これにより次回のチェックで新規扱いになる）
            await ordersDB.clearReportProgress(orderId);
            console.log('✅ All steps completed and progress cleared!');
            break;
        }
        
        // completedフラグがtrueの場合はスキップ
        if (!completed) {
          const stepTime = Date.now() - stepStart;
          const progressBar = '■'.repeat(Math.min(progress.currentStep, 5)) + '□'.repeat(Math.max(0, 5 - progress.currentStep));
          const percentage = Math.round(Math.min(progress.currentStep, 5) / 5 * 100);
          console.log(`✅ Step ${progress.currentStep} completed in ${stepTime}ms`);
          console.log(`📊 Progress: Step ${progress.currentStep}/5 [${progressBar}] ${percentage}%`);
          
          lastCompletedStep = progress.currentStep;
          
          progress.currentStep++;
          
          // 進捗を保存
          await ordersDB.saveReportProgress(orderId, progress);
        }
        
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