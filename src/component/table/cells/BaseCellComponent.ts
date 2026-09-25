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
import type { TemplateDecl } from '@qimenjs/component-core';
import { Definitions } from '@/composable';
import { BASE_CELL_TPL } from './base-cell-tpl';

const BaseCellComponentDefs: Definitions = {
    options: {
        align: 'left',
        colName: '',
        fixed: null,
        value: null,
    },
} as const;

class BaseCellComponent extends Component {
    get tpl(): TemplateDecl {
        return BASE_CELL_TPL;
    }

    _onAlignOptionChange(_value: string): void {
        this.setStyles({ textAlign: this.align });
        this.toggleCls('q-cell--left', this.align === 'left');
        this.toggleCls('q-cell--center', this.align === 'center');
        this.toggleCls('q-cell--right', this.align === 'right');
    }

    _onFixedOptionChange(_value: string): void {
        if (this.fixed === 'left') {
            this.setStyles({ position: 'sticky', left: '0', zIndex: '1' });
        } else if (this.fixed === 'right') {
            this.setStyles({ position: 'sticky', right: '0', zIndex: '1' });
        } else {
            this.setStyles({ position: '', left: '', right: '', zIndex: '' });
        }
    }

    _onValueOptionChange(value: any): void {
        this.setNodeText(String(value ?? ''), 'content');
    }
}

BaseCellComponent.define(BaseCellComponentDefs);

export { BaseCellComponent };
