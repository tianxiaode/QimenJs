/**
 * Layout key 常量统一定义
 *
 * PositionProps / AccessibilityProps / TooltipProps / AnimationProps 的 key 列表，
 * 以及框架保留字集合。供 InitAbility、ChildrenAbility 等消费方统一导入，
 * 避免多处重复定义。
 */

/**
 * PositionProps 的所有 key 列表
 *
 * 这些属性直接保留在 LayoutNode 顶层，不归入 props。
 */
export const POSITION_KEYS = [
    'x', 'y', 'top', 'left', 'bottom', 'right',
    'width', 'height',
    'minWidth', 'maxWidth', 'minHeight', 'maxHeight',
    'margin', 'padding',
    'scrollable', 'center',
    'hideMode',
    'alwaysOnTop', 'fullscreen',
    'shadow',
    'focused',
    'tabIndex', 'zIndex',
] as const;

/**
 * AccessibilityProps 的所有 key 列表
 *
 * ARIA 无障碍属性直接保留在 LayoutNode 顶层，不归入 props。
 */
export const ACCESSIBILITY_KEYS = [
    'role',
    'ariaLabel', 'ariaDescribedBy', 'ariaLabelledBy', 'ariaHidden',
    'ariaDisabled', 'ariaExpanded', 'ariaSelected', 'ariaPressed',
    'ariaRequired', 'ariaInvalid', 'ariaLive', 'ariaControls',
    'ariaOwns', 'ariaHasPopup', 'ariaCurrent', 'ariaLevel',
    'ariaValueText', 'ariaValueMin', 'ariaValueMax', 'ariaValueNow',
    'ariaModal', 'ariaReadOnly', 'ariaAutoComplete', 'ariaErrorMessage',
    'ariaRowCount', 'ariaColCount', 'ariaRowIndex', 'ariaColIndex',
    'ariaRowSpan', 'ariaColSpan', 'ariaSetSize', 'ariaPosInSet',
] as const;

/**
 * TooltipProps 的所有 key 列表
 *
 * Tooltip 属性直接保留在 LayoutNode 顶层，不归入 props。
 */
export const TOOLTIP_KEYS = [
    'tooltip', 'tooltipPlacement', 'tooltipOffset',
    'tooltipShowDelay', 'tooltipHideDelay', 'tooltipMaxWidth', 'tooltipType',
] as const;

/**
 * BadgeProps 的所有 key 列表
 *
 * Badge 属性直接保留在 LayoutNode 顶层，不归入 props。
 */
export const BADGE_KEYS = [
    'badge', 'badgeType', 'badgePlacement', 'badgeTypeOverride',
] as const;

/**
 * AnimationProps 的所有 key 列表
 *
 * 动画属性直接保留在 LayoutNode 顶层，不归入 props。
 */
export const ANIMATION_KEYS = [
    'enterAnimation', 'enterAnimationOptions',
    'leaveAnimation', 'leaveAnimationOptions',
    'animationEnabled',
] as const;

/**
 * DragProps 的所有 key 列表
 *
 * 拖拽属性直接保留在 LayoutNode 顶层，不归入 props。
 */
export const DRAG_KEYS = [
    'draggable', 'dragAxis', 'dragHandle', 'dragBounds', 'dragActiveClass', 'dragGrid',
] as const;

/**
 * DropProps 的所有 key 列表
 *
 * 放置属性直接保留在 LayoutNode 顶层，不归入 props。
 */
export const DROP_KEYS = [
    'droppable', 'dropAccept', 'dropActiveClass',
] as const;

/**
 * StyleProps 的 key 列表
 */
export const STYLE_KEYS = [
    'className', 'style',
] as const;

/**
 * ColorVariantProps 的 key 列表
 *
 * 颜色变体属性直接保留在 LayoutNode 顶层，不归入 props。
 */
export const COLOR_VARIANT_KEYS = [
    'colorVariant', 'colorVariantText',
] as const;

/**
 * ExpandableProps 的 key 列表
 *
 * 展开/折叠属性直接保留在 LayoutNode 顶层，不归入 props。
 */
export const EXPANDABLE_KEYS = [
    'expandable',
] as const;

/**
 * 框架保留字集合
 *
 * 这些顶层字段有特殊语义，不会自动归入 props。
 */
export const RESERVED_KEYS = new Set([
    'type', 'id', 'field', 'children', 'handlers', 'bridges', 'extraFns', 'abilities', 'meta',
    'visible', 'repeat', 'responsive', 'lifecycle', 'props',
    // EntityProps
    'entity',
    // PermissionProps
    'permission',
    // StyleProps
    ...STYLE_KEYS,
    // ColorVariantProps
    ...COLOR_VARIANT_KEYS,
    // PositionProps
    ...POSITION_KEYS,
    // AccessibilityProps
    ...ACCESSIBILITY_KEYS,
    // TooltipProps
    ...TOOLTIP_KEYS,
    // BadgeProps
    ...BADGE_KEYS,
    // AnimationProps
    ...ANIMATION_KEYS,
    // DragProps
    ...DRAG_KEYS,
    // DropProps
    ...DROP_KEYS,
    // ExpandableProps
    ...EXPANDABLE_KEYS,
]);

/**
 * 所有已知 Props key 集合（RESERVED_KEYS 之外的顶层属性）
 *
 * 这些属性直接保留在 LayoutNode 顶层，不归入 props。
 * 合并 POSITION_KEYS + ACCESSIBILITY_KEYS + TOOLTIP_KEYS + ANIMATION_KEYS。
 */
export const KNOWN_PROP_KEYS = new Set<string>([
    ...POSITION_KEYS,
    ...ACCESSIBILITY_KEYS,
    ...TOOLTIP_KEYS,
    ...BADGE_KEYS,
    ...ANIMATION_KEYS,
    ...DRAG_KEYS,
    ...DROP_KEYS,
    ...COLOR_VARIANT_KEYS,
    ...EXPANDABLE_KEYS,
]);
