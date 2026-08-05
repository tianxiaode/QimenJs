/**
 * UploadButtonComponent 单元测试
 *
 * 覆盖：初始化、文件命令、反馈处理、转发、列表渲染、表单值、update、dispose
 */

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
            })),
        },
    };
});

jest.mock('@qimenjs/task', () => ({
    globalTaskQueue: {
        addTask: jest.fn((fn: () => any) => fn()),
    },
}));

jest.mock('@/file', () => ({
    fileDispatchCenter: {
        createChannel: jest.fn(),
        connect: jest.fn(),
        disconnect: jest.fn(),
    },
    formatFileSize: jest.fn((size: number) => `${size}B`),
    formatFileStatus: jest.fn((item: any) => item.status),
    FileItemStatus: jest.requireActual('@/file').FileItemStatus,
}));

jest.mock('@/events', () => {
    const actual = jest.requireActual('@/events');
    return {
        ...actual,
        FILE_ACTIONS: actual.FILE_ACTIONS,
        FILE_FEEDBACK_EVENTS: actual.FILE_FEEDBACK_EVENTS,
    };
});

import { UploadButtonComponent } from '@/component/button/UploadButtonComponent';
import { fileDispatchCenter } from '@/file';
import { FILE_ACTIONS, FILE_FEEDBACK_EVENTS } from '@/events';
import { FileItemStatus } from '@/file';
import type { FileItem } from '@/file';

/** 创建测试用 FileItem */
function makeItem(overrides: Partial<FileItem> = {}): FileItem {
    return {
        id: `item-${Math.random().toString(36).slice(2, 8)}`,
        file: null,
        name: 'test.txt',
        size: 1024,
        status: FileItemStatus.SELECTED,
        percent: 0,
        result: null,
        ...overrides,
    } as FileItem;
}

