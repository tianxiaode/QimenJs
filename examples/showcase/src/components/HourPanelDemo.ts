import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import { HourPanelComponent } from '@/component/date/HourPanelComponent';
import { createDateTimeValue, type DateTimeValue } from '@/utils/date';

class HourPanelDemoComponent extends Component {
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
                    options: { text: '当前小时: --' },
                },
            ],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('panelContainer');
        if (!container) return;
        const cmp = new HourPanelComponent({
            value: this._value,
            showPrevField: false,
            showNextField: false,
        });
        cmp.on('hourSelect', (ctx: any) => {
            this._value = { ...this._value, hour: ctx.data.value.hour };
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
        this.setNodeText(`当前小时: ${String(this._value.hour).padStart(2, '0')}`, 'valueDisplay');
    }
}

export const HOURPANEL_DEMO: DemoConfig = {
    title: 'HourPanel',
    description: '小时选择面板，4列×6行直接显示0-23，点击即选中，可脱离 DatePicker 独立使用',
    sections: [
        {
            label: '独立使用',
            code: `import { HourPanelComponent } from '@/component/date/HourPanelComponent';

const panel = new HourPanelComponent({
    value: createDateTimeValue(new Date()),
    showPrevField: false,
    showNextField: false,
});
panel.on('hourSelect', ({ value }) => {
    console.log('选中小时:', value.hour);
});
container.appendChild(panel.el);`,
            component: HourPanelDemoComponent,
        },
        {
            label: '模板中使用',
            code: `{ type: 'hour-panel', options: { showPrevField: false, showNextField: false } }`,
            template: {
                tag: 'div',
                style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden' },
                children: [{ type: 'hour-panel', options: { showPrevField: false, showNextField: false } }],
            },
        },
    ],
};
