import { getI18nManager, I18N_PREFIX, resolveI18nValue, t } from '@qimenjs/i18n';

describe('i18n-utils', () => {
    describe('I18N_PREFIX', () => {
        test('前缀应为 i18n:', () => {
            expect(I18N_PREFIX).toBe('i18n:');
        });
    });

    describe('getI18nManager', () => {
        test('window 上没有 i18n 时返回 null', () => {
            const saved = (window as any).__qimen_i18n__;
            delete (window as any).__qimen_i18n__;
            expect(getI18nManager()).toBeNull();
            (window as any).__qimen_i18n__ = saved;
        });

        test('window 上有 i18n 时返回实例', () => {
            const mock = { t: (k: string) => k, locale: 'zh-CN' };
            (window as any).__qimen_i18n__ = mock;
            expect(getI18nManager()).toBe(mock);
            delete (window as any).__qimen_i18n__;
        });
    });

    describe('resolveI18nValue', () => {
        test('非 i18n 前缀的值原样返回', () => {
            expect(resolveI18nValue('hello')).toBe('hello');
        });

        test('i18n 前缀的值去掉前缀后翻译', () => {
            const mock = { t: (k: string) => `translated:${k}`, locale: 'zh-CN' };
            (window as any).__qimen_i18n__ = mock;
            expect(resolveI18nValue('i18n:btn.save')).toBe('translated:btn.save');
            delete (window as any).__qimen_i18n__;
        });

        test('i18n 前缀但无 i18n 实例时返回 key', () => {
            delete (window as any).__qimen_i18n__;
            expect(resolveI18nValue('i18n:btn.save')).toBe('btn.save');
        });
    });

    describe('t', () => {
        test('直接翻译 key', () => {
            const mock = { t: (k: string) => `翻译:${k}`, locale: 'zh-CN' };
            (window as any).__qimen_i18n__ = mock;
            expect(t('kernel.ENTITY_NOT_FOUND')).toBe('翻译:kernel.ENTITY_NOT_FOUND');
            delete (window as any).__qimen_i18n__;
        });

        test('带 i18n 前缀的 key 自动去掉前缀后翻译', () => {
            const mock = { t: (k: string) => `翻译:${k}`, locale: 'zh-CN' };
            (window as any).__qimen_i18n__ = mock;
            expect(t('i18n:kernel.ENTITY_NOT_FOUND')).toBe('翻译:kernel.ENTITY_NOT_FOUND');
            delete (window as any).__qimen_i18n__;
        });

        test('无 i18n 实例时返回 key 本身', () => {
            delete (window as any).__qimen_i18n__;
            expect(t('kernel.ENTITY_NOT_FOUND')).toBe('kernel.ENTITY_NOT_FOUND');
        });

        test('带 i18n 前缀且无 i18n 实例时返回去掉前缀的 key', () => {
            delete (window as any).__qimen_i18n__;
            expect(t('i18n:kernel.ENTITY_NOT_FOUND')).toBe('kernel.ENTITY_NOT_FOUND');
        });

        test('i18n.t 返回空时 fallback 为 key', () => {
            const mock = { t: (_k: string) => '', locale: 'zh-CN' };
            (window as any).__qimen_i18n__ = mock;
            expect(t('unknown.key')).toBe('unknown.key');
            delete (window as any).__qimen_i18n__;
        });
    });

    describe('t with isError', () => {
        test('isError=true 从 kernel 源查找', () => {
            const store: Record<string, string> = {
                'kernel.ENTITY_NOT_FOUND': '未找到指定的实体',
            };
            const mock = { t: (k: string) => store[k] || k, locale: 'zh-CN' };
            (window as any).__qimen_i18n__ = mock;
            expect(t('ENTITY_NOT_FOUND', true)).toBe('未找到指定的实体');
            delete (window as any).__qimen_i18n__;
        });

        test('isError=true 从 validation 源查找', () => {
            const store: Record<string, string> = {
                'validation.VALIDATION_REQUIRED': '此字段为必填项',
            };
            const mock = { t: (k: string) => store[k] || k, locale: 'zh-CN' };
            (window as any).__qimen_i18n__ = mock;
            expect(t('VALIDATION_REQUIRED', true)).toBe('此字段为必填项');
            delete (window as any).__qimen_i18n__;
        });

        test('isError=true 从 http 源查找', () => {
            const store: Record<string, string> = {
                'http.403': '拒绝访问',
            };
            const mock = { t: (k: string) => store[k] || k, locale: 'zh-CN' };
            (window as any).__qimen_i18n__ = mock;
            expect(t('403', true)).toBe('拒绝访问');
            delete (window as any).__qimen_i18n__;
        });

        test('isError=true 优先匹配 kernel', () => {
            const store: Record<string, string> = {
                'kernel.SOME_CODE': '内核错误',
                'validation.SOME_CODE': '验证错误',
            };
            const mock = { t: (k: string) => store[k] || k, locale: 'zh-CN' };
            (window as any).__qimen_i18n__ = mock;
            expect(t('SOME_CODE', true)).toBe('内核错误');
            delete (window as any).__qimen_i18n__;
        });

        test('isError=true 三个源都未注册时返回 key', () => {
            const mock = { t: (k: string) => k, locale: 'zh-CN' };
            (window as any).__qimen_i18n__ = mock;
            expect(t('UNKNOWN_ERROR', true)).toBe('UNKNOWN_ERROR');
            delete (window as any).__qimen_i18n__;
        });

        test('isError=true 无 i18n 实例时返回 key', () => {
            delete (window as any).__qimen_i18n__;
            expect(t('ENTITY_NOT_FOUND', true)).toBe('ENTITY_NOT_FOUND');
        });

        test('isError=true 带 i18n 前缀自动去掉', () => {
            const store: Record<string, string> = {
                'kernel.ENTITY_NOT_FOUND': '未找到指定的实体',
            };
            const mock = { t: (k: string) => store[k] || k, locale: 'zh-CN' };
            (window as any).__qimen_i18n__ = mock;
            expect(t('i18n:ENTITY_NOT_FOUND', true)).toBe('未找到指定的实体');
            delete (window as any).__qimen_i18n__;
        });
    });
});
