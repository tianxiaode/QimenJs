"use strict";
/**
 * @file DomEventAdapter.ts
 * @description DOM事件适配器 - 将原生DOM事件转换为语义化手势事件
 *
 * DomEventAdapter是@orbitjs/event-dom包的核心类，负责：
 * 1. 将底层DOM事件（mouse/touch/pointer）转换为高级手势事件（tap/swipe/drag等）
 * 2. 管理事件绑定和解绑的生命周期
 * 3. 根据设备能力自动选择最优事件类型
 * 4. 提供统一的事件处理接口
 *
 * @example
 * ```typescript
 * import { createEventAdapter } from '@orbitjs/event-dom';
 *
 * const adapter = createEventAdapter();
 * const element = document.getElementById('my-button');
 *
 * // 绑定点击事件
 * const unbind = adapter.bind(element, 'tap', scope, {
 *     threshold: 10,
 *     timeout: 300
 * });
 *
 * // 解绑事件
 * unbind();
 * ```
 *
 * @module @orbitjs/event-dom
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomEventAdapter = void 0;
const runtime_env_1 = require("@orbitjs/runtime-env");
const processors_1 = require("../processors");
const logger_1 = require("@orbitjs/logger");
const utils_1 = require("@orbitjs/utils");
/* ============================================
 * DomEventAdapter
 * ============================================ */
/**
 * DOM 事件适配器，用于将原生 DOM 事件转换为手势事件
 * 将底层的 DOM 事件（如 mouse、touch、pointer）映射到高级手势语义（如 swipe、tap 等）
 *
 * @class DomEventAdapter
 * @implements {IEventAdapter}
 *
 * @example
 * ```typescript
 * const adapter = new DomEventAdapter(inputEventMap, gestureEventMap);
 * adapter.bind(element, 'swipe', scope, options);
 * ```
 */
class DomEventAdapter {
    constructor(inputEventMap, gestureMap) {
        this.inputEventMap = inputEventMap;
        this.gestureMap = gestureMap;
        this.capabilities = (0, runtime_env_1.detectInputCapabilities)();
        this.adapterId = utils_1.string.getId('dom-adapter');
        this.logger = logger_1.Logger.for('dom-adapter');
    }
    // --- 内置日志方法 ---
    /**
     * 内置日志记录方法
     * @param level 日志级别
     * @param action 日志动作描述
     * @param data 附加数据
     */
    logAdapter(level, action, data) {
        this.logger[level](`[dom.adapter] ${action}`, {
            adapterId: this.adapterId,
            ...data,
        });
    }
    /* ============================================
     * Public API
     * ============================================ */
    /**
     * 绑定手势事件到目标元素
     * @param target 事件目标元素
     * @param semantic 手势语义（如 tap、swipe 等）
     * @param scope 事件作用域
     * @param options 绑定选项
     * @returns 解绑函数
     */
    bind(target, semantic, scope, options, source) {
        const descriptor = this.gestureMap[semantic];
        if (!descriptor) {
            this.logAdapter('warn', 'bind_unknown_semantic', { semantic });
            return () => { };
        }
        this.logAdapter('debug', 'bind_start', { semantic, target: target.constructor.name });
        // 1️⃣ 创建 gesture processor
        const processor = (0, processors_1.createGestureProcessor)(descriptor, gesture => {
            this.logAdapter('debug', 'emit_gesture', { semantic });
            scope.emit(semantic, gesture, source);
        });
        const unbindFunctions = [];
        // 2️⃣ 绑定所需 InputSignals
        this.bindInputSignals(target, descriptor.requires, input => {
            this.logAdapter('debug', 'process_input', {
                semantic,
                signal: input.signal,
                x: input.x,
                y: input.y,
            });
            processor.handle(input);
        }, scope, options, unbindFunctions);
        this.logAdapter('info', 'bind_success', {
            semantic,
            signalCount: descriptor.requires.length,
            target: target.constructor.name,
        });
        // 返回组合的解绑函数
        return () => {
            unbindFunctions.forEach(unbind => unbind());
            this.logAdapter('debug', 'unbind_all');
            // processor 清理逻辑
        };
    }
    /* ============================================
     * InputSignal → DOM 绑定
     * ============================================ */
    /**
     * 将输入信号绑定到 DOM 事件
     * @param target 事件目标元素
     * @param signals 需要绑定的输入信号列表
     * @param onInput 输入处理回调
     * @param scope 事件作用域
     * @param options 绑定选项
     * @param unbindFunctions 解绑函数数组
     */
    bindInputSignals(target, signals, onInput, scope, options, unbindFunctions // 新增参数
    ) {
        for (const signal of signals) {
            const binding = this.inputEventMap[signal];
            if (!binding) {
                this.logAdapter('warn', 'missing_binding', { signal });
                continue;
            }
            const domEvents = this.selectDomEvents(binding);
            for (const domEvent of domEvents) {
                const handler = (event) => {
                    onInput(this.normalizeInput(signal, event));
                };
                target.addEventListener(domEvent, handler, options);
                // 创建解绑函数
                const unbind = () => target.removeEventListener(domEvent, handler, options);
                this.logAdapter('debug', 'dom_event_bound', {
                    domEvent,
                    signal,
                    target: target.constructor.name,
                });
                if (unbindFunctions) {
                    unbindFunctions.push(unbind);
                }
                scope.addCleanup(unbind);
            }
        }
    }
    /* ============================================
     * Event → GestureInput
     * ============================================ */
    /**
     * 将原生 DOM 事件转换为标准化的 GestureInput 对象
     * @param signal 输入信号类型
     * @param event 原生 DOM 事件
     * @returns 标准化的 GestureInput 对象
     */
    normalizeInput(signal, event) {
        var _a;
        const time = performance.now();
        // PointerEvent（优先）
        if (window.PointerEvent && event instanceof PointerEvent) {
            return {
                signal,
                time,
                x: event.clientX,
                y: event.clientY,
                pointerType: event.pointerType,
                buttons: event.buttons,
                originalEvent: event,
            };
        }
        // TouchEvent
        if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
            const touch = (_a = event.touches[0]) !== null && _a !== void 0 ? _a : event.changedTouches[0];
            return {
                signal,
                time,
                x: touch === null || touch === void 0 ? void 0 : touch.clientX,
                y: touch === null || touch === void 0 ? void 0 : touch.clientY,
                pointerType: 'touch',
                originalEvent: event,
            };
        }
        // MouseEvent
        if (event instanceof MouseEvent) {
            return {
                signal,
                time,
                x: event.clientX,
                y: event.clientY,
                pointerType: 'mouse',
                buttons: event.buttons,
                originalEvent: event,
            };
        }
        // Keyboard / others
        return {
            signal,
            time,
            originalEvent: event,
        };
    }
    /**
     * 根据设备能力选择合适的 DOM 事件类型
     * @param binding 输入事件绑定配置
     * @returns 适合当前设备的原子信号列表
     */
    selectDomEvents(binding) {
        const cap = this.capabilities;
        if (cap.pointer && binding.pointer) {
            return binding.pointer;
        }
        if (cap.touch && binding.touch) {
            return binding.touch;
        }
        if (binding.mouse) {
            return binding.mouse;
        }
        return [];
    }
}
exports.DomEventAdapter = DomEventAdapter;
//# sourceMappingURL=DomEventAdapter.js.map