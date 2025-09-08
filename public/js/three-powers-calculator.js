/**
 * 誕生日と月相から3つの力を計算する
 */

// 3つの力のデータを保持
let threePowersData = null;

// データを読み込む（新システムでは固定の3つの力を返す）
async function loadThreePowersData() {
    try {
        // 新システムでは固定の3つの力を使用
        threePowersData = {
            action: {},
            emotion: {},
            thinking: {}
        };
        
        // デフォルトの3つの力を設定
        for (let i = 0; i < 20; i++) {
            threePowersData.action[i] = {
                title: '直感力',
                desc: '第六感が鋭く、見えない危険を察知する能力があります。迷った時は、理屈より直感を信じることで正しい道を選べるでしょう。'
            };
            threePowersData.emotion[i] = {
                title: '創造力',
                desc: '無から有を生み出す力。アイデアが湧き出る泉のような存在で、周りの人に新しい視点を与えることができます。'
            };
            threePowersData.thinking[i] = {
                title: '浄化力',
                desc: 'ネガティブなエネルギーを跳ね返し、周りの空気を清める力。あなたがいるだけで、場の雰囲気が明るくなります。'
            };
        }
        
        console.log('Three powers data initialized with defaults');
        return true;
    } catch (error) {
        console.error('Failed to initialize three powers data:', error);
        return false;
    }
}

/**
 * 月相タイプ番号を取得
 * @param {string} moonPhase - 月相名（新月、三日月など）
 * @returns {number} 月相タイプ番号（1-8）
 */
function getMoonPhaseNumber(moonPhase) {
    const moonPhaseMap = {
        '新月': 1,
        '三日月': 2,
        '上弦の月': 3,
        '十三夜': 4,
        '満月': 5,
        '十六夜': 6,
        '下弦の月': 7,
        '暁': 8
    };
    return moonPhaseMap[moonPhase] || 1;
}

/**
 * 誕生日から3つの力を計算
 * @param {string} birthdate - 誕生日（YYYY-MM-DD形式）
 * @param {string} moonPhase - 表月相
 * @returns {Object} 3つの力のオブジェクト
 */
async function calculateThreePowers(birthdate, moonPhase) {
    // データが読み込まれていない場合は読み込む
    if (!threePowersData) {
        await loadThreePowersData();
    }
    
    if (!threePowersData) {
        console.error('Three powers data not available');
        return null;
    }
    
    // 誕生日をパース
    const [year, month, day] = birthdate.split('-').map(Number);
    
    // 行動系のキー計算
    // (生年YYYY + 誕生日DD + 誕生月MM) % 20
    const actionKey = (year + day + month) % 20;
    
    // 感情系のキー計算
    // 誕生月MM + (表月相タイプ番号 - 1)
    const moonPhaseNumber = getMoonPhaseNumber(moonPhase);
    const emotionKey = (month + (moonPhaseNumber - 1)) % 20;
    
    // 思考系のキー計算
    // 生年YYYY % 20
    const thinkingKey = year % 20;
    
    console.log('Calculated keys:', {
        birthdate,
        moonPhase,
        actionKey,
        emotionKey,
        thinkingKey
    });
    
    // 3つの力を返す
    return {
        action: threePowersData.action[actionKey],
        emotion: threePowersData.emotion[emotionKey],
        thinking: threePowersData.thinking[thinkingKey]
    };
}

/**
 * 3つの力を表示用にフォーマット
 * @param {Object} powers - 3つの力のオブジェクト
 * @param {string} userName - ユーザー名
 * @returns {Array} フォーマット済みの3つの力の配列
 */
function formatThreePowers(powers, userName = 'あなた') {
    if (!powers) return [];
    
    const result = [];
    
    // 行動系の力
    if (powers.action) {
        result.push({
            title: powers.action.title,
            desc: powers.action.desc.replace(/〇〇さん/g, userName === 'あなた' ? 'あなた' : userName + 'さん')
        });
    }
    
    // 感情系の力
    if (powers.emotion) {
        result.push({
            title: powers.emotion.title,
            desc: powers.emotion.desc.replace(/〇〇さん/g, userName === 'あなた' ? 'あなた' : userName + 'さん')
        });
    }
    
    // 思考系の力
    if (powers.thinking) {
        result.push({
            title: powers.thinking.title,
            desc: powers.thinking.desc.replace(/〇〇さん/g, userName === 'あなた' ? 'あなた' : userName + 'さん')
        });
    }
    
    return result;
}

// グローバルに公開
window.ThreePowersCalculator = {
    load: loadThreePowersData,
    calculate: calculateThreePowers,
    format: formatThreePowers
};