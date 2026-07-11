/**
 * NodeMapAbility — 内容属性初始化 + i18n 集中刷新
 *
 * 负责：
 * - 从 props 初始化内容属性（data-content 节点属性）
 * - i18n 翻译初始化 + localeChange 集中刷新
 *
 * 模板节点扫描和事件映射已统一到 withTemplate 预编译流程，
 * 不再需要运行时 querySelectorAll 扫描。
 */

import type { AbilityDefinition } from '@/composable';
import { globalEventBus } from '@qimenjs/events';
import { translateI18nKey, applyValueToEl } from '../content-properties';
import { inferContentMode } from '../template-compiler';

export const NodeMapAbility: AbilityDefinition = {
    /**
     * 从 props 初始化自动生成的内容属性
     */
    initContentFromProps(props: Record<string, any>): void {
        const propNames = (this.constructor as any).prototype._contentPropNames as string[] | undefined;
        if (!propNames) return;
        for (const propName of propNames) {
            if (props[propName] !== undefined) {
                (this as any)[propName] = props[propName];
            }
        }
    },

    // ─── i18n 集中刷新 ───

    /**
     * 初始化所有 data-i18n 节点的翻译
     */
    initI18nFromTemplate(): void {
        for (const [, entries] of Object.entries(this.nodeMap as Record<string, Record<string, any>>)) {
            for (const [, node] of Object.entries(entries as Record<string, any>)) {
                if (!node.i18nKey) continue;
                const translated = translateI18nKey(node.i18nKey);
                const mode = inferContentMode(node.el);
                applyValueToEl(node.el, translated, mode);
            }
        }
    },

    /**
     * 刷新所有 i18n 节点的翻译
     */
    refreshI18n(): void {
        for (const [, entries] of Object.entries(this.nodeMap as Record<string, Record<string, any>>)) {
            for (const [, node] of Object.entries(entries as Record<string, any>)) {
                if (!node.i18nKey) continue;
                const translated = translateI18nKey(node.i18nKey);
                const mode = inferContentMode(node.el);
                applyValueToEl(node.el, translated, mode);
            }
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
     */
    getI18nKeys(): Record<string, string> {
        const result: Record<string, string> = {};
        for (const [group, entries] of Object.entries(this.nodeMap as Record<string, Record<string, any>>)) {
            for (const [name, node] of Object.entries(entries as Record<string, any>)) {
                if (node.i18nKey) {
                    result[`${group}:${name}`] = node.i18nKey;
                }
            }
        }
        return result;
    },
};
