// 統合テスト: Webhook全体フロー
const webhook = require('../../api/webhook');

// LINE SDK のモック
jest.mock('@line/bot-sdk', () => ({
  Client: jest.fn().mockImplementation(() => ({
    getMessageContent: jest.fn().mockResolvedValue({
      [Symbol.asyncIterator]: async function* () {
        yield Buffer.from('sample talk data');
      }
    }),
    getProfile: jest.fn().mockResolvedValue({
      displayName: 'テストユーザー'
    }),
    pushMessage: jest.fn().mockResolvedValue({})
  })),
  middleware: jest.fn()
}));

// OpenAI のモック
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                personality: ['優しい', '思いやりがある'],
                emotionalPattern: {
                  positive: ['褒められたとき'],
                  negative: ['批判'],
                  neutral: ['日常会話']
                },
                communicationStyle: '丁寧で親しみやすい',
                interests: ['映画', '音楽'],
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

describe('Webhook Integration Test', () => {
  let mockReq, mockRes;
  
  beforeEach(() => {
    mockReq = {
      method: 'POST',
      body: {
        events: []
      }
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      headersSent: false
    };
    
    // コンソールログをモック
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('HTTP Methods', () => {
    test('should return 405 for non-POST requests', async () => {
      mockReq.method = 'GET';
      
      await webhook(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(405);
      expect(mockRes.send).toHaveBeenCalledWith('Method Not Allowed');
    });
    
    test('should return 200 for POST requests with empty events', async () => {
      await webhook(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({});
    });
  });
  
  describe('Fortune Mode', () => {
    beforeEach(() => {
      mockReq.body.events = [{
        type: 'message',
        message: {
          type: 'file',
          id: 'test-message-id',
          fileName: 'お告げtest.txt'
        },
        source: {
          userId: 'test-user-id'
        }
      }];
    });
    
    test('should process fortune mode based on filename', async () => {
      await webhook(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('🎯 処理モード: fortune')
      );
    });
    
    test('should handle file processing errors gracefully', async () => {
      const { Client } = require('@line/bot-sdk');
      const mockClient = new Client();
      mockClient.getMessageContent.mockRejectedValue(new Error('File read error'));
      
      await webhook(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockClient.pushMessage).toHaveBeenCalledWith(
        'test-user-id',
        expect.objectContaining({
          type: 'text',
          text: expect.stringContaining('ファイルの読み込み中にエラー')
        })
      );
    });
  });
  
  describe('Compatibility Mode', () => {
    beforeEach(() => {
      mockReq.body.events = [{
        type: 'message',
        message: {
          type: 'file',
          id: 'test-message-id',
          fileName: 'normal_talk.txt'
        },
        source: {
          userId: 'test-user-id'
        }
      }];
    });
    
    test('should process compatibility mode for normal files', async () => {
      await webhook(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('🎯 処理モード: compatibility')
      );
    });
  });
  
  describe('Error Handling', () => {
    test('should handle parsing errors', async () => {
      mockReq.body.events = [{
        type: 'message',
        message: {
          type: 'file',
          id: 'test-message-id',
          fileName: 'invalid.txt'
        },
        source: {
          userId: 'test-user-id'
        }
      }];
      
      // parser.parseTLTextがエラーを投げるようにモック
      const parser = require('../../metrics/parser');
      jest.spyOn(parser, 'parseTLText').mockImplementation(() => {
        throw new Error('Parse error');
      });
      
      await webhook(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      
      parser.parseTLText.mockRestore();
    });
    
    test('should handle timeout errors', async () => {
      mockReq.body.events = [{
        type: 'message',
        message: {
          type: 'file',
          id: 'test-message-id',
          fileName: 'slow.txt'
        },
        source: {
          userId: 'test-user-id'
        }
      }];
      
      // 処理時間を延長してタイムアウトをシミュレート
      const originalTimeout = jest.setTimeout;
      jest.setTimeout(100); // 100ms
      
      await webhook(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      
      jest.setTimeout(originalTimeout);
    });
  });
  
  describe('Message Deduplication', () => {
    test('should skip duplicate messages', async () => {
      const event = {
        type: 'message',
        message: {
          type: 'file',
          id: 'duplicate-message-id',
          fileName: 'test.txt'
        },
        source: {
          userId: 'test-user-id'
        }
      };
      
      mockReq.body.events = [event, event]; // 同じメッセージを2回
      
      await webhook(mockReq, mockRes);
      
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('重複メッセージをスキップ')
      );
    });
  });
  
  describe('Performance', () => {
    test('should complete processing within timeout', async () => {
      const startTime = Date.now();
      
      mockReq.body.events = [{
        type: 'message',
        message: {
          type: 'file',
          id: 'test-message-id',
          fileName: 'performance-test.txt'
        },
        source: {
          userId: 'test-user-id'
        }
      }];
      
      await webhook(mockReq, mockRes);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      expect(processingTime).toBeLessThan(9000); // 9秒以内
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
  
  describe('Environment Variables', () => {
    test('should handle missing OpenAI API key gracefully', async () => {
      const originalKey = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;
      
      mockReq.body.events = [{
        type: 'message',
        message: {
          type: 'file',
          id: 'test-message-id',
          fileName: 'お告げtest.txt'
        },
        source: {
          userId: 'test-user-id'
        }
      }];
      
      await webhook(mockReq, mockRes);
      
      expect(mockRes.status).toHaveBeenCalledWith(200);
      
      process.env.OPENAI_API_KEY = originalKey;
    });
  });
});