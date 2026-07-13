/**
 * NavItemComponent 导航项组件
 *
 * 独立组件，每个导航项是一个组件实例。
 * 支持图标、文本、激活状态、禁用状态。
 *
 * 模板内容项（由 withTemplate 自动生成 getter/setter）：
 * - navItem:content — 可点击区域（内部事件：data-event="click" → onContent）
 * - navItem:icon — 图标
 * - navItem:text — 文本
 *
 * 事件流：
 * - 内部事件：navItem:content click → onContent
 *   - 调用 onClick 回调（由 ItemGroup 注入，用于事件转发）
 *   - 调用 onSelect 回调
 *
 * @example
 * ```js
 * const item = new NavItemComponent({ text: '首页', icon: '🏠' });
 * item.onSelect = () => { ... };
 * ```
 */

import { TemplateComponent, NAVITEM_TEMPLATE } from '@qimenjs/component-core';

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
    onSelect?: (item: NavItemComponent) => void;
}

export class NavItemComponent extends TemplateComponent.withTemplate(NAVITEM_TEMPLATE) {
    /** 是否激活 */
    private _active: boolean = false;

    /** 是否禁用 */
    private _disabled: boolean = false;

    /** 事件源标识（由 ItemGroup 注入） */
    eventKey: string = '';

    /** 选中回调 */
    onSelect?: (item: NavItemComponent) => void;

    constructor(props?: NavItemProps & Record<string, any>) {
        super(props);

        this.type = 'NavItem';
        this.el.classList.add('q-nav-item');

        if (props?.text) this.text = props.text;
        if (props?.icon) this.icon = props.icon;
        if (props?.active) this._active = props.active;
        if (props?.disabled) this._disabled = props.disabled;
        if (props?.onSelect) this.onSelect = props.onSelect;
        if (props?.eventKey) this.eventKey = props.eventKey;

        this.applyState();
    }

    /** 是否激活 */
    get active(): boolean { return this._active; }
    set active(value: boolean) {
        this._active = value;
        this.applyState();
    }

    /** 是否禁用 */
    get disabled(): boolean { return this._disabled; }
    set disabled(value: boolean) {
        this._disabled = value;
        this.applyState();
    }

    // ─── 内部事件（由模板 event: 'click' 自动绑定） ───

    /**
     * navItem:content 的 click 事件处理
     *
     * DOM 事件名是 dom:click（加前缀），组件 emit 的是 click（无前缀），不会冲突。
     */
    onContent(): void {
        if (this._disabled) return;

        this.logger.debug('[NavItem] onContent, eventKey =', this.eventKey);

        // 发布 click 事件（source=eventKey），供 ItemGroup 转发
        // 不传组件实例，ItemGroup 通过 itemData 配置提取子项属性
        this.emit('click', undefined, { source: this.eventKey || undefined });

        this.onSelect?.(this);
    }

    /** 应用状态到 DOM */
    private applyState(): void {
        this.el.classList.toggle('q-nav-item--active', this._active);
        this.el.classList.toggle('q-nav-item--disabled', this._disabled);

        if (this._disabled) {
            this.el.setAttribute('aria-disabled', 'true');
        } else {
            this.el.removeAttribute('aria-disabled');
        }

        if (this._active) {
            this.el.setAttribute('aria-current', 'page');
        } else {
            this.el.removeAttribute('aria-current');
        }
    }

    update(props?: Partial<NavItemProps> & Record<string, any>): void {
        if (props?.text !== undefined) this.text = props.text;
        if (props?.icon !== undefined) this.icon = props.icon;
        if (props?.active !== undefined) this.active = props.active;
        if (props?.disabled !== undefined) this.disabled = props.disabled;
        if (props?.onSelect !== undefined) this.onSelect = props.onSelect;
    }
}
