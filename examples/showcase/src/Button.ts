import { Component } from '@qimenjs/component-core';

export class Button extends Component {
    static type = 'button';
    get tpl() {
        return {
            tag: 'button',
            style: {
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #22c55e',
                background: '#f0fdf4',
                width: '120px',
                height: '40px',
                color: '#15803d',
                cursor: 'pointer',
                fontSize: '14px',
            },
        };
    }
}
//Button.use('TooltipAbility');
//Button.register();
