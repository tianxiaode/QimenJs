/**
 * @qimenjs/file
 *
 * 文件调度领域 — 提供文件上传/下载/校验/哈希/魔数验证/分片续传的统一编排与状态管理
 */

// 类型定义
export * from './types';

// 格式化与校验工具
export * from './format';

// 魔数验证
export * from './magic';

// 下载工具
export * from './download';

// 哈希计算
export * from './hash';

// 分片上传与断点续传
export { ChunkedUploader } from './chunked-upload';
export type {
    UploadChunk,
    ChunkProgress,
    ChunkedUploadConfig,
    ChunkUploadStatus,
} from './chunked-upload';

// 调度中心
export { FileDispatchCenter, fileDispatchCenter } from './FileDispatchCenter';
