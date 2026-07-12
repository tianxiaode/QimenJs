/**
 * BadgeComponent 角标组件
 *
 * 独立组件，由 BadgeAbility 创建并挂载到宿主元素上。
 * 自身负责绝对定位、文本更新、显隐控制。
 *
 * abilities: [ContentAbility]
 * 使用 ContentAbility 管理角标文本内容位
 */

import { ComponentBase } from '@qimenjs/component-core';
import { ContentAbility, ContentPrefix } from '@qimenjs/component-abilities';
import { BADGE_TEMPLATE } from '@qimenjs/component-core';

const BadgeBase = ComponentBase.withTemplate(BADGE_TEMPLATE);

export class BadgeComponent extends BadgeBase {
    static readonly abilities = [ContentAbility];

    static readonly contentSlots = {
        [ContentPrefix.TEXT]: ['default'],
    };

    /** 角标位置 */
    private _placement: string = 'top-right';

    /** 角标类型 */
    private _type: string = 'number';

    constructor(props?: Record<string, any>) {
        super(props);

        this.el.classList.add('q-badge');

        // 确保 anchor 有定位上下文
        const anchor = props?.anchor as HTMLElement;
        if (anchor) {
            const anchorPosition = getComputedStyle(anchor).position;
            if (anchorPosition === 'static') {
                anchor.style.position = 'relative';
            }
            anchor.appendChild(this.el);
        }

        // 角标类型
        if (props?.type) this._type = props.type;
        this.applyType();

        // 角标位置
        if (props?.placement) this._placement = props.placement;
        this.applyPlacement();

        // 初始文本
        if (props?.text !== undefined) {
            this.setText(props.text);
        }
    }

    /** 设置角标文本 */
    setText(text: string | number): void {
        this.default = String(text);
    }

    /** 设置角标可见性 */
    setVisible(visible: boolean): void {
        this.el.style.display = visible ? '' : 'none';
    }

    /** 应用角标类型 CSS */
    private applyType(): void {
        this.el.classList.remove(
            'q-badge--dot',
            'q-badge--number',
            'q-badge--text',
        );
        this.el.classList.add(`q-badge--${this._type}`);
    }

    /** 应用角标位置 CSS */
    private applyPlacement(): void {
        this.el.classList.remove(
            'q-badge--top-right',
            'q-badge--top-left',
            'q-badge--bottom-right',
            'q-badge--bottom-left',
        );
        this.el.classList.add(`q-badge--${this._placement}`);
    }
}
