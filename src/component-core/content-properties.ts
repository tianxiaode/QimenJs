/**
 * content-properties.ts — 统一内容属性生成
 *
 * 基于 NodePropAbility 的 _getNodeProp / _setNodeProp 统一分发，
 * 原型 getter/setter 极简转发，不生成复杂闭包。
 *
 * 三层属性体系：
 * - 组件自身：cls, style, hidden, width, ...（无前缀，nodeName='root'）
 * - DOM 子节点：textCls, textStyle, textHidden, ...（name + Prop）
 * - 组件子节点：$icon（$ + name，返回实例）
 */

import type { ContentInfo } from './types/tpl-node-types';
import { getI18nManager, I18N_PREFIX } from '@qimenjs/i18n';
import { BODY_SPECIAL_KEY_SET } from './body-keys';
import type { CompiledComponentTemplate } from './types/template-json';

const SELF_PROPS = [
    'cls',
    'style',
    'hidden',
    'width',
    'height',
    'x',
    'y',
    'margin',
    'padding',
    'fontSize',
    'color',
    'bg',
    'cursor',
    'border',
] as const;

const CONTENT_MODE_MAP: Record<string, string> = {
    html: 'text',
    value: 'value',
    src: 'src',
};

export function buildContentProperties(target: any, contentInfos: ContentInfo[]): string[] {
    const proto = target.prototype ?? target;
    const propNames: string[] = [];

    checkNameConflicts(target, contentInfos);
    buildSelfProps(proto, propNames);

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

function buildSelfProps(proto: any, propNames: string[]): void {
    for (const prop of SELF_PROPS) {
        const existing = Object.getOwnPropertyDescriptor(proto, prop);
        if (existing && (existing.get || existing.set)) continue;

        propNames.push(prop);
        Object.defineProperty(proto, prop, {
            get(this: any) {
                return this._getNodeProp('root', prop);
            },
            set(this: any, v: any) {
                this._setNodeProp('root', prop, v);
            },
            configurable: true,
            enumerable: true,
        });
    }
}

function buildDomChildProps(proto: any, info: ContentInfo, propNames: string[]): void {
    const { name, mode, propName } = info;

    const contentProp = CONTENT_MODE_MAP[mode] || 'text';
    propNames.push(propName);
    Object.defineProperty(proto, propName, {
        get(this: any) {
            return this._getNodeProp(name, contentProp);
        },
        set(this: any, v: string) {
            const resolved = v.startsWith(I18N_PREFIX)
                ? translateI18nKey(v.slice(I18N_PREFIX.length))
                : v;
            this._setNodeProp(name, contentProp, resolved);
        },
        configurable: true,
        enumerable: true,
    });

    for (const prop of SELF_PROPS) {
        const attrName = name + prop.charAt(0).toUpperCase() + prop.slice(1);

        const existing = Object.getOwnPropertyDescriptor(proto, attrName);
        if (existing && (existing.get || existing.set)) continue;

        propNames.push(attrName);
        Object.defineProperty(proto, attrName, {
            get(this: any) {
                return this._getNodeProp(name, prop);
            },
            set(this: any, v: any) {
                this._setNodeProp(name, prop, v);
            },
            configurable: true,
            enumerable: true,
        });
    }
}

function buildComponentChildAccessor(proto: any, info: ContentInfo, propNames: string[]): void {
    const { name, propName } = info;
    const attrName = '$' + propName;

    propNames.push(attrName);

    Object.defineProperty(proto, attrName, {
        get(this: any) {
            return this.nodeMap[name]?.component ?? null;
        },
        configurable: true,
        enumerable: true,
    });
}

export function translateI18nKey(i18nKey: string): string {
    const i18n = getI18nManager();
    if (!i18n) return i18nKey;
    return i18n.t(i18nKey) || i18nKey;
}

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
