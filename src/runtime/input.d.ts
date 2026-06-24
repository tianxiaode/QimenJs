/**
 * 表示设备输入能力的接口
 */
export interface InputCapabilities {
    touch: boolean;
    mouse: boolean;
    pointer: boolean;
}
/**
 * 检测当前设备是否为触摸设备
 * @returns 如果设备支持触摸则返回 true，否则返回 false
 */
export declare function isTouchDevice(): boolean;
/**
 * 检测设备的输入能力
 * @returns 包含 touch、mouse、pointer 三个布尔值的对象，表示设备支持的输入类型
 */
export declare function detectInputCapabilities(): InputCapabilities;
//# sourceMappingURL=input.d.ts.map