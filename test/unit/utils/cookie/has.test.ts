// 模拟 document.cookie
let mockCookie = '';
Object.defineProperty(window.document, 'cookie', {
    get: () => mockCookie,
    set: val => {
        mockCookie = val;
    },
    configurable: true,
});

import { has } from '@/utils/cookie';

describe('has', () => {
    beforeEach(() => {
        mockCookie = '';
    });

    it('should return false when name is empty', () => {
        expect(has('')).toBe(false);
    });

    it('should return true when cookie exists', () => {
        mockCookie = 'test=value';
        expect(has('test')).toBe(true);
    });

    it('should return false when cookie does not exist', () => {
        mockCookie = 'other=value';
        expect(has('test')).toBe(false);
    });

    it('should handle multiple cookies', () => {
        mockCookie = 'first=value1; second=value2; third=value3';
        expect(has('second')).toBe(true);
        expect(has('nonexistent')).toBe(false);
    });

    it('should handle cookies with special characters in name', () => {
        mockCookie = 'test%20name=value';
        expect(has('test name')).toBe(true);
    });
});
