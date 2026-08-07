/**
 * DecomposeEngine — 拆解引擎
 *
 * 专门处理模板节点的字段拆解和分类
 *
 * 设计理念：
 * - 子组件自己处理配置，父组件只管 tag 节点
 * - 无 name 节点：props 和 attrs 直接写入 HTML
 * - 有 name 节点：props 和 attrs 保存到 meta
 * - 组件字段也拆分为 props、attrs、config
 *
 * @module DecomposeEngine
 */

import type { TplNode } from '../types/tpl-node-types';
import type { NodeMetadata } from '../types/compiled-types';

const I18N_PREFIX = 'i18n:';

/** HTML 标准属性集合 */
const HTML_PROPS_SET = new Set([
    // 通用属性
    'id',
    'class',
    'style',
    'title',
    'lang',
    'dir',
    'hidden',
    'tabindex',
    'accesskey',
    'contenteditable',
    'draggable',
    'spellcheck',
    'translate',
    // 表单属性
    'name',
    'value',
    'placeholder',
    'disabled',
    'readonly',
    'required',
    'checked',
    'selected',
    'multiple',
    'maxlength',
    'minlength',
    'pattern',
    'autocomplete',
    'autofocus',
    'form',
    'formaction',
    'formenctype',
    'formmethod',
    'formnovalidate',
    'formtarget',
    'list',
    'step',
    'min',
    'max',
    // 链接和图像属性
    'href',
    'target',
    'rel',
    'download',
    'src',
    'alt',
    'width',
    'height',
    'loading',
    'decoding',
    'srcset',
    'sizes',
    'usemap',
    'ismap',
    // 音视频属性
    'autoplay',
    'controls',
    'loop',
    'muted',
    'preload',
    'poster',
    'playsinline',
    // 其他
    'colspan',
    'rowspan',
    'headers',
    'scope',
    'datetime',
    'cite',
    'data',
    'label',
    'open',
    'reversed',
    'start',
    'wrap',
    'accept',
    'accept-charset',
    'action',
    'enctype',
    'method',
    'novalidate',
    'for',
    'span',
    'summary',
]);

/** 拆解结果 */
export interface DecomposeResult {
    meta: NodeMetadata;
    html: string; // HTML 代码（无论有无 name）
    i18nKeys?: Array<{ field?: string; i18nKey: string }>;
}

/**
 * 拆解引擎
 */
