// 模拟 document.cookie
let mockCookie = '';
Object.defineProperty(window.document, 'cookie', {
  get: () => mockCookie,
  set: (val) => {
    mockCookie = val;
  },
  configurable: true
});

import { getAll } from '@/utils/cookie';

describe('getAll', () => {
  beforeEach(() => {
    mockCookie = '';
  });

  it('should return an empty object when no cookies exist', () => {
    mockCookie = '';
    expect(getAll()).toEqual({});
  });

  it('should return all cookies as key-value pairs', () => {
    mockCookie = 'first=value1; second=value2; third=value3';
    expect(getAll()).toEqual({
      first: 'value1',
      second: 'value2',
      third: 'value3'
    });
  });

  it('should handle cookies with special characters', () => {
    mockCookie = 'special=' + encodeURIComponent('hello world!');
    expect(getAll()).toEqual({
      special: 'hello world!'
    });
  });

  it('should handle cookies with spaces around the equals sign', () => {
    mockCookie = ' spaced = value ';
    expect(getAll()).toEqual({
      'spaced': 'value', // 修复测试预期，因为cookie解析会移除空格
    });
  });

  it('should handle cookies with empty values', () => {
    mockCookie = 'empty=; nonempty=value';
    expect(getAll()).toEqual({
      empty: '',
      nonempty: 'value'
    });
  });
});