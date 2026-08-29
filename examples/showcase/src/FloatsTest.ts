import { Component } from '@qimenjs/component-core';
import { DialogAbility, PopoverAbility, IndicatorAbility } from '@qimenjs/component-core';

export class DialogTest extends Component {
    static type = 'dialogTest';
    dialog = {
        type: 'button',
        title: '确认操作',
        content: '确定要执行此操作吗？',
    };

    get tpl() {
        return {
            tag: 'div',
            name: 'root',
            style: {
                border: '2px solid #6366f1',
                borderRadius: '8px',
                padding: '24px',
                marginTop: '24px',
            },
            children: [
                {
                    tag: 'h2',
                    name: 'sectionTitle',
                    options: { text: 'Dialog Test' },
                    style: { color: '#334155', fontSize: '20px', marginBottom: '16px' },
                },
                {
                    tag: 'button',
                    name: 'dialogBtn',
                    options: { text: 'Show Dialog' },
                    style: {
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #6366f1',
                        background: '#eef2ff',
                        color: '#4338ca',
                        cursor: 'pointer',
                        fontSize: '14px',
                    },
                },
            ],
        };
    }

    domEvents = {
        click: {
            dialogBtn: { handler: true },
        },
    };

    onDialogBtnClick() {
        this.showDialog();
    }
}
DialogTest.use('DialogAbility');
DialogTest.register();

export class PopoverTest extends Component {
    static type = 'popoverTest';
    popover = {
        type: 'button',
        title: 'Popover',
        content: 'This is a popover content.',
    };

    get tpl() {
        return {
            tag: 'div',
            name: 'root',
            style: {
                border: '2px solid #6366f1',
                borderRadius: '8px',
                padding: '24px',
                marginTop: '24px',
            },
            children: [
                {
                    tag: 'h2',
                    name: 'sectionTitle',
                    options: { text: 'Popover Test' },
                    style: { color: '#334155', fontSize: '20px', marginBottom: '16px' },
                },
                {
                    tag: 'button',
                    name: 'popoverBtn',
                    options: { text: 'Show Popover (click)' },
                    style: {
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #6366f1',
                        background: '#eef2ff',
                        color: '#4338ca',
                        cursor: 'pointer',
                        fontSize: '14px',
                    },
                },
            ],
        };
    }

    domEvents = {
        click: {
            popoverBtn: { handler: true },
        },
    };

    onPopoverBtnClick() {
        this.showPopover();
    }
}
PopoverTest.use('PopoverAbility');
PopoverTest.register();

export class IndicatorTest extends Component {
    static type = 'indicatorTest';
    indicator = {
        type: 'button',
        placement: 'bottom',
    };

    get tpl() {
        return {
            tag: 'div',
            name: 'root',
            style: {
                border: '2px solid #6366f1',
                borderRadius: '8px',
                padding: '24px',
                marginTop: '24px',
            },
            children: [
                {
                    tag: 'h2',
                    name: 'sectionTitle',
                    options: { text: 'Indicator Test' },
                    style: { color: '#334155', fontSize: '20px', marginBottom: '16px' },
                },
                {
                    tag: 'button',
                    name: 'indicatorBtn',
                    options: { text: 'Show Indicator (always)' },
                    style: {
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid #6366f1',
                        background: '#eef2ff',
                        color: '#4338ca',
                        cursor: 'pointer',
                        fontSize: '14px',
                    },
                },
            ],
        };
    }

    domEvents = {
        click: {
            indicatorBtn: { handler: true },
        },
    };

    onIndicatorBtnClick() {
        this.showIndicator();
    }
}
IndicatorTest.use('IndicatorAbility');
IndicatorTest.register();
