import { HashTask } from './hash';
/**
 * 创建哈希任务的工厂函数
 *
 * 根据输入类型（File、string或ReadableStream）创建相应的哈希任务
 *
 * @param input - 输入数据，可以是File对象、文件路径字符串或ReadableStream
 * @param algorithm - 哈希算法，可以是字符串（如'sha256'）或自定义哈希函数
 * @returns 返回配置好的HashTask实例
 *
 * @example
 * ```ts
 * // 使用内置算法
 * const task = createHashTask(file, 'sha256');
 *
 * // 使用自定义哈希函数
 * const task = createHashTask(data, (data: ArrayBuffer) => customHashFunction(data));
 * ```
 */
export declare function createHashTask(input: File | string | ReadableStream<Uint8Array>, algorithm: string | ((data: ArrayBuffer) => any)): HashTask;
//# sourceMappingURL=factory.d.ts.map