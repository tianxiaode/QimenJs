import { ComponentClass } from './core';
import {
    AnimationDecl,
    AttrDecl,
    BadgeDecl,
    DragDecl,
    DropDecl,
    BasePropertyDecl,
    HiddenDecl,
    I18nDecl,
    LoadingDecl,
    PermissionDecl,
    TooltipDecl,
} from './declarations';
import { IDialog, IIndicator, IPopover } from './interfaces';

/**
 * 模板节点定义（泛型）
 *
 * 所有功能模块通过泛型参数注入，保持核心定义干净
 */
export interface TplDecl extends AttrDecl, HiddenDecl, BasePropertyDecl {
    // ─── 标识 ───
    tag?: string;
    type?: ComponentClass;
    name?: string;

    // ─── 内容 ───
    i18n?: I18nDecl;
    permission?: PermissionDecl;

    // ─── 行为 ───
    drag?: boolean | DragDecl;
    drop?: boolean | DropDecl;
    animation?: AnimationDecl;

    // ─── 浮层 ───
    badge?: BadgeDecl | string | number | null;
    tooltip?: TooltipDecl | string | null;
    dialog?: IDialog | null;
    popover?: IPopover | null;

    // ─── 快捷标记 ───
    dragHandle?: boolean;
    dropZone?: boolean;

    // ─── 指示器 ───
    indicator?: IIndicator | null;

    /** loading配置 */
    loading?: LoadingDecl | boolean | string | null;
    // ─── 子节点 ───
    children?: TplDecl[];

    [key: string]: any;
}
