/**
 * content-properties.ts — 统一内容属性生成
 *
 * 职责：
 * - 在类原型上生成内容 getter/setter（使用编译时收集的 contentInfos）
 * - i18n 翻译工具
 * - DOM 值写入工具
 */

import type { ContentInfo } from './template-types';
import { getI18nManager, I18N_PREFIX } from '@qimenjs/i18n';

// ─── 内容属性生成 ───

/**
 * 在强类原型上生成内容 getter/setter
 *
 * 直接遍历 contentInfos 数组，propName/mode 已在编译时确定，
 * 无需运行时推导。
 */
export function buildContentProperties(
    target: any,
    contentInfos: ContentInfo[],
): string[] {
    const proto = target.prototype ?? target;
    const propNames: string[] = [];

    for (const info of contentInfos) {
        const { group, name, mode, propName } = info;

        propNames.push(propName);

        const hiddenPropName = `${propName}Hidden`;

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
