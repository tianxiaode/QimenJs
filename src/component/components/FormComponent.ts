/**
 * FormComponent 表单组件
 *
 * abilities: [EntityAbility, ValidateAbility, SubmitAbility, FieldSetAbility]
 * 支持验证、提交、字段收集、事件桥接（基类已包含 EventBridgeAbility）
 */

import { ComponentBase } from '@qimenjs/component-core';
import { EntityAbility } from '@qimenjs/component-abilities';
import { ValidateAbility } from '@qimenjs/component-abilities';
import { SubmitAbility } from '@qimenjs/component-abilities';
import { FieldSetAbility } from '@qimenjs/component-abilities';

export class FormComponent extends ComponentBase {
    static override readonly abilities = [EntityAbility, ValidateAbility, SubmitAbility, FieldSetAbility];

    constructor(props?: Record<string, any>) {
        super(props);

        this.el = document.createElement('form');
        this.el.className = 'q-form';

        // 阻止默认表单提交
        this.el.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submit();
        });
    }

    // ============================================
    // 事件桥接默认处理方法
    // ============================================

    onSave(e: any): void {
        this.submit();
        this.emit?.('form:save', e);
    }

    onCreate(e: any): void {
        this.emit?.('form:create', e);
    }

    onEdit(e: any): void {
        this.emit?.('form:edit', e);
    }

    onDelete(e: any): void {
        this.emit?.('form:delete', e);
    }

    onRefresh(e: any): void {
        if (this.mgr && typeof this.mgr.reload === 'function') {
            this.mgr.reload();
        }
        this.emit?.('form:refresh', e);
    }
}
