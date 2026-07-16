/**
 * template-json.ts — 新模板编译
 *
 * 核心函数 compileTemplate：
 * 递归遍历 TplNode 树，一步到位产出：
 * - 干净 HTML（只有 class/style/attrs，无 data-content/data-event 等）
 * - indexPath（有 name 的节点在 DOM 树中的位置路径）
 * - nodeMetas（节点元信息：group/name/content/mode/events 等）
 * - domEventBindings（DOM 事件绑定，统一 handler/emits/bridges）
 * - componentMap（type 节点的组件类映射）
 *
 * 设计约定：
 * - 模板嵌套最多3层，超过就拆子组件（组件原子化）
 * - indexPath 最多3个数字，定位开销极小
 * - HTML 中不需要 data-* 属性回找节点，indexPath 已在拆解 JSON 时提取
 */

import type { TplNode, ComponentTemplate, ContentInfo, DomEventDecl } from './template-types';
import type { NodeIndexPath, NodeTemplateMeta } from './types';
import type { DomEventBinding } from './template-compiler';

// ─── compileTemplate 编译结果 ──────────────────────────────

/**
 * compileTemplate 编译结果
 *
 * 一步到位，供 withTemplate 直接使用，无需再走 precompileTemplate
 */
export interface CompiledTemplateResult {
    /** 干净 HTML 字符串（无 data-content/data-event 等属性） */
    html: string;
    /** 节点位置索引 — key=group:name, value=从根元素开始的子元素路径 */
    indexPath: NodeIndexPath;
    /** 节点模板元数据 — key=group:name */
    templateMetas: Record<string, NodeTemplateMeta>;
    /** 内容属性名列表（用于生成 getter/setter） */
    contentPropNames: string[];
    /** 内容节点信息数组 — 只收集有 content 语义的节点，运行时直接遍历 */
    contentInfos: ContentInfo[];
    /** 组件类映射 — name → ComponentClass */
    componentMap: Record<string, new (props?: Record<string, any>) => any>;
    /** 合并后的 DOM 事件绑定 — 同一 DOM 事件只绑定一次，统一处理 handler/emits/bridges */
    domEventBindings: DomEventBinding[];
    /** 根节点 className — 应用到组件 el 上 */
    rootClassName?: string;
    /** 根节点 style — 应用到组件 el 上 */
    rootStyle?: string;
    /** 自动收集的 expose 节点名列表 — autoExpose!==false 的 content 节点 */
    exposeNames: string[];
    /** v2: 组件 props 默认值定义 */
    propsDef?: Record<string, any>;
}

/**
 * 模板节点元数据 — 从 TplNode 提取，不含 DOM 引用
 */
export interface TplNodeMeta {
    /** nodeMap 索引键（name） */
    key: string;
    /** 名称 */
    name: string;
    /** 内容语义 */
    content?: string;
    /** 事件声明 — 统一使用 DomEventDecl 对象格式 */
    events?: Record<string, DomEventDecl>;
    /** 组件类型引用 */
    typeRef?: string;
    /** 组件挂载模式 */
    replace?: boolean;
    /** i18n key */
    i18n?: string;
    /** 初始隐藏 */
    hidden?: boolean;
    /** 内容操作模式 */
    mode: 'value' | 'src' | 'html';
    /** 子组件 props */
    props?: Record<string, any>;
}

// ─── 通用工具 ──────────────────────────────────────────────

/** 自闭合标签集合 */
const VOID_TAGS = new Set(['input', 'img', 'br', 'hr', 'col', 'area', 'base', 'embed', 'link', 'meta', 'param', 'source', 'track', 'wbr']);

/** 对齐映射 */
const ALIGN_MAP: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
};

/** 分布映射 */
const PACK_MAP: Record<string, string> = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
};

/**
 * 将布局属性转为 CSS 样式对象
 *
 * layout: 'hbox' → display:flex; flex-direction:row
 * layout: 'vbox' → display:flex; flex-direction:column
 * layout: 'fit'  → position:relative
 * layout: 'grid' → display:flex; flex-wrap:wrap
 * layout: 'center' → display:flex; align-items:center; justify-content:center
 */
