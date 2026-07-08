/**
 * createContentManager 内容属性工厂方法
 *
 * 根据 names 数组为宿主组件生成内容管理属性。不创建/操作 DOM 元素。
 *
 * 职责：
 * - 从 contentMap（由调用方一次性 querySelectorAll 生成）中提取元素，存入 elMap
 * - 生成 getter/setter 属性绑定到 host（[name][Prefix] / [name]Hidden）
 * - 生成 class 操作方法（setClass / removeClass）
 * - 支持 i18n: 前缀标记，保留原始 key 用于本地化查询
 *
 * 不负责：
 * - 查询 DOM（由 ContentAbility 一次性 querySelectorAll 完成）
 * - 创建 DOM 元素（由组件模板负责）
 * - 注入内层标签（由组件模板负责）
 * - 控制 DOM 顺序（由组件模板负责）
 *
 * @example
 * ```typescript
 * // 单内容项
 * createContentManager(this, {
 *     prefix: 'icon',
 *     names: ['default'],
 *     mode: 'html',
 *     contentMap,
 * });
 * // 自动在 host 上生成：icon / iconHidden 属性
 *
 * // 多内容项
 * createContentManager(this, {
 *     prefix: 'text',
 *     names: ['label', 'prefix', 'suffix', 'error', 'hint'],
 *     mode: 'html',
 *     contentMap,
 * });
 * // 自动在 host 上生成：labelText / labelHidden / prefixText / prefixHidden / ... 属性
 * ```
 */

import { I18N_PREFIX, getI18nManager } from '@qimenjs/i18n';
import { OVERLAY_PREFIXES } from './ContentPrefix';
import { createOverlayManager } from './createOverlayManager';

// 重导出，保持向后兼容
export { I18N_PREFIX } from '@qimenjs/i18n';

/**
 * 翻译 i18n key
 *
 * 从 window.__qimen_i18n__ 获取 i18n 单例翻译，不可用时返回原始 key
 */
function translateI18nKey(i18nKey: string): string {
    const i18n = getI18nManager();
    if (!i18n) return i18nKey;
    return i18n.t(i18nKey) || i18nKey;
}

/**
 * 内容管理器配置
 */
export interface ContentManagerConfig {
    /** 内容项前缀，如 'icon' | 'text' | 'tab' */
    prefix: string;
    /** 内容项名称列表，如 ['default'] | ['label', 'prefix', 'suffix'] */
    names: string[];
    /** 渲染模式：text 用 textContent，html 用 innerHTML */
    mode: 'text' | 'html';
    /**
     * 全局内容元素对照表（key 为 "prefix:name"，value 为 HTMLElement）
     * 由 ContentAbility 一次性 querySelectorAll('[data-content]') 生成
     */
    contentMap: Map<string, HTMLElement>;
}

/**
 * 创建内容管理器
 *
 * @param host - 宿主组件实例
 * @param config - 配置
 */
export function createContentManager(host: any, config: ContentManagerConfig): void {
    let { prefix, names, mode, contentMap } = config;
    const capitalPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    const isSingle = names.length === 1 && names[0] === 'default';

    // ─── 浮层前缀检测：若为浮层类型，调用 createOverlayManager 创建浮层 DOM ───

    if (OVERLAY_PREFIXES.has(prefix)) {
        const result = createOverlayManager(host, { prefix });
        if (result) {
            // 合并浮层 contentMap 到宿主 contentMap
            for (const [key, el] of result.contentMap) {
                contentMap.set(key, el);
            }
            // 记录浮层 DOM 到 abilityState
            host.setAbilityState(`ContentManager:${prefix}:overlayEl`, result.overlayEl);
        }
    }

    // ─── 从 contentMap 中提取当前 prefix 的元素，存入 elMap ───

    const elMap = new Map<string, HTMLElement>();

    for (const name of names) {
        const key = `${prefix}:${name}`;
        const el = contentMap.get(key);
        if (el) {
            elMap.set(name, el);
        } else {
            // 模板中缺少对应的 data-content 元素，输出警告
            if (host.logger) {
                host.logger.warn(`ContentManager: element [data-content="${key}"] not found in template`, {
                    prefix, name, component: host.constructor?.name,
                });
            }
        }
    }

    // 存到 abilityState，dispose 时自动释放
    host.setAbilityState(`ContentManager:${prefix}:elMap`, elMap);

    // ─── i18n 原始 key 存储 ───
    // key: name, value: i18n key（如 'btn.save'），非 i18n 值不存储
    const i18nKeys = new Map<string, string>();
    host.setAbilityState(`ContentManager:${prefix}:i18nKeys`, i18nKeys);

    // ─── 核心操作（直接引用） ───

    const getEl = (name: string): HTMLElement | null => elMap.get(name) ?? null;

    const resolveI18n = (name: string, value: string): string => {
        if (value.startsWith(I18N_PREFIX)) {
            const i18nKey = value.slice(I18N_PREFIX.length);
            i18nKeys.set(name, i18nKey);
            // 翻译并返回
            return translateI18nKey(i18nKey);
        } else {
            // 非 i18n 值，清除之前的 key
            i18nKeys.delete(name);
            return value;
        }
    };

    const setValue = (name: string, value: string) => {
        const el = getEl(name);
        if (!el) return host;
        const resolved = resolveI18n(name, value);
        if (mode === 'text') el.textContent = resolved;
        else el.innerHTML = resolved;
        host.markDirty?.();
        return host;
    };

    const getValue = (name: string): string => {
        const el = getEl(name);
        if (!el) return '';
        return mode === 'text' ? (el.textContent || '') : el.innerHTML;
    };

    const addItemClass = (name: string, className: string) => {
        const el = getEl(name);
        if (el) el.classList.add(className);
        return host;
    };

    const removeItemClass = (name: string, className: string) => {
        const el = getEl(name);
        if (el) el.classList.remove(className);
        return host;
    };

    // ─── 生成属性 ───

    for (const name of names) {
        const capitalName = name.charAt(0).toUpperCase() + name.slice(1);

        // 内容属性名：单项 default 用 prefix，多内容项用 name + Prefix
        const contentPropName = isSingle ? prefix : `${name.toLowerCase()}${capitalPrefix}`;
        // hidden 属性名
        const hiddenPropName = `${contentPropName}Hidden`;

        // 内容 getter/setter 属性
        Object.defineProperty(host, contentPropName, {
            get: () => getValue(name),
            set: (v: string) => setValue(name, v),
            configurable: true,
            enumerable: true,
        });

        // hidden getter/setter 属性
        Object.defineProperty(host, hiddenPropName, {
            get: () => getEl(name)?.hidden ?? false,
            set: (v: boolean) => {
                const el = getEl(name);
                if (el) el.hidden = v;
            },
            configurable: true,
            enumerable: true,
        });

        // class 操作方法（html 模式）
        if (mode === 'html') {
            host[`set${capitalName}${capitalPrefix}Class`] = (className: string) => addItemClass(name, className);
            host[`remove${capitalName}${capitalPrefix}Class`] = (className: string) => removeItemClass(name, className);
        }
    }

    // ─── i18n 批量更新方法 ───

    /**
     * 更新当前 prefix 下所有 i18n slot 的翻译
     * 语言切换时由 ContentAbility 统一调用
     */
    host[`update${capitalPrefix}I18n`] = () => {
        for (const [name, i18nKey] of i18nKeys) {
            const el = getEl(name);
            if (!el) continue;
            const translated = translateI18nKey(i18nKey);
            if (mode === 'text') el.textContent = translated;
            else el.innerHTML = translated;
        }
    };
}
