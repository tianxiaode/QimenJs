/**
 * NavItemComponent 导航项组件
 *
 * 独立组件，每个导航项是一个组件实例。
 * 支持图标、文本、激活状态、禁用状态。
 *
 * 模板内容项（由 withTemplate 自动生成 getter/setter）：
 * - navItem:content — 可点击区域（内部事件：click → onClick）
 * - navItem:icon — 图标
 * - navItem:text — 文本
 *
 * 事件流：
 * - 内部事件：navItem:content click → onClick（handler: true 自动推导）
 * - 桥接事件：bridges: ['click'] → 自动通过 EventBridge 发布
 *   - 不需要代码里手动 this.emit
 *
 * @example
 * ```js
 * const item = new NavItemComponent({ text: '首页', icon: '🏠' });
 * item.onSelect = () => { ... };
 * ```
 */

import { TemplateComponent } from '@qimenjs/component-core';

/** 导航项配置 */
export interface NavItemProps {
    /** 导航项文本 */
    text?: string;
    /** 图标（文本或 HTML） */
    icon?: string;
    /** 是否激活 */
    active?: boolean;
    /** 是否禁用 */
    disabled?: boolean;
    /** 选中回调 */
    onSelect?: (item: any) => void;
}

export let NavItemComponent = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-nav-item',
        children: [
            { tag: 'div', name: 'navItem:content', events: { click: { handler: true, bridges: ['click'] } }, className: 'q-nav-item__content', children: [
                { tag: 'span', name: 'navItem:icon', content: 'icon', className: 'q-nav-item__icon' },
                { tag: 'span', name: 'navItem:text', content: 'text', className: 'q-nav-item__text' },
            ]},
        ]
    },
    body: {
        type: 'NavItem',

        /** 是否激活 */
        active: false,

        /** 是否禁用 */
        disabled: false,

        /** 事件源标识（由 ItemGroup 注入） */
        eventKey: '',

        /** 选中回调 */
        onSelect: undefined as ((item: any) => void) | undefined,

        /**
         * navItem:content 的 click 事件处理
         *
         * 由模板 events: { click: { handler: true } } 自动绑定到 onClick handler
         * 桥接事件由 bridges: ['click'] 自动通过 EventBridge 发布
         * 同时 emit 组件级 click 事件，供 ItemGroup 等父组件通过 instance.on('click') 监听
         */
        onClick(): void {
            if (this.disabled) return;
            this.emit('click', { item: this, index: this.props?.index });
            this.onSelect?.(this);
        },

        /** 应用状态到 DOM */
        _applyState(): void {
            this.el.classList.toggle('q-nav-item--active', this.active);
            this.el.classList.toggle('q-nav-item--disabled', this.disabled);

            if (this.disabled) {
                this.el.setAttribute('aria-disabled', 'true');
            } else {
                this.el.removeAttribute('aria-disabled');
            }

            if (this.active) {
                this.el.setAttribute('aria-current', 'page');
            } else {
                this.el.removeAttribute('aria-current');
            }
        },

        setActive(value: boolean): void {
            this.active = value;
            this._applyState();
        },

        setDisabled(value: boolean): void {
            this.disabled = value;
            this._applyState();
        },

        update(props?: Partial<NavItemProps> & Record<string, any>): void {
            if (props?.text !== undefined) this.text = props.text;
            if (props?.icon !== undefined) this.icon = props.icon;
            if (props?.active !== undefined) this.setActive(props.active);
            if (props?.disabled !== undefined) this.setDisabled(props.disabled);
            if (props?.onSelect !== undefined) this.onSelect = props.onSelect;
        },
    },
});

export type NavItemComponent = InstanceType<typeof NavItemComponent>;
