/**
 * ResizeAbility 单元测试
 */

import { ResizeAbility } from '@/component-abilities/resize/ResizeAbility';

const resizableDesc = Object.getOwnPropertyDescriptor(ResizeAbility, 'resizable')!;

describe('ResizeAbility', () => {
    function createInstance() {
        const stateMap = new Map();
        const el = document.createElement('div');
        return {
            el,
            setAbilityState: jest.fn((key: string, val: any) => stateMap.set(key, val)),
            abilityState: jest.fn((key: string) => stateMap.get(key)),
            bind: jest.fn(),
            on: jest.fn(),
            onCleanup: jest.fn(),
            addCls: jest.fn(),
            emit: jest.fn(),
        };
    }

    describe('initResize', () => {
        it('默认配置初始化', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst);
            expect(inst.setAbilityState).toHaveBeenCalled();
            expect(inst.addCls).toHaveBeenCalledWith('q-resizable');
            expect(inst.onCleanup).toHaveBeenCalled();
        });

        it('自定义 edges', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst, { edges: ['n', 's'] });
            expect(inst.bind).toHaveBeenCalledTimes(2);
        });

        it('自定义尺寸限制', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst, {
                minWidth: 100,
                minHeight: 50,
                maxWidth: 500,
                maxHeight: 300,
            });
            const state = inst.abilityState('ResizeAbility:state');
            expect(state.minWidth).toBe(100);
            expect(state.maxHeight).toBe(300);
        });

        it('创建手柄 DOM 并绑定 drag', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst, { edges: ['se'] });
            expect(inst.bind).toHaveBeenCalledTimes(1);
            const handle = inst.el.querySelector('.q-resize-handle--se');
            expect(handle).toBeTruthy();
        });
    });

    describe('resizable getter/setter', () => {
        it('getter 返回启用状态', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst);
            expect(resizableDesc.get!.call(inst)).toBe(true);
        });

        it('setter 禁用后隐藏手柄', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst);
            resizableDesc.set!.call(inst, false);
            const state = inst.abilityState('ResizeAbility:state');
            expect(state.enabled).toBe(false);
        });

        it('无状态时 getter 返回 false', () => {
            const inst = { abilityState: jest.fn(() => undefined) };
            expect(resizableDesc.get!.call(inst)).toBe(false);
        });
    });

    describe('_onResizeDrag', () => {
        it('未启用时不处理', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst);
            resizableDesc.set!.call(inst, false);
            ResizeAbility._onResizeDrag.call(inst, {
                phase: 'start',
                originalEvent: { target: null },
            });
            expect(inst.emit).not.toHaveBeenCalled();
        });

        it('start 阶段记录初始状态', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst, { edges: ['se'] });
            const handle = inst.el.querySelector('[data-resize-edge="se"]') as HTMLElement;
            ResizeAbility._onResizeDrag.call(inst, {
                phase: 'start',
                dx: 10,
                dy: 20,
                originalEvent: { target: handle },
            });
            const state = inst.abilityState('ResizeAbility:state');
            expect(state.startX).toBe(10);
            expect(state.startY).toBe(20);
            expect(state.activeEdge).toBe('se');
        });

        it('move 阶段调整尺寸并 emit', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst, { edges: ['se'] });
            const handle = inst.el.querySelector('[data-resize-edge="se"]') as HTMLElement;
            ResizeAbility._onResizeDrag.call(inst, {
                phase: 'start',
                dx: 0,
                dy: 0,
                originalEvent: { target: handle },
            });
            ResizeAbility._onResizeDrag.call(inst, {
                phase: 'move',
                dx: 50,
                dy: 30,
                originalEvent: { target: handle },
            });
            expect(inst.emit).toHaveBeenCalledWith(
                'resize',
                expect.objectContaining({
                    edge: 'se',
                })
            );
        });

        it('end 阶段清除 activeEdge', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst, { edges: ['se'] });
            const handle = inst.el.querySelector('[data-resize-edge="se"]') as HTMLElement;
            ResizeAbility._onResizeDrag.call(inst, {
                phase: 'start',
                dx: 0,
                dy: 0,
                originalEvent: { target: handle },
            });
            ResizeAbility._onResizeDrag.call(inst, {
                phase: 'end',
                originalEvent: { target: handle },
            });
            const state = inst.abilityState('ResizeAbility:state');
            expect(state.activeEdge).toBeNull();
        });
    });

    describe('_cleanupHandles', () => {
        it('清理手柄 DOM', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst, { edges: ['n', 's'] });
            expect(inst.el.querySelectorAll('.q-resize-handle').length).toBe(2);
            ResizeAbility._cleanupHandles.call(inst);
            expect(inst.el.querySelectorAll('.q-resize-handle').length).toBe(0);
        });
    });
});
