/**
 * FormComponent 表单组件
 *
 * 从 ItemGroupStaticComponent 派生，提供实体驱动的表单能力：
 * - 字段收集：自动收集有 getFormValue 方法的子组件
 * - 验证规则绑定：Form init 获取规则后直接设到字段 validation 属性
 * - 数据提交：收集全部表单值，发送实体 create/update 事件
 * - 编辑回填：发送实体 get 事件获取原始数据，自动回填字段
 * - 重置：恢复初始数据，清除错误
 *
 * 验证流程（去事件化）：
 *   Form init → 实体返回验证规则 → 直接设到字段 validation 属性
 *   字段值变更 → 字段自验证（_doValidate）→ 设置 error
 *   Form 提交前 → 遍历字段 getFormError() → 有错误则阻止提交
 *
 * 子组件需实现 getFormValue/setFormValue 方法，
 * CheckboxGroup 等多值组件可覆写方法自定义逻辑。
 *
 * @example
 * ```ts
 * const form = new FormComponent({
 *     entityKey: 'users',
 *     action: 'create',
 *     direction: 'vertical',
 *     gap: '16px',
 *     items: [
 *         { type: 'Input', fieldName: 'username', label: '用户名', required: true },
 *         { type: 'Input', fieldName: 'email', label: '邮箱', validation: true },
 *         { type: 'PasswordInput', fieldName: 'password', label: '密码' },
 *     ],
 * });
 *
 * form.on('submitSuccess', (data) => { ... });
 * form.on('submitError', (errors) => { ... });
 * ```
 */

import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';
import type { ItemGroupProps } from '../itemgroup/ItemGroupBaseComponent';
import { EntityEventBus, ENTITY_CRUD_EVENTS, ENTITY_LIST_EVENTS } from '@/events';
import { EventContextBuilder } from '@/context';

export type FormAction = 'create' | 'update';

export interface FormFieldConfig {
    name: string;
    label?: string;
    required?: boolean;
    defaultValue?: any;
    validation?: any;
}

export interface FormProps extends ItemGroupProps {
    entityKey?: string;
    action?: FormAction;
    fields?: FormFieldConfig[];
    editId?: string | number;
}

interface FieldEntry {
    name: string;
    component: any;
    config?: FormFieldConfig;
    defaultValue?: any;
}

const bus = EntityEventBus.getInstance();

class FormComponent extends ItemGroupStaticComponent {
    _entityKey: string = '';
    _action: FormAction = 'create';
    _fieldMap: Record<string, FieldEntry> = {};
    _fieldOrder: string[] = [];
    _initialData: Record<string, any> | null = null;
    _editId: string | number | null = null;
    _entityUnsubs: (() => void)[] = [];
    _submitting: boolean = false;

    onAfterInit(props?: FormProps): void {
        super.onAfterInit({
            direction: 'vertical',
            gap: '16px',
            cols: 1,
            ...props,
        });
        this.addCls('q-form');
        (this as any).itemContainer?.el?.classList.add('q-form__fields');

        this._entityKey = props?.entityKey ?? '';
        this._action = props?.action ?? 'create';
        this._editId = props?.editId ?? null;
        this.entityKey = this._entityKey;
        this.action = this._action;

        if (props?.fields) {
            this._fieldOrder = props.fields.map(f => f.name);
            for (const f of props.fields) {
                this._fieldMap[f.name] = {
                    name: f.name,
                    component: null,
                    config: f,
                    defaultValue: f.defaultValue,
                };
            }
        }

        this._collectFields();

        if (this._entityKey) {
            this._initEntityListeners();
            this._emitFormInit();
        }
    }

    onBeforeDispose(): void {
        for (const off of this._entityUnsubs) {
            if (typeof off === 'function') off();
        }
        this._entityUnsubs = [];
        super.onBeforeDispose();
    }

    _collectFields(): void {
        const items = this._items as any[];
        if (!items) return;

        for (const item of items) {
            const cmp = item.component;
            if (!cmp || typeof cmp.getFormValue !== 'function') continue;

            const fieldName = cmp._fieldName || cmp.fieldName || '';
            if (!fieldName) continue;

            if (this._fieldMap[fieldName]) {
                this._fieldMap[fieldName].component = cmp;
            } else {
                this._fieldMap[fieldName] = {
                    name: fieldName,
                    component: cmp,
                    defaultValue: undefined,
                };
                this._fieldOrder.push(fieldName);
            }
        }
    }

    _initEntityListeners(): void {
        const key = this._entityKey;

        const offCreated = bus.entityOn(key, ENTITY_CRUD_EVENTS.CREATED, (data: any) => {
            this._onSubmitResult(true, data);
        });
        this._entityUnsubs.push(offCreated);

        const offUpdated = bus.entityOn(key, ENTITY_CRUD_EVENTS.UPDATED, (data: any) => {
            this._onSubmitResult(true, data);
        });
        this._entityUnsubs.push(offUpdated);

        const offGot = bus.entityOn(key, ENTITY_LIST_EVENTS.GOT, (data: any) => {
            this._onEntityDataLoaded(data);
        });
        this._entityUnsubs.push(offGot);

        const offInit = bus.entityOn(key, 'form.init', (data: any) => {
            this._onFormInitResult(data);
        });
        this._entityUnsubs.push(offInit);
    }

