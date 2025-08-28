// Display-related functions for LP Otsukisama page

// 月相パターンに応じてコンテンツを更新
async function updateMoonPhaseContent(patternId) {
    // データローダーが読み込み完了するまで待つ
    if (!window.OtsukisamaDataLoader || !window.OtsukisamaDataLoader.isLoaded()) {
        await new Promise(resolve => {
            window.addEventListener('otsukisama-data-loaded', resolve, { once: true });
        });
    }
    
    const pattern = window.OtsukisamaDataLoader.getPatternFortune(patternId);
    if (!pattern) {
        console.log('Pattern data not found for ID:', patternId);
        return;
    }
    
    // 動的コンテンツを更新
    if (pattern.dynamicContent) {
        updateDynamicContent(pattern.dynamicContent);
    }
    
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
            '上弦の月': '/images/moon/omote-2.png',
            '十三夜': '/images/moon/omote-3.png',
            '満月': '/images/moon/omote-4.png',
            '十六夜': '/images/moon/omote-5.png',
            '下弦の月': '/images/moon/omote-6.png',
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
            const phaseDesc = window.OtsukisamaDataLoader.getMoonPhaseDescription(pattern.moonPhase);
            if (phaseDesc) {
                moonPhaseSubtitle.textContent = phaseDesc.subtitle;
            }
        }
        
        // 表月相の説明文を更新
        const moonPhaseDesc = document.getElementById('moon-phase-description');
        if (moonPhaseDesc) {
            // JSONデータから説明文を取得
            const moonDescription = window.OtsukisamaDataLoader.getMoonPhaseDescription(pattern.moonPhase);
            if (moonDescription) {
                moonPhaseDesc.textContent = moonDescription.description;
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
            '上弦の月': '/images/moon/ura-2.png',
            '十三夜': '/images/moon/ura-3.png',
            '満月': '/images/moon/ura-4.png',
            '十六夜': '/images/moon/ura-5.png',
            '下弦の月': '/images/moon/ura-6.png',
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
            const hiddenDesc = window.OtsukisamaDataLoader.getHiddenPhaseDescription(pattern.hiddenPhase);
            if (hiddenDesc) {
                hiddenPhaseSubtitle.textContent = hiddenDesc.subtitle;
            }
        }
        
        // 裏月相の説明文を更新
        const hiddenPhaseDesc = document.getElementById('hidden-phase-description');
        if (hiddenPhaseDesc) {
            // JSONデータから説明文を取得
            const hiddenDescription = window.OtsukisamaDataLoader.getHiddenPhaseDescription(pattern.hiddenPhase);
            if (hiddenDescription) {
                hiddenPhaseDesc.textContent = hiddenDescription.description;
            }
        }
    }
    
    // 実際の月相名を取得（patternデータまたは引数から）
    const actualMoonPhase = pattern.moonPhase;
    
    // 3つの月の力を更新（実際の月相名を使用）
    const threePowers = window.OtsukisamaDataLoader.getThreePowers(actualMoonPhase);
    if (threePowers && threePowers.length === 3) {
        const powerItems = document.querySelectorAll('.three-powers .energy-item');
        powerItems.forEach((item, index) => {
            if (threePowers[index]) {
                const titleEl = item.querySelector('.energy-title');
                const descEl = item.querySelector('.energy-description');
                if (titleEl) titleEl.textContent = threePowers[index].title;
                if (descEl) descEl.textContent = threePowers[index].desc;
            }
        });
    }
    
    // 4つの恋愛軸要素も更新（6つの円形要素の中の4つ）
    // 引数で渡されたプロフィールを使用
    if (!profile) {
        // プロフィールがない場合は更新しない
        return;
    }
    
    // 感情表現を更新
    if (profile.emotionalExpression) {
        const emotionalItem = document.querySelector('.type-item[data-type="emotional"]');
        if (emotionalItem) {
            const img = emotionalItem.querySelector('img');
            const spans = emotionalItem.querySelectorAll('span');
            const label = spans[spans.length - 1]; // 最後のspan = bottom label
            
            // 実際のファイル名に合わせたマッピング
            const typeMapping = {
                'ストレート告白型': 'straight',
                'スキンシップ型': 'physical',
                'さりげない気遣い型': 'subtle',  // care.pngがないのでsubtleを使用
                '奥手シャイ型': 'shy'
            };
            const imageName = typeMapping[profile.emotionalExpression] || 'straight';
            if (img) {
                img.src = `/images/love-types/emotional/${imageName}.png`;
                img.alt = profile.emotionalExpression;
            }
            if (label) {
                label.textContent = profile.emotionalExpression;
            }
        }
    }
    
    // 距離感を更新
    if (profile.distanceStyle) {
        const distanceItem = document.querySelector('.type-item[data-type="distance"]');
        if (distanceItem) {
            const img = distanceItem.querySelector('img');
            const spans = distanceItem.querySelectorAll('span');
            const label = spans[spans.length - 1]; // 最後のspan = bottom label
            
            // 実際のファイル名に合わせたマッピング
            const typeMapping = {
                'ベッタリ依存型': 'close',
                'ベッタリ型': 'close',
                '安心セーフ型': 'moderate',
                'ちょうどいい距離型': 'moderate',
                'じっくり型': 'cautious',
                '自由マイペース型': 'independent',
                'マイペース型': 'independent',
                '壁あり慎重型': 'cautious',
                '超慎重型': 'cautious'
            };
            const imageName = typeMapping[profile.distanceStyle] || 'safe';
            if (img) {
                img.src = `/images/love-types/distance/${imageName}.png`;
                img.alt = profile.distanceStyle;
            }
            if (label) {
                label.textContent = profile.distanceStyle;
            }
        }
    }
    
    // 価値観を更新
    if (profile.loveValues) {
        const valuesItem = document.querySelector('.type-item[data-type="values"]');
        if (valuesItem) {
            const img = valuesItem.querySelector('img');
            const spans = valuesItem.querySelectorAll('span');
            const label = spans[spans.length - 1]; // 最後のspan = bottom label
            
            // 実際のファイル名に合わせたマッピング
            const typeMapping = {
                'ロマンチスト型': 'romantic',
                'ロマンス重視': 'romantic',
                'リアリスト型': 'realistic',
                '安心感重視': 'realistic',
                '刺激ハンター型': 'excitement',
                '刺激重視': 'excitement',
                '成長パートナー型': 'growth',
                '成長重視': 'growth'
            };
            const imageName = typeMapping[profile.loveValues] || 'romantic';
            if (img) {
                img.src = `/images/love-types/values/${imageName}.png`;
                img.alt = profile.loveValues;
            }
            if (label) {
                label.textContent = profile.loveValues;
            }
        }
    }
    
    // エネルギーを更新
    if (profile.loveEnergy) {
        const energyItem = document.querySelector('.type-item[data-type="energy"]');
        if (energyItem) {
            const img = energyItem.querySelector('img');
            const spans = energyItem.querySelectorAll('span');
            const label = spans[spans.length - 1]; // 最後のspan = bottom label
            
            // 実際のファイル名に合わせたマッピング
            const typeMapping = {
                '燃え上がり型': 'intense',
                '情熱的': 'intense',
                '持続型': 'stable',
                '安定的': 'stable',
                '波あり型': 'fluctuating',
                '変動的': 'fluctuating',
                'クール型': 'cool',
                '冷静': 'cool'
            };
            const imageName = typeMapping[profile.loveEnergy] || 'burning';
            if (img) {
                img.src = `/images/love-types/energy/${imageName}.png`;
                img.alt = profile.loveEnergy;
            }
            if (label) {
                label.textContent = profile.loveEnergy;
            }
        }
    }
    
    // 運勢テキストの更新
    if (pattern.fortune) {
        console.log(`Updating fortune for pattern ${patternId}: ${pattern.moonPhase}×${pattern.hiddenPhase}`);
        
        // 全体運
        const overallText = document.getElementById('fortune-overall-text');
        if (overallText && pattern.fortune.overall) {
            overallText.textContent = pattern.fortune.overall;
            console.log('Overall fortune updated');
        }
        
        // 恋愛運
        const loveText = document.getElementById('fortune-love-text');
        if (loveText && pattern.fortune.love) {
            loveText.textContent = pattern.fortune.love;
            console.log('Love fortune updated');
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
async function updateSixElements(patternId, moonPhase, hiddenMoonPhase, profile = null) {
    // データローダーが読み込み完了するまで待つ
    if (!window.OtsukisamaDataLoader || !window.OtsukisamaDataLoader.isLoaded()) {
        await new Promise(resolve => {
            window.addEventListener('otsukisama-data-loaded', resolve, { once: true });
        });
    }
    
    const pattern = window.OtsukisamaDataLoader.getPatternFortune(patternId);
    if (!pattern) {
        console.error('Pattern not found for updateSixElements:', patternId);
        return;
    }
    
    // 引数で渡された月相を優先的に使用（実際の計算結果）
    const displayMoonPhase = moonPhase || pattern.moonPhase;
    const displayHiddenPhase = hiddenMoonPhase || pattern.hiddenPhase;
    
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
            '上弦の月': '/images/moon/omote-2.png',
            '十三夜': '/images/moon/omote-3.png',
            '満月': '/images/moon/omote-4.png',
            '十六夜': '/images/moon/omote-5.png',
            '下弦の月': '/images/moon/omote-6.png',
            '暁': '/images/moon/omote-7.png'
        };
        if (moonImg && phaseImages[displayMoonPhase]) {
            moonImg.src = phaseImages[displayMoonPhase];
            moonImg.alt = displayMoonPhase;
        }
        if (moonLabel) {
            moonLabel.textContent = displayMoonPhase;
        }
    }
    
    if (hiddenPhaseElement) {
        // 裏月相の画像を更新
        const hiddenImg = hiddenPhaseElement.querySelector('img');
        const hiddenLabel = hiddenPhaseElement.querySelectorAll('span')[1]; // bottom label
        const hiddenImages = {
            '新月': '/images/moon/ura-0.png',
            '三日月': '/images/moon/ura-1.png',
            '上弦の月': '/images/moon/ura-2.png',
            '十三夜': '/images/moon/ura-3.png',
            '満月': '/images/moon/ura-4.png',
            '十六夜': '/images/moon/ura-5.png',
            '下弦の月': '/images/moon/ura-6.png',
            '暁': '/images/moon/ura-7.png'
        };
        if (hiddenImg && hiddenImages[displayHiddenPhase]) {
            hiddenImg.src = hiddenImages[displayHiddenPhase];
            hiddenImg.alt = displayHiddenPhase;
        }
        if (hiddenLabel) {
            hiddenLabel.textContent = displayHiddenPhase;
        }
    }
    
    // LINE APIから取得した4軸データがあれば使用
    if (profile) {
        
        const emotionalElement = document.querySelector('.type-item[data-type="emotional"]');
        const distanceElement = document.querySelector('.type-item[data-type="distance"]');
        const valuesElement = document.querySelector('.type-item[data-type="values"]');
        const energyElement = document.querySelector('.type-item[data-type="energy"]');
        
        // 感情表現
        if (emotionalElement && profile.emotionalExpression) {
            emotionalElement.style.display = ''; // 表示に戻す
            const label = emotionalElement.querySelectorAll('span')[1];
            const img = emotionalElement.querySelector('img');
            const typeMapping = {
                'ストレート告白型': { name: 'ストレート告白型', image: 'straight' },
                'さりげない気遣い型': { name: 'さりげない気遣い型', image: 'subtle' },
                'スキンシップ型': { name: 'スキンシップ型', image: 'physical' },
                '奥手シャイ型': { name: '奥手シャイ型', image: 'shy' }
            };
            const mapped = typeMapping[profile.emotionalExpression] || typeMapping['ストレート告白型'];
            if (label) {
                label.textContent = mapped.name;
            }
            if (img) {
                img.src = `/images/love-types/emotional/${mapped.image}.png`;
                img.alt = mapped.name;
            }
        }
        
        // 距離感
        if (distanceElement && profile.distanceStyle) {
            distanceElement.style.display = ''; // 表示に戻す
            const label = distanceElement.querySelectorAll('span')[1];
            const img = distanceElement.querySelector('img');
            const typeMapping = {
                'ベッタリ依存型': { name: 'ベッタリ依存型', image: 'close' },
                '安心セーフ型': { name: '安心セーフ型', image: 'moderate' },
                '壁あり慎重型': { name: '壁あり慎重型', image: 'cautious' },
                '自由マイペース型': { name: '自由マイペース型', image: 'independent' }
            };
            const mapped = typeMapping[profile.distanceStyle] || typeMapping['安心セーフ型'];
            if (label) {
                label.textContent = mapped.name;
            }
            if (img) {
                img.src = `/images/love-types/distance/${mapped.image}.png`;
                img.alt = mapped.name;
            }
        }
        
        // 価値観
        if (valuesElement && profile.loveValues) {
            valuesElement.style.display = ''; // 表示に戻す
            const label = valuesElement.querySelectorAll('span')[1];
            const img = valuesElement.querySelector('img');
            const typeMapping = {
                'ロマンチスト型': { name: 'ロマンチスト型', image: 'romantic' },
                '成長パートナー型': { name: '成長パートナー型', image: 'growth' },
                'リアリスト型': { name: 'リアリスト型', image: 'realistic' },
                '刺激ハンター型': { name: '刺激ハンター型', image: 'excitement' }
            };
            const mapped = typeMapping[profile.loveValues] || typeMapping['ロマンチスト型'];
            if (label) {
                label.textContent = mapped.name;
            }
            if (img) {
                img.src = `/images/love-types/values/${mapped.image}.png`;
                img.alt = mapped.name;
            }
        }
        
        // エネルギー
        if (energyElement && profile.loveEnergy) {
            energyElement.style.display = ''; // 表示に戻す
            const label = energyElement.querySelectorAll('span')[1];
            const img = energyElement.querySelector('img');
            const typeMapping = {
                '燃え上がり型': { name: '燃え上がり型', image: 'intense' },
                '持続型': { name: '持続型', image: 'stable' },
                '波あり型': { name: '波あり型', image: 'fluctuating' },
                'クール型': { name: 'クール型', image: 'cool' }
            };
            const mapped = typeMapping[profile.loveEnergy] || typeMapping['燃え上がり型'];
            if (label) {
                label.textContent = mapped.name;
            }
            if (img) {
                img.src = `/images/love-types/energy/${mapped.image}.png`;
                img.alt = mapped.name;
            }
        }
    } else {
        // プロフィールがない場合は4つの要素を表示しない
        const emotionalElement = document.querySelector('.type-item[data-type="emotional"]');
        const distanceElement = document.querySelector('.type-item[data-type="distance"]');
        const valuesElement = document.querySelector('.type-item[data-type="values"]');
        const energyElement = document.querySelector('.type-item[data-type="energy"]');
        
        // 4つの要素を非表示に
        if (emotionalElement) emotionalElement.style.display = 'none';
        if (distanceElement) distanceElement.style.display = 'none';
        if (valuesElement) valuesElement.style.display = 'none';
        if (energyElement) energyElement.style.display = 'none';
    }
    
    console.log('Updated 6 elements for pattern:', patternId, pattern.pattern);
}

