/**
 * template-factory.ts — 模板组件工厂
 *
 * 使用扁平复制（非继承）创建组件类，避免链式污染。
 * withTemplate / replace 的核心逻辑在此，TemplateComponent 静态方法调用这些工厂。
 */

import type { ComponentTemplate } from '../types/component-template';
import { copyPrototypeMethods, copyStaticMethods } from './class-copy';
import { compilePendingTemplate } from './template-compiler';
import { initFromTemplate } from './template-init';
import { Logger } from '@/logger';

function initInstanceData(instance: any): void {
    instance.meta = {};
    instance.props = {};
    instance.dirtySet = new Set();
    instance._initializing = false;
}

export function createTemplateClass(ParentClass: any, template: ComponentTemplate): any {
    const NewClass = function (this: any, props?: Record<string, any>) {
        initInstanceData(this);
        this._templateInitialized = false;

        if (typeof this.onBeforeInit === 'function') {
            this.onBeforeInit(props);
        }

        const ctor = this.constructor as any;

        if (!ctor._templateCompiled) {
            compilePendingTemplate(ctor, template, Logger.for(ctor));
        }

        initFromTemplate(this, props);

        if (ctor.type) this.type = ctor.type;

        this._templateInitialized = true;

        if (typeof this.onAfterInit === 'function') {
            this.onAfterInit(props);
        }
    };

    copyPrototypeMethods(ParentClass, NewClass);
    copyStaticMethods(ParentClass, NewClass);

    (NewClass as any)._pendingTemplate = template;
    (NewClass as any)._templateCompiled = false;
    (NewClass as any).create = function (props?: Record<string, any>): any {
        const instance = Object.create(this.prototype);
        this.call(instance, props);
        return instance;
    };

    return NewClass;
}

export function createReplaceClass(
    ParentClass: any,
    options: {
        type?: string;
        cls?: string;
        itemsCls?: string;
        config?: Record<string, any>;
        body?: Record<string, any>;
    }
): any {
    const { type, cls, itemsCls, config, body } = options;

    const NewClass = function (this: any, props?: Record<string, any>) {
        initInstanceData(this);

        ParentClass.call(this, config ? { ...config, ...props } : props);

        if (type) this.type = type;
        if (cls) this.el?.classList.add(...cls.split(/\s+/).filter(Boolean));
        if (itemsCls) {
            const containerEl = this.nodeMap?.itemContainer?.el;
            if (containerEl) containerEl.classList.add(...itemsCls.split(/\s+/).filter(Boolean));
        }
    };

    copyPrototypeMethods(ParentClass, NewClass);
    copyStaticMethods(ParentClass, NewClass);

    if (body) {
        const proto = NewClass.prototype;
        const descs = Object.getOwnPropertyDescriptors(body);
        for (const [key, desc] of Object.entries(descs)) {
            if (key === 'type') continue;
            Object.defineProperty(proto, key, desc);
        }
    }

    return NewClass;
}
