import { Component, TemplateDecl } from '@qimenjs/component-core';
import { OverlayTest } from './FixesTest';
import { DragDropTest } from './DragDropTest';

export class ShowcaseApp extends Component {
    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            name: 'root',
            classes: 'q-showcase',
            style: { padding: '40px', fontFamily: 'sans-serif' },
            children: [
                {
                    type: 'card',
                    name: 'avatar',
                    options: { title: '头像', body: {} },
                },
            ],
        };
    }
}
