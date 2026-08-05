/**
 * types.ts 单元测试
 *
 * 覆盖 FileItemStatus 枚举值
 */

import { FileItemStatus } from '@/file/types';

describe('FileItemStatus', () => {
    it('SELECTED 值为 selected', () => {
        expect(FileItemStatus.SELECTED).toBe('selected');
    });

    it('HASHING 值为 hashing', () => {
        expect(FileItemStatus.HASHING).toBe('hashing');
    });

    it('UPLOADING 值为 uploading', () => {
        expect(FileItemStatus.UPLOADING).toBe('uploading');
    });

    it('UPLOADED 值为 uploaded', () => {
        expect(FileItemStatus.UPLOADED).toBe('uploaded');
    });

    it('ERROR 值为 error', () => {
        expect(FileItemStatus.ERROR).toBe('error');
    });

    it('DOWNLOADING 值为 downloading', () => {
        expect(FileItemStatus.DOWNLOADING).toBe('downloading');
    });

    it('DOWNLOADED 值为 downloaded', () => {
        expect(FileItemStatus.DOWNLOADED).toBe('downloaded');
    });

    it('枚举包含全部 7 个状态', () => {
        expect(Object.keys(FileItemStatus).length).toBe(7);
    });
});
