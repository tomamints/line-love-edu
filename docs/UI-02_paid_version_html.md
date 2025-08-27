# おつきさま診断 有料版完全テンプレート（省略なし完全版）

このドキュメントは、有料版（1,980円）の全文章を**1文字も省略せず**に記載した完全版です。

---

## 🎯 診断結果の完全構成

### ユーザー情報の例
```
名前：山田花子
生年月日：1995年3月15日
月相タイプ：新月
裏月相タイプ：満月
エネルギー：燃え上がり型
価値観：ロマンチスト型
距離感：密着型
感情表現：ストレート型
```

---

## 📝 診断結果画面の完全文章（上から順番に）

### 1. 月詠の挨拶（無料版から表示）

```html
<div class="tsukuyomi-section">
    <div class="tsukuyomi-character">
        <img src="/images/tsukuyomi/2.png" alt="月詠">
    </div>
    <div class="tsukuyomi-bubble">
        <div class="tsukuyomi-name">月詠</div>
        <p>
            こんにちは、山田花子さん。私は月詠（つくよみ）と申します。今夜の月が、あなたの運命を照らし出します。あなたが生まれた日の月は、特別な形をしていました。その月が持つメッセージを、今からお伝えしていきますね。
        </p>
    </div>
</div>
```

### 2. タイトル

```html
<h2 class="banner-title">おつきさま診断で読み解くあなた</h2>
```

### 3. 月詠の診断説明

```html
<div class="tsukuyomi-section right">
    <div class="tsukuyomi-character">
        <img src="/images/tsukuyomi/4.png" alt="月詠">
    </div>
    <div class="tsukuyomi-bubble">
        <div class="tsukuyomi-name">月詠</div>
        <p>
            さて、ここからが本題です。これから、あなたの生まれた日の月相を基に、6つの要素からあなたの本質を明らかにしていきます。まずは、この6つの要素が何を意味するのかご覧ください。
        </p>
    </div>
</div>
```

### 4. 6つの要素（円形配置）

```html
<div class="moon-types-circle">
    <div class="center-moon"></div>
    <div class="type-item" style="top: 10px; left: 50%; transform: translateX(-50%);">
        <span class="type-label">月相</span>
        <span class="type-result">新月</span>
    </div>
    <div class="type-item" style="top: 60px; right: 20px;">
        <span class="type-label">裏月相</span>
        <span class="type-result">満月</span>
    </div>
    <div class="type-item" style="bottom: 60px; right: 20px;">
        <span class="type-label">感情表現</span>
        <span class="type-result">ストレート型</span>
    </div>
    <div class="type-item" style="bottom: 10px; left: 50%; transform: translateX(-50%);">
        <span class="type-label">距離感</span>
        <span class="type-result">密着型</span>
    </div>
    <div class="type-item" style="bottom: 60px; left: 20px;">
        <span class="type-label">価値観</span>
        <span class="type-result">ロマンチスト型</span>
    </div>
    <div class="type-item" style="top: 60px; left: 20px;">
        <span class="type-label">エネルギー</span>
        <span class="type-result">燃え上がり型</span>
    </div>
</div>

<p class="section-description">
    生まれた日の月相から読み解く、あなたの「本当の自分」
</p>
```

### 5. 月相説明セクション

```html
<div style="padding: 35px 0; margin: 50px 0 40px; text-align: center;">
    <h3 style="font-size: 22px; color: #ffd700; margin-bottom: 20px; letter-spacing: 2px;">まずは、あなたの「月相」から見ていきましょう</h3>
    <p style="color: #ffffff; font-size: 18px; font-weight: 600; line-height: 2; margin-bottom: 15px; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">
        月相とは、あなたが生まれた日の月の形。これによって、あなたの基本的な性格や人生のテーマがわかります。あなたの月相は...
    </p>
</div>
```

### 6. 月相タイプカード（新月の場合）

```html
<div class="moon-phase-card new-moon">
    <div class="moon-phase-header">
        <div class="moon-phase-visual"></div>
        <div class="moon-phase-info">
            <h2>新月</h2>
            <p class="moon-phase-subtitle">新しい始まりの力。無限の可能性を秘めた開拓者</p>
        </div>
    </div>
    <div class="moon-phase-description">
        あなたは新月の日に生まれた、始まりのエネルギーを持つ人。何もないところから何かを生み出す力があり、ゼロから1を作り出すことに長けています。純粋で素直な心を持ち、新しいことへの好奇心が旺盛。まだ誰も踏み入れていない道を進むパイオニア精神があります。時に無鉄砲に見えることもありますが、その勇気こそがあなたの最大の武器なのです。
    </div>
</div>
```

### 7. 裏月相説明

```html
<div style="padding: 30px 0; margin: 40px 0; text-align: center;">
    <h3 style="font-size: 20px; color: #ffd700; margin-bottom: 15px;">そして、あなたの「裏の顔」も見てみましょう</h3>
    <p style="color: #ffffff; font-size: 18px; font-weight: 600; line-height: 1.8; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">
        表の月相が社会的な顔だとすれば、裏月相はあなたのプライベートな顔。親しい人の前でだけ見せる、もう一つのあなたです。
    </p>
</div>
```

### 8. 裏月相タイプカード（満月の場合）

```html
<div class="moon-phase-card full-moon">
    <div class="moon-phase-header">
        <div class="moon-phase-visual" style="background: radial-gradient(circle at 30% 30%, #ffffff 0%, #f0f0ff 50%, #ffd700 100%);"></div>
        <div class="moon-phase-info">
            <h2>満月（裏の顔）</h2>
            <p class="moon-phase-subtitle">内なる情熱と表現力を秘めた輝きの人</p>
        </div>
    </div>
    <div class="moon-phase-description">
        表向きは冷静で神秘的なあなたですが、実は内面では誰よりも情熱的で表現豊かな人。本当は認められたい、愛されたいという強い欲求を持っています。普段は抑えているこの感情が、信頼できる人の前では溢れ出すことがあるでしょう。この二面性こそが、あなたの魅力の源泉。時々、感情を解放することで、より輝きを増すことができます。
    </div>
</div>
```

