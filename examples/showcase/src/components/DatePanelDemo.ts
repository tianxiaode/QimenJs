import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import { DatePanelComponent } from '@/component/date/DatePanelComponent';
import { YearPanelComponent } from '@/component/date/YearPanelComponent';
import { MonthPanelComponent } from '@/component/date/MonthPanelComponent';
import { createDateTimeValue, type DateTimeValue } from '@/utils/date';

class DatePanelDemoComponent extends Component {
    _panel: any = null;
    _value: DateTimeValue = createDateTimeValue();
    _currentPanelType: 'date' | 'year' | 'month' = 'date';

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column', gap: '12px' },
            children: [
                {
                    tag: 'div',
                    name: 'panelContainer',
                    style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden', maxWidth: '400px' },
                },
                {
                    tag: 'div',
                    name: 'valueDisplay',
                    classes: 'q-demo__value-tag',
                    style: { fontSize: '16px', fontWeight: 'bold' },
                    options: { text: '当前值: ----' },
                },
            ],
        };
    }

    onAfterInit(): void {
        this._renderPanel('date');
        this._updateValue();
    }

    onBeforeDispose(): void {
        try {
            this._panel?.dispose();
        } catch (e) {
            // ignore
        }
    }

    _renderPanel(type: 'date' | 'year' | 'month'): void {
        const container = this.getNodeEl('panelContainer');
        if (!container) return;

        if (this._panel) {
            try { this._panel.dispose(); } catch (e) { /* ignore */ }
            this._panel = null;
        }
        container.innerHTML = '';

        this._currentPanelType = type;

        if (type === 'date') {
            const cmp = new DatePanelComponent({ value: this._value, showPrevField: false, showConfirm: false, showCancel: false });
            cmp.on('daySelect', (ctx: any) => {
                this._value = { ...this._value, year: ctx.data.value.year, month: ctx.data.value.month, day: ctx.data.value.day };
                this._updateValue();
            });
            cmp.on('navigate', (ctx: any) => {
                const target = ctx.data?.target;
                if (target === 'year' || target === 'month') {
                    this._renderPanel(target);
                }
            });
            container.appendChild(cmp.el);
            this._panel = cmp;
        } else if (type === 'year') {
            const cmp = new YearPanelComponent({ value: this._value, showPrevField: false, showNextField: false, showConfirm: false, showCancel: true });
            cmp.on('yearSelect', (ctx: any) => {
                this._value = { ...this._value, year: ctx.data.value.year };
                this._updateValue();
                this._renderPanel('date');
            });
            cmp.on('cancel', () => {
                this._renderPanel('date');
            });
            container.appendChild(cmp.el);
            this._panel = cmp;
        } else if (type === 'month') {
            const cmp = new MonthPanelComponent({ value: this._value, showPrevField: false, showNextField: false, showConfirm: false, showCancel: true });
            cmp.on('monthSelect', (ctx: any) => {
                this._value = { ...this._value, month: ctx.data.value.month };
                this._updateValue();
                this._renderPanel('date');
            });
            cmp.on('cancel', () => {
                this._renderPanel('date');
            });
            container.appendChild(cmp.el);
            this._panel = cmp;
        }
    }

    _updateValue(): void {
        this.setNodeText(
            `当前值: ${this._value.year}-${String(this._value.month).padStart(2, '0')}-${String(this._value.day).padStart(2, '0')}`,
            'valueDisplay'
        );
    }
}

export const DATEPANEL_DEMO: DemoConfig = {
    title: 'DatePanel',
    description: '日历面板组件，包含日历网格 + 导航栏（翻页按钮）+ 底部快捷按钮（昨天/今天/明天），可脱离 DatePicker 独立使用',
    sections: [
        {
            label: '独立使用',
            code: `import { DatePanelComponent } from '@/component/date/DatePanelComponent';

const panel = new DatePanelComponent({
    value: createDateTimeValue(new Date()),
    showPrevField: false,
    showConfirm: false,
    showCancel: false,
});
panel.on('daySelect', ({ value }) => {
    console.log('选中日期:', value.year, value.month, value.day);
});
container.appendChild(panel.el);`,
            component: DatePanelDemoComponent,
        },
        {
            label: '模板中使用',
            code: `{ type: 'date-panel', options: { showPrevField: false, showConfirm: false, showCancel: false } }`,
            template: {
                tag: 'div',
                style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden', maxWidth: '400px' },
                children: [{ type: 'date-panel', options: { showPrevField: false, showConfirm: false, showCancel: false } }],
            },
        },
    ],
};
