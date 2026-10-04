/**
 * SelectionAbility — 选择能力
 *
 * 数据维度的选中状态管理，支持 single（单选）和 multiple（多选）模式。
 * 选中状态以 key → data 存储，与 UI 无关，可被 Table、List、Grid 等组件复用。
 *
 * 与 GroupSelectAbility 的差异：
 * - GroupSelectAbility 管理子组件实例的 checked 状态（菜单分组场景）
 * - SelectionAbility 管理数据行的选中状态（池化行组件场景，
 *   选中状态挂在数据维度，跨 reflow/行复用保持）
 *
 * 使用方式：
 * 1. 组件通过 use([SelectionAbility]) 混入
 * 2. 初始化：this.initSelection({ mode: 'multiple' })
 * 3. 选择：this.select(key, data) / toggleSelect / selectAll / clearSelection
 * 4. 查询：this.isSelected(key) / getSelectedKeys() / getSelectedData()
 * 5. 禁选：this.setSelectionDisabled(keys) — toggle/select/selectAll 均排除
 * 6. 事件：能力内部 emit('selectionChange', { keys, data, lastKey })
 */

import type { AbilityDefinition } from '../../composable/types/ability';
import type {
    SelectionConfig,
    SelectionEntry,
    SelectionState,
    SelectionChangeData,
} from './types';

const STATE_KEY = 'SelectionAbility:state';

function getState(self: any): SelectionState | undefined {
    return self.abilityState(STATE_KEY);
}

function ensureState(self: any, config: SelectionConfig): SelectionState {
    const existing = getState(self);
    if (existing) return existing;

    const state: SelectionState = {
        mode: config.mode ?? 'single',
        selected: new Map(),
        disabled: new Set(),
    };
    self.setAbilityState(STATE_KEY, state);
    return state;
}

function emitChange(self: any, state: SelectionState, lastKey: string | null): void {
    const change: SelectionChangeData = {
        keys: [...state.selected.keys()],
        data: [...state.selected.values()],
        lastKey,
    };
    self.emit('selectionChange', change);
}

export const SelectionAbility = {
    // ─── 初始化 ───

    /**
     * 初始化选择能力
     *
     * @param config - 选择配置（mode: 'single' | 'multiple'）
     */
    initSelection(config: SelectionConfig = { mode: 'single' }): void {
        ensureState(this, config);
        this.onCleanup(() => this._teardownSelection());
    },

    // ─── 选中操作 ───

    /**
     * 选中一项
     *
     * single 模式替换已选，multiple 模式累加。
     * 禁选项和已选项返回 false，不触发事件。
     *
     * @param key - 唯一标识
     * @param data - 关联数据
     * @returns 是否选中成功
     */
    select(key: string, data?: any): boolean {
        const state = getState(this);
        if (!state || state.disabled.has(key) || state.selected.has(key)) return false;
        if (state.mode === 'single') state.selected.clear();
        state.selected.set(key, data);
        emitChange(this, state, key);
        return true;
    },

    /**
     * 取消选中一项
     *
     * @param key - 唯一标识
     * @returns 是否取消成功
     */
    deselect(key: string): boolean {
        const state = getState(this);
        if (!state || !state.selected.has(key)) return false;
        state.selected.delete(key);
        emitChange(this, state, key);
        return true;
    },

    /**
     * 切换选中状态
     *
     * 已选中则取消，未选中则选中（禁选项忽略）。
     *
     * @param key - 唯一标识
     * @param data - 关联数据
     */
    toggleSelect(key: string, data?: any): void {
        const state = getState(this);
        if (!state) return;
        if (state.selected.has(key)) this.deselect(key);
        else this.select(key, data);
    },

    /**
     * 全选（仅 multiple 模式有效）
     *
     * 禁选项自动排除，已在集合中的条目更新 data。
     *
     * @param entries - 全部可选条目（{ key, data } 数组）
     * @returns 是否执行成功
     */
    selectAll(entries: SelectionEntry[]): boolean {
        const state = getState(this);
        if (!state || state.mode !== 'multiple') return false;
        for (const entry of entries) {
            if (state.disabled.has(entry.key)) continue;
            state.selected.set(entry.key, entry.data);
        }
        emitChange(this, state, null);
        return true;
    },

    /**
     * 清空选中
     */
    clearSelection(): void {
        const state = getState(this);
        if (!state || state.selected.size === 0) return;
        state.selected.clear();
        emitChange(this, state, null);
    },

    // ─── 查询 ───

    /**
     * 是否选中
     */
    isSelected(key: string): boolean {
        return getState(this)?.selected.has(key) ?? false;
    },

    /**
     * 选中 key 数组
     */
    getSelectedKeys(): string[] {
        const state = getState(this);
        return state ? [...state.selected.keys()] : [];
    },

    /**
     * 选中关联数据数组
     */
    getSelectedData(): any[] {
        const state = getState(this);
        return state ? [...state.selected.values()] : [];
    },

    /**
     * 选中数量
     */
    getSelectionCount(): number {
        return getState(this)?.selected.size ?? 0;
    },

    /**
     * 选择模式
     */
    getSelectionMode(): 'single' | 'multiple' | undefined {
        return getState(this)?.mode;
    },

    // ─── 禁选 ───

    /**
     * 设置禁选 key 集合
     *
     * 已选中的禁选项自动取消选中（触发事件）。
     *
     * @param keys - 禁选 key 数组
     */
    setSelectionDisabled(keys: string[]): void {
        const state = getState(this);
        if (!state) return;
        state.disabled = new Set(keys);
        let removed = false;
        for (const key of keys) {
            if (state.selected.delete(key)) removed = true;
        }
        if (removed) emitChange(this, state, null);
    },

    /**
     * 是否禁选
     */
    isSelectionDisabled(key: string): boolean {
        return getState(this)?.disabled.has(key) ?? false;
    },

    // ─── 清理 ───

    _teardownSelection(): void {
        const state = getState(this);
        if (!state) return;
        state.selected.clear();
        state.disabled.clear();
    },
} satisfies AbilityDefinition;
