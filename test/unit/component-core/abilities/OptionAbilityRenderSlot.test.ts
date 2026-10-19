/**
 * OptionAbility.renderSlot 单元测试
 *
 * 覆盖四路内容分发：string / 组件类 / TemplateDecl / 配置对象，
 * 以及换值 dispose、无效输入兜底。
 */

import { OptionAbility } from '@/component-core/abilities/core/OptionAbility';

class FakeItem {
    el: HTMLElement;
    options: any;
    disposed = false;
    constructor(options: any) {
        this.options = options;
        this.el = document.createElement('div');
    }
    dispose() {
        this.disposed = true;
    }
}

function createHost(nodeName = 'body') {
    const el = document.createElement('div');
    const host: any = {
        logger: { warn: jest.fn() },
        childComponentList: [],
        _slotInstances: {},
        getNodeEl: jest.fn((name: string) => (name === nodeName ? el : null)),
        setNodeHtml: jest.fn(),
        resolveComponent: jest.fn((type: string) => (type === 'fake' ? FakeItem : undefined)),
        setData: jest.fn(),
        _createSlotComponent: jest.fn((decl: any, container: HTMLElement) => {
            const inst: any = { decl, container, disposed: false };
            inst.dispose = () => (inst.disposed = true);
            return inst;
        }),
    };
    return { host, el };
}

describe('OptionAbility.renderSlot', () => {
    // ══════════════════════════════════════════════════════════════
    // string 分支
    // ══════════════════════════════════════════════════════════════

    describe('string 内容', () => {
        it('应委托 setNodeHtml 且不产生组件实例', () => {
            const { host } = createHost();

            OptionAbility.renderSlot.call(host, '<b>hi</b>', 'body');

            expect(host.setNodeHtml).toHaveBeenCalledWith('<b>hi</b>', 'body');
            expect(host.childComponentList).toHaveLength(0);
            expect(host._slotInstances['body']).toBeNull();
        });
    });

    // ══════════════════════════════════════════════════════════════
    // 组件类分支
    // ══════════════════════════════════════════════════════════════

    describe('组件类内容', () => {
        it('应以目标节点为 container 实例化并登记', () => {
            const { host, el } = createHost();

            OptionAbility.renderSlot.call(host, FakeItem, 'body');

            const inst = host._slotInstances['body'];
            expect(inst).toBeInstanceOf(FakeItem);
            expect(inst.options).toEqual({ container: el });
            expect(host.childComponentList).toContain(inst);
            expect(host.setData).toHaveBeenCalledWith('body', inst, true);
        });
    });

    // ══════════════════════════════════════════════════════════════
    // TemplateDecl 分支
    // ══════════════════════════════════════════════════════════════

    describe('TemplateDecl 内容', () => {
        it('应委托 _createSlotComponent 并登记', () => {
            const { host, el } = createHost();
            const decl = { tag: 'div', children: [] };

            OptionAbility.renderSlot.call(host, decl, 'body');

            expect(host._createSlotComponent).toHaveBeenCalledWith(decl, el);
            const inst = host._slotInstances['body'];
            expect(inst.decl).toBe(decl);
            expect(host.childComponentList).toContain(inst);
        });
    });

    // ══════════════════════════════════════════════════════════════
    // 配置对象分支（第四路）
    // ══════════════════════════════════════════════════════════════

    describe('配置对象内容', () => {
        it('应按注册名解析组件，type 剔除后透传 props', () => {
            const { host, el } = createHost();

            OptionAbility.renderSlot.call(host, { type: 'fake', text: 'ok' }, 'body');

            expect(host.resolveComponent).toHaveBeenCalledWith('fake');
            const inst = host._slotInstances['body'];
            expect(inst).toBeInstanceOf(FakeItem);
            expect(inst.options).toEqual({ text: 'ok', container: el });
            expect(host.childComponentList).toContain(inst);
            expect(host.setData).toHaveBeenCalledWith('body', inst, true);
        });

        it('type 为组件类时应直接实例化', () => {
            const { host, el } = createHost();

            OptionAbility.renderSlot.call(host, { type: FakeItem, size: 'lg' }, 'body');

            expect(host.resolveComponent).not.toHaveBeenCalled();
            const inst = host._slotInstances['body'];
            expect(inst).toBeInstanceOf(FakeItem);
            expect(inst.options).toEqual({ size: 'lg', container: el });
        });

        it('type 未注册时应警告且不挂载', () => {
            const { host } = createHost();

            OptionAbility.renderSlot.call(host, { type: 'nope' }, 'body');

            expect(host.logger.warn).toHaveBeenCalledWith(
                'renderSlot: 组件类型 "nope" 未注册'
            );
            expect(host._slotInstances['body']).toBeNull();
            expect(host.childComponentList).toHaveLength(0);
        });
    });

    // ══════════════════════════════════════════════════════════════
    // 生命周期与兜底
    // ══════════════════════════════════════════════════════════════

    describe('生命周期与兜底', () => {
        it('换值时应 dispose 旧实例', () => {
            const { host } = createHost();

            OptionAbility.renderSlot.call(host, FakeItem, 'body');
            const prev = host._slotInstances['body'];
            OptionAbility.renderSlot.call(host, FakeItem, 'body');

            expect(prev.disposed).toBe(true);
            expect(host._slotInstances['body']).not.toBe(prev);
        });

        it('无效内容（原始值）应警告且不挂载', () => {
            const { host } = createHost();

            OptionAbility.renderSlot.call(host, 42 as any, 'body');

            expect(host.logger.warn).toHaveBeenCalledWith(
                'renderSlot: 无效内容定义，忽略',
                42
            );
            expect(host.childComponentList).toHaveLength(0);
        });

        it('目标节点不存在时应静默返回', () => {
            const { host } = createHost();
            host.getNodeEl = jest.fn(() => null);

            expect(() =>
                OptionAbility.renderSlot.call(host, FakeItem, 'missing')
            ).not.toThrow();
            expect(host.childComponentList).toHaveLength(0);
        });
    });
});
