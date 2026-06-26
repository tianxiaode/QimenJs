// input/maps/resolve.ts
import { detectInputCapabilities } from '@/runtime';
import { InputEventMap } from '../../types';

/**
 * 根据设备能力解析输入事件映射
 * 
 * @description 根据当前设备的输入能力，动态选择合适的事件映射配置。
 *              优先级顺序：Pointer -> Touch -> Mouse -> Keyboard
 * 
 * @param maps - 包含各种输入设备映射的对象
 * @returns 合并后的输入事件映射，只包含当前设备支持的事件类型
 * 
 * @example
 * ```ts
 * const resolvedMap = resolveInputEventMap({
 *   base: baseMap,
 *   pointer: pointerMap,
 *   touch: touchMap,
 *   mouse: mouseMap,
 *   keyboard: keyboardMap
 * });
 * ```
 */
export function resolveInputEventMap(maps: {
    base: InputEventMap;      // 基础事件映射，所有设备都支持
    pointer?: InputEventMap;  // 指针事件映射，支持指针事件的设备
    touch?: InputEventMap;    // 触摸事件映射，支持触摸事件的设备
    mouse?: InputEventMap;    // 鼠标事件映射，支持鼠标事件的设备
    keyboard?: InputEventMap; // 键盘事件映射，支持键盘事件的设备
}): InputEventMap {
    // 检测当前设备的输入能力
    const cap = detectInputCapabilities();

    // 初始化结果，始终包含基础事件映射
    const result: InputEventMap = {
        ...maps.base,
    };

    // 根据设备能力优先级，添加相应的事件映射
    if (cap.pointer && maps.pointer) {
        // 如果支持指针事件且提供了指针映射，则添加指针映射
        Object.assign(result, maps.pointer);
    } else if (cap.touch && maps.touch) {
        // 否则如果支持触摸事件且提供了触摸映射，则添加触摸映射
        Object.assign(result, maps.touch);
    } else if (maps.mouse) {
        // 否则如果提供了鼠标映射，则添加鼠标映射（作为降级方案）
        Object.assign(result, maps.mouse);
    }

    // 键盘映射始终添加（如果提供），因为键盘输入通常独立于其他输入设备
    if (maps.keyboard) {
        Object.assign(result, maps.keyboard);
    }

    return result;
}