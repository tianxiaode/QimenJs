/**
 * SpaceComponent 间距组件
 *
 * 渲染为指定间距的空白
 * abilities: [LayoutAbility]
 */

import { ComponentBase } from '@qimenjs/component-core';
import { LayoutAbility } from '@qimenjs/component-abilities';

export class SpaceComponent extends ComponentBase {
    static override readonly abilities = [LayoutAbility];

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-space');

        // 设置间距大小
        const size = props?.size || 'md';
        const spacingMap: Record<string, string> = {
            xs: 'var(--q-spacing-xs)',
            sm: 'var(--q-spacing-sm)',
            md: 'var(--q-spacing-md)',
            lg: 'var(--q-spacing-lg)',
            xl: 'var(--q-spacing-xl)',
        };

        if (props?.direction === 'vertical') {
            this.el.style.height = spacingMap[size] || spacingMap.md;
        } else {
            this.el.style.width = spacingMap[size] || spacingMap.md;
            this.el.style.display = 'inline-block';
        }
    }
}
