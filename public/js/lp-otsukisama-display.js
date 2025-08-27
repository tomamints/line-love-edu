// Display-related functions for LP Otsukisama page

// 月相パターンに応じてコンテンツを更新
function updateMoonPhaseContent(patternId) {
    if (typeof OtsukisamaPatterns === 'undefined' || !OtsukisamaPatterns[patternId]) {
        console.log('Pattern data not found for ID:', patternId);
        return;
    }
    
    const pattern = OtsukisamaPatterns[patternId];
    
    // 表月相の更新
    const moonPhaseCard = document.querySelector('.moon-phase-card.new-moon');
    if (moonPhaseCard) {
        const moonPhaseImg = moonPhaseCard.querySelector('.moon-phase-visual');
        const moonPhaseTitle = moonPhaseCard.querySelector('.moon-phase-info h2');
        const moonPhaseSubtitle = moonPhaseCard.querySelector('.moon-phase-subtitle');
        
        // 月相に応じた画像を設定
        const phaseImages = {
            '新月': '/images/moon/omote-0.png',
            '三日月': '/images/moon/omote-1.png',
            '上弦': '/images/moon/omote-2.png',
            '十三夜': '/images/moon/omote-3.png',
            '満月': '/images/moon/omote-4.png',
            '十六夜': '/images/moon/omote-5.png',
            '下弦': '/images/moon/omote-6.png',
            '暁': '/images/moon/omote-7.png'
        };
        
        if (moonPhaseImg && phaseImages[pattern.moonPhase]) {
            moonPhaseImg.src = phaseImages[pattern.moonPhase];
            moonPhaseImg.alt = pattern.moonPhase;
        }
        
        if (moonPhaseTitle) {
            moonPhaseTitle.textContent = pattern.moonPhase;
        }
        
        // 月相ごとのサブタイトルを設定
        if (moonPhaseSubtitle) {
            if (window.moonPhaseData && window.moonPhaseData[pattern.moonPhase]) {
                moonPhaseSubtitle.textContent = window.moonPhaseData[pattern.moonPhase].subtitle;
            } else {
                // フォールバック
                const phaseSubtitles = {
                    '新月': '新しい始まりの力。無限の可能性を秘めた開拓者',
                    '三日月': '成長のエネルギー。小さな芽を大きく育てる育成者',
                    '上弦': '挑戦のエネルギー。困難を乗り越える戦士',
                    '十三夜': '美と調和の力。バランスを保つ調整者',
                    '満月': '完成のエネルギー。すべてを照らす完全体',
                    '十六夜': '内省のエネルギー。真実を見つめる賢者',
                    '下弦': '手放しの力。不要なものを削ぎ落とす浄化者',
                    '暁': '準備のエネルギー。次なる始まりへの準備者'
                };
                if (phaseSubtitles[pattern.moonPhase]) {
                    moonPhaseSubtitle.textContent = phaseSubtitles[pattern.moonPhase];
                }
            }
        }
        
        // 表月相の説明文を更新
        const moonPhaseDesc = document.getElementById('moon-phase-description');
        if (moonPhaseDesc) {
            // JSONデータから説明文を取得
            if (window.moonPhaseData && window.moonPhaseData[pattern.moonPhase]) {
                moonPhaseDesc.textContent = window.moonPhaseData[pattern.moonPhase].description;
            } else {
                // フォールバック（JSONが読み込めなかった場合）
                const phaseDescriptions = {
                    '新月': 'あなたは新月の日に生まれた、始まりのエネルギーを持つ人。何もないところから何かを生み出す力があり、ゼロから1を作り出すことに長けています。純粋で素直な心を持ち、新しいことへの好奇心が旺盛。まだ誰も踏み入れていない道を進むパイオニア精神があります。時に無鉄砲に見えることもありますが、その勇気こそがあなたの最大の武器なのです。',
                    '三日月': 'あなたは成長のエネルギーを持つ三日月生まれ。小さな芽を大きく育てる力に優れ、物事を少しずつ、確実に成長させていくことができます。慎重でありながら着実に前進し、困難も成長の糧に変える力があります。繊細な感受性を持ち、相手の気持ちを察することが得意です。',
                    '上弦': 'あなたは挑戦のエネルギーを持つ上弦の月生まれ。困難に立ち向かう勇気と、それを乗り越える力を持っています。決断力に優れ、迷うことなく前進できる強さがあります。バランス感覚も優れており、理想と現実の間で最適な選択ができます。',
                    '十三夜': 'あなたは美と調和の力を持つ十三夜生まれ。完成に向かう美しいエネルギーを持ち、物事を美しく仕上げる才能があります。周囲との調和を大切にし、皆が心地よく過ごせる環境を作ることができます。成熟した魅力で人々を惹きつけます。',
                    '満月': 'あなたは完成のエネルギーを持つ満月生まれ。すべてを照らす圧倒的な存在感を持ち、周囲に大きな影響を与えます。情熱的で表現力豊か、あなたがいるだけで場が華やぎます。完全性を求める性質があり、何事も完璧を目指します。',
                    '十六夜': 'あなたは内省のエネルギーを持つ十六夜生まれ。満月の後の落ち着きを持ち、物事を深く見つめる力があります。余裕と品格を持ち、慌てることなく自分のペースで進めます。内面の豊かさと深い洞察力が魅力です。',
                    '下弦': 'あなたは手放しの力を持つ下弦の月生まれ。不要なものを削ぎ落とし、本質だけを残す力があります。整理整頓が得意で、効率的に物事を進められます。終わりから新しい始まりを見つけ出す、再生の力も持っています。',
                    '暁': 'あなたは準備のエネルギーを持つ暁生まれ。次なる始まりに向けて準備を整える力があります。深い洞察力と神秘的な魅力を持ち、見えない世界との繋がりを感じることができます。静寂の中で大きな力を蓄えています。'
                };
                
                if (phaseDescriptions[pattern.moonPhase]) {
                    moonPhaseDesc.textContent = phaseDescriptions[pattern.moonPhase];
                }
            }
        }
    }
    
    // 裏月相の更新
    const hiddenPhaseCard = document.querySelector('.moon-phase-card.crescent');
    if (hiddenPhaseCard) {
        const hiddenPhaseImg = hiddenPhaseCard.querySelector('.moon-phase-visual');
        const hiddenPhaseTitle = hiddenPhaseCard.querySelector('.moon-phase-info h2');
        const hiddenPhaseSubtitle = hiddenPhaseCard.querySelector('.moon-phase-subtitle');
        
        // 裏月相に応じた画像を設定
        const hiddenPhaseImages = {
            '新月': '/images/moon/ura-0.png',
            '三日月': '/images/moon/ura-1.png',
            '上弦': '/images/moon/ura-2.png',
            '十三夜': '/images/moon/ura-3.png',
            '満月': '/images/moon/ura-4.png',
            '十六夜': '/images/moon/ura-5.png',
            '下弦': '/images/moon/ura-6.png',
            '暁': '/images/moon/ura-7.png'
        };
        
        if (hiddenPhaseImg && hiddenPhaseImages[pattern.hiddenPhase]) {
            hiddenPhaseImg.src = hiddenPhaseImages[pattern.hiddenPhase];
            hiddenPhaseImg.alt = pattern.hiddenPhase;
        }
        
        if (hiddenPhaseTitle) {
            hiddenPhaseTitle.textContent = pattern.hiddenPhase + '（裏の顔）';
        }
        
        // 裏月相のサブタイトル
        if (hiddenPhaseSubtitle) {
            if (window.hiddenPhaseData && window.hiddenPhaseData[pattern.hiddenPhase]) {
                hiddenPhaseSubtitle.textContent = window.hiddenPhaseData[pattern.hiddenPhase].subtitle;
            } else {
                // フォールバック
                const hiddenPhaseSubtitles = {
                    '新月': '内なる静寂と無限の可能性',
                    '三日月': '内なる繊細さと慎重さを秘めた策士',
                    '上弦': '内なる勇気と決断力',
                    '十三夜': '内なる美意識と芸術性',
                    '満月': '内なる感情の豊かさ',
                    '十六夜': '内なる知恵と洞察力',
                    '下弦': '内なる浄化と解放の力',
                    '暁': '内なる静寂と準備の時'
                };
                if (hiddenPhaseSubtitles[pattern.hiddenPhase]) {
                    hiddenPhaseSubtitle.textContent = hiddenPhaseSubtitles[pattern.hiddenPhase];
                }
            }
        }
        
        // 裏月相の説明文を更新
        const hiddenPhaseDesc = document.getElementById('hidden-phase-description');
        if (hiddenPhaseDesc) {
            // JSONデータから説明文を取得
            if (window.hiddenPhaseData && window.hiddenPhaseData[pattern.hiddenPhase]) {
                hiddenPhaseDesc.textContent = window.hiddenPhaseData[pattern.hiddenPhase].description;
            } else {
                // フォールバック（JSONが読み込めなかった場合）
                const hiddenDescriptions = {
                    '新月': '表向きは始まりのエネルギーに満ちていますが、内面では静寂と無限の可能性を秘めています。時に孤独を感じることもありますが、それはあなたが新しい道を切り開く先駆者だから。内なる声に耳を傾けることで、真の方向性が見えてきます。',
                    '三日月': '表向きは勢いよく突き進むあなたですが、実は内面では細やかな配慮ができる繊細な人。新しいことを始める前に、実はしっかりと下調べをしていたり、リスクを計算していたりするでしょう。その慎重さと大胆さのバランスが、あなたの成功の秘訣。',
                    '上弦': '表面的には穏やかに見えても、内には強い決断力と勇気を秘めています。困難に直面した時、誰よりも冷静に状況を判断し、最適な選択をすることができます。内なる戦士の魂が、あなたを勝利へと導きます。',
                    '十三夜': '外見は普通でも、内面には深い美意識と芸術性を持っています。日常の中に美を見出し、それを大切にする繊細な心。人には見せない創造的な一面が、あなたの隠れた才能です。',
                    '満月': '表では明るく振る舞いながら、内面では深い感情の波を感じています。喜怒哀楽が人一倍豊かで、その感情の深さがあなたの人間性を豊かにしています。時に感情に振り回されることもありますが、それもまた魅力の一つです。',
                    '十六夜': '表面的には活動的でも、内面では深い内省と洞察を行っています。物事の本質を見抜く力があり、表面的なものに惑わされることがありません。その知恵と洞察力が、あなたを真の成功へと導きます。',
                    '下弦': '外では社交的でも、内面では不要なものを削ぎ落とし、本質だけを大切にしています。人間関係も選別的で、本当に大切な人だけを心に留めます。その選択眼が、質の高い人生を作り出します。',
                    '暁': '表向きは普通に見えても、内面では深い神秘性と直感力を持っています。見えない世界との繋がりを感じ、スピリチュアルな体験を大切にします。その神秘的な力が、あなたに特別な導きを与えます。'
                };
                
                if (hiddenDescriptions[pattern.hiddenPhase]) {
                    hiddenPhaseDesc.textContent = hiddenDescriptions[pattern.hiddenPhase];
                }
            }
        }
    }
    
    // 3つの月の力を更新
    if (pattern.threePowers && pattern.threePowers.length === 3) {
        const powerItems = document.querySelectorAll('.three-powers .energy-item');
        powerItems.forEach((item, index) => {
            if (pattern.threePowers[index]) {
                const titleEl = item.querySelector('.energy-title');
                const descEl = item.querySelector('.energy-description');
                if (titleEl) titleEl.textContent = pattern.threePowers[index].title;
                if (descEl) descEl.textContent = pattern.threePowers[index].desc;
            }
        });
    }
    
    // 運勢テキストの更新
    if (pattern.fortune) {
        // 全体運
        const overallText = document.getElementById('fortune-overall-text');
        if (overallText && pattern.fortune.overall) {
            overallText.textContent = pattern.fortune.overall;
        }
        
        // 恋愛運
        const loveText = document.getElementById('fortune-love-text');
        if (loveText && pattern.fortune.love) {
            loveText.textContent = pattern.fortune.love;
        }
        
        // 仕事運
        const workText = document.getElementById('fortune-work-text');
        if (workText && pattern.fortune.work) {
            workText.textContent = pattern.fortune.work;
        }
        
        // 人間関係運
        const relationshipText = document.getElementById('fortune-relationship-text');
        if (relationshipText && pattern.fortune.relationship) {
            relationshipText.textContent = pattern.fortune.relationship;
        }
        
        // 金運
        const moneyText = document.getElementById('fortune-money-text');
        if (moneyText && pattern.fortune.money) {
            moneyText.textContent = pattern.fortune.money;
        }
    }
    
    console.log('Moon phase content updated for pattern:', patternId);
}

