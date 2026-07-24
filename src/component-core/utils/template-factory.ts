/**
 * template-factory.ts — 模板组件工厂
 *
 * 统一构建流程：
 *   createInnerClass   → 创建新类，编译模板，设置 body
 *   createDerivedInnerClass → 基于父类派生，复用编译产物，合并 body，应用 nodeOverrides
 *
 * 核心设计：
 * - createInnerClass 负责首次编译（耗时）
 * - createDerivedInnerClass 复用编译产物（快速），只更新 body 和 nodeOverrides
 */

import type { TplNode, BodyDef } from '../types';
import type { NodeMetadata } from '../types/compiled-types';
import { compilePendingTemplate } from './template-compiler';
import { applyChildNodeProps } from './child-node-props';
import { initFromTemplate } from './template-init';
import { Logger } from '@/logger';
import { COMPONENT_LIFECYCLE_EVENTS } from '@/events';
import type { AbilityDefinition } from '@/composable';
import { withAbilities } from '@/composable';
import { TemplateComponent } from '../TemplateComponent';
import { BODY_SPECIAL_KEYS } from '../types/tpl-body-def';

function initInstanceData(instance: any): void {
    instance.meta = {};
    instance.props = {};
    instance.dirtySet = new Set();
    instance._initializing = false;
}

function templateComponentConstructor(this: any, props?: Record<string, any>): void {
    initInstanceData(this);
    this._templateInitialized = false;

    executeOverrideQueue(this, 'onInitState');

    executeOverrideQueue(this, 'onBeforeInit', props);

    initFromTemplate(this, props);

    const ctor = this.constructor as any;
    if (ctor.type) this.type = ctor.type;

    this._templateInitialized = true;

    executeOverrideQueue(this, 'onAfterInit', props);

    if (typeof this._emitLifecycleEvent === 'function') {
        this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.INIT, { props });
    }
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

