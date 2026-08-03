/**
 * ListItemComponent 列表项组件
 *
 * 单个列表项，由 ListComponent 池化管理。
 * status 驱动标记颜色，markForm 驱动标记形状（dot/dash/ring），
 * 均为 CSS class 切换，池化时动态赋值。
 *
 * 模板节点：
 * - mark    — 状态标记（::before 渲染，由 status + markForm 驱动 cls）
 * - content — 内容容器
 * - label   — 主文本
 * - desc    — 描述（可选）
 */

import { Component } from '@qimenjs/component-core';
import { LIST_ITEM_TPL } from './list-item-tpl';

export type ListStatus = 'default' | 'primary' | 'success' | 'warning' | 'error';
export type MarkForm = 'dot' | 'dash' | 'ring';

export interface ListItemProps {
    label?: string;
    description?: string;
    status?: ListStatus;
    markForm?: MarkForm;
}

const STATUS_CLASSES: Record<ListStatus, string> = {
    default: '',
    primary: 'q-list__item--primary',
    success: 'q-list__item--success',
    warning: 'q-list__item--warning',
    error: 'q-list__item--error',
};

const MARK_FORM_CLASSES: Record<MarkForm, string> = {
    dot: 'q-list__mark--dot',
    dash: 'q-list__mark--dash',
    ring: 'q-list__mark--ring',
};

class ListItemComponent extends Component {
    _label: string = '';
    _description: string = '';
    _status: ListStatus = 'default';
    _markForm: MarkForm = 'dot';

    onAfterInit(props?: ListItemProps): void {
        this.update(props);
    }

    update(props?: Partial<ListItemProps>): void {
        if (props?.label !== undefined) {
            this._label = props.label;
            this.setNodeProp('text', props.label, 'label');
        }
        if (props?.description !== undefined) {
            this._description = props.description;
            this.setNodeProp('text', props.description, 'desc');
            this.setNodeHidden(!props.description, 'desc');
        }
        if (props?.status !== undefined) {
            this._status = props.status;
            this._applyStatus();
        }
        if (props?.markForm !== undefined) {
            this._markForm = props.markForm;
            this._applyMarkForm();
        }
    }

    private _applyStatus(): void {
        const allStatusCls = Object.values(STATUS_CLASSES).filter(Boolean).join(' ');
        this.removeCls(allStatusCls);
        const cls = STATUS_CLASSES[this._status];
        if (cls) this.addCls(cls);
    }

    private _applyMarkForm(): void {
        const allFormCls = Object.values(MARK_FORM_CLASSES).join(' ');
        this.removeCls(allFormCls);
        this.addCls(MARK_FORM_CLASSES[this._markForm]);
    }

    get label(): string {
        return this._label;
    }
    set label(v: string) {
        this._label = v;
        this.setNodeProp('text', v, 'label');
    }

    get description(): string {
        return this._description;
    }
    set description(v: string) {
        this._description = v;
        this.setNodeProp('text', v, 'desc');
        this.setNodeHidden(!v, 'desc');
    }

    get status(): ListStatus {
        return this._status;
    }
    set status(v: ListStatus) {
        this._status = v;
        this._applyStatus();
    }

    get markForm(): MarkForm {
        return this._markForm;
    }
    set markForm(v: MarkForm) {
        this._markForm = v;
        this._applyMarkForm();
    }
}

ListItemComponent.useTemplate(LIST_ITEM_TPL);
ListItemComponent.register();
export { ListItemComponent };
export type ListItemComponentInstance = InstanceType<typeof ListItemComponent>;
