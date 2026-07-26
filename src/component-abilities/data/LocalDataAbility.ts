/**
 * LocalDataAbility — 本地数据能力
 *
 * 为组件提供纯本地数据管理，不经过 Entity 系统。
 * 通过 key 标识不同的数据集，支持 CRUD 操作和变更通知。
 *
 * ══════════════════════════════════════════════════════════════
 * 数据来源（三种方式，可组合）
 * ══════════════════════════════════════════════════════════════
 *
 * 1. 模板声明式（body.localData + body.localDataKey）：
 *    RuntimeEngine 管线自动初始化，无需手动调用。
 *
 *    body: {
 *        localDataKey: 'rows',
 *        localData: {
 *            rows: [
 *                { id: 1, name: 'Alice' },
 *                { id: 2, name: 'Bob' },
 *            ],
 *        },
 *    }
 *
 * 2. 构造参数（props.localData + props.localDataKey）：
 *    实例级覆盖，同名 key 优先级高于 body 声明。
 *
 *    new MyTable({ localDataKey: 'rows', localData: { rows: [...] } });
 *
 * 3. 运行时方法调用：
 *    初始化后动态修改数据。
 *
 *    table.setLocalData('rows', [...]);
 *    table.addLocalDataItem('rows', { id: 3, name: 'Charlie' });
 *
 * ══════════════════════════════════════════════════════════════
 * 适用场景
 * ══════════════════════════════════════════════════════════════
 *
 * - 下拉选择（options 数据）
 * - 表格（行数据）
 * - 列表（items 数据）
 * - 树形控件（节点数据）
 * - 任何需要本地数据驱动的组件
 *
 * @example
 * ```ts
 * // 方式 1：模板声明式
 * const MyTable = Component.withTemplate(TEMPLATE, {
 *     localDataKey: 'rows',
 *     localData: {
 *         rows: [
 *             { id: 1, name: 'Alice' },
 *             { id: 2, name: 'Bob' },
 *         ],
 *     },
 *     abilities: [LocalDataAbility],
 * });
 *
 * // 方式 2：构造参数
 * const table = new MyTable({ localData: { rows: fetchedRows } });
 *
 * // 方式 3：运行时方法
 * table.setLocalData('rows', [...]);
 * table.onLocalDataChange('rows', (data, prev) => { ... });
 * table.addLocalDataItem('rows', { id: 3, name: 'Charlie' });
 * table.updateLocalDataItem('rows', 1, { id: 2, name: 'Bob Updated' });
 * table.removeLocalDataItem('rows', 0);
 * ```
 */

import type { AbilityDefinition } from '@/composable';

/** 本地数据变更回调 */
export type LocalDataChangeCallback = (data: any[], prev: any[]) => void;

/** 本地数据状态 */
interface LocalDataState {
    data: Map<string, any[]>;
    listeners: Map<string, Set<LocalDataChangeCallback>>;
}

const STATE_KEY = 'LocalDataAbility:state';

function getState(host: any): LocalDataState {
    let state = host.abilityState(STATE_KEY) as LocalDataState | undefined;
    if (!state) {
        state = {
            data: new Map(),
            listeners: new Map(),
        };
        host.setAbilityState(STATE_KEY, state);
    }
    return state;
}

function notifyChange(host: any, key: string, data: any[], prev: any[]): void {
    const state = getState(host);
    const listeners = state.listeners.get(key);
    if (listeners) {
        for (const cb of listeners) {
            cb(data, prev);
        }
    }
    host.emit?.(`localDataChange:${key}`, data, prev);
}

