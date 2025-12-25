// 模拟 document.cookie
let mockCookie = '';
Object.defineProperty(window.document, 'cookie', {
  get: () => mockCookie,
  set: (val) => {
    mockCookie = val;
  },
  configurable: true
});

import { remove } from '@/utils/cookie';

describe('remove', () => {
  beforeEach(() => {
    mockCookie = '';
  });

  it('should return false when name is empty', () => {
    expect(remove('')).toBe(false);
  });

  it('should return false when cookie does not exist', () => {
    expect(remove('nonexistent')).toBe(false);
  });
});