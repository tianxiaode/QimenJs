import { RegistrarBase } from '@qimenjs/registry';
import { RegistrarNotFoundError } from '@qimenjs/registry';
import { THEME_CHANGE_EVENT } from './types';
import type { ThemeDefinition, ThemeChangeEvent, DesignTokens } from './types';
import type { GlobalEventBus } from '@qimenjs/events';

/**
 * 主题注册器名称
 */
export const ThemeRegistrarName = 'theme' as const;

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
 * 主题注册器
 *
 * 继承 RegistrarBase，统一管理主题的注册、切换和 CSS 变量输出。
 * 主题切换通过更新 `:root` 上的 CSS 变量实现，零 JS 开销。
 * 主题变更时通过 GlobalEventBus 触发 theme:change 事件，
 * 组件的 ThemeAbility 监听此事件后自行响应。
 *
 * @example
 * ```typescript
 * const tr = ThemeRegistrar.getInstance();
 * tr.initEventBus(globalEventBus);
 * tr.register(lightTheme);
 * tr.register(darkTheme);
 * tr.apply('dark');
 * ```
 */
export class ThemeRegistrar extends RegistrarBase<Map<string, ThemeDefinition>> {
    public readonly name = ThemeRegistrarName;
    protected storage = new Map<string, ThemeDefinition>();

    /** 当前主题名 */
    private _current: string | undefined;

    /** 全局事件总线 */
    private eventBus?: GlobalEventBus;

    /**
     * 当前主题名
     */
    get current(): string | undefined {
        return this._current;
    }

    /**
     * 注入全局事件总线
     *
     * 必须在 apply 之前调用，否则主题变更不会触发事件。
     * 由于 RegistrarBase 单例模式要求无参构造，EventBus 通过此方法注入。
     *
     * @param eventBus - 全局事件总线实例
     */
    initEventBus(eventBus: GlobalEventBus): void {
        this.eventBus = eventBus;
    }

    /**
     * 注册主题
     *
     * @param theme - 主题定义
     */
    register(theme: ThemeDefinition): void {
        this.checkLock();
        if (!theme.name || typeof theme.name !== 'string') {
            console.warn('ThemeRegistrar: theme.name must be a non-empty string');
            return;
        }
        this.storage.set(theme.name, theme);
    }

    /**
     * 注销主题
     *
     * @param name - 主题名称
     */
    unregister(name: string): void {
        this.checkLock();
        this.storage.delete(name);
    }

    /**
     * 获取主题定义
     *
     * @param name - 主题名称
     * @returns 主题定义，未找到抛出错误
     * @throws RegistrarNotFoundError
     */
    get(name: string): ThemeDefinition {
        const theme = this.storage.get(name);
        if (!theme) {
            throw new RegistrarNotFoundError(this.name, name);
        }
        return theme;
    }

    /**
     * 检查主题是否已注册
     */
    has(name: string): boolean {
        return this.storage.has(name);
    }

    /**
     * 应用主题
     *
     * 将主题的 Design Tokens 扁平化为 CSS 变量并更新到 `:root`，
     * 然后通过 GlobalEventBus 触发 theme:change 事件。
     *
     * @param name - 主题名称
     */
    apply(name: string): void {
        const theme = this.storage.get(name);
        if (!theme) return;

        const previous = this._current;
        this._current = name;

        // 扁平化 tokens 并更新 CSS 变量
        const variables = flattenTokens(theme.tokens as Record<string, any>);
        this.applyCSSVariables(variables);

        // 触发主题变更事件
        this.emitChange({ previous, current: name });
    }

    /**
     * 获取令牌值
     *
     * @param path - 令牌路径，如 'colors.primary' 或 'spacing.md'
     * @returns 令牌值，未找到返回 undefined
     */
    getToken(path: string): string | number | undefined {
        if (!this._current) return undefined;
        const theme = this.storage.get(this._current);
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
        const theme = this.storage.get(this._current);
        if (!theme) return '';

        const variables = flattenTokens(theme.tokens as Record<string, any>);
        const lines = Object.entries(variables)
            .map(([key, value]) => `  ${key}: ${value};`)
            .join('\n');

        return `:root {\n${lines}\n}`;
    }

    /**
     * 触发主题变更事件
     */
    private emitChange(payload: ThemeChangeEvent): void {
        this.eventBus?.emit(THEME_CHANGE_EVENT, payload);
    }

    /**
     * 将 CSS 变量应用到 document.documentElement
     */
    private applyCSSVariables(variables: Record<string, string | number>): void {
        if (typeof document === 'undefined') return;

        const root = document.documentElement;
        for (const [key, value] of Object.entries(variables)) {
            root.style.setProperty(key, String(value));
        }
    }

    /**
     * 输出注册器的状态信息
     */
    protected doInspect(): void {
        const entries: Record<string, { tokens: number; current: boolean }> = {};
        for (const [name, theme] of this.storage) {
            entries[name] = {
                tokens: Object.keys(flattenTokens(theme.tokens as Record<string, any>)).length,
                current: name === this._current,
            };
        }
        console.table(entries);
    }
}
