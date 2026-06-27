"use strict";
/**
 * @orbitjs/event-dom
 *
 * DOM事件处理包 - 提供DOM元素事件绑定、手势识别、事件转换等功能
 *
 * 该包依赖于 @orbitjs/event 核心事件系统，提供：
 * - DOM事件适配器（DomEventAdapter）
 * - 手势处理器（Tap, Swipe, Drag, LongPress等）
 * - 语义化事件映射
 * - 事件验证工具
 *
 * @example
 * ```ts
 * import { createEventAdapter } from '@orbitjs/event-dom';
 *
 * const adapter = createEventAdapter();
 * adapter.bind(element, 'tap', handler);
 * ```
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./adapters"), exports);
//# sourceMappingURL=index.js.map