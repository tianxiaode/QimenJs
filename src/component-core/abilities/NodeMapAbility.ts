/**
 * NodeMapAbility — 模板节点扫描、属性生成、i18n 集中刷新
 *
 * 负责：扫描 data-content/data-i18n 元素、构建 nodeMap/eventMap、
 *       生成原型属性、注册 localeChange 监听实现 i18n 集中刷新。
 *
 * 作为 ComponentBase 的标准能力，通过 ComposableBase.with() 合并到原型。
 *
 * 首次实例化：querySelectorAll 扫描 → 生成索引表 + 模板元数据 → 存到原型共享
 * 后续实例化：用索引表 + el.children 直接定位，跳过 querySelectorAll
 *
 * i18n 机制：
 * - 模板中用 data-i18n="btn.save" 声明翻译 key
 * - buildNodeMap 扫描时收集 i18nKey 到 NodeTemplateMeta
 * - 初始化时自动翻译并写入 DOM
 * - localeChange 事件触发时统一刷新所有 i18n 节点
 */

import type { AbilityDefinition } from '@/composable';
import type { TemplateRegistrar } from '@qimenjs/template';
import { RegistryHub } from '@/registry/RegistryHub';
import { getI18nManager, I18N_PREFIX } from '@qimenjs/i18n';
import { globalEventBus } from '@qimenjs/events';
import type {
    NodeMetadata,
    NodeIndexPath,
    NodeTemplateMeta,
    InternalEventBinding,
    ExternalEventMap,
    EventMap,
} from '../types';

// ─── 辅助函数 ───

/**
 * 解析事件属性值（data-event / data-emit 通用）
 *
 * 格式：逗号分隔的事件类型，每个可带 ? 修饰符
 */
function parseEventAttr(eventAttr: string): Array<{ event: string; once?: boolean; delegate?: boolean }> {
    const results: Array<{ event: string; once?: boolean; delegate?: boolean }> = [];
    const parts = eventAttr.split(',').map(s => s.trim()).filter(Boolean);

    for (const part of parts) {
        let event: string;
        let once = false;
        let delegate = false;

        const questionIndex = part.indexOf('?');
        if (questionIndex !== -1) {
            event = part.slice(0, questionIndex).trim();
            const modifiers = part.slice(questionIndex + 1).split('&');
            for (const mod of modifiers) {
                if (mod === 'once') once = true;
                if (mod === 'delegate') delegate = true;
            }
        } else {
            event = part.trim();
        }

        results.push({ event, once, delegate });
    }

    return results;
}

/**
 * 根据元素标签推导内容操作模式
 */
function inferContentMode(el: HTMLElement): 'value' | 'src' | 'html' {
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return 'value';
    if (tag === 'img') return 'src';
    return 'html';
}

/**
 * 计算节点在 el.children 树中的位置路径
 */
function computeNodePath(root: HTMLElement, target: HTMLElement): number[] {
    const path: number[] = [];
    let current: Element | null = target;
    while (current && current !== root) {
        const parent: Element | null = current.parentElement;
        if (!parent) break;
        const idx = Array.from(parent.children).indexOf(current);
        if (idx === -1) break;
        path.unshift(idx);
        current = parent;
    }
    return path;
}

/**
 * 用索引路径从 root 开始定位元素
 */
function findByPath(root: HTMLElement, path: number[]): HTMLElement | null {
    let current: Element = root;
    for (const idx of path) {
        if (!current.children[idx]) return null;
        current = current.children[idx];
    }
    return current as HTMLElement;
}

/**
 * 注入 data-template 嵌套模板
 */
function injectTemplates(el: HTMLElement): void {
    const templateEls = Array.from(el.querySelectorAll('[data-template]'));
    if (templateEls.length === 0) return;

    const templateRegistrar = RegistryHub.get<TemplateRegistrar>('template');
    if (!templateRegistrar) return;

    for (const el of templateEls) {
        const htmlEl = el as HTMLElement;
        const templateId = htmlEl.getAttribute('data-template');
        if (!templateId) continue;

        try {
            const fragment = templateRegistrar.getFragment(templateId);
            htmlEl.appendChild(fragment);
        } catch {
            // 模板未注册，跳过
        }
    }
}

