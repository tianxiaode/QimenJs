import { Component } from '@qimenjs/component-core';

let counterId = 0;

export class CounterButton extends Component {
    _count = 0;

    get tpl() {
        return {
            tag: 'button',
            name: 'root',
            classes: 'evt-counter-btn',
            style: { padding: '8px 16px', borderRadius: '6px', border: '1px solid #6366f1', background: '#eef2ff', color: '#6366f1', cursor: 'pointer', fontSize: '14px', minWidth: '120px' },
            options: { text: `Counter ${++counterId}: 0` },
        };
    }

    onAfterInit() {
        this.bind(this.el, 'click');
        this.on('dom:click', () => {
            this._count++;
            const el = this.getNodeEl('root');
            if (el) el.textContent = `Counter ${counterId}: ${this._count}`;
            this.emit('changed', { count: this._count, id: counterId });
        });
    }
}

export class EventTestPanel extends Component {
    _log: string[] = [];

    get tpl() {
        return {
            tag: 'div',
            name: 'root',
            style: { border: '2px solid #6366f1', borderRadius: '8px', padding: '24px', marginTop: '24px' },
            children: [
                { tag: 'h2', name: 'sectionTitle', options: { text: 'Event Test' }, style: { color: '#334155', fontSize: '20px', marginBottom: '16px' } },
                {
                    tag: 'div', name: 'desc', style: { color: '#64748b', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' },
                    children: [
                        { tag: 'p', name: 'descText', options: { text: 'Click the buttons below to test cross-component listens.' } },
                    ],
                },
                {
                    tag: 'div', name: 'btnRow', style: { display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
                    children: [
                        { tag: 'div', name: 'btn1', type: CounterButton },
                        { tag: 'div', name: 'btn2', type: CounterButton },
                        { tag: 'div', name: 'btn3', type: CounterButton },
                    ],
                },
                {
                    tag: 'div', name: 'logBox', style: { background: '#1e293b', color: '#e2e8f0', borderRadius: '6px', padding: '16px', fontSize: '13px', fontFamily: 'monospace', lineHeight: '1.6', minHeight: '80px', maxHeight: '200px', overflow: 'auto' },
                    children: [
                        { tag: 'div', name: 'logContent', options: { text: '[events] Ready. Click buttons to see events.' } },
                    ],
                },
            ],
        };
    }

    onAfterInit() {
        const btnNames = ['btn1', 'btn2', 'btn3'];
        for (const name of btnNames) {
            const child = this.nodeInstances[name] as CounterButton;
            if (child) {
                child.on('changed', (ctx: any) => {
                    const data = ctx?.data ?? ctx;
                    this._addLog(`[listens] ${name} changed → count=${data.count}`);
                });
            }
        }
    }

    _addLog(msg: string) {
        this._log.push(msg);
        const el = this.getNodeEl('logContent');
        if (el) el.textContent = this._log.join('\n');
    }
}