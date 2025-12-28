// keyboard-map.ts
import { InputEventMap } from './types';

/**
 * 键盘事件映射
 * keyboardMap 原则：
 *
 *     只包含键盘设备相关的事件
 *
 *     仅映射到 keyboard 类型的 DOM 事件
 */
export const keyboardMap: InputEventMap = {
  keydown: {
    keyboard: ['keydown']
  },
  keyup: {
    keyboard: ['keyup']
  }
};