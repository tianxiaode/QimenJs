/**
 * template-factory.ts — 模板组件工厂
 *
 * 核心函数：
 *   createInnerClass   → class extends ParentClass，编译模板，完整组件类
 *   createComponentFactory → withTemplate 入口
 *   createReplaceFactory   → replace 入口
 *
 * 单模板：直接返回 InnerClass（真正的 class），无需闭包封装
 * 多模板：返回简单工厂函数，按 when 选择变体后实例化
 *
 * InnerClass 自带 .create / .with / .replace 静态方法，支持链式调用。
 */

import type { ComponentTemplate, TplNode, BodyDef } from '../types';
import { compilePendingTemplate } from './template-compiler';
import { initFromTemplate } from './template-init';
import { Logger } from '@/logger';
import { COMPONENT_LIFECYCLE_EVENTS } from '@/events';
import { deepMerge } from '@/utils/object/clone';
import type { AbilityDefinition } from '@/composable';
import { withAbilities } from '@/composable';
import { ComponentError, KernelErrorCode } from '@/error';
import { TemplateComponent } from '../TemplateComponent';

function initInstanceData(instance: any): void {
    instance.meta = {};
    instance.props = {};
    instance.dirtySet = new Set();
    instance._initializing = false;
}

const LIFECYCLE_HOOKS = new Set([
    'onBeforeInit',
    'onAfterInit',
    'onMounted',
    'onUpdated',
    'onBeforeUnmount',
    'onBeforeDispose',
    'onDisposed',
]);

// ══════════════════════════════════════════════════════════════
// 内部类创建（class extends ParentClass，完整组件）
// ══════════════════════════════════════════════════════════════

function attachStaticMethods(Cls: any): void {
    Cls.create = function (props?: Record<string, any>): any {
        return new Cls(props);
    };

    Cls.with = function (abilities: AbilityDefinition[]): any {
        return createAbilityInnerClass(Cls, abilities);
    };

    Cls.replace = function (options: any): any {
        return createDerivedInnerClass(Cls, options);
    };
}

/**
 * 创建内部类 — class extends ParentClass，立即编译模板
 *
 * 流程：
 *   1. class extends ParentClass 创建新类
 *   2. 构造函数中完成实例化初始化
 *   3. compilePendingTemplate 编译模板并拆解到新类
 *   4. withAbilities 附加额外能力
 *   5. 挂载 .create / .with / .replace 静态方法
 */
export function createInnerClass(
    ParentClass: any,
    tpl: TplNode,
    body?: BodyDef,
    extraAbilities?: AbilityDefinition[]
): any {
    const InnerClass = class extends ParentClass {
        constructor(props?: Record<string, any>) {
            super();

            initInstanceData(this);
            this._templateInitialized = false;

            if (typeof this.onInitState === 'function') {
                Object.assign(this, this.onInitState());
            }

            if (typeof this.onBeforeInit === 'function') {
                this.onBeforeInit(props);
            }

            initFromTemplate(this, props);

            const ctor = this.constructor as any;
            if (ctor.type) this.type = ctor.type;

            this._templateInitialized = true;

            if (typeof this.onAfterInit === 'function') {
                this.onAfterInit(props);
            }

            if (typeof this._emitLifecycleEvent === 'function') {
                this._emitLifecycleEvent(COMPONENT_LIFECYCLE_EVENTS.INIT, { props });
            }
        }
    };

    compilePendingTemplate(InnerClass, tpl, Logger.for(InnerClass), body);

    if (extraAbilities && extraAbilities.length > 0) {
        withAbilities(InnerClass, extraAbilities);
    }

    attachStaticMethods(InnerClass);

    return InnerClass;
}

/**
 * 基于已有内部类创建附加能力的派生类
 *
 * class extends ParentInner，withAbilities 附加能力。
 * 不需要重新编译模板，父类的编译结果通过原型链继承。
 */
function createAbilityInnerClass(ParentInner: any, abilities: AbilityDefinition[]): any {
    const NewClass = class extends ParentInner {
        constructor(props?: Record<string, any>) {
            super(props);
        }
    };

    withAbilities(NewClass, abilities);
    attachStaticMethods(NewClass);

    return NewClass;
}

/**
 * 基于已有内部类创建派生类（replace 场景）
 */
