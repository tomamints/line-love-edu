// Web版おつきさま診断のJavaScript

// 相性マトリックス
const compatibilityMatrix = {
  '新月': { '新月': 95, '三日月': 75, '上弦の月': 75, '十三夜': 75, '満月': 95, '十六夜': 55, '下弦の月': 55, '暁': 55 },
  '三日月': { '新月': 75, '三日月': 95, '上弦の月': 75, '十三夜': 75, '満月': 75, '十六夜': 75, '下弦の月': 55, '暁': 55 },
  '上弦の月': { '新月': 75, '三日月': 75, '上弦の月': 95, '十三夜': 75, '満月': 75, '十六夜': 55, '下弦の月': 75, '暁': 55 },
  '十三夜': { '新月': 75, '三日月': 75, '上弦の月': 75, '十三夜': 95, '満月': 75, '十六夜': 55, '下弦の月': 55, '暁': 75 },
  '満月': { '新月': 95, '三日月': 75, '上弦の月': 75, '十三夜': 75, '満月': 95, '十六夜': 75, '下弦の月': 55, '暁': 55 },
  '十六夜': { '新月': 55, '三日月': 75, '上弦の月': 55, '十三夜': 55, '満月': 75, '十六夜': 95, '下弦の月': 75, '暁': 75 },
  '下弦の月': { '新月': 55, '三日月': 55, '上弦の月': 75, '十三夜': 55, '満月': 55, '十六夜': 75, '下弦の月': 95, '暁': 75 },
  '暁': { '新月': 55, '三日月': 55, '上弦の月': 55, '十三夜': 75, '満月': 55, '十六夜': 75, '下弦の月': 75, '暁': 95 }
};

