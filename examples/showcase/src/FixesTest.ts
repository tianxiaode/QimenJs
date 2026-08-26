import {
    Component,
    toast,
    msgbox,
    TooltipComponent,
    LoadingComponent,
} from '@qimenjs/component-core';

export class OverlayTest extends Component {
    tooltip = {
        type: TooltipComponent,
        content: 'Tooltip via setDefaultOverlay',
        placement: 'top',
    };
    loading = { type: LoadingComponent, text: '加载中...' };

    get tpl() {
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
                            tag: 'button',
                            name: 'tooltipHint',
                            options: { text: 'Hover root area (tooltip)' },
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
                            tag: 'button',
                            name: 'loadingBtn',
                            options: { text: 'Click me (loading 2s)' },
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
                        {
                            tag: 'button',
                            name: 'toastBtn',
                            options: { text: 'Toast success' },
                            style: {
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: '1px solid #f59e0b',
                                background: '#fffbeb',
                                color: '#b45309',
                                cursor: 'pointer',
                                fontSize: '14px',
                            },
                        },
                        {
                            tag: 'button',
                            name: 'msgboxBtn',
                            options: { text: 'Msgbox alert' },
                            style: {
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: '1px solid #ef4444',
                                background: '#fef2f2',
                                color: '#b91c1c',
                                cursor: 'pointer',
                                fontSize: '14px',
                            },
                        },
                    ],
                },
                {
                    tag: 'div',
                    name: 'resultBox',
                    style: {
                        background: '#080808ff',
                        borderRadius: '6px',
                        padding: '16px',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        lineHeight: '1.6',
                        minHeight: '60px',
                        border: '1px solid #e2e8f0',
                    },
                    children: [
                        {
                            tag: 'div',
                            name: 'resultText',
                            options: {
                                text: '[overlay] Ready. Hover component root to see tooltip overlay.',
                            },
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
        },
    };

    onLoadingBtnClick() {
        this.showLoading();
        const result = this.getNodeEl('resultText');
        if (result) result.textContent = '[overlay] Loading shown. Check for spinner overlay.';
        setTimeout(() => {
            this.hideLoading();
            if (result) result.textContent = '[overlay] Loading hidden after 2s.';
        }, 2000);
    }

    onToastBtnClick() {
        toast({ message: 'Operation successful!', type: 'success' });
        const result = this.getNodeEl('resultText');
        if (result) result.textContent = '[toast] Toast shown.';
    }

    onMsgboxBtnClick() {
        msgbox.alert('Hello', 'This is a message box alert.');
        const result = this.getNodeEl('resultText');
        if (result) result.textContent = '[msgbox] Msgbox alert shown.';
    }
}
