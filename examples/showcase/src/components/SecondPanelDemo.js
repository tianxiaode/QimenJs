import { Component } from '@qimenjs/component-core';
import { SecondPanelComponent } from '@/component/date/SecondPanelComponent';
import { createDateTimeValue } from '@/utils/date';
class SecondPanelDemoComponent extends Component {
    constructor() {
        super(...arguments);
        this._panel = null;
        this._value = createDateTimeValue();
    }
    get tpl() {
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
                    options: { text: '当前秒: --' },
                },
            ],
        };
    }
    onAfterInit() {
        const container = this.getNodeEl('panelContainer');
        if (!container)
            return;
        const cmp = new SecondPanelComponent({
            value: this._value,
            showPrevField: false,
            showNextField: false, showConfirm: false, showCancel: false,
        });
        cmp.on('secondSelect', (ctx) => {
            this._value = { ...this._value, second: ctx.data.value.second };
            this._updateValue();
        });
        cmp.on('confirm', (ctx) => {
            this._value = { ...this._value, ...ctx.data.value };
            this._updateValue();
        });
        container.appendChild(cmp.el);
        this._panel = cmp;
        this._updateValue();
    }
    onBeforeDispose() {
        try {
            this._panel?.dispose();
        }
        catch (e) {
            // ignore
        }
    }
    _updateValue() {
        this.setNodeText(`当前秒: ${String(this._value.second).padStart(2, '0')}`, 'valueDisplay');
    }
}
export const SECONDPANEL_DEMO = {
    title: 'SecondPanel',
    description: '秒选择面板，与 MinutePanel 布局一致，十位/个位并排两列，依次点2个数字选中秒，可脱离 DatePicker 独立使用',
    sections: [
        {
            label: '独立使用',
            code: `import { SecondPanelComponent } from '@/component/date/SecondPanelComponent';

const panel = new SecondPanelComponent({
    value: createDateTimeValue(new Date()),
    showPrevField: false,
    showNextField: false, showConfirm: false, showCancel: false,
});
panel.on('secondSelect', ({ value }) => {
    console.log('选中秒:', value.second);
});
container.appendChild(panel.el);`,
            component: SecondPanelDemoComponent,
        },
        {
            label: '模板中使用',
            code: `{ type: 'second-panel', options: { showPrevField: false, showNextField: false, showConfirm: false, showCancel: false } }`,
            template: {
                tag: 'div',
                style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden' },
                children: [{ type: 'second-panel', options: { showPrevField: false, showNextField: false, showConfirm: false, showCancel: false } }],
            },
        },
    ],
};
