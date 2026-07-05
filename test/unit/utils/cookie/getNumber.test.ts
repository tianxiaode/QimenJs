// 模拟 document.cookie
let mockCookie = '';
Object.defineProperty(window.document, 'cookie', {
    get: () => mockCookie,
    set: val => {
        mockCookie = val;
    },
    configurable: true,
});

import { getNumber } from '@/utils/cookie';

describe('getNumber', () => {
    beforeEach(() => {
        mockCookie = '';
    });

    it('should return NaN when cookie does not exist and no default is provided', () => {
        expect(getNumber('nonexistent')).toBeNaN();
    });

    it('should return default value when cookie does not exist', () => {
        expect(getNumber('nonexistent', 42)).toBe(42);
    });

    it('should return the numeric value when cookie exists and is valid', () => {
        mockCookie = 'number=123';
        expect(getNumber('number')).toBe(123);
    });

    it('should return NaN when cookie value is not a number and no default is provided', () => {
        mockCookie = 'notnumber=abc';
        expect(getNumber('notnumber')).toBeNaN();
    });

    it('should return default value when cookie value is not a number', () => {
        mockCookie = 'notnumber=abc';
        expect(getNumber('notnumber', 42)).toBe(42);
    });

    it('should handle decimal numbers', () => {
        mockCookie = 'decimal=3.14';
        expect(getNumber('decimal')).toBe(3.14);
    });

    it('should handle negative numbers', () => {
        mockCookie = 'negative=-42';
        expect(getNumber('negative')).toBe(-42);
    });
});
