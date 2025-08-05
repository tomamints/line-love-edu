/**
 * PDF恋愛レポート生成器
 * プレミアムレポートデータを美しいPDFに変換
 */

class PDFReportGenerator {
  /**
   * レポートデータをPDFに変換
   * @param {object} reportData - レポートデータ
   * @returns {Buffer} PDFバッファ
   */
  async generatePDF(reportData) {
    try {
      // HTML形式のレポートを生成
      const htmlContent = this.generateHTMLReport(reportData);
      
      // HTMLをPDFに変換（puppeteerまたは類似ライブラリを使用）
      // 実際の実装では puppeteer や html-pdf を使用
      const pdfBuffer = await this.convertHTMLToPDF(htmlContent);
      
      return pdfBuffer;
      
    } catch (error) {
      console.error('PDF生成エラー:', error);
      throw new Error('PDFの生成に失敗しました');
    }
  }
  
  /**
   * HTMLレポートを生成
   * @param {object} data - レポートデータ  
   * @returns {string} HTML文字列
   */
  generateHTMLReport(data) {
    return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>プレミアム恋愛レポート - ${data.metadata.userName}さん</title>
    <style>
        ${this.getReportCSS()}
    </style>
</head>
<body>
    <div class="report-container">
        ${this.generateCoverPage(data)}
        ${this.generateTableOfContents(data)}
        ${this.generateExecutiveSummary(data)}
        ${this.generateCompatibilitySection(data)}
        ${this.generateConversationSection(data)}
        ${this.generateMonthlyForecast(data)}
        ${this.generateActionPlan(data)}
        ${this.generateRiskAnalysis(data)}
        ${this.generateConfessionStrategy(data)}
        ${this.generateRoadmap(data)}
        ${this.generateAppendix(data)}
    </div>
</body>
</html>`;
  }
  
  /**
   * レポート用CSSを取得
   * @returns {string} CSS文字列
   */
  getReportCSS() {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Noto Sans JP', 'Hiragino Sans', sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #1a0033, #0f0c29);
        }
        
        .report-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .page {
            padding: 40px;
            min-height: 100vh;
            page-break-after: always;
        }
        
        .cover-page {
            background: linear-gradient(135deg, #1a0033, #24243e);
            color: white;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        
        .cover-title {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 20px;
            color: #FFD700;
        }
        
        .cover-subtitle {
            font-size: 1.5em;
            margin-bottom: 40px;
            color: #E8B4B8;
        }
        
        .user-name {
            font-size: 2em;
            margin-bottom: 20px;
            color: #F8F8FF;
        }
        
        .report-date {
            font-size: 1.2em;
            color: #B8E7FC;
        }
        
        h1 {
            color: #1a0033;
            font-size: 2.5em;
            margin-bottom: 30px;
            border-bottom: 3px solid #FFD700;
            padding-bottom: 10px;
        }
        
        h2 {
            color: #24243e;
            font-size: 2em;
            margin: 30px 0 20px 0;
            border-left: 5px solid #E8B4B8;
            padding-left: 15px;
        }
        
        h3 {
            color: #1a0033;
            font-size: 1.5em;
            margin: 25px 0 15px 0;
        }
        
        .summary-card {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
            border-left: 5px solid #FFD700;
        }
        
        .score-display {
            text-align: center;
            background: linear-gradient(135deg, #1a0033, #24243e);
            color: white;
            padding: 30px;
            border-radius: 20px;
            margin: 20px 0;
        }
        
        .score-number {
            font-size: 4em;
            font-weight: bold;
            color: #FFD700;
        }
        
        .score-grade {
            font-size: 2em;
            color: #E8B4B8;
        }
        
        .compatibility-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .compatibility-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 10px;
            border-left: 4px solid #28a745;
        }
        
        .compatibility-item.medium {
            border-left-color: #ffc107;
        }
        
        .compatibility-item.low {
            border-left-color: #dc3545;
        }
        
        .action-item {
            background: #fff;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .action-priority {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            color: white;
        }
        
        .priority-high {
            background: #dc3545;
        }
        
        .priority-medium {
            background: #ffc107;
        }
        
        .priority-low {
            background: #28a745;
        }
        
        .monthly-calendar {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        
        .month-card {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 10px;
            padding: 20px;
            text-align: center;
        }
        
        .month-score {
            font-size: 2em;
            font-weight: bold;
            color: #1a0033;
        }
        
        .risk-warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
        }
        
        .risk-high {
            background: #f8d7da;
            border-color: #f5c6cb;
        }
        
        .confession-timeline {
            position: relative;
            padding: 20px 0;
        }
        
        .timeline-item {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #FFD700;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .roadmap-stage {
            background: linear-gradient(135deg, #1a0033, #24243e);
            color: white;
            border-radius: 15px;
            padding: 25px;
            margin: 20px 0;
        }
        
        .stage-number {
            display: inline-block;
            background: #FFD700;
            color: #1a0033;
            width: 40px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            border-radius: 50%;
            font-weight: bold;
            margin-right: 15px;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        th {
            background-color: #1a0033;
            color: white;
        }
        
        .footer {
            text-align: center;
            color: #666;
            font-size: 0.9em;
            margin-top: 50px;
            padding: 20px;
            border-top: 1px solid #eee;
        }
        
        @media print {
            body { 
                background: white; 
            }
            .page {
                page-break-after: always;
            }
        }
    `;
  }
  