describe('UploadButtonComponent', () => {
    let instance: InstanceType<typeof UploadButtonComponent>;

    const defaultProps = {
        fileKey: 'test-channel',
        transport: { url: '/api/upload' },
        accept: '.png,.jpg',
        multiple: true,
        maxSize: 5 * 1024 * 1024,
        autoUpload: true,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        instance = new UploadButtonComponent(defaultProps);
    });

    afterEach(() => {
        instance.dispose();
    });

    // ============================================
    // 初始化
    // ============================================

    describe('初始化', () => {
        it('创建组件实例后 _fileKey 正确赋值', () => {
            expect(instance._fileKey).toBe('test-channel');
        });

        it('调用 fileDispatchCenter.createChannel 并 connect', () => {
            expect(fileDispatchCenter.createChannel).toHaveBeenCalledWith(
                'test-channel',
                expect.objectContaining({
                    accept: '.png,.jpg',
                    multiple: true,
                    autoUpload: true,
                })
            );
            expect(fileDispatchCenter.connect).toHaveBeenCalledWith('test-channel');
        });

        it('创建隐藏 file input 并挂载到 el', () => {
            const input = instance._inputEl;
            expect(input).not.toBeNull();
            expect(input!.type).toBe('file');
            expect(input!.accept).toBe('.png,.jpg');
            expect(input!.multiple).toBe(true);
            expect(input!.style.display).toBe('none');
            expect(instance.el.contains(input)).toBe(true);
        });

        it('_itemsMap 初始化为空 Map', () => {
            expect(instance._itemsMap).toBeInstanceOf(Map);
            expect(instance._itemsMap!.size).toBe(0);
        });

        it('disabled 通过 update 设置后 input 禁用', () => {
            instance.update({ disabled: true });
            expect(instance._fileDisabled).toBe(true);
            expect(instance._inputEl!.disabled).toBe(true);
        });
    });

    // ============================================
    // onBtnClick
    // ============================================

    describe('onBtnClick', () => {
        it('非禁用时触发 input.click()', () => {
            const clickSpy = jest.spyOn(instance._inputEl!, 'click');
            instance.onBtnClick();
            expect(clickSpy).toHaveBeenCalled();
        });

        it('禁用时不触发 input.click()', () => {
            instance._fileDisabled = true;
            const clickSpy = jest.spyOn(instance._inputEl!, 'click');
            instance.onBtnClick();
            expect(clickSpy).not.toHaveBeenCalled();
        });
    });

    // ============================================
    // _fileCmd
    // ============================================

    describe('_fileCmd', () => {
        it('调用 fileEmit 构建正确的事件上下文', () => {
            const fileEmitSpy = jest
                .spyOn(instance as any, 'fileEmit')
                .mockImplementation(() => {});
            instance._fileCmd(FILE_ACTIONS.SELECT, { files: [] });
            expect(fileEmitSpy).toHaveBeenCalledTimes(1);
            const ctx = fileEmitSpy.mock.calls[0][0];
            expect(ctx.event).toBe('file:test-channel:select');
            expect(ctx.type).toBe('select');
            expect(ctx.source).toBe('test-channel');
            expect(ctx.sourceType).toBe('UploadButton');
        });
    });

    // ============================================
    // _applyFeedback
    // ============================================

    describe('_applyFeedback', () => {
        it('SELECTED 事件将 items 写入 _itemsMap', () => {
            const item1 = makeItem({ id: 'a' });
            const item2 = makeItem({ id: 'b' });
            instance._applyFeedback(FILE_FEEDBACK_EVENTS.SELECTED, { items: [item1, item2] });
            expect(instance._itemsMap!.get('a')).toBe(item1);
            expect(instance._itemsMap!.get('b')).toBe(item2);
        });

        it('REMOVED 事件（单项）从 _itemsMap 删除', () => {
            const item = makeItem({ id: 'a' });
            instance._itemsMap!.set('a', item);
            instance._applyFeedback(FILE_FEEDBACK_EVENTS.REMOVED, { item });
            expect(instance._itemsMap!.has('a')).toBe(false);
        });

        it('REMOVED 事件（cleared）清空 _itemsMap', () => {
            instance._itemsMap!.set('a', makeItem({ id: 'a' }));
            instance._itemsMap!.set('b', makeItem({ id: 'b' }));
            instance._applyFeedback(FILE_FEEDBACK_EVENTS.REMOVED, { cleared: true });
            expect(instance._itemsMap!.size).toBe(0);
        });

        it('单项状态变更更新 _itemsMap 中对应项', () => {
            const item = makeItem({ id: 'a', status: FileItemStatus.SELECTED });
            instance._itemsMap!.set('a', item);
            const updated = { ...item, status: FileItemStatus.UPLOADED, percent: 100 };
            instance._applyFeedback(FILE_FEEDBACK_EVENTS.UPLOADED, { item: updated });
            expect(instance._itemsMap!.get('a')!.status).toBe(FileItemStatus.UPLOADED);
        });

        it('_itemsMap 为 null 时安全返回', () => {
            instance._itemsMap = null;
            expect(() => {
                instance._applyFeedback(FILE_FEEDBACK_EVENTS.SELECTED, { items: [makeItem()] });
            }).not.toThrow();
        });
    });

    // ============================================
    // _forward
    // ============================================

    describe('_forward', () => {
        it('映射的事件名调用 emit', () => {
            const emitSpy = jest.spyOn(instance as any, 'emit').mockImplementation(() => {});
            const data = { item: makeItem() };
            instance._forward(FILE_FEEDBACK_EVENTS.UPLOADED, data);
            expect(emitSpy).toHaveBeenCalledWith('uploaded', data);
        });

        it('未映射的事件不调用 emit', () => {
            const emitSpy = jest.spyOn(instance as any, 'emit').mockImplementation(() => {});
            instance._forward(FILE_FEEDBACK_EVENTS.HASH_START, {});
            expect(emitSpy).not.toHaveBeenCalled();
        });

        it('设置 eventKey 时调用 componentEmit 转发', () => {
            instance.eventKey = 'docUpload';
            const componentEmitSpy = jest
                .spyOn(instance as any, 'componentEmit')
                .mockImplementation(() => {});
            jest.spyOn(instance as any, 'emit').mockImplementation(() => {});
            instance._forward(FILE_FEEDBACK_EVENTS.UPLOADED, {});
            expect(componentEmitSpy).toHaveBeenCalledTimes(1);
            const ctx = componentEmitSpy.mock.calls[0][0];
            expect(ctx.source).toBe('docUpload');
        });
    });

    // ============================================
    // files / uploadedFiles
    // ============================================

    describe('files / uploadedFiles', () => {
        it('files 返回 _itemsMap 所有值', () => {
            const item1 = makeItem({ id: 'a', status: FileItemStatus.SELECTED });
            const item2 = makeItem({ id: 'b', status: FileItemStatus.UPLOADED });
            instance._itemsMap!.set('a', item1);
            instance._itemsMap!.set('b', item2);
            expect(instance.files).toHaveLength(2);
        });

        it('uploadedFiles 只返回 UPLOADED 状态', () => {
            const item1 = makeItem({ id: 'a', status: FileItemStatus.SELECTED });
            const item2 = makeItem({ id: 'b', status: FileItemStatus.UPLOADED });
            instance._itemsMap!.set('a', item1);
            instance._itemsMap!.set('b', item2);
            expect(instance.uploadedFiles).toHaveLength(1);
            expect(instance.uploadedFiles[0].status).toBe(FileItemStatus.UPLOADED);
        });

        it('_itemsMap 为 null 时返回空数组', () => {
            instance._itemsMap = null;
            expect(instance.files).toEqual([]);
            expect(instance.uploadedFiles).toEqual([]);
        });
    });

    // ============================================
    // defaultEventData
    // ============================================

    describe('defaultEventData', () => {
        it('返回包含 files 数组的对象', () => {
            const item = makeItem({ id: 'a' });
            instance._itemsMap!.set('a', item);
            const data = instance.defaultEventData;
            expect(data.files).toHaveLength(1);
            expect(data.files[0].id).toBe('a');
        });
    });

    // ============================================
    // getFormValue / setFormValue / formReset
    // ============================================

    describe('表单值', () => {
        it('getFormValue 只返回 UPLOADED 项的 result', () => {
            instance._itemsMap!.set(
                'a',
                makeItem({ id: 'a', status: FileItemStatus.UPLOADED, result: { url: 'a.png' } })
            );
            instance._itemsMap!.set('b', makeItem({ id: 'b', status: FileItemStatus.SELECTED }));
            const values = instance.getFormValue();
            expect(values).toEqual([{ url: 'a.png' }]);
        });

        it('setFormValue 回填数据到 _itemsMap', () => {
            const fileCmdSpy = jest.spyOn(instance, '_fileCmd').mockImplementation(() => {});
            instance.setFormValue([{ id: 'x', name: 'x.png', size: 100, url: '/x.png' }]);
            expect(fileCmdSpy).toHaveBeenCalledWith(FILE_ACTIONS.SET_ITEMS, expect.any(Object));
            expect(instance._itemsMap!.size).toBe(1);
            expect(instance._itemsMap!.get('x')!.status).toBe(FileItemStatus.UPLOADED);
        });

        it('setFormValue 忽略非数组输入', () => {
            const fileCmdSpy = jest.spyOn(instance, '_fileCmd').mockImplementation(() => {});
            instance.setFormValue('not-array' as any);
            expect(fileCmdSpy).not.toHaveBeenCalled();
        });

        it('formReset 清空 _itemsMap', () => {
            const fileCmdSpy = jest.spyOn(instance, '_fileCmd').mockImplementation(() => {});
            instance._itemsMap!.set('a', makeItem({ id: 'a' }));
            instance.formReset();
            expect(fileCmdSpy).toHaveBeenCalledWith(FILE_ACTIONS.CLEAR, {});
            expect(instance._itemsMap!.size).toBe(0);
        });
    });

    // ============================================
    // update
    // ============================================

    describe('update', () => {
        it('更新 accept 并同步到 input 元素', () => {
            instance.update({ accept: '.pdf' });
            expect(instance._accept).toBe('.pdf');
            expect(instance._inputEl!.accept).toBe('.pdf');
        });

        it('更新 multiple 并同步到 input 元素', () => {
            instance.update({ multiple: false });
            expect(instance._multiple).toBe(false);
            expect(instance._inputEl!.multiple).toBe(false);
        });

        it('更新 disabled 并同步到 input 元素和样式', () => {
            instance.update({ disabled: true });
            expect(instance._fileDisabled).toBe(true);
            expect(instance._inputEl!.disabled).toBe(true);
            expect(instance.el.classList.contains('q-upload-btn--disabled')).toBe(true);
        });

        it('更新 maxSize', () => {
            instance.update({ maxSize: 10 * 1024 * 1024 });
            expect(instance._maxSize).toBe(10 * 1024 * 1024);
        });

        it('更新 autoUpload', () => {
            instance.update({ autoUpload: false });
            expect(instance._autoUpload).toBe(false);
        });

        it('更新 transport', () => {
            const newTransport = { url: '/api/v2/upload' };
            instance.update({ transport: newTransport });
            expect(instance._transport).toBe(newTransport);
        });

        it('更新 eventKey', () => {
            instance.update({ eventKey: 'newKey' });
            expect(instance.eventKey).toBe('newKey');
        });

        it('更新时重新调用 createChannel', () => {
            jest.clearAllMocks();
            instance.update({ maxSize: 2048 });
            expect(fileDispatchCenter.createChannel).toHaveBeenCalledWith(
                'test-channel',
                expect.objectContaining({ maxSize: 2048 })
            );
        });
    });

    // ============================================
    // onBeforeDispose
    // ============================================

    describe('onBeforeDispose', () => {
        it('调用 fileDispatchCenter.disconnect', () => {
            instance.onBeforeDispose();
            expect(fileDispatchCenter.disconnect).toHaveBeenCalledWith('test-channel');
        });
    });
});
