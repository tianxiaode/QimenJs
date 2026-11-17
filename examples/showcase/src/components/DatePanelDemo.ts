import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import { DateTimePanelComponent } from '@/component/date/DateTimePanelComponent';
import { createDateTimeValue, type DateTimeValue } from '@/utils/date';

class DateTimePanelDemoComponent extends Component {
    _panel: DateTimePanelComponent | null = null;
    _value: DateTimeValue = createDateTimeValue();
    _panelType: string = 'datetime';
    _showSeconds: boolean = true;

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column', gap: '12px' },
            children: [
                {
                    tag: 'div',
                    name: 'panelContainer',
                    style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden', width: '280px' },
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
        this._renderPanel();
        this._updateValue();
    }

    onBeforeDispose(): void {
        try { this._panel?.dispose(); } catch (e) { /* ignore */ }
    }

    _renderPanel(): void {
        const container = this.getNodeEl('panelContainer');
        if (!container) return;

        if (this._panel) {
            try { this._panel.dispose(); } catch (e) { /* ignore */ }
            this._panel = null;
        }
        container.innerHTML = '';

        const cmp = new DateTimePanelComponent({
            value: this._value,
            type: this._panelType,
            showSeconds: this._showSeconds,
            showPrevField: false,
            showConfirm: true,
            showCancel: true,
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
    }

    _updateValue(): void {
        const v = this._value;
        const dateStr = `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')}`;
        const timeStr = this._showSeconds
            ? `${String(v.hour).padStart(2, '0')}:${String(v.minute).padStart(2, '0')}:${String(v.second ?? 0).padStart(2, '0')}`
            : `${String(v.hour).padStart(2, '0')}:${String(v.minute).padStart(2, '0')}`;
        this.setNodeText(`当前值: ${dateStr} ${timeStr}`, 'valueDisplay');
    }
}

class DateOnlyPanelDemoComponent extends DateTimePanelDemoComponent {
    _panelType = 'date';
}

class DateTimeNoSecondsDemoComponent extends DateTimePanelDemoComponent {
    _panelType = 'datetime';
    _showSeconds = false;
}

export const DATEPANEL_DEMO: DemoConfig = {
    title: 'DatePanel',
    description: '日期时间面板组件 — DateTimePanelComponent 统一管理日期+时间选择，支持 type=date/datetime/time 三种模式，showSeconds 控制秒选择',
    sections: [
        {
            label: '纯日期模式 (type=date)',
            code: `import { DateTimePanelComponent } from '@/component/date/DateTimePanelComponent';

const panel = new DateTimePanelComponent({
    value: createDateTimeValue(new Date()),
    type: 'date',
});
panel.on('change', ({ value }) => {
    console.log('值变化:', value);
});
panel.on('confirm', ({ value }) => {
    console.log('确认:', value);
});
container.appendChild(panel.el);`,
            component: DateOnlyPanelDemoComponent,
        },
        {
            label: '日期时间模式 (type=datetime)',
            code: `import { DateTimePanelComponent } from '@/component/date/DateTimePanelComponent';

const panel = new DateTimePanelComponent({
    value: createDateTimeValue(new Date()),
    type: 'datetime',
});
panel.on('change', ({ value }) => {
    console.log('值变化:', value);
});
panel.on('confirm', ({ value }) => {
    console.log('确认:', value);
});
container.appendChild(panel.el);`,
            component: DateTimePanelDemoComponent,
        },
        {
            label: '日期时间无秒模式 (type=datetime, showSeconds=false)',
            code: `import { DateTimePanelComponent } from '@/component/date/DateTimePanelComponent';

const panel = new DateTimePanelComponent({
    value: createDateTimeValue(new Date()),
    type: 'datetime',
    showSeconds: false,
});
panel.on('change', ({ value }) => {
    console.log('值变化:', value);
});
panel.on('confirm', ({ value }) => {
    console.log('确认:', value);
});
container.appendChild(panel.el);`,
            component: DateTimeNoSecondsDemoComponent,
        },
        {
            label: '模板中使用',
            code: `{ type: 'datetime-panel', options: { type: 'datetime' } }`,
            template: {
                tag: 'div',
                style: { border: '1px solid var(--q-color-border)', borderRadius: '8px', overflow: 'hidden', width: '280px' },
                children: [{ type: 'datetime-panel', options: { type: 'datetime' } }],
            },
        },
    ],
};
