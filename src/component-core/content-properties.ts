/**
 * content-properties.ts — 统一内容属性生成
 *
 * 职责：
 * - 在类原型上生成通用属性 getter/setter（组件自身 + DOM 子节点）
 * - 生成组件子节点实例访问器（$name）
 * - 生成 DOM 子节点内容属性（propName → el.innerHTML/value/src）
 * - i18n 翻译工具
 * - DOM 值写入工具
 *
 * 三层属性体系：
 * - 组件自身：className, style, hidden, width, height, ...（无前缀）
 * - DOM 子节点：labelClassName, labelStyle, labelHidden, ...（name + Prop）
 * - 组件子节点：$icon（$ + name，返回实例）
 */

import type { ContentInfo } from './types/template';
import type { CompiledComponentTemplate } from './types/template-json';
import { getI18nManager, I18N_PREFIX } from '@qimenjs/i18n';
import { COMMON_PROPS, RESOLVERS, childPropName, componentChildPropName } from './common-props';
import type { CommonPropDef } from './types/common-props';
import { BODY_SPECIAL_KEY_SET } from './body-keys';

// ─── 内容属性生成 ───

/**
 * 在强类原型上生成内容 getter/setter
 *
 * 1. 组件自身通用属性：className, style, hidden, width, height, x, y, margin, padding, fontSize, color, bg, cursor, border
 * 2. DOM 子节点通用属性：labelClassName, labelStyle, labelHidden, labelWidth, ...
 * 3. DOM 子节点内容属性：label → el.innerHTML/value/src
 * 4. 组件子节点实例访问：$icon → nodeMap.icon.component
 */
export function buildContentProperties(target: any, contentInfos: ContentInfo[]): string[] {
    const proto = target.prototype ?? target;
    const propNames: string[] = [];

    checkNameConflicts(target, contentInfos);

    buildSelfCommonProps(proto, propNames);

    for (const info of contentInfos) {
        if (info.isComponent) {
            buildComponentChildAccessor(proto, info, propNames);
        } else {
            buildDomChildProps(proto, info, propNames);
        }
    }

    proto._contentPropNames = propNames;

    return propNames;
}

// ─── 组件自身通用属性 ───

/**
 * 生成组件自身的通用属性 getter/setter
 *
 * 操作组件自身的 el，无前缀：
 * - this.className → el.className
 * - this.width → el.style.width
 * - this.margin → el.style.margin
 */
function buildSelfCommonProps(proto: any, propNames: string[]): void {
    for (const def of COMMON_PROPS) {
        const { prop, target, targetProp, resolver } = def;

        const existing = Object.getOwnPropertyDescriptor(proto, prop);
        if (existing && (existing.get || existing.set)) continue;

        propNames.push(prop);

        const resolve = RESOLVERS[resolver] || RESOLVERS.identity;

        if (target === 'el') {
            const elProp = targetProp || prop;
            Object.defineProperty(proto, prop, {
                get: function (this: any) {
                    return this.el?.[elProp] ?? (prop === 'hidden' ? false : '');
                },
                set: function (this: any, v: any) {
                    if (this.el) this.el[elProp] = resolve(v);
                },
                configurable: true,
                enumerable: true,
            });
        } else if (target === 'style') {
            const styleProp = targetProp || prop;
            Object.defineProperty(proto, prop, {
                get: function (this: any) {
                    return this.el?.style?.[styleProp] ?? '';
                },
                set: function (this: any, v: any) {
                    if (this.el?.style) this.el.style[styleProp] = resolve(v);
                },
                configurable: true,
                enumerable: true,
            });
        } else if (target === 'bg') {
            Object.defineProperty(proto, prop, {
                get: function (this: any) {
                    return this.el?.style?.background ?? '';
                },
                set: function (this: any, v: any) {
                    if (this.el?.style) this.el.style.background = resolve(v);
                },
                configurable: true,
                enumerable: true,
            });
        }
    }
}

// ─── DOM 子节点属性 ───

/**
 * 生成 DOM 子节点的属性 getter/setter
 *
 * 1. 内容属性：propName → el.innerHTML/value/src
 * 2. 通用属性：propNameClassName, propNameStyle, propNameHidden, ...
 */
