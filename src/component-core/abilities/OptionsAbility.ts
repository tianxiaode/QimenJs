import type { AbilityDefinition } from '@/composable';
import { IComponentBase } from '../types';
import { string } from '@/utils';

export const OptionsAbility: AbilityDefinition = {
    /**
     * 获取选项值
     */
    getOption(name: string) {
        return this._options[name];
    },

    /**
     * 设置选项值
     */
    setOption(name: string, value: any) {
        this._options[name] = value;
    },

    get parent(): IComponentBase {
        return this._options['parent'];
    },

    get slotName(): string {
        return this._options['slotName'];
    },

    get container(): HTMLElement {
        return this._options['container'];
    },

    /**
     * 应用单个选项
     */
    _applyOption(key: string, value: any) {
        // 1. 如果有同名属性，直接赋值
        if (key in this) {
            this[key] = value;
            return;
        }

        // 2. 如果有 setXxx 方法，调用
        const setter = `set${string.capitalize(key)}`;
        if (typeof this[setter] === 'function') {
            this[setter](value);
            return;
        }

        // 3. 否则存到 _options 备用
        this._options[key] = value;
    },

    /**
     * 应用所有核心选项（初始化时调用）
     */
    _applyCoreOptions() {
        const optionsKeys = this.optionsKeys;
        for (const key of optionsKeys) {
            if (typeof this[key] !== 'undefined') {
                this[key] = this.getOption(key);
                continue;
            }
            if (typeof this[`set${string.capitalize(key)}`] == 'function') {
                this[`set${string.capitalize(key)}`](this.getOption(key));
            }
        }
    },
} as AbilityDefinition;
