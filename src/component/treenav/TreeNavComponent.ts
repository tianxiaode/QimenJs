import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';
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

class TreeNavComponent extends ItemGroupPooledComponent {
    static type = 'tree-nav';
    defaultItemType = 'tree-nav-item';

    _treeData: any[] = [];
    _expandedPaths: Set<string> = new Set();
    _flatData: any[] = [];
    _selectedPath: number[] | null = null;
    _isAfterInit = false;

    domEvents?: DomEventsMap | undefined = {
        click: {
            path: '[items]',
            handler: '_onItemClick',
            emits: ['select', '[action]'],
            bridges: ['select', '[action]'],
        },
    };

    listens = [{ route: 'router', events: { change: 'onRouteChange' } }];

    _onItemClick(domEvt: any): void {
        console.log('[TreeNav] _onItemClick', { domEvt, targetComponent: domEvt?.targetComponent, hasItems: Array.isArray(this.items), itemsLen: this.items?.length });
        const item = domEvt?.targetComponent as TreeNavItemComponent;
        if (!item) {
            console.log('[TreeNav] _onItemClick no item, returning');
            return;
        }
        const flatIndex = this.indexOf(item);
        console.log('[TreeNav] _onItemClick flatIndex', { flatIndex });
        if (flatIndex < 0) return;
        const data = this._flatData[flatIndex];
        if (!data) return;

        if (data.hasChildren) {
            this._toggleExpand(data._path);
        } else {
            this._selectLeaf(flatIndex, data._path);
        }

        if (data.href) {
            console.log('[TreeNav] _onItemClick calling routeEmit', { href: data.href });
            this.routeEmit('switch', { path: data.href });
        }
    }

    onRouteChange(event: any): void {
        const path = event?.path;
        if (!path) return;
        const treePath = this.pathIndex?.[path];
        if (!treePath) return;
        this._expandAncestors(treePath);
        this._selectedPath = treePath;
        this._reflow();
        this.activeIndex = this._findFlatIndex(treePath);
    }

    get defaultOptions(): Record<string, any> {
        return { direction: 'vertical' };
    }

    onAfterInit(): void {
        super.onAfterInit();
        this.addCls('q-tree-nav');
        this._isAfterInit = true;
        console.log('[TreeNav] onAfterInit', { treeDataLen: this._treeData.length, flatDataLen: this._flatData.length, activeIndex: this.activeIndex, itemsLen: this.items?.length });
        if (this._treeData.length > 0) {
            this._flatData = this._flattenTree(this._treeData);
            console.log('[TreeNav] onAfterInit after _flattenTree', { flatDataLen: this._flatData.length, flatData: this._flatData.map(d => ({ text: d.text, path: d._path, hasChildren: d.hasChildren, active: d.active })) });
            if (this.activeIndex >= 0 && this.activeIndex < this._flatData.length) {
                const data = this._flatData[this.activeIndex];
                this._selectedPath = data.hasChildren
                    ? this._findFirstLeafPath(data._path)
                    : data._path;
                console.log('[TreeNav] onAfterInit selectedPath', { selectedPath: this._selectedPath, expandedPaths: [...this._expandedPaths] });
            }
            this._reflow();
            console.log('[TreeNav] onAfterInit after _reflow', { flatDataLen: this._flatData.length, itemsLen: this.items?.length, activeIndex: this.activeIndex });
        }
    }

    _onItemsOptionChange(value: any[]): void {
        console.log('[TreeNav] _onItemsOptionChange', { value, isAfterInit: this._isAfterInit, items: this.items });
        this._treeData = value ? [...value] : [];
        this._expandedPaths = new Set();
        this._scanInitialExpanded(this._treeData);
        if (!this.pathIndex) this._buildPathIndex(this._treeData);
        const current = this.items;
        console.log('[TreeNav] _onItemsOptionChange current items', { isArray: Array.isArray(current), len: current?.length, firstHasUpdate: typeof current?.[0]?.update });
        if (
            !Array.isArray(current) ||
            (current.length > 0 && typeof current[0]?.update !== 'function')
        ) {
            this.setData('items', [], true);
            console.log('[TreeNav] _onItemsOptionChange cleared items to []');
        }
        this._flatData = [];
        if (this._isAfterInit) {
            console.log('[TreeNav] _onItemsOptionChange calling _reflow');
            this._reflow();
        }
    }