export const LocalDataAbility = {
    // ─── 属性 ───

    /**
     * 当前激活的数据 key
     *
     * 组件可通过此属性声明当前渲染使用的数据源 key。
     * 可在 body.localDataKey 或 props.localDataKey 中声明，
     * RuntimeEngine 管线自动设置。
     */
    localDataKey: {
        get(): string | null {
            return this.abilityState('LocalDataAbility:activeKey', null);
        },
        set(key: string | null) {
            this.setAbilityState('LocalDataAbility:activeKey', key);
        },
    },

    // ─── 数据存取 ───

    /**
     * 设置本地数据
     *
     * 替换指定 key 的全部数据，触发变更通知。
     *
     * @param key - 数据标识
     * @param data - 数据数组
     */
    setLocalData(key: string, data: any[]): void {
        const state = getState(this);
        const prev = state.data.get(key) ?? [];
        state.data.set(key, data);
        notifyChange(this, key, data, prev);
    },

    /**
     * 获取本地数据
     *
     * @param key - 数据标识，默认使用 localDataKey
     * @returns 数据数组，未设置时返回空数组
     */
    getLocalData(key?: string): any[] {
        const state = getState(this);
        const actualKey = key ?? this.localDataKey;
        if (!actualKey) return [];
        return state.data.get(actualKey) ?? [];
    },

    /**
     * 移除本地数据
     *
     * @param key - 数据标识
     */
    removeLocalData(key: string): void {
        const state = getState(this);
        const prev = state.data.get(key);
        if (!prev) return;
        state.data.delete(key);
        notifyChange(this, key, [], prev);
    },

    /**
     * 检查本地数据是否存在
     *
     * @param key - 数据标识
     */
    hasLocalData(key: string): boolean {
        const state = getState(this);
        return state.data.has(key);
    },

    /**
     * 获取所有已注册的数据 key
     */
    getLocalDataKeys(): string[] {
        const state = getState(this);
        return [...state.data.keys()];
    },

    /**
     * 清除所有本地数据
     */
    clearAllLocalData(): void {
        const state = getState(this);
        const keys = [...state.data.keys()];
        for (const key of keys) {
            const prev = state.data.get(key)!;
            state.data.delete(key);
            notifyChange(this, key, [], prev);
        }
    },

    // ─── CRUD 操作 ───

    /**
     * 添加数据项
     *
     * @param key - 数据标识
     * @param item - 数据项
     * @param index - 插入位置，默认追加到末尾
     */
    addLocalDataItem(key: string, item: any, index?: number): void {
        const data = [...this.getLocalData(key)];
        if (index !== undefined && index >= 0 && index <= data.length) {
            data.splice(index, 0, item);
        } else {
            data.push(item);
        }
        this.setLocalData(key, data);
    },

    /**
     * 更新数据项
     *
     * @param key - 数据标识
     * @param index - 数据项索引
     * @param updater - 新值或更新函数
     */
    updateLocalDataItem(key: string, index: number, updater: any | ((item: any) => any)): void {
        const data = [...this.getLocalData(key)];
        if (index < 0 || index >= data.length) return;
        data[index] = typeof updater === 'function' ? updater(data[index]) : updater;
        this.setLocalData(key, data);
    },

    /**
     * 删除数据项
     *
     * @param key - 数据标识
     * @param index - 数据项索引
     */
    removeLocalDataItem(key: string, index: number): void {
        const data = [...this.getLocalData(key)];
        if (index < 0 || index >= data.length) return;
        data.splice(index, 1);
        this.setLocalData(key, data);
    },

    // ─── 变更监听 ───

    /**
     * 监听数据变更
     *
     * @param key - 数据标识
     * @param callback - 变更回调，接收 (新数据, 旧数据)
     */
    onLocalDataChange(key: string, callback: LocalDataChangeCallback): void {
        const state = getState(this);
        let listeners = state.listeners.get(key);
        if (!listeners) {
            listeners = new Set();
            state.listeners.set(key, listeners);
        }
        listeners.add(callback);
    },

    /**
     * 取消监听数据变更
     *
     * @param key - 数据标识
     * @param callback - 变更回调
     */
    offLocalDataChange(key: string, callback: LocalDataChangeCallback): void {
        const state = getState(this);
        const listeners = state.listeners.get(key);
        if (!listeners) return;
        listeners.delete(callback);
        if (listeners.size === 0) {
            state.listeners.delete(key);
        }
    },
} satisfies AbilityDefinition;
