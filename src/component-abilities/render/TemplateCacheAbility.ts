/**
 * TemplateCacheAbility — 模板缓存能力
 *
 * 提供 HTMLTemplateElement 缓存 + cloneNode 快速构建 DOM，
 * 以及 precompileTemplate 提取节点索引路径，克隆后通过 findByPath 定位节点。
 * 支持通过 setTemplate() 替换模板，替换时自动重建缓存和节点索引。
 *
 * 适用于命令式管理器（ToastManager、MsgboxManager 等），
 * 不依赖 TemplateComponent 的重量级基类。
 */

import type { AbilityDefinition } from '@/composable';
import { jsonTemplateToHtml, precompileTemplate, findByPath } from '@/component-core/template-compiler';
import type { NodeIndexPath } from '@/component-core/types';

// ─── 模板缓存条目 ──────────────────────────────────────────

interface TemplateCacheEntry {
    /** HTMLTemplateElement 缓存，用于 cloneNode */
    templateEl: HTMLTemplateElement;
    /** 预编译的节点索引路径 */
    indexPath: NodeIndexPath;
}

// ─── 能力定义 ──────────────────────────────────────────────

export const TemplateCacheAbility: AbilityDefinition = {
    /**
     * 模板缓存映射：key → TemplateCacheEntry
     */
    _templateCaches: {
        get(): Map<string, TemplateCacheEntry> {
            return this.abilityState('TemplateCacheAbility:caches', () => new Map());
        },
    },

    /**
     * 当前模板 JSON 映射：key → templateJson
     */
    _templateJsons: {
        get(): Map<string, any> {
            return this.abilityState('TemplateCacheAbility:jsons', () => new Map());
        },
    },

    /**
     * 初始化模板缓存
     *
     * 注册一个模板 key 及其 JSON 模板定义，自动构建缓存。
     * 通常在构造函数中调用。
     */
    initTemplateCache(key: string, templateJson: any): void {
        this._templateJsons.set(key, templateJson);
        this.buildTemplateCache(key, templateJson);
    },

    /**
     * 替换模板
     *
     * 替换后自动重建缓存和节点索引，后续创建的实例使用新模板。
     * 已显示的实例不受影响。
     */
    setTemplate(key: string, templateJson: any): void {
        this._templateJsons.set(key, templateJson);
        this.buildTemplateCache(key, templateJson);
    },

    /**
     * 构建模板缓存：HTMLTemplateElement + 预编译节点索引
     */
    buildTemplateCache(key: string, templateJson: any): void {
        const { html } = jsonTemplateToHtml(templateJson);

        // 预编译提取节点索引路径 + 复用模板元素缓存
        const compiled = precompileTemplate(html, false);

        this._templateCaches.set(key, {
            templateEl: compiled.templateCache,
            indexPath: compiled.indexPath,
        });
    },

    /**
     * 从缓存克隆 DOM 并构建 nodeMap
     *
     * 返回克隆的根元素和通过索引路径定位的节点映射。
     */
    cloneFromCache(cacheKey: string): { root: HTMLElement; nodeMap: Record<string, HTMLElement> } {
        const entry = this._templateCaches.get(cacheKey);
        if (!entry) {
            throw new Error(`[TemplateCacheAbility] Template cache not found: ${cacheKey}`);
        }

        const fragment = entry.templateEl.content.cloneNode(true) as DocumentFragment;
        const root = fragment.firstElementChild as HTMLElement;

        // 通过索引路径定位节点，构建 nodeMap
        const nodeMap: Record<string, HTMLElement> = {};
        for (const [key, path] of Object.entries(entry.indexPath)) {
            const el = findByPath(root, path as number[]);
            if (el) {
                nodeMap[key] = el;
            }
        }

        return { root, nodeMap };
    },
};