// 動的コンテンツを更新する関数
function updateDynamicContent(dynamicContent) {
    // 全体運のタイトルと説明
    const overallTitle = document.getElementById('fortune-overall-title');
    if (overallTitle && dynamicContent.overallTitle) {
        overallTitle.textContent = dynamicContent.overallTitle;
    }
    
    const overallIntro = document.getElementById('fortune-overall-intro');
    if (overallIntro && dynamicContent.overallIntro) {
        overallIntro.textContent = dynamicContent.overallIntro;
    }
    
    // 月ごとのタイトルと説明
    const monthBoxes = document.querySelectorAll('.fortune-section.destiny .month-box');
    if (monthBoxes.length >= 3) {
        // 1ヶ月目
        const month1Title = monthBoxes[0].querySelector('h3');
        const month1Text = monthBoxes[0].querySelector('p');
        if (month1Title && dynamicContent.month1Title) {
            month1Title.textContent = dynamicContent.month1Title;
        }
        if (month1Text && dynamicContent.month1Text) {
            month1Text.textContent = dynamicContent.month1Text;
        }
        
        // 2ヶ月目
        const month2Title = monthBoxes[1].querySelector('h3');
        const month2Text = monthBoxes[1].querySelector('p');
        if (month2Title && dynamicContent.month2Title) {
            month2Title.textContent = dynamicContent.month2Title;
        }
        if (month2Text && dynamicContent.month2Text) {
            month2Text.textContent = dynamicContent.month2Text;
        }
        
        // 3ヶ月目
        const month3Title = monthBoxes[2].querySelector('h3');
        const month3Text = monthBoxes[2].querySelector('p');
        if (month3Title && dynamicContent.month3Title) {
            month3Title.textContent = dynamicContent.month3Title;
        }
        if (month3Text && dynamicContent.month3Text) {
            month3Text.textContent = dynamicContent.month3Text;
        }
    }
    
    // 注意ポイント
    const overallCautionBox = document.querySelector('.fortune-section.destiny .point-box p');
    if (overallCautionBox && dynamicContent.overallCaution) {
        overallCautionBox.textContent = dynamicContent.overallCaution;
    }
    
    // 転機のアドバイス
    const transitionPara = document.querySelector('.fortune-section.destiny .fortune-content > p');
    if (transitionPara && dynamicContent.transitionAdvice) {
        transitionPara.textContent = dynamicContent.transitionAdvice;
    }
    
    // 重要な転機の時期
    const criticalTimings = document.querySelectorAll('.fortune-section.destiny .fortune-highlight:last-child p');
    if (criticalTimings.length >= 3) {
        if (dynamicContent.criticalTiming1) {
            criticalTimings[0].innerHTML = dynamicContent.criticalTiming1;
        }
        if (dynamicContent.criticalTiming2) {
            criticalTimings[1].innerHTML = dynamicContent.criticalTiming2;
        }
        if (dynamicContent.criticalTiming3) {
            criticalTimings[2].innerHTML = dynamicContent.criticalTiming3;
        }
    }
    
    // 恋愛運
    const loveIntro = document.getElementById('fortune-love-intro');
    if (loveIntro && dynamicContent.loveIntro) {
        loveIntro.textContent = dynamicContent.loveIntro;
    }
    
    // 恋愛運の月ごとのタイトルと説明
    const loveMonthBoxes = document.querySelectorAll('.fortune-section.love .month-box');
    if (loveMonthBoxes.length >= 3) {
        // 1ヶ月目
        const loveMonth1Title = loveMonthBoxes[0].querySelector('h3');
        const loveMonth1Text = loveMonthBoxes[0].querySelector('p');
        if (loveMonth1Title && dynamicContent.loveMonth1Title) {
            loveMonth1Title.textContent = dynamicContent.loveMonth1Title;
        }
        if (loveMonth1Text && dynamicContent.loveMonth1Text) {
            loveMonth1Text.textContent = dynamicContent.loveMonth1Text;
        }
        
        // 2ヶ月目
        const loveMonth2Title = loveMonthBoxes[1].querySelector('h3');
        const loveMonth2Text = loveMonthBoxes[1].querySelector('p');
        if (loveMonth2Title && dynamicContent.loveMonth2Title) {
            loveMonth2Title.textContent = dynamicContent.loveMonth2Title;
        }
        if (loveMonth2Text && dynamicContent.loveMonth2Text) {
            loveMonth2Text.textContent = dynamicContent.loveMonth2Text;
        }
        
        // 3ヶ月目
        const loveMonth3Title = loveMonthBoxes[2].querySelector('h3');
        const loveMonth3Text = loveMonthBoxes[2].querySelector('p');
        if (loveMonth3Title && dynamicContent.loveMonth3Title) {
            loveMonth3Title.textContent = dynamicContent.loveMonth3Title;
        }
        if (loveMonth3Text && dynamicContent.loveMonth3Text) {
            loveMonth3Text.textContent = dynamicContent.loveMonth3Text;
        }
    }
    
    // 恋愛の注意ポイント
    const loveCautionBox = document.querySelector('.fortune-section.love .point-box p');
    if (loveCautionBox && dynamicContent.loveCaution) {
        loveCautionBox.textContent = dynamicContent.loveCaution;
    }
    
    // 仕事運のタイトル
    const workTitle = document.getElementById('fortune-work-title');
    if (workTitle && dynamicContent.workTitle) {
        workTitle.textContent = dynamicContent.workTitle;
    }
    
    // 人間関係の転機
    const relationshipTransition = document.querySelector('.fortune-section.relationship .highlight-banner + p');
    if (relationshipTransition && dynamicContent.relationshipTransition) {
        relationshipTransition.textContent = dynamicContent.relationshipTransition;
    }
    
    // 人間関係の注意ポイント
    const relationshipCautionBox = document.querySelector('.fortune-section.relationship .point-box p');
    if (relationshipCautionBox && dynamicContent.relationshipCaution) {
        relationshipCautionBox.textContent = dynamicContent.relationshipCaution;
    }
    
    // 金運最高潮のタイミング
    const moneyPeakTiming = document.querySelector('.fortune-section.money .highlight-banner + p');
    if (moneyPeakTiming && dynamicContent.moneyPeakTiming) {
        moneyPeakTiming.textContent = dynamicContent.moneyPeakTiming;
    }
    
    console.log('Dynamic content updated');
}

