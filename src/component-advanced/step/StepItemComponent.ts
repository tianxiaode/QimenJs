/**
 * StepItemComponent 步骤项组件
 *
 * 单个步骤项，由 StepComponent 池化管理。
 *
 * 模板节点：
 * - head    — 头部容器（circle + tail）
 * - circle  — 圆圈/图标
 * - number  — 序号（无 icon 时显示）
 * - tail    — 连接线（CSS :last-child 隐藏最后一个）
 * - body    — 内容容器
 * - title   — 标题
 * - desc    — 描述（可选）
 *
 * 状态类（由父组件设置）：
 * - .q-step__item--wait    — 等待
 * - .q-step__item--process — 进行中
 * - .q-step__item--finish  — 已完成
 * - .q-step__item--error   — 错误
 */

import { Component } from '@qimenjs/component-core';
import { STEP_ITEM_TPL } from './step-item-tpl';

/** 步骤状态类型 */
export type StepStatus = 'wait' | 'process' | 'finish' | 'error';

/** 步骤项属性接口 */
export interface StepItemProps {
    title?: string;
    description?: string;
    icon?: string;
    status?: StepStatus;
    /** 步骤索引（由父组件设置，用于计算状态） */
    index?: number;
}

class StepItemComponent extends Component {
    _title: string = '';
    _description: string = '';
    _icon: string = '';
    _status: StepStatus = 'wait';
    _index: number = 0;

    onAfterInit(props?: StepItemProps): void {
        this.update(props);
    }

    /**
     * 更新步骤项数据
     */
    update(props?: Partial<StepItemProps>): void {
        if (props?.title !== undefined) {
            this._title = props.title;
            this.text = props.title;
        }
        if (props?.description !== undefined) {
            this._description = props.description;
            this.setNodeProp('text', props.description, 'desc');
            this.setNodeHidden(!props.description, 'desc');
        }
        if (props?.icon !== undefined) {
            this._icon = props.icon;
            this._applyIcon();
        }
        if (props?.status !== undefined) {
            this._status = props.status;
            this._applyStatus();
        }
        if (props?.index !== undefined) {
            this._index = props.index;
        }
    }

    /**
     * 根据当前索引和激活索引计算状态
     * 由父组件调用，自动判断 wait/process/finish
     */
    setActiveIndex(index: number, activeIndex: number): void {
        this._index = index;
        if (index < activeIndex) {
            this.status = 'finish';
        } else if (index === activeIndex) {
            this.status = 'process';
        } else {
            this.status = 'wait';
        }
    }

    /**
     * 设置错误状态（独立于 activeIndex 计算）
     */
    setError(): void {
        this.status = 'error';
    }

    private _applyIcon(): void {
        if (this._icon) {
            this.setNodeProp('text', this._icon, 'circle');
            this.setNodeHidden(true, 'number');
        } else {
            this.setNodeProp('text', String(this._index + 1), 'number');
            this.setNodeHidden(false, 'number');
        }
    }

    private _applyStatus(): void {
        this.removeCls(
            'q-step__item--wait q-step__item--process q-step__item--finish q-step__item--error'
        );
        this.addCls(`q-step__item--${this._status}`);
    }

    get title(): string {
        return this._title;
    }
    set title(v: string) {
        this._title = v;
        this.text = v;
    }

    get description(): string {
        return this._description;
    }
    set description(v: string) {
        this._description = v;
        this.setNodeProp('text', v, 'desc');
        this.setNodeHidden(!v, 'desc');
    }

    get icon(): string {
        return this._icon;
    }
    set icon(v: string) {
        this._icon = v;
        this._applyIcon();
    }

    get status(): StepStatus {
        return this._status;
    }
    set status(v: StepStatus) {
        this._status = v;
        this._applyStatus();
    }

    get index(): number {
        return this._index;
    }
    set index(v: number) {
        this._index = v;
    }

    /**
     * 默认事件数据（包含步骤索引和状态）
     */
    get defaultEventData(): Record<string, any> {
        return {
            ...super.defaultEventData,
            index: this._index,
            status: this._status,
        };
    }
}

StepItemComponent.useTemplate(STEP_ITEM_TPL);
export { StepItemComponent };
/** 步骤项实例类型 */
export type StepItemComponentInstance = InstanceType<typeof StepItemComponent>;
