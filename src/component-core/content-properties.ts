/**
 * content-properties.ts — 统一内容属性生成
 *
 * 职责：
 * - 在类原型上生成内容 getter/setter（使用编译时收集的 contentInfos）
 * - 从子组件 expose + body setter 自动生成便捷方法
 * - i18n 翻译工具
 * - DOM 值写入工具
 */

import type { ContentInfo } from './template-types';
import { getI18nManager, I18N_PREFIX } from '@qimenjs/i18n';

// ─── 内容属性生成 ───

/**
 * 在强类原型上生成内容 getter/setter + 便捷方法
 *
 * 直接遍历 contentInfos 数组，propName/mode 已在编译时确定，
 * 无需运行时推导。
 *
 * 便捷方法：从子组件 expose 列表 + body setter 自动生成。
 * - expose:['icon'] → 遍历子组件 body 的 setter 属性
 * - body 有 iconClass setter → 生成 setIconClass(v)
 * - body 有 size setter → 生成 setIconSize(v)
 *
 * 方法名规则：set{PropName}{BodySetter名}
 * propName='icon' + body.iconClass → setIconClass(v)
 */
export function buildContentProperties(
    target: any,
    contentInfos: ContentInfo[],
): string[] {
    const proto = target.prototype ?? target;
    const propNames: string[] = [];

    for (const info of contentInfos) {
        const { group, name, mode, propName, isComponent } = info;

        propNames.push(propName);

        const hiddenPropName = `${propName}Hidden`;

        if (isComponent) {
            // 组件节点：getter 返回子组件实例
            Object.defineProperty(proto, propName, {
                get: function (this: any) {
                    return this.nodeMap[group]?.[name]?.component ?? null;
                },
                configurable: true,
                enumerable: true,
            });

            // 默认属性 getter/setter：{propName}ClassName / Style / Size
            // 后缀和 DOM/组件属性名一致，零映射
            // ClassName / Style → component.el, Size → component
            const elProps = ['className', 'style'];
            const compProps = ['size'];
            for (const prop of elProps) {
                const attrName = `${propName}${prop.charAt(0).toUpperCase()}${prop.slice(1)}`;
                if (!(proto as any)[attrName]) {
                    Object.defineProperty(proto, attrName, {
                        get: function (this: any) {
                            const component = this.nodeMap[group]?.[name]?.component;
                            return component?.el?.[prop] ?? '';
                        },
                        set: function (this: any, v: any) {
                            const component = this.nodeMap[group]?.[name]?.component;
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
                            const component = this.nodeMap[group]?.[name]?.component;
                            return component?.[prop] ?? '';
                        },
                        set: function (this: any, v: any) {
                            const component = this.nodeMap[group]?.[name]?.component;
                            if (component) component[prop] = v;
                        },
                        configurable: true,
                        enumerable: true,
                    });
                }
            }

            // content 透传 getter/setter：{propName}{ContentName}ClassName / Style / Size
            // 通过子组件的 nodeMap 访问 content 子节点
            if (info.expose && info.expose.length > 0) {
                for (const contentName of info.expose) {
                    const capitalContentName = contentName.charAt(0).toUpperCase() + contentName.slice(1);
                    for (const prop of [...elProps, ...compProps]) {
                        const attrName = `${propName}${capitalContentName}${prop.charAt(0).toUpperCase()}${prop.slice(1)}`;
                        const isElProp = elProps.includes(prop);
                        if (!(proto as any)[attrName]) {
                            Object.defineProperty(proto, attrName, {
                                get: function (this: any) {
                                    const component = this.nodeMap[group]?.[name]?.component;
                                    if (!component) return '';
                                    // 优先取子组件的 content 子组件，否则取 content 子节点的 el
                                    const childComponent = component.nodeMap?.[contentName]?.component;
                                    if (childComponent) {
                                        return isElProp ? childComponent.el?.[prop] : childComponent[prop];
                                    }
                                    const childEl = component.nodeMap?.[contentName]?.el;
                                    if (childEl && isElProp) return childEl[prop];
                                    return '';
                                },
                                set: function (this: any, v: any) {
                                    const component = this.nodeMap[group]?.[name]?.component;
                                    if (!component) return;
                                    const childComponent = component.nodeMap?.[contentName]?.component;
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
        }

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
