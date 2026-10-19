/**
 * Container 四路 item 解析（共享）
 *
 * ContainerComponent 与其他需要相同内容语义的场景（如 Table row body）
 * 共用的 def → item 解析逻辑：
 * - string：HTML 内容（@ 前缀 i18n 求值），同步编译为轻量 DOM wrapper
 * - TemplateDecl：模板编译为 DOM（暂不支持嵌套组件 type，需要时走组件分支）
 * - 组件类：实例化（不挂载，调用方负责 appendChild）
 * - 配置对象：{ type: 类|注册名, ...props } 实例化
 *
 * 返回 item 统一形态：{ el, order, name?, action?, type?, dispose? }
 * 组件实例直接返回（el/order 可写，兼容 wrapper 契约）。
 */

import type { TemplateDecl } from '@qimenjs/component-core';
import { TemplateManager } from '../../component-core/engine';
import { resolveI18nValue } from '@qimenjs/i18n';
import type { ContainerItemDef } from './types';

export interface ContainerResolveHost {
    logger: { warn: (...args: any[]) => void };
    resolveComponent: (type: string) => any;
}

export function isTemplateDecl(value: any): value is TemplateDecl {
    return (
        typeof value === 'object' &&
        value !== null &&
        (typeof value.tag === 'string' || Array.isArray(value.children))
    );
}

export function createHtmlItem(html: string): any {
    const el = document.createElement('div');
    el.classList.add('q-container__html');
    el.innerHTML = resolveI18nValue(html);
    return { el, order: 0, type: 'html' };
}

export function createTemplateItem(decl: TemplateDecl, logger: any): any {
    const cache = TemplateManager.get(decl);
    if ((cache.childComponents || []).length > 0) {
        logger?.warn?.(
            '[createTemplateItem] 模板含嵌套组件，暂不支持；请使用组件 item 或纯 DOM 模板'
        );
    }
    const frag = cache.templateCache!.content.cloneNode(true) as DocumentFragment;
    const el = (frag.firstElementChild as HTMLElement) ?? document.createElement('div');
    return {
        el,
        order: 0,
        name: decl.name,
        action: (decl as any).action,
        type: 'template',
    };
}

export function createItemFromDef(host: ContainerResolveHost, def: ContainerItemDef): any {
    if (typeof def === 'string') {
        return createHtmlItem(def);
    }
    if (isTemplateDecl(def)) {
        return createTemplateItem(def, host.logger);
    }
    if (typeof def === 'function') {
        return new (def as any)({});
    }
    if (typeof def === 'object' && def !== null) {
        const { type: itemType, ...props } = def as Record<string, any>;
        if (itemType == null) {
            host.logger?.warn?.('[createItemFromDef] 对象 item 缺少 type，忽略', def);
            return null;
        }
        // type 为模板对象：{ type: {...TemplateDecl}, ...props } 形态
        if (isTemplateDecl(itemType)) {
            return createTemplateItem(itemType, host.logger);
        }
        const ItemClass = typeof itemType === 'function' ? itemType : host.resolveComponent(itemType);
        if (!ItemClass) {
            host.logger?.warn?.(`[createItemFromDef] 组件类型 "${itemType}" 未注册`);
            return null;
        }
        return new (ItemClass as any)(props);
    }
    host.logger?.warn?.('[createItemFromDef] 无效 item 定义，忽略', def);
    return null;
}
