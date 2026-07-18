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

import type { ContentInfo } from './template-types';
import { getI18nManager, I18N_PREFIX } from '@qimenjs/i18n';
import { COMMON_PROPS, RESOLVERS, childPropName, componentChildPropName } from './common-props';
import type { CommonPropDef } from './common-props';
import { BODY_SPECIAL_KEY_SET } from './body-keys';

// ─── 内容属性生成 ───

/**
 * 在强类原型上生成内容 getter/setter
 *
 * 新方案（v2）：
 * 1. 组件自身通用属性：className, style, hidden, width, height, x, y, margin, padding, fontSize, color, bg, cursor, border
 * 2. DOM 子节点通用属性：labelClassName, labelStyle, labelHidden, labelWidth, ...
 * 3. DOM 子节点内容属性：label → el.innerHTML/value/src
 * 4. 组件子节点实例访问：$icon → nodeMap.icon.component
 *
 * v1 兼容：保持原有行为，生成透传 getter/setter
 */
export function buildContentProperties(target: any, contentInfos: ContentInfo[]): string[] {
    const proto = target.prototype ?? target;
    const propNames: string[] = [];

    const isV2 = !!(target as any)._propsDef;

    if (isV2) {
        // ── v2 新方案 ──

        // 0. 编译时命名冲突检测
        checkNameConflicts(target, contentInfos);

        // 1. 组件自身通用属性
        buildSelfCommonProps(proto, propNames);

        // 2. 子节点属性
        for (const info of contentInfos) {
            if (info.isComponent) {
                // 组件子节点：生成 $name 返回实例
                buildComponentChildAccessor(proto, info, propNames);
            } else {
                // DOM 子节点：生成内容属性 + 通用属性
                buildDomChildProps(proto, info, propNames);
            }
        }
    } else {
        // ── v1 旧方案（兼容） ──
        buildV1ContentProperties(proto, contentInfos, propNames);
    }

    proto._contentPropNames = propNames;

    return propNames;
}

