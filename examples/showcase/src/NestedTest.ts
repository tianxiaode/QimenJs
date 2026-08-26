import { Component } from '@qimenjs/component-core';

export class NestedTest extends Component {
    get tpl() {
        return {
            tag: 'div',
            name: 'root',
            style: { border: '2px solid #6366f1', borderRadius: '8px', padding: '24px', marginTop: '24px' },
            children: [
                {
                    tag: 'h2',
                    name: 'sectionTitle',
                    options: { text: 'Nested Components Test' },
                    style: { color: '#334155', fontSize: '20px', marginBottom: '16px' },
                },
                {
                    tag: 'div',
                    name: 'cardContainer',
                    style: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
                    children: [
                        {
                            tag: 'div',
                            name: 'card1',
                            style: { border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px', flex: '1', minWidth: '200px', background: '#f8fafc' },
                            children: [
                                { tag: 'h3', name: 'card1Title', options: { text: 'Card A' }, style: { color: '#6366f1', marginBottom: '8px', fontSize: '16px' } },
                                { tag: 'p', name: 'card1Desc', options: { text: 'This is the first nested card with multiple levels of DOM depth.' }, style: { color: '#64748b', fontSize: '14px', lineHeight: '1.5' } },
                                {
                                    tag: 'div',
                                    name: 'card1Meta',
                                    style: { marginTop: '12px', padding: '8px', background: '#eef2ff', borderRadius: '4px', fontSize: '12px', color: '#475569' },
                                    children: [
                                        { tag: 'span', name: 'card1MetaText', options: { text: 'Depth: 4 levels' } },
                                    ],
                                },
                            ],
                        },
                        {
                            tag: 'div',
                            name: 'card2',
                            style: { border: '1px solid #e2e8f0', borderRadius: '6px', padding: '16px', flex: '1', minWidth: '200px', background: '#f8fafc' },
                            children: [
                                { tag: 'h3', name: 'card2Title', options: { text: 'Card B' }, style: { color: '#6366f1', marginBottom: '8px', fontSize: '16px' } },
                                { tag: 'p', name: 'card2Desc', options: { text: 'Another nested card demonstrating multi-level template rendering.' }, style: { color: '#64748b', fontSize: '14px', lineHeight: '1.5' } },
                                {
                                    tag: 'div',
                                    name: 'card2Meta',
                                    style: { marginTop: '12px', padding: '8px', background: '#eef2ff', borderRadius: '4px', fontSize: '12px', color: '#475569' },
                                    children: [
                                        { tag: 'span', name: 'card2MetaText', options: { text: 'Depth: 4 levels' } },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    tag: 'div',
                    name: 'statusBar',
                    style: { marginTop: '16px', padding: '12px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' },
                    children: [
                        { tag: 'span', name: 'statusIcon', options: { text: '✓' }, style: { color: '#16a34a', fontWeight: 'bold', marginRight: '8px' } },
                        { tag: 'span', name: 'statusText', options: { text: 'All components rendered successfully across 4 levels of nesting.' }, style: { color: '#166534', fontSize: '14px' } },
                    ],
                },
            ],
        };
    }
}