/**
 * 组件 HTML 模板预设
 *
 * 定义各组件的 HTML 模板字符串，包含 data-content 标记的内容项。
 * ContentManager 在运行时通过 data-content 查找元素并分配唯一 id。
 */

/**
 * 按钮模板
 *
 * 内容项：
 * - icon:default — 图标
 * - text:default — 文本
 */
export const BUTTON_TEMPLATE = `
    <span data-content="icon:default"></span>
    <span data-content="text:default"></span>
`;

/**
 * 输入框模板
 *
 * 内容项：
 * - text:default — 标签文本
 * - input — 输入框
 * - error — 错误提示
 */
export const INPUT_TEMPLATE = `
    <span data-content="text:default"></span>
    <input data-ref="input" class="q-input__field" />
    <span data-ref="error" class="q-input__error"></span>
`;

/**
 * 下拉选择模板
 *
 * 内容项：
 * - text:default — 标签文本
 * - select — 下拉框
 */
export const SELECT_TEMPLATE = `
    <span data-content="text:default"></span>
    <select data-ref="select" class="q-select__field"></select>
`;

/**
 * 所有组件模板预设
 *
 * key 为组件类型（对应 ComponentTypes），value 为 HTML 模板字符串
 */
export const COMPONENT_TEMPLATES: Record<string, string> = {
    Button: BUTTON_TEMPLATE,
    Input: INPUT_TEMPLATE,
    Select: SELECT_TEMPLATE,
};
