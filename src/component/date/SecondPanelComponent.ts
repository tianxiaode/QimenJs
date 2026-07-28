/**
 * SecondPanelComponent 秒选择面板
 *
 * 与 MinutePanelComponent 布局完全一致。
 * 十位6按钮（0-5）+ 个位2列×5行数字矩阵。
 * 十位按钮通过 data-value 标记，个位格子通过 data-value 标记。
 * tensRow / onesGrid 容器用 tplEvents 委托 click。
 * confirmBtn 用 emits 自动转发 confirm 事件，数据通过 getEventData 提取。
 * secondSelect 因2次点击才触发，在 handler 中手动 emit。
 *
 * 导航栏：← 返回 | ↶ 上一步 | 选择秒 | 确认 ✓
 *
 * 事件：secondSelect / back / prev / confirm
 */

import { Component } from '@qimenjs/component-core';
import { generateMinuteSecondDigits, type DateTimeValue } from '@/utils/date/datetime-picker';
import './date-panel.css';

export interface SecondPanelProps {
    value: DateTimeValue;
    showPrev?: boolean;
}

class SecondPanelComponent extends Component {
    static type = 'SecondPanel';

    type = 'SecondPanel';

    onInitState() {
        return {
            _value: null as DateTimeValue | null,
            _tensSelected: -1,
            _onesSelected: -1,
        };
    }

    onAfterInit(props?: SecondPanelProps): void {
        this._value = props?.value ?? {
            year: 2026,
            month: 1,
            day: 1,
            hour: 0,
            minute: 0,
            second: 0,
        };
        this._tensSelected = Math.floor(this._value.second / 10);
        this._onesSelected = this._value.second % 10;

        if (!props?.showPrev) {
            this.addCls('q-dtpanel__nav-btn--disabled', 'prevBtn');
        }

        this._renderTens();
        this._renderOnes();
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

    onTensRowClick(e: Event): void {
        const target = e.target as HTMLElement;
        const value = target.dataset.value;
        if (value === undefined) return;
        this._onTensSelect(parseInt(value));
    }

    onOnesGridClick(e: Event): void {
        const target = e.target as HTMLElement;
        const value = target.dataset.value;
        if (value === undefined) return;
        this._onOnesSelect(parseInt(value));
    }

    _renderTens(): void {
        const row = this.nodeMap?.tensRow?.el as HTMLElement | null;
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
            if (this._tensSelected === d) {
                btn.classList.add('q-dtpanel__high-btn--active');
            }
            row.appendChild(btn);
        }
    }

    _renderOnes(): void {
        const grid = this.nodeMap?.onesGrid?.el as HTMLElement | null;
        if (!grid) return;
        grid.innerHTML = '';

        const digits = generateMinuteSecondDigits();
        for (const d of digits.ones) {
            const cell = document.createElement('div');
            cell.className = 'q-dtpanel__cell';
            cell.textContent = String(d);
            cell.dataset.value = String(d);
            if (this._onesSelected === d) {
                cell.classList.add('q-dtpanel__cell--active');
            }
            grid.appendChild(cell);
        }
    }

    _onTensSelect(tens: number): void {
        this._tensSelected = tens;
        this._renderTens();
    }

    _onOnesSelect(ones: number): void {
        this._onesSelected = ones;
        const second = this._tensSelected * 10 + ones;
        this._value = { ...this._value, second };
        this._renderTens();
        this._renderOnes();
        this.emit('secondSelect', { value: this._value });
    }

    get panelValue(): DateTimeValue {
        return this._value;
    }
}

export { SecondPanelComponent };
export type SecondPanelComponentInstance = InstanceType<typeof SecondPanelComponent>;
