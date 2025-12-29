/**
 * @file ContextMenuProcessor.ts
 * @description
 * ContextMenuProcessor 是处理上下文菜单事件的处理器类。它继承自GestureProcessor，
 * 主要用于处理右键点击或键盘上下文菜单键触发的事件。支持鼠标右键和键盘事件（如上下文菜单键或Shift+F10）。
 * 
 * 该处理器检查鼠标按钮状态或特定键盘按键，以触发上下文菜单语义事件。
 */

import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './GestureProcessor';
import { GestureEmit } from './types';

/**
 * ContextMenuProcessor类
 * 处理上下文菜单事件，支持鼠标右键和键盘快捷键（ContextMenu键或Shift+F10）
 */
export class ContextMenuProcessor extends GestureProcessor<'contextmenu'> {
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件，指定触发上下文菜单的条件
     */
    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'contextmenu'>['constraints']
    ) {
        super(semantic, emit, constraints);

        // 定义事件处理器
        this.handlers = {
            press: input => {
                // 默认允许右键点击（按钮2）
                const allowedButtons = this.constraints?.buttons ?? [2]; // Right mouse button

                this.logProcessor('debug', 'contextmenu_press', {
                    buttons: input.buttons,
                    allowedButtons,
                    isAllowed: input.buttons && allowedButtons.includes(input.buttons),
                });

                // 检查当前按钮是否在允许列表中
                if (input.buttons && allowedButtons.includes(input.buttons)) {
                    this.emitGesture(input.originalEvent);

                    this.logProcessor('debug', 'contextmenu_emitted', {
                        button: input.buttons,
                        originalEvent: input.originalEvent?.type,
                    });
                }
            },
            // 上下文菜单也可以通过键盘触发（如上下文菜单键或Shift+F10）
            keydown: input => {
                if (input.originalEvent instanceof KeyboardEvent) {
                    const event = input.originalEvent as KeyboardEvent;
                    // 检查是否是上下文菜单键或Shift+F10
                    const isContextMenuKey =
                        event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey);

                    this.logProcessor('debug', 'contextmenu_keydown', {
                        key: event.key,
                        shiftKey: event.shiftKey,
                        isContextMenuKey,
                    });

                    if (isContextMenuKey) {
                        this.emitGesture(input.originalEvent);

                        this.logProcessor('debug', 'contextmenu_emitted', {
                            key: event.key,
                            shiftKey: event.shiftKey,
                            originalEvent: input.originalEvent.type,
                        });
                    }
                }
            },
        };
    }
}