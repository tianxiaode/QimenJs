/**
 * content-properties.ts — 统一内容属性生成
 *
 * 从 TemplateComponent.ts 和 NodeMapAbility.ts 提取的共享内容属性逻辑，
 * 消除两处重复代码。
 *
 * 职责：
 * - 在类原型上生成内容 getter/setter（data-content 节点属性）
 * - i18n 翻译工具
 * - DOM 值写入工具
 */

import type { NodeTemplateMeta } from './types';
import { getI18nManager, I18N_PREFIX } from '@qimenjs/i18n';
import { inferContentMode } from './template-compiler';

// ─── 内容属性生成 ───

/**
 * 在强类原型上生成内容 getter/setter
 *
 * withTemplate 路径：类定义时调用一次（buildContentPropertiesOnClass）。
 * NodeMapAbility 路径：首次实例化时调用一次（buildContentPropertiesOnProto）。
 *
 * 两者逻辑相同，只是调用时机和参数来源不同。
 * 此函数统一处理，通过 target 参数区分写入目标。
 */
export function buildContentProperties(
    target: any,
    templateMetas: Record<string, NodeTemplateMeta>,
    isMultiArea: boolean,
): string[] {
    const proto = target.prototype ?? target;
    const propNames: string[] = [];

    for (const [, meta] of Object.entries(templateMetas)) {
        const capitalName = meta.name.charAt(0).toUpperCase() + meta.name.slice(1);

        const propName = isMultiArea
            ? `${meta.group}${capitalName}`
            : meta.name === '_' ? meta.group : meta.name;

        propNames.push(propName);

        const hiddenPropName = `${propName}Hidden`;
        const { group, name, mode } = meta;

        Object.defineProperty(proto, propName, {
            get: function (this: any) {
                const el = this.nodeMap[group]?.[name]?.el;
                if (!el) return '';
                if (mode === 'value') return (el as HTMLInputElement).value;
                if (mode === 'src') return (el as HTMLImageElement).src;
                return el.innerHTML;
            },
            set: function (this: any, v: string) {
                const el = this.nodeMap[group]?.[name]?.el;
                if (!el) return;
                const resolved = v.startsWith(I18N_PREFIX)
                    ? translateI18nKey(v.slice(I18N_PREFIX.length))
                    : v;
                applyValueToEl(el, resolved, mode);
            },
            configurable: true,
            enumerable: true,
        });

        Object.defineProperty(proto, hiddenPropName, {
            get: function (this: any) {
                return this.nodeMap[group]?.[name]?.el?.hidden ?? false;
            },
            set: function (this: any, v: boolean) {
                const el = this.nodeMap[group]?.[name]?.el;
                if (el) el.hidden = v;
            },
            configurable: true,
            enumerable: true,
        });
    }

    proto._contentPropNames = propNames;

    return propNames;
}

// ─── i18n 工具 ───

/**
 * 翻译 i18n key
 */
export function translateI18nKey(i18nKey: string): string {
    const i18n = getI18nManager();
    if (!i18n) return i18nKey;
    return i18n.t(i18nKey) || i18nKey;
}

/**
 * 将翻译值写入 DOM 元素
 */
export function applyValueToEl(el: HTMLElement, value: string, mode: 'value' | 'src' | 'html'): void {
    if (mode === 'value') { (el as HTMLInputElement).value = value; }
    else if (mode === 'src') { (el as HTMLImageElement).src = value; }
    else { el.innerHTML = value; }
}
