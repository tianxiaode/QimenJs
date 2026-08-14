import { ComposableBase, InferAbility } from '@/composable';
import { IComponentCore, IAttributeManager, AttributesMap } from '../types';
import { DebounceAbility } from '@/system-abilities';
import { CLASS_KEYS, HTML_KEYS, STYLE_KEYS } from '../constants';
import { StyleHelper } from './StyleHelper';

/**
 * NodeAttrManager — 节点属性管理器
 *
 * 职责：
 * 1. 管理所有节点的属性状态（完全由 _states 管理）
 * 2. 脏追踪（批量更新）
 * 3. 应用属性到 DOM
 */
export class AttributeManager extends ComposableBase implements IAttributeManager {
    _owner: IComponentCore;

    /** 节点状态（完整状态，始终反映当前 DOM 状态） */
    private _states: AttributesMap = {};

    /** 脏追踪队列（只记录待更新的变化） */
    private _dirtyNodes: AttributesMap = {};

    constructor(attributesMap: AttributesMap, owner: IComponentCore) {
        super();
        this._owner = owner;
        // 直接用 attrDeclMap 初始化状态
        this._states = { ...attributesMap };
    }

    /**
     * 获取节点属性
     */
    getAttribute(nodeName: string, attributeName: string): any {
        const dirty = this._dirtyNodes[nodeName];
        const state = this._states[nodeName];

        if (attributeName in dirty) return dirty[attributeName];
        if (attributeName in state) return state[attributeName];

        const el = this._owner.getNodeEl(nodeName);
        if (!el) return undefined;

        // 从 DOM 读
        const type = this.getAttrType(attributeName);
        if (type === 'class') return el.className;
        if (type === 'style') return (el.style as any)[attributeName] ?? '';

        // html：优先 el[prop]，回退到 getAttribute
        return (el as any)[attributeName] ?? el.getAttribute(attributeName);
    }

    /**
     * 设置节点属性（走脏追踪）
     */
    setAttribute(nodeName: string, attributeName: string, value: any): void {
        this._markNodeDirty(nodeName, { [attributeName]: value });
    }

    /**
     * 批量设置节点属性（走脏追踪）
     */
    setAttributes(nodeName: string, attributes: Partial<AttributesMap>): void {
        this._markNodeDirty(nodeName, attributes);
    }

    /**
     * 移除节点属性
     */
    removeAttribute(nodeName: string, attribute: string): void {
        this._markNodeDirty(nodeName, { [attribute]: undefined });
    }

    /**
     * 批量移除节点属性
     */
    removeAttributes(nodeName: string, attributes: string[]): void {
        const cleans: Record<string, any> = {};
        for (const attr of attributes) {
            cleans[attr] = undefined;
        }
        this._markNodeDirty(nodeName, cleans);
    }

    /**
     * 获取指定节点名称的DOM元素的classList对象
     * @param nodeName - 要获取的DOM元素的节点名称
     * @returns 返回DOM元素的classList对象，如果元素不存在则返回undefined
     */
    getCls(nodeName: string): DOMTokenList {
        const el = this._owner.getNodeEl(nodeName); // 通过_owner获取指定节点名称的DOM元素
        return el?.classList; // 返回元素的classList，如果el不存在则返回undefined
    }

    hasCls(nodeName: string, cls: string): boolean {
        const classList = this.getCls(nodeName);
        return classList?.contains(cls) ?? false;
    }

    /**
     * 为指定节点添加CSS类名
     * @param nodeName - 目标节点的名称
     * @param cls - 要添加的类名，可以是单个字符串或字符串数组
     */
    addCls(nodeName: string, cls: string | string[]): void {
        const classList = this.getCls(nodeName); // 获取目标节点的classList对象
        if (typeof cls === 'string')
            classList?.add(cls); // 如果是单个类名，直接添加
        else classList?.add(...cls); // 如果是类名数组，展开后添加
    }

