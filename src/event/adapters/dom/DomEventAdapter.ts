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
import { createGestureProcessor, GestureInput } from '../processor';

/* --------------------------------------------
 * DomEventAdapter
 * -------------------------------------------- */

export class DomEventAdapter {
    private readonly capabilities = detectInputCapabilities();
    constructor(
        private readonly inputEventMap: InputEventMap,
        private readonly gestureMap: GestureEventMap
    ) {}

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
        if (!descriptor) return () => {};

        // 1️⃣ 创建 gesture processor
        const processor = createGestureProcessor(descriptor, gesture => {
            scope.emit(semantic, gesture);
        });

        const unbindFunctions: (() => void)[] = [];

        // 2️⃣ 绑定所需 InputSignals
        this.bindInputSignals(
            target,
            descriptor.requires,
            input => processor.handle(input),
            scope,
            options,
            unbindFunctions
        );

        // 返回组合的解绑函数
        return () => {
            unbindFunctions.forEach(unbind => unbind());
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
            if (!binding) continue;

            const domEvents = this.selectDomEvents(binding);

            for (const domEvent of domEvents) {
                const handler = (event: Event) => {
                    onInput(this.normalizeInput(signal, event));
                };

                target.addEventListener(domEvent, handler, options);

                // 创建解绑函数
                const unbind = () => target.removeEventListener(domEvent, handler, options);

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