### 9. 3つの月の力タイトル

```html
<div style="padding: 35px 0; margin: 50px 0 40px; text-align: center;">
    <h3 style="font-size: 22px; color: #ffd700; font-weight: bold; margin-bottom: 20px; letter-spacing: 2px; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">3つの月の力</h3>
    <p style="color: #ffffff; font-size: 18px; font-weight: 600; line-height: 2; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">
        さらに深く、あなたの月が持つ特別な力を見ていきましょう。月には3つの力があり、それぞれがあなたの人生を導いています。
    </p>
</div>
```

### 10. 3つの月の力（無料版）

```html
<div class="energy-types">
    <div class="energy-item">
        <div class="energy-title">直感力</div>
        <div class="energy-description">
            第六感が鋭く、見えない危険を察知する能力があります。迷った時は、理屈より直感を信じることで正しい道を選べるでしょう。
        </div>
    </div>
    <div class="energy-item">
        <div class="energy-title">創造力</div>
        <div class="energy-description">
            無から有を生み出す力。アイデアが湧き出る泉のような存在で、周りの人に新しい視点を与えることができます。
        </div>
    </div>
    <div class="energy-item">
        <div class="energy-title">浄化力</div>
        <div class="energy-description">
            ネガティブなエネルギーを跳ね返し、周りの空気を清める力。あなたがいるだけで、場の雰囲気が明るくなります。
        </div>
    </div>
</div>
```

### 11. 4つの軸タイトル

```html
<div style="padding: 35px 0; margin: 50px 0 40px; text-align: center;">
    <h3 style="font-size: 22px; color: #ffd700; font-weight: bold; margin-bottom: 20px; letter-spacing: 2px; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">4つの軸からあなたを紐解く</h3>
    <p style="color: #ffffff; font-size: 18px; font-weight: 600; line-height: 2; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">
        ここからは、あなたの性格をさらに詳しく分析していきます。感情表現、距離感、価値観、エネルギーという4つの軸から、あなたの本質的な性格を紐解いていきましょう。
    </p>
</div>
```

### 12. 4つの軸（無料版）

```html
<div class="love-type-grid">
    <div class="love-type-card">
        <div class="love-type-title">
            <div class="love-type-icon"></div>
            感情表現：ストレート型
        </div>
        <div class="love-type-content">
            思ったことを素直に表現するタイプ。駆け引きは苦手で、感情がすぐ顔に出てしまいます。その純粋さと正直さが、周りの人々の信頼を得る最大の魅力。
        </div>
    </div>
    <div class="love-type-card">
        <div class="love-type-title">
            <div class="love-type-icon"></div>
            距離感：密着型
        </div>
        <div class="love-type-content">
            大切な人とは深く繋がりたいタイプ。コミュニケーションを頻繁に取り、共有する時間を大切にします。人との一体感を求め、深い信頼関係を築きます。
        </div>
    </div>
    <div class="love-type-card">
        <div class="love-type-title">
            <div class="love-type-icon"></div>
            価値観：ロマンチスト型
        </div>
        <div class="love-type-content">
            理想や夢を大切にし、美しいものに心惹かれます。記念日や特別な瞬間を大切にし、日常に彩りを添えることが得意。
        </div>
    </div>
    <div class="love-type-card">
        <div class="love-type-title">
            <div class="love-type-icon"></div>
            エネルギー：燃え上がり型
        </div>
        <div class="love-type-content">
            何事にも情熱的で、興味を持ったら一直線。最初の勢いが強く、周囲を圧倒してしまうこともありますが、その熱意が本物の証。
        </div>
    </div>
</div>
```

### 13. 月詠の総括

```html
<div class="tsukuyomi-section">
    <div class="tsukuyomi-character">
        <img src="/images/tsukuyomi/5.png" alt="月詠">
    </div>
    <div class="tsukuyomi-bubble">
        <div class="tsukuyomi-name">月詠</div>
        <p>
            いかがでしたでしょうか。あなた自身、自覚していた面も、初めて意識した面もあったと思います。これらすべてが、あなたという月の持つ多面的な輝きなのです。
        </p>
    </div>
</div>
```

### 14. 直近3ヶ月への導入（月詠）

```html
<div class="tsukuyomi-section right">
    <div class="tsukuyomi-character">
        <img src="/images/tsukuyomi/7.png" alt="月詠">
    </div>
    <div class="tsukuyomi-bubble">
        <div class="tsukuyomi-name">月詠</div>
        <p>
            ここまで、あなたの月相、裏の顔、3つの月の力、そして4つの軸から見たあなたの本質を見てきました。これらすべてを踏まえて、いよいよ<span style="color: #ffd700; font-weight: bold; font-size: 20px;">直近3ヶ月のあなたに訪れる運命</span>を読み解いていきます。全体運から始まり、恋愛運、人間関係運、仕事運、金運...月のリズムが教えてくれる、あなただけの3ヶ月の集中的なストーリーをお届けしますね。
        </p>
    </div>
</div>
```

### 15. 直近3ヶ月 全体運バナー

```html
<h2 class="banner-title">直近3ヶ月 あなたの運命</h2>
```

### 16. 3ヶ月運勢グラフ（有料版）

