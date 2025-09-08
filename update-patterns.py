#!/usr/bin/env python3
import json
import random

# ランダム分布（先ほど生成したもの）
overall_pattern_distribution = [5,4,6,1,5,1,5,5,6,5,3,1,5,3,2,6,5,5,6,2,4,5,5,3,6,4,2,1,3,6,5,2,3,5,6,1,4,2,3,4,6,6,5,5,6,5,3,5,2,3,5,6,3,1,6,6,1,2,1,4,3,5,4,3]

# 全体運の6パターン
overall_fortunes = {
    1: {
        "title": "即行動 × 勢いを形にする3ヶ月",
        "description": "スタートダッシュが鍵。<span class='moon-characteristic'>1ヶ月目は行動すれば成果が得やすく</span>、2ヶ月目以降は調整と維持がテーマになります。やりたいことは早めに着手しましょう。",
        "graphType": "declining"
    },
    2: {
        "title": "準備と基盤 × 開花へと向かう3ヶ月",
        "description": "序盤は焦らず<span class='moon-characteristic'>「整える」ことが大切</span>。1ヶ月目は心や環境の整理、2ヶ月目からチャンスが増え、<span class='moon-characteristic'>3ヶ月目に最高潮を迎えます</span>。大事な挑戦は後半に。",
        "graphType": "ascending"
    },
    3: {
        "title": "迷いと挑戦 × 自信を得る変化の3ヶ月",
        "description": "1ヶ月目は不安や停滞を感じやすいですが、それは<span class='moon-characteristic'>力をためている証拠</span>。2ヶ月目に大きな波が訪れ、3ヶ月目には落ち着きと共に自信が残ります。",
        "graphType": "peak-middle"
    },
    4: {
        "title": "静かな積み重ね × ラストに花開く3ヶ月",
        "description": "序盤は大きな動きがなくても、<span class='moon-characteristic'>コツコツ続けることで力が蓄えられます</span>。3ヶ月目に一気にチャンスが巡り、努力が報われる展開になりやすいでしょう。",
        "graphType": "late-surge"
    },
    5: {
        "title": "安定と調整 × タイミングを見極める3ヶ月",
        "description": "大きな浮き沈みはありません。だからこそ<span class='moon-characteristic'>余裕をもって人間関係や環境を整えるのに最適</span>。大事な決断や挑戦は<span class='moon-characteristic'>「直感でピンと来たとき」</span>を選ぶのがおすすめです。",
        "graphType": "stable"
    },
    6: {
        "title": "変化と柔軟性 × 波を楽しむ3ヶ月",
        "description": "好調と停滞が交互に訪れます。<span class='moon-characteristic'>調子がいいときに一気に進め、落ち込んだときは休む</span>。波をうまく使えば、結果的に大きな流れをつかめます。",
        "graphType": "wavy"
    }
}

