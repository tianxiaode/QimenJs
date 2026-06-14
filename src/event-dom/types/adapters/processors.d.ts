/**
 * @file types.ts
 * @description
 * 定义手势处理器模块中使用的类型定义。
 *
 * 该文件包含手势输入、手势事件、约束条件等相关类型定义，
 * 为手势处理器提供统一的类型接口。
 */
import { GestureSemantic, InputSignal } from './map';
/**
 * 手势输入接口
 * 定义手势处理器接收的输入数据结构
 */
export interface GestureInput {
    signal: InputSignal;
    time: number;
    x?: number;
    y?: number;
    pointerType?: 'mouse' | 'pen' | 'touch';
    buttons?: number;
    originalEvent?: Event;
}
/**
 * 基础手势事件接口
 * 定义手势事件的基本结构
 */
export interface BaseGestureEmit {
    semantic: GestureSemantic;
    originalEvent?: Event;
}
/**
 * 手势阶段类型
 * 定义手势可能的阶段（开始、移动、结束、取消）
 */
export type GesturePhase = 'start' | 'move' | 'end' | 'cancel';
/**
 * 带阶段的手势事件接口
 * 用于表示具有明确阶段的手势事件（如拖拽的开始、移动、结束）
 */
export interface PhaseGestureEmit extends BaseGestureEmit {
    phase: GesturePhase;
    dx?: number;
    dy?: number;
}
/**
 * 简单手势事件接口
 * 用于表示不需要阶段信息的手势事件
 */
export interface SimpleGestureEmit extends BaseGestureEmit {
}
/**
 * 手势事件联合类型
 * 可以是简单手势事件或带阶段的手势事件
 */
export type GestureEmit = SimpleGestureEmit | PhaseGestureEmit;
/**
 * 长按约束接口
 * 定义长按手势的约束条件
 */
export interface LongPressConstraints {
    minDuration?: number;
    maxDistance?: number;
}
/**
 * 拖拽约束接口
 * 定义拖拽手势的约束条件
 */
export interface DragConstraints {
    minDistance?: number;
}
//# sourceMappingURL=processors.d.ts.map