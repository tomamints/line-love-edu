/**
 * 課金処理ハンドラー
 * プレミアムレポートの注文と決済を処理
 */

const PremiumReportGenerator = require('./report-generator');
const PDFReportGenerator = require('./pdf-generator');
const ordersDB = require('../database/orders-db');

class PaymentHandler {
  constructor() {
    this.reportGenerator = new PremiumReportGenerator();
    this.pdfGenerator = new PDFReportGenerator();
    // 定期的に期限切れ注文をクリーンアップ
    setInterval(() => {
      ordersDB.cleanupExpiredOrders();
    }, 60 * 60 * 1000); // 1時間ごと
  }
  
  /**
   * プレミアムレポート注文を処理
   * @param {string} userId - ユーザーID
   * @param {object} userProfile - ユーザープロフィール
   * @returns {object} 注文情報と決済URL
   */
  async handlePremiumOrderRequest(userId, userProfile) {
    try {
      // 既存の注文をチェック
      const existingOrders = await ordersDB.getUserOrders(userId);
      
      // 生成中の注文がある場合（完了済みより先にチェック）
      const generatingOrder = existingOrders.find(order => 
        order.status === 'generating' || order.status === 'paid'
      );
      
      if (generatingOrder) {
        console.log('📋 レポート生成中の注文あり:', generatingOrder.id);
        return {
          success: false,
          message: '⏳ 現在レポートを生成中です。\n\n完成まで少々お待ちください（約2-3分）\n完成したら自動的に通知いたします。',
          isGenerating: true,
          orderId: generatingOrder.id
        };
      }
      
      // 有効な未決済注文がある場合
      const pendingOrder = existingOrders.find(order => 
        order.status === 'pending' && 
        new Date(order.expires_at || order.expiresAt) > new Date()
      );
      
      if (pendingOrder) {
        console.log('📋 既存の未決済注文を再利用:', pendingOrder.id);
        
        // 既存の決済URLを再生成または取得
        const orderInfo = {
          orderId: pendingOrder.id,
          userId: pendingOrder.user_id,
          amount: pendingOrder.amount || 1980
        };
        
        const paymentUrl = await this.generatePaymentUrl(orderInfo);
        
        return {
          success: true,
          orderId: pendingOrder.id,
          paymentUrl,
          message: '既存の注文があります。下記のリンクから決済をお願いします。',
          expiresAt: pendingOrder.expires_at || pendingOrder.expiresAt,
          reused: true // 既存注文の再利用フラグ
        };
      }
      
      // 新規注文を作成
      const orderId = this.generateOrderId(userId);
      
      // 注文情報を作成
      const orderInfo = {
        orderId,
        userId,
        userProfile,
        amount: 1980, // 価格（円）
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30分後
      };
      
      // 注文を保存
      await ordersDB.saveOrder(orderId, orderInfo);
      
      // 決済URLを生成（実際はStripe等の決済サービスを使用）
      const paymentUrl = await this.generatePaymentUrl(orderInfo);
      
      // ユーザーに決済案内を送信
      return {
        success: true,
        orderId,
        paymentUrl,
        message: 'プレミアムレポートの注文を受け付けました。下記のリンクから決済をお願いします。',
        expiresAt: orderInfo.expiresAt
      };
      
    } catch (error) {
      console.error('注文処理エラー:', error);
      return {
        success: false,
        message: '注文の処理中にエラーが発生しました。しばらく経ってから再度お試しください。'
      };
    }
  }
  
  /**
   * 決済完了後の処理
   * @param {string} orderId - 注文ID
   * @param {array} messages - メッセージ履歴
   * @returns {object} 処理結果
   */
  async handlePaymentSuccess(orderId, messages, userProfile = null) {
    try {
      // 注文情報を取得
      const orderInfo = await ordersDB.getOrder(orderId);
      if (!orderInfo) {
        throw new Error('注文情報が見つかりません');
      }
      
      // 注文ステータスを更新（生成中）
      await ordersDB.updateOrder(orderId, {
        status: 'generating',
        paidAt: new Date().toISOString()
      });
      
      console.log('🔮 プレミアムレポート生成開始...');
      
      // userProfileが渡されていない場合はデフォルト値を使用
      const displayName = userProfile?.displayName || 'ユーザー';
      
      // プレミアムレポートを生成
      const reportData = await this.reportGenerator.generatePremiumReport(
        messages,
        orderInfo.userId,
        displayName
      );
      
      console.log('📝 レポートデータ生成完了');
      
      // PDFを生成して保存
      const pdfBuffer = await this.pdfGenerator.generatePDF(reportData);
      console.log('📄 PDF生成完了');
      
      // PDFをファイルシステムに保存
      const fs = require('fs').promises;
      const path = require('path');
      const ordersDir = process.env.VERCEL 
        ? '/tmp/orders'
        : path.join(process.cwd(), 'orders');
      
      try {
        await fs.mkdir(ordersDir, { recursive: true });
      } catch (err) {
        // ディレクトリが既に存在する場合は無視
      }
      
      const pdfPath = path.join(ordersDir, `${orderId}.pdf`);
      await fs.writeFile(pdfPath, pdfBuffer);
      console.log('💾 PDFファイル保存完了:', pdfPath);
      
      if (process.env.VERCEL) {
        console.log('⚠️ 注意: Vercel環境では一時保存のため、時間経過でファイルが削除されます');
      }
      
      // ダウンロードURLを生成
      const fileName = `premium_report_${orderId}.pdf`;
      const fileUrl = await this.saveReportFile(fileName, pdfBuffer);
      
      // 注文情報を更新（Supabaseに存在するカラムのみ）
      await ordersDB.updateOrder(orderId, {
        status: 'completed',
        reportUrl: fileUrl
        // completedAtとpdf_dataカラムは存在しないので除外
      });
      
      return {
        success: true,
        orderId,
        reportUrl: fileUrl,
        fileName,
        reportData,
        pdfBuffer,
        message: 'プレミアムレポートが完成しました！PDFファイルをダウンロードしてご確認ください。'
      };
      
    } catch (error) {
      console.error('決済後処理エラー:', error);
      
      // エラー時は注文ステータスを更新
      await ordersDB.updateOrder(orderId, {
        status: 'error',
        errorMessage: error.message
      });
      
      return {
        success: false,
        message: 'レポートの生成中にエラーが発生しました。サポートまでお問い合わせください。'
      };
    }
  }
  
