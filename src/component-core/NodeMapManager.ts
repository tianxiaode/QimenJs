/**
 * NodeMapManager — 运行时 DOM 管理器（实例级）
 *
 * 只负责运行时 DOM 操作，不涉及编译/缓存逻辑。
 *
 * 职责：
 * - buildDOM: 从 cache 克隆模板 + buildNodeMap
 * - replace: 运行时组件替换
 * - disposeAll: 清理运行时资源
 *
 * 实例级：每个组件实例创建自己的 NodeMapManager，不跨类共享
 */

import type { NodeMetadata, NodeIndexPath, CompiledTemplateCache } from './types/compiled-types';
import type { INodeMapManager } from './types/node-map-manager-types';
import { findByPath } from './engine/utils/dom-path';

export class NodeMapManager implements INodeMapManager {
    private _cache: CompiledTemplateCache;
    private _nodeMetas: Record<string, NodeMetadata>;
    private _map: Record<string, NodeMetadata> = {};
    private _el!: HTMLElement;
    private _owner: any;

    constructor(
        cache: CompiledTemplateCache,
        nodeMetas?: Record<string, NodeMetadata>,
        owner?: any
    ) {
        this._cache = cache;
        this._nodeMetas = nodeMetas || {};
        this._owner = owner;
    }

    get indexPath(): NodeIndexPath {
        return this._cache.indexPath;
    }

    get nodeMetas(): Record<string, NodeMetadata> {
        return this._nodeMetas;
    }

    get i18nNodes(): Array<{ name: string; i18nKey: string }> {
        return this._cache.i18nNodes;
    }

    get exposeNames(): string[] {
        return this._cache.exposeNames;
    }

    get rootTag(): string {
        return this._nodeMetas['root']?.tag ?? 'div';
    }

    buildDOM(): HTMLElement {
        this._el = document.createElement(this.rootTag);
        const fragment = this._cache.templateCache.content.cloneNode(true);
        this._el.appendChild(fragment);
        this._buildNodeMap();
        return this._el;
    }

    get el(): HTMLElement {
        return this._el;
    }

    get(name: string): NodeMetadata | undefined {
        return this._map[name];
    }

    getAll(): Record<string, NodeMetadata> {
        return this._map;
    }

    set(name: string, meta: NodeMetadata): void {
        this._map[name] = meta;
    }

    remove(name: string): void {
        const node = this._map[name];
        if (!node) return;

        this._removeChildEntries(name);

        if (node.component && typeof node.component.dispose === 'function') {
            node.component.dispose();
        }

        if (node.el) {
            node.el.remove();
        }

        delete this._map[name];
    }

    replace(
        name: string,
        ComponentClass: new (props?: Record<string, any>) => any,
        props?: Record<string, any>
    ): any | null {
        const old = this._map[name];
        if (!old) return null;

        this._removeChildEntries(name);

        if (old.component && typeof old.component.dispose === 'function') {
            old.component.dispose();
        }

        const newChild = new ComponentClass(props);
        if (this._owner) (newChild as any).parent = this._owner;

        this._replaceDOM(old, newChild.el);

        old.el = newChild.el;
        old.component = newChild;
        old.componentClass = ComponentClass;

        if (newChild.nodeMap && this._owner) {
            Object.assign(this._owner.nodeMap, newChild.nodeMap);
        } else if ((newChild as any).nodeMapMgr) {
            this._mergeChildNodeMap((newChild as any).nodeMapMgr);
        }

        return newChild;
    }

    disposeAll(): void {
        for (const node of Object.values(this._map)) {
            if (node.component && typeof node.component.dispose === 'function') {
                node.component.dispose();
            }
        }
        this._map = {};
    }

    mountChildComponent(node: NodeMetadata, child: any): void {
        const placeholder = node.el!;
        const parentEl = placeholder.parentElement;
        if (parentEl) {
            node.parentNode = parentEl;
            node.nodeIndex = Array.from(parentEl.childNodes).indexOf(placeholder as ChildNode);
        }
        placeholder.replaceWith(child.el);
        node.el = child.el;
        node.component = child;

        if (node.cls && child.el) {
            const classes = node.cls.split(/\s+/).filter(Boolean);
            if (classes.length) child.el.classList.add(...classes);
        }

        if (child.nodeMapMgr) {
            this._mergeChildNodeMap(child.nodeMapMgr);
        } else if (child.nodeMap) {
            for (const [name, meta] of Object.entries(
                child.nodeMap as Record<string, NodeMetadata>
            )) {
                this._map[name] = meta;
            }
        }
    }

    private _buildNodeMap(): void {
        const indexPath = this._cache.indexPath;
        const nodeMetas = this._nodeMetas;

        for (const [name, path] of Object.entries(indexPath)) {
            const meta = nodeMetas[name];
            if (!meta) continue;

            const el = findByPath(this._el, path);
            if (!el) continue;

            this._map[name] = { ...meta, el };
        }
    }

    private _removeChildEntries(parentName: string): void {
        const parentPath = this._cache.indexPath[parentName];
        if (!parentPath) return;

        const prefix = parentPath.join(',');

        for (const [name, path] of Object.entries(this._cache.indexPath)) {
            if (name === parentName) continue;
            const pathStr = path.join(',');
            if (pathStr.startsWith(prefix)) {
                const node = this._map[name];
                if (node?.component && typeof node.component.dispose === 'function') {
                    node.component.dispose();
                }
                delete this._map[name];
            }
        }
    }

    private _replaceDOM(old: NodeMetadata, newEl: HTMLElement): void {
        if (old.parentNode && old.nodeIndex !== undefined) {
            const referenceNode = old.parentNode.childNodes[old.nodeIndex];
            if (referenceNode) {
                old.parentNode.insertBefore(newEl, referenceNode);
            } else {
                old.parentNode.appendChild(newEl);
            }
        } else {
            old.el?.replaceWith(newEl);
        }
    }

    private _mergeChildNodeMap(childMgr: NodeMapManager): void {
        const childMap = childMgr.getAll();
        for (const [name, meta] of Object.entries(childMap)) {
            this._map[name] = meta;
        }
    }
}
