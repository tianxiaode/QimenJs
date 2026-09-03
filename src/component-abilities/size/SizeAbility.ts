/**
 * SizeAbility — 尺寸分档能力
 *
 * 为组件提供 size getter/setter，自动管理 CSS 类名切换。
 * 默认三档 sm/md/lg，默认值 md。
 * CSS 类名约定：q-{type}--{size}（如 q-avatar--sm）。
 *
 * 使用方式：
 * 1. 组件声明 .with([SizeAbility])
 * 2. 构造时调用 initSize(config?) 初始化
 * 3. 通过 size getter/setter 读写当前尺寸
 *
 * @example
 * ```ts
 * const Avatar = class extends Component {};
 * Avatar.useTemplate(TPL);
 * Avatar.with([SizeAbility]);
 *
 * // body 中
 * onAfterInit(props) {
 *     this.initSize();
 * }
 *
 * // 外部切换
 * avatar.size = 'lg';  // 自动移除 q-avatar--md，添加 q-avatar--lg
 * ```
 */

import type { AbilityDefinition } from '@/composable';

export const SizeAbility = {
    _onSizeOptionChange(value: string, old: string) {
        const oldCls = this._composeStateCls('size', old, false);
        const cls = this._composeStateCls('size', value, false);
        this._applyNewCls(cls, oldCls); // 移除旧类，添加新类
    },
} satisfies AbilityDefinition;
