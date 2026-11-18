import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import { DateTimePanelComponent } from '@/component/date/DateTimePanelComponent';
import { createDateTimeValue, type DateTimeValue } from '@/utils/date';

class MinutePanelDemoComponent extends Component {
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
                    options: { text: '当前分钟: --' },
                },
            ],
        };
    }

    onAfterInit(): void {
        const container = this.getNodeEl('panelContainer');
        if (!container) return;
        const cmp = new DateTimePanelComponent({
            value: this._value,
            type: 'datetime',
            initialView: 'minute',
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
        this.setNodeText(`当前分钟: ${String(this._value.minute).padStart(2, '0')}`, 'valueDisplay');
    }
}

export const MINUTEPANEL_DEMO: DemoConfig = {
    title: 'MinutePanel',
    description: '分钟选择面板 — 十位/个位并排两列布局，依次点2个数字选中分钟，使用 DateTimePanelComponent Ability 驱动',
    sections: [
        {
            label: '通过 DateTimePanelComponent 使用',
            code: `import { DateTimePanelComponent } from '@/component/date/DateTimePanelComponent';

const panel = new DateTimePanelComponent({
    type: 'datetime',
    initialView: 'minute',
    showConfirm: true,
});
panel.on('change', ({ value }) => {
    console.log('选中分钟:', value.minute);
});
container.appendChild(panel.el);`,
            component: MinutePanelDemoComponent,
        },
    ],
};
