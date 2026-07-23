import { Component } from '@qimenjs/component-core';
import { DOM_EVENT_PREFIX } from '@qimenjs/event-dom';
import { ItemGroupPooledComponent } from '../itemgroup/ItemGroupPooledComponent';

type ItemGroupInstance = InstanceType<typeof ItemGroupPooledComponent>;

export interface ToolGroupConfig {
    items: Record<string, any>[];
    itemType?: string;
    cls?: string;
    defaultItem?: Record<string, any>;
}

export interface PanelProps {
    title?: string;
    expandable?: boolean;
    toolsLeft?: ToolGroupConfig;
    toolsRight?: ToolGroupConfig;
}

const PanelBase = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-panel',
        children: [
            {
                tag: 'div',
                name: 'header',
                cls: 'q-panel__header',
                children: [
                    {
                        tag: 'div',
                        name: 'toolsLeft',
                        cls: 'q-panel__tools q-panel__tools--left',
                    },
                    {
                        tag: 'div',
                        name: 'expand',
                        cls: 'q-expand-arrow q-expand-arrow--collapsed',
                        hidden: true,
                        children: [{ tag: 'i' }],
                    },
                    { tag: 'span', name: 'title', cls: 'q-panel__title' },
                    {
                        tag: 'div',
                        name: 'toolsRight',
                        cls: 'q-panel__tools q-panel__tools--right',
                    },
                ],
            },
            { tag: 'div', name: 'body', cls: 'q-panel__body' },
        ],
    },
    body: { type: 'Panel' },
});

export class PanelComponent extends PanelBase {
    private _toolsLeft: ItemGroupInstance | null = null;
    private _toolsRight: ItemGroupInstance | null = null;

    constructor(props?: PanelProps) {
        super();

        if (props?.title) {
            this.title = props.title;
        }

        if (props?.toolsLeft) {
            this._toolsLeft = new ItemGroupPooledComponent({
                itemType: props.toolsLeft.itemType ?? 'Icon',
                direction: 'horizontal',
                gap: '4px',
                defaultItem: props.toolsLeft.defaultItem,
                items: props.toolsLeft.items,
                cls: props.toolsLeft.cls,
            });
            const toolsLeftEl = this.nodeMap?.toolsLeft?.el;
            if (toolsLeftEl) {
                toolsLeftEl.appendChild(this._toolsLeft.el);
            }
        }

        if (props?.toolsRight) {
            this._toolsRight = new ItemGroupPooledComponent({
                itemType: props.toolsRight.itemType ?? 'Icon',
                direction: 'horizontal',
                gap: '4px',
                defaultItem: props.toolsRight.defaultItem,
                items: props.toolsRight.items,
                cls: props.toolsRight.cls,
            });
            const toolsRightEl = this.nodeMap?.toolsRight?.el;
            if (toolsRightEl) {
                toolsRightEl.appendChild(this._toolsRight.el);
            }
        }

        if (props?.expandable) {
            this.setNodeHidden(false, 'expand');
            this.addCls('q-expand-arrow q-expand-arrow--collapsed', 'expand');

            this.bind(this.nodeMap?.expand?.el, 'click');
            this.on(`${DOM_EVENT_PREFIX}click`, (ctx: any) => {
                const originalEvent = ctx?.data?.originalEvent;
                originalEvent?.stopPropagation();
                const isCollapsed = this.nodeMap?.expand?.el?.classList.contains(
                    'q-expand-arrow--collapsed'
                );
                if (isCollapsed) {
                    this.removeCls('q-expand-arrow--collapsed', 'expand');
                    this.addCls('q-expand-arrow--expanded', 'expand');
                } else {
                    this.removeCls('q-expand-arrow--expanded', 'expand');
                    this.addCls('q-expand-arrow--collapsed', 'expand');
                }
                this.setNodeHidden(!!isCollapsed, 'body');
            });
        }
    }
}
