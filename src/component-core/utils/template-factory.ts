/**
 * template-factory.ts — 模板组件工厂
 *
 * 双层架构：
 *   createInnerClass     → 创建内部类（TemplateComponent 子类，立即编译，完整组件）
 *   createComponentFactory → 创建闭包类（工厂函数，按 when 条件选择内部类实例）
 *   createReplaceFactory   → 基于已有闭包类创建派生闭包类
 *
 * 模板选择机制：
 *   - 单模板（tpl: TplNode）→ 直接使用，无条件
 *   - 多模板（tpl: TplVariant[]）→ 遍历变体，when(props) 首个为 true 的胜出
 *   - when 省略 → 兜底匹配
 *   - 全部不匹配 → 抛出 ComponentError

 */

import type { ComponentTemplate, TplNode, TplVariant, BodyDef } from '../types';
import { copyPrototypeMethods, copyStaticMethods } from './class-copy';
import { compilePendingTemplate } from './template-compiler';
import { initFromTemplate } from './template-init';
import { Logger } from '@/logger';
import { COMPONENT_LIFECYCLE_EVENTS } from '@/events';
import { deepMerge } from '@/utils/object/clone';
import type { AbilityDefinition } from '@/composable';
import { initForgedState } from '@/composable';
import { ComponentError, KernelErrorCode } from '@/error';
import { TemplateComponent } from '../TemplateComponent';

function initInstanceData(instance: any): void {
    instance.meta = {};
    instance.props = {};
    instance.dirtySet = new Set();
    instance._initializing = false;
}

// ══════════════════════════════════════════════════════════════
// 内部类创建（TemplateComponent 子类，完整组件）
// ══════════════════════════════════════════════════════════════

const LIFECYCLE_HOOKS = new Set([
    'onBeforeInit',
    'onAfterInit',
    'onMounted',
    'onUpdated',
    'onBeforeUnmount',
    'onBeforeDispose',
    'onDisposed',
]);

/**
 * 创建内部类 — 立即编译模板，完整组件类
 */
export function createInnerClass(
    ParentClass: any,
    tpl: TplNode,
    body?: BodyDef,
    extraAbilities?: AbilityDefinition[]
): any {
    const InnerClass = function (this: any, props?: Record<string, any>) {
        initForgedState(this);
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
    };

    copyPrototypeMethods(ParentClass, InnerClass);
    copyStaticMethods(ParentClass, InnerClass);

    compilePendingTemplate(InnerClass, tpl, Logger.for(InnerClass), body);

    if (extraAbilities && extraAbilities.length > 0) {
        const ComposableInner = (InnerClass as any).with(extraAbilities);
        return ComposableInner;
    }

    (InnerClass as any).create = function (props?: Record<string, any>): any {
        const instance = Object.create(this.prototype);
        this.call(instance, props);
        return instance;
    };

    return InnerClass;
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
// 闭包类创建（工厂函数，按 when 条件返回内部类实例）
// ══════════════════════════════════════════════════════════════

/**
 * 创建闭包类 — 工厂函数
 *
 * @param templates - 模板配置
 * @returns 闭包类，new ClosureClass(props) 返回内部类实例
 */
export function createComponentFactory(templates: ComponentTemplate): any {
    const variants: VariantEntry[] = [];
    const body = templates.body;

    if (Array.isArray(templates.tpl)) {
        for (const variant of templates.tpl) {
            variants.push({
                innerClass: createInnerClass(TemplateComponent, variant.tpl, body),
                when: variant.when,
            });
        }
    } else {
        variants.push({
            innerClass: createInnerClass(TemplateComponent, templates.tpl, body),
        });
    }

    const ClosureClass = function (this: any, props?: Record<string, any>) {
        const InnerClass = selectVariant(variants, props);
        return new InnerClass(props);
    };

    ClosureClass._variants = variants;
    ClosureClass._isClosureClass = true;

    ClosureClass.create = function (props?: Record<string, any>): any {
        const InnerClass = selectVariant(variants, props);
        return InnerClass.create(props);
    };

    ClosureClass.with = function (abilities: AbilityDefinition[]): any {
        const newVariants: VariantEntry[] = variants.map(v => ({
            innerClass: v.innerClass.with(abilities),
            when: v.when,
        }));
        const NewClosureClass = function (this: any, props?: Record<string, any>) {
            const Inner = selectVariant(newVariants, props);
            return new Inner(props);
        };
        NewClosureClass._variants = newVariants;
        NewClosureClass._isClosureClass = true;
        NewClosureClass.create = ClosureClass.create;
        NewClosureClass.with = ClosureClass.with;
        NewClosureClass.replace = ClosureClass.replace;
        return NewClosureClass;
    };

    ClosureClass.replace = function (replaceOptions: any): any {
        return createReplaceFactory(ClosureClass, replaceOptions);
    };

    return ClosureClass;
}

/**
 * 创建派生闭包类 — 基于已有闭包类的 replace
 */
export function createReplaceFactory(
    ParentClosure: any,
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
    const parentVariants: VariantEntry[] = ParentClosure._variants || [];
    const newVariants: VariantEntry[] = parentVariants.map(v => ({
        innerClass: createDerivedInnerClass(v.innerClass, {
            type,
            cls,
            itemsCls,
            config,
            nodeOverrides,
            body,
        }),
        when: v.when,
    }));

    const ClosureClass = function (this: any, props?: Record<string, any>) {
        const InnerClass = selectVariant(newVariants, props);
        return new InnerClass(props);
    };

    ClosureClass._variants = newVariants;
    ClosureClass._isClosureClass = true;

    ClosureClass.create = function (props?: Record<string, any>): any {
        const InnerClass = selectVariant(newVariants, props);
        return InnerClass.create(props);
    };

    ClosureClass.with = ParentClosure.with;
    ClosureClass.replace = ParentClosure.replace;

    return ClosureClass;
}

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

    const NewClass = function (this: any, props?: Record<string, any>) {
        initInstanceData(this);

        ParentInner.call(this, config ? { ...config, ...props } : props);

        if (type) this.type = type;
        if (cls) this.el?.classList.add(...cls.split(/\s+/).filter(Boolean));
        if (itemsCls) {
            const containerEl = this.nodeMap?.itemContainer?.el;
            if (containerEl) containerEl.classList.add(...itemsCls.split(/\s+/).filter(Boolean));
        }
    };

    copyPrototypeMethods(ParentInner, NewClass);
    copyStaticMethods(ParentInner, NewClass);

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

    (NewClass as any).create = function (props?: Record<string, any>): any {
        const instance = Object.create(this.prototype);
        this.call(instance, props);
        return instance;
    };

    return NewClass;
}
