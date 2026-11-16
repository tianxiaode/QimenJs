import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import { YearPanelComponent } from '@/component/date/YearPanelComponent';
import { createDateTimeValue, type DateTimeValue } from '@/utils/date';

class YearPanelDemoComponent extends Component {
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
                    options: { text: '当前年份: ----' },
                },
            ],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('panelContainer');
        if (!container) return;
        const cmp = new YearPanelComponent({
            value: this._value,
            showPrevField: false,
            showNextField: false,
        });
        cmp.on('yearSelect', (ctx: any) => {
            this._value = { ...this._value, year: ctx.data.value.year };
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
        this.setNodeText(`当前年份: ${this._value.year}`, 'valueDisplay');
    }
}

export const YEARPANEL_DEMO: DemoConfig = {
    title: 'YearPanel',
    description: '年份选择面板，4列布局（千/百/十/个位），依次点4个数字选中年份，可脱离 DatePicker 独立使用',
    sections: [
        {
            label: '独立使用',
            code: `import { YearPanelComponent } from '@/component/date/YearPanelComponent';

const panel = new YearPanelComponent({
    value: createDateTimeValue(new Date()),
    showPrevField: false,
    showNextField: false,
});
panel.on('yearSelect', ({ value }) => {
    console.log('选中年份:', value.year);
});
container.appendChild(panel.el);`,
            component: YearPanelDemoComponent,
        },
        {
            label: '模板中使用',
            code: `{ type: 'year-panel', options: { showPrevField: false, showNextField: false } }`,
            template: {
                tag: 'div',
                style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden' },
                children: [{ type: 'year-panel', options: { showPrevField: false, showNextField: false } }],
            },
        },
    ],
};
