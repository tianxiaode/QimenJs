// semantic/types.ts

export interface BindOptions {
  /** 是否阻止默认行为 */
  preventDefault?: boolean;

  /** 是否阻止冒泡 */
  stopPropagation?: boolean;

  /** 是否使用 capture */
  capture?: boolean;

  /** 是否只触发一次 */
  once?: boolean;

  /** 仅 press / longPress */
  threshold?: number;

  /** 是否禁用 mouse / touch fallback */
  disableFallback?: boolean;  
}
