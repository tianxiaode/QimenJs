import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import { SecondPanelComponent } from '@/component/date/SecondPanelComponent';
import { createDateTimeValue, type DateTimeValue } from '@/utils/date';

class SecondPanelDemoComponent extends Component {
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
                    options: { text: `当前秒: ${String(this._value.second).padStart(2, '0')}` },
                },
            ],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('panelContainer');
        if (!container) return;
        const cmp = new SecondPanelComponent({
            value: this._value,
            showPrevField: false,
            showNextField: false,
        });
        cmp.on('secondSelect', (data: any) => {
            this._value = { ...this._value, second: data.value.second };
            this._updateValue();
        });
        cmp.on('confirm', (data: any) => {
            this._value = { ...this._value, ...data.value };
            this._updateValue();
        });
        container.appendChild(cmp.el);
        this._panel = cmp;
    }

    onBeforeDispose(): void {
        try {
            this._panel?.dispose();
        } catch (e) {
            // ignore
        }
    }

    _updateValue(): void {
        this.setNodeText(`当前秒: ${String(this._value.second).padStart(2, '0')}`, 'valueDisplay');
    }
}

export const SECONDPANEL_DEMO: DemoConfig = {
    title: 'SecondPanel',
    description: '秒选择面板，与 MinutePanel 布局一致，十位/个位并排两列，依次点2个数字选中秒，可脱离 DatePicker 独立使用',
    sections: [
        {
            label: '独立使用',
            code: `import { SecondPanelComponent } from '@/component/date/SecondPanelComponent';

const panel = new SecondPanelComponent({
    value: createDateTimeValue(new Date()),
    showPrevField: false,
    showNextField: false,
});
panel.on('secondSelect', ({ value }) => {
    console.log('选中秒:', value.second);
});
container.appendChild(panel.el);`,
            component: SecondPanelDemoComponent,
        },
        {
            label: '模板中使用',
            code: `{ type: 'second-panel', options: { showPrevField: false, showNextField: false } }`,
            template: {
                tag: 'div',
                style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden' },
                children: [{ type: 'second-panel', options: { showPrevField: false, showNextField: false } }],
            },
        },
    ],
};
