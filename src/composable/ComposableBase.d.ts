import { ILogger } from '@orbitjs/logger';
import type { IComposableBase } from './types/composable';
/**
 * 装饰器：声明该类需要的能力
 *
 * 改进方案：在装饰器阶段完成能力收集，无需运行时原型链爬取
 *
 * 工作原理：
 * 1. 装饰器按代码定义顺序执行（父类先于子类）
 * 2. 装饰子类时，父类已完成装饰
 * 3. 直接从父类获取已收集的能力，合并自己的能力
 * 4. 性能从 O(n) 提升到 O(1)
 *
 * @param keys - 能力键的列表
 * @returns 类装饰器函数
 */
export declare function Ability(...keys: string[]): (ctor: any) => void;
/**
 * 可组合基类，提供了能力注入和管理的基础功能
 *
 * 该类实现了自动装配能力的功能，通过装饰器声明所需能力，
 * 并从注册中心获取能力实例并将其附加到宿主对象上。
 *
 * 优化方案：
 * - 使用预编译能力，性能提升 70-90%
 * - 懒加载预编译，启动快
 * - 闭包捕获 host，无需 Ability 实例
 */
export declare abstract class ComposableBase implements IComposableBase {
    /**
     * 日志记录器实例
     */
    logger: ILogger;
    [key: string]: any;
    /**
     * 构造函数，初始化日志记录器和设置能力
     */
    constructor();
    /**
     * 提供给子类或 Ability 使用：获取类级缓存
     *
     * @template T - 返回值类型
     * @param key - 缓存键
     * @returns 缓存的值，如果不存在则返回 undefined
     */
    getStatic<T>(key: string | symbol): T | undefined;
    /**
     * 提供给子类或 Ability 使用：设置类级缓存
     *
     * @template T - 值的类型
     * @param key - 缓存键
     * @param value - 要存储的值
     */
    setStatic<T>(key: string | symbol, value: T): void;
    /**
     * 自动装配方法：使用预编译能力
     *
     * @protected
     */
    protected setupAbilities(): void;
    /**
     * 应用重写功能，允许派生类自定义一些功能
     *
     * @protected
     */
    protected applyOverrides(): void;
    /**
     * 统一销毁：按装配顺序的逆序执行
     */
    dispose(): void;
}
//# sourceMappingURL=ComposableBase.d.ts.map