// 6つの円形要素を更新する関数
function updateSixElements(patternId) {
    // パターンからデータを取得
    if (!OtsukisamaPatterns || !OtsukisamaPatterns[patternId]) {
        console.error('Pattern not found for updateSixElements:', patternId);
        return;
    }
    
    const pattern = OtsukisamaPatterns[patternId];
    
    // 月相要素を更新（画像とテキスト）
    const moonPhaseElement = document.querySelector('.type-item[data-moon-type="omote"]');
    const hiddenPhaseElement = document.querySelector('.type-item[data-moon-type="ura"]');
    
    if (moonPhaseElement) {
        // 月相の画像を更新
        const moonImg = moonPhaseElement.querySelector('img');
        const moonLabel = moonPhaseElement.querySelectorAll('span')[1]; // bottom label
        const phaseImages = {
            '新月': '/images/moon/omote-0.png',
            '三日月': '/images/moon/omote-1.png',
            '上弦': '/images/moon/omote-2.png',
            '十三夜': '/images/moon/omote-3.png',
            '満月': '/images/moon/omote-4.png',
            '十六夜': '/images/moon/omote-5.png',
            '下弦': '/images/moon/omote-6.png',
            '暁': '/images/moon/omote-7.png'
        };
        if (moonImg && phaseImages[pattern.moonPhase]) {
            moonImg.src = phaseImages[pattern.moonPhase];
            moonImg.alt = pattern.moonPhase;
        }
        if (moonLabel) {
            moonLabel.textContent = pattern.moonPhase;
        }
    }
    
    if (hiddenPhaseElement) {
        // 裏月相の画像を更新
        const hiddenImg = hiddenPhaseElement.querySelector('img');
        const hiddenLabel = hiddenPhaseElement.querySelectorAll('span')[1]; // bottom label
        const hiddenImages = {
            '新月': '/images/moon/ura-0.png',
            '三日月': '/images/moon/ura-1.png',
            '上弦': '/images/moon/ura-2.png',
            '十三夜': '/images/moon/ura-3.png',
            '満月': '/images/moon/ura-4.png',
            '十六夜': '/images/moon/ura-5.png',
            '下弦': '/images/moon/ura-6.png',
            '暁': '/images/moon/ura-7.png'
        };
        if (hiddenImg && hiddenImages[pattern.hiddenPhase]) {
            hiddenImg.src = hiddenImages[pattern.hiddenPhase];
            hiddenImg.alt = pattern.hiddenPhase;
        }
        if (hiddenLabel) {
            hiddenLabel.textContent = pattern.hiddenPhase;
        }
    }
    
    // LINE APIから取得した4軸データがあれば使用、なければデフォルト
    const userProfile = localStorage.getItem('userPersonalityData');
    if (userProfile) {
        const profile = JSON.parse(userProfile);
        
        const emotionalElement = document.querySelector('.type-item[data-type="emotional"]');
        const distanceElement = document.querySelector('.type-item[data-type="distance"]');
        const valuesElement = document.querySelector('.type-item[data-type="values"]');
        const energyElement = document.querySelector('.type-item[data-type="energy"]');
        
        if (emotionalElement && profile.emotionalExpression) {
            const label = emotionalElement.querySelectorAll('span')[1];
            if (label) {
                label.textContent = profile.emotionalExpression.replace('タイプ', '').replace('派', '');
            }
        }
        if (distanceElement && profile.distanceStyle) {
            const label = distanceElement.querySelectorAll('span')[1];
            if (label) {
                label.textContent = profile.distanceStyle.replace('距離感', '').replace('型', '');
            }
        }
        if (valuesElement && profile.loveValues) {
            const label = valuesElement.querySelectorAll('span')[1];
            if (label) {
                label.textContent = profile.loveValues;
            }
        }
        if (energyElement && profile.loveEnergy) {
            const label = energyElement.querySelectorAll('span')[1];
            if (label) {
                label.textContent = profile.loveEnergy.replace('派', '').replace('型', '');
            }
        }
    } else {
        // デフォルト値（パターンIDから算出）
        // 実際の画像ファイル名に対応
        const emotionalTypes = [
            {name: 'ストレート型', image: 'straight'},
            {name: '察してほしい型', image: 'subtle'},
            {name: 'スキンシップ型', image: 'physical'},
            {name: '照れ屋型', image: 'shy'}
        ];
        const distanceTypes = [
            {name: '密着型', image: 'close'},
            {name: 'ちょうどいい距離型', image: 'moderate'},
            {name: '慎重型', image: 'cautious'},
            {name: '自由マイペース型', image: 'independent'}
        ];
        const valueTypes = [
            {name: 'ロマンチスト型', image: 'romantic'},
            {name: '成長重視型', image: 'growth'},
            {name: 'リアリスト型', image: 'realistic'},
            {name: 'ドキドキ大好き型', image: 'excitement'}
        ];
        const energyTypes = [
            {name: '燃え上がり型', image: 'intense'},
            {name: '安定ロングラン型', image: 'stable'},
            {name: '気分アップダウン型', image: 'fluctuating'},
            {name: 'クール型', image: 'cool'}
        ];
        
        const emotionalElement = document.querySelector('.type-item[data-type="emotional"]');
        const distanceElement = document.querySelector('.type-item[data-type="distance"]');
        const valuesElement = document.querySelector('.type-item[data-type="values"]');
        const energyElement = document.querySelector('.type-item[data-type="energy"]');
        
        if (emotionalElement) {
            const idx = Math.floor(patternId / 16) % 4;
            const selected = emotionalTypes[idx];
            const label = emotionalElement.querySelectorAll('span')[1];
            const img = emotionalElement.querySelector('img');
            if (label) {
                label.textContent = selected.name;
            }
            if (img) {
                img.src = `/images/love-types/emotional/${selected.image}.png`;
                img.alt = selected.name;
            }
        }
        if (distanceElement) {
            const idx = Math.floor(patternId / 8) % 4;
            const selected = distanceTypes[idx];
            const label = distanceElement.querySelectorAll('span')[1];
            const img = distanceElement.querySelector('img');
            if (label) {
                label.textContent = selected.name;
            }
            if (img) {
                img.src = `/images/love-types/distance/${selected.image}.png`;
                img.alt = selected.name;
            }
        }
        if (valuesElement) {
            const idx = Math.floor(patternId / 4) % 4;
            const selected = valueTypes[idx];
            const label = valuesElement.querySelectorAll('span')[1];
            const img = valuesElement.querySelector('img');
            if (label) {
                label.textContent = selected.name;
            }
            if (img) {
                img.src = `/images/love-types/values/${selected.image}.png`;
                img.alt = selected.name;
            }
        }
        if (energyElement) {
            const idx = patternId % 4;
            const selected = energyTypes[idx];
            const label = energyElement.querySelectorAll('span')[1];
            const img = energyElement.querySelector('img');
            if (label) {
                label.textContent = selected.name;
            }
            if (img) {
                img.src = `/images/love-types/energy/${selected.image}.png`;
                img.alt = selected.name;
            }
        }
    }
    
    console.log('Updated 6 elements for pattern:', patternId, pattern.pattern);
}

