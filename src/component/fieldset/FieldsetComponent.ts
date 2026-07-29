/**
 * FieldsetComponent 字段集组件
 *
 * 表单分组容器，含 legend 标题，支持折叠。
 * 适用于将表单字段按逻辑分组展示。
 *
 * 模板节点：
 * - legend — 标题文本
 * - content — 内容区域
 * - toggleIcon — 折叠图标
 *
 * 事件（domEvents 声明式）：
 * - legend click → handler: onLegendToggleClick + emits: ['toggle']
 * - 事件数据由 defaultEventData 自动收集 { collapsed }
 *
 * @example
 * new FieldsetComponent({ legend: '基本信息' })
 * new FieldsetComponent({ legend: '高级设置', collapsible: true })
 * fieldset.on('toggle', ({ collapsed }) => { ... })
 */

import { Component, DomEventsMap } from '@qimenjs/component-core';

export interface FieldsetProps {
    legend?: string;
    i18nLegend?: string;
    collapsible?: boolean;
    collapsed?: boolean;
    cls?: string;
}

class FieldsetComponent extends Component {
    _collapsible: boolean = false;
    _collapsed: boolean = false;

    domEvents?: DomEventsMap | undefined = {
        click: {
            legend: {
                handler: 'onLegendToggleClick',
                emits: ['toggle'],
            },
        },
    };

    onAfterInit(props?: FieldsetProps): void {
        this._initFieldset(props);
    }

    _initFieldset(props?: FieldsetProps): void {
        if (props?.collapsible) {
            this._collapsible = true;
            this.setNodeHidden(false, 'toggleIcon');
        }
        if (props?.i18nLegend) {
            this.legendText = props.i18nLegend;
        } else if (props?.legend) {
            this.legendText = props.legend;
        }
        if (props?.collapsed) {
            this._collapsed = true;
            this._applyCollapsed();
        }
        if (props?.cls) this.addCls(props.cls);
    }

    onLegendToggleClick(): void {
        if (!this._collapsible) return;
        this._collapsed = !this._collapsed;
        this._applyCollapsed();
    }

    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            collapsed: this._collapsed,
        };
    }

    _applyCollapsed(): void {
        this.toggleCls('q-fieldset--collapsed', this._collapsed);
        this.setNodeHidden(this._collapsed, 'content');

        const iconEl = this.nodeMap?.toggleIcon?.el as HTMLElement | null;
        if (iconEl) {
            iconEl.textContent = this._collapsed ? '▶' : '▼';
        }
    }

    get collapsed(): boolean {
        return this._collapsed;
    }
    set collapsed(v: boolean) {
        this._collapsed = v;
        this._applyCollapsed();
    }

    get collapsible(): boolean {
        return this._collapsible;
    }
    set collapsible(v: boolean) {
        this._collapsible = v;
        this.setNodeHidden(!v, 'toggleIcon');
        if (!v) {
            this._collapsed = false;
            this._applyCollapsed();
        }
    }

    get legendText(): string {
        const el = this.nodeMap?.legendText?.el as HTMLElement | null;
        return el?.textContent ?? '';
    }
    set legendText(v: string) {
        this.setNodeProp('text', v, 'legendText');
    }

    update(props?: Partial<FieldsetProps>): void {
        if (props?.i18nLegend !== undefined) this.legendText = props.i18nLegend;
        else if (props?.legend !== undefined) this.legendText = props.legend;
        if (props?.collapsible !== undefined) this.collapsible = props.collapsible;
        if (props?.collapsed !== undefined) this.collapsed = props.collapsed;
        if (props?.cls !== undefined) this.addCls(props.cls);
    }
}

export { FieldsetComponent };
export type FieldsetComponentInstance = InstanceType<typeof FieldsetComponent>;