    private _scanInitialExpanded(items: any[], basePath: number[] = []): void {
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const path = [...basePath, i];
            if (item.expanded) {
                this._expandedPaths.add(path.join('.'));
            }
            if (item.children?.length) {
                this._scanInitialExpanded(item.children, path);
            }
        }
    }

    private _buildPathIndex(items: any[]): void {
        this.pathIndex = {};
        this._buildPathIndexRecursive(items, []);
    }

    private _buildPathIndexRecursive(items: any[], basePath: number[]): void {
        if (!items?.length) return;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const path = [...basePath, i];
            if (item.href) this.pathIndex[item.href] = path;
            if (item.children?.length) {
                this._buildPathIndexRecursive(item.children, path);
            }
        }
    }

    private _flattenTree(items: any[], depth: number = 0, basePath: number[] = []): any[] {
        const result: any[] = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const path = [...basePath, i];
            const pathKey = path.join('.');
            const hasChildren = !!item.children?.length;
            const expanded = this._expandedPaths.has(pathKey);
            const active = this._selectedPath ? this._selectedPath.join('.') === pathKey : false;

            result.push({
                text: item.text,
                href: item.href,
                iconCls: item.iconCls,
                depth,
                hasChildren,
                expanded,
                active,
                _path: path,
            });

            if (hasChildren && expanded && depth < this.maxDepth) {
                result.push(...this._flattenTree(item.children, depth + 1, path));
            }
        }
        return result;
    }

    private _reflow(): void {
        this._flatData = this._flattenTree(this._treeData);
        console.log('[TreeNav] _reflow', { flatDataLen: this._flatData.length, itemsLen: this.items?.length, selectedPath: this._selectedPath });
        super.setItems(this._flatData);
        console.log('[TreeNav] _reflow after setItems', { itemsLen: this.items?.length, itemsIsArray: Array.isArray(this.items) });
        this.activeIndex = this._selectedPath ? this._findFlatIndex(this._selectedPath) : -1;
    }

    private _toggleExpand(path: number[]): void {
        const depth = path.length - 1;
        if (depth >= this.maxDepth) return;
        const key = path.join('.');
        if (this._expandedPaths.has(key)) {
            this._expandedPaths.delete(key);
        } else {
            this._expandedPaths.add(key);
        }
        this._reflow();
    }

    private _expandAncestors(path: number[]): void {
        for (let i = 1; i < path.length; i++) {
            this._expandedPaths.add(path.slice(0, i).join('.'));
        }
    }

    private _selectLeaf(flatIndex: number, path: number[]): void {
        this._selectedPath = path;
        this._reflow();
        this.activeIndex = flatIndex;
        this.emit('select', { index: flatIndex, path });
    }

    private _findFlatIndex(path: number[]): number {
        const key = path.join('.');
        for (let i = 0; i < this._flatData.length; i++) {
            if (this._flatData[i]._path.join('.') === key) return i;
        }
        return -1;
    }

    private _findFirstLeafPath(path: number[]): number[] {
        const items = this._getChildrenAtPath(path);
        if (!items || items.length === 0) return path;
        this._expandedPaths.add(path.join('.'));
        return this._findFirstLeafPath([...path, 0]);
    }

    private _getChildrenAtPath(path: number[]): any[] | null {
        let items: any[] = this._treeData;
        for (const idx of path) {
            if (!items || !items[idx]) return null;
            items = items[idx].children;
        }
        return items;
    }

    selectAt(index: number, silent: boolean = false): void {
        if (index < 0 || index >= this.count) return;
        const data = this._flatData[index];
        if (!data) return;

        const selectedPath = data.hasChildren ? this._findFirstLeafPath(data._path) : data._path;
        this._selectedPath = selectedPath;

        this._reflow();
        this.activeIndex = this._findFlatIndex(selectedPath);

        if (!silent) {
            this.emit('select', { index: this.activeIndex, path: selectedPath });
        }
    }

    clearSelection(): void {
        this._selectedPath = null;
        this._reflow();
        this.activeIndex = -1;
    }

    onUpdated(props?: Record<string, any>): void {
        if (props?.activeIndex !== undefined) this.selectAt(props.activeIndex);
    }
}

TreeNavComponent.define(TreeNavComponentDefs);

export { TreeNavComponent };
export type TreeNavComponentInstance = InstanceType<typeof TreeNavComponent>;
