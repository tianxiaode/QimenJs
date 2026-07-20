import { TemplateComponent } from '@qimenjs/component-core';
import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';

type ItemGroupInstance = InstanceType<typeof ItemGroupComponent>;

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

const PanelBase = TemplateComponent.withTemplate({
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
            this._toolsLeft = new ItemGroupComponent({
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
            this._toolsRight = new ItemGroupComponent({
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
}
