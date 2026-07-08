/**
 * 组件核心能力接口定义
 *
 * 为每个能力提供接口，方便类型标注和智能提示。
 * 组件可通过 implements 声明实现的能力接口。
 */

// ── 基础能力（BASE_ABILITIES，所有组件都有） ──

export type { IRenderAbility } from './IRenderAbility';
export type { ILifecycleAbility } from './ILifecycleAbility';
export type { IPositionAbility, HideMode } from './IPositionAbility';
export type { IStyleAbility } from './IStyleAbility';
export type { IThemeAbility } from './IThemeAbility';
export type { IEventBridgeAbility } from './IEventBridgeAbility';

// ── 按需能力（组件通过 static abilities 声明） ──

export type { IChildrenAbility } from './IChildrenAbility';
export type { IStateAbility } from './IStateAbility';
export type { IContentAbility } from './IContentAbility';

// ── 系统能力接口（来自 @qimenjs/system-abilities） ──
// IEventAbility、IDomEventsAbility 已在 system-abilities/interfaces 中定义
