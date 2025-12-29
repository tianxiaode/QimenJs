import { InputEventMap } from '../types';

/**
 * 指针事件映射
 * pointerMap 原则：
 *
 *     只包含指针设备相关的事件
 *
 *     仅映射到 pointer 类型的 DOM 事件
 */
export const pointerMap: InputEventMap = {
  press: { 
    pointer: ['pointerdown'] 
  },
  move: { 
    pointer: ['pointermove'] 
  },
  release: { 
    pointer: ['pointerup'] 
  },
  cancel: { 
    pointer: ['pointercancel'] 
  },
  enter: { 
    pointer: ['pointerenter'] 
  },
  leave: { 
    pointer: ['pointerleave'] 
  },
  over: { 
    pointer: ['pointerover'] 
  },
  out: { 
    pointer: ['pointerout'] 
  },
  wheel: {
    pointer: ['wheel']
  }
};