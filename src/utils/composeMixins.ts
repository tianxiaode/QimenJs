// 定义一个可释放资源的基础类
export abstract class DisposableBase {
    /**
     * 释放资源的方法，子类可以重写此方法来实现具体的资源清理逻辑
     */
    dispose(): void {}
}

/**
 * 构造函数类型定义，表示创建一个继承自DisposableBase的类的构造函数
 * @template T 继承自DisposableBase的类型，默认为DisposableBase本身
 */
export type Constructor<T extends DisposableBase = DisposableBase> = new (...args: any[]) => T;

/** 
 * Mixin 类型定义：接受一个基类并返回一个新类的函数
 * Mixin 是一种设计模式，用于在类之间复用代码，它接受一个构造函数作为输入并返回一个新的构造函数
 */
export type Mixin = (base: Constructor) => Constructor;

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
export function composeMixins(BaseClass: Constructor, mixins: Mixin[]): Constructor {
    // 从左到右依次应用每个 mixin 到基类上
    return mixins.reduce<Constructor>((acc, mixin) => mixin(acc), BaseClass);
}