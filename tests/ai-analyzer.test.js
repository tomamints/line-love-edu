const AIAnalyzer = require('../core/ai-analyzer');

// OpenAI APIをモック
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                personality: ['優しい', '慎重', '知的'],
                emotionalPattern: {
                  positive: ['褒められたとき'],
                  negative: ['批判'],
                  neutral: ['日常会話']
                },
                communicationStyle: '丁寧で思いやりがある',
                interests: ['映画', '音楽'],
                optimalTiming: {
                  timeOfDay: '夜',
                  frequency: '2-3日に1回',
                  mood: 'リラックス時'
                },
                avoidTopics: ['プライベートな質問'],
                relationshipStage: 5,
                advice: ['自然な会話を心がける']
              })
            }
          }]
        })
      }
    }
  }));
});

describe('AIAnalyzer', () => {
  let analyzer;
  
  beforeEach(() => {
    analyzer = new AIAnalyzer('test-api-key');
    jest.clearAllMocks();
  });
  
  describe('constructor', () => {
    test('should initialize with API key', () => {
      expect(analyzer).toBeDefined();
      expect(analyzer.openai).toBeDefined();
    });
    
    test('should use environment variable if no API key provided', () => {
      process.env.OPENAI_API_KEY = 'env-test-key';
      const envAnalyzer = new AIAnalyzer();
      expect(envAnalyzer).toBeDefined();
    });
  });
  
  describe('preprocessMessages', () => {
    test('should filter empty messages', () => {
      const messages = [
        { text: 'Hello' },
        { text: '' },
        { text: 'World' },
        {}
      ];
      
      const result = analyzer.preprocessMessages(messages);
      
      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Hello');
      expect(result[1].text).toBe('World');
    });
    
    test('should limit to latest 100 messages', () => {
      const messages = Array(150).fill({ text: 'test message' });
      const result = analyzer.preprocessMessages(messages);
      
      expect(result).toHaveLength(100);
    });
    
    test('should truncate long messages', () => {
      const longText = 'a'.repeat(1000);
      const messages = [{ text: longText }];
      
      const result = analyzer.preprocessMessages(messages);
      
      expect(result[0].text).toHaveLength(500);
    });
    
    test('should handle non-array input', () => {
      expect(analyzer.preprocessMessages(null)).toEqual([]);
      expect(analyzer.preprocessMessages('not array')).toEqual([]);
    });
  });
  
  describe('buildAnalysisPrompt', () => {
    test('should create proper prompt structure', () => {
      const messages = [
        { text: 'Hello', isUser: true },
        { text: 'Hi there', isUser: false }
      ];
      
      const prompt = analyzer.buildAnalysisPrompt(messages);
      
      expect(prompt).toHaveLength(2);
      expect(prompt[0].role).toBe('system');
      expect(prompt[1].role).toBe('user');
      expect(prompt[1].content).toContain('ユーザー: Hello');
      expect(prompt[1].content).toContain('相手: Hi there');
    });
  });
  
  describe('processResponse', () => {
    test('should parse valid JSON response', () => {
      const jsonResponse = JSON.stringify({
        personality: ['優しい'],
        emotionalPattern: { positive: ['test'] },
        relationshipStage: 5
      });
      
      const result = analyzer.processResponse(jsonResponse);
      
      expect(result.personality).toEqual(['優しい']);
      expect(result.relationshipStage).toBe(5);
      expect(result).toHaveProperty('analyzedAt');
      expect(result).toHaveProperty('confidence');
    });
    
    test('should throw error for invalid JSON', () => {
      expect(() => {
        analyzer.processResponse('invalid json');
      }).toThrow('AI応答の解析に失敗');
    });
  });
  
  describe('validateResponse', () => {
    test('should validate and fix missing fields', () => {
      const incomplete = {
        personality: ['test'],
        relationshipStage: 15  // 範囲外
      };
      
      const result = analyzer.validateResponse(incomplete);
      
      expect(result.personality).toEqual(['test']);
      expect(result.relationshipStage).toBe(10); // 最大値に修正
      expect(result).toHaveProperty('emotionalPattern');
      expect(result).toHaveProperty('communicationStyle');
      expect(result).toHaveProperty('interests');
    });
    
    test('should limit array lengths', () => {
      const oversized = {
        personality: Array(10).fill('trait'),
        interests: Array(10).fill('interest')
      };
      
      const result = analyzer.validateResponse(oversized);
      
      expect(result.personality).toHaveLength(5);
      expect(result.interests).toHaveLength(5);
    });
  });
  
  describe('getFallbackAnalysis', () => {
    test('should return complete analysis structure', () => {
      const fallback = analyzer.getFallbackAnalysis('test reason');
      
      expect(fallback).toHaveProperty('personality');
      expect(fallback).toHaveProperty('emotionalPattern');
      expect(fallback).toHaveProperty('communicationStyle');
      expect(fallback).toHaveProperty('interests');
      expect(fallback).toHaveProperty('optimalTiming');
      expect(fallback).toHaveProperty('avoidTopics');
      expect(fallback).toHaveProperty('relationshipStage');
      expect(fallback).toHaveProperty('advice');
      expect(fallback.fallbackReason).toBe('test reason');
    });
  });
  
  describe('checkRateLimit', () => {
    test('should allow first request', () => {
      expect(analyzer.checkRateLimit('user1')).toBe(true);
    });
    
    test('should block subsequent requests within time limit', () => {
      analyzer.recordUsage('user1');
      expect(analyzer.checkRateLimit('user1')).toBe(false);
    });
    
    test('should allow requests without user ID', () => {
      expect(analyzer.checkRateLimit(null)).toBe(true);
    });
  });
  
  describe('generateCacheKey', () => {
    test('should generate consistent cache keys', () => {
      const messages = [{ text: 'test' }];
      const key1 = analyzer.generateCacheKey(messages, 'user1');
      const key2 = analyzer.generateCacheKey(messages, 'user1');
      
      expect(key1).toBe(key2);
    });
    
    test('should generate different keys for different users', () => {
      const messages = [{ text: 'test' }];
      const key1 = analyzer.generateCacheKey(messages, 'user1');
      const key2 = analyzer.generateCacheKey(messages, 'user2');
      
      expect(key1).not.toBe(key2);
    });
  });
  
  describe('calculateConfidence', () => {
    test('should calculate confidence based on data completeness', () => {
      const complete = {
        personality: ['a', 'b', 'c'],
        interests: ['x', 'y', 'z'],
        advice: ['tip1', 'tip2'],
        emotionalPattern: { positive: ['happy'] },
        relationshipStage: 5
      };
      
      const confidence = analyzer.calculateConfidence(complete);
      
      expect(confidence).toBeGreaterThan(0.5);
      expect(confidence).toBeLessThanOrEqual(1.0);
    });
    
    test('should return base confidence for empty analysis', () => {
      const confidence = analyzer.calculateConfidence({});
      expect(confidence).toBe(0.5);
    });
  });
  
  describe('analyzeConversation', () => {
    test('should return analysis with fallback for empty messages', async () => {
      const result = await analyzer.analyzeConversation([]);
      
      expect(result).toHaveProperty('personality');
      expect(result).toHaveProperty('fallbackReason');
      expect(result.fallbackReason).toBe('メッセージ不足');
    });
    
    test('should use rate limiting', async () => {
      const messages = [{ text: 'test message' }];
      
      // First request should work
      await analyzer.analyzeConversation(messages, 'user1');
      
      // Second request should be rate limited
      const result = await analyzer.analyzeConversation(messages, 'user1');
      expect(result.fallbackReason).toBe('レート制限');
    });
  });
  
  describe('generateLoveAdvice', () => {
    test('should generate stage-appropriate advice', () => {
      const analysis = {
        relationshipStage: 3,
        personality: ['慎重', '優しい'],
        interests: ['映画', '音楽']
      };
      
      const advice = analyzer.generateLoveAdvice(analysis);
      
      expect(advice).toHaveProperty('stageAdvice');
      expect(advice).toHaveProperty('personalityTips');
      expect(advice).toHaveProperty('interestBasedSuggestions');
      expect(advice).toHaveProperty('nextStepRecommendations');
      
      expect(advice.stageAdvice).toContain('関係構築期');
    });
  });
  
  describe('getPersonalityTips', () => {
    test('should provide tips based on personality traits', () => {
      const tips = analyzer.getPersonalityTips(['慎重', 'ユーモラス']);
      
      expect(tips.length).toBeGreaterThan(0);
      expect(tips.some(tip => tip.includes('慎重'))).toBe(true);
      expect(tips.some(tip => tip.includes('楽しい'))).toBe(true);
    });
    
    test('should provide default tip for unknown traits', () => {
      const tips = analyzer.getPersonalityTips(['unknown']);
      
      expect(tips.length).toBe(1);
      expect(tips[0]).toContain('個性を大切に');
    });
  });
  
  describe('getUsageStats', () => {
    test('should return usage statistics', () => {
      analyzer.recordUsage('user1');
      analyzer.recordUsage('user2');
      
      const stats = analyzer.getUsageStats();
      
      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('totalRequests');
      expect(stats).toHaveProperty('cacheStats');
      expect(stats.totalUsers).toBe(2);
      expect(stats.totalRequests).toBe(2);
    });
  });
});