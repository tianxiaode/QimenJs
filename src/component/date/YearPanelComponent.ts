/**
 * YearPanelComponent 年份选择面板
 *
 * 4列统一布局：千/百/十/个位各一列，列头显示当前选中数字（如 2 0 2 6）。
 * 千位列3个按钮（0/1/2）纵向排列。
 * 百/十/个位列拆为左右两子列：左0-5、右6-9，控制高度。
 * 依次点4个数字（千/百/十/个），点完第4个数字触发 yearSelect。
 * 所有格子通过 data-position + data-value 标记，digitColumns 容器委托 click。
 *
 * 导航栏：[◀上一面板] [▶下一面板] [预览...] [✓确认] [✕取消]
 *
 * 事件：yearSelect / prevField / nextField / confirm / cancel
 */

import { Component } from '@qimenjs/component-core';
import { YEAR_PANEL_TPL } from './year-panel-tpl';
import {
    createDateTimeValue,
    generateYearDigits,
    splitToDigits,
    type DateTimeValue,
} from '@/utils/date';
import { renderPreview, type PanelPreviewData } from './panel-preview';
import './date-panel.css';

export interface YearPanelProps {
    value: DateTimeValue;
    previewData?: PanelPreviewData;
    showPrevField?: boolean;
    showNextField?: boolean;
}

type DigitPosition = 'thousands' | 'hundreds' | 'tens' | 'ones';

const POSITION_ORDER: DigitPosition[] = ['thousands', 'hundreds', 'tens', 'ones'];

class YearPanelComponent extends Component {
    _value: DateTimeValue = createDateTimeValue();
    _previewData: PanelPreviewData | null = null;
    _currentPosition: DigitPosition = 'thousands';
    _digits: Record<DigitPosition, number> = {
        thousands: -1,
        hundreds: -1,
        tens: -1,
        ones: -1,
    };

    onAfterInit(props?: YearPanelProps): void {
        this._value = props?.value ?? createDateTimeValue();
        this._previewData = props?.previewData ?? null;
        const [th, h, t, o] = splitToDigits(this._value.year);
        this._digits = { thousands: th, hundreds: h, tens: t, ones: o };
        this._currentPosition = 'thousands';

        if (!props?.showPrevField) {
            this.addCls('q-dtpanel__nav-btn--disabled', 'prevFieldBtn');
        }
        if (!props?.showNextField) {
            this.addCls('q-dtpanel__nav-btn--disabled', 'nextFieldBtn');
        }

        this._renderPreview();
        this._renderColumns();
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

    getEventData(_nodeName: string, _eventName: string, _eventType: string): Record<string, any> {
        return { value: this._value };
    }

    onDigitColumnsClick(e: Event): void {
        const target = e.target as HTMLElement;
        const position = target.dataset.position as DigitPosition | undefined;
        const digit = target.dataset.value;
        if (!position || digit === undefined) return;
        this._onDigitSelect(position, parseInt(digit));
    }

    _renderPreview(): void {
        if (!this._previewData) return;
        const previewEl = this._resolveNodeEl('preview');
        renderPreview(previewEl, this._previewData, field => this.emit('navigate', { field }));
    }

    _renderColumns(): void {
        const container = this._resolveNodeEl('digitColumns');
        if (!container) return;
        container.innerHTML = '';

        const digits = generateYearDigits(this._value.year);

        for (const pos of POSITION_ORDER) {
            const col = document.createElement('div');
            col.className = 'q-dtpanel__digit-col';

            const header = document.createElement('div');
            header.className = 'q-dtpanel__digit-header';
            header.textContent = this._digits[pos] >= 0 ? String(this._digits[pos]) : '–';
            col.appendChild(header);

            if (pos === 'thousands') {
                for (const d of digits.thousands) {
                    col.appendChild(
                        this._createCell(
                            d,
                            pos,
                            'q-dtpanel__high-btn',
                            'q-dtpanel__high-btn--active'
                        )
                    );
                }
            } else {
                const nums = digits[pos];
                const splitIdx = nums.findIndex(d => d >= 6);
                const leftNums = splitIdx >= 0 ? nums.slice(0, splitIdx) : nums;
                const rightNums = splitIdx >= 0 ? nums.slice(splitIdx) : [];

                const body = document.createElement('div');
                body.className = 'q-dtpanel__digit-split';

                const leftCol = document.createElement('div');
                leftCol.className = 'q-dtpanel__digit-subcol';
                for (const d of leftNums) leftCol.appendChild(this._createCell(d, pos));

                const rightCol = document.createElement('div');
                rightCol.className = 'q-dtpanel__digit-subcol';
                for (const d of rightNums) rightCol.appendChild(this._createCell(d, pos));

                body.appendChild(leftCol);
                body.appendChild(rightCol);
                col.appendChild(body);
            }

            container.appendChild(col);
        }
    }

    _createCell(
        d: number,
        pos: DigitPosition,
        baseCls = 'q-dtpanel__cell',
        activeCls = 'q-dtpanel__cell--active'
    ): HTMLElement {
        const cell = document.createElement('div');
        cell.className = baseCls;
        cell.textContent = String(d);
        cell.dataset.position = pos;
        cell.dataset.value = String(d);
        if (this._digits[pos] === d) cell.classList.add(activeCls);
        return cell;
    }

    _onDigitSelect(position: DigitPosition, digit: number): void {
        this._digits[position] = digit;

        const year =
            (this._digits.thousands >= 0 ? this._digits.thousands * 1000 : 0) +
            (this._digits.hundreds >= 0 ? this._digits.hundreds * 100 : 0) +
            (this._digits.tens >= 0 ? this._digits.tens * 10 : 0) +
            (this._digits.ones >= 0 ? this._digits.ones : 0);

        this._value = { ...this._value, year };
        this._renderColumns();

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

YearPanelComponent.useTemplate(YEAR_PANEL_TPL);
export { YearPanelComponent };
export type YearPanelComponentInstance = InstanceType<typeof YearPanelComponent>;
