import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import { MinutePanelComponent } from '@/component/date/MinutePanelComponent';
import { createDateTimeValue, type DateTimeValue } from '@/utils/date';

class MinutePanelDemoComponent extends Component {
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
                    options: { text: '当前分钟: --' },
                },
            ],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('panelContainer');
        if (!container) return;
        const cmp = new MinutePanelComponent({
            value: this._value,
            showPrevField: false,
            showNextField: false,
        });
        cmp.on('minuteSelect', (data: any) => {
            this._value = { ...this._value, minute: data.value.minute };
            this._updateValue();
        });
        cmp.on('confirm', (data: any) => {
            this._value = { ...this._value, ...data.value };
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
        this.setNodeText(`当前分钟: ${String(this._value.minute).padStart(2, '0')}`, 'valueDisplay');
    }
}

export const MINUTEPANEL_DEMO: DemoConfig = {
    title: 'MinutePanel',
    description: '分钟选择面板，十位/个位并排两列布局，依次点2个数字选中分钟，可脱离 DatePicker 独立使用',
    sections: [
        {
            label: '独立使用',
            code: `import { MinutePanelComponent } from '@/component/date/MinutePanelComponent';

const panel = new MinutePanelComponent({
    value: createDateTimeValue(new Date()),
    showPrevField: false,
    showNextField: false,
});
panel.on('minuteSelect', ({ value }) => {
    console.log('选中分钟:', value.minute);
});
container.appendChild(panel.el);`,
            component: MinutePanelDemoComponent,
        },
        {
            label: '模板中使用',
            code: `{ type: 'minute-panel', options: { showPrevField: false, showNextField: false } }`,
            template: {
                tag: 'div',
                style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden' },
                children: [{ type: 'minute-panel', options: { showPrevField: false, showNextField: false } }],
            },
        },
    ],
};
