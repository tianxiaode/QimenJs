/**
 * template-compiler.ts — 统一预编译引擎
 *
 * 从 TemplateComponent.ts 和 NodeMapAbility.ts 提取的共享预编译逻辑，
 * 消除两处重复代码。
 *
 * 职责：
 * - 解析 HTML 模板，提取 data-content 节点元数据
 * - 预编译事件模板（内部事件 + 外部事件）
 * - 计算节点索引路径
 * - 构建事件映射
 */

import type { NodeIndexPath, NodeTemplateMeta, InternalEventBinding, EventMap, ExternalEventMap } from './types';
import type { NodeMetadata } from './types';
import type { ContentInfo } from './template-types';

// ─── 预编译事件模板类型 ───

/**
 * 预编译的内部事件模板 — 不含 node 引用，实例化时填入
 */
export interface InternalEventTemplate {
    event: string;
    handler: string;
    once?: boolean;
    delegate?: boolean;
    delegateTarget?: string;
    /** 防抖时间（毫秒） */
    debounce?: number;
    /** 节流时间（毫秒） */
    throttle?: number;
    /** 对应 nodeMap 中的 group:name key，用于查找 node */
    nodeKey: string;
}

/**
 * 预编译的外部事件模板 — 不含 node 引用，实例化时填入
 */
export interface ExternalEventTemplate {
    /** eventMap external 的 key（如 "button:click"） */
    emitKey: string;
    /** 对应 nodeMap 中的 group:name key，用于查找 node */
    nodeKey: string;
}

/**
 * 预编译的桥接事件模板 — 不含 node 引用，实例化时填入
 */
export interface BridgeEventTemplate {
    /** 桥接源事件名 */
    sourceEvent: string;
    /** 桥接目标事件名（如 click:save） */
    targetEvent: string;
    /** 是否只触发一次 */
    once?: boolean;
    /** 对应 nodeMap 中的 group:name key，用于查找 node */
    nodeKey: string;
}

/**
 * 合并后的 DOM 事件绑定 — 编译时从 DomEventDecl 生成
 *
 * 同一个 DOM 事件（如 click）可能同时需要：
 * - 调用内部 handler（onClick）
 * - 转发为组件事件（emits）
 * - 通过 EventBridge 桥接（bridges）
 *
 * 绑定时只需一次 this.bind()，在回调中统一处理所有转发。
 */
export interface DomEventBinding {
    /** DOM 事件语义（如 click, input） */
    event: string;
    /** 对应 nodeMap 中的 group:name key */
    nodeKey: string;
    /** 内部 handler 名（如 onClick），handler: true 时自动推导 */
    handler?: string;
    /** 是否只触发一次 */
    once?: boolean;
    /** 是否事件委托 */
    delegate?: boolean;
    /** 事件委托目标选择器 */
    delegateTarget?: string;
    /** 防抖时间（毫秒） */
    debounce?: number;
    /** 节流时间（毫秒） */
    throttle?: number;
    /** 转发为组件事件名列表（来自 emits 声明），如同名 'click' 或重命名 'close' */
    emits?: string[];
    /** 桥接事件列表（来自 bridges 声明） */
    bridges?: { targetEvent: string; once?: boolean }[];
}

/**
 * 预编译结果
 */
export interface CompiledTemplate {
    indexPath: NodeIndexPath;
    templateMetas: Record<string, NodeTemplateMeta>;
    internalEventTemplates: InternalEventTemplate[];
    externalEventTemplates: ExternalEventTemplate[];
    bridgeEventTemplates: BridgeEventTemplate[];
    contentPropNames: string[];
    /** 内容节点信息数组 — 只收集有 content 语义的节点，运行时直接遍历 */
    contentInfos: ContentInfo[];
    /** 预编译的模板元素缓存，可直接用作 _templateCache */
    templateCache: HTMLTemplateElement;
}

// ─── 预编译主函数 ───

/**
 * 预编译模板：解析 HTML 提取节点数据 + 预编译事件模板
 *
 * withTemplate 路径：类定义时调用一次，结果存到 static 属性。
 * NodeMapAbility 路径：首次实例化时调用，结果存到原型共享。
 */
