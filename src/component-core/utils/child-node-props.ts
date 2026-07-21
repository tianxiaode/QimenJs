/**
 * child-node-props.ts — 子节点内容属性自动构建
 *
 * 编译时根据 nodeMetas 中每个命名子节点的 contentMode，
 * 自动生成对应的内容属性 getter/setter 描述符并挂到构造函数原型上。
 *
 * 组件实例可直接 this.title = 'Hello' 更新子节点内容，
 * 无需在 body 中手写 getter/setter。
 *
 * ══════════════════════════════════════════════════════════════
 * contentMode → 内容属性映射
 * ══════════════════════════════════════════════════════════════
 *
 * | contentMode | 生成属性     | DOM 操作              |
 * |-------------|-------------|-----------------------|
 * | html        | text        | el.innerHTML          |
 * | value       | value       | el.value              |
 * | src         | src         | el.src                |
 * | link        | text + href | el.innerHTML + el.href|
 *
 * 通用属性（cls/hidden/style 等）已由 CommonPropsAbility 的
 * setNodeXxx / addCls / removeCls 等方法统一提供，
 * 不再为每个节点自动生成属性描述符。
 *
 * 属性名规则：
 * - 内容属性直接用子节点 name（如 this.title → 更新 title 节点内容）
 * - name 与内置方法冲突时加 _ 后缀（如 this.text_ → 更新 text 节点内容）
 * - 组件子节点用 $name（如 this.$icon → 访问 icon 子组件实例）
 * - i18n 节点的内容 setter 设置 i18nKey，自动翻译后写入 DOM
 */

import type { NodeMetadata } from '../types/compiled-types';
import { capitalize } from '@/utils/string/base';
import { resolveI18nValue } from '@qimenjs/i18n';
import { CONTENT_MODE_MAP, RESERVED_KEYS } from './template-constants';

export function applyChildNodeProps(
    ctor: any,
    nodeMetas: Record<string, NodeMetadata>,
    i18nNodes: Array<{ name: string; i18nKey: string }>
): void {
    const proto = ctor.prototype;
    const descs = buildChildNodePropDescs(nodeMetas, i18nNodes);

    for (const [key, desc] of Object.entries(descs)) {
        if (Object.prototype.hasOwnProperty.call(proto, key)) continue;
        Object.defineProperty(proto, key, desc);
    }
}

export function buildChildNodePropDescs(
    nodeMetas: Record<string, NodeMetadata>,
    i18nNodes: Array<{ name: string; i18nKey: string }>
): Record<string, PropertyDescriptor> {
    const descs: Record<string, PropertyDescriptor> = {};
    const i18nSet = new Set(i18nNodes.map(n => n.name));

    for (const [nodeName, meta] of Object.entries(nodeMetas)) {
        if (nodeName === 'root') continue;

        if (meta.componentClass) {
            addComponentRefDesc(descs, nodeName);
            continue;
        }

        const mode = meta.contentMode ?? 'html';
        const contentDefs = CONTENT_MODE_MAP[mode];
        const isI18n = i18nSet.has(nodeName);

        if (contentDefs) {
            for (const def of contentDefs) {
                addContentPropDesc(descs, nodeName, def.nodeProp, isI18n);
            }
        }
    }

    return descs;
}

function addContentPropDesc(
    descs: Record<string, PropertyDescriptor>,
    nodeName: string,
    nodeProp: string,
    isI18n: boolean
): void {
    let key: string;

    if (nodeProp === 'text' || nodeProp === 'value' || nodeProp === 'src') {
        key = RESERVED_KEYS.has(nodeName) ? `${nodeName}_` : nodeName;
    } else {
        key = `${nodeName}${capitalize(nodeProp)}`;
    }

    if (descs[key]) return;

    if (isI18n) {
        descs[key] = {
            get(this: any) {
                return this.nodeMap?.[nodeName]?.i18nKey;
            },
            set(this: any, v: any) {
                const node = this.nodeMap?.[nodeName];
                if (!node) return;
                node.i18nKey = v;
                this._markNodeDirty(nodeName, { [nodeProp]: resolveI18nValue(`i18n:${v}`) });
            },
            configurable: true,
            enumerable: true,
        };
    } else {
        descs[key] = {
            get(this: any) {
                return this._getNodeProp(nodeName, nodeProp);
            },
            set(this: any, v: any) {
                this._markNodeDirty(nodeName, { [nodeProp]: v });
            },
            configurable: true,
            enumerable: true,
        };
    }
}

function addComponentRefDesc(descs: Record<string, PropertyDescriptor>, nodeName: string): void {
    const key = `$${nodeName}`;

    if (descs[key]) return;

    descs[key] = {
        get(this: any) {
            return this.nodeMap?.[nodeName]?.component;
        },
        configurable: true,
        enumerable: true,
    };
}
