/**
 * 单元测试：ThemeRegistrar
 */

import { ThemeRegistrar, flattenTokens, THEME_CHANGE_EVENT } from '@qimenjs/theme';
import type { ThemeDefinition } from '@qimenjs/theme';
import { globalEventBus } from '@qimenjs/events';

describe('ThemeRegistrar', () => {
    let tr: ThemeRegistrar;

    const mockTheme = {
        name: 'mock',
        tokens: {
            colors: {
                primary: '#ff0000',
                secondary: '#00ff00',
                bg: '#ffffff',
                text: '#333333',
            },
            spacing: {
                xs: '4px',
                sm: '8px',
                md: '16px',
                lg: '24px',
            },
            radius: {
                sm: '2px',
                md: '4px',
            },
        },
    } as any as ThemeDefinition;

    beforeEach(() => {
        tr = ThemeRegistrar.getInstance();
        (tr as any).storage.clear();
        (tr as any)._current = undefined;
        tr.initEventBus(globalEventBus);
    });

    describe('getInstance', () => {
        it('should return singleton instance', () => {
            const instance1 = ThemeRegistrar.getInstance();
            const instance2 = ThemeRegistrar.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe('register', () => {
        it('should register a theme', () => {
            tr.register(mockTheme);
            expect((tr as any).storage.has('mock')).toBe(true);
        });

        it('should warn when theme has no name', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            tr.register({ name: '', tokens: {} } as any);
            expect(warnSpy).toHaveBeenCalled();
            warnSpy.mockRestore();
        });

        it('should overwrite existing theme with same name', () => {
            tr.register(mockTheme);
            const updated = { ...mockTheme, tokens: { ...mockTheme.tokens, colors: { primary: '#blue' } } } as any as ThemeDefinition;
            tr.register(updated);
            expect((tr as any).storage.get('mock').tokens.colors.primary).toBe('#blue');
        });
    });

    describe('unregister', () => {
        it('should remove a registered theme', () => {
            tr.register(mockTheme);
            tr.unregister('mock');
            expect((tr as any).storage.has('mock')).toBe(false);
        });
    });

    describe('apply', () => {
        it('should set current theme name', () => {
            tr.register(mockTheme);
            tr.apply('mock');
            expect(tr.current).toBe('mock');
        });

        it('should not change current if theme not found', () => {
            tr.apply('nonexistent');
            expect(tr.current).toBeUndefined();
        });

        it('should emit theme:change event via GlobalEventBus', () => {
            tr.register(mockTheme);
            const handler = jest.fn();
            globalEventBus.on(THEME_CHANGE_EVENT, handler);
            tr.apply('mock');
            expect(handler).toHaveBeenCalledWith({ previous: undefined, current: 'mock' });
        });

        it('should pass previous theme name in event', () => {
            const theme2 = { name: 'theme2', tokens: {} } as any as ThemeDefinition;
            tr.register(mockTheme);
            tr.register(theme2);
            tr.apply('mock');

            const handler = jest.fn();
            globalEventBus.on(THEME_CHANGE_EVENT, handler);
            tr.apply('theme2');
            expect(handler).toHaveBeenCalledWith({ previous: 'mock', current: 'theme2' });
        });

        it('should apply CSS variables to document root', () => {
            tr.register(mockTheme);
            tr.apply('mock');
            const root = document.documentElement;
            expect(root.style.getPropertyValue('--q-colors-primary')).toBe('#ff0000');
        });
    });

    describe('getToken', () => {
        it('should return token value by dot path', () => {
            tr.register(mockTheme);
            tr.apply('mock');
            expect(tr.getToken('colors.primary')).toBe('#ff0000');
            expect(tr.getToken('spacing.md')).toBe('16px');
        });

        it('should return undefined for unknown path', () => {
            tr.register(mockTheme);
            tr.apply('mock');
            expect(tr.getToken('colors.nonexistent')).toBeUndefined();
        });

        it('should return undefined when no theme applied', () => {
            expect(tr.getToken('colors.primary')).toBeUndefined();
        });
    });

    describe('toCSSVariables', () => {
        it('should generate CSS variable string', () => {
            tr.register(mockTheme);
            tr.apply('mock');
            const css = tr.toCSSVariables();
            expect(css).toContain(':root');
            expect(css).toContain('--q-colors-primary: #ff0000');
        });

        it('should return empty string when no theme applied', () => {
            expect(tr.toCSSVariables()).toBe('');
        });
    });

    describe('eventBus', () => {
        it('should not emit event when eventBus not initialized', () => {
            const noBusTr = ThemeRegistrar.getInstance();
            (noBusTr as any).storage.clear();
            (noBusTr as any)._current = undefined;
            // 不调用 initEventBus

            noBusTr.register(mockTheme);
            // 不应抛错，静默跳过
            expect(() => noBusTr.apply('mock')).not.toThrow();
        });
    });
});

describe('flattenTokens', () => {
    it('should flatten nested tokens with --q prefix', () => {
        const result = flattenTokens({ colors: { primary: '#ff0000' } });
        expect(result['--q-colors-primary']).toBe('#ff0000');
    });

    it('should handle custom prefix', () => {
        const result = flattenTokens({ colors: { primary: '#ff0000' } }, '--app');
        expect(result['--app-colors-primary']).toBe('#ff0000');
    });

    it('should handle primitive values at top level', () => {
        const result = flattenTokens({ fontSize: '14px' });
        expect(result['--q-fontSize']).toBe('14px');
    });

    it('should handle deeply nested tokens', () => {
        const result = flattenTokens({ a: { b: { c: 'deep' } } });
        expect(result['--q-a-b-c']).toBe('deep');
    });

    it('should handle numeric values', () => {
        const result = flattenTokens({ zIndex: { modal: 1060 } });
        expect(result['--q-zIndex-modal']).toBe(1060);
    });

    it('should handle null values gracefully', () => {
        const result = flattenTokens({ colors: { primary: null as any } });
        expect(result['--q-colors-primary']).toBeNull();
    });
});