// 恋愛タイプの表示を更新
function updatePersonalityDisplay(profile) {
    
    // 感情表現を更新（画像も含む）
    if (profile.emotionalExpression) {
        document.getElementById('emotionalExpressionType').textContent = profile.emotionalExpression;
        updateEmotionalExpressionContent(profile.emotionalExpression);
        
        // 画像を更新
        const emotionalImg = document.querySelector('.love-type-card:nth-child(1) img');
        if (emotionalImg) {
            const typeMapping = {
                'ストレート告白型': 'straight',
                'スキンシップ型': 'physical',
                'さりげない気遣い型': 'subtle',
                '奥手シャイ型': 'shy'
            };
            const imageName = typeMapping[profile.emotionalExpression] || 'straight';
            emotionalImg.src = `/images/love-types/emotional/${imageName}.png`;
        }
    }
    
    // 距離感を更新（画像も含む）
    if (profile.distanceStyle) {
        document.getElementById('distanceStyleType').textContent = profile.distanceStyle;
        updateDistanceStyleContent(profile.distanceStyle);
        
        // 画像を更新
        const distanceImg = document.querySelector('.love-type-card:nth-child(2) img');
        if (distanceImg) {
            const typeMapping = {
                'ベッタリ依存型': 'close',
                'ベッタリ型': 'close',
                '安心セーフ型': 'moderate',
                'ちょうどいい距離型': 'moderate',
                'じっくり型': 'cautious',
                '自由マイペース型': 'independent',
                'マイペース型': 'independent',
                '壁あり慎重型': 'cautious',
                '超慎重型': 'cautious'
            };
            const imageName = typeMapping[profile.distanceStyle] || 'moderate';
            distanceImg.src = `/images/love-types/distance/${imageName}.png`;
        }
    }
    
    // 価値観を更新（画像も含む）
    if (profile.loveValues) {
        document.getElementById('loveValuesType').textContent = profile.loveValues;
        updateLoveValuesContent(profile.loveValues);
        
        // 画像を更新
        const valuesImg = document.querySelector('.love-type-card:nth-child(3) img');
        if (valuesImg) {
            const typeMapping = {
                'ロマンチスト型': 'romantic',
                'ロマンス重視': 'romantic',
                'リアリスト型': 'realistic',
                '安心感重視': 'realistic',
                '刺激ハンター型': 'excitement',
                '刺激重視': 'excitement',
                '成長パートナー型': 'growth',
                '成長重視': 'growth'
            };
            const imageName = typeMapping[profile.loveValues] || 'romantic';
            valuesImg.src = `/images/love-types/values/${imageName}.png`;
        }
    }
    
    // エネルギーを更新（画像も含む）
    if (profile.loveEnergy) {
        document.getElementById('loveEnergyType').textContent = profile.loveEnergy;
        updateLoveEnergyContent(profile.loveEnergy);
        
        // 画像を更新
        const energyImg = document.querySelector('.love-type-card:nth-child(4) img');
        if (energyImg) {
            const typeMapping = {
                '燃え上がり型': 'intense',
                '情熱的': 'intense',
                '持続型': 'stable',
                '安定的': 'stable',
                '波あり型': 'fluctuating',
                '変動的': 'fluctuating',
                'クール型': 'cool',
                '冷静': 'cool'
            };
            const imageName = typeMapping[profile.loveEnergy] || 'intense';
            energyImg.src = `/images/love-types/energy/${imageName}.png`;
        }
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

async function updateUserDisplayContent(userData, profile = null) {
    const { name, moonPhase, hiddenMoonPhase, patternId } = userData;
    
    // 6つの円形要素を更新（月相とプロフィールを渡す）
    if (typeof updateSixElements === 'function') {
        await updateSixElements(patternId, moonPhase, hiddenMoonPhase, profile);
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
    if (typeof updateFortuneGraph === 'function') {
        await updateFortuneGraph(patternId);
    }
    
    // カレンダーを生成
    if (typeof generatePersonalizedCalendar === 'function') {
        await generatePersonalizedCalendar(patternId);
    }
    
    // パターン固有のコンテンツを更新
    if (typeof updatePatternContent === 'function') {
        updatePatternContent(patternId, moonPhase, hiddenMoonPhase);
    }
    
    // 月相の解説を更新
    await updateMoonPhaseExplanations(moonPhase, hiddenMoonPhase);
}

// 動的コンテンツを更新する関数
function updateDynamicContent(pattern) {
    if (!pattern || !pattern.dynamicContent) {
        console.warn('Dynamic content not found for pattern');
        return;
    }
    
    const dc = pattern.dynamicContent;
    
    // 全体運のタイトルと導入文
    const overallTitle = document.getElementById('fortune-overall-title');
    if (overallTitle) overallTitle.textContent = dc.overallTitle || '運命の3ヶ月';
    
    const overallIntro = document.getElementById('fortune-overall-intro');
    if (overallIntro) overallIntro.textContent = dc.overallIntro || pattern.fortune.overall.substring(0, 100) + '...';
    
    // 月別のタイトルと説明
    const monthBoxes = document.querySelectorAll('.month-box');
    if (monthBoxes.length >= 3) {
        // 全体運の月別
        const overallMonthTitles = [dc.month1Title, dc.month2Title, dc.month3Title];
        const overallMonthTexts = [dc.month1Text, dc.month2Text, dc.month3Text];
        
        monthBoxes.forEach((box, index) => {
            if (index < 3) {
                const h3 = box.querySelector('h3');
                const p = box.querySelector('p');
                if (h3) h3.textContent = overallMonthTitles[index] || `${index + 1}ヶ月目の展開`;
                if (p) p.textContent = overallMonthTexts[index] || `${index + 1}ヶ月目の詳細な運勢...`;
            }
        });
    }
    
    // 注意ポイント
    const overallCautionBox = document.querySelector('.fortune-section.destiny .point-box p');
    if (overallCautionBox) {
        overallCautionBox.textContent = dc.overallCaution || '慎重に行動することが大切です。';
    }
    
    // 転機のアドバイス
    const transitionSection = document.querySelector('.fortune-highlight:last-child');
    if (transitionSection) {
        const transitionTexts = transitionSection.querySelectorAll('p');
        if (transitionTexts.length >= 3) {
            transitionTexts[0].textContent = dc.transitionAdvice || '重要な転機が訪れます。';
            transitionTexts[1].textContent = dc.criticalTiming1 || '1つ目の転機...';
            transitionTexts[2].textContent = dc.criticalTiming2 || '2つ目の転機...';
            // 3つ目の転機を追加する場合
            if (transitionTexts.length >= 4) {
                transitionTexts[3].textContent = dc.criticalTiming3 || '3つ目の転機...';
            }
        }
    }
    
    // 恋愛運の導入文
    const loveIntro = document.getElementById('fortune-love-intro');
    if (loveIntro) loveIntro.textContent = dc.loveIntro || pattern.fortune.love.substring(0, 100) + '...';
    
    // 恋愛運の月別タイトル
    const loveSection = document.querySelector('.fortune-section.love');
    if (loveSection) {
        const loveMonthBoxes = loveSection.querySelectorAll('.month-box');
        const loveMonthTitles = [dc.loveMonth1Title, dc.loveMonth2Title, dc.loveMonth3Title];
        const loveMonthTexts = [dc.loveMonth1Text, dc.loveMonth2Text, dc.loveMonth3Text];
        
        loveMonthBoxes.forEach((box, index) => {
            const h3 = box.querySelector('h3');
            const p = box.querySelector('p');
            if (h3) h3.textContent = loveMonthTitles[index] || `恋愛${index + 1}ヶ月目`;
            if (p) p.textContent = loveMonthTexts[index] || `${index + 1}ヶ月目の恋愛運...`;
        });
        
        // 恋愛の注意ポイント
        const loveCautionBox = loveSection.querySelector('.point-box p');
        if (loveCautionBox) {
            loveCautionBox.textContent = dc.loveCaution || '相手の気持ちも大切にしましょう。';
        }
    }
    
    // 仕事運のタイトル
    const workTitle = document.getElementById('fortune-work-title');
    if (workTitle) workTitle.textContent = dc.workTitle || '仕事運の展開';
    
    // 人間関係の転機と注意
    const relationshipSection = document.querySelector('.fortune-section.relationship');
    if (relationshipSection) {
        const transitionDiv = relationshipSection.querySelector('.highlight-banner + p');
        if (transitionDiv) {
            transitionDiv.textContent = dc.relationshipTransition || '人間関係に変化が訪れます。';
        }
        
        const relationshipCaution = relationshipSection.querySelector('.point-box p');
        if (relationshipCaution) {
            relationshipCaution.textContent = dc.relationshipCaution || '周囲との調和を大切にしましょう。';
        }
    }
    
    // 金運のピークタイミング
    const moneySection = document.querySelector('.fortune-section.money');
    if (moneySection) {
        const peakTimingDiv = moneySection.querySelector('.highlight-banner + p');
        if (peakTimingDiv) {
            peakTimingDiv.textContent = dc.moneyPeakTiming || '金運が上昇する時期です。';
        }
    }
    
    // 全体運のメインテキスト（最初の部分）
    const overallText = document.getElementById('fortune-overall-text');
    if (overallText && pattern.fortune.overall) {
        overallText.textContent = pattern.fortune.overall.substring(0, 200) + '...';
    }
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

// 月相の解説を更新する関数
async function updateMoonPhaseExplanations(moonPhase, hiddenMoonPhase) {
    // データローダーが読み込み完了するまで待つ
    if (!window.OtsukisamaDataLoader || !window.OtsukisamaDataLoader.isLoaded()) {
        await new Promise(resolve => {
            window.addEventListener('otsukisama-data-loaded', resolve, { once: true });
        });
    }
    
    // 月相（表）の解説を更新
    const moonPhaseDesc = window.OtsukisamaDataLoader.getMoonPhaseDescription(moonPhase);
    if (moonPhaseDesc) {
        const moonDescElement = document.querySelector('.moon-description[data-phase="omote"]');
        if (moonDescElement) {
            const titleElement = moonDescElement.querySelector('h3');
            const subtitleElement = moonDescElement.querySelector('h4');
            const descElement = moonDescElement.querySelector('p');
            const imgElement = moonDescElement.querySelector('img');
            
            if (titleElement) titleElement.textContent = moonPhaseDesc.title;
            if (subtitleElement) subtitleElement.textContent = moonPhaseDesc.subtitle;
            if (descElement) descElement.textContent = moonPhaseDesc.description;
            if (imgElement && moonPhaseDesc.image) {
                imgElement.src = moonPhaseDesc.image;
                imgElement.alt = moonPhase;
            }
        }
    }
    
    // 隠れ月相（裏）の解説を更新
    const hiddenPhaseDesc = window.OtsukisamaDataLoader.getHiddenPhaseDescription(hiddenMoonPhase);
    if (hiddenPhaseDesc) {
        const hiddenDescElement = document.querySelector('.moon-description[data-phase="ura"]');
        if (hiddenDescElement) {
            const titleElement = hiddenDescElement.querySelector('h3');
            const subtitleElement = hiddenDescElement.querySelector('h4');
            const descElement = hiddenDescElement.querySelector('p');
            const imgElement = hiddenDescElement.querySelector('img');
            
            if (titleElement) titleElement.textContent = hiddenPhaseDesc.title;
            if (subtitleElement) subtitleElement.textContent = hiddenPhaseDesc.subtitle;
            if (descElement) descElement.textContent = hiddenPhaseDesc.description;
            if (imgElement && hiddenPhaseDesc.image) {
                imgElement.src = hiddenPhaseDesc.image;
                imgElement.alt = hiddenMoonPhase;
            }
        }
    }
}