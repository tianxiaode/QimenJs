/**
 * IconAbility 图标能力
 *
 * 提供组件图标的动态管理，支持多图标（通过 icons 数组声明）。
 * 内部使用 createContentManager 管理图标元素，自动生成闭包方法。
 *
 * 组件通过 static icons 声明图标列表，支持三种形式：
 * - 字符串：`static icons = ['default']` → 无 order
 * - 元组：`static icons = [['default', 10], ['close', 90]]` → 带 order
 * - 对象：`static icons = [{ name: 'default', order: 10 }]` → 完整
 *
 * order 用于 data-position 属性，与 ToolbarAbility 的 position 排序一致。
 *
 * @example
 * ```typescript
 * // 按钮组件
 * class ButtonComponent extends ComponentBase {
 *     static abilities = [IconAbility, TextAbility, ClickAbility];
 *     static icons = ['default'];
 * }
 *
 * // 标题栏组件（带 order）
 * class HeaderComponent extends ComponentBase {
 *     static abilities = [IconAbility, TextAbility, PlaceholderAbility];
 *     static icons = [['default', 10], ['close', 90]];
 * }
 *
 * // 使用
 * btn.setIcon('➕');
 * header.setDefaultIcon('⚠️');
 * header.setCloseIcon('×');
 * ```
 */

import type { AbilityDefinition } from '@qimenjs/composable';
import { createContentManager, normalizeContentDecls, extractContentMeta } from '../content';
import type { ContentItemDecl } from '../content';

export const IconAbility: AbilityDefinition = {
    /**
     * 从 props 初始化图标
     */
    __initProps(props: Record<string, any>): void {
        const rawIcons: ContentItemDecl[] = (this.constructor as any).icons || [];
        if (rawIcons.length === 0) return;

        const configs = normalizeContentDecls(rawIcons);
        const { names, positions } = extractContentMeta(configs);

        createContentManager(this, {
            prefix: 'icon',
            names,
            mode: 'html',
            container: this.el,
            itemClass: (this.constructor as any).iconItemClass,
            positions,
        });

        // 从 props 初始化值
        if (props.icon !== undefined) {
            if (typeof props.icon === 'string') {
                if (names.includes('default')) {
                    this.setIcon(props.icon);
                }
            } else if (Array.isArray(props.icon)) {
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
