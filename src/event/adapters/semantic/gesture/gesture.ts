import { GestureEventMap, InputSignal } from '../types';

/**
 * ✔ 不涉及 DOM
 * ✔ 不涉及 mouse / touch / pointer
 * ✔ 只声明"我需要什么 + 谁来解释"
 */
export const gestureMap: Partial<GestureEventMap> = {
    tap: {
        requires: ['press', 'release'],
        processor: 'tapProcessor',
        constraints: {
            maxDuration: 250,
            maxDistance: 10,
        },
        semantic: 'tap',
    },

    click: {
        requires: ['press', 'release'],
        processor: 'tapProcessor',
        semantic: 'click',
    },

    dblclick: {
        requires: ['press', 'release'],
        processor: 'doubleTapProcessor',
        constraints: {
            maxDuration: 300,
        },
        semantic: 'dblclick',
    },

    longpress: {
        requires: ['press'],
        processor: 'longPressProcessor',
        constraints: {
            minDuration: 500,
        },
        semantic: 'longpress',
    },

    drag: {
        requires: ['press', 'move', 'release'],
        processor: 'panProcessor',
        constraints: {
            minDistance: 5,
        },
        semantic: 'drag',
    },

    swipe: {
        requires: ['press', 'move', 'release'],
        processor: 'swipeProcessor',
        constraints: {
            minDistance: 30,
            maxDuration: 300,
        },
        semantic: 'swipe',
    },

    hover: {
        requires: ['enter', 'leave'],
        processor: 'hoverProcessor',
        semantic: 'hover',
    },

    contextmenu: {
        requires: ['press'],
        processor: 'contextMenuProcessor',
        constraints: {
            buttons: [2], // 右键
        },
        semantic: 'contextmenu',
    },
};

export const keyboardGestureMap: Partial<GestureEventMap> = {
    submit: {
        requires: ['keydown'],
        processor: 'enterKeyProcessor',
        semantic: 'submit',
    },
};

export const gestureEventMap: GestureEventMap = {
    ...gestureMap,
    ...keyboardGestureMap,
} as GestureEventMap;

/* ============================================
 * GestureSemantic：高层行为语义
 * ============================================ */

export type GestureSemantic =
  // pointer-based gestures
  | 'tap'
  | 'click'
  | 'dblclick'
  | 'longpress'
  | 'drag'
  | 'swipe'
  | 'hover'

  // context / system
  | 'contextmenu'
  | 'submit';


/* ============================================
 * GestureProcessorId
 * ============================================ */

export type GestureProcessorId =
  | 'tapProcessor'
  | 'doubleTapProcessor'
  | 'longPressProcessor'
  | 'panProcessor'
  | 'swipeProcessor'
  | 'hoverProcessor'
  | 'contextMenuProcessor'
  | 'enterKeyProcessor';


/* ============================================
 * GestureEventDescriptor
 * ============================================ */

export interface GestureEventDescriptor<S extends GestureSemantic = GestureSemantic> {
  /** 该语义需要的输入信号 */
  requires: readonly InputSignal[];

  /** 用哪个 processor 解释 */
  processor: {
    [K in keyof ProcessorToSemanticMap]: ProcessorToSemanticMap[K] extends S ? K : never
  }[keyof ProcessorToSemanticMap];

  /**
   * 可选约束（给 adapter / processor 使用）
   * gesture-map 本身不做逻辑
   */
  constraints?: {
    maxDuration?: number;   // ms
    minDuration?: number;
    maxDistance?: number;   // px
    minDistance?: number;
    buttons?: number[];     // mouse buttons
  };

  /** 该 gesture 的语义 */
  semantic: S;
}

type ProcessorToSemanticMap = {
  tapProcessor: 'tap' | 'click';
  doubleTapProcessor: 'dblclick';
  longPressProcessor: 'longpress';
  panProcessor: 'drag';
  swipeProcessor: 'swipe';
  hoverProcessor: 'hover';
  contextMenuProcessor: 'contextmenu';
  enterKeyProcessor: 'submit';
};