import { Component, type TemplateDecl, type DomEventsMap } from '@qimenjs/component-core';
import type { DemoConfig } from './types';

class FormDemoInteractive extends Component {
    get tpl(): TemplateDecl {
        return {
            tag: 'div',
            classes: 'q-demo__column',
            children: [
                {
                    type: 'form',
                    name: 'form',
                    options: {
                        direction: 'vertical',
                        gap: '16px',
                        cols: 1,
                        fields: [
                            { name: 'username', label: '用户名', required: true, defaultValue: '' },
                            { name: 'email', label: '邮箱', required: true, defaultValue: '' },
                            { name: 'age', label: '年龄', defaultValue: 18 },
                            { name: 'dept', label: '部门', defaultValue: '' },
                            { name: 'bio', label: '个人简介', defaultValue: '' },
                            { name: 'subscribe', label: '订阅通知', defaultValue: false },
                        ],
                    },
                },
                {
                    tag: 'div',
                    classes: 'q-demo__row',
                    children: [
                        { type: 'button', name: 'submitBtn', options: { text: '提交', color: 'primary' } },
                        { type: 'button', name: 'resetBtn', options: { text: '重置' } },
                        { type: 'button', name: 'validateBtn', options: { text: '验证' } },
                    ],
                },
                {
                    tag: 'div',
                    name: 'result',
                    classes: 'q-demo__form-result',
                },
            ],
        };
    }

    domEvents: DomEventsMap = {
        click: [
            { path: 'submitBtn', handler: '_onSubmit' },
            { path: 'resetBtn', handler: '_onReset' },
            { path: 'validateBtn', handler: '_onValidate' },
        ],
    };

    _onSubmit(): void {
        const form = this.getComponent('form');
        if (!form) return;
        const valid = form.validateAll();
        if (valid) {
            const values = form.values;
            this._showResult('提交成功', JSON.stringify(values, null, 2));
        } else {
            const errors = form.errors;
            this._showResult('验证失败', JSON.stringify(errors, null, 2));
        }
    }

    _onReset(): void {
        const form = this.getComponent('form');
        if (!form) return;
        form.reset();
        this._showResult('已重置', '');
    }

    _onValidate(): void {
        const form = this.getComponent('form');
        if (!form) return;
        const valid = form.validateAll();
        this._showResult(valid ? '验证通过' : '验证失败', valid ? '所有字段验证通过' : '存在验证错误');
    }

    _showResult(title: string, detail: string): void {
        const el = this.getNodeEl('result');
        if (!el) return;
        el.innerHTML = `<div class="q-demo__form-result-title">${title}</div>${detail ? `<pre class="q-demo__form-result-detail">${detail}</pre>` : ''}`;
    }
}

export const FORM_DEMO: DemoConfig = {
    title: 'Form',
    description: '表单容器组件，支持字段配置、验证、提交、重置、数据回填，与 EntityManager 集成',
    sections: [
        {
            label: '综合表单（字段配置 + 验证 + 提交）',
            code: `const form = new FormComponent({
    direction: 'vertical',
    gap: '16px',
    fields: [
        { name: 'username', label: '用户名', required: true },
        { name: 'email', label: '邮箱', required: true },
        { name: 'age', label: '年龄', defaultValue: 18 },
        { name: 'dept', label: '部门' },
        { name: 'bio', label: '个人简介' },
        { name: 'subscribe', label: '订阅通知', defaultValue: false },
    ],
});

// form.values — 收集所有字段值
// form.errors — 收集所有字段错误
// form.validateAll() — 验证所有字段
// form.submit() — 验证后提交
// form.reset() — 重置所有字段
// form.load(data) — 回填数据`,
            component: FormDemoInteractive,
        },
        {
            label: 'FormField 基础（label/required/labelPosition）',
            code: `{ type: 'formfield', options: { label: '字段名', labelPosition: 'top' } }
{ type: 'formfield', options: { label: '字段名', labelPosition: 'left' } }
{ type: 'formfield', options: { label: '必填', required: true } }`,
            template: {
                tag: 'div',
                style: { display: 'flex', flexDirection: 'column', gap: '12px' },
                children: [
                    { type: 'formfield', options: { label: '字段名', labelPosition: 'top' } },
                    { type: 'formfield', options: { label: '字段名', labelPosition: 'left' } },
                    { type: 'formfield', options: { label: '必填', required: true } },
                ],
            },
        },
    ],
};
