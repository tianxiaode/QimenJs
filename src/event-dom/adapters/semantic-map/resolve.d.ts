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
export declare function resolveInputEventMap(maps: {
    base: InputEventMap;
    pointer?: InputEventMap;
    touch?: InputEventMap;
    mouse?: InputEventMap;
    keyboard?: InputEventMap;
}): InputEventMap;
//# sourceMappingURL=resolve.d.ts.map