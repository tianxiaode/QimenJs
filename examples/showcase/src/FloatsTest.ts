import { FloatingComponent } from '@qimenjs/component-core';

export class DialogComponent extends FloatingComponent {
    static type = 'dialog';

    get tpl() {
        return {
            tag: 'div',
            name: 'root',
            style: {
                background: '#fff',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                minWidth: '300px',
            },
            children: [
                {
                    tag: 'h3',
                    name: 'title',
                    options: { text: 'Dialog' },
                    style: { color: '#1a1a1a', fontSize: '18px', marginBottom: '16px' },
                },
                {
                    tag: 'p',
                    name: 'content',
                    options: { text: 'This is a dialog content.' },
                    style: { color: '#64748b', fontSize: '14px', lineHeight: '1.5' },
                },
                {
                    tag: 'div',
                    name: 'actions',
                    style: { display: 'flex', gap: '8px', justifyContent: 'flex-end' },
                    children: [
                        {
                            tag: 'button',
                            name: 'cancelBtn',
                            options: { text: 'Cancel' },
                            style: {
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: '1px solid #d1d5db',
                                background: '#fff',
                                color: '#64748b',
                                cursor: 'pointer',
                                fontSize: '14px',
                            },
                        },
                        {
                            tag: 'button',
                            name: 'confirmBtn',
                            options: { text: 'Confirm' },
                            style: {
                                padding: '6px 12px',
                                borderRadius: '4px',
                                border: 'none',
                                background: '#6366f1',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '14px',
                            },
                        },
                    ],
                },
            ],
        };
    }

    domEvents = {
        click: {
            cancelBtn: { handler: true },
            confirmBtn: { handler: true },
        },
    };

    open(): void {
        this.hidden = false;
        this._overlayOpen = true;
    }

    close(): void {
        this.hidden = true;
        this._overlayOpen = false;
    }

    onCancelBtnClick() {
        this.close();
    }

    onConfirmBtnClick() {
        this.close();
    }
}
DialogComponent.register();

export class MenuComponent extends FloatingComponent {
    static type = 'menu';

    get tpl() {
        return {
            tag: 'div',
            name: 'root',
            style: {
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                padding: '8px 0',
                minWidth: '150px',
            },
            children: [
                {
                    tag: 'div',
                    name: 'menuItem',
                    options: { text: 'Option 1' },
                    style: {
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#1a1a1a',
                    },
                },
                {
                    tag: 'div',
                    name: 'menuItem',
                    options: { text: 'Option 2' },
                    style: {
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#1a1a1a',
                    },
                },
                {
                    tag: 'div',
                    name: 'menuItem',
                    options: { text: 'Option 3' },
                    style: {
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#1a1a1a',
                    },
                },
            ],
        };
    }

    open(): void {
        this.hidden = false;
        this._overlayOpen = true;
    }

    close(): void {
        this.hidden = true;
        this._overlayOpen = false;
    }
}
MenuComponent.register();