// 相性の詳細説明
const compatibilityDetails = {
  // 新月の相性
  '新月-新月': { reason: '同じスピード感と熱量で走れる同志', example: '金曜夜に「明日温泉行かない？」と片方が言えば、すぐに荷造りしてGO', advice: '互いに刺激を与え合い、毎日がイベントのように過ごせます' },
  '新月-三日月': { reason: '三日月の配慮と新月の行動力がバランスよく調和', example: '新月が提案し、三日月が細かい調整をして実現する', advice: 'お互いの長所を活かして、無理なく新しいことに挑戦できます' },
  '新月-上弦の月': { reason: '上弦の計画性が新月の衝動を現実的に導く', example: '新月のアイデアを上弦が計画に落とし込んで実現', advice: '勢いと戦略のバランスが取れた良い関係' },
  '新月-十三夜': { reason: '十三夜の穏やかさが、新月の勢いを優しく長持ちさせる', example: '新月の急な旅行提案に、十三夜が交通や宿を整えてくれて快適に実現', advice: '新月は安心感を得ながら、ペースを緩めずに進めます' },
  '新月-満月': { reason: '満月の温かさと感情表現が、新月の衝動を肯定し安心に変える', example: '新月が突然落ち込んでも、満月が全力で励まし、翌日には一緒に笑っている', advice: '二人の情熱が共鳴し、関係がより深まります' },
  '新月-十六夜': { reason: '十六夜の落ち着きが新月の熱を程よくクールダウン', example: '新月が興奮しすぎた時、十六夜が優しく落ち着かせる', advice: 'バランスを保ちながら、お互いを成長させる関係' },
  '新月-下弦の月': { reason: '下弦の整理力が新月の散らかりがちなエネルギーをまとめる', example: '新月が始めたことを下弦が整理して継続可能にする', advice: '衝動と整理のバランスが必要ですが、協力すれば良い結果に' },
  '新月-暁': { reason: '暁の深い内省が新月に新しい視点を与える', example: '新月が行動した後、暁との対話で深い気づきを得る', advice: 'ペースの違いを理解し合えれば、深い関係に発展' },
  // 三日月の相性
  '三日月-新月': { reason: '新月の勢いに三日月が優しくブレーキをかける', example: '新月の提案を三日月が現実的に調整して実現', advice: 'お互いのペースを尊重しながら前進できます' },
  '三日月-三日月': { reason: '似たペースと価値観で安心感抜群', example: 'どちらからも急かさず、自然に「また会おうね」と次の約束が決まる', advice: '互いの領域を尊重しつつ、じっくり愛を育てられます' },
  '三日月-上弦の月': { reason: '上弦の行動力が三日月の慎重さを良い方向に引き上げる', example: '上弦が計画を立て、三日月が「それなら安心」と乗るデート', advice: '三日月は安心して一歩踏み出せるようになります' },
  '三日月-十三夜': { reason: '穏やかな二人が作る安定した関係', example: 'お互いのペースを大切にしながら、ゆっくり関係を深める', advice: '長続きする穏やかで優しい関係を築けます' },
  '三日月-満月': { reason: '満月の明るさが三日月の内向性を優しく照らす', example: '満月が三日月を励まし、新しい世界へ導く', advice: '三日月は満月から勇気をもらい、より積極的になれます' },
  '三日月-十六夜': { reason: '十六夜の包容力が三日月の遠慮をほどく', example: '十六夜が「今日は君の行きたい所に行こう」と提案し、三日月が素直に希望を言える', advice: '深く落ち着いた関係を長く維持できます' },
  '三日月-下弦の月': { reason: '下弦の整理力と三日月の柔軟性が良いバランス', example: '三日月の柔軟さを下弦が受け止め、穏やかな流れを作る', advice: 'お互いの長所を活かした安定した関係' },
  '三日月-暁': { reason: '二人とも内向的でペースが似ている', example: '静かな場所でゆっくり過ごすデートが心地よい', advice: 'お互いの内面を理解し合える深い関係' },
  // 上弦の月の相性
  '上弦の月-新月': { reason: '新月の直感を上弦が計画に落とし込む', example: '新月のアイデアを上弦が段取りして実現', advice: '理想的な実行パートナーシップ' },
  '上弦の月-三日月': { reason: '三日月の慎重さを、上弦の設計力がやさしく前進させる', example: '三日月が「混んでるの苦手」と言えば、上弦が混雑回避ルート＋予約を段取り', advice: '三日月は安心して一歩を踏み出せ、上弦は「進める役割」を心地よく担えます' },
  '上弦の月-上弦の月': { reason: '計画力×計画力で完璧な実行', example: '二人で緻密な計画を立て、着実に実行', advice: '時には直感的な行動も大切にしましょう' },
  '上弦の月-十三夜': { reason: '十三夜の安定感と上弦の推進力が良いバランス', example: '上弦が提案し、十三夜が現実的に調整', advice: '無理なく着実に前進できる関係' },
  '上弦の月-満月': { reason: '満月の情熱を上弦が形にする', example: '満月の夢を上弦が計画して実現', advice: '感情と論理のバランスが取れた関係' },
  '上弦の月-十六夜': { reason: '十六夜の余裕が上弦の焦りを和らげる', example: '上弦が急ぎすぎた時、十六夜が優しくペースダウン', advice: '急がず焦らず、着実に進む関係' },
  '上弦の月-下弦の月': { reason: '行動（上弦）×整理（下弦）の補完関係', example: '引っ越しを検討するとき、上弦が候補を集め、下弦が条件表で比較', advice: '上弦が広げた選択肢を、下弦がムダなく絞り込む。決断の質が上がります' },
  '上弦の月-暁': { reason: '上弦の行動力が暁を引っ張ってくれる', example: '暁が迷っている時、上弦が道筋を示す', advice: '暁の内省と上弦の実行力が補完し合う' },
  // 十三夜の相性
  '十三夜-新月': { reason: '新月の直感と行動力が、十三夜に新鮮な風を運ぶ', example: '新月が「来週、急だけど温泉行かない？」——十三夜は予算と交通だけ整えてGO', advice: 'あなたの安定感が新月の勢いを安心して継続させます' },
  '十三夜-三日月': { reason: '穏やかな二人が作る安らぎの空間', example: 'お互いのペースを大切にしながら関係を育む', advice: '無理なく自然体でいられる関係' },
  '十三夜-上弦の月': { reason: '上弦の計画性と十三夜の安定感が調和', example: '上弦が提案し、十三夜が現実的に支える', advice: 'バランスの取れた建設的な関係' },
  '十三夜-十三夜': { reason: '似たテンポと価値観。衝突が少なく、静かな幸福が長く続く', example: '記念日は外食1回＋自宅でデザート。派手さより満ち足りた余白を共有', advice: '穏やかで安定した長期的な関係' },
  '十三夜-満月': { reason: '満月の明るさと十三夜の落ち着きが良いバランス', example: '満月が盛り上げ、十三夜が支える', advice: '感情と理性のバランスが取れた関係' },
  '十三夜-十六夜': { reason: '二人とも成熟した落ち着きがある', example: '大人の余裕を持った関係', advice: '時には刺激も必要かもしれません' },
  '十三夜-下弦の月': { reason: '下弦の"手放し・整理"が、十三夜の"保持・安定"と時に衝突', example: '物を減らしたい下弦、思い出を残したい十三夜。"思い出はデータ化、実物は厳選"の中庸で◎', advice: '役割が噛み合えば堅実な関係' },
  '十三夜-暁': { reason: '暁の内省と深い対話が、十三夜の安心基盤にぴたり', example: '週末は各自の趣味→夜に1時間の深いおしゃべり', advice: '静けさ×滋養で心が満ちる関係' },
  // 満月の相性  
  '満月-新月': { reason: '新月の直感と行動力が、満月の感情を長く燃やし続ける', example: '新月の「突然だけど旅行行こう！」に、満月が即ノリで熱量倍増', advice: '情熱的で刺激的な関係' },
  '満月-三日月': { reason: '満月の明るさが三日月を優しく照らす', example: '満月が三日月を励まし、新しい世界へ導く', advice: '満月が三日月に勇気を与える関係' },
  '満月-上弦の月': { reason: '満月の情熱を上弦が形にする', example: '満月の夢を上弦が計画して実現', advice: '感情と実行力の良いコンビネーション' },
  '満月-十三夜': { reason: '満月の熱と十三夜の安定感がバランス', example: '満月が盛り上げ、十三夜が支える', advice: '情熱と安定の調和' },
  '満月-満月': { reason: '感情表現豊かな二人の情熱的な関係', example: '喜びも悲しみも全力で共有', advice: '時にはクールダウンも必要' },
  '満月-十六夜': { reason: '十六夜の落ち着きが満月の熱をやわらげ、安定感と情熱の両立が可能', example: '興奮して話しすぎた後、十六夜が「少し散歩しよう」とクールダウンを促してくれる', advice: 'バランスの取れた情熱的な関係' },
  '満月-下弦の月': { reason: '下弦の冷静さが満月の熱を整理', example: '満月の感情を下弦が整理して方向性を示す', advice: '感情と理性のバランスが鍵' },
  '満月-暁': { reason: '満月の外向性と暁の内向性の対比', example: '満月が暁を外の世界へ連れ出す', advice: 'お互いの世界を理解し合うことが大切' },
  // 十六夜の相性
  '十六夜-新月': { reason: '新月の行動力に安定の軸を与える', example: '新月の衝動を十六夜が優しく導く', advice: '新月は安心して冒険できます' },
  '十六夜-三日月': { reason: '慎重で配慮ある三日月と、成熟した余裕で安定感抜群', example: '十六夜が三日月の遠慮を優しくほどく', advice: '深く落ち着いた関係' },
  '十六夜-上弦の月': { reason: '上弦の焦りを十六夜が和らげる', example: '急ぎすぎる上弦に十六夜がペースダウンを促す', advice: '焦らず着実に進む関係' },
  '十六夜-十三夜': { reason: '二人とも成熟した大人の関係', example: '落ち着いた大人のデート', advice: '安定しすぎて刺激不足に注意' },
  '十六夜-満月': { reason: '満月の情熱をやさしく受け止め、熱をちょうどよく保つ', example: '満月の感情を十六夜が包み込む', advice: '情熱と落ち着きの調和' },
  '十六夜-十六夜': { reason: '似た者同士で、安らぎと落ち着きを共有できる', example: '静かで穏やかな時間を共有', advice: '時には新しい刺激も必要' },
  '十六夜-下弦の月': { reason: '二人とも引き算の美学を理解', example: 'シンプルで質の高い生活を共有', advice: '落ち着いた大人の関係' },
  '十六夜-暁': { reason: '深い内省と成熟した余裕の調和', example: '静かに深い対話を楽しむ', advice: '精神的に豊かな関係' },
  // 下弦の月の相性
  '下弦の月-新月': { reason: '新月の散らかったエネルギーを下弦が整理', example: '新月が始めたことを下弦がまとめる', advice: '役割分担を明確にすると良い' },
  '下弦の月-三日月': { reason: '三日月の柔軟さを下弦が受け止め、穏やかな流れを作る', example: '三日月の優しさと下弦の整理力が調和', advice: 'お互いの長所を活かした安定した関係' },
  '下弦の月-上弦の月': { reason: '上弦の行動力と下弦の整理力が補完', example: '上弦が広げ、下弦が絞り込む', advice: '役割分担で効率的な関係' },
  '下弦の月-十三夜': { reason: '下弦の整理と十三夜の安定の違い', example: '下弦が減らしたがり、十三夜が保持したがる', advice: '中庸を見つけることが大切' },
  '下弦の月-満月': { reason: '満月の感情を下弦が整理', example: '満月の熱を下弦がクールダウン', advice: '感情と理性のバランスが必要' },
  '下弦の月-十六夜': { reason: '二人とも引き算の美学を共有', example: 'シンプルで質の高い生活', advice: '落ち着いた関係' },
  '下弦の月-下弦の月': { reason: '整理整頓の価値観が一致', example: '無駄のない効率的な生活', advice: '時には遊び心も大切' },
  '下弦の月-暁': { reason: '内省と整理の静かな調和', example: '深く考え、必要なものだけを残す', advice: '精神的に深い関係' },
  // 暁の相性
  '暁-新月': { reason: '新月の行動力が暁を外へ連れ出す', example: '新月が暁の内省に新しい刺激を与える', advice: 'ペースの違いを理解し合うことが大切' },
  '暁-三日月': { reason: '二人とも内向的で理解し合える', example: '静かで落ち着いた時間を共有', advice: '深い内面の交流ができる関係' },
  '暁-上弦の月': { reason: '上弦の実行力が暁の考えを形にする', example: '暁が考え、上弦が実行', advice: '思考と行動の良いバランス' },
  '暁-十三夜': { reason: '十三夜の安定感と暁の内省が調和', example: '深い対話と安心感のある関係', advice: '精神的に豊かな関係' },
  '暁-満月': { reason: '満月の明るさが暁を照らす', example: '満月が暁を外の世界へ導く', advice: '内と外のバランスが大切' },
  '暁-十六夜': { reason: '成熟した余裕と深い内省の調和', example: '静かで深い理解のある関係', advice: '精神的に充実した関係' },
  '暁-下弦の月': { reason: '内省と整理の静かな関係', example: '必要最小限で満たされる', advice: '深く静かな関係' },
  '暁-暁': { reason: '深い内省と理解の共有', example: '言葉少なでも通じ合える', advice: '時には外の刺激も必要' }
};

