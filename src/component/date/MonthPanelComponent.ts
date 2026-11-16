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
import type { TplNode, DomEventsMap } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { MONTH_PANEL_TPL } from './month-panel-tpl';
import { createDateTimeValue, type DateTimeValue } from '@/utils/date';
import { renderPreview, type PanelPreviewData } from './panel-preview';
import { SYSTEM_EVENTS } from '@/events';
import './monthpanel.css';
import './date-panel.css';

const TOTAL_MONTHS = 12;

const MonthPanelComponentDefs: Definitions = {
    options: {
        value: null,
        previewData: null,
        showPrevField: true,
        showNextField: true,
        showConfirm: true,
        showCancel: true,
    },
} as const;

class MonthPanelComponent extends Component {
    static type = 'month-panel';

    domEvents: DomEventsMap = {
        click: [
            { path: 'prevFieldBtn', handler: 'onPrevFieldBtnClick' },
            { path: 'nextFieldBtn', handler: 'onNextFieldBtnClick' },
            { path: 'confirmBtn', handler: 'onConfirmBtnClick' },
            { path: 'cancelBtn', handler: 'onCancelBtnClick' },
            { path: 'grid', handler: 'onGridClick' },
        ],
    };

    get tpl(): TplNode {
        return MONTH_PANEL_TPL;
    }

    _value: DateTimeValue = createDateTimeValue();
    _previewData: PanelPreviewData | null = null;
    _cells: HTMLElement[] = [];

    onAfterInit(): void {
        this._value = this.getData('value') ?? createDateTimeValue();
        this._previewData = this.getData('previewData') ?? null;

        if (!this.getData('showPrevField')) {
            this.addCls('hidden', 'prevFieldBtn');
        }
        if (!this.getData('showNextField')) {
            this.addCls('hidden', 'nextFieldBtn');
        }
        if (!this.getData('showConfirm')) {
            this.addCls('hidden', 'confirmBtn');
        }
        if (!this.getData('showCancel')) {
            this.addCls('hidden', 'cancelBtn');
        }

        this.systemOn(SYSTEM_EVENTS.I18N_MESSAGES_UPDATE, () => this.onLocaleChange());
        this.systemOn(SYSTEM_EVENTS.I18N_LOCALE_CHANGE, () => this.onLocaleChange());

        this._renderPreview();
        this._createCells();
        this._applyCells();
    }

    onLocaleChange(): void {
        this._renderPreview();
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

    onGridClick(domEvt: any): void {
        const originalEvent = domEvt?.data?.originalEvent;
        const target = (originalEvent?.target ?? domEvt?.target) as HTMLElement;
        const value = target?.dataset?.value;
        if (value === undefined) return;
        const month = parseInt(value);
        this._value = { ...this._value, month };
        this._applyCells();
        this._renderPreview();
    }

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this._value };
    }

    _renderPreview(): void {
        const previewEl = this.getNodeEl('preview');
        if (!previewEl) return;
        if (this._previewData) {
            renderPreview(previewEl, this._previewData, field => this.emit('navigate', { field }));
        } else {
            const locale = this.i18nConfig();
            const months = locale?.months;
            const text = months && months.length === 12
                ? months[this._value.month - 1]
                : `${String(this._value.month).padStart(2, '0')}月`;
            previewEl.textContent = text;
        }
    }

    _getMonthsShort(): string[] | undefined {
        return this.i18nConfig()?.monthsShort;
    }

    _createCells(): void {
        const grid = this.getNodeEl('grid');
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

MonthPanelComponent.define(MonthPanelComponentDefs);

export { MonthPanelComponent };
/** 月份面板实例类型 */
export type MonthPanelComponentInstance = InstanceType<typeof MonthPanelComponent>;
