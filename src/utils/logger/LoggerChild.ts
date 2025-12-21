// logger/LoggerChild.ts
import { Logger } from './Logger';
import { LogLevel } from './types';

export class LoggerChild {
  constructor(
    private readonly parent: Logger,
    private readonly category: string
  ) {}

  private log(level: LogLevel, message?: any, ...data: any[]) {
    this.parent.emit({
      timestamp: Date.now(),
      level,
      category: this.category,
      message,
      data
    });
  }

  debug(message?: any, ...data: any[]) {
    this.log('debug', message, ...data);
  }

  info(message?: any, ...data: any[]) {
    this.log('info', message, ...data);
  }

  warn(message?: any, ...data: any[]) {
    this.log('warn', message, ...data);
  }

  error(err: Error | any, ...data: any[]) {
    if (err instanceof Error) {
      this.parent.emit({
        timestamp: Date.now(),
        level: 'error',
        category: this.category,
        error: err,
        data
      });
    } else {
      this.log('error', err, ...data);
    }
  }
}
