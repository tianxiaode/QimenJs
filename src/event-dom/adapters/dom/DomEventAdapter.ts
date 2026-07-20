/**
 * @file DomEventAdapter.ts
 * @description DOM事件适配器 - 将原生DOM事件转换为语义化手势事件
 *
 * DomEventAdapter是@qimenjs/event-dom包的核心类，负责：
 * 1. 将底层DOM事件（mouse/touch/pointer）转换为高级手势事件（tap/swipe/drag等）
 * 2. 管理事件绑定和解绑的生命周期
 * 3. 根据设备能力自动选择最优事件类型
 * 4. 提供统一的事件处理接口
 *
 * @example
 * ```typescript
 * import { createEventAdapter } from '@qimenjs/event-dom';
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
 * @module @qimenjs/event-dom
 */

import { detectInputCapabilities } from '@/runtime';
import {
    AtomicSignal,
    GestureEventDescriptor,
    GestureEventMap,
    GestureSemantic,
    InputEventBinding,
    InputEventMap,
    InputSignal,
    GestureInput,
    BindOptions,
    IEventScope,
} from '../../types';
import { createGestureProcessor } from '../processors';
import { ILogger, LogLevel, Logger } from '@/logger';
import { string } from '@/utils';
import { debounce, throttle } from '@qimenjs/async';
import { EventContextBuilder } from '@/context';

/* ============================================
 * DomEventAdapter
 * ============================================ */

/**
 * DOM 事件前缀 — scope.emit 时给 DOM 事件名加前缀，
 * 避免与组件 emit 的同名事件冲突。
 * 内部事件绑定（data-event / data-emit）监听时也使用此前缀。
 */
export const DOM_EVENT_PREFIX = 'dom:';

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
export class DomEventAdapter {
    private readonly capabilities = detectInputCapabilities();
    private readonly adapterId = string.getId('dom-adapter');

    constructor(
        private readonly inputEventMap: InputEventMap,
        private readonly gestureMap: GestureEventMap
    ) {
        this.logger = Logger.for('dom-adapter');
    }

    private readonly logger: ILogger;

    // --- 内置日志方法 ---
    /**
     * 内置日志记录方法
     * @param level 日志级别
     * @param action 日志动作描述
     * @param data 附加数据
     */
    private logAdapter(level: LogLevel, action: string, data?: Record<string, any>) {
        this.logger[level](`[dom.adapter] ${action}`, {
            adapterId: this.adapterId,
            ...data,
        });
    }

    /* ============================================
     * Public API
     * ============================================ */

    /**
     * 绑定事件到目标元素
     *
     * 支持两种语义：
     * - GestureSemantic（click/tap/swipe 等）：走 Processor 流程，组合 InputSignal 为手势
     * - InputSignal（input/change/focus/blur 等）：直接绑定，不走 Processor
     *
     * @param target 事件目标元素
     * @param semantic 事件语义（GestureSemantic 或 InputSignal）
     * @param scope 事件作用域
     * @param options 绑定选项
     * @param source 事件源（用于 scope.emit）
     * @returns 解绑函数
     */
    bind(
        target: EventTarget,
        semantic: GestureSemantic | InputSignal,
        scope: IEventScope,
        options?: BindOptions,
        source?: any
    ): () => void {
        this.logAdapter('debug', 'bind_called', {
            semantic,
            hasTarget: !!target,
            sourceType: source?.constructor?.name,
        });

        // GestureSemantic：走 Processor 流程
        const descriptor = this.gestureMap[semantic as GestureSemantic];
        if (descriptor) {
            this.logAdapter('debug', 'bind_gesture_found', {
                semantic,
                requires: descriptor.requires,
                processor: descriptor.processor,
            });
            return this.bindGesture(
                target,
                semantic as GestureSemantic,
                descriptor,
                scope,
                options,
                source
            );
        }

        // InputSignal：直接绑定，不走 Processor
        const inputSignal = semantic as InputSignal;
        const binding = this.inputEventMap[inputSignal];
        if (binding) {
            this.logAdapter('debug', 'bind_input_signal_found', { semantic: inputSignal });
            return this.bindInputSignal(target, inputSignal, binding, scope, options, source);
        }

        this.logAdapter('warn', 'bind_unknown_semantic', { semantic });
        return () => {};
    }

