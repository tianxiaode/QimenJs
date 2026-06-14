/**
 * 能力基类 - 新版本
 *
 * 结合了熟悉的 expose() API 和预编译性能优势
 */
import type { IPrecompiledAbility, IPrecompilableAbility, IExposeResult } from '../types/composable';
/**
 * 能力基类
 *
 * 提供熟悉的 expose() API，内部自动转换为预编译能力
 *
 * @example
 * ```typescript
 * class EventAbility extends AbilityBase {
 *     readonly name = 'Event';
 *
 *     protected expose(): IExposeResult {
 *         const scope = globalEventBus.createEventScope();
 *
 *         return {
 *             eventScope: { get: () => scope },
 *             on: (event, handler) => scope.on(event, handler),
 *             emit: (event, data) => scope.emit(event, data),
 *         };
 *     }
 *
 *     protected onDispose(): void {
 *         this.eventScope?.dispose();
 *     }
 * }
 * ```
 */
export declare abstract class AbilityBase implements IPrecompilableAbility {
    /**
     * 能力名称
     */
    abstract readonly name: string;
    /**
     * 宿主引用（在运行时通过闭包捕获）
     * @protected
     */
    protected host: any;
    /**
     * 暴露属性和方法
     *
     * 子类实现此方法，返回要暴露给宿主的属性和方法
     *
     * **重要：** 在 expose() 中不能使用 this.host，因为此时 host 还未设置！
     * 如果需要访问 host，请在返回的 getter/setter/方法中访问。
     *
     * @returns 属性和方法定义
     * @protected
     *
     * @example
     * ```typescript
     * // ❌ 错误：在 expose() 中使用 this.host
     * protected expose() {
     *     const domain = this.host.domain;  // this.host 是 undefined！
     *     return { domain: { get: () => domain } };
     * }
     *
     * // ✅ 正确：在 getter 中使用 this.host
     * protected expose() {
     *     return {
     *         domain: {
     *             get: () => this.host.domain  // 在 getter 中访问
     *         }
     *     };
     * }
     * ```
     */
    protected abstract expose(): IExposeResult;
    /**
     * 销毁方法
     *
     * 子类可重写此方法执行清理逻辑
     *
     * @protected
     */
    protected onDispose(): void;
    /**
     * 预编译方法
     *
     * 将 expose() 返回的定义转换为预编译能力
     *
     * @returns 预编译能力
     */
    precompile(): IPrecompiledAbility;
    /**
     * 创建属性描述符工厂
     *
     * @param value - 属性定义
     * @returns 描述符工厂
     * @private
     */
    private createDescriptorFactory;
}
//# sourceMappingURL=AbilityBase.d.ts.map