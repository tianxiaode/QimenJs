/**
 * MonthPanelComponent 月份选择面板（池化版）
 *
 * 6列×2行，直接显示1-12月。点1个数字即选中，触发 autoNext。
 * 初始化时创建 12 个固定 cell，update 时只更新内容和样式。
 * 月份标签从 i18nConfig() 获取 monthsShort，locale 切换自动刷新。
 *
 * 导航栏：[◀上一面板] [▶下一面板] [预览...] [✓确认] [✕取消]
 *
 * 事件：monthSelect / prevField / nextField / confirm / cancel
 */

import { Component } from '@qimenjs/component-core';
import type { TplNode } from '@qimenjs/component-core';
import { MONTH_PANEL_TPL } from './month-panel-tpl';
import { createDateTimeValue, type DateTimeValue } from '@/utils/date';
import { renderPreview, type PanelPreviewData } from './panel-preview';
import './monthpanel.css.ts';
import './date-panel.css';

/** 月份面板属性接口 */
export interface MonthPanelProps {
    value: DateTimeValue;
    previewData?: PanelPreviewData;
    showPrevField?: boolean;
    showNextField?: boolean;
}

const TOTAL_MONTHS = 12;

class MonthPanelComponent extends Component {
    get tpl(): TplNode {
        return MONTH_PANEL_TPL;
    }

    _value: DateTimeValue = createDateTimeValue();
    _previewData: PanelPreviewData | null = null;
    _cells: HTMLElement[] = [];

    onAfterInit(props?: MonthPanelProps): void {
        this._value = props?.value ?? createDateTimeValue();
        this._previewData = props?.previewData ?? null;

        if (!props?.showPrevField) {
            this.addCls('q-dtpanel__nav-btn--disabled', 'prevFieldBtn');
        }
        if (!props?.showNextField) {
            this.addCls('q-dtpanel__nav-btn--disabled', 'nextFieldBtn');
        }

        this._renderPreview();
        this._createCells();
        this._applyCells();
    }

    onLocaleChange(): void {
        this._applyCells();
    }

    onPrevFieldBtnClick(): void {
        this.emit('prevField', {});
    }

    onNextFieldBtnClick(): void {
        this.emit('nextField', {});
    }

    onConfirmBtnClick(): void {
        this.emit('confirm', { value: this._value });
    }

    onCancelBtnClick(): void {
        this.emit('cancel', {});
    }

    onGridClick(e: Event): void {
        const target = e.target as HTMLElement;
        const value = target.dataset.value;
        if (value === undefined) return;
        const month = parseInt(value);
        this._value = { ...this._value, month };
        this._applyCells();
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this._value };
    }

    _renderPreview(): void {
        if (!this._previewData) return;
        const previewEl = this._resolveNodeEl('preview');
        renderPreview(previewEl, this._previewData, field => this.emit('navigate', { field }));
    }

    _getMonthsShort(): string[] | undefined {
        return this.i18nConfig()?.monthsShort;
    }

    _createCells(): void {
        const grid = this._resolveNodeEl('grid');
        if (!grid) return;

        this._cells = [];
        for (let m = 1; m <= TOTAL_MONTHS; m++) {
            const cell = document.createElement('div');
            cell.className = 'q-dtpanel__cell';
            cell.dataset.value = String(m);
            grid.appendChild(cell);
            this._cells.push(cell);
        }
    }

    _applyCells(): void {
        const monthsShort = this._getMonthsShort();

        for (let m = 1; m <= TOTAL_MONTHS; m++) {
            const cell = this._cells[m - 1];
            if (!cell) continue;

            cell.textContent = monthsShort?.[m - 1] ?? String(m).padStart(2, '0');
            cell.className = 'q-dtpanel__cell';
            if (this._value.month === m) {
                cell.classList.add('q-dtpanel__cell--active');
            }
        }
    }

    get panelValue(): DateTimeValue {
        return this._value;
    }
}

export { MonthPanelComponent };
/** 月份面板实例类型 */
export type MonthPanelComponentInstance = InstanceType<typeof MonthPanelComponent>;
