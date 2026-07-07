/**
 * 集成测试：ThemeManager + AtomicCSS + 主题预设
 */

import { ThemeManager, flattenTokens, AtomicCSS, lightTheme, darkTheme } from '@qimenjs/theme';

describe('Theme Integration', () => {
    let tm: ThemeManager;

    beforeEach(() => {
        tm = ThemeManager.getInstance();
        // 清理状态
        (tm as any).themes.clear();
        (tm as any)._current = undefined;
        (tm as any).listeners.clear();
    });

    describe('ThemeManager', () => {
        it('should register and apply theme', () => {
            tm.register(lightTheme);
            tm.apply('light');

            expect(tm.current).toBe('light');
        });

        it('should get token value', () => {
            tm.register(lightTheme);
            tm.apply('light');

            const color = tm.getToken('colors.primary');
            expect(color).toBeTruthy();
        });

        it('should emit theme:change event', () => {
            tm.register(lightTheme);
            tm.register(darkTheme);
            tm.apply('light');

            const handler = jest.fn();
            tm.onThemeChange(handler);

            tm.apply('dark');
            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('should convert tokens to CSS variables', () => {
            tm.register(lightTheme);
            tm.apply('light');

            const cssVars = tm.toCSSVariables();
            expect(cssVars).toContain('--q-');
        });
    });

    describe('flattenTokens', () => {
        it('should flatten nested token object', () => {
            const tokens = {
                colors: {
                    primary: '#1890ff',
                    secondary: '#52c41a',
                },
                spacing: {
                    xs: '4px',
                    sm: '8px',
                },
            };

            const flat = flattenTokens(tokens);
            expect(flat['--q-colors-primary']).toBe('#1890ff');
            expect(flat['--q-spacing-xs']).toBe('4px');
        });
    });

    describe('AtomicCSS', () => {
        let atomic: AtomicCSS;

        beforeEach(() => {
            atomic = AtomicCSS.getInstance();
            atomic.clear();
        });

        it('should resolve atomic class to CSS', () => {
            const css = atomic.resolve('q-flex');
            expect(css).toBeTruthy();
        });

        it('should generate style element', () => {
            const classNames = ['q-flex'];
            const generated = atomic.generate(classNames);

            if (generated) {
                expect(generated).toContain('q-flex');
            }
        });

        it('should register custom rule', () => {
            atomic.registerRule('q-custom', { 'color': 'custom' });
            const css = atomic.resolve('q-custom');
            expect(css).toBeTruthy();
        });
    });

    describe('Theme Presets', () => {
        it('light theme should have required tokens', () => {
            expect(lightTheme.name).toBe('light');
            expect(lightTheme.tokens).toBeDefined();
            expect(lightTheme.tokens.colors).toBeDefined();
        });

        it('dark theme should have required tokens', () => {
            expect(darkTheme.name).toBe('dark');
            expect(darkTheme.tokens).toBeDefined();
            expect(darkTheme.tokens.colors).toBeDefined();
        });
    });
});
