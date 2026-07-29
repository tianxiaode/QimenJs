/**
 * NavItemGroupComponent 导航项组组件
 *
 * 从 ItemGroupPooledComponent 派生，通过 domEvents 集中处理子项事件，
 * 委托 NavItemComponent.select() / showTooltip() / hideTooltip() 执行状态变更。
 *
 * domEvents 路径：
 * - 'NavItem.content' → 点击导航项内容区域
 * - 'NavItem'        → 鼠标进入/离开导航项（折叠提示反馈）
 */

import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import type { NavItemComponent } from './NavItemComponent';
import type { NavOverlayOptions } from './NavItemComponent';
import { DomEventsMap } from '@qimenjs/component-core';

export interface NavItemGroupProps extends ItemGroupProps {
    activeIndex?: number;
    mode?: 'expanded' | 'collapsed';
    maxDepth?: number;
    overlayOptions?: NavOverlayOptions;
    overlayComponent?: any;
}

export let NavItemGroupComponent = ItemGroupPooledComponent.replace({
    config: {
        defaultItemType: 'NavItem',
        direction: 'horizontal',
    },

    body: {
        nodes: {
            root: { addCls: 'q-nav' },
            itemContainer: { addCls: 'q-nav__items' },
        },

        _activeIndex: -1,
        _navMode: 'expanded' as 'expanded' | 'collapsed',
        _maxDepth: 3,
        _overlayOptions: undefined as NavOverlayOptions | undefined,
        _overlayComponent: undefined as any,

        domEvents: {
            click: {
                'NavItem.content': {
                    handler: '_onItemClick',
                    emits: ['[action]'],
                },
            },
            mouseenter: {
                NavItem: {
                    handler: '_onItemEnter',
                },
            },
            mouseleave: {
                NavItem: {
                    handler: '_onItemLeave',
                },
            },
        } as DomEventsMap | undefined,

        _onItemClick(this: any, domEvt: any): void {
            const target = this.getTargetItem(domEvt.target);
            if (!target) return;

            const item = target.component as NavItemComponent;
            if (item.select()) {
                this.selectAt(target.index);
            }
        },

        _onItemEnter(this: any, domEvt: any): void {
            const target = this.getTargetItem(domEvt.target);
            if (!target) return;

            const item = target.component as NavItemComponent;
            item.showTooltip();
        },

        _onItemLeave(this: any, domEvt: any): void {
            const target = this.getTargetItem(domEvt.target);
            if (!target) return;

            const item = target.component as NavItemComponent;
            item.hideTooltip();
        },

        onAfterInit(props?: NavItemGroupProps): void {
            const self = this as any;
            self._navMode = props?.mode ?? 'expanded';
            self._maxDepth = props?.maxDepth ?? 3;
            self._overlayOptions = props?.overlayOptions;
            self._overlayComponent = props?.overlayComponent;

            self.el.classList.toggle('q-nav--collapsed', self._navMode === 'collapsed');

            if (props?.activeIndex !== undefined && props.activeIndex >= 0) {
                self.selectAt(props.activeIndex, true);
            }
        },

        get activeIndex(): number {
            const self = this as any;
            return self._activeIndex;
        },
        get mode(): 'expanded' | 'collapsed' {
            const self = this as any;
            return self._navMode;
        },
        get maxDepth(): number {
            const self = this as any;
            return self._maxDepth;
        },

        selectAt(index: number, silent: boolean = false): void {
            const self = this as any;
            if (index < 0 || index >= self.count) return;
            if (index === self._activeIndex) return;

            if (self._activeIndex >= 0 && self._activeIndex < self.count) {
                const prevItem = self.getAt(self._activeIndex) as NavItemComponent;
                prevItem.setActive(false);
            }

            const newItem = self.getAt(index) as NavItemComponent;
            newItem.setActive(true);
            self._activeIndex = index;

            if (!silent) {
                self.emit('select', { index });
            }
        },

        clearSelection(): void {
            const self = this as any;
            if (self._activeIndex >= 0 && self._activeIndex < self.count) {
                const item = self.getAt(self._activeIndex) as NavItemComponent;
                item.setActive(false);
            }
            self._activeIndex = -1;
        },

        setMode(value: 'expanded' | 'collapsed'): void {
            const self = this as any;
            self._navMode = value;
            self.el.classList.toggle('q-nav--collapsed', value === 'collapsed');

            for (let i = 0; i < self.count; i++) {
                const item = self.getAt(i) as NavItemComponent;
                item.setMode(value);
            }
        },

        setOverlayOptions(options: NavOverlayOptions): void {
            const self = this as any;
            self._overlayOptions = options;
            for (let i = 0; i < self.count; i++) {
                const item = self.getAt(i) as NavItemComponent;
                item.update({ overlayOptions: options });
            }
        },

        onUpdated(props?: Record<string, any>): void {
            const self = this as any;
            if (props?.activeIndex !== undefined) self.selectAt(props.activeIndex);
            if (props?.mode !== undefined) self.setMode(props.mode);
            if (props?.maxDepth !== undefined) self._maxDepth = props.maxDepth;
            if (props?.overlayOptions !== undefined) self.setOverlayOptions(props.overlayOptions);
        },
    },
});
