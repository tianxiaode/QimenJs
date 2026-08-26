import { Component } from '@qimenjs/component-core';
import { NestedTest } from './NestedTest';
import { EventTestPanel } from './EventTest';
import { OverlayTest } from './FixesTest';

export class ShowcaseApp extends Component {
    get tpl() {
        return {
            tag: 'div',
            name: 'root',
            classes: 'q-showcase',
            style: { padding: '40px', fontFamily: 'sans-serif' },
            children: [
                {
                    tag: 'h1',
                    name: 'title',
                    options: { text: 'QimenJS Showcase' },
                    style: { color: '#6366f1', marginBottom: '16px' },
                },
                {
                    tag: 'p',
                    name: 'desc',
                    options: { text: 'Framework is running!' },
                    style: { color: '#64748b', marginBottom: '24px' },
                },
                {
                    tag: 'div',
                    name: 'nestedTest',
                    type: NestedTest,
                },
                {
                    tag: 'div',
                    name: 'eventTest',
                    type: EventTestPanel,
                },
                {
                    tag: 'div',
                    name: 'overlayTest',
                    type: OverlayTest,
                },
            ],
        };
    }
}