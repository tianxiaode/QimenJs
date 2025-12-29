import { BindOptions } from '../base';
import { EventScope } from '../../core';
import { detectInputCapabilities } from '@orbitjs/runtime-env';
import {
    AtomicSignal,
    GestureEventMap,
    GestureSemantic,
    InputEventBinding,
    InputEventMap,
    InputSignal,
} from '../semantic-map';
import { createGestureProcessor, GestureInput } from '../processors';
import { ILogger, LogLevel, Logger } from '@orbitjs/logger';
import { string } from '@orbitjs/utils';

/* --------------------------------------------
 * DomEventAdapter
 * -------------------------------------------- */

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
    private logAdapter(level: LogLevel, action: string, data?: Record<string, any>) {
        this.logger[level](`[dom.adapter] ${action}`, {
            adapterId: this.adapterId,
            ...data,
        });
    }

    /* ============================================
     * Public API
     * ============================================ */

    bind(
        target: EventTarget,
        semantic: GestureSemantic,
        scope: EventScope,
        options?: BindOptions
    ): () => void {
        const descriptor = this.gestureMap[semantic];
        if (!descriptor) {
            this.logAdapter('warn', 'bind_unknown_semantic', { semantic });
            return () => {};
        }

        this.logAdapter('debug', 'bind_start', { semantic, target: target.constructor.name });

        // 1️⃣ 创建 gesture processor
        const processor = createGestureProcessor(descriptor, gesture => {
            this.logAdapter('debug', 'emit_gesture', { semantic });
            scope.emit(semantic, gesture);
        });

        const unbindFunctions: (() => void)[] = [];

        // 2️⃣ 绑定所需 InputSignals
        this.bindInputSignals(
            target,
            descriptor.requires,
            input => {
                this.logAdapter('debug', 'process_input', { 
                    semantic, 
                    signal: input.signal,
                    x: input.x,
                    y: input.y 
                });
                processor.handle(input);
            },
            scope,
            options,
            unbindFunctions
        );

        this.logAdapter('info', 'bind_success', { 
            semantic, 
            signalCount: descriptor.requires.length,
            target: target.constructor.name 
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

    private bindInputSignals(
        target: EventTarget,
        signals: readonly InputSignal[],
        onInput: (input: GestureInput) => void,
        scope: EventScope,
        options?: BindOptions,
        unbindFunctions?: (() => void)[] // 新增参数
    ) {
        for (const signal of signals) {
            const binding = this.inputEventMap[signal];
            if (!binding) {
                this.logAdapter('warn', 'missing_binding', { signal });
                continue;
            }

            const domEvents = this.selectDomEvents(binding);

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
                    target: target.constructor.name 
                });

                if (unbindFunctions) {
                    unbindFunctions.push(unbind);
                } else {
                    // 保持向后兼容，如果没有传unbindFunctions，则使用scope清理
                    scope.addCleanup(unbind);
                }
            }
        }
    }

    /* ============================================
     * Event → GestureInput
     * ============================================ */

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

        return [];
    }
}