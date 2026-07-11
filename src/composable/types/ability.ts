// src/composable/types/ability.ts

/**
 * 能力定义类型
 * 
 * Ability 是普通对象，属性/方法直接复制到宿主。
 * - 方法：普通函数，复制后 this 指向宿主
 * - getter/setter：{ get() {...}, set(v) {...} } 对象
 * - 普通值：直接复制
 */
export type AbilityDefinition = Record<string | symbol, any>;

/**
 * 强类构造函数类型
 * 包含 with 静态方法
 */
export interface ForgedConstructor<T, A extends readonly AbilityDefinition[] = any> {
    new (...args: any[]): T & InferAbilities<A>;
    /**
     * 继续合并能力，返回新的强类
     * 可链式调用：BaseClass.with(A, B).with(C, D)
     */
    with<Additional extends readonly AbilityDefinition[]>(
        ...additionalAbilities: Additional
    ): ForgedConstructor<T & InferAbilities<Additional>, [...A, ...Additional]>;
}

/**
 * ============================================================
 * 类型工具：自动从能力定义提取接口
 * ============================================================
 */

/**
 * 提取单个能力的类型
 * - 方法 → 函数类型
 * - getter → 返回类型
 * - setter → 参数类型
 */
export type InferAbility<T> = 
    // 方法
    {
        [K in keyof T as T[K] extends Function ? K : never]: T[K];
    } &
    // getter 属性
    {
        [K in keyof T as T[K] extends { get: any } ? K : never]: 
            T[K] extends { get: () => infer R } ? R : never;
    } &
    // setter 属性
    {
        [K in keyof T as T[K] extends { set: any } ? K : never]: 
            T[K] extends { set: (v: infer V) => any } ? V : never;
    };

/**
 * 从能力定义数组中提取交叉类型
 * 
 * @example
 * ```typescript
 * const Base = ComposableBase.with(EventAbility, TransformAbility);
 * type BaseType = InstanceType<typeof Base>;
 * // BaseType 自动包含 EventAbility 和 TransformAbility 的所有方法
 * ```
 */
export type InferAbilities<T extends readonly AbilityDefinition[]> = 
    UnionToIntersection<InferAbility<T[number]>>;

/**
 * 联合类型转交叉类型
 * 
 * @example
 * ```typescript
 * type Union = { a: 1 } | { b: 2 };
 * type Intersection = UnionToIntersection<Union>; // { a: 1 } & { b: 2 }
 * ```
 */
export type UnionToIntersection<U> = 
    (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
