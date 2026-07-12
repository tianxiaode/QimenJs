/**
 * Toast / Msgbox / ToastManager / MsgboxManager 单元测试
 */

// ─── 全局 mock ─────────────────────────────────────────────

// jsdom 不支持 Element.animate
Element.prototype.animate = jest.fn().mockReturnValue({
    onfinish: null,
    finished: Promise.resolve(),
    cancel: jest.fn(),
});

jest.mock('@/logger', () => {
    const actualLogger = jest.requireActual('@/logger');
    return {
        ...actualLogger,
        Logger: {
            ...actualLogger.Logger,
            for: jest.fn(() => ({
                debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn(),
            })),
        },
    };
});

jest.mock('@qimenjs/i18n', () => ({
    resolveI18nValue: (v: string) => v,
}));

jest.mock('@qimenjs/component', () => {
    let zIndexCounter = 1000;
    return {
        OverlayRoot: {
            getInstance: () => ({
                getRoot: () => document.body,
            }),
        },
        ZIndexLevel: { notification: 1, modal: 2 },
        nextZIndex: () => ++zIndexCounter,
        releaseZIndex: jest.fn(),
    };
});

jest.mock('@qimenjs/event-dom', () => ({
    createEventAdapter: () => ({
        bind: jest.fn(() => jest.fn()),
    }),
}));

// ─── imports ───────────────────────────────────────────────

import { Toast } from '@/imperative/Toast';
import { ToastManager } from '@/imperative/ToastManager';
import { Msgbox } from '@/imperative/Msgbox';
import { MsgboxManager } from '@/imperative/MsgboxManager';
import { toast, msgbox } from '@/imperative/api';

// ─── Toast ─────────────────────────────────────────────────

describe('Toast', () => {
    it('创建基础 toast 实例', () => {
        const t = new Toast({ message: 'hello' });
        expect(t.el).toBeDefined();
        expect(t.position).toBe('top-right');
        expect(t.handle).toBeDefined();
    });

    it('设置 toast 类型', () => {
        const t = new Toast({ message: 'hello', type: 'success' });
        expect(t.el.classList.contains('q-toast--success')).toBe(true);
    });

    it('设置自定义位置', () => {
        const t = new Toast({ message: 'hello', position: 'bottom-left' });
        expect(t.position).toBe('bottom-left');
    });

    it('duration=0 不设置自动关闭定时器', () => {
        const t = new Toast({ message: 'hello', duration: 0 });
        expect(t.timerId).toBeNull();
    });

    it('close 清除定时器', () => {
        const t = new Toast({ message: 'hello', duration: 5000 });
        expect(t.timerId).not.toBeNull();
        t.close();
        expect(t.timerId).toBeNull();
    });

    it('ToastHandle.close 幂等', () => {
        const t = new Toast({ message: 'hello', duration: 0 });
        t.handle.close();
        t.handle.close(); // 第二次不应报错
    });
});

// ─── ToastManager ──────────────────────────────────────────

describe('ToastManager', () => {
    beforeEach(() => {
        (ToastManager as any).instance = undefined;
    });

    it('单例模式', () => {
        const a = ToastManager.getInstance();
        const b = ToastManager.getInstance();
        expect(a).toBe(b);
    });

    it('create 返回 ToastHandle', () => {
        const mgr = ToastManager.getInstance();
        const handle = mgr.create({ message: 'test' });
        expect(handle).toBeDefined();
        expect(typeof handle.close).toBe('function');
    });
});

// ─── Msgbox ────────────────────────────────────────────────

describe('Msgbox', () => {
    it('创建 alert 实例', () => {
        const m = new Msgbox({ title: 'Title', type: 'alert' }, jest.fn());
        expect(m.el).toBeDefined();
        expect(m.type).toBe('alert');
        expect(m.maskEl).toBeDefined();
    });

    it('创建 confirm 实例', () => {
        const m = new Msgbox({ title: 'Title', type: 'confirm' }, jest.fn());
        expect(m.type).toBe('confirm');
    });

    it('创建 prompt 实例', () => {
        const m = new Msgbox({ title: 'Title', type: 'prompt' }, jest.fn());
        expect(m.type).toBe('prompt');
    });
});

// ─── MsgboxManager ─────────────────────────────────────────

describe('MsgboxManager', () => {
    beforeEach(() => {
        (MsgboxManager as any).instance = undefined;
    });

    it('单例模式', () => {
        const a = MsgboxManager.getInstance();
        const b = MsgboxManager.getInstance();
        expect(a).toBe(b);
    });

    it('create 返回 Promise', () => {
        const mgr = MsgboxManager.getInstance();
        const result = mgr.create({ title: 'Title', type: 'alert' });
        expect(result).toBeInstanceOf(Promise);
    });
});

// ─── api 工厂函数 ──────────────────────────────────────────

describe('api', () => {
    beforeEach(() => {
        (ToastManager as any).instance = undefined;
        (MsgboxManager as any).instance = undefined;
    });

    describe('toast()', () => {
        it('字符串参数', () => {
            const handle = toast('hello');
            expect(handle).toBeDefined();
        });

        it('对象参数', () => {
            const handle = toast({ message: 'hello', type: 'success' });
            expect(handle).toBeDefined();
        });

        it('duration 覆盖', () => {
            const handle = toast({ message: 'hello' }, 1000);
            expect(handle).toBeDefined();
        });
    });

    describe('msgbox', () => {
        it('alert 字符串参数', () => {
            const result = msgbox.alert('Title', 'Content');
            expect(result).toBeInstanceOf(Promise);
        });

        it('confirm 对象参数', () => {
            const result = msgbox.confirm({ title: 'Title' });
            expect(result).toBeInstanceOf(Promise);
        });

        it('prompt 字符串参数', () => {
            const result = msgbox.prompt('Title', 'Input');
            expect(result).toBeInstanceOf(Promise);
        });
    });
});