function collectOverrideHooks(
    parentBody: Record<string, any> | undefined,
    childBody: Record<string, any>,
    parentQueues?: Record<string, Function[]>
): Record<string, Function[]> {
    const overrides = getOverridesList(childBody);
    const queues: Record<string, Function[]> = {};

    for (const methodName of overrides) {
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

function executeOverrideQueue(instance: any, methodName: string, ...args: any[]): any {
    const ctor = instance.constructor as any;
    const queues = ctor._overrideQueues;
    if (!queues || !queues[methodName]) return;

    const hooks = queues[methodName];
    if (methodName === 'onInitState') {
        const mergedState: Record<string, any> = {};
        for (const hook of hooks) {
            const state = hook.apply(instance, args);
            if (state && typeof state === 'object') {
                Object.assign(mergedState, state);
            }
        }
        Object.assign(instance, mergedState);
        return mergedState;
    } else {
        let lastResult: any;
        for (const hook of hooks) {
            lastResult = hook.apply(instance, args);
        }
        return lastResult;
    }
}

function wrapOverrideMethodsOnProto(proto: any, overrides: string[]): void {
    for (const methodName of overrides) {
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

/**
 * 应用 body 到类的原型和静态属性
 */
function applyBodyToClass(ctor: any, body: Record<string, any> | undefined): void {
    if (!body) return;

    const proto = ctor.prototype;
    const descs = Object.getOwnPropertyDescriptors(body);
    for (const [key, desc] of Object.entries(descs)) {
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
 * 创建内部类 — 编译模板 + 应用 body（首次编译，耗时）
 */
export function createInnerClass(
    ParentClass: any,
    tpl: TplNode,
    body?: BodyDef,
    extraAbilities?: AbilityDefinition[],
    nodeOverrides?: Record<string, Record<string, any>>
): any {
    const InnerClass = class extends ParentClass {
        constructor(props?: Record<string, any>) {
            super();
            templateComponentConstructor.call(this, props);
        }
    };

    InnerClass._tpl = tpl;
    InnerClass._body = body;

    if (nodeOverrides && Object.keys(nodeOverrides).length > 0) {
        (InnerClass as any)._nodeOverrides = nodeOverrides;
    }

    compilePendingTemplate(InnerClass, tpl, Logger.for(InnerClass), body);

    if (body?.nodes) {
        updateNodeMetasFromOverrides(InnerClass._nodeMetas, body.nodes);
    }

    const overrides = getOverridesList(body || {});
    InnerClass._overrideQueues = collectOverrideHooks(undefined, body || {});

    applyBodyToClass(InnerClass, body);

    wrapOverrideMethodsOnProto(InnerClass.prototype, overrides);

    if (extraAbilities && extraAbilities.length > 0) {
        withAbilities(InnerClass, extraAbilities);
    }

    attachStaticMethods(InnerClass);

    return InnerClass;
}

/**
 * 从父类复制编译产物到新类（复用编译结果）
 */
function copyCompiledFromParent(Parent: any, Child: any): void {
    const compiled = Parent._compiledTemplate;
    if (!compiled) return;

    Child._compiledTemplate = {
        ...compiled,
        templateCache: compiled.templateCache,
        body: Child._body,
    };

    Child._nodeMetas = Parent._nodeMetas
        ? JSON.parse(JSON.stringify(Parent._nodeMetas))
        : undefined;

    Child._i18nNodes = Parent._i18nNodes ? [...Parent._i18nNodes] : undefined;

    Child._templateCompiled = true;
}

/**
 * 更新 nodeMetas 中的组件类型（如果有 nodeOverrides）
 */
function updateNodeMetasFromOverrides(
    nodeMetas: Record<string, NodeMetadata> | undefined,
    nodeOverrides: Record<string, Record<string, any>> | undefined
): void {
    if (!nodeMetas || !nodeOverrides) return;

    for (const [nodeName, override] of Object.entries(nodeOverrides)) {
        if (override.type !== undefined && nodeMetas[nodeName]) {
            const meta = nodeMetas[nodeName];
            if (typeof override.type === 'function') {
                meta.componentClass = override.type;
            } else if (typeof override.type === 'string') {
                meta.componentClass = (window as any)[override.type];
            }
        }
    }
}

/**
 * 合并 body — 子 body 覆盖父 body
 *
 * nodes 字段需要深合并（同 mergeNodeOverrides 逻辑），
 * 其他字段保持浅合并。
 */
function mergeBodies(
    parentBody: Record<string, any> | undefined,
    childBody: Record<string, any>
): Record<string, any> {
    if (!parentBody) return childBody;
    const merged = { ...parentBody, ...childBody };
    if (parentBody.nodes && childBody.nodes) {
        merged.nodes = mergeNodeOverrides(parentBody.nodes, childBody.nodes);
    }
    return merged;
}

/**
 * 合并 nodeOverrides — 子覆盖合并到父覆盖
 */
function mergeNodeOverrides(
    parentOverrides: Record<string, Record<string, any>> | undefined,
    childOverrides: Record<string, Record<string, any>>
): Record<string, Record<string, any>> {
    if (!parentOverrides) return { ...childOverrides };
    const result: Record<string, Record<string, any>> = { ...parentOverrides };
    for (const [key, value] of Object.entries(childOverrides)) {
        if (result[key]) {
            result[key] = { ...result[key], ...value };
        } else {
            result[key] = { ...value };
        }
    }
    return result;
}

const REPLACE_OPTION_KEYS = new Set(['type', 'cls', 'itemsCls', 'config', 'nodeOverrides', 'body']);

/**
 * 从 replace options 中提取 body
 */
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
 * 优化：复用父类编译产物，只更新 body 和 nodeOverrides
 *
 * 流程：
 *   1. 创建新类（extends TemplateComponent）
 *   2. 从父类复制编译产物（_compiledTemplate, _nodeMetas, _i18nNodes）
 *   3. 合并 body（child 覆盖 parent）
 *   4. 应用 nodeOverrides 更新 _nodeMetas 中的组件类型
 *   5. 应用 body 到新类
 *   6. 收集 overrides 队列（父→子顺序执行）
 *   7. 包装 overrides 方法为队列调用
 */
export function createDerivedInnerClass(ParentInner: any, options: Record<string, any>): any {
    const { type, cls, itemsCls, config, nodeOverrides } = options;

    const body = extractBodyFromOptions(options);
    const mergedBody = mergeBodies(ParentInner._body, body);

    if (type) {
        mergedBody.type = type;
    }

    const mergedNodeOverrides = mergeNodeOverrides(
        (ParentInner as any)._nodeOverrides,
        nodeOverrides || {}
    );

    const NewClass = class extends TemplateComponent {
        constructor(props?: Record<string, any>) {
            super();
            templateComponentConstructor.call(this, props);
        }
    };

    NewClass._tpl = ParentInner._tpl;
    NewClass._body = mergedBody;
    NewClass._nodeOverrides = mergedNodeOverrides;

    copyCompiledFromParent(ParentInner, NewClass);

    updateNodeMetasFromOverrides(NewClass._nodeMetas, nodeOverrides);

    if (mergedBody.nodes) {
        updateNodeMetasFromOverrides(NewClass._nodeMetas, mergedBody.nodes);
    }

    const overrides = getOverridesList(mergedBody);
    NewClass._overrideQueues = collectOverrideHooks(
        ParentInner._body,
        mergedBody,
        (ParentInner as any)._overrideQueues
    );

    applyBodyToClass(NewClass, mergedBody);

    wrapOverrideMethodsOnProto(NewClass.prototype, overrides);

    if (cls || itemsCls) {
        const nodesConfig: Record<string, any> = mergedBody.nodes ?? {};
        if (cls) {
            nodesConfig.root = { ...(nodesConfig.root || {}), addCls: cls };
        }
        if (itemsCls) {
            nodesConfig.itemContainer = { ...(nodesConfig.itemContainer || {}), addCls: itemsCls };
        }
        NewClass._nodes = nodesConfig;
    }

    attachStaticMethods(NewClass);

    return NewClass;
}
