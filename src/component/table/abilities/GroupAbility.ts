import type { AbilityDefinition } from '@/composable';
import type { ColumnMeta } from '../column-types';
import { GROUP_SUMMARY_ROW_TYPE } from '../constants';
import type { TableAbilityHost } from './types';

/**
 * GroupAbility — 分组行
 *
 * 分组数据（[{ groupKey, groupItems }]）展开为「组行 + 组内行」，
 * _groupRowMap 维护组行/组内行索引，groupToggle 事件驱动折叠显隐。
 */
export const GroupAbility = {
    /** 判断是否为分组数据（[{ groupKey, groupItems }]） */
    _isGroupedData(this: TableAbilityHost, data: any[]): boolean {
        return (
            Array.isArray(data) &&
            data.length > 0 &&
            data[0] !== null &&
            typeof data[0] === 'object' &&
            'groupKey' in data[0] &&
            Array.isArray(data[0].groupItems)
        );
    },

    /** 按 groupAggregator 计算分组汇总行数据 */
    _buildGroupSummary(this: TableAbilityHost, group: any, metas: ColumnMeta[]): Record<string, any> {
        const summary: Record<string, any> = {};
        for (const meta of metas) {
            if (!meta.groupAggregator) continue;
            if (meta.groupAggregator === 'label') {
                summary[meta.name] = group.groupKey;
            } else {
                summary[meta.name] = this._aggregate(meta, group.groupItems ?? []);
            }
        }
        return summary;
    },

    _buildGroupRowMap(this: TableAbilityHost, itemsData: Record<string, any>[]): void {
        this._groupRowMap = new Map();
        const items = this.items;
        if (!Array.isArray(items)) return;
        for (let i = 0; i < items.length; i++) {
            const groupKey = itemsData[i]?._groupKey;
            if (groupKey === undefined) continue;
            let entry = this._groupRowMap.get(groupKey);
            if (!entry) {
                entry = { summaryRow: null, dataRows: [] };
                this._groupRowMap.set(groupKey, entry);
            }
            if (itemsData[i]?.type === GROUP_SUMMARY_ROW_TYPE) {
                entry.summaryRow = items[i];
            } else {
                entry.dataRows.push(items[i]);
            }
        }
    },

    onGroupToggle(this: TableAbilityHost, data: { groupKey: string; collapsed: boolean }): void {
        const entry = this._groupRowMap?.get(data.groupKey);
        if (!entry) return;
        for (const row of entry.dataRows) {
            row.hidden = data.collapsed;
        }
        this._applyZebraStripes();
    },
} satisfies AbilityDefinition;
