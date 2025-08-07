// 本番環境でconsole.logを無効化するユーティリティ
const isDevelopment = process.env.NODE_ENV !== 'production' && !process.env.VERCEL;

const logger = {
  log: isDevelopment ? console.log.bind(console) : () => {},
  error: console.error.bind(console), // エラーは常に出力
  warn: isDevelopment ? console.warn.bind(console) : () => {},
  info: isDevelopment ? console.info.bind(console) : () => {},
  debug: isDevelopment ? console.debug.bind(console) : () => {},
};

module.exports = logger;