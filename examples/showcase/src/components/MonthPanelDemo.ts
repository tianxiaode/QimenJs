import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import { MonthPanelComponent } from '@/component/date/MonthPanelComponent';
import { createDateTimeValue, type DateTimeValue } from '@/utils/date';

class MonthPanelDemoComponent extends Component {
    _panel: any = null;
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
        const cmp = new MonthPanelComponent({
            value: this._value,
            showPrevField: false,
            showNextField: false,
        });
        cmp.on('monthSelect', (ctx: any) => {
            this._value = { ...this._value, month: ctx.data.value.month };
            this._updateValue();
        });
        cmp.on('confirm', (ctx: any) => {
            this._value = { ...this._value, ...ctx.data.value };
            this._updateValue();
        });
        container.appendChild(cmp.el);
        this._panel = cmp;
        this._updateValue();
    }

    onBeforeDispose(): void {
        try {
            this._panel?.dispose();
        } catch (e) {
            // ignore
        }
    }

    _updateValue(): void {
        this.setNodeText(`当前月份: ${String(this._value.month).padStart(2, '0')}`, 'valueDisplay');
    }
}

export const MONTHPANEL_DEMO: DemoConfig = {
    title: 'MonthPanel',
    description: '月份选择面板，6列×2行直接显示1-12月，点击即选中，月份标签从 i18n 获取，可脱离 DatePicker 独立使用',
    sections: [
        {
            label: '独立使用',
            code: `import { MonthPanelComponent } from '@/component/date/MonthPanelComponent';

const panel = new MonthPanelComponent({
    value: createDateTimeValue(new Date()),
    showPrevField: false,
    showNextField: false,
});
panel.on('monthSelect', ({ value }) => {
    console.log('选中月份:', value.month);
});
container.appendChild(panel.el);`,
            component: MonthPanelDemoComponent,
        },
        {
            label: '模板中使用',
            code: `{ type: 'month-panel', options: { showPrevField: false, showNextField: false } }`,
            template: {
                tag: 'div',
                style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden' },
                children: [{ type: 'month-panel', options: { showPrevField: false, showNextField: false } }],
            },
        },
    ],
};
