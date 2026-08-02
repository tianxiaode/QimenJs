/**
 * SecondPanelComponent 秒选择面板
 *
 * 与 MinutePanelComponent 布局完全一致。
 * 十位/个位并排两列布局，列头显示当前选中数字。
 * 十位列6个按钮（0-5）纵向排列，个位列10个数字拆为左右子列（0-4 | 5-9）。
 * 依次点2个数字（十位+个位），点完触发 secondSelect。
 * 所有格子通过 data-digit + data-value 标记，digitColumns 容器委托 click。
 *
 * 导航栏：[◀上一面板] [▶下一面板] [预览...] [✓确认] [✕取消]
 *
 * 事件：secondSelect / prevField / nextField / confirm / cancel
 */

import { Component } from '@qimenjs/component-core';
import { SECOND_PANEL_TPL } from './second-panel-tpl';
import {
    createDateTimeValue,
    generateMinuteSecondDigits,
    type DateTimeValue,
} from '@/utils/date/datetime-picker';
import { renderPreview, type PanelPreviewData } from './panel-preview';
import './date-panel.css';

export interface SecondPanelProps {
    value: DateTimeValue;
    previewData?: PanelPreviewData;
    showPrevField?: boolean;
    showNextField?: boolean;
}

type DigitPart = 'tens' | 'ones';

class SecondPanelComponent extends Component {
    _value: DateTimeValue = createDateTimeValue();
    _previewData: PanelPreviewData | null = null;
    _tensSelected: number = -1;
    _onesSelected: number = -1;

    onAfterInit(props?: SecondPanelProps): void {
        this._value = props?.value ?? createDateTimeValue();
        this._previewData = props?.previewData ?? null;
        this._tensSelected = Math.floor(this._value.second / 10);
        this._onesSelected = this._value.second % 10;

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
        const part = target.dataset.digit as DigitPart | undefined;
        const value = target.dataset.value;
        if (!part || value === undefined) return;
        if (part === 'tens') {
            this._onTensSelect(parseInt(value));
        } else {
            this._onOnesSelect(parseInt(value));
        }
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

        const digits = generateMinuteSecondDigits();

        const tensCol = document.createElement('div');
        tensCol.className = 'q-dtpanel__digit-col';
        const tensHeader = document.createElement('div');
        tensHeader.className = 'q-dtpanel__digit-header';
        tensHeader.textContent = this._tensSelected >= 0 ? String(this._tensSelected) : '–';
        tensCol.appendChild(tensHeader);
        for (const d of digits.tens) {
            tensCol.appendChild(
                this._createCell(d, 'tens', 'q-dtpanel__high-btn', 'q-dtpanel__high-btn--active')
            );
        }

        const onesCol = document.createElement('div');
        onesCol.className = 'q-dtpanel__digit-col';
        const onesHeader = document.createElement('div');
        onesHeader.className = 'q-dtpanel__digit-header';
        onesHeader.textContent = this._onesSelected >= 0 ? String(this._onesSelected) : '–';
        onesCol.appendChild(onesHeader);

        const splitIdx = digits.ones.findIndex(d => d >= 5);
        const leftNums = splitIdx >= 0 ? digits.ones.slice(0, splitIdx) : digits.ones;
        const rightNums = splitIdx >= 0 ? digits.ones.slice(splitIdx) : [];

        const body = document.createElement('div');
        body.className = 'q-dtpanel__digit-split';
        const leftSub = document.createElement('div');
        leftSub.className = 'q-dtpanel__digit-subcol';
        for (const d of leftNums) leftSub.appendChild(this._createCell(d, 'ones'));
        const rightSub = document.createElement('div');
        rightSub.className = 'q-dtpanel__digit-subcol';
        for (const d of rightNums) rightSub.appendChild(this._createCell(d, 'ones'));
        body.appendChild(leftSub);
        body.appendChild(rightSub);
        onesCol.appendChild(body);

        container.appendChild(tensCol);
        container.appendChild(onesCol);
    }

    _createCell(
        d: number,
        part: DigitPart,
        baseCls = 'q-dtpanel__cell',
        activeCls = 'q-dtpanel__cell--active'
    ): HTMLElement {
        const cell = document.createElement('div');
        cell.className = baseCls;
        cell.textContent = String(d);
        cell.dataset.digit = part;
        cell.dataset.value = String(d);
        const selected = part === 'tens' ? this._tensSelected : this._onesSelected;
        if (selected === d) cell.classList.add(activeCls);
        return cell;
    }

    _onTensSelect(tens: number): void {
        this._tensSelected = tens;
        this._renderColumns();
    }

    _onOnesSelect(ones: number): void {
        this._onesSelected = ones;
        const second = this._tensSelected * 10 + ones;
        this._value = { ...this._value, second };
        this._renderColumns();
        this.emit('secondSelect', { value: this._value });
    }

    get panelValue(): DateTimeValue {
        return this._value;
    }
}

SecondPanelComponent.useTemplate(SECOND_PANEL_TPL);
export { SecondPanelComponent };
export type SecondPanelComponentInstance = InstanceType<typeof SecondPanelComponent>;
