// steps/build-dom.ts

import { CONTENT_MODE_MAP, RESERVED_KEYS } from '@/component-core/constants';
import { IComponentBase, InitContext, NodeMetadata } from '@/component-core/types';
import { string } from '@qimenjs/utils';

/**
 * 管道步骤：构建 DOM
 *
 * 职责：
 * 1. 创建根元素
 * 2. 克隆模板 → 生成 DOM
 * 3. 构建 nodeMap
 * 4. 应用样式、属性、文本（一次遍历）
 */
export function buildDOM(ctx: InitContext): void {
    const instance = ctx.instance;
    const nodeMapMgr = instance.nodeMapMgr;

    instance.logger.debug(`[build:dom]`, `[${instance.type}]:[${instance.id}]`, '开始构建 DOM...');

    nodeMapMgr.buildDOM();
    const indexPath = nodeMapMgr.indexPath;
    const nodeMetas = nodeMapMgr.nodeMetas;
    for (const [name, path] of Object.entries(indexPath)) {
        const meta = nodeMetas[name];
        if (!meta) continue;

        const el = nodeMapMgr.findByPath(path);
        if (!el) continue;
        nodeMapMgr.set(name, { ...meta, el });
        applyNode(instance, name, meta);
    }

    instance.logger.debug(
        `[build:dom]`,
        `[${instance.type}]:[${instance.id}]`,
        `DOM 构建完成，${Object.keys(nodeMapMgr.nodeMetas).length} 个节点`
    );
}

function applyNode(instance: IComponentBase, nodeName: string, meta: NodeMetadata): void {
    if (nodeName === 'root') return;

    // 1. 子组件引用：$[name]
    if (meta.componentClass) {
        const key = `$${nodeName}`;
        if (!Object.prototype.hasOwnProperty.call(instance, key)) {
            Object.defineProperty(instance, key, {
                get(this: any) {
                    return this.nodeMap?.[nodeName]?.component;
                },
                configurable: true,
                enumerable: true,
            });
        }
        return;
    }

    // 2. 内容属性：根据 contentMode
    const mode = meta.contentMode ?? 'html';
    const contentDefs = CONTENT_MODE_MAP[mode];

    if (contentDefs) {
        for (const def of contentDefs) {
            const key = getPropKey(nodeName, def.nodeProp);
            if (!Object.prototype.hasOwnProperty.call(instance, key)) {
                Object.defineProperty(instance, key, {
                    get(this: any) {
                        return this._getNodeProp(nodeName, def.nodeProp);
                    },
                    set(this: any, v: any) {
                        this._markNodeDirty(nodeName, { [def.nodeProp]: v });
                    },
                    configurable: true,
                    enumerable: true,
                });
            }
        }
    }
}

/**
 * 获取属性名
 */
function getPropKey(nodeName: string, nodeProp: string): string {
    if (nodeProp === 'text' || nodeProp === 'value' || nodeProp === 'src') {
        return RESERVED_KEYS.has(nodeName) ? `${nodeName}_` : nodeName;
    }
    return `${nodeName}${string.capitalize(nodeProp)}`;
}
