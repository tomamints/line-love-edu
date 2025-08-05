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
            font-family: 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN', 'メイリオ', 'Meiryo', sans-serif;
            line-height: 1.7;
            color: #333;
            background: #f5f5f5;
            font-size: 14px;
        }
        
        .report-container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 30px rgba(0,0,0,0.1);
        }
        
        .page {
            padding: 35px 40px;
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
            font-size: 2.2em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #FFD700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
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
            font-size: 1.8em;
            margin-bottom: 25px;
            border-bottom: 2px solid #FFD700;
            padding-bottom: 8px;
            font-weight: 600;
        }
        
        h2 {
            color: #24243e;
            font-size: 1.4em;
            margin: 25px 0 15px 0;
            border-left: 4px solid #E8B4B8;
            padding-left: 12px;
            font-weight: 600;
        }
        
        h3 {
            color: #1a0033;
            font-size: 1.2em;
            margin: 20px 0 12px 0;
            font-weight: 600;
        }
        
        .summary-card {
            background: linear-gradient(135deg, #fafbfc, #f3f4f6);
            border-radius: 12px;
            padding: 20px;
            margin: 15px 0;
            border-left: 4px solid #FFD700;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
            font-size: 2.5em;
            font-weight: bold;
            color: #FFD700;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .score-grade {
            font-size: 1.5em;
            color: #E8B4B8;
            margin-top: 5px;
        }
        
        .compatibility-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        
        .compatibility-item {
            background: #ffffff;
            padding: 15px 18px;
            border-radius: 8px;
            border-left: 4px solid #28a745;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            margin-bottom: 10px;
        }
        
        .compatibility-item.medium {
            border-left-color: #ffc107;
        }
        
        .compatibility-item.low {
            border-left-color: #dc3545;
        }
        
        .action-item {
            background: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 16px 20px;
            margin: 12px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.06);
            transition: box-shadow 0.2s ease;
        }
        
        .action-item:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
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
                background: white !important;
                margin: 0 !important;
            }
            .page {
                page-break-after: always;
            }
            .report-container {
                box-shadow: none !important;
            }
            .score-display, .score-card {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
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
   * HTMLをPDFに変換（シンプルなHTML形式で返す）
   * @param {string} html - HTML文字列
   * @returns {Buffer} HTMLバッファ（PDFとして扱う）
   */
  async convertHTMLToPDF(html) {
    try {
      // HTMLにPDF用のスタイルを追加
      const pdfHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>プレミアム恋愛レポート</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
            .page-break { page-break-after: always; }
        }
        
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: 'Hiragino Kaku Gothic ProN', 'ヒラギノ角ゴ ProN', 'Hiragino Sans', 'メイリオ', sans-serif;
            line-height: 1.8;
            color: #333;
            background: #f5f5f5;
        }
        
        /* PDF保存コントロール - より美しく改良 */
        .pdf-controls {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            gap: 15px;
            background: rgba(255, 255, 255, 0.95);
            padding: 15px;
            border-radius: 30px;
            box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(10px);
        }
        
        .pdf-button {
            background: linear-gradient(135deg, #ff006e, #ff4494);
            color: white;
            border: none;
            padding: 12px 28px;
            border-radius: 25px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(255, 0, 110, 0.3);
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .pdf-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(255, 0, 110, 0.4);
        }
        
        .pdf-button:active {
            transform: translateY(0);
        }
        
        .pdf-button.secondary {
            background: linear-gradient(135deg, #6a11cb, #2575fc);
        }
        
        /* 保存インジケーター */
        .save-indicator {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 18px;
            display: none;
            z-index: 2000;
        }
        
        .report-wrapper {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
        }
        
        /* ヘッダーデザイン */
        .report-header {
            background: linear-gradient(135deg, #1a0033, #24243e);
            color: white;
            padding: 60px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .report-header::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
            animation: rotate 30s linear infinite;
        }
        
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .report-header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .report-header .subtitle {
            font-size: 1.2em;
            opacity: 0.9;
            position: relative;
            z-index: 1;
        }
        
        /* コンテンツエリア */
        .report-content {
            padding: 40px;
        }
        
        /* セクションデザイン */
        .section {
            margin-bottom: 50px;
            padding: 30px;
            background: #fafafa;
            border-radius: 15px;
            border-left: 5px solid #ff006e;
        }
        
        .section h2 {
            color: #1a0033;
            font-size: 1.8em;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section h2::before {
            content: '💖';
            font-size: 1.2em;
        }
        
        /* スコアカード */
        .score-card {
            background: linear-gradient(135deg, #ff006e, #ff4494);
            color: white;
            padding: 30px;
            border-radius: 20px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(255, 0, 110, 0.3);
            margin: 20px 0;
        }
        
        .score-card .score-number {
            font-size: 4em;
            font-weight: bold;
            line-height: 1;
        }
        
        .score-card .score-label {
            font-size: 1.2em;
            opacity: 0.9;
        }
        
        /* プログレスバー */
        .progress-bar {
            background: #e0e0e0;
            height: 20px;
            border-radius: 10px;
            overflow: hidden;
            margin: 20px 0;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #ff006e, #ff4494);
            transition: width 1s ease;
            position: relative;
            overflow: hidden;
        }
        
        .progress-fill::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            animation: shimmer 2s infinite;
        }
        
        @keyframes shimmer {
            from { transform: translateX(-100%); }
            to { transform: translateX(100%); }
        }
        
        /* アドバイスボックス */
        .advice-box {
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
            margin: 20px 0;
            border-left: 4px solid #ff006e;
        }
        
        .advice-box h3 {
            color: #ff006e;
            margin-bottom: 10px;
        }
        
        /* リスト装飾 */
        ul {
            list-style: none;
            padding-left: 0;
        }
        
        ul li {
            position: relative;
            padding-left: 30px;
            margin-bottom: 15px;
        }
        
        ul li::before {
            content: '✨';
            position: absolute;
            left: 0;
            top: 0;
        }
        
        /* テーブルデザイン */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        }
        
        th, td {
            padding: 15px;
            text-align: left;
        }
        
        th {
            background: #1a0033;
            color: white;
            font-weight: bold;
        }
        
        tr:nth-child(even) {
            background: #f9f9f9;
        }
        
        /* フッター */
        .report-footer {
            background: #1a0033;
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .report-footer p {
            opacity: 0.8;
            margin-bottom: 10px;
        }
        
        @page {
            size: A4;
            margin: 20mm;
        }
    </style>
    <script>
        function savePDF() {
            // 保存インジケーターを表示
            showSaveIndicator('PDFを生成中...');
            
            // ファイル名を生成
            const today = new Date();
            const dateStr = today.toLocaleDateString('ja-JP').replace(/\\/\\//g, '-');
            const fileName = \`恋愛レポート_\${dateStr}.pdf\`;
            
            // 印刷ダイアログを表示
            setTimeout(() => {
                window.print();
                hideSaveIndicator();
                
                // 保存後のメッセージ
                setTimeout(() => {
                    showSaveIndicator('PDFの保存設定が開きました', 2000);
                }, 500);
            }, 500);
        }
        
        function printReport() {
            showSaveIndicator('印刷設定を開いています...');
            setTimeout(() => {
                window.print();
                hideSaveIndicator();
            }, 500);
        }
        
        function showSaveIndicator(message, duration) {
            const indicator = document.getElementById('saveIndicator');
            if (!indicator) {
                const div = document.createElement('div');
                div.id = 'saveIndicator';
                div.className = 'save-indicator';
                document.body.appendChild(div);
            }
            
            const indicatorEl = document.getElementById('saveIndicator');
            indicatorEl.textContent = message;
            indicatorEl.style.display = 'block';
            
            if (duration) {
                setTimeout(() => {
                    hideSaveIndicator();
                }, duration);
            }
        }
        
        function hideSaveIndicator() {
            const indicator = document.getElementById('saveIndicator');
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
        
        // ページ読み込み時の処理
        window.onload = function() {
            // プログレスバーアニメーション
            const progressBars = document.querySelectorAll('.progress-fill');
            progressBars.forEach(bar => {
                const width = bar.getAttribute('data-width');
                setTimeout(() => {
                    bar.style.width = width + '%';
                }, 100);
            });
            
            // 初回表示時のヒント
            setTimeout(() => {
                showSaveIndicator('右上のボタンからPDFを保存できます', 3000);
            }, 1000);
        }
        
        // 印刷時の設定をサポート
        window.addEventListener('beforeprint', function() {
            document.body.classList.add('printing');
        });
        
        window.addEventListener('afterprint', function() {
            document.body.classList.remove('printing');
        });
    </script>
</head>
<body>
    <div class="pdf-controls no-print">
        <button class="pdf-button" onclick="savePDF()" title="このレポートをPDFファイルとして保存します">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            PDFとして保存
        </button>
        <button class="pdf-button secondary" onclick="printReport()" title="このレポートを印刷します">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            印刷
        </button>
    </div>
    
    <div class="report-wrapper">
${html}
    </div>
</body>
</html>`;
      
      // HTMLをBufferとして返す（ブラウザでPDFとして保存可能）
      return Buffer.from(pdfHtml, 'utf8');
      
    } catch (error) {
      console.error('PDF生成エラー:', error);
      // エラー時は基本的なHTMLを返す
      const errorHtml = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>エラー</title>
</head>
<body>
    <h1>レポート生成エラー</h1>
    <p>申し訳ございません。レポートの生成中にエラーが発生しました。</p>
</body>
</html>`;
      return Buffer.from(errorHtml, 'utf8');
    }
  }
}

module.exports = PDFReportGenerator;