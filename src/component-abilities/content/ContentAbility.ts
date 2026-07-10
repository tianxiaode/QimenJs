/**
 * ContentAbility 内容能力
 *
 * 统一管理组件的浮层内容位（dropdown、popover 等）。
 *
 * 组件通过 static contentSlots 声明内容位，key 为前缀（如 'dropdown'、'popover'），
 * value 为名称声明数组（如 ['default']）。
 *
 * 基础内容属性（icon/text 等）已由 NodeMapAbility 的 buildNodeMap 在模板扫描阶段生成，
 * i18n 刷新已由 NodeMapAbility 的 data-i18n + refreshI18n 统一处理，
 * tooltip 浮层已由 OverlayAbility 的 initTooltipOverlay 配置驱动。
 *
 * ContentAbility 只负责：
 * - 检测浮层前缀（dropdown/popover），调用 OverlayAbility.createOverlay 创建浮层
 * - 从 props 初始化浮层内容
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { OVERLAY_PREFIXES } from './ContentPrefix';

// ─── 内容位声明标准化（原 normalize.ts，内联） ───

/**
 * 内容项声明 — 支持三种形式
 */
export type ContentItemDecl = string | [string, number?] | { name: string; order?: number };

/**
 * 标准化后的内容项配置
 */
export interface ContentItemConfig {
    name: string;
    order?: number;
}

/**
 * 标准化内容项声明
 */
export function normalizeContentDecls(decls: ContentItemDecl[]): ContentItemConfig[] {
    return decls.map(decl => {
        if (typeof decl === 'string') return { name: decl };
        if (Array.isArray(decl)) return { name: decl[0], order: decl[1] };
        return { name: decl.name, order: decl.order };
    });
}

/**
 * 从标准化配置中提取 names 数组
 */
export function extractContentMeta(configs: ContentItemConfig[]): { names: string[]; positions: Record<string, number | undefined> } {
    const positions: Record<string, number | undefined> = {};
    for (const c of configs) {
        positions[c.name] = c.order;
    }
    return { names: configs.map(c => c.name), positions };
}

// ─── ContentAbility ───

/**
 * 内容位声明类型
 *
 * key 为前缀（如 'dropdown'、'popover'），value 为名称声明数组
 */
export type ContentSlotsDecl = Record<string, ContentItemDecl[]>;

/**
 * 从 contentSlots 声明中解析出配置列表
 */
function resolveContentSlots(slots: ContentSlotsDecl): Array<{ prefix: string; names: string[] }> {
    const configs: Array<{ prefix: string; names: string[] }> = [];

    for (const [prefix, decls] of Object.entries(slots)) {
        const normalized = normalizeContentDecls(decls);
        const { names } = extractContentMeta(normalized);
        configs.push({ prefix, names });
    }

    return configs;
}

export const ContentAbility: AbilityDefinition = {
    /**
     * 从 props 初始化浮层内容位
     *
     * 只处理浮层前缀（dropdown/popover）的 contentSlot，
     * 基础内容属性和 i18n 已由 NodeMapAbility 处理，
     * 浮层创建由 OverlayAbility.createOverlay 处理。
     */
    __initProps(props: Record<string, any>): void {
        const contentSlots: ContentSlotsDecl | undefined = (this.constructor as any).contentSlots;
        if (!contentSlots || Object.keys(contentSlots).length === 0) return;

        const slotConfigs = resolveContentSlots(contentSlots);

        for (const { prefix, names } of slotConfigs) {
            // 只处理浮层前缀，非浮层前缀已由 NodeMapAbility 处理
            if (!OVERLAY_PREFIXES.has(prefix)) continue;

            // tips 已由 OverlayAbility.initTooltipOverlay 配置驱动处理
            if (prefix === 'tips') continue;

            // 调用 OverlayAbility.createOverlay 创建浮层
            if (typeof this.createOverlay === 'function') {
                this.createOverlay({ prefix });
            }

            // 从 props 初始化浮层内容
            initSlotFromProps(this, prefix, names, props);
        }
    },
};

/**
 * 从 props 初始化某个 slot 的值
 */
function initSlotFromProps(host: any, prefix: string, names: string[], props: Record<string, any>): void {
    const capitalPrefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    const isSingle = names.length === 1 && names[0] === 'default';

    const propValue = props[prefix];
    if (propValue === undefined) return;

    if (typeof propValue === 'string') {
        if (names.includes('default')) {
            const propName = isSingle ? prefix : `default${capitalPrefix}`;
            if (host[propName] !== undefined) {
                host[propName] = propValue;
            }
        }
    } else if (Array.isArray(propValue)) {
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
