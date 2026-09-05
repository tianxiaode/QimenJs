/**
 * OptionAbility — 组件选项能力
 *
 * 负责组件选项（option）变化时的响应式处理：
 * - text / hint / hidden / hiddenMode / disable 等选项变化时自动更新 DOM 或样式
 * - 提供合成 disable、size 等状态样式类的方法 _composeStateCls
 */

import { GLOBAL_STYLE_KEYS, HIDDEN_MODE_CSS_MAP, RADIUS_MAP } from '@/component-core/constants';
import { type AbilityDefinition } from '@/composable';
import { I18N_PREFIX, resolveI18nValue } from '@/i18n';

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
        const cls = this._composeStateCls(null, 'disabled');
        this.disable ? this.addCls(cls) : this.removeCls(cls);
    },

    _onRadiusOptionChange(value: any, _old: any) {
        if (!value) {
            this.el?.style.removeProperty('border-radius');
            return;
        }
        const resolved = RADIUS_MAP[value] ?? value;
        this.el?.style.setProperty('border-radius', resolved);
    },

    _onHintOptionChange(value: any, _old: any) {
        if (value) {
            this.el?.setAttribute('title', resolveI18nValue(String(value)));
        } else {
            this.el?.removeAttribute('title');
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
        let cls = useType ? `q-${this.type.toLowerCase()}` : 'q-';
        if (key) cls += `${key}`;
        if (value) cls += `--${value}`;
        return cls;
    },

    _toggleOptionCls(prefix: string, value: string, old: string, nodeName: string = 'root') {
        if (value) this.addCls(prefix + value, nodeName);
        if (old) this.removeCls(prefix + old, nodeName);
    },

    /**
     * 组合样式类名：白名单内走全局原子化层 `q-{key}--{value}`，否则走组件 BEM 层 `q-{type}--{value}`
     *
     * @param key - 选项名（如 size/shape 走全局，disabled/color 走组件）
     * @param value - 组合值（如 md/circle/primary）
     */
    _composeStyleCls(key: string, value: string): string {
        return GLOBAL_STYLE_KEYS.has(key)
            ? `q-${key}--${value}`
            : `q-${this.type.toLowerCase()}--${value}`;
    },

    /** 将文本写入指定节点的 textContent，值以 `i18n:` 开头时自动翻译并注册 i18n 刷新依赖 */
    _setNodeText(nodeName: string, text: string): void {
        const el = this.getNodeEl(nodeName);
        if (!el) return;
        (el as HTMLElement).textContent = resolveI18nValue(text ?? '');
        if (text && text.startsWith(I18N_PREFIX)) {
            this._i18nTextNodes.set(nodeName, text);
        } else {
            this._i18nTextNodes.delete(nodeName);
        }
    },

    get _i18nTextNodes(): Map<string, string> {
        return this.abilityState('OptionAbility:i18nTextNodes', () => new Map());
    },

    /** 向指定节点设置属性 */
    _setNodeAttr(nodeName: string, key: string, value: string): void {
        const el = this.getNodeEl(nodeName);
        if (el) (el as HTMLElement).setAttribute(key, value);
    },

    /** 将 HTML 写入指定节点的 innerHTML */
    _setNodeHtml(nodeName: string, html: string): void {
        const el = this.getNodeEl(nodeName);
        if (el) (el as HTMLElement).innerHTML = html ?? '';
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