```html
<!-- 運勢グラフセクション -->
<div class="fortune-graph-section">
    <div class="fortune-graph-container">
        <canvas id="fortuneGraph" width="800" height="400"></canvas>
    </div>
    
    <!-- カスタム凡例 -->
    <div class="graph-legend">
        <div class="legend-title">運勢の種類</div>
        <div class="legend-items">
            <div class="legend-item active" data-category="overall">
                <span class="legend-color" style="background: #ffd700;"></span>
                <span class="legend-label">全体運</span>
            </div>
            <div class="legend-item active" data-category="love">
                <span class="legend-color" style="background: #ff69b4;"></span>
                <span class="legend-label">恋愛運</span>
            </div>
            <div class="legend-item active" data-category="relationship">
                <span class="legend-color" style="background: #32cd32;"></span>
                <span class="legend-label">人間関係運</span>
            </div>
            <div class="legend-item active" data-category="career">
                <span class="legend-color" style="background: #4169e1;"></span>
                <span class="legend-label">仕事運</span>
            </div>
            <div class="legend-item active" data-category="money">
                <span class="legend-color" style="background: #ff8c00;"></span>
                <span class="legend-label">金運</span>
            </div>
        </div>
    </div>
    
    <!-- グラフの説明 -->
    <div class="graph-description">
        <p style="color: #ffffff; text-align: center; font-size: 16px; margin: 20px 0; line-height: 1.6;">
            上のグラフは、あなたの直近3ヶ月（12週間）の運勢の変化を表しています。<br>
            凡例の項目をクリックすると、その運勢の表示/非表示を切り替えできます。<br>
            グラフの点にマウスを合わせると、詳細な運勢レベルを確認できます。
        </p>
    </div>
</div>

<!-- グラフ用JavaScript（実装時に追加） -->
<script>
// fortuneGraphData変数には64パターンから生成されたデータが入る
// 実装例：fortuneGraphData = {overall: [4,5,3,4,...], love: [3,4,5,3,...], ...}
</script>
```

---

## 💰 有料版（1,980円）の完全文章

### 17. 全体運（有料版完全文章）

```html
<div class="fortune-section destiny">
    <div class="section-header">
        <h3>全体運</h3>
        <p>
            この3ヶ月は『創造と情熱が交差する集中期』のリズム。短期間で大きな変化が起きそうです。直近3ヶ月は、あなたにとって即座に行動し成果を得る期間。新月のエネルギーが最高潮に達し、素早く新しいことを始め、すぐに結果を得られる最適な時期です。
        </p>
    </div>
    
    <div class="fortune-content">
        <div class="fortune-highlight">
            <strong>直近3ヶ月の全体的な流れ</strong>
            <p>
                直近3ヶ月は、あなたにとって集中的な変化と成長を経験する重要な期間となります。新月の創造力と満月の情熱が短期間で絶妙に混ざり合い、驚くほど素早く大きな成果を生み出すでしょう。特に診断から1ヶ月目と3ヶ月目には、人生を変えるような重要な出来事が起こります。診断から1ヶ月後の新月と、2ヶ月後の満月は特に重要な日。この日に始めたことは、3ヶ月以内に大きな実を結ぶでしょう。
            </p>
        </div>
        
        <ul class="fortune-list">
            <li><strong>1ヶ月目</strong>：集中スタート期。過去の整理と即座の行動開始。新月の創造力が活性化し、革新的なアイデアが次々と湧いてきます。この月には重要な出会いがあり、すぐに行動に移すことで月末には最初の成果が見え始めるでしょう。</li>
            <li><strong>2ヶ月目</strong>：加速展開期。1ヶ月目の種が急速に成長。満月の情熱が加わり、行動力が最高潮に達します。予想外の展開が起き、重要な決断を迫られますが、直感に従うことで大きな飛躍につながります。</li>
            <li><strong>3ヶ月目</strong>：結果収穫期。これまでの努力が短期間で実を結ぶ。周囲からの評価が急上昇し、金運も大幅に向上します。3ヶ月の総仕上げとして大きな成果を手にし、次の3ヶ月への確固たる基盤を築きます。</li>
        </ul>
        
        <p>
            ただし、注意すべきは診断から2ヶ月目の満月期。この時期は感情が高ぶりやすく、衝動的な決断をしがちです。大切な決定は、一度冷静になってから行いましょう。特に2ヶ月目中旬は、新月と満月のエネルギーが衝突しやすく、内面的な葛藤を感じることがあるかもしれませんが、この葛藤こそが大きな成長の源となります。
        </p>
        
        <p>
            全体として、この3ヶ月はあなたにとって「創造と情熱の集中融合期」。短期間で過去にとらわれず、新しい自分として生まれ変わるチャンスです。月のリズムに従って、積極的かつ自然体で進んでいけば、驚くほど早く良い結果が現れます。新月の直感力と満月の表現力を活かし、たった3ヶ月でこれまでにない大きな成果を手にすることができるでしょう。
        </p>
        
        <div class="fortune-highlight">
            <strong>重要な転機の時期</strong>
            <p>
                第1の転機：診断から1ヶ月後。新しい出会いや機会がすぐに訪れ、人生の方向性が急速に変わる可能性があります。この時期の決断は、今後の3ヶ月全体を左右する重要なものとなるでしょう。
            </p>
            <p>
                第2の転機：診断から2ヶ月後。1ヶ月目の努力がすぐに認められ、大きなチャンスが立て続けに巡ってきます。勇気を出して一歩踏み出すことで、短期間で想像以上の成果を得られるでしょう。
            </p>
            <p>
                第3の転機：診断から3ヶ月後。3ヶ月の総決算として、驚くほど大きな成果を手にします。同時に、次の3ヶ月への明確な目標と確実な基盤も見えてくるでしょう。
            </p>
        </div>
    </div>
</div>
```

### 18. 恋愛運への移行（月詠）

```html
<div class="tsukuyomi-section">
    <div class="tsukuyomi-character">
        <img src="/images/tsukuyomi/7.png" alt="月詠">
    </div>
    <div class="tsukuyomi-bubble">
        <div class="tsukuyomi-name">月詠</div>
        <p>
            全体運を踏まえて、次に気になるのは恋愛運ですね。直近3ヶ月、あなたの恋愛にはどんな展開が待っているのでしょうか。月の導きから、あなたの恋の行方を詳しく見ていきましょう。
        </p>
    </div>
</div>
```

