import type { AbilityDefinition } from '@/composable';
import { I18nOptions } from '../../types';
import { t } from '@/i18n';
import { SYSTEM_EVENTS } from '@/events';
import { object } from '@/utils';

export const I18nAbility: AbilityDefinition = {
    /**
     * 获取i18n配置
     * @param nodeName 节点名称
     * @returns i18n配置
     */
    getI18n(nodeName: string): I18nOptions | undefined {
        const nodeMeta = this.getNode(nodeName);
        const original = nodeMeta.i18n;
        const dirty = this._dirtyI18n;
        if (dirty && dirty[nodeName]) {
            return { ...original, ...dirty[nodeName] };
        }
        return { ...original };
    },

    /**
     * 设置i18n配置
     * @param nodeName 节点名称
     * @param i18n i18n配置
     */
    setI18n(i18ns: Record<string, I18nOptions>): void {
        object.deepMerge(this._i18n || {}, i18ns);
    },

    setNodeI18n(nodeName: string, i18n: I18nOptions): void {
        const old = this.getI18n(nodeName);
        const newI18n = { ...old, ...i18n };
        this._i18n[nodeName] = newI18n;
    },

    /**
     * 刷新i18n配置
     */
    _flushI18n(): void {
        for (const [nodeName, i18n] of Object.entries(this._i18n || {})) {
            const isComponent = this.isComponent(nodeName);

            if (!isComponent) {
                this._applyI18nToElement(nodeName, i18n);
            } else {
                this._applyI18nToComponent(nodeName, i18n);
            }
        }
    },

    _applyI18nToElement(nodeName: string, i18n: I18nOptions): void {
        const el = this.getNodeEl(nodeName);
        if (!el) return;

        // 文本内容（已有内容时不覆盖，允许 option 优先级高于 i18n）
        if (i18n.text !== undefined && !el.textContent) {
            el.textContent = t(i18n.text);
        }

        // 提示（图片用 alt，其他用 title）
        if (i18n.hint !== undefined) {
            const attr = el.tagName === 'IMG' ? 'alt' : 'title';
            if (!el.getAttribute(attr)) {
                el.setAttribute(attr, t(i18n.hint));
            }
        }

        // 占位符
        if (i18n.placeholder !== undefined && !el.getAttribute('placeholder')) {
            el.setAttribute('placeholder', t(i18n.placeholder));
        }

        // 值（仅表单元素）
        if (i18n.value !== undefined && 'value' in el && !(el as HTMLInputElement).value) {
            (el as HTMLInputElement).value = t(i18n.value);
        }

        // 自定义处理
        if (typeof i18n.custom === 'function') {
            i18n.custom(el, t);
        }
    },

    _applyI18nToComponent(nodeName: string, i18n: I18nOptions): void {
        const component = this.getComponent(nodeName);
        if (!component) return;
        component.setNodeI18n(nodeName, i18n);
    },

    /**
     * 初始化i18n配置
     */
    _initI18n(): void {
        if (Object.keys(this._i18n || {}).length === 0) return;
        const off = this.systemOn(SYSTEM_EVENTS.I18N_MESSAGES_UPDATE, () => this._flushI18n());
        this.onCleanup(off);
        this._flushI18n();
    },
} satisfies AbilityDefinition;
