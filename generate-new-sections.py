#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import random

# 月相の名前
MOON_PHASES = [
    "新月", "三日月", "上弦の月", "十三夜",
    "満月", "十六夜", "下弦の月", "暁"
]

# 月相の特性
MOON_CHARACTERISTICS = {
    "新月": "始まり",
    "三日月": "成長",
    "上弦の月": "決断",
    "十三夜": "調和",
    "満月": "完成",
    "十六夜": "洞察",
    "下弦の月": "解放",
    "暁": "内省"
}

def generate_destiny_meeting_text(moon_phase, hidden_phase):
    """運命的な出会いのテキストを生成"""
    main_char = MOON_CHARACTERISTICS[moon_phase]
    hidden_char = MOON_CHARACTERISTICS[hidden_phase]
    
    templates = [
        f"{moon_phase}と{hidden_phase}の組み合わせが示す運命的な出会いは、{main_char}の時期に{hidden_char}の要素を持つ人物との出会いとして現れます。診断から2ヶ月目の第2週頃、あなたの人生を大きく変える可能性を秘めた人物が現れるでしょう。その人は一見すると普通の出会いに見えますが、後々振り返ると運命だったと感じる特別な存在となります。初対面で心が共鳴し、言葉を交わさなくても通じ合える不思議な感覚を覚えるはずです。",
        f"この3ヶ月間、{main_char}のエネルギーが強まる時期に、{hidden_char}の資質を持つ運命の人が現れる可能性が高いです。特に1ヶ月目の満月の夜から3日以内が重要な出会いのタイミング。その人とは偶然の出会いのように見えて、実は宇宙が仕組んだ必然的な出会いです。相手の瞳を見た瞬間、時が止まったような感覚に襲われ、この人だという直感が働くでしょう。",
        f"{main_char}と{hidden_char}の波動が共鳴する今期、運命的な出会いは意外な場所で訪れます。書店、カフェ、セミナー会場など、知的好奇心を満たす場所での出会いが期待できます。相手は{hidden_char}の要素を強く持ち、あなたの{main_char}の力を最大限に引き出してくれる存在。一緒にいると自然体でいられ、成長できる関係を築けるでしょう。"
    ]
    
    return random.choice(templates)

def generate_admirer_type_text(moon_phase, hidden_phase):
    """恋の矢を向ける相手のタイプのテキストを生成"""
    main_char = MOON_CHARACTERISTICS[moon_phase]
    hidden_char = MOON_CHARACTERISTICS[hidden_phase]
    
    templates = [
        f"あなたに密かに想いを寄せているのは、{main_char}の魅力に惹かれる知的で落ち着いた雰囲気の人物。年齢はあなたより2〜5歳年上で、仕事や趣味で一定の成果を上げている人です。表面的にはクールに見えますが、内面は{hidden_char}の要素を理解し共感できる繊細さを持っています。あなたの言動をさりげなく観察し、タイミングを見計らってアプローチしてくるでしょう。",
        f"今後3ヶ月、あなたの{main_char}のオーラに魅了される人物が現れます。その人は創造的な仕事に従事し、{hidden_char}の深さを理解できる感性の持ち主。SNSであなたの投稿をチェックしたり、共通の知人を通じて情報を集めたりと、積極的にあなたを知ろうとしています。見た目は爽やかで親しみやすく、会話も上手な社交的なタイプです。",
        f"あなたの{main_char}と{hidden_char}の二面性に魅力を感じている異性が身近にいます。その人は一見すると友人のような距離感を保っていますが、実は深い愛情を抱いています。職場の同僚、習い事の仲間、よく行くお店の店員など、日常的に接点がある人物。優しく思いやりがあり、あなたの幸せを第一に考えてくれる献身的なタイプです。"
    ]
    
    return random.choice(templates)

