import { Constructor } from '@orbitjs/utils';
import { EventHandler } from '../core/types';
import { BindOptions, createEventAdapter, GestureSemantic } from '../adapters';

/**
 * WithEventsPublic 接口定义了混入事件功能后类的公共API
 *
 * 包含了事件订阅、发布、手势绑定等基本功能
 */
export interface WithDomEventsPublic {
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
/**
 * 定义一个内部接口，描述 WithEvents 注入的成员
 * 这样 WithDomEvents 才能安全地访问 this.eventScope
 */

export function WithDomEvents<TBase extends Constructor<any>>(
    Base: TBase
): abstract new (
    ...args: ConstructorParameters<TBase>
) => InstanceType<TBase> & WithDomEventsPublic {
    return class extends Base {
        private _adapter: any | undefined;

        private get adapter() {
            if (this._adapter === undefined) {
                this._adapter = createEventAdapter();
            }
            return this._adapter;
        }

        /**
         * 这里的关键是使用类型断言 (this as any)，
         * 因为 TS 很难在 Mixin 嵌套中自动推导出动态注入的 get eventScope
         */
        bind(target: any, semantic: any, options?: any): void {
            const scope = (this as any).eventScope;
            if (!scope) {
                throw new Error(
                    'WithDomEvents requires WithEvents to be mixed in first or eventScope to be defined.'
                );
            }
            this.adapter.bind(target, semantic, scope, options);
        }

        dispose() {
            super.dispose?.();
            // Adapter 如果有销毁逻辑也可以在这里处理
        }
    } as unknown as Constructor<InstanceType<TBase>> & WithDomEventsPublic;
}