function buildDomChildProps(proto: any, info: ContentInfo, propNames: string[]): void {
    const { name, mode, propName } = info;

    // 1. 内容属性：this.label → el.innerHTML/value/src
    propNames.push(propName);
    Object.defineProperty(proto, propName, {
        get: function (this: any) {
            const el = this.nodeMap[name]?.el;
            if (!el) return '';
            if (mode === 'value') return (el as HTMLInputElement).value;
            if (mode === 'src') return (el as HTMLImageElement).src;
            return el.innerHTML;
        },
        set: function (this: any, v: string) {
            const el = this.nodeMap[name]?.el;
            if (!el) return;
            const resolved = v.startsWith(I18N_PREFIX)
                ? translateI18nKey(v.slice(I18N_PREFIX.length))
                : v;
            applyValueToEl(el, resolved, mode);
        },
        configurable: true,
        enumerable: true,
    });

    // 2. 通用属性：this.labelClassName, this.labelStyle, this.labelHidden, ...
    for (const def of COMMON_PROPS) {
        const attrName = childPropName(propName, def.prop);

        const existing = Object.getOwnPropertyDescriptor(proto, attrName);
        if (existing && (existing.get || existing.set)) continue;

        propNames.push(attrName);

        const resolve = RESOLVERS[def.resolver] || RESOLVERS.identity;

        if (def.target === 'el') {
            const elProp = def.targetProp || def.prop;
            Object.defineProperty(proto, attrName, {
                get: function (this: any) {
                    return this.nodeMap[name]?.el?.[elProp] ?? (def.prop === 'hidden' ? false : '');
                },
                set: function (this: any, v: any) {
                    const el = this.nodeMap[name]?.el;
                    if (el) el[elProp] = resolve(v);
                },
                configurable: true,
                enumerable: true,
            });
        } else if (def.target === 'style') {
            const styleProp = def.targetProp || def.prop;
            Object.defineProperty(proto, attrName, {
                get: function (this: any) {
                    return this.nodeMap[name]?.el?.style?.[styleProp] ?? '';
                },
                set: function (this: any, v: any) {
                    const el = this.nodeMap[name]?.el;
                    if (el?.style) el.style[styleProp] = resolve(v);
                },
                configurable: true,
                enumerable: true,
            });
        } else if (def.target === 'bg') {
            Object.defineProperty(proto, attrName, {
                get: function (this: any) {
                    return this.nodeMap[name]?.el?.style?.background ?? '';
                },
                set: function (this: any, v: any) {
                    const el = this.nodeMap[name]?.el;
                    if (el?.style) el.style.background = resolve(v);
                },
                configurable: true,
                enumerable: true,
            });
        }
    }
}

// ─── 组件子节点实例访问 ───

/**
 * 生成组件子节点的实例访问器
 *
 * this.$icon → nodeMap.icon.component
 *
 * 属性透传由 body.forwards（由 _setupForwards 在运行时处理），
 * 此函数只生成 $name 访问器。
 */
function buildComponentChildAccessor(proto: any, info: ContentInfo, propNames: string[]): void {
    const { name, propName } = info;
    const attrName = componentChildPropName(propName);

    propNames.push(attrName);

    Object.defineProperty(proto, attrName, {
        get: function (this: any) {
            return this.nodeMap[name]?.component ?? null;
        },
        configurable: true,
        enumerable: true,
    });
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
export function applyValueToEl(
    el: HTMLElement,
    value: string,
    mode: 'value' | 'src' | 'html'
): void {
    if (mode === 'value') {
        (el as HTMLInputElement).value = value;
    } else if (mode === 'src') {
        (el as HTMLImageElement).src = value;
    } else {
        el.innerHTML = value;
    }
}

// ─── 编译时命名冲突检测 ───

/**
 * 检测子节点名和组件自身属性的命名冲突
 *
 * 规则：
 * - DOM 子节点名不能和组件 body/props 中的属性重名
 *   （因为 DOM 子节点的内容属性直接用 propName，如 this.label = 'xxx'）
 * - 组件子节点的 $name 前缀天然隔离，不会冲突
 * - DOM 子节点的 namePropName 拼接属性天然隔离，不会冲突
 *
 * 冲突时在控制台输出警告，不阻止运行（避免破坏现有代码）。
 */
function checkNameConflicts(target: any, contentInfos: ContentInfo[]): void {
    const compiled: CompiledComponentTemplate = target._compiledTemplate;
    const body = compiled?.body;
    const propsDef = compiled?.propsDef;

    const selfProps = new Set<string>();

    if (body) {
        for (const key of Object.keys(body)) {
            if (!BODY_SPECIAL_KEY_SET.has(key)) {
                selfProps.add(key);
            }
        }
    }

    if (propsDef) {
        for (const key of Object.keys(propsDef)) {
            selfProps.add(key);
        }
    }

    for (const info of contentInfos) {
        if (!info.isComponent) {
            if (selfProps.has(info.propName)) {
                console.warn(
                    `[QimenJS] 命名冲突：DOM 子节点名 "${info.propName}" 与组件自身属性重名。` +
                        `建议修改子节点名以避免冲突。组件类型：${(target as any).type || target.name || 'unknown'}`
                );
            }
        }
    }
}
