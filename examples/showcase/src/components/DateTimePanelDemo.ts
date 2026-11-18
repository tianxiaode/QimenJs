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

class MinMaxDateDemoComponent extends Component {
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

        const now = new Date();
        const cmp = new DateTimePanelComponent({
            value: this._value,
            type: 'date',
            showPrevField: false,
            showConfirm: true,
            showCancel: true,
            minDate: { year: now.getFullYear(), month: now.getMonth() + 1, day: 5 },
            maxDate: { year: now.getFullYear(), month: now.getMonth() + 1, day: 25 },
        });

        cmp.on('change', (ctx: any) => {
            this._value = ctx.data.value;
        });
        cmp.on('confirm', (ctx: any) => {
            this._value = ctx.data.value;
        });

        container.appendChild(cmp.el);
        this._panel = cmp;
    }
}

class RangeDemoComponent extends Component {
    _panel: DateTimePanelComponent | null = null;
    _value: DateTimeValue = createDateTimeValue();

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            style: { display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' },
            children: [
                { tag: 'div', name: 'panelContainer' },
                {
                    tag: 'div',
                    name: 'rangeDisplay',
                    classes: 'q-demo__value-tag',
                    style: { fontSize: '14px', fontWeight: 'bold' },
                    options: { text: '范围: 未选择' },
                },
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
            type: 'date',
            showPrevField: false,
            showConfirm: true,
            showCancel: true,
            range: true,
        });

        cmp.on('change', (ctx: any) => {
            this._value = ctx.data.value;
            const rs = ctx.data.rangeStart;
            const re = ctx.data.rangeEnd;
            if (rs && re) {
                this.setNodeText(`范围: ${rs.year}-${String(rs.month).padStart(2, '0')}-${String(rs.day).padStart(2, '0')} ~ ${re.year}-${String(re.month).padStart(2, '0')}-${String(re.day).padStart(2, '0')}`, 'rangeDisplay');
            } else if (rs) {
                this.setNodeText(`范围: ${rs.year}-${String(rs.month).padStart(2, '0')}-${String(rs.day).padStart(2, '0')} ~ --`, 'rangeDisplay');
            } else {
                this.setNodeText('范围: 未选择', 'rangeDisplay');
            }
        });
        cmp.on('confirm', (ctx: any) => {
            this._value = ctx.data.value;
            const rs = ctx.data.rangeStart;
            const re = ctx.data.rangeEnd;
            if (rs && re) {
                this.setNodeText(`范围: ${rs.year}-${String(rs.month).padStart(2, '0')}-${String(rs.day).padStart(2, '0')} ~ ${re.year}-${String(re.month).padStart(2, '0')}-${String(re.day).padStart(2, '0')}`, 'rangeDisplay');
            }
        });

        container.appendChild(cmp.el);
        this._panel = cmp;
    }
}

class DateOnlyDemoComponent extends Component {
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
            type: 'date',
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

        container.appendChild(cmp.el);
        this._panel = cmp;
    }
}

export const DATETIMEPANEL_DEMO: DemoConfig = {
    title: 'DateTimePanel',
    description: '日期时间组合面板 — DateTimePanelComponent 内聚管理面板切换，顶部标签可点击切换面板，选中即更新',
    sections: [
        {
            label: '组合面板（datetime）',
            code: `// DateTimePanelComponent 从 DatePanelComponent 派生
// type='datetime'：日期视图 + 时间栏
// 点击年份/月份/日期标签 → 对应选择面板
// 点击时间数字 → HourPanel/MinutePanel/SecondPanel
// 选中即更新，不退出面板`,
            component: DateTimePanelDemoComponent,
        },
        {
            label: '纯日期选择（type="date"）',
            code: `const panel = new DateTimePanelComponent({
    type: 'date',
    showConfirm: true,
});
// type='date' 隐藏时间栏，只显示日期视图`,
            component: DateOnlyDemoComponent,
        },
        {
            label: '禁止选择范围（minDate/maxDate）',
            code: `const panel = new DateTimePanelComponent({
    type: 'date',
    minDate: { year: 2026, month: 11, day: 5 },
    maxDate: { year: 2026, month: 11, day: 25 },
});
// 超出范围的日期灰色不可点击`,
            component: MinMaxDateDemoComponent,
        },
        {
            label: '日期范围选择（range）',
            code: `const panel = new DateTimePanelComponent({
    type: 'date',
    range: true,
});
// 第一次点击选起始日期，第二次选结束日期
// 点击早于起始日期时重置为新的起始日期
// change/confirm 事件携带 rangeStart/rangeEnd`,
            component: RangeDemoComponent,
        },
    ],
};
