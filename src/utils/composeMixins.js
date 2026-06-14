"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisposableBase = void 0;
exports.composeMixins = composeMixins;
// 定义一个可释放资源的基础类
class DisposableBase {
    /**
     * 释放资源的方法，子类可以重写此方法来实现具体的资源清理逻辑
     */
    dispose() { }
}
exports.DisposableBase = DisposableBase;
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
function composeMixins(Base, mixins) {
    // 内部实现依然可以用 any 保证运行
    return mixins.reduce((cls, mixin) => mixin(cls), Base);
}
//# sourceMappingURL=composeMixins.js.map