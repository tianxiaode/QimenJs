/**
 * NavItemGroupComponent 导航项组组件
 *
 * 从 ItemGroupComponent 派生，固化导航栏领域逻辑：
 * - 固定 itemType 为 'NavItem'
 * - 固定 eventKey 为 'nav'
 * - 内置选中态管理（activeIndex）
 * - 扩展转发 select 事件
 *
 * 核心操作（继承自 ItemGroup）：
 * - add(data) / removeAt(index) / insert(index, data) / setItems(datas)
 * - sort() / move(from, to)
 *
 * 导航栏扩展操作：
 * - selectAt(index) — 选中指定导航项
 * - activeIndex — 当前选中索引（-1 表示无选中）
 *
 * 事件：
 * - nav:select — 导航项被选中时触发，附带 { item, index }
 * - nav:click — 导航项被点击时触发（继承自 ItemGroup）
 *
 * @example
 * ```js
 * const nav = new NavItemGroupComponent({
 *     items: [
 *         { text: '首页', icon: '🏠', active: true },
 *         { text: '设置', icon: '⚙️' },
 *     ],
 * });
 * nav.on('nav:select', ({ item, index }) => { ... });
 * nav.selectAt(1);
 * ```
 */

import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';
import type { NavItemComponent } from './NavItemComponent';

/** 默认转发的事件类型（在 ItemGroup 默认基础上增加 select） */
const NAV_FORWARD_EVENTS = ['click', 'select'];

/** 导航项组配置 */
export interface NavItemGroupProps {
    /** 排列方向，默认 'horizontal' */
    direction?: 'horizontal' | 'vertical';
    /** 初始子项数据数组 */
    items?: Record<string, any>[];
    /** 子项间距（CSS gap 值），默认 '0' */
    gap?: string;
    /** 根元素额外 CSS 类名 */
    cls?: string;
    /** 子项挂载区额外 CSS 类名 */
    itemsCls?: string;
    /** 初始选中索引，-1 表示无选中，默认 -1 */
    activeIndex?: number;
}

export class NavItemGroupComponent extends ItemGroupComponent {
    /** 当前选中索引 */
    private _activeIndex: number = -1;

    constructor(props?: NavItemGroupProps) {
        super({
            ...props,
            itemType: 'NavItem',
            eventKey: 'nav',
            events: NAV_FORWARD_EVENTS,
            direction: props?.direction ?? 'horizontal',
            gap: props?.gap,
            cls: props?.cls,
            itemsCls: props?.itemsCls,
            items: props?.items,
        });

        this.type = 'NavItemGroup';
        this.el.classList.remove('q-itemgroup');
        this.el.classList.add('q-nav');

        // 初始选中
        if (props?.activeIndex !== undefined && props.activeIndex >= 0) {
            this.selectAt(props.activeIndex);
        }
    }

    /** 当前选中索引（-1 表示无选中） */
    get activeIndex(): number {
        return this._activeIndex;
    }

    /**
     * 选中指定导航项
     *
     * 取消前一个选中项，激活新选中项，触发 nav:select 事件。
     *
     * @param index - 目标索引
     */
    selectAt(index: number): void {
        if (index < 0 || index >= this.count) return;
        if (index === this._activeIndex) return;

        // 取消前一个
        if (this._activeIndex >= 0 && this._activeIndex < this.count) {
            const prevItem = this.getAt(this._activeIndex) as NavItemComponent;
            prevItem.active = false;
        }

        // 激活新项
        const newItem = this.getAt(index) as NavItemComponent;
        newItem.active = true;
        this._activeIndex = index;
    }

    /**
     * 取消选中
     */
    clearSelection(): void {
        if (this._activeIndex >= 0 && this._activeIndex < this.count) {
            const item = this.getAt(this._activeIndex) as NavItemComponent;
            item.active = false;
        }
        this._activeIndex = -1;
    }

    update(props?: Record<string, any>): void {
        super.update(props);
        if (props?.activeIndex !== undefined) {
            this.selectAt(props.activeIndex);
        }
    }
}
