import { Component } from '@qimenjs/component-core';
import { YearPanelComponent } from '@/component/date/YearPanelComponent';
import { createDateTimeValue } from '@/utils/date';
class YearPanelDemoComponent extends Component {
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
                    options: { text: '当前年份: ----' },
                },
            ],
        };
    }
    onAfterInit() {
        const container = this.getNodeEl('panelContainer');
        if (!container)
            return;
        const cmp = new YearPanelComponent({
            value: this._value,
            showPrevField: false,
            showNextField: false, showConfirm: false, showCancel: false,
        });
        cmp.on('yearSelect', (ctx) => {
            this._value = { ...this._value, year: ctx.data.value.year };
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
        this.setNodeText(`当前年份: ${this._value.year}`, 'valueDisplay');
    }
}
export const YEARPANEL_DEMO = {
    title: 'YearPanel',
    description: '年份选择面板，4列布局（千/百/十/个位），依次点4个数字选中年份，可脱离 DatePicker 独立使用',
    sections: [
        {
            label: '独立使用',
            code: `import { YearPanelComponent } from '@/component/date/YearPanelComponent';

const panel = new YearPanelComponent({
    value: createDateTimeValue(new Date()),
    showPrevField: false,
    showNextField: false, showConfirm: false, showCancel: false,
});
panel.on('yearSelect', ({ value }) => {
    console.log('选中年份:', value.year);
});
container.appendChild(panel.el);`,
            component: YearPanelDemoComponent,
        },
        {
            label: '模板中使用',
            code: `{ type: 'year-panel', options: { showPrevField: false, showNextField: false, showConfirm: false, showCancel: false } }`,
            template: {
                tag: 'div',
                style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden' },
                children: [{ type: 'year-panel', options: { showPrevField: false, showNextField: false, showConfirm: false, showCancel: false } }],
            },
        },
    ],
};
