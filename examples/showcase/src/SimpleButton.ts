import { Component } from '@qimenjs/component-core';

export class SimpleButton extends Component {
    static type = 'button';

    get tpl() {
        return {
            tag: 'button',
            style: {
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #6366f1',
                background: '#eef2ff',
                color: '#4338ca',
                cursor: 'pointer',
                fontSize: '14px',
            },
        };
    }
}
SimpleButton.register();
