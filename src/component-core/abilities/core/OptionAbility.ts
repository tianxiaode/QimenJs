/**
 * OptionAbility — 组件选项能力
 *
 * 负责组件选项（option）变化时的响应式处理：
 * - text / hint / hidden / hiddenMode / disable 等选项变化时自动更新 DOM 或样式
 * - 提供合成 disable、size 等状态样式类的方法 _composeStateCls
 */

import { HIDDEN_MODE_CSS_MAP } from '@/component-core/constants';
import { TARGET_TO_OPTION_MAP, type AbilityDefinition } from '@/composable';
import { t } from '@/i18n';

/** 组件选项能力，选项变化时自动同步到 DOM / 样式 */
export const OptionAbility: AbilityDefinition = {
    _onStyleOptionChange(value: any, _old: any) {
        if (!value) return; // 无值时不处理
        this.setStyles(value);
    },

    _onAttributeOptionChange(value: any, _old: any) {
        if (!value) return; // 无值时不处理
        this.setAttributes(value);
    },

    _onHiddenOptionChange(_vlaue: any, _old: any) {
        this._applyHidden(); // 更新隐藏状态
    },

    _onHiddenModeOptionChange(_value: any, _old: any) {
        this._applyHidden(); // 更新隐藏状态
    },

    _applyHidden() {
        const hidden = this.hidden;
        const cls = (HIDDEN_MODE_CSS_MAP as any)[this.hiddenMode];
        hidden ? this.addCls(cls) : this.removeCls(cls);
    },

    _onDisableOptionChange(_value: any, _old: any) {
        const cls = this._composeStateCls('disabled');
        this.disable ? this.addCls(cls) : this.removeCls(cls);
    },

    _onHintOptionChange(_value: any, _old: any) {
        this._applyContentToElement('hint');
        return;
    },

    _applyContentToElement(key: string): void {
        let text = String(this.getData(key));
        if (!text) return;
        const def = this.getTargetToDef(key);
        if (!def) {
            this.logger.warn(`${key} def not found`, key, this);
            return;
        }
        const target = def.target ?? 'root';
        const el = this.getNodeEl(target);
        if (!el) {
            this.logger.warn(` ${target} el not found`, this);
            return;
        }
        if (text.startsWith('@') && !text.startsWith('@@')) {
            text = t(text.slice(1)); // 去除 @ 符号
        }
        const toMap = TARGET_TO_OPTION_MAP as any;
        const to = def.to; // 目标属性，如 'textContent'、'src'、'innerHTML' 等
        if (to && to in toMap) {
            el[toMap[to]] = text;
        }
    },

    /**
     * 合成 disable、size 等状态样式
     *
     * 格式：`q-{type-}{key}`，有 value 时追加 `--{value}`。
     *
     * @example
     * _composeStateCls('disabled')                    // 'q-button-disabled'
     * _composeStateCls('disabled', '', false)         // 'q-disabled'
     * _composeStateCls('size', 'md', false)           // 'q-size--md'
     * _composeStateCls('size', 'lg', false)           // 'q-size--lg'
     *
     * @param key - 选项名，如 'disabled'、'size'
     * @param value - 选项值，如尺寸 'md'/'lg'，无值时不拼接
     * @param useType - 是否包含组件类型前缀，默认 true
     * @returns 合成后的样式类名
     */
    _composeStateCls(key: string, value?: string, useType: boolean = true): string {
        let cls = 'q';
        if (useType) cls += '-' + this.type.toLowerCase();
        if (key) cls += `-${key}`;
        if (value) cls += `--${value}`;
        return cls;
    },

    _applyNewCls(cls: string, oldCls?: string) {
        if (oldCls) this.removeCls(oldCls); // 移除旧样式类
        this.addCls(cls);
    },

    _applyOptions(options?: Record<string, any>) {
        if (!options) return;
        const optionsKeys: Map<string, any> = this.optionsKeys;
        const propertyKeys: Map<string, any> = this.propertyKeys;
        for (const [key, value] of Object.entries(options)) {
            if (key === 'id') continue;
            if (optionsKeys.has(key)) {
                this.setData(key, value);
            } else if (propertyKeys.has(key)) {
                this[key] = value;
            }
        }
    },
} satisfies AbilityDefinition;