function layoutToStyle(node: TplNode): Record<string, string> {
    if (!node.layout) return {};

    const style: Record<string, string> = {};

    switch (node.layout) {
        case 'hbox':
            style.display = 'flex';
            style['flex-direction'] = 'row';
            break;
        case 'vbox':
            style.display = 'flex';
            style['flex-direction'] = 'column';
            break;
        case 'fit':
            style.position = 'relative';
            break;
        case 'grid':
            style.display = 'flex';
            style['flex-direction'] = 'row';
            style['flex-wrap'] = 'wrap';
            break;
        case 'center':
            style.display = 'flex';
            style['align-items'] = 'center';
            style['justify-content'] = 'center';
            break;
    }

    // gap
    if (node.gap !== undefined) {
        style.gap = typeof node.gap === 'number' ? `${node.gap}px` : node.gap;
    }

    // align（交叉轴）
    if (node.align && ALIGN_MAP[node.align]) {
        style['align-items'] = ALIGN_MAP[node.align];
    }

    // pack（主轴）
    if (node.pack && PACK_MAP[node.pack]) {
        style['justify-content'] = PACK_MAP[node.pack];
    }

    // wrap
    if (node.wrap !== undefined && node.layout !== 'grid') {
        style['flex-wrap'] = node.wrap ? 'wrap' : 'nowrap';
    }

    return style;
}

/**
 * 推导内容操作模式
 */
function inferMode(tag?: string): 'value' | 'src' | 'html' {
    if (!tag) return 'html';
    const t = tag.toLowerCase();
    if (t === 'input' || t === 'select' || t === 'textarea') return 'value';
    if (t === 'img') return 'src';
    return 'html';
}

/**
 * 解析 name 为 group:name 格式
 *
 * - 'text' → { group: '_', name: 'text' }
 * - 'dialog:header' → { group: 'dialog', name: 'header' }
 */
function parseName(nameOrContent: string): { group: string; name: string } {
    const colonIndex = nameOrContent.indexOf(':');
    if (colonIndex === -1) {
        return { group: '_', name: nameOrContent };
    }
    return {
        group: nameOrContent.slice(0, colonIndex),
        name: nameOrContent.slice(colonIndex + 1),
    };
}

/**
 * 将 style 对象转为字符串
 */