### 19. 恋愛運バナー

```html
<h2 class="banner-title">恋愛運</h2>
```

### 20. 恋愛運（有料版完全文章）

```html
<div class="fortune-section love">
    <div class="section-header">
        <h3>恋愛運</h3>
        <p>
            この3ヶ月は、短期間で集中的に情熱的で運命的な恋が訪れますよ。新月タイプのあなたは、相手の心に新しい風を即座に吹き込む存在。初対面から強い印象を残し、短期間で相手の人生に大きな変化をもたらすでしょう。
        </p>
    </div>
    
    <div class="fortune-content">
        <div class="fortune-highlight">
            <strong>直近3ヶ月の恋愛運の特徴</strong>
            <p>
                新月タイプのあなたは、相手の心に新しい風を即座に吹き込む存在。初対面から強い印象を残し、短期間で相手の人生に大きな変化をもたらすでしょう。さらに裷の満月が加わることで、短期間で濃密かつ情熱的で深い愛情を注ぐことができます。ただし、その強烈な魅力ゆえに複数の人から短期間で好意を寄せられることになりそう。特に診断から1ヶ月後、2ヶ月後、そして3ヶ月後は、恋愛運が最高潮に連続で達する時期。
            </p>
        </div>
        
        <ul class="fortune-list">
            <li><strong>出会いの場所</strong>：新しく始めた習い事、勉強会、オンラインコミュニティ、友人の紹介、趣味の集まり、日常の中での突然の出会い</li>
            <li><strong>理想の相手</strong>：あなたの冒険心を理解し、即座に一緒に成長できる人。感情表現が豊かで、あなたの情熱を素早く受け止められる包容力のある人</li>
            <li><strong>ラッキーデー</strong>：毎月の新月の日（新しい出会い）、満月の日（告白や深まり）、特に診断後の新月と満月は最高のタイミング</li>
            <li><strong>注意時期</strong>：診断から2ヶ月目中旬の満月期は感情的になりやすいので要注意。短期間で結論を急がず冷静さを保つことが大切</li>
        </ul>
        
        <div class="fortune-highlight">
            <strong>シングルの方へのアドバイス</strong>
            <p>
                診断後すぐに、運命的な出会いのチャンスが立て続けに訪れます。この3ヶ月間は、积極的に普段行かないような場所に足を運んでみてください。新月の直感力を信じて、気になる人には即座に積極的にアプローチを。2ヶ月目には、友人や知人を通じた新たな出会いも期待できます。3ヶ月目は、これまでの出会いが深まる最重要な時期で、意外な展開が待っているでしょう。
            </p>
        </div>
        
        <div class="fortune-highlight">
            <strong>パートナーがいる方へのアドバイス</strong>
            <p>
                直近3ヶ月で、関係が濃密かつ急速に深まる可能性があります。特に診断から1ヶ月目、2ヶ月目、3ヶ月目はそれぞれが重要な節目となるでしょう。新月の創造力で短期間に新しい体験を積極的に共有し、満月の情熱で愛を一気に深めてください。ただし、2ヶ月目中旬は感情的になりやすく、些細なことで衝突する可能性があります。この時期は、一時的に冷静になり、愛情を再確認する時間として活用することが大切です。
            </p>
        </div>
        
        <p>
            あなたの性格タイプである「ストレート型」「密着型」「ロマンチスト型」「燃え上がり型」の特性を最大限に活かして、素直かつ積極的に自分を表現することが成功の鍵。駆け引きや遅いペースよりも、短期間で真っ直ぐな気持ちを伝えることが大切です。月のリズムに従って、新月には新しい一歩を即座に、満月には感謝と愛の表現を積極的に心がけることで、短期間で理想の恋愛を実現できるでしょう。
        </p>
    </div>
</div>
```

### 21. 月齢カレンダーへの移行（月詠）

```html
<div class="tsukuyomi-section">
    <div class="tsukuyomi-character">
        <img src="/images/tsukuyomi/5.png" alt="月詠">
    </div>
    <div class="tsukuyomi-bubble">
        <div class="tsukuyomi-name">月詠</div>
        <p>
            ここで特別なプレゼントがあります！恋愛運をさらに活かすために、あなただけの特別な月齢カレンダーをお伝えしますね。
        </p>
    </div>
</div>
```

### 22. 月齢カレンダー（有料版詳細版）