    _emitFormInit(): void {
        const ctx = EventContextBuilder.create()
            .withEvent(`entity:${this._entityKey}:form.init`)
            .withType('form.init')
            .withSource(this._entityKey)
            .withSourceType('Form')
            .withData({
                action: this._action,
                fields: this._fieldOrder,
                editId: this._editId,
            })
            .withBusId(bus.getScopeId())
            .build();
        bus.entityEmit(ctx);
    }

    _onFormInitResult(data: any): void {
        if (!data) return;

        if (data.rules) {
            this._applyValidationRules(data.rules);
        }
        if (data.initialData) {
            this._initialData = data.initialData;
            this._fillFields(data.initialData);
        }
    }

    _applyValidationRules(rules: Record<string, any>): void {
        for (const [fieldName, rule] of Object.entries(rules)) {
            const entry = this._fieldMap[fieldName];
            if (entry?.component && typeof entry.component.validation !== 'undefined') {
                entry.component.validation = rule;
            }
        }
    }

    _onEntityDataLoaded(data: any): void {
        if (!data) return;
        this._initialData = data;
        this._fillFields(data);
    }

    _fillFields(data: Record<string, any>): void {
        for (const name of this._fieldOrder) {
            const entry = this._fieldMap[name];
            if (!entry?.component) continue;
            const value = data[name] ?? entry.defaultValue;
            if (value !== undefined && typeof entry.component.setFormValue === 'function') {
                entry.component.setFormValue(value);
            }
        }
    }

    _onSubmitResult(success: boolean, data: any): void {
        this._submitting = false;
        if (success) {
            this.emit('submitSuccess', data);
        } else {
            if (data?.errors) {
                this._applySubmitErrors(data.errors);
            }
            this.emit('submitError', data);
        }
    }

    _applySubmitErrors(errors: Array<{ fieldName?: string; message?: string }>): void {
        const errorMap: Record<string, string> = {};
        for (const err of errors) {
            if (err.fieldName) {
                errorMap[err.fieldName] = err.message || String(err);
            }
        }
        for (const name of this._fieldOrder) {
            const entry = this._fieldMap[name];
            if (!entry?.component) continue;
            const msg = errorMap[name] ?? '';
            if (msg) entry.component.error = msg;
        }
    }

    get values(): Record<string, any> {
        const result: Record<string, any> = {};
        for (const name of this._fieldOrder) {
            const entry = this._fieldMap[name];
            if (entry?.component && typeof entry.component.getFormValue === 'function') {
                result[name] = entry.component.getFormValue();
            }
        }
        return result;
    }

    get errors(): Record<string, string> {
        const result: Record<string, string> = {};
        for (const name of this._fieldOrder) {
            const entry = this._fieldMap[name];
            if (entry?.component && typeof entry.component.getFormError === 'function') {
                const err = entry.component.getFormError();
                if (err) result[name] = err;
            }
        }
        return result;
    }

    get isValid(): boolean {
        for (const name of this._fieldOrder) {
            const entry = this._fieldMap[name];
            if (entry?.component && typeof entry.component.getFormError === 'function') {
                if (entry.component.getFormError()) return false;
            }
        }
        return true;
    }

    validateAll(): boolean {
        for (const name of this._fieldOrder) {
            const entry = this._fieldMap[name];
            if (!entry?.component) continue;
            const cmp = entry.component;

            if (typeof cmp._doValidate === 'function') {
                cmp._doValidate();
            }
        }
        return this.isValid;
    }

    submit(): void {
        if (this._submitting) return;

        if (!this.validateAll()) {
            this.emit('submitError', { message: 'validation failed' });
            return;
        }

        this._submitting = true;
        const values = this.values;
        const action = this._action;

        const sCtx = EventContextBuilder.create()
            .withEvent(`entity:${this._entityKey}:form.${action}`)
            .withType(`form.${action}`)
            .withSource(this._entityKey)
            .withSourceType('Form')
            .withData({
                ...values,
                ...(this._editId != null ? { id: this._editId } : {}),
            })
            .withBusId(bus.getScopeId())
            .build();
        bus.entityEmit(sCtx);
    }

    load(data: Record<string, any>): void {
        this._initialData = data;
        this._fillFields(data);
    }

    reset(): void {
        const data = this._initialData ?? {};
        for (const name of this._fieldOrder) {
            const entry = this._fieldMap[name];
            if (!entry?.component) continue;
            const defaultValue = data[name] ?? entry.defaultValue;
            if (typeof entry.component.formReset === 'function') {
                entry.component.formReset(defaultValue);
            }
        }
    }

    onUpdated(props?: Record<string, any>): void {
        if (props?.action !== undefined) this._action = props.action;
        if (props?.editId !== undefined) this._editId = props.editId;
    }
}

FormComponent.register();
export { FormComponent };
export type FormComponentInstance = InstanceType<typeof FormComponent>;
