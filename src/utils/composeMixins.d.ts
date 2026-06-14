export declare class DisposableBase {
    /**
     * 释放资源的方法，子类可以重写此方法来实现具体的资源清理逻辑
     */
    dispose(): void;
}
/**
 * 构造函数类型定义，表示创建一个继承自DisposableBase的类的构造函数
 * @template T 继承自DisposableBase的类型，默认为DisposableBase本身
 */
export type DisposableConstructor = new (...args: any[]) => DisposableBase;
export type Mixin = (Base: DisposableConstructor) => DisposableConstructor;
/**
 * 组合多个 Mixin 的函数，将它们依次应用到基类上
 *
 * @param BaseClass 基础类的构造函数
 * @param mixins Mixin 函数数组，将按照数组顺序依次应用到基类上
 * @returns 应用所有 Mixin 后的构造函数
 *
 * @example
 * ```typescript
 * class Base extends DisposableBase {}
 * const MixedClass = composeMixins(Base, [mixin1, mixin2]);
 * const instance = new MixedClass();
 * ```
 */
export declare function composeMixins(Base: DisposableConstructor, mixins: Mixin[]): DisposableConstructor;
//# sourceMappingURL=composeMixins.d.ts.map