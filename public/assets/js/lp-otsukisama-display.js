// Display-related functions for LP Otsukisama page

// personality-axes-descriptions.jsonのデータを格納
let personalityAxesData = null;

// 診断日をグローバルに保存（データベースから取得した値を使用）
let globalDiagnosisDate = null;

// 動的な月表示を置換する関数
function replaceMonthPlaceholders(text) {
    if (!text) return text;
    
    // グローバル診断日を優先的に使用（データベースから取得した値）
    let diagnosisDate;
    
    if (window.globalDiagnosisDate) {
        // データベースから取得した診断日がある場合はそれを使用
        diagnosisDate = new Date(window.globalDiagnosisDate);
    } else {
        // フォールバック：URLパラメータから取得
        const urlParams = new URLSearchParams(window.location.search);
        const diagnosisDateParam = urlParams.get('diagnosisDate');
        
        if (diagnosisDateParam) {
            diagnosisDate = new Date(diagnosisDateParam);
        } else {
            // 最終フォールバック：現在日時を使用
            // console.warn('診断日が設定されていません。現在日時を使用します。');
            diagnosisDate = new Date();
        }
    }
    
    const currentMonth = diagnosisDate.getMonth() + 1; // 0-indexed to 1-indexed
    const currentYear = diagnosisDate.getFullYear();
    
    // M（Xヶ月先）月 のパターンを置換
    text = text.replace(/M（(\d+)ヶ月先）月/g, (match, monthsAhead) => {
        const targetDate = new Date(currentYear, diagnosisDate.getMonth() + parseInt(monthsAhead), 1);
        return `${targetDate.getMonth() + 1}月`;
    });
    
    // M（今月）月 のパターンを置換
    text = text.replace(/M（今月）月/g, `${currentMonth}月`);
    
    return text;
}

// データベースから取得した3つの力のキーを使って表示
async function displayThreePowersFromKeys(keys, moonPhase) {
    if (!window.ThreePowersCalculator) {
        console.log('ThreePowersCalculator not loaded yet');
        return;
    }
    
    // データが読み込まれるまで待つ
    await window.ThreePowersCalculator.load();
    
    // キーから3つの力のデータを取得
    const threePowersData = await fetch('/assets/data/three-powers-calculated.json').then(r => r.json());
    
    const powers = {
        action: threePowersData.action[keys.action],
        emotion: threePowersData.emotion[keys.emotion],
        thinking: threePowersData.thinking[keys.thinking]
    };
    
    if (powers) {
        const userName = window.currentUserName || 'あなた';
        const formattedPowers = window.ThreePowersCalculator.format(powers, userName);
        
        // 表示を更新
        const powerItems = document.querySelectorAll('.three-powers .energy-item');
        powerItems.forEach((item, index) => {
            if (formattedPowers[index]) {
                const titleEl = item.querySelector('.energy-title');
                const descEl = item.querySelector('.energy-description');
                if (titleEl) titleEl.textContent = formattedPowers[index].title;
                if (descEl) descEl.innerHTML = formattedPowers[index].desc;
            }
        });
    }
}

// personality-axes-descriptions.jsonを読み込む
async function loadPersonalityAxesData() {
    try {
        const response = await fetch('/assets/data/personality-axes-descriptions.json');
        personalityAxesData = await response.json();
        console.log('Personality axes data loaded');
        return true;
    } catch (error) {
        console.error('Failed to load personality axes data:', error);
        return false;
    }
}

