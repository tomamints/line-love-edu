const { FortuneCarouselBuilder, buildFortuneCarousel } = require('../core/formatter/fortune-carousel');

describe('FortuneCarouselBuilder', () => {
  let mockFortune;
  let mockUserProfile;
  
  beforeEach(() => {
    mockFortune = {
      mainMessage: 'テスト用のメインメッセージです。星々があなたの恋愛を見守っています✨',
      destinyMoments: [
        {
          rank: 1,
          datetime: '2024-01-24 14:23',
          dayName: '水曜日',
          action: '心からの感謝を伝える',
          reason: '相手の心が最も開かれる瞬間',
          cosmicReason: '金星と月が美しく調和する時',
          successRate: 89
        },
        {
          rank: 2,
          datetime: '2024-01-25 19:45',
          dayName: '木曜日',
          action: 'さりげない気遣いを示す',
          reason: '感情の波が穏やかになる時',
          cosmicReason: '水星の伝達力が高まる時刻',
          successRate: 76
        }
      ],
      warnings: [
        {
          type: 'timing',
          message: '月曜日の朝は慎重に',
          reason: '月のエネルギーが不安定'
        }
      ],
      luckyItems: {
        color: { name: 'ラベンダー', meaning: '心の平和', effect: '相手への思いやりが深まる' },
        emoji: { emoji: '🌙', meaning: '神秘的な魅力', effect: '内なる美しさが輝く' },
        word: { word: 'ありがとう', meaning: '感謝の波動', effect: '相手の心を温かくする' },
        number: { number: 7, meaning: '神秘と直感', effect: '深い理解が生まれる' },
        combination: '7時7分に感謝の気持ちを伝える'
      },
      overall: {
        score: 87,
        trend: 'rising',
        trendText: '上昇中',
        accuracy: '★★★★☆',
        element: '火',
        phase: '開花期'
      },
      metadata: {
        generatedAt: '2024-01-24T10:00:00Z',
        accuracy: 4,
        confidence: 0.8
      }
    };
    
    mockUserProfile = {
      displayName: 'テストユーザー',
      userId: 'test-user-123'
    };
  });
  
  describe('constructor', () => {
    test('should initialize with fortune and user profile', () => {
      const builder = new FortuneCarouselBuilder(mockFortune, mockUserProfile);
      
      expect(builder.fortune).toBe(mockFortune);
      expect(builder.userProfile).toBe(mockUserProfile);
      expect(builder.userName).toBe('テストユーザー');
      expect(builder.styles).toHaveProperty('primary');
    });
    
    test('should use default username when not provided', () => {
      const builder = new FortuneCarouselBuilder(mockFortune, {});
      
      expect(builder.userName).toBe('あなた');
    });
  });
  
  describe('build', () => {
    test('should return complete carousel structure', () => {
      const builder = new FortuneCarouselBuilder(mockFortune, mockUserProfile);
      const carousel = builder.build();
      
      expect(carousel.type).toBe('flex');
      expect(carousel.altText).toContain('テストユーザー');
      expect(carousel.contents.type).toBe('carousel');
      expect(carousel.contents.contents).toBeInstanceOf(Array);
      expect(carousel.contents.contents.length).toBeGreaterThan(0);
      expect(carousel.contents.contents.length).toBeLessThanOrEqual(8);
    });
    
    test('should handle empty fortune gracefully', () => {
      const builder = new FortuneCarouselBuilder({}, mockUserProfile);
      const carousel = builder.build();
      
      expect(carousel.type).toBe('flex');
      expect(carousel.contents.contents).toBeInstanceOf(Array);
    });
    
    test('should return simple carousel on error', () => {
      const builder = new FortuneCarouselBuilder(null, mockUserProfile);
      const carousel = builder.build();
      
      expect(carousel.type).toBe('flex');
      expect(carousel.contents.type).toBe('carousel');
    });
  });
  
  describe('addOpeningPage', () => {
    test('should create opening page with user name', () => {
      const builder = new FortuneCarouselBuilder(mockFortune, mockUserProfile);
      const page = builder.addOpeningPage();
      
      expect(page.type).toBe('bubble');
      expect(page.size).toBe('mega');
      expect(page.header.contents[1].text).toContain('テストユーザー');
      expect(page.body.contents[0].text).toContain('テスト用のメインメッセージ');
    });
    
    test('should truncate long main message', () => {
      const longMessage = 'a'.repeat(200);
      const fortuneWithLongMessage = { ...mockFortune, mainMessage: longMessage };
      const builder = new FortuneCarouselBuilder(fortuneWithLongMessage, mockUserProfile);
      const page = builder.addOpeningPage();
      
      const messageText = page.body.contents[0].text;
      expect(messageText.length).toBeLessThanOrEqual(153); // 150 + '...'
      expect(messageText).toContain('...');
    });
  });
  
  describe('addOverallPage', () => {
    test('should create overall page with score and stats', () => {
      const builder = new FortuneCarouselBuilder(mockFortune, mockUserProfile);
      const page = builder.addOverallPage();
      
      expect(page.type).toBe('bubble');
      expect(page.header.contents[0].text).toContain('総合運勢');
      
      // スコア表示を確認
      const scoreText = page.body.contents[0].contents[0].contents[1].text;
      expect(scoreText).toBe('87');
    });
    
    test('should handle missing overall data', () => {
      const fortuneWithoutOverall = { ...mockFortune };
      delete fortuneWithoutOverall.overall;
      
      const builder = new FortuneCarouselBuilder(fortuneWithoutOverall, mockUserProfile);
      const page = builder.addOverallPage();
      
      expect(page.type).toBe('bubble');
      // デフォルト値が使用されることを確認
      const scoreText = page.body.contents[0].contents[0].contents[1].text;
      expect(scoreText).toBe('75'); // デフォルトスコア
    });
  });
  
  describe('addDestinyMomentPages', () => {
    test('should create pages for each destiny moment', () => {
      const builder = new FortuneCarouselBuilder(mockFortune, mockUserProfile);
      const pages = builder.addDestinyMomentPages();
      
      expect(pages).toHaveLength(2); // mockFortuneには2つの瞬間がある
      
      pages.forEach((page, index) => {
        expect(page.type).toBe('bubble');
        expect(page.header.contents[0].text).toContain(`運命の瞬間 ${index + 1}`);
      });
    });
    
    test('should limit to maximum 3 moments', () => {
      const fortuneWithManyMoments = {
        ...mockFortune,
        destinyMoments: Array(5).fill(mockFortune.destinyMoments[0])
      };
      
      const builder = new FortuneCarouselBuilder(fortuneWithManyMoments, mockUserProfile);
      const pages = builder.addDestinyMomentPages();
      
      expect(pages).toHaveLength(3);
    });
  });
  
  describe('createDestinyMomentPage', () => {
    test('should create moment page with correct rank styling', () => {
      const builder = new FortuneCarouselBuilder(mockFortune, mockUserProfile);
      const moment = mockFortune.destinyMoments[0];
      const page = builder.createDestinyMomentPage(moment, 1);
      
      expect(page.type).toBe('bubble');
      expect(page.header.contents[0].text).toContain('🥇');
      expect(page.header.contents[0].text).toContain('運命の瞬間 1');
      
      // 日時が表示されているか確認
      expect(page.body.contents[0].text).toBe('2024-01-24 14:23');
      
      // アクションが表示されているか確認
      expect(page.body.contents[3].contents[1].text).toBe('心からの感謝を伝える');
    });
    
    test('should handle missing moment data', () => {
      const builder = new FortuneCarouselBuilder(mockFortune, mockUserProfile);
      const incompleteMoment = { rank: 2 };
      const page = builder.createDestinyMomentPage(incompleteMoment, 2);
      
      expect(page.type).toBe('bubble');
      expect(page.body.contents[0].text).toBe('近日中'); // デフォルト値
    });
  });
  
  describe('addWarningsPage', () => {
    test('should create warnings page with warning items', () => {
      const builder = new FortuneCarouselBuilder(mockFortune, mockUserProfile);
      const page = builder.addWarningsPage();
      
      expect(page.type).toBe('bubble');
      expect(page.header.contents[0].text).toContain('注意時間帯');
      
      // 警告項目が表示されているか確認
      // warnings.map()で生成される要素は、固定要素の後に来る
      const warningItems = page.body.contents.filter(item => 
        item.type === 'box' && item.backgroundColor === '#FFEBEE'
      );
      expect(warningItems.length).toBeGreaterThan(0);
      expect(warningItems[0].contents[0].text).toContain('月曜日の朝は慎重に');
    });
    
    test('should handle no warnings gracefully', () => {
      const fortuneWithoutWarnings = { ...mockFortune, warnings: [] };
      const builder = new FortuneCarouselBuilder(fortuneWithoutWarnings, mockUserProfile);
      const page = builder.addWarningsPage();
      
      expect(page.type).toBe('bubble');
      
      // 「注意すべき時間帯はありません」メッセージが表示されるか確認
      const noWarningMessage = page.body.contents.find(item => 
        item.type === 'box' && item.contents && 
        item.contents[0] && item.contents[0].text && 
        item.contents[0].text.includes('注意すべき時間帯はありません')
      );
      expect(noWarningMessage).toBeDefined();
    });
  });
  
  describe('addLuckyItemsPage', () => {
    test('should create lucky items page with all items', () => {
      const builder = new FortuneCarouselBuilder(mockFortune, mockUserProfile);
      const page = builder.addLuckyItemsPage();
      
      expect(page.type).toBe('bubble');
      expect(page.header.contents[0].text).toContain('開運アイテム');
      
      // ラッキーアイテムが表示されているか確認
      const hasColorInfo = page.body.contents.some(item => 
        JSON.stringify(item).includes('ラッキーカラー') && 
        JSON.stringify(item).includes('ラベンダー')
      );
      expect(hasColorInfo).toBe(true);
    });
    
    test('should use default values for missing items', () => {
      const fortuneWithoutItems = { ...mockFortune, luckyItems: {} };
      const builder = new FortuneCarouselBuilder(fortuneWithoutItems, mockUserProfile);
      const page = builder.addLuckyItemsPage();
      
      expect(page.type).toBe('bubble');
      
      // デフォルト値が使用されているか確認
      const hasDefaultColor = page.body.contents.some(item => 
        JSON.stringify(item).includes('ピンク')
      );
      expect(hasDefaultColor).toBe(true);
    });
  });
  
  describe('addActionSummaryPage', () => {
    test('should create action summary page with moments list', () => {
      const builder = new FortuneCarouselBuilder(mockFortune, mockUserProfile);
      const page = builder.addActionSummaryPage();
      
      expect(page.type).toBe('bubble');
      expect(page.header.contents[0].text).toContain('アクションプラン');
      
      // アクション項目が表示されているか確認
      const hasActionTime = page.body.contents.some(item => 
        JSON.stringify(item).includes('2024-01-24 14:23')
      );
      expect(hasActionTime).toBe(true);
    });
  });
  
  describe('utility methods', () => {
    let builder;
    
    beforeEach(() => {
      builder = new FortuneCarouselBuilder(mockFortune, mockUserProfile);
    });
    
    describe('getScoreColor', () => {
      test('should return correct colors for different scores', () => {
        expect(builder.getScoreColor(90)).toBe(builder.styles.success);
        expect(builder.getScoreColor(75)).toBe(builder.styles.secondary);
        expect(builder.getScoreColor(60)).toBe(builder.styles.primary);
        expect(builder.getScoreColor(40)).toBe(builder.styles.warning);
      });
    });
    
    describe('getScoreText', () => {
      test('should return correct text for different scores', () => {
        expect(builder.getScoreText(90)).toBe('絶好調！');
        expect(builder.getScoreText(75)).toBe('好調');
        expect(builder.getScoreText(60)).toBe('安定');
        expect(builder.getScoreText(40)).toBe('要注意');
      });
    });
    
    describe('getElementEmoji', () => {
      test('should return correct emojis for elements', () => {
        expect(builder.getElementEmoji('火')).toBe('🔥');
        expect(builder.getElementEmoji('水')).toBe('💧');
        expect(builder.getElementEmoji('風')).toBe('🌪️');
        expect(builder.getElementEmoji('土')).toBe('🌍');
        expect(builder.getElementEmoji('unknown')).toBe('⭐');
      });
    });
  });
  
  describe('buildSimpleCarousel', () => {
    test('should create simple fallback carousel', () => {
      const builder = new FortuneCarouselBuilder(mockFortune, mockUserProfile);
      const carousel = builder.buildSimpleCarousel();
      
      expect(carousel.type).toBe('flex');
      expect(carousel.altText).toContain('テストユーザー');
      expect(carousel.contents.type).toBe('carousel');
      expect(carousel.contents.contents).toHaveLength(1);
      
      const bubble = carousel.contents.contents[0];
      expect(bubble.type).toBe('bubble');
      expect(bubble.header.contents[0].text).toContain('恋愛お告げ');
    });
  });
});

describe('buildFortuneCarousel function', () => {
  test('should create carousel using builder', () => {
    const mockFortune = {
      mainMessage: 'テストメッセージ',
      overall: { score: 80 }
    };
    const mockProfile = { displayName: 'テスト' };
    
    const carousel = buildFortuneCarousel(mockFortune, mockProfile);
    
    expect(carousel.type).toBe('flex');
    expect(carousel.altText).toContain('テスト');
  });
  
  test('should work with minimal parameters', () => {
    const carousel = buildFortuneCarousel({});
    
    expect(carousel.type).toBe('flex');
    expect(carousel.contents.type).toBe('carousel');
  });
});