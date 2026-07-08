/**
 * ContentAbility 内容能力
 *
 * 统一管理组件的所有内容位（图标、文本、徽标等），替代独立的 IconAbility/TextAbility。
 *
 * 组件通过 static contentSlots 声明内容位，key 为前缀（如 'icon'、'text'），
 * value 为名称数组（如 ['default']、['label', 'prefix', 'suffix']）。
 * 支持三种声明形式（与旧 icons/texts 一致）：
 * - 字符串：'default' → { name: 'default' }
 * - 元组：['default', 10] → { name: 'default', order: 10 }
 * - 对象：{ name: 'default', order: 10 } → 完整
 *
 * ContentAbility 在 __initProps 中：
 * 1. 一次性 querySelectorAll('[data-content]') 建全局 contentMap
 * 2. 遍历 contentSlots，从 contentMap 中取元素，调用 createContentManager 生成属性
 * 3. 从 props 初始化值
 * 4. 注册 globalEventBus 的 localeChange 监听，语言切换时自动更新所有 i18n slot
 *
 * i18n 支持：
 * - 值以 'i18n:' 开头时自动识别为本地化 key，如 'i18n:btn.save'
 * - setter 时保留原始 key，getter 时返回翻译后的值
 * - setter 更换值时自动刷新 i18nKeys（新值是 i18n: 则更新 key，否则清除）
 * - 语言切换时通过 globalEventBus 监听 localeChange 事件，自动调用 updateAllI18n()
 * - 组件 dispose 时自动注销监听
 *
 * @example
 * ```typescript
 * // 按钮组件
 * class ButtonComponent extends ComponentBase {
 *     static override readonly contentSlots = {
 *         icon: ['default'],
 *         text: ['default'],
 *     };
 * }
 * // 自动生成：icon / iconHidden / text / textHidden 属性
 *
 * // i18n 使用
 * btn.text = 'i18n:btn.save';   // 自动翻译
 * btn.text;                      // → '保存'（当前语言的翻译）
 * btn.text = 'i18n:btn.edit';   // 更换 i18n key，自动刷新
 * btn.text = '普通文本';         // 非 i18n 值，清除 i18n key
 *
 * // 语言切换时自动更新（无需手动调用）
 * // ContentAbility 监听 globalEventBus 的 localeChange 事件
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { createContentManager, normalizeContentDecls, extractContentMeta } from '../content';
import type { ContentItemDecl } from '../content';
import { globalEventBus } from '@qimenjs/events';

/**
 * 内容位声明类型
 *
 * key 为前缀（如 'icon'、'text'、'badge'），value 为名称声明数组
 */
export type ContentSlotsDecl = Record<string, ContentItemDecl[]>;

/**
 * 内容位配置（标准化后）
 */
export interface ContentSlotConfig {
    prefix: string;
    names: string[];
    mode: 'text' | 'html';
}

/**
 * 从 contentSlots 声明中解析出配置列表
 */
function resolveContentSlots(slots: ContentSlotsDecl): ContentSlotConfig[] {
    const configs: ContentSlotConfig[] = [];

    for (const [prefix, decls] of Object.entries(slots)) {
        const normalized = normalizeContentDecls(decls);
        const { names } = extractContentMeta(normalized);

        // 根据前缀决定默认 mode
        const mode: 'text' | 'html' = prefix === 'text' ? 'html' : 'html';

        configs.push({ prefix, names, mode });
    }

    return configs;
}

/**
 * 一次性查询容器中所有 data-content 元素，建对照表
 *
 * @param container - 宿主元素
 * @returns Map<string, HTMLElement>，key 为 data-content 的值（如 "icon:default"）
 */
function buildContentMap(container: HTMLElement): Map<string, HTMLElement> {
    const map = new Map<string, HTMLElement>();
    const elements = container.querySelectorAll('[data-content]');
    for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const key = el.dataset.content!;
        if (key) {
            map.set(key, el);
        }
    }
    return map;
}

