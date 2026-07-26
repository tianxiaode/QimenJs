/**
 * LocalDataAbility — 本地数据能力
 *
 * 为组件提供纯本地数据管理，不经过 Entity 系统。
 * 通过 key 标识不同的数据集，支持 CRUD 操作和变更通知。
 * 内部自动创建 LocalDataManager 实例，提供 filter/sort 等数据操作能力。
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
 * 数据操作（通过内部 LocalDataManager）
 * ══════════════════════════════════════════════════════════════
 *
 * - filterLocalData(key, keyword)  — 关键词过滤（下拉选择场景）
 * - sortLocalData(key, field, order) — 字段排序（表格列排序场景）
 * - getLocalDataView(key)          — 获取过滤+排序后的视图数据
 * - getLocalDataRaw(key)           — 获取原始全量数据
 *
 * ══════════════════════════════════════════════════════════════
 * 适用场景
 * ══════════════════════════════════════════════════════════════
 *
 * - 下拉选择（options 数据 + filter）
 * - 表格（行数据 + sort）
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
 *
 * // 数据操作
 * table.filterLocalData('rows', 'ali');          // 过滤
 * table.sortLocalData('rows', 'name', 'asc');    // 排序
 * table.getLocalDataView('rows');                 // 获取过滤+排序后的数据
 * ```
 */

import type { AbilityDefinition } from '@/composable';
import { LocalDataManager } from './LocalDataManager';
import type { LocalDataManagerConfig, ILocalDataManager } from './LocalDataManager';

/** 本地数据变更回调 */
export type LocalDataChangeCallback = (data: any[], prev: any[]) => void;

/** 本地数据状态 */
interface LocalDataState {
    data: Map<string, any[]>;
    managers: Map<string, ILocalDataManager>;
    listeners: Map<string, Set<LocalDataChangeCallback>>;
}

const STATE_KEY = 'LocalDataAbility:state';

function getState(host: any): LocalDataState {
    let state = host.abilityState(STATE_KEY) as LocalDataState | undefined;
    if (!state) {
        state = {
            data: new Map(),
            managers: new Map(),
            listeners: new Map(),
        };
        host.setAbilityState(STATE_KEY, state);
    }
    return state;
}

function createManager(config?: LocalDataManagerConfig): ILocalDataManager {
    return new LocalDataManager(config) as unknown as ILocalDataManager;
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

    localDataKey: {
        get(): string | null {
            return this.abilityState('LocalDataAbility:activeKey', null);
        },
        set(key: string | null) {
            this.setAbilityState('LocalDataAbility:activeKey', key);
        },
    },

    // ─── 数据存取 ───

    setLocalData(key: string, data: any[], config?: LocalDataManagerConfig): void {
        const state = getState(this);
        const prev = state.data.get(key) ?? [];
        state.data.set(key, data);

        let manager = state.managers.get(key);
        if (!manager) {
            manager = createManager(config);
            state.managers.set(key, manager);
        }
        manager.updateData(data);

        notifyChange(this, key, data, prev);
    },

    getLocalData(key?: string): any[] {
        const state = getState(this);
        const actualKey = key ?? this.localDataKey;
        if (!actualKey) return [];
        return state.data.get(actualKey) ?? [];
    },

    removeLocalData(key: string): void {
        const state = getState(this);
        const prev = state.data.get(key);
        if (!prev) return;
        state.data.delete(key);
        const manager = state.managers.get(key);
        if (manager) {
            manager.dispose();
            state.managers.delete(key);
        }
        notifyChange(this, key, [], prev);
    },

    hasLocalData(key: string): boolean {
        const state = getState(this);
        return state.data.has(key);
    },

    getLocalDataKeys(): string[] {
        const state = getState(this);
        return [...state.data.keys()];
    },

    clearAllLocalData(): void {
        const state = getState(this);
        const keys = [...state.data.keys()];
        for (const key of keys) {
            const prev = state.data.get(key)!;
            state.data.delete(key);
            const manager = state.managers.get(key);
            if (manager) {
                manager.dispose();
                state.managers.delete(key);
            }
            notifyChange(this, key, [], prev);
        }
    },

    // ─── CRUD 操作 ───

    addLocalDataItem(key: string, item: any, index?: number): void {
        const data = [...this.getLocalData(key)];
        if (index !== undefined && index >= 0 && index <= data.length) {
            data.splice(index, 0, item);
        } else {
            data.push(item);
        }
        this.setLocalData(key, data);
    },

    updateLocalDataItem(key: string, index: number, updater: any | ((item: any) => any)): void {
        const data = [...this.getLocalData(key)];
        if (index < 0 || index >= data.length) return;
        data[index] = typeof updater === 'function' ? updater(data[index]) : updater;
        this.setLocalData(key, data);
    },

    removeLocalDataItem(key: string, index: number): void {
        const data = [...this.getLocalData(key)];
        if (index < 0 || index >= data.length) return;
        data.splice(index, 1);
        this.setLocalData(key, data);
    },

    // ─── 数据操作（转接 LocalDataManager） ───

    filterLocalData(key: string, keyword: string): void {
        const state = getState(this);
        const manager = state.managers.get(key);
        if (!manager) return;
        manager.filter(keyword);
        manager.refreshView();
    },

    sortLocalData(key: string, field: string, order: 'asc' | 'desc' = 'asc'): void {
        const state = getState(this);
        const manager = state.managers.get(key);
        if (!manager) return;
        manager.sort(field, order);
        manager.refreshView();
    },

    getLocalDataView(key?: string): any[] {
        const state = getState(this);
        const actualKey = key ?? this.localDataKey;
        if (!actualKey) return [];
        const manager = state.managers.get(actualKey);
        if (!manager) return this.getLocalData(actualKey);
        return manager.items;
    },

    getLocalDataRaw(key?: string): any[] {
        const state = getState(this);
        const actualKey = key ?? this.localDataKey;
        if (!actualKey) return [];
        const manager = state.managers.get(actualKey);
        if (!manager) return this.getLocalData(actualKey);
        return Array.from(manager.sourceData.values());
    },

    getLocalDataItem(key: string, id: string | number): any | null {
        const state = getState(this);
        const manager = state.managers.get(key);
        if (!manager) return null;
        return manager.get(id);
    },

    // ─── 变更监听 ───

    onLocalDataChange(key: string, callback: LocalDataChangeCallback): void {
        const state = getState(this);
        let listeners = state.listeners.get(key);
        if (!listeners) {
            listeners = new Set();
            state.listeners.set(key, listeners);
        }
        listeners.add(callback);
    },

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
