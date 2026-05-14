import { GestureEventMap, GestureSemantic } from '../../../kernel/types/events';

/**
 * 手势事件映射配置
 * 
 * ✔ 不涉及 DOM
 * ✔ 不涉及 mouse / touch / pointer
 * ✔ 只声明"我需要什么 + 谁来解释"
 * 
 * @description 定义了高层语义化手势事件，将基础输入信号组合成有意义的手势行为，
 *              如点击、拖拽、长按等，并指定相应的处理器和约束条件
 */
export const gestureMap: Partial<GestureEventMap> = {
    tap: {
        requires: ['press', 'release'],      // 需要按下和释放两个基础信号
        processor: 'tapProcessor',           // 使用点击处理器
        constraints: {                       // 约束条件
            maxDuration: 250,                // 最大持续时间250毫秒
            maxDistance: 10,                 // 最大移动距离10像素
        },
        semantic: 'tap',                     // 语义为轻触
    },

    click: {
        requires: ['press', 'release'],      // 需要按下和释放两个基础信号
        processor: 'tapProcessor',           // 使用点击处理器
        semantic: 'click',                   // 语义为点击
    },

    dblclick: {
        requires: ['press', 'release'],      // 需要按下和释放两个基础信号
        processor: 'doubleTapProcessor',     // 使用双击处理器
        constraints: {
            maxDuration: 300,                // 最大持续时间300毫秒
        },
        semantic: 'dblclick',                // 语义为双击
    },

    longpress: {
        requires: ['press'],                 // 只需要按下信号
        processor: 'longPressProcessor',     // 使用长按处理器
        constraints: {
            minDuration: 500,                // 最小持续时间500毫秒
        },
        semantic: 'longpress',               // 语义为长按
    },

    drag: {
        requires: ['press', 'move', 'release'], // 需要按下、移动和释放信号
        processor: 'panProcessor',              // 使用拖拽处理器
        constraints: {
            minDistance: 5,                     // 最小移动距离5像素
        },
        semantic: 'drag',                       // 语义为拖拽
    },

    swipe: {
        requires: ['press', 'move', 'release'], // 需要按下、移动和释放信号
        processor: 'swipeProcessor',            // 使用滑动手势处理器
        constraints: {
            minDistance: 30,                    // 最小移动距离30像素
            maxDuration: 300,                   // 最大持续时间300毫秒
        },
        semantic: 'swipe',                      // 语义为滑动
    },

    hover: {
        requires: ['enter', 'leave'],        // 需要进入和离开信号
        processor: 'hoverProcessor',         // 使用悬停处理器
        semantic: 'hover',                   // 语义为悬停
    },

    contextmenu: {
        requires: ['press'],                 // 需要按下信号
        processor: 'contextMenuProcessor',   // 使用右键菜单处理器
        constraints: {
            buttons: [2], // 右键           // 只响应鼠标右键
        },
        semantic: 'contextmenu',             // 语义为上下文菜单
    },
};

/**
 * 键盘手势事件映射配置
 * 
 * @description 定义了键盘相关的高层语义化事件，如回车提交等
 */
export const keyboardGestureMap: Partial<GestureEventMap> = {
    submit: {
        requires: ['keydown'],               // 需要按键按下信号
        processor: 'enterKeyProcessor',      // 使用回车键处理器
        semantic: 'submit',                  // 语义为提交
    },
};

/**
 * 合并所有手势事件映射
 * 
 * @description 将普通手势和键盘手势映射合并成一个完整的手势事件映射
 */
export const gestureEventMap: GestureEventMap = {
    ...gestureMap,
    ...keyboardGestureMap,
} as GestureEventMap;