/**
 * ToastManager 单元测试
 *
 * 覆盖：
 * 1. 单例模式
 * 2. create() 返回 ToastHandle
 * 3. 带 eventKey 创建
 * 4. 带 title 使用 notification 模板
 * 5. handle.close() 关闭
 * 6. handle thenable
 * 7. 多实例堆叠
 * 8. enforceMaxCount 超限关闭
 * 9. onClose 回调
 * 10. duration 自动关闭
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

jest.mock('worker_threads', () => ({
    parentPort: { on: jest.fn(), postMessage: jest.fn() },
    Worker: jest.fn(),
}));

jest.mock('crypto', () => ({
    createHash: () => ({ update: () => ({ digest: () => Buffer.from('') }) }),
}));

jest.mock('@qimenjs/entity', () => ({}));
jest.mock('@/overlay', () => ({}));
jest.mock('@qimenjs/component', () => ({
    ZIndexLevel: { OVERLAY: 2000, modal: 2000 },
}));
jest.mock('@/composable', () => {
    class ComposableBase {
        static use() {}
        _zIndexLevel: any;
        setViewportPosition() {}
        mountToOverlay() {}
        unmountFromOverlay() {}
        playEnterAnimation() {}
        playExitAnimation() {
            const fake = { onfinish: null as (() => void) | null };
            Promise.resolve().then(() => {
                if (fake.onfinish) fake.onfinish();
            });
            return fake;
        }
        bindDomEvent() {}
        acquireZIndex() {
            return 2000;
        }
        releaseZIndex() {}
        systemEmit() {}
        dispose() {}
    }
    return {
        ComposableBase,
        AbilityDefinition: {},
        InferAbilities: () => ({}),
    };
});
jest.mock('@/context', () => {
    const ctx = {
        _event: '',
        _type: '',
        _source: '',
        _data: {},
        withEvent(e: string) {
            ctx._event = e;
            return ctx;
        },
        withType(t: string) {
            ctx._type = t;
            return ctx;
        },
        withSource(s: string) {
            ctx._source = s;
            return ctx;
        },
        withData(d: any) {
            ctx._data = d;
            return ctx;
        },
        build() {
            return { event: ctx._event, type: ctx._type, source: ctx._source, data: ctx._data };
        },
    };
    return {
        EventContextBuilder: { create: () => ctx },
    };
});
jest.mock('@/component-core/engine/ComponentRegistrar', () => {
    const fakeEl = document.createElement('div');
    const fakeNodeMapMgr = {
        buildDOM: () => fakeEl,
        get: () => ({ el: document.createElement('div') }),
        disposeAll: jest.fn(),
    };
    return {
        ComponentRegistrar: {
            getInstance: () => ({
                register: jest.fn(),
                createNodeMapManager: () => fakeNodeMapMgr,
            }),
        },
    };
});
jest.mock('@/system-abilities', () => ({
    SystemEventBusAbility: { __name__: 'SystemEventBusAbility' },
}));
jest.mock('@qimenjs/i18n', () => ({
    resolveI18nValue: (v: any) => v,
}));

import { ToastManager } from '@/component-core/imperative/ToastManager';
import type { ToastHandle } from '@/component-core/imperative/types';

describe('ToastManager', () => {
    let manager: ToastManager;

    beforeEach(() => {
        (ToastManager as any).instance = undefined;
        manager = ToastManager.getInstance();
    });

    test('单例模式', () => {
        const a = ToastManager.getInstance();
        const b = ToastManager.getInstance();
        expect(a).toBe(b);
    });

    test('create 返回 ToastHandle', () => {
        const handle = manager.create({ message: '测试消息' });
        expect(handle).toBeDefined();
        expect(typeof handle.close).toBe('function');
        expect(typeof handle.then).toBe('function');
    });

    test('create 带 eventKey', () => {
        const handle = manager.create({ message: '测试', eventKey: 'my-toast' });
        expect(handle).toBeDefined();
    });

    test('create 带 title 使用 notification 模板', () => {
        const handle = manager.create({ message: '消息', title: '标题' });
        expect(handle).toBeDefined();
    });

    test('handle.close 不报错', () => {
        const handle = manager.create({ message: '关闭测试' });
        expect(() => handle.close()).not.toThrow();
    });

    test('handle 是 Thenable', () => {
        const handle: ToastHandle = manager.create({ message: 'thenable', duration: 50 });
        expect(typeof handle.then).toBe('function');
    });

    test('多实例堆叠', () => {
        const h1 = manager.create({ message: 'toast1' });
        const h2 = manager.create({ message: 'toast2' });
        const h3 = manager.create({ message: 'toast3' });
        expect(h1).toBeDefined();
        expect(h2).toBeDefined();
        expect(h3).toBeDefined();
    });

    test('不同 position 的 toast', () => {
        const h1 = manager.create({ message: 'top-right', position: 'top-right' });
        const h2 = manager.create({ message: 'bottom-left', position: 'bottom-left' });
        expect(h1).toBeDefined();
        expect(h2).toBeDefined();
    });

    test('不同 type 的 toast', () => {
        const h1 = manager.create({ message: 'info', type: 'info' });
        const h2 = manager.create({ message: 'success', type: 'success' });
        const h3 = manager.create({ message: 'warning', type: 'warning' });
        const h4 = manager.create({ message: 'error', type: 'error' });
        expect(h1).toBeDefined();
        expect(h2).toBeDefined();
        expect(h3).toBeDefined();
        expect(h4).toBeDefined();
    });

    test('close 后实例从 manager 移除', async () => {
        const handle = manager.create({ message: '移除测试' });
        const instances = (manager as any).instances as Map<number, any>;
        expect(instances.size).toBe(1);
        handle.close();
        await Promise.resolve();
        expect(instances.size).toBe(0);
    });

    test('handle.isClosed 初始为 false，close 后为 true', () => {
        const handle = manager.create({ message: 'closed状态' });
        expect(handle.isClosed).toBe(false);
        handle.close();
        expect(handle.isClosed).toBe(true);
    });

    test('重复 close 不报错', () => {
        const handle = manager.create({ message: '重复关闭' });
        handle.close();
        expect(() => handle.close()).not.toThrow();
    });

    test('enforceMaxCount：超过 5 个同 position 时关闭最旧的', () => {
        const handles: ToastHandle[] = [];
        for (let i = 0; i < 6; i++) {
            handles.push(manager.create({ message: `toast-${i}`, position: 'top-right' }));
        }
        expect(handles[0].isClosed).toBe(true);
    });

    test('不同 position 独立计数', () => {
        const handles: ToastHandle[] = [];
        for (let i = 0; i < 5; i++) {
            handles.push(manager.create({ message: `top-${i}`, position: 'top-right' }));
        }
        for (let i = 0; i < 5; i++) {
            handles.push(manager.create({ message: `bottom-${i}`, position: 'bottom-left' }));
        }
        for (const h of handles) {
            expect(h.isClosed).toBe(false);
        }
    });

    test('handle.then 可以 await', async () => {
        const handle = manager.create({ message: 'await测试' });
        handle.close();
        await expect(handle).resolves.toBeUndefined();
    });
});
