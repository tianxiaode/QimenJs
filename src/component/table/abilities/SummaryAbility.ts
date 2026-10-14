import type { AbilityDefinition } from '@/composable';
import type { ColumnMeta, AggregatorType } from '../column-types';
import { TableSummaryRowComponent } from '../table-summary/TableSummaryRowComponent';
import type { TableAbilityHost } from './types';

/**
 * SummaryAbility — 汇总行与聚合
 *
 * columnMetas 中 summary 声明驱动（label 固定文案 / aggregator 聚合函数），
 * 汇总行懒创建挂 summaryArea，sum/count/avg/min/max 聚合统一入口。
 */
export const SummaryAbility = {
    _updateSummaryRow(this: TableAbilityHost): void {
        const metas = this._columnMetaManager?.getAll() ?? [];
        const hasSummary = metas.some(m => m.summary);

        if (!hasSummary) {
            if (this._summaryRow) {
                this._summaryRow.dispose();
                this._summaryRow = null;
            }
            return;
        }

        const summaryData = this._computeSummaryData(metas);

        if (!this._summaryRow) {
            const summaryArea = this.getNodeEl('summaryArea');
            if (!summaryArea) return;
            this._summaryRow = new TableSummaryRowComponent({ columnMetas: metas });
            summaryArea.appendChild(this._summaryRow.el!);
        }

        this._summaryRow.update(summaryData);
    },

    _computeSummaryData(this: TableAbilityHost, metas: ColumnMeta[]): Record<string, any> {
        const data = this.hasEntity() ? this.getEntityItems() : (this.getData('data') ?? []);
        const flatData = this._isGroupedData(data)
            ? data.flatMap((g: any) => g.groupItems ?? [])
            : data;
        const summary: Record<string, any> = {};

        for (const meta of metas) {
            if (!meta.summary) continue;
            if (meta.summary.label !== undefined) {
                summary[meta.name] = meta.summary.label;
            } else if (meta.summary.aggregator) {
                summary[meta.name] = this._aggregateByType(meta, flatData, meta.summary.aggregator);
            }
        }

        return summary;
    },

    _aggregateByType(this: TableAbilityHost, meta: ColumnMeta, items: any[], aggregator: AggregatorType): any {
        const values = items.map(row => this._getFieldValue(row, meta.field));
        switch (aggregator) {
            case 'sum':
                return values.reduce((acc, v) => acc + (Number(v) || 0), 0);
            case 'count':
                return items.length;
            case 'avg':
                return values.length
                    ? values.reduce((acc, v) => acc + (Number(v) || 0), 0) / values.length
                    : '';
            case 'min':
                return values.length ? Math.min(...values.map(v => Number(v))) : '';
            case 'max':
                return values.length ? Math.max(...values.map(v => Number(v))) : '';
            default:
                return '';
        }
    },

    _aggregate(this: TableAbilityHost, meta: ColumnMeta, items: any[]): any {
        const values = items.map(row => this._getFieldValue(row, meta.field));
        switch (meta.groupAggregator) {
            case 'sum':
                return values.reduce((acc, v) => acc + (Number(v) || 0), 0);
            case 'count':
                return items.length;
            case 'avg':
                return values.length
                    ? values.reduce((acc, v) => acc + (Number(v) || 0), 0) / values.length
                    : '';
            case 'min':
                return values.length ? Math.min(...values.map(v => Number(v))) : '';
            case 'max':
                return values.length ? Math.max(...values.map(v => Number(v))) : '';
            default:
                return '';
        }
    },

    _getFieldValue(this: TableAbilityHost, obj: any, path: string): any {
        if (!obj || !path) return undefined;
        const keys = path.split('.');
        let val = obj;
        for (const key of keys) {
            val = val?.[key];
            if (val === undefined) break;
        }
        return val;
    },
} satisfies AbilityDefinition;
