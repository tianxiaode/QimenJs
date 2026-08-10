/**
 * imperative types 单元测试
 *
 * 覆盖类型定义的结构完整性
 */

import type {
    ToastType,
    ToastPosition,
    ToastOptions,
    ToastHandle,
    MsgboxType,
    MsgboxOptions,
    MsgboxResult,
} from '@/component-core/imperative/types';

describe('imperative types', () => {
    describe('ToastType', () => {
        const validTypes: ToastType[] = ['info', 'success', 'warning', 'error'];

        test('所有 ToastType 值有效', () => {
            expect(validTypes).toHaveLength(4);
            expect(validTypes).toContain('info');
            expect(validTypes).toContain('success');
            expect(validTypes).toContain('warning');
            expect(validTypes).toContain('error');
        });
    });

    describe('ToastPosition', () => {
        const validPositions: ToastPosition[] = [
            'top-right',
            'top-left',
            'bottom-right',
            'bottom-left',
            'top',
            'bottom',
        ];

        test('所有 ToastPosition 值有效', () => {
            expect(validPositions).toHaveLength(6);
        });
    });

    describe('ToastOptions', () => {
        test('最小选项只需 message', () => {
            const opts: ToastOptions = { message: 'hello' };
            expect(opts.message).toBe('hello');
        });

        test('完整选项包含 eventKey', () => {
            const opts: ToastOptions = {
                message: 'hello',
                title: 'title',
                type: 'success',
                duration: 5000,
                position: 'bottom-left',
                eventKey: 'my-toast',
            };
            expect(opts.eventKey).toBe('my-toast');
        });

        test('不提供 eventKey 时为 undefined', () => {
            const opts: ToastOptions = { message: 'hello' };
            expect(opts.eventKey).toBeUndefined();
        });
    });

    describe('MsgboxType', () => {
        const validTypes: MsgboxType[] = ['alert', 'confirm', 'prompt'];

        test('所有 MsgboxType 值有效', () => {
            expect(validTypes).toHaveLength(3);
        });
    });

    describe('MsgboxOptions', () => {
        test('最小选项只需 title', () => {
            const opts: MsgboxOptions = { title: '提示' };
            expect(opts.title).toBe('提示');
        });

        test('完整选项包含 eventKey', () => {
            const opts: MsgboxOptions = {
                title: '确认删除？',
                content: '此操作不可撤销',
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                inputPlaceholder: '请输入',
                eventKey: 'delete-confirm',
            };
            expect(opts.eventKey).toBe('delete-confirm');
        });

        test('不提供 eventKey 时为 undefined', () => {
            const opts: MsgboxOptions = { title: '提示' };
            expect(opts.eventKey).toBeUndefined();
        });
    });

    describe('MsgboxResult', () => {
        test('confirm 结果', () => {
            const result: MsgboxResult = { action: 'confirm', value: '' };
            expect(result.action).toBe('confirm');
        });

        test('cancel 结果', () => {
            const result: MsgboxResult = { action: 'cancel', value: '' };
            expect(result.action).toBe('cancel');
        });

        test('prompt 结果带 value', () => {
            const result: MsgboxResult = { action: 'confirm', value: 'user input' };
            expect(result.value).toBe('user input');
        });
    });
});
