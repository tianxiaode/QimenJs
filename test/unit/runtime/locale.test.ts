describe('getLocale', () => {
    let originalNavigator: any;

    beforeEach(() => {
        // 保存原始 navigator 对象
        originalNavigator = (global as any).navigator;

        // 删除可能存在的 navigator 对象
        delete (global as any).navigator;

        jest.resetModules();
    });

    afterEach(() => {
        // 恢复原始 navigator 对象
        if (originalNavigator) {
            (global as any).navigator = originalNavigator;
        } else {
            delete (global as any).navigator;
        }
    });

    it('应该返回浏览器的 navigator.language', () => {
        // 模拟浏览器环境
        (global as any).navigator = {
            language: 'en-US',
            userLanguage: 'en',
            // 添加必需的 navigator 属性
            appCodeName: 'Mozilla',
            appName: 'Netscape',
            appVersion: '5.0 (Windows)',
            cookieEnabled: true,
            onLine: true,
            platform: 'Win32',
            product: 'Gecko',
            vendor: 'Google Inc.',
        };

        const { getLocale } = require('@/runtime/locale');

        expect(getLocale()).toBe('en-US');
    });

    it('应该在 navigator.language 不存在时返回 navigator.userLanguage', () => {
        // 模拟只有 userLanguage 的 navigator
        (global as any).navigator = {
            userLanguage: 'zh-TW',
            appCodeName: 'Mozilla',
            appName: 'Netscape',
            appVersion: '5.0 (Windows)',
            cookieEnabled: true,
            onLine: true,
            platform: 'Win32',
            product: 'Gecko',
            vendor: 'Google Inc.',
        };

        const { getLocale } = require('@/runtime/locale');

        expect(getLocale()).toBe('zh-TW');
    });

    it('应该在 navigator.language 和 userLanguage 都不存在时返回默认值 zh-CN', () => {
        // 模拟没有 language 和 userLanguage 属性的 navigator
        (global as any).navigator = {
            appCodeName: 'Mozilla',
            appName: 'Netscape',
            appVersion: '5.0 (Windows)',
            cookieEnabled: true,
            onLine: true,
            platform: 'Win32',
            product: 'Gecko',
            vendor: 'Google Inc.',
        };

        const { getLocale } = require('@/runtime/locale');

        expect(getLocale()).toBe('zh-CN');
    });
});
