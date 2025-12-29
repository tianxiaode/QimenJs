import { InputEventMap } from '../types';

/**
 * 基础映射
 * baseMap 原则：
 *
 *     包含所有设备通用的基础事件映射
 *
 *     提供最基本的输入信号到DOM事件的映射
 */
export const baseMap: InputEventMap = {
  submit: { 
    other: ['submit'] 
  },
  focus: { 
    other: ['focus'] 
  },
  blur: { 
    other: ['blur'] 
  },
  input: { 
    other: ['input'] 
  },
  change: { 
    other: ['change'] 
  },
  scroll: { 
    other: ['scroll'] 
  }
};

