/**
 * HourPanelComponent 小时选择面板
 *
 * 4列×6行，直接显示0-23。点1个数字即选中，触发 autoNext。
 * 数字格子通过 data-value 标记，grid 容器委托 click。
 *
 * 导航栏：[◀上一面板] [▶下一面板] [预览...] [✓确认] [✕取消]
 *
 * 事件：hourSelect / prevField / nextField / confirm / cancel
 */

import { Component } from '@qimenjs/component-core';
import type { TemplateDecl, DomEventsMap } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { HOUR_PANEL_TPL } from './hour-panel-tpl';
import { createDateTimeValue, type DateTimeValue } from '@/utils/date';
import { renderPreview, type PanelPreviewData } from './panel-preview';
import './hourpanel.css';
import './date-panel.css';

const HourPanelComponentDefs: Definitions = {
    options: {
        value: null,
        previewData: null,
        showPrevField: true,
        showNextField: true,
        showConfirm: true,
        showCancel: true,
    },
} as const;

class HourPanelComponent extends Component {
    static type = 'hour-panel';

    domEvents: DomEventsMap = {
        click: [
            { path: 'prevFieldBtn', handler: 'onPrevFieldBtnClick' },
            { path: 'nextFieldBtn', handler: 'onNextFieldBtnClick' },
            { path: 'confirmBtn', handler: 'onConfirmBtnClick' },
            { path: 'cancelBtn', handler: 'onCancelBtnClick' },
            { path: 'grid', handler: 'onGridClick' },
        ],
    };

    get tpl(): TemplateDecl {
        return HOUR_PANEL_TPL;
    }

    _value: DateTimeValue = createDateTimeValue();
    _previewData: PanelPreviewData | null = null;

    onAfterInit(): void {
        this._value = this.getData('value') ?? createDateTimeValue();
        this._previewData = this.getData('previewData') ?? null;

        this.setNodeText('←', 'prevFieldBtn');
        this.setNodeText('→', 'nextFieldBtn');
        this.setNodeText('✓', 'confirmBtn');
        this.setNodeText('✕', 'cancelBtn');

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

        this._renderPreview();
        this._renderGrid();
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
        const hour = parseInt(value);
        this._value = { ...this._value, hour };
        this._renderGrid();
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
            previewEl.textContent = `${String(this._value.hour).padStart(2, '0')}时`;
        }
    }

    _renderGrid(): void {
        const grid = this.getNodeEl('grid');
        if (!grid) return;
        grid.innerHTML = '';

        for (let h = 0; h <= 23; h++) {
            const cell = document.createElement('div');
            cell.className = 'q-dtpanel__cell';
            cell.textContent = String(h).padStart(2, '0');
            cell.dataset.value = String(h);
            if (this._value.hour === h) {
                cell.classList.add('q-dtpanel__cell--active');
            }
            grid.appendChild(cell);
        }
    }

    get panelValue(): DateTimeValue {
        return this._value;
    }
}

HourPanelComponent.define(HourPanelComponentDefs);

export { HourPanelComponent };
/** 小时面板实例类型 */
export type HourPanelComponentInstance = InstanceType<typeof HourPanelComponent>;
