import { InputEventMap } from "./types";

/**
 * 鼠标事件映射
 * mouseMap 原则：
 *
 *     只包含鼠标设备相关的事件
 *
 *     仅映射到 mouse 类型的 DOM 事件
 */
export const mouseMap: InputEventMap = {
    press: { 
        mouse: ['mousedown'] 
    },
    release: { 
        mouse: ['mouseup'] 
    },
    move: { 
        mouse: ['mousemove'] 
    },
    enter: { 
        mouse: ['mouseenter'] 
    },
    leave: { 
        mouse: ['mouseleave'] 
    },
    over: { 
        mouse: ['mouseover'] 
    },
    out: { 
        mouse: ['mouseout'] 
    },
    wheel: { 
        mouse: ['wheel'] 
    },
};