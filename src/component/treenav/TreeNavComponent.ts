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
 * - listens route change → onRouteChange 自动高亮
 *
 * getTargetItem 递归查找嵌套子项，命中最深的匹配项。
 */

import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import type { TreeNavItemComponent } from './TreeNavItemComponent';
import { DomEventsMap } from '@qimenjs/component-core';
import { RouteEventBus } from '@/events/RouteEventBus';
import type { EventContext } from '@/context';

export interface TreeNavProps extends ItemGroupProps {
    activeIndex?: number;
    maxDepth?: number;
    pathIndex?: Record<string, number>;
}

class TreeNavComponent extends ItemGroupStaticComponent {
    _activeIndex: number = -1;
    _maxDepth: number = 5;
    _selectedItem: TreeNavItemComponent | null = null;
    _pathIndex: Record<string, number> = {};
    _lastNavigatedPath: string | null = null;
    _pendingNavData: { path: string; item: any } | null = null;

    domEvents?: DomEventsMap | undefined = {
        click: {
            'TreeNavItem.content': {
                handler: '_onItemClick',
                emits: ['select', '[action]'],
                bridges: ['[action]'],
                router: 'navigate',
            },
        },
    };

    listens = [{ route: 'router', events: { change: 'onRouteChange' } }];

    routerEmit(ctx: EventContext): void {
        RouteEventBus.getInstance().routeEmit(ctx);
    }

    _onItemClick(domEvt: any): void {
        const target = this.getTargetItem(domEvt.target);
        if (!target) return;

        const item = target.component as TreeNavItemComponent;
        if (item.select()) {
            if (target.index >= 0) {
                this.selectAt(target.index);
            } else {
                this._selectNested(item);
            }
        }

        if (item.path) {
            this._lastNavigatedPath = item.path;
            this._pendingNavData = { path: item.path, item };
        }
    }

    getCustomEventData(): any {
        const data = this._pendingNavData;
        this._pendingNavData = null;
        return data ?? {};
    }

    onRouteChange(event: any): void {
        const path = event?.path;
        if (!path) return;
        if (path === this._lastNavigatedPath) {
            this._lastNavigatedPath = null;
            return;
        }
        const index = this._pathIndex[path];
        if (index !== undefined) this.selectAt(index);
    }

    getTargetItem(target: Element): { component: any; type: string; index: number } | null {
        for (let i = 0; i < this._items.length; i++) {
            const item = this._items[i];
            if (item.el.contains(target)) {
                const deepest = this._findDeepestMatch(item.component, target);
                if (deepest) return deepest;
                return { component: item.component, type: item.component?.type ?? '', index: i };
            }
        }
        return null;
    }

    private _findDeepestMatch(
        component: any,
        target: Element
    ): { component: any; type: string; index: number } | null {
        const children: TreeNavItemComponent[] = component?._childInstances ?? [];
        for (const child of children) {
            if (child.el?.contains(target)) {
                return (
                    this._findDeepestMatch(child, target) ?? {
                        component: child,
                        type: child?.type ?? '',
                        index: -1,
                    }
                );
            }
        }
        return null;
    }

    onAfterInit(props?: TreeNavProps & Record<string, any>): void {
        super.onAfterInit({ defaultItemType: 'TreeNavItem', direction: 'vertical', ...props });

        this.addCls('q-tree-nav');
        this._maxDepth = props?.maxDepth ?? 5;

        if (props?.pathIndex) this._pathIndex = props.pathIndex;

        this._syncItemConfig();

        if (props?.activeIndex !== undefined && props.activeIndex >= 0) {
            this.selectAt(props.activeIndex, true);
        }
    }

    _syncItemConfig(): void {
        for (let i = 0; i < this.count; i++) {
            const item = this.getAt(i) as TreeNavItemComponent;
            item.update({ maxDepth: this._maxDepth });
        }
    }

    get activeIndex(): number {
        return this._activeIndex;
    }
    get maxDepth(): number {
        return this._maxDepth;
    }

    selectAt(index: number, silent: boolean = false): void {
        if (index < 0 || index >= this.count) return;
        if (index === this._activeIndex && this._selectedItem === this.getAt(index)) return;

        if (this._selectedItem) this._selectedItem.setActive(false);

        const newItem = this.getAt(index) as TreeNavItemComponent;
        newItem.setActive(true);
        this._activeIndex = index;
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
        this._activeIndex = -1;
        this.emit('select', { item });
    }

    clearSelection(): void {
        if (this._selectedItem) this._selectedItem.setActive(false);
        this._selectedItem = null;
        this._activeIndex = -1;
    }

    onUpdated(props?: Record<string, any>): void {
        if (props?.activeIndex !== undefined) this.selectAt(props.activeIndex);
        if (props?.maxDepth !== undefined) {
            this._maxDepth = props.maxDepth;
            this._syncItemConfig();
        }
        if (props?.pathIndex !== undefined) this._pathIndex = props.pathIndex;
    }
}

export { TreeNavComponent };
export type TreeNavComponentInstance = InstanceType<typeof TreeNavComponent>;