export class DecomposeEngine {
    /**
     * 拆解节点字段
     *
     * @param node - 原始模板节点
     * @param name - 节点名称（可选）
     * @returns 拆解结果
     */
    static decompose(node: TplNode, name?: string): DecomposeResult {
        // 1. 浅克隆原始配置
        const clone = { ...node } as Record<string, any>;

        // 2. 提取 tag/name/type 到 meta
        const meta: NodeMetadata = {
            name: name || '',
            props: {},
            attrs: {},
            config: {},
        };

        if (clone.tag) {
            meta.tag = clone.tag;
            delete clone.tag;
        }

        if (clone.type) {
            meta.type = typeof clone.type === 'string' ? clone.type : undefined;
            if (typeof clone.type === 'function') {
                meta.componentClass = clone.type;
            } else if (typeof clone.type === 'string') {
                meta.componentClass = (window as any)[clone.type];
            }
            delete clone.type;
        }

        delete clone.name;

        // 3. 判断是否是无 name 节点
        const hasName = !!name;
        const isComponent = !!meta.componentClass || !!meta.type;

        // 4. 提取 style
        if (clone.style !== undefined) {
            meta.props = meta.props || {};
            meta.props.style = clone.style;
            delete clone.style;
        }

        // 5. 提取 attrs
        if (clone.attrs !== undefined && typeof clone.attrs === 'object') {
            meta.attrs = { ...clone.attrs };
            delete clone.attrs;
        }

        // 6. 提取 hidden 和 hiddenMode
        if (clone.hidden !== undefined) {
            meta.props = meta.props || {};
            meta.props.hidden = clone.hidden;
            delete clone.hidden;
        }

        if (clone.hiddenMode !== undefined) {
            meta.props = meta.props || {};
            meta.props.hiddenMode = clone.hiddenMode;
            delete clone.hiddenMode;
        }

        // 7. 提取 cls
        if (clone.cls !== undefined) {
            meta.props = meta.props || {};
            meta.props.className = clone.cls;
            delete clone.cls;
        }

        // 8. 提取 text（特殊处理 i18n）
        const i18nKeys: Array<{ field?: string; i18nKey: string }> = [];
        if (clone.text !== undefined) {
            if (isComponent) {
                // 组件：text → config
                meta.config = meta.config || {};
                meta.config.text = clone.text;
            } else {
                // tag：text → meta.text
                meta.text = clone.text;
            }

            // 检查 i18n 前缀
            if (typeof clone.text === 'string' && clone.text.startsWith(I18N_PREFIX)) {
                i18nKeys.push({ field: 'text', i18nKey: clone.text.slice(I18N_PREFIX.length) });
            }

            delete clone.text;
        }

        // 9. 循环遍历剩余字段
        for (const [key, val] of Object.entries(clone)) {
            if (val === undefined) continue;
            if (key === 'children' || key === 'fragment') continue;

            if (isComponent) {
                // 组件：所有字段 → config
                meta.config = meta.config || {};
                meta.config[key] = val;
            } else {
                // tag：按字段类型分类
                if (DEFAULT_NODE_PROP_MAP[key]) {
                    // htmlProps → props
                    meta.props = meta.props || {};
                    meta.props[key] = val;
                } else if (key === 'role') {
                    // role → attrs
                    meta.attrs = meta.attrs || {};
                    meta.attrs.role = val;
                } else {
                    // 其他字段 → attrs
                    meta.attrs = meta.attrs || {};
                    meta.attrs[key] = val;
                }
            }

            // 检查 i18n 前缀
            if (typeof val === 'string' && val.startsWith(I18N_PREFIX)) {
                i18nKeys.push({ field: key, i18nKey: val.slice(I18N_PREFIX.length) });
            }
        }

        // 10. 构建结果
        const result: DecomposeResult = { meta };

        if (i18nKeys.length > 0) {
            result.i18nKeys = i18nKeys;
        }

        // 无 name 节点：构建完整 HTML
        if (!hasName) {
            result.html = DecomposeEngine.buildHTML(meta);
        }

        return result;
    }

    /**
     * 构建无 name 节点的 HTML
     *
     * @param meta - 节点元数据
     * @returns HTML 字符串
     */
    private static buildHTML(meta: NodeMetadata): string {
        if (meta.componentClass || meta.type) {
            // 组件：生成占位符
            return '<cmp class="q-skeleton"></cmp>';
        }

        const tag = meta.tag || 'div';
        const attrs: string[] = [];

        // 添加 className
        if (meta.props?.className) {
            attrs.push(`class="${escapeHtml(meta.props.className)}"`);
        }

        // 添加 style
        if (meta.props?.style) {
            attrs.push(`style="${escapeHtml(meta.props.style)}"`);
        }

        // 添加 hidden
        if (meta.props?.hidden) {
            attrs.push('hidden');
        }

        // 添加其他 attrs
        if (meta.attrs) {
            for (const [key, val] of Object.entries(meta.attrs)) {
                if (val === true) {
                    attrs.push(escapeHtml(key));
                } else if (val !== false && val != null) {
                    attrs.push(`${escapeHtml(key)}="${escapeHtml(String(val))}"`);
                }
            }
        }

        const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

        // 处理 text 内容
        const text = meta.text ? escapeHtml(meta.text) : '';

        // 自闭合标签
        const voidTags = new Set([
            'area',
            'base',
            'br',
            'col',
            'embed',
            'hr',
            'img',
            'input',
            'link',
            'meta',
            'param',
            'source',
            'track',
            'wbr',
        ]);
        if (voidTags.has(tag.toLowerCase())) {
            return `<${tag}${attrStr} />`;
        }

        return `<${tag}${attrStr}>${text}</${tag}>`;
    }
}

/**
 * HTML 转义
 */
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
