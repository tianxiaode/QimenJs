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
            getNodeEl: jest.fn((name: string) => {
                const node = document.createElement('div');
                node.dataset.resizeEdge = 'e';
                el.appendChild(node);
                return node;
            }),
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
            expect(inst.el.querySelectorAll('.q-resize-handle').length).toBe(2);
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
            const handle = inst.el.querySelector('.q-resize-handle--se');
            expect(handle).toBeTruthy();
        });

        it('使用已有节点作为 handle（委托模式）', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst, {
                edges: ['e'],
                handle: 'resizeHandle',
            });
            const state = inst.abilityState('ResizeAbility:state');
            expect(state.customHandle).toBe(true);
            expect(state.handles.has('e')).toBe(true);
            expect(inst.el.querySelectorAll('.q-resize-handle').length).toBe(0);
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
                data: { phase: 'start', originalEvent: { target: null } },
            });
            expect(inst.emit).not.toHaveBeenCalled();
        });

        it('start 阶段记录初始状态', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst, { edges: ['se'] });
            const handle = inst.el.querySelector('[data-resize-edge="se"]') as HTMLElement;
            ResizeAbility._onResizeDrag.call(inst, {
                data: { phase: 'start', dx: 0, dy: 0, originalEvent: { target: handle } },
            });
            const state = inst.abilityState('ResizeAbility:state');
            expect(state.activeEdge).toBe('se');
        });

        it('move 阶段调整尺寸并 emit', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst, { edges: ['se'] });
            const handle = inst.el.querySelector('[data-resize-edge="se"]') as HTMLElement;
            ResizeAbility._onResizeDrag.call(inst, {
                data: { phase: 'start', dx: 0, dy: 0, originalEvent: { target: handle } },
            });
            ResizeAbility._onResizeDrag.call(inst, {
                data: { phase: 'move', dx: 50, dy: 30, originalEvent: { target: handle } },
            });
            expect(inst.emit).toHaveBeenCalledWith(
                'resize',
                expect.objectContaining({
                    edge: 'se',
                })
            );
        });

        it('move 阶段使用 bridges 时不手动 emit', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst, {
                edges: ['e'],
                bridges: ['resize'],
                skipDomUpdate: true,
            });
            const handle = inst.el.querySelector('[data-resize-edge="e"]') as HTMLElement;
            ResizeAbility._onResizeDrag.call(inst, {
                data: { phase: 'start', dx: 0, dy: 0, originalEvent: { target: handle } },
            });
            const domEvt: any = {
                data: { phase: 'move', dx: 50, dy: 0, originalEvent: { target: handle } },
            };
            ResizeAbility._onResizeDrag.call(inst, domEvt);
            expect(inst.emit).not.toHaveBeenCalled();
            expect(domEvt.actionData).toEqual(
                expect.objectContaining({
                    edge: 'e',
                })
            );
        });

        it('end 阶段清除 activeEdge', () => {
            const inst = createInstance();
            ResizeAbility.initResize.call(inst, { edges: ['se'] });
            const handle = inst.el.querySelector('[data-resize-edge="se"]') as HTMLElement;
            ResizeAbility._onResizeDrag.call(inst, {
                data: { phase: 'start', dx: 0, dy: 0, originalEvent: { target: handle } },
            });
            ResizeAbility._onResizeDrag.call(inst, {
                data: { phase: 'end', originalEvent: { target: handle } },
            });
            const state = inst.abilityState('ResizeAbility:state');
            expect(state.activeEdge).toBeNull();
        });
    });
});
