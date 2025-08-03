// Jest テストセットアップファイル

// 環境変数の設定
process.env.NODE_ENV = 'test';
process.env.OPENAI_API_KEY = 'test-api-key';
process.env.FORTUNE_MODE = 'development';
process.env.CHANNEL_ACCESS_TOKEN = 'test-channel-token';
process.env.CHANNEL_SECRET = 'test-channel-secret';

// コンソールログを抑制（必要に応じて）
if (process.env.SUPPRESS_LOGS === 'true') {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
}

// タイムゾーンの固定（テストの一貫性のため）
process.env.TZ = 'Asia/Tokyo';

// 乱数の固定（テストの再現性のため）
beforeEach(() => {
  jest.spyOn(Math, 'random').mockReturnValue(0.5);
});

afterEach(() => {
  Math.random.mockRestore();
});

// Date.now()の固定
const mockDate = new Date('2024-01-24T10:00:00Z');
let dateNowSpy;

beforeAll(() => {
  dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(mockDate.getTime());
});

afterAll(() => {
  if (dateNowSpy) {
    dateNowSpy.mockRestore();
  }
});

// デバッグ用のヘルパー関数
global.debugTest = (obj) => {
  console.log(JSON.stringify(obj, null, 2));
};

// 非同期テストのタイムアウト警告を抑制
jest.setTimeout(10000);