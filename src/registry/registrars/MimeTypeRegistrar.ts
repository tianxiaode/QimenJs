import { RegistrarBase } from './RegistrarBase';
import { MimeTypeRegistrarName } from '../types';
import { RegistrarInvalidArgumentError } from './errors';

export class MimeTypeRegistrar extends RegistrarBase<Map<string, Set<string>>> {
    public readonly name = MimeTypeRegistrarName;

    protected storage = new Map<string, Set<string>>();
    // 反向映射：MIME类型 -> 扩展名列表
    private reverseStorage = new Map<string, Set<string>>();

    /**
     * 支持两种注册模式：
     * 1. 单个注册: register('jpg', 'image/jpeg') 或 register('js', ['text/javascript', 'application/javascript'])
     * 2. 对象批量注册: register({ 'jpg': 'image/jpeg', 'png': 'image/png' })
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

    /** 内部私有方法，保持逻辑纯粹 */
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

    /** * 高性能查询：
     * 1. 传 'jpg' -> 返回 ['image/jpeg']
     * 2. 传 ['jpg', 'png'] -> 返回 Set { 'image/jpeg', 'image/png', ... }
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
     * @param mime MIME类型字符串
     * @returns 匹配的扩展名数组
     */
    getByMime(mime: string): string {
        const extSet = this.reverseStorage.get(mime);
        const extArray  = Array.from(extSet || [])
        return extArray.length > 0 ? extArray[0] : '';
    }

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