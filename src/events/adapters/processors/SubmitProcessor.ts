/**
 * @file SubmitProcessor.ts
 * @description
 * SubmitProcessor 是处理提交事件的处理器类。它继承自GestureProcessor，
 * 用于处理表单提交或其他提交操作的事件。
 *
 * 该处理器监听submit信号并触发相应的语义事件。
 */

import { GestureEventDescriptor, GestureSemantic, GestureEmit } from '../../../kernel/types/events';
import { GestureProcessor } from './GestureProcessor';

/**
 * SubmitProcessor类
 * 处理提交事件，例如表单提交
 */
export class SubmitProcessor extends GestureProcessor<'submit'> {
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件
     */
    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'submit'>['constraints']
    ) {
        super(semantic, emit, constraints);

        // 定义提交事件处理器
        this.handlers = {
            submit: i => {
                // 当收到提交信号时，触发相应的手势事件
                this.emitGesture(i.originalEvent);
            },
        };
    }
}
