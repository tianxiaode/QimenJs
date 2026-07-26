/**
 * MonthPanelComponent 月份选择面板（池化版）
 *
 * 6列×2行，直接显示1-12月。点1个数字即选中，触发 autoNext。
 * 初始化时创建 12 个固定 cell，update 时只更新内容和样式。
 * 月份标签从 i18nConfig() 获取 monthsShort，locale 切换自动刷新。
 *
 * 事件：monthSelect / back / prev / confirm
 */

import { Component } from '@qimenjs/component-core';
import type { DateTimeValue } from '@/utils/date/datetime-picker';
import './date-panel.css';

export interface MonthPanelProps {
    value: DateTimeValue;
    showPrev?: boolean;
}

const TOTAL_MONTHS = 12;

export const MonthPanelComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-dtpanel',
        children: [
            {
                tag: 'div',
                name: 'nav',
                cls: 'q-dtpanel__nav',
                children: [
                    { tag: 'button', name: 'backBtn', cls: 'q-dtpanel__nav-btn', i18n: 'back' },
                    { tag: 'button', name: 'prevBtn', cls: 'q-dtpanel__nav-btn', i18n: 'prev' },
                    {
                        tag: 'span',
                        name: 'title',
                        cls: 'q-dtpanel__nav-title',
                        i18n: 'selectMonth',
                    },
                    {
                        tag: 'button',
                        name: 'confirmBtn',
                        cls: 'q-dtpanel__nav-btn q-dtpanel__nav-confirm',
                        i18n: 'confirm',
                    },
                ],
            },
            {
                tag: 'div',
                name: 'grid',
                cls: 'q-dtpanel__grid',
                style: 'grid-template-columns: repeat(6, 1fr);',
            },
        ],
    },
    tplEvents: {
        backBtn: { click: { handler: true } },
        prevBtn: { click: { handler: true } },
        confirmBtn: { click: { handler: true, emits: ['confirm'] } },
        grid: { click: { handler: true, emits: ['monthSelect'] } },
    },
    body: {
        type: 'MonthPanel',

        onInitState() {
            return {
                _value: null as DateTimeValue | null,
                _cells: [] as HTMLElement[],
            };
        },

        onAfterInit(props?: MonthPanelProps): void {
            const self = this as any;
            self._value = props?.value ?? {
                year: 2026,
                month: 1,
                day: 1,
                hour: 0,
                minute: 0,
                second: 0,
            };

            if (!props?.showPrev) {
                self.addCls('q-dtpanel__nav-btn--disabled', 'prevBtn');
            }

            self._createCells();
            self._applyCells();
        },

        onLocaleChange(): void {
            const self = this as any;
            self._applyCells();
        },

        onBackBtnClick(): void {
            const self = this as any;
            self.emit('back', {});
        },

        onPrevBtnClick(): void {
            const self = this as any;
            self.emit('prev', {});
        },

        onConfirmBtnClick(): void {
            const self = this as any;
        },

        onGridClick(e: Event): void {
            const self = this as any;
            const target = e.target as HTMLElement;
            const value = target.dataset.value;
            if (value === undefined) return;
            const month = parseInt(value);
            self._value = { ...self._value, month };
            self._applyCells();
        },

        getEventData(
            _nodeName: string,
            _eventName: string,
            _eventType: string
        ): Record<string, any> {
            const self = this as any;
            return { value: self._value };
        },

        _getMonthsShort(): string[] | undefined {
            const self = this as any;
            return self.i18nConfig()?.monthsShort;
        },

        _createCells(): void {
            const self = this as any;
            const grid = self.nodeMap?.grid?.el as HTMLElement | null;
            if (!grid) return;

            self._cells = [];
            for (let m = 1; m <= TOTAL_MONTHS; m++) {
                const cell = document.createElement('div');
                cell.className = 'q-dtpanel__cell';
                cell.dataset.value = String(m);
                grid.appendChild(cell);
                self._cells.push(cell);
            }
        },

        _applyCells(): void {
            const self = this as any;
            const monthsShort = self._getMonthsShort();

            for (let m = 1; m <= TOTAL_MONTHS; m++) {
                const cell = self._cells[m - 1];
                if (!cell) continue;

                cell.textContent = monthsShort?.[m - 1] ?? String(m).padStart(2, '0');
                cell.className = 'q-dtpanel__cell';
                if (self._value.month === m) {
                    cell.classList.add('q-dtpanel__cell--active');
                }
            }
        },

        get panelValue(): DateTimeValue {
            const self = this as any;
            return self._value;
        },
    },
});

export type MonthPanelComponent = InstanceType<typeof MonthPanelComponent>;
