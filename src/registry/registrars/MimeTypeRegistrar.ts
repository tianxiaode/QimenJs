import { MimeTypeRegistrarName, Registrar } from "@orbitjs/registry";

export class MimeTypeRegistrar implements Registrar<string[]> {
    readonly name = MimeTypeRegistrarName;

    /** 静态存储：后缀 -> MIME 数组的映射 */
    private static storage = new Map<string, Set<string>>();

    /** 编码期/默认预设注入 */
    static add(ext: string, mimes: string | string[]): void {
        const cleanExt = ext.startsWith('.') ? ext.slice(1) : ext;
        const mimeSet = this.storage.get(cleanExt) || new Set();
        
        if (Array.isArray(mimes)) {
            mimes.forEach(m => mimeSet.add(m));
        } else {
            mimeSet.add(mimes);
        }
        this.storage.set(cleanExt, mimeSet);
    }

    // --- 实现 Registrar 接口 ---

    /** 运行期：单条添加 */
    add(ext: string, entry: string | string[]): void {
        MimeTypeRegistrar.add(ext, entry);
    }

    /** 运行期：批量注册（例如 register('image', ['jpg', 'png'])） */
    register(name: string, entry: string[]): void {
        entry.forEach(ext => MimeTypeRegistrar.add(ext, name));
    }

    unregister(ext: string): void {
        MimeTypeRegistrar.storage.delete(ext.startsWith('.') ? ext.slice(1) : ext);
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
                MimeTypeRegistrar.storage.get(cleanExt)?.forEach(m => result.add(m));
            });
            return result;
        }
        const cleanExt = query.startsWith('.') ? query.slice(1) : query;
        return Array.from(MimeTypeRegistrar.storage.get(cleanExt) || []);
    }

    lock(): void {
        // 锁定后，将所有 Set 转为不可变，并冻结 Map
        Object.freeze(MimeTypeRegistrar.storage);
    }

    inspect(): void {
        console.group('📂 MimeType Mapping Table');
        const displayData: Record<string, string> = {};
        MimeTypeRegistrar.storage.forEach((mimes, ext) => {
            displayData[ext] = Array.from(mimes).join(', ');
        });
        console.table(displayData);
        console.groupEnd();
    }
}