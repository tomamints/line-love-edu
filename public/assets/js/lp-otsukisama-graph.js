/**
 * 運勢グラフ生成関連の関数
 */

let fortuneChart = null;
let fortuneGraphData = null;

// 運勢グラフデータを読み込む
async function loadFortuneGraphData() {
    try {
        const response = await fetch('/assets/data/fortune_graph_all_64_patterns.json');
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
    
    // 12週間分のデータを取得
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
                    borderColor: 'rgba(147, 112, 219, 1)',
                    backgroundColor: 'rgba(147, 112, 219, 0.2)',
                    tension: 0.4,
                    borderWidth: 4,
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    pointBackgroundColor: 'rgba(147, 112, 219, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
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
                            const value = context.parsed.y;
                            const levels = ['', '充電期', '準備期', '上昇期', '好調期', '絶好調'];
                            return '運勢: ' + levels[value] + ' (' + (value * 20) + '%)';
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
                        color: '#ffd700',  // 日付を黄色に
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
                        color: function(context) {
                            // 縦軸の文字をグラデーション色に
                            const value = context.tick.value;
                            const colors = [
                                '',           // 0
                                '#ff6b6b',    // 1: 充電期 - 赤系
                                '#ff9f43',    // 2: 準備期 - オレンジ系
                                '#ffd700',    // 3: 上昇期 - 黄色
                                '#4ecdc4',    // 4: 好調期 - 青緑系
                                '#48b884',    // 5: 絶好調 - 緑系
                                ''            // 6
                            ];
                            return colors[value] || '#ffd700';
                        },
                        font: {
                            size: 12,
                            weight: 'bold'
                        },
                        callback: function(value) {
                            // 1-5の値を運勢レベルとして表示
                            const levels = ['', '充電期', '準備期', '上昇期', '好調期', '絶好調', ''];
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
    
    // グローバルに運勢データを保存（カレンダーで使用）
    window.currentFortuneData = {
        overall: monthlyData.overall,
        love: monthlyData.love,
        career: monthlyData.career,
        relationship: monthlyData.relationship,
        money: monthlyData.money
    };
}

// 12週間分のデータを抽出
function extractThreeMonthsData(fortuneData) {
    // 12週間分のラベルとデータを生成
    const labels = [];
    const overall = [];
    const love = [];
    const career = [];
    const relationship = [];
    const money = [];
    
    // 現在の日付を起点として12週間分のデータを作成
    const currentDate = new Date();
    const currentWeek = Math.floor(currentDate.getDate() / 7);
    
    for (let i = 0; i < 12; i++) {
        // i週間後の日付を計算
        const futureDate = new Date(currentDate);
        futureDate.setDate(currentDate.getDate() + (i * 7));
        
        // 月と日を取得
        const month = futureDate.getMonth() + 1; // 0-indexedなので+1
        const day = futureDate.getDate();
        
        // ラベルを「M月D日」形式で作成
        labels.push(`${month}月${day}日`);
        
        // 週ごとのデータインデックス（0-11の循環）
        const weekIndex = (currentWeek + i) % 12;
        
        // 各運勢のデータを取得（1-5の値）
        overall.push(fortuneData.overall[weekIndex]);
        // 他の運勢データが存在しない場合は、overallの値を使用
        love.push(fortuneData.love ? fortuneData.love[weekIndex] : fortuneData.overall[weekIndex]);
        career.push(fortuneData.career ? fortuneData.career[weekIndex] : fortuneData.overall[weekIndex]);
        relationship.push(fortuneData.relationship ? fortuneData.relationship[weekIndex] : fortuneData.overall[weekIndex]);
        money.push(fortuneData.money ? fortuneData.money[weekIndex] : fortuneData.overall[weekIndex]);
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