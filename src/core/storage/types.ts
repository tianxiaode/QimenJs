export interface Storage {
  get<T = any>(key: string): T | null;
  set<T = any>(key: string, value: T, options?: any): void;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
}