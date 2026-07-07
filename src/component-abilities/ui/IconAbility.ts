/**
 * IconAbility 图标能力
 *
 * 提供组件图标的动态管理，支持多图标（通过 names 数组声明）。
 * 内部使用 createContentManager 管理图标元素，自动生成闭包方法。
 *
 * 组件通过 static icons 声明图标名称列表：
 * - 单图标：`static icons = ['default']` → 生成 setIcon / getIcon / icon 属性
 * - 多图标：`static icons = ['toggle', 'action']` → 生成 setToggleIcon / setActionIcon
 *
 * @example
 * ```typescript
 * // 按钮组件
 * class ButtonComponent extends ComponentBase {
 *     static abilities = [IconAbility, TextAbility, ClickAbility];
 *     static icons = ['default'];
 * }
 *
 * // 树节点组件
 * class TreeNodeComponent extends ComponentBase {
 *     static abilities = [IconAbility, TextAbility];
 *     static icons = ['toggle', 'action'];
 * }
 *
 * // 使用
 * btn.setIcon('➕');              // 单图标简化方法
 * node.setToggleIcon('▶');       // 多图标命名方法
 * node.setActionIcon('⋯');
 * node.hideActionIcon();
 * node.setToggleIconClass('expanded');
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { createContentManager } from '../content';

export const IconAbility: AbilityDefinition = {
    /**
     * 从 props 初始化图标
     *
     * 创建 ContentManager，生成闭包方法，从 props 赋初始值。
     */
    __initProps(props: Record<string, any>): void {
        const names: string[] = (this.constructor as any).icons || [];
        if (names.length === 0) return;

        createContentManager(this, {
            prefix: 'icon',
            names,
            mode: 'html',
            container: this.el,
            itemClass: (this.constructor as any).iconItemClass,
        });

        // 从 props 初始化值
        if (props.icon !== undefined) {
            if (typeof props.icon === 'string') {
                // 简写：单个图标
                if (names.includes('default')) {
                    this.setIcon(props.icon);
                }
            } else if (Array.isArray(props.icon)) {
                // 完整：图标数组
                for (const cfg of props.icon) {
                    const capitalName = cfg.name.charAt(0).toUpperCase() + cfg.name.slice(1);
                    const method = `set${capitalName}Icon`;
                    if (typeof this[method] === 'function') {
                        this[method](cfg.value);
                    }
                }
            }
        }
    },
};
