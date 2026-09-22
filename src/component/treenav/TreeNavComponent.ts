/**
 * TreeNavComponent 树导航组件
 *
 * 从 ItemGroupStaticComponent 派生（非池化，子项随展开/折叠动态创建销毁），
 * 纵向布局，通过 domEvents 集中处理子项点击，委托 TreeNavItemComponent.select()。
 *
 * 选中模型：
 * - 顶层选中通过 selectAt(index) / activeIndex
 * - 嵌套选中通过 emit('select', { item })，_selectedItem 维护全局单选
 *
 * 路由内化（声明式，参考 BreadcrumbComponent）：
 * - domEvents click 带 router: 'navigate'，EventForwarder 自动 routeEmit
 * - item 有 path 时触发路由导航；无 path 则纯 UI 选中
 * - _isRouteNav flag 标识本次点击是否为路由导航，getForwardFilter 据此
 *   动态放行 'router' 路由（无 path 时仅放行 'emit'/'bridge'，不触发路由事件）
 * - listens route change → onRouteChange 自动高亮
 *
 * - domEvents click path [items]，targetComponent 拿到顶层 item，
 *   _findDeepestItem 递归 _childInstances 查找嵌套子项。
 */

import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import type { TreeNavItemComponent } from './TreeNavItemComponent';
import { DomEventsMap } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import './treenav.css';

const TreeNavComponentDefs: Definitions = {
    options: {
        direction: 'vertical',
        maxDepth: 5,
        activeIndex: -1,
        pathIndex: null,
    },
} as const;

class TreeNavComponent extends ItemGroupStaticComponent {
    static type = 'tree-nav';
    defaultItemType = 'tree-nav-item';

    _selectedItem: TreeNavItemComponent | null = null;
    _lastNavigatedPath: string | null = null;
    _pendingNavData: { path: string; item: any } | null = null;
    _isRouteNav: boolean = false;

    domEvents?: DomEventsMap | undefined = {
        click: {
            path: '[items]',
            handler: '_onItemClick',
            emits: ['select', '[action]'],
            bridges: ['select', '[action]'],
            router: 'navigate',
        },
    };

    listens = [{ route: 'router', events: { change: 'onRouteChange' } }];

    _onItemClick(domEvt: any): void {
        const topItem = domEvt?.targetComponent as TreeNavItemComponent;
        if (!topItem) return;

        const clickTarget = domEvt?.data?.originalEvent?.target as Element;
        const deepest = clickTarget ? this._findDeepestItem(topItem, clickTarget) : null;
        const item = deepest ?? topItem;

        const expandEl = item.getNodeEl?.('expand');
        if (expandEl && expandEl.contains(clickTarget)) {
            item.toggleExpand();
            return;
        }

        if (item.select()) {
            if (item === topItem) {
                const index = this.indexOf(topItem);
                if (index >= 0) this.selectAt(index);
            } else {
                this._selectNested(item);
            }
        }

        if (item.href) {
            this._isRouteNav = true;
            this._lastNavigatedPath = item.href;
            this._pendingNavData = { path: item.href, item };
        } else {
            this._isRouteNav = false;
        }
    }

    private _findDeepestItem(
        component: TreeNavItemComponent,
        target: Element
    ): TreeNavItemComponent | null {
        const children: TreeNavItemComponent[] = component?._childInstances ?? [];
        for (const child of children) {
            if (child.el?.contains(target)) {
                return this._findDeepestItem(child, target) ?? child;
            }
        }
        return null;
    }

    get defaultEventData(): Record<string, any> {
        const data = this._pendingNavData;
        this._pendingNavData = null;
        return { ...super.defaultEventData, ...(data ?? {}) };
    }

    onRouteChange(event: any): void {
        const path = event?.path;
        if (!path) return;
        if (path === this._lastNavigatedPath) {
            this._lastNavigatedPath = null;
            return;
        }
        const pathIndex = this.pathIndex;
        const index = pathIndex?.[path];
        if (index !== undefined) this.selectAt(index);
    }

    get defaultOptions(): Record<string, any> {
        return { direction: 'vertical' };
    }

    onAfterInit(): void {
        super.onAfterInit();

        this.addCls('q-tree-nav');

        if (!this.pathIndex) this._buildPathIndex(this.getData('items'));

        this._syncItemConfig();

        if (this.activeIndex >= 0) {
            this.selectAt(this.activeIndex, true);
        }
    }

    private _buildPathIndex(items: any[]): void {
        this.pathIndex = {};
        if (!items?.length) return;
        for (let i = 0; i < items.length; i++) {
            const href = items[i]?.href;
            if (href) this.pathIndex[href] = i;
        }
    }

    _syncItemConfig(): void {
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as TreeNavItemComponent;
            item.update({ maxDepth: this.maxDepth });
        }
    }

    selectAt(index: number, silent: boolean = false): void {
        if (index < 0 || index >= this.count) return;

        if (this._selectedItem && this._selectedItem !== this.getAt(index)) {
            this._selectedItem.setActive(false);
        }

        const newItem = this.getAt(index) as TreeNavItemComponent;
        newItem.setActive(true);
        this.activeIndex = index;
        this._selectedItem = newItem;

        if (!silent) {
            this.emit('select', { index, item: newItem });
        }
    }

    private _selectNested(item: TreeNavItemComponent): void {
        if (this._selectedItem && this._selectedItem !== item) {
            this._selectedItem.setActive(false);
        }
        item.setActive(true);
        this._selectedItem = item;
        this.activeIndex = -1;
        this.emit('select', { item });
    }

    clearSelection(): void {
        if (this._selectedItem) this._selectedItem.setActive(false);
        this._selectedItem = null;
        this.activeIndex = -1;
    }

    onUpdated(props?: Record<string, any>): void {
        if (props?.activeIndex !== undefined) this.selectAt(props.activeIndex);
        if (props?.maxDepth !== undefined) {
            this._syncItemConfig();
        }
    }
}

TreeNavComponent.define(TreeNavComponentDefs);

export { TreeNavComponent };
/** 树导航实例类型 */
export type TreeNavComponentInstance = InstanceType<typeof TreeNavComponent>;
