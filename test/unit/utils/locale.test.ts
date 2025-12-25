import { getLocaleFromNavigator } from '../../../src/utils/locale';

describe('getLocaleFromNavigator', () => {
    const originalNavigator = global.navigator;

    afterEach(() => {
        // 恢复原始 navigator 状态
        Object.defineProperty(global, 'navigator', {
            writable: true,
            configurable: true,
            value: originalNavigator
        });
    });

    it('应该返回浏览器的 navigator.language', () => {
        // 模拟浏览器环境
        Object.defineProperty(global, 'navigator', {
            writable: true,
            configurable: true,
            value: { language: 'en-US' }
        });

        const result = getLocaleFromNavigator();
        expect(result).toBe('en-US');
    });

    it('应该返回默认语言环境 zh-CN 当 navigator 不存在时', () => {
        // 使用属性描述符将 navigator 设置为 undefined 来模拟非浏览器环境
        Object.defineProperty(global, 'navigator', {
            value: undefined,
            writable: true,
            configurable: true
        });

        const result = getLocaleFromNavigator();
        expect(result).toBe('zh-CN');
    });

    it('应该返回默认语言环境 zh-CN 当 navigator.language 为 undefined 时', () => {
        Object.defineProperty(global, 'navigator', {
            writable: true,
            configurable: true,
            value: { language: undefined }
        });

        const result = getLocaleFromNavigator();
        expect(result).toBe('zh-CN');
    });

    it('应该返回默认语言环境 zh-CN 当 navigator.language 为 null 时', () => {
        Object.defineProperty(global, 'navigator', {
            writable: true,
            configurable: true,
            value: { language: null }
        });

        const result = getLocaleFromNavigator();
        expect(result).toBe('zh-CN');
    });

    it('应该返回默认语言环境 zh-CN 当 navigator.language 为空字符串时', () => {
        Object.defineProperty(global, 'navigator', {
            writable: true,
            configurable: true,
            value: { language: '' }
        });

        const result = getLocaleFromNavigator();
        expect(result).toBe('zh-CN');
    });
});