#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json

# 月相の名前
moon_phases = ["新月", "三日月", "上弦の月", "十三夜", "満月", "十六夜", "下弦の月", "暁"]

# 各月相に基づく才能の特徴
talent_characteristics = {
    "新月": "創造的発想力と革新性",
    "三日月": "柔軟な適応力と成長力",
    "上弦の月": "実行力と推進力",
    "十三夜": "洞察力と分析力",
    "満月": "リーダーシップと影響力",
    "十六夜": "調整力と協調性",
    "下弦の月": "整理力と効率化能力",
    "暁": "直感力と先見性"
}

# 裏月相による才能の深層
hidden_talent_depth = {
    "新月": "ゼロから価値を生み出す力",
    "三日月": "人を育てる指導力",
    "上弦の月": "困難を突破する力",
    "十三夜": "本質を見抜く力",
    "満月": "人を魅了する力",
    "十六夜": "場を和ませる力",
    "下弦の月": "無駄を省く力",
    "暁": "未来を読む力"
}

# 転機のタイプ
turning_point_types = {
    "新月": {"type": "新規プロジェクトの立ち上げ", "sign": "アイデアが次々と湧いてくる"},
    "三日月": {"type": "スキルアップの機会", "sign": "学びたい欲求が高まる"},
    "上弦の月": {"type": "昇進・昇格のチャンス", "sign": "責任ある仕事を任される"},
    "十三夜": {"type": "専門性を活かす機会", "sign": "あなたの知識が求められる"},
    "満月": {"type": "大きな成果・達成", "sign": "努力が実を結ぶ兆し"},
    "十六夜": {"type": "人脈拡大の好機", "sign": "新しい出会いが増える"},
    "下弦の月": {"type": "業務改革・効率化", "sign": "改善点が見えてくる"},
    "暁": {"type": "独立・起業のタイミング", "sign": "自分の道が明確になる"}
}

def generate_new_talent(moon_phase, hidden_phase):
    """新たな才能セクションの生成"""
    primary = talent_characteristics[moon_phase]
    secondary = hidden_talent_depth[hidden_phase]
    
    templates = [
        f"これまで眠っていたあなたの{primary}が、今後3ヶ月で急速に開花します。特に{secondary}が強化され、周囲から一目置かれる存在に。1ヶ月目は小さな成功体験を積み重ね、2ヶ月目には具体的な成果が表れ始め、3ヶ月目には新しいポジションやプロジェクトのオファーが舞い込むでしょう。",
        
        f"あなたの中に秘められた{primary}が、ついに表舞台へ。{secondary}と組み合わさることで、これまでにない独自の価値を生み出します。最初は自分でも驚くような能力の発現に戸惑うかもしれませんが、それはあなたが次のステージへ進む準備が整った証。積極的に新しい挑戦を受け入れることで、キャリアが大きく飛躍します。",
        
        f"潜在能力として存在していた{primary}が、環境の変化により急激に覚醒します。{secondary}という武器を手に入れることで、今まで苦手だと思っていた分野でも活躍できるように。特に診断から6週間後と10週間後に大きな成長の波が訪れ、3ヶ月後には別人のような実力を身につけているでしょう。",
        
        f"{primary}という才能が、予期せぬ形で開花の時を迎えます。{secondary}がその触媒となり、あなたの仕事ぶりに革命的な変化をもたらすでしょう。周囲はあなたの変化に最初は驚きますが、すぐにその価値を認識し、重要な役割を任せるようになります。この才能を活かせる環境に身を置くことが成功の鍵。"
    ]
    
    # パターンに基づいて選択
    pattern_index = (moon_phases.index(moon_phase) + moon_phases.index(hidden_phase)) % len(templates)
    return templates[pattern_index]

def generate_turning_point(moon_phase, hidden_phase):
    """転機とサインセクションの生成"""
    primary_turning = turning_point_types[moon_phase]
    secondary_turning = turning_point_types[hidden_phase]
    
    templates = [
        f"運命の転機は「{primary_turning['type']}」という形で訪れます。最初のサインは{primary_turning['sign']}こと。さらに{secondary_turning['sign']}状況も重なり、これは明確な天からのメッセージ。転機は診断から約4～6週間後に最初の兆候が現れ、2ヶ月目には具体的な選択を迫られます。この機会を逃さないために、日頃から準備を怠らないことが大切です。",
        
        f"あなたのキャリアを変える転機「{primary_turning['type']}」が近づいています。{primary_turning['sign']}という前兆に加え、{secondary_turning['type']}の可能性も浮上。これらは偶然ではなく、あなたの成長に必要な試練と機会です。特に注目すべきは上司や同僚からの何気ない一言。そこに大きなヒントが隠されています。勇気を持って一歩踏み出せば、想像以上の成果が待っています。",
        
        f"まもなく訪れる「{primary_turning['type']}」があなたの人生を大きく変えます。{primary_turning['sign']}という明確なサインが出たら、迷わず行動を。同時期に{secondary_turning['sign']}状況も生まれ、二重の追い風が吹きます。この3ヶ月は5年分の成長に匹敵する濃密な期間となるでしょう。チャンスの扉は一度しか開きません。準備万端で臨んでください。",
        
        f"転機の本質は「{primary_turning['type']}」にあります。すでに{primary_turning['sign']}という予兆が始まっているはず。さらに{secondary_turning['type']}という別の可能性も同時進行で動き出します。この二つの流れが合流する瞬間が、あなたの運命の分岐点。直感を信じて行動すれば、今まで見えなかった扉が次々と開いていくでしょう。"
    ]
    
    # パターンに基づいて選択
    pattern_index = (moon_phases.index(moon_phase) * 2 + moon_phases.index(hidden_phase)) % len(templates)
    return templates[pattern_index]

def update_json_with_work_content():
    """既存のJSONファイルに仕事運の新規コンテンツを追加"""
    
    # 既存のJSONファイルを読み込み
    with open('public/data/otsukisama-patterns-v3.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 各パターンに新しい仕事運コンテンツを追加
    for i in range(64):
        moon_phase = moon_phases[i // 8]
        hidden_phase = moon_phases[i % 8]
        pattern_key = str(i)
        
        if pattern_key in data:
            # work セクションが存在しない場合は作成
            if 'work' not in data[pattern_key]:
                data[pattern_key]['work'] = {}
            
            # 新しいフィールドを追加
            data[pattern_key]['work']['newTalent'] = generate_new_talent(moon_phase, hidden_phase)
            data[pattern_key]['work']['turningPoint'] = generate_turning_point(moon_phase, hidden_phase)
            
            print(f"Pattern {i} ({moon_phase} × {hidden_phase}): Work content added")
    
    # 更新したJSONを保存
    with open('public/data/otsukisama-patterns-v3.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print("\nAll patterns updated with new work content!")
    
    # サンプル出力
    print("\n=== Sample Output (Pattern 0) ===")
    print(f"New Talent: {data['0']['work']['newTalent'][:100]}...")
    print(f"Turning Point: {data['0']['work']['turningPoint'][:100]}...")

if __name__ == "__main__":
    update_json_with_work_content()