export function precompileTemplate(
    templateHtml: string,
    isMultiArea: boolean,
): CompiledTemplate {
    const tpl = document.createElement('template');
    tpl.innerHTML = templateHtml;

    // 创建临时容器用于节点查找和路径计算
    // DocumentFragment 的子元素没有 parentElement，computeNodePath 无法向上遍历
    // 临时容器模拟 _initElementFromTemplate 中 this.el.appendChild(fragment) 的结构
    const pathRoot = document.createElement('div');
    pathRoot.appendChild(tpl.content.cloneNode(true));

    // 查找所有 data-content 节点：包括顶级元素和后代元素
    const topEls = Array.from(pathRoot.children) as HTMLElement[];
    const descendantEls = Array.from(pathRoot.querySelectorAll('[data-content]'));
    // 合并去重：顶级元素可能也有 data-content
    const els = [...new Set([...topEls.filter(el => el.hasAttribute('data-content')), ...descendantEls])];

    const indexPath: NodeIndexPath = {};
    const templateMetas: Record<string, NodeTemplateMeta> = {};
    const contentPropNames: string[] = [];
    const contentInfos: ContentInfo[] = [];
    const internalEventTemplates: InternalEventTemplate[] = [];
    const externalEventTemplates: ExternalEventTemplate[] = [];
    const bridgeEventTemplates: BridgeEventTemplate[] = [];

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
        const hiddenAttr = htmlEl.getAttribute('data-hidden');
        const hidden = hiddenAttr === 'true';
        const eventAttr = htmlEl.getAttribute('data-event') || undefined;
        const emitAttr = htmlEl.getAttribute('data-emit') || undefined;
        const bridgeAttr = htmlEl.getAttribute('data-bridge') || undefined;

        templateMetas[key] = {
            raw: value, group, name, delegateTarget, jsonRef, jsonMode,
            templateRef, mode, eventAttr, emitAttr, bridgeAttr, i18nKey, hidden,
        };

        // 计算节点路径（相对于 pathRoot，与 _buildNodeMapFromCompiled 中 this.el 结构一致）
        indexPath[key] = computeNodePath(pathRoot, htmlEl);

        // 推导内容属性名
        const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
        const propName = isMultiArea
            ? `${group}${capitalName}`
            : name === '_' ? group : name;
        contentPropNames.push(propName);

        // 收集内容节点信息
        contentInfos.push({
            group, name, mode,
            i18nKey,
            propName,
        });

        // 预编译内部事件模板
        // handler 推导：click=title → onTitleClick，click → onClick
        if (eventAttr) {
            const parsed = parseEventAttr(eventAttr);
            for (const { event, name, once, delegate, debounce, throttle } of parsed) {
                const capitalEvent = event.charAt(0).toUpperCase() + event.slice(1);
                const handlerName = name
                    ? `on${name.charAt(0).toUpperCase() + name.slice(1)}${capitalEvent}`
                    : `on${capitalEvent}`;

                internalEventTemplates.push({
                    event,
                    handler: handlerName,
                    once,
                    delegate,
                    delegateTarget,
                    debounce,
                    throttle,
                    nodeKey: key,
                });
            }
        }

        // 预编译外部事件模板
        if (emitAttr) {
            const parsed = parseEventAttr(emitAttr);
            for (const { event } of parsed) {
                externalEventTemplates.push({
                    emitKey: `${name}:${event}`,
                    nodeKey: key,
                });
            }
        }

        // 预编译桥接事件模板
        if (bridgeAttr) {
            const parsed = parseBridgeEventAttr(bridgeAttr);
            for (const { sourceEvent, targetEvent, once } of parsed) {
                bridgeEventTemplates.push({
                    sourceEvent,
                    targetEvent,
                    once,
                    nodeKey: key,
                });
            }
        }
    }

    return { indexPath, templateMetas, internalEventTemplates, externalEventTemplates, bridgeEventTemplates, contentPropNames, contentInfos, templateCache: tpl };
}

