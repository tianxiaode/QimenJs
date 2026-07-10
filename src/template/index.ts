/**
 * @qimenjs/template - 模板管理
 *
 * 提供模板注册器，统一管理 HTML 模板和 JSON 组件定义的注册与检索。
 * 引入即自动注册组件预设模板。
 *
 * @example
 * ```typescript
 * import '@qimenjs/template';
 *
 * // HTML 模板
 * import { TemplateRegistrar } from '@qimenjs/template';
 * const fragment = TemplateRegistrar.getInstance().getFragment('Button');
 *
 * // JSON 组件定义
 * TemplateRegistrar.getInstance().registerJson('UserGrid', {
 *     type: 'Grid',
 *     entity: 'UserManager',
 *     props: { columns: [...] }
 * });
 * const layout = TemplateRegistrar.getInstance().getJson('UserGrid');
 *
 * // 使用插槽常量
 * import { Slot } from '@qimenjs/template';
 * `<span data-content="${Slot.INPUT_LABEL}"></span>`
 * ```
 */

// TemplateRegistrar 核心
export { TemplateRegistrar, TemplateRegistrarName } from './TemplateRegistrar';
export type { TemplateEntry } from './TemplateRegistrar';

// 模板常量（Area, Name, Slot, Event）
export { Area, Name, Slot, Event } from './constants';
export type { AreaType, NameType, SlotType, EventType } from './constants';

// 预定义模板常量
export {
    BUTTON_TEMPLATE,
    INPUT_TEMPLATE,
    INPUT_TOP_TEMPLATE,
    SELECT_TEMPLATE,
    TOOLBAR_TEMPLATE,
    ICON_TEMPLATE,
    TEXT_TEMPLATE,
    TABLE_TEMPLATE,
    DIALOG_TEMPLATE,
    TIPS_TEMPLATE,
    DROPDOWN_TEMPLATE,
    POPOVER_TEMPLATE,
    TOAST_TEMPLATE,
    TOAST_NOTIFICATION_TEMPLATE,
    MSGBOX_TEMPLATE,
    COMPONENT_TEMPLATES,
} from './presets';

// 自动注册（必须在最后，触发 registerComponentTemplates）
export { registerComponentTemplates } from './register';
