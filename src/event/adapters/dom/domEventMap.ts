// domEventMap.ts
import { SemanticEvent } from '../semantic-map';

// 定义每种事件映射的类型
export type EventMap = Record<SemanticEvent, string[]>;

// Pointer Events (现代浏览器，支持触摸、鼠标、手写笔)
export const pointerEventMap: EventMap = {
    'click': ['pointerdown', 'pointerup'],  // 注意：pointer没有click，需要组合
    'dblclick': [],  // pointer没有dblclick事件
    'mousedown': ['pointerdown'],
    'mouseup': ['pointerup'],
    'mousemove': ['pointermove'],
    'mouseenter': ['pointerenter'],
    'mouseleave': ['pointerleave'],
    'mouseover': ['pointerover'],
    'mouseout': ['pointerout'],
    'contextmenu': ['contextmenu'],  // pointer也使用原生contextmenu
    'wheel': ['wheel'],
    'scroll': ['scroll'],
    'focus': ['focus'],
    'blur': ['blur'],
    'input': ['input'],
    'change': ['change'],
    'submit': ['submit'],
    'keydown': ['keydown'],
    'keyup': ['keyup'],
    'keypress': ['keypress'],
    'touchstart': ['pointerdown'],
    'touchend': ['pointerup'],
    'touchmove': ['pointermove'],
    'touchcancel': ['pointercancel'],
    'drag': ['drag'],
    'dragstart': ['dragstart'],
    'dragend': ['dragend'],
    'dragenter': ['dragenter'],
    'dragleave': ['dragleave'],
    'dragover': ['dragover'],
    'drop': ['drop'],
    'load': ['load'],
    'error': ['error'],
    'resize': ['resize'],
    // 添加更多语义事件...
} as const;

// Touch Events (移动设备)
export const touchEventMap: EventMap = {
    'click': ['touchstart', 'touchend'],  // 触摸点击由touchstart+touchend模拟
    'dblclick': ['dblclick'],  // 移动端也有dblclick
    'mousedown': ['touchstart'],
    'mouseup': ['touchend'],
    'mousemove': ['touchmove'],
    'mouseenter': [],  // 触摸设备没有hover事件
    'mouseleave': [],
    'mouseover': [],
    'mouseout': [],
    'contextmenu': ['contextmenu'],
    'wheel': ['wheel'],
    'scroll': ['scroll'],
    'focus': ['focus'],
    'blur': ['blur'],
    'input': ['input'],
    'change': ['change'],
    'submit': ['submit'],
    'keydown': ['keydown'],
    'keyup': ['keyup'],
    'keypress': ['keypress'],
    'touchstart': ['touchstart'],
    'touchend': ['touchend'],
    'touchmove': ['touchmove'],
    'touchcancel': ['touchcancel'],
    'drag': ['touchmove'],  // 触摸拖拽
    'dragstart': ['touchstart'],
    'dragend': ['touchend'],
    'dragenter': [],  // 触摸设备没有这些
    'dragleave': [],
    'dragover': [],
    'drop': [],
    'load': ['load'],
    'error': ['error'],
    'resize': ['resize'],
    // 添加更多语义事件...
} as const;

// Mouse Events (传统桌面设备)
export const mouseEventMap: EventMap = {
    'click': ['click'],
    'dblclick': ['dblclick'],
    'mousedown': ['mousedown'],
    'mouseup': ['mouseup'],
    'mousemove': ['mousemove'],
    'mouseenter': ['mouseenter'],
    'mouseleave': ['mouseleave'],
    'mouseover': ['mouseover'],
    'mouseout': ['mouseout'],
    'contextmenu': ['contextmenu'],
    'wheel': ['wheel'],
    'scroll': ['scroll'],
    'focus': ['focus'],
    'blur': ['blur'],
    'input': ['input'],
    'change': ['change'],
    'submit': ['submit'],
    'keydown': ['keydown'],
    'keyup': ['keyup'],
    'keypress': ['keypress'],
    'touchstart': [],  // 鼠标设备不支持触摸
    'touchend': [],
    'touchmove': [],
    'touchcancel': [],
    'drag': ['drag'],
    'dragstart': ['dragstart'],
    'dragend': ['dragend'],
    'dragenter': ['dragenter'],
    'dragleave': ['dragleave'],
    'dragover': ['dragover'],
    'drop': ['drop'],
    'load': ['load'],
    'error': ['error'],
    'resize': ['resize'],
    // 添加更多语义事件...
} as const;

// 辅助函数：确保所有SemanticEvent都有定义
export function validateEventMaps(semanticEvents: SemanticEvent[]): void {
    const checkMap = (map: EventMap, name: string) => {
        semanticEvents.forEach(event => {
            if (!(event in map)) {
                console.warn(`⚠️ ${name} 缺少对 ${event} 的定义`);
            }
        });
    };

    checkMap(pointerEventMap, 'pointerEventMap');
    checkMap(touchEventMap, 'touchEventMap');
    checkMap(mouseEventMap, 'mouseEventMap');
}