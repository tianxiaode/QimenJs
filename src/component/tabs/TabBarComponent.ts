/**
 * TabBarComponent 标签栏组件
 *
 * 从 ItemGroupPooledComponent 派生，defaultItemType='Tab'。
 * 支持 4 个位置：top、bottom、left、right。
 * 通过 domEvents 处理标签点击、关闭事件。
 *
 * @example
 * ```ts
 * new TabBarComponent({
 *     items: [
 *         { label: '首页', icon: '🏠' },
 *         { label: '设置', icon: '⚙', closable: true },
 *     ],
 *     selectedIndex: 0,
 *     position: 'top',
 * })
 * tabBar.on('select', ({ index }) => { ... })
 * tabBar.on('close', ({ index }) => { ... })
 * ```
 */

import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import type { TabComponent } from './TabComponent';
import { DomEventsMap } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import './tabbar.css';

/** 标签栏位置 */
export type TabBarPosition = 'top' | 'bottom' | 'left' | 'right';

const TabBarComponentDefs: Definitions = {
    options: {
        position: 'top',
        selectedIndex: null,
        size: 'md',
        overflowMode: 'scroll',
    },
} as const;

class TabBarComponent extends ItemGroupPooledComponent {
    static type = 'tab-bar'; // 组件类型
    defaultItemType = 'tab';
    _selectedIndex: number = -1;
    _position: TabBarPosition = 'top';
    _lastToggleIndex: number = -1;

    domEvents?: DomEventsMap | undefined = {
        click: [
            { path: '[items]', handler: '_onTabClick', emits: ['select'], bridges: ['select'] },
            { path: '[items].close', handler: '_onTabClose' },
        ],
    };

    _onTabClick(domEvt: any): void {
        const item = domEvt.targetComponent as TabComponent;
        if (!item || item.disabled) return;
        const target = domEvt?.data?.originalEvent?.target ?? domEvt?.target;
        if (target?.closest?.('.q-tab__close')) return;
        const index = this.indexOf(item);
        if (index < 0) return;
        this._lastToggleIndex = index;
        this.selectAt(index);
    }

    _onTabClose(domEvt: any): void {
        const closeEl = domEvt.targetComponent?.el as Element | undefined;
        if (!closeEl) return;
        const tabEl = closeEl.closest('.q-tab');
        if (!tabEl) return;
        const items = this.items;
        if (!Array.isArray(items)) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i]?.el === tabEl) {
                this.closeAt(i);
                return;
            }
        }
    }

    closeAt(index: number): void {
        if (index < 0 || index >= this.count) return;
        this.removeTabAt(index);
        this.emit('close', { index });
    }

    /** 删除标签并修正选中态（不 emit close，供 closeAt 与外部同步复用） */
    removeTabAt(index: number): void {
        if (index < 0 || index >= this.count) return;
        const item = this.removeAt(index);
        if (item) {
            const poolIdx = this._hiddenItems.indexOf(item);
            if (poolIdx >= 0) this._hiddenItems.splice(poolIdx, 1);
            item.dispose();
        }
        if (this._selectedIndex === index) {
            this._selectedIndex = Math.min(index, this.count - 1);
            if (this._selectedIndex < 0) this._selectedIndex = 0;
        } else if (index < this._selectedIndex) {
            this._selectedIndex--;
        }
        this.setData('selectedIndex', this._selectedIndex, true);
        this._applySelection();
        this._scrollToItem(this.getAt(this._selectedIndex) as TabComponent);
    }

    _onSizeOptionChange(_value: string): void {
        this._propagateSize();
    }

    private _propagateSize(): void {
        const size = this.getData('size');
        if (!size) return;
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i);
            if (item) item.size = size;
        }
    }

    onAfterInit(): void {
        this.addCls('q-tab-bar');
        const container = this.getNodeEl('itemContainer');
        if (container) container.classList.add('q-tab-bar__items');

        super.onAfterInit();

        this._position = this.getData('position') ?? 'top';
        this._applyPosition();
        this._propagateSize();

        const selectedIndex = this.getData('selectedIndex');
        if (selectedIndex !== undefined && selectedIndex >= 0) {
            this._selectedIndex = selectedIndex;
            this._applySelection();
        }

        if (!this.abilityState('OverflowAbility:state')) {
            const mode = this.getData('overflowMode') ?? 'scroll';
            this._onOverflowModeOptionChange(mode);
        }

        this.on('popoverselect', (ctx: any) => {
            const data = ctx?.data ?? ctx;
            const index = parseInt(data?.action ?? '-1', 10);
            if (index >= 0) {
                this.selectAt(index);
            }
        });
    }

    private _applyPosition(): void {
        this.removeCls('q-tab-bar--top q-tab-bar--bottom q-tab-bar--left q-tab-bar--right');
        this.addCls(`q-tab-bar--${this._position}`);

        const isVertical = this._position === 'left' || this._position === 'right';
        this._direction = isVertical ? 'vertical' : 'horizontal';
        this.direction = this._direction;
    }

    private _applySelection(): void {
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as TabComponent;
            item.pressed = i === this._selectedIndex;
        }
    }

    get selectedIndex(): number {
        return this._selectedIndex;
    }

    selectAt(index: number, silent: boolean = false): void {
        if (index < 0 || index >= this.count) return;
        if (index === this._selectedIndex) return;

        const newItem = this.getAt(index) as TabComponent;
        if (newItem.disabled) return;

        this._selectedIndex = index;
        this.setData('selectedIndex', index, true);
        this._applySelection();
        this._scrollToItem(newItem);
        this.refreshOverflow?.();

        if (!silent) {
            this.emit('select', { index });
        }
    }

    /** 滚动到指定标签，确保选中标签可见 */
    private _scrollToItem(item: TabComponent | null): void {
        if (!item?.el || !this.abilityState('OverflowAbility:state')) return;
        requestAnimationFrame(() => {
            this.overflowScrollToChild(item.el!);
        });
    }

    get position(): TabBarPosition {
        return this._position;
    }
    set position(v: TabBarPosition) {
        this._position = v;
        this._applyPosition();
    }

    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            selectedIndex: this._selectedIndex,
            position: this._position,
            lastToggleIndex: this._lastToggleIndex,
        };
    }

    onUpdated(props?: Record<string, any>): void {
        if (props?.selectedIndex !== undefined) this.selectAt(props.selectedIndex);
        if (props?.position !== undefined) {
            this.position = props.position;
        }
    }
}

TabBarComponent.define(TabBarComponentDefs);

export { TabBarComponent };
/** 标签栏实例类型 */
export type TabBarComponentInstance = InstanceType<typeof TabBarComponent>;
