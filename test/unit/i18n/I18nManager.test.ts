import { I18nManager, registerMessages, i18n } from '@/i18n/I18nManager';

describe('I18nManager', () => {
    let manager: I18nManager;

    beforeEach(() => {
        manager = new I18nManager();
    });

    afterEach(() => {
        manager.dispose();
    });

    // --- locale getter/setter ---

    describe('locale', () => {
        test('默认语言应该从浏览器检测', () => {
            expect(manager.locale).toBeTruthy();
        });

        test('localStorage 中有语言时应该优先使用', () => {
            localStorage.setItem('locale', 'ja-JP');
            const m = new I18nManager();
            try {
                expect(m.locale).toBe('ja-JP');
            } finally {
                m.dispose();
                localStorage.removeItem('locale');
            }
        });

        test('设置语言应该触发 locale:change 事件', () => {
            const handler = jest.fn();
            manager.onLocaleChange(handler);

            const previous = manager.locale;
            const newLocale = previous === 'ja-JP' ? 'en-US' : 'ja-JP';
            manager.locale = newLocale;

            expect(manager.locale).toBe(newLocale);
            expect(handler).toHaveBeenCalledWith({
                previous,
                current: newLocale,
            });
        });

        test('设置相同语言不应该触发事件', () => {
            const handler = jest.fn();
            manager.onLocaleChange(handler);

            manager.locale = manager.locale;

            expect(handler).not.toHaveBeenCalled();
        });
    });

    // --- t() 翻译 ---

    describe('t()', () => {
        beforeEach(() => {
            manager.inject({
                common: {
                    save: '保存',
                    greeting: '你好, {name}',
                    items: '{count} 个项目',
                },
                user: {
                    profile: { name: '用户名' },
                },
            });
        });

        test('简单键', () => {
            expect(manager.t('common.save')).toBe('保存');
        });

        test('嵌套路径', () => {
            expect(manager.t('user.profile.name')).toBe('用户名');
        });

        test('键不存在返回 key', () => {
            expect(manager.t('common.notExist')).toBe('common.notExist');
        });

        test('键不存在返回默认值', () => {
            expect(manager.t('common.notExist', undefined, '默认')).toBe('默认');
        });

        test('插值替换', () => {
            expect(manager.t('common.greeting', { name: 'World' })).toBe('你好, World');
        });

        test('数字参数插值', () => {
            expect(manager.t('common.items', { count: 5 })).toBe('5 个项目');
        });

        test('值不是字符串时返回默认值', () => {
            expect(manager.t('user.profile', undefined, 'default')).toBe('default');
        });
    });

    // --- inject() ---

    describe('inject()', () => {
        test('注入消息到当前语言', () => {
            manager.inject({ common: { save: '保存' } });
            expect(manager.t('common.save')).toBe('保存');
        });

        test('注入消息到指定语言', () => {
            manager.inject({ common: { save: 'Save' } }, 'en-US');
            manager.locale = 'en-US';
            expect(manager.t('common.save')).toBe('Save');
        });

        test('注入应该深度合并', () => {
            manager.inject({ common: { save: '保存' } });
            manager.inject({ common: { cancel: '取消' } });

            expect(manager.t('common.save')).toBe('保存');
            expect(manager.t('common.cancel')).toBe('取消');
        });

        test('注入应该覆盖同路径值', () => {
            manager.inject({ common: { save: '保存' } });
            manager.inject({ common: { save: '储存' } });

            expect(manager.t('common.save')).toBe('储存');
        });

        test('注入应该触发 messages:update 事件', () => {
            const handler = jest.fn();
            manager.onMessagesUpdate(handler);

            manager.inject({ common: { save: '保存' } });

            expect(handler).toHaveBeenCalledWith({
                locale: manager.locale,
                messages: { common: { save: '保存' } },
            });
        });
    });

    // --- getMessage() / getMessages() ---

    describe('getMessage() / getMessages()', () => {
        beforeEach(() => {
            manager.inject({
                user: { profile: { name: '用户名' } },
            });
        });

        test('getMessage 返回原始值', () => {
            expect(manager.getMessage('user.profile.name')).toBe('用户名');
        });

        test('getMessage 返回对象', () => {
            expect(manager.getMessage('user.profile')).toEqual({ name: '用户名' });
        });

        test('getMessages 返回全部消息', () => {
            expect(manager.getMessages()).toEqual({
                user: { profile: { name: '用户名' } },
            });
        });
    });

    // --- loadScript() ---

    describe('loadScript()', () => {
        test('应该创建 script 标签加载 .js 文件', async () => {
            const createElementSpy = jest.spyOn(document, 'createElement');
            const appendChildSpy = jest.spyOn(document.head, 'appendChild');

            const promise = manager.loadScript('/locales/en-US.js');

            // 验证创建了 script 标签
            const scriptEl = createElementSpy.mock.results.find(
                r => r.value instanceof HTMLScriptElement
            )?.value as HTMLScriptElement;
            expect(scriptEl).toBeDefined();
            expect(scriptEl.src).toContain('/locales/en-US.js');
            expect(scriptEl.async).toBe(true);

            // 模拟加载成功
            (scriptEl as any).onload();
            await promise;

            createElementSpy.mockRestore();
            appendChildSpy.mockRestore();
        });

        test('同一 URL 只加载一次', async () => {
            const createElementSpy = jest.spyOn(document, 'createElement');
            const appendChildSpy = jest.spyOn(document.head, 'appendChild');

            // 第一次加载
            const promise1 = manager.loadScript('/locales/en-US.js');
            const scriptEl = createElementSpy.mock.results.find(
                r => r.value instanceof HTMLScriptElement
            )?.value as HTMLScriptElement;
            (scriptEl as any)?.onload();
            await promise1;

            // 第二次加载同一 URL
            await manager.loadScript('/locales/en-US.js');

            // 只创建了一个 script
            const scriptCount = createElementSpy.mock.results.filter(
                r => r.value instanceof HTMLScriptElement
            ).length;
            expect(scriptCount).toBe(1);

            createElementSpy.mockRestore();
            appendChildSpy.mockRestore();
        });
    });

    // --- 事件取消监听 ---

    describe('取消监听', () => {
        test('onLocaleChange 返回的函数应该取消监听', () => {
            const handler = jest.fn();
            const off = manager.onLocaleChange(handler);

            off();
            manager.locale = 'en-US';

            expect(handler).not.toHaveBeenCalled();
        });

        test('onMessagesUpdate 返回的函数应该取消监听', () => {
            const handler = jest.fn();
            const off = manager.onMessagesUpdate(handler);

            off();
            manager.inject({ common: { save: '保存' } });

            expect(handler).not.toHaveBeenCalled();
        });
    });

    // --- dispose() ---

    describe('dispose()', () => {
        test('销毁后不应该触发事件', () => {
            const handler = jest.fn();
            manager.onLocaleChange(handler);

            manager.dispose();
            manager.locale = 'en-US';

            expect(handler).not.toHaveBeenCalled();
        });
    });

    // --- registerMessages() ---

    describe('registerMessages()', () => {
        test('应该向全局 i18n 单例注入消息', () => {
            registerMessages('zh-CN', { common: { save: '保存' } });
            i18n.locale = 'zh-CN';
            expect(i18n.t('common.save')).toBe('保存');
            i18n.dispose();
        });

        test('当前语言没有消息时应该自动切换到注册的语言', () => {
            // i18n 初始可能检测到 en-US，但没有消息
            registerMessages('zh-CN', { common: { save: '保存' } });
            // 应该自动切换到 zh-CN
            expect(i18n.locale).toBe('zh-CN');
            expect(i18n.t('common.save')).toBe('保存');
            i18n.dispose();
        });
    });

    // --- 全局挂载 ---

    describe('全局挂载 __orbit_i18n_register__', () => {
        test('window 上应该存在 __orbit_i18n_register__', () => {
            expect(typeof (window as any).__orbit_i18n_register__).toBe('function');
        });

        test('通过全局函数注册消息', () => {
            (window as any).__orbit_i18n_register__('en-US', { common: { save: 'Save' } });
            i18n.locale = 'en-US';
            expect(i18n.t('common.save')).toBe('Save');
            i18n.dispose();
        });
    });
});
