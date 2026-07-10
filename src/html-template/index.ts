/**
 * @qimenjs/html-template - HTML 模板管理
 *
 * 提供 HTML 模板注册器，管理模板字符串的注册和检索。
 * 引入即自动注册组件预设模板。
 *
 * @example
 * ```typescript
 * import '@qimenjs/html-template';
 *
 * // 使用 HtmlTemplateRegistrar
 * import { HtmlTemplateRegistrar } from '@qimenjs/html-template';
 * const template = HtmlTemplateRegistrar.getInstance().get('Button');
 * const fragment = HtmlTemplateRegistrar.getInstance().getFragment('Button');
 *
 * // 使用插槽常量
 * import { Slot } from '@qimenjs/html-template';
 * `<span data-content="${Slot.INPUT_LABEL}"></span>`
 * ```
 */

// HtmlTemplateRegistrar 核心
export { HtmlTemplateRegistrar, HtmlTemplateRegistrarName } from './HtmlTemplateRegistrar';

// 模板常量（Area, Name, Slot）
export { Area, Name, Slot } from './constants';
export type { AreaType, NameType, SlotType } from './constants';

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
