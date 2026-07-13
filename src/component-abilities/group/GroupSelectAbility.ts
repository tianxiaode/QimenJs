/**
 * GroupSelectAbility — 分组选择能力
 *
 * 为容器组件提供分组选中态管理，支持 radio（单选）和 checkbox（多选）两种模式。
 *
 * 适用场景：
 * - 菜单分组（radio：视图模式切换，checkbox：显示/隐藏开关）
 * - 按钮组（radio：单选切换，checkbox：多选组合）
 * - 工具栏选择模式
 * - 标签页
 *
 * 使用方式：
 * 1. 容器组件通过 with([GroupSelectAbility]) 混入
 * 2. 构造函数中调用 initGroupSelect(config) 初始化
 * 3. 子项需实现 { group, groupMode, checked } 属性协议
 * 4. 子项点击时调用 host.notifyGroupSelect(item) 通知容器
 *
 * 能力状态（abilityState）：
 * - GroupSelectAbility:state — { groups: { [name]: GroupInfo }, defaultMode }
 *
 * @example
 * ```js
 * // 混入能力
 * const MyContainer = TemplateComponent.withTemplate(TEMPLATE).with([GroupSelectAbility]);
 *
 * // 初始化
 * this.initGroupSelect({ defaultMode: 'radio' });
 *
 * // 注册子项（子项创建后调用）
 * this.registerGroupItem(item);
 *
 * // 子项点击时通知
 * this.notifyGroupSelect(item);
 *
 * // 查询选中状态
 * this.getGroupChecked('view');        // radio → 单个 item
 * this.getGroupChecked('show');        // checkbox → item[]
 * this.getGroupCheckedIndex('view');   // radio → 索引
 * ```
 */

import type { AbilityDefinition } from '@/composable';

/** 分组模式 */
export type GroupSelectMode = 'radio' | 'checkbox';

/** 分组信息 */
export interface GroupInfo {
    /** 分组模式 */
    mode: GroupSelectMode;
    /** 组内子项引用 */
    items: any[];
}

/** 分组选择配置 */
export interface GroupSelectConfig {
    /** 默认分组模式，默认 'radio' */
    defaultMode?: GroupSelectMode;
}

/** 分组状态键 */
const STATE_KEY = 'GroupSelectAbility:state';

/** 默认配置 */
const DEFAULT_CONFIG: GroupSelectConfig = {
    defaultMode: 'radio',
};

/** 分组状态结构 */
interface GroupSelectState {
    groups: Record<string, GroupInfo>;
    defaultMode: GroupSelectMode;
}