// 恋愛タイプの表示を更新
function updatePersonalityDisplay(profile) {
    if (profile.emotionalExpression) {
        document.getElementById('emotionalExpressionType').textContent = profile.emotionalExpression;
        updateEmotionalExpressionContent(profile.emotionalExpression);
    }
    if (profile.distanceStyle) {
        document.getElementById('distanceStyleType').textContent = profile.distanceStyle;
        updateDistanceStyleContent(profile.distanceStyle);
    }
    if (profile.loveValues) {
        document.getElementById('loveValuesType').textContent = profile.loveValues;
        updateLoveValuesContent(profile.loveValues);
    }
    if (profile.loveEnergy) {
        document.getElementById('loveEnergyType').textContent = profile.loveEnergy;
        updateLoveEnergyContent(profile.loveEnergy);
    }
}

// プロフィールがない場合のメッセージを表示
function displayNoProfileMessage() {
    // 4軸セクションに案内メッセージを表示
    const loveTypeCards = document.querySelectorAll('.love-type-card');
    if (loveTypeCards.length > 0) {
        // 最初のカードに案内メッセージを挿入
        const messageCard = document.createElement('div');
        messageCard.className = 'no-profile-message';
        messageCard.innerHTML = `
            <div style="background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,100,100,0.1)); 
                        border: 2px dashed #ffd700; 
                        border-radius: 15px; 
                        padding: 30px; 
                        margin-bottom: 30px;
                        text-align: center;">
                <h3 style="color: #ffd700; margin-bottom: 15px;">
                    💫 4つの恋愛タイプ診断を表示するには
                </h3>
                <p style="color: #fff; line-height: 1.8; margin-bottom: 20px;">
                    この部分は、LINEで事前に恋愛タイプ診断を受けていただいた方に<br>
                    パーソナライズされた結果を表示しています。
                </p>
                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p style="color: #87ceeb; font-size: 14px; margin-bottom: 10px;">
                        📱 LINEで診断を受けるには：
                    </p>
                    <ol style="text-align: left; color: #ccc; line-height: 1.8; margin: 0 auto; max-width: 400px;">
                        <li>LINE公式アカウントを友だち追加</li>
                        <li>「恋愛タイプ診断」メニューを選択</li>
                        <li>4つの質問に回答</li>
                        <li>診断完了後、個人用URLが発行されます</li>
                    </ol>
                </div>
                <p style="color: #ffd700; font-size: 12px;">
                    ※ 現在は月相診断のみお楽しみいただけます
                </p>
            </div>
        `;
        
        // love-type-gridの前に挿入
        const loveTypeGrid = document.querySelector('.love-type-grid');
        if (loveTypeGrid && loveTypeGrid.parentNode) {
            loveTypeGrid.parentNode.insertBefore(messageCard, loveTypeGrid);
        }
    }
    
    // 総合診断セクションにもメッセージを表示
    const combinedSection = document.getElementById('combinedPersonality');
    if (combinedSection) {
        combinedSection.innerHTML = `
            <div class="combined-personality-card" style="background: rgba(100,100,100,0.2); border-style: dashed;">
                <h3 class="combined-title">🔒 総合恋愛タイプ診断</h3>
                <p style="text-align: center; color: #ccc;">
                    LINEで4つの質問に回答すると、<br>
                    あなただけの256通りの組み合わせから<br>
                    総合恋愛タイプが判定されます
                </p>
            </div>
        `;
    }
}

