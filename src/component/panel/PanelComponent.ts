import { TemplateComponent } from '@qimenjs/component-core';
import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';

export interface ToolGroupConfig {
    eventKey: string;
    items: Record<string, any>[];
    itemType?: string;
    cls?: string;
}

export interface PanelProps {
    title?: string;
    expandable?: boolean;
    toolsLeft?: ToolGroupConfig;
    toolsRight?: ToolGroupConfig;
}

const PanelBase = TemplateComponent.withTemplate({
    tpl: {
        tag: 'div',
        className: 'q-panel',
        children: [
            {
                tag: 'div',
                name: 'header',
                className: 'q-panel__header',
                children: [
                    {
                        tag: 'div',
                        name: 'toolsLeft',
                        className: 'q-panel__tools q-panel__tools--left',
                    },
                    {
                        tag: 'div',
                        name: 'expand',
                        className: 'q-expand-arrow q-expand-arrow--collapsed',
                        hidden: true,
                        children: [{ tag: 'i' }],
                    },
                    { tag: 'span', name: 'title', className: 'q-panel__title' },
                    {
                        tag: 'div',
                        name: 'toolsRight',
                        className: 'q-panel__tools q-panel__tools--right',
                    },
                ],
            },
            { tag: 'div', name: 'body', className: 'q-panel__body' },
        ],
    },
    body: { type: 'Panel' },
});

export class PanelComponent extends PanelBase {
    private _toolsLeft: ItemGroupComponent | null = null;
    private _toolsRight: ItemGroupComponent | null = null;

    constructor(props?: PanelProps) {
        super();

        if (props?.title) {
            this.title = props.title;
        }

        if (props?.toolsLeft) {
            this._toolsLeft = new ItemGroupComponent({
                itemType: props.toolsLeft.itemType ?? 'Icon',
                direction: 'horizontal',
                gap: '4px',
                eventKey: props.toolsLeft.eventKey,
                items: props.toolsLeft.items,
                cls: props.toolsLeft.cls,
            });
            const toolsLeftEl = this.nodeMap?.toolsLeft?.el;
            if (toolsLeftEl) {
                toolsLeftEl.appendChild(this._toolsLeft.el);
            }

            this._bridgeToolEvents(this._toolsLeft, props.toolsLeft.eventKey);
        }

        if (props?.toolsRight) {
            this._toolsRight = new ItemGroupComponent({
                itemType: props.toolsRight.itemType ?? 'Icon',
                direction: 'horizontal',
                gap: '4px',
                eventKey: props.toolsRight.eventKey,
                items: props.toolsRight.items,
                cls: props.toolsRight.cls,
            });
            const toolsRightEl = this.nodeMap?.toolsRight?.el;
            if (toolsRightEl) {
                toolsRightEl.appendChild(this._toolsRight.el);
            }

            this._bridgeToolEvents(this._toolsRight, props.toolsRight.eventKey);
        }

        if (props?.expandable) {
            const expandNode = this.nodeMap?.expand;
            if (expandNode?.el) {
                expandNode.el.hidden = false;
            }

            const expandEl = expandNode?.el;
            if (expandEl) {
                expandEl.classList.add('q-expand-arrow', 'q-expand-arrow--collapsed');

                expandEl.addEventListener('click', (e: Event) => {
                    e.stopPropagation();
                    const isCollapsed = expandEl.classList.contains('q-expand-arrow--collapsed');
                    expandEl.classList.toggle('q-expand-arrow--collapsed', !isCollapsed);
                    expandEl.classList.toggle('q-expand-arrow--expanded', isCollapsed);

                    const bodyNode = this.nodeMap?.body;
                    if (bodyNode?.el) {
                        bodyNode.el.hidden = isCollapsed;
                    }
                });
            }
        }
    }

    _bridgeToolEvents(group: ItemGroupComponent, eventKey: string): void {
        for (const event of group.forwardEvents) {
            group.on(event, (data: any) => {
                this.emit(event, data, { source: eventKey });
            });
        }
    }
}
