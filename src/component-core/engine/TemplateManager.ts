/**
 * TemplateManager — 模板编译器
 *
 * 将结构化的 TemplateDecl（含 options / attrs 分离）编译为 TemplateCache，
 * 供运行时克隆 DOM 和查询节点元数据。
 *
 * 核心变化：不再需要 splitOptions 运行时分类，options 和 attrs 在定义时已分离。
 */

import { CHILDREN_PLACEHOLDER, SKELETON_CLS, VOID_TAGS } from '../constants';
import { TemplateCache, TemplateDecl, NodeMeta } from '../types';
import { StyleHelper } from './StyleHelper';
import { string } from '@qimenjs/utils';

export class TemplateManager {
    private static tplCache = new Map<TemplateDecl, TemplateCache>();

    static get(tpl: TemplateDecl): TemplateCache {
        const cached = this.tplCache.get(tpl);
        if (cached) return cached;
        const newCached = this.compileTemplate(tpl);
        this.tplCache.set(tpl, newCached);
        return newCached;
    }

    static compileTemplate(tpl: TemplateDecl): TemplateCache {
        const cache: TemplateCache = {
            html: '',
            names: [],
            childComponents: [],
            i18ns: [],
            permissions: [],
            indexs: {},
            nodes: {},
        };
        const html = this.resolveNode(tpl, cache, [], true);
        cache.html = html;
        cache.templateCache = this.createTemplateElement(html);
        return cache;
    }

    static resolveNode(
        tpl: TemplateDecl,
        cache: TemplateCache,
        indexPath: number[],
        isRoot: boolean = false
    ): string {
        const name = isRoot ? 'root' : tpl.name;
        const hasChildren = (tpl.children && tpl.children.length > 0) || false;
        const isComponent = !!tpl.type;

        if (name) {
            const meta = this.CreateNodeMeta(tpl);
            cache.names.push(name);
            cache.indexs[name] = indexPath;
            cache.nodes[name] = meta;

            if (meta.i18n) {
                cache.i18ns.push(name); // i18n
            }

            if (isComponent) {
                cache.childComponents.push(name);
                return `<div class="${SKELETON_CLS}"></div>`;
            }
        }

        let html = this.buildHtml(tpl, tpl.tag || 'div', hasChildren);

        if (tpl.children) {
            const childHtmls: string[] = [];
            for (let i = 0; i < tpl.children.length; i++) {
                const child = tpl.children[i];
                const newIndexPath = [...indexPath, i];
                childHtmls.push(this.resolveNode(child, cache, newIndexPath, false));
            }
            html = html.replace(CHILDREN_PLACEHOLDER, childHtmls.join(''));
        }

        return html;
    }

    /**
     * 构建节点 HTML
     */
    static buildHtml(tpl: TemplateDecl, tag: string, hasChildren: boolean): string {
        const placeholder = hasChildren ? CHILDREN_PLACEHOLDER : '';
        const htmlAttrs: string[] = [];

        if (tpl.attributes) {
            for (const [key, val] of Object.entries(tpl.attributes)) {
                if (val === undefined || val === null) continue;

                htmlAttrs.push(`${key}="${string.escapeHtml(String(val))}"`);
            }
        }

        if (tpl.style) {
            const style = StyleHelper.stringify(tpl.style);
            htmlAttrs.push(`style="${style}"`);
        }
        const cls = (tpl as any).cls;
        const classes = tpl.classes;
        let classStr: string | undefined;
        if (cls && classes) {
            const parts = Array.isArray(classes) ? [...classes] : [classes];
            parts.push(cls);
            classStr = parts.join(' ');
        } else if (cls) {
            classStr = cls;
        } else if (classes) {
            classStr = Array.isArray(classes) ? classes.join(' ') : classes;
        }
        if (classStr) {
            htmlAttrs.push(`class="${classStr}"`);
        }

        const attrStr = htmlAttrs.length > 0 ? ' ' + htmlAttrs.join(' ') : '';
        const text = tpl.options?.text ? string.escapeHtml(tpl.options.text) : ''; // 文本内容
        const inner = text ? text + placeholder : placeholder;

        return VOID_TAGS.has(tag.toLowerCase())
            ? `<${tag}${attrStr} />`
            : `<${tag}${attrStr}>${inner}</${tag}>`;
    }

    /**
     * 创建节点元数据
     */
    static CreateNodeMeta(tpl: TemplateDecl): NodeMeta {
        return {
            tag: tpl.tag,
            type: tpl.type,
            i18n: tpl.i18n,
            permission: tpl.permission,
            isComponent: !!tpl.type,
            options: tpl.options,
            attributes: tpl.attributes,
            style: tpl.style,
            classes: tpl.classes,
        };
    }

    private static createTemplateElement(html: string): HTMLTemplateElement {
        const template = document.createElement('template');
        template.innerHTML = html;
        return template;
    }
}
