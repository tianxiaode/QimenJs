/**
 * 文件格式化与校验工具
 *
 * 从 UploadButtonComponent 提取的纯函数，供 FileDispatchCenter 及各文件组件复用。
 */

import { MimeTypeRegistrar } from '@/mime';
import { KernelErrorCode } from '@/error';
import { FileItemStatus, type FileItem } from './types';

/**
 * 解析 accept 字符串为标准化扩展名/MIME 数组
 *
 * @param accept - accept 字符串，如 'image/*,.png,.jpg'
 * @returns 标准化后的小写数组，如 ['image/*', '.png', '.jpg']
 */
export function parseAcceptExts(accept: string): string[] {
    return accept
        .split(',')
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 0);
}

/**
 * 校验文件类型是否匹配 accept 配置
 *
 * 支持：
 * - 扩展名（.png）
 * - MIME 类型（image/png）
 * - 通配符（匹配任意类型，如 纯星号 或 image 下星号）
 * - MIME 组通过 MimeTypeRegistrar 反查扩展名
 *
 * @param file - 待校验文件
 * @param accept - accept 字符串，空字符串表示不限制
 * @returns 是否允许
 */
export function isFileTypeAllowed(file: File, accept: string): boolean {
    if (!accept) return true;

    const exts = parseAcceptExts(accept);
    const fileName = file.name.toLowerCase();
    const fileExt = fileName.includes('.') ? fileName.split('.').pop()! : '';
    const mimeReg = MimeTypeRegistrar.getInstance();

    for (const pattern of exts) {
        if (pattern.startsWith('.')) {
            if (fileExt === pattern.slice(1)) return true;
        } else if (pattern.includes('/')) {
            if (file.type === pattern) return true;
            const allowedExt = mimeReg.getByMime(pattern);
            if (allowedExt && fileExt === allowedExt) return true;
        } else if (pattern === '*' || pattern === '*/*') {
            return true;
        } else {
            const mimes = mimeReg.get(pattern);
            if (mimes.length > 0 && mimes.includes(file.type)) return true;
        }
    }

    return false;
}

/**
 * 格式化文件大小为人类可读字符串
 *
 * @param bytes - 字节数
 * @returns 如 '1.5 KB'、'2.3 MB'
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 格式化文件项状态为展示文案
 *
 * @param item - 文件项
 * @returns 状态文案，如 '已完成'、'45%'、错误码
 */
export function formatFileStatus(item: FileItem): string {
    switch (item.status) {
        case FileItemStatus.SELECTED:
            return '待上传';
        case FileItemStatus.HASHING:
            return `计算中 ${item.percent}%`;
        case FileItemStatus.UPLOADING:
            return `${item.percent}%`;
        case FileItemStatus.UPLOADED:
            return '已完成';
        case FileItemStatus.DOWNLOADING:
            return `下载中 ${item.percent}%`;
        case FileItemStatus.DOWNLOADED:
            return '已下载';
        case FileItemStatus.ERROR:
            return item.error ?? KernelErrorCode.FILE_UPLOAD_FAILED;
        default:
            return '';
    }
}
