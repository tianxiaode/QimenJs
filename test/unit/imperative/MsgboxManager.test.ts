/**
 * MsgboxManager 单元测试
 *
 * 覆盖：
 * 1. 单例模式
 * 2. create() 返回 Promise
 * 3. alert / confirm / prompt 三种类型
 * 4. 带 eventKey 创建
 * 5. 自定义按钮文本
 * 6. close 路径（onClose 回调、_doResolve、_emitEvent）
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
        withSourceType(st: string) {
            ctx._sourceType = st;
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
    t: (k: string) => k,
}));

import { MsgboxManager } from '@/component-core/imperative/MsgboxManager';

describe('MsgboxManager', () => {
    let manager: MsgboxManager;

    beforeEach(() => {
        (MsgboxManager as any).instance = undefined;
        manager = MsgboxManager.getInstance();
        jest.spyOn(HTMLElement.prototype, 'animate').mockImplementation(function () {
            const anim = { onfinish: null as (() => void) | null };
            Promise.resolve().then(() => { anim.onfinish?.(); });
            return anim as any;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('单例模式', () => {
        const a = MsgboxManager.getInstance();
        const b = MsgboxManager.getInstance();
        expect(a).toBe(b);
    });

    test('create alert 返回 Promise', () => {
        const result = manager.create({ type: 'alert', title: '提示' });
        expect(result).toBeInstanceOf(Promise);
    });

    test('create confirm 返回 Promise', () => {
        const result = manager.create({ type: 'confirm', title: '确认？' });
        expect(result).toBeInstanceOf(Promise);
    });

    test('create prompt 返回 Promise', () => {
        const result = manager.create({ type: 'prompt', title: '请输入' });
        expect(result).toBeInstanceOf(Promise);
    });

    test('create 带 eventKey', () => {
        const result = manager.create({
            type: 'confirm',
            title: '确认？',
            eventKey: 'delete-confirm',
        });
        expect(result).toBeInstanceOf(Promise);
    });

    test('create 带自定义按钮文本', () => {
        const result = manager.create({
            type: 'confirm',
            title: '删除确认',
            confirmButtonText: '删除',
            cancelButtonText: '取消',
        });
        expect(result).toBeInstanceOf(Promise);
    });

    test('create prompt 带 inputPlaceholder', () => {
        const result = manager.create({
            type: 'prompt',
            title: '请输入名称',
            inputPlaceholder: '名称',
        });
        expect(result).toBeInstanceOf(Promise);
    });

    test('create 带 content', () => {
        const result = manager.create({
            type: 'alert',
            title: '错误',
            content: '操作失败，请重试',
        });
        expect(result).toBeInstanceOf(Promise);
    });

    test('create 后 close 触发 onClose 回调，实例从集合移除', async () => {
        const promise = manager.create({ type: 'alert', title: '关闭测试' });
        const instances = (manager as any).instances as Set<any>;
        expect(instances.size).toBe(1);
        const msgbox = instances.values().next().value;
        msgbox.close();
        await Promise.resolve();
        expect(instances.size).toBe(0);
    });

    test('create 带 eventKey 时 _emitEvent 被调用', () => {
        const promise = manager.create({
            type: 'confirm',
            title: '确认？',
            eventKey: 'test-key',
        });
        const instances = (manager as any).instances as Set<any>;
        const msgbox = instances.values().next().value;
        const emitSpy = jest.spyOn(msgbox, '_emitEvent');
        msgbox._doResolve({ action: 'confirm', value: '' });
        expect(emitSpy).toHaveBeenCalled();
    });

    test('close 未 resolve 时自动 cancel', () => {
        manager.create({ type: 'confirm', title: '未resolve' });
        const instances = (manager as any).instances as Set<any>;
        const msgbox = instances.values().next().value;
        msgbox.close();
        expect(msgbox._resolved).toBe(true);
    });
});
