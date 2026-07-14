/**
 * PanelComponent 面板组件
 *
 * 带标题栏和可选折叠功能的容器组件。
 * 标题栏左右两侧各内置一个 ItemGroup，通过配置注入工具图标。
 *
 * 模板节点（PANEL_TEMPLATE）：
 * - panel:header — 标题栏容器
 * - panel:toolsLeft — 左侧工具图标区
 * - panel:expand — 折叠箭头（默认隐藏，expandable 时显示）
 * - panel:title — 标题文本
 * - panel:toolsRight — 右侧工具图标区
 * - panel:body — 内容区域
 *
 * 内置 ItemGroup：
 * - toolsLeft — 左侧工具区（ItemGroup，itemType 默认 'Icon'）
 * - toolsRight — 右侧工具区（ItemGroup，itemType 默认 'Icon'）
 *
 * 事件转发：
 * - 工具区事件通过 eventKey 转发，外部通过 bridges 或 listen 监听
 * - 如 toolsLeft.eventKey='panelLeft'，则事件为 'panelLeft:click'、'panelLeft:close'
 *
 * 组合：TemplateComponent + ExpandArrowAbility
 */

import { TemplateComponent } from '@qimenjs/component-core';
import { ExpandArrowAbility, type ExpandArrowConfig } from '@qimenjs/component-abilities';
import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';

/**
 * 工具区配置
 */
export interface ToolGroupConfig {
    /** 事件源标识，用于事件转发，如 'panelLeft' */
    eventKey: string;
    /** 子项数据数组 */
    items: Record<string, any>[];
    /** 子项组件类型，默认 'Icon' */
    itemType?: string;
    /** 额外 CSS 类名 */
    cls?: string;
}

/**
 * Panel 组件 props
 */
export interface PanelProps {
    /** 标题文本 */
    title?: string;
    /** 是否启用折叠，或传入详细配置 */
    expandable?: boolean | ExpandArrowConfig;
    /** 左侧工具区配置 */
    toolsLeft?: ToolGroupConfig;
    /** 右侧工具区配置 */
    toolsRight?: ToolGroupConfig;
}

/**
 * PanelComponent — 面板组件
 *
 * 继承 TemplateComponent + PANEL_TEMPLATE + ExpandArrowAbility
 * type 和方法通过 body 定义
 */
export let PanelComponent = TemplateComponent
    .withTemplate({
        tpl: {
            tag: 'div',
            children: [
                { tag: 'div', name: 'panel:header', className: 'q-panel__header', children: [
                    { tag: 'div', name: 'panel:toolsLeft', className: 'q-panel__tools q-panel__tools--left' },
                    { tag: 'div', name: 'panel:expand', className: 'q-expand-arrow q-expand-arrow--collapsed', hidden: true, children: [
                        { tag: 'i' },
                    ]},
                    { tag: 'span', name: 'panel:title', content: 'text', className: 'q-panel__title' },
                    { tag: 'div', name: 'panel:toolsRight', className: 'q-panel__tools q-panel__tools--right' },
                ]},
                { tag: 'div', name: 'panel:body', className: 'q-panel__body' },
            ]
        },
        body: {
            type: 'Panel',

            /**
             * 初始化 Panel 组件
             *
             * 在构造函数中调用，设置标题、折叠配置、工具区。
             */
            _initPanel(props?: PanelProps): void {
                // 设置标题
                if (props?.title) {
                    this.title = props.title;
                }

                // 左侧工具区
                if (props?.toolsLeft) {
                    this._toolsLeft = new ItemGroupComponent({
                        itemType: props.toolsLeft.itemType ?? 'Icon',
                        direction: 'horizontal',
                        gap: '4px',
                        eventKey: props.toolsLeft.eventKey,
                        items: props.toolsLeft.items,
                        cls: props.toolsLeft.cls,
                    });
                    const toolsLeftEl = this.nodeMap?.panel?.toolsLeft?.el;
                    if (toolsLeftEl) {
                        toolsLeftEl.appendChild(this._toolsLeft.el);
                    }

                    // 桥接工具区事件到 Panel
                    this._bridgeToolEvents(this._toolsLeft, props.toolsLeft.eventKey);
                }

                // 右侧工具区
                if (props?.toolsRight) {
                    this._toolsRight = new ItemGroupComponent({
                        itemType: props.toolsRight.itemType ?? 'Icon',
                        direction: 'horizontal',
                        gap: '4px',
                        eventKey: props.toolsRight.eventKey,
                        items: props.toolsRight.items,
                        cls: props.toolsRight.cls,
                    });
                    const toolsRightEl = this.nodeMap?.panel?.toolsRight?.el;
                    if (toolsRightEl) {
                        toolsRightEl.appendChild(this._toolsRight.el);
                    }

                    // 桥接工具区事件到 Panel
                    this._bridgeToolEvents(this._toolsRight, props.toolsRight.eventKey);
                }

                // 折叠配置
                if (props?.expandable) {
                    // 显示折叠箭头
                    const expandNode = this.nodeMap?.panel?.expand;
                    if (expandNode?.el) {
                        expandNode.el.hidden = false;
                    }

                    // 初始化折叠能力
                    const config: ExpandArrowConfig = typeof props.expandable === 'object'
                        ? props.expandable
                        : {};

                    this.initExpandArrow(config);

                    // 监听 toggle 事件，控制 body 显隐
                    this.on(config.arrowEvent ?? 'toggle', ({ state }: { state: string }) => {
                        const bodyNode = this.nodeMap?.panel?.body;
                        if (bodyNode?.el) {
                            bodyNode.el.hidden = state === 'collapsed';
                        }
                    });
                }
            },

            /**
             * 桥接工具区事件到 Panel
             *
             * 将 ItemGroup 转发的 `${eventKey}:${event}` 事件，
             * 重新从 Panel 自身 emit 出去，外部可通过 bridges 或 listen 监听。
             */
            _bridgeToolEvents(group: ItemGroupComponent, eventKey: string): void {
                for (const event of group.forwardEvents) {
                    group.on(event, (data: any) => {
                        this.emit(event, data, { source: eventKey });
                    });
                }
            },
        },
    })
    .with([ExpandArrowAbility]);
