import { LogEntry, LoggerOptions } from './types';
import { colorLevel } from './color';

export function format(entry: LogEntry, options: LoggerOptions): string {
  const time = new Date(entry.timestamp).toISOString();

  const rawLevel = entry.level.toUpperCase();
  const paddedLevel = rawLevel.padEnd(5);
  const level = colorLevel(rawLevel, !!options.color).padEnd(5);

  const category = entry.category ? entry.category.padEnd(16) : '';

  let message = '';
  if (entry.error instanceof Error) {
    message = entry.error.stack || entry.error.message;
  } else {
    message = String(entry.message ?? '');
  }

  return `${time} ${level} ${category} ${message}`;
}
