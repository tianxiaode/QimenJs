import { Logger } from './Logger';
import type { LoggerOptions } from './types';

export { Logger, LoggerOptions };

//使用方法

// bootstrap / global.ts
// import { createLogger } from './logger';

// export const logger = createLogger({
//   level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
//   color:
//     process.env.NODE_ENV !== 'production' &&
//     process.stdout.isTTY
// });