    /**
     * 绑定手势事件（GestureSemantic），走 Processor 流程
     */
    private bindGesture(
        target: EventTarget,
        semantic: GestureSemantic,
        descriptor: GestureEventDescriptor,
        scope: IEventScope,
        options?: BindOptions,
        source?: any
    ): () => void {
        this.logAdapter('debug', 'bind_gesture_start', {
            semantic,
            target: target.constructor.name,
        });

        // 创建 gesture callback（可能带防抖/节流）
        let gestureCallback = (gesture: any) => {
            this.logAdapter('debug', 'emit_gesture', {
                semantic,
                scopeType: scope?.constructor?.name,
            });
            try {
                scope.emit(
                    `${DOM_EVENT_PREFIX}${semantic}`,
                    EventContextBuilder.create()
                        .withEvent(`${DOM_EVENT_PREFIX}${semantic}`)
                        .withSource(source)
                        .withData(gesture)
                        .build()
                );
                this.logAdapter('debug', 'emit_gesture_done', { semantic });
            } catch (e: any) {
                this.logAdapter('error', 'emit_gesture_error', { semantic, error: e?.message });
            }
        };

        if (options?.debounce && options.debounce > 0) {
            gestureCallback = debounce(gestureCallback, options.debounce);
        } else if (options?.throttle && options.throttle > 0) {
            gestureCallback = throttle(gestureCallback, options.throttle);
        }

        const processor = createGestureProcessor(descriptor, gestureCallback);

        const unbindFunctions: (() => void)[] = [];

        this.bindInputSignals(
            target,
            descriptor.requires,
            input => {
                this.logAdapter('debug', 'process_input', {
                    semantic,
                    signal: input.signal,
                    x: input.x,
                    y: input.y,
                });
                processor.handle(input);
            },
            scope,
            options,
            unbindFunctions
        );

        this.logAdapter('info', 'bind_gesture_success', {
            semantic,
            signalCount: descriptor.requires.length,
            target: target.constructor.name,
        });

        return () => {
            unbindFunctions.forEach(unbind => unbind());
            this.logAdapter('debug', 'unbind_gesture', { semantic });
        };
    }

    /**
     * 绑定输入信号事件（InputSignal），直接绑定，不走 Processor
     *
     * 用于 input/change/focus/blur/submit 等非手势事件，
     * 通过 inputEventMap 映射到原生 DOM 事件，直接 addEventListener。
     */
    private bindInputSignal(
        target: EventTarget,
        signal: InputSignal,
        binding: InputEventBinding,
        scope: IEventScope,
        options?: BindOptions,
        source?: any
    ): () => void {
        this.logAdapter('debug', 'bind_input_signal_start', {
            signal,
            target: target.constructor.name,
        });

        const domEvents = this.selectDomEvents(binding);
        const unbindFunctions: (() => void)[] = [];

        for (const domEvent of domEvents) {
            const handler = (event: Event) => {
                const input = this.normalizeInput(signal, event);
                scope.emit(
                    `${DOM_EVENT_PREFIX}${signal}`,
                    EventContextBuilder.create()
                        .withEvent(`${DOM_EVENT_PREFIX}${signal}`)
                        .withSource(source)
                        .withData(input)
                        .build()
                );
            };

            target.addEventListener(domEvent, handler, options);

            const unbind = () => target.removeEventListener(domEvent, handler, options);
            unbindFunctions.push(unbind);
            scope.addCleanup(unbind);

            this.logAdapter('debug', 'input_signal_bound', {
                domEvent,
                signal,
                target: target.constructor.name,
            });
        }

        this.logAdapter('info', 'bind_input_signal_success', {
            signal,
            domEventCount: domEvents.length,
            target: target.constructor.name,
        });

        return () => {
            unbindFunctions.forEach(unbind => unbind());
            this.logAdapter('debug', 'unbind_input_signal', { signal });
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
    private bindInputSignals(
        target: EventTarget,
        signals: readonly InputSignal[],
        onInput: (input: GestureInput) => void,
        scope: IEventScope,
        options?: BindOptions,
        unbindFunctions?: (() => void)[] // 新增参数
    ) {
        this.logAdapter('debug', 'bindInputSignals', {
            signals,
            target: (target as any).tagName || target.constructor.name,
        });

        for (const signal of signals) {
            const binding = this.inputEventMap[signal];
            if (!binding) {
                this.logAdapter('warn', 'missing_binding', { signal });
                continue;
            }

            const domEvents = this.selectDomEvents(binding);

            this.logAdapter('debug', 'bindInputSignals_signal', { signal, domEvents });

            for (const domEvent of domEvents) {
                const handler = (event: Event) => {
                    onInput(this.normalizeInput(signal, event));
                };

                target.addEventListener(domEvent, handler, options);

                // 创建解绑函数
                const unbind = () => target.removeEventListener(domEvent, handler, options);

                this.logAdapter('debug', 'dom_event_bound', {
                    domEvent,
                    signal,
                    target: (target as any).tagName || target.constructor.name,
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
    private normalizeInput(signal: InputSignal, event: Event): GestureInput {
        const time = performance.now();

        // PointerEvent（优先）
        if (window.PointerEvent && event instanceof PointerEvent) {
            return {
                signal,
                time,
                x: event.clientX,
                y: event.clientY,
                pointerType: event.pointerType as 'mouse' | 'pen' | 'touch',
                buttons: event.buttons,
                originalEvent: event,
            };
        }

        // TouchEvent
        if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
            const touch = event.touches[0] ?? event.changedTouches[0];
            return {
                signal,
                time,
                x: touch?.clientX,
                y: touch?.clientY,
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
    private selectDomEvents(binding: InputEventBinding): readonly AtomicSignal[] {
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

        if (binding.keyboard) {
            return binding.keyboard;
        }

        if (binding.other) {
            return binding.other;
        }

        return [];
    }
}
