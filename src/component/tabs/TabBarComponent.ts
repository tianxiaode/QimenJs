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
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import type { TabComponent } from './TabComponent';
import { DomEventsMap } from '@qimenjs/component-core';
import './tabbar.css.ts';

/** 标签栏位置 */
export type TabBarPosition = 'top' | 'bottom' | 'left' | 'right';

/** 标签栏属性接口 */
export interface TabBarProps extends ItemGroupProps {
    selectedIndex?: number;
    position?: TabBarPosition;
}

class TabBarComponent extends ItemGroupPooledComponent {
    _selectedIndex: number = -1;
    _position: TabBarPosition = 'top';

    domEvents?: DomEventsMap | undefined = {
        click: {
            Tab: { handler: '_onTabClick', emits: ['select'] },
            'Tab.close': { handler: '_onTabClose', emits: ['close'] },
        },
    };

    _onTabClick(domEvt: any): void {
        const target = this.getTargetItem(domEvt.target);
        if (!target) return;

        const item = target.component as TabComponent;
        if (item.disabled) return;

        this.selectAt(target.index);
    }

    _onTabClose(domEvt: any): void {
        const target = this.getTargetItem(domEvt.target);
        if (!target) return;

        const item = target.component as TabComponent;
        // close 事件由 domEvents emits 自动触发，包含 index 等数据
    }

    onAfterInit(props?: TabBarProps): void {
        this.addCls('q-tab-bar');
        const container = (this as any).itemContainer?.el as HTMLElement | undefined;
        if (container) container.classList.add('q-tab-bar__items');

        super.onAfterInit({
            defaultItemType: 'Tab',
            ...props,
        });

        this._position = props?.position ?? 'top';
        this._applyPosition();

        if (props?.selectedIndex !== undefined && props.selectedIndex >= 0) {
            this._selectedIndex = props.selectedIndex;
            this._applySelection();
        }
    }

    private _applyPosition(): void {
        this.removeCls('q-tab-bar--top q-tab-bar--bottom q-tab-bar--left q-tab-bar--right');
        this.addCls(`q-tab-bar--${this._position}`);

        // 根据 position 设置 direction
        const isVertical = this._position === 'left' || this._position === 'right';
        this._direction = isVertical ? 'vertical' : 'horizontal';
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
        this._applySelection();

        if (!silent) {
            this.emit('select', { index });
        }
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
        };
    }

    onUpdated(props?: Record<string, any>): void {
        if (props?.selectedIndex !== undefined) this.selectAt(props.selectedIndex);
        if (props?.position !== undefined) {
            this.position = props.position;
        }
    }
}

export { TabBarComponent };
/** 标签栏实例类型 */
export type TabBarComponentInstance = InstanceType<typeof TabBarComponent>;
