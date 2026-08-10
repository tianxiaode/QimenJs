/**
 * DecomposeEngine — 拆解引擎（管线提取模式）
 *
 * 专门处理模板节点的字段拆解和分类
 *
 * 设计理念：
 * - 子组件自己处理配置，父组件只管 tag 节点
 * - 无 name 节点：props 和 attrs 直接写入 HTML
 * - 有 name 节点：props 和 attrs 保存到 meta
 * - 组件字段也拆分为 props、attrs、config
 *
 * 采用管线提取模式，将拆解过程分解为多个独立步骤
 *
 * @module DecomposeEngine
 */

import { STYLE_PROPS, VOID_TAGS } from '../constants';
import { string } from '@qimenjs/utils';
import {
    ComponentOptions,
    DecomposeContext,
    DecomposeStep,
    TplDecl,
    NodeAttributes,
} from '../types';
import { styleToString } from './utils';

/**
 * 步骤1：提取 tag
 *
 * @param ctx - 拆解上下文
 */
function _extract_tag(ctx: DecomposeContext): void {
    ctx.meta.tag = ctx.clone.tag;
    delete ctx.clone.tag;
}

/**
 * 步骤2：提取 type（组件类型）
 *
 * @param ctx - 拆解上下文
 */
function _extract_type(ctx: DecomposeContext): void {
    ctx.meta.type = ctx.clone.type;
    ctx.isComponent = !!ctx.meta.type;
    delete ctx.clone.type;
}

/**
 * 步骤3：提取 contentMode
 *
 *  @param ctx - 拆解上下文
 */

function _extract_contentMode(ctx: DecomposeContext): void {
    ctx.meta.contentMode = ctx.clone.contentMode;
    delete ctx.clone.contentMode;
}

/**
 * 步骤4：提取 style
 *
 * @param ctx - 拆解上下文
 */
function _extract_style(ctx: DecomposeContext): void {
    ctx.nodeAttributes.style = ctx.clone.style;
    delete ctx.clone.style;
}

/**
 * 步骤5：提取 cssVars（自定义 CSS 变量）
 *
 * 将 cssVars 对象转为 CSS 变量声明，合并到 style 前部
 * （变量声明在前，后续样式可引用）。在 _extract_style 之后执行。
 *
 * @param ctx - 拆解上下文
 */
function _extract_cssVars(ctx: DecomposeContext): void {
    const cssVars = ctx.clone.cssVars;
    if (!cssVars) return;
    Object.assign(ctx.nodeAttributes.style!, cssVars);
    delete ctx.clone.cssVars;
}
/**
 * 步骤6：提取 hidden 和 hiddenMode
 *
 * @param ctx - 拆解上下文
 */
function _extract_hidden(ctx: DecomposeContext): void {
    ctx.meta.hidden = ctx.clone.hidden;
    ctx.meta.hiddenMode = ctx.clone.hiddenMode;
    delete ctx.clone.hidden;
    delete ctx.clone.hiddenMode;
}

/**
 * 步骤7：提取 hint（提示文本，支持 i18n）
 *
 * @param ctx - 拆解上下文
 */
function _extract_hint(ctx: DecomposeContext) {
    const hint = ctx.clone.hint;
    //给节点初始值
    if (ctx.meta.tag === 'img') {
        ctx.nodeAttributes.alt = hint;
    } else {
        ctx.nodeAttributes.title = hint;
    }
    delete ctx.clone.hint;
}

/**
 * 步骤8：提取 cls（类名）
 *
 * @param ctx - 拆解上下文
 */
function _extract_cls(ctx: DecomposeContext): void {
    ctx.nodeAttributes.className = ctx.clone.cls;
    delete ctx.clone.cls;
}

/**
 * 步骤9：提取 text
 *
 * @param ctx - 拆解上下文
 */
function _extract_text(ctx: DecomposeContext): void {
    const text = ctx.clone.text;
    ctx.meta.text = text;

    delete ctx.clone.text;
}

/**
 * 步骤10：提取 i18n
 *
 * @param ctx - 拆解上下文
 */
function _extract_i18n(ctx: DecomposeContext): void {
    const i18n = ctx.clone.i18n;
    if (!i18n) return;

    ctx.i18n = i18n;

    delete ctx.clone.i18n;
}

/**
 * 步骤11：提取权限
 *
 * @param ctx - 拆解上下文
 */
function _extract_permission(ctx: DecomposeContext): void {
    const permission = ctx.clone.permission;
    if (!permission) return;

    ctx.permission = permission;

    delete ctx.clone.permission;
}

/**
 * 步骤12：分类剩余字段
 *
 * @param ctx - 拆解上下文
 */
