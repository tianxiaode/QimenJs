/**
 * ContainerComponent 单元测试
 *
 * 覆盖：四路 item 创建（string/TemplateDecl/组件类/配置对象）、
 * name/action map、增删查、order 排序、事件派发、direction/gap option、dispose 清理
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

jest.mock('@qimenjs/task', () => ({
    globalTaskQueue: {
        addTask: jest.fn((fn: () => any) => fn()),
    },
}));

import { ContainerComponent } from '@/component/container/ContainerComponent';
import { Component } from '@qimenjs/component-core';

class FakeItemComponent extends Component {
    static type = 'fake-item';

    get tpl() {
        return { tag: 'div', classes: 'fake-item' };
    }
}

describe('ContainerComponent', () => {
    let instance: ContainerComponent;

    beforeEach(async () => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
        instance = new ContainerComponent();
        document.body.appendChild(instance.el!);
        await new Promise(resolve => setTimeout(resolve, 0));
    });

    afterEach(() => {
        instance.dispose();
    });

    const collectEvents = (instance: any, event: string) => {
        const payload: any[] = [];
        instance.on(event, (ctx: any) => payload.push(ctx?.data ?? ctx));
        return payload;
    };

    // ============================================
    // 初始化
    // ============================================

    describe('初始化', () => {
        it('根节点带 q-container 类', () => {
            expect(instance.el).toBeTruthy();
            expect(instance.el!.classList.contains('q-container')).toBe(true);
        });

        it('direction horizontal 切换类', () => {
            expect(instance.el!.classList.contains('q-container--horizontal')).toBe(false);
            instance.setData('direction', 'horizontal');
            expect(instance.el!.classList.contains('q-container--horizontal')).toBe(true);
            instance.setData('direction', 'vertical');
            expect(instance.el!.classList.contains('q-container--horizontal')).toBe(false);
        });

        it('gap option 设置样式', () => {
            instance.setData('gap', '8px');
            expect(instance.el!.style.gap).toBe('8px');
        });

        it('count 初始为 0', () => {
            expect(instance.count).toBe(0);
        });
    });

    // ============================================
    // 四路 item 创建
    // ============================================

    describe('string item', () => {
        it('HTML 字符串同步编译为 DOM', () => {
            const item = instance.add('<span class="hello">hi</span>');
            expect(item).toBeTruthy();
            expect(item.type).toBe('html');
            expect(item.el.classList.contains('q-container__html')).toBe(true);
            expect(item.el.querySelector('span.hello')).toBeTruthy();
            expect(instance.el!.contains(item.el)).toBe(true);
        });

        it('@ 前缀走 i18n 求值（无 manager 时保留 key）', () => {
            const item = instance.add('@dialog.cancel');
            expect(item.el.textContent).toBe('dialog.cancel');
        });

        it('空 HTML wrapper 默认隐藏（:empty）', () => {
            const item = instance.add('');
            expect(item.el.children.length).toBe(0);
        });
    });

    describe('TemplateDecl item', () => {
        it('模板同步编译为 DOM，name/action 可查', () => {
            const item = instance.add({
                tag: 'section',
                classes: 'tpl-block',
                name: 'tpl1',
                action: 'tplAction',
            } as any);

            expect(item.type).toBe('template');
            expect(item.el.tagName).toBe('SECTION');
            expect(item.el.classList.contains('tpl-block')).toBe(true);
            expect(instance.getItem('tpl1')).toBe(item);
            expect(instance.getActionItem('tplAction')).toBe(item);
        });
    });

    describe('组件类 item', () => {
        it('组件类实例化并挂载', () => {
            const item = instance.add(FakeItemComponent);
            expect(item instanceof FakeItemComponent).toBe(true);
            expect(instance.el!.contains(item.el)).toBe(true);
            expect(instance.childComponentList).toContain(item);
        });
    });

    describe('配置对象 item', () => {
        it('type 为组件类', () => {
            const item = instance.add({ type: FakeItemComponent, name: 'fake1' });
            expect(item instanceof FakeItemComponent).toBe(true);
            expect(instance.getItem('fake1')).toBe(item);
        });

        it('type 为未注册字符串时忽略并警告', () => {
            const warn = instance.logger?.warn;
            const item = instance.add({ type: 'not-exist-type' });
            expect(item).toBeNull();
            expect(warn).toHaveBeenCalled();
        });

        it('缺少 type 时忽略并警告', () => {
            const item = instance.add({ name: 'no-type' } as any);
            expect(item).toBeNull();
            expect(instance.logger?.warn).toHaveBeenCalled();
        });
    });

    // ============================================
    // name/action map
    // ============================================

    describe('name/action map', () => {
        it('getItem/getActionItem 查询', () => {
            const a = instance.add({ type: FakeItemComponent, name: 'a', action: 'actA' });
            expect(instance.getItem('a')).toBe(a);
            expect(instance.getActionItem('actA')).toBe(a);
            expect(instance.getItem('missing')).toBeNull();
            expect(instance.getActionItem('missing')).toBeNull();
        });

        it('string item 不进 name map', () => {
            instance.add('<b>bold</b>');
            expect(instance.count).toBe(1);
            expect(instance._nameMap.size).toBe(0);
        });

        it('重复 name 覆盖并警告', () => {
            instance.add({ type: FakeItemComponent, name: 'dup' });
            const second = instance.add({ type: FakeItemComponent, name: 'dup' });
            expect(instance.getItem('dup')).toBe(second);
            expect(instance.logger?.warn).toHaveBeenCalled();
        });

        it('removeItem 清除 map', () => {
            instance.add({ type: FakeItemComponent, name: 'a', action: 'actA' });
            expect(instance.removeItem('a')).toBe(true);
            expect(instance.getItem('a')).toBeNull();
            expect(instance.getActionItem('actA')).toBeNull();
            expect(instance.removeItem('a')).toBe(false);
        });
    });

    // ============================================
    // 增删查
    // ============================================

    describe('removeAt / removeItem / clear', () => {
        it('removeAt 移除 DOM 与数组', () => {
            const item = instance.add('<span>x</span>');
            const removed = instance.removeAt(0);
            expect(removed).toBe(item);
            expect(instance.el!.contains(item.el)).toBe(false);
            expect(instance.count).toBe(0);
            expect(instance.removeAt(99)).toBeUndefined();
        });

        it('组件 item removeAt 时 dispose', () => {
            const item = instance.add(FakeItemComponent);
            const disposeSpy = jest.spyOn(item, 'dispose');
            instance.removeAt(0);
            expect(disposeSpy).toHaveBeenCalled();
        });

        it('clear 清空全部', () => {
            instance.add('<span>1</span>');
            instance.add(FakeItemComponent);
            instance.clear();
            expect(instance.count).toBe(0);
            expect(instance.el!.children.length).toBe(0);
            expect(instance._nameMap.size).toBe(0);
            expect(instance._actionMap.size).toBe(0);
        });
    });

    describe('getAt / indexOf / getTargetItem', () => {
        it('getAt 越界返回 null', () => {
            const item = instance.add('<i>i</i>');
            expect(instance.getAt(0)).toBe(item);
            expect(instance.getAt(1)).toBeNull();
            expect(instance.getAt(-1)).toBeNull();
        });

        it('indexOf 定位 item', () => {
            const a = instance.add('<span>a</span>');
            const b = instance.add('<span>b</span>');
            expect(instance.indexOf(a)).toBe(0);
            expect(instance.indexOf(b)).toBe(1);
            expect(instance.indexOf({ el: document.createElement('div') })).toBe(-1);
        });

        it('getTargetItem 按 el.contains 定位', () => {
            instance.add('<span class="first">a</span>');
            const target = instance.el!.querySelector('.first')!;
            const found = instance.getTargetItem(target);
            expect(found).toBeTruthy();
            expect(found!.index).toBe(0);
            expect(found!.type).toBe('html');

            const outside = document.createElement('div');
            document.body.appendChild(outside);
            expect(instance.getTargetItem(outside)).toBeNull();
        });
    });

    // ============================================
    // order 排序
    // ============================================

    describe('order 排序', () => {
        it('order 决定 DOM 顺序', () => {
            const first = instance.add({ type: FakeItemComponent, order: 100 });
            const second = instance.add({ type: FakeItemComponent, order: 0 });
            expect(instance.items[0]).toBe(second);
            expect(instance.items[1]).toBe(first);
            const children = Array.from(instance.el!.children);
            expect(children.indexOf(second.el)).toBeLessThan(children.indexOf(first.el));
        });
    });

    // ============================================
    // 事件
    // ============================================

    describe('事件', () => {
        it('add 触发 itemadd', () => {
            const added = collectEvents(instance, 'itemadd');
            const item = instance.add('<span>x</span>');
            expect(added).toHaveLength(1);
            expect(added[0].component).toBe(item);
            expect(added[0].index).toBe(0);
        });

        it('removeAt 触发 itemremove', () => {
            const removed = collectEvents(instance, 'itemremove');
            instance.add('<span>x</span>');
            instance.removeAt(0);
            expect(removed).toHaveLength(1);
            expect(removed[0].index).toBe(0);
        });

        it('setItems 触发 itemadd 与 itemchange', () => {
            const added = collectEvents(instance, 'itemadd');
            const changed = collectEvents(instance, 'itemchange');
            instance.setItems(['<span>1</span>', FakeItemComponent]);
            expect(added).toHaveLength(2);
            expect(changed).toHaveLength(1);
            expect(changed[0].type).toBe('set');
            expect(changed[0].count).toBe(2);
        });

        it('clear 触发 itemchange clear', () => {
            const changed = collectEvents(instance, 'itemchange');
            instance.add('<span>x</span>');
            instance.clear();
            const clearEvent = changed.find(e => e.type === 'clear');
            expect(clearEvent).toBeTruthy();
        });
    });

    // ============================================
    // items option
    // ============================================

    describe('items option', () => {
        it('setItems 后可通过 items option 重新渲染', async () => {
            instance.setData('items', ['<span>via-option</span>'], true);
            await new Promise(resolve => setTimeout(resolve, 0));
            instance.setData('items', ['<span>a</span>', '<span>b</span>'], true);
            expect(instance.count).toBe(2);
        });
    });

    // ============================================
    // dispose
    // ============================================

    describe('dispose', () => {
        it('dispose 时清理所有 item', () => {
            const item = instance.add(FakeItemComponent);
            const disposeSpy = jest.spyOn(item, 'dispose');
            instance.dispose();
            expect(disposeSpy).toHaveBeenCalled();
            expect(instance.count).toBe(0);
        });
    });
});
