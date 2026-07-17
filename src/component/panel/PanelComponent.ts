/**
 * PanelComponent 面板组件
 *
 * 带标题栏和可选折叠功能的容器组件。
 * 标题栏左右两侧各内置一个 ItemGroup，通过配置注入工具图标。
 *
 * 模板节点：
 * - header — 标题栏容器
 * - toolsLeft — 左侧工具图标区
 * - expand — 折叠箭头（默认隐藏，expandable 时显示）
 * - title — 标题文本
 * - toolsRight — 右侧工具图标区
 * - body — 内容区域
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { ExpandArrowAbility, type ExpandArrowConfig } from '@qimenjs/component-abilities';
import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';

export interface ToolGroupConfig {
    eventKey: string;
    items: Record<string, any>[];
    itemType?: string;
    cls?: string;
}

export interface PanelProps {
    title?: string;
    expandable?: boolean | ExpandArrowConfig;
    toolsLeft?: ToolGroupConfig;
    toolsRight?: ToolGroupConfig;
}

export let PanelComponent = TemplateComponent.withTemplate({
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
    body: {
        type: 'Panel',

        _toolsLeft: null as ItemGroupComponent | null,
        _toolsRight: null as ItemGroupComponent | null,

        _initPanel(props?: PanelProps): void {
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

                const config: ExpandArrowConfig =
                    typeof props.expandable === 'object' ? props.expandable : {};

                this.initExpandArrow(config);

                this.on(config.arrowEvent ?? 'toggle', ({ state }: { state: string }) => {
                    const bodyNode = this.nodeMap?.body;
                    if (bodyNode?.el) {
                        bodyNode.el.hidden = state === 'collapsed';
                    }
                });
            }
        },

        _bridgeToolEvents(group: ItemGroupComponent, eventKey: string): void {
            for (const event of group.forwardEvents) {
                group.on(event, (data: any) => {
                    this.emit(event, data, { source: eventKey });
                });
            }
        },
    },
}).with([ExpandArrowAbility]);

export type PanelComponent = InstanceType<typeof PanelComponent>;
