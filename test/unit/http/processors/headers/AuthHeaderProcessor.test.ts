import { AuthHeaderProcessor } from '@/http/processors/headers/AuthHeaderProcessor';

// 模拟 localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem(key: string): string | null {
      return store[key] || null;
    },
    setItem(key: string, value: string): void {
      store[key] = value;
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('AuthHeaderProcessor', () => {
  beforeEach(() => {
    // 清除 localStorage
    window.localStorage.clear();
  });

  it('should not override existing Authorization header', () => {
    const headers = { Authorization: 'Bearer existing-token' };
    
    const result = AuthHeaderProcessor(headers, '', '', {});
    
    expect(result).toEqual(headers);
  });

  it('should not override existing authorization header (lowercase)', () => {
    const headers = { authorization: 'Bearer existing-token' };
    
    const result = AuthHeaderProcessor(headers, '', '', {});
    
    expect(result).toEqual(headers);
  });

  it('should add Authorization header when token exists in localStorage', () => {
    window.localStorage.setItem('token', 'test-token');
    const headers = {};
    
    const result = AuthHeaderProcessor(headers, '', '', {});
    
    expect(result).toEqual({
      Authorization: 'Bearer test-token',
    });
  });

  it('should add Authorization header with trimmed token when token has whitespace', () => {
    window.localStorage.setItem('token', ' test-token ');
    const headers = {};
    
    const result = AuthHeaderProcessor(headers, '', '', {});
    
    expect(result).toEqual({
      Authorization: 'Bearer test-token',
    });
  });

  it('should return original headers when no token in localStorage', () => {
    const headers = { 'Content-Type': 'application/json' };
    
    const result = AuthHeaderProcessor(headers, '', '', {});
    
    expect(result).toEqual(headers);
  });

  it('should return original headers when localStorage is empty', () => {
    const headers = {};
    
    const result = AuthHeaderProcessor(headers, '', '', {});
    
    expect(result).toEqual(headers);
  });
});