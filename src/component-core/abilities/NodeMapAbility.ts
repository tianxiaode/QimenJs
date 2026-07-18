/**
 * NodeMapAbility — 内容属性初始化 + i18n 集中刷新
 *
 * 负责：
 * - 从 props 初始化内容属性
 * - i18n 翻译初始化 + localeChange 集中刷新
 *
 * 使用编译时收集的 contentInfos 数组直接遍历，
 * 无需遍历整个 nodeMap 再 if 过滤。
 */

import type { AbilityDefinition } from '@/composable';
import type { ContentInfo } from '../types/template';
import type { CompiledComponentTemplate } from '../types/template-json';
import { globalEventBus } from '@qimenjs/events';
import { translateI18nKey, applyValueToEl } from '../content-properties';

export const NodeMapAbility: AbilityDefinition = {
    /**
     * 从 props 初始化自动生成的内容属性
     */
    initContentFromProps(props: Record<string, any>): void {
        const propNames = (this.constructor as any).prototype._contentPropNames as
            | string[]
            | undefined;
        if (!propNames) return;
        for (const propName of propNames) {
            if (props[propName] !== undefined) {
                (this as any)[propName] = props[propName];
            }
        }
    },

    // ─── i18n 集中刷新 ───

    /**
     * 获取编译时收集的 contentInfos
     */
    _getContentInfos(): ContentInfo[] {
        const compiled: CompiledComponentTemplate = (this.constructor as any)._compiledTemplate;
        return compiled?.contentInfos || [];
    },

    /**
     * 初始化所有 i18n 节点的翻译
     *
     * 直接遍历 contentInfos，只处理有 i18nKey 的条目
     */
    initI18nFromTemplate(): void {
        const infos = this._getContentInfos();
        for (const info of infos) {
            if (!info.i18nKey) continue;
            const el = this.nodeMap[info.name]?.el;
            if (!el) continue;
            const translated = translateI18nKey(info.i18nKey);
            applyValueToEl(el, translated, info.mode);
        }
    },

    /**
     * 刷新所有 i18n 节点的翻译
     *
     * 直接遍历 contentInfos，只处理有 i18nKey 的条目
     */
    refreshI18n(): void {
        const infos = this._getContentInfos();
        for (const info of infos) {
            if (!info.i18nKey) continue;
            const el = this.nodeMap[info.name]?.el;
            if (!el) continue;
            const translated = translateI18nKey(info.i18nKey);
            applyValueToEl(el, translated, info.mode);
        }
    },

    /**
     * 注册 localeChange 事件监听
     */
    setupI18nListener(): void {
        if (!globalEventBus || typeof globalEventBus.on !== 'function') return;

        const off = globalEventBus.on('localeChange', () => {
            this.refreshI18n();
        });

        if (typeof this.onCleanup === 'function') {
            this.onCleanup(() => {
                if (typeof off === 'function') off();
            });
        }
    },

    /**
     * 获取所有 i18n key
     *
     * 直接遍历 contentInfos，只处理有 i18nKey 的条目
     */
    getI18nKeys(): Record<string, string> {
        const result: Record<string, string> = {};
        const infos = this._getContentInfos();
        for (const info of infos) {
            if (info.i18nKey) {
                result[info.name] = info.i18nKey;
            }
        }
        return result;
    },
};
