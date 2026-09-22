/**
 * TreeNavComponent 树导航组件
 *
 * 从 ItemGroupStaticComponent 派生（非池化，子项随展开/折叠动态创建销毁），
 * 纵向布局，通过 domEvents 集中处理子项点击。
 *
 * 选中模型（只有 leaf 可选中）：
 * - parent 节点点击 → toggleExpand，不选中
 * - leaf 节点点击 → 选中
 * - selectAt(parent) → 自动展开并选中第一个 leaf 后代
 * - 嵌套选中通过 _selectNested，_selectedItem 维护全局单选
 *
 * 路由内化：
 * - domEvents click 带 router: 'navigate'
 * - item 有 href 时触发路由导航；无 href 则纯 UI 选中
 * - listens route change → onRouteChange 自动高亮
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
    _pendingNavData: { path: string; item: any } | null = null;

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

        const deepest = this._findDeepestItem(topItem, domEvt);
        const item = deepest ?? topItem;

        if (item.select()) {
            if (item === topItem) {
                const index = this.indexOf(topItem);
                if (index >= 0) this.selectAt(index);
            } else {
                this._selectNested(item);
            }
        }

        if (item.href) {
            this._pendingNavData = { path: item.href, item };
        }
    }

    private _findDeepestItem(
        topItem: TreeNavItemComponent,
        domEvt: any
    ): TreeNavItemComponent | null {
        const clickTarget = domEvt?.data?.originalEvent?.target as Element;
        if (!clickTarget) return null;
        const children: TreeNavItemComponent[] = topItem?._childInstances ?? [];
        for (const child of children) {
            if (child.el?.contains(clickTarget)) {
                return this._findDeepestItem(child, domEvt) ?? child;
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

        const item = this.getAt(index) as TreeNavItemComponent;
        const leaf = this._findFirstLeaf(item);

        if (this._selectedItem && this._selectedItem !== leaf) {
            this._selectedItem.setActive(false);
        }

        leaf.setActive(true);
        this._selectedItem = leaf;
        this.activeIndex = index;

        if (!silent) {
            this.emit('select', { index, item: leaf });
        }
    }

    private _findFirstLeaf(item: TreeNavItemComponent): TreeNavItemComponent {
        if (!item.children?.length) return item;
        if (!item.expanded) item.expand();
        const firstChild = item._childInstances[0];
        if (!firstChild) return item;
        return this._findFirstLeaf(firstChild);
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
