/**
 * TabComponent 单个标签组件
 *
 * 标签栏中的单个标签项，支持 pressed（激活）、closable（可关闭）、disabled（禁用）状态。
 * 由 TabBarComponent 通过 ItemGroupPooledComponent 池化管理。
 *
 * 模板节点：
 * - label   — 标签文本
 * - icon    — 图标（可选）
 * - close   — 关闭按钮（closable=true 时显示）
 *
 * @example
 * ```ts
 * new TabComponent({ label: '首页', icon: '🏠', closable: true })
 * tab.on('click', ({ index }) => { ... })
 * tab.on('close', ({ index }) => { ... })
 * ```
 */

import { Component, DomEventsMap } from '@qimenjs/component-core';
import { TAB_TPL } from './tab-tpl';

export interface TabProps {
    label?: string;
    icon?: string;
    closable?: boolean;
    disabled?: boolean;
    /** 标签索引（由父组件 TabBar 设置） */
    index?: number;
}

class TabComponent extends Component {
    _label: string = '';
    _icon: string = '';
    _closable: boolean = false;
    _disabled: boolean = false;
    _pressed: boolean = false;
    _index: number = 0;

    domEvents?: DomEventsMap | undefined = {
        click: {
            close: { handler: '_onCloseClick', emits: ['close'] },
        },
    };

    _onCloseClick(): void {
        if (this._disabled) return;
        // close 事件由 domEvents emits 自动触发
    }

    onAfterInit(props?: TabProps): void {
        this.update(props);
    }

    update(props?: Partial<TabProps>): void {
        if (props?.label !== undefined) {
            this._label = props.label;
            this.setNodeProp('text', props.label, 'label');
        }
        if (props?.icon !== undefined) {
            this._icon = props.icon;
            this.setNodeProp('text', props.icon, 'icon');
            this.setNodeHidden(!props.icon, 'icon');
        }
        if (props?.closable !== undefined) {
            this._closable = props.closable;
            this.setNodeHidden(!props.closable, 'close');
        }
        if (props?.disabled !== undefined) {
            this._disabled = props.disabled;
            this.toggleCls('q-tab--disabled', props.disabled);
        }
        if (props?.index !== undefined) {
            this._index = props.index;
        }
    }

    get label(): string {
        return this._label;
    }
    set label(v: string) {
        this._label = v;
        this.setNodeProp('text', v, 'label');
    }

    get icon(): string {
        return this._icon;
    }
    set icon(v: string) {
        this._icon = v;
        this.setNodeProp('text', v, 'icon');
        this.setNodeHidden(!v, 'icon');
    }

    get closable(): boolean {
        return this._closable;
    }
    set closable(v: boolean) {
        this._closable = v;
        this.setNodeHidden(!v, 'close');
    }

    get disabled(): boolean {
        return this._disabled;
    }
    set disabled(v: boolean) {
        this._disabled = v;
        this.toggleCls('q-tab--disabled', v);
    }

    get pressed(): boolean {
        return this._pressed;
    }
    set pressed(v: boolean) {
        this._pressed = v;
        this.toggleCls('q-tab--pressed', v);
    }

    get index(): number {
        return this._index;
    }
    set index(v: number) {
        this._index = v;
    }

    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            index: this._index,
            label: this._label,
            closable: this._closable,
            disabled: this._disabled,
        };
    }
}

TabComponent.useTemplate(TAB_TPL);
TabComponent.register();
export { TabComponent };
export type TabComponentInstance = InstanceType<typeof TabComponent>;