    /**
     * 从指定节点中移除指定的CSS类
     * @param nodeName - 要操作的节点名称
     * @param cls - 需要移除的CSS类名
     */
    removeCls(nodeName: string, cls: string): void {
        // 获取指定节点的classList
        const classList = this.getCls(nodeName);
        // 如果classList存在，则移除指定的CSS类
        classList?.remove(cls);
    }

    toggleCls(nodeName: string, cls: string, force?: boolean): void {
        const classList = this.getCls(nodeName);
        if (force === undefined) {
            classList?.toggle(cls);
        } else if (force) {
            classList?.add(cls);
        } else {
            classList?.remove(cls);
        }
    }

    /**
     * 立即刷新所有脏节点
     */
    flush(nodeName?: string): void {
        const dirty = this._dirtyNodes ?? {};

        if (nodeName) {
            this._dirtyNodes[nodeName] = {};
            this._applyProps(nodeName, dirty[nodeName] ?? {});
            return;
        }

        this._dirtyNodes = {};

        for (const [name, attributes] of Object.entries(dirty)) {
            this._applyProps(name, attributes);
        }
    }

    /**
     * 应用属性到节点
     */
    private _applyProps(nodeName: string, attributes: Record<string, any>): void {
        const el = this._owner.getNodeEl(nodeName);
        if (!el) return;

        // 1. 更新状态
        if (!this._states[nodeName]) {
            this._states[nodeName] = {};
        }

        for (const [key, value] of Object.entries(attributes)) {
            if (value === undefined || value === null) {
                delete this._states[nodeName][key];
                this._removeFromDOM(el, key);
            } else {
                this._states[nodeName][key] = value;
                this._applyToDOM(el, key, value);
            }
        }
    }

    /**
     * 应用属性到 DOM
     */
    private _applyToDOM(el: HTMLElement, key: string, value: any): void {
        const type = this.getAttrType(key);

        if (type === 'class') {
            el.className = value;
            return;
        }

        if (type === 'style') {
            (el.style as any)[key] = value;
            return;
        }

        // html：优先直接赋值，回退到 setAttribute
        if (key in el) {
            (el as any)[key] = value;
        } else {
            el.setAttribute(key, String(value));
        }
    }

    /**
     * 从 DOM 移除属性
     */
    private _removeFromDOM(el: HTMLElement, key: string): void {
        const type = this.getAttrType(key);

        if (type === 'class') {
            // el.className = '';
            // el.removeAttribute('class');
            return;
        }

        if (type === 'style') {
            (el.style as any)[key] = '';
            return;
        }

        // html
        if (key in el) {
            (el as any)[key] = undefined;
        }
        el.removeAttribute(key);
    }

    /**
     * 标记节点为脏（自动分类）
     */
    private _markNodeDirty(nodeName: string, props: Record<string, any>): void {
        if (!this._dirtyNodes) this._dirtyNodes = {};
        if (!this._dirtyNodes[nodeName]) {
            this._dirtyNodes[nodeName] = {};
        }

        for (const [key, value] of Object.entries(props)) {
            if (key === 'style') {
                StyleHelper.expand(value, this._dirtyNodes[nodeName]);
                continue;
            }
            const type = this.getAttrType(key);
            if (type === 'class') {
                this.addCls(nodeName, value);
                //this._dirtyNodes[nodeName].class = value;
                continue;
            }
            this._dirtyNodes[nodeName][key] = value;
        }

        this.debounce('AttrributeManager:flush', () => this.flush(), 0);
    }

    private getAttrType(key: string): 'class' | 'style' | 'html' {
        if (CLASS_KEYS.has(key)) return 'class';
        if (STYLE_KEYS.has(key)) return 'style';
        // data-* / aria-* 都算 html
        if (key.startsWith('data-') || key.startsWith('aria-')) return 'html';
        if (HTML_KEYS.has(key)) return 'html';
        return 'html'; // 默认 html
    }

    /**
     * 销毁管理器
     */
    onDisposed(): void {
        this._states = {};
        this._dirtyNodes = {};
        this._owner = null as any;
    }
}

AttributeManager.use(DebounceAbility);
export interface AttributeManager extends InferAbility<typeof DebounceAbility> {}