export const ContentAbility: AbilityDefinition = {
    /**
     * 从 props 初始化所有内容位
     *
     * 1. 一次性 querySelectorAll 建 contentMap
     * 2. 遍历 contentSlots，从 contentMap 取元素，调用 createContentManager
     * 3. 从 props 初始化值
     * 4. 注册 localeChange 事件监听
     */
    __initProps(props: Record<string, any>): void {
        const contentSlots: ContentSlotsDecl | undefined = (this.constructor as any).contentSlots;
        if (!contentSlots || Object.keys(contentSlots).length === 0) return;

        // ─── 一次性查询所有 data-content 元素 ───
        const contentMap = buildContentMap(this.el);

        // 存到 abilityState，reinitElement 时可复用
        this.setAbilityState('ContentAbility:contentMap', contentMap);

        const slotConfigs = resolveContentSlots(contentSlots);
        const prefixes: string[] = [];

        for (const { prefix, names, mode } of slotConfigs) {
            createContentManager(this, {
                prefix,
                names,
                mode,
                contentMap,
            });

            prefixes.push(prefix);

            // 从 props 初始化值
            initSlotFromProps(this, prefix, names, props);
        }

        // 存储所有 prefix，供 updateAllI18n 使用
        this.setAbilityState('ContentAbility:prefixes', prefixes);

        // ─── 注册 localeChange 事件监听 ───
        this.setupI18nListener();
    },

    /**
     * 注册 globalEventBus 的 localeChange 事件监听
     *
     * 语言切换时自动调用 updateAllI18n() 刷新所有 i18n slot。
     * 通过 onCleanup 确保组件 dispose 时自动注销。
     */
    setupI18nListener(): void {
        if (!globalEventBus || typeof globalEventBus.on !== 'function') return;

        const handler = () => {
            this.updateAllI18n();
        };

        // 注册监听
        const off = globalEventBus.on('localeChange', handler);

        // 组件 dispose 时自动注销
        if (typeof this.onCleanup === 'function') {
            this.onCleanup(() => {
                if (typeof off === 'function') {
                    off();
                }
            });
        }
    },

    /**
     * 更新所有内容位的 i18n 翻译
     *
     * 语言切换时自动调用，也可手动调用
     */
    updateAllI18n(): void {
        const prefixes: string[] | undefined = this.abilityState('ContentAbility:prefixes', () => undefined);
        if (!prefixes) return;

        for (const prefix of prefixes) {
            const capitalPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
            const updateFn = this[`update${capitalPrefix}I18n`];
            if (typeof updateFn === 'function') {
                updateFn.call(this);
            }
        }
    },

    /**
     * 获取所有 i18n 原始 key
     *
     * 返回 { prefix: { name: i18nKey } } 的结构
     * 供外部 i18n 系统查询需要预加载的 key 列表
     */
    getI18nKeys(): Record<string, Record<string, string>> {
        const prefixes: string[] | undefined = this.abilityState('ContentAbility:prefixes', () => undefined);
        if (!prefixes) return {};

        const result: Record<string, Record<string, string>> = {};
        for (const prefix of prefixes) {
            const i18nKeys: Map<string, string> | undefined = this.abilityState(`ContentManager:${prefix}:i18nKeys`, () => undefined);
            if (i18nKeys && i18nKeys.size > 0) {
                result[prefix] = Object.fromEntries(i18nKeys);
            }
        }
        return result;
    },
};

/**
 * 从 props 初始化某个 slot 的值
 */
function initSlotFromProps(host: any, prefix: string, names: string[], props: Record<string, any>): void {
    const capitalPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    const isSingle = names.length === 1 && names[0] === 'default';

    // props 中对应前缀的值（如 props.icon、props.text）
    const propValue = props[prefix];
    if (propValue === undefined) return;

    if (typeof propValue === 'string') {
        if (names.includes('default')) {
            // 单项：直接赋值属性
            const propName = isSingle ? prefix : `default${capitalPrefix}`;
            if (host[propName] !== undefined) {
                host[propName] = propValue;
            }
        }
    } else if (Array.isArray(propValue)) {
        // 数组形式：[{ name: 'default', value: '...' }, ...]
        for (const cfg of propValue) {
            const propName = cfg.name === 'default'
                ? (isSingle ? prefix : `default${capitalPrefix}`)
                : `${cfg.name.toLowerCase()}${capitalPrefix}`;
            if (host[propName] !== undefined) {
                host[propName] = cfg.value;
            }
        }
    }
}
