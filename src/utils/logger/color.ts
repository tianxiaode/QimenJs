const RESET = '\x1b[0m';

const COLORS: Record<string, string> = {
  DEBUG: '\x1b[90m',
  WARN: '\x1b[33m',
  ERROR: '\x1b[31m'
};

export function colorLevel(level: string, enable: boolean) {
  if (!enable) return level;
  const color = COLORS[level];
  return color ? `${color}${level}${RESET}` : level;
}
