/**
 * OverflowAbility 单元测试
 *
 * 覆盖所有公开和内部方法，目标覆盖率 80%+
 */

import { OverflowAbility } from '@/component-abilities/overflow/OverflowAbility';

class MockResizeObserver {
    callback: ResizeObserverCallback;
    constructor(cb: ResizeObserverCallback) {
        this.callback = cb;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
}

class MockMutationObserver {
    callback: MutationCallback;
    constructor(cb: MutationCallback) {
        this.callback = cb;
    }
    observe() {}
    takeRecords() {
        return [];
    }
    disconnect() {}
}

let rafCallbacks: FrameRequestCallback[] = [];
function mockRaf(cb: FrameRequestCallback): number {
    rafCallbacks.push(cb);
    return 1;
}
function flushRaf() {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    for (const cb of cbs) cb(0);
}

describe('OverflowAbility', () => {
    let origRAF: typeof requestAnimationFrame;
    let origRO: typeof ResizeObserver;
    let origMO: typeof MutationObserver;

    beforeAll(() => {
        origRAF = globalThis.requestAnimationFrame;
        origRO = globalThis.ResizeObserver;
        origMO = globalThis.MutationObserver;
        globalThis.requestAnimationFrame = mockRaf as any;
        globalThis.ResizeObserver = MockResizeObserver as any;
        globalThis.MutationObserver = MockMutationObserver as any;
    });

    afterAll(() => {
        globalThis.requestAnimationFrame = origRAF;
        globalThis.ResizeObserver = origRO;
        globalThis.MutationObserver = origMO;
    });

    beforeEach(() => {
        rafCallbacks = [];
    });

    function createInstance() {
        const stateMap = new Map();
        const el = document.createElement('div');
        const container = document.createElement('div');
        const prevBtn = document.createElement('button');
        const nextBtn = document.createElement('button');
        const moreBtn = document.createElement('button');
        const inst: any = {
            el,
            itemContainer: { el: container },
            nodeMap: {
                overflowPrev: { el: prevBtn },
                overflowNext: { el: nextBtn },
                overflowMore: { el: moreBtn },
            },
            _overflowMode: undefined as string | undefined,
            setAbilityState: jest.fn((key: string, val: any) => stateMap.set(key, val)),
            abilityState: jest.fn((key: string) => stateMap.get(key)),
            setNodeHidden: jest.fn(),
            addCls: jest.fn(),
            removeCls: jest.fn(),
            emit: jest.fn(),
        };
        Object.assign(inst, OverflowAbility);
        return inst;
    }

    describe('initOverflow', () => {
        it('none 模式初始化', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'none' });
            expect(inst.setAbilityState).toHaveBeenCalled();
        });

        it('scroll 模式初始化', () => {
            const inst = createInstance();
            inst._overflowMode = 'scroll';
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const state = inst.abilityState('OverflowAbility:state');
            expect(state.mode).toBe('scroll');
            expect(inst.el.classList.contains('q-itemgroup--overflow-scroll')).toBe(true);
        });

        it('menu 模式初始化', () => {
            const inst = createInstance();
            inst._overflowMode = 'menu';
            OverflowAbility.initOverflow.call(inst, { mode: 'menu' });
            const state = inst.abilityState('OverflowAbility:state');
            expect(state.mode).toBe('menu');
            expect(inst.el.classList.contains('q-itemgroup--overflow-menu')).toBe(true);
        });

        it('自定义 direction 和 step', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { direction: 'vertical', step: 200 });
            const state = inst.abilityState('OverflowAbility:state');
            expect(state.direction).toBe('vertical');
            expect(state.step).toBe(200);
        });
    });

    describe('getOverflowState', () => {
        it('无状态返回默认值', () => {
            const inst = { abilityState: jest.fn(() => undefined) };
            const state = OverflowAbility.getOverflowState.call(inst);
            expect(state.overflowing).toBe(false);
        });

        it('无容器返回默认值', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'none' });
            inst.itemContainer = { el: null };
            const state = OverflowAbility.getOverflowState.call(inst);
            expect(state.overflowing).toBe(false);
        });

        it('有容器时计算滚动状态', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const state = OverflowAbility.getOverflowState.call(inst);
            expect(state).toHaveProperty('scrollPos');
            expect(state).toHaveProperty('maxScroll');
        });
    });

    describe('getOverflowItems', () => {
        it('无状态返回空数组', () => {
            const inst = { abilityState: jest.fn(() => undefined) };
            expect(OverflowAbility.getOverflowItems.call(inst)).toEqual([]);
        });

        it('返回溢出项列表', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'menu' });
            const state = inst.abilityState('OverflowAbility:state');
            state.overflowItems = [
                { key: '1', label: 'Item 1', element: document.createElement('div') },
            ];
            expect(OverflowAbility.getOverflowItems.call(inst).length).toBe(1);
        });
    });

    describe('_scrollBy', () => {
        it('?prev 方向水平滚动', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const spy = jest.spyOn(inst.itemContainer.el, 'scrollBy').mockImplementation(() => {});
            OverflowAbility._scrollBy.call(inst, 'prev');
            expect(spy).toHaveBeenCalledWith({ left: -100, behavior: 'smooth' });
            spy.mockRestore();
        });

        it('next 方向水平滚动', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const spy = jest.spyOn(inst.itemContainer.el, 'scrollBy').mockImplementation(() => {});
            OverflowAbility._scrollBy.call(inst, 'next');
            expect(spy).toHaveBeenCalledWith({ left: 100, behavior: 'smooth' });
            spy.mockRestore();
        });

        it('垂直方向滚动', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll', direction: 'vertical' });
            const spy = jest.spyOn(inst.itemContainer.el, 'scrollBy').mockImplementation(() => {});
            OverflowAbility._scrollBy.call(inst, 'next');
            expect(spy).toHaveBeenCalledWith({ top: 100, behavior: 'smooth' });
            spy.mockRestore();
        });

        it('无容器不报错', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            inst.itemContainer = { el: null };
            expect(() => OverflowAbility._scrollBy.call(inst, 'prev')).not.toThrow();
        });
    });

    describe('_onOverflowPrevClick / _onOverflowNextClick', () => {
        it('prev 触发滚动', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const spy = jest.spyOn(inst.itemContainer.el, 'scrollBy').mockImplementation(() => {});
            OverflowAbility._onOverflowPrevClick.call(inst);
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });

        it('非 scroll 模式不处理', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'menu' });
            const spy = jest.spyOn(inst.itemContainer.el, 'scrollBy').mockImplementation(() => {});
            OverflowAbility._onOverflowPrevClick.call(inst);
            expect(spy).not.toHaveBeenCalled();
            spy.mockRestore();
        });

        it('next 触发滚动', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const spy = jest.spyOn(inst.itemContainer.el, 'scrollBy').mockImplementation(() => {});
            OverflowAbility._onOverflowNextClick.call(inst);
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe('_onOverflowMoreClick', () => {
        it('menu 模式触发事件', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'menu' });
            const state = inst.abilityState('OverflowAbility:state');
            state.overflowItems = [
                { key: '1', label: 'Item 1', element: document.createElement('div') },
            ];
            OverflowAbility._onOverflowMoreClick.call(inst);
            expect(inst.emit).toHaveBeenCalledWith('overflowmenutoggle', expect.any(Object));
        });

        it('无溢出项不触发', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'menu' });
            OverflowAbility._onOverflowMoreClick.call(inst);
            expect(inst.emit).not.toHaveBeenCalled();
        });

        it('非 menu 模式不处理', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            OverflowAbility._onOverflowMoreClick.call(inst);
            expect(inst.emit).not.toHaveBeenCalled();
        });
    });

    describe('overflowScrollTo', () => {
        it('水平方向 scrollTo', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const spy = jest.spyOn(inst.itemContainer.el, 'scrollTo').mockImplementation(() => {});
            OverflowAbility.overflowScrollTo.call(inst, 200);
            expect(spy).toHaveBeenCalledWith({ left: 200, behavior: 'smooth' });
            spy.mockRestore();
        });

        it('垂直方向 scrollTo', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll', direction: 'vertical' });
            const spy = jest.spyOn(inst.itemContainer.el, 'scrollTo').mockImplementation(() => {});
            OverflowAbility.overflowScrollTo.call(inst, 100);
            expect(spy).toHaveBeenCalledWith({ top: 100, behavior: 'smooth' });
            spy.mockRestore();
        });

        it('smooth=false 使用 instant', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const spy = jest.spyOn(inst.itemContainer.el, 'scrollTo').mockImplementation(() => {});
            OverflowAbility.overflowScrollTo.call(inst, 50, false);
            expect(spy).toHaveBeenCalledWith({ left: 50, behavior: 'instant' });
            spy.mockRestore();
        });

        it('无容器不报错', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'none' });
            inst.itemContainer = { el: null };
            expect(() => OverflowAbility.overflowScrollTo.call(inst, 0)).not.toThrow();
        });
    });

    describe('overflowScrollToChild', () => {
        it('无容器不报错', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            inst.itemContainer = { el: null };
            expect(() =>
                OverflowAbility.overflowScrollToChild.call(inst, document.createElement('div'))
            ).not.toThrow();
        });

        it('无 child 不报错', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            expect(() =>
                OverflowAbility.overflowScrollToChild.call(inst, null as any)
            ).not.toThrow();
        });

        it('水平方向 child 在左侧时向左滚动', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const child = document.createElement('div');
            jest.spyOn(inst.itemContainer.el, 'getBoundingClientRect').mockReturnValue({
                left: 100,
                right: 500,
                top: 0,
                bottom: 30,
                width: 400,
                height: 30,
                x: 100,
                y: 0,
            } as any);
            jest.spyOn(child, 'getBoundingClientRect').mockReturnValue({
                left: 50,
                right: 150,
                top: 0,
                bottom: 30,
                width: 100,
                height: 30,
                x: 50,
                y: 0,
            } as any);
            const spy = jest.spyOn(inst.itemContainer.el, 'scrollBy').mockImplementation(() => {});
            OverflowAbility.overflowScrollToChild.call(inst, child);
            expect(spy).toHaveBeenCalledWith({ left: -50, behavior: 'smooth' });
            spy.mockRestore();
        });

        it('水平方向 child 在右侧时向右滚动', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const child = document.createElement('div');
            jest.spyOn(inst.itemContainer.el, 'getBoundingClientRect').mockReturnValue({
                left: 0,
                right: 400,
                top: 0,
                bottom: 30,
                width: 400,
                height: 30,
                x: 0,
                y: 0,
            } as any);
            jest.spyOn(child, 'getBoundingClientRect').mockReturnValue({
                left: 350,
                right: 550,
                top: 0,
                bottom: 30,
                width: 200,
                height: 30,
                x: 350,
                y: 0,
            } as any);
            const spy = jest.spyOn(inst.itemContainer.el, 'scrollBy').mockImplementation(() => {});
            OverflowAbility.overflowScrollToChild.call(inst, child);
            expect(spy).toHaveBeenCalledWith({ left: 150, behavior: 'smooth' });
            spy.mockRestore();
        });

        it('垂直方向 child 在上方时向上滚动', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll', direction: 'vertical' });
            const child = document.createElement('div');
            jest.spyOn(inst.itemContainer.el, 'getBoundingClientRect').mockReturnValue({
                left: 0,
                right: 30,
                top: 100,
                bottom: 500,
                width: 30,
                height: 400,
                x: 0,
                y: 100,
            } as any);
            jest.spyOn(child, 'getBoundingClientRect').mockReturnValue({
                left: 0,
                right: 30,
                top: 50,
                bottom: 150,
                width: 30,
                height: 100,
                x: 0,
                y: 50,
            } as any);
            const spy = jest.spyOn(inst.itemContainer.el, 'scrollBy').mockImplementation(() => {});
            OverflowAbility.overflowScrollToChild.call(inst, child);
            expect(spy).toHaveBeenCalledWith({ top: -50, behavior: 'smooth' });
            spy.mockRestore();
        });

        it('垂直方向 child 在下方时向下滚动', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll', direction: 'vertical' });
            const child = document.createElement('div');
            jest.spyOn(inst.itemContainer.el, 'getBoundingClientRect').mockReturnValue({
                left: 0,
                right: 30,
                top: 0,
                bottom: 400,
                width: 30,
                height: 400,
                x: 0,
                y: 0,
            } as any);
            jest.spyOn(child, 'getBoundingClientRect').mockReturnValue({
                left: 0,
                right: 30,
                top: 350,
                bottom: 550,
                width: 30,
                height: 200,
                x: 0,
                y: 350,
            } as any);
            const spy = jest.spyOn(inst.itemContainer.el, 'scrollBy').mockImplementation(() => {});
            OverflowAbility.overflowScrollToChild.call(inst, child);
            expect(spy).toHaveBeenCalledWith({ top: 150, behavior: 'smooth' });
            spy.mockRestore();
        });

        it('child 在可视区域内不滚动', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const child = document.createElement('div');
            jest.spyOn(inst.itemContainer.el, 'getBoundingClientRect').mockReturnValue({
                left: 0,
                right: 500,
                top: 0,
                bottom: 30,
                width: 500,
                height: 30,
                x: 0,
                y: 0,
            } as any);
            jest.spyOn(child, 'getBoundingClientRect').mockReturnValue({
                left: 50,
                right: 150,
                top: 0,
                bottom: 30,
                width: 100,
                height: 30,
                x: 50,
                y: 0,
            } as any);
            const spy = jest.spyOn(inst.itemContainer.el, 'scrollBy').mockImplementation(() => {});
            OverflowAbility.overflowScrollToChild.call(inst, child);
            expect(spy).not.toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe('_applyOverflowMode', () => {
        it('scroll 模式设置 CSS 类和节点可见性', () => {
            const inst = createInstance();
            inst._overflowMode = 'scroll';
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            expect(inst.setNodeHidden).toHaveBeenCalledWith(false, 'overflowPrev');
            expect(inst.setNodeHidden).toHaveBeenCalledWith(false, 'overflowNext');
            expect(inst.setNodeHidden).toHaveBeenCalledWith(true, 'overflowMore');
        });

        it('menu 模式设置 CSS 类和节点可见性', () => {
            const inst = createInstance();
            inst._overflowMode = 'menu';
            OverflowAbility.initOverflow.call(inst, { mode: 'menu' });
            expect(inst.setNodeHidden).toHaveBeenCalledWith(false, 'overflowPrev');
            expect(inst.setNodeHidden).toHaveBeenCalledWith(true, 'overflowNext');
            expect(inst.setNodeHidden).toHaveBeenCalledWith(false, 'overflowMore');
        });

        it('none 模式调用 _teardownOverflow', () => {
            const inst = createInstance();
            inst._overflowMode = 'none';
            OverflowAbility.initOverflow.call(inst, { mode: 'none' });
            expect(inst.setNodeHidden).toHaveBeenCalledWith(true, 'overflowPrev');
            expect(inst.setNodeHidden).toHaveBeenCalledWith(true, 'overflowNext');
            expect(inst.setNodeHidden).toHaveBeenCalledWith(true, 'overflowMore');
        });
    });

    describe('_setupOverflowListeners', () => {
        it('注册 scroll 事件和 Observer', () => {
            const inst = createInstance();
            inst._overflowMode = 'scroll';
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const state = inst.abilityState('OverflowAbility:state');
            expect(state.scrollHandler).toBeTruthy();
            expect(state.resizeObserver).toBeTruthy();
            expect(state.mutationObserver).toBeTruthy();
        });

        it('注册按钮点击事件', () => {
            const inst = createInstance();
            inst._overflowMode = 'scroll';
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const state = inst.abilityState('OverflowAbility:state');
            expect(state.prevClickHandler).toBeTruthy();
            expect(state.nextClickHandler).toBeTruthy();
        });

        it('menu 模式注册 more 按钮事件', () => {
            const inst = createInstance();
            inst._overflowMode = 'menu';
            OverflowAbility.initOverflow.call(inst, { mode: 'menu' });
            const state = inst.abilityState('OverflowAbility:state');
            expect(state.moreClickHandler).toBeTruthy();
        });

        it('重复调用时移除旧 handler', () => {
            const inst = createInstance();
            inst._overflowMode = 'scroll';
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const removeSpy = jest.spyOn(inst.itemContainer.el, 'removeEventListener');
            OverflowAbility._setupOverflowListeners.call(inst);
            expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
            removeSpy.mockRestore();
        });
    });

    describe('_scheduleOverflowUpdate', () => {
        it('调度 rAF 更新', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            OverflowAbility._scheduleOverflowUpdate.call(inst);
            expect(rafCallbacks.length).toBeGreaterThan(0);
        });

        it('rAF 回调执行 _detectOverflow 和 _updateOverflowUI', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const detectSpy = jest.fn();
            const uiSpy = jest.fn();
            inst._detectOverflow = detectSpy;
            inst._updateOverflowUI = uiSpy;
            OverflowAbility._scheduleOverflowUpdate.call(inst);
            flushRaf();
            expect(detectSpy).toHaveBeenCalled();
            expect(uiSpy).toHaveBeenCalled();
        });
    });

    describe('_detectOverflow', () => {
        it('scroll 模式重置 hidden', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const child = document.createElement('div');
            child.hidden = true;
            inst.itemContainer.el.appendChild(child);
            OverflowAbility._detectOverflow.call(inst);
            expect(child.hidden).toBe(false);
        });

        it('menu 模式检测溢出项', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'menu' });
            const child = document.createElement('div');
            child.setAttribute('data-key', 'item-1');
            child.setAttribute('data-label', 'Test');
            inst.itemContainer.el.appendChild(child);
            jest.spyOn(child, 'getBoundingClientRect').mockReturnValue({
                right: 9999,
                bottom: 0,
                left: 0,
                top: 0,
                width: 100,
                height: 30,
                x: 0,
                y: 0,
            } as any);
            jest.spyOn(inst.itemContainer.el, 'getBoundingClientRect').mockReturnValue({
                right: 500,
                bottom: 0,
                left: 0,
                top: 0,
                width: 500,
                height: 30,
                x: 0,
                y: 0,
            } as any);
            OverflowAbility._detectOverflow.call(inst);
            const state = inst.abilityState('OverflowAbility:state');
            expect(state.overflowItems.length).toBe(1);
            expect(state.overflowItems[0].key).toBe('item-1');
        });

        it('无容器不报错', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            inst.itemContainer = { el: null };
            expect(() => OverflowAbility._detectOverflow.call(inst)).not.toThrow();
        });

        it('menu 模式非溢出子项 hidden=false', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'menu' });
            const child1 = document.createElement('div');
            child1.setAttribute('data-key', 'a');
            const child2 = document.createElement('div');
            child2.setAttribute('data-key', 'b');
            inst.itemContainer.el.appendChild(child1);
            inst.itemContainer.el.appendChild(child2);
            jest.spyOn(child1, 'getBoundingClientRect').mockReturnValue({
                right: 100,
                bottom: 30,
                left: 0,
                top: 0,
                width: 100,
                height: 30,
                x: 0,
                y: 0,
            } as any);
            jest.spyOn(child2, 'getBoundingClientRect').mockReturnValue({
                right: 9999,
                bottom: 30,
                left: 100,
                top: 0,
                width: 100,
                height: 30,
                x: 100,
                y: 0,
            } as any);
            jest.spyOn(inst.itemContainer.el, 'getBoundingClientRect').mockReturnValue({
                right: 500,
                bottom: 30,
                left: 0,
                top: 0,
                width: 500,
                height: 30,
                x: 0,
                y: 0,
            } as any);
            OverflowAbility._detectOverflow.call(inst);
            expect(child1.hidden).toBe(false);
            expect(child2.hidden).toBe(true);
        });

        it('none 模式不执行检测', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'none' });
            expect(() => OverflowAbility._detectOverflow.call(inst)).not.toThrow();
        });
    });

    describe('_updateOverflowUI', () => {
        it('scroll 模式更新 UI', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            OverflowAbility._updateOverflowUI.call(inst);
            expect(inst.setNodeHidden).toHaveBeenCalled();
        });

        it('menu 模式更新 UI', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'menu' });
            OverflowAbility._updateOverflowUI.call(inst);
            expect(inst.setNodeHidden).toHaveBeenCalled();
        });
    });

    describe('_teardownOverflow', () => {
        it('清理 CSS 类和隐藏节点', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            OverflowAbility._teardownOverflow.call(inst);
            expect(inst.setNodeHidden).toHaveBeenCalledWith(true, 'overflowPrev');
            expect(inst.setNodeHidden).toHaveBeenCalledWith(true, 'overflowNext');
            expect(inst.setNodeHidden).toHaveBeenCalledWith(true, 'overflowMore');
        });

        it('清理 scroll handler', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const state = inst.abilityState('OverflowAbility:state');
            const handler = state.scrollHandler;
            const removeSpy = jest.spyOn(inst.itemContainer.el, 'removeEventListener');
            OverflowAbility._teardownOverflow.call(inst);
            expect(removeSpy).toHaveBeenCalledWith('scroll', handler);
            removeSpy.mockRestore();
        });

        it('清理按钮事件', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            const state = inst.abilityState('OverflowAbility:state');
            const prevHandler = state.prevClickHandler;
            const nextHandler = state.nextClickHandler;
            const prevRemoveSpy = jest.spyOn(inst.nodeMap.overflowPrev.el, 'removeEventListener');
            const nextRemoveSpy = jest.spyOn(inst.nodeMap.overflowNext.el, 'removeEventListener');
            OverflowAbility._teardownOverflow.call(inst);
            expect(prevRemoveSpy).toHaveBeenCalledWith('click', prevHandler);
            expect(nextRemoveSpy).toHaveBeenCalledWith('click', nextHandler);
            prevRemoveSpy.mockRestore();
            nextRemoveSpy.mockRestore();
        });

        it('清理 more 按钮事件', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'menu' });
            const state = inst.abilityState('OverflowAbility:state');
            const moreHandler = state.moreClickHandler;
            const moreRemoveSpy = jest.spyOn(inst.nodeMap.overflowMore.el, 'removeEventListener');
            OverflowAbility._teardownOverflow.call(inst);
            expect(moreRemoveSpy).toHaveBeenCalledWith('click', moreHandler);
            moreRemoveSpy.mockRestore();
        });
    });

    describe('refreshOverflow', () => {
        it('调用 _scheduleOverflowUpdate', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'none' });
            OverflowAbility.refreshOverflow.call(inst);
            expect(rafCallbacks.length).toBeGreaterThan(0);
        });
    });

    describe('_onOverflowDirectionChange', () => {
        it('调度更新', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            OverflowAbility._onOverflowDirectionChange.call(inst);
            expect(rafCallbacks.length).toBeGreaterThan(0);
        });
    });

    describe('_onOverflowStepChange', () => {
        it('更新 step', () => {
            const inst = createInstance();
            OverflowAbility.initOverflow.call(inst, { mode: 'scroll' });
            OverflowAbility._onOverflowStepChange.call(inst, 300);
            const state = inst.abilityState('OverflowAbility:state');
            expect(state.step).toBe(300);
        });
    });
});
