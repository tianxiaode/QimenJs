import { InputEventMap } from '../../types';
/**
 * 基础事件映射，包含与输入设备形态无关的事件
 * 不需要"输入动作"的事件
 * baseMap 原则：
 *
 *     只包含"与输入设备形态无关"的事件
 *
 *     需要特定输入设备（鼠标、键盘、触摸屏等）才能产生的事件，都不进入 baseMap
 *
 * @description 定义了跨平台输入设备的基础事件映射，将语义化的输入信号（press、release、move、cancel）
 *              映射到具体的 DOM 事件上，使得上层组件可以不关心具体的输入设备类型
 */
export declare const baseMap: InputEventMap;
//# sourceMappingURL=base.d.ts.map