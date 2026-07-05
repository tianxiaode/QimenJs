// 模拟 document.cookie
let mockCookie = '';
Object.defineProperty(window.document, 'cookie', {
    get: () => mockCookie,
    set: val => {
        mockCookie = val;
    },
    configurable: true,
});

import { get } from '@/utils/cookie';

describe('get', () => {
    beforeEach(() => {
        mockCookie = '';
    });

    it('should return null when cookie does not exist', () => {
        expect(get('nonexistent')).toBeNull();
    });

    it('should return cookie value when it exists', () => {
        mockCookie = 'test=value';
        expect(get('test')).toBe('value');
    });

    it('should return null when cookie exists but has empty value', () => {
        mockCookie = 'empty=';
        expect(get('empty')).toBeNull();
    });

    it('should handle cookies with special characters', () => {
        mockCookie = 'special=' + encodeURIComponent('hello world!');
        expect(get('special')).toBe('hello world!');
    });

    it('should handle multiple cookies', () => {
        mockCookie = 'first=value1; second=value2; third=value3';
        expect(get('second')).toBe('value2');
    });
});