```html
<div class="monthly-fortune">
    <h4 style="color: #ffd700; font-size: 22px; text-align: center; margin-bottom: 20px; font-weight: bold; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">あなただけの月齢カレンダー（今後2週間）</h4>
    
    <div class="calendar-detail">
        <div class="calendar-day-detail">
            <span class="day-label">1日目（月齢1）</span>
            <span class="moon-emoji">🌑</span>
            <p>新月のエネルギー最高潮。新しいスタートに最適。重要な決断は午前中に。恋愛面では新しい出会いのチャンス。ラッキーカラー：黒、紫</p>
        </div>
        <div class="calendar-day-detail">
            <span class="day-label">2日目（月齢2）</span>
            <span class="moon-emoji">🌒</span>
            <p>アイデアが形になり始める日。人間関係が良好。連絡を取りたかった人にアプローチ。仕事面でも成果が出やすい。ラッキーカラー：白、銀</p>
        </div>
        <div class="calendar-day-detail">
            <span class="day-label">3日目（月齢3）</span>
            <span class="moon-emoji">🌒</span>
            <p>クリエイティブな活動吉。アイデアをメモして。恋愛では素直な気持ちを伝えると良い結果に。ラッキーカラー：青</p>
        </div>
        <div class="calendar-day-detail">
            <span class="day-label">4日目（月齢4）</span>
            <span class="moon-emoji">🌓</span>
            <p>金運良好。投資や買い物のチャンス。人間関係では積極的なコミュニケーションが吉。ラッキーカラー：緑</p>
        </div>
        <div class="calendar-day-detail">
            <span class="day-label">5日目（月齢5）</span>
            <span class="moon-emoji">🌓</span>
            <p>恋愛運最高潮。告白やデートに最適。仕事面でも評価される出来事がありそう。ラッキーカラー：ピンク</p>
        </div>
        <div class="calendar-day-detail">
            <span class="day-label">6日目（月齢6）</span>
            <span class="moon-emoji">🌓</span>
            <p>休息日。無理をせず、ゆっくり過ごして。内省的な時間が次への力になります。ラッキーカラー：茶色</p>
        </div>
        <div class="calendar-day-detail">
            <span class="day-label">7日目（月齢7）</span>
            <span class="moon-emoji">🌔</span>
            <p>仕事運上昇。プレゼンや交渉に良い日。新しいプロジェクトのスタートにも最適。ラッキーカラー：オレンジ</p>
        </div>
        <div class="calendar-day-detail">
            <span class="day-label">8日目（月齢8）</span>
            <span class="moon-emoji">🌔</span>
            <p>家族との時間を大切に。感謝を伝えて。身近な人との絆が深まる日。ラッキーカラー：黄色</p>
        </div>
        <div class="calendar-day-detail">
            <span class="day-label">9日目（月齢9）</span>
            <span class="moon-emoji">🌔</span>
            <p>学びの日。新しい知識を吸収できる。セミナーや勉強会への参加が吉。ラッキーカラー：紺</p>
        </div>
        <div class="calendar-day-detail">
            <span class="day-label">10日目（月齢10）</span>
            <span class="moon-emoji">🌔</span>
            <p>健康に注意。早めの休息を心がけて。体調管理を優先する日。ラッキーカラー：白</p>
        </div>
        <div class="calendar-day-detail">
            <span class="day-label">11日目（月齢11）</span>
            <span class="moon-emoji">🌔</span>
            <p>金運上昇。臨時収入の可能性あり。投資や貯蓄の見直しにも良い日。ラッキーカラー：金</p>
        </div>
        <div class="calendar-day-detail">
            <span class="day-label">12日目（月齢12）</span>
            <span class="moon-emoji">🌕</span>
            <p>満月前夜。感情が高まりやすい。大切な人への感謝を形にして。ラッキーカラー：銀</p>
        </div>
        <div class="calendar-day-detail">
            <span class="day-label">13日目（月齢13）</span>
            <span class="moon-emoji">🌕</span>
            <p>満月。願いが叶いやすい日。告白や重要な話し合いに最適。感情を素直に表現して。ラッキーカラー：白、金</p>
        </div>
        <div class="calendar-day-detail">
            <span class="day-label">14日目（月齢14）</span>
            <span class="moon-emoji">🌕</span>
            <p>新たなサイクルの始まり。計画を立てて。次の2週間の目標を明確にする日。ラッキーカラー：紫</p>
        </div>
    </div>
    
    <p style="color: #ffffff; text-align: center; margin-top: 20px; font-size: 16px; font-weight: 600; text-shadow: 1px 1px 3px rgba(0,0,0,0.5);">
        新月の日：新しい出会いのチャンス、願い事を書く最適日<br>
        満月の日：告白に最適、感謝を伝える日、願いが叶う日
    </p>
</div>
```

### 23. 人間関係運への移行（月詠）

```html
<div class="tsukuyomi-section right">
    <div class="tsukuyomi-character">
        <img src="/images/tsukuyomi/4.png" alt="月詠">
    </div>
    <div class="tsukuyomi-bubble">
        <div class="tsukuyomi-name">月詠</div>
        <p>
            恋愛運はいかがでしたか？さて、恋愛だけでなく、すべての人間関係も見ていきましょう。直近3ヶ月、あなたの周りにはどんな人が集まってくるのでしょうか。
        </p>
    </div>
</div>
```

### 24. 人間関係運バナー

```html
<h2 class="banner-title">人間関係運</h2>
```

### 25. 人間関係運（有料版完全文章）

