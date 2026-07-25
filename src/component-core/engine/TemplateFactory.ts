/**
 * TemplateFactory — 模板组件工厂
 *
 * 使用四个引擎实现纯函数构建流程：
 *   TemplateCompiler  → compile(tpl) → { cache, nodeMetas }
 *   TemplateDeriver   → derive(parentCache, parentNodeMetas, nodeOverrides) → { cache, nodeMetas }
 *   BodyMerger        → merge(parentBody, childBody) → newBody
 *   RuntimeEngine     → init(instance, props) 统一编排运行时初始化
 *
 * 每个引擎都是纯函数，输出显式赋值到新类，从架构上消灭共享问题。
 */

import type { TplNode, BodyDef } from '../types';
import type { TplEvents } from '../types/tpl-events';
import { applyChildNodeProps } from './ChildNodeProps';
import type { AbilityDefinition } from '@/composable';
import { withAbilities } from '@/composable';
import { TemplateComponent } from '../TemplateComponent';
import { BODY_SPECIAL_KEYS } from '../types/tpl-body-def';
import { TemplateCompiler } from './TemplateCompiler';
import { TemplateDeriver } from './TemplateDeriver';
import { BodyMerger } from './BodyMerger';
import { DelegatedEventEngine } from './DelegatedEventEngine';
import { RuntimeEngine, executeOverrideQueue } from './RuntimeEngine';
import { ComponentError, KernelErrorCode } from '@/error';

function templateComponentConstructor(this: any, props?: Record<string, any>): void {
    RuntimeEngine.init(this, props);
}

function attachStaticMethods(Cls: any): void {
    Cls.create = function (props?: Record<string, any>): any {
        return new Cls(props);
    };

    Cls.with = function (abilities: AbilityDefinition[]): any {
        withAbilities(Cls, abilities);
        return Cls;
    };

    Cls.replace = function (options: any): any {
        return createDerivedInnerClass(Cls, options);
    };
}

const DEFAULT_OVERRIDES = ['onInitState', 'onBeforeInit', 'onAfterInit'];

function getOverridesList(body: Record<string, any>): string[] {
    if (Array.isArray(body.overrides)) {
        return body.overrides;
    }
    return DEFAULT_OVERRIDES;
}

function getReplacesSet(body: Record<string, any>): Set<string> {
    if (Array.isArray(body.replaces)) {
        return new Set(body.replaces);
    }
    return new Set();
}

function collectOverrideHooks(
    parentBody: Record<string, any> | undefined,
    childBody: Record<string, any>,
    parentQueues?: Record<string, Function[]>
): Record<string, Function[]> {
    const overrides = getOverridesList(childBody);
    const replaces = getReplacesSet(childBody);
    const queues: Record<string, Function[]> = {};

    for (const methodName of overrides) {
        if (replaces.has(methodName)) continue;

        const hooks: Function[] = [];

        if (parentQueues && parentQueues[methodName]) {
            hooks.push(...parentQueues[methodName]);
        } else if (parentBody && typeof parentBody[methodName] === 'function') {
            hooks.push(parentBody[methodName]);
        }

        if (typeof childBody[methodName] === 'function') {
            hooks.push(childBody[methodName]);
        }

        if (hooks.length > 0) {
            queues[methodName] = hooks;
        }
    }

    return queues;
}

function wrapOverrideMethodsOnProto(proto: any, overrides: string[], replaces: Set<string>): void {
    for (const methodName of overrides) {
        if (replaces.has(methodName)) continue;

        const original = proto[methodName];
        if (typeof original !== 'function') continue;

        Object.defineProperty(proto, methodName, {
            value: function (this: any, ...args: any[]): any {
                return executeOverrideQueue(this, methodName, ...args);
            },
            writable: true,
            configurable: true,
        });
    }
}

const BODY_KEY_SET = new Set(Object.keys(BODY_SPECIAL_KEYS));

function validateBodyKey(key: string, desc?: PropertyDescriptor): void {
    if (BODY_KEY_SET.has(key)) return;
    if (key.startsWith('on') && key.length > 2) return;
    const ch = key[0];
    if (ch === '_' || ch === '$') return;
    if (desc && (desc.get || desc.set)) return;
    if (desc && typeof desc.value === 'function') return;
    throw new ComponentError(
        `Body 不支持纯数据字段 "${key}"。默认属性值写在 TplNode，实例状态用 _applyState 模式。`,
        KernelErrorCode.COMPONENT_BODY_INVALID_FIELD,
        { field: key }
    );
}

