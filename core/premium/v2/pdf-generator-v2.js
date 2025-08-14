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
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="format-detection" content="telephone=no">
  <title>プレミアムレポート - ${analysisContext.reportContent.page1.userName}</title>
  <style>
    @media print {
      .pdf-controls { display: none !important; }
      .page { page-break-after: always; }
    }
    
    .pdf-controls {
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: white;
      padding: 10px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    
    @media (min-width: 768px) {
      .pdf-controls {
        flex-direction: row;
        top: 20px;
        right: 20px;
      }
    }
    
    .pdf-button {
      padding: 10px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 120px;
      transition: all 0.3s ease;
      font-weight: 500;
    }
    
    .pdf-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(118, 75, 162, 0.3);
    }
    
    .pdf-button.secondary {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }
    
    .pdf-button svg {
      width: 18px;
      height: 18px;
    }
  </style>
  
  <!-- jsPDF と html2canvas のCDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  
  <!-- カスタムPDF生成スクリプト -->
  <script>
    // インラインでPDF生成機能を実装
    async function generatePDF() {
      try {
        showLoading('PDFを生成中...');
        
        const controls = document.querySelector('.pdf-controls');
        if (controls) controls.style.display = 'none';
        
        const pages = document.querySelectorAll('.page');
        const pdf = new jspdf.jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        for (let i = 0; i < pages.length; i++) {
          const canvas = await html2canvas(pages[i], {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 210;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, 297));
          
          updateProgress(Math.round(((i + 1) / pages.length) * 100));
        }
        
        const fileName = \`恋愛レポート_\${new Date().toISOString().slice(0, 10)}.pdf\`;
        pdf.save(fileName);
        
        if (controls) controls.style.display = '';
        hideLoading();
        showMessage('PDFを保存しました！');
        
      } catch (error) {
        console.error('PDF生成エラー:', error);
        hideLoading();
        alert('PDFの生成に失敗しました。印刷機能をお試しください。');
        window.print();
      }
    }
    
    async function saveAsImage() {
      try {
        showLoading('画像を生成中...');
        
        const controls = document.querySelector('.pdf-controls');
        if (controls) controls.style.display = 'none';
        
        const reportWrapper = document.querySelector('.report-wrapper');
        const canvas = await html2canvas(reportWrapper, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        canvas.toBlob(function(blob) {
          const link = document.createElement('a');
          link.download = \`恋愛レポート_\${new Date().toISOString().slice(0, 10)}.png\`;
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        });
        
        if (controls) controls.style.display = '';
        hideLoading();
        showMessage('画像を保存しました！');
        
      } catch (error) {
        console.error('画像生成エラー:', error);
        hideLoading();
        alert('画像の生成に失敗しました');
      }
    }
    
    
    function showLoading(message = '処理中...') {
      let loadingEl = document.getElementById('pdf-loading');
      if (!loadingEl) {
        loadingEl = document.createElement('div');
        loadingEl.id = 'pdf-loading';
        loadingEl.style.cssText = \`
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          color: white;
          font-size: 16px;
        \`;
        document.body.appendChild(loadingEl);
      }
      
      loadingEl.innerHTML = \`
        <div style="margin-bottom: 20px;">\${message}</div>
        <div style="width: 200px; height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
          <div id="progress-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); transition: width 0.3s;"></div>
        </div>
        <div id="progress-text" style="margin-top: 10px; font-size: 14px;">0%</div>
      \`;
      
      loadingEl.style.display = 'flex';
    }
    
    function updateProgress(percent) {
      const fill = document.getElementById('progress-fill');
      const text = document.getElementById('progress-text');
      if (fill) fill.style.width = percent + '%';
      if (text) text.textContent = percent + '%';
    }
    
    function hideLoading() {
      const loadingEl = document.getElementById('pdf-loading');
      if (loadingEl) loadingEl.style.display = 'none';
    }
    
    function showMessage(text) {
      const messageEl = document.createElement('div');
      messageEl.style.cssText = \`
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 12px 24px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border-radius: 25px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10001;
        font-size: 14px;
      \`;
      messageEl.textContent = text;
      document.body.appendChild(messageEl);
      
      setTimeout(() => {
        messageEl.style.opacity = '0';
        messageEl.style.transition = 'opacity 0.3s';
        setTimeout(() => messageEl.remove(), 300);
      }, 3000);
    }
  </script>
</head>
<body>
  <div class="pdf-controls">
    <button class="pdf-button" onclick="generatePDF()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="12" y1="18" x2="12" y2="12"></line>
        <line x1="9" y1="15" x2="15" y2="15"></line>
      </svg>
      <span>PDF保存</span>
    </button>
    <button class="pdf-button secondary" onclick="saveAsImage()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <polyline points="21 15 16 10 5 21"></polyline>
      </svg>
      <span>画像保存</span>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta name="format-detection" content="telephone=no">
  <title>プレミアムレポート - ${reportContent.page1.userName}</title>
  <style>
    ${this.getStyles()}
  </style>
</head>
<body>
  ${this.generateCoverPage(reportContent.page1)}
  ${this.generateIntroPage(reportContent.page2)}
  ${this.generateDailyActivityPage({ ...reportContent.page3, rawData: { statistics, scores, aiInsights } })}
  ${this.generateHourlyActivityPage({ ...reportContent.page4, rawData: { statistics, scores, aiInsights } })}
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
      
      html {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      
      body {
        font-family: 'Hiragino Mincho ProN', 'ヒラギノ明朝 ProN', 'Yu Mincho', '游明朝', serif;
        color: #333;
        line-height: 1.8;
        background: #f5f5f5;
        margin: 0;
        padding: 0;
      }
      
      .report-wrapper {
        width: 100%;
        max-width: 100%;
        overflow-x: hidden;
      }
      
      .page {
        width: 100%;
        max-width: 600px;
        margin: 0 auto 40px;
        padding: 30px 20px;
        background: white;
        position: relative;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      
      /* プリント用スタイル */
      @media print {
        .page {
          width: 210mm;
          min-height: 297mm;
          padding: 30mm 25mm;
          margin: 0;
          page-break-after: always;
          box-shadow: none;
        }
      }
      
      /* タブレット以上 */
      @media (min-width: 768px) {
        .page {
          padding: 40px 30px;
        }
      }
      
      .cover-page {
        background: linear-gradient(135deg, #1a0033 0%, #24243e 50%, #667eea 100%);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        min-height: 100vh;
        padding: 40px 20px;
      }
      
      .cover-title {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 20px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }
      
      .cover-subtitle {
        font-size: 16px;
        margin-bottom: 30px;
        opacity: 0.9;
      }
      
      .user-name {
        font-size: 20px;
        margin: 20px 0;
        padding: 15px 30px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 10px;
        background: rgba(255,255,255,0.1);
      }
      
      .page-title {
        font-size: 22px;
        color: #764ba2;
        margin-bottom: 25px;
        text-align: center;
        position: relative;
        padding-bottom: 15px;
      }
      
      @media (min-width: 768px) {
        .cover-title {
          font-size: 36px;
        }
        .cover-subtitle {
          font-size: 18px;
        }
        .user-name {
          font-size: 24px;
          padding: 20px 40px;
        }
        .page-title {
          font-size: 28px;
        }
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
        font-size: 56px;
        font-weight: bold;
        background: linear-gradient(135deg, #667eea, #764ba2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 10px;
      }
      
      .relationship-title {
        font-size: 24px;
        color: #764ba2;
        text-align: center;
        margin: 25px 0;
        font-weight: bold;
      }
      
      .chart-container {
        width: 100%;
        max-width: 100%;
        margin: 25px auto;
        overflow-x: auto;
        overflow-y: hidden;
      }
      
      @media (min-width: 768px) {
        .score-number {
          font-size: 72px;
        }
        .relationship-title {
          font-size: 32px;
        }
      }
      
      .action-card {
        background: linear-gradient(135deg, #f5f3ff, #fff);
        border-radius: 15px;
        padding: 20px;
        margin: 15px 0;
        border-left: 4px solid #764ba2;
      }
      
      .action-title {
        font-size: 18px;
        color: #764ba2;
        margin-bottom: 12px;
        font-weight: bold;
      }
      
      .action-advice {
        font-size: 14px;
        color: #555;
        line-height: 1.8;
      }
      
      @media (min-width: 768px) {
        .action-card {
          padding: 25px;
          margin: 20px 0;
        }
        .action-title {
          font-size: 20px;
        }
        .action-advice {
          font-size: 16px;
        }
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
        font-size: 14px;
        line-height: 1.9;
        color: #555;
        text-align: center;
        margin: 20px 0;
        font-style: italic;
      }
      
      .moon-icon {
        font-size: 36px;
        text-align: center;
        margin: 15px 0;
      }
      
      @media (min-width: 768px) {
        .poetic-text {
          font-size: 18px;
          line-height: 2;
          margin: 30px 0;
        }
        .moon-icon {
          font-size: 48px;
          margin: 20px 0;
        }
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
    // 日別データからグラフ用データを生成
    const { statistics } = data.rawData || {};
    const dailyData = statistics?.dailyMessageCounts || [];
    
    // 曜日別の平均メッセージ数を計算
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
    const weekDayValues = weekDays.map(() => 0);
    const weekDayCounts = weekDays.map(() => 0);
    
    // 配列形式のデータを処理
    dailyData.forEach(({ date, count }) => {
      const dayOfWeek = new Date(date).getDay();
      weekDayValues[dayOfWeek] += count;
      weekDayCounts[dayOfWeek]++;
    });
    
    const avgValues = weekDayValues.map((val, i) => 
      weekDayCounts[i] > 0 ? Math.round(val / weekDayCounts[i]) : 0
    );
    const maxValue = Math.max(...avgValues) || 10;
    
    return `
    <div class="page">
      <h1 class="page-title">${data.title}</h1>
      <div class="content-section">
        <div class="chart-container">
          ${this.generateBarChart(weekDays, avgValues, maxValue, '曜日別メッセージ数')}
        </div>
        <div class="poetic-text">
          <p>最も言葉が輝いた日：${data.peakDate}</p>
          <p>${data.peakComment}</p>
        </div>
      </div>
    </div>`;
  }
  
  /**
   * P.4: 時間帯別活動
   */
  generateHourlyActivityPage(data) {
    // 時間帯別データからグラフ用データを生成
    const { statistics } = data.rawData || {};
    const hourlyData = statistics?.hourlyMessageCounts || [];
    
    // 24時間のデータを生成（配列をオブジェクトに変換）
    const hourlyMap = {};
    hourlyData.forEach(({ hour, count }) => {
      hourlyMap[hour] = count;
    });
    
    const hours = Array.from({length: 24}, (_, i) => `${i}時`);
    const values = Array.from({length: 24}, (_, i) => hourlyMap[i] || 0);
    const maxValue = Math.max(...values) || 10;
    
    return `
    <div class="page">
      <h1 class="page-title">${data.title}</h1>
      <div class="content-section">
        <div class="chart-container">
          ${this.generateLineChart(hours, values, maxValue, '時間帯別メッセージ数')}
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
    const labels = pillars.map(p => p.name);
    const values = pillars.map(p => p.score);
    
    return `
    <div class="page">
      <h1 class="page-title">${data.title}</h1>
      <div class="content-section">
        <div class="chart-container" style="text-align: center;">
          ${this.generateRadarChart(labels, values)}
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
  
  /**
   * 棒グラフをSVGで生成
   */
  generateBarChart(labels, values, maxValue, title) {
    const width = 350;
    const height = 250;
    const barWidth = width / labels.length * 0.7;
    const barGap = width / labels.length * 0.3;
    
    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="width: 100%; max-width: 350px; height: auto; display: block; margin: 0 auto;">
      <!-- グラフ背景 -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="#f9f9f9" rx="10"/>
      
      <!-- グリッド線 -->
      ${[0, 25, 50, 75, 100].map(percent => {
        const y = height - (height * percent / 100) - 30;
        return `
          <line x1="40" y1="${y}" x2="${width - 20}" y2="${y}" stroke="#e0e0e0" stroke-dasharray="5,5"/>
          <text x="20" y="${y + 5}" font-size="10" fill="#888">${Math.round(maxValue * percent / 100)}</text>
        `;
      }).join('')}
      
      <!-- 棒グラフ -->
      ${labels.map((label, i) => {
        const x = 50 + i * (barWidth + barGap);
        const barHeight = (values[i] / maxValue) * (height - 60);
        const y = height - barHeight - 30;
        
        return `
          <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
                fill="url(#gradient${i})" rx="5" ry="5"/>
          <text x="${x + barWidth/2}" y="${height - 10}" 
                text-anchor="middle" font-size="12" fill="#666">${label}</text>
          <text x="${x + barWidth/2}" y="${y - 5}" 
                text-anchor="middle" font-size="11" fill="#764ba2" font-weight="bold">${values[i]}</text>
          
          <!-- グラデーション定義 -->
          <defs>
            <linearGradient id="gradient${i}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
            </linearGradient>
          </defs>
        `;
      }).join('')}
      
      <!-- タイトル -->
      <text x="${width/2}" y="20" text-anchor="middle" font-size="14" fill="#333" font-weight="bold">${title}</text>
    </svg>`;
  }
  
  /**
   * 折れ線グラフをSVGで生成
   */
  generateLineChart(labels, values, maxValue, title) {
    const width = 350;
    const height = 250;
    const pointGap = (width - 60) / (labels.length - 1);
    
    // ポイント座標を計算
    const points = values.map((value, i) => ({
      x: 40 + i * pointGap,
      y: height - 30 - ((value / maxValue) * (height - 60))
    }));
    
    // パスを生成
    const pathData = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`
    ).join(' ');
    
    // エリアパスを生成
    const areaPath = pathData + ` L ${points[points.length - 1].x},${height - 30} L ${points[0].x},${height - 30} Z`;
    
    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="width: 100%; max-width: 350px; height: auto; display: block; margin: 0 auto;">
      <!-- グラフ背景 -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="#f9f9f9" rx="10"/>
      
      <!-- グリッド線 -->
      ${[0, 25, 50, 75, 100].map(percent => {
        const y = height - (height * percent / 100) - 30;
        return `
          <line x1="40" y1="${y}" x2="${width - 20}" y2="${y}" stroke="#e0e0e0" stroke-dasharray="5,5"/>
          <text x="20" y="${y + 5}" font-size="10" fill="#888">${Math.round(maxValue * percent / 100)}</text>
        `;
      }).join('')}
      
      <!-- グラデーション定義 -->
      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:0.1" />
        </linearGradient>
      </defs>
      
      <!-- エリア -->
      <path d="${areaPath}" fill="url(#areaGradient)"/>
      
      <!-- 折れ線 -->
      <path d="${pathData}" fill="none" stroke="url(#lineGradient)" stroke-width="3"/>
      
      <!-- グラデーション定義（線用） -->
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- データポイント -->
      ${points.map((p, i) => `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="#764ba2"/>
        <circle cx="${p.x}" cy="${p.y}" r="2" fill="white"/>
        ${i % 3 === 0 ? `<text x="${p.x}" y="${height - 10}" text-anchor="middle" font-size="10" fill="#666">${labels[i]}</text>` : ''}
      `).join('')}
      
      <!-- タイトル -->
      <text x="${width/2}" y="20" text-anchor="middle" font-size="14" fill="#333" font-weight="bold">${title}</text>
    </svg>`;
  }
  
  /**
   * レーダーチャートをSVGで生成
   */
  generateRadarChart(labels, values, maxValue = 100) {
    const width = 320;
    const height = 320;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 110;
    const angleStep = (Math.PI * 2) / labels.length;
    
    // ポイント座標を計算
    const points = values.map((value, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const r = (value / maxValue) * radius;
      return {
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r,
        labelX: centerX + Math.cos(angle) * (radius + 25),
        labelY: centerY + Math.sin(angle) * (radius + 25)
      };
    });
    
    // ポリゴンパスを生成
    const polygonPath = points.map(p => `${p.x},${p.y}`).join(' ');
    
    return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="width: 100%; max-width: 320px; height: auto; display: block; margin: 0 auto;">
      <!-- 背景円 -->
      ${[20, 40, 60, 80, 100].map(percent => {
        const r = radius * percent / 100;
        return `
          <circle cx="${centerX}" cy="${centerY}" r="${r}" 
                  fill="none" stroke="#e0e0e0" stroke-dasharray="5,5"/>
          <text x="${centerX + r + 5}" y="${centerY + 5}" 
                font-size="10" fill="#888">${percent}</text>
        `;
      }).join('')}
      
      <!-- 軸線 -->
      ${labels.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        return `<line x1="${centerX}" y1="${centerY}" x2="${x}" y2="${y}" stroke="#e0e0e0"/>`;
      }).join('')}
      
      <!-- データポリゴン -->
      <polygon points="${polygonPath}" 
               fill="url(#radarGradient)" 
               stroke="#764ba2" 
               stroke-width="2"/>
      
      <!-- グラデーション定義 -->
      <defs>
        <radialGradient id="radarGradient">
          <stop offset="0%" style="stop-color:#764ba2;stop-opacity:0.1" />
          <stop offset="100%" style="stop-color:#667eea;stop-opacity:0.3" />
        </radialGradient>
      </defs>
      
      <!-- データポイント -->
      ${points.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="5" fill="#764ba2"/>
        <circle cx="${p.x}" cy="${p.y}" r="3" fill="white"/>
      `).join('')}
      
      <!-- ラベル -->
      ${labels.map((label, i) => {
        const p = points[i];
        return `
          <text x="${p.labelX}" y="${p.labelY}" 
                text-anchor="middle" 
                font-size="12" 
                fill="#333" 
                font-weight="bold">${label}</text>
        `;
      }).join('')}
    </svg>`;
  }
}

module.exports = PDFGeneratorV2;