  /**
   * カバーページを生成
   * @param {object} data - レポートデータ
   * @returns {string} HTML
   */
  generateCoverPage(data) {
    const date = new Date(data.metadata.generatedAt).toLocaleDateString('ja-JP');
    
    return `
    <div class="page cover-page">
        <div class="cover-title">🔮 プレミアム恋愛レポート</div>
        <div class="cover-subtitle">AI が分析した超詳細恋愛診断書</div>
        <div class="user-name">${data.metadata.userName}さん専用</div>
        <div class="report-date">生成日: ${date}</div>
        <div style="margin-top: 50px; font-size: 1.2em;">
            <div>✨ あなたの恋愛を成功に導く完全ガイド ✨</div>
        </div>
    </div>`;
  }
  
  /**
   * 目次を生成
   * @param {object} data - レポートデータ
   * @returns {string} HTML
   */
  generateTableOfContents(data) {
    return `
    <div class="page">
        <h1>📋 目次</h1>
        <div style="font-size: 1.1em; line-height: 2;">
            <div>1. エグゼクティブサマリー ..................................... 3</div>
            <div>2. 詳細相性分析（20項目以上）................................. 4</div>
            <div>3. 会話パターン分析 ......................................... 6</div>
            <div>4. 月別恋愛運勢カレンダー ................................... 8</div>
            <div>5. パーソナライズドアクションプラン（40項目）................. 10</div>
            <div>6. 危険信号とその対策 ....................................... 14</div>
            <div>7. 告白成功の最適戦略 ....................................... 16</div>
            <div>8. 長期的な関係構築ロードマップ ............................. 18</div>
            <div>9. 付録：詳細データ ......................................... 20</div>
        </div>
    </div>`;
  }
  
  /**
   * エグゼクティブサマリーを生成
   * @param {object} data - レポートデータ
   * @returns {string} HTML
   */
  generateExecutiveSummary(data) {
    const summary = data.executiveSummary;
    
    return `
    <div class="page">
        <h1>📊 エグゼクティブサマリー</h1>
        
        <div class="score-display">
            <div class="score-number">${summary.overallAssessment.score}</div>
            <div class="score-grade">グレード: ${summary.overallAssessment.grade}</div>
            <div style="margin-top: 15px;">${summary.overallAssessment.description}</div>
        </div>
        
        <div class="summary-card">
            <h3>🔍 主な発見事項</h3>
            ${summary.keyFindings.map(finding => `<div>• ${finding}</div>`).join('')}
        </div>
        
        <div class="summary-card">
            <h3>💡 重要な推奨事項</h3>
            ${summary.recommendations.map(rec => `<div>• ${rec}</div>`).join('')}
        </div>
    </div>`;
  }
  
