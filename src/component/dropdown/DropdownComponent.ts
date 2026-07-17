/**
 * DropdownComponent — ButtonComponent 的别名
 *
 * 语义上表示下拉按钮，实现上完全复用 ButtonComponent。
 * Button 已内置 dropIcon 节点，使用方通过 childProps 激活并组合浮层。
 *
 * @example
 * ```ts
 * new DropdownComponent({
 *     childProps: {
 *         text: { props: { innerHTML: '文件' } },
 *         dropIcon: { props: { hidden: false } },
 *     }
 * })
 * ```
 */

import { ButtonComponent } from '../button/ButtonComponent';

export const DropdownComponent = ButtonComponent;

export type DropdownComponent = ButtonComponent;