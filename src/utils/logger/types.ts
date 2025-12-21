export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category?: string;
  message?: any;
  error?: Error;
  data?: any[];
}

export interface LoggerOptions {
  level?: LogLevel;
  color?: boolean;
}