// 月相パターンに応じてコンテンツを更新
async function updateMoonPhaseContent(patternId) {
    console.log('updateMoonPhaseContent called with patternId:', patternId);
    // データローダーが読み込み完了するまで待つ
    if (!window.OtsukisamaDataLoader || !window.OtsukisamaDataLoader.isLoaded()) {
        await new Promise(resolve => {
            window.addEventListener('otsukisama-data-loaded', resolve, { once: true });
        });
    }
    
    const pattern = await window.OtsukisamaDataLoader.getPatternFortune(patternId);
    if (!pattern) {
        console.log('Pattern data not found for ID:', patternId);
        return;
    }
    console.log('Pattern loaded:', pattern);
    
    // 動的コンテンツを更新
    console.log('Checking for dynamicContent:', pattern.dynamicContent);
    if (pattern.dynamicContent) {
        updateDynamicContentFromPattern(pattern);
    } else {
        // v3形式のデータは直接アクセス可能
        console.log('No dynamicContent, calling updateDynamicContentFromPattern directly');
        updateDynamicContentFromPattern(pattern);
    }
    
    // 表月相の更新
    const moonPhaseCard = document.querySelector('.moon-phase-card.new-moon');
    if (moonPhaseCard) {
        const moonPhaseImg = moonPhaseCard.querySelector('.moon-phase-visual');
        const moonPhaseTitle = moonPhaseCard.querySelector('.moon-phase-info h2');
        const moonPhaseSubtitle = moonPhaseCard.querySelector('.moon-phase-subtitle');
        
        // 月相に応じた画像を設定
        const phaseImages = {
            '新月': '/assets/images/moon/omote-0.png',
            '三日月': '/assets/images/moon/omote-1.png',
            '上弦の月': '/assets/images/moon/omote-2.png',
            '十三夜': '/assets/images/moon/omote-3.png',
            '満月': '/assets/images/moon/omote-4.png',
            '十六夜': '/assets/images/moon/omote-5.png',
            '下弦の月': '/assets/images/moon/omote-6.png',
            '暁': '/assets/images/moon/omote-7.png'
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
                // テキストフォーマッターを使用してユーザー名を置換
                // profileはまだ定義されていない可能性があるため、window.currentUserNameを使用
                const userName = window.currentUserName || 'あなた';
                if (window.TextFormatter) {
                    moonPhaseDesc.innerHTML = window.TextFormatter.formatDescription(moonDescription.description, userName);
                } else {
                    moonPhaseDesc.textContent = moonDescription.description;
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
            '新月': '/assets/images/moon/ura-0.png',
            '三日月': '/assets/images/moon/ura-1.png',
            '上弦の月': '/assets/images/moon/ura-2.png',
            '十三夜': '/assets/images/moon/ura-3.png',
            '満月': '/assets/images/moon/ura-4.png',
            '十六夜': '/assets/images/moon/ura-5.png',
            '下弦の月': '/assets/images/moon/ura-6.png',
            '暁': '/assets/images/moon/ura-7.png'
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
    
    // 誕生日を取得（window.currentUserBirthdateまたはpatternIdから生成）
    let birthdate = window.currentUserBirthdate;
    if (!birthdate) {
        // patternIdから仮の誕生日を生成（テスト用）
        // patternId 0-63に基づいて異なる日付を生成
        const baseYear = 1990 + Math.floor(patternId / 4);
        const month = (patternId % 12) + 1;
        const day = (patternId % 28) + 1;
        birthdate = `${baseYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    // データベースから取得した3つの力のキーがある場合は直接使用
    if (window.currentThreePowersKeys) {
        // データベースからの値を直接表示
        displayThreePowersFromKeys(window.currentThreePowersKeys, actualMoonPhase);
    }
    // 3つの月の力を更新（誕生日ベースの計算）
    else if (window.ThreePowersCalculator && birthdate) {
        // 誕生日から3つの力を計算
        window.ThreePowersCalculator.calculate(birthdate, actualMoonPhase).then(powers => {
            if (powers) {
                const userName = window.currentUserName || 'あなた';
                const formattedPowers = window.ThreePowersCalculator.format(powers, userName);
                
                // 表示を更新
                const powerItems = document.querySelectorAll('.three-powers .energy-item');
                powerItems.forEach((item, index) => {
                    if (formattedPowers[index]) {
                        const titleEl = item.querySelector('.energy-title');
                        const descEl = item.querySelector('.energy-description');
                        if (titleEl) titleEl.textContent = formattedPowers[index].title;
                        if (descEl) descEl.textContent = formattedPowers[index].desc;
                    }
                });
            }
        });
    } else {
        // フォールバック: 旧方式（月相ベース）
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
    }
    
    // 4つの恋愛軸要素も更新（6つの円形要素の中の4つ）
    // プロフィールはLINE APIから取得される場合のみ存在
    const profile = window.userProfile || null;
    if (profile) {
        // PersonalityTypeMapperを使用して値を変換
        const mapper = window.PersonalityTypeMapper;
        
        // 感情表現を更新
        if (profile.emotionalExpression) {
        const emotionalItem = document.querySelector('.type-item[data-type="emotional"]');
        if (emotionalItem) {
            const img = emotionalItem.querySelector('img');
            const spans = emotionalItem.querySelectorAll('span');
            const label = spans[spans.length - 1]; // 最後のspan = bottom label
            
            // 日本語名を取得
            const japaneseName = mapper ? mapper.getJapaneseName('emotionalExpression', profile.emotionalExpression) : profile.emotionalExpression;
            // 英語キーを取得（画像パス用）
            const englishKey = mapper ? mapper.getEnglishKey('emotionalExpression', profile.emotionalExpression) : profile.emotionalExpression;
            
            if (img) {
                img.src = `/assets/images/love-types/emotional/${englishKey}.png`;
                img.alt = japaneseName;
            }
            if (label) {
                label.textContent = japaneseName;
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
            
            // 日本語名を取得
            const japaneseName = mapper ? mapper.getJapaneseName('distanceStyle', profile.distanceStyle) : profile.distanceStyle;
            // 英語キーを取得（画像パス用）
            const englishKey = mapper ? mapper.getEnglishKey('distanceStyle', profile.distanceStyle) : profile.distanceStyle;
            
            if (img) {
                img.src = `/assets/images/love-types/distance/${englishKey}.png`;
                img.alt = japaneseName;
            }
            if (label) {
                label.textContent = japaneseName;
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
            
            // 日本語名を取得
            const japaneseName = mapper ? mapper.getJapaneseName('loveValues', profile.loveValues) : profile.loveValues;
            // 英語キーを取得（画像パス用）
            const englishKey = mapper ? mapper.getEnglishKey('loveValues', profile.loveValues) : profile.loveValues;
            
            if (img) {
                img.src = `/assets/images/love-types/values/${englishKey}.png`;
                img.alt = japaneseName;
            }
            if (label) {
                label.textContent = japaneseName;
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
            
            // 日本語名を取得
            const japaneseName = mapper ? mapper.getJapaneseName('energyType', profile.loveEnergy) : profile.loveEnergy;
            // 英語キーを取得（画像パス用）
            const englishKey = mapper ? mapper.getEnglishKey('energyType', profile.loveEnergy) : profile.loveEnergy;
            
            if (img) {
                img.src = `/assets/images/love-types/energy/${englishKey}.png`;
                img.alt = japaneseName;
            }
            if (label) {
                label.textContent = japaneseName;
            }
        }
    }
    } // profile block end
    
    // 運勢テキストの更新は updateDynamicContentFromPattern で行うため、ここでは行わない
    // （重複を避けるため）
    
    console.log('Moon phase content updated for pattern:', patternId);
}

// 6つの円形要素を更新する関数
async function updateSixElements(patternId, moonPhase, hiddenMoonPhase, profile = null) {
    console.log('updateSixElements called:', { patternId, moonPhase, hiddenMoonPhase, profile });
    
    // データローダーが読み込み完了するまで待つ
    if (!window.OtsukisamaDataLoader || !window.OtsukisamaDataLoader.isLoaded()) {
        await new Promise(resolve => {
            window.addEventListener('otsukisama-data-loaded', resolve, { once: true });
        });
    }
    
    const pattern = await window.OtsukisamaDataLoader.getPatternFortune(patternId);
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
            '新月': '/assets/images/moon/omote-0.png',
            '三日月': '/assets/images/moon/omote-1.png',
            '上弦の月': '/assets/images/moon/omote-2.png',
            '十三夜': '/assets/images/moon/omote-3.png',
            '満月': '/assets/images/moon/omote-4.png',
            '十六夜': '/assets/images/moon/omote-5.png',
            '下弦の月': '/assets/images/moon/omote-6.png',
            '暁': '/assets/images/moon/omote-7.png'
        };
        if (moonImg && phaseImages[displayMoonPhase]) {
            moonImg.src = phaseImages[displayMoonPhase];
            moonImg.alt = displayMoonPhase;
        }
        if (moonLabel) {
            moonLabel.textContent = displayMoonPhase;
        }
        console.log('Moon phase element updated:', displayMoonPhase);
    }
    
    if (hiddenPhaseElement) {
        // 裏月相の画像を更新
        const hiddenImg = hiddenPhaseElement.querySelector('img');
        const hiddenLabel = hiddenPhaseElement.querySelectorAll('span')[1]; // bottom label
        const hiddenImages = {
            '新月': '/assets/images/moon/ura-0.png',
            '三日月': '/assets/images/moon/ura-1.png',
            '上弦の月': '/assets/images/moon/ura-2.png',
            '十三夜': '/assets/images/moon/ura-3.png',
            '満月': '/assets/images/moon/ura-4.png',
            '十六夜': '/assets/images/moon/ura-5.png',
            '下弦の月': '/assets/images/moon/ura-6.png',
            '暁': '/assets/images/moon/ura-7.png'
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
    console.log('Checking profile for 4-axis data:', profile);
    if (profile) {
        
        const emotionalElement = document.querySelector('.type-item[data-type="emotional"]');
        const distanceElement = document.querySelector('.type-item[data-type="distance"]');
        const valuesElement = document.querySelector('.type-item[data-type="values"]');
        const energyElement = document.querySelector('.type-item[data-type="energy"]');
        
        // 英語キーから日本語へのマッピング
        const emotionalEngToJp = {
            'straight': 'ストレート告白型',
            'physical': 'スキンシップ型',
            'subtle': 'さりげない気遣い型',
            'shy': '奥手シャイ型'
        };
        
        // 感情表現
        if (emotionalElement && profile.emotionalExpression) {
            emotionalElement.style.display = ''; // 表示に戻す
            const label = emotionalElement.querySelectorAll('span')[1];
            const img = emotionalElement.querySelector('img');
            
            // 英語キーの場合は日本語に変換
            const displayName = emotionalEngToJp[profile.emotionalExpression] || profile.emotionalExpression;
            // 画像名は英語キーを使用
            const imageName = emotionalEngToJp[profile.emotionalExpression] ? profile.emotionalExpression : 'straight';
            
            if (label) {
                label.textContent = displayName;
            }
            if (img) {
                img.src = `/assets/images/love-types/emotional/${imageName}.png`;
                img.alt = displayName;
            }
        }
        
        // 英語キーから日本語へのマッピング
        const distanceEngToJp = {
            'close': 'ベッタリ依存型',
            'moderate': '安心セーフ型',
            'independent': '自由マイペース型',
            'cautious': '壁あり慎重型'
        };
        
        // 距離感
        if (distanceElement && profile.distanceStyle) {
            distanceElement.style.display = ''; // 表示に戻す
            const label = distanceElement.querySelectorAll('span')[1];
            const img = distanceElement.querySelector('img');
            
            // 英語キーの場合は日本語に変換
            const displayName = distanceEngToJp[profile.distanceStyle] || profile.distanceStyle;
            // 画像名は英語キーを使用
            const imageName = distanceEngToJp[profile.distanceStyle] ? profile.distanceStyle : 'moderate';
            
            if (label) {
                label.textContent = displayName;
            }
            if (img) {
                img.src = `/assets/images/love-types/distance/${imageName}.png`;
                img.alt = displayName;
            }
        }
        
        // 英語キーから日本語へのマッピング
        const valuesEngToJp = {
            'romantic': 'ロマンチスト型',
            'realistic': 'リアリスト型',
            'excitement': '刺激ハンター型',
            'growth': '成長パートナー型'
        };
        
        // 価値観
        if (valuesElement && profile.loveValues) {
            valuesElement.style.display = ''; // 表示に戻す
            const label = valuesElement.querySelectorAll('span')[1];
            const img = valuesElement.querySelector('img');
            
            // 英語キーの場合は日本語に変換
            const displayName = valuesEngToJp[profile.loveValues] || profile.loveValues;
            // 画像名は英語キーを使用
            const imageName = valuesEngToJp[profile.loveValues] ? profile.loveValues : 'romantic';
            
            if (label) {
                label.textContent = displayName;
            }
            if (img) {
                img.src = `/assets/images/love-types/values/${imageName}.png`;
                img.alt = displayName;
            }
        }
        
        // 英語キーから日本語へのマッピング
        const energyEngToJp = {
            'intense': '燃え上がり型',
            'stable': '持続型',
            'fluctuating': '波あり型',
            'cool': 'クール型'
        };
        
        // エネルギー
        if (energyElement && profile.loveEnergy) {
            energyElement.style.display = ''; // 表示に戻す
            const label = energyElement.querySelectorAll('span')[1];
            const img = energyElement.querySelector('img');
            
            // 英語キーの場合は日本語に変換
            const displayName = energyEngToJp[profile.loveEnergy] || profile.loveEnergy;
            // 画像名は英語キーを使用
            const imageName = energyEngToJp[profile.loveEnergy] ? profile.loveEnergy : 'intense';
            
            if (label) {
                label.textContent = displayName;
            }
            if (img) {
                img.src = `/assets/images/love-types/energy/${imageName}.png`;
                img.alt = displayName;
            }
        }
    } else {
        // プロフィールがない場合はデフォルトの値を表示
        console.log('No profile data, using defaults for 4-axis elements');
        const emotionalElement = document.querySelector('.type-item[data-type="emotional"]');
        const distanceElement = document.querySelector('.type-item[data-type="distance"]');
        const valuesElement = document.querySelector('.type-item[data-type="values"]');
        const energyElement = document.querySelector('.type-item[data-type="energy"]');
        
        // デフォルトの感情表現
        if (emotionalElement) {
            const label = emotionalElement.querySelectorAll('span')[1];
            const img = emotionalElement.querySelector('img');
            if (label) label.textContent = 'ストレート告白型';
            if (img) {
                img.src = '/assets/images/love-types/emotional/straight.png';
                img.alt = 'ストレート告白型';
            }
        }
        
        // デフォルトの距離感
        if (distanceElement) {
            const label = distanceElement.querySelectorAll('span')[1];
            const img = distanceElement.querySelector('img');
            if (label) label.textContent = '安心セーフ型';
            if (img) {
                img.src = '/assets/images/love-types/distance/moderate.png';
                img.alt = '安心セーフ型';
            }
        }
        
        // デフォルトの価値観
        if (valuesElement) {
            const label = valuesElement.querySelectorAll('span')[1];
            const img = valuesElement.querySelector('img');
            if (label) label.textContent = 'ロマンチスト型';
            if (img) {
                img.src = '/assets/images/love-types/values/romantic.png';
                img.alt = 'ロマンチスト型';
            }
        }
        
        // デフォルトのエネルギー
        if (energyElement) {
            const label = energyElement.querySelectorAll('span')[1];
            const img = energyElement.querySelector('img');
            if (label) label.textContent = '燃え上がり型';
            if (img) {
                img.src = '/assets/images/love-types/energy/intense.png';
                img.alt = '燃え上がり型';
            }
        }
    }
    
    console.log('Updated 6 elements for pattern:', patternId);
}


// 恋愛タイプの表示を更新
async function updatePersonalityDisplay(profile) {
    console.log('updatePersonalityDisplay called with profile:', profile);
    
    // 英語キーから日本語表示名へのマッピング
    const emotionalMapping = {
        'straight': 'ストレート告白型',
        'physical': 'スキンシップ型',
        'subtle': 'さりげない気遣い型',
        'shy': '奥手シャイ型'
    };
    
    // 感情表現を更新（画像も含む）
    if (profile.emotionalExpression) {
        // 英語キーの場合は日本語に変換、既に日本語の場合はそのまま使用
        const displayName = emotionalMapping[profile.emotionalExpression] || profile.emotionalExpression;
        const element = document.getElementById('emotionalExpressionType');
        if (element) {
            console.log('Updating emotionalExpressionType:', profile.emotionalExpression, '->', displayName);
            element.textContent = displayName;
        } else {
            console.error('Element emotionalExpressionType not found');
        }
        await updateEmotionalExpressionContent(profile.emotionalExpression, profile);
        
        // 画像を更新（英語キーをそのまま使用）
        const emotionalImg = document.querySelector('.love-type-card:nth-child(1) img');
        if (emotionalImg) {
            const imageName = emotionalMapping[profile.emotionalExpression] ? profile.emotionalExpression : 'straight';
            emotionalImg.src = `/assets/images/love-types/emotional/${imageName}.png`;
        }
    }
    
    // 英語キーから日本語表示名へのマッピング
    const distanceMapping = {
        'close': 'ベッタリ依存型',
        'moderate': '安心セーフ型',
        'independent': '自由マイペース型',
        'cautious': '壁あり慎重型'
    };
    
    // 距離感を更新（画像も含む）
    if (profile.distanceStyle) {
        // 英語キーの場合は日本語に変換、既に日本語の場合はそのまま使用
        const displayName = distanceMapping[profile.distanceStyle] || profile.distanceStyle;
        document.getElementById('distanceStyleType').textContent = displayName;
        await updateDistanceStyleContent(profile.distanceStyle, profile);
        
        // 画像を更新（英語キーをそのまま使用）
        const distanceImg = document.querySelector('.love-type-card:nth-child(2) img');
        if (distanceImg) {
            const imageName = distanceMapping[profile.distanceStyle] ? profile.distanceStyle : 'moderate';
            distanceImg.src = `/assets/images/love-types/distance/${imageName}.png`;
        }
    }
    
    // 英語キーから日本語表示名へのマッピング
    const valuesMapping = {
        'romantic': 'ロマンチスト型',
        'realistic': 'リアリスト型',
        'excitement': '刺激ハンター型',
        'growth': '成長パートナー型'
    };
    
    // 価値観を更新（画像も含む）
    if (profile.loveValues) {
        // 英語キーの場合は日本語に変換、既に日本語の場合はそのまま使用
        const displayName = valuesMapping[profile.loveValues] || profile.loveValues;
        document.getElementById('loveValuesType').textContent = displayName;
        await updateLoveValuesContent(profile.loveValues, profile);
        
        // 画像を更新（英語キーをそのまま使用）
        const valuesImg = document.querySelector('.love-type-card:nth-child(3) img');
        if (valuesImg) {
            const imageName = valuesMapping[profile.loveValues] ? profile.loveValues : 'romantic';
            valuesImg.src = `/assets/images/love-types/values/${imageName}.png`;
        }
    }
    
    // 英語キーから日本語表示名へのマッピング
    const energyMapping = {
        'intense': '燃え上がり型',
        'stable': '持続型',
        'fluctuating': '波あり型',
        'cool': 'クール型'
    };
    
    // エネルギーを更新（画像も含む）
    if (profile.loveEnergy) {
        // 英語キーの場合は日本語に変換、既に日本語の場合はそのまま使用
        const displayName = energyMapping[profile.loveEnergy] || profile.loveEnergy;
        document.getElementById('loveEnergyType').textContent = displayName;
        await updateLoveEnergyContent(profile.loveEnergy, profile);
        
        // 画像を更新（英語キーをそのまま使用）
        const energyImg = document.querySelector('.love-type-card:nth-child(4) img');
        if (energyImg) {
            const imageName = energyMapping[profile.loveEnergy] ? profile.loveEnergy : 'intense';
            energyImg.src = `/assets/images/love-types/energy/${imageName}.png`;
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
                    🌙 より詳しい診断結果を見るには
                </h3>
                <p style="color: #fff; line-height: 1.8; margin-bottom: 20px;">
                    月詠のLINE公式アカウントで、あなただけの詳細な運勢をお届けします
                </p>
                <div style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p style="color: #87ceeb; font-size: 14px; margin-bottom: 10px;">
                        月詠のLINEで受けられること：
                    </p>
                    <ol style="text-align: left; color: #ccc; line-height: 1.8; margin: 0 auto; max-width: 400px;">
                        <li>今日の月齢に合わせた運勢メッセージ</li>
                        <li>毎週の運勢グラフ更新</li>
                        <li>月相別の開運アドバイス</li>
                        <li>あなただけの特別な月のメッセージ</li>
                    </ol>
                </div>
                <a href="https://line.me/R/ti/p/%40644vtivc" 
                   target="_blank"
                   style="display: inline-block; 
                          background: linear-gradient(135deg, #00b900 0%, #00a000 100%); 
                          color: white; 
                          padding: 15px 40px; 
                          border-radius: 30px; 
                          text-decoration: none; 
                          font-weight: bold; 
                          font-size: 16px; 
                          box-shadow: 0 4px 15px rgba(0,185,0,0.3); 
                          transition: transform 0.3s ease, box-shadow 0.3s ease; 
                          margin-top: 20px;"
                   onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0,185,0,0.4)';"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0,185,0,0.3)';">
                    🌙 LINE友だち追加
                </a>
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
    
    // 総合恋愛タイプ診断セクションは削除されたためコメントアウト
    /*
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
    */
}

async function updateUserDisplayContent(userData, profile = null) {
    const { name, moonPhase, hiddenMoonPhase, patternId } = userData;
    
    // まずローディングを表示
    showLoadingOverlay();
    
    try {
        // 占い文章を含む月相コンテンツを更新
        await updateMoonPhaseContent(patternId);
        
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
    
    // 月相情報を表示（非表示に変更）
    /*
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
    */
    
    // 運勢グラフを更新
    if (typeof updateFortuneGraph === 'function') {
        await updateFortuneGraph(patternId);
    }
    
    // カレンダーを生成
    if (typeof generatePersonalizedCalendar === 'function') {
        await generatePersonalizedCalendar(patternId);
    }
    
    // パターン固有のコンテンツを更新（パターンデータから）
    const patternData = await window.OtsukisamaDataLoader?.getPatternFortune(patternId);
    if (patternData) {
        updateDynamicContentFromPattern(patternData);
    }
    
        // 月相の解説を更新
        await updateMoonPhaseExplanations(moonPhase, hiddenMoonPhase);
        
        // すべての更新が完了してから少し待機（アニメーション完了を待つ）
        await new Promise(resolve => setTimeout(resolve, 100));
        
    } finally {
        // 最後にローディングを非表示
        hideLoadingOverlay();
    }
}

// ローディングオーバーレイを表示
function showLoadingOverlay() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

// ローディングオーバーレイを非表示
function hideLoadingOverlay() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// 動的コンテンツを更新する関数（パターンから）
async function updateDynamicContentFromPattern(pattern) {
    console.log('updateDynamicContentFromPattern called with pattern:', pattern);
    
    // 新しいFortuneDisplayシステムを使用
    if (window.FortuneDisplay) {
        console.log('Using new FortuneDisplay system');
        const fortuneDisplay = new FortuneDisplay();
        const patternId = pattern?.patternId || window.currentPatternId || 0;
        const userName = window.currentUserName || window.userName || '〇〇';
        
        // 新しいシステムで運勢を表示
        await fortuneDisplay.displayAllFortunes(patternId, userName);
        console.log('FortuneDisplay completed for pattern:', patternId);
        
        // 旧システムとの互換性のため、patternが存在する場合は続行
        if (!pattern || !pattern.overall) {
            console.log('No legacy pattern data, using only new system');
            return;
        }
    }
    
    // 旧システムのフォールバック
    if (!pattern || !pattern.overall) {
        console.warn('Pattern data not found or missing overall:', pattern);
        return;
    }
    console.log('Pattern has overall data (legacy):', pattern.overall);
    
    // ユーザー名を取得
    const userName = window.currentUserName || 'あなた';
    
    // 全体運のタイトルと導入文
    const overallTitle = document.getElementById('fortune-overall-title');
    if (overallTitle) overallTitle.textContent = replaceMonthPlaceholders(pattern.overall.title) || '運命の3ヶ月';
    
    const overallIntro = document.getElementById('fortune-overall-intro');
    if (overallIntro) {
        let introText = pattern.overall.intro || pattern.overall.mainText || '';
        
        // 新フォーマットの場合は各要素を結合
        if (pattern.overall.emotionalValidation || pattern.overall.reassurance || pattern.overall.reason) {
            introText = [
                pattern.overall.intro,
                pattern.overall.emotionalValidation,
                pattern.overall.reassurance,
                pattern.overall.reason,
                pattern.overall.pastValidation
            ].filter(Boolean).join('\n\n');
        }
        
        // 月の置換とユーザー名の置換
        introText = replaceMonthPlaceholders(introText);
        introText = introText.replace(/〇〇/g, userName);
        
        overallIntro.textContent = introText;
    }
    
    // アクションステップがある場合は表示
    if (pattern.overall.actionSteps && pattern.overall.actionSteps.length > 0) {
        const actionStepsContainer = document.getElementById('fortune-overall-action-steps');
        if (actionStepsContainer) {
            const steps = pattern.overall.actionSteps.map(step => {
                let stepText = replaceMonthPlaceholders(step);
                stepText = stepText.replace(/〇〇/g, userName);
                return `• ${stepText}`;
            }).join('\n');
            actionStepsContainer.textContent = steps;
        }
    }
    
    // 全体運の月別タイトルと説明を更新
    // 全体運の月別表示（全体運は残す）
    const destinySection = document.querySelector('.fortune-section.destiny');
    if (destinySection) {
        const monthBoxes = destinySection.querySelectorAll('.month-box');
        if (monthBoxes.length >= 3 && pattern.overall) {
            const overallMonthTitles = [
                pattern.overall.month1?.title, 
                pattern.overall.month2?.title, 
                pattern.overall.month3?.title
            ];
            const overallMonthTexts = [
                pattern.overall.month1?.text,
                pattern.overall.month2?.text,
                pattern.overall.month3?.text
            ];
            
            monthBoxes.forEach((box, index) => {
                if (index < 3) {
                    const h3 = box.querySelector('h3');
                    const p = box.querySelector('p');
                    if (h3) h3.textContent = overallMonthTitles[index] || `${index + 1}ヶ月目の展開`;
                    if (p) p.textContent = overallMonthTexts[index] || `${index + 1}ヶ月目の詳細な運勢...`;
                }
            });
        }
    }
    
    // 注意ポイント
    const overallCautionBox = document.querySelector('.fortune-section.destiny .point-box p');
    if (overallCautionBox) {
        overallCautionBox.textContent = pattern.overall.caution || '慎重に行動することが大切です。';
    }
    
    // 転機のアドバイス
    const destinyContent = document.querySelector('.fortune-section.destiny .fortune-content');
    if (destinyContent) {
        // 転機のアドバイス段落を更新
        const transitionPara = destinyContent.querySelector('p:not(.fortune-overall-text)');
        if (transitionPara && pattern.overall.transitionAdvice) {
            transitionPara.textContent = pattern.overall.transitionAdvice;
        }
        
        // criticalTimingsも削除されたため、この処理も削除
    }
    
    // 恋愛運のメインテキスト
    const loveMainText = document.getElementById('fortune-love-text');
    if (loveMainText && pattern.love) {
        let loveText = pattern.love.mainText || '';
        loveText = replaceMonthPlaceholders(loveText);
        loveText = loveText.replace(/〇〇/g, userName);
        loveMainText.textContent = loveText;
    }
    
    // 恋愛運の新規セクション
    if (pattern.love) {
        const destinyMeeting = document.getElementById('fortune-love-destiny-meeting');
        if (destinyMeeting) {
            let text = pattern.love.destinyMeeting || '';
            text = replaceMonthPlaceholders(text);
            text = text.replace(/〇〇/g, userName);
            destinyMeeting.textContent = text;
        }
        
        const admirerType = document.getElementById('fortune-love-admirer-type');
        if (admirerType) {
            let text = pattern.love.admirerType || '';
            text = replaceMonthPlaceholders(text);
            text = text.replace(/〇〇/g, userName);
            admirerType.textContent = text;
        }
        
        const dangerousType = document.getElementById('fortune-love-dangerous-type');
        if (dangerousType) {
            let text = pattern.love.dangerousType || '';
            text = replaceMonthPlaceholders(text);
            text = text.replace(/〇〇/g, userName);
            dangerousType.textContent = text;
        }
    }
    
    // month1, month2, month3関連の処理は削除
    const loveSection = document.querySelector('.fortune-section.love');
    if (loveSection && pattern.love) {
        // 恋愛の注意ポイント
        const loveCautionBox = loveSection.querySelector('.point-box p');
        if (loveCautionBox) {
            loveCautionBox.textContent = pattern.love.caution || '相手の気持ちも大切にしましょう。';
        }
    }
    
    // 仕事運のタイトル、メインテキスト
    const workTitle = document.getElementById('fortune-work-title');
    if (workTitle && pattern.work) workTitle.textContent = pattern.work.title || '仕事運の展開';
    
    const workMainText = document.getElementById('fortune-work-text');
    if (workMainText && pattern.work) {
        let text = pattern.work.mainText || '';
        text = replaceMonthPlaceholders(text);
        text = text.replace(/〇〇/g, userName);
        workMainText.textContent = text;
    }
    
    // 人間関係の転機と注意
    const relationshipSection = document.querySelector('.fortune-section.relationship');
    if (relationshipSection) {
        const transitionDiv = relationshipSection.querySelector('.highlight-banner + p');
        if (transitionDiv) {
            transitionDiv.textContent = pattern.relationship.transition || '人間関係に変化が訪れます。';
        }
        
        const relationshipCaution = relationshipSection.querySelector('.point-box p');
        if (relationshipCaution) {
            relationshipCaution.textContent = pattern.relationship.caution || '周囲との調和を大切にしましょう。';
        }
    }
    
    // 人間関係運の新規セクション
    if (pattern.relationship) {
        const newConnections = document.getElementById('fortune-relationship-new-connections');
        if (newConnections) {
            let text = pattern.relationship.newConnections || '';
            text = replaceMonthPlaceholders(text);
            text = text.replace(/〇〇/g, userName);
            newConnections.textContent = text;
        }
        
        const challenges = document.getElementById('fortune-relationship-challenges');
        if (challenges) {
            // デフォルトテキストを設定
            const defaultChallengesText = '切るべき縁は、あなたの成長を阻害し、エネルギーを奪う人たち。一方的に依存してくる人、否定的な言葉ばかりを投げかける人、あなたの可能性を信じない人とは距離を置きましょう。繋ぐべき縁は、互いに高め合い、前向きなエネルギーを共有できる人たちです。';
            let text = (pattern.relationship && pattern.relationship.challengesAndSolutions) || defaultChallengesText;
            text = replaceMonthPlaceholders(text);
            text = text.replace(/〇〇/g, userName);
            challenges.textContent = text;
        }
    }
    
    // 金運のピークタイミング
    const moneySection = document.querySelector('.fortune-section.money');
    if (moneySection) {
        const peakTimingDiv = moneySection.querySelector('.highlight-banner + p');
        if (peakTimingDiv) {
            peakTimingDiv.textContent = pattern.money.peakTiming || '金運が上昇する時期です。';
        }
    }
    
    // 金運の新規セクション
    if (pattern.money) {
        const moneyTrouble = document.getElementById('fortune-money-trouble');
        if (moneyTrouble) {
            let text = pattern.money.moneyTrouble || '';
            text = replaceMonthPlaceholders(text);
            text = text.replace(/〇〇/g, userName);
            moneyTrouble.textContent = text;
        }
    }
    
    // 各運勢のメインテキストを設定
    // 全体運
    const overallText = document.getElementById('fortune-overall-text');
    console.log('Setting overall text:', {
        element: overallText,
        hasPattern: !!pattern.overall,
        mainText: pattern.overall?.mainText?.substring(0, 50)
    });
    if (overallText && pattern.overall && pattern.overall.mainText) {
        let text = pattern.overall.mainText;
        text = replaceMonthPlaceholders(text);
        text = text.replace(/〇〇/g, userName);
        overallText.textContent = text;
        console.log('Overall text set successfully');
    } else {
        console.log('Failed to set overall text');
    }
    
    // 恋愛運
    const loveText = document.getElementById('fortune-love-text');
    if (loveText && pattern.love && pattern.love.mainText) {
        let text = pattern.love.mainText;
        text = replaceMonthPlaceholders(text);
        text = text.replace(/〇〇/g, userName);
        loveText.textContent = text;
        console.log('Love text set successfully');
    }
    
    // 仕事運
    const workText = document.getElementById('fortune-work-text');
    if (workText && pattern.work && pattern.work.mainText) {
        let text = pattern.work.mainText;
        text = replaceMonthPlaceholders(text);
        text = text.replace(/〇〇/g, userName);
        workText.textContent = text;
        console.log('Work text set successfully');
    }
    
    // 仕事運の新規セクション
    if (pattern.work) {
        const newTalent = document.getElementById('fortune-work-new-talent');
        if (newTalent) {
            const defaultTalentText = 'この3ヶ月で開花するのは、あなたの中に眠っていたリーダーシップの才能。今までは裏方に徹していたあなたが、チームを率いる立場に立つことになります。また、クリエイティブなアイデアを形にする力も向上し、周りから注目される成果を上げるでしょう。';
            let text = (pattern.work && pattern.work.newTalent) || defaultTalentText;
            text = replaceMonthPlaceholders(text);
            text = text.replace(/〇〇/g, userName);
            newTalent.textContent = text;
            console.log('Work new talent set successfully');
        }
        
        const turningPoint = document.getElementById('fortune-work-turning-point');
        if (turningPoint) {
            const defaultTurningText = '診断から2ヶ月目の第3週頃、重要な転機が訪れます。新しいプロジェクトへの参加打診、昇進の話、転職のチャンスなど、キャリアを大きく変える出来事が起こりそう。そのサインは、上司からの思いがけない声かけや、突然のミーティング設定として現れるでしょう。';
            let text = (pattern.work && pattern.work.turningPoint) || defaultTurningText;
            text = replaceMonthPlaceholders(text);
            text = text.replace(/〇〇/g, userName);
            turningPoint.textContent = text;
            console.log('Work turning point set successfully');
        }
    }
    
    // 人間関係運のメインテキスト
    const relationshipText = document.getElementById('fortune-relationship-text');
    if (relationshipText && pattern.relationship && pattern.relationship.mainText) {
        let text = pattern.relationship.mainText;
        text = replaceMonthPlaceholders(text);
        text = text.replace(/〇〇/g, userName);
        relationshipText.textContent = text;
        console.log('Relationship text set successfully');
    }
    
    // 金運のメインテキスト
    const moneyText = document.getElementById('fortune-money-text');
    if (moneyText && pattern.money && pattern.money.mainText) {
        let text = pattern.money.mainText;
        text = replaceMonthPlaceholders(text);
        text = text.replace(/〇〇/g, userName);
        moneyText.textContent = text;
        console.log('Money text set successfully');
    }
    
    // 最後の祝福メッセージを月相に応じて更新
    const finalBlessingMessage = document.getElementById('final-blessing-message');
    if (finalBlessingMessage && pattern.moonPhase) {
        const blessingMessages = {
            '新月': '新月の光があなたの道を照らしますように',
            '三日月': '三日月の優しい光があなたを包みますように',
            '上弦の月': '上弦の月の力強さがあなたを支えますように',
            '十三夜': '十三夜の神秘的な輝きがあなたを導きますように',
            '満月': '満月の祝福があなたに降り注ぎますように',
            '十六夜': '十六夜の穏やかな光があなたに安らぎをもたらしますように',
            '下弦の月': '下弦の月の知恵があなたを正しい道へ導きますように',
            '暁': '暁の月の新しい始まりがあなたに希望をもたらしますように'
        };
        const message = blessingMessages[pattern.moonPhase] || '月の光があなたの道を照らしますように';
        finalBlessingMessage.textContent = `「${message}」`;
        console.log('Final blessing message updated for moon phase:', pattern.moonPhase);
    }
}

// 各タイプの説明を更新する関数
async function updateEmotionalExpressionContent(type, profile) {
    // データが読み込まれていない場合は読み込む
    if (!personalityAxesData) {
        await loadPersonalityAxesData();
    }
    
    const element = document.getElementById('emotionalExpressionContent');
    if (!element || !personalityAxesData) return;
    
    // 英語キーから日本語キーへのマッピング
    const keyMapping = {
        'straight': 'ストレート告白型',
        'physical': 'スキンシップ型',
        'subtle': 'さりげない気遣い型',
        'shy': '奥手シャイ型'
    };
    
    // 英語キーの場合は日本語に変換
    const japaneseKey = keyMapping[type] || type;
    
    const typeData = personalityAxesData.emotionalExpression[japaneseKey];
    if (typeData) {
        // profileから直接ユーザー名を取得
        const userName = profile?.userName || profile?.name || window.currentUserName || 'あなた';
        let htmlContent = '';
        
        // 説明文を追加（HTMLタグ含む）
        if (window.TextFormatter) {
            htmlContent = window.TextFormatter.formatDescription(typeData.description, userName);
        } else {
            htmlContent = typeData.description.replace(/〇〇/g, userName);
        }
        
        // 相性セクションを追加
        if (typeData.compatibility) {
            htmlContent += `
                <div class="compatibility-section" style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                    <h4 style="color: #ffd700; margin-bottom: 15px; font-size: 16px;">
                        🌙 ${userName}さんと周りの相性
                    </h4>
                    <div style="margin-bottom: 15px;">
                        <h5 style="color: #87ceeb; margin-bottom: 8px; font-size: 14px;">良い相性</h5>
                        <p style="color: #fff; line-height: 1.6; margin: 0;">
                            ${typeData.compatibility.good.replace(/〇〇/g, userName)}
                        </p>
                    </div>
                    <div>
                        <h5 style="color: #ff9999; margin-bottom: 8px; font-size: 14px;">悪い相性</h5>
                        <p style="color: #fff; line-height: 1.6; margin: 0;">
                            ${typeData.compatibility.bad.replace(/〇〇/g, userName)}
                        </p>
                    </div>
                </div>
            `;
        }
        
        element.innerHTML = htmlContent;
    }
}

async function updateDistanceStyleContent(type, profile) {
    // データが読み込まれていない場合は読み込む
    if (!personalityAxesData) {
        await loadPersonalityAxesData();
    }
    
    const element = document.getElementById('distanceStyleContent');
    if (!element || !personalityAxesData) return;
    
    // 英語キーから日本語キーへのマッピング
    const keyMapping = {
        'close': 'ベッタリ依存型',
        'moderate': '安心セーフ型',
        'independent': '自由マイペース型',
        'cautious': '壁あり慎重型'
    };
    
    // 英語キーの場合は日本語に変換
    const japaneseKey = keyMapping[type] || type;
    
    const typeData = personalityAxesData.distanceStyle[japaneseKey];
    if (typeData) {
        // profileから直接ユーザー名を取得
        const userName = profile?.userName || profile?.name || window.currentUserName || 'あなた';
        let htmlContent = '';
        
        // 説明文を追加（HTMLタグ含む）
        if (window.TextFormatter) {
            htmlContent = window.TextFormatter.formatDescription(typeData.description, userName);
        } else {
            htmlContent = typeData.description.replace(/〇〇/g, userName);
        }
        
        // 相性セクションを追加
        if (typeData.compatibility) {
            htmlContent += `
                <div class="compatibility-section" style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                    <h4 style="color: #ffd700; margin-bottom: 15px; font-size: 16px;">
                        🌙 ${userName}さんと周りの相性
                    </h4>
                    <div style="margin-bottom: 15px;">
                        <h5 style="color: #87ceeb; margin-bottom: 8px; font-size: 14px;">良い相性</h5>
                        <p style="color: #fff; line-height: 1.6; margin: 0;">
                            ${typeData.compatibility.good.replace(/〇〇/g, userName)}
                        </p>
                    </div>
                    <div>
                        <h5 style="color: #ff9999; margin-bottom: 8px; font-size: 14px;">悪い相性</h5>
                        <p style="color: #fff; line-height: 1.6; margin: 0;">
                            ${typeData.compatibility.bad.replace(/〇〇/g, userName)}
                        </p>
                    </div>
                </div>
            `;
        }
        
        element.innerHTML = htmlContent;
    }
}

async function updateLoveValuesContent(type, profile) {
    // データが読み込まれていない場合は読み込む
    if (!personalityAxesData) {
        await loadPersonalityAxesData();
    }
    
    const element = document.getElementById('loveValuesContent');
    if (!element || !personalityAxesData) return;
    
    // 英語キーから日本語キーへのマッピング
    const keyMapping = {
        'romantic': 'ロマンチスト型',
        'realistic': 'リアリスト型',
        'excitement': '刺激ハンター型',
        'growth': '成長パートナー型'
    };
    
    // 英語キーの場合は日本語に変換
    const japaneseKey = keyMapping[type] || type;
    
    const typeData = personalityAxesData.loveValues[japaneseKey];
    if (typeData) {
        // profileから直接ユーザー名を取得
        const userName = profile?.userName || profile?.name || window.currentUserName || 'あなた';
        let htmlContent = '';
        
        // 説明文を追加（HTMLタグ含む）
        if (window.TextFormatter) {
            htmlContent = window.TextFormatter.formatDescription(typeData.description, userName);
        } else {
            htmlContent = typeData.description.replace(/〇〇/g, userName);
        }
        
        // 相性セクションを追加
        if (typeData.compatibility) {
            htmlContent += `
                <div class="compatibility-section" style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                    <h4 style="color: #ffd700; margin-bottom: 15px; font-size: 16px;">
                        🌙 ${userName}さんと周りの相性
                    </h4>
                    <div style="margin-bottom: 15px;">
                        <h5 style="color: #87ceeb; margin-bottom: 8px; font-size: 14px;">良い相性</h5>
                        <p style="color: #fff; line-height: 1.6; margin: 0;">
                            ${typeData.compatibility.good.replace(/〇〇/g, userName)}
                        </p>
                    </div>
                    <div>
                        <h5 style="color: #ff9999; margin-bottom: 8px; font-size: 14px;">悪い相性</h5>
                        <p style="color: #fff; line-height: 1.6; margin: 0;">
                            ${typeData.compatibility.bad.replace(/〇〇/g, userName)}
                        </p>
                    </div>
                </div>
            `;
        }
        
        element.innerHTML = htmlContent;
    }
}

async function updateLoveEnergyContent(type, profile) {
    // データが読み込まれていない場合は読み込む
    if (!personalityAxesData) {
        await loadPersonalityAxesData();
    }
    
    const element = document.getElementById('loveEnergyContent');
    if (!element || !personalityAxesData) return;
    
    // 英語キーから日本語キーへのマッピング
    const keyMapping = {
        'intense': '燃え上がり型',
        'stable': '持続型',
        'fluctuating': '波あり型',
        'cool': 'クール型'
    };
    
    // 英語キーの場合は日本語に変換
    const japaneseKey = keyMapping[type] || type;
    
    const typeData = personalityAxesData.energyType[japaneseKey];
    if (typeData) {
        // profileから直接ユーザー名を取得
        const userName = profile?.userName || profile?.name || window.currentUserName || 'あなた';
        let htmlContent = '';
        
        // 説明文を追加（HTMLタグ含む）
        if (window.TextFormatter) {
            htmlContent = window.TextFormatter.formatDescription(typeData.description, userName);
        } else {
            htmlContent = typeData.description.replace(/〇〇/g, userName);
        }
        
        // 相性セクションを追加
        if (typeData.compatibility) {
            htmlContent += `
                <div class="compatibility-section" style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 10px;">
                    <h4 style="color: #ffd700; margin-bottom: 15px; font-size: 16px;">
                        🌙 ${userName}さんと周りの相性
                    </h4>
                    <div style="margin-bottom: 15px;">
                        <h5 style="color: #87ceeb; margin-bottom: 8px; font-size: 14px;">良い相性</h5>
                        <p style="color: #fff; line-height: 1.6; margin: 0;">
                            ${typeData.compatibility.good.replace(/〇〇/g, userName)}
                        </p>
                    </div>
                    <div>
                        <h5 style="color: #ff9999; margin-bottom: 8px; font-size: 14px;">悪い相性</h5>
                        <p style="color: #fff; line-height: 1.6; margin: 0;">
                            ${typeData.compatibility.bad.replace(/〇〇/g, userName)}
                        </p>
                    </div>
                </div>
            `;
        }
        
        element.innerHTML = htmlContent;
    }
}

// 削除 - JSONから直接読み込むため不要

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
            if (descElement) {
                // テキストフォーマッターを使用してユーザー名を置換
                // この関数内ではprofileが渡されていないため、window.currentUserNameを使用
                const userName = window.currentUserName || 'あなた';
                if (window.TextFormatter) {
                    descElement.innerHTML = window.TextFormatter.formatDescription(moonPhaseDesc.description, userName);
                } else {
                    descElement.textContent = moonPhaseDesc.description;
                }
            }
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
