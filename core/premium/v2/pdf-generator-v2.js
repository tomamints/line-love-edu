/**
 * プレミアムレポートV2 PDFジェネレーター
 * 月詠の物語構成に基づいたPDF生成
 */

class PDFGeneratorV2 {
  /**
   * PDFを生成
   * @param {Object} analysisContext - 分析コンテキスト
   * @returns {Buffer} PDFバッファ
   */
  async generatePDF(analysisContext) {
    try {
      const html = this.generateHTML(analysisContext);
      
      // Puppeteerは本番環境で利用不可のため、
      // HTMLをBufferとして返す（ブラウザでPDF保存可能）
      const pdfHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>プレミアムレポート - ${analysisContext.reportContent.page1.userName}</title>
  <style>
    @media print {
      .pdf-controls { display: none !important; }
      .page { page-break-after: always; }
    }
    
    .pdf-controls {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      gap: 10px;
      background: white;
      padding: 10px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .pdf-button {
      padding: 8px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .pdf-button:hover {
      opacity: 0.9;
    }
  </style>
  <script>
    function saveAsPDF() {
      window.print();
    }
    function printReport() {
      window.print();
    }
  </script>
</head>
<body>
  <div class="pdf-controls">
    <button class="pdf-button" onclick="saveAsPDF()">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <line x1="9" y1="15" x2="15" y2="15"></line>
      </svg>
      PDFとして保存
    </button>
    <button class="pdf-button" onclick="printReport()">
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
      
      return Buffer.from(pdfHtml, 'utf8');
      
    } catch (error) {
      console.error('PDF生成エラー:', error);
      // エラー時は基本的なHTMLを返す
      const errorHtml = `<!DOCTYPE html>
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
  
  /**
   * HTMLレポートを生成
   */
  generateHTML(analysisContext) {
    const { reportContent, statistics, scores, aiInsights } = analysisContext;
    
    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>プレミアムレポート - ${reportContent.page1.userName}</title>
  <style>
    ${this.getStyles()}
  </style>
</head>
<body>
  ${this.generateCoverPage(reportContent.page1)}
  ${this.generateIntroPage(reportContent.page2)}
  ${this.generateDailyActivityPage(reportContent.page3)}
  ${this.generateHourlyActivityPage(reportContent.page4)}
  ${this.generateQualityPage(reportContent.page5)}
  ${this.generateOverallScorePage(reportContent.page67)}
  ${this.generateFivePillarsPage(reportContent.page8)}
  ${this.generateActionPlansPage(reportContent.page911)}
  ${this.generateFuturePage(reportContent.page12)}
  ${this.generateClosingPage(reportContent.page13)}
</body>
</html>`;
  }
  
  /**
   * スタイル定義
   */
  getStyles() {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Hiragino Mincho ProN', 'ヒラギノ明朝 ProN', 'Yu Mincho', '游明朝', serif;
        color: #333;
        line-height: 1.8;
        background: #f5f5f5;
      }
      
      .page {
        width: 210mm;
        min-height: 297mm;
        padding: 30mm 25mm;
        margin: 0 auto;
        background: white;
        page-break-after: always;
        position: relative;
      }
      
      .cover-page {
        background: linear-gradient(135deg, #1a0033 0%, #24243e 50%, #667eea 100%);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      }
      
      .cover-title {
        font-size: 36px;
        font-weight: bold;
        margin-bottom: 20px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      
      .cover-subtitle {
        font-size: 18px;
        margin-bottom: 40px;
        opacity: 0.9;
      }
      
      .user-name {
        font-size: 24px;
        margin: 20px 0;
        padding: 20px 40px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 10px;
        background: rgba(255,255,255,0.1);
      }
      
      .page-title {
        font-size: 28px;
        color: #764ba2;
        margin-bottom: 30px;
        text-align: center;
        position: relative;
        padding-bottom: 15px;
      }
      
      .page-title::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
        height: 3px;
        background: linear-gradient(90deg, transparent, #764ba2, transparent);
      }
      
      .content-section {
        margin: 30px 0;
      }
      
      .score-display {
        text-align: center;
        margin: 40px 0;
      }
      
      .score-number {
        font-size: 72px;
        font-weight: bold;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 10px;
      }
      
      .relationship-title {
        font-size: 32px;
        color: #764ba2;
        text-align: center;
        margin: 30px 0;
        font-weight: bold;
      }
      
      .chart-container {
        width: 100%;
        max-width: 500px;
        margin: 30px auto;
      }
      
      .action-card {
        background: linear-gradient(135deg, #f5f3ff, #fff);
        border-radius: 15px;
        padding: 25px;
        margin: 20px 0;
        border-left: 4px solid #764ba2;
      }
      
      .action-title {
        font-size: 20px;
        color: #764ba2;
        margin-bottom: 15px;
        font-weight: bold;
      }
      
      .action-advice {
        font-size: 16px;
        color: #555;
        line-height: 1.8;
      }
      
      .future-indicator {
        display: flex;
        justify-content: space-around;
        margin: 40px 0;
      }
      
      .future-item {
        text-align: center;
        flex: 1;
      }
      
      .future-label {
        font-size: 14px;
        color: #888;
        margin-bottom: 10px;
      }
      
      .future-level {
        font-size: 24px;
        font-weight: bold;
        padding: 10px 20px;
        border-radius: 50px;
      }
      
      .level-high {
        background: #ffe4e1;
        color: #d63384;
      }
      
      .level-medium {
        background: #e6f2ff;
        color: #4a90e2;
      }
      
      .level-low {
        background: #f0f0f0;
        color: #888;
      }
      
      .poetic-text {
        font-size: 18px;
        line-height: 2;
        color: #555;
        text-align: center;
        margin: 30px 0;
        font-style: italic;
      }
      
      .moon-icon {
        font-size: 48px;
        text-align: center;
        margin: 20px 0;
      }
    `;
  }
  
  /**
   * P.1: 表紙
   */
  generateCoverPage(data) {
    return `
    <div class="page cover-page">
      <div class="moon-icon">🌙</div>
      <div class="cover-title">プレミアムレポート</div>
      <div class="cover-subtitle">～月詠が紡ぐ、二人の物語～</div>
      <div class="user-name">${data.userName}</div>
      <div class="user-name">${data.partnerName}</div>
      <div style="margin-top: 40px; font-size: 14px; opacity: 0.8;">
        <div>レポートID: ${data.reportId}</div>
        <div>生成日: ${data.generatedDate}</div>
      </div>
    </div>`;
  }
  
  /**
   * P.2: 序章
   */
  generateIntroPage(data) {
    return `
    <div class="page">
      <h1 class="page-title">${data.title}</h1>
      <div class="poetic-text">
        ${data.body.split('\n').map(line => `<p>${line}</p>`).join('')}
      </div>
      <div class="moon-icon">🌙</div>
    </div>`;
  }
  
  /**
   * P.3: 日別活動
   */
  generateDailyActivityPage(data) {
    return `
    <div class="page">
      <h1 class="page-title">${data.title}</h1>
      <div class="content-section">
        <div class="chart-container">
          <canvas id="dailyChart"></canvas>
        </div>
        <div class="poetic-text">
          <p>最も言葉が輝いた日：${data.peakDate}</p>
          <p>${data.peakComment}</p>
        </div>
      </div>
      <script>
        // グラフ描画用のプレースホルダー
        // 実際の実装では Chart.js を使用
      </script>
    </div>`;
  }
  
  /**
   * P.4: 時間帯別活動
   */
  generateHourlyActivityPage(data) {
    return `
    <div class="page">
      <h1 class="page-title">${data.title}</h1>
      <div class="content-section">
        <div class="chart-container">
          <canvas id="hourlyChart"></canvas>
        </div>
        <div class="poetic-text">
          <p>最も活発な時間：${data.peakHour}時</p>
          <p>全体の${data.peakHourRatio}%の会話がこの時間に</p>
          <p>${data.comment}</p>
        </div>
      </div>
    </div>`;
  }
  
  /**
   * P.5: 会話の質
   */
  generateQualityPage(data) {
    return `
    <div class="page">
      <h1 class="page-title">${data.title}</h1>
      <div class="content-section">
        <div style="display: flex; justify-content: space-around; margin: 40px 0;">
          <div style="text-align: center;">
            <div style="font-size: 48px;">😊</div>
            <div style="font-size: 36px; color: #d63384; font-weight: bold;">${data.positivityRate}%</div>
            <div style="color: #888;">ポジティブ率</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 48px;">✨</div>
            <div style="font-size: 36px; color: #4a90e2; font-weight: bold;">${data.totalEmojis}</div>
            <div style="color: #888;">絵文字の数</div>
          </div>
          <div style="text-align: center;">
            <div style="font-size: 48px;">❓</div>
            <div style="font-size: 36px; color: #764ba2; font-weight: bold;">${data.questionRatio}</div>
            <div style="color: #888;">質問の比率</div>
          </div>
        </div>
        <div class="poetic-text">
          <p>${data.comment}</p>
        </div>
      </div>
    </div>`;
  }
  
  /**
   * P.6-7: 総合診断
   */
  generateOverallScorePage(data) {
    return `
    <div class="page">
      <h1 class="page-title">絆の強さ</h1>
      <div class="score-display">
        <div class="score-number">${data.overallScore}</div>
        <div style="font-size: 24px; color: #764ba2;">/ 100</div>
      </div>
      <div class="relationship-title">${data.relationshipTitle}</div>
      <div class="poetic-text">
        <p>${data.relationshipReason}</p>
        <p style="margin-top: 30px; font-weight: bold;">${data.scoreInterpretation}</p>
      </div>
    </div>`;
  }
  
  /**
   * P.8: 5つの柱
   */
  generateFivePillarsPage(data) {
    const pillars = Object.values(data.fivePillars);
    
    return `
    <div class="page">
      <h1 class="page-title">${data.title}</h1>
      <div class="content-section">
        <div class="chart-container">
          <canvas id="radarChart"></canvas>
        </div>
        <div style="margin-top: 40px;">
          ${pillars.map(pillar => `
            <div style="display: flex; justify-content: space-between; margin: 15px 0; padding: 10px; background: #f8f8f8; border-radius: 10px;">
              <div>
                <strong>${pillar.name}</strong>
                <div style="font-size: 12px; color: #888;">${pillar.description}</div>
              </div>
              <div style="font-size: 24px; color: #764ba2; font-weight: bold;">${pillar.score}</div>
            </div>
          `).join('')}
        </div>
        <div class="poetic-text" style="margin-top: 30px;">
          <p>最も輝いている光：<strong>${data.strongestPillar.name}</strong></p>
          <p>これから磨く宝石：<strong>${data.weakestPillar.name}</strong></p>
        </div>
      </div>
    </div>`;
  }
  
  /**
   * P.9-11: アクションプラン
   */
  generateActionPlansPage(data) {
    return `
    <div class="page">
      <h1 class="page-title">${data.title}</h1>
      <div class="content-section">
        ${data.actionPlans.map((plan, index) => `
          <div class="action-card">
            <div class="action-title">
              ${this.getActionIcon(plan.icon)} ${plan.title}
            </div>
            <div class="action-advice">
              ${plan.advice}
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }
  
  /**
   * P.12: 未来予測
   */
  generateFuturePage(data) {
    return `
    <div class="page">
      <h1 class="page-title">${data.title}</h1>
      <div class="content-section">
        <div class="future-indicator">
          <div class="future-item">
            <div class="future-label">より深い対話</div>
            <div class="future-level level-${data.futureSigns.deepTalk.toLowerCase()}">${data.futureSigns.deepTalk}</div>
          </div>
          <div class="future-item">
            <div class="future-label">新しい体験</div>
            <div class="future-level level-${data.futureSigns.newExperience.toLowerCase()}">${data.futureSigns.newExperience}</div>
          </div>
          <div class="future-item">
            <div class="future-label">小さな試練</div>
            <div class="future-level level-${data.futureSigns.challenge.toLowerCase()}">${data.futureSigns.challenge}</div>
          </div>
        </div>
        <div class="poetic-text">
          <p>${data.comment}</p>
        </div>
      </div>
    </div>`;
  }
  
  /**
   * P.13: 締めくくり
   */
  generateClosingPage(data) {
    return `
    <div class="page">
      <h1 class="page-title">${data.title}</h1>
      <div class="poetic-text">
        ${data.body.split('\n').map(line => `<p>${line}</p>`).join('')}
      </div>
      <div class="moon-icon">🌙</div>
    </div>`;
  }
  
  /**
   * アクションアイコンの取得
   */
  getActionIcon(iconName) {
    const icons = {
      cloudy_moon: '☁️🌙',
      full_moon: '🌕',
      crescent_moon: '🌙',
      new_moon: '🌑',
      star: '⭐'
    };
    return icons[iconName] || '🌙';
  }
}

module.exports = PDFGeneratorV2;