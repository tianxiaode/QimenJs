/**
 * 将源对象中的定义值复制到目标对象
 *
 * 此函数会遍历源对象的属性，如果属性值不是 undefined，
 * 则将其复制到目标对象中。对于对象类型的属性，会进行递归复制。
 *
 * @param source 源对象，从中复制属性
 * @param target 目标对象，接收源对象的属性
 * @returns 返回更新后的目标对象
 */
export declare function copyIfDefined(source: Record<string, any>, target: Record<string, any>): Record<string, any>;
/**
 * 递归替换目标对象的成员
 *
 * 该函数用于将源对象中的所有成员递归地替换到目标对象中。如果遇到相同名称的成员，
 * 且两者都是对象，则会递归地进行替换；否则，会直接用源对象的成员覆盖目标对象的成员
 *
 * @param source 源对象，其成员将被复制到目标对象中
 * @param target 目标对象，其成员将被源对象的成员替换
 * @param maxDepth 最大递归深度，默认为10，以防止无限递归
 * @param currentDepth 当前递归深度，初始调用时通常不需要设置
 * @throws 如果超过最大递归深度或源和目标不是对象，将抛出错误
 */
export declare function replaceMembers(source: Record<string, any>, target: Record<string, any>, maxDepth?: number, currentDepth?: number): void;
/**
 * 从对象中获取嵌套值
 *
 * 根据提供的路径字符串从对象中获取嵌套的值，路径使用点号分隔
 *
 * @param obj 要从中获取值的对象
 * @param path 属性路径，例如 "a.b.c" 表示 obj.a.b.c
 * @returns 如果路径存在则返回对应的值，否则返回 undefined
 */
export declare function getNestedValue(obj: Record<string, any>, path: string): any;
/**
 * 设置对象的嵌套值
 *
 * 根据提供的路径字符串在对象中设置嵌套的值，路径使用点号分隔
 * 如果路径中的中间属性不存在，会自动创建对象
 *
 * @param obj 要设置值的对象
 * @param path 属性路径，例如 "a.b.c" 表示 obj.a.b.c
 * @param value 要设置的值
 *
 * @example
 * const obj = {};
 * setNestedValue(obj, 'a.b.c', 'value');
 * console.log(obj); // { a: { b: { c: 'value' } } }
 */
export declare function setNestedValue(obj: Record<string, any>, path: string, value: any): void;
/**
 * 销毁对象的成员
 *
 * 遍历指定的成员列表，对每个成员执行销毁操作（如果存在 destroy 方法），
 * 然后递归销毁其子对象的成员，最后删除该成员
 *
 * @param obj 要销毁成员的对象
 * @param members 要销毁的成员名称列表
 */
export declare function destroyMembers(obj: Record<string, any>, members: string[]): void;
//# sourceMappingURL=properties.d.ts.map