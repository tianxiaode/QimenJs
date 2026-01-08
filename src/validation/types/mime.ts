type MimeMapping = {
    extensions: string[];
    mimes: string[];
};

class MimeRegistry {
    private static storage = new Map<string, string[]>();

    // 内置常用配置
    static {
        this.add('image', ['jpg', 'jpeg', 'png', 'gif', 'webp'], ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
        this.add('archive', ['zip', 'rar', '7z'], ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']);
        this.add('pdf', ['pdf'], ['application/pdf']);
    }

    /** 动态注册接口 */
    static add(group: string, extensions: string[], mimes: string[]) {
        extensions.forEach(ext => {
            const normalizedExt = ext.replace('.', '').toLowerCase();
            const existing = this.storage.get(normalizedExt) || [];
            this.storage.set(normalizedExt, Array.from(new Set([...existing, ...mimes])));
        });
    }

    /** 查询接口 */
    static getMimes(ext: string): string[] {
        return this.storage.get(ext.replace('.', '').toLowerCase()) || [];
    }
}