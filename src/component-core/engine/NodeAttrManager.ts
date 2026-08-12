import { ComposableBase, InferAbility } from '@/composable';
import { IComponentBase, INodeAttributeManager } from '../types';
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
export class NodeAttrManager extends ComposableBase implements INodeAttributeManager {
    _owner: IComponentBase;

    /** 节点状态（完整状态，始终反映当前 DOM 状态） */
    private _states: Record<string, Record<string, any>> = {};

    /** 脏追踪队列（只记录待更新的变化） */
    private _dirtyNodes: Record<string, Record<string, any>> = {};

    constructor(attrDeclMap: Record<string, Record<string, any>>, owner: IComponentBase) {
        super();
        this._owner = owner;
        // 直接用 attrDeclMap 初始化状态
        this._states = { ...attrDeclMap };
    }

    /**
     * 获取节点属性
     */
    getProp(nodeName: string, key: string): any {
        const node = this._owner.getNode(nodeName);
        const el = ((node as any)?.el ?? node) as any;
        if (!el) return undefined;

        const dirty = this._dirtyNodes[nodeName];
        const state = this._states[nodeName];

        // 从脏队列/状态读
        if (dirty?.[key] !== undefined) return dirty[key];
        if (state?.[key] !== undefined) return state[key];

        // 从 DOM 读
        const type = this.getAttrType(key);
        if (type === 'class') return el.classList;
        if (type === 'style') return el.style?.[key] ?? '';

        // html：优先 el[prop]，回退到 getAttribute
        return el[key] ?? el.getAttribute(key);
    }

    /**
     * 设置节点属性（走脏追踪）
     */
    setProp(name: string, prop: string, value: any): void {
        this._markNodeDirty(name, { [prop]: value });
    }

    /**
     * 批量设置节点属性（走脏追踪）
     */
    setProps(name: string, props: Record<string, any>): void {
        this._markNodeDirty(name, props);
    }

    /**
     * 移除节点属性
     */
    removeProp(nodeName: string, prop: string): void {
        this._markNodeDirty(nodeName, { [prop]: undefined });
    }

    /**
     * 批量移除节点属性
     */
    removeProps(nodeName: string, props: string[]): void {
        const cleanProps: Record<string, any> = {};
        for (const prop of props) {
            cleanProps[prop] = undefined;
        }
        this._markNodeDirty(nodeName, cleanProps);
    }

    /**
     * 立即刷新所有脏节点
     */
    flush(): void {
        const dirty = this._dirtyNodes ?? {};
        this._dirtyNodes = {};

        for (const [name, props] of Object.entries(dirty)) {
            this._applyProps(name, props);
        }
    }

    /**
     * 应用属性到节点
     */
    private _applyProps(nodeName: string, props: Record<string, any>): void {
        const node = this._owner.getNode(nodeName);
        const el = (node as any)?.el ?? node;
        if (!el) return;

        // 1. 更新状态
        if (!this._states[nodeName]) {
            this._states[nodeName] = {};
        }

        for (const [key, value] of Object.entries(props)) {
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
            el.className = '';
            el.removeAttribute('class');
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
                this._dirtyNodes[nodeName].class = value;
                continue;
            }
            this._dirtyNodes[nodeName][key] = value;
        }

        this.debounce('NodeAttrManager:flush', () => this.flush(), 0);
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

NodeAttrManager.use(DebounceAbility);
export interface NodeAttrManager extends InferAbility<typeof DebounceAbility> {}
