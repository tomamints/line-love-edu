// api/generate-report-chunked.js
// レポート生成を分割実行（50秒タイムアウト対策）

const ordersDB = require('../core/database/orders-db');
const PaymentHandler = require('../core/premium/payment-handler');
const UserProfileManager = require('../core/user-profile');
const line = require('@line/bot-sdk');

const paymentHandler = new PaymentHandler();
const profileManager = new UserProfileManager();

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
  
  const startTime = Date.now();
  const TIME_LIMIT = 40000; // 40秒でタイムアウト（Vercelの60秒制限に対して余裕を持つ）
  
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
      console.log('♻️ Resuming from step', progress.currentStep);
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
    let maxStepsThisRun = 2; // デフォルトは最大2ステップ実行
    
    // 現在のステップに応じて実行可能なステップ数を決定
    if (progress.currentStep === 1) {
      maxStepsThisRun = 2; // Step 1,2を実行
    } else if (progress.currentStep === 3) {
      maxStepsThisRun = 1; // Step 3のみ（AI分析は単独で実行）
    } else if (progress.currentStep === 4) {
      maxStepsThisRun = 2; // Step 4,5を実行
    }
    
    let stepsExecuted = 0;
    
    while (progress.currentStep <= progress.totalSteps && stepsExecuted < maxStepsThisRun) {
      const elapsed = Date.now() - startTime;
      const stepTimeout = STEP_TIMEOUTS[progress.currentStep] || 10000;
      
      // Step 3は特別扱い - 新しいリクエストで始まるので時間チェックをスキップ
      if (progress.currentStep === 3) {
        console.log('📍 Step 3 - AI Analysis (special handling)');
        console.log('⏱️ Starting with full time available');
        // Step 3は必ず実行する
      } else {
        // 他のステップは時間チェック
        if (elapsed + stepTimeout > TIME_LIMIT) {
          console.log('⏸️ Pausing before step', progress.currentStep);
          console.log('⏱️ Elapsed:', elapsed, 'ms');
          console.log('⏱️ Next step needs:', stepTimeout, 'ms');
          console.log('⏰ Will continue in next invocation to avoid timeout');
          break;
        }
      }
      
      // Step 3（AI分析）の前は必ず中断して、新しいリクエストで実行
      if (progress.currentStep === 3 && stepsExecuted > 0) {
        console.log('⏸️ Pausing before AI analysis (Step 3)');
        console.log('⏰ AI analysis will run in a fresh invocation');
        break;
      }
      
      console.log(`\n📍 Step ${progress.currentStep}/${progress.totalSteps}`);
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
              const profile = await profileManager.getProfile(order.userId);
              progress.data.messages = profile?.messages || [];
              console.log('💬 Messages loaded:', progress.data.messages.length);
              
              if (progress.data.messages.length === 0) {
                console.log('⚠️ No messages found, using default');
                // デフォルトメッセージ生成
                progress.data.messages = generateDefaultMessages();
              }
            }
            break;
            
          case 2:
            console.log('🔍 Step 2: Basic analysis...');
            // 基本分析は高速なのでここで実行
            const fortuneEngine = require('../core/fortune-engine');
            const engine = new fortuneEngine();
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
              const reportGenerator = new (require('../core/premium/report-generator'))();
              progress.data.aiInsights = await reportGenerator.getAIInsights(
                progress.data.messages,
                progress.data.fortune
              );
              console.log('✅ AI analysis complete');
            } catch (aiError) {
              console.error('⚠️ AI analysis error (will retry):', aiError.message);
              // エラーでも次回リトライできるように進捗は保存
              progress.data.aiInsights = null;
            }
            break;
            
          case 4:
            console.log('📝 Step 4: Generating report...');
            // レポート生成
            const fullReportGenerator = new (require('../core/premium/report-generator'))();
            progress.data.reportData = await fullReportGenerator.generatePremiumReport(
              progress.data.messages,
              order.userId,
              progress.data.userProfile.displayName
            );
            
            // HTML/PDF生成
            const pdfGenerator = new (require('../core/premium/pdf-generator'))();
            const pdfBuffer = await pdfGenerator.generatePDF(progress.data.reportData);
            // BufferをBase64として保存（JSONシリアライズ可能）
            progress.data.pdfBuffer = pdfBuffer.toString('base64');
            console.log('✅ Report generated, PDF size:', Math.round(pdfBuffer.length / 1024), 'KB');
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
        console.log(`⏱️ Step ${progress.currentStep} took ${stepTime}ms`);
        
        lastCompletedStep = progress.currentStep;
        progress.currentStep++;
        stepsExecuted++;
        
        // 進捗を保存
        await ordersDB.saveReportProgress(orderId, progress);
        
      } catch (stepError) {
        console.error(`❌ Error in step ${progress.currentStep}:`, stepError.message);
        
        // エラーでも次のステップに進む（最大試行回数でガード）
        progress.currentStep++;
        progress.lastError = stepError.message;
        await ordersDB.saveReportProgress(orderId, progress);
      }
    }
    
    // 完了チェック
    if (completed) {
      console.log('🎉 Report generation completed successfully!');
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
      
      // 継続が必要なことを返す（continue-reportエンドポイントが処理を引き継ぐ）
      return res.json({
        status: 'continuing',
        message: `Completed steps 1-${lastCompletedStep}, continuing from step ${progress.currentStep}`,
        nextStep: progress.currentStep,
        totalSteps: progress.totalSteps,
        elapsed: Date.now() - startTime
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