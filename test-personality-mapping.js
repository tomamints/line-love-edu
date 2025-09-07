/**
 * 4つの軸のマッピングをテスト
 */

// マッパーをシミュレート
const PersonalityTypeMapper = {
    emotionalExpression: {
        'straight': 'ストレート告白型',
        'physical': 'スキンシップ型',
        'subtle': 'さりげない気遣い型',
        'shy': '奥手シャイ型'
    },
    distanceStyle: {
        'close': 'ベッタリ依存型',
        'moderate': '安心セーフ型',
        'independent': '自由マイペース型',
        'cautious': '壁あり慎重型'
    },
    loveValues: {
        'romantic': 'ロマンチスト型',
        'realistic': 'リアリスト型',
        'excitement': '刺激ハンター型',
        'growth': '成長パートナー型'
    },
    energyType: {
        'intense': '燃え上がり型',
        'stable': '持続型',
        'fluctuating': '波あり型',
        'cool': 'クール型'
    },
    
    getJapaneseName: function(category, key) {
        if (!this[category] || !key) return key;
        return this[category][key] || key;
    },
    
    getEnglishKey: function(category, name) {
        if (!this[category] || !name) return name;
        
        // すでに英語キーの場合はそのまま返す
        if (['straight', 'physical', 'subtle', 'shy', 'close', 'moderate', 'independent', 'cautious',
              'romantic', 'realistic', 'excitement', 'growth', 'intense', 'stable', 'fluctuating', 'cool'].includes(name)) {
            return name;
        }
        
        // 逆引き
        for (const [key, value] of Object.entries(this[category])) {
            if (value === name) return key;
        }
        return name;
    }
};

// APIから来る可能性のある全パターンをテスト
const testProfiles = [
    // 英語キーのパターン（API v2から）
    {
        name: 'APIからの英語キー',
        emotionalExpression: 'straight',
        distanceStyle: 'close',
        loveValues: 'romantic',
        loveEnergy: 'intense'
    },
    {
        name: 'APIからの英語キー2',
        emotionalExpression: 'physical',
        distanceStyle: 'moderate',
        loveValues: 'realistic',
        loveEnergy: 'stable'
    },
    {
        name: 'APIからの英語キー3',
        emotionalExpression: 'subtle',
        distanceStyle: 'independent',
        loveValues: 'excitement',
        loveEnergy: 'fluctuating'
    },
    {
        name: 'APIからの英語キー4',
        emotionalExpression: 'shy',
        distanceStyle: 'cautious',
        loveValues: 'growth',
        loveEnergy: 'cool'
    }
];

console.log('=== 4つの軸マッピングテスト ===\n');

testProfiles.forEach(profile => {
    console.log(`【${profile.name}】`);
    console.log('入力値:');
    console.log(`  emotionalExpression: ${profile.emotionalExpression}`);
    console.log(`  distanceStyle: ${profile.distanceStyle}`);
    console.log(`  loveValues: ${profile.loveValues}`);
    console.log(`  loveEnergy: ${profile.loveEnergy}`);
    
    console.log('変換結果:');
    
    // 感情表現
    const emotionalJp = PersonalityTypeMapper.getJapaneseName('emotionalExpression', profile.emotionalExpression);
    const emotionalEn = PersonalityTypeMapper.getEnglishKey('emotionalExpression', profile.emotionalExpression);
    console.log(`  感情表現:`);
    console.log(`    日本語名: ${emotionalJp}`);
    console.log(`    画像パス: /images/love-types/emotional/${emotionalEn}.png`);
    
    // 距離感
    const distanceJp = PersonalityTypeMapper.getJapaneseName('distanceStyle', profile.distanceStyle);
    const distanceEn = PersonalityTypeMapper.getEnglishKey('distanceStyle', profile.distanceStyle);
    console.log(`  距離感:`);
    console.log(`    日本語名: ${distanceJp}`);
    console.log(`    画像パス: /images/love-types/distance/${distanceEn}.png`);
    
    // 価値観
    const valuesJp = PersonalityTypeMapper.getJapaneseName('loveValues', profile.loveValues);
    const valuesEn = PersonalityTypeMapper.getEnglishKey('loveValues', profile.loveValues);
    console.log(`  価値観:`);
    console.log(`    日本語名: ${valuesJp}`);
    console.log(`    画像パス: /images/love-types/values/${valuesEn}.png`);
    
    // エネルギー
    const energyJp = PersonalityTypeMapper.getJapaneseName('energyType', profile.loveEnergy);
    const energyEn = PersonalityTypeMapper.getEnglishKey('energyType', profile.loveEnergy);
    console.log(`  エネルギー:`);
    console.log(`    日本語名: ${energyJp}`);
    console.log(`    画像パス: /images/love-types/energy/${energyEn}.png`);
    
    console.log('');
});

// JSONデータの取得もテスト
const json = require('./public/data/personality-axes-descriptions.json');

console.log('=== JSONデータ取得テスト ===\n');

const testTypes = [
    { category: 'emotionalExpression', key: 'ストレート告白型' },
    { category: 'distanceStyle', key: 'ベッタリ依存型' },
    { category: 'loveValues', key: 'ロマンチスト型' },
    { category: 'energyType', key: '燃え上がり型' }
];

testTypes.forEach(test => {
    const data = json[test.category][test.key];
    console.log(`【${test.category} - ${test.key}】`);
    console.log(`  title: ${data.title ? '✅' : '❌'} ${data.title ? data.title.substring(0, 30) + '...' : ''}`);
    console.log(`  description: ${data.description ? '✅' : '❌'} ${data.description ? data.description.substring(0, 50) + '...' : ''}`);
    console.log(`  compatibility: ${data.compatibility ? '✅' : '❌'}`);
    if (data.compatibility) {
        console.log(`    good: ${data.compatibility.good ? '✅' : '❌'}`);
        console.log(`    bad: ${data.compatibility.bad ? '✅' : '❌'}`);
    }
    console.log('');
});