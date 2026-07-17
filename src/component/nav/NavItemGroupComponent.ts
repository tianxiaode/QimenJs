/**
 * NavItemGroupComponent 导航项组组件
 *
 * 从 ItemGroupComponent 派生，固化导航栏领域逻辑：
 * - 固定 itemType 为 'NavItem'
 * - 固定 eventKey 为 'nav'
 * - 内置选中态管理（activeIndex）
 * - 子项 click 时自动触发 select 事件
 */

import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';
import type { NavItemComponent } from './NavItemComponent';
import type { NavOverlayOptions } from './NavItemComponent';

const NAV_FORWARD_EVENTS = ['click', 'close'];

export interface NavItemGroupProps {
    direction?: 'horizontal' | 'vertical';
    items?: Record<string, any>[];
    gap?: string;
    cls?: string;
    itemsCls?: string;
    activeIndex?: number;
    mode?: 'expanded' | 'collapsed';
    maxDepth?: number;
    overlayOptions?: NavOverlayOptions;
    overlayComponent?: any;
}

export let NavItemGroupComponent = class extends ItemGroupComponent {
    private _activeIndex: number = -1;
    private _mode: 'expanded' | 'collapsed';
    private _maxDepth: number;
    private _overlayOptions?: NavOverlayOptions;
    private _overlayComponent?: any;

    constructor(props?: NavItemGroupProps) {
        super({
            itemType: 'NavItem',
            eventKey: 'nav',
            events: NAV_FORWARD_EVENTS,
            direction: props?.direction ?? 'horizontal',
            gap: props?.gap,
            cls: props?.cls,
            itemsCls: props?.itemsCls,
            items: props?.items,
            ...props,
        });

        this.type = 'NavItemGroup';
        this.el.classList.remove('q-itemgroup');
        this.el.classList.add('q-nav');

        this._mode = props?.mode ?? 'expanded';
        this._maxDepth = props?.maxDepth ?? 3;
        this._overlayOptions = props?.overlayOptions;
        this._overlayComponent = props?.overlayComponent;

        this.el.classList.toggle('q-nav--collapsed', this._mode === 'collapsed');

        if (props?.activeIndex !== undefined && props.activeIndex >= 0) {
            this.selectAt(props.activeIndex, true);
        }
    }

    get activeIndex(): number { return this._activeIndex; }
    get mode(): 'expanded' | 'collapsed' { return this._mode; }
    get maxDepth(): number { return this._maxDepth; }

    selectAt(index: number, silent: boolean = false): void {
        if (index < 0 || index >= this.count) return;
        if (index === this._activeIndex) return;

        if (this._activeIndex >= 0 && this._activeIndex < this.count) {
            const prevItem = this.getAt(this._activeIndex) as NavItemComponent;
            prevItem.setActive(false);
        }

        const newItem = this.getAt(index) as NavItemComponent;
        newItem.setActive(true);
        this._activeIndex = index;

        if (!silent) {
            this.emit('select', { ...this._extractItemData(newItem, index) }, { source: this.eventKey || undefined });
        }
    }

    clearSelection(): void {
        if (this._activeIndex >= 0 && this._activeIndex < this.count) {
            const item = this.getAt(this._activeIndex) as NavItemComponent;
            item.setActive(false);
        }
        this._activeIndex = -1;
    }

    setMode(value: 'expanded' | 'collapsed'): void {
        this._mode = value;
        this.el.classList.toggle('q-nav--collapsed', value === 'collapsed');

        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as NavItemComponent;
            item.setMode(value);
        }
    }

    setOverlayOptions(options: NavOverlayOptions): void {
        this._overlayOptions = options;
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as NavItemComponent;
            item.update({ overlayOptions: options });
        }
    }

    update(props?: Record<string, any>): void {
        super.update(props);
        if (props?.activeIndex !== undefined) this.selectAt(props.activeIndex);
        if (props?.mode !== undefined) this.setMode(props.mode);
        if (props?.maxDepth !== undefined) this._maxDepth = props.maxDepth;
        if (props?.overlayOptions !== undefined) this.setOverlayOptions(props.overlayOptions);
    }
};

export type NavItemGroupComponent = InstanceType<typeof NavItemGroupComponent>;
