/**
 * MinutePanelComponent 分钟选择面板
 *
 * 十位6按钮（0-5）+ 个位2列×5行数字矩阵。
 * 依次点2个数字（十位+个位），点完触发 autoNext。
 * 十位按钮通过 data-value 标记，个位格子通过 data-value 标记。
 * tensRow / onesGrid 容器用 tplEvents 委托 click。
 * confirmBtn 用 emits 自动转发 confirm 事件，数据通过 getEventData 提取。
 * minuteSelect 因2次点击才触发，在 handler 中手动 emit。
 *
 * 导航栏：← 返回 | ↶ 上一步 | 选择分钟 | 确认 ✓
 *
 * 事件：minuteSelect / back / prev / confirm
 */

import { Component } from '@qimenjs/component-core';
import { generateMinuteSecondDigits, type DateTimeValue } from '@/utils/date/datetime-picker';
import './date-panel.css';

export interface MinutePanelProps {
    value: DateTimeValue;
    showPrev?: boolean;
}

export const MinutePanelComponent = Component.withTemplate({
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
                        i18n: 'selectMinute',
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
                name: 'tensRow',
                cls: 'q-dtpanel__high-row',
            },
            {
                tag: 'div',
                name: 'onesGrid',
                cls: 'q-dtpanel__grid',
                style: 'grid-template-columns: repeat(2, 1fr); padding-left: 24px; padding-right: 24px;',
            },
        ],
    },
    tplEvents: {
        backBtn: { click: { handler: true } },
        prevBtn: { click: { handler: true } },
        confirmBtn: { click: { handler: true, emits: ['confirm'] } },
        tensRow: { click: { handler: true } },
        onesGrid: { click: { handler: true } },
    },
    body: {
        type: 'MinutePanel',

        onInitState() {
            return {
                _value: null as DateTimeValue | null,
                _tensSelected: -1,
                _onesSelected: -1,
                _selectingTens: true,
            };
        },

        onAfterInit(props?: MinutePanelProps): void {
            const self = this as any;
            self._value = props?.value ?? {
                year: 2026,
                month: 1,
                day: 1,
                hour: 0,
                minute: 0,
                second: 0,
            };
            self._tensSelected = Math.floor(self._value.minute / 10);
            self._onesSelected = self._value.minute % 10;
            self._selectingTens = true;

            if (!props?.showPrev) {
                self.addCls('q-dtpanel__nav-btn--disabled', 'prevBtn');
            }

            self._renderTens();
            self._renderOnes();
        },

        onBackBtnClick(): void {
            const self = this as any;
            self.emit('back', {});
        },

        onPrevBtnClick(): void {
            const self = this as any;
            self.emit('prev', {});
        },

        onConfirmBtnClick(): void {},

        getEventData(
            _nodeName: string,
            _eventName: string,
            _eventType: string
        ): Record<string, any> {
            const self = this as any;
            return { value: self._value };
        },

        onTensRowClick(e: Event): void {
            const self = this as any;
            const target = e.target as HTMLElement;
            const value = target.dataset.value;
            if (value === undefined) return;
            self._onTensSelect(parseInt(value));
        },

        onOnesGridClick(e: Event): void {
            const self = this as any;
            const target = e.target as HTMLElement;
            const value = target.dataset.value;
            if (value === undefined) return;
            self._onOnesSelect(parseInt(value));
        },

        _renderTens(): void {
            const self = this as any;
            const row = self.nodeMap?.tensRow?.el as HTMLElement | null;
            if (!row) return;
            row.innerHTML = '';

            const label = document.createElement('span');
            label.className = 'q-dtpanel__digit-label';
            label.textContent = '十位';
            row.appendChild(label);

            const digits = generateMinuteSecondDigits();
            for (const d of digits.tens) {
                const btn = document.createElement('button');
                btn.className = 'q-dtpanel__high-btn';
                btn.textContent = String(d);
                btn.dataset.value = String(d);
                if (self._tensSelected === d) {
                    btn.classList.add('q-dtpanel__high-btn--active');
                }
                row.appendChild(btn);
            }
        },

        _renderOnes(): void {
            const self = this as any;
            const grid = self.nodeMap?.onesGrid?.el as HTMLElement | null;
            if (!grid) return;
            grid.innerHTML = '';

            const digits = generateMinuteSecondDigits();
            for (const d of digits.ones) {
                const cell = document.createElement('div');
                cell.className = 'q-dtpanel__cell';
                cell.textContent = String(d);
                cell.dataset.value = String(d);
                if (self._onesSelected === d) {
                    cell.classList.add('q-dtpanel__cell--active');
                }
                grid.appendChild(cell);
            }
        },

        _onTensSelect(tens: number): void {
            const self = this as any;
            self._tensSelected = tens;
            self._selectingTens = false;
            self._renderTens();
        },

        _onOnesSelect(ones: number): void {
            const self = this as any;
            self._onesSelected = ones;
            const minute = self._tensSelected * 10 + ones;
            self._value = { ...self._value, minute };
            self._renderTens();
            self._renderOnes();
            self.emit('minuteSelect', { value: self._value });
        },

        get panelValue(): DateTimeValue {
            const self = this as any;
            return self._value;
        },
    },
});

export type MinutePanelComponent = InstanceType<typeof MinutePanelComponent>;