function _classify_remaining_fields(ctx: DecomposeContext): void {
    for (const [key, val] of Object.entries(ctx.clone)) {
        if (STYLE_PROPS.has(key)) {
            ctx.nodeAttributes.style![key] = val;
            continue;
        }

        if (key.startsWith('data_') || key.startsWith('aria_')) {
            ctx.nodeAttributes[key.replace('_', '-')] = val;
            continue;
        }

        ctx.options[key] = val;
    }
}

/**
 * 步骤12：构建 构建HTML
 *
 * @param ctx - 拆解上下文
 */
function _build_html(ctx: DecomposeContext): void {
    const tag = ctx.meta.tag ?? 'div';
    const meta = ctx.meta;

    if (ctx.isComponent) {
        ctx.html = `<cmp class="q-skeleton"></cmp>`;
        return;
    }

    const hasChildren = !!(ctx.node!.children && ctx.node!.children.length > 0);
    const placeholder = hasChildren ? '<!--q-children-->' : '';

    if (ctx.hasName) {
        ctx.html = `<${tag}>${placeholder}</${tag}>`;
        return;
    }

    const attrs = ctx.nodeAttributes;
    const attrParts: string[] = [];

    if (attrs.className) {
        attrParts.push(`class="${string.escapeHtml(attrs.className)}"`);
    }

    if (attrs.style) {
        const styleStr = typeof attrs.style === 'string' ? attrs.style : styleToString(attrs.style);
        if (styleStr) {
            attrParts.push(`style="${string.escapeHtml(styleStr)}"`);
        }
    }

    if (attrs.hidden) {
        attrParts.push('hidden');
    }

    for (const [key, val] of Object.entries(attrs)) {
        if (key === 'className' || key === 'style') continue;
        if (val === true) {
            attrParts.push(string.escapeHtml(key));
        } else if (val !== false && val != null) {
            attrParts.push(`${string.escapeHtml(key)}="${string.escapeHtml(String(val))}"`);
        }
    }

    const attrStr = attrParts.length > 0 ? ' ' + attrParts.join(' ') : '';
    const text = meta.text ? string.escapeHtml(meta.text) : '';
    const inner = text + placeholder;

    ctx.html = VOID_TAGS.has(tag.toLowerCase())
        ? `<${tag}${attrStr} />`
        : `<${tag}${attrStr}>${inner}</${tag}>`;
}

/** 拆解管线步骤列表 */
const DECOMPOSE_NODE_STEPS: DecomposeStep[] = [
    _extract_tag,
    _extract_type,
    _extract_contentMode,
    _extract_style,
    _extract_cssVars,
    _extract_hidden,
    _extract_hint,
    _extract_cls,
    _extract_text,
    _extract_i18n,
    _extract_permission,
    _classify_remaining_fields,
    _build_html,
];

export const DECOMPOSE_OPTIONS_STEPS: DecomposeStep[] = [
    _extract_style,
    _extract_cssVars,
    _extract_hidden,
    _extract_hint,
    _extract_cls,
    _extract_text,
    _extract_i18n,
    _extract_permission,
    _classify_remaining_fields,
];

// DecomposeEngine.ts

/**
 * 拆解引擎
 *
 * 支持两种输入：
 * 1. TplNode - 模板节点（编译时）
 * 2. ComponentOptions - 组件选项（运行时）
 */
export class DecomposeEngine {
    /**
     * 从 TplNode 拆解
     */
    static decompose(node: TplDecl): DecomposeContext {
        const clone = { ...node };
        const name = clone.name ?? '';
        const ctx: DecomposeContext = {
            name,
            node, // 保存原始节点引用
            clone: clone,
            meta: { name },
            html: '',
            hasName: !!clone.name,
            isComponent: false,
            nodeAttributes: { style: {} } as NodeAttributes,
            options: {},
        };

        // 删除已提取的字段
        delete clone.name;
        delete clone.permission;
        delete clone.action;

        // 执行拆解管线
        for (const step of DECOMPOSE_NODE_STEPS) {
            step(ctx);
        }

        return ctx;
    }

    /**
     * 从 ComponentOptions 拆解（运行时）
     */
    static decomposeOptions(options: ComponentOptions): DecomposeContext {
        const clone = { ...options };
        const name = clone.name ?? '';
        const ctx: DecomposeContext = {
            name,
            clone: clone,
            meta: { name },
            html: '',
            hasName: !!clone.name,
            isComponent: false,
            nodeAttributes: { style: {} } as NodeAttributes,
            options: { ...options }, // 保存原始选项
        };

        // 删除已提取的字段
        delete clone.name;
        delete clone.permission;
        delete clone.action;

        // 执行拆解管线
        for (const step of DECOMPOSE_OPTIONS_STEPS) {
            step(ctx);
        }

        return ctx;
    }
}
