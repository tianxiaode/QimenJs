import { LogEntry, LogLevel, LoggerOptions } from './types';
import { format } from './format';
import { consoleSink } from './sinks/console';
import { LoggerChild } from './LoggerChild';

const LEVEL_ORDER: LogLevel[] = ['debug', 'info', 'warn', 'error'];

export class Logger {
  private static children = new Map<string, LoggerChild>();

  constructor(private readonly options: LoggerOptions = {}) {}

  static for(target: string | Function): LoggerChild {
    const name =
      typeof target === 'string'
        ? target
        : (target as any).$ClassName || target.name;

    let child = this.children.get(name);
    if (!child) {
      child = new LoggerChild(this.root, name);
      this.children.set(name, child);
    }
    return child;
  }

  /** root logger（由 index.ts 初始化） */
  static root: Logger;

  emit(entry: LogEntry) {
    if (!this.shouldLog(entry.level)) return;

    const text = format(entry, this.options);
    consoleSink(text, entry.level);
  }

  private shouldLog(level: LogLevel): boolean {
    const min = this.options.level ?? 'info';
    return (
      LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(min)
    );
  }
}
