/**
 * YearPanelComponent 年份选择面板
 *
 * 千位3按钮（0/1/2）+ 百十个位6列×5行数字矩阵。
 * 依次点4个数字（千/百/十/个），点完第4个数字触发 yearSelect。
 * 千位按钮通过 data-value 标记，数字矩阵格子通过 data-group + data-value 标记。
 * thousandsRow / digitGroups 容器委托 click。
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

class YearPanelComponent extends Component {
    static type = 'YearPanel';

    type = 'YearPanel';

    onInitState() {
        return {
            _value: null as DateTimeValue | null,
            _currentPosition: 'thousands' as DigitPosition,
            _digits: { thousands: -1, hundreds: -1, tens: -1, ones: -1 },
        };
    }

    onAfterInit(props?: YearPanelProps): void {
        this._value = props?.value ?? {
            year: 2026,
            month: 1,
            day: 1,
            hour: 0,
            minute: 0,
            second: 0,
        };
        const [th, h, t, o] = splitToDigits(this._value.year);
        this._digits = { thousands: th, hundreds: h, tens: t, ones: o };
        this._currentPosition = 'thousands';

        if (!props?.showPrev) {
            this.addCls('q-dtpanel__nav-btn--disabled', 'prevBtn');
        }

        this._renderThousands();
        this._renderDigitGroups();
    }

    onBackBtnClick(): void {
        this.emit('back', {});
    }

    onPrevBtnClick(): void {
        this.emit('prev', {});
    }

    onConfirmBtnClick(): void {}

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this._value };
    }

    onThousandsRowClick(e: Event): void {
        const target = e.target as HTMLElement;
        const digit = target.dataset.value;
        if (digit === undefined) return;
        this._onDigitSelect('thousands', parseInt(digit));
    }

    onDigitGroupsClick(e: Event): void {
        const target = e.target as HTMLElement;
        const group = target.dataset.group as DigitPosition | undefined;
        const digit = target.dataset.value;
        if (!group || digit === undefined) return;
        this._onDigitSelect(group, parseInt(digit));
    }

    _renderThousands(): void {
        const container = this.nodeMap?.thousandsRow?.el as HTMLElement | null;
        if (!container) return;
        container.innerHTML = '';

        const digits = generateYearDigits(this._value.year);
        const label = document.createElement('span');
        label.className = 'q-dtpanel__digit-label';
        label.textContent = POSITION_LABELS.thousands;
        container.appendChild(label);

        for (const d of digits.thousands) {
            const btn = document.createElement('button');
            btn.className = 'q-dtpanel__high-btn';
            btn.textContent = String(d);
            btn.dataset.value = String(d);
            if (this._digits.thousands === d) {
                btn.classList.add('q-dtpanel__high-btn--active');
            }
            container.appendChild(btn);
        }
    }

    _renderDigitGroups(): void {
        const container = this.nodeMap?.digitGroups?.el as HTMLElement | null;
        if (!container) return;
        container.innerHTML = '';

        const groups: DigitPosition[] = ['hundreds', 'tens', 'ones'];
        const digits = generateYearDigits(this._value.year);

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
                if (this._digits[group] === d) {
                    cell.classList.add('q-dtpanel__cell--active');
                }
                groupEl.appendChild(cell);
            }

            container.appendChild(groupEl);
        }
    }

    _onDigitSelect(position: DigitPosition, digit: number): void {
        this._digits[position] = digit;

        const year =
            (this._digits.thousands >= 0 ? this._digits.thousands * 1000 : 0) +
            (this._digits.hundreds >= 0 ? this._digits.hundreds * 100 : 0) +
            (this._digits.tens >= 0 ? this._digits.tens * 10 : 0) +
            (this._digits.ones >= 0 ? this._digits.ones : 0);

        this._value = { ...this._value, year };

        this._renderThousands();
        this._renderDigitGroups();

        const posIdx = POSITION_ORDER.indexOf(position);
        const nextPos = POSITION_ORDER[posIdx + 1];
        if (nextPos) {
            this._currentPosition = nextPos;
        } else {
            this.emit('yearSelect', { value: this._value });
        }
    }

    get panelValue(): DateTimeValue {
        return this._value;
    }
}

export { YearPanelComponent };
export type YearPanelComponentInstance = InstanceType<typeof YearPanelComponent>;
