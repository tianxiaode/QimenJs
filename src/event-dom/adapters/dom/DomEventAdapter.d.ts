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
import { GestureEventMap, GestureSemantic, InputEventMap, BindOptions, IEventScope } from '../../types';
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
export declare class DomEventAdapter {
    private readonly inputEventMap;
    private readonly gestureMap;
    private readonly capabilities;
    private readonly adapterId;
    constructor(inputEventMap: InputEventMap, gestureMap: GestureEventMap);
    private readonly logger;
    /**
     * 内置日志记录方法
     * @param level 日志级别
     * @param action 日志动作描述
     * @param data 附加数据
     */
    private logAdapter;
    /**
     * 绑定手势事件到目标元素
     * @param target 事件目标元素
     * @param semantic 手势语义（如 tap、swipe 等）
     * @param scope 事件作用域
     * @param options 绑定选项
     * @returns 解绑函数
     */
    bind(target: EventTarget, semantic: GestureSemantic, scope: IEventScope, options?: BindOptions, source?: any): () => void;
    /**
     * 将输入信号绑定到 DOM 事件
     * @param target 事件目标元素
     * @param signals 需要绑定的输入信号列表
     * @param onInput 输入处理回调
     * @param scope 事件作用域
     * @param options 绑定选项
     * @param unbindFunctions 解绑函数数组
     */
    private bindInputSignals;
    /**
     * 将原生 DOM 事件转换为标准化的 GestureInput 对象
     * @param signal 输入信号类型
     * @param event 原生 DOM 事件
     * @returns 标准化的 GestureInput 对象
     */
    private normalizeInput;
    /**
     * 根据设备能力选择合适的 DOM 事件类型
     * @param binding 输入事件绑定配置
     * @returns 适合当前设备的原子信号列表
     */
    private selectDomEvents;
}
//# sourceMappingURL=DomEventAdapter.d.ts.map