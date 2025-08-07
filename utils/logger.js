// console.logを完全に無効化するユーティリティ
// 必要な時だけDEBUG=trueで有効化
const isDebugMode = process.env.DEBUG === 'true';

const logger = {
  log: isDebugMode ? console.log.bind(console) : () => {},
  error: console.error.bind(console), // エラーは常に出力
  warn: isDebugMode ? console.warn.bind(console) : () => {},
  info: isDebugMode ? console.info.bind(console) : () => {},
  debug: isDebugMode ? console.debug.bind(console) : () => {},
};

module.exports = logger;