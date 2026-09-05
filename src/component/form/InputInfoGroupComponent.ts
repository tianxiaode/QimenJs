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
import { TextComponent } from '../text/TextComponent';
import './inputinfogroup.css';

const ERROR_ORDER = 0;
const HELP_ORDER = 10;

class InputInfoGroupComponent extends ItemGroupStaticComponent {
    _errorItem: any = null;
    _helpItem: any = null;

    onAfterInit(props?: any): void {
        super.onAfterInit({
            direction: 'vertical',
            gap: '2px',
            ...props,
        });
        this.addCls('q-input__info');
    }

    addError(text: string): any {
        if (this._errorItem) {
            this._errorItem.component.update({ text });
            return this._errorItem.component;
        }
        const component = this.add({
            type: TextComponent,
            cls: 'q-input__error',
            text,
            role: 'alert',
            order: ERROR_ORDER,
        });
        this._errorItem = this._items[this._items.length - 1] ?? null;
        return component;
    }

    removeError(): void {
        if (!this._errorItem) return;
        const idx = this._items.indexOf(this._errorItem);
        if (idx >= 0) this.removeAt(idx);
        this._errorItem = null;
    }

    get errorText(): string {
        return this._errorItem?.component?.text ?? '';
    }

    addHelp(text: string): any {
        if (this._helpItem) {
            this._helpItem.component.update({ text });
            return this._helpItem.component;
        }
        const component = this.add({
            type: TextComponent,
            cls: 'q-input__help',
            text,
            order: HELP_ORDER,
        });
        this._helpItem = this._items[this._items.length - 1] ?? null;
        return component;
    }

    removeHelp(): void {
        if (!this._helpItem) return;
        const idx = this._items.indexOf(this._helpItem);
        if (idx >= 0) this.removeAt(idx);
        this._helpItem = null;
    }

    addInfo(data: Record<string, any>): any {
        return this.add(data);
    }

    removeInfo(index: number): any {
        return this.removeAt(index);
    }
}

export { InputInfoGroupComponent };
export type InputInfoGroupComponentInstance = InstanceType<typeof InputInfoGroupComponent>;