/**
 * 翻译 i18n key
 */
function translateI18nKey(i18nKey: string): string {
    const i18n = getI18nManager();
    if (!i18n) return i18nKey;
    return i18n.t(i18nKey) || i18nKey;
}

/**
 * 将翻译值写入 DOM 元素
 */
function applyValueToEl(el: HTMLElement, value: string, mode: 'value' | 'src' | 'html'): void {
    if (mode === 'value') { (el as HTMLInputElement).value = value; }
    else if (mode === 'src') { (el as HTMLImageElement).src = value; }
    else { el.innerHTML = value; }
}

/**
 * 在类原型上生成内容 getter/setter（只做一次）
 */
function buildContentPropertiesOnProto(
    component: any,
    templateMetas: Record<string, NodeTemplateMeta>,
    isMultiArea: boolean,
): void {
    const proto = component.constructor.prototype as any;
    const propNames: string[] = [];

    for (const [, meta] of Object.entries(templateMetas)) {
        const capitalName = meta.name.charAt(0).toUpperCase() + meta.name.slice(1);

        const propName = isMultiArea
            ? `${meta.group}${capitalName}`
            : meta.name === '_' ? meta.group : meta.name;

        propNames.push(propName);

        const hiddenPropName = `${propName}Hidden`;
        const { group, name, mode } = meta;

        Object.defineProperty(proto, propName, {
            get: function (this: any) {
                const el = this.nodeMap[group]?.[name]?.el;
                if (!el) return '';
                if (mode === 'value') return (el as HTMLInputElement).value;
                if (mode === 'src') return (el as HTMLImageElement).src;
                return el.innerHTML;
            },
            set: function (this: any, v: string) {
                const el = this.nodeMap[group]?.[name]?.el;
                if (!el) return;
                // 支持 i18n: 前缀的值
                const resolved = v.startsWith(I18N_PREFIX)
                    ? translateI18nKey(v.slice(I18N_PREFIX.length))
                    : v;
                applyValueToEl(el, resolved, mode);
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(proto, hiddenPropName, {
            get: function (this: any) {
                return this.nodeMap[group]?.[name]?.el?.hidden ?? false;
            },
            set: function (this: any, v: boolean) {
                const el = this.nodeMap[group]?.[name]?.el;
                if (el) el.hidden = v;
            },
            configurable: true,
            enumerable: true,
        });
    }

    proto._contentPropNames = propNames;
}

/**
 * 构建 eventMap（从 nodeMap 和 DOM 属性）
 */
function buildEventMap(
    nodeMap: Record<string, Record<string, NodeMetadata>>,
    isMultiArea: boolean,
): EventMap {
    const internalEvents: InternalEventBinding[] = [];
    const externalEvents: ExternalEventMap = {};

    for (const [group, entries] of Object.entries(nodeMap)) {
        for (const [name, node] of Object.entries(entries)) {
            const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
            const handlerName = isMultiArea
                ? `on${group.charAt(0).toUpperCase() + group.slice(1)}${capitalName}`
                : `on${name === '_' ? group.charAt(0).toUpperCase() + group.slice(1) : capitalName}`;

            const eventAttr = node.el.getAttribute('data-event');
            if (eventAttr) {
                const parsed = parseEventAttr(eventAttr);
                for (const { event, once, delegate } of parsed) {
                    internalEvents.push({
                        event,
                        handler: handlerName,
                        once,
                        delegate,
                        delegateTarget: node.delegateTarget,
                        node,
                    });
                }
            }

            const emitAttr = node.el.getAttribute('data-emit');
            if (emitAttr) {
                const parsed = parseEventAttr(emitAttr);
                for (const { event } of parsed) {
                    const emitKey = `${group}:${event}`;
                    externalEvents[emitKey] = node;
                }
            }
        }
    }

    return { internal: internalEvents, external: externalEvents };
}

/**
 * 构建 eventMap（从模板元数据，快速路径）
 */
function buildEventMapFromMetas(
    templateMetas: Record<string, NodeTemplateMeta>,
    nodeMap: Record<string, Record<string, NodeMetadata>>,
    isMultiArea: boolean,
): EventMap {
    const internalEvents: InternalEventBinding[] = [];
    const externalEvents: ExternalEventMap = {};

    for (const [, meta] of Object.entries(templateMetas)) {
        const node = nodeMap[meta.group]?.[meta.name];
        if (!node) continue;

        const capitalName = meta.name.charAt(0).toUpperCase() + meta.name.slice(1);
        const handlerName = isMultiArea
            ? `on${meta.group.charAt(0).toUpperCase() + meta.group.slice(1)}${capitalName}`
            : `on${meta.name === '_' ? meta.group.charAt(0).toUpperCase() + meta.group.slice(1) : capitalName}`;

        if (meta.eventAttr) {
            const parsed = parseEventAttr(meta.eventAttr);
            for (const { event, once, delegate } of parsed) {
                internalEvents.push({
                    event,
                    handler: handlerName,
                    once,
                    delegate,
                    delegateTarget: meta.delegateTarget,
                    node,
                });
            }
        }

        if (meta.emitAttr) {
            const parsed = parseEventAttr(meta.emitAttr);
            for (const { event } of parsed) {
                const emitKey = `${meta.group}:${event}`;
                externalEvents[emitKey] = node;
            }
        }
    }

    return { internal: internalEvents, external: externalEvents };
}

// ─── Ability 定义 ───

export const NodeMapAbility: AbilityDefinition = {
    /**
     * 构建 nodeMap — 首次实例化走 querySelectorAll，后续走索引表快速路径
     */
    buildNodeMap(): void {
        const ctor = this.constructor as any;
        const proto = ctor.prototype as any;

        // 检查原型上是否已有索引表（后续实例化走快速路径）
        if (proto._nodeIndexPath && proto._nodeTemplateMetas) {
            injectTemplates(this.el);
            this._buildNodeMapFast(proto._nodeIndexPath, proto._nodeTemplateMetas);
            return;
        }

        // 先注入 data-template 嵌套模板（必须在 querySelectorAll 之前）
        injectTemplates(this.el);

        const els = Array.from(this.el.querySelectorAll('[data-content]'));
        if (els.length === 0) return;

        const indexPath: NodeIndexPath = {};
        const templateMetas: Record<string, NodeTemplateMeta> = {};
        const isMultiArea = ctor.isMultiArea;

        for (const el of els) {
            const htmlEl = el as HTMLElement;
            const value = htmlEl.getAttribute('data-content')!;

            const colonIndex = value.indexOf(':');
            const group = colonIndex === -1 ? value : value.slice(0, colonIndex);
            const name = colonIndex === -1 ? '_' : value.slice(colonIndex + 1);
            const key = `${group}:${name}`;

            const delegateTarget = htmlEl.getAttribute('data-target') || undefined;
            const jsonRef = htmlEl.getAttribute('data-json') || undefined;
            const jsonModeAttr = htmlEl.getAttribute('data-json-mode');
            const jsonMode = jsonModeAttr === 'child' ? 'child' as const : jsonRef ? 'replace' as const : undefined;
            const templateRef = htmlEl.getAttribute('data-template') || undefined;
            const mode = inferContentMode(htmlEl);
            const i18nKey = htmlEl.getAttribute('data-i18n') || undefined;

            const node: NodeMetadata = {
                el: htmlEl, raw: value, group, name,
                delegateTarget, jsonRef, jsonMode, templateRef, i18nKey,
            };

            if (!this.nodeMap[group]) this.nodeMap[group] = {};
            this.nodeMap[group][name] = node;

            indexPath[key] = computeNodePath(this.el, htmlEl);

            const eventAttr = htmlEl.getAttribute('data-event') || undefined;
            const emitAttr = htmlEl.getAttribute('data-emit') || undefined;

            templateMetas[key] = { raw: value, group, name, delegateTarget, jsonRef, jsonMode, templateRef, mode, eventAttr, emitAttr, i18nKey };
        }

        // 构建 eventMap
        this.eventMap = buildEventMap(this.nodeMap, isMultiArea);

        // 生成 getter/setter 到原型（只做一次）
        buildContentPropertiesOnProto(this, templateMetas, isMultiArea);

        // 存储索引表和模板元数据到原型
        proto._nodeIndexPath = indexPath;
        proto._nodeTemplateMetas = templateMetas;
    },

    /**
     * 快速构建 nodeMap — 后续实例化路径
     *
     * 用索引表 + children 直接定位，跳过 querySelectorAll。
     */
    _buildNodeMapFast(
        indexPath: NodeIndexPath,
        templateMetas: Record<string, NodeTemplateMeta>,
    ): void {
        const isMultiArea = (this.constructor as any).isMultiArea;

        for (const [key, path] of Object.entries(indexPath)) {
            const meta = templateMetas[key];
            if (!meta) continue;

            const el = findByPath(this.el, path);
            if (!el) continue;

            const node: NodeMetadata = {
                el, raw: meta.raw, group: meta.group, name: meta.name,
                delegateTarget: meta.delegateTarget, jsonRef: meta.jsonRef,
                jsonMode: meta.jsonMode, templateRef: meta.templateRef,
                i18nKey: meta.i18nKey,
            };

            if (!this.nodeMap[meta.group]) this.nodeMap[meta.group] = {};
            this.nodeMap[meta.group][meta.name] = node;
        }

        // 构建 eventMap（从模板元数据读取，无需访问 DOM 属性）
        this.eventMap = buildEventMapFromMetas(templateMetas, this.nodeMap, isMultiArea);
    },

    /**
     * 从 props 初始化自动生成的内容属性
     */
    initContentFromProps(props: Record<string, any>): void {
        const propNames = (this.constructor as any).prototype._contentPropNames as string[] | undefined;
        if (!propNames) return;
        for (const propName of propNames) {
            if (props[propName] !== undefined) {
                (this as any)[propName] = props[propName];
            }
        }
    },

    // ─── i18n 集中刷新 ───

    /**
     * 初始化所有 data-i18n 节点的翻译
     *
     * 在 buildNodeMap 之后调用，将模板中声明的 i18n key 翻译并写入 DOM。
     */
    initI18nFromTemplate(): void {
        for (const [, entries] of Object.entries(this.nodeMap)) {
            for (const [, node] of Object.entries(entries)) {
                if (!node.i18nKey) continue;
                const translated = translateI18nKey(node.i18nKey);
                const mode = inferContentMode(node.el);
                applyValueToEl(node.el, translated, mode);
            }
        }
    },

    /**
     * 刷新所有 i18n 节点的翻译
     *
     * localeChange 事件触发时调用，也可手动调用。
     */
    refreshI18n(): void {
        for (const [, entries] of Object.entries(this.nodeMap)) {
            for (const [, node] of Object.entries(entries)) {
                if (!node.i18nKey) continue;
                const translated = translateI18nKey(node.i18nKey);
                const mode = inferContentMode(node.el);
                applyValueToEl(node.el, translated, mode);
            }
        }
    },

    /**
     * 注册 localeChange 事件监听
     *
     * 语言切换时自动调用 refreshI18n() 刷新所有 i18n 节点。
     * 通过 onCleanup 确保组件 dispose 时自动注销。
     */
    setupI18nListener(): void {
        if (!globalEventBus || typeof globalEventBus.on !== 'function') return;

        const off = globalEventBus.on('localeChange', () => {
            this.refreshI18n();
        });

        if (typeof this.onCleanup === 'function') {
            this.onCleanup(() => {
                if (typeof off === 'function') off();
            });
        }
    },

    /**
     * 获取所有 i18n key
     *
     * 返回 { "group:name": i18nKey } 的结构，
     * 供外部 i18n 系统查询需要预加载的 key 列表。
     */
    getI18nKeys(): Record<string, string> {
        const result: Record<string, string> = {};
        for (const [group, entries] of Object.entries(this.nodeMap)) {
            for (const [name, node] of Object.entries(entries)) {
                if (node.i18nKey) {
                    result[`${group}:${name}`] = node.i18nKey;
                }
            }
        }
        return result;
    },
};
