import { InputEventMap } from '../../types';

/**
 * 触摸事件映射
 * touchMap 原则：
 *
 *     只包含触摸设备相关的事件
 *
 *     仅映射到 touch 类型的 DOM 事件
 *
 * @description 定义了触摸设备的输入信号到具体 DOM 事件的映射，
 *              使得上层可以使用语义化的触摸信号，而不必关心具体的 DOM 事件
 */
export const touchMap: InputEventMap = {
    press: {
        touch: ['touchstart'], // 触摸开始事件映射
    },
    move: {
        touch: ['touchmove'], // 触摸移动事件映射
    },
    release: {
        touch: ['touchend'], // 触摸结束事件映射
    },
    cancel: {
        touch: ['touchcancel'], // 触摸取消事件映射
    },
};