// 月タイプ定義
const moonTypes = {
    '新月': {
        emoji: '🌑',
        title: '新月タイプの物語',
        introduction: 'あなたが生まれた夜、空には月が見えませんでした。',
        symbolism: '新月は「始まり」「真っさらな可能性」「まだ見えない未来」を象徴します。',
        traits: [
            '直感力と瞬発力が飛び抜けています',
            '未知の人・場所・体験に強く惹かれる',
            '心が動いた瞬間に行動できる',
            '初対面でも自然に距離を縮められる',
            '「今」の気持ちを大事にし、勢いがある'
        ],
        loveStyle: '新月の恋は、雷が落ちるように始まります。「この人だ！」と直感したら、一気に距離を詰め、短期間で深い関係に。',
        loveExamples: [
            '出会って数時間で「来週、ご飯行こう！」と即提案',
            'LINEは熱量高め、写真や動画もすぐ共有',
            '付き合う前でもサプライズや遠出を提案し、相手をワクワクさせる'
        ],
        caution: 'ただし、安定期に入るとメッセージが短くなったり、会う間隔が空いたりすることも。本人は「落ち着いただけ」でも、相手は「冷められた？」と感じやすい点に注意。',
        actionAdvice: [
            '「安定デー」をカレンダーに先置き：月に2回は動かないデート（自炊・散歩・映画）を予約',
            '熱量の"3段変速"運転：初期＝全開／中期＝安定／長期＝低燃費',
            '週1日は連絡や提案をせず、相手からの動きを待つ'
        ]
    },
    '三日月': {
        emoji: '🌒',
        title: '三日月タイプの物語',
        introduction: 'あなたが生まれた日の夜空には、右側に細く光る三日月が浮かんでいました。',
        symbolism: '三日月は「準備」「芽吹きの保護」「柔軟な適応力」を象徴します。',
        traits: [
            '状況をよく観察し、相手や環境に合わせて距離感を調整できる',
            '相手の感情や雰囲気を敏感に察知する',
            '自分よりも相手を優先する場面が多い',
            '無理をせず自然体で関係を続けられる'
        ],
        loveStyle: '三日月の恋は、種を少しずつ育てる庭師のようです。一目惚れよりも、安心感を積み重ねて距離を縮めます。',
        loveExamples: [
            '気になる相手には、まずLINEや会話で信頼関係を作ってからデートに誘う',
            '相手が忙しいときは無理に会おうとせず、短いメッセージだけ送る',
            '恋人の疲れを察知して、会う代わりに「ゆっくり休んでね」と伝える'
        ],
        caution: '優しさが強すぎて本音を後回しにすることがあり、恋愛の進展がゆっくりになりがちです。',
        actionAdvice: [
            '"小さな一歩アクション"を月3回：軽い誘いやメッセージで自分から動く習慣',
            '本音メモを週1回：相手に伝えたいことをメモに書き出し、その中から1つだけ伝える',
            '感情共有デー：月末に「今月の嬉しかったこと・不安だったこと」をお互い話す'
        ]
    },
    '上弦の月': {
        emoji: '🌓',
        title: '上弦の月タイプの物語',
        introduction: 'あなたが生まれた夜、右半分がくっきりと光る上弦の月が空にかかっていました。',
        symbolism: '上弦の月は「行動計画」「加速」「段階的な成長」を象徴します。',
        traits: [
            '目的を決めたら"いつ・何を・どうやって"を自然に組み立てる',
            '勢いだけで走るのではなく、現実に落とし込む設計図づくりが得意',
            '着実に前へ進める推進力がある',
            '計画を守る意識が強い'
        ],
        loveStyle: '上弦タイプの恋は、"見通し"を持つところから始まります。相手をよく観察し、価値観や生活リズムが噛み合うかを確認。',
        loveExamples: [
            '初回の食事が良い感触なら、帰り際に「来週どこかでランチどう？」とカレンダー前提で誘う',
            '相手が忙しい時期は、"負担を上げない接点"としてボイスメッセージやスタンプで様子見',
            '関係が進むと、旅行・記念日・将来の暮らし方など中期計画の話題を自然に持ち込む'
        ],
        caution: 'ペース設定がやや"前のめり"になりやすく、相手には「急かされている」と感じられる場合があります。',
        actionAdvice: [
            '"余白デー"をカレンダーに先置き：月に2回、あえて"何もしないデート"を予約',
            '会話の冒頭15分は"共感モード固定"：解決策・提案は15分以降',
            'デートの幹を相手に丸投げする"お任せ回"を定期開催'
        ]
    },
    '十三夜': {
        emoji: '🌔',
        title: '十三夜タイプの物語',
        introduction: 'あなたが生まれた夜、ほぼ満ちた月――十三夜が、満ちる直前の静かな高まりを湛えていました。',
        symbolism: '十三夜は「実り」「充足」「安定した発展」を象徴します。',
        traits: [
            '落ち着いた物腰と、相手の気持ちを受け止める包容力',
            '声を荒げず、状況を整え、場の温度をちょうどよく保つ',
            '仕事では火消し・段取りの微修正・関係調整が得意',
            '友人間では"聞き役"として安心を供給'
        ],
        loveStyle: '十三夜の恋は、安心の土台づくりから始まります。連絡は量より質。会う頻度も"持続可能なペース"を重視。',
        loveExamples: [
            '週3の短いLINEより、週2の丁寧な通話で互いの近況と感情を共有',
            '外食続きより、自宅で一緒に料理→ドラマ1話のほうが満足度が高い',
            '将来の話も「2年以内に同棲」「双方の通勤30分圏内」など現実的な条件で擦り合わせ'
        ],
        caution: '慎重さが"受け身"に見えることがあり、相手のチャレンジ提案に「今度ね」を重ねると、関係が停滞してしまうことがあります。',
        actionAdvice: [
            '"小さな変化クォータ"を月2回：新しい店/未経験ジャンルの映画など、低リスクの冒険を予定化',
            'ケアと言語化の両輪：相手が落ち込む日は温かい料理＋15分の傾聴',
            '安心の合言葉を決める：例「私たちは長距離走」'
        ]
    },
    '満月': {
        emoji: '🌕',
        title: '満月タイプの物語',
        introduction: 'あなたが生まれた夜空には、まん丸に輝く満月が、暗闇を余すことなく照らしていました。',
        symbolism: '満月は「光」「開放」「感情の豊かさ」を象徴します。',
        traits: [
            'まるで灯台のように、人を自然と惹きつける',
            '感情表現がストレートで、嬉しいときは全身で喜ぶ',
            '悲しいときは涙を隠さない正直さ',
            '信頼できる、一緒にいて心が温まる存在'
        ],
        loveStyle: '満月の恋は、花火が夜空に一気に開くようなスタート。出会った瞬間から距離を縮め、短期間で深い絆を築きます。',
        loveExamples: [
            '交際初期から「毎日おはようとおやすみのLINE」を欠かさない',
            '誕生日や記念日には全力でお祝いし、相手の喜ぶ顔を見たい一心で計画',
            '落ち込む相手を、笑わせようと冗談や行動で全力フォロー'
        ],
        caution: '感情の波が大きいため、熱が冷めると急に距離を置く傾向も。相手を不安にさせやすい面があります。',
        actionAdvice: [
            '愛を受け取る練習：デート計画を相手に任せてみる',
            '月に1〜2回は「自分から誘わない日」を意識的に作る',
            '感情のピークは"一晩保管"ルール：翌朝読み返してから送信'
        ]
    },
    '十六夜': {
        emoji: '🌖',
        title: '十六夜タイプの物語',
        introduction: 'あなたが生まれた夜空に浮かんでいたのは、満月の翌日に少しだけ欠け始めた十六夜の月。',
        symbolism: '十六夜は「成熟」「余裕」「引き際の美学」を象徴します。',
        traits: [
            '一歩引いて全体を見渡す視点',
            '物事を円滑に進める調整力',
            '大きな声で主張しなくても存在感がある',
            '人間関係の温度を一定に保つことができる'
        ],
        loveStyle: '十六夜の恋は、静かで安定的な炎。相手をよく観察し、過剰なアプローチや押しすぎはしません。',
        loveExamples: [
            '会いたい気持ちがあっても、相手の疲れや予定を優先して連絡を控える',
            '記念日やサプライズよりも、日常の中で相手が喜ぶ行動を選ぶ',
            '喧嘩になりそうな時は沈黙を選び、時間をおいて冷静な話し合いに持ち込む'
        ],
        caution: 'あまりに落ち着きすぎて「本当に好きなのかな？」と思われたり、情熱が見えにくくなることも。',
        actionAdvice: [
            '"半歩前進デー"を設定：月に1回は、自分からデートや旅行の提案をする',
            '感情を"見える形"で渡す習慣：手紙・短いメッセージで普段言わない気持ちを可視化',
            '"思い出トリガー"を活用：過去の楽しかったデートを時々引っ張り出して共有'
        ]
    },
    '下弦の月': {
        emoji: '🌗',
        title: '下弦の月タイプの物語',
        introduction: 'あなたが生まれた夜空には、左半分がくっきりと光る下弦の月。',
        symbolism: '下弦は「整理」「収束」「安定化」を象徴します。',
        traits: [
            '情報・感情・出来事を冷静に整理する力',
            '物事を引き算で整える',
            '流行や感情に左右されず、自分の軸を持つ',
            '他人の感情を受け止めつつも、飲み込まれない距離感'
        ],
        loveStyle: '下弦の恋は、じっくり熟成型。急速な距離の詰め方よりも、お互いの信頼を積み上げてから深まります。',
        loveExamples: [
            '連絡は適度、相手の生活リズムを尊重して返す',
            '相手が落ち込んでいても、必要以上に踏み込まず、そばにいる安心感を与える',
            '交際が安定期に入ると、会う頻度や過ごし方も心地よいパターンに定着'
        ],
        caution: '変化を求められたり、強い感情表現を受けると「自分のペースを乱される」と感じやすい傾向があります。',
        actionAdvice: [
            '"変化体験"を月1回だけ入れる：普段の安定デートに加え、新しい場所や体験を試す',
            '感情を"事実の前"に話す：提案や整理よりも先に感情を一言添える',
            '"予定なし時間"を一緒に過ごす訓練：ゴールのないデートを月に1回'
        ]
    },
    '暁': {
        emoji: '🌘',
        title: '暁タイプの物語',
        introduction: 'あなたが生まれた夜空は、月が沈み、夜明け前の静けさが世界を包んでいました。',
        symbolism: '暁は「終わりと始まりの境目」「静かな内省」「次のステージへの準備」を象徴します。',
        traits: [
            '深く考える力と、物事を静かに整えていく力',
            '感情を外に激しく出すより、まず内側で整理',
            'じっくり考えてから行動する',
            '本当に大切だと思える相手やことだけを選び抜く'
        ],
        loveStyle: '暁の恋は、静かに深まる水脈のよう。一気に燃え上がるよりも、少しずつ心を許し、時間をかけて絆を強くしていきます。',
        loveExamples: [
            '連絡頻度は少なめでも、会ったときの時間密度は濃い',
            '相手の感情にすぐ反応せず、まずは聞いて受け止めてから返す',
            'デートは落ち着いた場所や二人きりになれる空間を好む'
        ],
        caution: 'テンポの速い恋愛や、感情表現の激しい相手とは、ペースの違いで疲れやすい傾向があります。',
        actionAdvice: [
            '"半歩先アクション"を習慣化：自分からも軽い提案を月2回する',
            '感情の"事前シグナル"を出す：考える時間が必要なときは一言添える',
            '月1回"オープンデー"を設定：その日は意識的に自分の気持ちを多めに話す'
        ]
    }
};

