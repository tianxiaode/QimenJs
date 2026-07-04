/**
 * MimeTypeRegistrar - MIME 类型注册器
 *
 * 职责：
 * - 管理文件扩展名与 MIME 类型之间的映射关系
 * - 支持正向查找（扩展名 → MIME）和反向查找（MIME → 扩展名）
 * - 适用于文件上传下载、内容类型识别等场景
 */

import { RegistrarBase } from '@qimenjs/registry';
import { RegistrarInvalidArgumentError } from '@qimenjs/registry';

/**
 * MIME 类型注册器名称
 */
export const MimeTypeRegistrarName = 'mimeType' as const;

/**
 * MIME类型注册器
 * 管理文件扩展名与MIME类型之间的映射关系
 *
 * 支持正向和反向查找，可以：
 * 1. 根据文件扩展名查找对应的MIME类型
 * 2. 根据MIME类型查找对应的文件扩展名
 *
 * 适用于文件上传下载、内容类型识别等场景
 */
export class MimeTypeRegistrar extends RegistrarBase<Map<string, Set<string>>> {
    public readonly name = MimeTypeRegistrarName;

    /**
     * 存储扩展名到MIME类型的映射
     * 使用Map结构实现高效的键值对存储和检索
     * @protected
     */
    protected storage = new Map<string, Set<string>>();

    /**
     * 反向映射：MIME类型到扩展名列表
     * 用于根据MIME类型查找对应的扩展名
     * 保证正向和反向映射的一致性
     */
    private reverseStorage = new Map<string, Set<string>>();

    /**
     * 注册MIME类型映射
     * 支持两种注册模式：
     * 1. 单个注册: register('jpg', 'image/jpeg') 或 register('js', ['text/javascript', 'application/javascript'])
     * 2. 对象批量注册: register({ 'jpg': 'image/jpeg', 'png': 'image/png' })
     *
     * @param extOrObj - 扩展名或包含多个扩展名-MIME类型的对象
     * @param mimes - MIME类型或MIME类型数组（当第一个参数为扩展名时）
     * @throws RegistrarInvalidArgumentError - 当参数无效时
     */
    register(
        extOrObj: string | Record<string, string | string[]>,
        mimes?: string | string[]
    ): void {
        this.checkLock();

        if (typeof extOrObj === 'object' && extOrObj !== null) {
            // 模式 2：对象批量注册
            for (const [ext, val] of Object.entries(extOrObj)) {
                this.doRegister(ext, val);
            }
        } else if (typeof extOrObj === 'string') {
            // 模式 1：单个注册
            if (mimes === undefined)
                throw new RegistrarInvalidArgumentError(this.name, extOrObj);
            this.doRegister(extOrObj, mimes);
        }
    }

    /**
     * 内部私有方法，执行实际的注册操作
     * 同时更新正向和反向映射
     *
     * @param ext - 文件扩展名（不需要带点号）
     * @param mimes - MIME类型或MIME类型数组
     * @private
     */
    private doRegister(ext: string, mimes: string | string[]): void {
        const cleanExt = ext.startsWith('.') ? ext.slice(1) : ext;
        const mimeSet = this.storage.get(cleanExt) || new Set<string>();

        const newMimes = Array.isArray(mimes) ? mimes : [mimes];

        // 更新正向映射
        newMimes.forEach(m => mimeSet.add(m));
        this.storage.set(cleanExt, mimeSet);

        // 更新反向映射
        newMimes.forEach(mime => {
            if (!this.reverseStorage.has(mime)) {
                this.reverseStorage.set(mime, new Set<string>());
            }
            this.reverseStorage.get(mime)!.add(cleanExt);
        });
    }

    /**
     * 注销指定扩展名的MIME类型映射
     * 同时清理正向和反向映射中的相关条目
     *
     * @param ext - 要注销的扩展名
     */
    unregister(ext: string): void {
        this.checkLock();
        const cleanExt = ext.startsWith('.') ? ext.slice(1) : ext;

        // 如果存在，则从反向映射中删除
        const existingMimes = this.storage.get(cleanExt);
        if (existingMimes) {
            for (const mime of existingMimes) {
                const exts = this.reverseStorage.get(mime);
                if (exts) {
                    exts.delete(cleanExt);
                    if (exts.size === 0) {
                        this.reverseStorage.delete(mime);
                    }
                }
            }
        }

        this.storage.delete(cleanExt);
    }

    /**
     * 根据扩展名获取对应的MIME类型
     * 支持单个或多个扩展名查询
     *
     * @param query - 扩展名或扩展名数组
     * @returns MIME类型数组或MIME类型的Set
     */
    get(query: string): string[];
    get(query: string[]): Set<string>;
    get(query: string | string[]): any {
        if (Array.isArray(query)) {
            const result = new Set<string>();
            query.forEach(ext => {
                const cleanExt = ext.startsWith('.') ? ext.slice(1) : ext;
                this.storage.get(cleanExt)?.forEach(m => result.add(m));
            });
            return result;
        }
        const cleanExt = query.startsWith('.') ? query.slice(1) : query;
        return Array.from(this.storage.get(cleanExt) || []);
    }

    /**
     * 根据 MIME 类型获取对应的扩展名
     * 返回找到的第一个扩展名
     *
     * @param mime - MIME类型字符串
     * @returns 匹配的扩展名，如果没有匹配项则返回空字符串
     */
    getByMime(mime: string): string {
        const extSet = this.reverseStorage.get(mime);
        const extArray = Array.from(extSet || []);
        return extArray.length > 0 ? extArray[0] : '';
    }

    /**
     * 输出MIME类型注册器的状态信息
     * 显示当前存储的所有扩展名与MIME类型的映射关系
     *
     * @protected
     */
    protected doInspect(): void {
        console.group('📁 MIME Type Registry Status');
        const summary: Record<string, string> = {};
        this.storage.forEach((mimes, ext) => {
            summary[ext] = Array.from(mimes).join(', ');
        });
        console.table(summary);
        console.groupEnd();
    }
}
