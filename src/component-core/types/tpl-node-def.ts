/**
 * TplNode 字段定义 — 单一真相源
 *
 * 明确 TplNode 的每个字段属于哪个分类、被谁消费。
 * META_COPY_KEYS / ROOT_COPY_KEYS 等常量从此处派生，
 * 加字段只改这里，不需要多处同步。
 *
 * 字段分类：
 * - identity:  节点标识（tag/type/name），编译时直接处理，不复制
 * - event:     事件声明（events），编译时由 compileEvents 处理
 * - style:     样式/布局（className/style/layout/gap/align/pack/wrap），
 *              编译时存原始值，运行时由 applyStyle 应用
 * - content:   内容（text/i18n），运行时由 content-properties getter/setter 处理
 * - dom:       DOM 属性（attrs/hidden），运行时通过 DOM API 设置
 * - component: 组件专属（replace/props），编译时特殊处理
 * - children:  子节点（children），编译时递归处理
 * - deprecated:已废弃（forward）
 */

export interface TplNodeFieldDef {
    field: string;
    category:
        | 'identity'
        | 'event'
        | 'style'
        | 'content'
        | 'dom'
        | 'component'
        | 'children'
        | 'deprecated';
    toMeta: boolean;
    toRoot: boolean;
    metaKey?: string;
}

export const TPL_NODE_FIELDS: readonly TplNodeFieldDef[] = [
    { field: 'tag', category: 'identity', toMeta: false, toRoot: false },
    { field: 'type', category: 'identity', toMeta: false, toRoot: false },
    { field: 'name', category: 'identity', toMeta: false, toRoot: false },
    { field: 'events', category: 'event', toMeta: false, toRoot: false },
    { field: 'className', category: 'style', toMeta: true, toRoot: true },
    { field: 'style', category: 'style', toMeta: true, toRoot: true },
    { field: 'layout', category: 'style', toMeta: true, toRoot: true },
    { field: 'gap', category: 'style', toMeta: true, toRoot: true },
    { field: 'align', category: 'style', toMeta: true, toRoot: true },
    { field: 'pack', category: 'style', toMeta: true, toRoot: true },
    { field: 'wrap', category: 'style', toMeta: true, toRoot: true },
    { field: 'i18n', category: 'content', toMeta: true, toRoot: false, metaKey: 'i18nKey' },
    { field: 'text', category: 'content', toMeta: true, toRoot: false },
    { field: 'hidden', category: 'dom', toMeta: true, toRoot: false },
    { field: 'attrs', category: 'dom', toMeta: true, toRoot: false },
    { field: 'replace', category: 'component', toMeta: false, toRoot: false },
    { field: 'props', category: 'component', toMeta: true, toRoot: false },
    { field: 'children', category: 'children', toMeta: false, toRoot: false },
    { field: 'forward', category: 'deprecated', toMeta: false, toRoot: false },
] as const;

export const META_COPY_KEYS = TPL_NODE_FIELDS.filter(f => f.toMeta).map(
    f => f.field
) as readonly string[];

export const ROOT_COPY_KEYS = TPL_NODE_FIELDS.filter(f => f.toRoot).map(
    f => f.field
) as readonly string[];
