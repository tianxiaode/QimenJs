/**
 * FileInput 组件类型定义
 *
 * 文件项状态枚举、传输配置、文件项接口。
 */

export enum FileItemStatus {
    SELECTED = 'selected',
    HASHING = 'hashing',
    UPLOADING = 'uploading',
    UPLOADED = 'uploaded',
    ERROR = 'error',
}

export interface FileTransportConfig {
    domain?: string;
    url: string;
    hashEnabled?: boolean;
    headers?: Record<string, string>;
}

export interface FileItem {
    id: string;
    file: File;
    name: string;
    size: number;
    status: FileItemStatus;
    percent: number;
    hash?: string;
    result?: any;
    error?: string;
}
