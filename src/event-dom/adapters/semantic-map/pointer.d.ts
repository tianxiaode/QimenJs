import { InputEventMap } from "../../types";
/**
 * 指针事件映射
 * pointerMap 原则：
 *
 *     只包含指针设备相关的事件
 *
 *     仅映射到 pointer 类型的 DOM 事件
 *
 * @description 定义了指针设备（鼠标、触摸笔、触摸屏）的输入信号到具体 DOM 事件的映射，
 *              使得上层可以使用统一的语义化指针信号，而不必关心具体的输入设备类型
 */
export declare const pointerMap: InputEventMap;
//# sourceMappingURL=pointer.d.ts.map