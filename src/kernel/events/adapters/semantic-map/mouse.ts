import { InputEventMap } from "./types";

/**
 * 鼠标事件映射
 * mouseMap 原则：
 *
 *     只包含鼠标设备相关的事件
 *
 *     仅映射到 mouse 类型的 DOM 事件
 * 
 * @description 定义了鼠标设备的输入信号到具体 DOM 事件的映射，
 *              使得上层可以使用语义化的鼠标信号，而不必关心具体的 DOM 事件
 */
export const mouseMap: InputEventMap = {
    press: { 
        mouse: ['mousedown']    // 鼠标按下事件映射
    },
    release: { 
        mouse: ['mouseup']      // 鼠标释放事件映射
    },
    move: { 
        mouse: ['mousemove']    // 鼠标移动事件映射
    },
    enter: { 
        mouse: ['mouseenter']   // 鼠标进入元素事件映射
    },
    leave: { 
        mouse: ['mouseleave']   // 鼠标离开元素事件映射
    },
    over: { 
        mouse: ['mouseover']    // 鼠标悬停事件映射（会冒泡）
    },
    out: { 
        mouse: ['mouseout']     // 鼠标移出事件映射（会冒泡）
    }
};