import { Logger } from './Logger';
import type { LoggerOptions } from './types';

export function createLogger(options: LoggerOptions) {
  const root = new Logger(options);
  Logger.root = root;
  return root;
}

export { Logger };

//使用方法

// bootstrap / global.ts
// import { createLogger } from './logger';

// export const logger = createLogger({
//   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
//   color:
//     process.env.NODE_ENV !== 'production' &&
//     process.stdout.isTTY
// });