// 月齢から月タイプへのマッピング
const moonPhaseRanges = [
    { type: '新月', range: [0, 3.7] },
    { type: '三日月', range: [3.7, 7.4] },
    { type: '上弦の月', range: [7.4, 11.1] },
    { type: '十三夜', range: [11.1, 14.8] },
    { type: '満月', range: [14.8, 18.5] },
    { type: '十六夜', range: [18.5, 22.1] },
    { type: '下弦の月', range: [22.1, 25.8] },
    { type: '暁', range: [25.8, 29.53] }
];

// 月齢を計算
function calculateMoonAge(date) {
    const referenceDate = new Date('2000-01-06 18:14:00');
    const lunarCycle = 29.53059;
    const daysDiff = (date - referenceDate) / (1000 * 60 * 60 * 24);
    let moonAge = daysDiff % lunarCycle;
    if (moonAge < 0) moonAge += lunarCycle;
    return Math.round(moonAge * 10) / 10;
}

// 月齢から月タイプを判定
function getMoonTypeFromAge(moonAge) {
    for (const phase of moonPhaseRanges) {
        if (moonAge >= phase.range[0] && moonAge < phase.range[1]) {
            return phase.type;
        }
    }
    return '新月';
}

// 診断実行
function diagnose() {
    const year = document.getElementById('year').value;
    const month = document.getElementById('month').value;
    const day = document.getElementById('day').value;
    
    if (!year || !month || !day) {
        alert('誕生日を選択してください');
        return;
    }
    
    const birthdate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const date = new Date(birthdate + ' 00:00:00');
    const moonAge = calculateMoonAge(date);
    const moonType = getMoonTypeFromAge(moonAge);
    const moonData = moonTypes[moonType];
    
    displayResult(moonType, moonData, birthdate);
}

