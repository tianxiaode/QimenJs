/**
 * InputInfoGroupComponent 输入框信息区域组件
 *
 * 从 ItemGroupStaticComponent 派生，内置 error/help 便捷方法，
 * 同时保留 addInfo/removeInfo 供派生组件扩展。
 *
 * 内置项（通过 order 控制排序）：
 * - error  (order: 0) — 错误信息
 * - help   (order: 10) — 帮助信息
 *
 * 扩展项通过 addInfo/removeInfo 管理，order 可选。
 *
 * @example
 * ```ts
 * infoGroup.addError('用户名已存在');
 * infoGroup.removeError();
 * infoGroup.addHelp('请输入3-20个字符');
 * infoGroup.addInfo({ type: 'PasswordStrength', order: 5 });
 * ```
 */

import { ItemGroupStaticComponent } from '../itemgroup/ItemGroupStaticComponent';

const ERROR_ORDER = 0;
const HELP_ORDER = 10;

export let InputInfoGroupComponent = ItemGroupStaticComponent.replace({
    type: 'InputInfoGroup',

    body: {
        nodes: {
            root: { addCls: 'q-input__info' },
        },

        onInitState() {
            const self = this as any;
            const state = self._super.onInitState();
            return {
                ...state,
                _errorItem: null as any,
                _helpItem: null as any,
            };
        },

        onAfterInit(props?: any): void {
            const self = this as any;
            self._super.onAfterInit(props);
            if (props?.direction === undefined) self.direction = 'vertical';
            if (props?.gap === undefined) self.gap = '2px';
        },

        addError(text: string): any {
            const self = this as any;
            if (self._errorItem) {
                self._errorItem.component.update({ text });
                return self._errorItem.component;
            }
            const component = self.add({
                type: 'Text',
                cls: 'q-input__error',
                text,
                role: 'alert',
                order: ERROR_ORDER,
            });
            self._errorItem = self._items[self._items.length - 1] ?? null;
            return component;
        },

        removeError(): void {
            const self = this as any;
            if (!self._errorItem) return;
            const idx = self._items.indexOf(self._errorItem);
            if (idx >= 0) self.removeAt(idx);
            self._errorItem = null;
        },

        get errorText(): string {
            const self = this as any;
            return self._errorItem?.component?.text ?? '';
        },

        addHelp(text: string): any {
            const self = this as any;
            if (self._helpItem) {
                self._helpItem.component.update({ text });
                return self._helpItem.component;
            }
            const component = self.add({
                type: 'Text',
                cls: 'q-input__help',
                text,
                order: HELP_ORDER,
            });
            self._helpItem = self._items[self._items.length - 1] ?? null;
            return component;
        },

        removeHelp(): void {
            const self = this as any;
            if (!self._helpItem) return;
            const idx = self._items.indexOf(self._helpItem);
            if (idx >= 0) self.removeAt(idx);
            self._helpItem = null;
        },

        addInfo(data: Record<string, any>): any {
            const self = this as any;
            return self.add(data);
        },

        removeInfo(index: number): any {
            const self = this as any;
            return self.removeAt(index);
        },
    },
});

export type InputInfoGroupComponent = InstanceType<typeof InputInfoGroupComponent>;
