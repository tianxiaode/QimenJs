jest.mock('@/logger', () => ({
    Logger: {
        for: jest.fn(() => ({
            warn: jest.fn(),
            debug: jest.fn(),
            info: jest.fn(),
            error: jest.fn(),
        })),
    },
}));

import { bindNodeEventMeta } from '@/component-core/engine/pipeline/step-bind-node-event-meta';
import { NODE_EVENT_META, COMPONENT_ROOT } from '@/component-core/constants/event-constants';

describe('step-bind-node-event-meta', () => {
    it('nodeMapMgr 为 null 时提前返回', () => {
        const ctx = {
            instance: {},
            nodeMapMgr: null,
            ctor: {},
        } as any;
        expect(() => bindNodeEventMeta(ctx)).not.toThrow();
    });

    it('无 emits 时 nodeRules 为空不设置 _nodeEventRules', () => {
        const nodeMetas = { root: { tag: 'div' } };
        const ctx = {
            instance: { el: document.createElement('div') },
            nodeMapMgr: { getAll: () => nodeMetas },
            ctor: {},
        } as any;
        bindNodeEventMeta(ctx);
        expect(ctx.ctor._nodeEventRules).toBeUndefined();
    });

    it('有 emits 时设置 _nodeEventRules', () => {
        const el = document.createElement('div');
        const nodeMetas = {
            root: { tag: 'div' },
            btn: { el, emits: { click: 'btnClick' } },
        };
        const ctx = {
            instance: { el: document.createElement('div') },
            nodeMapMgr: { getAll: () => nodeMetas },
            ctor: {},
        } as any;
        bindNodeEventMeta(ctx);
        expect(ctx.ctor._nodeEventRules).toBeDefined();
        expect(ctx.ctor._nodeEventRules.length).toBeGreaterThan(0);
    });

    it('节点无 emits 但有 action 时绑定空 eventTypes', () => {
        const el = document.createElement('div');
        const nodeMetas = {
            root: { tag: 'div' },
            btn: { el, action: 'save' },
        };
        const ctx = {
            instance: { el: document.createElement('div') },
            nodeMapMgr: { getAll: () => nodeMetas },
            ctor: {},
        } as any;
        bindNodeEventMeta(ctx);
        expect((el as any)[NODE_EVENT_META]).toBeDefined();
        expect((el as any)[NODE_EVENT_META].eventTypes.size).toBe(0);
        expect((el as any)[NODE_EVENT_META].action).toBe('save');
    });

    it('节点无 el 时跳过', () => {
        const nodeMetas = {
            root: { tag: 'div' },
            btn: { emits: { click: 'btnClick' } },
        };
        const ctx = {
            instance: { el: document.createElement('div') },
            nodeMapMgr: { getAll: () => nodeMetas },
            ctor: {},
        } as any;
        bindNodeEventMeta(ctx);
    });

    it('节点有 emits 时绑定 eventTypes', () => {
        const el = document.createElement('div');
        const nodeMetas = {
            root: { tag: 'div' },
            btn: { el, emits: { click: 'btnClick', input: 'btnInput' } },
        };
        const ctx = {
            instance: { el: document.createElement('div') },
            nodeMapMgr: { getAll: () => nodeMetas },
            ctor: {},
        } as any;
        bindNodeEventMeta(ctx);
        expect((el as any)[NODE_EVENT_META].eventTypes.has('click')).toBe(true);
        expect((el as any)[NODE_EVENT_META].eventTypes.has('input')).toBe(true);
    });

    it('instance.el 存在时设置 COMPONENT_ROOT', () => {
        const el = document.createElement('div');
        const nodeMetas = { root: { tag: 'div' } };
        const ctx = {
            instance: { el },
            nodeMapMgr: { getAll: () => nodeMetas },
            ctor: {},
        } as any;
        bindNodeEventMeta(ctx);
        expect((el as any)[COMPONENT_ROOT]).toBe(true);
    });

    it('节点无 emits/action/data 时跳过', () => {
        const el = document.createElement('div');
        const nodeMetas = {
            root: { tag: 'div' },
            btn: { el },
        };
        const ctx = {
            instance: { el: document.createElement('div') },
            nodeMapMgr: { getAll: () => nodeMetas },
            ctor: {},
        } as any;
        bindNodeEventMeta(ctx);
        expect((el as any)[NODE_EVENT_META]).toBeUndefined();
    });
});
