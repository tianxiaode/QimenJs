/**
 * imperative-events 单元测试
 *
 * 覆盖：
 * 1. 事件前缀常量
 * 2. MSGBOX_ACTIONS / TOAST_ACTIONS
 * 3. MSGBOX_FEEDBACK_EVENTS / TOAST_FEEDBACK_EVENTS
 * 4. encodeEventKey 编码
 */

import {
    MSGBOX_EVENT_PREFIX,
    TOAST_EVENT_PREFIX,
    MSGBOX_ACTIONS,
    MSGBOX_FEEDBACK_EVENTS,
    TOAST_ACTIONS,
    TOAST_FEEDBACK_EVENTS,
    encodeEventKey,
} from '@/component-core/constants/imperative-events';

describe('imperative-events', () => {
    describe('事件前缀', () => {
        test('MSGBOX_EVENT_PREFIX 为 msgbox', () => {
            expect(MSGBOX_EVENT_PREFIX).toBe('msgbox');
        });

        test('TOAST_EVENT_PREFIX 为 toast', () => {
            expect(TOAST_EVENT_PREFIX).toBe('toast');
        });
    });

    describe('MSGBOX_ACTIONS', () => {
        test('confirm 动作', () => {
            expect(MSGBOX_ACTIONS.CONFIRM).toBe('confirm');
        });

        test('cancel 动作', () => {
            expect(MSGBOX_ACTIONS.CANCEL).toBe('cancel');
        });
    });

    describe('MSGBOX_FEEDBACK_EVENTS', () => {
        test('closed 事件', () => {
            expect(MSGBOX_FEEDBACK_EVENTS.CLOSED).toBe('closed');
        });
    });

    describe('TOAST_ACTIONS', () => {
        test('close 动作', () => {
            expect(TOAST_ACTIONS.CLOSE).toBe('close');
        });
    });

    describe('TOAST_FEEDBACK_EVENTS', () => {
        test('closed 事件', () => {
            expect(TOAST_FEEDBACK_EVENTS.CLOSED).toBe('closed');
        });
    });

    describe('encodeEventKey', () => {
        test('编码 msgbox 事件 key', () => {
            expect(encodeEventKey('msgbox', 1, 'confirm')).toBe('msgbox:1:confirm');
        });

        test('编码 toast 事件 key', () => {
            expect(encodeEventKey('toast', 3, 'close')).toBe('toast:3:close');
        });

        test('id 为 0 时正常编码', () => {
            expect(encodeEventKey('msgbox', 0, 'cancel')).toBe('msgbox:0:cancel');
        });

        test('action 为空字符串时正常编码', () => {
            expect(encodeEventKey('toast', 5, '')).toBe('toast:5:');
        });
    });
});
