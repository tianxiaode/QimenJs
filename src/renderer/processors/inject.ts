/**
 * INJECT 处理器
 *
 * 注入 Layout 定义中 meta 声明的额外能力、方法和自定义数据。
 *
 * meta 是一个扁平对象，渲染时用与 ComposableBase.setupAbilityDefinition
 * 相同的 Object.defineProperty 逻辑复制到组件实例：
 * - meta.abilities 数组：展开后逐个注入（getter/setter/方法/值）
 * - meta 中的函数：bind 到组件实例后注入
 * - meta 中的 getter/setter 对象：直接作为 PropertyDescriptor 注入
 * - meta 中的普通值：直接注入
 *
 * @example
 * ```js
 * {
 *     type: 'Toolbar',
 *     meta: {
 *         abilities: [CrudAbility, PaginationAbility],
 *         onEntityCreated(data) { this.mgr.reload(); },
 *         customTitle: '我的工具栏',
 *     }
 * }
 * ```
 */

import type { RenderProcessor, RenderContext } from '../RenderContext';
import { RenderWeight, RenderPhase } from '../RenderContext';

/**
 * 为单个属性值创建 PropertyDescriptor
 *
 * 与 ComposableBase.createPropertyDescriptor 逻辑完全一致
 */
function createPropertyDescriptor(component: any, value: any): PropertyDescriptor {
    // getter/setter 对象
    if (value && typeof value === 'object' && ('get' in value || 'set' in value)) {
        const descriptor: PropertyDescriptor = {
            configurable: true,
            enumerable: value.enumerable ?? true,
        };
        if ('get' in value) {
            descriptor.get = value.get;
        }
        if ('set' in value) {
            descriptor.set = value.set;
        }
        return descriptor;
    }

    // 方法：bind 到组件实例
    if (typeof value === 'function') {
        return {
            value: value.bind(component),
            writable: true,
            configurable: true,
            enumerable: true,
        };
    }

    // 普通值
    return {
        value,
        writable: true,
        configurable: true,
        enumerable: true,
    };
}

/**
 * 将一个 AbilityDefinition 注入到组件实例
 *
 * 遍历定义的所有属性，用 Object.defineProperty 复制到组件
 */
function injectDefinition(component: any, definition: Record<string | symbol, any>): void {
    const keys = [...Object.keys(definition), ...Object.getOwnPropertySymbols(definition)];

    for (const key of keys) {
        const value = definition[key];
        const descriptor = createPropertyDescriptor(component, value);
        Object.defineProperty(component, key, descriptor);
    }
}

export const injectProcessor: RenderProcessor = {
    name: 'render-inject',
    weight: RenderWeight.INJECT,
    phases: [RenderPhase.INIT],
    description: '注入 meta 声明的额外能力、方法和数据',

    async execute(ctx: RenderContext): Promise<void> {
        if (!ctx.component) return;

        const meta = ctx.node.meta;
        if (!meta || typeof meta !== 'object') return;

        // 1. 注入 abilities 数组中的能力定义
        if (Array.isArray(meta.abilities)) {
            for (const ability of meta.abilities) {
                if (ability && typeof ability === 'object') {
                    injectDefinition(ctx.component, ability);
                }
            }
        }

        // 2. 注入 meta 中的其他属性（方法、getter/setter、自定义数据）
        for (const key of Object.keys(meta)) {
            if (key === 'abilities') continue; // abilities 已单独处理
            const value = meta[key];
            const descriptor = createPropertyDescriptor(ctx.component, value);
            Object.defineProperty(ctx.component, key, descriptor);
        }
    },
};
