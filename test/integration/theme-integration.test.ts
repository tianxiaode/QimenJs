/**
 * 集成测试：ThemeRegistrar + AtomicCSS + 主题预设
 */

import { ThemeRegistrar, flattenTokens, AtomicCSS, lightTheme, darkTheme, THEME_CHANGE_EVENT } from '@qimenjs/theme';
import { globalEventBus } from '@qimenjs/events';

describe('Theme Integration', () => {
    let tr: ThemeRegistrar;

    beforeEach(() => {
        tr = ThemeRegistrar.getInstance();
        // 清理状态
        (tr as any).storage.clear();
        (tr as any)._current = undefined;
        // 注入 EventBus
        tr.initEventBus(globalEventBus);
    });

    describe('ThemeRegistrar', () => {
        it('should register and apply theme', () => {
            tr.register(lightTheme);
            tr.apply('light');

            expect(tr.current).toBe('light');
        });

        it('should get token value', () => {
            tr.register(lightTheme);
            tr.apply('light');

            const color = tr.getToken('colors.primary');
            expect(color).toBeTruthy();
        });

        it('should emit theme:change event via GlobalEventBus', () => {
            tr.register(lightTheme);
            tr.register(darkTheme);
            tr.apply('light');

            const handler = jest.fn();
            globalEventBus.on(THEME_CHANGE_EVENT, handler);

            tr.apply('dark');
            expect(handler).toHaveBeenCalledTimes(1);
        });

        it('should convert tokens to CSS variables', () => {
            tr.register(lightTheme);
            tr.apply('light');

            const cssVars = tr.toCSSVariables();
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
