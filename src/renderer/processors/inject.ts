/**
 * INJECT 处理器
 *
 * 注入额外能力（Layout 定义中声明的 abilities）
 */

import type { RenderProcessor, RenderContext } from '../RenderContext';
import { RenderWeight, RenderPhase } from '../RenderContext';

export const injectProcessor: RenderProcessor = {
    name: 'render-inject',
    weight: RenderWeight.INJECT,
    phases: [RenderPhase.INIT],
    description: '注入额外能力',

    async execute(ctx: RenderContext): Promise<void> {
        if (!ctx.component) return;

        // 如果 Layout 定义中声明了额外的 abilities，注入到组件
        const extraAbilities = ctx.node.props?.abilities;
        if (Array.isArray(extraAbilities) && extraAbilities.length > 0) {
            // 通过 ComposableBase 的 setupAbilities 注入额外能力
            // setupAbilityDefinition 是 private，但组件的 [key: string]: any 允许动态属性
            for (const ability of extraAbilities) {
                if (ability && typeof ability === 'object') {
                    // 遍历 ability 的属性，手动注入到组件实例
                    for (const key of Object.keys(ability)) {
                        const value = ability[key];
                        if (value && typeof value === 'object' && ('get' in value || 'set' in value)) {
                            // getter/setter
                            const descriptor: PropertyDescriptor = {
                                configurable: true,
                                enumerable: true,
                            };
                            if ('get' in value) descriptor.get = value.get;
                            if ('set' in value) descriptor.set = value.set;
                            Object.defineProperty(ctx.component, key, descriptor);
                        } else if (typeof value === 'function') {
                            // 方法
                            (ctx.component as any)[key] = value.bind(ctx.component);
                        } else {
                            // 普通值
                            (ctx.component as any)[key] = value;
                        }
                    }
                }
            }
        }
    },
};