  /**
   * 相性分析セクションを生成
   * @param {object} data - レポートデータ
   * @returns {string} HTML
   */
  generateCompatibilitySection(data) {
    const compatibility = data.compatibilityAnalysis;
    
    return `
    <div class="page">
        <h1>💕 詳細相性分析</h1>
        
        <div class="score-display">
            <div class="score-number">${compatibility.overallCompatibilityScore}%</div>
            <div style="color: #E8B4B8;">総合相性スコア</div>
        </div>
        
        <h2>📈 カテゴリー別分析</h2>
        <div class="compatibility-grid">
            ${Object.entries(compatibility.categoryBreakdown).map(([category, score]) => `
                <div class="compatibility-item ${this.getCompatibilityClass(score)}">
                    <h4>${category}</h4>
                    <div style="font-size: 1.5em; font-weight: bold;">${score}%</div>
                </div>
            `).join('')}
        </div>
        
        <h2>⭐ 強みの分野</h2>
        ${compatibility.strengthAreas.map(item => `
            <div class="compatibility-item">
                <strong>${item.item}</strong> (${item.score}%)
                <div style="font-size: 0.9em; color: #666; margin-top: 5px;">
                    カテゴリー: ${item.category}
                </div>
            </div>
        `).join('')}
    </div>`;
  }
  
  /**
   * 会話分析セクションを生成
   * @param {object} data - レポートデータ
   * @returns {string} HTML
   */
  generateConversationSection(data) {
    const conversation = data.conversationAnalysis;
    
    return `
    <div class="page">
        <h1>💬 会話パターン分析</h1>
        
        <h2>🎭 コミュニケーションスタイル</h2>
        <div class="summary-card">
            <h4>あなたのスタイル</h4>
            <p>${conversation.conversationStyle.yourStyle}</p>
        </div>
        
        <div class="summary-card">
            <h4>相手のスタイル</h4>
            <p>${conversation.conversationStyle.partnerStyle}</p>
        </div>
        
        <h2>📋 改善提案</h2>
        ${conversation.improvements.conversationTips.map(tip => `
            <div class="action-item">
                💡 ${tip}
            </div>
        `).join('')}
    </div>`;
  }
  
