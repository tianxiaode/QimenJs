/**
 * BaseCellComponent 基础单元格组件
 *
 * 所有单元格的基类，提供：
 * - 对齐（align）属性，编译时通过 initConfig 传入
 * - content 占位节点，子类通过 tplReplaces 替换为各自结构
 * - update() 基础契约（子类直接覆盖，不走继承链）
 *
 * 子类派生方式：
 *   TextCell     = BaseCell.replace({ type, body })           — 保持 content，加 format
 *   TreeCell     = BaseCell.replace({ type, tplReplaces, body }) — 替换 content 为 toggle+indent+text
 *   CheckboxCell = BaseCell.replace({ type, tplReplaces, body }) — 替换 content 为 checkbox
 *   ActionCell   = BaseCell.replace({ type, tplReplaces, body }) — 替换 content 为 ButtonGroup
 *
 * update() 不在 DEFAULT_OVERRIDES 中，子类定义会直接覆盖原型方法。
 * onInitState / onAfterInit 在 DEFAULT_OVERRIDES 中会链式调用。
 *
 * @example
 * ```ts
 * // 不直接使用 BaseCell，通过子类：
 * const cell = new TextCellComponent({ align: 'right', format: 'currency' });
 * cell.update({ value: 12345.67 });
 * ```
 */

import { Component } from '@qimenjs/component-core';
import type { ColumnAlign } from '../column-types';

export interface BaseCellProps {
    align?: ColumnAlign;
}

export let BaseCellComponent = Component.withTemplate({
    tpl: {
        tag: 'div',
        cls: 'q-cell',
        children: [{ tag: 'span', name: 'content', cls: 'q-cell__text' }],
    },
    body: {
        type: 'BaseCell',

        onInitState() {
            return {
                _align: 'left' as ColumnAlign,
            };
        },

        onAfterInit(props?: BaseCellProps): void {
            if (props?.align) this._align = props.align;
            this._applyAlign();
        },

        get align(): ColumnAlign {
            return this._align;
        },
        set align(v: ColumnAlign) {
            this._align = v;
            this._applyAlign();
        },

        _applyAlign(): void {
            this.el.style.textAlign = this._align;
            this.el.classList.toggle('q-cell--left', this._align === 'left');
            this.el.classList.toggle('q-cell--center', this._align === 'center');
            this.el.classList.toggle('q-cell--right', this._align === 'right');
        },

        update(data: any): void {
            if (data?.value !== undefined) {
                this.setNodeProp('text', String(data.value ?? ''), 'content');
            }
        },
    },
});

export type BaseCellComponent = InstanceType<typeof BaseCellComponent>;
