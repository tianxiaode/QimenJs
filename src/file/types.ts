/**
 * 文件领域类型定义
 *
 * 从 src/component/button/UploadButtonComponent 迁移并扩展，集中所有文件相关类型，
 * 供 FileDispatchCenter、UploadButtonComponent 及未来的拖拽上传区、图片预览上传、
 * 下载按钮等组件统一引用。
 */

/**
 * 文件项状态枚举
 *
 * 覆盖选择、哈希、上传、下载全生命周期。
 */
export enum FileItemStatus {
    SELECTED = 'selected',
    HASHING = 'hashing',
    UPLOADING = 'uploading',
    UPLOADED = 'uploaded',
    ERROR = 'error',
    DOWNLOADING = 'downloading',
    DOWNLOADED = 'downloaded',
}

/**
 * 文件传输配置（直传模式）
 *
 * 配置 FileDispatchCenter 通过 HttpClient 直接上传到指定 URL。
 */
export interface FileTransportConfig {
    /** 域名（传给 HttpClient） */
    domain?: string;
    /** 上传目标 URL */
    url: string;
    /** 是否启用哈希计算（秒传/断点续传） */
    hashEnabled?: boolean;
    /** 哈希算法，默认 'sha256' */
    hashAlgorithm?: string;
    /** 自定义请求头 */
    headers?: Record<string, string>;
}

/**
 * 文件项
 *
 * 单个文件在通道队列中的完整状态记录。
 * file 字段可选：setFormValue 回填已上传项时无 File 对象。
 */
export interface FileItem {
    /** 文件唯一 ID（由 FileDispatchCenter 生成） */
    id: string;
    /** 原始 File 对象（setFormValue 回填时可能为 null） */
    file?: File | null;
    /** 文件名 */
    name: string;
    /** 文件大小（字节） */
    size: number;
    /** 当前状态 */
    status: FileItemStatus;
    /** 进度百分比 0-100 */
    percent: number;
    /** 文件哈希（hashEnabled 开启后填充） */
    hash?: string;
    /** 上传成功后的服务端返回数据 */
    result?: any;
    /** 错误码（status 为 ERROR 时填充） */
    error?: string;
}

/**
 * 文件通道配置
 *
 * 一个 fileKey 对应一个通道，通道内共享配置与文件队列。
 * 多个组件可 connect 同一 fileKey，从而共享同一队列与配置。
 */
export interface FileChannelConfig {
    /** 直传传输配置 */
    transport?: FileTransportConfig;
    /** 文件类型过滤（accept 字符串，如 'image/*,.png'） */
    accept?: string;
    /** 是否允许多选 */
    multiple?: boolean;
    /** 单文件最大字节数 */
    maxSize?: number;
    /** 选择后是否自动上传，默认 true */
    autoUpload?: boolean;
    /** 并发上传数（预留字段，本期不实现，默认顺序上传） */
    concurrency?: number;
}

/**
 * 文件通道运行时状态
 *
 * FileDispatchCenter 内部按 fileKey 持有，管理队列与引用计数。
 */
export interface FileChannelState {
    /** 通道配置 */
    config: FileChannelConfig;
    /** 文件队列 */
    items: FileItem[];
    /** 组件连接引用计数，到 0 销毁通道 */
    refCount: number;
    /** 进行中的任务（上传/下载），key 为 itemId 或 '__download__' */
    activeTasks: Map<string, { cancel: (reason?: any) => void }>;
    /** 命令事件监听取消函数（createChannel 时注册，destroyChannel 时清理） */
    actionUnsubs: (() => void)[];
}
