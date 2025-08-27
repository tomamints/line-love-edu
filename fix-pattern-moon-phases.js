#!/usr/bin/env node

/**
 * otsukisama-patterns-complete.jsonの月相データを修正するスクリプト
 * パターンIDから正しい月相を計算して更新
 */

const fs = require('fs');
const path = require('path');

// 月相名の定義
const moonPhaseNames = ['新月', '三日月', '上弦の月', '十三夜', '満月', '十六夜', '下弦の月', '暁'];

// パターンIDから月相を計算
function getMoonPhaseFromPatternId(patternId) {
    const moonPhaseIndex = Math.floor(patternId / 8);
    const hiddenPhaseIndex = patternId % 8;
    
    return {
        moonPhase: moonPhaseNames[moonPhaseIndex],
        hiddenPhase: moonPhaseNames[hiddenPhaseIndex]
    };
}

// メイン処理
function fixPatternMoonPhases() {
    const filePath = path.join(__dirname, 'public/data/otsukisama-patterns-complete.json');
    
    // ファイルを読み込み
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 各パターンの月相を修正
    let fixedCount = 0;
    for (let i = 0; i < 64; i++) {
        const pattern = data[i];
        if (pattern) {
            const { moonPhase, hiddenPhase } = getMoonPhaseFromPatternId(i);
            
            // 現在の値と比較
            const needsFix = pattern.moonPhase !== moonPhase || pattern.hiddenPhase !== hiddenPhase;
            
            if (needsFix) {
                console.log(`Pattern ${i}: ${pattern.moonPhase}×${pattern.hiddenPhase} → ${moonPhase}×${hiddenPhase}`);
                pattern.moonPhase = moonPhase;
                pattern.hiddenPhase = hiddenPhase;
                fixedCount++;
            }
        }
    }
    
    // ファイルを保存
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`\n修正完了: ${fixedCount}件のパターンを更新しました`);
}

// 実行
fixPatternMoonPhases();