/**
 * HeaderComponent — 表头基础组件
 *
 * 内置表头操作逻辑，不绑定模板。由引擎根据列配置编译模板后，
 * 通过 `class XxxHeader extends HeaderComponent {}` + `XxxHeader.useTemplate(tpl)` 完成绑定。
 *
 * @example
 * ```ts
 * const tpl = { tag: 'div', cls: 'q-table-header', children: [] };
 * const HeaderClass = class extends HeaderComponent {
 *     _headerConfigs = configs;
 *     _headerDepth = depth;
 * };
 * HeaderClass.useTemplate(tpl);
 * const header = new HeaderClass();
 * ```
 */

import { Component } from '../../../component-core/Component';
import type { HeaderCellConfigOrGroup } from '../column-types';
import './header.css';

export class HeaderComponent extends Component {
    _headerConfigs: HeaderCellConfigOrGroup[] = [];
    _headerDepth: number = 1;

    onAfterInit(): void {
        this._createHeaderCells();
    }

    /**
     * 创建表头单元格，由 TableEngine._renderHeaderCells 实现
     */
    _createHeaderCells(): void {
        const container = this.el;
        if (!container) return;
        const { TableEngine } = require('../engine/TableEngine');
        TableEngine._renderHeaderCells(this._headerConfigs, container, this);
    }
}
