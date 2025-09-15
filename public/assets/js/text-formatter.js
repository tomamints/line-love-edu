/**
 * テキストフォーマッター
 * 診断結果のテキストを適切にフォーマットする
 */

window.TextFormatter = {
    /**
     * テキスト内の〇〇さんをユーザー名に置換し、箇条書きをHTMLに変換
     * @param {string} text - 元のテキスト
     * @param {string} userName - ユーザー名
     * @returns {string} - フォーマット済みHTML
     */
    formatDescription: function(text, userName = 'あなた') {
        if (!text) return '';
        
        // 〇〇さんをユーザー名に置換
        let formatted = text.replace(/〇〇さん/g, userName + 'さん');
        
        // 改行を<br>に変換（ただし箇条書きの前後は特別処理）
        const lines = formatted.split('\n');
        const htmlLines = [];
        let inList = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('・')) {
                // 箇条書きの開始
                if (!inList) {
                    htmlLines.push('<ul class="personality-list">');
                    inList = true;
                }
                // 箇条書きアイテム
                htmlLines.push(`<li>${line.substring(1).trim()}</li>`);
            } else {
                // 箇条書きの終了
                if (inList && line !== '') {
                    htmlLines.push('</ul>');
                    inList = false;
                }
                
                if (line !== '') {
                    // 通常の段落
                    if (line.includes('こんな瞬間、ありませんか？')) {
                        htmlLines.push(`<p class="question-intro"><strong>${line}</strong></p>`);
                    } else if (line.startsWith('🌙')) {
                        htmlLines.push(`<p class="moon-section">${line}</p>`);
                    } else {
                        htmlLines.push(`<p>${line}</p>`);
                    }
                }
            }
        }
        
        // 最後に箇条書きが開いていたら閉じる
        if (inList) {
            htmlLines.push('</ul>');
        }
        
        return htmlLines.join('');
    },
    
    /**
     * 相性情報をフォーマット
     * @param {object} compatibility - 相性情報オブジェクト
     * @param {string} userName - ユーザー名
     * @returns {string} - フォーマット済みHTML
     */
    formatCompatibility: function(compatibility, userName = 'あなた') {
        if (!compatibility) return '';
        
        let html = '<div class="compatibility-section">';
        html += '<h4>🌙 相性</h4>';
        
        if (compatibility.good) {
            const goodText = compatibility.good.replace(/〇〇さん/g, userName + 'さん');
            html += `<div class="compatibility-good">
                <span class="compatibility-label">良い相性：</span>
                <span>${goodText}</span>
            </div>`;
        }
        
        if (compatibility.bad) {
            const badText = compatibility.bad.replace(/〇〇さん/g, userName + 'さん');
            html += `<div class="compatibility-bad">
                <span class="compatibility-label">注意が必要な相性：</span>
                <span>${badText}</span>
            </div>`;
        }
        
        html += '</div>';
        return html;
    },
    
    /**
     * シンプルなテキスト置換（HTMLタグなし）
     * @param {string} text - 元のテキスト
     * @param {string} userName - ユーザー名
     * @returns {string} - 置換済みテキスト
     */
    replaceUserName: function(text, userName = 'あなた') {
        if (!text) return '';
        return text.replace(/〇〇さん/g, userName + 'さん');
    }
};

// スタイルを追加
if (!document.getElementById('text-formatter-styles')) {
    const style = document.createElement('style');
    style.id = 'text-formatter-styles';
    style.innerHTML = `
        .personality-list {
            list-style: none;
            padding-left: 0;
            margin: 1em 0;
        }
        
        .personality-list li {
            position: relative;
            padding-left: 1.5em;
            margin-bottom: 0.5em;
            line-height: 1.6;
        }
        
        .personality-list li:before {
            content: "・";
            position: absolute;
            left: 0;
        }
        
        .question-intro {
            margin-top: 1.5em;
            margin-bottom: 1em;
            color: #764ba2;
        }
        
        .moon-section {
            margin-top: 1.5em;
            font-weight: bold;
            color: #667eea;
        }
        
        .compatibility-section {
            margin-top: 2em;
            padding: 1em;
            background: rgba(118, 75, 162, 0.05);
            border-radius: 8px;
        }
        
        .compatibility-section h4 {
            margin-top: 0;
            color: #764ba2;
        }
        
        .compatibility-good,
        .compatibility-bad {
            margin: 0.5em 0;
            padding: 0.5em;
            border-left: 3px solid;
        }
        
        .compatibility-good {
            border-color: #10b981;
            background: rgba(16, 185, 129, 0.05);
        }
        
        .compatibility-bad {
            border-color: #f59e0b;
            background: rgba(245, 158, 11, 0.05);
        }
        
        .compatibility-label {
            font-weight: bold;
            display: block;
            margin-bottom: 0.25em;
        }
    `;
    document.head.appendChild(style);
}