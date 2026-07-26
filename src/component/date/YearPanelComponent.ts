/**
 * YearPanelComponent 年份选择面板
 *
 * 千位3按钮（0/1/2）+ 百十个位6列×5行数字矩阵。
 * 依次点4个数字（千/百/十/个），点完第4个数字触发 yearSelect。
 * 千位按钮通过 data-value 标记，数字矩阵格子通过 data-group + data-value 标记。
 * thousandsRow / digitGroups 容器用 tplEvents 委托 click。
 * confirmBtn 用 emits 自动转发 confirm 事件。
 * yearSelect 因4次点击才触发，在 handler 中手动 emit。
 *
 * 导航栏：← 返回 | ↶ 上一步 | 选择年份 | 确认 ✓
 *
 * 事件：yearSelect / back / prev / confirm
 */

import { Component } from '@qimenjs/component-core';
import {
    generateYearDigits,
    splitToDigits,
    type DateTimeValue,
} from '@/utils/date/datetime-picker';
import './date-panel.css';

export interface YearPanelProps {
    value: DateTimeValue;
    showPrev?: boolean;
}

type DigitPosition = 'thousands' | 'hundreds' | 'tens' | 'ones';

const POSITION_ORDER: DigitPosition[] = ['thousands', 'hundreds', 'tens', 'ones'];
const POSITION_LABELS: Record<DigitPosition, string> = {
    thousands: '千位',
    hundreds: '百位',
    tens: '十位',
    ones: '个位',
};

export const YearPanelComponent = Component.withTemplate({
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
                    { tag: 'span', name: 'title', cls: 'q-dtpanel__nav-title', i18n: 'selectYear' },
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
                name: 'thousandsRow',
                cls: 'q-dtpanel__high-row',
            },
            {
                tag: 'div',
                name: 'digitGroups',
                cls: 'q-dtpanel__digit-groups',
            },
        ],
    },
    tplEvents: {
        backBtn: { click: { handler: true } },
        prevBtn: { click: { handler: true } },
        confirmBtn: { click: { handler: true, emits: ['confirm'] } },
        thousandsRow: { click: { handler: true } },
        digitGroups: { click: { handler: true } },
    },
    body: {
        type: 'YearPanel',

        onInitState() {
            return {
                _value: null as DateTimeValue | null,
                _currentPosition: 'thousands' as DigitPosition,
                _digits: { thousands: -1, hundreds: -1, tens: -1, ones: -1 },
            };
        },

        onAfterInit(props?: YearPanelProps): void {
            const self = this as any;
            self._value = props?.value ?? {
                year: 2026,
                month: 1,
                day: 1,
                hour: 0,
                minute: 0,
                second: 0,
            };
            const [th, h, t, o] = splitToDigits(self._value.year);
            self._digits = { thousands: th, hundreds: h, tens: t, ones: o };
            self._currentPosition = 'thousands';

            if (!props?.showPrev) {
                self.addCls('q-dtpanel__nav-btn--disabled', 'prevBtn');
            }

            self._renderThousands();
            self._renderDigitGroups();
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

        getEventData(
            _nodeName: string,
            _eventName: string,
            _eventType: string
        ): Record<string, any> {
            const self = this as any;
            return { value: self._value };
        },

        onThousandsRowClick(e: Event): void {
            const self = this as any;
            const target = e.target as HTMLElement;
            const digit = target.dataset.value;
            if (digit === undefined) return;
            self._onDigitSelect('thousands', parseInt(digit));
        },

        onDigitGroupsClick(e: Event): void {
            const self = this as any;
            const target = e.target as HTMLElement;
            const group = target.dataset.group as DigitPosition | undefined;
            const digit = target.dataset.value;
            if (!group || digit === undefined) return;
            self._onDigitSelect(group, parseInt(digit));
        },

        _renderThousands(): void {
            const self = this as any;
            const container = self.nodeMap?.thousandsRow?.el as HTMLElement | null;
            if (!container) return;
            container.innerHTML = '';

            const digits = generateYearDigits(self._value.year);
            const label = document.createElement('span');
            label.className = 'q-dtpanel__digit-label';
            label.textContent = POSITION_LABELS.thousands;
            container.appendChild(label);

            for (const d of digits.thousands) {
                const btn = document.createElement('button');
                btn.className = 'q-dtpanel__high-btn';
                btn.textContent = String(d);
                btn.dataset.value = String(d);
                if (self._digits.thousands === d) {
                    btn.classList.add('q-dtpanel__high-btn--active');
                }
                container.appendChild(btn);
            }
        },

        _renderDigitGroups(): void {
            const self = this as any;
            const container = self.nodeMap?.digitGroups?.el as HTMLElement | null;
            if (!container) return;
            container.innerHTML = '';

            const groups: DigitPosition[] = ['hundreds', 'tens', 'ones'];
            const digits = generateYearDigits(self._value.year);

            for (const group of groups) {
                const groupEl = document.createElement('div');
                groupEl.className = 'q-dtpanel__digit-group';

                const label = document.createElement('div');
                label.className = 'q-dtpanel__digit-label';
                label.textContent = POSITION_LABELS[group];
                groupEl.appendChild(label);

                const nums = digits[group];
                for (const d of nums) {
                    const cell = document.createElement('div');
                    cell.className = 'q-dtpanel__cell';
                    cell.textContent = String(d);
                    cell.dataset.group = group;
                    cell.dataset.value = String(d);
                    if (self._digits[group] === d) {
                        cell.classList.add('q-dtpanel__cell--active');
                    }
                    groupEl.appendChild(cell);
                }

                container.appendChild(groupEl);
            }
        },

        _onDigitSelect(position: DigitPosition, digit: number): void {
            const self = this as any;
            self._digits[position] = digit;

            const year =
                (self._digits.thousands >= 0 ? self._digits.thousands * 1000 : 0) +
                (self._digits.hundreds >= 0 ? self._digits.hundreds * 100 : 0) +
                (self._digits.tens >= 0 ? self._digits.tens * 10 : 0) +
                (self._digits.ones >= 0 ? self._digits.ones : 0);

            self._value = { ...self._value, year };

            self._renderThousands();
            self._renderDigitGroups();

            const posIdx = POSITION_ORDER.indexOf(position);
            const nextPos = POSITION_ORDER[posIdx + 1];
            if (nextPos) {
                self._currentPosition = nextPos;
            } else {
                self.emit('yearSelect', { value: self._value });
            }
        },

        get panelValue(): DateTimeValue {
            const self = this as any;
            return self._value;
        },
    },
});

export type YearPanelComponent = InstanceType<typeof YearPanelComponent>;
