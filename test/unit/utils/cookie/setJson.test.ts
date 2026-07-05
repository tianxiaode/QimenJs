// 模拟 document.cookie
let mockCookie = '';
Object.defineProperty(window.document, 'cookie', {
    get: () => mockCookie,
    set: val => {
        mockCookie = val;
    },
    configurable: true,
});

// Mock set 函数
jest.mock('@/utils/cookie/set', () => {
    return {
        set: jest.fn((name, value) => {
            // 模仿set函数的行为：如果name有效则返回true
            return !!name;
        }),
    };
});

import { setJson } from '@/utils/cookie';
import { set } from '@/utils/cookie/set';

describe('setJson', () => {
    beforeEach(() => {
        mockCookie = '';
        (set as jest.MockedFunction<typeof set>).mockClear();
        (set as jest.MockedFunction<typeof set>).mockImplementation((name, value) => {
            return !!name;
        });
    });

    it('should call set with JSON stringified value', () => {
        const testObj = { name: 'test', value: 123 };
        const result = setJson('test', testObj);

        expect(result).toBe(true);
        expect(set).toHaveBeenCalledWith(
            'test',
            JSON.stringify(testObj),
            undefined,
            '/',
            undefined,
            false,
            'Lax'
        );
    });

    it('should handle primitive values', () => {
        const result = setJson('number', 42);

        expect(result).toBe(true);
        expect(set).toHaveBeenCalledWith('number', '42', undefined, '/', undefined, false, 'Lax');
    });

    it('should handle array values', () => {
        const testArray = [1, 2, 3];
        const result = setJson('array', testArray);

        expect(result).toBe(true);
        expect(set).toHaveBeenCalledWith(
            'array',
            JSON.stringify(testArray),
            undefined,
            '/',
            undefined,
            false,
            'Lax'
        );
    });

    it('should throw error when JSON stringify fails', () => {
        // 创建一个循环引用的对象以导致 JSON.stringify 失败
        const circularObj: any = { name: 'test' };
        circularObj.self = circularObj;

        // 由于移除了try-catch，现在应该抛出错误
        expect(() => setJson('circular', circularObj)).toThrow();
    });

    it('should pass all parameters to set function', () => {
        const futureDate = new Date();
        const result = setJson(
            'test',
            { data: 'value' },
            futureDate,
            '/path',
            'example.com',
            true,
            'Strict'
        );

        expect(result).toBe(true);
        expect(set).toHaveBeenCalledWith(
            'test',
            JSON.stringify({ data: 'value' }),
            futureDate,
            '/path',
            'example.com',
            true,
            'Strict'
        );
    });
});