/**
 * 仅预编译事件模板 — 从已有的 templateMetas 推导
 *
 * NodeMapAbility 首次实例化时使用：先 querySelectorAll 扫描节点，
 * 再用此函数从 templateMetas 预编译事件模板。
 */
export function precompileEventTemplates(
    templateMetas: Record<string, NodeTemplateMeta>,
    isMultiArea: boolean,
): {
    internalEventTemplates: InternalEventTemplate[];
    externalEventTemplates: ExternalEventTemplate[];
} {
    const internalEventTemplates: InternalEventTemplate[] = [];
    const externalEventTemplates: ExternalEventTemplate[] = [];

    for (const [key, meta] of Object.entries(templateMetas)) {
        const capitalName = meta.name.charAt(0).toUpperCase() + meta.name.slice(1);

        if (meta.eventAttr) {
            const parsed = parseEventAttr(meta.eventAttr);
            for (const { event, name, once, delegate, debounce, throttle } of parsed) {
                const capitalEvent = event.charAt(0).toUpperCase() + event.slice(1);
                const handlerName = name
                    ? `on${name.charAt(0).toUpperCase() + name.slice(1)}${capitalEvent}`
                    : `on${capitalEvent}`;

                internalEventTemplates.push({
                    event,
                    handler: handlerName,
                    once,
                    delegate,
                    delegateTarget: meta.delegateTarget,
                    debounce,
                    throttle,
                    nodeKey: key,
                });
            }
        }

        if (meta.emitAttr) {
            const parsed = parseEventAttr(meta.emitAttr);
            for (const { event } of parsed) {
                externalEventTemplates.push({
                    emitKey: `${meta.name}:${event}`,
                    nodeKey: key,
                });
            }
        }
    }

    return { internalEventTemplates, externalEventTemplates };
}

// ─── 事件映射构建 ───

/**
 * 从预编译事件模板构建 eventMap — 只填 node 引用
 *
 * withTemplate 路径和 NodeMapAbility 路径共用。
 */
export function buildEventMapFromTemplates(
    internalTemplates: InternalEventTemplate[],
    externalTemplates: ExternalEventTemplate[],
    nodeMap: Record<string, Record<string, NodeMetadata>>,
): EventMap {
    const internalEvents: InternalEventBinding[] = [];
    const externalEvents: ExternalEventMap = {};

    for (const tpl of internalTemplates) {
        const [group, name] = tpl.nodeKey.split(':');
        const node = nodeMap[group]?.[name];
        if (!node) continue;

        internalEvents.push({
            event: tpl.event,
            handler: tpl.handler,
            once: tpl.once,
            delegate: tpl.delegate,
            delegateTarget: tpl.delegateTarget,
            debounce: tpl.debounce,
            throttle: tpl.throttle,
            node,
        });
    }

    for (const tpl of externalTemplates) {
        const [group, name] = tpl.nodeKey.split(':');
        const node = nodeMap[group]?.[name];
        if (!node) continue;

        externalEvents[tpl.emitKey] = node;
    }

    return { internal: internalEvents, external: externalEvents };
}

// ─── 节点定位 ───

/**
 * 用索引路径从 root 开始定位元素
 */
export function findByPath(root: HTMLElement, path: number[]): HTMLElement | null {
    let current: Element = root;
    for (const idx of path) {
        if (!current.children[idx]) return null;
        current = current.children[idx];
    }
    return current as HTMLElement;
}

/**
 * 计算节点在 DOM 树中的位置路径
 */
