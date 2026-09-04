import { Component, toast, msgbox, TemplateDecl } from '@qimenjs/component-core';
import { DialogComponent, MenuComponent } from './FloatsTest';
export class OverlayTest extends Component {
    loading = { text: '加载中...' };
    dialog = { type: 'dialog' };
    override get tpl(): TemplateDecl {
        return {
            tag: 'div',
            name: 'root',
            style: {
                border: '2px solid #22c55e',
                borderRadius: '8px',
                padding: '24px',
                marginTop: '24px',
            },
            children: [
                {
                    tag: 'h2',
                    name: 'sectionTitle',
                    options: { text: 'Overlay Defaults Test' },
                    style: { color: '#334155', fontSize: '20px', marginBottom: '16px' },
                },
                {
                    tag: 'div',
                    name: 'desc',
                    style: {
                        color: '#64748b',
                        fontSize: '14px',
                        marginBottom: '16px',
                        lineHeight: '1.5',
                    },
                    children: [
                        {
                            tag: 'p',
                            name: 'descText',
                            options: {
                                text: 'Hover the component root to see tooltip. Click buttons for loading/toast/msgbox.',
                            },
                        },
                    ],
                },
                {
                    tag: 'div',
                    name: 'btnRow',
                    style: { display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
                    children: [
                        {
                            type: 'button',
                            name: 'badgeBtn',
                            options: {
                                buttonType: 'primary',
                                text: 'Badge',
                                badge: { text: '99' },
                            },
                        },
                        {
                            type: 'button',
                            name: 'loadingBtn',
                            options: { text: 'Click me (loading 2s)' },
                        },
                        {
                            type: 'button',
                            name: 'toastBtn',
                            options: {
                                color: 'success', // Tooltip auto flip is not supported in QimenJS
                                disable: true, // Tooltip auto flip is not supported in QimenJS
                                text: 'Toast success',
                            },
                        },
                        {
                            type: 'button',
                            name: 'msgboxBtn',
                            options: { text: 'Msgbox alert' },
                        },
                        {
                            tag: 'button',
                            name: 'dialogBtn',
                            options: { text: 'dialog' },
                            style: {
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: '1px solid #22c55e',
                                background: '#f0fdf4',
                                color: '#15803d',
                                cursor: 'pointer',
                                fontSize: '14px',
                            },
                        },
                        {
                            type: 'button',
                            name: 'popoverBtn',
                            options: { popover: { type: MenuComponent } },
                        },
                    ],
                },
                {
                    tag: 'div',
                    name: 'tooltipRow',
                    style: { display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
                    children: [
                        {
                            type: 'button',
                            name: 'tooltipTop',
                            options: {
                                iconCls: 'fa fa-gear',
                                color: 'success',
                                text: '顶部',
                                tooltip: { content: 'Tooltip Top', placement: 'top' },
                            },
                        },
                        {
                            type: 'button',
                            name: 'tooltipBottom',
                            options: {
                                text: 'bottom',
                                color: 'warning',
                                tooltip: { content: 'Tooltip Bottom', placement: 'bottom' },
                            },
                        },
                        {
                            type: 'button',
                            name: 'tooltipLeft',
                            options: {
                                color: 'error',
                                text: 'left',
                                tooltip: { content: 'Tooltip Left', placement: 'left' },
                            },
                        },
                        {
                            type: 'button',
                            name: 'tooltipRight',
                            options: {
                                color: 'info',
                                disable: true, // Tooltip auto flip is not supported in QimenJS
                                text: 'right',
                                tooltip: { content: 'Tooltip Right', placement: 'right' },
                            },
                        },
                        {
                            type: 'button',
                            name: 'tooltipRightAutoFlip',
                            options: {
                                ghost: true,
                                text: 'right auto flip',
                                tooltip: { content: 'Tooltip Right Auto Flip', placement: 'right' },
                            },
                            style: {
                                flex: '1',
                                minWidth: '200px',
                                color: 'var(--q-color-primary)',
                            },
                        },
                    ],
                },
                {
                    tag: 'div',
                    name: 'tooltipRow2',
                    style: { display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
                    children: [
                        {
                            type: 'component',
                            style: {
                                flex: '1',
                                height: '100px',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: '1px solid #22c55e',
                                background: '#f0fdf4',
                                color: '#15803d',
                                cursor: 'pointer',
                                fontSize: '14px',
                            },
                            options: { indicator: { type: 'dot', count: 5 } },
                        },
                    ],
                },
            ],
        };
    }

    domEvents = {
        click: {
            loadingBtn: { handler: true },
            toastBtn: { handler: true },
            msgboxBtn: { handler: true },
            badgeBtn: { handler: true },
            dialogBtn: { handler: true },
        },
    };

    onBadgeBtnClick() {
        let count = this.badgeCount || 0;
        const dir = this.badgeDir || 'up';
        count = dir == 'down' ? count - 1 : count + 1;
        this.badgeCount = count;
        const node = this.getComponent('badgeBtn');
        this.badgeDir = count <= 0 ? 'up' : count >= 10 ? 'down' : dir;
        if (count == 0) {
            node.hideBadge();
            return;
        }
        node.updateBadge(count);
    }

    onLoadingBtnClick() {
        this.showLoading();
        setTimeout(() => {
            this.hideLoading();
        }, 2000);
    }

    onToastBtnClick() {
        let count = this.toastCount || 0;
        count++;
        this.toastCount = count;
        toast({ message: `Toast ${count}`, duration: 2000 });
    }

    onMsgboxBtnClick() {
        msgbox.alert('Alert', 'This is an alert message.');
    }
    onDialogBtnClick() {
        this.showDialog();
    }
}