// ─── v2: 组件自身通用属性 ───

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

        // 跳过已存在的属性（如 body 中已定义的）
        const existing = Object.getOwnPropertyDescriptor(proto, prop);
        if (existing && (existing.get || existing.set)) continue;

        propNames.push(prop);

        const resolve = RESOLVERS[resolver] || RESOLVERS.identity;

        if (target === 'el') {
            // 直接操作 el 属性（className, style, hidden）
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
            // 操作 el.style 子属性
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
            // bg → el.style.background
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

// ─── v2: DOM 子节点属性 ───

/**
 * 生成 DOM 子节点的属性 getter/setter
 *
 * 1. 内容属性：propName → el.innerHTML/value/src
 * 2. 通用属性：propNameClassName, propNameStyle, propNameHidden, ...
 */
function buildDomChildProps(proto: any, info: ContentInfo, propNames: string[]): void {
    const { group, name, mode, propName } = info;

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

        // 跳过已存在的属性
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

// ─── v2: 组件子节点实例访问 ───

/**
 * 生成组件子节点的实例访问器
 *
 * this.$icon → nodeMap.icon.component
 *
 * 属性透传已迁移到 body.forwards（由 _setupForwards 在运行时处理），
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

// ─── v1 旧方案（兼容） ───

/**
 * v1 旧方案：保持原有行为
 */
function buildV1ContentProperties(
    proto: any,
    contentInfos: ContentInfo[],
    propNames: string[]
): void {
    for (const info of contentInfos) {
        const { group, name, mode, propName, isComponent } = info;

        propNames.push(propName);

        const hiddenPropName = `${propName}Hidden`;

        if (isComponent) {
            // 组件节点：getter 返回子组件实例
            Object.defineProperty(proto, propName, {
                get: function (this: any) {
                    return this.nodeMap[name]?.component ?? null;
                },
                configurable: true,
                enumerable: true,
            });

            // v1: 默认属性 getter/setter：{propName}ClassName / Style / Size
            const elProps = ['className', 'style'];
            const compProps = ['size'];
            for (const prop of elProps) {
                const attrName = `${propName}${prop.charAt(0).toUpperCase()}${prop.slice(1)}`;
                if (!(proto as any)[attrName]) {
                    Object.defineProperty(proto, attrName, {
                        get: function (this: any) {
                            const component = this.nodeMap[name]?.component;
                            return component?.el?.[prop] ?? '';
                        },
                        set: function (this: any, v: any) {
                            const component = this.nodeMap[name]?.component;
                            if (component?.el) component.el[prop] = v;
                        },
                        configurable: true,
                        enumerable: true,
                    });
                }
            }
            for (const prop of compProps) {
                const attrName = `${propName}${prop.charAt(0).toUpperCase()}${prop.slice(1)}`;
                if (!(proto as any)[attrName]) {
                    Object.defineProperty(proto, attrName, {
                        get: function (this: any) {
                            const component = this.nodeMap[name]?.component;
                            return component?.[prop] ?? '';
                        },
                        set: function (this: any, v: any) {
                            const component = this.nodeMap[name]?.component;
                            if (component) component[prop] = v;
                        },
                        configurable: true,
                        enumerable: true,
                    });
                }
            }

            // v1: content 透传 getter/setter
            if (info.expose && info.expose.length > 0) {
                for (const contentName of info.expose) {
                    const capitalContentName =
                        contentName.charAt(0).toUpperCase() + contentName.slice(1);
                    for (const prop of [...elProps, ...compProps]) {
                        const attrName = `${propName}${capitalContentName}${prop.charAt(0).toUpperCase()}${prop.slice(1)}`;
                        const isElProp = elProps.includes(prop);
                        if (!(proto as any)[attrName]) {
                            Object.defineProperty(proto, attrName, {
                                get: function (this: any) {
                                    const component = this.nodeMap[name]?.component;
                                    if (!component) return '';
                                    const childComponent =
                                        component.nodeMap?.[contentName]?.component;
                                    if (childComponent) {
                                        return isElProp
                                            ? childComponent.el?.[prop]
                                            : childComponent[prop];
                                    }
                                    const childEl = component.nodeMap?.[contentName]?.el;
                                    if (childEl && isElProp) return childEl[prop];
                                    return '';
                                },
                                set: function (this: any, v: any) {
                                    const component = this.nodeMap[name]?.component;
                                    if (!component) return;
                                    const childComponent =
                                        component.nodeMap?.[contentName]?.component;
                                    if (childComponent) {
                                        if (isElProp) {
                                            if (childComponent.el) childComponent.el[prop] = v;
                                        } else {
                                            childComponent[prop] = v;
                                        }
                                        return;
                                    }
                                    const childEl = component.nodeMap?.[contentName]?.el;
                                    if (childEl && isElProp) childEl[prop] = v;
                                },
                                configurable: true,
                                enumerable: true,
                            });
                        }
                    }
                }
            }
        } else {
            // DOM 节点：getter/setter 操作 el
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
        }

        Object.defineProperty(proto, hiddenPropName, {
            get: function (this: any) {
                return this.nodeMap[name]?.el?.hidden ?? false;
            },
            set: function (this: any, v: boolean) {
                const el = this.nodeMap[name]?.el;
                if (el) el.hidden = v;
            },
            configurable: true,
            enumerable: true,
        });
    }
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
    const proto = target.prototype ?? target;
    const body = (target as any)._templateBody;
    const propsDef = (target as any)._propsDef;

    // 收集组件自身属性名
    const selfProps = new Set<string>();

    // body 中的属性（排除 type/bridges 等特殊 key）
    if (body) {
        for (const key of Object.keys(body)) {
            if (!BODY_SPECIAL_KEY_SET.has(key)) {
                selfProps.add(key);
            }
        }
    }

    // propsDef 中的属性
    if (propsDef) {
        for (const key of Object.keys(propsDef)) {
            selfProps.add(key);
        }
    }

    // 原型上已有的 getter/setter
    for (const info of contentInfos) {
        if (!info.isComponent) {
            // DOM 子节点：检查 propName 是否和组件自身属性冲突
            if (selfProps.has(info.propName)) {
                console.warn(
                    `[QimenJS] 命名冲突：DOM 子节点名 "${info.propName}" 与组件自身属性重名。` +
                        `建议修改子节点名以避免冲突。组件类型：${(target as any).type || target.name || 'unknown'}`
                );
            }
        }
    }
}
