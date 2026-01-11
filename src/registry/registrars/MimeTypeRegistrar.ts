import { MimeTypeRegistrarName } from "../types";


export class MimeTypeRegistrar {
    static readonly registrarName = MimeTypeRegistrarName;

    /** 静态存储：后缀 -> MIME 数组的映射 */
    private static storage = new Map<string, Set<string>>();

    /** 编码期/默认预设注入 */
    static register(ext: string, mimes: string | string[]): void {
        const cleanExt = ext.startsWith('.') ? ext.slice(1) : ext;
        const mimeSet = this.storage.get(cleanExt) || new Set();

        if (Array.isArray(mimes)) {
            mimes.forEach(m => mimeSet.add(m));
        } else {
            mimeSet.add(mimes);
        }
        this.storage.set(cleanExt, mimeSet);
    }

    static unregister(ext: string): void {
        MimeTypeRegistrar.storage.delete(ext.startsWith('.') ? ext.slice(1) : ext);
    }

    /** * 高性能查询：
     * 1. 传 'jpg' -> 返回 ['image/jpeg']
     * 2. 传 ['jpg', 'png'] -> 返回 Set { 'image/jpeg', 'image/png', ... }
     */
    static get(query: string): string[];
    static get(query: string[]): Set<string>;
    static get(query: string | string[]): any {
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

    static lock(): void {
        // 锁定后，将所有 Set 转为不可变，并冻结 Map
        Object.freeze(MimeTypeRegistrar.storage);
    }

    static inspect(): void {
        console.group('📂 MimeType Mapping Table');
        const displayData: Record<string, string> = {};
        MimeTypeRegistrar.storage.forEach((mimes, ext) => {
            displayData[ext] = Array.from(mimes).join(', ');
        });
        console.table(displayData);
        console.groupEnd();
    }
}