// 各月タイプとの相性を計算
function getCompatibilityList(moonType) {
    const moonTypes = ['新月', '三日月', '上弦の月', '十三夜', '満月', '十六夜', '下弦の月', '暁'];
    const compatibilities = [];
    
    moonTypes.forEach(otherType => {
        if (otherType === moonType) return; // 自分自身は除外
        
        const score = compatibilityMatrix[moonType][otherType];
        const key = `${moonType}-${otherType}`;
        const details = compatibilityDetails[key] || {};
        
        compatibilities.push({
            type: otherType,
            emoji: getEmojiForType(otherType),
            score: score,
            level: score >= 95 ? '◎' : score >= 75 ? '○' : '△',
            ...details
        });
    });
    
    // スコアで降順ソート
    return compatibilities.sort((a, b) => b.score - a.score);
}

// 月タイプの絵文字を取得
function getEmojiForType(type) {
    const emojis = {
        '新月': '🌑',
        '三日月': '🌒',
        '上弦の月': '🌓',
        '十三夜': '🌔',
        '満月': '🌕',
        '十六夜': '🌖',
        '下弦の月': '🌗',
        '暁': '🌘'
    };
    return emojis[type] || '🌙';
}

// 診断結果を表示
function displayResult(moonType, moonData, birthdate) {
    const inputSection = document.getElementById('inputSection');
    const resultSection = document.getElementById('resultSection');
    
    inputSection.style.display = 'none';
    resultSection.style.display = 'block';
    
    const compatibilityList = getCompatibilityList(moonType);
    const bestMatch = compatibilityList.filter(c => c.score >= 95);
    const goodMatch = compatibilityList.filter(c => c.score >= 75 && c.score < 95);
    const normalMatch = compatibilityList.filter(c => c.score < 75);
    
    resultSection.innerHTML = `
        <div class="moon-type-card">
            <div class="moon-emoji">${moonData.emoji}</div>
            <div class="moon-type-name">${moonType}タイプ</div>
            <div class="moon-type-title">${moonData.title}</div>
        </div>
        
        <div class="description-box">
            <div class="description-title">
                <span>📖</span>
                <span>あなたの物語</span>
            </div>
            <div class="description-text">
                ${moonData.introduction}<br><br>
                ${moonData.symbolism}
            </div>
        </div>
        
        <div class="description-box">
            <div class="description-title">
                <span>✨</span>
                <span>あなたの特徴</span>
            </div>
            <ul class="traits-list">
                ${moonData.traits.map(trait => `<li>${trait}</li>`).join('')}
            </ul>
        </div>
        
        <div class="description-box love-style-box">
            <div class="description-title">
                <span>💕</span>
                <span>恋愛スタイル</span>
            </div>
            <div class="description-text">
                ${moonData.loveStyle}
            </div>
        </div>
        
        <div class="description-box examples-box">
            <div class="description-title">
                <span>💭</span>
                <span>恋愛での具体例</span>
            </div>
            <ul class="traits-list">
                ${moonData.loveExamples.map(ex => `<li>${ex}</li>`).join('')}
            </ul>
        </div>
        
        <div class="description-box">
            <div class="description-title">
                <span>⚠️</span>
                <span>気をつけたいこと</span>
            </div>
            <div class="description-text">
                ${moonData.caution}
            </div>
        </div>
        
        <div class="description-box advice-box">
            <div class="description-title">
                <span>💡</span>
                <span>今すぐできる改善アクション</span>
            </div>
            <ul class="traits-list">
                ${moonData.actionAdvice.map(advice => `<li>${advice}</li>`).join('')}
            </ul>
        </div>
        
        <div class="description-box" style="background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); border-left: 4px solid #fdcb6e;">
            <div class="description-title">
                <span>🌙</span>
                <span>あなたと他の月タイプとの相性</span>
            </div>
            
            ${bestMatch.length > 0 ? `
            <div style="margin-top: 20px;">
                <div style="font-weight: bold; color: #d63031; margin-bottom: 12px; font-size: 16px;">
                    ◎ とても相性が良い月タイプ
                </div>
                ${bestMatch.map(c => `
                    <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="font-size: 24px;">${c.emoji}</span>
                            <span style="font-weight: bold; color: #764ba2;">${c.type}タイプ</span>
                            <span style="color: #d63031; font-weight: bold;">${c.score}%</span>
                        </div>
                        <div style="font-size: 13px; color: #555; margin-bottom: 6px;">
                            <strong>理由:</strong> ${c.reason || ''}
                        </div>
                        <div style="font-size: 13px; color: #555; margin-bottom: 6px;">
                            <strong>例:</strong> ${c.example || ''}
                        </div>
                        <div style="font-size: 13px; color: #764ba2; font-weight: 500;">
                            ${c.advice || ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${goodMatch.length > 0 ? `
            <div style="margin-top: 20px;">
                <div style="font-weight: bold; color: #00b894; margin-bottom: 12px; font-size: 16px;">
                    ○ 相性が良い月タイプ
                </div>
                ${goodMatch.map(c => `
                    <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="font-size: 24px;">${c.emoji}</span>
                            <span style="font-weight: bold; color: #764ba2;">${c.type}タイプ</span>
                            <span style="color: #00b894; font-weight: bold;">${c.score}%</span>
                        </div>
                        <div style="font-size: 13px; color: #555; margin-bottom: 6px;">
                            <strong>理由:</strong> ${c.reason || ''}
                        </div>
                        <div style="font-size: 13px; color: #555; margin-bottom: 6px;">
                            <strong>例:</strong> ${c.example || ''}
                        </div>
                        <div style="font-size: 13px; color: #764ba2; font-weight: 500;">
                            ${c.advice || ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${normalMatch.length > 0 ? `
            <div style="margin-top: 20px;">
                <div style="font-weight: bold; color: #636e72; margin-bottom: 12px; font-size: 16px;">
                    △ 普通の相性の月タイプ
                </div>
                ${normalMatch.map(c => `
                    <div style="background: white; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="font-size: 24px;">${c.emoji}</span>
                            <span style="font-weight: bold; color: #764ba2;">${c.type}タイプ</span>
                            <span style="color: #636e72; font-weight: bold;">${c.score}%</span>
                        </div>
                        <div style="font-size: 13px; color: #555; margin-bottom: 6px;">
                            <strong>理由:</strong> ${c.reason || ''}
                        </div>
                        <div style="font-size: 13px; color: #555; margin-bottom: 6px;">
                            <strong>例:</strong> ${c.example || ''}
                        </div>
                        <div style="font-size: 13px; color: #764ba2; font-weight: 500;">
                            ${c.advice || ''}
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : ''}
        </div>
        
        <!-- LINE公式アカウントへの誘導セクション -->
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 20px; padding: 30px; margin: 30px 0; text-align: center; border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="color: rgba(255, 255, 255, 0.9); margin-bottom: 20px;">
                <div style="font-size: 20px; margin-bottom: 18px; font-weight: normal; letter-spacing: 1.5px;">
                    気になるあの人との相性を詳しく知りたいあなたへ
                </div>
                <div style="font-size: 15px; line-height: 1.8; opacity: 0.85; font-weight: 300;">
                    ${moonType}タイプのあなたへ<br>
                    月詠からの、さらなる言葉をお届けします
                </div>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin: 20px 0;">
                <div style="color: rgba(255, 255, 255, 0.9); margin-bottom: 15px;">
                    <div style="font-size: 16px; font-weight: normal; color: rgba(255, 255, 255, 0.9); margin-bottom: 12px; letter-spacing: 0.5px;">
                        月詠の特別な占い
                    </div>
                    <div style="text-align: left; max-width: 400px; margin: 0 auto; font-size: 14px; line-height: 1.8; color: rgba(255, 255, 255, 0.7); font-weight: 300;">
                        🌙 気になるあの人との相性を読み解く<br>
                        💫 二人の会話に隠された真実<br>
                        🔮 日々変わる恋の月相<br>
                        📜 月詠からの個別メッセージ
                    </div>
                </div>
                
                <a href="https://lin.ee/egmCXoG" 
                   target="_blank"
                   style="display: inline-block; background: linear-gradient(135deg, #2a2a3e 0%, #16213e 100%); color: rgba(255, 255, 255, 0.9); padding: 14px 36px; border-radius: 30px; text-decoration: none; font-weight: normal; font-size: 15px; margin-top: 15px; border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 4px 15px rgba(0,0,0,0.3); letter-spacing: 0.5px;">
                    🌙 月詠とLINEで繋がる
                </a>
            </div>
        </div>
        
        <div class="share-section">
            <p class="share-text">診断結果をシェアする</p>
            <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 16px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap; justify-content: center;">
                    <div style="font-size: 64px;">${moonData.emoji}</div>
                    <div style="text-align: center;">
                        <div style="font-size: 18px; font-weight: bold; color: #764ba2; margin-bottom: 4px;">
                            私は${moonType}タイプでした！
                        </div>
                        <div style="font-size: 14px; color: #666;">
                            おつきさま診断で本当の自分がわかる
                        </div>
                    </div>
                </div>
            </div>
            <div class="share-buttons">
                <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`私は${moonType}タイプでした！${moonData.emoji}\n\n${moonData.title}\n\nおつきさま診断で自分の本当の性格と恋愛スタイルがわかる✨\n\n`)}&url=${encodeURIComponent('https://line-love-edu.vercel.app/moon-fortune.html')}" 
                   target="_blank" 
                   class="share-btn share-twitter">
                    Xでシェア
                </a>
                <a href="https://line.me/R/msg/text/?${encodeURIComponent(`私は${moonType}タイプでした！${moonData.emoji}\n\n${moonData.title}\n\nおつきさま診断で自分の本当の性格と恋愛スタイルがわかる✨\n\nhttps://line-love-edu.vercel.app/moon-fortune.html`)}" 
                   target="_blank" 
                   class="share-btn share-line">
                    LINEでシェア
                </a>
            </div>
        </div>
        
        <button class="btn-retry" onclick="retry()">
            もう一度診断する
        </button>
    `;
}

// もう一度診断
function retry() {
    const inputSection = document.getElementById('inputSection');
    const resultSection = document.getElementById('resultSection');
    
    inputSection.style.display = 'block';
    resultSection.style.display = 'none';
    
    document.getElementById('year').value = '';
    document.getElementById('month').value = '';
    document.getElementById('day').value = '';
}

// セレクトボックスにオプションを追加
function populateDateSelectors() {
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
    
    // 年のオプション（1900年から今年まで）
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
    
    // 月のオプション
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        monthSelect.appendChild(option);
    }
    
    // 日のオプション（最初は31日まで）
    updateDays();
    
    // 月や年が変更されたら日を更新
    yearSelect.addEventListener('change', updateDays);
    monthSelect.addEventListener('change', updateDays);
}

// 日のオプションを更新
function updateDays() {
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');
    
    const year = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);
    
    // 選択された月の最大日数を取得
    let maxDays = 31;
    if (month) {
        if (month === 2) {
            // うるう年の判定
            if (year && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
                maxDays = 29;
            } else {
                maxDays = 28;
            }
        } else if ([4, 6, 9, 11].includes(month)) {
            maxDays = 30;
        }
    }
    
    // 現在の選択値を保存
    const currentDay = daySelect.value;
    
    // 日のオプションをクリアして再生成
    daySelect.innerHTML = '<option value="">日</option>';
    for (let day = 1; day <= maxDays; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day;
        daySelect.appendChild(option);
    }
    
    // 可能であれば以前の選択値を復元
    if (currentDay && currentDay <= maxDays) {
        daySelect.value = currentDay;
    }
}

// 画像生成関数（後方互換性のため残す）
function generateAndShowShareImage(moonType) {
    const moonData = moonTypes[moonType];
    if (!moonData) return;
    
    // 既存のcanvasを取得または作成
    let canvas = document.getElementById('shareCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'shareCanvas';
    }
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    
    // グラデーション背景（月タイプごとに色を変える）
    const gradientColors = {
        '新月': ['#1a1a2e', '#16213e'],
        '三日月': ['#0f3460', '#16213e'],
        '上弦の月': ['#533483', '#764ba2'],
        '十三夜': ['#e74c3c', '#c0392b'],
        '満月': ['#f39c12', '#e67e22'],
        '十六夜': ['#e67e22', '#d35400'],
        '下弦の月': ['#16a085', '#27ae60'],
        '暁': ['#34495e', '#2c3e50']
    };
    
    const colors = gradientColors[moonType] || ['#667eea', '#764ba2'];
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 半透明の円形装飾（複数追加）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(150, 150, 120, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(1050, 480, 180, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(600, 100, 80, 0, Math.PI * 2);
    ctx.fill();
    
    // タイトル背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 60, canvas.width, 120);
    
    // タイトル
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px "Kiwi Maru", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.fillText('おつきさま診断', canvas.width / 2, 140);
    ctx.shadowBlur = 0;
    
    // 月の絵文字（背景付き）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 280, 100, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.font = '160px serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 15;
    ctx.fillText(moonData.emoji, canvas.width / 2, 320);
    ctx.shadowBlur = 0;
    
    // 月タイプ名
    ctx.font = 'bold 48px "Kiwi Maru", sans-serif';
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 8;
    ctx.fillText(`${moonType}タイプ`, canvas.width / 2, 410);
    ctx.shadowBlur = 0;
    
    // キャッチフレーズ（月タイプのタイトルを表示）
    ctx.font = '28px "Kiwi Maru", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillText(moonData.title, canvas.width / 2, 460);
    
    // サブテキスト
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '24px "Kiwi Maru", sans-serif';
    ctx.fillText('生まれた日の月があなたの', canvas.width / 2, 515);
    ctx.fillText('本当の性格と恋愛スタイルを教えます', canvas.width / 2, 550);
    
    // URL（背景付き）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 570, canvas.width, 60);
    ctx.font = '22px "Kiwi Maru", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('🌙 love-tsukuyomi.com/moon', canvas.width / 2, 605);
    
    // コンテナを表示
    const container = document.getElementById('shareImageContainer');
    if (container) {
        container.style.display = 'block';
        // スクロールして画像を表示
        setTimeout(() => {
            container.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
}

// シェア画像をダウンロード
function downloadShareImage(moonType) {
    const canvas = document.getElementById('shareCanvas');
    if (!canvas) {
        generateAndShowShareImage(moonType);
        setTimeout(() => downloadShareImage(moonType), 500);
        return;
    }
    
    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `おつきさま診断_${moonType}タイプ.png`;
        a.click();
        URL.revokeObjectURL(url);
        
        // ダウンロード後にアラート
        setTimeout(() => {
            alert('画像を保存しました！この画像をSNSに投稿してシェアしてください♪');
        }, 100);
    });
}

// SNSにシェア（画像保存を促す）
function shareToSNS(platform, moonType) {
    const moonData = moonTypes[moonType];
    if (!moonData) return;
    
    // まず画像を保存するよう促す
    alert('まず画像を保存してから、SNSアプリで投稿してください！');
    
    // 画像をダウンロード
    downloadShareImage(moonType);
    
    // テキストをコピー
    const shareText = `私は${moonType}タイプでした！${moonData.emoji}\n\n${moonData.title}\n\nおつきさま診断で自分の本当の性格と恋愛スタイルがわかる✨\n\nlove-tsukuyomi.com/moon`;
    
    // クリップボードにコピー
    if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText).then(() => {
            setTimeout(() => {
                alert('投稿用のテキストをコピーしました！\nSNSアプリを開いて、画像と一緒に投稿してください。');
                
                // プラットフォームに応じてリンクを開く
                if (platform === 'twitter') {
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
                } else if (platform === 'line') {
                    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`, '_blank');
                }
            }, 2000);
        });
    }
}



// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', function() {
    // セレクトボックスを初期化
    populateDateSelectors();
    
    // Enterキーで診断実行
    const selects = ['year', 'month', 'day'];
    selects.forEach(id => {
        document.getElementById(id).addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                diagnose();
            }
        });
    });
});