function applyBodyToClass(ctor: any, body: Record<string, any> | undefined): void {
    if (!body) return;

    const proto = ctor.prototype;
    const descs = Object.getOwnPropertyDescriptors(body);
    for (const [key, desc] of Object.entries(descs)) {
        validateBodyKey(key, desc);
        const def = BODY_SPECIAL_KEYS[key];

        if (def?.category === 'static') {
            const targetKey = def.alias ?? key;
            const staticKey = key === 'forwards' ? '_forwards' : targetKey;
            ctor[staticKey] = desc.value;
        } else if (def?.category === 'init') {
            ctor[`_${key}`] = desc.value;
        } else if (def?.category === 'hook') {
            proto[key] = desc.value;
        } else if (desc.get || desc.set) {
            Object.defineProperty(proto, key, desc);
        } else if (typeof desc.value === 'function') {
            proto[key] = desc.value;
        }
    }
}

/**
 * 创建内部类 — 模板编译引擎（首次编译，耗时）
 *
 * 流程：
 *   1. TemplateCompiler.compile(tpl) → { cache, nodeMetas }
 *   2. cache 保存到类上（只读共享）
 *   3. nodeMetas 保存到类上（每类独立）
 *   4. body 应用到 nodeMetas（更新 componentClass 等）
 *   5. applyChildNodeProps 生成子节点属性描述符
 */
export function createInnerClass(
    ParentClass: any,
    tpl: TplNode,
    body?: BodyDef,
    extraAbilities?: AbilityDefinition[],
    nodeOverrides?: Record<string, Record<string, any>>,
    tplEvents?: TplEvents
): any {
    const InnerClass = class extends ParentClass {
        constructor(props?: Record<string, any>) {
            super();
            templateComponentConstructor.call(this, props);
        }
    };

    (InnerClass as any)._tpl = tpl;
    (InnerClass as any)._body = body;

    if (nodeOverrides && Object.keys(nodeOverrides).length > 0) {
        (InnerClass as any)._nodeOverrides = nodeOverrides;
    }

    const { cache, nodeMetas } = TemplateCompiler.compile(tpl, InnerClass);

    (InnerClass as any)._cache = cache;
    (InnerClass as any)._nodeMetas = nodeMetas;
    (InnerClass as any)._i18nNodes = cache.i18nNodes;

    if (nodeOverrides && Object.keys(nodeOverrides).length > 0) {
        for (const [nodeName, override] of Object.entries(nodeOverrides)) {
            const meta = nodeMetas[nodeName];
            if (meta && override.type !== undefined) {
                if (typeof override.type === 'function') {
                    meta.componentClass = override.type;
                } else if (typeof override.type === 'string') {
                    meta.componentClass = (window as any)[override.type];
                }
            }
        }
    }

    applyChildNodeProps(InnerClass, nodeMetas, cache.i18nNodes);

    if (tplEvents && Object.keys(tplEvents).length > 0) {
        (InnerClass as any)._tplEvents = tplEvents;
        (InnerClass as any)._delegatedEventRules = DelegatedEventEngine.compileTplEvents(tplEvents);
    }

    (InnerClass as any)._templateCompiled = true;

    const overrides = getOverridesList(body || {});
    const replaces = getReplacesSet(body || {});
    (InnerClass as any)._overrideQueues = collectOverrideHooks(undefined, body || {});

    applyBodyToClass(InnerClass, body);

    wrapOverrideMethodsOnProto(InnerClass.prototype, overrides, replaces);

    if (extraAbilities && extraAbilities.length > 0) {
        withAbilities(InnerClass, extraAbilities);
    }

    attachStaticMethods(InnerClass);

    return InnerClass;
}

const REPLACE_OPTION_KEYS = new Set([
    'type',
    'cls',
    'itemsCls',
    'config',
    'nodeOverrides',
    'tplReplaces',
    'body',
]);

function extractBodyFromOptions(options: Record<string, any>): Record<string, any> {
    if (options.body) {
        return options.body;
    }

    const body: Record<string, any> = {};
    const descs = Object.getOwnPropertyDescriptors(options);
    for (const [key, desc] of Object.entries(descs)) {
        if (REPLACE_OPTION_KEYS.has(key)) continue;

        if (desc.get || desc.set) {
            Object.defineProperty(body, key, desc);
        } else if (typeof desc.value === 'function') {
            body[key] = desc.value;
        } else if (desc.value !== undefined) {
            body[key] = desc.value;
        }
    }
    return body;
}

