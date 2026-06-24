"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointerMap = void 0;
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
exports.pointerMap = {
    press: {
        pointer: ['pointerdown'] // 指针按下事件映射
    },
    move: {
        pointer: ['pointermove'] // 指针移动事件映射
    },
    release: {
        pointer: ['pointerup'] // 指针释放事件映射
    },
    cancel: {
        pointer: ['pointercancel'] // 指针取消事件映射
    },
    enter: {
        pointer: ['pointerenter'] // 指针进入元素事件映射
    },
    leave: {
        pointer: ['pointerleave'] // 指针离开元素事件映射
    },
    over: {
        pointer: ['pointerover'] // 指针悬停事件映射（会冒泡）
    },
    out: {
        pointer: ['pointerout'] // 指针移出事件映射（会冒泡）
    }
};
//# sourceMappingURL=pointer.js.map