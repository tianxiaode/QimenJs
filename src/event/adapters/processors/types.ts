import { GestureSemantic, InputSignal } from "../semantic-map";

export interface GestureInput {
  signal: InputSignal;     // ← 关键：这里是 InputSignal
  time: number;
  x?: number;
  y?: number;
  pointerType?: 'mouse' | 'pen' | 'touch';
  buttons?: number;        // ✅ 添加鼠标按钮信息
  originalEvent?: Event;
}

export interface BaseGestureEmit {
  semantic: GestureSemantic;
  originalEvent?: Event;
}

export type GesturePhase = 'start' | 'move' | 'end' | 'cancel';

export interface PhaseGestureEmit extends BaseGestureEmit {
  phase: GesturePhase;
  dx?: number;
  dy?: number;
}

export interface SimpleGestureEmit extends BaseGestureEmit {}

export type GestureEmit =
  | SimpleGestureEmit
  | PhaseGestureEmit;

export interface LongPressConstraints {
  minDuration?: number;   // ms, 默认 500
  maxDistance?: number;   // px, 默认 10
}

export interface DragConstraints {
  minDistance?: number;   // px, 默认 8
}

