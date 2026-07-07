/**
 * 主题管理器
 *
 * 负责主题注册、切换、CSS 变量输出和变更通知。
 * 主题切换通过更新 `:root` 上的 CSS 变量实现，零 JS 开销。
 *
 * @example
 * ```typescript
 * const tm = ThemeManager.getInstance();
 * tm.register(lightTheme);
 * tm.register(darkTheme);
 * tm.apply('dark');
 * ```
 */

import type {
    ThemeDefinition,
    ThemeChangeEvent,
    ThemeChangeHandler,
} from './types';

/**
 * 将嵌套的 DesignTokens 扁平化为 CSS 变量映射
 *
 * 例如：{ colors: { primary: '#1890ff' } } → { '--q-colors-primary': '#1890ff' }
 *
 * @param tokens - 设计令牌集合
 * @param prefix - CSS 变量前缀，默认为 '--q'
 * @returns 扁平化的 CSS 变量映射
 */
export function flattenTokens(
    tokens: Record<string, any>,
    prefix: string = '--q'
): Record<string, string | number> {
    const result: Record<string, string | number> = {};

    for (const [category, value] of Object.entries(tokens)) {
        if (value !== null && typeof value === 'object') {
            const nested = flattenTokens(value, `${prefix}-${category}`);
            Object.assign(result, nested);
        } else {
            result[`${prefix}-${category}`] = value;
        }
    }

    return result;
}

/**
 * 主题管理器
 *
 * 单例模式，管理主题注册、切换和 CSS 变量输出
 */
export class ThemeManager {
    private static instance: ThemeManager;

    /** 已注册的主题映射 */
    private readonly themes = new Map<string, ThemeDefinition>();

    /** 当前主题名 */
    private _current: string | undefined;

    /** 主题变更监听器 */
    private readonly listeners = new Set<ThemeChangeHandler>();

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): ThemeManager {
        if (!ThemeManager.instance) {
            ThemeManager.instance = new ThemeManager();
        }
        return ThemeManager.instance;
    }

    /**
     * 当前主题名
     */
    get current(): string | undefined {
        return this._current;
    }

    /**
     * 注册主题
     *
     * @param theme - 主题定义
     */
    register(theme: ThemeDefinition): void {
        if (!theme.name || typeof theme.name !== 'string') {
            console.warn('ThemeManager: theme.name must be a non-empty string');
            return;
        }
        this.themes.set(theme.name, theme);
    }

    /**
     * 注销主题
     *
     * @param name - 主题名称
     */
    unregister(name: string): void {
        this.themes.delete(name);
    }

    /**
     * 应用主题
     *
     * 将主题的 Design Tokens 扁平化为 CSS 变量并更新到 `:root`，
     * 然后通知所有监听器。
     *
     * @param name - 主题名称
     */
    apply(name: string): void {
        const theme = this.themes.get(name);
        if (!theme) {
            // 主题未注册，静默返回
            return;
        }

        const previous = this._current;
        this._current = name;

        // 扁平化 tokens 并更新 CSS 变量
        const variables = flattenTokens(theme.tokens as Record<string, any>);
        this.applyCSSVariables(variables);

        // 通知监听器
        const event: ThemeChangeEvent = { previous, current: name };
        this.listeners.forEach(handler => {
            try {
                handler(event);
            } catch (e) {
                console.error('ThemeManager: theme change handler error', e);
            }
        });
    }

    /**
     * 获取令牌值
     *
     * @param path - 令牌路径，如 'colors.primary' 或 'spacing.md'
     * @returns 令牌值，未找到返回 undefined
     */
    getToken(path: string): string | number | undefined {
        if (!this._current) return undefined;
        const theme = this.themes.get(this._current);
        if (!theme) return undefined;

        const parts = path.split('.');
        let current: any = theme.tokens;
        for (const part of parts) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return undefined;
            }
            current = current[part];
        }
        return current;
    }

    /**
     * 生成 CSS 变量样式文本
     *
     * @returns CSS 变量样式文本，如 ':root { --q-colors-primary: #1890ff; ... }'
     */
    toCSSVariables(): string {
        if (!this._current) return '';
        const theme = this.themes.get(this._current);
        if (!theme) return '';

        const variables = flattenTokens(theme.tokens as Record<string, any>);
        const lines = Object.entries(variables)
            .map(([key, value]) => `  ${key}: ${value};`)
            .join('\n');

        return `:root {\n${lines}\n}`;
    }

    /**
     * 监听主题变更
     *
     * @param handler - 变更监听器
     * @returns 取消监听函数
     */
    onThemeChange(handler: ThemeChangeHandler): () => void {
        this.listeners.add(handler);
        return () => {
            this.listeners.delete(handler);
        };
    }

    /**
     * 将 CSS 变量应用到 document.documentElement
     *
     * @param variables - CSS 变量映射
     */
    private applyCSSVariables(variables: Record<string, string | number>): void {
        if (typeof document === 'undefined') return;

        const root = document.documentElement;
        for (const [key, value] of Object.entries(variables)) {
            root.style.setProperty(key, String(value));
        }
    }
}
