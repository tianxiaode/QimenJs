/**
 * 注册器基类
 * 定义了注册器的基本结构和通用操作方法
 *
 * 所有具体的注册器都应继承此类，以获得统一的接口和功能
 * 包括单例模式、锁定机制、存储管理和基本操作方法
 */
export declare abstract class RegistrarBase<M = any> {
    /**
     * 存储所有注册器实例，确保单例模式
     * 使用构造函数作为键，保证每种注册器只有一个实例
     * @private
     */
    private static instances;
    /**
     * 注册器的唯一名称，子类必须实现
     * 用于在注册中心中标识和检索注册器实例
     */
    abstract readonly name: string;
    /**
     * 注册器锁定状态
     * 用于防止在应用启动后修改配置
     * @protected
     */
    protected isLocked: boolean;
    /**
     * 存储数据的具体实现，由子类提供
     * 不同的注册器可以使用不同的数据结构来存储数据
     * @protected
     */
    protected abstract storage: M;
    /**
     * 获取注册器实例，确保单例模式
     *
     * @returns 注册器实例，确保同一类型只存在一个实例
     */
    static getInstance<T extends RegistrarBase<any>>(this: new () => T): T;
    /**
     * 检查注册器是否被锁定
     * 如果已锁定则抛出错误
     *
     * @throws Error - 当注册器被锁定时抛出
     * @protected
     */
    protected checkLock(): void;
    /**
     * 锁定注册器，阻止后续修改
     *
     * 一旦锁定，将不能进行注册、注销等修改操作
     * 通常在应用启动完成后调用，确保运行时配置的稳定性
     */
    lock(): void;
    /**
     * 清空存储的数据
     * 根据存储类型的不同采用不同的清空方式
     *
     * 此操作不可逆，请谨慎使用
     */
    clear(): void;
    /**
     * 输出注册器的当前状态信息
     * 以分组的形式输出注册器的信息，便于调试和诊断
     *
     * 此方法会调用子类实现的doInspect方法来显示具体的数据内容
     */
    inspect(): void;
    /**
     * 抽象方法：注册项目
     * 子类必须实现此方法来提供具体的注册逻辑
     *
     * @param args - 注册参数，根据具体实现而定
     */
    abstract register(...args: any[]): void;
    /**
     * 抽象方法：注销项目
     * 子类必须实现此方法来提供具体的注销逻辑
     *
     * @param id - 要注销的项目的ID
     */
    abstract unregister(id: string): void;
    /**
     * 抽象方法：获取项目
     * 子类必须实现此方法来提供具体的数据获取逻辑
     *
     * @param args - 获取参数，根据具体实现而定
     * @returns 获取到的数据
     */
    abstract get(...args: any[]): any;
    /**
     * 抽象方法：实现具体的输出逻辑
     * 子类必须实现此方法来定义如何输出注册器的状态信息
     *
     * @protected
     */
    protected abstract doInspect(): void;
}
//# sourceMappingURL=RegistrarBase.d.ts.map