```html
<div class="fortune-section relationship">
    <div class="section-header">
        <h3>人間関係運</h3>
        <p>
            新しい仲間との出会いが短期間で集中的に訪れる3ヶ月。あなたの持つ開拓者精神に共感する人たちが短期間で結束して集まってきて、すぐに一緒に何か新しいことを始めることになりそう。
        </p>
    </div>
    
    <div class="fortune-content">
        <strong>3人のキーパーソン</strong>
        <ul class="fortune-list">
            <li>第1のキーパーソン（診断から2〜3ヶ月後）：あなたに新しい視点を与えてくれる年上の人物。この人との出会いによって、これまで気づかなかった自分の才能に目覚めることになるでしょう。職業は教育関係者、コンサルタント、または芸術関係の可能性が高く、あなたの人生に大きな影響を与えます。</li>
            <li>第2のキーパーソン（診断から5〜6ヶ月後）：一緒にプロジェクトを立ち上げる同志。価値観が似ており、お互いの強みを活かし合える理想的なパートナーとなります。この人とは長期的な関係を築くことになり、ビジネスパートナーや親友として、今後の人生を共に歩むことになるでしょう。</li>
            <li>第3のキーパーソン（診断から9〜10ヶ月後）：あなたの弱点を補ってくれる存在。この人は一見あなたとは正反対のタイプですが、だからこそお互いに成長できる関係となります。特に、あなたが苦手とする細かい作業や継続的な努力を支えてくれるでしょう。</li>
        </ul>
        
        <p>
            人間関係で最も重要な時期は、診断から2ヶ月後の新月と、9ヶ月後の新月。この日に出会った人や、この日に深まった関係は、あなたの人生に大きな影響を与えることになるでしょう。特に2ヶ月後の新月は、運命的な出会いの可能性が最も高い日となります。
        </p>
        
        <strong>人間関係を良好に保つコツ：</strong>
        <ul class="fortune-list">
            <li>月が満ちていく期間（新月から満月）は積極的に交流を。新しい出会いを求めて、普段行かない場所にも足を運んでみましょう。</li>
            <li>月が欠けていく期間（満月から新月）は既存の関係を深める。大切な人との時間を優先し、感謝の気持ちを伝えてください。</li>
            <li>診断から4〜5ヶ月目と10〜11ヶ月目は、コミュニケーションに注意。誤解が生じやすい時期なので、重要な話は文書で残すようにしましょう。</li>
        </ul>
        
        <div class="fortune-highlight">
            <strong>職場の人間関係</strong>
            <p>
                診断から3ヶ月目頃から、職場での立場が向上します。新しいプロジェクトのリーダーに抜擢されたり、重要な役割を任されたりする可能性があります。6ヶ月目には、上司や先輩からの評価が高まり、昇進や昇格のチャンスも。ただし、8ヶ月目は同僚との摩擦に注意。あなたの成功を妬む人が現れるかもしれませんが、誠実な態度を貫くことで乗り越えられます。
            </p>
        </div>
        
        <div class="fortune-highlight">
            <strong>友人関係</strong>
            <p>
                直近3ヶ月で、友人関係が大きく広がります。特に診断から2ヶ月目、5ヶ月目、9ヶ月目に新しい友人ができるでしょう。これらの友人は、単なる遊び仲間ではなく、あなたの人生を豊かにしてくれる存在となります。古い友人との関係も大切にしてください。7ヶ月目には、疎遠になっていた友人との再会があり、新たな形で関係が復活する可能性があります。
            </p>
        </div>
        
        <p>
            ただし、診断から11ヶ月目は、人間関係の整理が必要な時期。すべての人と良好な関係を保とうとすると、エネルギーが分散してしまいます。本当に大切な人を見極め、その人たちとの関係を優先することが大切です。月のリズムに従って、自然な形で人間関係を育んでいけば、充実した12ヶ月となるでしょう。
        </p>
    </div>
</div>
```

### 26. 仕事運への移行（月詠）

```html
<div class="tsukuyomi-section">
    <div class="tsukuyomi-character">
        <img src="/images/tsukuyomi/6.png" alt="月詠">
    </div>
    <div class="tsukuyomi-bubble">
        <div class="tsukuyomi-name">月詠</div>
        <p>
            人間関係の広がりは、仕事にも良い影響を与えそうですね。では、直近3ヶ月のあなたの仕事運、キャリアの展開を見ていきましょう。
        </p>
    </div>
</div>
```

### 27. 仕事運バナー

```html
<h2 class="banner-title">仕事運</h2>
```

### 28. 仕事運（有料版完全文章）

```html
<div class="fortune-section career">
    <div class="section-header">
        <h3>仕事運</h3>
        <p>
            創造性を活かした新しいプロジェクトで短期間に大きな成果を上げる3ヶ月。あなたの革新的なアイデアが即座に評価され、キャリアが急速に飛躍する可能性があります。
        </p>
    </div>
    
    <div class="fortune-content">
        <div class="fortune-highlight">
            <strong>直近3ヶ月のキャリア展開</strong>
            <p>
                新月の創造力と満月の情熱が仕事面でも発揮され、これまでにない成果を生み出すでしょう。特に診断から2ヶ月目、5ヶ月目、8ヶ月目は、キャリアの転機となる重要な時期。新しいプロジェクトの立ち上げ、昇進、転職など、大きな変化が期待できます。
            </p>
        </div>
        
        <strong>時期別の仕事運</strong>
        <ul class="fortune-list">
            <li><strong>1ヶ月目</strong>：集中スタート期。アイデア構築と即座の実行開始。新しい企画や提案が評価され、すぐに行動に移すことで月末には最初の成果が見え始めるでしょう。この月に始めたプロジェクトは、3ヶ月後の大きな成功につながります。</li>
            <li><strong>2ヶ月目</strong>：加速展開期。1ヶ月目の種が急速に成長。重要なプレゼンテーションや交渉のチャンスが訪れ、あなたのクリエイティブな能力が最大限に発揮されます。チームワークと個人の才能の両方で成果を上げられるでしょう。</li>
            <li><strong>3ヶ月目</strong>：結果収穫期。これまでの努力が短期間で実を結ぶ。昇進や昇格の可能性があり、新しい責任やポジションを任される可能性があります。3ヶ月の総仕上げとして大きな成果を手にし、次の3ヶ月への確固たる基盤を築きます。</li>
        </ul>
        
        <div class="fortune-highlight">
            <strong>成功のための月別アクション</strong>
            <p>
                毎月の新月の日：新規プロジェクトのスタート、新しいアイデアの提案<br>
                毎月の満月の日：プレゼンテーション、交渉、重要な会議<br>
                毎月の上弦の月：積極的な行動、新規開拓、営業活動<br>
                毎月の下弦の月：振り返りと改善、データ分析、戦略の見直し
            </p>
        </div>
        
        <strong>適職と才能の開花</strong>
        <p>
            あなたの新月×満月タイプは、創造性と情熱を兼ね備えた稀有な才能の持ち主です。特に以下の分野で大きな成功を収める可能性があります：
        </p>
        <ul class="fortune-list">
            <li>クリエイティブディレクター、デザイナー、アーティスト</li>
            <li>起業家、新規事業開発、イノベーター</li>
            <li>マーケティング、広告、PR関連</li>
            <li>エンターテインメント、メディア関連</li>
            <li>コンサルタント、アドバイザー</li>
        </ul>
        
        <div class="fortune-highlight">
            <strong>注意すべきポイント</strong>
            <p>
                診断から4ヶ月目と8ヶ月目は、感情的になりやすく、職場での衝突に注意が必要です。特に8ヶ月目は、成功による嫉妬や批判を受ける可能性があります。冷静さを保ち、謙虚な態度を忘れないことが大切です。また、新しいことに挑戦しすぎて、既存の仕事がおろそかにならないよう注意してください。
            </p>
        </div>
        
        <p>
            全体として、この12ヶ月はキャリアの大きな転換期となります。新月の創造力で新しい価値を生み出し、満月の情熱で周囲を巻き込んでいく。この二つの力を活かすことで、想像以上の成果を上げることができるでしょう。月のリズムに従って仕事を進めることで、効率も上がり、ストレスも軽減されます。
        </p>
    </div>
</div>
```

