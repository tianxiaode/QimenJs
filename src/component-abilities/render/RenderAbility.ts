/**
 * RenderAbility 渲染能力
 *
 * 提供 renderer 属性和 renderChild/renderChildren 方法
 */

import type { AbilityDefinition } from '@qimenjs/composable';

export const RenderAbility: AbilityDefinition = {
    /**
     * Renderer 单例引用
     */
    renderer: {
        get(): any {
            return this.abilityState('RenderAbility:renderer', () => {
                const { Renderer } = require('@qimenjs/renderer');
                return Renderer.getInstance();
            });
        },
    },

    /**
     * 渲染单个子组件
     *
     * @param layout - Layout 节点定义
     * @param context - 可选的渲染上下文
     * @returns 组件实例
     */
    async renderChild(layout: any, context?: any): Promise<any> {
        const ctx = {
            ...context,
            parent: this,
            container: this.el,
        };

        const result = await this.renderer.render(layout, ctx);
        const child = result.context?.component;

        if (child && typeof this.addChild === 'function') {
            this.addChild(child);
        }

        return child;
    },

    /**
     * 渲染多个子组件
     *
     * @param layouts - Layout 节点定义数组
     * @param context - 可选的渲染上下文
     * @returns 组件实例数组
     */
    async renderChildren(layouts: any[], context?: any): Promise<any[]> {
        const children: any[] = [];

        for (const layout of layouts) {
            const child = await this.renderChild(layout, context);
            if (child) {
                children.push(child);
            }
        }

        return children;
    },
};
