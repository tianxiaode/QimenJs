/**
 * DragDispatchCenter 单元测试
 *
 * 覆盖：register、unregister、get、handleInit、拖拽事件阶段、
 * 放置区事件、accept 过滤、activeClass 管理、disposeByComponent、dispose
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

jest.mock('@/events/DragEventBus', () => {
    const instance = {
        dragStart: jest.fn(),
        dragEnd: jest.fn(),
        dragCancel: jest.fn(),
        dragEnter: jest.fn(),
        dragLeave: jest.fn(),
        dragDrop: jest.fn(),
        getActiveDrag: jest.fn(() => null),
    };
    return {
        DragEventBus: {
            getInstance: jest.fn(() => instance),
        },
        DRAG_ACTIONS: { INIT: 'init' },
    };
});

import { DragDispatchCenter } from '@/component-core/drag/DragDispatchCenter';
import { DragEventBus } from '@/events/DragEventBus';

type MockBusInstance = {
    dragStart: jest.Mock;
    dragEnd: jest.Mock;
    dragCancel: jest.Mock;
    dragEnter: jest.Mock;
    dragLeave: jest.Mock;
    dragDrop: jest.Mock;
    getActiveDrag: jest.Mock;
};

function getBusInstance(): MockBusInstance {
    return (DragEventBus.getInstance as jest.Mock)();
}

/** 创建 mock 组件 */
function makeComponent(overrides: Record<string, any> = {}): Record<string, any> {
    const el = document.createElement('div');
    const nodeMapEl = document.createElement('div');
    return {
        el,
        type: 'Test',
        nodeMap: { body: { el: nodeMapEl } } as Record<string, { el: HTMLElement }>,
        onCleanup: jest.fn(),
        bind: jest.fn(),
        on: jest.fn().mockReturnValue(jest.fn()),
        ...overrides,
    };
}

/** 捕获 component.on('dom:drag', cb) 中的回调 */
function captureDragHandler(component: ReturnType<typeof makeComponent>) {
    for (const call of component.on.mock.calls) {
        if (call[0] === 'dom:drag') return call[1];
    }
    return null;
}

/** 创建拖拽手势数据，target 默认就是 el 本身以通过 contains 检查 */
function makeGesture(phase: string, el?: HTMLElement, overrides: Record<string, any> = {}) {
    return {
        phase,
        dx: 10,
        dy: 20,
        originalEvent: { target: el ?? document.createElement('div') },
        ...overrides,
    };
}