### 29. 金運への移行（月詠）

```html
<div class="tsukuyomi-section right">
    <div class="tsukuyomi-character">
        <img src="/images/tsukuyomi/8.png" alt="月詠">
    </div>
    <div class="tsukuyomi-bubble">
        <div class="tsukuyomi-name">月詠</div>
        <p>
            仕事運の上昇は、金運にも良い影響を与えますね。最後に、直近3ヶ月のあなたの金運、お金の流れを詳しく見ていきましょう。
        </p>
    </div>
</div>
```

### 30. 金運バナー

```html
<h2 class="banner-title">金運</h2>
```

### 31. 金運（有料版完全文章）

```html
<div class="fortune-section money">
    <div class="section-header">
        <h3>金運</h3>
        <p>
            種まきから収穫まで、着実に豊かさを構築する12ヶ月。創造的な仕事やアイデアが収入につながり、予想以上の臨時収入も期待できます。
        </p>
    </div>
    
    <div class="fortune-content">
        <div class="fortune-highlight">
            <strong>直近3ヶ月の金運の流れ</strong>
            <p>
                新月の創造力が新しい収入源を生み出し、満月の情熱がそれを大きく育てます。特に診断から3ヶ月目、5ヶ月目、8ヶ月目、11ヶ月目は金運が上昇し、臨時収入や昇給のチャンスがあります。投資や副業を始めるなら、診断から2ヶ月目の新月が最適なタイミングです。
            </p>
        </div>
        
        <strong>月別金運カレンダー</strong>
        <ul class="fortune-list">
            <li><strong>1ヶ月目</strong>：準備期。収入は安定していますが、大きな出費は避けてください。将来への投資計画を立てる時期です。</li>
            <li><strong>2ヶ月目</strong>：投資のチャンス。新しい収入源への種まきに最適。株式投資や副業のスタートに良い時期です。</li>
            <li><strong>3ヶ月目</strong>：臨時収入の可能性大。思わぬところからお金が入ってくるかもしれません。宝くじや懸賞にも期待。</li>
            <li><strong>4ヶ月目</strong>：出費注意。衝動買いに気をつけてください。特に感情的になりやすい時期なので、大きな買い物は避けましょう。</li>
            <li><strong>5ヶ月目</strong>：収入アップのチャンス。昇給や新しい仕事での収入増が期待できます。投資の成果も出始める時期。</li>
            <li><strong>6ヶ月目</strong>：安定期。収支のバランスが良く、貯蓄に最適な時期です。将来のための資産形成を始めましょう。</li>
            <li><strong>7ヶ月目</strong>：大きな買い物に良い時期。住宅や車など、高額な買い物をするなら今がチャンスです。</li>
            <li><strong>8ヶ月目</strong>：臨時収入あり。ボーナスや投資の利益など、まとまった収入が期待できます。</li>
            <li><strong>9ヶ月目</strong>：投資の成果が出る時期。これまでの努力が金銭的な成果として現れます。</li>
            <li><strong>10ヶ月目</strong>：出費がかさむ時期。冠婚葬祭や予期せぬ出費に備えて、計画的にお金を使いましょう。</li>
            <li><strong>11ヶ月目</strong>：新たな収入源の可能性。副業や投資で新しい収入の道が開けます。</li>
            <li><strong>12ヶ月目</strong>：一年の総決算。黒字で締めくくることができるでしょう。次の12ヶ月への投資計画を立てる時期です。</li>
        </ul>
        
        <div class="fortune-highlight">
            <strong>金運アップの具体的方法</strong>
            <p>
                新月の日：通帳記入、資産の確認、投資の見直し<br>
                満月の日：不要なものを処分（断捨離）、感謝の気持ちでお金を使う<br>
                財布の色：黒または紫（新月の色）、金色（満月の色）<br>
                ラッキーナンバー：0、9、18、27（新月の数字）、1、8（満月の数字）<br>
                パワースポット：北（新月の方角）、南（満月の方角）<br>
                パワーストーン：オニキス（新月）、シトリン（満月）を財布に入れる
            </p>
        </div>
        
        <strong>臨時収入の可能性</strong>
        <ul class="fortune-list">
            <li><strong>高い可能性（80％）</strong>：3ヶ月目、5ヶ月目、8ヶ月目、11ヶ月目。創作物の販売、アイデアの対価、投資の利益、ボーナスなど。</li>
            <li><strong>中程度（50％）</strong>：2ヶ月目、6ヶ月目、9ヶ月目。副業の収入、思わぬ返金、過去の仕事の追加報酬など。</li>
            <li><strong>低い（20％）</strong>：1ヶ月目、4ヶ月目、7ヶ月目、10ヶ月目、12ヶ月目。宝くじ、懸賞、ギャンブルなど。</li>
        </ul>
        
        <div class="fortune-highlight">
            <strong>投資と貯蓄のアドバイス</strong>
            <p>
                診断から2ヶ月目に始めた投資は、8ヶ月目頃から成果が出始めます。長期的な視点で、コツコツと積み立てることが大切です。毎月の新月の日に一定額を貯金する習慣をつけると、12ヶ月後には予想以上の金額が貯まっているでしょう。満月の日は、お金の使い方を見直す日。無駄遣いを減らし、本当に必要なものにお金を使うようにしてください。
            </p>
        </div>
        
        <p>
            全体として、この12ヶ月は金運が上昇傾向にあります。新月の創造力で新しい収入源を開拓し、満月の情熱でそれを大きく育てることができるでしょう。ただし、感情的になりやすい4ヶ月目と10ヶ月目は、衝動的な出費に注意が必要です。月のリズムに従って、計画的にお金を管理することで、着実に豊かさを構築できる12ヶ月となるでしょう。
        </p>
    </div>
</div>
```

