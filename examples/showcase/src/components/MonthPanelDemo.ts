import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import { DateTimePanelComponent } from '@/component/date/DateTimePanelComponent';
import { createDateTimeValue, type DateTimeValue } from '@/utils/date';

class MonthPanelDemoComponent extends Component {
    _panel: DateTimePanelComponent | null = null;
    _value: DateTimeValue = createDateTimeValue();

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column', gap: '12px' },
            children: [
                {
                    tag: 'div',
                    name: 'panelContainer',
                    style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden' },
                },
                {
                    tag: 'div',
                    name: 'valueDisplay',
                    classes: 'q-demo__value-tag',
                    style: { fontSize: '16px', fontWeight: 'bold' },
                    options: { text: '当前月份: --' },
                },
            ],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('panelContainer');
        if (!container) return;
        const cmp = new DateTimePanelComponent({
            value: this._value,
            type: 'date',
            initialView: 'month',
            showConfirm: true,
        });
        cmp.on('change', (ctx: any) => {
            this._value = ctx.data.value;
            this._updateValue();
        });
        cmp.on('confirm', (ctx: any) => {
            this._value = ctx.data.value;
            this._updateValue();
        });
        container.appendChild(cmp.el);
        this._panel = cmp;
        this._updateValue();
    }

    onBeforeDispose(): void {
        try { this._panel?.dispose(); } catch (e) { /* ignore */ }
    }

    _updateValue(): void {
        this.setNodeText(`当前月份: ${String(this._value.month).padStart(2, '0')}`, 'valueDisplay');
    }
}

export const MONTHPANEL_DEMO: DemoConfig = {
    title: 'MonthPanel',
    description: '月份选择面板 — 3列×4行显示01-12，点击即选中，使用 DateTimePanelComponent Ability 驱动',
    sections: [
        {
            label: '通过 DateTimePanelComponent 使用',
            code: `import { DateTimePanelComponent } from '@/component/date/DateTimePanelComponent';

const panel = new DateTimePanelComponent({
    type: 'date',
    initialView: 'month',
    showConfirm: true,
});
panel.on('change', ({ value }) => {
    console.log('选中月份:', value.month);
});
container.appendChild(panel.el);`,
            component: MonthPanelDemoComponent,
        },
    ],
};