function createDerivedInnerClass(
    ParentInner: any,
    options: {
        type?: string;
        cls?: string;
        itemsCls?: string;
        config?: Record<string, any>;
        nodeOverrides?: Record<string, Record<string, any>>;
        body?: Record<string, any>;
    }
): any {
    const { type, cls, itemsCls, config, nodeOverrides, body } = options;

    const NewClass = class extends ParentInner {
        constructor(props?: Record<string, any>) {
            super(config ? { ...config, ...props } : props);

            if (type) this.type = type;
            if (cls) this.el?.classList.add(...cls.split(/\s+/).filter(Boolean));
            if (itemsCls) {
                const containerEl = this.nodeMap?.itemContainer?.el;
                if (containerEl)
                    containerEl.classList.add(...itemsCls.split(/\s+/).filter(Boolean));
            }
        }
    };

    if (nodeOverrides) {
        const parentOverrides = (ParentInner as any)._nodeOverrides;
        (NewClass as any)._nodeOverrides = parentOverrides
            ? deepMerge(parentOverrides, nodeOverrides)
            : nodeOverrides;
    }

    if (body) {
        const proto = NewClass.prototype;
        const descs = Object.getOwnPropertyDescriptors(body);
        for (const [key, desc] of Object.entries(descs)) {
            if (key === 'type') continue;

            if (LIFECYCLE_HOOKS.has(key) && typeof desc.value === 'function') {
                const parentMethod = ParentInner.prototype[key];
                if (typeof parentMethod === 'function') {
                    const childMethod = desc.value;
                    proto[key] = function (this: any, ...args: any[]): void {
                        parentMethod.call(this, ...args);
                        childMethod.call(this, ...args);
                    };
                    continue;
                }
            }

            Object.defineProperty(proto, key, desc);
        }
    }

    attachStaticMethods(NewClass);

    return NewClass;
}

// ══════════════════════════════════════════════════════════════
// 模板选择：根据 when 条件匹配变体
// ══════════════════════════════════════════════════════════════

interface VariantEntry {
    innerClass: any;
    when?: (config: Record<string, any>) => boolean;
}

function selectVariant(variants: VariantEntry[], props?: Record<string, any>): any {
    for (const entry of variants) {
        if (!entry.when || entry.when(props ?? {})) {
            return entry.innerClass;
        }
    }
    throw new ComponentError('没有匹配的模板变体', KernelErrorCode.COMPONENT_TPL_KEY_NOT_FOUND, {
        props,
    });
}

// ══════════════════════════════════════════════════════════════
// withTemplate 入口
// ══════════════════════════════════════════════════════════════

/**
 * 创建组件工厂
 *
 * 单模板 → 直接返回 InnerClass（真正的 class）
 * 多模板 → 返回工厂函数，按 when 选择变体后实例化
 */
export function createComponentFactory(templates: ComponentTemplate): any {
    const body = templates.body;

    if (!Array.isArray(templates.tpl)) {
        return createInnerClass(TemplateComponent, templates.tpl, body);
    }

    const variants: VariantEntry[] = templates.tpl.map(v => ({
        innerClass: createInnerClass(TemplateComponent, v.tpl, body),
        when: v.when,
    }));

    const factory = function (props?: Record<string, any>): any {
        const InnerClass = selectVariant(variants, props);
        return new InnerClass(props);
    };

    factory._variants = variants;

    factory.create = function (props?: Record<string, any>): any {
        const InnerClass = selectVariant(variants, props);
        return new InnerClass(props);
    };

    factory.with = function (abilities: AbilityDefinition[]): any {
        const newVariants: VariantEntry[] = variants.map(v => ({
            innerClass: createAbilityInnerClass(v.innerClass, abilities),
            when: v.when,
        }));
        return createVariantFactory(newVariants);
    };

    factory.replace = function (replaceOptions: any): any {
        return createReplaceFactory(variants, replaceOptions);
    };

    return factory;
}

function createVariantFactory(variants: VariantEntry[]): any {
    const factory = function (props?: Record<string, any>): any {
        const InnerClass = selectVariant(variants, props);
        return new InnerClass(props);
    };

    factory._variants = variants;

    factory.create = function (props?: Record<string, any>): any {
        const InnerClass = selectVariant(variants, props);
        return new InnerClass(props);
    };

    factory.with = function (abilities: AbilityDefinition[]): any {
        const newVariants: VariantEntry[] = variants.map(v => ({
            innerClass: createAbilityInnerClass(v.innerClass, abilities),
            when: v.when,
        }));
        return createVariantFactory(newVariants);
    };

    factory.replace = function (replaceOptions: any): any {
        return createReplaceFactory(variants, replaceOptions);
    };

    return factory;
}

// ══════════════════════════════════════════════════════════════
// replace 入口
// ══════════════════════════════════════════════════════════════

/**
 * 创建派生组件
 *
 * 基于已有 variants 创建派生 variants，每个变体 class extends 原变体内部类。
 */
export function createReplaceFactory(
    parentVariants: VariantEntry[],
    options: {
        type?: string;
        cls?: string;
        itemsCls?: string;
        config?: Record<string, any>;
        nodeOverrides?: Record<string, Record<string, any>>;
        body?: Record<string, any>;
    }
): any {
    const newVariants: VariantEntry[] = parentVariants.map(v => ({
        innerClass: createDerivedInnerClass(v.innerClass, options),
        when: v.when,
    }));

    return createVariantFactory(newVariants);
}