export const GroupSelectAbility: AbilityDefinition = {
    // ─── 初始化 ───

    /**
     * 初始化分组选择能力
     *
     * @param config - 分组选择配置
     */
    initGroupSelect(config?: GroupSelectConfig): void {
        const cfg = { ...DEFAULT_CONFIG, ...config };
        this.setAbilityState(STATE_KEY, {
            groups: {} as Record<string, GroupInfo>,
            defaultMode: cfg.defaultMode,
        });
    },

    // ─── 注册/注销 ───

    /**
     * 注册子项到分组
     *
     * 子项需具备 group、groupMode、checked 属性。
     * 首次注册某分组时，以子项的 groupMode 作为该组模式。
     *
     * @param item - 子项实例
     */
    registerGroupItem(item: any): void {
        const state = this.abilityState(STATE_KEY) as GroupSelectState | undefined;
        if (!state) return;

        const groupName = item.group;
        if (!groupName) return;

        if (!state.groups[groupName]) {
            state.groups[groupName] = {
                mode: item.groupMode ?? state.defaultMode,
                items: [],
            };
        }

        const group = state.groups[groupName];

        // 避免重复注册
        if (!group.items.includes(item)) {
            group.items.push(item);
        }
    },

    /**
     * 注销子项
     *
     * @param item - 子项实例
     */
    unregisterGroupItem(item: any): void {
        const state = this.abilityState(STATE_KEY) as GroupSelectState | undefined;
        if (!state) return;

        const groupName = item.group;
        if (!groupName || !state.groups[groupName]) return;

        const group = state.groups[groupName];
        const idx = group.items.indexOf(item);
        if (idx >= 0) {
            group.items.splice(idx, 1);
        }

        // 组内无项时清理
        if (group.items.length === 0) {
            delete state.groups[groupName];
        }
    },

    // ─── 选中通知 ───

    /**
     * 通知子项选中
     *
     * 子项点击时调用此方法，由能力统一处理互斥逻辑：
     * - radio：取消同组其他项，激活当前项
     * - checkbox：无需互斥处理，子项自行切换
     *
     * @param item - 被选中的子项
     */
    notifyGroupSelect(item: any): void {
        const state = this.abilityState(STATE_KEY) as GroupSelectState | undefined;
        if (!state) return;

        const groupName = item.group;
        if (!groupName) return;

        const group = state.groups[groupName];
        if (!group) return;

        if (group.mode === 'radio') {
            // radio：取消同组其他项
            for (const child of group.items) {
                if (child !== item && child.checked) {
                    child.checked = false;
                }
            }
            // 确保当前项选中
            if (!item.checked) {
                item.checked = true;
            }
        }
        // checkbox 模式无需额外处理，子项自行切换
    },

    // ─── 查询 ───

    /**
     * 获取指定分组的选中项
     *
     * radio 模式返回单个 item（或 null），checkbox 模式返回 item 数组。
     *
     * @param groupName - 分组名称
     */
    getGroupChecked(groupName: string): any | any[] | null {
        const state = this.abilityState(STATE_KEY) as GroupSelectState | undefined;
        if (!state || !state.groups[groupName]) return null;

        const group = state.groups[groupName];
        const checked = group.items.filter((item: any) => item.checked);

        return group.mode === 'radio' ? (checked[0] ?? null) : checked;
    },

    /**
     * 获取指定分组选中项的索引
     *
     * radio 模式返回单个索引（或 -1），checkbox 模式返回索引数组。
     *
     * @param groupName - 分组名称
     */
    getGroupCheckedIndex(groupName: string): number | number[] {
        const state = this.abilityState(STATE_KEY) as GroupSelectState | undefined;
        if (!state || !state.groups[groupName]) return -1;

        const group = state.groups[groupName];
        const indices: number[] = [];

        for (let i = 0; i < group.items.length; i++) {
            if (group.items[i].checked) {
                indices.push(i);
            }
        }

        return group.mode === 'radio' ? (indices[0] ?? -1) : indices;
    },

    /**
     * 获取指定分组信息
     *
     * @param groupName - 分组名称
     */
    getGroupInfo(groupName: string): GroupInfo | null {
        const state = this.abilityState(STATE_KEY) as GroupSelectState | undefined;
        if (!state) return null;
        return state.groups[groupName] ?? null;
    },

    /**
     * 获取所有分组名称
     */
    getGroupNames(): string[] {
        const state = this.abilityState(STATE_KEY) as GroupSelectState | undefined;
        if (!state) return [];
        return Object.keys(state.groups);
    },

    // ─── 批量设置 ───

    /**
     * 批量设置子项并注册到分组
     *
     * 遍历 items 数组，对有 group 属性的子项自动注册。
     * 适用于 ItemGroup.setItems() 后的批量注册场景。
     *
     * @param items - 子项实例数组
     */
    registerGroupItems(items: any[]): void {
        for (const item of items) {
            this.registerGroupItem(item);
        }
    },

    /**
     * 设置指定分组的选中项
     *
     * radio 模式：传入索引，取消原选中，激活新选中
     * checkbox 模式：传入索引数组，按索引设置 checked
     *
     * @param groupName - 分组名称
     * @param index - radio 模式为单个索引，checkbox 模式为索引数组
     */
    setGroupChecked(groupName: string, index: number | number[]): void {
        const state = this.abilityState(STATE_KEY) as GroupSelectState | undefined;
        if (!state || !state.groups[groupName]) return;

        const group = state.groups[groupName];

        if (group.mode === 'radio') {
            const targetIdx = index as number;
            if (targetIdx < 0 || targetIdx >= group.items.length) return;

            // 取消原选中
            for (const item of group.items) {
                if (item.checked) item.checked = false;
            }
            // 激活新选中
            group.items[targetIdx].checked = true;
        } else {
            const targetIndices = index as number[];
            // 全部取消
            for (const item of group.items) {
                if (item.checked) item.checked = false;
            }
            // 按索引激活
            for (const idx of targetIndices) {
                if (idx >= 0 && idx < group.items.length) {
                    group.items[idx].checked = true;
                }
            }
        }
    },

    // ─── 清理 ───

    /**
     * 清除所有分组状态
     */
    clearGroups(): void {
        const state = this.abilityState(STATE_KEY) as GroupSelectState | undefined;
        if (!state) return;
        state.groups = {};
    },
};
