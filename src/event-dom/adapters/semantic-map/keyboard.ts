// keyboard-map.ts
import { InputEventMap } from '../../types';

/**
 * 键盘事件映射
 * keyboardMap 原则：
 *
 *     只包含键盘设备相关的事件
 *
 *     仅映射到 keyboard 类型的 DOM 事件
 * 
 * @description 定义了键盘设备的输入信号到具体 DOM 事件的映射，
 *              使得上层可以使用语义化的键盘信号，而不必关心具体的 DOM 事件
 */
export const keyboardMap: InputEventMap = {
  keydown: {
    keyboard: ['keydown']  // 键盘按下事件映射
  },
  keyup: {
    keyboard: ['keyup']    // 键盘释放事件映射
  }
};