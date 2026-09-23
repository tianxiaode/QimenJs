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
    _pendingNavData: { path: string } | null = null;

    domEvents?: DomEventsMap | undefined = {
        click: {
            path: '[items]',
            handler: '_onItemClick',
            emits: ['select', '[action]'],
            bridges: ['select', '[action]'],
            router: 'switch',
        },
    };

    listens = [{ route: 'router', events: { change: 'onRouteChange' } }];

    _onItemClick(domEvt: any): void {
        const item = domEvt?.targetComponent as TreeNavItemComponent;
        if (!item) return;
        const flatIndex = this.indexOf(item);
        if (flatIndex < 0) return;
        const data = this._flatData[flatIndex];
        if (!data) return;

        if (data.hasChildren) {
            this._toggleExpand(data._path);
        } else {
            this._selectLeaf(flatIndex, data._path);
        }

        if (data.href) {
            this._pendingNavData = { path: data.href };
        }
    }

    get defaultEventData(): Record<string, any> {
        const data = this._pendingNavData;
        this._pendingNavData = null;
        return { ...super.defaultEventData, ...(data ?? {}) };
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
        if (this.activeIndex >= 0) {
            this.selectAt(this.activeIndex, true);
        }
    }

    _onItemsOptionChange(value: any[]): void {
        this._treeData = value ? [...value] : [];
        this._expandedPaths = new Set();
        this._scanInitialExpanded(this._treeData);
        if (!this.pathIndex) this._buildPathIndex(this._treeData);
        if (!Array.isArray(this.items)) {
            this.setData('items', [], true);
        }
        this._flatData = [];
        this._reflow();
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
        super.setItems(this._flatData);
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
