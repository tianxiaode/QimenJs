import { AtomicSignal, InputEventMap, InputSignal } from './types';

/**
 * 基础事件映射，包含与输入设备形态无关的事件
 * 不需要“输入动作”的事件
 * baseMap 原则：
 *
 *     只包含"与输入设备形态无关"的事件
 *
 *     需要特定输入设备（鼠标、键盘、触摸屏等）才能产生的事件，都不进入 baseMap
 */


export const baseMap: InputEventMap = {
  press: {
    pointer: ['pointerdown'],
    touch: ['touchstart'],
    mouse: ['mousedown'],
  },
  release: {
    pointer: ['pointerup'],
    touch: ['touchend'],
    mouse: ['mouseup'],
  },
  move: {
    pointer: ['pointermove'],
    touch: ['touchmove'],
    mouse: ['mousemove'],
  },
  cancel: {
    pointer: ['pointercancel'],
    touch: ['touchcancel'],
  },
  wheel: {
    mouse: ['wheel'],
  },
  keydown: {
    keyboard: ['keydown'],
  },
  keyup: {
    keyboard: ['keyup'],
  },
};
