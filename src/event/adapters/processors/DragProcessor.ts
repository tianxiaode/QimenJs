/**
 * @file DragProcessor.ts
 * @description
 * DragProcessor 是处理拖拽手势的处理器类。它继承自GestureProcessor，
 * 用于处理拖拽开始、移动、结束和取消等阶段事件。
 * 
 * 该处理器跟踪鼠标/触摸的按下、移动和释放事件，当移动距离超过最小阈值时，
 * 触发拖拽开始事件，并在移动过程中持续发送拖拽移动事件。
 */

import { GestureEventDescriptor, GestureSemantic } from '../semantic-map';
import { GestureProcessor } from './GestureProcessor';
import { GestureEmit, GestureInput } from './types';

/**
 * DragProcessor类
 * 处理拖拽手势事件，包含开始、移动、结束和取消阶段
 */
export class DragProcessor extends GestureProcessor {
    // 标记是否正在拖拽
    private dragging = false;

    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件，包括最小拖拽距离
     */
    constructor(
        protected readonly semantic: GestureSemantic,
        protected readonly emit: (event: GestureEmit) => void,
        protected readonly constraints?: GestureEventDescriptor<'drag'>['constraints']
    ) {
        super(semantic, emit, constraints);

        // 定义拖拽事件处理器
        this.handlers = {
            press: this.onPress,
            move: this.onMove,
            release: this.onRelease,
            cancel: this.onCancel,
        };
    }

    /**
     * 按下事件处理
     * @param input - 手势输入信息
     */
    private onPress = (input: GestureInput) => {
        this.start(input);
        this.dragging = false;
        
        this.logProcessor('debug', 'drag_start', {
            startX: this.startX,
            startY: this.startY,
        });
    };

    /**
     * 移动事件处理
     * @param input - 手势输入信息
     */
    private onMove = (input: GestureInput) => {
        if (!this.active) return;

        this.move(input);

        // 默认最小拖拽距离为8px
        const minDistance = this.constraints?.minDistance ?? 8;

        if (!this.dragging) {
            // 如果还没有开始拖拽，检查移动距离是否达到最小距离
            if (this.distance() >= minDistance) {
                this.dragging = true;
                this.emit({
                    semantic: this.semantic,
                    phase: 'start',
                    originalEvent: input.originalEvent,
                });
                
                this.logProcessor('debug', 'drag_begin', {
                    distance: this.distance(),
                    minDistance,
                });
            }
            return;
        }

        // 发送拖拽移动事件
        this.emit({
            semantic: this.semantic,
            phase: 'move',
            dx: this.lastX - this.startX,
            dy: this.lastY - this.startY,
            originalEvent: input.originalEvent,
        });
        
        this.logProcessor('debug', 'drag_move', {
            dx: this.lastX - this.startX,
            dy: this.lastY - this.startY,
            distance: this.distance(),
        });
    };

    /**
     * 释放事件处理
     * @param input - 手势输入信息
     */
    private onRelease = (input: GestureInput) => {
        if (this.dragging) {
            // 发送拖拽结束事件
            this.emit({
                semantic: this.semantic,
                phase: 'end',
                originalEvent: input.originalEvent,
            });
            
            this.logProcessor('debug', 'drag_end', {
                totalDistance: this.distance(),
            });
        }
        this.reset();
        this.dragging = false;
    };

    /**
     * 取消事件处理
     */
    private onCancel = () => {
        if (this.dragging) {
            // 发送拖拽取消事件
            this.emit({
                semantic: this.semantic,
                phase: 'cancel',
            });
            
            this.logProcessor('debug', 'drag_cancel', {
                totalDistance: this.distance(),
            });
        }
        this.reset();
        this.dragging = false;
    };
}