function styleToString(style: Record<string, any>): string {
    return Object.entries(style)
        .map(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${cssKey}:${value}`;
        })
        .join(';');
}

/**
 * 合并节点 style 和布局样式，生成 style 属性字符串
 */
function buildStyleAttr(node: TplNode): string | undefined {
    const layoutStyle = layoutToStyle(node);
    const nodeStyle = typeof node.style === 'object' ? node.style : undefined;

    // 合并：布局样式 + 节点 style（节点 style 优先）
    const merged = { ...layoutStyle, ...nodeStyle };

    if (Object.keys(merged).length === 0) return undefined;

    // 如果节点 style 是字符串，追加到后面
    if (typeof node.style === 'string') {
        const objStr = styleToString(merged);
        return `${objStr};${node.style}`;
    }

    return styleToString(merged);
}

// ─── compileTemplate — 核心编译函数 ──────────────────────────

/**
 * 编译 ComponentTemplate — 一步到位
 *
 * 递归遍历 TplNode 树，产出干净 HTML + indexPath + 元数据 + 事件模板。
 * HTML 中不包含 data-content/data-event 等属性，
 * 所有元信息在拆解 JSON 时直接提取，存到静态属性上。
 *
 * tpl 根节点不生成 HTML 元素（根元素由组件的 tag 属性创建），
 * 只转换 tpl.children 为内部 HTML 片段。
 */
export function compileTemplate(template: ComponentTemplate, isMultiArea: boolean = false): CompiledTemplateResult {
    const indexPath: NodeIndexPath = {};
    const templateMetas: Record<string, NodeTemplateMeta> = {};
    const contentPropNames: string[] = [];
    const contentInfos: ContentInfo[] = [];
    const componentMap: Record<string, new (props?: Record<string, any>) => any> = {};
    const domEventBindings: DomEventBinding[] = [];

    // 根节点不生成 HTML，只转换 children
    // 但根节点的 className/style 需要提取，应用到组件 el 上
    const root = template.tpl;
    const rootClassName = root.className;
    const rootStyle = typeof root.style === 'string' ? root.style : root.style ? styleToString(root.style) : undefined;

    const children = template.tpl.children || [];
    const htmlParts: string[] = [];

    for (let i = 0; i < children.length; i++) {
        htmlParts.push(
            compileNode(children[i], [i], isMultiArea, {
                indexPath,
                templateMetas,
                contentPropNames,
                contentInfos,
                componentMap,
                domEventBindings,
            })
        );
    }

    // 自动收集 expose — 所有 content 子节点的 propName
    const exposeNames: string[] = [];
    for (const info of contentInfos) {
        if (info.propName) {
            exposeNames.push(info.propName);
        }
    }

    // v2: 提取 props 定义
    const propsDef = template.props;

    return {
        html: htmlParts.join(''),
        indexPath,
        templateMetas,
        contentPropNames,
        contentInfos,
        componentMap,
        domEventBindings,
        rootClassName,
        rootStyle,
        exposeNames,
        propsDef,
    };
}

/** 编译上下文 — 避免递归传参过多 */
interface CompileContext {
    indexPath: NodeIndexPath;
    templateMetas: Record<string, NodeTemplateMeta>;
    contentPropNames: string[];
    contentInfos: ContentInfo[];
    componentMap: Record<string, new (props?: Record<string, any>) => any>;
    /** 合并后的 DOM 事件绑定 — 同一 DOM 事件只绑定一次 */
    domEventBindings: DomEventBinding[];
}

/**
 * 递归编译单个 TplNode
 *
 * @param node - 模板节点
 * @param path - 当前节点在 DOM 树中的位置路径（从根元素的 children 开始）
 * @param isMultiArea - 是否多区域组件
 * @param ctx - 编译上下文
 * @returns 干净 HTML 字符串
 */
function compileNode(
    node: TplNode,
    path: number[],
    isMultiArea: boolean,
    ctx: CompileContext,
): string {
    // ─── type 节点（组件占位） ───

    if (node.type) {
        const nameStr = node.name || node.content || '';
        const { group, name } = nameStr ? parseName(nameStr) : { group: '_', name: '_' };
        // nodeMap 一级结构：key 直接用 name
        const key = name;

        // 记录 indexPath
        ctx.indexPath[key] = path;

        // 记录组件类映射
        if (typeof node.type === 'string') {
            ctx.componentMap[name] = (window as any)[node.type];
        } else if (typeof node.type === 'function') {
            ctx.componentMap[name] = node.type as any;
        }

        // 记录 templateMetas
        const mode = 'html' as const;
        ctx.templateMetas[key] = {
            raw: nameStr || key, name,
            jsonRef: typeof node.type === 'string' ? node.type : (node.type as any).name || 'Anonymous',
            jsonMode: node.replace !== undefined ? (node.replace ? 'replace' : 'child') : undefined,
            i18nKey: node.i18n,
            hidden: node.hidden,
            mode,
            props: node.props,
        };

        // 推导内容属性名
        const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
        const propName = isMultiArea
            ? `${group}${capitalName}`
            : name === '_' ? group : name;
        ctx.contentPropNames.push(propName);

        // 从子组件类读取 _expose（content 名列表，如 ['content']）
        // 运行时按规则自动生成 getter/setter：默认属性 + content 透传
        const componentClass = typeof node.type === 'function' ? node.type : null;
        const childExpose = componentClass ? (componentClass as any)._expose as string[] | undefined : undefined;

        ctx.contentInfos.push({
            group, name, mode,
            i18nKey: node.i18n,
            propName,
            isComponent: true,
            componentPropName: propName,
            expose: childExpose,
        });

        // 编译事件模板
        compileEvents(node, key, group, name, ctx);

        // 生成干净 HTML（只有 class/style，无 data-* 属性）
        const attrs: string[] = [];
        if (node.className) attrs.push(`class="${node.className}"`);
        const styleAttr = buildStyleAttr(node);
        if (styleAttr) attrs.push(`style="${styleAttr}"`);
        const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

        return `<div${attrStr}></div>`;
    }

    // ─── tag 节点（DOM 元素） ───

    const tag = node.tag || 'div';
    const attrs: string[] = [];

    // 有 name 或 content 的节点 → 记录到 indexPath + templateMetas
    const nameStr = node.name || node.content;
    if (nameStr) {
        const { group, name } = parseName(nameStr);
        // nodeMap 一级结构：key 直接用 name
        const key = name;

        // 记录 indexPath
        ctx.indexPath[key] = path;

        // 记录 templateMetas
        const mode = inferMode(tag);
        ctx.templateMetas[key] = {
            raw: nameStr, name,
            i18nKey: node.i18n,
            hidden: node.hidden,
            mode,
        };

        // 推导内容属性名
        const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
        const propName = isMultiArea
            ? `${group}${capitalName}`
            : name === '_' ? group : name;
        ctx.contentPropNames.push(propName);

        // 收集内容节点信息
        ctx.contentInfos.push({
            group, name, mode,
            i18nKey: node.i18n,
            propName,
        });

        // 编译事件模板
        compileEvents(node, key, group, name, ctx);
    }

    // 生成干净 HTML 属性（只有 class/style/attrs，无 data-* 属性）
    if (node.className) attrs.push(`class="${node.className}"`);
    const styleAttr = buildStyleAttr(node);
    if (styleAttr) attrs.push(`style="${styleAttr}"`);
    if (node.attrs) {
        for (const [key, value] of Object.entries(node.attrs)) {
            attrs.push(`${key}="${value}"`);
        }
    }

    const attrStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

    // 自闭合标签
    if (VOID_TAGS.has(tag)) {
        return `<${tag}${attrStr} />`;
    }

    // 子节点 + 文本
    const inner: string[] = [];
    if (node.text) inner.push(node.text);

    if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
            inner.push(
                compileNode(node.children[i], [...path, i], isMultiArea, ctx)
            );
        }
    }

    return `<${tag}${attrStr}>${inner.join('')}</${tag}>`;
}

/**
 * 编译节点的事件模板
 *
 * 从 TplNode 的 events（Record<string, DomEventDecl>）提取事件信息，
 * 直接生成 DomEventBinding（天然按 DOM 事件名聚合，无需合并去重）。
 */
function compileEvents(
    node: TplNode,
    key: string,
    group: string,
    name: string,
    ctx: CompileContext,
): void {    if (!node.events) return;

    for (const [domEvent, decl] of Object.entries(node.events)) {
        // ── 推导 handler 名 ──
        let handlerName: string | undefined;
        if (decl.handler === true) {
            // 自动推导：click → onClick
            const capitalEvent = domEvent.charAt(0).toUpperCase() + domEvent.slice(1);
            handlerName = `on${capitalEvent}`;
        } else if (typeof decl.handler === 'string') {
            handlerName = decl.handler;
        }

        // ── 生成 DomEventBinding ──
        const binding: DomEventBinding = {
            event: domEvent,
            nodeKey: key,
        };
        if (handlerName) binding.handler = handlerName;
        if (decl.once) binding.once = decl.once;
        if (decl.delegate) binding.delegate = decl.delegate;
        if (decl.delegateTarget) binding.delegateTarget = decl.delegateTarget;
        if (decl.debounce) binding.debounce = decl.debounce;
        if (decl.throttle) binding.throttle = decl.throttle;
        if (decl.emits?.length) binding.emits = decl.emits;
        if (decl.bridges?.length) binding.bridges = decl.bridges.map(b => ({ targetEvent: b }));

        ctx.domEventBindings.push(binding);
    }
}