/**
 * 基于已有内部类创建派生类（replace 场景）
 *
 * 使用三个引擎的纯函数流程：
 *   1. TemplateDeriver.derive(parentCache, parentNodeMetas, nodeOverrides) → { cache, nodeMetas }
 *      - cache: 直接引用父类的 CompiledTemplateCache（只读共享）
 *      - nodeMetas: 深拷贝 + 应用 nodeOverrides（每类独立）
 *   2. BodyMerger.merge(parentBody, childBody) → newBody
 *      - 纯函数，返回新对象
 *   3. 所有输出显式赋值到新类
 *
 * 优势：
 *   - cache 安全共享（只读）
 *   - nodeMetas 每类独立（可变）
 *   - body 完全隔离（纯函数输出）
 */
export function createDerivedInnerClass(ParentInner: any, options: Record<string, any>): any {
    const { type, cls, itemsCls, config, nodeOverrides, tplReplaces } = options;

    const body = extractBodyFromOptions(options);

    let cache, nodeMetas;
    const hasTplReplaces = tplReplaces && Object.keys(tplReplaces).length > 0;

    if (hasTplReplaces) {
        ({ cache, nodeMetas } = TemplateDeriver.deriveWithTplReplaces(
            (ParentInner as any)._cache,
            (ParentInner as any)._nodeMetas,
            tplReplaces,
            nodeOverrides,
            ParentInner
        ));
    } else {
        ({ cache, nodeMetas } = TemplateDeriver.derive(
            (ParentInner as any)._cache,
            (ParentInner as any)._nodeMetas,
            nodeOverrides
        ));
    }

    let mergedBody = BodyMerger.merge((ParentInner as any)._body, body);

    if (type) {
        mergedBody = { ...mergedBody, type };
    }

    const mergedNodeOverrides = BodyMerger.mergeNodeOverrides(
        (ParentInner as any)._nodeOverrides,
        nodeOverrides || {}
    );

    const NewClass = class extends TemplateComponent {
        constructor(props?: Record<string, any>) {
            super();
            templateComponentConstructor.call(this, props);
        }
    };

    (NewClass as any)._tpl = ParentInner._tpl;
    (NewClass as any)._body = mergedBody;
    (NewClass as any)._cache = cache;
    (NewClass as any)._nodeMetas = nodeMetas;
    (NewClass as any)._nodeOverrides = mergedNodeOverrides;
    (NewClass as any)._i18nNodes = cache.i18nNodes;

    if (hasTplReplaces) {
        applyChildNodeProps(NewClass, nodeMetas, cache.i18nNodes);
    }

    const parentTplEvents = (ParentInner as any)._tplEvents;
    const childTplEvents = options.tplEvents;
    if (parentTplEvents || childTplEvents) {
        const mergedTplEvents = mergeTplEvents(parentTplEvents, childTplEvents);
        (NewClass as any)._tplEvents = mergedTplEvents;
        const { DelegatedEventEngine } = require('./DelegatedEventEngine');
        (NewClass as any)._delegatedEventRules =
            DelegatedEventEngine.compileTplEvents(mergedTplEvents);
    }

    (NewClass as any)._templateCompiled = true;

    const overrides = getOverridesList(mergedBody);
    const replaces = getReplacesSet(mergedBody);
    (NewClass as any)._overrideQueues = collectOverrideHooks(
        ParentInner._body,
        mergedBody,
        (ParentInner as any)._overrideQueues
    );

    applyBodyToClass(NewClass, mergedBody);

    wrapOverrideMethodsOnProto(NewClass.prototype, overrides, replaces);

    if (cls || itemsCls) {
        const nodesConfig: Record<string, any> = mergedBody.nodes ?? {};
        if (cls) {
            nodesConfig.root = { ...(nodesConfig.root || {}), addCls: cls };
        }
        if (itemsCls) {
            nodesConfig.itemContainer = { ...(nodesConfig.itemContainer || {}), addCls: itemsCls };
        }
        (NewClass as any)._nodes = nodesConfig;
    }

    attachStaticMethods(NewClass);

    return NewClass;
}

function mergeTplEvents(
    parent: Record<string, any> | undefined,
    child: Record<string, any> | undefined
): Record<string, any> {
    if (!parent) return child || {};
    if (!child) return parent;
    const result: Record<string, any> = { ...parent };
    for (const [nodeName, decl] of Object.entries(child)) {
        if (result[nodeName] && !Array.isArray(result[nodeName]) && !Array.isArray(decl)) {
            result[nodeName] = { ...result[nodeName], ...decl };
        } else {
            result[nodeName] = decl;
        }
    }
    return result;
}
