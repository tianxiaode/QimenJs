/**
 * 内容项声明标准化工具
 *
 * 将组件 static icons/texts/placeholders 声明统一标准化为 { name, order? } 结构。
 * 支持三种声明形式：
 * - 字符串：'default' → { name: 'default' }
 * - 元组：['default', 10] → { name: 'default', order: 10 }
 * - 对象：{ name: 'default', order: 10 } → 原样
 */

export interface ContentItemConfig {
    name: string;
    order?: number;
}

export type ContentItemDecl = string | [string, number] | ContentItemConfig;

/**
 * 标准化内容项声明数组
 *
 * @param decls - 原始声明数组
 * @returns 标准化后的配置数组
 */
export function normalizeContentDecls(decls: ContentItemDecl[]): ContentItemConfig[] {
    return decls.map(decl => {
        if (typeof decl === 'string') {
            return { name: decl };
        }
        if (Array.isArray(decl)) {
            return { name: decl[0], order: decl[1] };
        }
        return decl;
    });
}

/**
 * 从标准化配置中提取 names 数组和 positions 映射
 */
export function extractContentMeta(configs: ContentItemConfig[]): {
    names: string[];
    positions: Record<string, number>;
} {
    const names = configs.map(c => c.name);
    const positions: Record<string, number> = {};
    for (const c of configs) {
        if (c.order !== undefined) {
            positions[c.name] = c.order;
        }
    }
    return { names, positions };
}
