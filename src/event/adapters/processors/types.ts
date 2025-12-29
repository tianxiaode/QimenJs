/**
 * @file types.ts
 * @description
 * 定义手势处理器模块中使用的类型定义。
 * 
 * 该文件包含手势输入、手势事件、约束条件等相关类型定义，
 * 为手势处理器提供统一的类型接口。
 */

import { GestureSemantic, InputSignal } from "../semantic-map";

/**
 * 手势输入接口
 * 定义手势处理器接收的输入数据结构
 */
export interface GestureInput {
  signal: InputSignal;     // 输入信号类型（如press, move, release等）
  time: number;            // 事件发生时间戳
  x?: number;              // X坐标（可选）
  y?: number;              // Y坐标（可选）
  pointerType?: 'mouse' | 'pen' | 'touch'; // 指针类型（鼠标、笔、触摸）
  buttons?: number;        // 按钮状态（鼠标按钮信息）
  originalEvent?: Event;   // 原始事件对象
}

/**
 * 基础手势事件接口
 * 定义手势事件的基本结构
 */
export interface BaseGestureEmit {
  semantic: GestureSemantic; // 手势语义类型
  originalEvent?: Event;     // 原始事件对象
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
  phase: GesturePhase;    // 手势阶段
  dx?: number;            // X方向偏移量（可选）
  dy?: number;            // Y方向偏移量（可选）
}

/**
 * 简单手势事件接口
 * 用于表示不需要阶段信息的手势事件
 */
export interface SimpleGestureEmit extends BaseGestureEmit {}

/**
 * 手势事件联合类型
 * 可以是简单手势事件或带阶段的手势事件
 */
export type GestureEmit =
  | SimpleGestureEmit
  | PhaseGestureEmit;

/**
 * 长按约束接口
 * 定义长按手势的约束条件
 */
export interface LongPressConstraints {
  minDuration?: number;   // 最小持续时间（毫秒），默认500ms
  maxDistance?: number;   // 最大移动距离（像素），默认10px
}

/**
 * 拖拽约束接口
 * 定义拖拽手势的约束条件
 */
export interface DragConstraints {
  minDistance?: number;   // 最小拖拽距离（像素），默认8px
}