describe('DragDispatchCenter', () => {
    let center: DragDispatchCenter;

    beforeEach(() => {
        jest.clearAllMocks();
        center = new DragDispatchCenter();
    });

    afterEach(() => {
        center.dispose();
    });

    // ============================================
    // register / get
    // ============================================

    describe('register / get', () => {
        it('注册和获取拖拽定义', () => {
            const def = { axis: 'x' as const };
            center.register('comp1:body', def);
            expect(center.get('comp1:body')).toBe(def);
        });

        it('获取未注册的 key 返回 undefined', () => {
            expect(center.get('nonexist')).toBeUndefined();
        });
    });

    // ============================================
    // unregister
    // ============================================

    describe('unregister', () => {
        it('注销拖拽定义并清理实例', () => {
            const el = document.createElement('div');
            const component = makeComponent();
            center.handleInit('comp1', {
                component,
                drags: { body: { activeClass: 'dragging' } },
            });

            el.classList.add('dragging');

            center.unregister('comp1:body');
            expect(center.get('comp1:body')).toBeUndefined();
        });
    });

    // ============================================
    // handleInit
    // ============================================

    describe('handleInit', () => {
        it('无 component 或 drags 时不报错', () => {
            expect(() => center.handleInit('comp1', {})).not.toThrow();
            expect(() => center.handleInit('comp1', { component: null })).not.toThrow();
            expect(() => center.handleInit('comp1', { drags: null })).not.toThrow();
        });

        it('注册拖拽实例并绑定事件', () => {
            const component = makeComponent();
            center.handleInit('comp1', {
                component,
                drags: { body: { axis: 'y' } },
            });
            expect(component.bind).toHaveBeenCalledWith(component.nodeMap.body.el, 'drag');
            expect(component.onCleanup).toHaveBeenCalled();
        });

        it('nodeMap 中无对应节点时回退到 component.el', () => {
            const el = document.createElement('div');
            const component = makeComponent({ nodeMap: {} });
            component.el = el;
            center.handleInit('comp1', {
                component,
                drags: { handle: { axis: 'x' } },
            });
            expect(component.bind).toHaveBeenCalledWith(el, 'drag');
        });

        it('注册 onCleanup 回调用于组件销毁时清理', () => {
            const component = makeComponent();
            center.handleInit('comp1', {
                component,
                drags: { body: {} },
            });
            expect(component.onCleanup).toHaveBeenCalledTimes(1);
            const cleanupFn = component.onCleanup.mock.calls[0][0];
            expect(typeof cleanupFn).toBe('function');
        });

        it('多个拖拽节点分别注册', () => {
            const component = makeComponent();
            const headerEl = document.createElement('div');
            component.nodeMap = {
                body: { el: document.createElement('div') },
                header: { el: headerEl },
            };
            center.handleInit('comp1', {
                component,
                drags: { body: { axis: 'y' }, header: { axis: 'x' } },
            });
            expect(component.bind).toHaveBeenCalledTimes(2);
        });
    });

    // ============================================
    // 拖拽事件阶段
    // ============================================

    describe('拖拽事件阶段', () => {
        let component: ReturnType<typeof makeComponent>;
        let dragHandler: ((gesture: any) => void) | null;
        let dragEl: HTMLElement;

        beforeEach(() => {
            component = makeComponent();
            center.handleInit('comp1', {
                component,
                drags: { body: { activeClass: 'is-dragging' } },
            });
            dragHandler = captureDragHandler(component);
            dragEl = component.nodeMap.body.el;
        });

        it('start 阶段调用 bus.dragStart', () => {
            dragHandler!(makeGesture('start', dragEl));
            expect(getBusInstance().dragStart).toHaveBeenCalledWith(
                'comp1:body',
                expect.objectContaining({ dragType: 'Test' })
            );
        });

        it('start 阶段添加 activeClass', () => {
            dragHandler!(makeGesture('start', dragEl));
            expect(dragEl.classList.contains('is-dragging')).toBe(true);
        });

        it('start 阶段调用 onBodyDragStart', () => {
            component.onBodyDragStart = jest.fn();
            dragHandler!(makeGesture('start', dragEl));
            expect(component.onBodyDragStart).toHaveBeenCalledWith(
                expect.objectContaining({ dx: 10, dy: 20 })
            );
        });

        it('start 阶段使用 config.type 覆盖 component.type', () => {
            const customComponent = makeComponent();
            customComponent.type = 'Default';
            center.handleInit('comp2', {
                component: customComponent,
                drags: { body: { type: 'Custom' } },
            });
            const handler = captureDragHandler(customComponent);
            handler!(makeGesture('start', customComponent.nodeMap.body.el));
            expect(getBusInstance().dragStart).toHaveBeenCalledWith(
                'comp2:body',
                expect.objectContaining({ dragType: 'Custom' })
            );
        });

        it('move 阶段调用 onBodyDragMove', () => {
            component.onBodyDragMove = jest.fn();
            dragHandler!(makeGesture('move', dragEl));
            expect(component.onBodyDragMove).toHaveBeenCalledWith(
                expect.objectContaining({ dx: 10, dy: 20 })
            );
        });

        it('move 阶段不调用 bus 方法', () => {
            dragHandler!(makeGesture('move', dragEl));
            expect(getBusInstance().dragEnd).not.toHaveBeenCalled();
        });

        it('end 阶段调用 bus.dragEnd', () => {
            dragHandler!(makeGesture('end', dragEl));
            expect(getBusInstance().dragEnd).toHaveBeenCalledWith('comp1:body');
        });

        it('end 阶段移除 activeClass', () => {
            dragEl.classList.add('is-dragging');
            dragHandler!(makeGesture('end', dragEl));
            expect(dragEl.classList.contains('is-dragging')).toBe(false);
        });

        it('end 阶段调用 onBodyDragEnd', () => {
            component.onBodyDragEnd = jest.fn();
            dragHandler!(makeGesture('end', dragEl));
            expect(component.onBodyDragEnd).toHaveBeenCalledWith(
                expect.objectContaining({ el: dragEl })
            );
        });

        it('cancel 阶段调用 bus.dragCancel', () => {
            dragHandler!(makeGesture('cancel', dragEl));
            expect(getBusInstance().dragCancel).toHaveBeenCalledWith('comp1:body');
        });

        it('cancel 阶段移除 activeClass', () => {
            dragEl.classList.add('is-dragging');
            dragHandler!(makeGesture('cancel', dragEl));
            expect(dragEl.classList.contains('is-dragging')).toBe(false);
        });

        it('cancel 阶段调用 onBodyDragCancel', () => {
            component.onBodyDragCancel = jest.fn();
            dragHandler!(makeGesture('cancel', dragEl));
            expect(component.onBodyDragCancel).toHaveBeenCalledWith(
                expect.objectContaining({ el: dragEl })
            );
        });

        it('无 activeClass 时不操作 classList', () => {
            const noClassComponent = makeComponent();
            center.handleInit('comp3', {
                component: noClassComponent,
                drags: { body: {} },
            });
            const handler = captureDragHandler(noClassComponent);
            const el = noClassComponent.nodeMap.body.el;
            const addSpy = jest.spyOn(el.classList, 'add');
            handler!(makeGesture('start', el));
            expect(addSpy).not.toHaveBeenCalled();
        });

        it('目标元素不在拖拽元素内时忽略事件', () => {
            component.onBodyDragStart = jest.fn();
            const outsideTarget = document.createElement('span');
            dragHandler!(
                makeGesture('start', undefined, { originalEvent: { target: outsideTarget } })
            );
            expect(component.onBodyDragStart).not.toHaveBeenCalled();
            expect(getBusInstance().dragStart).not.toHaveBeenCalled();
        });

        it('无对应 handler 时不报错', () => {
            expect(() => dragHandler!(makeGesture('start', dragEl))).not.toThrow();
            expect(() => dragHandler!(makeGesture('move', dragEl))).not.toThrow();
            expect(() => dragHandler!(makeGesture('end', dragEl))).not.toThrow();
            expect(() => dragHandler!(makeGesture('cancel', dragEl))).not.toThrow();
        });
    });

    // ============================================
    // 放置区管理
    // ============================================

    describe('放置区管理', () => {
        it('registerDropZone 注册放置区', () => {
            const el = document.createElement('div');
            const component = { id: 'comp1' };
            center.registerDropZone('comp1:container', el, component, 'container');
        });

        it('registerDropZone 替换已有放置区', () => {
            const el = document.createElement('div');
            const component = { id: 'comp1' };
            center.registerDropZone('comp1:container', el, component, 'container');
            center.registerDropZone('comp1:container', el, component, 'container');
        });

        it('unregisterDropZone 注销放置区', () => {
            const el = document.createElement('div');
            const component = { id: 'comp1' };
            center.registerDropZone('comp1:container', el, component, 'container');
            center.unregisterDropZone('comp1:container');
        });

        it('unregisterDropZone 不存在的 key 不报错', () => {
            expect(() => center.unregisterDropZone('nonexist')).not.toThrow();
        });
    });

    // ============================================
    // 放置区事件
    // ============================================

    describe('放置区事件', () => {
        let dropEl: HTMLElement;
        let component: any;

        beforeEach(() => {
            dropEl = document.createElement('div');
            component = {
                id: 'comp1',
                onContainerDragEnter: jest.fn(),
                onContainerDragLeave: jest.fn(),
                onContainerDragDrop: jest.fn(),
            };
        });

        it('dragenter 触发 bus.dragEnter 和 handler', () => {
            const activeDrag = {
                dragKey: 'src:handle',
                dragType: 'Item',
                dragData: {},
                dragEl: null,
                dragSource: null,
            };
            getBusInstance().getActiveDrag.mockReturnValue(activeDrag);

            center.registerDropZone('comp1:container', dropEl, component, 'container');

            const event = new Event('dragenter', { bubbles: true });
            dropEl.dispatchEvent(event);

            expect(getBusInstance().dragEnter).toHaveBeenCalledWith(
                'src:handle',
                component,
                dropEl
            );
            expect(component.onContainerDragEnter).toHaveBeenCalled();
        });

        it('dragenter 无活跃拖拽时不触发', () => {
            getBusInstance().getActiveDrag.mockReturnValue(null);
            center.registerDropZone('comp1:container', dropEl, component, 'container');

            dropEl.dispatchEvent(new Event('dragenter'));

            expect(getBusInstance().dragEnter).not.toHaveBeenCalled();
            expect(component.onContainerDragEnter).not.toHaveBeenCalled();
        });

        it('dragenter accept 过滤不匹配时忽略', () => {
            const activeDrag = {
                dragKey: 'src:handle',
                dragType: 'File',
                dragData: {},
                dragEl: null,
                dragSource: null,
            };
            getBusInstance().getActiveDrag.mockReturnValue(activeDrag);

            center.registerDropZone('comp1:container', dropEl, component, 'container', {
                accept: ['Image'],
            });

            dropEl.dispatchEvent(new Event('dragenter'));

            expect(getBusInstance().dragEnter).not.toHaveBeenCalled();
        });

        it('dragenter accept 匹配时触发', () => {
            const activeDrag = {
                dragKey: 'src:handle',
                dragType: 'Image',
                dragData: {},
                dragEl: null,
                dragSource: null,
            };
            getBusInstance().getActiveDrag.mockReturnValue(activeDrag);

            center.registerDropZone('comp1:container', dropEl, component, 'container', {
                accept: ['Image', 'File'],
            });

            dropEl.dispatchEvent(new Event('dragenter'));

            expect(getBusInstance().dragEnter).toHaveBeenCalled();
        });

        it('dragenter 添加 activeClass', () => {
            const activeDrag = {
                dragKey: 'src:handle',
                dragType: 'Item',
                dragData: {},
                dragEl: null,
                dragSource: null,
            };
            getBusInstance().getActiveDrag.mockReturnValue(activeDrag);

            center.registerDropZone('comp1:container', dropEl, component, 'container', {
                activeClass: 'drop-active',
            });

            dropEl.dispatchEvent(new Event('dragenter'));

            expect(dropEl.classList.contains('drop-active')).toBe(true);
        });

        it('dragleave 移除 activeClass 并触发 bus.dragLeave', () => {
            const activeDrag = {
                dragKey: 'src:handle',
                dragType: 'Item',
                dragData: {},
                dragEl: null,
                dragSource: null,
            };
            getBusInstance().getActiveDrag.mockReturnValue(activeDrag);

            center.registerDropZone('comp1:container', dropEl, component, 'container', {
                activeClass: 'drop-active',
            });

            dropEl.dispatchEvent(new Event('dragenter'));
            dropEl.dispatchEvent(new Event('dragleave'));

            expect(getBusInstance().dragLeave).toHaveBeenCalledWith(
                'src:handle',
                component,
                dropEl
            );
            expect(dropEl.classList.contains('drop-active')).toBe(false);
        });

        it('dragleave 调用 onContainerDragLeave', () => {
            const activeDrag = {
                dragKey: 'src:handle',
                dragType: 'Item',
                dragData: {},
                dragEl: null,
                dragSource: null,
            };
            getBusInstance().getActiveDrag.mockReturnValue(activeDrag);

            center.registerDropZone('comp1:container', dropEl, component, 'container');

            dropEl.dispatchEvent(new Event('dragleave'));

            expect(component.onContainerDragLeave).toHaveBeenCalled();
        });

        it('drop 触发 bus.dragDrop 和 handler', () => {
            const activeDrag = {
                dragKey: 'src:handle',
                dragType: 'Item',
                dragData: { id: 1 },
                dragEl: null,
                dragSource: null,
            };
            getBusInstance().getActiveDrag.mockReturnValue(activeDrag);

            center.registerDropZone('comp1:container', dropEl, component, 'container');

            dropEl.dispatchEvent(new Event('drop'));

            expect(getBusInstance().dragDrop).toHaveBeenCalledWith('src:handle', component, dropEl);
            expect(component.onContainerDragDrop).toHaveBeenCalledWith(
                expect.objectContaining({ dragData: { id: 1 } })
            );
        });

        it('drop 使用 config.onDrop 指定的方法名', () => {
            const activeDrag = {
                dragKey: 'src:handle',
                dragType: 'Item',
                dragData: {},
                dragEl: null,
                dragSource: null,
            };
            getBusInstance().getActiveDrag.mockReturnValue(activeDrag);

            component.handleDrop = jest.fn();
            center.registerDropZone('comp1:container', dropEl, component, 'container', {
                onDrop: 'handleDrop',
            });

            dropEl.dispatchEvent(new Event('drop'));

            expect(component.handleDrop).toHaveBeenCalled();
        });

        it('drop accept 不匹配时忽略', () => {
            const activeDrag = {
                dragKey: 'src:handle',
                dragType: 'File',
                dragData: {},
                dragEl: null,
                dragSource: null,
            };
            getBusInstance().getActiveDrag.mockReturnValue(activeDrag);

            center.registerDropZone('comp1:container', dropEl, component, 'container', {
                accept: ['Image'],
            });

            dropEl.dispatchEvent(new Event('drop'));

            expect(getBusInstance().dragDrop).not.toHaveBeenCalled();
            expect(component.onContainerDragDrop).not.toHaveBeenCalled();
        });

        it('drop 移除 activeClass', () => {
            const activeDrag = {
                dragKey: 'src:handle',
                dragType: 'Item',
                dragData: {},
                dragEl: null,
                dragSource: null,
            };
            getBusInstance().getActiveDrag.mockReturnValue(activeDrag);

            center.registerDropZone('comp1:container', dropEl, component, 'container', {
                activeClass: 'drop-active',
            });

            dropEl.classList.add('drop-active');
            dropEl.dispatchEvent(new Event('drop'));

            expect(dropEl.classList.contains('drop-active')).toBe(false);
        });

        it('dragover 无活跃拖拽时不触发', () => {
            getBusInstance().getActiveDrag.mockReturnValue(null);
            center.registerDropZone('comp1:container', dropEl, component, 'container');

            dropEl.dispatchEvent(new Event('dragover'));
        });

        it('dragover accept 不匹配时忽略', () => {
            const activeDrag = {
                dragKey: 'src:handle',
                dragType: 'File',
                dragData: {},
                dragEl: null,
                dragSource: null,
            };
            getBusInstance().getActiveDrag.mockReturnValue(activeDrag);

            center.registerDropZone('comp1:container', dropEl, component, 'container', {
                accept: ['Image'],
            });

            dropEl.dispatchEvent(new Event('dragover'));
        });

        it('unregisterDropZone 移除 activeClass', () => {
            const activeDrag = {
                dragKey: 'src:handle',
                dragType: 'Item',
                dragData: {},
                dragEl: null,
                dragSource: null,
            };
            getBusInstance().getActiveDrag.mockReturnValue(activeDrag);

            center.registerDropZone('comp1:container', dropEl, component, 'container', {
                activeClass: 'drop-active',
            });

            dropEl.classList.add('drop-active');
            center.unregisterDropZone('comp1:container');

            expect(dropEl.classList.contains('drop-active')).toBe(false);
        });
    });

    // ============================================
    // disposeByComponent
    // ============================================

    describe('disposeByComponent', () => {
        it('销毁指定组件的所有拖拽实例', () => {
            const component = makeComponent();
            center.handleInit('comp1', {
                component,
                drags: { body: {} },
            });
            center.disposeByComponent('comp1');
        });

        it('销毁指定组件的放置区', () => {
            const dropEl = document.createElement('div');
            const component = { id: 'comp1' };
            center.registerDropZone('comp1:container', dropEl, component, 'container');
            center.disposeByComponent('comp1');
        });

        it('不影响其他组件的实例', () => {
            const comp1 = makeComponent();
            const comp2 = makeComponent();
            center.handleInit('comp1', { component: comp1, drags: { body: {} } });
            center.handleInit('comp2', { component: comp2, drags: { body: {} } });

            center.disposeByComponent('comp1');

            expect(center.get('comp2:body')).toBeDefined();
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('销毁所有拖拽和放置区实例', () => {
            const component = makeComponent();
            center.handleInit('comp1', {
                component,
                drags: { body: { activeClass: 'dragging' } },
            });

            const dropEl = document.createElement('div');
            center.registerDropZone('comp1:container', dropEl, component, 'container', {
                activeClass: 'drop-active',
            });

            component.nodeMap.body.el.classList.add('dragging');
            dropEl.classList.add('drop-active');

            center.dispose();

            expect(component.nodeMap.body.el.classList.contains('dragging')).toBe(false);
            expect(dropEl.classList.contains('drop-active')).toBe(false);
        });
    });
});
