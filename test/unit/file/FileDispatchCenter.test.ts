/**
 * FileDispatchCenter 单元测试
 *
 * 覆盖通道生命周期、状态读取、文件操作核心逻辑
 */

jest.mock('@/events', () => {
    const busInstance = {
        getScopeId: jest.fn(() => 'file-scope'),
        fileOn: jest.fn(() => jest.fn()),
        fileEmit: jest.fn(),
    };
    return {
        FileEventBus: {
            getInstance: jest.fn(() => busInstance),
        },
        FILE_ACTIONS: {
            SELECT: 'select',
            UPLOAD: 'upload',
            REMOVE: 'remove',
            CANCEL: 'cancel',
            DOWNLOAD: 'download',
            CANCEL_DOWNLOAD: 'cancelDownload',
            SET_ITEMS: 'setItems',
            CLEAR: 'clear',
        },
        FILE_FEEDBACK_EVENTS: {
            SELECTED: 'selected',
            UPLOAD_START: 'uploadStart',
            UPLOAD_PROGRESS: 'uploadProgress',
            UPLOADED: 'uploaded',
            UPLOAD_COMPLETE: 'uploadComplete',
            UPLOAD_ERROR: 'uploadError',
            CANCELLED: 'cancelled',
            REMOVED: 'removed',
            HASH_START: 'hashStart',
            HASH_PROGRESS: 'hashProgress',
            HASH_COMPLETE: 'hashComplete',
            DOWNLOAD_START: 'downloadStart',
            DOWNLOAD_PROGRESS: 'downloadProgress',
            DOWNLOADED: 'downloaded',
            DOWNLOAD_ERROR: 'downloadError',
        },
    };
});

jest.mock('@/context', () => ({
    EventContextBuilder: {
        create: jest.fn(() => ({
            withEvent: jest.fn(function (this: any) {
                return this;
            }),
            withType: jest.fn(function (this: any) {
                return this;
            }),
            withSource: jest.fn(function (this: any) {
                return this;
            }),
            withSourceType: jest.fn(function (this: any) {
                return this;
            }),
            withData: jest.fn(function (this: any) {
                return this;
            }),
            withBusId: jest.fn(function (this: any) {
                return this;
            }),
            build: jest.fn(() => ({})),
        })),
    },
}));

jest.mock('@/http', () => ({
    HttpClient: jest.fn().mockImplementation(() => ({
        download: jest.fn(() => ({
            cancel: jest.fn(),
            context: Promise.resolve({ data: new Blob([]), metadata: {} }),
        })),
        upload: jest.fn(() => ({
            cancel: jest.fn(),
            context: Promise.resolve({ data: {} }),
        })),
    })),
}));

jest.mock('@/task', () => ({
    createHashTask: jest.fn(),
}));

jest.mock('@/utils', () => ({
    triggerDownload: jest.fn(),
}));

jest.mock('@/utils/string', () => ({
    getId: jest.fn(() => 'mock-id'),
}));

jest.mock('@/mime', () => ({
    MimeTypeRegistrar: {
        getInstance: jest.fn(() => ({
            getByMime: jest.fn(() => 'bin'),
        })),
    },
}));

jest.mock('@qimenjs/logger', () => ({
    Logger: {
        for: jest.fn(() => ({
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
        })),
    },
}));

jest.mock('@/error', () => ({
    KernelErrorCode: {
        FILE_TYPE_MISMATCH: 'FILE_TYPE_MISMATCH',
        FILE_SIZE_EXCEEDED: 'FILE_SIZE_EXCEEDED',
        FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
        FILE_HASH_FAILED: 'FILE_HASH_FAILED',
        FILE_DOWNLOAD_FAILED: 'FILE_DOWNLOAD_FAILED',
    },
}));

jest.mock('@/file/format', () => ({
    isFileTypeAllowed: jest.fn(() => true),
    parseAcceptExts: jest.fn(() => []),
    formatFileSize: jest.fn(() => ''),
    formatFileStatus: jest.fn(() => ''),
}));

import { FileDispatchCenter } from '@/file/FileDispatchCenter';
import { FileEventBus, FILE_FEEDBACK_EVENTS } from '@/events';
import { isFileTypeAllowed } from '@/file/format';
import { FileItemStatus } from '@/file/types';
import type { FileItem } from '@/file/types';

function createFile(name: string, size = 100): File {
    const blob = new Blob(['x'.repeat(size)]);
    return new File([blob], name);
}