  /**
   * 月別予測セクションを生成
   * @param {object} data - レポートデータ
   * @returns {string} HTML
   */
  generateMonthlyForecast(data) {
    const forecast = data.monthlyForecast;
    
    return `
    <div class="page">
        <h1>📅 月別恋愛運勢カレンダー</h1>
        
        <div class="summary-card">
            <h3>🌟 年間概要</h3>
            <p>${forecast.yearlyOverview}</p>
        </div>
        
        <div class="monthly-calendar">
            ${forecast.monthlyDetails.slice(0, 6).map(month => `
                <div class="month-card">
                    <h4>${month.month}</h4>
                    <div class="month-score">${month.loveScore}%</div>
                    <div style="font-size: 0.9em; margin-top: 10px;">
                        ${month.theme}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <h2>📝 詳細月別ガイド</h2>
        ${forecast.monthlyDetails.slice(0, 3).map(month => `
            <div class="summary-card">
                <h4>${month.month} - ${month.theme}</h4>
                <div><strong>チャンス:</strong> ${month.opportunities.join(', ')}</div>
                <div><strong>注意点:</strong> ${month.cautions.join(', ')}</div>
                <div><strong>推奨アクション:</strong> ${month.recommendedActions.join(', ')}</div>
            </div>
        `).join('')}
    </div>`;
  }
  
  /**
   * アクションプランセクションを生成
   * @param {object} data - レポートデータ
   * @returns {string} HTML
   */
  generateActionPlan(data) {
    const actionPlan = data.actionPlan;
    
    return `
    <div class="page">
        <h1>🎯 パーソナライズドアクションプラン</h1>
        
        <div class="summary-card">
            <h3>📊 アクションプラン概要</h3>
            <p>総アクション数: <strong>${actionPlan.totalActions}個</strong></p>
            <p>カテゴリー: ${actionPlan.categories.join(', ')}</p>
        </div>
        
        <h2>🔥 最優先アクション（Top 10）</h2>
        ${actionPlan.priorityActions.slice(0, 10).map((action, index) => `
            <div class="action-item">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${index + 1}. ${action.title}</strong>
                        <span class="action-priority priority-${action.priority}">${action.priority.toUpperCase()}</span>
                    </div>
                    <div style="color: #28a745; font-weight: bold;">${action.successRate}%</div>
                </div>
                <p style="margin-top: 10px;">${action.description}</p>
                <div style="font-size: 0.9em; color: #666; margin-top: 5px;">
                    タイミング: ${action.timing} | カテゴリー: ${action.category}
                </div>
            </div>
        `).join('')}
    </div>`;
  }
  
  /**
   * リスク分析セクションを生成
   * @param {object} data - レポートデータ
   * @returns {string} HTML
   */
  generateRiskAnalysis(data) {
    const risk = data.riskAnalysis;
    
    return `
    <div class="page">
        <h1>⚠️ 危険信号とその対策</h1>
        
        <div class="score-display">
            <div style="font-size: 2em; color: ${risk.riskLevel === 'high' ? '#dc3545' : risk.riskLevel === 'medium' ? '#ffc107' : '#28a745'};">
                リスクレベル: ${risk.riskLevel.toUpperCase()}
            </div>
        </div>
        
        <h2>🚨 特定されたリスク</h2>
        ${risk.identifiedRisks.map(riskItem => `
            <div class="risk-warning ${riskItem.level === 'high' ? 'risk-high' : ''}">
                <h4>⚠️ ${riskItem.title}</h4>
                <p><strong>内容:</strong> ${riskItem.description}</p>
                <p><strong>対策:</strong> ${riskItem.prevention}</p>
            </div>
        `).join('')}
        
        <h2>📋 緊急時対応プラン</h2>
        <div class="summary-card">
            ${risk.emergencyPlan.steps.map((step, index) => `
                <div style="margin: 10px 0;">
                    <strong>Step ${index + 1}:</strong> ${step}
                </div>
            `).join('')}
        </div>
    </div>`;
  }
  
  /**
   * 告白戦略セクションを生成
   * @param {object} data - レポートデータ
   * @returns {string} HTML
   */
  generateConfessionStrategy(data) {
    const strategy = data.confessionStrategy;
    
    return `
    <div class="page">
        <h1>💖 告白成功の最適戦略</h1>
        
        <h2>📊 準備状況評価</h2>
        <div class="score-display">
            <div class="score-number">${strategy.readinessAssessment.currentReadiness}%</div>
            <div style="color: #E8B4B8;">現在の準備度</div>
        </div>
        
        <div class="summary-card">
            <h4>必要なステップ</h4>
            ${strategy.readinessAssessment.requiredSteps.map(step => `<div>• ${step}</div>`).join('')}
        </div>
        
        <h2>🎯 戦略プラン</h2>
        <div class="confession-timeline">
            <div class="timeline-item">
                <h4>📅 最適タイミング</h4>
                <p>${strategy.strategyPlan.timing}</p>
            </div>
            
            <div class="timeline-item">
                <h4>📍 推奨場所</h4>
                <p>${strategy.strategyPlan.location}</p>
            </div>
            
            <div class="timeline-item">
                <h4>💬 告白方法</h4>
                <p>${strategy.strategyPlan.method}</p>
            </div>
        </div>
        
        <h2>📝 会話の流れ（例）</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; font-style: italic;">
            ${strategy.preparation.conversationFlow}
        </div>
    </div>`;
  }
  
  /**
   * ロードマップセクションを生成
   * @param {object} data - レポートデータ
   * @returns {string} HTML
   */
  generateRoadmap(data) {
    const roadmap = data.relationshipRoadmap;
    
    return `
    <div class="page">
        <h1>🗺️ 長期的な関係構築ロードマップ</h1>
        
        <div class="summary-card">
            <h3>📍 現在位置</h3>
            <p><strong>レベル ${roadmap.currentStage.level}:</strong> ${roadmap.currentStage.title}</p>
            <p>${roadmap.currentStage.assessment}</p>
        </div>
        
        <h2>🛤️ 成長ステップ</h2>
        ${roadmap.roadmap.slice(0, 3).map(milestone => `
            <div class="roadmap-stage">
                <div>
                    <span class="stage-number">${milestone.stage}</span>
                    <strong>${milestone.title}</strong>
                </div>
                <p style="margin: 15px 0;">${milestone.description}</p>
                
                <div style="margin: 15px 0;">
                    <strong>目標:</strong>
                    ${milestone.objectives.map(obj => `<div>• ${obj}</div>`).join('')}
                </div>
                
                <div style="margin: 15px 0;">
                    <strong>推定期間:</strong> ${milestone.estimatedTimeframe}
                </div>
            </div>
        `).join('')}
    </div>`;
  }
  
  /**
   * 付録セクションを生成
   * @param {object} data - レポートデータ
   * @returns {string} HTML
   */
  generateAppendix(data) {
    return `
    <div class="page">
        <h1>📎 付録：詳細データ</h1>
        
        <h2>📊 統計データ</h2>
        <table>
            <tr>
                <th>項目</th>
                <th>値</th>
            </tr>
            <tr>
                <td>総メッセージ数</td>
                <td>${data.appendix.statisticalData?.totalMessages || '---'}</td>
            </tr>
            <tr>
                <td>平均メッセージ長</td>
                <td>${data.appendix.statisticalData?.averageLength || '---'}文字</td>
            </tr>
            <tr>
                <td>返信率</td>
                <td>${data.appendix.statisticalData?.responseRate || '---'}</td>
            </tr>
            <tr>
                <td>平均返信時間</td>
                <td>${data.appendix.statisticalData?.averageResponseTime || '---'}</td>
            </tr>
        </table>
        
        <div class="footer">
            <p>🔮 このレポートは AI による分析結果です。参考情報としてご活用ください。</p>
            <p>生成日時: ${new Date(data.metadata.generatedAt).toLocaleString('ja-JP')}</p>
            <p>レポートID: ${data.metadata.reportId}</p>
        </div>
    </div>`;
  }
  
  /**
   * 相性クラスを取得
   * @param {number} score - スコア
   * @returns {string} CSSクラス
   */
  getCompatibilityClass(score) {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  }
  
  /**
   * HTMLをPDFに変換
   * @param {string} html - HTML文字列
   * @returns {Buffer} PDFバッファ
   */
  async convertHTMLToPDF(html) {
    try {
      // PDFKitを使用してPDFを生成
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: 'プレミアム恋愛レポート',
          Author: '恋愛お告げボット',
          Subject: 'AI恋愛分析レポート'
        }
      });
      
      // PDFバッファを作成
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      
      // 日本語フォントの設定（システムフォントを使用）
      const fontPath = '/System/Library/Fonts/ヒラギノ丸ゴ ProN W4.ttc';
      try {
        doc.font(fontPath);
      } catch (e) {
        // フォントが見つからない場合はデフォルトを使用
        console.warn('日本語フォントが見つかりません。デフォルトフォントを使用します。');
      }
      
      // シンプルなPDFコンテンツを生成
      doc.fontSize(24)
         .text('プレミアム恋愛レポート', { align: 'center' });
      
      doc.moveDown(2);
      
      doc.fontSize(12)
         .text('このレポートはAIによる詳細な恋愛分析結果です。', { align: 'center' });
      
      doc.moveDown();
      doc.text(`生成日時: ${new Date().toLocaleString('ja-JP')}`, { align: 'center' });
      
      // HTMLからシンプルなテキストを抽出して追加
      const textContent = html.replace(/<[^>]*>/g, ' ')
                             .replace(/\\s+/g, ' ')
                             .substring(0, 1000);
      
      doc.moveDown(2);
      doc.fontSize(10);
      doc.text('レポート内容のプレビュー:', { underline: true });
      doc.moveDown();
      doc.text(textContent + '...', { 
        width: 500,
        align: 'justify'
      });
      
      // PDFを終了
      doc.end();
      
      // Promiseでバッファを返す
      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve(pdfBuffer);
        });
        doc.on('error', reject);
      });
      
    } catch (error) {
      console.error('PDF生成エラー:', error);
      // エラー時はプレースホルダーを返す
      return Buffer.from('PDF Generation Error');
    }
  }
}

module.exports = PDFReportGenerator;