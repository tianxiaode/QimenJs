/**
 * OptionAbility — 组件选项能力
 *
 * 负责组件选项（option）变化时的响应式处理：
 * - text / hint / hidden / hiddenMode / disable 等选项变化时自动更新 DOM 或样式
 * - 提供 _cssPrefix getter 获取组件 CSS �@ 前缀
 */

import { HIDDEN_MODE_CSS_MAP, RADIUS_MAP } from '@/component-core/constants';
import { i18nTextRegistry } from '@/component-core/engine';
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
        this.disable
            ? this.addCls(`${this._cssPrefix}--disabled`)
            : this.removeCls(`${this._cssPrefix}--disabled`);
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
            this._setNodeAttr('root', 'title', String(value));
        } else {
            this.el?.removeAttribute('title');
            this._unregisterI18nNode('root', 'title');
        }
    },

    get _cssPrefix(): string {
        return `q-${this.type.toLowerCase()}`;
    },

    _toggleOptionCls(prefix: string, value: string, old: string, nodeName: string = 'root') {
        if (value) this.addCls(prefix + value, nodeName);
        if (old) this.removeCls(prefix + old, nodeName);
    },

    /** 将文本写入指定节点的 textContent，值以 `@` 开头时自动翻译并注册 i18n 刷新依赖 */
    _setNodeText(nodeName: string, text: string): void {
        const el = this.getNodeEl(nodeName);
        if (!el) return;
        (el as HTMLElement).textContent = resolveI18nValue(text ?? '');
        if (text && text.startsWith(I18N_PREFIX)) {
            this._registerI18nNode(nodeName, 'textContent', text);
        } else {
            this._unregisterI18nNode(nodeName, 'textContent');
        }
    },

    /** 向指定节点设置属性，值以 `@` 开头时自动翻译并注册 i18n 刷新依赖 */
    _setNodeAttr(nodeName: string, key: string, value: string): void {
        const el = this.getNodeEl(nodeName);
        if (!el) return;
        (el as HTMLElement).setAttribute(key, resolveI18nValue(value));
        if (value && value.startsWith(I18N_PREFIX)) {
            this._registerI18nNode(nodeName, key, value);
        } else {
            this._unregisterI18nNode(nodeName, key);
        }
    },

    _registerI18nNode(nodeName: string, prop: string, text: string): void {
        if (!this.abilityState('OptionAbility:i18nCleanupRegistered')) {
            this.setAbilityState('OptionAbility:i18nCleanupRegistered', true);
            this.onCleanup(() => i18nTextRegistry.unregisterAll(this));
        }
        i18nTextRegistry.register(this, nodeName, prop, text);
    },

    _unregisterI18nNode(nodeName: string, prop: string): void {
        i18nTextRegistry.unregister(this, nodeName, prop);
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
