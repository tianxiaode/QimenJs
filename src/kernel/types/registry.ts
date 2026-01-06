import { FieldMapping } from './base';

export interface EntityEntry {
    name: string; // 实体唯一标识 (如 'User')
    idKey: string; // 主键名，默认 'id'
    labelKey?: string; // 显示名称字段，默认 'name'
    schema: FieldMapping[]; // 基因映射
    // 还可以扩展
    createdAtKey?: string; // 创建时间字段
    updatedAtKey?: string;
    // --- 新增 UI 行为属性 ---
    defaultSort?: {
        prop: string;
        order: 'ascending' | 'descending';
    };
    filterKeys?: string[]; // 用于本地模糊搜索的字段清单
}

export interface DomainConfig {
    baseUrl: string; // 必须有，因为这是域的身份
    timeout?: number; // 可选：某些域（如上传域）可能需要更长的超时
    headers?: Record<string, string>; // 可选：一些固定的、非动态的 Header（如 AppID）
    custom?: Record<string, any>; // 预留：给插件或特殊业务存自定义数据
    passwordRule?: {
        minLength: number;
        maxLength: number;
        uperrcase: boolean;
        lowerrcase: boolean;
        number: boolean;
        specialChar: boolean;
    };
}
