const Numerology = require('../core/fortune-engine/numerology');

describe('Numerology', () => {
  let numerology;
  
  beforeEach(() => {
    numerology = new Numerology();
  });
  
  describe('reduceToSingleDigit', () => {
    test('should reduce multi-digit numbers to single digits', () => {
      expect(numerology.reduceToSingleDigit(15)).toBe(6); // 1+5=6
      expect(numerology.reduceToSingleDigit(29)).toBe(11); // 2+9=11 (マスターナンバー)
      expect(numerology.reduceToSingleDigit(38)).toBe(11); // 3+8=11 (マスターナンバー)
      expect(numerology.reduceToSingleDigit(99)).toBe(9); // 9+9=18, 1+8=9
    });
    
    test('should preserve master numbers', () => {
      expect(numerology.reduceToSingleDigit(11)).toBe(11);
      expect(numerology.reduceToSingleDigit(22)).toBe(22);
      expect(numerology.reduceToSingleDigit(33)).toBe(33);
    });
    
    test('should handle zero as 9', () => {
      expect(numerology.reduceToSingleDigit(0)).toBe(9);
    });
    
    test('should preserve single digits', () => {
      for (let i = 1; i <= 9; i++) {
        expect(numerology.reduceToSingleDigit(i)).toBe(i);
      }
    });
  });
  
  describe('calculateDestinyNumber', () => {
    test('should calculate destiny number from message count', () => {
      const messages = [
        { text: 'Hello' },
        { text: 'How are you?' },
        { text: 'Good morning' }
      ];
      
      const result = numerology.calculateDestinyNumber(messages);
      
      expect(result.number).toBe(3); // 3 messages = 3
      expect(result.source).toBe(3);
      expect(result.type).toBe('destiny');
      expect(result.meaning).toHaveProperty('keyword');
    });
    
    test('should handle empty message array', () => {
      const result = numerology.calculateDestinyNumber([]);
      
      expect(result.number).toBe(1); // default when no messages
      expect(result.source).toBe(1);
    });
    
    test('should reduce large message counts', () => {
      const messages = Array(15).fill({ text: 'test' }); // 15 messages
      const result = numerology.calculateDestinyNumber(messages);
      
      expect(result.number).toBe(6); // 1+5=6
      expect(result.source).toBe(15);
    });
  });
  
  describe('calculateCompatibilityNumber', () => {
    test('should calculate compatibility number from character count', () => {
      const messages = [
        { text: 'Hi' },      // 2 chars
        { text: 'Hello' },   // 5 chars
        { text: 'Good!' }    // 5 chars
      ]; // Total: 12 chars
      
      const result = numerology.calculateCompatibilityNumber(messages);
      
      expect(result.number).toBe(3); // 1+2=3
      expect(result.source).toBe(12);
      expect(result.type).toBe('compatibility');
    });
    
    test('should handle messages with different text properties', () => {
      const messages = [
        { message: 'Hello' },  // using 'message' instead of 'text'
        { text: 'World' }
      ];
      
      const result = numerology.calculateCompatibilityNumber(messages);
      
      expect(result.number).toBeGreaterThan(0);
      expect(result.source).toBe(10); // 5 + 5 chars
    });
  });
  
  describe('calculatePersonalYearNumber', () => {
    test('should calculate personal year number', () => {
      const userId = 'user123';
      const result = numerology.calculatePersonalYearNumber(userId);
      
      expect(result.number).toBeGreaterThan(0);
      expect(result.number).toBeLessThanOrEqual(33);
      expect(result.type).toBe('personalYear');
      expect(result.source).toContain('+');
    });
    
    test('should handle non-numeric user IDs', () => {
      const userId = 'abc';
      const result = numerology.calculatePersonalYearNumber(userId);
      
      expect(result.number).toBeGreaterThan(0);
      expect(result.type).toBe('personalYear');
    });
  });
  
  describe('calculatePowerNumber', () => {
    test('should find most frequent digit', () => {
      const messages = [
        { text: '111' },
        { text: '1 and 2' },
        { text: 'Number 1 is best' }
      ]; // Digit '1' appears most frequently
      
      const result = numerology.calculatePowerNumber(messages);
      
      expect(result.number).toBe(1);
      expect(result.frequency).toBeGreaterThan(0);
      expect(result.type).toBe('power');
    });
    
    test('should handle messages without numbers', () => {
      const messages = [
        { text: 'Hello' },
        { text: 'World' }
      ];
      
      const result = numerology.calculatePowerNumber(messages);
      
      expect(result.number).toBe(1); // default
      expect(result.frequency).toBe(0);
    });
  });
  
  describe('getNumberMeaning', () => {
    test('should return meaning for regular numbers', () => {
      const meaning = numerology.getNumberMeaning(5);
      
      expect(meaning).toHaveProperty('keyword');
      expect(meaning).toHaveProperty('loveKeyword');
      expect(meaning).toHaveProperty('action');
      expect(meaning.isMasterNumber).toBe(false);
    });
    
    test('should return meaning for master numbers', () => {
      const meaning = numerology.getNumberMeaning(11);
      
      expect(meaning).toHaveProperty('keyword');
      expect(meaning.isMasterNumber).toBe(true);
    });
  });
  
  describe('getLuckyNumbers', () => {
    test('should generate lucky numbers from analysis', () => {
      const analysis = {
        destinyNumber: { number: 3 },
        compatibilityNumber: { number: 7 },
        personalYearNumber: { number: 5 }
      };
      
      const result = numerology.getLuckyNumbers(analysis);
      
      expect(result).toHaveProperty('primary');
      expect(result).toHaveProperty('secondary');
      expect(result).toHaveProperty('tertiary');
      expect(result).toHaveProperty('combination');
      expect(result).toHaveProperty('recommendations');
      
      expect(result.primary.number).toBe(3);
      expect(result.secondary.number).toBe(7);
      expect(result.tertiary.number).toBe(5);
    });
    
    test('should handle missing analysis data', () => {
      const result = numerology.getLuckyNumbers({});
      
      expect(result.primary.number).toBe(1); // default
      expect(result.secondary.number).toBe(1);
      expect(result.tertiary.number).toBe(1);
    });
  });
  
  describe('calculateRelationshipCompatibility', () => {
    test('should calculate excellent compatibility', () => {
      // Testing a known excellent pair [1, 3]
      const result = numerology.calculateRelationshipCompatibility(1, 3);
      
      expect(result.level).toBe('excellent');
      expect(result.score).toBe(90);
      expect(result).toHaveProperty('advice');
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('challenges');
    });
    
    test('should calculate challenging compatibility', () => {
      // Testing a known challenging pair
      const result = numerology.calculateRelationshipCompatibility(1, 4);
      
      expect(result.level).toBe('challenging');
      expect(result.score).toBe(40);
    });
    
    test('should handle number order independence', () => {
      const result1 = numerology.calculateRelationshipCompatibility(1, 3);
      const result2 = numerology.calculateRelationshipCompatibility(3, 1);
      
      expect(result1.level).toBe(result2.level);
      expect(result1.score).toBe(result2.score);
    });
  });
  
  describe('performFullAnalysis', () => {
    test('should return comprehensive analysis', () => {
      const messages = [
        { text: 'Hello world' },
        { text: 'How are you doing today?' },
        { text: 'I am fine, thank you!' }
      ];
      const userId = 'user123';
      
      const result = numerology.performFullAnalysis(messages, userId);
      
      expect(result).toHaveProperty('destinyNumber');
      expect(result).toHaveProperty('compatibilityNumber');
      expect(result).toHaveProperty('personalYearNumber');
      expect(result).toHaveProperty('powerNumber');
      expect(result).toHaveProperty('luckyNumbers');
      expect(result).toHaveProperty('summary');
      
      // Check summary structure
      expect(result.summary).toHaveProperty('primaryInfluence');
      expect(result.summary).toHaveProperty('loveStyle');
      expect(result.summary).toHaveProperty('strengths');
      expect(result.summary).toHaveProperty('challenges');
      expect(result.summary).toHaveProperty('advice');
    });
  });
  
  describe('extractAndSumDigits', () => {
    test('should extract and sum digits from string', () => {
      expect(numerology.extractAndSumDigits('user123')).toBe(6); // 1+2+3
      expect(numerology.extractAndSumDigits('abc456def')).toBe(15); // 4+5+6
    });
    
    test('should handle strings without numbers', () => {
      const result = numerology.extractAndSumDigits('abc');
      expect(result).toBeGreaterThan(0); // Should use ASCII values
    });
    
    test('should handle empty string', () => {
      expect(numerology.extractAndSumDigits('')).toBe(1);
      expect(numerology.extractAndSumDigits(null)).toBe(1);
    });
  });
});