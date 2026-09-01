import { Component, TemplateDecl } from '@qimenjs/component-core';

export class DragItem extends Component {
    static type = 'drag-item';

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            name: 'root',
            style: {
                padding: '12px 16px',
                borderRadius: '6px',
                border: '1px solid #6366f1',
                background: '#eef2ff',
                color: '#4338ca',
                cursor: 'grab',
                fontSize: '14px',
                userSelect: 'none',
                touchAction: 'none',
                width: '120px',
                textAlign: 'center',
            },
        };
    }

    onDragStart(e: any) {
        e.el.style.opacity = '0.5';
    }

    onDragEnd(e: any) {
        e.el.style.opacity = '';
    }
}

export class DropZone extends Component {
    static type = 'drop-zone';

    _hovered = false;
    _dropped = '';

    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            name: 'root',
            style: {
                padding: '24px',
                borderRadius: '8px',
                border: this._dropped ? '2px solid #22c55e' : '2px dashed #94a3b8',
                background: this._hovered ? '#f0fdf4' : '#f8fafc',
                minHeight: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: '#64748b',
                transition: 'all 0.2s',
            },
            children: [
                {
                    tag: 'span',
                    name: 'label',
                    options: {
                        text: this._dropped || 'Drop here',
                    },
                },
            ],
        };
    }

    onSelfDragEnter(e: any) {
        this._hovered = true;
        this.render();
    }

    onSelfDragLeave(e: any) {
        this._hovered = false;
        this.render();
    }

    onSelfDragDrop(e: any) {
        this._hovered = false;
        this._dropped = `Dropped: ${e.dragType ?? 'item'}`;
        this.render();
    }
}

export class DragDropTest extends Component {
    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            name: 'root',
            style: {
                border: '2px solid #f59e0b',
                borderRadius: '8px',
                padding: '24px',
                marginTop: '24px',
            },
            children: [
                {
                    tag: 'h2',
                    name: 'title',
                    options: { text: 'Drag & Drop Test' },
                    style: { color: '#334155', fontSize: '20px', marginBottom: '16px' },
                },
                {
                    tag: 'p',
                    name: 'desc',
                    options: {
                        text: 'Drag the item on the left into the drop zone on the right.',
                    },
                    style: { color: '#64748b', fontSize: '14px', marginBottom: '16px' },
                },
                {
                    tag: 'div',
                    name: 'row',
                    style: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
                    children: [
                        {
                            tag: 'div',
                            name: 'dragCol',
                            style: { display: 'flex', flexDirection: 'column', gap: '8px' },
                            children: [
                                {
                                    type: 'drag-item',
                                    name: 'item1',
                                    options: { text: 'Item A' },
                                    drag: { type: 'item-a' },
                                },
                                {
                                    type: 'drag-item',
                                    name: 'item2',
                                    options: { text: 'Item B' },
                                    drag: { type: 'item-b' },
                                },
                            ],
                        },
                        {
                            type: 'drop-zone',
                            name: 'zone1',
                            drop: { accept: ['item-a', 'item-b'] },
                            style: { flex: '1' },
                        },
                    ],
                },
            ],
        };
    }
}

DragItem.register();
DropZone.register();
