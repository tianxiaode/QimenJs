/**
 * Repeater接口定义了可重复执行对象的行为
 * 它提供取消执行和检查是否活跃的方法
 */
export interface Repeater {
    /**
     * 取消重复执行
     */
    cancel(): void;
    /**
     * 检查重复执行是否仍处于活跃状态
     * @returns 如果仍在重复执行则返回true，否则返回false
     */
    isActive(): boolean;
}

/**
 * Cancelable接口定义了可取消对象的行为
 * 它提供取消执行和检查是否活跃的方法
 */
export interface Cancelable {
    /**
     * 取消执行
     */
    cancel(): void;
    /**
     * 检查是否仍处于活跃状态
     * @returns 如果仍在等待执行则返回true，否则返回false
     */
    isActive(): boolean;
}
