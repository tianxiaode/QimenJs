import { GestureEventMap } from './types';

/**
 * ✔ 不涉及 DOM
 * ✔ 不涉及 mouse / touch / pointer
 * ✔ 只声明“我需要什么 + 谁来解释”
*/
export const gestureMap: Partial<GestureEventMap> = {
    tap: {
        requires: ['press', 'release'],
        processor: 'tapProcessor',
        constraints: {
            maxDuration: 250,
            maxDistance: 10,
        },
    },

    click: {
        requires: ['press', 'release'],
        processor: 'tapProcessor',
    },

    dblclick: {
        requires: ['press', 'release'],
        processor: 'doubleTapProcessor',
        constraints: {
            maxDuration: 300,
        },
    },

    longpress: {
        requires: ['press'],
        processor: 'longPressProcessor',
        constraints: {
            minDuration: 500,
        },
    },

    drag: {
        requires: ['press', 'move', 'release'],
        processor: 'panProcessor',
        constraints: {
            minDistance: 5,
        },
    },

    swipe: {
        requires: ['press', 'move', 'release'],
        processor: 'swipeProcessor',
        constraints: {
            minDistance: 30,
            maxDuration: 300,
        },
    },

    hover: {
        requires: ['enter', 'leave'],
        processor: 'hoverProcessor',
    },

    contextmenu: {
        requires: ['press'],
        processor: 'contextMenuProcessor',
        constraints: {
            buttons: [2], // 右键
        },
    },
};

export const keyboardGestureMap: Partial<GestureEventMap> = {
  submit: {
    requires: ['keydown'],
    processor: 'enterKeyProcessor',
  },
};
