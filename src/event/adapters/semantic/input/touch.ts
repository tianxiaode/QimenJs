import { InputEventMap } from '../types';

/**
 * 触摸事件映射
 * touchMap 原则：
 *
 *     只包含触摸设备相关的事件
 *
 *     仅映射到 touch 类型的 DOM 事件
 */
export const touchMap: InputEventMap = {
  press: { 
    touch: ['touchstart'] 
  },
  move: { 
    touch: ['touchmove'] 
  },
  release: { 
    touch: ['touchend'] 
  },
  cancel: { 
    touch: ['touchcancel'] 
  }
};