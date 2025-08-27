/**
 * 運勢グラフ生成関連の関数
 */

let fortuneChart = null;

// 運勢グラフを初期化・更新
function updateFortuneGraph(patternId) {
    const canvas = document.getElementById('fortuneChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // パターンIDに基づいてデータを生成（実際には仕様書のデータを使用）
    const baseValue = 50 + (patternId % 20) * 2;
    const monthlyData = generateFortuneData(patternId, baseValue);
    
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
                    borderWidth: 3
                },
                {
                    label: '恋愛運',
                    data: monthlyData.love,
                    borderColor: 'rgba(255, 105, 180, 1)',
                    backgroundColor: 'rgba(255, 105, 180, 0.1)',
                    tension: 0.4,
                    borderWidth: 3
                },
                {
                    label: '仕事運',
                    data: monthlyData.work,
                    borderColor: 'rgba(100, 149, 237, 1)',
                    backgroundColor: 'rgba(100, 149, 237, 0.1)',
                    tension: 0.4,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#fff',
                        font: {
                            size: 14
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffd700',
                    bodyColor: '#fff',
                    borderColor: '#ffd700',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#aaa',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#aaa',
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    };
    
    // チャートを作成
    fortuneChart = new Chart(ctx, config);
}

// 運勢データを生成する関数
function generateFortuneData(patternId, baseValue) {
    const currentMonth = new Date().getMonth();
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    
    // 今月から3ヶ月分のラベルを生成
    const labels = [];
    for (let i = 0; i < 3; i++) {
        const monthIndex = (currentMonth + i) % 12;
        labels.push(monthNames[monthIndex]);
    }
    
    // パターンIDに基づいて運勢データを生成
    const seed = patternId + 1;
    
    const overall = [];
    const love = [];
    const work = [];
    
    for (let i = 0; i < 3; i++) {
        // 各月の運勢を計算（パターンに基づく変動）
        const monthSeed = seed * (i + 1);
        
        overall.push(Math.min(100, Math.max(20, baseValue + Math.sin(monthSeed * 0.1) * 30)));
        love.push(Math.min(100, Math.max(20, baseValue + Math.cos(monthSeed * 0.15) * 35)));
        work.push(Math.min(100, Math.max(20, baseValue + Math.sin(monthSeed * 0.2) * 25)));
    }
    
    return {
        labels,
        overall,
        love,
        work
    };
}