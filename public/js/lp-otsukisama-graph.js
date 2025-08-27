/**
 * 運勢グラフ生成関連の関数
 */

let fortuneChart = null;
let fortuneGraphData = null;

// 運勢グラフデータを読み込む
async function loadFortuneGraphData() {
    try {
        const response = await fetch('/docs/fortune_graph_all_64_patterns.json');
        const data = await response.json();
        fortuneGraphData = data.patterns;
        console.log('Fortune graph data loaded:', fortuneGraphData.length, 'patterns');
        return true;
    } catch (error) {
        console.error('Failed to load fortune graph data:', error);
        return false;
    }
}

// パターンIDから運勢グラフデータを取得
function getFortuneGraphDataByPatternId(patternId) {
    if (!fortuneGraphData) {
        console.error('Fortune graph data not loaded');
        return null;
    }
    
    // patternIdは0-63の数値
    // fortuneGraphDataのpattern_numberは1-64
    const patternNumber = parseInt(patternId) + 1;
    const data = fortuneGraphData.find(p => p.pattern_number === patternNumber);
    
    if (!data) {
        console.error('Fortune graph data not found for pattern:', patternId);
        return null;
    }
    
    return data;
}

// 運勢グラフを初期化・更新
async function updateFortuneGraph(patternId) {
    const canvas = document.getElementById('fortuneChart');
    if (!canvas) return;
    
    // データが読み込まれていない場合は読み込む
    if (!fortuneGraphData) {
        await loadFortuneGraphData();
    }
    
    const graphData = getFortuneGraphDataByPatternId(patternId);
    if (!graphData) {
        console.error('No graph data for pattern:', patternId);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // 今月から3ヶ月分のデータを取得
    const monthlyData = extractThreeMonthsData(graphData.fortune_data);
    
    // 既存のチャートがあれば破棄
    if (fortuneChart) {
        fortuneChart.destroy();
    }
    
    // Chart.jsの設定
    const config = {
        type: 'line',
        data: {
            labels: monthlyData.labels,
            datasets: [
                {
                    label: '全体運',
                    data: monthlyData.overall,
                    borderColor: 'rgba(255, 215, 0, 1)',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)',
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: '恋愛運',
                    data: monthlyData.love,
                    borderColor: 'rgba(255, 105, 180, 1)',
                    backgroundColor: 'rgba(255, 105, 180, 0.1)',
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: '仕事運',
                    data: monthlyData.career,
                    borderColor: 'rgba(100, 149, 237, 1)',
                    backgroundColor: 'rgba(100, 149, 237, 0.1)',
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: '人間関係',
                    data: monthlyData.relationship,
                    borderColor: 'rgba(50, 205, 50, 1)',
                    backgroundColor: 'rgba(50, 205, 50, 0.1)',
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: '金運',
                    data: monthlyData.money,
                    borderColor: 'rgba(255, 140, 0, 1)',
                    backgroundColor: 'rgba(255, 140, 0, 0.1)',
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        },
                        color: '#666'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#333',
                    bodyColor: '#666',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            // 1-5の値を20-100のパーセンテージに変換して表示
                            const percentage = value * 20;
                            return label + ': ' + percentage + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666',
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    min: 0,
                    max: 6,
                    ticks: {
                        stepSize: 1,
                        color: '#666',
                        font: {
                            size: 12
                        },
                        callback: function(value) {
                            // 1-5の値を運勢レベルとして表示
                            const levels = ['', '凶', '小吉', '中吉', '吉', '大吉', ''];
                            return levels[value] || '';
                        }
                    },
                    grid: {
                        borderDash: [2, 2],
                        color: 'rgba(0, 0, 0, 0.1)'
                    }
                }
            }
        }
    };
    
    // チャートを作成
    fortuneChart = new Chart(ctx, config);
    
    // グラフの特徴を表示
    updateFortuneCharacteristics(graphData);
}

// 3ヶ月分のデータを抽出
function extractThreeMonthsData(fortuneData) {
    const currentMonth = new Date().getMonth();
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    
    // 今月から3ヶ月分のラベルとデータを生成
    const labels = [];
    const overall = [];
    const love = [];
    const career = [];
    const relationship = [];
    const money = [];
    
    for (let i = 0; i < 3; i++) {
        const monthIndex = (currentMonth + i) % 12;
        labels.push(monthNames[monthIndex]);
        
        // 各運勢のデータを取得（1-5の値）
        overall.push(fortuneData.overall[monthIndex]);
        love.push(fortuneData.love[monthIndex]);
        career.push(fortuneData.career[monthIndex]);
        relationship.push(fortuneData.relationship[monthIndex]);
        money.push(fortuneData.money[monthIndex]);
    }
    
    return {
        labels,
        overall,
        love,
        career,
        relationship,
        money
    };
}

// 運勢の特徴を表示
function updateFortuneCharacteristics(graphData) {
    // 運勢の特徴を表示する要素を探す
    const characteristicsElement = document.getElementById('fortune-characteristics');
    if (characteristicsElement) {
        characteristicsElement.textContent = graphData.characteristics;
    }
    
    // ピーク週と注意週を表示
    const peakWeeksElement = document.getElementById('peak-weeks');
    if (peakWeeksElement && graphData.peak_weeks) {
        const weeks = graphData.peak_weeks.map(w => `第${w}週`).join('、');
        peakWeeksElement.textContent = `幸運期: ${weeks}`;
    }
    
    const cautionWeeksElement = document.getElementById('caution-weeks');
    if (cautionWeeksElement && graphData.caution_weeks) {
        const weeks = graphData.caution_weeks.map(w => `第${w}週`).join('、');
        cautionWeeksElement.textContent = `注意期: ${weeks}`;
    }
}

// ページ読み込み時に運勢グラフデータを読み込む
document.addEventListener('DOMContentLoaded', () => {
    loadFortuneGraphData();
});