import { Component, type TemplateDecl } from '@qimenjs/component-core';
import type { DemoConfig } from './types';
import { DateTimePanelComponent } from '@/component/date/DateTimePanelComponent';
import { createDateTimeValue, type DateTimeValue } from '@/utils/date';

class DateTimePanelDemoComponent extends Component {
    _panel: DateTimePanelComponent | null = null;
    _value: DateTimeValue = createDateTimeValue();

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' },
            children: [
                { tag: 'div', name: 'panelContainer' },
            ],
        };
    }

    onAfterInit(): void {
        this._renderPanel();
    }

    onBeforeDispose(): void {
        try { this._panel?.dispose(); } catch (e) { /* ignore */ }
    }

    _renderPanel(): void {
        const container = this.getNodeEl('panelContainer');
        if (!container) return;
        container.innerHTML = '';

        const cmp = new DateTimePanelComponent({
            value: this._value,
            type: 'datetime',
            showPrevField: false,
            showConfirm: true,
            showCancel: true,
        });

        cmp.on('change', (ctx: any) => {
            this._value = ctx.data.value;
        });
        cmp.on('confirm', (ctx: any) => {
            this._value = ctx.data.value;
        });
        cmp.on('cancel', () => {
            this._renderPanel();
        });

        container.appendChild(cmp.el);
        this._panel = cmp;
    }
}

export const DATETIMEPANEL_DEMO: DemoConfig = {
    title: 'DateTimePanel',
    description: '日期时间组合面板 — DateTimePanelComponent 内聚管理面板切换，底部时间栏可点击切换面板或直接微调',
    sections: [
        {
            label: '组合面板',
            code: `// DateTimePanelComponent 从 DatePanelComponent 派生
// type='datetime'：日期视图 + 时间栏
// 点击年份/月份标签 → YearPanel/MonthPanel
// 点击时间数字 → HourPanel/MinutePanel/SecondPanel
// 时间栏上下箭头可直接微调值`,
            component: DateTimePanelDemoComponent,
        },
    ],
};
