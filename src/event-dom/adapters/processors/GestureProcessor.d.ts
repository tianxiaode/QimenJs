/**
 * @file GestureProcessor.ts
 * @description
 * GestureProcessor 是所有手势处理器的基类，提供了手势处理的基础功能。
 * 它定义了手势处理的基本流程，包括记录手势开始位置、移动轨迹、计算距离和时间等。
 *
 * 该基类还提供了日志记录功能，方便调试和监控手势处理过程。
 */
import { GestureEventDescriptor, GestureSemantic, InputSignal, GestureEmit, GestureInput } from '../types';
import { LogLevel } from '@orbitjs/logger';
/**
 * GestureProcessor抽象类
 * 所有具体手势处理器的基类，提供基础的手势处理功能
 */
export declare abstract class GestureProcessor<S extends GestureSemantic = GestureSemantic> {
    protected readonly semantic: GestureSemantic;
    protected readonly emit: (event: GestureEmit) => void;
    protected readonly constraints?: GestureEventDescriptor<S>['constraints'];
    protected handlers: Partial<Record<InputSignal, (input: GestureInput) => void>>;
    protected active: boolean;
    protected startTime: number;
    protected lastTime: number;
    protected startX: number;
    protected startY: number;
    protected lastX: number;
    protected lastY: number;
    private readonly processorId;
    private readonly logger;
    /**
     * 构造函数
     * @param semantic - 手势语义信息
     * @param emit - 用于发送手势事件的函数
     * @param constraints - 可选的约束条件
     */
    constructor(semantic: GestureSemantic, emit: (event: GestureEmit) => void, constraints?: GestureEventDescriptor<S>['constraints']);
    /**
     * 内置日志方法
     * @param level - 日志级别
     * @param action - 操作名称
     * @param data - 附加数据
     */
    protected logProcessor(level: LogLevel, action: string, data?: Record<string, any>): void;
    /**
     * 处理手势输入
     * @param input - 手势输入信息
     */
    handle(input: GestureInput): void;
    /**
     * 开始手势处理
     * @param input - 手势输入信息
     */
    protected start(input: GestureInput): void;
    /**
     * 移动手势处理
     * @param input - 手势输入信息
     */
    protected move(input: GestureInput): void;
    /**
     * 结束手势处理
     */
    protected end(): void;
    /**
     * 重置手势状态
     */
    protected reset(): void;
    /**
     * 计算手势持续时间
     * @returns 手势持续时间（毫秒）
     */
    protected duration(): number;
    /**
     * 计算手势移动距离
     * @returns 手势移动距离（像素）
     */
    protected distance(): number;
    /**
     * 触发手势事件
     * @param originalEvent - 原始事件对象
     */
    protected emitGesture(originalEvent?: Event): void;
}
//# sourceMappingURL=GestureProcessor.d.ts.map