module.exports = {
  // テスト環境
  testEnvironment: 'node',
  
  // テストファイルのパターン
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  
  // カバレッジ設定
  collectCoverageFrom: [
    'core/**/*.js',
    'utils/**/*.js',
    'config/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/data/**'
  ],
  
  // カバレッジしきい値
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    },
    './core/fortune-engine/': {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './core/formatter/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // タイムアウト設定
  testTimeout: 10000,
  
  // モック設定
  clearMocks: true,
  restoreMocks: true,
  
  // 詳細なレポート
  verbose: true
};