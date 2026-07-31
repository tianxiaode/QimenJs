/**
 * @qimenjs/file
 *
 * 文件调度领域 — 提供文件上传/下载/校验/哈希的统一编排与状态管理
 */

// 类型定义
export * from './types';

// 格式化与校验工具
export * from './format';

// 调度中心
export { FileDispatchCenter, fileDispatchCenter } from './FileDispatchCenter';
