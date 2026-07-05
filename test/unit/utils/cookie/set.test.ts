// 模拟 document.cookie
let mockCookie = '';
Object.defineProperty(window.document, 'cookie', {
    get: () => mockCookie,
    set: val => {
        mockCookie = val;
    },
    configurable: true,
});

import { set } from '@/utils/cookie';

describe('set', () => {
    beforeEach(() => {
        mockCookie = '';
    });

    it('should return false when name is invalid', () => {
        expect(set('', 'value')).toBe(false);
    });

    it('should set a basic cookie', () => {
        const result = set('test', 'value');
        expect(result).toBe(true);
        expect(mockCookie).toContain('test=value');
    });

    it('should set cookie with expiration time in seconds', () => {
        const date = new Date();
        date.setTime(date.getTime() + 3600 * 1000); // 1 hour
        const expectedExpiry = date.toUTCString();

        const result = set('test', 'value', 3600);
        expect(result).toBe(true);
        expect(mockCookie).toContain('expires=');
    });

    it('should set cookie with expiration as Date object', () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1); // Tomorrow

        const result = set('test', 'value', futureDate);
        expect(result).toBe(true);
        expect(mockCookie).toContain('expires=');
    });

    it('should set cookie with path', () => {
        const result = set('test', 'value', undefined, '/path');
        expect(result).toBe(true);
        expect(mockCookie).toContain('path=/path');
    });

    it('should set cookie with domain', () => {
        const result = set('test', 'value', undefined, '/', 'example.com');
        expect(result).toBe(true);
        expect(mockCookie).toContain('domain=example.com');
    });

    it('should set secure cookie', () => {
        const result = set('test', 'value', undefined, '/', undefined, true);
        expect(result).toBe(true);
        expect(mockCookie).toContain('secure');
    });

    it('should set SameSite attribute', () => {
        const result = set('test', 'value', undefined, '/', undefined, false, 'Strict');
        expect(result).toBe(true);
        expect(mockCookie).toContain('samesite=Strict');
    });
});
