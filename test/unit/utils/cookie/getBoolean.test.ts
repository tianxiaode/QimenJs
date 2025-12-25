// 模拟 document.cookie
let mockCookie = '';
Object.defineProperty(window.document, 'cookie', {
  get: () => mockCookie,
  set: (val) => {
    mockCookie = val;
  },
  configurable: true
});

import { getBoolean } from '@/utils/cookie';

describe('getBoolean', () => {
  beforeEach(() => {
    mockCookie = '';
  });

  it('should return default value (false) when cookie does not exist', () => {
    expect(getBoolean('nonexistent')).toBe(false);
  });

  it('should return custom default value when cookie does not exist', () => {
    expect(getBoolean('nonexistent', true)).toBe(true);
  });

  it('should return true when cookie value is "true" (case insensitive)', () => {
    mockCookie = 'flag=true';
    expect(getBoolean('flag')).toBe(true);

    mockCookie = 'flag=TRUE';
    expect(getBoolean('flag')).toBe(true);

    mockCookie = 'flag=True';
    expect(getBoolean('flag')).toBe(true);
  });

  it('should return false when cookie value is not "true"', () => {
    mockCookie = 'flag=false';
    expect(getBoolean('flag')).toBe(false);

    mockCookie = 'flag=1';
    expect(getBoolean('flag')).toBe(false);

    mockCookie = 'flag=0';
    expect(getBoolean('flag')).toBe(false);

    mockCookie = 'flag=anything';
    expect(getBoolean('flag')).toBe(false);
  });
});