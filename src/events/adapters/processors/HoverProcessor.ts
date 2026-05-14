/**
 * @file HoverProcessor.ts
 * @description
 * HoverProcessor 是处理悬停手势的处理器类。它继承自GestureProcessor，
 * 用于处理鼠标进入和离开元素的事件。
 *
 * 该处理器通过监听enter和leave事件来触发悬停语义事件。
 */

import { GestureEventDescriptor, GestureSemantic, GestureEmit } from '../../../kernel/types/events';
import { GestureProcessor } from './GestureProcessor';

/**
 * HoverProcessor类
 * 处理悬停手势事件，包括鼠标进入和离开事件
 */
export class HoverProcessor extends GestureProcessor<'hover'> {
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件
     */
    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'hover'>['constraints']
    ) {
        super(semantic, emit, constraints);

        // 定义悬停事件处理器
        this.handlers = {
            enter: i => {
                // 鼠标进入时触发悬停事件
                this.emitGesture(i.originalEvent);
            },
            leave: i => {
                // 鼠标离开时触发悬停事件
                this.emitGesture(i.originalEvent);
            },
        };
    }
}
