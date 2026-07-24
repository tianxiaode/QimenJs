/**
 * NodeMapManager — 运行时 DOM 管理器（实例级）
 *
 * 只负责运行时 DOM 操作，不涉及编译/缓存逻辑。
 * 编译和派生由 TemplateCompiler / TemplateDeriver 引擎处理。
 *
 * 职责：
 * - buildDOM: 从 cache 克隆模板 + buildNodeMap
 * - replace/appendTo: 运行时节点替换/追加
 * - disposeAll: 清理运行时资源
 *
 * 实例级：每个组件实例创建自己的 NodeMapManager，不跨类共享
 */

import type { TplNode } from './types/tpl-node-types';
import type {
    NodeMetadata,
    NodeIndexPath,
    CompiledTemplateCache,
} from './types/compiled-types';
import { findByPath, expandFragments, compileTemplate } from './engine/TemplateCompiler';

export class NodeMapManager {
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

    buildDOM(tag: string): HTMLElement {
        this._el = document.createElement(tag);
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
        replacement: TplNode | (new (props?: Record<string, any>) => any),
        props?: Record<string, any>
    ): any | null {
        const old = this._map[name];
        if (!old) return null;

        this._removeChildEntries(name);

        if (this._isComponentClass(replacement)) {
            return this._replaceWithComponent(name, old, replacement, props);
        } else {
            return this._replaceWithSubtree(name, old, replacement);
        }
    }

    appendTo(parentName: string, child: TplNode): NodeMetadata | null {
        const parent = this._map[parentName];
        if (!parent?.el) return null;

        const tplEl = document.createElement('template');
        tplEl.innerHTML = this._compileSubtreeHtml(child);
        const newEl = tplEl.content.firstChild as HTMLElement;
        if (!newEl) return null;

        parent.el.appendChild(newEl);

        for (const [n, meta] of Object.entries(this._compileSubtreeMetas(child))) {
            const path = this._cache.indexPath[n];
            if (path) {
                const el = findByPath(
                    newEl as HTMLElement,
                    path.slice((this._cache.indexPath[parentName]?.length ?? 0) + 1)
                );
                this._map[n] = { ...meta, el: el ?? newEl };
            } else {
                this._map[n] = { ...meta, el: newEl };
            }
        }

        return this._map[child.name!] ?? null;
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

    private _isComponentClass(value: any): value is new (props?: Record<string, any>) => any {
        return typeof value === 'function' && value.prototype && value !== Object;
    }

    private _replaceWithComponent(
        name: string,
        old: NodeMetadata,
        ComponentClass: new (props?: Record<string, any>) => any,
        props?: Record<string, any>
    ): any {
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

    private _replaceWithSubtree(name: string, old: NodeMetadata, tplNode: TplNode): any {
        const html = this._compileSubtreeHtml(tplNode);
        const metas = this._compileSubtreeMetas(tplNode);

        const tplEl = document.createElement('template');
        tplEl.innerHTML = html;
        const newEl = tplEl.content.firstChild as HTMLElement;
        if (!newEl) return null;

        this._replaceDOM(old, newEl);

        old.el = newEl;
        old.component = undefined;
        old.componentClass = undefined;

        if (tplNode.name) {
            const meta = metas[tplNode.name];
            if (meta) {
                Object.assign(old, meta, { el: newEl });
            }
        }

        for (const [n, meta] of Object.entries(metas)) {
            if (n === tplNode.name) continue;
            const path = this._cache.indexPath[n];
            if (path) {
                const el = findByPath(newEl, path.slice(1));
                this._map[n] = { ...meta, el: el ?? newEl };
            }
        }

        return newEl;
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

    private _compileSubtreeHtml(tplNode: TplNode): string {
        const expanded = expandFragments(tplNode);
        const result = compileTemplate(expanded, { warn: () => {} });
        return result.html;
    }

    private _compileSubtreeMetas(tplNode: TplNode): Record<string, NodeMetadata> {
        const expanded = expandFragments(tplNode);
        const result = compileTemplate(expanded, { warn: () => {} });
        return result.nodeMetas;
    }

    private _mergeChildNodeMap(childMgr: NodeMapManager): void {
        const childMap = childMgr.getAll();
        for (const [name, meta] of Object.entries(childMap)) {
            this._map[name] = meta;
        }
    }
}
