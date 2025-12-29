import { InputEventMap, InputEventBinding } from '../types';
/**
 * 解析输入事件映射
 * 将不同输入设备的事件映射合并为统一的输入事件映射
 */
export function resolveInputEventMap(maps: {
  base: InputEventMap;
  pointer: InputEventMap;
  touch: InputEventMap;
  mouse: InputEventMap;
  keyboard: InputEventMap;
}): InputEventMap {
  const resolved: InputEventMap = {};

  // 按优先级合并映射
  for (const map of [maps.base, maps.pointer, maps.touch, maps.mouse, maps.keyboard]) {
    for (const [inputSignal, binding] of Object.entries(map)) {
      let resolvedBinding = resolved[inputSignal as any] as InputEventBinding;
      if (!resolved[inputSignal as any]) {
        resolved[inputSignal as any] = {};
      }

      // 合并每个输入信号的绑定
      for (const [deviceType, events] of Object.entries(binding)) {
        if (events && events.length > 0) {
          if (!resolvedBinding[deviceType as any]) {
            resolvedBinding[deviceType as any] = [];
          }
          resolvedBinding[deviceType as any] = [
            ...(resolvedBinding[deviceType as any] || []),
            ...events
          ];
        }
      }
    }
  }

  return resolved;
}