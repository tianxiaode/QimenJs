import type { AbilityDefinition } from '@/composable';
import { I18nOptions } from '../types';
import { t } from '@/i18n';
import { object } from '@/utils';

export const I18nAbility: AbilityDefinition = {
    /**
     * 获取i18n配置
     * @param nodeName 节点名称
     * @returns i18n配置
     */
    getI18n(nodeName: string): I18nOptions | undefined {
        const original = this.getNode(nodeName)?.i18n;
        const state = this._getState(nodeName)?.i18n;
        const dirty = this._getDirty(nodeName)?.i18n;

        // 如果没有任何配置，返回 undefined
        if (!original && !state && !dirty) {
            return undefined;
        }

        return {
            ...original,
            ...state,
            ...dirty,
        };
    },

    /**
     * 设置i18n配置
     * @param nodeName 节点名称
     * @param i18n i18n配置
     */
    setI18n(nodeName: string, i18n: I18nOptions): void {
        this._markI18nDirty(nodeName, i18n);
    },

    /**
     * 标记i18n配置为脏
     * @param nodeName 节点名称
     * @param i18n i18n配置
     */
    _markI18nDirty(nodeName: string, i18n: I18nOptions): void {
        const dirty = this._getDirty(nodeName);
        // 合并而不是覆盖，避免丢失之前的脏数据
        dirty.i18n = {
            ...dirty.i18n,
            ...i18n,
        };
        this.debounce('I18nAbility:flush', () => this._flushI18n(), 0);
    },

    /**
     * 清理i18n配置
     * @param nodeName 节点名称
     */
    _clearI18nDirty(nodeName: string): void {
        const dirty = this._getDirty(nodeName);
        if (dirty) {
            delete dirty.i18n;
            // 如果没有其他脏数据，清理整个节点
            if (Object.keys(dirty).length === 0) {
                delete this.state.dirty[nodeName];
            }
        }
    },

    /**
     * 刷新i18n配置
     */
    _flushI18n(): void {
        const names = this.state.i18ns || [];
        for (const name of names) {
            const dirty = this._getDirty(name);
            if (dirty?.i18n && Object.keys(dirty.i18n).length > 0) {
                // 1. 应用 dirty 到 DOM/组件
                this._applyI18n(name, dirty.i18n);

                // 2. ✅ 合并到 state（保存已应用的状态）
                const state = this._getState(name);
                state.i18n = {
                    ...state.i18n, // 之前已应用的
                    ...dirty.i18n, // 新应用的
                };

                // 3. ✅ 清空 dirty（已应用）
                this._clearI18nDirty(name);
            }
        }
    },

    /**
     * 应用i18n配置
     * @param nodeName 节点名称
     * @param i18n i18n配置
     */
    _applyI18n(nodeName: string, i18n: I18nOptions): void {
        if (!i18n || Object.keys(i18n).length === 0) return;

        const isComponent = this.isComponent(nodeName);

        if (!isComponent) {
            this._applyI18nToElement(nodeName, i18n);
        } else {
            this._applyI18nToComponent(nodeName, i18n);
        }
    },

    _applyI18nToElement(nodeName: string, i18n: I18nOptions): void {
        const el = this.getNodeEl(nodeName);
        if (!el) return;

        // 文本内容
        if (i18n.text !== undefined) {
            el.textContent = t(i18n.text);
        }

        // 提示（图片用 alt，其他用 title）
        if (i18n.hint !== undefined) {
            const attr = el.tagName === 'IMG' ? 'alt' : 'title';
            el.setAttribute(attr, t(i18n.hint));
        }

        // 占位符
        if (i18n.placeholder !== undefined) {
            el.setAttribute('placeholder', t(i18n.placeholder));
        }

        // 值（仅表单元素）
        if (i18n.value !== undefined && 'value' in el) {
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

        for (const [key, value] of Object.entries(i18n)) {
            if (key === 'custom') {
                if (typeof value === 'function') {
                    value(component, t);
                }
                continue;
            }
            object.setProperty(component, key, t(value));
        }
    },

    /**
     * 初始化i18n配置
     */
    _initI18n(): void {
        const names = this.state.i18ns || [];
        for (const name of names) {
            const meta = this.getNode(name);
            if (meta?.i18n) {
                this._applyI18n(name, meta.i18n);
            }
        }
    },
} satisfies AbilityDefinition;
