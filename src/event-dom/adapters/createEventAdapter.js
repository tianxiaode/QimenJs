"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEventAdapter = createEventAdapter;
const semantic_map_1 = require("./semantic-map");
const dom_1 = require("./dom");
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
function createEventAdapter() {
    // 根据设备能力解析输入事件映射，将基础事件映射与特定输入设备（指针、触摸、鼠标、键盘）映射合并
    const inputEventMap = (0, semantic_map_1.resolveInputEventMap)({
        base: semantic_map_1.baseMap, // 基础事件，如 press, release, move, cancel, wheel, keydown, keyup
        pointer: semantic_map_1.pointerMap, // 指针事件映射
        touch: semantic_map_1.touchMap, // 触摸事件映射
        mouse: semantic_map_1.mouseMap, // 鼠标事件映射
        keyboard: semantic_map_1.keyboardMap, // 键盘事件映射
    });
    // 创建 DOM 事件适配器实例，传入解析后的输入事件映射和手势事件映射
    return new dom_1.DomEventAdapter(inputEventMap, semantic_map_1.gestureEventMap);
}
//# sourceMappingURL=createEventAdapter.js.map