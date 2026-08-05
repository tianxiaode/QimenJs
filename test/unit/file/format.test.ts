/**
 * format.ts 单元测试
 *
 * 覆盖 parseAcceptExts、isFileTypeAllowed、formatFileSize、formatFileStatus
 */

jest.mock('@qimenjs/mime', () => ({
    MimeTypeRegistrar: {
        getInstance: jest.fn(() => ({
            getByMime: jest.fn((mime: string) => {
                const map: Record<string, string> = {
                    'image/png': 'png',
                    'image/jpeg': 'jpg',
                    'application/pdf': 'pdf',
                };
                return map[mime] ?? '';
            }),
            get: jest.fn((type: string) => {
                if (type === 'image') return ['image/png', 'image/jpeg'];
                return [];
            }),
        })),
    },
}));

import {
    parseAcceptExts,
    isFileTypeAllowed,
    formatFileSize,
    formatFileStatus,
} from '@/file/format';
import { FileItemStatus } from '@/file/types';
import type { FileItem } from '@/file/types';

function createFile(name: string, type: string, size = 100): File {
    const blob = new Blob(['x'.repeat(size)], { type });
    return new File([blob], name, { type });
}

describe('parseAcceptExts', () => {
    it('解析逗号分隔的扩展名', () => {
        expect(parseAcceptExts('.png,.jpg')).toEqual(['.png', '.jpg']);
    });

    it('去除空白并转小写', () => {
        expect(parseAcceptExts(' .PNG , .JPG ')).toEqual(['.png', '.jpg']);
    });

    it('过滤空字符串', () => {
        expect(parseAcceptExts('.png,,.jpg,')).toEqual(['.png', '.jpg']);
    });

    it('支持 MIME 类型', () => {
        expect(parseAcceptExts('image/*,.pdf')).toEqual(['image/*', '.pdf']);
    });

    it('空字符串返回空数组', () => {
        expect(parseAcceptExts('')).toEqual([]);
    });
});

describe('isFileTypeAllowed', () => {
    it('accept 为空字符串时不限制', () => {
        const file = createFile('test.exe', 'application/x-msdownload');
        expect(isFileTypeAllowed(file, '')).toBe(true);
    });

    it('扩展名匹配', () => {
        const file = createFile('photo.png', 'image/png');
        expect(isFileTypeAllowed(file, '.png')).toBe(true);
    });

    it('扩展名不匹配', () => {
        const file = createFile('photo.png', 'image/png');
        expect(isFileTypeAllowed(file, '.jpg')).toBe(false);
    });

    it('MIME 类型精确匹配', () => {
        const file = createFile('photo.png', 'image/png');
        expect(isFileTypeAllowed(file, 'image/png')).toBe(true);
    });

    it('MIME 类型不匹配', () => {
        const file = createFile('photo.png', 'image/png');
        expect(isFileTypeAllowed(file, 'image/jpeg')).toBe(false);
    });

    it('通配符 * 匹配所有', () => {
        const file = createFile('test.txt', 'text/plain');
        expect(isFileTypeAllowed(file, '*')).toBe(true);
    });

    it('通配符 */* 因包含 / 进入 MIME 分支，不匹配非 */* 类型', () => {
        const file = createFile('test.txt', 'text/plain');
        expect(isFileTypeAllowed(file, '*/*')).toBe(false);
    });

    it('MIME 组匹配（image 匹配 image/png）', () => {
        const file = createFile('photo.png', 'image/png');
        expect(isFileTypeAllowed(file, 'image')).toBe(true);
    });

    it('MIME 组不匹配', () => {
        const file = createFile('doc.pdf', 'application/pdf');
        expect(isFileTypeAllowed(file, 'image')).toBe(false);
    });

    it('MIME 类型通过 MimeTypeRegistrar 反查扩展名匹配', () => {
        const file = createFile('photo.png', 'image/png');
        expect(isFileTypeAllowed(file, 'image/png')).toBe(true);
    });

    it('文件名无扩展名时扩展名匹配失败', () => {
        const file = createFile('noext', 'image/png');
        expect(isFileTypeAllowed(file, '.png')).toBe(false);
    });
});

describe('formatFileSize', () => {
    it('小于 1KB 显示字节', () => {
        expect(formatFileSize(512)).toBe('512 B');
    });

    it('0 字节', () => {
        expect(formatFileSize(0)).toBe('0 B');
    });

    it('1KB 量级', () => {
        expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('1MB 量级', () => {
        expect(formatFileSize(2 * 1024 * 1024 + 307200)).toBe('2.3 MB');
    });

    it('刚好 1023 字节', () => {
        expect(formatFileSize(1023)).toBe('1023 B');
    });

    it('刚好 1024 字节', () => {
        expect(formatFileSize(1024)).toBe('1.0 KB');
    });
});

describe('formatFileStatus', () => {
    function makeItem(overrides: Partial<FileItem> = {}): FileItem {
        return {
            id: 'test',
            name: 'test.txt',
            size: 100,
            status: FileItemStatus.SELECTED,
            percent: 0,
            ...overrides,
        };
    }

    it('SELECTED 状态', () => {
        expect(formatFileStatus(makeItem({ status: FileItemStatus.SELECTED }))).toBe('待上传');
    });

    it('HASHING 状态显示百分比', () => {
        expect(formatFileStatus(makeItem({ status: FileItemStatus.HASHING, percent: 30 }))).toBe(
            '计算中 30%'
        );
    });

    it('UPLOADING 状态显示百分比', () => {
        expect(formatFileStatus(makeItem({ status: FileItemStatus.UPLOADING, percent: 75 }))).toBe(
            '75%'
        );
    });

    it('UPLOADED 状态', () => {
        expect(formatFileStatus(makeItem({ status: FileItemStatus.UPLOADED }))).toBe('已完成');
    });

    it('DOWNLOADING 状态显示百分比', () => {
        expect(
            formatFileStatus(makeItem({ status: FileItemStatus.DOWNLOADING, percent: 50 }))
        ).toBe('下载中 50%');
    });

    it('DOWNLOADED 状态', () => {
        expect(formatFileStatus(makeItem({ status: FileItemStatus.DOWNLOADED }))).toBe('已下载');
    });

    it('ERROR 状态显示错误码', () => {
        expect(
            formatFileStatus(makeItem({ status: FileItemStatus.ERROR, error: 'UPLOAD_FAILED' }))
        ).toBe('UPLOAD_FAILED');
    });

    it('ERROR 状态无错误码时使用默认', () => {
        const item = makeItem({ status: FileItemStatus.ERROR });
        delete item.error;
        expect(formatFileStatus(item)).toBe('FILE_UPLOAD_FAILED');
    });

    it('未知状态返回空字符串', () => {
        expect(formatFileStatus(makeItem({ status: 'unknown' as any }))).toBe('');
    });
});
