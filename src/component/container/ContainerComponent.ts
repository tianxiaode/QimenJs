/**
 * ContainerComponent — 轻量内容容器
 *
 * 与 ItemGroup 的分工：
 * - Container：不承诺 item 是组件。string/TemplateDecl 同步编译为 DOM（轻量包装，
 *   不走组件异步初始化链），ComponentClass/配置对象创建组件实例。适合 tags、icons、
 *   dialog body 等纯显示、按 action 委托的内容承载。
 * - ItemGroup：承诺 items 全为组件实例，提供复用渲染/池化/实体数据/`{type}` 路径匹配。
 *
 * 四路 item 定义：
 * - string：HTML 内容（支持 @ 前缀 i18n 求值）
 * - TemplateDecl：模板编译为 DOM（同步；暂不支持嵌套组件 type，需要时走组件分支）
 * - ComponentClass：实例化挂载（完整组件）
 * - 配置对象：{ type: 类|注册名, ...props } 实例化挂载
 *
 * 交互约定：事件全部由宿主组件委托（getTargetItem 按 el.contains 定位 item，
 * item.action/name 供 action 分发与 map 查询）。
 */

import { Component } from '@qimenjs/component-core';
import type { TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { CONTAINER_TPL } from './container-tpl';
import { createItemFromDef } from './resolve';
import type { ContainerItemDef } from './types';
import './container.css';

const ContainerComponentDefs: Definitions = {
    options: {
        items: null,
        direction: 'vertical',
        gap: '',
    },
    fields: {
        _nameMap: undefined,
        _actionMap: undefined,
    },
} as const;

class ContainerComponent extends Component {
    static type = 'container';

    get tpl(): TemplateDecl {
        return CONTAINER_TPL;
    }

    _nameMap: Map<string, any> = new Map();
    _actionMap: Map<string, any> = new Map();
    /** 内部方法（add/setItems/clear）已直接管理 items，initOptions 重放时跳过 */
    _itemsApplied: boolean = false;

    _onItemsOptionChange(value: ContainerItemDef[] | null): void {
        // add() 等内部方法 push 后引用未变，initOptions 的重放会 clear 已挂载子项，需跳过
        if (Array.isArray(value) && this._itemsApplied && value === this.items) return;
        if (Array.isArray(value)) this.setItems([...value]);
    }

    _onDirectionOptionChange(value: string): void {
        this.toggleCls('q-container--horizontal', value === 'horizontal');
    }

    _onGapOptionChange(value: string): void {
        this.el?.style.setProperty('gap', value || '');
    }

    onBeforeDispose(): void {
        this.clear();
    }

    get count(): number {
        return (this.items || []).length;
    }

    _createItem(def: ContainerItemDef): any {
        const item = createItemFromDef(this, def);
        if (item && typeof item.dispose === 'function' && item.el) {
            this.childComponentList.push(item);
        }
        return item;
    }

    _ensureItems(): any[] {
        if (!Array.isArray(this.items)) {
            this.setData('items', [], true);
        }
        return this.items;
    }

    _registerMaps(item: any, name?: string, action?: string): void {
        if (name) {
            if (this._nameMap.has(name)) {
                this.logger.warn(`[Container] item name "${name}" 重复，后者覆盖前者`);
            }
            this._nameMap.set(name, item);
        }
        if (action) {
            this._actionMap.set(action, item);
        }
    }

    _unregisterMaps(item: any): void {
        for (const [key, val] of this._nameMap.entries()) {
            if (val === item) this._nameMap.delete(key);
        }
        for (const [key, val] of this._actionMap.entries()) {
            if (val === item) this._actionMap.delete(key);
        }
    }

    _extractIdentity(def: ContainerItemDef): { name?: string; action?: string } {
        if (typeof def === 'object' && def !== null && !Array.isArray(def)) {
            const anyDef = def as Record<string, any>;
            return { name: anyDef.name, action: anyDef.action };
        }
        return {};
    }

    _appendChild(item: any): void {
        if (item?.el) this.el?.appendChild(item.el);
    }

    _destroyItem(item: any): void {
        if (!item) return;
        if (typeof item.dispose === 'function') {
            item.dispose();
        } else if (item.el?.parentNode) {
            item.el.parentNode.removeChild(item.el);
        }
    }

    _sortByOrder(): void {
        const items = this.items;
        if (!Array.isArray(items)) return;
        items.sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0));
        const frag = document.createDocumentFragment();
        for (const item of items) {
            if (item?.el) frag.appendChild(item.el);
        }
        if (this.el) this.el.appendChild(frag);
    }

    setItems(defs: ContainerItemDef[]): void {
        this.clear(true);
        for (const def of defs) {
            const item = this._createItem(def);
            if (!item) continue;
            const { name, action } = this._extractIdentity(def);
            item.action = item.action ?? action;
            this._ensureItems().push(item);
            this._registerMaps(item, item.name ?? name, item.action);
            this._appendChild(item);
            this.emit('itemadd', { index: this.items.length - 1, component: item });
        }
        this._sortByOrder();
        this._itemsApplied = true;
        this.emit('itemchange', { type: 'set', count: this.count });
    }

    add(def: ContainerItemDef, opts?: { order?: number; cls?: string }): any {
        const item = this._createItem(def);
        if (!item) return null;
        if (opts?.order != null) item.order = opts.order;
        if (opts?.cls) item.el?.classList.add(...opts.cls.split(/\s+/));
        const { name, action } = this._extractIdentity(def);
        item.action = item.action ?? action;
        this._ensureItems().push(item);
        this._registerMaps(item, item.name ?? name, item.action);
        this._appendChild(item);
        this._sortByOrder();
        this._itemsApplied = true;
        this.emit('itemadd', { index: this.items.length - 1, component: item });
        return item;
    }

    removeAt(index: number): any {
        const items = this.items;
        if (!Array.isArray(items) || index < 0 || index >= items.length) return undefined;
        const [item] = items.splice(index, 1);
        this._unregisterMaps(item);
        this._destroyItem(item);
        this.emit('itemremove', { index, component: item });
        return item;
    }

    removeItem(name: string): boolean {
        const item = this._nameMap.get(name);
        if (!item) return false;
        const index = this.indexOf(item);
        if (index >= 0) this.removeAt(index);
        else this._destroyItem(item);
        return true;
    }

    getItem(name: string): any {
        return this._nameMap.get(name) ?? null;
    }

    getActionItem(action: string): any {
        return this._actionMap.get(action) ?? null;
    }

    getAt(index: number): any {
        const items = this.items;
        if (!Array.isArray(items) || index < 0 || index >= items.length) return null;
        return items[index];
    }

    indexOf(item: any): number {
        const items = this.items;
        if (!Array.isArray(items)) return -1;
        return items.indexOf(item);
    }

    getTargetItem(target: Element): { component: any; type: string; index: number } | null {
        const items = this.items;
        if (!Array.isArray(items)) return null;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item?.el?.contains(target)) {
                const type = item.type || item.constructor?._type || '';
                return { component: item, type, index: i };
            }
        }
        return null;
    }

    clear(silent: boolean = false): void {
        const items = this.items;
        if (Array.isArray(items)) {
            for (const item of items) {
                this._unregisterMaps(item);
                this._destroyItem(item);
            }
            items.length = 0;
        }
        if (!silent) this.emit('itemchange', { type: 'clear' });
    }
}

ContainerComponent.define(ContainerComponentDefs);

export { ContainerComponent };
export type ContainerComponentInstance = InstanceType<typeof ContainerComponent>;
