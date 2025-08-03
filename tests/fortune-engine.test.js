const FortuneEngine = require('../core/fortune-engine');

// 依存関係をモック
jest.mock('../core/fortune-engine/timing');
jest.mock('../core/fortune-engine/numerology');
jest.mock('../core/ai-analyzer');

describe('FortuneEngine', () => {
  let fortuneEngine;
  
  beforeEach(() => {
    // モックの設定
    const TimingCalculator = require('../core/fortune-engine/timing');
    const Numerology = require('../core/fortune-engine/numerology');
    const AIAnalyzer = require('../core/ai-analyzer');
    
    TimingCalculator.mockImplementation(() => ({
      calculateOptimalTimings: jest.fn().mockResolvedValue([
        {
          date: '2024-01-24',
          time: '14:23',
          dayName: '水曜日',
          score: 85,
          planetaryData: { ruler: '水星', energy: '活力', element: '風' }
        },
        {
          date: '2024-01-25',
          time: '19:45',
          dayName: '木曜日',
          score: 78,
          planetaryData: { ruler: '木星', energy: '拡大', element: '火' }
        }
      ])
    }));
    
    Numerology.mockImplementation(() => ({
      performFullAnalysis: jest.fn().mockReturnValue({
        destinyNumber: { number: 7, meaning: { keyword: '神秘' } },
        compatibilityNumber: { number: 3, meaning: { keyword: '創造' } },
        personalYearNumber: { number: 5, meaning: { keyword: '変化' } },
        luckyNumbers: {
          primary: { number: 7 },
          secondary: { number: 3 }
        }
      })
    }));
    
    AIAnalyzer.mockImplementation(() => ({
      analyzeConversation: jest.fn().mockResolvedValue({
        personality: ['優しい', '慎重', '知的'],
        emotionalPattern: {
          positive: ['褒められたとき'],
          negative: ['批判'],
          neutral: ['日常会話']
        },
        communicationStyle: '丁寧で思いやりがある',
        interests: ['映画', '音楽'],
        relationshipStage: 5,
        advice: ['自然な会話を心がける'],
        confidence: 0.8
      })
    }));
    
    fortuneEngine = new FortuneEngine();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('generateFortune', () => {
    test('should generate complete fortune object', async () => {
      const messages = [
        { text: 'Hello' },
        { text: 'How are you?' }
      ];
      
      const fortune = await fortuneEngine.generateFortune(messages, 'user123', 'テストユーザー');
      
      expect(fortune).toHaveProperty('mainMessage');
      expect(fortune).toHaveProperty('destinyMoments');
      expect(fortune).toHaveProperty('warnings');
      expect(fortune).toHaveProperty('luckyItems');
      expect(fortune).toHaveProperty('overall');
      expect(fortune).toHaveProperty('metadata');
      
      expect(fortune.mainMessage).toContain('テストユーザー');
    });
    
    test('should handle empty messages', async () => {
      const fortune = await fortuneEngine.generateFortune([], 'user123');
      
      expect(fortune).toHaveProperty('mainMessage');
      expect(fortune.destinyMoments).toHaveLength(1);
    });
    
    test('should include analysis source metadata', async () => {
      const fortune = await fortuneEngine.generateFortune([{ text: 'test' }], 'user123');
      
      expect(fortune.metadata).toHaveProperty('analysisSource');
      expect(fortune.metadata.analysisSource).toHaveProperty('ai');
      expect(fortune.metadata.analysisSource).toHaveProperty('numerology');
      expect(fortune.metadata.analysisSource).toHaveProperty('timing');
    });
  });
  
  describe('integrateAnalyses', () => {
    test('should integrate all analysis types', () => {
      const analyses = {
        ai: {
          personality: ['優しい'],
          relationshipStage: 6,
          confidence: 0.8
        },
        numerology: {
          destinyNumber: { number: 7 },
          luckyNumbers: { primary: { number: 7 } }
        },
        timing: [
          { score: 85, dayName: '金曜日' }
        ]
      };
      
      const integrated = fortuneEngine.integrateAnalyses(analyses);
      
      expect(integrated).toHaveProperty('personality');
      expect(integrated).toHaveProperty('destinyNumber');
      expect(integrated).toHaveProperty('optimalTimings');
      expect(integrated).toHaveProperty('overallScore');
      expect(integrated).toHaveProperty('primaryTheme');
    });
  });
  
  describe('selectDestinyMoments', () => {
    test('should create destiny moments from timing analysis', () => {
      const timings = [
        {
          date: '2024-01-24',
          time: '14:23',
          dayName: '水曜日',
          score: 85,
          planetaryData: { ruler: '水星', energy: '活力', element: '風' }
        }
      ];
      
      const analysis = { destinyNumber: 7 };
      const moments = fortuneEngine.selectDestinyMoments(timings, analysis);
      
      expect(moments).toHaveLength(1);
      expect(moments[0]).toHaveProperty('rank');
      expect(moments[0]).toHaveProperty('datetime');
      expect(moments[0]).toHaveProperty('action');
      expect(moments[0]).toHaveProperty('reason');
      expect(moments[0]).toHaveProperty('successRate');
      
      expect(moments[0].rank).toBe(1);
      expect(moments[0].datetime).toBe('2024-01-24 14:23');
    });
    
    test('should limit to 3 moments maximum', () => {
      const timings = Array(5).fill({
        date: '2024-01-24',
        time: '14:23',
        dayName: '水曜日',
        score: 85,
        planetaryData: { ruler: '水星', energy: '活力' }
      });
      
      const moments = fortuneEngine.selectDestinyMoments(timings, {});
      
      expect(moments).toHaveLength(3);
    });
  });
  
  describe('generateWarnings', () => {
    test('should generate warnings based on analysis', () => {
      const analysis = {
        destinyNumber: 7,
        emotionalPattern: {
          negative: ['批判的な発言', 'プレッシャー']
        },
        cautionAreas: ['コミュニケーション']
      };
      
      const warnings = fortuneEngine.generateWarnings(analysis);
      
      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings.length).toBeLessThanOrEqual(2);
      
      if (warnings.length > 0) {
        expect(warnings[0]).toHaveProperty('type');
        expect(warnings[0]).toHaveProperty('message');
        expect(warnings[0]).toHaveProperty('reason');
      }
    });
    
    test('should handle empty analysis', () => {
      const warnings = fortuneEngine.generateWarnings({});
      
      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings.length).toBeLessThanOrEqual(2);
    });
  });
  
  describe('selectLuckyItems', () => {
    test('should select lucky items based on numerology', () => {
      const numerologyAnalysis = {
        luckyNumbers: {
          primary: { number: 7 }
        }
      };
      
      const analysis = { destinyNumber: 7 };
      const luckyItems = fortuneEngine.selectLuckyItems(numerologyAnalysis, analysis);
      
      expect(luckyItems).toHaveProperty('color');
      expect(luckyItems).toHaveProperty('emoji');
      expect(luckyItems).toHaveProperty('word');
      expect(luckyItems).toHaveProperty('number');
      expect(luckyItems).toHaveProperty('combination');
      
      expect(luckyItems.color).toHaveProperty('name');
      expect(luckyItems.color).toHaveProperty('meaning');
      expect(luckyItems.color).toHaveProperty('effect');
    });
  });
  
  describe('calculateOverallFortune', () => {
    test('should calculate overall fortune metrics', () => {
      const analysis = {
        overallScore: 85,
        destinyNumber: 7,
        relationshipStage: 6
      };
      
      const overall = fortuneEngine.calculateOverallFortune(analysis);
      
      expect(overall).toHaveProperty('score');
      expect(overall).toHaveProperty('trend');
      expect(overall).toHaveProperty('trendText');
      expect(overall).toHaveProperty('accuracy');
      expect(overall).toHaveProperty('element');
      expect(overall).toHaveProperty('phase');
      
      expect(overall.score).toBe(85);
      expect(overall.trend).toBe('rising');
    });
    
    test('should determine correct trend based on score', () => {
      const highScore = fortuneEngine.calculateOverallFortune({ overallScore: 90 });
      const lowScore = fortuneEngine.calculateOverallFortune({ overallScore: 50 });
      const midScore = fortuneEngine.calculateOverallFortune({ overallScore: 70 });
      
      expect(highScore.trend).toBe('rising');
      expect(lowScore.trend).toBe('declining');
      expect(midScore.trend).toBe('stable');
    });
  });
  
  describe('calculateIntegratedScore', () => {
    test('should calculate integrated score from all analyses', () => {
      const ai = {
        confidence: 0.8,
        relationshipStage: 7
      };
      
      const numerology = {
        destinyNumber: { number: 11 }
      };
      
      const timing = [
        { score: 85 }
      ];
      
      const score = fortuneEngine.calculateIntegratedScore(ai, numerology, timing);
      
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(40);
      expect(score).toBeLessThanOrEqual(95);
    });
    
    test('should handle missing data gracefully', () => {
      const score = fortuneEngine.calculateIntegratedScore({}, {}, []);
      
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(40);
    });
  });
  
  describe('determinePrimaryTheme', () => {
    test('should determine theme based on relationship stage and destiny number', () => {
      const lowStage = fortuneEngine.determinePrimaryTheme(
        { relationshipStage: 2 },
        { destinyNumber: { number: 1 } }
      );
      
      const highStage = fortuneEngine.determinePrimaryTheme(
        { relationshipStage: 8 },
        { destinyNumber: { number: 6 } }
      );
      
      expect(typeof lowStage).toBe('string');
      expect(typeof highStage).toBe('string');
      expect(lowStage).toContain('出会い');
      expect(highStage).toContain('愛' || '未来');
    });
  });
  
  describe('replaceVariables', () => {
    test('should replace template variables', () => {
      const template = '{{name}}さんの{{type}}運';
      const variables = { name: 'テスト', type: '恋愛' };
      
      const result = fortuneEngine.replaceVariables(template, variables);
      
      expect(result).toBe('テストさんの恋愛運');
    });
    
    test('should handle missing variables', () => {
      const template = '{{name}}さんの{{missing}}運';
      const variables = { name: 'テスト' };
      
      const result = fortuneEngine.replaceVariables(template, variables);
      
      expect(result).toBe('テストさんの{{missing}}運');
    });
  });
  
  describe('validateFortune', () => {
    test('should add missing required fields', () => {
      const incompleteFortune = {
        mainMessage: 'test message'
      };
      
      const validated = fortuneEngine.validateFortune(incompleteFortune);
      
      expect(validated).toHaveProperty('mainMessage');
      expect(validated).toHaveProperty('destinyMoments');
      expect(validated).toHaveProperty('warnings');
      expect(validated).toHaveProperty('luckyItems');
      
      expect(Array.isArray(validated.destinyMoments)).toBe(true);
      expect(validated.destinyMoments.length).toBeGreaterThan(0);
    });
    
    test('should preserve existing fields', () => {
      const completeFortune = {
        mainMessage: 'test message',
        destinyMoments: [{ test: 'moment' }],
        warnings: [{ test: 'warning' }],
        luckyItems: { test: 'item' }
      };
      
      const validated = fortuneEngine.validateFortune(completeFortune);
      
      expect(validated.mainMessage).toBe('test message');
      expect(validated.destinyMoments[0].test).toBe('moment');
      expect(validated.warnings[0].test).toBe('warning');
      expect(validated.luckyItems.test).toBe('item');
    });
  });
  
  describe('generateFallbackFortune', () => {
    test('should generate complete fallback fortune', () => {
      const fallback = fortuneEngine.generateFallbackFortune('テストユーザー');
      
      expect(fallback).toHaveProperty('mainMessage');
      expect(fallback).toHaveProperty('destinyMoments');
      expect(fallback).toHaveProperty('warnings');
      expect(fallback).toHaveProperty('luckyItems');
      expect(fallback).toHaveProperty('overall');
      expect(fallback).toHaveProperty('metadata');
      
      expect(fallback.mainMessage).toContain('テストユーザー');
      expect(fallback.metadata.fallback).toBe(true);
    });
    
    test('should work without username', () => {
      const fallback = fortuneEngine.generateFallbackFortune();
      
      expect(fallback).toHaveProperty('mainMessage');
      expect(fallback.mainMessage).toContain('あなた');
    });
  });
  
  describe('error handling', () => {
    test('should return fallback fortune when analysis fails', async () => {
      // AI分析を失敗させる
      const AIAnalyzer = require('../core/ai-analyzer');
      AIAnalyzer.mockImplementation(() => ({
        analyzeConversation: jest.fn().mockRejectedValue(new Error('API Error'))
      }));
      
      const newEngine = new FortuneEngine();
      const fortune = await newEngine.generateFortune([{ text: 'test' }], 'user123');
      
      expect(fortune).toHaveProperty('mainMessage');
      expect(fortune.metadata.fallback).toBe(true);
    });
  });
});