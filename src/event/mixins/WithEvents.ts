import { Constructor } from '@orbitjs/utils';
import { globalEventBus } from '../core/GlobalEventBus';
import { EventHandler } from '../core/types';
import { BindOptions, createEventAdapter, EventAdapter, GestureSemantic } from '../adapters';
import { EventScope } from '../core';

/**
 * WithEventsPublic 接口定义了混入事件功能后类的公共API
 * 
 * 包含了事件订阅、发布、手势绑定等基本功能
 */
export interface WithEventsPublic {
    /**
     * 订阅事件
     * 
     * @param event 事件名称
     * @param handler 事件处理器
     * @returns 返回一个取消订阅的函数
     */
    on(event: string, handler: EventHandler): () => void;
    
    /**
     * 一次性订阅事件
     * 
     * 事件触发一次后会自动取消订阅
     * 
     * @param event 事件名称
     * @param handler 事件处理器
     */
    once(event: string, handler: EventHandler): void;
    
    /**
     * 触发事件
     * 
     * @param event 事件名称
     * @param payload 事件数据载荷
     */
    emit(event: string, payload?: any): void;
    
    /**
     * 将手势语义绑定到目标元素
     * 
     * 此方法用于将特定的手势语义（如点击、拖拽等）绑定到DOM元素或其他目标
     * 
     * @param target 绑定的目标对象，通常是DOM元素
     * @param semantic 手势语义类型，定义了要识别的手势类型
     * @param options 绑定选项，可选配置参数
     */
    bind(target: any, semantic: GestureSemantic, options?: BindOptions): void;
}

// NOTE: TypeScript mixin typing intentionally loosened here
// to avoid TS4094 / TS2322 / TS2797 issues.
// Internal fields are implementation details.
/**
 * WithEvents 混入函数
 * 
 * 为传入的基类添加事件处理能力，包括事件订阅、发布和手势绑定等功能。
 * 使用事件作用域来管理事件订阅的生命周期，确保在对象销毁时能正确清理事件订阅。
 * 
 * @template TBase 基类类型
 * @param Base 要混入事件功能的基类
 * @returns 返回扩展了事件功能的新类
 */
export function WithEvents<TBase extends Constructor>(
    Base: TBase
): abstract new (...args: ConstructorParameters<TBase>) => InstanceType<TBase> & WithEventsPublic {
    return class extends Base {
        // 私有事件作用域，用于管理事件订阅的生命周期
        private _eventScope: EventScope | undefined;
        // 私有事件适配器，用于处理手势事件绑定
        private _adapter: EventAdapter | undefined;

        /**
         * 获取或创建事件作用域
         * 
         * 事件作用域用于管理事件订阅的生命周期，当作用域被销毁时，
         * 所有通过该作用域订阅的事件都会被自动取消，防止内存泄漏
         */
        private get eventScope() {
            if (this._eventScope === undefined) {
                this._eventScope = globalEventBus.createEventScope();
            }
            return this._eventScope;
        }

        /**
         * 获取或创建事件适配器
         * 
         * 事件适配器用于将手势语义映射到具体的DOM事件
         */
        private get adapter() {
            if (this._adapter === undefined) {
                this._adapter = createEventAdapter();
            }
            return this._adapter;
        }

        /**
         * 订阅事件
         * 
         * @param event 事件名称
         * @param handler 事件处理器
         * @returns 返回一个取消订阅的函数
         */
        on(event: string, handler: EventHandler): () => void {
            return this.eventScope.on(event, handler);
        }

        /**
         * 一次性订阅事件
         * 
         * 事件触发一次后会自动取消订阅
         * 
         * @param event 事件名称
         * @param handler 事件处理器
         */
        once(event: string, handler: EventHandler) {
            return this.eventScope.once(event, handler);
        }

        /**
         * 触发事件
         * 
         * @param event 事件名称
         * @param payload 事件数据载荷
         */
        emit(event: string, payload?: any) {
            this.eventScope.emit(event, payload);
        }

        /**
         * 将手势语义绑定到目标元素
         * 
         * @param target 绑定的目标对象，通常是DOM元素
         * @param semantic 手势语义类型，定义了要识别的手势类型
         * @param options 绑定选项，可选配置参数
         */
        bind(target: any, semantic: GestureSemantic, options?: BindOptions): void {
            this.adapter.bind(target, semantic, this.eventScope, options);
        }

        /**
         * 销毁方法
         * 
         * 调用父类的销毁方法（如果存在），并清理当前对象的事件作用域，
         * 确保所有通过该作用域订阅的事件都被取消，防止内存泄漏
         */
        dispose() {
            super.dispose?.();
            this._eventScope?.dispose();
        }
    } as unknown as Constructor<InstanceType<TBase> & WithEventsPublic>;
}