describe('FileDispatchCenter', () => {
    let center: FileDispatchCenter;

    beforeEach(() => {
        (FileDispatchCenter as any).instance = undefined;
        center = FileDispatchCenter.getInstance();
        center.dispose();
        (FileDispatchCenter as any).instance = undefined;
        center = FileDispatchCenter.getInstance();
        jest.clearAllMocks();
    });

    describe('单例', () => {
        it('getInstance 返回同一实例', () => {
            const a = FileDispatchCenter.getInstance();
            const b = FileDispatchCenter.getInstance();
            expect(a).toBe(b);
        });
    });

    describe('通道生命周期', () => {
        it('createChannel 创建通道', () => {
            center.createChannel('test', { autoUpload: false });
            expect(center.getItems('test')).toEqual([]);
        });

        it('createChannel 幂等更新配置', () => {
            center.createChannel('test', { autoUpload: false });
            center.createChannel('test', { autoUpload: true, accept: '.png' });
            const items = center.getItems('test');
            expect(items).toEqual([]);
        });

        it('connect 增加引用计数', () => {
            center.createChannel('test', { autoUpload: false });
            center.connect('test');
            center.connect('test');
            center.disconnect('test');
            expect(center.getItems('test')).toEqual([]);
        });

        it('disconnect 引用计数归零时销毁通道', () => {
            center.createChannel('test', { autoUpload: false });
            center.connect('test');
            center.disconnect('test');
            expect(center.getItems('test')).toEqual([]);
        });

        it('disconnect 不存在的通道不报错', () => {
            expect(() => center.disconnect('nonexist')).not.toThrow();
        });

        it('destroyChannel 清理通道', () => {
            center.createChannel('test', { autoUpload: false });
            center.destroyChannel('test');
            expect(center.getItems('test')).toEqual([]);
        });

        it('dispose 清理所有通道', () => {
            center.createChannel('a', { autoUpload: false });
            center.createChannel('b', { autoUpload: false });
            center.dispose();
            expect(center.getItems('a')).toEqual([]);
            expect(center.getItems('b')).toEqual([]);
        });
    });

    describe('状态读取', () => {
        it('getItems 返回通道文件列表', () => {
            center.createChannel('test', { autoUpload: false });
            const file = createFile('a.txt');
            center.addFiles('test', [file]);
            const items = center.getItems('test');
            expect(items.length).toBe(1);
            expect(items[0].name).toBe('a.txt');
        });

        it('getItem 返回指定文件项', () => {
            center.createChannel('test', { autoUpload: false });
            const file = createFile('a.txt');
            const added = center.addFiles('test', [file]);
            const item = center.getItem('test', added[0].id);
            expect(item?.name).toBe('a.txt');
        });

        it('getItem 不存在返回 undefined', () => {
            center.createChannel('test', { autoUpload: false });
            expect(center.getItem('test', 'no-id')).toBeUndefined();
        });

        it('clear 清空通道队列', () => {
            center.createChannel('test', { autoUpload: false });
            center.addFiles('test', [createFile('a.txt')]);
            center.clear('test');
            expect(center.getItems('test')).toEqual([]);
        });

        it('setItems 直接设置队列并标记 UPLOADED', () => {
            center.createChannel('test', { autoUpload: false });
            center.setItems('test', [
                { id: '1', name: 'a.txt', size: 100, status: FileItemStatus.SELECTED, percent: 0 },
            ] as FileItem[]);
            const items = center.getItems('test');
            expect(items.length).toBe(1);
            expect(items[0].status).toBe(FileItemStatus.UPLOADED);
            expect(items[0].percent).toBe(100);
        });
    });

    describe('addFiles', () => {
        it('添加文件到通道', () => {
            center.createChannel('test', { autoUpload: false });
            const added = center.addFiles('test', [createFile('a.txt')]);
            expect(added.length).toBe(1);
            expect(added[0].status).toBe(FileItemStatus.SELECTED);
        });

        it('文件类型不匹配时拒绝', () => {
            (isFileTypeAllowed as jest.Mock).mockReturnValueOnce(false);
            center.createChannel('test', { autoUpload: false, accept: '.png' });
            const added = center.addFiles('test', [createFile('a.txt')]);
            expect(added.length).toBe(0);
        });

        it('文件大小超限时拒绝', () => {
            center.createChannel('test', { autoUpload: false, maxSize: 50 });
            const added = center.addFiles('test', [createFile('big.txt', 200)]);
            expect(added.length).toBe(0);
        });

        it('autoUpload=true 时自动触发上传', () => {
            center.createChannel('test', { autoUpload: true, transport: { url: '/upload' } });
            center.addFiles('test', [createFile('a.txt')]);
            const bus = FileEventBus.getInstance();
            expect(bus.fileEmit).toHaveBeenCalled();
        });
    });

    describe('cancel', () => {
        it('取消不存在的文件不报错', () => {
            center.createChannel('test', { autoUpload: false });
            expect(() => center.cancel('test', 'no-id')).not.toThrow();
        });
    });

    describe('remove', () => {
        it('移除文件项', () => {
            center.createChannel('test', { autoUpload: false });
            const added = center.addFiles('test', [createFile('a.txt')]);
            center.remove('test', added[0].id);
            expect(center.getItems('test').length).toBe(0);
        });

        it('移除不存在的文件不报错', () => {
            center.createChannel('test', { autoUpload: false });
            expect(() => center.remove('test', 'no-id')).not.toThrow();
        });
    });
});
