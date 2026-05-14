import {
    baseMap,
    pointerMap,
    touchMap,
    mouseMap,
    keyboardMap,
    resolveInputEventMap,
    gestureEventMap,
} from './semantic-map';
import { IEventAdapter } from '@orbitjs/event';
import { DomEventAdapter } from './dom';

/**
 * 创建一个事件适配器实例
 *
 * 该函数整合了不同类型的输入事件映射（基础、指针、触摸、鼠标、键盘）并根据
 * 当前环境的输入能力进行适配，最终返回一个 DomEventAdapter 实例
 *
 * @returns {EventAdapter} 返回配置好的事件适配器实例，可以用于将语义化事件绑定到 DOM 元素上
 *
 * 工作流程:
 * 1. 使用 resolveInputEventMap 合并所有输入事件映射，并根据当前设备能力选择合适的事件类型
 * 2. 创建 DomEventAdapter 实例，传入解析后的输入事件映射和手势事件映射
 * 3. 返回适配器实例，可用于将语义化事件（如 tap、swipe、drag 等）绑定到 DOM 元素上
 */
export function createEventAdapter(): IEventAdapter {
    // 根据设备能力解析输入事件映射，将基础事件映射与特定输入设备（指针、触摸、鼠标、键盘）映射合并
    const inputEventMap = resolveInputEventMap({
        base: baseMap, // 基础事件，如 press, release, move, cancel, wheel, keydown, keyup
        pointer: pointerMap, // 指针事件映射
        touch: touchMap, // 触摸事件映射
        mouse: mouseMap, // 鼠标事件映射
        keyboard: keyboardMap, // 键盘事件映射
    });

    // 创建 DOM 事件适配器实例，传入解析后的输入事件映射和手势事件映射
    return new DomEventAdapter(inputEventMap, gestureEventMap);
}