# 恋愛運の詳細テキスト（新月タイプの例を全パターンに適用）
love_fortune_detailed = {
    "mainTextDetailed": """実は〇〇さんの恋愛の月には今、雲がかかっています、、、

〇〇さん、最近ちょっと恋愛のことで
不安な気持ちや焦る気持ちが出てきていませんよね？
「大丈夫！」って即答できるくらいであれば私も安心ですが、
もし "このままじゃだめかも…"って不安を感じられているのであれば、
どうぞここから下をお読みください、、、

まず〇〇さんが今お悩みなのは、それだけ未来に向けて
真剣だからこそなんです。
これはすごく自然な気持ちだと思います。

でもね、大丈夫ですよ。
無理に急がなくても、ちゃんと光が差し込んできます。

なぜなら、〇〇さんは
<span class='moon-characteristic'>M（3ヶ月先）月末までに</span>、雲が晴れ、
新しい出会いや心の変化が訪れる流れが来ているからです。

最近こんなこと、ありませんでしたか？
・前よりも気になる人や場所が増えた
・何気ない会話の中で、"これから"を意識した瞬間があった
・ふと、"そろそろ変わりたいな"と思った

それは、恋愛運が静かに動き始めているサインなんです。

だから今から１ヶ月は、できると思えるタイミングがくるまでの準備の時間にしましょう。
そのためにできることを、今の〇〇さんに合わせて、3つご紹介しますね。

1. 今の気持ちや小さな悩みをノートに書き出す
2. <span class='moon-characteristic'>M（1ヶ月先）月に入るまで</span>に見返して、"心を一番動かしたこと"を見つける
3. 信頼できる友達に、恋愛の近況や気持ちを少し話してみる

こうして心を整えておくことで、
<span class='moon-characteristic'>M（3ヶ月先）月末までに訪れるチャンス</span>を自然に掴めるはずです。""",
    
    "destinyMeetingDetailed": """〇〇さんの心を動かす出会いは──遠くではなく、<span class='moon-characteristic'>M（3ヶ月先）月末までに</span>すぐそばまで訪れるでしょう。

その出会いは、<span class='moon-characteristic'>人が多すぎない落ち着いた空間</span>で起こりやすい流れです。
たとえば駅近のカフェや、友人宅での小さな集まり。
そのとき、最初は少し緊張するかもしれませんが、相手の自然な笑顔ややさしい言葉に安心を覚え、心がふっとほどける瞬間が訪れるでしょう。

ただし──〇〇さんが<span class='moon-characteristic'>自分の心の小さな動きに素直でなければ</span>、この出会いに気づけないかもしれません。
"どうせ私なんて"と心を閉じてしまうと、大切な瞬間はすり抜けてしまうのです。

だからこそ今は、出会いを引き寄せるために先ほどの3つのアクションを大切にしてくださいね。
スクショして保存しておくのも良いですし、メモに残しておくのもおすすめです。
そうすれば、<span class='moon-characteristic'>M（3ヶ月先）月末までに訪れる出会い</span>を自然に掴むことができるでしょう。""",
    
    "admirerTypeDetailed": """〇〇さんに恋の矢を向けている人は──<span class='moon-characteristic'>すでに日常の輪の中にいる人</span>です。
その想いは、<span class='moon-characteristic'>M（3ヶ月先）月末までに</span>、言葉や態度としてよりはっきり現れてくるでしょう。

その人は、〇〇さんの何気ない優しさや自然体の魅力に惹かれています。
職場や趣味のグループ、SNSで繋がっている人など、<span class='moon-characteristic'>週に2～3回は接点がある距離感</span>の人物。
年齢は〇〇さんと±5歳以内で、穏やかで聞き上手なタイプです。

最近、以下のような兆候はありませんでしたか？
・特定の人からの連絡やリアクションが増えた
・何かと理由をつけて会話を長引かせようとする人がいる
・〇〇さんの好みや予定を細かく覚えている人がいる

この人の想いは、<span class='moon-characteristic'>M（2ヶ月先）月の中旬頃</span>に最初のアプローチとして現れ、
<span class='moon-characteristic'>M（3ヶ月先）月には具体的な行動</span>として表れるでしょう。

ただし、その人はシャイなところがあるため、〇〇さんから少し心を開く姿勢を見せることで、関係が一気に進展する可能性があります。""",
    
    "dangerousTypeDetailed": """この3ヶ月、〇〇さんが出会うと危険な異性のタイプ──それは<span class='moon-characteristic'>「理解者」を装って近づいてくる人</span>です。

具体的には以下のような特徴を持つ人物です：
・初対面から妙に親しげで、距離感が近すぎる
・〇〇さんの悩みを聞き出そうと執拗に質問してくる
・「君だけは特別」「運命を感じる」など、大げさな言葉を多用する
・金銭面や将来の話を早い段階で持ち出してくる

この人物は、<span class='moon-characteristic'>M（2ヶ月先）月の前半</span>に現れやすく、
最初は魅力的で理想的に見えるかもしれません。

しかし、その本質は〇〇さんの優しさや純粋さを利用しようとする自己中心的な人物。
特に<span class='moon-characteristic'>感情的に不安定な時期</span>に付け込んでくる傾向があります。

見分けるポイントは「違和感」です。
どんなに条件が良くても、心のどこかで「何か違う」と感じたら、その直感を信じてください。
〇〇さんの直感は、特にこの時期、とても鋭くなっていますから。"""
}

# 既存のJSONファイルを読み込み
with open('/Users/shiraitouma/daniel/line-love-edu/public/data/otsukisama-patterns-v3.json', 'r', encoding='utf-8') as f:
    patterns = json.load(f)

# 各パターンに全体運と詳細恋愛運を追加
for i in range(64):
    pattern_key = str(i)
    if pattern_key in patterns:
        # 全体運を追加
        overall_pattern_num = overall_pattern_distribution[i]
        patterns[pattern_key]['overallFortune'] = overall_fortunes[overall_pattern_num]
        
        # 詳細恋愛運を追加
        patterns[pattern_key]['love']['mainTextDetailed'] = love_fortune_detailed['mainTextDetailed']
        patterns[pattern_key]['love']['destinyMeetingDetailed'] = love_fortune_detailed['destinyMeetingDetailed']
        patterns[pattern_key]['love']['admirerTypeDetailed'] = love_fortune_detailed['admirerTypeDetailed']
        patterns[pattern_key]['love']['dangerousTypeDetailed'] = love_fortune_detailed['dangerousTypeDetailed']

# 更新されたJSONを保存
with open('/Users/shiraitouma/daniel/line-love-edu/public/data/otsukisama-patterns-v3-updated.json', 'w', encoding='utf-8') as f:
    json.dump(patterns, f, ensure_ascii=False, indent=2)

print("✅ otsukisama-patterns-v3-updated.json を作成しました")
print(f"📊 全体運パターン分布: {dict(zip(range(1,7), [overall_pattern_distribution.count(i) for i in range(1,7)]))}")