def generate_dangerous_type_text(moon_phase, hidden_phase):
    """危険な異性のタイプのテキストを生成"""
    main_char = MOON_CHARACTERISTICS[moon_phase]
    hidden_char = MOON_CHARACTERISTICS[hidden_phase]
    
    templates = [
        f"あなたの{main_char}のエネルギーを利用しようとする要注意人物は、表面的な魅力で近づいてくる自己中心的なタイプ。甘い言葉や高額なプレゼントで気を引こうとしますが、本心はあなたの{hidden_char}の深さを理解できません。特に金銭面や仕事面での利益を期待している可能性があります。初対面で過度に親密になろうとする人、約束を簡単に破る人には十分注意してください。",
        f"この時期、{main_char}の純粋さに付け込む危険な異性に注意が必要です。その人は一見すると理想的に見えますが、実は感情的に不安定で依存的な性格の持ち主。あなたの{hidden_char}の優しさに甘え、精神的・経済的に頼ろうとします。恋愛経験を武器にあなたを翻弄し、罪悪感を植え付けてコントロールしようとする傾向があります。",
        f"{main_char}と{hidden_char}のバランスを崩そうとする危険人物は、嫉妬深く束縛的なタイプ。最初は情熱的でロマンチックに見えますが、次第にあなたの行動を制限し、友人関係にも干渉してきます。過去の恋愛トラウマを引きずっており、それをあなたに投影する傾向があります。極端な愛情表現や独占欲の強さには警戒が必要です。"
    ]
    
    return random.choice(templates)

def generate_new_connections_text(moon_phase, hidden_phase):
    """新しい人間関係のテキストを生成"""
    main_char = MOON_CHARACTERISTICS[moon_phase]
    hidden_char = MOON_CHARACTERISTICS[hidden_phase]
    
    templates = [
        f"{main_char}と{hidden_char}のエネルギーが引き寄せる新しい人間関係は、共通の目標を持つ仲間との出会いです。趣味のサークル、勉強会、ボランティア活動などで、価値観を共有できる人々と繋がるでしょう。特に{main_char}の分野で専門知識を持つメンターと、{hidden_char}の感性を理解してくれる親友が現れます。この出会いは今後の人生の財産となる深い絆へと発展します。",
        f"この3ヶ月で築かれる新しい関係は、{main_char}のプロジェクトを共に進める協力者たちです。SNSやオンラインコミュニティを通じて、地理的な制約を超えた仲間が集まります。{hidden_char}の直感で選んだ人々は、それぞれが特殊な才能を持ち、あなたの弱点を補完してくれます。多様性に富んだチームが形成され、想像以上の成果を生み出すでしょう。",
        f"{main_char}の時期に入り、{hidden_char}の智慧を活かせる新しいコミュニティに招かれます。それは専門的な研究会、創造的な活動グループ、または精神的な成長を目指す集まりかもしれません。年齢や職業を超えた多彩な人々との交流により、視野が大きく広がります。特に人生の転機となるアドバイスをくれる年配の知恵者との出会いが重要です。"
    ]
    
    return random.choice(templates)

def generate_challenges_solutions_text(moon_phase, hidden_phase):
    """人間関係の課題と解決策のテキストを生成"""
    main_char = MOON_CHARACTERISTICS[moon_phase]
    hidden_char = MOON_CHARACTERISTICS[hidden_phase]
    
    templates = [
        f"あなたの{main_char}の強さが、時として周囲に圧迫感を与えることがあります。また、{hidden_char}の面を理解されずに誤解を受けやすい時期です。解決策は、相手のペースに合わせる柔軟性を持つこと。週に一度は聞き役に徹する時間を作り、相手の話に共感を示すことで関係性が改善されます。また、自分の vulnerable な面を適度に見せることで、親近感が増すでしょう。",
        f"{main_char}のエネルギーが強すぎて、無意識に他者を遠ざけている可能性があります。{hidden_char}の繊細さとのギャップに戸惑う人も。改善のカギは、コミュニケーションの質を高めること。相手の感情を察知し、適切な距離感を保つことが大切です。また、感謝の気持ちを言葉にして伝える習慣を身につけると、人間関係が劇的に好転します。",
        f"この時期の課題は、{main_char}の理想と現実の人間関係のギャップです。{hidden_char}の深い部分を理解してくれる人が少なく、孤独を感じることも。解決策は、期待値を調整し、相手の良い面に焦点を当てること。完璧を求めず、70%の理解で満足する心の余裕を持つことで、ストレスが減り、関係性が自然に深まっていきます。"
    ]
    
    return random.choice(templates)