  /**
   * 注文IDを生成
   * @param {string} userId - ユーザーID
   * @returns {string} 注文ID
   */
  generateOrderId(userId) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `ORDER_${userId.substring(0, 8)}_${timestamp}_${random}`;
  }
  
  /**
   * 決済URLを生成
   * @param {object} orderInfo - 注文情報
   * @returns {string} 決済URL
   */
  async generatePaymentUrl(orderInfo) {
    try {
      // Stripeを使用する場合
      if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_YOUR_STRIPE_SECRET_KEY') {
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'jpy',
              product_data: {
                name: 'プレミアム恋愛レポート',
                description: 'おつきさま診断が分析した超詳細な恋愛診断書（PDF形式・約20ページ）',
                images: ['https://your-app.vercel.app/images/premium-report.png']
              },
              unit_amount: orderInfo.amount
            },
            quantity: 1
          }],
          mode: 'payment',
          success_url: `${process.env.BASE_URL || 'https://your-app.vercel.app'}/payment/success?orderId=${orderInfo.orderId}`,
          cancel_url: `${process.env.BASE_URL || 'https://your-app.vercel.app'}/payment/cancel`,
          metadata: {
            orderId: orderInfo.orderId,
            userId: orderInfo.userId
          }
        });
        
        return session.url;
      }
      
      // Stripeが設定されていない場合はプレースホルダー
      const baseUrl = process.env.PAYMENT_BASE_URL || 'https://your-app.vercel.app/payment';
      return `${baseUrl}?order=${orderInfo.orderId}&amount=${orderInfo.amount}&user=${orderInfo.userId}`;
      
    } catch (error) {
      console.error('決済URL生成エラー:', error);
      // エラー時はプレースホルダーを返す
      const baseUrl = process.env.PAYMENT_BASE_URL || 'https://your-app.vercel.app/payment';
      return `${baseUrl}?order=${orderInfo.orderId}&amount=${orderInfo.amount}&user=${orderInfo.userId}`;
    }
  }
  
  /**
   * レポートファイルを保存
   * @param {string} fileName - ファイル名
   * @param {Buffer} fileBuffer - ファイルバッファ
   * @returns {string} ファイルURL
   */
  async saveReportFile(fileName, fileBuffer) {
    // 実際の実装では AWS S3, Google Cloud Storage などを使用
    // const AWS = require('aws-sdk');
    // const s3 = new AWS.S3();
    // const result = await s3.upload({
    //   Bucket: process.env.S3_BUCKET,
    //   Key: fileName,
    //   Body: fileBuffer,
    //   ContentType: 'application/pdf'
    // }).promise();
    // return result.Location;
    
    // ローカル実装：注文IDから表示用URLを生成（view-reportに変更）
    const orderId = fileName.replace('premium_report_', '').replace('.pdf', '');
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/api/view-report?orderId=${orderId}`;
  }
  
  /**
   * 注文ステータスを確認
   * @param {string} orderId - 注文ID
   * @returns {object} 注文情報
   */
  async getOrderStatus(orderId) {
    const orderInfo = await ordersDB.getOrder(orderId);
    if (!orderInfo) {
      return {
        success: false,
        message: '注文情報が見つかりません'
      };
    }
    
    return {
      success: true,
      orderId,
      status: orderInfo.status,
      createdAt: orderInfo.createdAt,
      amount: orderInfo.amount,
      reportUrl: orderInfo.reportUrl
    };
  }
  
  /**
   * 決済案内メッセージを生成
   * @param {object} orderResult - 注文結果
   * @returns {object} LINE メッセージ
   */
  generatePaymentMessage(orderResult) {
    if (!orderResult.success) {
      return {
        type: 'text',
        text: `❌ ${orderResult.message}`
      };
    }
    
    return {
      type: 'flex',
      altText: 'プレミアムレポート決済案内',
      contents: {
        type: 'bubble',
        size: 'mega',
        header: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#1a0033',
          paddingAll: '20px',
          contents: [
            {
              type: 'text',
              text: '💳 決済のご案内',
              size: 'xl',
              weight: 'bold',
              color: '#FFD700',
              align: 'center'
            }
          ]
        },
        body: {
          type: 'box',
          layout: 'vertical',
          spacing: 'md',
          paddingAll: '20px',
          backgroundColor: '#0f0c29',
          contents: [
            {
              type: 'text',
              text: '🔮 プレミアム恋愛レポート',
              size: 'lg',
              weight: 'bold',
              color: '#FFD700',
              align: 'center'
            },
            {
              type: 'text',
              text: 'ご注文ありがとうございます！',
              size: 'md',
              color: '#F8F8FF',
              align: 'center',
              margin: 'md'
            },
            {
              type: 'separator',
              margin: 'lg'
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '注文ID',
                  color: '#E8B4B8',
                  flex: 1
                },
                {
                  type: 'text',
                  text: orderResult.orderId.substring(0, 20) + '...',
                  color: '#F8F8FF',
                  flex: 2,
                  wrap: true
                }
              ]
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '金額',
                  color: '#E8B4B8',
                  flex: 1
                },
                {
                  type: 'text',
                  text: '¥1,980',
                  color: '#F8F8FF',
                  flex: 2,
                  weight: 'bold'
                }
              ]
            },
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '有効期限',
                  color: '#E8B4B8',
                  flex: 1
                },
                {
                  type: 'text',
                  text: '30分',
                  color: '#FF006E',
                  flex: 2,
                  weight: 'bold'
                }
              ]
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          backgroundColor: '#1a0033',
          paddingAll: '15px',
          contents: [
            {
              type: 'button',
              action: {
                type: 'uri',
                label: '💳 決済を完了する',
                uri: orderResult.paymentUrl
              },
              style: 'primary',
              color: '#FFD700'
            },
            {
              type: 'text',
              text: '決済完了後、レポートを生成してお送りします',
              size: 'xs',
              color: '#B8E7FC',
              align: 'center',
              margin: 'sm'
            }
          ]
        }
      }
    };
  }
  
  /**
   * レポート完成通知メッセージを生成
   * @param {object} completionResult - 完成結果
   * @returns {object} LINE メッセージ
   */
  generateCompletionMessage(completionResult) {
    if (!completionResult.success) {
      return {
        type: 'text',
        text: `❌ ${completionResult.message}`
      };
    }
    
    return [
      {
        type: 'flex',
        altText: 'プレミアムレポートが完成しました！',
        contents: {
          type: 'bubble',
          size: 'mega',
          header: {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#1a0033',
            paddingAll: '20px',
            contents: [
              {
                type: 'text',
                text: '✨ レポート完成！ ✨',
                size: 'xl',
                weight: 'bold',
                color: '#FFD700',
                align: 'center'
              }
            ]
          },
          body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'md',
            paddingAll: '20px',
            backgroundColor: '#0f0c29',
            contents: [
              {
                type: 'text',
                text: '🔮 プレミアム恋愛レポート',
                size: 'lg',
                weight: 'bold',
                color: '#FFD700',
                align: 'center'
              },
              {
                type: 'text',
                text: '全50ページのPDFレポート',
                size: 'md',
                color: '#F8F8FF',
                align: 'center',
                wrap: true,
                margin: 'md'
              },
              {
                type: 'text',
                text: '✅ 生成完了しました！',
                size: 'lg',
                color: '#00ff00',
                align: 'center',
                weight: 'bold',
                margin: 'md'
              },
              {
                type: 'separator',
                margin: 'lg'
              },
              {
                type: 'text',
                text: '📋 レポート内容',
                size: 'md',
                weight: 'bold',
                color: '#E8B4B8',
                margin: 'md'
              },
              {
                type: 'text',
                text: '• 20項目の詳細相性分析\n• 月別恋愛運勢カレンダー\n• 40個のパーソナルアクション\n• 告白成功戦略\n• 長期関係構築ロードマップ',
                size: 'sm',
                color: '#F8F8FF',
                wrap: true
              }
            ]
          },
          footer: {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#1a0033',
            paddingAll: '15px',
            contents: [
              {
                type: 'button',
                action: {
                  type: 'uri',
                  label: '📄 レポートをブラウザで閲覧',
                  uri: completionResult.reportUrl
                },
                style: 'primary',
                color: '#FFD700'
              },
              {
                type: 'text',
                text: '※ブラウザで開いてPDF保存が可能です',
                size: 'xs',
                color: '#B8E7FC',
                align: 'center',
                margin: 'sm'
              }
            ]
          }
        }
      }
    ];
  }
}

module.exports = PaymentHandler;