// 組み合わせ診断文を表示
function displayCombinedPersonality(profile) {
    if (!window.PersonalityCombinations) {
        console.error('PersonalityCombinations not loaded');
        return;
    }
    
    // 組み合わせ診断文を生成
    const combined = PersonalityCombinations.generateCombinedText(
        profile.emotionalExpression,
        profile.distanceStyle,
        profile.loveValues,
        profile.loveEnergy
    );
    
    // 組み合わせ診断セクションを追加または更新
    const combinedSection = document.getElementById('combinedPersonality');
    if (combinedSection) {
        combinedSection.innerHTML = `
            <div class="combined-personality-card">
                <h3 class="combined-title">🌟 あなたの総合恋愛タイプ: ${combined.title}</h3>
                <p class="combined-description">${combined.description}</p>
                <div class="combined-advice">
                    <h4>💝 アドバイス</h4>
                    <p>${combined.advice}</p>
                </div>
            </div>
        `;
    }
    
    // 相性の良いタイプも表示
    const compatibleTypes = PersonalityCombinations.getCompatibleTypes(
        profile.emotionalExpression,
        profile.distanceStyle,
        profile.loveValues,
        profile.loveEnergy
    );
    
    if (compatibleTypes.length > 0) {
        const compatibleSection = document.getElementById('compatibleTypes');
        if (compatibleSection) {
            compatibleSection.innerHTML = `
                <div class="compatible-types-card">
                    <h4>相性の良いタイプ</h4>
                    <ul>
                        ${compatibleTypes.map(type => `<li>${type}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
    }
}

async function updateDynamicContent(userData) {
    const { name, moonPhase, hiddenMoonPhase, patternId } = userData;
    
    // 6つの円形要素も更新
    if (typeof updateSixElements === 'function') {
        updateSixElements(patternId);
    }
    
    // ユーザー名を複数箇所に表示
    const nameElements = ['resultName', 'resultName2', 'resultName3'];
    nameElements.forEach(id => {
        const elem = document.getElementById(id);
        if (elem) elem.textContent = name;
    });
    
    // 月相情報を表示
    const moonDisplay = document.getElementById('userMoonPhase');
    if (moonDisplay) {
        moonDisplay.innerHTML = `
            <div class="moon-phase-display" style="text-align: center; margin: 30px 0;">
                <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
                    <div class="phase-item">
                        <h3 style="color: #ffd700; margin-bottom: 10px;">あなたの月相</h3>
                        <p style="font-size: 28px; color: #fff; font-weight: bold;">${moonPhase}</p>
                    </div>
                    <div class="phase-item">
                        <h3 style="color: #ffd700; margin-bottom: 10px;">隠れ月相（裏の顔）</h3>
                        <p style="font-size: 28px; color: #fff; font-weight: bold;">${hiddenMoonPhase}</p>
                    </div>
                </div>
                <div style="margin-top: 20px; color: #aaa;">
                    <p>パターン ${patternId + 1}/64</p>
                    <p style="color: #ffd700; font-size: 20px; margin-top: 10px;">${moonPhase}×${hiddenMoonPhase}</p>
                </div>
            </div>
        `;
    }
    
    // 運勢グラフを更新
    await loadFortuneGraph(patternId);
    
    // カレンダーを生成
    generatePersonalizedCalendar();
    
    // パターン固有のコンテンツを更新
    updatePatternContent(patternId, moonPhase, hiddenMoonPhase);
}

// 各タイプの説明を更新する関数
function updateEmotionalExpressionContent(type) {
    const contents = {
        'ストレート告白型': '好きな人には素直に気持ちを伝えるタイプ。駆け引きは苦手で、思ったことがすぐ顔に出てしまいます。その純粋さが、相手の心を動かす最大の魅力。',
        'スキンシップ型': '言葉よりも行動で愛を表現するタイプ。手をつなぐ、ハグする、そばにいることで愛情を伝えます。触れ合いを通じて深い絆を築いていきます。',
        'さりげない気遣い型': '大げさな言葉よりも、日常の小さな優しさで愛を示すタイプ。相手の好みを覚えて、さりげなくプレゼントしたり、疲れた時にそっと寄り添います。',
        '奥手シャイ型': '心の中では大きな愛を抱えているけれど、なかなか表現できないタイプ。でも、その控えめな愛情表現が、かえって相手の心を掴むことも。'
    };
    const content = contents[type];
    if (content) {
        document.getElementById('emotionalExpressionContent').textContent = content;
    }
}

function updateDistanceStyleContent(type) {
    const contents = {
        'ベッタリ依存型': '恋人とは常に繋がっていたいタイプ。毎日会いたいし、連絡も頻繁。二人の世界に浸ることで、最高の幸せを感じます。',
        '安心セーフ型': '適度な連絡と会う頻度で安心感を得るタイプ。毎日一回は連絡を取り合い、週末はデート。バランスの取れた関係を築きます。',
        '自由マイペース型': '束縛されることを嫌い、自分のペースを大切にします。相手にも自由を与え、お互いに成長できる関係を理想とします。',
        '壁あり慎重型': 'すぐには心を開かず、じっくりと距離を縮めていくタイプ。時間をかけて築いた信頼関係は、誰よりも深く強固なものになります。'
    };
    const content = contents[type];
    if (content) {
        document.getElementById('distanceStyleContent').textContent = content;
    }
}

function updateLoveValuesContent(type) {
    // LP_love-type-descriptions.mdから取得した詳細な説明を使用
    const element = document.getElementById('loveValuesContent');
    if (!element) return;
    
    // 既存の長い説明をそのまま使用（タイプによって切り替え）
    // ここでは簡略版を表示（詳細版は別途実装可能）
    if (type !== 'ロマンチスト型') {
        element.innerHTML = getLoveValuesDetailedContent(type);
    }
}

function updateLoveEnergyContent(type) {
    const element = document.getElementById('loveEnergyContent');
    if (!element) return;
    
    if (type !== '燃え上がり型') {
        element.innerHTML = getLoveEnergyDetailedContent(type);
    }
}

function getLoveValuesDetailedContent(type) {
    // 詳細な説明を返す（LP_love-type-descriptions.mdの内容を参照）
    const contents = {
        'リアリスト型': '現実的で堅実な恋愛観を持つあなた。愛は日常の積み重ねだと考え、派手な演出よりも確実な幸せを求めます。',
        '刺激ハンター型': '新しい体験やドキドキを求めるあなた。マンネリは大敵で、常に新鮮な刺激を恋愛に求めます。',
        '成長パートナー型': '恋愛を通じて共に成長することを重視するあなた。相手と切磋琢磨し、より良い自分になることを目指します。'
    };
    return contents[type] || '';
}

function getLoveEnergyDetailedContent(type) {
    const contents = {
        '持続型': '安定した愛情を長く注ぎ続けるタイプ。激しい恋ではないけれど、確実に深まっていく愛を育みます。',
        '波あり型': '感情の浮き沈みがあるタイプ。時に情熱的、時にクール。その変化が恋愛にスパイスを与えます。',
        'クール型': '恋愛に全てを捧げず、冷静さを保つタイプ。バランスの取れた大人の恋愛を楽しみます。'
    };
    return contents[type] || '';
}