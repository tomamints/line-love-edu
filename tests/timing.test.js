const TimingCalculator = require('../core/fortune-engine/timing');
const dayjs = require('dayjs');

describe('TimingCalculator', () => {
  let calculator;
  
  beforeEach(() => {
    calculator = new TimingCalculator();
  });
  
  describe('calculateOptimalTimings', () => {
    test('should return 3 timing suggestions', () => {
      const analysis = {
        replyPatterns: {
          morning: 70,
          afternoon: 85,
          evening: 90,
          night: 50
        }
      };
      
      const timings = calculator.calculateOptimalTimings(analysis);
      
      expect(timings).toHaveLength(3);
      expect(timings[0].rank).toBe(1);
      expect(timings[1].rank).toBe(2);
      expect(timings[2].rank).toBe(3);
    });
    
    test('should include required properties in each timing', () => {
      const timings = calculator.calculateOptimalTimings();
      
      timings.forEach(timing => {
        expect(timing).toHaveProperty('date');
        expect(timing).toHaveProperty('time');
        expect(timing).toHaveProperty('score');
        expect(timing).toHaveProperty('reason');
        expect(timing).toHaveProperty('action');
        expect(timing).toHaveProperty('confidence');
        expect(timing).toHaveProperty('planetaryData');
      });
    });
    
    test('should have decreasing scores', () => {
      const timings = calculator.calculateOptimalTimings();
      
      expect(timings[0].score).toBeGreaterThanOrEqual(timings[1].score);
      expect(timings[1].score).toBeGreaterThanOrEqual(timings[2].score);
    });
  });
  
  describe('getNextWeekDates', () => {
    test('should return 7 dates starting from tomorrow', () => {
      const dates = calculator.getNextWeekDates();
      const tomorrow = dayjs().add(1, 'day');
      
      expect(dates).toHaveLength(7);
      expect(dates[0].format('YYYY-MM-DD')).toBe(tomorrow.format('YYYY-MM-DD'));
      expect(dates[6].format('YYYY-MM-DD')).toBe(tomorrow.add(6, 'day').format('YYYY-MM-DD'));
    });
  });
  
  describe('calculateScore', () => {
    test('should return score between 0 and 100', () => {
      const date = dayjs().add(1, 'day');
      const planetaryData = {
        bestHours: [20, 21, 22],
        goodHours: [19],
        loveActions: ['test action']
      };
      
      const score = calculator.calculateScore(date, 20, {}, planetaryData);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
    
    test('should give higher scores for best hours', () => {
      const date = dayjs().add(1, 'day');
      const planetaryData = {
        bestHours: [20],
        goodHours: [19],
        loveActions: ['test action']
      };
      
      const bestHourScore = calculator.calculateScore(date, 20, {}, planetaryData);
      const goodHourScore = calculator.calculateScore(date, 19, {}, planetaryData);
      const normalHourScore = calculator.calculateScore(date, 15, {}, planetaryData);
      
      expect(bestHourScore).toBeGreaterThan(goodHourScore);
      expect(goodHourScore).toBeGreaterThan(normalHourScore);
    });
  });
  
  describe('calculateLuckyMinute', () => {
    test('should return valid minute (0-59)', () => {
      const minute = calculator.calculateLuckyMinute(15);
      
      expect(minute).toBeGreaterThanOrEqual(0);
      expect(minute).toBeLessThanOrEqual(59);
    });
    
    test('should avoid 11:11 timing', () => {
      const minute = calculator.calculateLuckyMinute(11);
      
      expect(minute).not.toBe(11);
    });
    
    test('should use fortune numbers', () => {
      const minute = calculator.calculateLuckyMinute(15);
      const fortuneNumbers = [14, 23, 32, 41, 50];
      
      expect(fortuneNumbers).toContain(minute);
    });
  });
  
  describe('edge cases', () => {
    test('should handle empty analysis data', () => {
      const timings = calculator.calculateOptimalTimings({});
      
      expect(timings).toHaveLength(3);
      expect(timings[0].score).toBeGreaterThan(0);
    });
    
    test('should handle null analysis data', () => {
      const timings = calculator.calculateOptimalTimings(null);
      
      expect(timings).toHaveLength(3);
    });
    
    test('should exclude early morning and late night hours', () => {
      const timings = calculator.calculateOptimalTimings();
      
      timings.forEach(timing => {
        const hour = parseInt(timing.time.split(':')[0]);
        expect(hour).toBeGreaterThanOrEqual(7);
        expect(hour).toBeLessThanOrEqual(23);
      });
    });
  });
  
  describe('getDayName', () => {
    test('should return correct Japanese day names', () => {
      const sunday = dayjs('2024-01-07'); // 2024年1月7日は日曜日
      const monday = dayjs('2024-01-08');
      
      expect(calculator.getDayName(sunday)).toBe('日曜日');
      expect(calculator.getDayName(monday)).toBe('月曜日');
    });
  });
  
  describe('calculateConfidence', () => {
    test('should return appropriate confidence levels', () => {
      expect(calculator.calculateConfidence(95)).toBe('とても高い');
      expect(calculator.calculateConfidence(85)).toBe('高い');
      expect(calculator.calculateConfidence(75)).toBe('普通');
      expect(calculator.calculateConfidence(65)).toBe('やや低い');
      expect(calculator.calculateConfidence(55)).toBe('低い');
    });
  });
  
  describe('suggestAction', () => {
    test('should suggest appropriate actions based on score', () => {
      const planetaryData = {
        loveActions: ['積極的にアプローチ', '気持ちを伝える']
      };
      
      const highScoreAction = calculator.suggestAction(95, '金曜日', planetaryData);
      const mediumScoreAction = calculator.suggestAction(75, '水曜日', planetaryData);
      const lowScoreAction = calculator.suggestAction(65, '月曜日', planetaryData);
      
      expect(planetaryData.loveActions).toContain(highScoreAction);
      expect(mediumScoreAction).toBe('さりげなく連絡を取る');
      expect(lowScoreAction).toBe('様子を見ながら慎重に行動');
    });
  });
  
  describe('getDetailedAnalysis', () => {
    test('should return comprehensive analysis', () => {
      const timing = {
        date: '2024-01-08',
        time: '20:32',
        datetime: new Date(),
        dayName: '月曜日',
        score: 85
      };
      
      const analysis = calculator.getDetailedAnalysis(timing);
      
      expect(analysis).toHaveProperty('timing');
      expect(analysis).toHaveProperty('urgency');
      expect(analysis).toHaveProperty('advice');
      expect(analysis).toHaveProperty('keywords');
      expect(analysis).toHaveProperty('colors');
      expect(analysis).toHaveProperty('avoidActions');
    });
  });
});