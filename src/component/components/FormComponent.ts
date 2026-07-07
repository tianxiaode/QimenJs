/**
 * FormComponent 表单组件
 *
 * abilities: [EntityAbility, ValidateAbility, SubmitAbility, FieldSetAbility]
 * 支持验证、提交、字段收集
 */

import { ComponentBase } from '../ComponentBase';
import { EntityAbility } from '../abilities/EntityAbility';
import { ValidateAbility } from '../abilities/ValidateAbility';
import { SubmitAbility } from '../abilities/SubmitAbility';
import { FieldSetAbility } from '../abilities/FieldSetAbility';

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
}
