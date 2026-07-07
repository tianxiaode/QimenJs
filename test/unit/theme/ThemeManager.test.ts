/**
 * 单元测试：ThemeManager
 */

import { ThemeManager, flattenTokens } from '@qimenjs/theme';
import type { ThemeDefinition } from '@qimenjs/theme';

describe('ThemeManager', () => {
    let tm: ThemeManager;

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
        tm = ThemeManager.getInstance();
        (tm as any).themes.clear();
        (tm as any)._current = undefined;
        (tm as any).listeners.clear();
    });

    describe('getInstance', () => {
        it('should return singleton instance', () => {
            const instance1 = ThemeManager.getInstance();
            const instance2 = ThemeManager.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe('register', () => {
        it('should register a theme', () => {
            tm.register(mockTheme);
            expect((tm as any).themes.has('mock')).toBe(true);
        });

        it('should warn when theme has no name', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
            tm.register({ name: '', tokens: {} } as any);
            expect(warnSpy).toHaveBeenCalled();
            warnSpy.mockRestore();
        });

        it('should overwrite existing theme with same name', () => {
            tm.register(mockTheme);
            const updated = { ...mockTheme, tokens: { ...mockTheme.tokens, colors: { primary: '#blue' } } } as any as ThemeDefinition;
            tm.register(updated);
            expect((tm as any).themes.get('mock').tokens.colors.primary).toBe('#blue');
        });
    });

    describe('unregister', () => {
        it('should remove a registered theme', () => {
            tm.register(mockTheme);
            tm.unregister('mock');
            expect((tm as any).themes.has('mock')).toBe(false);
        });
    });

    describe('apply', () => {
        it('should set current theme name', () => {
            tm.register(mockTheme);
            tm.apply('mock');
            expect(tm.current).toBe('mock');
        });

        it('should not change current if theme not found', () => {
            tm.apply('nonexistent');
            expect(tm.current).toBeUndefined();
        });

        it('should notify listeners on theme change', () => {
            tm.register(mockTheme);
            const handler = jest.fn();
            tm.onThemeChange(handler);
            tm.apply('mock');
            expect(handler).toHaveBeenCalledWith({ previous: undefined, current: 'mock' });
        });

        it('should pass previous theme name in event', () => {
            const theme2 = { name: 'theme2', tokens: {} } as any as ThemeDefinition;
            tm.register(mockTheme);
            tm.register(theme2);
            tm.apply('mock');

            const handler = jest.fn();
            tm.onThemeChange(handler);
            tm.apply('theme2');
            expect(handler).toHaveBeenCalledWith({ previous: 'mock', current: 'theme2' });
        });

        it('should apply CSS variables to document root', () => {
            tm.register(mockTheme);
            tm.apply('mock');
            const root = document.documentElement;
            expect(root.style.getPropertyValue('--q-colors-primary')).toBe('#ff0000');
        });
    });

    describe('getToken', () => {
        it('should return token value by dot path', () => {
            tm.register(mockTheme);
            tm.apply('mock');
            expect(tm.getToken('colors.primary')).toBe('#ff0000');
            expect(tm.getToken('spacing.md')).toBe('16px');
        });

        it('should return undefined for unknown path', () => {
            tm.register(mockTheme);
            tm.apply('mock');
            expect(tm.getToken('colors.nonexistent')).toBeUndefined();
        });

        it('should return undefined when no theme applied', () => {
            expect(tm.getToken('colors.primary')).toBeUndefined();
        });
    });

    describe('toCSSVariables', () => {
        it('should generate CSS variable string', () => {
            tm.register(mockTheme);
            tm.apply('mock');
            const css = tm.toCSSVariables();
            expect(css).toContain(':root');
            expect(css).toContain('--q-colors-primary: #ff0000');
        });

        it('should return empty string when no theme applied', () => {
            expect(tm.toCSSVariables()).toBe('');
        });
    });

    describe('onThemeChange', () => {
        it('should return unsubscribe function', () => {
            tm.register(mockTheme);
            const handler = jest.fn();
            const off = tm.onThemeChange(handler);

            tm.apply('mock');
            expect(handler).toHaveBeenCalledTimes(1);

            off();
            tm.apply('mock'); // re-apply same theme won't trigger
            // handler still called once because apply same theme still fires
        });

        it('should not call removed listener', () => {
            const theme2 = { name: 'theme2', tokens: {} } as any as ThemeDefinition;
            tm.register(mockTheme);
            tm.register(theme2);
            tm.apply('mock');

            const handler = jest.fn();
            const off = tm.onThemeChange(handler);
            off();

            tm.apply('theme2');
            expect(handler).not.toHaveBeenCalled();
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