def generate_money_trouble_text(moon_phase, hidden_phase):
    """金銭トラブル回避のテキストを生成"""
    main_char = MOON_CHARACTERISTICS[moon_phase]
    hidden_char = MOON_CHARACTERISTICS[hidden_phase]
    
    templates = [
        f"{main_char}の generous な性質が、金銭トラブルを招く可能性があります。特に友人や恋人からの借金依頼には慎重に。{hidden_char}の直感が「違和感」を感じたら、それは正しい警告です。お金の貸し借りは必ず書面に残し、返済期限と金額を明確にすること。感情に流されず、自分の経済状況を最優先に考える勇気を持ちましょう。断ることも愛情の一つの形です。",
        f"この時期、{main_char}の勢いで大きな買い物や投資話に乗りやすくなっています。{hidden_char}の慎重さを活かし、即決は避けるべきです。特に「今だけ」「あなただけ」という誘い文句には要注意。高額商品の購入や投資は、最低でも3日間の検討期間を設け、信頼できる第三者に相談してから決断しましょう。感情的な判断は後悔の元となります。",
        f"{main_char}のエネルギーで収入は増えますが、{hidden_char}の不安から過度な浪費に走る危険があります。ストレス発散のための衝動買いや、見栄のための高額出費に注意。また、保証人や連帯保証の依頼は、どんなに親しい相手でも断る勇気が必要です。金銭関係のクリアさが、良好な人間関係を保つ秘訣。お金の話は感情を排除し、ビジネスライクに対処しましょう。"
    ]
    
    return random.choice(templates)

def load_existing_data():
    """既存のデータを読み込む"""
    with open('/Users/shiraitouma/daniel/line-love-edu/public/data/otsukisama-patterns-complete.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def add_new_sections(data):
    """新規セクションを追加"""
    for pattern_id in data:
        pattern = data[pattern_id]
        moon_phase = pattern['moonPhase']
        hidden_phase = pattern['hiddenPhase']
        
        # 新規セクションを追加
        pattern['newSections'] = {
            'love': {
                'destinyMeeting': generate_destiny_meeting_text(moon_phase, hidden_phase),
                'admirerType': generate_admirer_type_text(moon_phase, hidden_phase),
                'dangerousType': generate_dangerous_type_text(moon_phase, hidden_phase)
            },
            'relationship': {
                'newConnections': generate_new_connections_text(moon_phase, hidden_phase),
                'challengesAndSolutions': generate_challenges_solutions_text(moon_phase, hidden_phase)
            },
            'money': {
                'moneyTrouble': generate_money_trouble_text(moon_phase, hidden_phase)
            }
        }
    
    return data

def main():
    """メイン処理"""
    print("既存データを読み込み中...")
    data = load_existing_data()
    
    print(f"読み込み完了: {len(data)}パターン")
    
    print("新規セクションを追加中...")
    updated_data = add_new_sections(data)
    
    # 新しいファイルに保存
    output_path = '/Users/shiraitouma/daniel/line-love-edu/public/data/otsukisama-patterns-v2.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(updated_data, f, ensure_ascii=False, indent=2)
    
    print(f"完了: {output_path} に保存しました")
    
    # 統計情報を表示
    total_new_texts = 0
    for pattern in updated_data.values():
        if 'newSections' in pattern:
            total_new_texts += 6  # 6つの新規セクション
    
    print(f"追加された新規テキスト数: {total_new_texts}")

if __name__ == "__main__":
    main()