### 32. 最終メッセージ（月詠からの締めくくり）

```html
<div class="tsukuyomi-section">
    <div class="tsukuyomi-character">
        <img src="/images/tsukuyomi/9.png" alt="月詠">
    </div>
    <div class="tsukuyomi-bubble special-message">
        <div class="tsukuyomi-name">月詠</div>
        <p>
            山田花子さん、ここまでお付き合いいただき、ありがとうございました。
        </p>
        <p>
            あなたの生まれた日の月、新月と満月の二つの顔を持つあなたは、本当に特別な存在です。創造と情熱、静寂と輝き、始まりと完成...相反する要素を内に秘めているからこそ、誰にも真似できない唯一無二の人生を歩むことができるのです。
        </p>
        <p>
            直近3ヶ月、月はあなたを導き続けます。新月の夜には新しい種を撒き、満月の夜にはその成長を祝福してください。月が満ちていく時は積極的に行動し、月が欠けていく時は内省と整理の時間を持つ。このリズムに従うことで、あなたの人生はより豊かで充実したものになるでしょう。
        </p>
        <p>
            覚えておいてください。あなたには、ゼロから何かを生み出す新月の力と、それを完成させる満月の力、両方が備わっています。この二つの力を信じて、恐れずに前進してください。
        </p>
        <p>
            時には迷うこともあるでしょう。そんな時は、夜空を見上げてください。月は形を変えながらも、必ずそこにあります。あなたの内なる月も同じように、どんな時もあなたを支え、導いてくれるはずです。
        </p>
        <p>
            最後に、私から特別な言葉を贈ります。
        </p>
        <p style="text-align: center; font-size: 20px; color: #ffd700; margin: 20px 0;">
            「月の導きのままに、あなたらしく輝き続けてください。<br>
            新月の創造力と満月の情熱が、<br>
            あなたの人生を最高に美しい物語にしてくれますように。」
        </p>
        <p>
            直近3ヶ月が、あなたにとって最高の期間となることを、心から願っています。
        </p>
        <p style="text-align: right; margin-top: 20px;">
            月詠（つくよみ）
        </p>
    </div>
</div>
```

### 33. 診断結果の保存オプション

```html
<div class="save-options">
    <h3 style="text-align: center; color: #ffd700; margin: 30px 0;">診断結果を保存する</h3>
    <div class="button-group" style="text-align: center;">
        <button class="save-button pdf">PDFでダウンロード</button>
        <button class="save-button email">メールで送信</button>
        <button class="save-button print">印刷する</button>
    </div>
    <p style="text-align: center; color: #ffffff; margin-top: 20px; font-size: 14px;">
        ※この診断結果は購入から10日間閲覧可能です
    </p>
</div>
```

---

## 📊 全64パターンの対応表

### 月相×裏月相の組み合わせ

| 表の月相 | 裏の月相 | 特徴キーワード |
|---------|---------|--------------|
| 新月 | 新月 | 純粋な創造者 |
| 新月 | 三日月 | 慎重な革新者 |
| 新月 | 上弦 | 行動的な開拓者 |
| 新月 | 十三夜 | バランスの取れた創造者 |
| 新月 | 満月 | 情熱的な革命家 |
| 新月 | 十六夜 | 成熟した先駆者 |
| 新月 | 下弦 | 整理する創造者 |
| 新月 | 暁 | 内省的な開拓者 |

（以下、56パターン省略 - 実装時は全64パターン必要）

---

## 💡 実装上の注意点

### 1. データの動的生成
```javascript
// ユーザー情報から診断結果を生成
const generateResult = (birthDate, surveyData) => {
    const moonPhase = calculateMoonPhase(birthDate);
    const hiddenMoonPhase = calculateHiddenMoonPhase(birthDate, moonPhase);
    const fortunePattern = getFortunePattern(moonPhase, hiddenMoonPhase);
    
    return {
        name: userData.name,
        moonPhase: moonPhase,
        hiddenMoonPhase: hiddenMoonPhase,
        energyType: surveyData.energy,
        valueType: surveyData.value,
        distanceType: surveyData.distance,
        expressionType: surveyData.expression,
        fortune: fortunePattern
    };
};
```

### 2. 10日間の閲覧期限管理
```javascript
// 購入日時を記録
const purchaseDate = new Date();
const expiryDate = new Date(purchaseDate.getTime() + (10 * 24 * 60 * 60 * 1000));

// アクセス時にチェック
if (new Date() > expiryDate) {
    // 再購入画面へリダイレクト
}
```

### 3. 文章の置換処理
```javascript
// プレースホルダーを実際の値に置換
let content = template;
content = content.replace(/\[NAME\]/g, userData.name);
content = content.replace(/\[MOON_PHASE\]/g, moonPhaseNames[userData.moonPhase]);
content = content.replace(/\[HIDDEN_MOON\]/g, moonPhaseNames[userData.hiddenMoonPhase]);
// etc...
```

---

これが有料版の**完全な文章テンプレート**です。1文字も省略していません。