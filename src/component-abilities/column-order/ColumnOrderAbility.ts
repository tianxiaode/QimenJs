/**
 * ColumnOrderAbility — 列顺序映射表能力
 *
 * 维护 colName → {component, order, index} 的映射表，
 * 重排时只需修改 order 值 + 设 CSS 变量或 component.order，
 * 不需要 update 任何组件。
 *
 * 两种模式：
 * - CSS 变量模式（useCssVar: true）：重排时设 CSS 变量，子组件通过 var() 引用
 * - 直接设置模式（useCssVar: false）：重排时直接设 component.order 属性
 *
 * 适用场景：
 * - TableComponent：管理 row cells 的 order（CSS 变量模式）
 * - TableHeaderComponent：管理 header cells 的 order（直接设置模式）
 * - GroupSummaryRowComponent：管理 summary cells 的 order
 */

import type { AbilityDefinition } from '../../composable/types/ability';
import type { ColumnOrderConfig, ColumnOrderEntry, ColumnOrderState } from './types';

const STATE_KEY = 'ColumnOrderAbility:state';

const DEFAULT_STEP = 100;
const DEFAULT_CSS_VAR_PREFIX = '--q-table-col-';
const MIN_ORDER_GAP = 5;

function getState(self: any): ColumnOrderState | undefined {
    return self.abilityState(STATE_KEY);
}

function ensureState(self: any, config: ColumnOrderConfig): ColumnOrderState {
    const existing = getState(self);
    if (existing) return existing;

    const state: ColumnOrderState = {
        entries: new Map(),
        orderToName: new Map(),
        step: config.step ?? DEFAULT_STEP,
        cssVarPrefix: config.cssVarPrefix ?? DEFAULT_CSS_VAR_PREFIX,
        useCssVar: config.useCssVar ?? true,
    };
    self.setAbilityState(STATE_KEY, state);
    return state;
}

function applyOrder(self: any, state: ColumnOrderState, entry: ColumnOrderEntry): void {
    if (state.useCssVar) {
        self.el?.style.setProperty(`${state.cssVarPrefix}${entry.colName}-order`, String(entry.order));
    } else if (entry.component) {
        entry.component.order = entry.order;
    }
}

function findAdjacentName(state: ColumnOrderState, order: number, direction: 'prev' | 'next'): string | undefined {
    const sortedOrders = [...state.orderToName.keys()].sort((a, b) => a - b);
    const idx = sortedOrders.indexOf(order);
    if (idx === -1) return undefined;
    const adjacentIdx = direction === 'prev' ? idx - 1 : idx + 1;
    if (adjacentIdx < 0 || adjacentIdx >= sortedOrders.length) return undefined;
    return state.orderToName.get(sortedOrders[adjacentIdx]);
}

export const ColumnOrderAbility = {
    initColumnOrder(config: ColumnOrderConfig = {}): void {
        ensureState(this, config);
        this.onCleanup(() => this._teardownColumnOrder());
    },

    registerColumnEntry(
        colName: string,
        component: any,
        index: number,
        options: { parentGroup?: string; isLeaf?: boolean; order?: number } = {},
    ): void {
        const state = ensureState(this, {});
        const order = options.order ?? (index + 1) * state.step;

        const entry: ColumnOrderEntry = {
            colName,
            component,
            order,
            index,
            parentGroup: options.parentGroup,
            isLeaf: options.isLeaf ?? true,
        };

        state.entries.set(colName, entry);
        state.orderToName.set(order, colName);
        applyOrder(this, state, entry);
    },

    unregisterColumnEntry(colName: string): void {
        const state = getState(this);
        if (!state) return;
        const entry = state.entries.get(colName);
        if (!entry) return;
        state.orderToName.delete(entry.order);
        state.entries.delete(colName);
    },

    reorderColumn(fromName: string, toName: string, isLeft: boolean): boolean {
        const state = getState(this);
        if (!state) return false;
        const fromEntry = state.entries.get(fromName);
        const toEntry = state.entries.get(toName);
        if (!fromEntry || !toEntry) return false;
        if (fromName === toName) return false;

        const toOrder = toEntry.order;
        let newOrder: number;

        if (isLeft) {
            const prevName = findAdjacentName(state, toOrder, 'prev');
            if (prevName && prevName !== fromName) {
                const prevOrder = state.entries.get(prevName)!.order;
                newOrder = Math.floor((prevOrder + toOrder) / 2);
            } else {
                newOrder = toOrder - Math.floor(state.step / 2);
            }
        } else {
            const nextName = findAdjacentName(state, toOrder, 'next');
            if (nextName && nextName !== fromName) {
                const nextOrder = state.entries.get(nextName)!.order;
                newOrder = Math.floor((toOrder + nextOrder) / 2);
            } else {
                newOrder = toOrder + Math.floor(state.step / 2);
            }
        }

        state.orderToName.delete(fromEntry.order);
        fromEntry.order = newOrder;
        state.orderToName.set(newOrder, fromName);
        applyOrder(this, state, fromEntry);

        if (Math.abs(newOrder - toOrder) < MIN_ORDER_GAP) {
            this.normalizeColumnOrders();
        }

        return true;
    },

    rebuildColumnOrders(colNames: string[]): void {
        const state = getState(this);
        if (!state) return;
        state.orderToName.clear();
        let i = 0;
        for (const name of colNames) {
            const entry = state.entries.get(name);
            if (!entry) continue;
            entry.order = (i + 1) * state.step;
            entry.index = i;
            state.orderToName.set(entry.order, name);
            applyOrder(this, state, entry);
            i++;
        }
    },

    normalizeColumnOrders(): void {
        const state = getState(this);
        if (!state) return;
        const sortedNames = this.getOrderedColumnNames();
        state.orderToName.clear();
        for (let i = 0; i < sortedNames.length; i++) {
            const name = sortedNames[i];
            const entry = state.entries.get(name)!;
            entry.order = (i + 1) * state.step;
            entry.index = i;
            state.orderToName.set(entry.order, name);
            applyOrder(this, state, entry);
        }
    },

    getColumnOrder(colName: string): number | undefined {
        const state = getState(this);
        return state?.entries.get(colName)?.order;
    },

    getColumnComponent(colName: string): any | undefined {
        const state = getState(this);
        return state?.entries.get(colName)?.component;
    },

    getColumnEntry(colName: string): ColumnOrderEntry | undefined {
        const state = getState(this);
        return state?.entries.get(colName);
    },

    getColumnByIndex(index: number): ColumnOrderEntry | undefined {
        const state = getState(this);
        if (!state) return undefined;
        for (const entry of state.entries.values()) {
            if (entry.index === index) return entry;
        }
        return undefined;
    },

    getOrderedColumnNames(): string[] {
        const state = getState(this);
        if (!state) return [];
        return [...state.entries.values()]
            .sort((a, b) => a.order - b.order)
            .map(e => e.colName);
    },

    getColumnOrderCount(): number {
        const state = getState(this);
        return state?.entries.size ?? 0;
    },

    _teardownColumnOrder(): void {
        const state = getState(this);
        if (!state) return;
        state.entries.clear();
        state.orderToName.clear();
    },
} satisfies AbilityDefinition;
