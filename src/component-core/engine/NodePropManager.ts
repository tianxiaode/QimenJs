// managers/NodePropManager.ts

import { IComponentBase, INodeMapManager, INodePropManager } from '../types';

/**
 * NodePropManager — 节点属性管理器
 *
 * 职责：
 * 1. 管理所有节点的属性状态（props + attrs）
 * 2. 脏追踪（批量更新）
 * 3. 应用属性到 DOM
 * 4. 与 NodeMapManager 配合
 */
export class NodePropManager implements INodePropManager {
    private _owner: IComponentBase;

    /** 节点当前状态（内存中的属性值） */
    private _states: Record<string, Record<string, any>> = {};

    /** 脏追踪队列 */
    private _dirtyNodes: Record<string, Record<string, any>> = {};

    /** 防抖定时器 */
    private _flushTimer: any = null;

    constructor(nodeMapMgr: INodeMapManager, owner: IComponentBase) {
        this._nodeMapMgr = nodeMapMgr;
        this._owner = owner;

        // 初始化所有节点状态
        this._initStates();
    }

    /**
     * 初始化所有节点状态
     */
    private _initStates(): void {
        const nodeMetas = this._nodeMapMgr.nodeMetas;
        for (const [name, meta] of Object.entries(nodeMetas)) {
            if (name === 'root') continue;
            if (meta.componentClass) continue;

            this._states[name] = {
                // 从 meta 中读取初始值
                ...meta.htmlProps,
                ...meta.attrs,
                text: meta.text,
            };
        }
    }

    /**
     * 获取节点属性
     */
    getProp(nodeName: string, prop: string): any {
        // 1. 优先从脏队列读取
        if (this._dirtyNodes[nodeName]?.[prop] !== undefined) {
            return this._dirtyNodes[nodeName][prop];
        }

        // 2. 从状态读取
        if (this._states[nodeName]?.[prop] !== undefined) {
            return this._states[nodeName][prop];
        }

        // 3. 从 DOM 读取
        return this._readFromDOM(nodeName, prop);
    }

    /**
     * 设置节点属性（走脏追踪）
     */
    setProp(nodeName: string, prop: string, value: any): void {
        if (!this._dirtyNodes[nodeName]) {
            this._dirtyNodes[nodeName] = {};
        }
        this._dirtyNodes[nodeName][prop] = value;

        // 触发脏刷新（防抖）
        this._scheduleFlush();
    }

    /**
     * 批量设置节点属性（走脏追踪）
     */
    setProps(nodeName: string, props: Record<string, any>): void {
        if (!this._dirtyNodes[nodeName]) {
            this._dirtyNodes[nodeName] = {};
        }
        Object.assign(this._dirtyNodes[nodeName], props);

        this._scheduleFlush();
    }

    /**
     * 立即刷新所有脏节点
     */
    flush(): void {
        if (this._flushTimer) {
            clearTimeout(this._flushTimer);
            this._flushTimer = null;
        }

        const dirty = this._dirtyNodes;
        this._dirtyNodes = {};

        for (const [nodeName, props] of Object.entries(dirty)) {
            this._applyProps(nodeName, props);
        }
    }

    /**
     * 应用属性到节点（直接写入 DOM）
     */
    private _applyProps(nodeName: string, props: Record<string, any>): void {
        const node = this._nodeMapMgr.get(nodeName);
        if (!node?.el) return;

        // 更新状态
        if (!this._states[nodeName]) {
            this._states[nodeName] = {};
        }
        Object.assign(this._states[nodeName], props);

        // 应用到 DOM
        applyNodeProps(node.el, props);
    }

    /**
     * 从 DOM 读取属性
     */
    private _readFromDOM(nodeName: string, prop: string): any {
        const node = this._nodeMapMgr.get(nodeName);
        if (!node?.el) return undefined;

        const def = DEFAULT_NODE_PROP_MAP[prop];
        if (!def) return undefined;

        if (def.cssProp) {
            return node.el.style?.[def.cssProp] ?? '';
        }
        if (def.attr) {
            return node.el.getAttribute(def.attr);
        }
        return (node.el as any)[def.domAttr];
    }

    /**
     * 调度脏刷新（防抖）
     */
    private _scheduleFlush(): void {
        if (this._flushTimer) {
            clearTimeout(this._flushTimer);
        }
        this._flushTimer = setTimeout(() => {
            this.flush();
        }, 0);
    }

    /**
     * 销毁管理器
     */
    dispose(): void {
        if (this._flushTimer) {
            clearTimeout(this._flushTimer);
            this._flushTimer = null;
        }
        this._dirtyNodes = {};
        this._states = {};
    }
}
