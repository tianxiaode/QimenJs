import { getI18nManager, I18N_PREFIX, resolveI18nValue } from '@qimenjs/i18n';

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
});
