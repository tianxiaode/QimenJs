// 模拟 document.cookie
let mockCookie = '';
Object.defineProperty(window.document, 'cookie', {
    get: () => mockCookie,
    set: val => {
        // 解析cookie字符串，提取cookie名和值
        const cookieName = val.split('=')[0];

        // 检查是否是删除操作（过期日期为过去）
        if (val.includes('expires=Thu, 01 Jan 1970 00:00:00 GMT')) {
            // 从当前cookie中移除被删除的cookie
            const cookies = mockCookie.split('; ');
            const remainingCookies = cookies.filter(cookie => {
                return !cookie.startsWith(cookieName + '=');
            });
            mockCookie = remainingCookies.join('; ');
        } else {
            // 添加或更新cookie
            if (mockCookie) {
                const cookies = mockCookie.split('; ');
                const existingCookieIndex = cookies.findIndex(cookie =>
                    cookie.startsWith(cookieName + '=')
                );

                if (existingCookieIndex !== -1) {
                    cookies[existingCookieIndex] = val;
                    mockCookie = cookies.join('; ');
                } else {
                    mockCookie += '; ' + val;
                }
            } else {
                mockCookie = val;
            }
        }
    },
    configurable: true,
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

    it('should successfully remove existing cookie', () => {
        mockCookie = 'test=value';
        expect(remove('test')).toBe(true);
    });

    it('should handle path parameter', () => {
        mockCookie = 'test=value';
        expect(remove('test', '/path')).toBe(true);
    });

    it('should handle domain parameter', () => {
        mockCookie = 'test=value';
        expect(remove('test', undefined, 'example.com')).toBe(true);
    });

    it('should handle secure parameter', () => {
        mockCookie = 'test=value';
        expect(remove('test', undefined, undefined, true)).toBe(true);
    });

    it('should handle all parameters together', () => {
        mockCookie = 'test=value';
        expect(remove('test', '/path', 'example.com', true)).toBe(true);
    });
});
