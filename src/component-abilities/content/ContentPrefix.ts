/**
 * 内容前缀常量
 *
 * 内置前缀必须通过常量引用，避免拼写错误。
 * 自定义前缀不受约束，仍可使用字符串字面量。
 *
 * @example
 * ```typescript
 * // 使用常量
 * static contentSlots = {
 *     [ContentPrefix.ICON]: ['default'],
 *     [ContentPrefix.TEXT]: ['default'],
 *     [ContentPrefix.TIPS]: ['default'],
 * };
 *
 * // 自定义前缀仍可用字符串
 * static contentSlots = {
 *     myCustomSlot: ['default'],
 * };
 * ```
 */

/**
 * 内容前缀常量对象
 */
export const ContentPrefix = {
    /** 图标内容前缀 */
    ICON: 'icon',
    /** 文本内容前缀 */
    TEXT: 'text',
    /** 提示浮层前缀 */
    TIPS: 'tips',
    /** 下拉菜单浮层前缀 */
    DROPDOWN: 'dropdown',
    /** 弹出框浮层前缀 */
    POPOVER: 'popover',
} as const;

/**
 * 内容前缀类型
 */
export type ContentPrefixType = (typeof ContentPrefix)[keyof typeof ContentPrefix];

/**
 * 浮层前缀集合
 *
 * OverlayAbility 通过此集合判断是否触发浮层创建。
 * 前缀在此集合中的 contentSlot 将自动创建浮层 DOM。
 */
export const OVERLAY_PREFIXES: ReadonlySet<string> = new Set([
    ContentPrefix.TIPS,
    ContentPrefix.DROPDOWN,
    ContentPrefix.POPOVER,
]);
