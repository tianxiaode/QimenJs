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
import { EntityEventBus } from '@/events/EntityEventBus';
import { EventContextBuilder } from '@/context';
import { ENTITY_CRUD_EVENTS, ENTITY_LIST_EVENTS } from '@/events/entity-events';

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

export let FormComponent = ItemGroupStaticComponent.replace({
    type: 'Form',
    config: {
        direction: 'vertical',
        gap: '16px',
        cols: 1,
    },
    body: {
        nodes: {
            root: { addCls: 'q-form' },
            itemContainer: { addCls: 'q-form__fields' },
        },
        onInitState() {
            return {
                _entityKey: '' as string,
                _action: 'create' as FormAction,
                _fieldMap: {} as Record<string, FieldEntry>,
                _fieldOrder: [] as string[],
                _initialData: null as Record<string, any> | null,
                _editId: null as string | number | null,
                _entityUnsubs: [] as (() => void)[],
                _submitting: false,
            };
        },

        onAfterInit(props?: FormProps): void {
            const self = this as any;
            self._entityKey = props?.entityKey ?? '';
            self._action = props?.action ?? 'create';
            self._editId = props?.editId ?? null;

            if (props?.fields) {
                self._fieldOrder = props.fields.map(f => f.name);
                for (const f of props.fields) {
                    self._fieldMap[f.name] = {
                        name: f.name,
                        component: null,
                        config: f,
                        defaultValue: f.defaultValue,
                    };
                }
            }

            self._collectFields();

            if (self._entityKey) {
                self._initEntityListeners();
                self._emitFormInit(props);
            }
        },

        onBeforeDispose(): void {
            const self = this as any;
            for (const off of self._entityUnsubs) {
                if (typeof off === 'function') off();
            }
            self._entityUnsubs = [];
        },

        _collectFields(): void {
            const self = this as any;
            const items = self._items as any[];
            if (!items) return;

            for (const item of items) {
                const cmp = item.component;
                if (!cmp || typeof cmp.getFormValue !== 'function') continue;

                const fieldName = cmp._fieldName || cmp.fieldName || '';
                if (!fieldName) continue;

                if (self._fieldMap[fieldName]) {
                    self._fieldMap[fieldName].component = cmp;
                } else {
                    self._fieldMap[fieldName] = {
                        name: fieldName,
                        component: cmp,
                        defaultValue: undefined,
                    };
                    self._fieldOrder.push(fieldName);
                }
            }
        },

        _initEntityListeners(): void {
            const self = this as any;
            const key = self._entityKey;

            const offCreated = bus.entityOn(key, ENTITY_CRUD_EVENTS.CREATED, (data: any) => {
                self._onSubmitResult(true, data);
            });
            self._entityUnsubs.push(offCreated);

            const offUpdated = bus.entityOn(key, ENTITY_CRUD_EVENTS.UPDATED, (data: any) => {
                self._onSubmitResult(true, data);
            });
            self._entityUnsubs.push(offUpdated);

            const offGot = bus.entityOn(key, ENTITY_LIST_EVENTS.GOT, (data: any) => {
                self._onEntityDataLoaded(data);
            });
            self._entityUnsubs.push(offGot);

            const offInit = bus.entityOn(key, 'form.init', (data: any) => {
                self._onFormInitResult(data);
            });
            self._entityUnsubs.push(offInit);
        },

        _emitFormInit(props?: FormProps): void {
            const self = this as any;
            const ctx = EventContextBuilder.create()
                .withEvent(`entity:${self._entityKey}:form.init`)
                .withType('form.init')
                .withSource(self._entityKey)
                .withSourceType('Form')
                .withData({
                    action: self._action,
                    fields: self._fieldOrder,
                    editId: self._editId,
                })
                .withBusId(bus.getScopeId())
                .build();
            bus.entityEmit(ctx);
        },

        _onFormInitResult(data: any): void {
            const self = this as any;
            if (!data) return;

            if (data.rules) {
                self._applyValidationRules(data.rules);
            }
            if (data.initialData) {
                self._initialData = data.initialData;
                self._fillFields(data.initialData);
            }
        },

        _applyValidationRules(rules: Record<string, any>): void {
            const self = this as any;
            for (const [fieldName, rule] of Object.entries(rules)) {
                const entry = self._fieldMap[fieldName];
                if (entry?.component && typeof entry.component.validation !== 'undefined') {
                    entry.component.validation = rule;
                }
            }
        },

        _onEntityDataLoaded(data: any): void {
            const self = this as any;
            if (!data) return;
            self._initialData = data;
            self._fillFields(data);
        },

        _fillFields(data: Record<string, any>): void {
            const self = this as any;
            for (const name of self._fieldOrder) {
                const entry = self._fieldMap[name];
                if (!entry?.component) continue;
                const value = data[name] ?? entry.defaultValue;
                if (value !== undefined && typeof entry.component.setFormValue === 'function') {
                    entry.component.setFormValue(value);
                }
            }
        },

        _onSubmitResult(success: boolean, data: any): void {
            const self = this as any;
            self._submitting = false;
            if (success) {
                self.emit('submitSuccess', data);
            } else {
                if (data?.errors) {
                    self._applySubmitErrors(data.errors);
                }
                self.emit('submitError', data);
            }
        },

        _applySubmitErrors(errors: Array<{ fieldName?: string; message?: string }>): void {
            const self = this as any;
            const errorMap: Record<string, string> = {};
            for (const err of errors) {
                if (err.fieldName) {
                    errorMap[err.fieldName] = err.message || String(err);
                }
            }
            for (const name of self._fieldOrder) {
                const entry = self._fieldMap[name];
                if (!entry?.component) continue;
                const msg = errorMap[name] ?? '';
                if (msg) entry.component.error = msg;
            }
        },

        get entityKey(): string {
            const self = this as any;
            return self._entityKey;
        },

        get action(): FormAction {
            const self = this as any;
            return self._action;
        },
        set action(v: FormAction) {
            const self = this as any;
            self._action = v;
        },

        get values(): Record<string, any> {
            const self = this as any;
            const result: Record<string, any> = {};
            for (const name of self._fieldOrder) {
                const entry = self._fieldMap[name];
                if (entry?.component && typeof entry.component.getFormValue === 'function') {
                    result[name] = entry.component.getFormValue();
                }
            }
            return result;
        },

        get errors(): Record<string, string> {
            const self = this as any;
            const result: Record<string, string> = {};
            for (const name of self._fieldOrder) {
                const entry = self._fieldMap[name];
                if (entry?.component && typeof entry.component.getFormError === 'function') {
                    const err = entry.component.getFormError();
                    if (err) result[name] = err;
                }
            }
            return result;
        },

        get isValid(): boolean {
            const self = this as any;
            for (const name of self._fieldOrder) {
                const entry = self._fieldMap[name];
                if (entry?.component && typeof entry.component.getFormError === 'function') {
                    if (entry.component.getFormError()) return false;
                }
            }
            return true;
        },

        validateAll(): boolean {
            const self = this as any;
            for (const name of self._fieldOrder) {
                const entry = self._fieldMap[name];
                if (!entry?.component) continue;
                const cmp = entry.component;

                if (typeof cmp._doValidate === 'function') {
                    cmp._doValidate();
                }
            }
            return self.isValid;
        },

        submit(): void {
            const self = this as any;
            if (self._submitting) return;

            if (!self.validateAll()) {
                self.emit('submitError', { message: 'validation failed' });
                return;
            }

            self._submitting = true;
            const values = self.values;
            const action = self._action;

            const sCtx = EventContextBuilder.create()
                .withEvent(`entity:${self._entityKey}:form.${action}`)
                .withType(`form.${action}`)
                .withSource(self._entityKey)
                .withSourceType('Form')
                .withData({
                    ...values,
                    ...(self._editId != null ? { id: self._editId } : {}),
                })
                .withBusId(bus.getScopeId())
                .build();
            bus.entityEmit(sCtx);
        },

        load(data: Record<string, any>): void {
            const self = this as any;
            self._initialData = data;
            self._fillFields(data);
        },

        reset(): void {
            const self = this as any;
            const data = self._initialData ?? {};
            for (const name of self._fieldOrder) {
                const entry = self._fieldMap[name];
                if (!entry?.component) continue;
                const defaultValue = data[name] ?? entry.defaultValue;
                if (typeof entry.component.formReset === 'function') {
                    entry.component.formReset(defaultValue);
                }
            }
        },

        onUpdated(props?: Record<string, any>): void {
            const self = this as any;
            if (props?.action !== undefined) self._action = props.action;
            if (props?.editId !== undefined) self._editId = props.editId;
        },
    },
});

export type FormComponent = InstanceType<typeof FormComponent>;