export function computeNodePath(root: HTMLElement, target: HTMLElement): number[] {
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

// ─── 辅助函数 ───

/**
 * 根据元素标签推导内容操作模式
 */
export function inferContentMode(el: HTMLElement): 'value' | 'src' | 'html' {
    const tag = el.tagName.toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return 'value';
    if (tag === 'img') return 'src';
    return 'html';
}

/**
 * 解析事件属性值（data-event / data-emit 通用）
 *
 * 格式：逗号分隔的事件类型，每个可带 ? 修饰符
 * 修饰符：
 * - once：只触发一次
 * - delegate：事件委托
 * - debounce=N：N 毫秒防抖
 * - throttle=N：N 毫秒节流
 *
 * 示例：
 * - "click?once"
 * - "click?debounce=300"
 * - "click?once&debounce=300"
 * - "input?throttle=100"
 * - "input,change"
 */
export function parseEventAttr(eventAttr: string): Array<{ event: string; name?: string; once?: boolean; delegate?: boolean; debounce?: number; throttle?: number }> {
    const results: Array<{ event: string; name?: string; once?: boolean; delegate?: boolean; debounce?: number; throttle?: number }> = [];
    const parts = eventAttr.split(',').map(s => s.trim()).filter(Boolean);

    for (const part of parts) {
        let event: string;
        let name: string | undefined;
        let once = false;
        let delegate = false;
        let debounce: number | undefined;
        let throttle: number | undefined;

        const questionIndex = part.indexOf('?');
        if (questionIndex !== -1) {
            event = part.slice(0, questionIndex).trim();
            const modifiers = part.slice(questionIndex + 1).split('&');
            for (const mod of modifiers) {
                if (mod === 'once') once = true;
                else if (mod === 'delegate') delegate = true;
                else if (mod.startsWith('debounce=')) {
                    debounce = parseInt(mod.slice(9), 10);
                }
                else if (mod.startsWith('throttle=')) {
                    throttle = parseInt(mod.slice(9), 10);
                }
            }
        } else {
            event = part.trim();
        }

        // 支持 click=title 语法：事件名=语义名
        const eqIndex = event.indexOf('=');
        if (eqIndex !== -1) {
            name = event.slice(eqIndex + 1).trim();
            event = event.slice(0, eqIndex).trim();
        }

        results.push({ event, name, once, delegate, debounce, throttle });
    }

    return results;
}

// JSON 模板（从 template-json.ts 拆分）
export type { JsonTemplateNode } from './template-json';
export { jsonTemplateToHtml } from './template-json';

// 新模板类型
export type { TplNode, ComponentTemplate, DomEventDecl } from './template-types';
export { convertTemplate, type TemplateConvertResult, type TplNodeMeta } from './template-json';

// 新模板编译（一步到位，跳过 HTML data-* 属性）
export { compileTemplate, type CompiledTemplateResult } from './template-json';
export { type ContentInfo } from './template-types';

/**
 * 解析桥接事件属性值（data-bridge）
 *
 * 格式：逗号分隔的事件声明
 * - 'click' → 源事件 click，目标事件 click
 * - 'click=click:save' → 源事件 click，目标事件 click:save
 * - 'click?once' → 只触发一次
 * - 'click=click:save?once' → 映射 + 只触发一次
 */
export function parseBridgeEventAttr(bridgeAttr: string): Array<{ sourceEvent: string; targetEvent: string; once?: boolean }> {
    const results: Array<{ sourceEvent: string; targetEvent: string; once?: boolean }> = [];
    const parts = bridgeAttr.split(',').map(s => s.trim()).filter(Boolean);

    for (const part of parts) {
        let sourceEvent: string;
        let targetEvent: string;
        let once = false;

        // 先分离 ?once 修饰符
        let eventPart = part;
        const questionIndex = part.indexOf('?');
        if (questionIndex !== -1) {
            eventPart = part.slice(0, questionIndex).trim();
            const modifiers = part.slice(questionIndex + 1).split('&');
            for (const mod of modifiers) {
                if (mod === 'once') once = true;
            }
        }

        // 解析 source=target
        const equalIndex = eventPart.indexOf('=');
        if (equalIndex !== -1) {
            sourceEvent = eventPart.slice(0, equalIndex).trim();
            targetEvent = eventPart.slice(equalIndex + 1).trim();
        } else {
            sourceEvent = eventPart;
            targetEvent = eventPart;
        }

        results.push({ sourceEvent, targetEvent, once });
    }

    return results;
}
