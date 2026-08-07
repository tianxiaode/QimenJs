/**
 * TimelineItemComponent 时间线项组件
 *
 * 单个时间线项，由 TimelineComponent 池化管理。
 * 不含状态流转（区别于 StepItemComponent 的 wait/process/finish/error），
 * 仅支持 color 标记与 dot 自定义内容。
 *
 * 模板节点：
 * - tail      — 连接线（CSS :last-child 隐藏，pending 容器类驱动显示虚线）
 * - dot       — 节点圆点（dot 字段提供时切换为自定义内容样式）
 * - content   — 内容容器
 * - title     — 标题
 * - desc      — 描述（可选）
 * - timestamp — 时间戳（可选）
 */

import { Component } from '@qimenjs/component-core';
import { TIMELINE_ITEM_TPL } from './timeline-item-tpl';

/** 时间线颜色 */
export type TimelineColor = 'default' | 'primary' | 'success' | 'warning' | 'error';

/** 时间线项属性接口 */
export interface TimelineItemProps {
    title?: string;
    description?: string;
    timestamp?: string;
    color?: TimelineColor;
    /** 自定义节点内容（文本/图标），提供时 dot 切换为自定义样式 */
    dot?: string;
}

class TimelineItemComponent extends Component {
    _title: string = '';
    _description: string = '';
    _timestamp: string = '';
    _color: TimelineColor = 'default';
    _dot: string = '';

    onAfterInit(props?: TimelineItemProps): void {
        this.update(props);
    }

    update(props?: Partial<TimelineItemProps>): void {
        if (props?.title !== undefined) {
            this._title = props.title;
            this.setNodeProp('text', props.title, 'title');
        }
        if (props?.description !== undefined) {
            this._description = props.description;
            this.setNodeProp('text', props.description, 'desc');
            this.setNodeHidden(!props.description, 'desc');
        }
        if (props?.timestamp !== undefined) {
            this._timestamp = props.timestamp;
            this.setNodeProp('text', props.timestamp, 'timestamp');
            this.setNodeHidden(!props.timestamp, 'timestamp');
        }
        if (props?.color !== undefined) {
            this._color = props.color;
            this._applyColor();
        }
        if (props?.dot !== undefined) {
            this._dot = props.dot;
            this._applyDot();
        }
    }

    private _applyColor(): void {
        this.removeCls(
            'q-timeline__item--primary q-timeline__item--success q-timeline__item--warning q-timeline__item--error'
        );
        if (this._color !== 'default') this.addCls(`q-timeline__item--${this._color}`);
    }

    private _applyDot(): void {
        if (this._dot) {
            this.setNodeProp('text', this._dot, 'dot');
            this.addCls('q-timeline__dot--custom', 'dot');
        } else {
            this.setNodeProp('text', '', 'dot');
            this.removeCls('q-timeline__dot--custom', 'dot');
        }
    }

    get title(): string {
        return this._title;
    }
    set title(v: string) {
        this._title = v;
        this.setNodeProp('text', v, 'title');
    }

    get description(): string {
        return this._description;
    }
    set description(v: string) {
        this._description = v;
        this.setNodeProp('text', v, 'desc');
        this.setNodeHidden(!v, 'desc');
    }

    get timestamp(): string {
        return this._timestamp;
    }
    set timestamp(v: string) {
        this._timestamp = v;
        this.setNodeProp('text', v, 'timestamp');
        this.setNodeHidden(!v, 'timestamp');
    }

    get color(): TimelineColor {
        return this._color;
    }
    set color(v: TimelineColor) {
        this._color = v;
        this._applyColor();
    }

    get dot(): string {
        return this._dot;
    }
    set dot(v: string) {
        this._dot = v;
        this._applyDot();
    }
}

TimelineItemComponent.useTemplate(TIMELINE_ITEM_TPL);
export { TimelineItemComponent };
/** 时间线项实例类型 */
export type TimelineItemComponentInstance = InstanceType<typeof TimelineItemComponent>;
