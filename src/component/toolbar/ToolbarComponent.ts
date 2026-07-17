/**
 * ToolbarComponent — ItemGroupComponent 的别名
 *
 * 语义上表示工具栏，实现上完全复用 ItemGroupComponent。
 * ItemGroup 已内置溢出处理（overflowMode: scroll/menu）。
 *
 * @example
 * ```ts
 * // 等价于 new ItemGroupComponent({ direction: 'horizontal', overflowMode: 'scroll', ... })
 * new ToolbarComponent({ direction: 'horizontal', overflowMode: 'scroll', items: [...] })
 * ```
 */

import { ItemGroupComponent } from '../itemgroup/ItemGroupComponent';
import type { OverflowMode } from '../itemgroup/ItemGroupComponent';

export type OverflowMode = OverflowMode;

export const ToolbarComponent = ItemGroupComponent;

export type ToolbarComponent = ItemGroupComponent;
