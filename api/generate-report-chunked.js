// api/generate-report-chunked.js
// レポート生成を分割実行（50秒タイムアウト対策）

const ordersDB = require('../core/database/orders-db');
const PaymentHandler = require('../core/premium/payment-handler');
const profileManager = require('../core/database/profiles-db');
const line = require('@line/bot-sdk');

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
            
          case 3:
            console.log('🤖 Step 3: AI insights (may take time)...');
            console.log('📊 Starting AI analysis at:', new Date().toISOString());
            console.log('⏱️ Current elapsed time:', Date.now() - startTime, 'ms');
            
            // AI分析（最も時間がかかる）
            try {
              const ReportGenerator = require('../core/premium/report-generator');
              const reportGenerator = new ReportGenerator();
              progress.data.aiInsights = await reportGenerator.getAIInsights(
                progress.data.messages,
                progress.data.fortune
              );
              console.log('✅ AI analysis complete');
            } catch (aiError) {
              console.error('⚠️ AI analysis error:', aiError.message);
              // AI分析エラーの場合はリトライするため、ステップを進めない
              if (progress.attempts < 3) {
                console.log('🔄 Will retry AI analysis on next attempt');
                // ステップを進めずに終了（次回同じステップから再開）
                await ordersDB.saveReportProgress(orderId, progress);
                return res.json({
                  status: 'continuing',
                  message: `AI analysis failed, will retry (attempt ${progress.attempts}/3)`,
                  nextStep: progress.currentStep,
                  totalSteps: progress.totalSteps,
                  elapsed: Date.now() - startTime
                });
              }
              // 3回失敗したら空のAI洞察で続行
              console.log('⚠️ AI analysis failed 3 times, continuing without AI insights');
              progress.data.aiInsights = null;
            }
            break;
            
          case 4:
            console.log('📝 Step 4: Generating report...');
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
            const fs = require('fs').promises;
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
            
            // ユーザーに通知
            try {
              const completionMessage = paymentHandler.generateCompletionMessage({
                success: true,
                reportUrl: reportUrl,
                orderId: orderId
              });
              await lineClient.pushMessage(order.userId, completionMessage);
              console.log('✅ User notified');
            } catch (err) {
              console.log('⚠️ Notification failed:', err.message);
            }
            
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
          
          // 5秒後にリトライ
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://line-love-edu.vercel.app';
          setTimeout(() => {
            fetch(`${baseUrl}/api/generate-report-chunked`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: orderId })
            }).catch(err => console.error('⚠️ Retry failed:', err));
          }, 5000);
          
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
      
      // 自動的に次の処理を開始
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://line-love-edu.vercel.app';
      
      // 3秒後に次の処理をトリガー
      setTimeout(() => {
        fetch(`${baseUrl}/api/generate-report-chunked`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orderId })
        }).then(() => {
          console.log('✅ Next process triggered after 3 seconds');
        }).catch(err => {
          console.error('⚠️ Failed to trigger next process:', err.message);
        });
      }, 3000); // 3秒後
      
      // クライアントには継続中であることを返す
      return res.json({
        status: 'continuing',
        message: `Completed steps 1-${lastCompletedStep}, continuing from step ${progress.currentStep}`,
        nextStep: progress.currentStep,
        totalSteps: progress.totalSteps,
        elapsed: Date.now() - startTime,
        autoTriggered: true // 自動継続フラグ
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